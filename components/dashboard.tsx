"use client"

import { useEffect, useState } from "react"
import { useUser } from "@/components/UserProvider"
import { supabase } from "@/lib/supabase"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Clock,
  TrendingUp,
  Calendar,
  Bell,
  GraduationCap,
  Users,
  FileText,
  DollarSign,
} from "lucide-react"

export default function Dashboard() {
  // Fixed: Get user from context properly
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
  const [sortedUniversities, setSortedUniversities] = useState<any[]>([])
  const [upcomingTasks, setUpcomingTasks] = useState<any[]>([])
  const [recentActivity, setRecentActivity] = useState<any[]>([])

  useEffect(() => {
    // Fixed: Check for user properly
    if (!user?.id) return
    
    const fetchData = async () => {
      setLoading(true)

      try {
        // Fixed: Use user_id instead of added_by
        const [{ data: universities }, { data: professors }, { data: documents }, { data: events }] =
          await Promise.all([
            supabase.from("universities").select("*").eq("user_id", user.id),
            supabase.from("professors").select("*").eq("user_id", user.id),
            supabase.from("documents").select("*").eq("user_id", user.id),
            supabase.from("timeline_events").select("*").eq("user_id", user.id),
          ])

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

        const submitted = universities?.filter(u => u.status === "submitted").length ?? 0
        const inProgress = universities?.filter(u => u.status === "in-progress").length ?? 0
        const notStarted = universities?.filter(u => u.status === "not-started").length ?? 0

        const contacted = professors?.filter(p => p.contact_status !== "not-contacted").length ?? 0

        // Sort universities by priority
        const getStatusPriority = (uni: any) => {
          if (uni.status === "accepted" && uni.acceptance_funding_status === "with-funding") return 1
          if (uni.status === "accepted" && uni.acceptance_funding_status === "without-funding") return 2
          if (uni.status === "accepted") return 3 // unknown funding
          if (uni.status === "interview") return 4
          if (uni.status === "waitlisted") return 5
          if (uni.status === "under-review") return 6
          if (uni.status === "submitted") return 7
          if (uni.status === "in-progress") return 8
          if (uni.status === "rejected") return 9
          if (uni.status === "not-started") return 10
          return 11
        }

        const sorted = [...(universities || [])].sort((a, b) => {
          const priorityDiff = getStatusPriority(a) - getStatusPriority(b)
          if (priorityDiff !== 0) return priorityDiff
          // Secondary sort by deadline (earlier first)
          return new Date(a.deadline).getTime() - new Date(b.deadline).getTime()
        })

        setSortedUniversities(sorted)

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
  }, [user?.id]) // Fixed: Updated dependency

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
    <div className="p-4 space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        {[
          { label: "Total Applications", value: stats.totalApplications, icon: GraduationCap, color: "bg-blue-500" },
          { label: "Professors Contacted", value: stats.professorsContacted, icon: Users, color: "bg-green-500" },
          { label: "Documents Ready", value: stats.documentsReady, icon: FileText, color: "bg-purple-500" },
          { label: "Total Spent", value: `$${stats.totalSpent}`, icon: DollarSign, color: "bg-orange-500" },
        ].map((stat, i) => {
          const Icon = stat.icon
          return (
            <Card key={i}>
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{stat.label}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
                <div className={`${stat.color} p-3 rounded-full`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Application Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5 text-primary-500" />
            <span>Application Progress</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Progress value={(stats.submitted / stats.totalApplications) * 100 || 0} />
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-green-500">{stats.submitted}</div>
              <div className="text-xs text-gray-500">Submitted</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-500">{stats.inProgress}</div>
              <div className="text-xs text-gray-500">In Progress</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-400">{stats.notStarted}</div>
              <div className="text-xs text-gray-500">Not Started</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* University Applications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <GraduationCap className="h-5 w-5 text-primary-500" />
            <span>Universities</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {sortedUniversities.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-gray-500">No universities added yet</p>
            </div>
          ) : (
            sortedUniversities.map((uni, i) => {
              const getStatusBadgeColor = (status: string, fundingStatus?: string) => {
                if (status === "accepted" && fundingStatus === "with-funding") return "bg-green-600"
                if (status === "accepted" && fundingStatus === "without-funding") return "bg-green-400"
                if (status === "accepted") return "bg-green-500"
                if (status === "interview") return "bg-orange-500"
                if (status === "waitlisted") return "bg-yellow-600"
                if (status === "under-review") return "bg-purple-500"
                if (status === "submitted") return "bg-yellow-500"
                if (status === "in-progress") return "bg-blue-500"
                if (status === "rejected") return "bg-red-500"
                return "bg-gray-400"
              }

              const getStatusLabel = (status: string, fundingStatus?: string) => {
                if (status === "accepted" && fundingStatus === "with-funding") return "Accepted (Funded)"
                if (status === "accepted" && fundingStatus === "without-funding") return "Accepted (No Funding)"
                if (status === "accepted") return "Accepted"
                return status.split("-").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ")
              }

              return (
                <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{uni.name}</p>
                    <p className="text-xs text-gray-500 truncate">{uni.program}</p>
                    {uni.application_fee && (
                      <p className="text-xs text-gray-600 mt-1">
                        <DollarSign className="h-3 w-3 inline mr-1" />
                        ${uni.application_fee}
                      </p>
                    )}
                  </div>
                  <Badge
                    className={`${getStatusBadgeColor(uni.status, uni.acceptance_funding_status)} text-white text-xs whitespace-nowrap ml-2`}
                  >
                    {getStatusLabel(uni.status, uni.acceptance_funding_status)}
                  </Badge>
                </div>
              )
            })
          )}
        </CardContent>
      </Card>

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
    </div>
  )
}