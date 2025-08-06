// "use client"

// import { useState } from "react"
// import { Card, CardContent } from "@/components/ui/card"
// import { Badge } from "@/components/ui/badge"
// import { Button } from "@/components/ui/button"
// import {
//   Calendar,
//   Clock,
//   CheckCircle,
//   AlertTriangle,
//   Plus,
//   ChevronRight,
//   Target,
//   Flag,
//   Users,
//   FileText,
//   Mail,
//   Video,
// } from "lucide-react"

// interface TimelineEvent {
//   id: string
//   title: string
//   description: string
//   date: string
//   time?: string
//   type: "deadline" | "meeting" | "task" | "milestone" | "reminder"
//   status: "upcoming" | "today" | "completed" | "overdue"
//   priority: "high" | "medium" | "low"
//   university?: string
//   relatedTo?: string
//   category: "application" | "professor" | "document" | "test" | "interview" | "decision"
// }

// export default function Timeline() {
//   const [viewMode, setViewMode] = useState<"week" | "month" | "all">("week")
//   const [filterCategory, setFilterCategory] = useState("all")

//   const events: TimelineEvent[] = [
//     {
//       id: "1",
//       title: "Stanford Application Deadline",
//       description: "Submit complete application package including SOP, transcripts, and LORs",
//       date: "2024-12-15",
//       type: "deadline",
//       status: "upcoming",
//       priority: "high",
//       university: "Stanford University",
//       category: "application",
//     },
//     {
//       id: "2",
//       title: "Video Call with Dr. Watson",
//       description: "Discuss research opportunities and potential collaboration",
//       date: "2024-12-10",
//       time: "2:00 PM",
//       type: "meeting",
//       status: "upcoming",
//       priority: "high",
//       university: "UC Berkeley",
//       category: "professor",
//     },
//     {
//       id: "3",
//       title: "Submit GRE Scores to MIT",
//       description: "Send official GRE scores through ETS",
//       date: "2024-12-08",
//       type: "task",
//       status: "today",
//       priority: "medium",
//       university: "MIT",
//       category: "test",
//     },
//     {
//       id: "4",
//       title: "Follow up with Dr. Rodriguez",
//       description: "Send follow-up email about research interests",
//       date: "2024-12-12",
//       type: "reminder",
//       status: "upcoming",
//       priority: "medium",
//       university: "MIT",
//       category: "professor",
//     },
//     {
//       id: "5",
//       title: "Complete Financial Aid Forms",
//       description: "Submit FAFSA and university-specific financial aid applications",
//       date: "2024-12-20",
//       type: "task",
//       status: "upcoming",
//       priority: "low",
//       category: "application",
//     },
//     {
//       id: "6",
//       title: "Harvard Interview",
//       description: "Virtual interview with admissions committee",
//       date: "2024-12-18",
//       time: "10:00 AM",
//       type: "meeting",
//       status: "upcoming",
//       priority: "high",
//       university: "Harvard University",
//       category: "interview",
//     },
//     {
//       id: "7",
//       title: "Submit MIT Application",
//       description: "Application successfully submitted",
//       date: "2024-12-01",
//       type: "milestone",
//       status: "completed",
//       priority: "high",
//       university: "MIT",
//       category: "application",
//     },
//   ]

//   const getStatusColor = (status: TimelineEvent["status"]) => {
//     switch (status) {
//       case "upcoming":
//         return "bg-blue-500"
//       case "today":
//         return "bg-purple-500"
//       case "completed":
//         return "bg-green-500"
//       case "overdue":
//         return "bg-red-500"
//       default:
//         return "bg-gray-500"
//     }
//   }

//   const getTypeIcon = (type: TimelineEvent["type"]) => {
//     switch (type) {
//       case "deadline":
//         return <Flag className="h-4 w-4" />
//       case "meeting":
//         return <Users className="h-4 w-4" />
//       case "task":
//         return <CheckCircle className="h-4 w-4" />
//       case "milestone":
//         return <Target className="h-4 w-4" />
//       case "reminder":
//         return <Clock className="h-4 w-4" />
//       default:
//         return <Calendar className="h-4 w-4" />
//     }
//   }

