"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Edit, Trash2, DollarSign, Calendar, FileText, Users, Search, Plus, GraduationCap } from "lucide-react"
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
    try {
      const updatedUniversity = await db.updateUniversity(id, { status: newStatus })
      setUniversities(universities.map((uni) => (uni.id === id ? updatedUniversity : uni)))
      toast({
        title: "Status Updated",
        description: `Application status updated to ${newStatus.replace("-", " ")}`,
      })
    } catch (error) {
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

          return (
            <Card key={university.id} className="relative">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{university.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">{university.program}</p>
                    <p className="text-xs text-gray-500">{university.location}</p>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(university)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => deleteUniversity(university.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Badge className={`${getStatusColor(university.status, university.acceptance_funding_status)} text-white`}>
                    {getStatusLabel(university.status, university.acceptance_funding_status)}
                  </Badge>
                  <Badge className={getPriorityColor(university.priority)}>{university.priority} priority</Badge>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progress</span>
                    <span>{getProgress(university.status)}%</span>
                  </div>
                  <Progress value={getProgress(university.status)} className="h-2" />
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <span>${university.application_fee}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>
                      {upcomingDeadline
                        ? `${upcomingLabel}: ${upcomingDeadline.term} • ${formatDeadlineDate(upcomingDeadline.deadline)}`
                        : deadlineDetails.deadlines.length > 0
                          ? "No upcoming deadline"
                          : "No deadlines recorded"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span>{university.sop_length} pages</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span>{university.gre_required ? "GRE Required" : "No GRE"}</span>
                  </div>
                </div>

                {university.gre_score && (
                  <div className="text-sm">
                    <span className="font-medium">GRE: </span>
                    <span className="text-muted-foreground">{university.gre_score}</span>
                  </div>
                )}

                {university.status === "accepted" && university.acceptance_funding_status && (
                  <div className="text-sm">
                    <span className="font-medium">Acceptance Funding: </span>
                    <span className={university.acceptance_funding_status === "with-funding" ? "text-green-600 font-semibold" : "text-orange-600"}>
                      {university.acceptance_funding_status === "with-funding" ? "Funded" :
                       university.acceptance_funding_status === "without-funding" ? "Not Funded" :
                       university.acceptance_funding_status === "pending" ? "Pending" : "Unknown"}
                    </span>
                  </div>
                )}

                {university.status !== "accepted" && university.funding_available && (
                  <div className="text-sm">
                    <span className="font-medium">Funding: </span>
                    <span className="text-green-600">{university.funding_amount || "Available"}</span>
                  </div>
                )}

                <div className="space-y-2">
                  <div className="text-sm font-medium">Requirements:</div>
                  <div className="flex flex-wrap gap-1">
                    {university.requirements.slice(0, 3).map((req, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {req}
                      </Badge>
                    ))}
                    {university.requirements.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{university.requirements.length - 3} more
                      </Badge>
                    )}
                  </div>
                </div>

                {university.notes && (
                  <div className="text-sm">
                    <span className="font-medium">Notes: </span>
                    <span className="text-muted-foreground">{university.notes.substring(0, 100)}...</span>
                  </div>
                )}

                {deadlineDetails.deadlines.length > 0 && (
                  <div className="space-y-2">
                    <div className="text-sm font-medium">Semester Deadlines</div>
                    <div className="flex flex-wrap gap-2">
                      {deadlineDetails.deadlines.map((deadline, index) => {
                        const isCurrent = upcomingDeadline?.deadline === deadline.deadline
                        return (
                          <Badge
                            key={`${deadline.term}-${deadline.deadline}-${index}`}
                            variant={isCurrent ? "default" : "outline"}
                            className={`text-xs ${isCurrent ? "bg-blue-600 text-white" : "border-blue-200 text-blue-700"}`}
                          >
                            {deadline.term}: {formatDeadlineDate(deadline.deadline)}
                          </Badge>
                        )
                      })}
                    </div>
                    {nextDeadline && (
                      <div className="text-xs text-muted-foreground">
                        Following: {nextDeadline.term} • {formatDeadlineDate(nextDeadline.deadline)}
                      </div>
                    )}
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div
                    className={`text-xs ${daysUntil !== null && daysUntil < 30 ? "text-red-600 font-medium" : "text-muted-foreground"}`}
                  >
                    {countdownText}
                  </div>
                  <Select
                    value={university.status}
                    onValueChange={(value: University["status"]) => updateStatus(university.id, value)}
                  >
                    <SelectTrigger className="w-32 h-8 text-xs">
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
