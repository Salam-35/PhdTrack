// "use client"

// import { useState } from "react"
// import { Card, CardContent, CardHeader } from "@/components/ui/card"
// import { Badge } from "@/components/ui/badge"
// import { Button } from "@/components/ui/button"
// import { Progress } from "@/components/ui/progress"
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
// import {
//   FileText,
//   Upload,
//   Download,
//   Edit,
//   Eye,
//   Clock,
//   CheckCircle,
//   Plus,
//   Search,
//   Calendar,
//   User,
//   School,
//   Award,
//   BookOpen,
//   Mail,
// } from "lucide-react"

// interface Document {
//   id: string
//   name: string
//   type: "sop" | "personal-statement" | "research-statement" | "cv" | "transcript" | "lor" | "writing-sample" | "other"
//   university?: string
//   status: "not-started" | "draft" | "review" | "final" | "submitted"
//   version: number
//   wordCount?: number
//   wordLimit?: number
//   lastModified: string
//   deadline?: string
//   notes: string
//   sharedWith: string[]
//   feedback: Array<{
//     from: string
//     date: string
//     comment: string
//     resolved: boolean
//   }>
// }

// export default function Documents() {
//   const [activeTab, setActiveTab] = useState("all")
//   const [searchQuery, setSearchQuery] = useState("")

//   const documents: Document[] = [
//     {
//       id: "1",
//       name: "Statement of Purpose - Stanford",
//       type: "sop",
//       university: "Stanford University",
//       status: "final",
//       version: 3,
//       wordCount: 987,
//       wordLimit: 1000,
//       lastModified: "2024-12-05",
//       deadline: "2024-12-15",
//       notes: "Focused on AI safety research. Mentioned Dr. Chen's work.",
//       sharedWith: ["advisor@university.edu", "mentor@company.com"],
//       feedback: [
//         {
//           from: "Dr. Johnson (Advisor)",
//           date: "2024-12-03",
//           comment: "Great improvement on the research motivation section. Consider adding more specific examples.",
//           resolved: true,
//         },
//         {
//           from: "Sarah (Mentor)",
//           date: "2024-12-04",
//           comment: "The conclusion could be stronger. Maybe tie back to your long-term goals.",
//           resolved: false,
//         },
//       ],
//     },
//     {
//       id: "2",
//       name: "Research Statement - MIT",
//       type: "research-statement",
//       university: "MIT",
//       status: "review",
//       version: 2,
//       wordCount: 456,
//       wordLimit: 500,
//       lastModified: "2024-12-04",
//       deadline: "2024-12-01",
//       notes: "Robotics focus. Need to add more technical details.",
//       sharedWith: ["advisor@university.edu"],
//       feedback: [
//         {
//           from: "Dr. Johnson (Advisor)",
//           date: "2024-12-04",
//           comment: "Add more details about your computer vision experience.",
//           resolved: false,
//         },
//       ],
//     },
//     {
//       id: "3",
//       name: "Personal Statement - Berkeley",
//       type: "personal-statement",
//       university: "UC Berkeley",
//       status: "draft",
//       version: 1,
//       wordCount: 1150,
//       wordLimit: 1200,
//       lastModified: "2024-12-02",
//       deadline: "2024-12-10",
//       notes: "Statistics program. Emphasize quantitative background.",
//       sharedWith: [],
//       feedback: [],
//     },
//     {
//       id: "4",
//       name: "Academic CV",
//       type: "cv",
//       status: "final",
//       version: 5,
//       lastModified: "2024-11-28",
//       notes: "Updated with recent publications and conference presentations.",
//       sharedWith: ["career@university.edu"],
//       feedback: [
//         {
//           from: "Career Services",
//           date: "2024-11-25",
//           comment: "Consider adding more details about your teaching experience.",
//           resolved: true,
//         },
//       ],
//     },
//     {
//       id: "5",
//       name: "Undergraduate Transcript",
//       type: "transcript",
//       status: "submitted",
//       version: 1,
//       lastModified: "2024-11-20",
//       notes: "Official transcript from registrar. GPA: 3.9/4.0",
//       sharedWith: [],
//       feedback: [],
//     },
//   ]

