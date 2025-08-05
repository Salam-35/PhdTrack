"use client"

import { useEffect, useState } from "react"
import { useUser } from "@/context/UserProvider"
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
  const user = useUser()
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
  const [upcomingTasks, setUpcomingTasks] = useState<any[]>([])
  const [recentActivity, setRecentActivity] = useState<any[]>([])

  useEffect(() => {
  if (!user) return
  const fetchData = async () => {
    setLoading(true)

    const [{ data: universities }, { data: professors }, { data: documents }, { data: events }] =
      await Promise.all([
        supabase.from("universities").select("*").eq("added_by", user.id),
        supabase.from("professors").select("*").eq("added_by", user.id),
        supabase.from("documents").select("*").eq("added_by", user.id),
        supabase.from("timeline_events").select("*").eq("added_by", user.id),
      ])

    // 🔴 Updated line: only sum application fees for submitted universities
    const totalSpent =
  universities
    ?.filter(u => u.status === "submitted")
    .reduce((sum, u) => sum + (Number(u.application_fee) || 0), 0) ?? 0

    const submitted = universities?.filter(u => u.status === "submitted").length ?? 0
    const inProgress = universities?.filter(u => u.status === "in-progress").length ?? 0
    const notStarted = universities?.filter(u => u.status === "not-started").length ?? 0
    console.log(universities)
    console.log(totalSpent)
    const contacted = professors?.filter(p => p.contact_status !== "not-contacted").length ?? 0

    setStats({
      totalApplications: universities?.length ?? 0,
      professorsContacted: contacted,
      documentsReady: documents?.length ?? 0,
      totalSpent, // ✅ already filtered above
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
    setLoading(false)
  }

  fetchData()
}, [user])

  if (loading) return <div className="p-4">Loading...</div>

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

      {/* Upcoming Tasks */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Clock className="h-5 w-5 text-primary-500" />
            <span>Upcoming Tasks</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {upcomingTasks.map((task, i) => (
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
          ))}
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
          {recentActivity.map((event, i) => (
            <div key={i} className="flex flex-col space-y-1 p-3 bg-gray-50 rounded-lg">
              <p className="text-sm font-medium">{event.title}</p>
              <p className="text-xs text-gray-500">{event.date}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