//   const getCategoryIcon = (category: TimelineEvent["category"]) => {
//     switch (category) {
//       case "application":
//         return <FileText className="h-4 w-4" />
//       case "professor":
//         return <Users className="h-4 w-4" />
//       case "document":
//         return <FileText className="h-4 w-4" />
//       case "test":
//         return <Target className="h-4 w-4" />
//       case "interview":
//         return <Video className="h-4 w-4" />
//       case "decision":
//         return <Mail className="h-4 w-4" />
//       default:
//         return <Calendar className="h-4 w-4" />
//     }
//   }

//   const getPriorityColor = (priority: TimelineEvent["priority"]) => {
//     switch (priority) {
//       case "high":
//         return "text-red-500"
//       case "medium":
//         return "text-yellow-500"
//       case "low":
//         return "text-green-500"
//       default:
//         return "text-gray-500"
//     }
//   }

//   const isToday = (date: string) => {
//     const today = new Date().toDateString()
//     const eventDate = new Date(date).toDateString()
//     return today === eventDate
//   }

//   const isThisWeek = (date: string) => {
//     const today = new Date()
//     const eventDate = new Date(date)
//     const weekStart = new Date(today.setDate(today.getDate() - today.getDay()))
//     const weekEnd = new Date(today.setDate(today.getDate() - today.getDay() + 6))
//     return eventDate >= weekStart && eventDate <= weekEnd
//   }

//   const filteredEvents = events
//     .filter((event) => {
//       const categoryMatch = filterCategory === "all" || event.category === filterCategory

//       if (viewMode === "week") {
//         return categoryMatch && (isThisWeek(event.date) || event.status === "today")
//       } else if (viewMode === "month") {
//         const eventDate = new Date(event.date)
//         const currentMonth = new Date().getMonth()
//         return categoryMatch && eventDate.getMonth() === currentMonth
//       }

//       return categoryMatch
//     })
//     .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

//   const upcomingCount = events.filter((e) => e.status === "upcoming").length
//   const todayCount = events.filter((e) => e.status === "today").length
//   const overdueCount = events.filter((e) => e.status === "overdue").length

//   return (
//     <div className="p-4 space-y-6">
//       {/* Header */}
//       <div className="flex items-center justify-between">
//         <div>
//           <h2 className="text-2xl font-bold">Timeline</h2>
//           <p className="text-gray-600">Track deadlines and important events</p>
//         </div>
//         <Button className="bg-primary-500 hover:bg-primary-600">
//           <Plus className="h-4 w-4 mr-2" />
//           Add Event
//         </Button>
//       </div>

//       {/* Stats Cards */}
//       <div className="grid grid-cols-3 gap-4">
//         <Card>
//           <CardContent className="p-4">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-sm text-gray-600">Today</p>
//                 <p className="text-2xl font-bold">{todayCount}</p>
//               </div>
//               <Clock className="h-8 w-8 text-purple-500" />
//             </div>
//           </CardContent>
//         </Card>
//         <Card>
//           <CardContent className="p-4">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-sm text-gray-600">Upcoming</p>
//                 <p className="text-2xl font-bold">{upcomingCount}</p>
//               </div>
//               <Calendar className="h-8 w-8 text-blue-500" />
//             </div>
//           </CardContent>
//         </Card>
//         <Card>
//           <CardContent className="p-4">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-sm text-gray-600">Overdue</p>
//                 <p className="text-2xl font-bold">{overdueCount}</p>
//               </div>
//               <AlertTriangle className="h-8 w-8 text-red-500" />
//             </div>
//           </CardContent>
//         </Card>
//       </div>

//       {/* View Mode Toggle */}
//       <div className="flex space-x-2">
//         {["week", "month", "all"].map((mode) => (
//           <Button
//             key={mode}
//             variant={viewMode === mode ? "default" : "outline"}
//             size="sm"
//             onClick={() => setViewMode(mode as any)}
//             className="capitalize"
//           >
//             {mode}
//           </Button>
//         ))}
//       </div>

