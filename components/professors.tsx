
"use client"

import { useEffect, useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { supabase } from "@/lib/supabase"
import { useUser } from "@/components/UserProvider"
import ProfessorForm from "@/components/forms/professor-form"
import {
  Users,
  Search,
  Plus,
  Mail,
  Edit,
  Trash2,
  Calendar,
  MessageCircle,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Wand2
} from "lucide-react"
import { toast } from "@/hooks/use-toast"
import EmailGenerator from "@/components/email-generator"

const statusConfig = {
  "not-contacted": {
    label: "Not Contacted",
    color: "bg-gray-100 text-gray-800 border-gray-200",
    icon: Clock
  },
  "contacted": {
    label: "Contacted",
    color: "bg-blue-100 text-blue-800 border-blue-200",
    icon: Mail
  },
  "replied": {
    label: "Replied",
    color: "bg-green-100 text-green-800 border-green-200",
    icon: MessageCircle
  },
  "meeting-scheduled": {
    label: "Meeting Scheduled",
    color: "bg-purple-100 text-purple-800 border-purple-200",
    icon: Calendar
  },
  "rejected": {
    label: "Rejected",
    color: "bg-red-100 text-red-800 border-red-200",
    icon: XCircle
  }
}

const statusFilters = [
  { label: "All", value: "all" },
  { label: "Not Contacted", value: "not-contacted" },
  { label: "Contacted", value: "contacted" },
  { label: "Replied", value: "replied" },
  { label: "Meeting Scheduled", value: "meeting-scheduled" },
  { label: "Rejected", value: "rejected" },
]

export default function ProfessorsPage() {
  const { user, loading: userLoading } = useUser()
  const [professors, setProfessors] = useState<any[]>([])
  const [filteredProfessors, setFilteredProfessors] = useState<any[]>([])
  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState("all")
  const [openForm, setOpenForm] = useState(false)
  const [editingProfessor, setEditingProfessor] = useState(null)
  const [loading, setLoading] = useState(true)
  const [emailGeneratorOpen, setEmailGeneratorOpen] = useState(false)
  const [selectedProfessor, setSelectedProfessor] = useState<any>(null)

  const fetchProfessors = async () => {
    if (!user?.id) {
      setLoading(false)
      return
    }
    
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from("professors")
        .select("*")
        .eq("added_by", user.id)
        .order('created_at', { ascending: false })

      if (error) {
        console.error("Error fetching professors:", error)
        toast({
          title: "Error",
          description: "Failed to fetch professors",
          variant: "destructive",
        })
      } else {
        setProfessors(data ?? [])
      }
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete ${name}?`)) return

    try {
      const { error } = await supabase.from("professors").delete().eq("id", id)
      
      if (error) throw error
      
      toast({
        title: "Success",
        description: "Professor deleted successfully",
      })
      fetchProfessors()
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to delete professor",
        variant: "destructive",
      })
    }
  }

  const sendEmail = (email: string, name: string) => {
    const subject = encodeURIComponent(`Graduate Research Opportunity`)
    const body = encodeURIComponent(`Dear Professor ${name},\n\nI hope this email finds you well.\n\nBest regards,`)
    window.open(`mailto:${email}?subject=${subject}&body=${body}`, '_blank')
  }

  const openEmailGenerator = (professor: any) => {
    setSelectedProfessor(professor)
    setEmailGeneratorOpen(true)
  }

  const openEdit = (prof: any) => {
    setEditingProfessor(prof)
    setOpenForm(true)
  }

  const closeForm = () => {
    setOpenForm(false)
    setEditingProfessor(null)
  }

  const openNewProfessorForm = () => {
    setEditingProfessor(null) // Make sure this is null for new professor
    setOpenForm(true)
  }

  const filterAndSearch = () => {
    let filtered = professors.filter((p) => {
      const matchSearch =
        p.name?.toLowerCase().includes(search.toLowerCase()) ||
        p.university?.toLowerCase().includes(search.toLowerCase()) ||
        p.department?.toLowerCase().includes(search.toLowerCase()) ||
        p.email?.toLowerCase().includes(search.toLowerCase())
      
      const matchFilter = filter === "all" || p.contact_status === filter
      return matchSearch && matchFilter
    })
    setFilteredProfessors(filtered)
  }

  const getFollowUpStatus = (professor: any) => {
    if (professor.contact_status === "contacted" && professor.mailing_date) {
      const daysSinceContact = Math.floor(
        (new Date().getTime() - new Date(professor.mailing_date).getTime()) / (1000 * 60 * 60 * 24)
      )
      if (daysSinceContact > 14) {
        return { needsFollowUp: true, days: daysSinceContact }
      }
    }
    return { needsFollowUp: false, days: 0 }
  }

  const getStats = () => {
    const total = professors.length
    const contacted = professors.filter(p => p.contact_status === "contacted").length
    const replied = professors.filter(p => p.contact_status === "replied").length
    const meetings = professors.filter(p => p.contact_status === "meeting-scheduled").length
    const needFollowUp = professors.filter(p => getFollowUpStatus(p).needsFollowUp).length

    return { total, contacted, replied, meetings, needFollowUp }
  }

  useEffect(() => {
    if (user?.id) {
      fetchProfessors()
    } else if (user === null) {
      // User is definitely not logged in
      setLoading(false)
    }
    // If user is undefined, we're still loading the auth state
  }, [user])

  // Add timeout for loading state
  useEffect(() => {
    if (loading && user === undefined) {
      const timeout = setTimeout(() => {
        console.log('Professors page loading timeout - refreshing')
        setLoading(false)
      }, 8000) // 8 second timeout

      return () => clearTimeout(timeout)
    }
  }, [loading, user])

  useEffect(() => {
    filterAndSearch()
  }, [search, filter, professors])

  const stats = getStats()

  if (userLoading || (loading && user === undefined)) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Loading professors...</span>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Please log in</h3>
            <p className="text-gray-500">You need to be logged in to manage professors.</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Professor Management</h1>
          <p className="text-gray-600 mt-1">Track and manage your potential supervisors</p>
        </div>
        <Button
          onClick={openNewProfessorForm}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Professor
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <Users className="h-6 w-6 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Contacted</p>
                <p className="text-2xl font-bold">{stats.contacted}</p>
              </div>
              <Mail className="h-6 w-6 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Replied</p>
                <p className="text-2xl font-bold">{stats.replied}</p>
              </div>
              <MessageCircle className="h-6 w-6 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Meetings</p>
                <p className="text-2xl font-bold">{stats.meetings}</p>
              </div>
              <Calendar className="h-6 w-6 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Follow Up</p>
                <p className="text-2xl font-bold text-red-600">{stats.needFollowUp}</p>
              </div>
              <AlertTriangle className="h-6 w-6 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search professors, universities, departments..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 max-w-md"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {statusFilters.map((statusFilter) => (
            <Button
              key={statusFilter.value}
              variant={filter === statusFilter.value ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter(statusFilter.value)}
              className="text-sm"
            >
              {statusFilter.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Professors List */}
      {filteredProfessors.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {professors.length === 0 ? "No professors yet" : "No professors found"}
            </h3>
            <p className="text-gray-500 mb-4">
              {professors.length === 0 
                ? "Get started by adding your first professor." 
                : "Try adjusting your search or filters."}
            </p>
            {professors.length === 0 && (
              <Button onClick={openNewProfessorForm} className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Professor
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredProfessors.map((professor) => {
            const StatusIcon = statusConfig[professor.contact_status as keyof typeof statusConfig]?.icon || Clock
            const statusColor = statusConfig[professor.contact_status as keyof typeof statusConfig]?.color || "bg-gray-100 text-gray-800"
            const statusLabel = statusConfig[professor.contact_status as keyof typeof statusConfig]?.label || professor.contact_status
            const followUpStatus = getFollowUpStatus(professor)

            return (
              <Card key={professor.id} className={`relative ${followUpStatus.needsFollowUp ? 'border-red-300 bg-red-50/50' : ''}`}>
                {followUpStatus.needsFollowUp && (
                  <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                    Follow up needed!
                  </div>
                )}
                
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-2">{professor.name}</CardTitle>
                      <div className="space-y-1">
                        <p className="text-sm text-gray-600 font-medium">{professor.university}</p>
                        {professor.department && (
                          <p className="text-sm text-gray-500">{professor.department}</p>
                        )}
                        <p className="text-sm text-gray-600">{professor.email}</p>
                      </div>
                    </div>
                    <Badge className={`${statusColor} border flex items-center gap-1`}>
                      <StatusIcon className="h-3 w-3" />
                      {statusLabel}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Contact Information */}
                  {professor.mailing_date && (
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">Contact Date:</span>
                        <span>{new Date(professor.mailing_date).toLocaleDateString()}</span>
                      </div>
                      {followUpStatus.needsFollowUp && (
                        <div className="text-red-600 text-xs mt-1">
                          {followUpStatus.days} days ago - Consider following up
                        </div>
                      )}
                    </div>
                  )}

                  {/* Notes */}
                  {professor.notes && (
                    <div className="bg-blue-50 rounded-lg p-3">
                      <p className="text-sm font-medium mb-1 text-blue-800">Notes:</p>
                      <p className="text-sm text-blue-700 line-clamp-3">{professor.notes}</p>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="space-y-2 pt-2">
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => openEmailGenerator(professor)}
                        className="flex-1 bg-purple-600 hover:bg-purple-700"
                      >
                        <Wand2 className="h-4 w-4 mr-1" />
                        AI Email
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => sendEmail(professor.email, professor.name)}
                        className="bg-blue-50 text-blue-600 hover:bg-blue-100 border-blue-200"
                      >
                        <Mail className="h-4 w-4 mr-1" />
                        Quick Email
                      </Button>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openEdit(professor)}
                        className="flex-1"
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(professor.id, professor.name)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Professor Form Modal */}
      <ProfessorForm
        open={openForm}
        setOpen={closeForm}
        editingProfessor={editingProfessor}
        refresh={fetchProfessors}
      />

      {/* AI Email Generator Modal */}
      {selectedProfessor && (
        <EmailGenerator
          open={emailGeneratorOpen}
          onClose={() => {
            setEmailGeneratorOpen(false)
            setSelectedProfessor(null)
          }}
          professor={selectedProfessor}
        />
      )}
    </div>
  )
}