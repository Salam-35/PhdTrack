"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Calendar,
  Clock,
  CheckCircle,
  AlertTriangle,
  Plus,
  ChevronRight,
  Target,
  Flag,
  Users,
  FileText,
  Mail,
  Video,
} from "lucide-react"

interface TimelineEvent {
  id: string
  title: string
  description: string
  date: string
  time?: string
  type: "deadline" | "meeting" | "task" | "milestone" | "reminder"
  status: "upcoming" | "today" | "completed" | "overdue"
  priority: "high" | "medium" | "low"
  university?: string
  relatedTo?: string
  category: "application" | "professor" | "document" | "test" | "interview" | "decision"
}

export default function Timeline() {
  const [viewMode, setViewMode] = useState<"week" | "month" | "all">("week")
  const [filterCategory, setFilterCategory] = useState("all")

  const events: TimelineEvent[] = [
    {
      id: "1",
      title: "Stanford Application Deadline",
      description: "Submit complete application package including SOP, transcripts, and LORs",
      date: "2024-12-15",
      type: "deadline",
      status: "upcoming",
      priority: "high",
      university: "Stanford University",
      category: "application",
    },
    {
      id: "2",
      title: "Video Call with Dr. Watson",
      description: "Discuss research opportunities and potential collaboration",
      date: "2024-12-10",
      time: "2:00 PM",
      type: "meeting",
      status: "upcoming",
      priority: "high",
      university: "UC Berkeley",
      category: "professor",
    },
    {
      id: "3",
      title: "Submit GRE Scores to MIT",
      description: "Send official GRE scores through ETS",
      date: "2024-12-08",
      type: "task",
      status: "today",
      priority: "medium",
      university: "MIT",
      category: "test",
    },
    {
      id: "4",
      title: "Follow up with Dr. Rodriguez",
      description: "Send follow-up email about research interests",
      date: "2024-12-12",
      type: "reminder",
      status: "upcoming",
      priority: "medium",
      university: "MIT",
      category: "professor",
    },
    {
      id: "5",
      title: "Complete Financial Aid Forms",
      description: "Submit FAFSA and university-specific financial aid applications",
      date: "2024-12-20",
      type: "task",
      status: "upcoming",
      priority: "low",
      category: "application",
    },
    {
      id: "6",
      title: "Harvard Interview",
      description: "Virtual interview with admissions committee",
      date: "2024-12-18",
      time: "10:00 AM",
      type: "meeting",
      status: "upcoming",
      priority: "high",
      university: "Harvard University",
      category: "interview",
    },
    {
      id: "7",
      title: "Submit MIT Application",
      description: "Application successfully submitted",
      date: "2024-12-01",
      type: "milestone",
      status: "completed",
      priority: "high",
      university: "MIT",
      category: "application",
    },
  ]

  const getStatusColor = (status: TimelineEvent["status"]) => {
    switch (status) {
      case "upcoming":
        return "bg-blue-500"
      case "today":
        return "bg-purple-500"
      case "completed":
        return "bg-green-500"
      case "overdue":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  const getTypeIcon = (type: TimelineEvent["type"]) => {
    switch (type) {
      case "deadline":
        return <Flag className="h-4 w-4" />
      case "meeting":
        return <Users className="h-4 w-4" />
      case "task":
        return <CheckCircle className="h-4 w-4" />
      case "milestone":
        return <Target className="h-4 w-4" />
      case "reminder":
        return <Clock className="h-4 w-4" />
      default:
        return <Calendar className="h-4 w-4" />
    }
  }

  const getCategoryIcon = (category: TimelineEvent["category"]) => {
    switch (category) {
      case "application":
        return <FileText className="h-4 w-4" />
      case "professor":
        return <Users className="h-4 w-4" />
      case "document":
        return <FileText className="h-4 w-4" />
      case "test":
        return <Target className="h-4 w-4" />
      case "interview":
        return <Video className="h-4 w-4" />
      case "decision":
        return <Mail className="h-4 w-4" />
      default:
        return <Calendar className="h-4 w-4" />
    }
  }

  const getPriorityColor = (priority: TimelineEvent["priority"]) => {
    switch (priority) {
      case "high":
        return "text-red-500"
      case "medium":
        return "text-yellow-500"
      case "low":
        return "text-green-500"
      default:
        return "text-gray-500"
    }
  }

  const isToday = (date: string) => {
    const today = new Date().toDateString()
    const eventDate = new Date(date).toDateString()
    return today === eventDate
  }

  const isThisWeek = (date: string) => {
    const today = new Date()
    const eventDate = new Date(date)
    const weekStart = new Date(today.setDate(today.getDate() - today.getDay()))
    const weekEnd = new Date(today.setDate(today.getDate() - today.getDay() + 6))
    return eventDate >= weekStart && eventDate <= weekEnd
  }

  const filteredEvents = events
    .filter((event) => {
      const categoryMatch = filterCategory === "all" || event.category === filterCategory

      if (viewMode === "week") {
        return categoryMatch && (isThisWeek(event.date) || event.status === "today")
      } else if (viewMode === "month") {
        const eventDate = new Date(event.date)
        const currentMonth = new Date().getMonth()
        return categoryMatch && eventDate.getMonth() === currentMonth
      }

      return categoryMatch
    })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  const upcomingCount = events.filter((e) => e.status === "upcoming").length
  const todayCount = events.filter((e) => e.status === "today").length
  const overdueCount = events.filter((e) => e.status === "overdue").length

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Timeline</h2>
          <p className="text-gray-600">Track deadlines and important events</p>
        </div>
        <Button className="bg-primary-500 hover:bg-primary-600">
          <Plus className="h-4 w-4 mr-2" />
          Add Event
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Today</p>
                <p className="text-2xl font-bold">{todayCount}</p>
              </div>
              <Clock className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Upcoming</p>
                <p className="text-2xl font-bold">{upcomingCount}</p>
              </div>
              <Calendar className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Overdue</p>
                <p className="text-2xl font-bold">{overdueCount}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* View Mode Toggle */}
      <div className="flex space-x-2">
        {["week", "month", "all"].map((mode) => (
          <Button
            key={mode}
            variant={viewMode === mode ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode(mode as any)}
            className="capitalize"
          >
            {mode}
          </Button>
        ))}
      </div>

      {/* Category Filter */}
      <div className="flex space-x-2 overflow-x-auto pb-2">
        {["all", "application", "professor", "interview", "test", "decision"].map((category) => (
          <Button
            key={category}
            variant={filterCategory === category ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterCategory(category)}
            className="whitespace-nowrap capitalize"
          >
            {category}
          </Button>
        ))}
      </div>

      {/* Timeline */}
      <div className="space-y-4">
        {filteredEvents.map((event, index) => (
          <Card key={event.id} className={`overflow-hidden ${isToday(event.date) ? "ring-2 ring-purple-500" : ""}`}>
            <CardContent className="p-4">
              <div className="flex items-start space-x-4">
                {/* Date Column */}
                <div className="flex-shrink-0 text-center">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center ${getStatusColor(event.status)}`}
                  >
                    <div className="text-white">{getTypeIcon(event.type)}</div>
                  </div>
                  <div className="mt-2 text-xs text-gray-500">
                    {new Date(event.date).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </div>
                  {event.time && <div className="text-xs text-gray-500">{event.time}</div>}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="font-semibold text-lg">{event.title}</h3>
                        <Badge className={`${getStatusColor(event.status)} text-white`}>{event.status}</Badge>
                        <Badge variant="outline" className={getPriorityColor(event.priority)}>
                          {event.priority}
                        </Badge>
                      </div>
                      {event.university && <p className="text-sm text-gray-600 mb-1">{event.university}</p>}
                      <p className="text-sm text-gray-700">{event.description}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="text-gray-400">{getCategoryIcon(event.category)}</div>
                      <ChevronRight className="h-4 w-4 text-gray-400" />
                    </div>
                  </div>

                  {/* Action Buttons for Upcoming Events */}
                  {event.status === "upcoming" && (
                    <div className="flex space-x-2 mt-3">
                      <Button size="sm" variant="outline">
                        Mark Complete
                      </Button>
                      <Button size="sm" variant="outline">
                        Reschedule
                      </Button>
                      {event.type === "meeting" && (
                        <Button size="sm" className="bg-primary-500 hover:bg-primary-600">
                          Join Meeting
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredEvents.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No events found</h3>
            <p className="text-gray-500">Try adjusting your filters or add a new event.</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
