"use client"

import { useState, useEffect } from "react"
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
  User,
  UserCircle,
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
  const [showUniversityForm, setShowUniversityForm] = useState(false)
  const [showProfessorForm, setShowProfessorForm] = useState(false)
  const [showDocumentForm, setShowDocumentForm] = useState(false)
  const [showTimelineForm, setShowTimelineForm] = useState(false)
  const [editingTimelineEvent, setEditingTimelineEvent] = useState<TimelineEvent | undefined>()

  // Data states
  const [universities, setUniversities] = useState<University[]>([])
  const [professors, setProfessors] = useState<Professor[]>([])
  const [documents, setDocuments] = useState<Document[]>([])
  const [timelineEvents, setTimelineEvents] = useState<TimelineEvent[]>([])
  const [loading, setLoading] = useState(true)

  // Load data on component mount and when user changes
  useEffect(() => {
    if (user?.id && !userLoading) {
      loadData()
    }
  }, [user?.id, userLoading])

  const loadData = async () => {
    if (!user?.id) return
    
    try {
      setLoading(true)
      console.log("Loading data for user:", user.id)
      
      const [universitiesData, professorsData, documentsData, eventsData] = await Promise.all([
        db.getUniversities(),
        db.getProfessors(),
        db.getDocuments(),
        db.getTimelineEvents(),
      ])

      console.log("Loaded data:", {
        universities: universitiesData.length,
        professors: professorsData.length,
        documents: documentsData.length,
        events: eventsData.length
      })

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
    setUniversities((prev) => [university, ...prev])
  }

  const handleAddProfessor = (professor: Professor) => {
    setProfessors((prev) => [professor, ...prev])
  }

  const handleAddDocument = (document: Document) => {
    setDocuments((prev) => [document, ...prev])
  }

  const handleAddTimelineEvent = (event: TimelineEvent) => {
    console.log("Adding/updating timeline event:", event)
    setTimelineEvents((prev) =>
      [event, ...prev.filter((e) => e.id !== event.id)].sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
      ),
    )
  }

  const handleFabClick = () => {
    console.log(`FAB clicked for tab: ${activeTab}`)
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
    console.log("Timeline add button clicked")
    setEditingTimelineEvent(undefined)
    setShowTimelineForm(true)
  }

  const handleTimelineEditClick = (event: TimelineEvent) => {
    console.log("Timeline edit button clicked", event)
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
      universities,
      professors,
      documents,
      timelineEvents,
      setUniversities,
      setProfessors,
      setDocuments,
      setTimelineEvents,
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
                <h1 className="text-lg font-bold text-gray-900">Application Tracker Pro</h1>
                <p className="text-xs text-gray-500">Organise Your PhD Application Process</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
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
                  <Button variant="ghost" size="icon" className="relative">
                    {profile?.avatar_url ? (
                      <img 
                        src={profile.avatar_url} 
                        alt="Profile" 
                        className="h-8 w-8 rounded-full object-cover"
                      />
                    ) : (
                      <UserCircle className="h-5 w-5" />
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-3 py-2">
                    <p className="text-sm font-medium">{profile?.full_name || user?.email}</p>
                    <p className="text-xs text-gray-500">{user?.email}</p>
                  </div>
                  </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Search Bar */}
          <div className="mt-3 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search applications, professors, documents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-gray-50 border-gray-200"
            />
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
        <div className="grid grid-cols-6 gap-1 p-2">
          {navigationItems.slice(0, 6).map((item) => {
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
        <UniversityForm onClose={() => setShowUniversityForm(false)} onSave={handleAddUniversity} />
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