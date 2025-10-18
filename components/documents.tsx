"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { useUser } from "@/components/UserProvider"
import DocumentUploadForm from "@/components/forms/document-upload-form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Download,
  Trash,
  FileText,
  Calendar,
  User,
  Eye,
  GraduationCap,
  Upload as UploadIcon
} from "lucide-react"
import CourseEvaluator from "@/components/course-evaluator"
import CourseEvaluationDB from "@/components/course-evaluation-db"

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

interface DocumentsPageProps {
  universities: University[]
  documents: Document[]
  setUniversities: (universities: University[]) => void
  setDocuments: (documents: Document[]) => void
  searchQuery: string
}

export default function DocumentsPage({
  universities: propUniversities,
  documents: propDocuments,
  setUniversities: setPropUniversities,
  setDocuments: setPropDocuments,
  searchQuery
}: DocumentsPageProps) {
  // Fixed: Get user from context properly
  const { user, loading: userLoading } = useUser()
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

      setPropUniversities(universityResponse.data ?? [])
      setPropDocuments(documentResponse.data ?? [])
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

  useEffect(() => {
    if (user?.id) {
      fetchData()
    }
  }, [user?.id]) // Fixed: Updated dependency

  // Fixed: Handle loading states
  if (userLoading || loading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center transition-colors">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    )
  }

  // Fixed: Handle no user state
  if (!user) {
    return (
      <div className="min-h-screen bg-background text-foreground transition-colors">
        <div className="max-w-7xl mx-auto p-6 space-y-8">
          <div className="text-center space-y-2">
            <GraduationCap className="h-16 w-16 text-muted-foreground mx-auto mb-2" />
            <h1 className="text-4xl font-bold">Documents Center</h1>
            <p className="text-lg text-muted-foreground">Please login to manage your documents</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-foreground">Documents Center</h1>
          <p className="text-lg text-muted-foreground">Manage your application documents and track requirements</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-l-4 border-l-blue-500 bg-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Documents</p>
                  <p className="text-3xl font-bold text-foreground">{propDocuments.length}</p>
                </div>
                <FileText className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-l-4 border-l-green-500 bg-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Universities</p>
                  <p className="text-3xl font-bold text-foreground">{propUniversities.length}</p>
                </div>
                <GraduationCap className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-l-4 border-l-purple-500 bg-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Document Types</p>
                  <p className="text-3xl font-bold text-foreground">{new Set(propDocuments.map(d => d.type)).size}</p>
                </div>
                <UploadIcon className="w-8 h-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="border-t border-border" />

        {/* Upload Section */}
        <div className="space-y-6">
          <DocumentUploadForm onUpload={fetchData} />
        </div>

        {/* Course-wise Evaluation */}
        <CourseEvaluator />

        {/* Saved Evaluations (Database) */}
        <CourseEvaluationDB />

        {/* Uploaded Documents Section */}
        <Card className="shadow-sm bg-card">
          <CardHeader className="border-b border-border bg-card">
            <CardTitle className="flex items-center justify-between text-xl text-foreground">
              <div className="flex items-center">
                <FileText className="w-6 h-6 mr-3 text-muted-foreground" />
                Uploaded Documents
                {propDocuments.length > 0 && (
                  <Badge variant="secondary" className="ml-3">
                    {propDocuments.length}
                  </Badge>
                )}
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {propDocuments.length === 0 ? (
              <div className="text-center py-12">
                <div className="border border-border/60 bg-muted/60 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                  <FileText className="w-10 h-10 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium text-foreground mb-2">No documents uploaded yet</h3>
                <p className="text-muted-foreground mb-4">Upload your first document to get started</p>
              </div>
            ) : (
              <div className="space-y-4">
                {propDocuments.map((doc) => {
                  const typeInfo = getDocumentTypeInfo(doc.type)
                  return (
                    <Card key={doc.id} className="border border-border hover:shadow-md transition-all duration-200">
                      <CardContent className="p-4 sm:p-6">
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-3 mb-3">
                              <div className="text-2xl">{typeInfo.icon}</div>
                              <div className="flex-1">
                                <h3 className="text-lg font-semibold text-foreground truncate">
                                  {doc.name}
                                </h3>
                                <Badge className={`${typeInfo.color} border text-xs font-medium`}>
                                  {typeInfo.label}
                                </Badge>
                              </div>
                            </div>
                            
                            {doc.note && (
                              <div className="mb-3 p-3 rounded-lg border-l-4 border-primary/40 bg-primary/10">
                                <p className="text-sm text-foreground">
                                  <span className="font-medium">Note:</span> {doc.note}
                                </p>
                              </div>
                            )}
                            
                            <div className="flex flex-wrap items-center gap-x-6 gap-y-1 text-sm text-muted-foreground">
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
                          
                          <div className="sm:ml-6 mt-2 sm:mt-0 flex flex-wrap gap-2 sm:flex-col sm:gap-0 sm:space-y-2 w-full sm:w-auto">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => window.open(doc.file_url, '_blank')}
                              className="w-full sm:w-auto border-primary text-primary hover:bg-primary/10 dark:hover:bg-primary/20"
                            >
                              <Eye className="w-4 h-4 mr-2" />
                              View
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              asChild
                              className="w-full sm:w-auto"
                            >
                              <a href={doc.file_url} download target="_blank" rel="noreferrer" className="w-full inline-flex items-center justify-center">
                                <Download className="w-4 h-4 mr-2" />
                                Download
                              </a>
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDelete(doc.id, doc.file_url)}
                              className="w-full sm:w-auto"
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
