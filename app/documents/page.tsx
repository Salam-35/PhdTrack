"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { useUser } from "@/components/UserProvider"
import DocumentUploadForm from "@/components/forms/document-upload-form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download, Trash, Loader2 } from "lucide-react"

export default function DocumentsPage() {
  const user = useUser()
  const [documents, setDocuments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const fetchDocuments = async () => {
    if (!user) return
    setLoading(true)
    const { data, error } = await supabase
      .from("documents")
      .select("*")
      .eq("added_by", user.id)
      .order("created_at", { ascending: false })
    if (error) console.error("Error fetching documents:", error)
    else setDocuments(data ?? [])
    setLoading(false)
  }

  const handleDelete = async (docId: string, fileUrl: string) => {
    const path = new URL(fileUrl).pathname.split("/documents/")[1]
    await supabase.storage.from("documents").remove([path])
    await supabase.from("documents").delete().eq("id", docId)
    fetchDocuments()
  }

  useEffect(() => {
    if (user?.id) {
      fetchDocuments()
    } else if (user === null) {
      setLoading(false)
    }
  }, [user])

  // Add timeout for loading state
  useEffect(() => {
    if (loading && user === undefined) {
      const timeout = setTimeout(() => {
        console.log('Documents page loading timeout')
        setLoading(false)
      }, 8000)

      return () => clearTimeout(timeout)
    }
  }, [loading, user])

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Your Documents</h1>

      <DocumentUploadForm onUpload={fetchDocuments} />

      {loading ? (
        <Card>
          <CardContent className="flex items-center justify-center gap-3 py-12">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Loading documents...</span>
          </CardContent>
        </Card>
      ) : documents.length > 0 ? (
        <div className="grid md:grid-cols-2 gap-4">
          {documents.map((doc) => (
            <Card key={doc.id}>
              <CardHeader>
                <CardTitle className="text-lg flex justify-between items-center">
                  <span>{doc.type || "Document"}</span>
                  <div className="flex gap-2">
                    <a
                      href={doc.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      download
                    >
                      <Button variant="secondary" size="icon">
                        <Download className="w-4 h-4" />
                      </Button>
                    </a>
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={() => handleDelete(doc.id, doc.file_url)}
                    >
                      <Trash className="w-4 h-4" />
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{doc.name}</p>
                {doc.note && (
                  <p className="text-sm text-foreground mt-1 italic">{doc.note}</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-sm text-muted-foreground">No documents uploaded yet. Use the form above to add your first document.</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