//       {/* Category Filter */}
//       <div className="flex space-x-2 overflow-x-auto pb-2">
//         {["all", "application", "professor", "interview", "test", "decision"].map((category) => (
//           <Button
//             key={category}
//             variant={filterCategory === category ? "default" : "outline"}
//             size="sm"
//             onClick={() => setFilterCategory(category)}
//             className="whitespace-nowrap capitalize"
//           >
//             {category}
//           </Button>
//         ))}
//       </div>

//       {/* Timeline */}
//       <div className="space-y-4">
//         {filteredEvents.map((event, index) => (
//           <Card key={event.id} className={`overflow-hidden ${isToday(event.date) ? "ring-2 ring-purple-500" : ""}`}>
//             <CardContent className="p-4">
//               <div className="flex items-start space-x-4">
//                 {/* Date Column */}
//                 <div className="flex-shrink-0 text-center">
//                   <div
//                     className={`w-12 h-12 rounded-full flex items-center justify-center ${getStatusColor(event.status)}`}
//                   >
//                     <div className="text-white">{getTypeIcon(event.type)}</div>
//                   </div>
//                   <div className="mt-2 text-xs text-gray-500">
//                     {new Date(event.date).toLocaleDateString("en-US", {
//                       month: "short",
//                       day: "numeric",
//                     })}
//                   </div>
//                   {event.time && <div className="text-xs text-gray-500">{event.time}</div>}
//                 </div>

//                 {/* Content */}
//                 <div className="flex-1 min-w-0">
//                   <div className="flex items-start justify-between mb-2">
//                     <div className="flex-1">
//                       <div className="flex items-center space-x-2 mb-1">
//                         <h3 className="font-semibold text-lg">{event.title}</h3>
//                         <Badge className={`${getStatusColor(event.status)} text-white`}>{event.status}</Badge>
//                         <Badge variant="outline" className={getPriorityColor(event.priority)}>
//                           {event.priority}
//                         </Badge>
//                       </div>
//                       {event.university && <p className="text-sm text-gray-600 mb-1">{event.university}</p>}
//                       <p className="text-sm text-gray-700">{event.description}</p>
//                     </div>
//                     <div className="flex items-center space-x-2">
//                       <div className="text-gray-400">{getCategoryIcon(event.category)}</div>
//                       <ChevronRight className="h-4 w-4 text-gray-400" />
//                     </div>
//                   </div>

//                   {/* Action Buttons for Upcoming Events */}
//                   {event.status === "upcoming" && (
//                     <div className="flex space-x-2 mt-3">
//                       <Button size="sm" variant="outline">
//                         Mark Complete
//                       </Button>
//                       <Button size="sm" variant="outline">
//                         Reschedule
//                       </Button>
//                       {event.type === "meeting" && (
//                         <Button size="sm" className="bg-primary-500 hover:bg-primary-600">
//                           Join Meeting
//                         </Button>
//                       )}
//                     </div>
//                   )}
//                 </div>
//               </div>
//             </CardContent>
//           </Card>
//         ))}
//       </div>

//       {filteredEvents.length === 0 && (
//         <Card>
//           <CardContent className="p-8 text-center">
//             <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
//             <h3 className="text-lg font-medium text-gray-900 mb-2">No events found</h3>
//             <p className="text-gray-500">Try adjusting your filters or add a new event.</p>
//           </CardContent>
//         </Card>
//       )}
//     </div>
//   )
// }






"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Calendar, Clock, CheckCircle, AlertTriangle, Plus, ChevronRight, Target,
  Flag, Users, FileText, Mail, Video, Edit2, Trash2, ExternalLink, 
  Phone, MapPin, User, Building2
} from "lucide-react"
import type { TimelineEvent, University, Professor } from "@/lib/supabase"

interface TimelineProps {
  timelineEvents: TimelineEvent[]
  universities: University[]
  professors: Professor[]
  onUpdate?: (updatedEvent: TimelineEvent) => void
  onAddClick: () => void
  onEditClick?: (event: TimelineEvent) => void
  onDeleteClick?: (eventId: string) => void
}

