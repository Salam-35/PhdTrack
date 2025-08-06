"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { useUser } from "@/components/UserProvider"
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
  user_id: string
}

interface Document {
  id: string
  name: string
  type: string
  note?: string
  file_url: string
  created_at: string
  user_id: string
}

export default function DocumentsPage() {
  // Fixed: Get user from context properly
  const { user, loading: userLoading } = useUser()
  const [universities, setUniversities] = useState<University[]>([])
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)

  const fetchData = async () => {
    // Fixed: Check user properly
    if (!user?.id) {
      console.warn("User ID is missing, skipping fetch.")
      return
    }

    setLoading(true)

    try {
      // Fixed: Use user_id instead of added_by
      const [universityResponse, documentResponse] = await Promise.all([
        supabase.from("universities").select("*").eq("user_id", user.id),
        supabase.from("documents").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
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
  }, [user?.id]) // Fixed: Updated dependency

  // Fixed: Handle loading states
  if (userLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  // Fixed: Handle no user state
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="max-w-7xl mx-auto p-6 space-y-8">
          <div className="text-center">
            <GraduationCap className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h1 className="text-4xl font-bold text-gray-900">Documents Center</h1>
            <p className="text-lg text-gray-600">Please login to manage your documents</p>
          </div>
        </div>
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