//   const getStatusColor = (status: Document["status"]) => {
//     switch (status) {
//       case "not-started":
//         return "bg-gray-500"
//       case "draft":
//         return "bg-blue-500"
//       case "review":
//         return "bg-yellow-500"
//       case "final":
//         return "bg-green-500"
//       case "submitted":
//         return "bg-purple-500"
//       default:
//         return "bg-gray-500"
//     }
//   }

//   const getTypeIcon = (type: Document["type"]) => {
//     switch (type) {
//       case "sop":
//         return <BookOpen className="h-4 w-4" />
//       case "personal-statement":
//         return <User className="h-4 w-4" />
//       case "research-statement":
//         return <Award className="h-4 w-4" />
//       case "cv":
//         return <FileText className="h-4 w-4" />
//       case "transcript":
//         return <School className="h-4 w-4" />
//       case "lor":
//         return <Mail className="h-4 w-4" />
//       default:
//         return <FileText className="h-4 w-4" />
//     }
//   }

//   const getTypeColor = (type: Document["type"]) => {
//     switch (type) {
//       case "sop":
//         return "text-blue-500"
//       case "personal-statement":
//         return "text-green-500"
//       case "research-statement":
//         return "text-purple-500"
//       case "cv":
//         return "text-orange-500"
//       case "transcript":
//         return "text-red-500"
//       case "lor":
//         return "text-pink-500"
//       default:
//         return "text-gray-500"
//     }
//   }

//   const getDaysUntilDeadline = (deadline?: string) => {
//     if (!deadline) return null
//     const days = Math.ceil((new Date(deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
//     return days
//   }

//   const filteredDocuments = documents.filter((doc) => {
//     const matchesSearch =
//       doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
//       doc.university?.toLowerCase().includes(searchQuery.toLowerCase()) ||
//       doc.type.toLowerCase().includes(searchQuery.toLowerCase())

//     if (activeTab === "all") return matchesSearch
//     if (activeTab === "pending") return matchesSearch && ["not-started", "draft", "review"].includes(doc.status)
//     if (activeTab === "deadlines") return matchesSearch && doc.deadline && getDaysUntilDeadline(doc.deadline)! <= 7
//     return matchesSearch && doc.type === activeTab
//   })

//   const documentStats = {
//     total: documents.length,
//     completed: documents.filter((doc) => ["final", "submitted"].includes(doc.status)).length,
//     pending: documents.filter((doc) => ["not-started", "draft", "review"].includes(doc.status)).length,
//     overdue: documents.filter((doc) => doc.deadline && getDaysUntilDeadline(doc.deadline)! < 0).length,
//   }

//   return (
//     <div className="p-4 space-y-6">
//       {/* Header */}
//       <div className="flex items-center justify-between">
//         <div>
//           <h2 className="text-2xl font-bold">Document Manager</h2>
//           <p className="text-gray-600">Organize and track your application documents</p>
//         </div>
//         <Button className="bg-primary-500 hover:bg-primary-600">
//           <Plus className="h-4 w-4 mr-2" />
//           Add Document
//         </Button>
//       </div>

//       {/* Stats Cards */}
//       <div className="grid grid-cols-2 gap-4">
//         <Card>
//           <CardContent className="p-4">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-sm text-gray-600">Total Documents</p>
//                 <p className="text-2xl font-bold">{documentStats.total}</p>
//               </div>
//               <FileText className="h-8 w-8 text-primary-500" />
//             </div>
//           </CardContent>
//         </Card>
//         <Card>
//           <CardContent className="p-4">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-sm text-gray-600">Completed</p>
//                 <p className="text-2xl font-bold">{documentStats.completed}</p>
//               </div>
//               <CheckCircle className="h-8 w-8 text-green-500" />
//             </div>
//           </CardContent>
//         </Card>
//       </div>

