"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import {
  BarChart3,
  TrendingUp,
  Target,
  Clock,
  Award,
  Users,
  FileText,
  Calendar,
  CheckCircle,
  AlertTriangle,
} from "lucide-react"

export default function Analytics() {
  const applicationStats = {
    total: 12,
    submitted: 5,
    inProgress: 4,
    notStarted: 3,
    accepted: 1,
    rejected: 0,
    pending: 4,
  }

  const professorStats = {
    total: 15,
    contacted: 8,
    replied: 5,
    meetingsScheduled: 3,
    responseRate: 62.5,
  }

  const documentStats = {
    total: 25,
    completed: 18,
    inProgress: 5,
    notStarted: 2,
    completionRate: 72,
  }

  const timelineStats = {
    upcomingDeadlines: 6,
    overdueItems: 2,
    completedTasks: 23,
    averageResponseTime: "3.2 days",
  }

  const universityRankings = [
    { name: "Stanford", rank: 1, status: "in-progress", fit: 95 },
    { name: "MIT", rank: 2, status: "submitted", fit: 90 },
    { name: "Berkeley", rank: 3, status: "interview", fit: 88 },
    { name: "Harvard", rank: 4, status: "submitted", fit: 85 },
    { name: "CMU", rank: 5, status: "in-progress", fit: 82 },
  ]

  const monthlyProgress = [
    { month: "Sep", applications: 2, professors: 3, documents: 5 },
    { month: "Oct", applications: 4, professors: 5, documents: 8 },
    { month: "Nov", applications: 3, professors: 2, documents: 7 },
    { month: "Dec", applications: 3, professors: 3, documents: 5 },
  ]

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold">Analytics Dashboard</h2>
        <p className="text-gray-600">Track your PhD application progress and insights</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Success Rate</p>
                <p className="text-2xl font-bold">83%</p>
                <p className="text-xs text-green-600">↑ 12% from last month</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg Response Time</p>
                <p className="text-2xl font-bold">3.2d</p>
                <p className="text-xs text-blue-600">Professor emails</p>
              </div>
              <Clock className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Application Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BarChart3 className="h-5 w-5 text-primary-500" />
            <span>Application Progress</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="bg-green-50 rounded-lg p-3">
              <div className="text-2xl font-bold text-green-600">{applicationStats.submitted}</div>
              <div className="text-sm text-gray-600">Submitted</div>
            </div>
            <div className="bg-blue-50 rounded-lg p-3">
              <div className="text-2xl font-bold text-blue-600">{applicationStats.inProgress}</div>
              <div className="text-sm text-gray-600">In Progress</div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Overall Progress</span>
              <span>{Math.round((applicationStats.submitted / applicationStats.total) * 100)}%</span>
            </div>
            <Progress value={(applicationStats.submitted / applicationStats.total) * 100} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Professor Engagement */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5 text-primary-500" />
            <span>Professor Engagement</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-3 text-center">
            <div>
              <div className="text-xl font-bold text-blue-600">{professorStats.contacted}</div>
              <div className="text-xs text-gray-600">Contacted</div>
            </div>
            <div>
              <div className="text-xl font-bold text-green-600">{professorStats.replied}</div>
              <div className="text-xs text-gray-600">Replied</div>
            </div>
            <div>
              <div className="text-xl font-bold text-purple-600">{professorStats.meetingsScheduled}</div>
              <div className="text-xs text-gray-600">Meetings</div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Response Rate</span>
              <span className="text-lg font-bold text-green-600">{professorStats.responseRate}%</span>
            </div>
            <Progress value={professorStats.responseRate} className="h-2 mt-2" />
          </div>
        </CardContent>
      </Card>

      {/* University Rankings & Fit */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Award className="h-5 w-5 text-primary-500" />
            <span>University Analysis</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {universityRankings.map((uni, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                    {uni.rank}
                  </div>
                  <div>
                    <div className="font-medium">{uni.name}</div>
                    <Badge variant="outline" className="text-xs">
                      {uni.status.replace("-", " ")}
                    </Badge>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium">Fit: {uni.fit}%</div>
                  <div className="w-16 mt-1">
                    <Progress value={uni.fit} className="h-1" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Document Completion */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5 text-primary-500" />
            <span>Document Status</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="bg-green-50 rounded-lg p-3">
              <div className="text-xl font-bold text-green-600">{documentStats.completed}</div>
              <div className="text-xs text-gray-600">Completed</div>
            </div>
            <div className="bg-yellow-50 rounded-lg p-3">
              <div className="text-xl font-bold text-yellow-600">{documentStats.inProgress}</div>
              <div className="text-xs text-gray-600">In Progress</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="text-xl font-bold text-gray-600">{documentStats.notStarted}</div>
              <div className="text-xs text-gray-600">Not Started</div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Completion Rate</span>
              <span>{documentStats.completionRate}%</span>
            </div>
            <Progress value={documentStats.completionRate} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Timeline Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-primary-500" />
            <span>Timeline Insights</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-blue-500" />
                  <span className="text-sm">Upcoming Deadlines</span>
                </div>
                <span className="font-bold">{timelineStats.upcomingDeadlines}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                  <span className="text-sm">Overdue Items</span>
                </div>
                <span className="font-bold text-red-600">{timelineStats.overdueItems}</span>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Completed Tasks</span>
                </div>
                <span className="font-bold">{timelineStats.completedTasks}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Target className="h-4 w-4 text-purple-500" />
                  <span className="text-sm">Avg Response Time</span>
                </div>
                <span className="font-bold">{timelineStats.averageResponseTime}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Monthly Progress Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5 text-primary-500" />
            <span>Monthly Progress</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {monthlyProgress.map((month, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-medium">{month.month} 2024</span>
                  <span className="text-sm text-gray-600">
                    {month.applications + month.professors + month.documents} total activities
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-blue-100 rounded p-2 text-center">
                    <div className="text-sm font-bold text-blue-600">{month.applications}</div>
                    <div className="text-xs text-blue-500">Apps</div>
                  </div>
                  <div className="bg-green-100 rounded p-2 text-center">
                    <div className="text-sm font-bold text-green-600">{month.professors}</div>
                    <div className="text-xs text-green-500">Profs</div>
                  </div>
                  <div className="bg-purple-100 rounded p-2 text-center">
                    <div className="text-sm font-bold text-purple-600">{month.documents}</div>
                    <div className="text-xs text-purple-500">Docs</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Target className="h-5 w-5 text-primary-500" />
            <span>Recommendations</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
              <CheckCircle className="h-5 w-5 text-blue-500 mt-0.5" />
              <div>
                <p className="font-medium text-blue-900">Focus on High-Fit Universities</p>
                <p className="text-sm text-blue-700">
                  Your top 3 universities have 90%+ research fit. Prioritize these applications.
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3 p-3 bg-yellow-50 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5" />
              <div>
                <p className="font-medium text-yellow-900">Follow Up Needed</p>
                <p className="text-sm text-yellow-700">
                  3 professors haven't responded in over a week. Consider sending follow-up emails.
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg">
              <TrendingUp className="h-5 w-5 text-green-500 mt-0.5" />
              <div>
                <p className="font-medium text-green-900">Great Progress!</p>
                <p className="text-sm text-green-700">
                  You're ahead of schedule with 42% of applications submitted already.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
