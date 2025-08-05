"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Edit, Trash2, DollarSign, Calendar, FileText, Users } from "lucide-react"

interface University {
  id: string
  name: string
  program: string
  applicationFee: number
  greRequired: boolean
  greScore?: string
  sopLength: number
  deadline: string
  status: "not-started" | "in-progress" | "submitted" | "accepted" | "rejected"
  requirements: string[]
  notes: string
}

interface ApplicationListProps {
  universities: University[]
  setUniversities: (universities: University[]) => void
}

export default function ApplicationList({ universities, setUniversities }: ApplicationListProps) {
  const getStatusColor = (status: University["status"]) => {
    switch (status) {
      case "not-started":
        return "secondary"
      case "in-progress":
        return "default"
      case "submitted":
        return "outline"
      case "accepted":
        return "default"
      case "rejected":
        return "destructive"
      default:
        return "secondary"
    }
  }

  const getProgress = (status: University["status"]) => {
    switch (status) {
      case "not-started":
        return 0
      case "in-progress":
        return 60
      case "submitted":
        return 100
      case "accepted":
        return 100
      case "rejected":
        return 100
      default:
        return 0
    }
  }

  const updateStatus = (id: string, newStatus: University["status"]) => {
    setUniversities(universities.map((uni) => (uni.id === id ? { ...uni, status: newStatus } : uni)))
  }

  const deleteUniversity = (id: string) => {
    setUniversities(universities.filter((uni) => uni.id !== id))
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {universities.map((university) => (
        <Card key={university.id} className="relative">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-lg">{university.name}</CardTitle>
                <p className="text-sm text-muted-foreground">{university.program}</p>
              </div>
              <div className="flex gap-1">
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Edit className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => deleteUniversity(university.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Badge variant={getStatusColor(university.status)}>{university.status.replace("-", " ")}</Badge>
              <select
                value={university.status}
                onChange={(e) => updateStatus(university.id, e.target.value as University["status"])}
                className="text-xs border rounded px-2 py-1"
              >
                <option value="not-started">Not Started</option>
                <option value="in-progress">In Progress</option>
                <option value="submitted">Submitted</option>
                <option value="accepted">Accepted</option>
                <option value="rejected">Rejected</option>
              </select>
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
                <span>${university.applicationFee}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>{new Date(university.deadline).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <span>{university.sopLength} pages</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span>{university.greRequired ? "GRE Required" : "No GRE"}</span>
              </div>
            </div>

            {university.greScore && (
              <div className="text-sm">
                <span className="font-medium">GRE: </span>
                <span className="text-muted-foreground">{university.greScore}</span>
              </div>
            )}

            <div className="space-y-2">
              <div className="text-sm font-medium">Requirements:</div>
              <div className="flex flex-wrap gap-1">
                {university.requirements.map((req, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {req}
                  </Badge>
                ))}
              </div>
            </div>

            {university.notes && (
              <div className="text-sm">
                <span className="font-medium">Notes: </span>
                <span className="text-muted-foreground">{university.notes}</span>
              </div>
            )}

            <div className="text-xs text-muted-foreground">
              {Math.ceil((new Date(university.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days
              until deadline
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