//       {/* Search Bar */}
//       <div className="relative">
//         <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
//         <input
//           type="text"
//           placeholder="Search documents..."
//           value={searchQuery}
//           onChange={(e) => setSearchQuery(e.target.value)}
//           className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
//         />
//       </div>

//       {/* Tabs */}
//       <Tabs value={activeTab} onValueChange={setActiveTab}>
//         <TabsList className="grid w-full grid-cols-4">
//           <TabsTrigger value="all">All</TabsTrigger>
//           <TabsTrigger value="pending">Pending</TabsTrigger>
//           <TabsTrigger value="sop">SOPs</TabsTrigger>
//           <TabsTrigger value="deadlines">Deadlines</TabsTrigger>
//         </TabsList>

//         <TabsContent value={activeTab} className="space-y-4 mt-6">
//           {filteredDocuments.map((doc) => (
//             <Card key={doc.id} className="overflow-hidden">
//               <CardHeader className="pb-3">
//                 <div className="flex items-start justify-between">
//                   <div className="flex-1">
//                     <div className="flex items-center space-x-2 mb-1">
//                       <div className={getTypeColor(doc.type)}>{getTypeIcon(doc.type)}</div>
//                       <h3 className="font-bold text-lg">{doc.name}</h3>
//                       <Badge className={`${getStatusColor(doc.status)} text-white`}>
//                         {doc.status.replace("-", " ")}
//                       </Badge>
//                     </div>
//                     {doc.university && <p className="text-sm text-gray-600">{doc.university}</p>}
//                     <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
//                       <span>Version {doc.version}</span>
//                       <span>Modified {new Date(doc.lastModified).toLocaleDateString()}</span>
//                     </div>
//                   </div>
//                   <div className="flex space-x-1">
//                     <Button variant="ghost" size="icon" className="h-8 w-8">
//                       <Eye className="h-4 w-4" />
//                     </Button>
//                     <Button variant="ghost" size="icon" className="h-8 w-8">
//                       <Edit className="h-4 w-4" />
//                     </Button>
//                     <Button variant="ghost" size="icon" className="h-8 w-8">
//                       <Download className="h-4 w-4" />
//                     </Button>
//                   </div>
//                 </div>
//               </CardHeader>

//               <CardContent className="space-y-4">
//                 {/* Word Count Progress */}
//                 {doc.wordCount && doc.wordLimit && (
//                   <div className="space-y-2">
//                     <div className="flex justify-between text-sm">
//                       <span>Word Count</span>
//                       <span>
//                         {doc.wordCount}/{doc.wordLimit}
//                       </span>
//                     </div>
//                     <Progress value={(doc.wordCount / doc.wordLimit) * 100} className="h-2" />
//                   </div>
//                 )}

//                 {/* Deadline Warning */}
//                 {doc.deadline && (
//                   <div
//                     className={`flex items-center justify-between p-3 rounded-lg ${
//                       getDaysUntilDeadline(doc.deadline)! <= 3
//                         ? "bg-red-50"
//                         : getDaysUntilDeadline(doc.deadline)! <= 7
//                           ? "bg-yellow-50"
//                           : "bg-blue-50"
//                     }`}
//                   >
//                     <div className="flex items-center space-x-2">
//                       <Calendar className="h-4 w-4" />
//                       <span className="text-sm font-medium">Deadline</span>
//                     </div>
//                     <span
//                       className={`text-sm font-medium ${
//                         getDaysUntilDeadline(doc.deadline)! <= 3
//                           ? "text-red-600"
//                           : getDaysUntilDeadline(doc.deadline)! <= 7
//                             ? "text-yellow-600"
//                             : "text-blue-600"
//                       }`}
//                     >
//                       {getDaysUntilDeadline(doc.deadline)! > 0
//                         ? `${getDaysUntilDeadline(doc.deadline)} days left`
//                         : "Overdue"}
//                     </span>
//                   </div>
//                 )}

