"use client"

import { useEffect, useState } from "react"
import { useUser } from "@/components/UserProvider"
import { supabase } from "@/lib/supabase"
import { sanitizeDeadlines, getDeadlineInfo, daysUntilDeadline } from "@/lib/university-deadlines"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Clock,
  TrendingUp,
  Calendar,
  Bell,
  GraduationCap,
  Users,
  FileText,
  DollarSign
} from "lucide-react"

interface DashboardProps {
  universities: any[]
  professors: any[]
  documents: any[]
  timelineEvents: any[]
  setUniversities: (unis: any[]) => void
  setProfessors: (profs: any[]) => void
  setDocuments: (docs: any[]) => void
  setTimelineEvents: (events: any[]) => void
  searchQuery?: string
  onEditUniversity?: (university: any) => void
}

export default function Dashboard({
  universities: propUniversities,
  professors: propProfessors,
  documents: propDocuments,
  timelineEvents: propTimelineEvents,
  searchQuery,
  onEditUniversity
}: DashboardProps) {
  const { user, loading: userLoading } = useUser()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalApplications: 0,
    professorsContacted: 0,
    documentsReady: 0,
    totalSpent: 0,
    submitted: 0,
    inProgress: 0,
    notStarted: 0,
  })
  const [acceptedUniversities, setAcceptedUniversities] = useState<any[]>([])
  const [contactedProfessors, setContactedProfessors] = useState<any[]>([])
  const [upcomingTasks, setUpcomingTasks] = useState<any[]>([])
  const [recentActivity, setRecentActivity] = useState<any[]>([])
  // Remove local university edit state since we'll use parent state

  const getUniversityDeadlineDetails = (university: any) => {
    const normalized = sanitizeDeadlines(university?.deadlines, university?.deadline ?? undefined)
    const info = getDeadlineInfo(normalized)
    return {
      deadlines: normalized,
      upcoming: info.current,
      next: info.next,
      daysUntil: !info.isPast ? daysUntilDeadline(info.current) : null,
      isPast: info.isPast,
    }
  }

  const formatDeadlineDate = (value: string) => {
    const parsed = new Date(value)
    return Number.isNaN(parsed.getTime()) ? value : parsed.toLocaleDateString()
  }

  useEffect(() => {
    // Fixed: Check for user properly
    if (!user?.id) return
    
    const fetchData = async () => {
      setLoading(true)

      try {
        // Use passed props instead of fetching again
        const universities = propUniversities
        const professors = propProfessors
        const documents = propDocuments
        const events = propTimelineEvents

        // Calculate stats - Fixed: Include all submitted and above statuses in spending
        const totalSpent =
          universities
            ?.filter(u =>
              u.status === "submitted" ||
              u.status === "under-review" ||
              u.status === "interview" ||
              u.status === "accepted" ||
              u.status === "rejected" ||
              u.status === "waitlisted"
            )
            .reduce((sum, u) => sum + (Number(u.application_fee) || 0), 0) ?? 0

        // Fix university status logic: submitted includes all that have been submitted or beyond
        const submitted = universities?.filter(u =>
          u.status === "submitted" ||
          u.status === "under-review" ||
          u.status === "interview" ||
          u.status === "accepted" ||
          u.status === "rejected" ||
          u.status === "waitlisted"
        ).length ?? 0

        const inProgress = universities?.filter(u => u.status === "in-progress").length ?? 0
        const notStarted = universities?.filter(u => u.status === "not-started").length ?? 0

        // Fix professor stats: if professor is added, they are contacted
        const contacted = professors?.length ?? 0

        // Filter for accepted universities and sort by funding status
        const accepted = universities?.filter(uni => uni.status === "accepted") || []
        const sortedAccepted = accepted.sort((a, b) => {
          if (a.acceptance_funding_status === "with-funding" && b.acceptance_funding_status !== "with-funding") return -1
          if (b.acceptance_funding_status === "with-funding" && a.acceptance_funding_status !== "with-funding") return 1
          return 0
        })
        setAcceptedUniversities(sortedAccepted)

        // Filter professors with meaningful contact status - only meeting-scheduled and replied
        const activeProfessors = professors?.filter(prof =>
          prof.contact_status === "meeting-scheduled" ||
          prof.contact_status === "replied"
        ) || []
        setContactedProfessors(activeProfessors)

        setStats({
          totalApplications: universities?.length ?? 0,
          professorsContacted: contacted,
          documentsReady: documents?.length ?? 0,
          totalSpent,
          submitted,
          inProgress,
          notStarted,
        })

        const now = new Date()

        const upcoming = events
          ?.filter(e => new Date(e.date) >= now)
          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
          .slice(0, 4)

        const recent = events
          ?.filter(e => new Date(e.date) < now)
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
          .slice(0, 4)

        setUpcomingTasks(upcoming ?? [])
        setRecentActivity(recent ?? [])
      } catch (error) {
        console.error("Error fetching dashboard data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [user?.id, propUniversities, propProfessors, propDocuments, propTimelineEvents])

  // Fixed: Handle loading states
  if (userLoading || loading) return <div className="p-4">Loading...</div>

  // Fixed: Handle no user state
  if (!user) {
    return (
      <div className="p-4">
        <div className="text-center py-12">
          <GraduationCap className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Welcome to PhD Tracker Pro</h3>
          <p className="text-gray-500">Please login to view your dashboard.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 space-y-6 bg-gradient-to-b from-gray-50 to-white min-h-screen">
      {/* Welcome Section */}
      {searchQuery && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <p className="text-sm text-blue-800">
            🔍 Searching for: <span className="font-semibold">"{searchQuery}"</span>
          </p>
        </div>
      )}

      {/* Dashboard Summary */}
      {(() => {
        const primaryStats = [
          {
            label: "Total Applications",
            value: stats.totalApplications.toString(),
            icon: GraduationCap,
            gradient: "from-blue-500 to-blue-600",
            bgLight: "bg-blue-50",
            textColor: "text-blue-600"
          },
          {
            label: "Professors Contacted",
            value: stats.professorsContacted.toString(),
            icon: Users,
            gradient: "from-green-500 to-green-600",
            bgLight: "bg-green-50",
            textColor: "text-green-600"
          },
          {
            label: "Documents Ready",
            value: stats.documentsReady.toString(),
            icon: FileText,
            gradient: "from-purple-500 to-purple-600",
            bgLight: "bg-purple-50",
            textColor: "text-purple-600"
          },
          {
            label: "Total Spend",
            value: stats.totalSpent ? `$${stats.totalSpent.toLocaleString()}` : "$0",
            icon: DollarSign,
            gradient: "from-orange-500 to-orange-600",
            bgLight: "bg-orange-50",
            textColor: "text-orange-600"
          }
        ]

        const overallProgress = stats.totalApplications === 0
          ? 0
          : Math.round((stats.submitted / stats.totalApplications) * 100)

        const progressStats = [
          {
            label: "Overall Progress",
            value: `${overallProgress}%`,
            icon: TrendingUp,
            gradient: "from-indigo-500 to-violet-500",
            bgLight: "bg-indigo-50",
            textColor: "text-indigo-600"
          },
          {
            label: "Submitted & Beyond",
            value: stats.submitted.toString(),
            icon: Calendar,
            gradient: "from-emerald-500 to-teal-500",
            bgLight: "bg-emerald-50",
            textColor: "text-emerald-600"
          },
          {
            label: "In Progress",
            value: stats.inProgress.toString(),
            icon: Clock,
            gradient: "from-sky-500 to-cyan-500",
            bgLight: "bg-sky-50",
            textColor: "text-sky-600"
          },
          {
            label: "Not Started",
            value: stats.notStarted.toString(),
            icon: Bell,
            gradient: "from-slate-500 to-gray-500",
            bgLight: "bg-slate-50",
            textColor: "text-slate-600"
          }
        ]

        const renderGridBox = (title: string, items: typeof primaryStats) => (
          <Card className="border-0 shadow-lg bg-white/90 backdrop-blur">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold text-gray-800">{title}</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {items.map((item, index) => {
                const Icon = item.icon
                return (
                  <div
                    key={index}
                    className={`${item.bgLight} rounded-xl border border-white/40 shadow-sm p-4 transition-all duration-200 hover:-translate-y-1 hover:shadow-md`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-xs uppercase tracking-wide text-gray-500">{item.label}</p>
                        <p className={`mt-2 text-2xl font-bold ${item.textColor}`}>{item.value}</p>
                      </div>
                      <div className={`hidden sm:block bg-gradient-to-br ${item.gradient} text-white rounded-lg p-2.5`}>
                        <Icon className="h-5 w-5" />
                      </div>
                    </div>
                  </div>
                )
              })}
            </CardContent>
          </Card>
        )

        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {renderGridBox("At-a-glance Stats", primaryStats)}
            {renderGridBox("Application Progress", progressStats)}
          </div>
        )
      })()}

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Accepted Universities Box */}
        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 shadow-lg">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-3 rounded-xl shadow-lg">
                  <GraduationCap className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-800">Accepted Universities</h3>
                  <p className="text-xs text-gray-600">Your successful applications</p>
                </div>
              </div>
              {acceptedUniversities.length > 0 && (
                <Badge className="bg-green-600 text-white px-3 py-1 text-sm font-semibold">
                  {acceptedUniversities.length}
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 max-h-96 overflow-y-auto">
            {acceptedUniversities.length === 0 ? (
              <div className="text-center py-12">
                <div className="bg-green-100 rounded-full p-4 w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                  <GraduationCap className="h-10 w-10 text-green-600" />
                </div>
                <h4 className="text-lg font-semibold text-gray-700 mb-2">No Acceptances Yet</h4>
                <p className="text-sm text-gray-500">Keep working on your applications!</p>
                <p className="text-xs text-gray-400 mt-1">Your hard work will pay off 🚀</p>
              </div>
            ) : (
              acceptedUniversities.map((uni, i) => {
                const getFundingBadge = (fundingStatus?: string) => {
                  if (fundingStatus === "with-funding") return "bg-green-600 text-white shadow-lg"
                  if (fundingStatus === "without-funding") return "bg-orange-500 text-white shadow-lg"
                  return "bg-blue-500 text-white shadow-lg"
                }

                const getFundingLabel = (fundingStatus?: string) => {
                  if (fundingStatus === "with-funding") return "🎉 Funded"
                  if (fundingStatus === "without-funding") return "💰 Self-Funded"
                  return "❓ Status Unknown"
                }

                const deadlineDetails = getUniversityDeadlineDetails(uni)
                const upcomingDeadline = deadlineDetails.upcoming
                const nextDeadline = deadlineDetails.next
                const daysUntil = deadlineDetails.daysUntil
                const isPast = deadlineDetails.isPast
                const upcomingLabel = isPast ? "Latest" : "Next"
                const countdownSuffix = daysUntil !== null
                  ? ` (${daysUntil} day${Math.abs(daysUntil) === 1 ? "" : "s"})`
                  : deadlineDetails.deadlines.length > 0 && isPast
                    ? " (completed)"
                    : ""

              return (
                <div
                  key={i}
                  onClick={() => onEditUniversity?.(uni)}
                  className="p-5 bg-white border border-green-300 rounded-xl cursor-pointer hover:shadow-xl transition-all duration-300 hover:scale-[1.03] group"
                >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-gray-900 truncate text-lg group-hover:text-green-700 transition-colors">
                          {uni.name}
                        </h4>
                        <p className="text-sm text-gray-600 truncate mt-1 font-medium">{uni.program}</p>
                      </div>
                      <Badge className={`${getFundingBadge(uni.acceptance_funding_status)} text-xs font-bold px-3 py-1`}>
                        {getFundingLabel(uni.acceptance_funding_status)}
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <div className="space-y-1">
                        {upcomingDeadline ? (
                          <div className="flex items-center">
                            <Calendar className="h-3 w-3 mr-1" />
                            <span>
                              {upcomingLabel}: {upcomingDeadline.term} • {formatDeadlineDate(upcomingDeadline.deadline)}
                              {countdownSuffix}
                            </span>
                          </div>
                        ) : (
                          <div className="flex items-center text-gray-400">
                            <Calendar className="h-3 w-3 mr-1" />
                            <span>No upcoming deadline</span>
                          </div>
                        )}
                        {nextDeadline && (
                          <div className="pl-4 text-gray-400">
                            Following: {nextDeadline.term} • {formatDeadlineDate(nextDeadline.deadline)}
                          </div>
                        )}
                      </div>
                      <div className="text-xs text-green-600 font-semibold group-hover:text-green-700">
                        Click to edit ✎️
                      </div>
                    </div>

                    {uni.notes && (
                      <div className="mt-3 p-2 bg-green-50 rounded-lg border border-green-200">
                        <p className="text-xs text-gray-700 italic">
                          "{uni.notes.length > 100 ? uni.notes.substring(0, 100) + '...' : uni.notes}"
                        </p>
                      </div>
                    )}
                  </div>
                )
              })
            )}
          </CardContent>
        </Card>

        {/* Professor Contacts Box */}
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200 shadow-lg">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="bg-gradient-to-r from-blue-500 to-indigo-500 p-3 rounded-xl shadow-lg">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-800">Professor Contacts</h3>
                  <p className="text-xs text-gray-600">Active communications</p>
                </div>
              </div>
              {contactedProfessors.length > 0 && (
                <Badge className="bg-blue-600 text-white px-3 py-1 text-sm font-semibold">
                  {contactedProfessors.length}
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 max-h-96 overflow-y-auto">
            {contactedProfessors.length === 0 ? (
              <div className="text-center py-12">
                <div className="bg-blue-100 rounded-full p-4 w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                  <Users className="h-10 w-10 text-blue-600" />
                </div>
                <h4 className="text-lg font-semibold text-gray-700 mb-2">No Active Contacts</h4>
                <p className="text-sm text-gray-500">Start reaching out to professors!</p>
                <p className="text-xs text-gray-400 mt-1">Building connections is key 🤝</p>
              </div>
            ) : (
              contactedProfessors.map((prof, i) => {
                const getContactBadge = (status: string) => {
                  if (status === "meeting-scheduled") return "bg-green-500 text-white shadow-lg"
                  if (status === "replied") return "bg-blue-500 text-white shadow-lg"
                  return "bg-gray-400 text-white shadow-lg"
                }

                const getContactLabel = (status: string) => {
                  if (status === "meeting-scheduled") return "🗓️ Meeting Scheduled"
                  if (status === "replied") return "💬 Professor Replied"
                  return status
                }

                return (
                  <div key={i} className="p-4 bg-white border border-blue-300 rounded-xl hover:shadow-lg transition-all duration-300 group">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-gray-900 truncate group-hover:text-blue-700 transition-colors">
                          {prof.name}
                        </h4>
                        <p className="text-sm text-gray-600 truncate font-medium">{prof.university}</p>
                        <p className="text-xs text-gray-500 mt-1">{prof.department}</p>
                      </div>
                      <Badge className={`${getContactBadge(prof.contact_status)} text-xs font-bold px-3 py-1`}>
                        {getContactLabel(prof.contact_status)}
                      </Badge>
                    </div>

                    {prof.last_contact && (
                      <div className="text-xs text-gray-500 mt-2 flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        Last contact: {new Date(prof.last_contact).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                )
              })
            )}
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Tasks */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Clock className="h-5 w-5 text-primary-500" />
            <span>Upcoming Tasks</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {upcomingTasks.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-gray-500">No upcoming tasks</p>
            </div>
          ) : (
            upcomingTasks.map((task, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-sm">{task.title}</p>
                  <p className="text-xs text-gray-500 flex items-center mt-1">
                    <Calendar className="h-3 w-3 mr-1" />
                    {task.date}
                  </p>
                </div>
                <Badge variant="secondary" className="text-xs capitalize">
                  {task.priority}
                </Badge>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Bell className="h-5 w-5 text-primary-500" />
            <span>Recent Activity</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {recentActivity.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-gray-500">No recent activity</p>
            </div>
          ) : (
            recentActivity.map((event, i) => (
              <div key={i} className="flex flex-col space-y-1 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm font-medium">{event.title}</p>
                <p className="text-xs text-gray-500">{event.date}</p>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* University edit will be handled by parent component */}
    </div>
  )
}
