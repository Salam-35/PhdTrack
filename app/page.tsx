"use client"

import { useState, useEffect, useMemo } from "react"
import {
  Home,
  GraduationCap,
  Users,
  FileText,
  Calendar,
  DollarSign,
  BarChart3,
  Settings,
  Plus,
  Search,
  Bell,
  Filter,
  LogOut,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import Dashboard from "@/components/dashboard"
import Applications from "@/components/applications"
import Professors from "@/components/professors"
import Documents from "@/components/documents"
import Timeline from "@/components/timeline"
import Finances from "@/components/finances"
import Analytics from "@/components/analytics"
import SettingsPage from "@/components/settings"
import UniversityForm from "@/components/forms/university-form"
import ProfessorForm from "@/components/forms/professor-form"
import DocumentForm from "@/components/forms/document-form"
import TimelineForm from "@/components/forms/timeline-form"
import { db, type University, type Professor, type Document, type TimelineEvent } from "@/lib/supabase"
import { toast } from "@/hooks/use-toast"
import { UserCog } from "lucide-react"
import { useUser } from "@/components/UserProvider"

const navigationItems = [
  { id: "dashboard", label: "Dashboard", icon: Home },
  { id: "applications", label: "Applications", icon: GraduationCap },
  { id: "professors", label: "Professors", icon: Users },
  { id: "documents", label: "Documents", icon: FileText },
  { id: "timeline", label: "Timeline", icon: Calendar },
  // { id: "finances", label: "Finances", icon: DollarSign },
  // { id: "analytics", label: "Analytics", icon: BarChart3 },
  { id: "settings", label: "Settings", icon: UserCog },
]

export default function PhDTrackerPro() {
  const { user, profile, signOut, loading: userLoading } = useUser()
  const [activeTab, setActiveTab] = useState("dashboard")
  const [searchQuery, setSearchQuery] = useState("")
  const [filteredData, setFilteredData] = useState({
    universities: [] as University[],
    professors: [] as Professor[],
    documents: [] as Document[]
  })
  const [showUniversityForm, setShowUniversityForm] = useState(false)
  const [editingUniversity, setEditingUniversity] = useState<University | undefined>()
  const [showProfessorForm, setShowProfessorForm] = useState(false)
  const [showDocumentForm, setShowDocumentForm] = useState(false)
  const [showTimelineForm, setShowTimelineForm] = useState(false)
  const [editingTimelineEvent, setEditingTimelineEvent] = useState<TimelineEvent | undefined>()
  console.log(profile)
  // Data states
  const [universities, setUniversities] = useState<University[]>([])
  const [professors, setProfessors] = useState<Professor[]>([])
  const [documents, setDocuments] = useState<Document[]>([])
  const [timelineEvents, setTimelineEvents] = useState<TimelineEvent[]>([])
  const [loading, setLoading] = useState(true)
  const displayProfileName = profile
    ? ([profile.first_name, profile.last_name].filter(Boolean).join(" ").trim() ||
        profile.display_name ||
        user?.email ||
        "")
    : (user?.email || "")
  const profileInitials = useMemo(() => {
    const source = (displayProfileName || user?.email || "").trim()
    if (!source) return "U"
    const parts = source.split(/\s+/).filter(Boolean)
    if (parts.length === 1) {
      return parts[0].slice(0, 2).toUpperCase()
    }
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  }, [displayProfileName, user?.email])
  const profileHighlights = useMemo(() => {
    const highlights: Array<{ label: string; value: string }> = []
    if (profile?.degree_seeking) highlights.push({ label: "Degree", value: profile.degree_seeking })
    if (profile?.field_of_study) highlights.push({ label: "Focus", value: profile.field_of_study })
    if (profile?.current_university) highlights.push({ label: "Institution", value: profile.current_university })
    if (profile?.graduation_year) highlights.push({ label: "Grad Year", value: profile.graduation_year.toString() })
    if (profile?.location) highlights.push({ label: "Location", value: profile.location })
    if (profile?.timezone) highlights.push({ label: "Timezone", value: profile.timezone })
    return highlights.slice(0, 3)
  }, [profile])

  const handleOpenSettings = () => setActiveTab("settings")

  // Load data on component mount and when user changes
  useEffect(() => {
    if (user?.id && !userLoading) {
      loadData()
    }
  }, [user?.id, userLoading])

  // Filter data based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredData({
        universities,
        professors,
        documents
      })
      return
    }

    const query = searchQuery.toLowerCase()

    const filteredUniversities = universities.filter(uni =>
      uni.name.toLowerCase().includes(query) ||
      uni.program?.toLowerCase().includes(query) ||
      uni.status.toLowerCase().includes(query) ||
      uni.notes?.toLowerCase().includes(query)
    )

    const filteredProfessors = professors.filter(prof =>
      prof.name.toLowerCase().includes(query) ||
      prof.email?.toLowerCase().includes(query) ||
      prof.department?.toLowerCase().includes(query) ||
      prof.university?.toLowerCase().includes(query) ||
      prof.contact_status?.toLowerCase().includes(query) ||
      prof.research_interests?.toLowerCase().includes(query)
    )

    const filteredDocuments = documents.filter(doc =>
      doc.name.toLowerCase().includes(query) ||
      doc.type?.toLowerCase().includes(query) ||
      doc.status?.toLowerCase().includes(query)
    )

    setFilteredData({
      universities: filteredUniversities,
      professors: filteredProfessors,
      documents: filteredDocuments
    })
  }, [searchQuery, universities, professors, documents])

  const loadData = async () => {
    if (!user?.id) return
    
    try {
      setLoading(true)
      
      const [universitiesData, professorsData, documentsData, eventsData] = await Promise.all([
        db.getUniversities(),
        db.getProfessors(),
        db.getDocuments(),
        db.getTimelineEvents(),
      ])

    
      setUniversities(universitiesData)
      setProfessors(professorsData)
      setDocuments(documentsData)
      setTimelineEvents(eventsData)
    } catch (error) {
      console.error("Error loading data:", error)
      toast({
        title: "Error Loading Data",
        description: "Failed to load your data. Please refresh the page.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSignOut = async () => {
    try {
      await signOut()
      toast({
        title: "Signed Out",
        description: "You have been successfully signed out."
      })
    } catch (error) {
      console.error("Sign out error:", error)
      toast({
        title: "Error",
        description: "Failed to sign out. Please try again.",
        variant: "destructive"
      })
    }
  }

  const handleAddUniversity = (university: University) => {
    if (editingUniversity) {
      // Update existing university
      setUniversities((prev) => prev.map(uni => uni.id === university.id ? university : uni))
      setEditingUniversity(undefined)
    } else {
      // Add new university
      setUniversities((prev) => [university, ...prev])
    }
  }

  const handleEditUniversity = (university: University) => {
    setEditingUniversity(university)
    setShowUniversityForm(true)
  }

  const handleAddProfessor = (professor: Professor) => {
    setProfessors((prev) => [professor, ...prev])
  }

  const handleAddDocument = (document: Document) => {
    setDocuments((prev) => [document, ...prev])
  }

  const handleAddTimelineEvent = (event: TimelineEvent) => {
    setTimelineEvents((prev) =>
      [event, ...prev.filter((e) => e.id !== event.id)].sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
      ),
    )
  }

  const handleFabClick = () => {
    switch (activeTab) {
      case "applications":
        setShowUniversityForm(true)
        break
      case "professors":
        setShowProfessorForm(true)
        break
      case "documents":
        setShowDocumentForm(true)
        break
      case "timeline":
        setShowTimelineForm(true)
        break
      default:
        setShowUniversityForm(true)
        break
    }
  }

  const handleTimelineAddClick = () => {
    setEditingTimelineEvent(undefined)
    setShowTimelineForm(true)
  }

  const handleTimelineEditClick = (event: TimelineEvent) => {
    setEditingTimelineEvent(event)
    setShowTimelineForm(true)
  }

  const handleTimelineDeleteClick = async (eventId: string) => {
    if (!confirm("Are you sure you want to delete this event?")) return
    
    try {
      await db.deleteTimelineEvent(eventId)
      setTimelineEvents(prev => prev.filter(e => e.id !== eventId))
      toast({
        title: "Event Deleted",
        description: "The event has been deleted successfully.",
      })
    } catch (error) {
      console.error("Error deleting event:", error)
      toast({
        title: "Error",
        description: "Failed to delete event. Please try again.",
        variant: "destructive",
      })
    }
  }

  const renderContent = () => {
    const props = {
      universities: searchQuery.trim() ? filteredData.universities : universities,
      professors: searchQuery.trim() ? filteredData.professors : professors,
      documents: searchQuery.trim() ? filteredData.documents : documents,
      timelineEvents,
      setUniversities,
      setProfessors,
      setDocuments,
      setTimelineEvents,
      searchQuery,
      onEditUniversity: handleEditUniversity
    }

    switch (activeTab) {
      case "dashboard":
        return <Dashboard {...props} />
      case "applications":
        return <Applications {...props} />
      case "professors":
        return <Professors {...props} />
      case "documents":
        return <Documents {...props} />
      case "timeline":
        return (
          <Timeline
            timelineEvents={timelineEvents}
            universities={universities}
            professors={professors}
            onAddClick={handleTimelineAddClick}
            onEditClick={handleTimelineEditClick}
            onDeleteClick={handleTimelineDeleteClick}
            onUpdate={handleAddTimelineEvent}
          />
        )
      case "settings":
        return <SettingsPage />
      default:
        return <Dashboard {...props} />
    }
  }

  // Show loading state
  if (userLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-primary-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <GraduationCap className="h-8 w-8 text-white animate-pulse" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Loading PhD Tracker Pro</h2>
          <p className="text-gray-600">Setting up your academic journey...</p>
        </div>
      </div>
    )
  }

  // This component will only render if user is authenticated (due to AuthGuard)
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-primary-200">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
                <GraduationCap className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">Application Tracker</h1>
                <p className="text-xs text-gray-500">Organise Your Grad Applications</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search applications, professors, documents..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-80 bg-white border-gray-300 shadow-sm focus:shadow-md transition-shadow"
                />
              </div>

              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 text-xs bg-red-500">
                  {timelineEvents.filter((e) => e.status === "today" || e.status === "overdue").length}
                </Badge>
              </Button>

              <Button variant="ghost" size="icon">
                <Filter className="h-5 w-5" />
              </Button>

              {/* User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative rounded-full hover:bg-primary-50">
                    {profile?.avatar_url ? (
                      <img
                        src={profile.avatar_url}
                        alt="Profile"
                        className="h-8 w-8 rounded-full object-cover"
                      />
                    ) : (
                      <div className="h-8 w-8 rounded-full bg-primary-100 text-primary-700 text-xs font-semibold flex items-center justify-center uppercase">
                        {profileInitials}
                      </div>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-72 p-0 overflow-hidden rounded-xl border border-gray-100 shadow-xl"
                >
                  <div className="relative bg-gradient-to-r from-primary-500 via-indigo-500 to-purple-500 text-white p-4">
                    <div className="flex items-center gap-3">
                      <div className="h-16 w-16  border-2 border-white/60 bg-white/20 flex items-center justify-center overflow-hidden shadow-inner">
                        {profile?.avatar_url ? (
                          <img
                            src={profile.avatar_url}
                            alt={displayProfileName}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <span className="text-sm font-semibold uppercase tracking-wide">
                            {profileInitials}
                          </span>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold truncate">{displayProfileName}</p>
                        <p className="text-xs text-white/80 truncate">{user?.email}</p>
                        {profile?.field_of_study && (
                          <p className="mt-1 text-[11px] text-white/80">
                            {profile.field_of_study}
                          </p>
                        )}

                        {profile?.current_university && (
                          <p className="mt-1 text-[11px] text-white/80">
                            {profile.current_university}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                  {/*
                  {profileHighlights.length > 0 && (
                    <>
                      <div className="px-4 py-3 bg-white border-t border-gray-100">
                        <p className="text-xs font-semibold uppercase text-gray-400 mb-2 tracking-wide">
                          Snapshot
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {profileHighlights.map((item, index) => (
                            <span
                              key={`${item.label}-${index}`}
                              className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 text-[11px] font-medium text-gray-600"
                            >
                              <span className="text-gray-400 uppercase font-semibold tracking-wide">
                                {item.label}:
                              </span>
                              <span className="text-gray-700">{item.value}</span>
                            </span>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                */}
                  <DropdownMenuSeparator className="h-px bg-gray-100" />
                  <DropdownMenuItem
                    onClick={handleOpenSettings}
                    className="py-2.5 text-sm text-gray-600 hover:bg-primary-50 hover:text-primary-700 focus:bg-primary-50 focus:text-primary-700 transition-colors"
                  >
                    <Settings className="mr-2 h-4 w-4 shrink-0" />
                    <div className="flex flex-col leading-tight">
                      <span className="font-medium">Profile & Settings</span>
                      {/* <span className="text-[11px] text-gray-400">Open the settings tab</span>*/}
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="h-px bg-gray-100" />
                  <DropdownMenuItem
                    onClick={handleSignOut}
                    className="py-2.5 text-sm font-medium text-red-500 hover:bg-[#fa5c5c] hover:text-white focus:bg-[#fa5c5c] focus:text-white transition-colors"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Logout</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>


        </div>
      </header>

      {/* Main Content */}
      <main className="pb-32">{renderContent()}</main>

      {/* Floating Action Button */}
      <Button
        onClick={handleFabClick}
        className="fixed bottom-24 right-4 h-14 w-14 rounded-full shadow-lg bg-primary-500 hover:bg-primary-600 z-40"
        size="icon"
      >
        <Plus className="h-6 w-6" />
      </Button>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-30">
        <div className="grid grid-cols-5 gap-1 p-2">
          {navigationItems.slice(0, 5).map((item) => {
            const Icon = item.icon
            const isActive = activeTab === item.id
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex flex-col items-center justify-center py-2 px-1 rounded-lg transition-colors ${
                  isActive ? "bg-primary-100 text-primary-600" : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <Icon className="h-5 w-5 mb-1" />
                <span className="text-xs font-medium">{item.label}</span>
              </button>
            )
          })}
        </div>

        {/* <div className="grid grid-cols-3 gap-1 p-2 border-t border-gray-100">
          {navigationItems.slice(4).map((item) => {
            const Icon = item.icon
            const isActive = activeTab === item.id
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex flex-col items-center justify-center py-2 px-1 rounded-lg transition-colors ${
                  isActive ? "bg-primary-100 text-primary-600" : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <Icon className="h-5 w-5 mb-1" />
                <span className="text-xs font-medium">{item.label}</span>
              </button>
            )
          })}
        </div> */}
      </nav>

      {/* Forms */}
      {showUniversityForm && (
        <UniversityForm
          onClose={() => {
            setShowUniversityForm(false)
            setEditingUniversity(undefined)
          }}
          onSave={handleAddUniversity}
          university={editingUniversity}
        />
      )}

      {showProfessorForm && (
        <ProfessorForm onClose={() => setShowProfessorForm(false)} onSave={handleAddProfessor} />
      )}

      {showDocumentForm && (
        <DocumentForm
          onClose={() => setShowDocumentForm(false)}
          onSave={handleAddDocument}
          universities={universities}
        />
      )}

      {showTimelineForm && (
        <TimelineForm
          onClose={() => {
            setShowTimelineForm(false)
            setEditingTimelineEvent(undefined)
          }}
          onSave={handleAddTimelineEvent}
          universities={universities}
          professors={professors}
          event={editingTimelineEvent}
        />
      )}
    </div>
  )
}