//                 {/* Shared With */}
//                 {doc.sharedWith.length > 0 && (
//                   <div className="bg-gray-50 rounded-lg p-3">
//                     <p className="text-sm font-medium mb-2">Shared with:</p>
//                     <div className="space-y-1">
//                       {doc.sharedWith.map((email, index) => (
//                         <div key={index} className="flex items-center space-x-2 text-sm">
//                           <User className="h-3 w-3 text-gray-400" />
//                           <span>{email}</span>
//                         </div>
//                       ))}
//                     </div>
//                   </div>
//                 )}

//                 {/* Feedback */}
//                 {doc.feedback.length > 0 && (
//                   <div className="space-y-3">
//                     <p className="text-sm font-medium">Recent Feedback:</p>
//                     {doc.feedback.slice(0, 2).map((feedback, index) => (
//                       <div
//                         key={index}
//                         className={`p-3 rounded-lg border-l-4 ${
//                           feedback.resolved ? "border-green-500 bg-green-50" : "border-yellow-500 bg-yellow-50"
//                         }`}
//                       >
//                         <div className="flex items-center justify-between mb-1">
//                           <span className="text-sm font-medium">{feedback.from}</span>
//                           <div className="flex items-center space-x-2">
//                             <span className="text-xs text-gray-500">
//                               {new Date(feedback.date).toLocaleDateString()}
//                             </span>
//                             {feedback.resolved ? (
//                               <CheckCircle className="h-4 w-4 text-green-500" />
//                             ) : (
//                               <Clock className="h-4 w-4 text-yellow-500" />
//                             )}
//                           </div>
//                         </div>
//                         <p className="text-sm text-gray-700">{feedback.comment}</p>
//                       </div>
//                     ))}
//                     {doc.feedback.length > 2 && (
//                       <Button variant="outline" size="sm" className="w-full bg-transparent">
//                         View all {doc.feedback.length} comments
//                       </Button>
//                     )}
//                   </div>
//                 )}

//                 {/* Notes */}
//                 {doc.notes && (
//                   <div className="bg-blue-50 rounded-lg p-3">
//                     <p className="text-sm font-medium mb-1">Notes:</p>
//                     <p className="text-sm text-gray-700">{doc.notes}</p>
//                   </div>
//                 )}

//                 {/* Action Buttons */}
//                 <div className="flex space-x-2 pt-2">
//                   <Button size="sm" className="flex-1 bg-primary-500 hover:bg-primary-600">
//                     <Edit className="h-4 w-4 mr-1" />
//                     Edit
//                   </Button>
//                   <Button size="sm" variant="outline" className="flex-1 bg-transparent">
//                     <Upload className="h-4 w-4 mr-1" />
//                     Upload
//                   </Button>
//                   <Button size="sm" variant="outline">
//                     <Eye className="h-4 w-4" />
//                   </Button>
//                 </div>
//               </CardContent>
//             </Card>
//           ))}
//         </TabsContent>
//       </Tabs>
//     </div>
//   )
// }


"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { useUser } from "@/context/UserProvider"
import DocumentUploadForm from "@/components/forms/document-upload-form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { 
  Download, 
  Trash, 
  FileText, 
  Calendar, 
  User, 
  Eye,
  CheckCircle2,
  XCircle,
  AlertCircle,
  GraduationCap,
  Upload as UploadIcon
} from "lucide-react"

interface University {
  id: string
  name: string
  sop_required: boolean
  cv_required: boolean
  lor_required: boolean
  transcript_required: boolean
  added_by: string
}

interface Document {
  id: string
  name: string
  type: string
  note?: string
  file_url: string
  created_at: string
  added_by: string
}