export default function Timeline({ 
  timelineEvents, 
  universities, 
  professors, 
  onUpdate, 
  onAddClick,
  onEditClick,
  onDeleteClick 
}: TimelineProps) {
  const [viewMode, setViewMode] = useState<"week" | "month" | "all">("all")
  const [filterCategory, setFilterCategory] = useState("all")
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    deadline: true,
    meeting: true,
    task: true,
    milestone: true,
    reminder: true,
  })

  const isToday = (date: string) => new Date(date).toDateString() === new Date().toDateString()
  const isThisWeek = (date: string) => {
    const today = new Date()
    const eventDate = new Date(date)
    const start = new Date(today.setDate(today.getDate() - today.getDay()))
    const end = new Date(today.setDate(start.getDate() + 6))
    return eventDate >= start && eventDate <= end
  }

  const filteredEvents = timelineEvents
    .filter(event => {
      const matchCategory = filterCategory === "all" || event.category === filterCategory
      if (viewMode === "week") return matchCategory && (isThisWeek(event.date) || event.status === "today")
      if (viewMode === "month") return matchCategory && new Date(event.date).getMonth() === new Date().getMonth()
      return matchCategory
    })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  // Group events by type
  const eventsByType = filteredEvents.reduce((acc, event) => {
    if (!acc[event.type]) acc[event.type] = []
    acc[event.type].push(event)
    return acc
  }, {} as Record<string, TimelineEvent[]>)

  // Helper function to get university name
  const getUniversityName = (universityId?: string) => {
    if (!universityId) return null
    const university = universities.find(u => u.id === universityId)
    return university?.name || "Unknown University"
  }

  // Helper function to get professor details
  const getProfessorDetails = (professorId?: string) => {
    if (!professorId) return null
    const professor = professors.find(p => p.id === professorId)
    return professor || null
  }

  const getStatusColor = (status: TimelineEvent["status"]) => ({
    upcoming: "bg-blue-500",
    today: "bg-purple-500",
    completed: "bg-green-500",
    overdue: "bg-red-500",
  }[status] || "bg-gray-500")

  const getPriorityColor = (priority: TimelineEvent["priority"]) => ({
    high: "text-red-500 bg-red-50 border-red-200",
    medium: "text-yellow-600 bg-yellow-50 border-yellow-200",
    low: "text-green-600 bg-green-50 border-green-200",
  }[priority] || "text-gray-500")

  const getTypeIcon = (type: TimelineEvent["type"]) => ({
    deadline: <Flag className="h-4 w-4" />,
    meeting: <Users className="h-4 w-4" />,
    task: <CheckCircle className="h-4 w-4" />,
    milestone: <Target className="h-4 w-4" />,
    reminder: <Clock className="h-4 w-4" />,
  }[type] || <Calendar className="h-4 w-4" />)

  const getCategoryIcon = (category: TimelineEvent["category"]) => ({
    application: <FileText className="h-4 w-4" />,
    professor: <Users className="h-4 w-4" />,
    document: <FileText className="h-4 w-4" />,
    test: <Target className="h-4 w-4" />,
    interview: <Video className="h-4 w-4" />,
    decision: <Mail className="h-4 w-4" />,
  }[category] || <Calendar className="h-4 w-4" />)

  const getTypeColor = (type: TimelineEvent["type"]) => ({
    deadline: "bg-red-50 border-red-200",
    meeting: "bg-blue-50 border-blue-200",
    task: "bg-green-50 border-green-200",
    milestone: "bg-purple-50 border-purple-200",
    reminder: "bg-yellow-50 border-yellow-200",
  }[type] || "bg-gray-50")

  const getTypeTitle = (type: string) => ({
    deadline: "📅 Deadlines",
    meeting: "👥 Meetings",
    task: "✅ Tasks",
    milestone: "🎯 Milestones",
    reminder: "⏰ Reminders",
  }[type] || type)

  const toggleSection = (type: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [type]: !prev[type]
    }))
  }

  const upcomingCount = timelineEvents.filter((e) => e.status === "upcoming").length
  const todayCount = timelineEvents.filter((e) => e.status === "today").length
  const overdueCount = timelineEvents.filter((e) => e.status === "overdue").length

  const handleMarkComplete = async (event: TimelineEvent) => {
    if (onUpdate) {
      const updatedEvent = { ...event, status: "completed" as const }
      onUpdate(updatedEvent)
    }
  }

  const formatDateTime = (date: string, time?: string) => {
    const dateObj = new Date(date)
    const dateStr = dateObj.toLocaleDateString("en-US", { 
      weekday: 'short',
      month: "short", 
      day: "numeric",
      year: dateObj.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
    })
    return time ? `${dateStr} at ${time}` : dateStr
  }

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Timeline</h2>
          <p className="text-gray-600">Track deadlines and important events</p>
        </div>
        <Button onClick={onAddClick} className="bg-primary-500 hover:bg-primary-600">
          <Plus className="h-4 w-4 mr-2" />
          Add Event
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <Card><CardContent className="p-4 flex justify-between items-center">
          <div><p className="text-sm text-gray-600">Today</p><p className="text-2xl font-bold">{todayCount}</p></div>
          <Clock className="h-8 w-8 text-purple-500" />
        </CardContent></Card>
        <Card><CardContent className="p-4 flex justify-between items-center">
          <div><p className="text-sm text-gray-600">Upcoming</p><p className="text-2xl font-bold">{upcomingCount}</p></div>
          <Calendar className="h-8 w-8 text-blue-500" />
        </CardContent></Card>
        <Card><CardContent className="p-4 flex justify-between items-center">
          <div><p className="text-sm text-gray-600">Overdue</p><p className="text-2xl font-bold">{overdueCount}</p></div>
          <AlertTriangle className="h-8 w-8 text-red-500" />
        </CardContent></Card>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {["week", "month", "all"].map((mode) => (
          <Button key={mode} variant={viewMode === mode ? "default" : "outline"} size="sm" onClick={() => setViewMode(mode as any)} className="capitalize">
            {mode}
          </Button>
        ))}
        {["all", "application", "professor", "interview", "test", "decision", "document"].map((cat) => (
          <Button key={cat} variant={filterCategory === cat ? "default" : "outline"} size="sm" onClick={() => setFilterCategory(cat)} className="capitalize">
            {cat}
          </Button>
        ))}
      </div>

      {/* Timeline Events by Type */}
      <div className="space-y-6">
        {Object.entries(eventsByType).map(([type, events]) => (
          <div key={type} className={`border rounded-lg ${getTypeColor(type)}`}>
            {/* Section Header */}
            <div 
              className="p-4 cursor-pointer flex items-center justify-between hover:bg-opacity-80"
              onClick={() => toggleSection(type)}
            >
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center">
                  {getTypeIcon(type)}
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{getTypeTitle(type)}</h3>
                  <p className="text-sm text-gray-600">{events.length} {events.length === 1 ? 'event' : 'events'}</p>
                </div>
              </div>
              <ChevronRight className={`h-5 w-5 text-gray-400 transition-transform ${expandedSections[type] ? 'rotate-90' : ''}`} />
            </div>

            {/* Section Content */}
            {expandedSections[type] && (
              <div className="space-y-3 px-4 pb-4">
                {events.map((event) => {
                  const professor = getProfessorDetails(event.professor_id)
                  const university = getUniversityName(event.university_id)
                  
                  return (
                    <Card key={event.id} className={`${isToday(event.date) ? "ring-2 ring-purple-500" : ""} bg-white`}>
                      <CardContent className="p-4">
                        <div className="flex items-start space-x-4">
                          {/* Date Column */}
                          <div className="flex-shrink-0 text-center">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${getStatusColor(event.status)}`}>
                              <div className="text-white">{getTypeIcon(event.type)}</div>
                            </div>
                            <div className="mt-2 text-xs text-gray-500">
                              {formatDateTime(event.date, event.time)}
                            </div>
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-2">
                                  <h4 className="font-semibold text-lg">{event.title}</h4>
                                  <Badge className={`${getStatusColor(event.status)} text-white border-0`}>
                                    {event.status}
                                  </Badge>
                                  <Badge variant="outline" className={`${getPriorityColor(event.priority)} border`}>
                                    {event.priority}
                                  </Badge>
                                </div>
                                
                                {/* University Info */}
                                {university && (
                                  <div className="flex items-center space-x-1 text-sm text-gray-600 mb-1">
                                    <Building2 className="h-3 w-3" />
                                    <span>{university}</span>
                                  </div>
                                )}

                                {/* Professor Info */}
                                {professor && (
                                  <div className="flex items-center space-x-1 text-sm text-blue-600 mb-2">
                                    <User className="h-3 w-3" />
                                    <span className="font-medium">{professor.name}</span>
                                    {professor.department && (
                                      <span className="text-gray-500">• {professor.department}</span>
                                    )}
                                    {professor.email && event.type === 'meeting' && (
                                      <a href={`mailto:${professor.email}`} className="ml-2 text-blue-500 hover:text-blue-700">
                                        <Mail className="h-3 w-3" />
                                      </a>
                                    )}
                                    {professor.contact_info && event.type === 'meeting' && (
                                      <span className="ml-2 text-green-600 flex items-center">
                                        <Phone className="h-3 w-3 mr-1" />
                                        <span className="text-xs">{professor.contact_info}</span>
                                      </span>
                                    )}
                                  </div>
                                )}

                                <p className="text-sm text-gray-700 mb-3">{event.description}</p>

                                {/* Meeting-specific info */}
                                {event.type === 'meeting' && professor && (
                                  <div className="bg-blue-50 p-3 rounded-md mb-3">
                                    <div className="flex items-center space-x-2 mb-2">
                                      <Video className="h-4 w-4 text-blue-600" />
                                      <span className="font-medium text-blue-900">Meeting Details</span>
                                    </div>
                                    {professor.research_interests && (
                                      <p className="text-sm text-gray-700 mb-1">
                                        <strong>Research:</strong> {professor.research_interests}
                                      </p>
                                    )}
                                    {event.time && (
                                      <p className="text-sm text-gray-700">
                                        <strong>Scheduled:</strong> {formatDateTime(event.date, event.time)}
                                      </p>
                                    )}
                                  </div>
                                )}
                              </div>

                              {/* Actions */}
                              <div className="flex items-center space-x-1 ml-4">
                                {onEditClick && (
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => onEditClick(event)}
                                    className="h-8 w-8 p-0"
                                  >
                                    <Edit2 className="h-3 w-3" />
                                  </Button>
                                )}
                                {onDeleteClick && (
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => onDeleteClick(event.id)}
                                    className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                )}
                                <div className="text-gray-400">{getCategoryIcon(event.category)}</div>
                              </div>
                            </div>

                            {/* Action Buttons for Upcoming Events */}
                            {event.status === "upcoming" && (
                              <div className="flex gap-2 mt-3">
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => handleMarkComplete(event)}
                                >
                                  Mark Complete
                                </Button>
                                {event.type === "meeting" && (
                                  <>
                                    <Button size="sm" className="bg-primary-500 hover:bg-primary-600">
                                      <Video className="h-3 w-3 mr-1" />
                                      Join Meeting
                                    </Button>
                                    {professor?.email && (
                                      <Button size="sm" variant="outline" asChild>
                                        <a href={`mailto:${professor.email}?subject=${encodeURIComponent(`Meeting: ${event.title}`)}`}>
                                          <Mail className="h-3 w-3 mr-1" />
                                          Email
                                        </a>
                                      </Button>
                                    )}
                                  </>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* No Events */}
      {filteredEvents.length === 0 && (
        <Card><CardContent className="p-8 text-center">
          <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No events found</h3>
          <p className="text-gray-500 mb-4">Try adjusting filters or add a new event.</p>
          <Button onClick={onAddClick} className="bg-primary-500 hover:bg-primary-600">
            <Plus className="h-4 w-4 mr-2" />
            Add Your First Event
          </Button>
        </CardContent></Card>
      )}
    </div>
  )
}