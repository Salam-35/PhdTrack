"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Edit,
  Trash2,
  DollarSign,
  Calendar,
  FileText,
  Users,
  Search,
  Plus,
  GraduationCap,
  Building,
  BookOpen,
  MapPin,
  Flag,
  TrendingUp,
  Clock,
} from "lucide-react"
import { db, type University } from "@/lib/supabase"
import { sanitizeDeadlines, getDeadlineInfo, daysUntilDeadline } from "@/lib/university-deadlines"
import { toast } from "@/hooks/use-toast"
import UniversityForm from "./forms/university-form"
import { useUser } from "@/components/UserProvider"

interface ApplicationsProps {
  universities: University[]
  setUniversities: (universities: University[]) => void
}

export default function Applications({ universities, setUniversities }: ApplicationsProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [filterPriority, setFilterPriority] = useState("all")
  const [showForm, setShowForm] = useState(false)
  const [editingUniversity, setEditingUniversity] = useState<University | undefined>()
  
  // Fixed: Get user from context properly
  const { user, loading: userLoading } = useUser()

  const handleSave = async (university: University) => {
    // Fixed: Check user properly
    if (!user?.id) {
      toast({
        title: "Login Required",
        description: "Please login to save.",
        variant: "destructive",
      })
      return
    }

    const isEditing = !!university.id

    // Fixed: Use user_id instead of added_by
    const universityWithUser = {
      ...university,
      user_id: user.id,
    }

    try {
      let result: University

      if (isEditing) {
        result = await db.updateUniversity(university.id, universityWithUser)
        setUniversities(universities.map((u) => (u.id === result.id ? result : u)))
      } else {
        // Remove existing id if present to avoid conflict
        const { id, ...cleaned } = universityWithUser
        result = await db.addUniversity(cleaned)
        setUniversities([result, ...universities])
      }

      toast({ title: "Success", description: isEditing ? "University updated." : "University added." })
      setEditingUniversity(undefined)
    } catch (error) {
      console.error("Save error:", error)
      toast({
        title: "Save Error",
        description: error instanceof Error ? error.message : "Failed to save university.",
        variant: "destructive",
      })
    }
  }

  const updateStatus = async (id: string, newStatus: University["status"]) => {
    // Optimistic update: update local state first
    const prev = universities
    setUniversities(prev.map((uni) => (uni.id === id ? { ...uni, status: newStatus } : uni)))
    try {
      const updatedUniversity = await db.updateUniversity(id, { status: newStatus })
      setUniversities((curr) => curr.map((u) => (u.id === id ? updatedUniversity : u)))
      toast({
        title: "Status Updated",
        description: `Application status updated to ${newStatus.replace("-", " ")}`,
      })
    } catch (error) {
      // Revert on failure
      setUniversities(prev)
      toast({
        title: "Error",
        description: "Failed to update status.",
        variant: "destructive",
      })
    }
  }

  const deleteUniversity = async (id: string) => {
    if (!confirm("Are you sure you want to delete this application?")) return

    try {
      await db.deleteUniversity(id)
      setUniversities(universities.filter((uni) => uni.id !== id))
      toast({ title: "Deleted", description: "University deleted." })
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete.", variant: "destructive" })
    }
  }

  const handleEdit = (university: University) => {
    setEditingUniversity(university)
    setShowForm(true)
  }

  const getStatusColor = (status: University["status"], fundingStatus?: string) => {
    if (status === "accepted" && fundingStatus === "with-funding") return "bg-green-600"
    if (status === "accepted" && fundingStatus === "without-funding") return "bg-green-400"
    switch (status) {
      case "not-started": return "bg-gray-500"
      case "in-progress": return "bg-blue-500"
      case "submitted": return "bg-yellow-500"
      case "under-review": return "bg-purple-500"
      case "interview": return "bg-orange-500"
      case "accepted": return "bg-green-500"
      case "rejected": return "bg-red-500"
      case "waitlisted": return "bg-yellow-600"
      default: return "bg-gray-500"
    }
  }

  const getStatusLabel = (status: University["status"], fundingStatus?: string) => {
    if (status === "accepted" && fundingStatus === "with-funding") return "Accepted (Funded)"
    if (status === "accepted" && fundingStatus === "without-funding") return "Accepted (No Funding)"
    return status.replace("-", " ")
  }

  const getPriorityColor = (priority: University["priority"]) => {
    switch (priority) {
      case "high": return "text-red-600 bg-red-50"
      case "medium": return "text-yellow-600 bg-yellow-50"
      case "low": return "text-green-600 bg-green-50"
      default: return "text-gray-600 bg-gray-50"
    }
  }

  const getProgress = (status: University["status"]) => {
    switch (status) {
      case "not-started": return 0
      case "in-progress": return 40
      case "submitted": return 70
      case "under-review": return 80
      case "interview": return 90
      case "accepted":
      case "rejected":
      case "waitlisted":
        return 100
      default: return 0
    }
  }

  const formatDeadlineDate = (value: string) => {
    const parsed = new Date(value)
    return Number.isNaN(parsed.getTime()) ? value : parsed.toLocaleDateString()
  }

  const getDeadlineDetails = (uni: University) => {
    const normalized = sanitizeDeadlines(uni.deadlines, uni.deadline ?? undefined)
    const info = getDeadlineInfo(normalized)
    const daysRemaining = !info.isPast ? daysUntilDeadline(info.current) : null
    return {
      deadlines: normalized,
      daysRemaining,
      info,
      isPast: info.isPast,
    }
  }

  const filteredUniversities = universities.filter((uni) => {
    const matchesSearch =
      uni.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      uni.program.toLowerCase().includes(searchQuery.toLowerCase()) ||
      uni.location.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus = filterStatus === "all" || uni.status === filterStatus
    const matchesPriority = filterPriority === "all" || uni.priority === filterPriority

    return matchesSearch && matchesStatus && matchesPriority
  })

  // Fixed: Show loading state
  if (userLoading) {
    return <div className="p-4">Loading...</div>
  }

  // Fixed: Show login required state
  if (!user) {
    return (
      <div className="p-4">
        <div className="text-center py-12">
          <GraduationCap className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Login Required</h3>
          <p className="text-gray-500 mb-4">Please login to manage your applications.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-l font-bold">Applications</h2>
          <p className="text-gray-800 ">Track your PhD program applications</p>
        </div>
        <Button onClick={() => setShowForm(true)} className="bg-primary-500 hover:bg-primary-600">
          <Plus className="h-4 w-4 mr-2" />
          Add Application
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary-600">{universities.length}</div>
              <div className="text-sm text-gray-500">Total Applications</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {universities.filter((u) => u.status === "accepted").length}
              </div>
              <div className="text-sm text-gray-500">Accepted</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {universities.filter((u) => u.status === "submitted" || u.status === "under-review").length}
              </div>
              <div className="text-sm text-gray-500">Pending</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {universities.filter((u) => u.status === "in-progress").length}
              </div>
              <div className="text-sm text-gray-500">In Progress</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="space-y-3">


        <div className="flex space-x-2 overflow-x-auto pb-2">
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="not-started">Not Started</SelectItem>
              <SelectItem value="in-progress">In Progress</SelectItem>
              <SelectItem value="submitted">Submitted</SelectItem>
              <SelectItem value="under-review">Under Review</SelectItem>
              <SelectItem value="interview">Interview</SelectItem>
              <SelectItem value="accepted">Accepted</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
              <SelectItem value="waitlisted">Waitlisted</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterPriority} onValueChange={setFilterPriority}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="All Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priority</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Applications Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredUniversities.map((university) => {
          const deadlineDetails = getDeadlineDetails(university)
          const upcomingDeadline = deadlineDetails.info.current
          const nextDeadline = deadlineDetails.info.next
          const daysUntil = deadlineDetails.daysRemaining
          const isPast = deadlineDetails.isPast
          const countdownText = daysUntil !== null
            ? `${daysUntil} day${Math.abs(daysUntil) === 1 ? "" : "s"} until ${upcomingDeadline?.term ?? "deadline"}`
            : deadlineDetails.deadlines.length > 0
              ? "All recorded deadlines have passed"
              : "No deadlines recorded"
          const upcomingLabel = isPast ? "Latest" : "Next"
           {/* hover:shadow-xl transition-all duration-300 hover:scale-[1.02] */}
          return (
            <Card
              key={university.id}
              className={`relative overflow-hidden border hover:shadow-md transition-shadow ${
                university.status === "accepted"
                  ? "border-green-200 bg-green-50/30"
                  : university.status === "rejected"
                  ? "border-red-200 bg-red-50/30"
                  : university.status === "submitted" || university.status === "under-review"
                  ? "border-yellow-200 bg-yellow-50/30"
                  : "border-gray-200 bg-white"
              }`}
            >
              {/* Header */}
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Building className="h-4 w-4 text-gray-600 flex-shrink-0" />
                      <CardTitle className="text-base font-semibold text-gray-900 truncate">
                        {university.name}
                      </CardTitle>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                      <BookOpen className="h-3.5 w-3.5 flex-shrink-0" />
                      <span className="truncate">{university.program}</span>
                    </div>

                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-2 h-2 rounded-full ${
                          university.status === "accepted"
                            ? "bg-green-500"
                            : university.status === "rejected"
                            ? "bg-red-500"
                            : university.status === "submitted"
                            ? "bg-yellow-500"
                            : university.status === "in-progress"
                            ? "bg-blue-500"
                            : "bg-gray-400"
                        }`}
                      ></div>
                      <Badge
                        className={`${getStatusColor(
                          university.status,
                          university.acceptance_funding_status
                        )} text-white text-s px-2 py-0.5`}
                      >
                        {getStatusLabel(university.status, university.acceptance_funding_status)}
                      </Badge>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-gray-600 hover:text-blue-600 hover:bg-blue-50"
                        onClick={() => handleEdit(university)}
                      >
                        <Edit className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-gray-600 hover:text-red-600 hover:bg-red-50"
                        onClick={() => deleteUniversity(university.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Deadline & Priority Row */}
                <div className="flex items-center justify-between gap-2 mt-3">
                  <div className="flex items-center gap-2">
                    <Clock className="h-3.5 w-3.5 text-gray-500 flex-shrink-0" />
                    <span className={`text-s font-bold ${
                      isPast
                        ? "text-red-600"
                        : daysUntil !== null && daysUntil < 20
                        ? "text-orange-600"
                        : "text-blue-800"
                    }`}>
                      {isPast
                        ? "All deadlines passed"
                        : daysUntil !== null
                        ? `${daysUntil} day${Math.abs(daysUntil) === 1 ? "" : "s"} remaining`
                        : "No deadline set"}
                    </span>
                  </div>
                  <Badge
                    className={`${getPriorityColor(university.priority)} text-xs px-2 py-0.5`}
                  >
                    {university.priority}
                  </Badge>
                </div>
              </CardHeader>

              {/* Body */}
              <CardContent className="space-y-3">
                {/* Progress Bar */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs text-gray-600">
                    <span className="flex items-center gap-1">
                      <TrendingUp className="h-3.5 w-3.5" />
                      Progress
                    </span>
                    <span className="font-medium">{getProgress(university.status)}%</span>
                  </div>
                  <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ${
                        university.status === "accepted"
                          ? "bg-green-500"
                          : university.status === "submitted"
                          ? "bg-yellow-500"
                          : university.status === "in-progress"
                          ? "bg-blue-500"
                          : "bg-gray-400"
                      }`}
                      style={{ width: `${getProgress(university.status)}%` }}
                    ></div>
                  </div>
                </div>

                {/* Funding Information */}
                {university.acceptance_funding_status === "with-funding" && (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg space-y-1.5">
                    <div className="flex items-center gap-2 text-green-700">
                      <DollarSign className="h-4 w-4" />
                      <span className="text-xs font-semibold">Funding Awarded</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-600">Amount</span>
                      <span className="font-semibold text-green-700">
                        {university.funding_amount ? String(university.funding_amount) : "N/A"}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-600">Types</span>
                      <span className="font-medium text-gray-900 truncate text-right">
                        {(university.funding_types || []).length > 0
                          ? (university.funding_types || []).join(", ")
                          : "N/A"}
                      </span>
                    </div>
                  </div>
                )}

                {/* Info Grid */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center gap-2 p-2 bg-gray-50 rounded border">
                    <DollarSign className="h-4 w-4 text-green-600 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-[12px] text-gray-500">App Fee</p>
                      <p className="font-semibold text-xs text-gray-900 truncate">
                        ${university.application_fee}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 p-2 bg-gray-50 rounded border">
                    <Calendar className="h-4 w-4 text-blue-600 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-[12px] text-gray-500">Deadline</p>
                      <p className="font-semibold text-gray-900 truncate">
                        {upcomingDeadline
                          ? formatDeadlineDate(upcomingDeadline.deadline)
                          : deadlineDetails.deadlines.length > 0
                          ? "No upcoming"
                          : "Not set"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 p-2 bg-gray-50 rounded border">
                    <FileText className="h-4 w-4 text-purple-600 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-[12px] text-gray-500">SOP</p>
                      <p className="font-semibold text-gray-900 truncate">
                        {university.sop_length} pages
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 p-2 bg-gray-50 rounded border">
                    <Users className="h-4 w-4 text-orange-600 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-[12px] text-gray-500">GRE</p>
                      <p className="font-semibold text-gray-900 text-[11px] truncate">
                        {university.gre_required ? "Required" : "Optional"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Status Update */}
                <div className="pt-2 border-t">
                  <Select
                    value={university.status}
                    onValueChange={(value: University["status"]) => updateStatus(university.id, value)}
                  >
                    <SelectTrigger className="w-full h-8 text-s">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="not-started">Not Started</SelectItem>
                      <SelectItem value="in-progress">In Progress</SelectItem>
                      <SelectItem value="submitted">Submitted</SelectItem>
                      <SelectItem value="under-review">Under Review</SelectItem>
                      <SelectItem value="interview">Interview</SelectItem>
                      <SelectItem value="accepted">Accepted</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                      <SelectItem value="waitlisted">Waitlisted</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>


          )
        })}
      </div>

      {filteredUniversities.length === 0 && (
        <div className="text-center py-12">
          <GraduationCap className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No applications found</h3>
          <p className="text-gray-500 mb-4">Get started by adding your first PhD application.</p>
          <Button onClick={() => setShowForm(true)} className="bg-primary-500 hover:bg-primary-600">
            <Plus className="h-4 w-4 mr-2" />
            Add Application
          </Button>
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <UniversityForm
          onClose={() => {
            setShowForm(false)
            setEditingUniversity(undefined)
          }}
          onSave={handleSave}
          university={editingUniversity}
        />
      )}
    </div>
  )
}