export default function DocumentsPage() {
  const user = useUser()
  const [universities, setUniversities] = useState<University[]>([])
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)

  const fetchData = async () => {
    if (!user?.id) {
      console.warn("User ID is missing, skipping fetch.")
      return
    }

    setLoading(true)

    try {
      const [universityResponse, documentResponse] = await Promise.all([
        supabase.from("universities").select("*").eq("added_by", user.id),
        supabase.from("documents").select("*").eq("added_by", user.id).order("created_at", { ascending: false }),
      ])

      if (universityResponse.error) {
        console.error("University fetch error:", universityResponse.error)
      }
      if (documentResponse.error) {
        console.error("Document fetch error:", documentResponse.error)
      }

      setUniversities(universityResponse.data ?? [])
      setDocuments(documentResponse.data ?? [])
    } catch (error) {
      console.error("Fetch error:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (docId: string, fileUrl: string) => {
    try {
      const path = new URL(fileUrl).pathname.split("/documents/")[1]
      await supabase.storage.from("documents").remove([path])
      await supabase.from("documents").delete().eq("id", docId)
      fetchData()
    } catch (error) {
      console.error("Delete error:", error)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getDocumentTypeInfo = (type: string) => {
    const types: Record<string, { label: string; color: string; icon: string }> = {
      'sop': { label: 'Statement of Purpose', color: 'bg-blue-100 text-blue-800 border-blue-200', icon: '📝' },
      'personal-statement': { label: 'Personal Statement', color: 'bg-purple-100 text-purple-800 border-purple-200', icon: '📄' },
      'research-statement': { label: 'Research Statement', color: 'bg-indigo-100 text-indigo-800 border-indigo-200', icon: '🔬' },
      'cv': { label: 'CV/Resume', color: 'bg-green-100 text-green-800 border-green-200', icon: '👤' },
      'transcript': { label: 'Transcript', color: 'bg-orange-100 text-orange-800 border-orange-200', icon: '📜' },
      'lor': { label: 'Letter of Recommendation', color: 'bg-pink-100 text-pink-800 border-pink-200', icon: '✉️' },
      'writing-sample': { label: 'Writing Sample', color: 'bg-teal-100 text-teal-800 border-teal-200', icon: '✍️' },
      'other': { label: 'Other', color: 'bg-gray-100 text-gray-800 border-gray-200', icon: '📁' }
    }
    return types[type] || types.other
  }

  const getRequirementStatus = (required: boolean, hasDocument: boolean) => {
    if (!required) {
      return { 
        icon: <CheckCircle2 className="w-4 h-4 text-gray-400" />, 
        text: "Not Required", 
        color: "text-gray-500" 
      }
    }
    if (hasDocument) {
      return { 
        icon: <CheckCircle2 className="w-4 h-4 text-green-600" />, 
        text: "Completed", 
        color: "text-green-600" 
      }
    }
    return { 
      icon: <AlertCircle className="w-4 h-4 text-orange-500" />, 
      text: "Required", 
      color: "text-orange-500" 
    }
  }

  useEffect(() => {
    if (user?.id) {
      fetchData()
    }
  }, [user])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-gray-900">Documents Center</h1>
          <p className="text-lg text-gray-600">Manage your application documents and track requirements</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-l-4 border-l-blue-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Documents</p>
                  <p className="text-3xl font-bold text-gray-900">{documents.length}</p>
                </div>
                <FileText className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-l-4 border-l-green-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Universities</p>
                  <p className="text-3xl font-bold text-gray-900">{universities.length}</p>
                </div>
                <GraduationCap className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-l-4 border-l-purple-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Document Types</p>
                  <p className="text-3xl font-bold text-gray-900">{new Set(documents.map(d => d.type)).size}</p>
                </div>
                <UploadIcon className="w-8 h-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* University Requirements Section */}
        <Card className="shadow-lg">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
            <CardTitle className="flex items-center text-xl">
              <GraduationCap className="w-6 h-6 mr-3 text-blue-600" />
              Document Requirements by University
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {universities.length === 0 ? (
              <div className="text-center py-8">
                <GraduationCap className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">No universities added yet</p>
                <p className="text-gray-400 text-sm">Add universities to track document requirements</p>
              </div>
            ) : (
              <div className="grid gap-6">
                {universities.map((university) => {
                  const sopDoc = documents.find(d => d.type === 'sop')
                  const cvDoc = documents.find(d => d.type === 'cv')
                  const lorDoc = documents.find(d => d.type === 'lor')
                  const transcriptDoc = documents.find(d => d.type === 'transcript')
                  
                  return (
                    <Card key={university.id} className="border border-gray-200 hover:shadow-md transition-shadow">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg font-semibold text-gray-800">
                          {university.name}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          {[
                            { type: 'SOP', required: university.sop_required, hasDoc: !!sopDoc },
                            { type: 'CV', required: university.cv_required, hasDoc: !!cvDoc },
                            { type: 'LOR', required: university.lor_required, hasDoc: !!lorDoc },
                            { type: 'Transcript', required: university.transcript_required, hasDoc: !!transcriptDoc }
                          ].map(({ type, required, hasDoc }) => {
                            const status = getRequirementStatus(required, hasDoc)
                            return (
                              <div key={type} className="flex items-center space-x-2">
                                {status.icon}
                                <span className="text-sm font-medium">{type}:</span>
                                <span className={`text-sm ${status.color}`}>{status.text}</span>
                              </div>
                            )
                          })}
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>

        <Separator className="my-8" />

        {/* Upload Section */}
        <div className="space-y-6">
          <DocumentUploadForm onUpload={fetchData} />
        </div>

        {/* Uploaded Documents Section */}
        <Card className="shadow-lg">
          <CardHeader className="bg-gradient-to-r from-slate-50 to-gray-50 border-b">
            <CardTitle className="flex items-center justify-between text-xl">
              <div className="flex items-center">
                <FileText className="w-6 h-6 mr-3 text-slate-600" />
                Uploaded Documents
                {documents.length > 0 && (
                  <Badge variant="secondary" className="ml-3">
                    {documents.length}
                  </Badge>
                )}
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {documents.length === 0 ? (
              <div className="text-center py-12">
                <div className="bg-gray-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                  <FileText className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No documents uploaded yet</h3>
                <p className="text-gray-600 mb-4">Upload your first document to get started</p>
              </div>
            ) : (
              <div className="space-y-4">
                {documents.map((doc) => {
                  const typeInfo = getDocumentTypeInfo(doc.type)
                  return (
                    <Card key={doc.id} className="border border-gray-200 hover:shadow-md transition-all duration-200">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-3 mb-3">
                              <div className="text-2xl">{typeInfo.icon}</div>
                              <div className="flex-1">
                                <h3 className="text-lg font-semibold text-gray-900 truncate">
                                  {doc.name}
                                </h3>
                                <Badge className={`${typeInfo.color} border text-xs font-medium`}>
                                  {typeInfo.label}
                                </Badge>
                              </div>
                            </div>
                            
                            {doc.note && (
                              <div className="mb-3 p-3 bg-blue-50 rounded-lg border-l-4 border-blue-200">
                                <p className="text-sm text-blue-800">
                                  <span className="font-medium">Note:</span> {doc.note}
                                </p>
                              </div>
                            )}
                            
                            <div className="flex items-center space-x-6 text-sm text-gray-500">
                              <span className="flex items-center">
                                <Calendar className="w-4 h-4 mr-1" />
                                {formatDate(doc.created_at)}
                              </span>
                              <span className="flex items-center">
                                <User className="w-4 h-4 mr-1" />
                                Added by you
                              </span>
                            </div>
                          </div>
                          
                          <div className="ml-6 flex flex-col space-y-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => window.open(doc.file_url, '_blank')}
                              className="text-blue-600 border-blue-600 hover:bg-blue-50"
                            >
                              <Eye className="w-4 h-4 mr-2" />
                              View
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              asChild
                            >
                              <a href={doc.file_url} download target="_blank" rel="noreferrer">
                                <Download className="w-4 h-4 mr-2" />
                                Download
                              </a>
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDelete(doc.id, doc.file_url)}
                            >
                              <Trash className="w-4 h-4 mr-2" />
                              Delete
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}