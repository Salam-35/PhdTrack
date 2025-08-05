"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { X, Loader2 } from "lucide-react"
import { db, type Document, type University } from "@/lib/supabase"
import { toast } from "@/hooks/use-toast"
import { useUser } from "@/context/UserProvider"

interface DocumentFormProps {
  onClose: () => void
  onSave: (document: Document) => void
  universities: University[]
  document?: Document
}

export default function DocumentForm({ onClose, onSave, universities, document }: DocumentFormProps) {
  const user = useUser()
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [formData, setFormData] = useState({
    name: document?.name || "",
    type: document?.type || "sop",
    university_id: document?.university_id || "",
    status: document?.status || "not-started",
    version: document?.version?.toString() || "1",
    word_count: document?.word_count?.toString() || "",
    word_limit: document?.word_limit?.toString() || "",
    deadline: document?.deadline || "",
    notes: document?.notes || "",
    file_url: document?.file_url || "",
    file_name: document?.file_name || "",
  })

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !user) return

    setUploading(true)
    try {
      const filePath = `${user.id}/${Date.now()}_${file.name}`
      const { error: uploadError } = await db.storage.upload("documents", filePath, file)
      if (uploadError) throw uploadError

      const { data: fileData } = db.storage.getPublicUrl("documents", filePath)

      setFormData((prev) => ({
        ...prev,
        file_url: fileData.publicUrl,
        file_name: file.name,
      }))

      toast({
        title: "File Uploaded",
        description: "Your document has been uploaded successfully.",
      })
    } catch (error) {
      console.error("Error uploading file:", error)
      toast({
        title: "Upload Failed",
        description: "Failed to upload file. Please try again.",
        variant: "destructive",
      })
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setLoading(true)

    try {
      const documentData = {
        ...formData,
        version: Number.parseInt(formData.version) || 1,
        word_count: formData.word_count ? Number.parseInt(formData.word_count) : undefined,
        word_limit: formData.word_limit ? Number.parseInt(formData.word_limit) : undefined,
        university_id: formData.university_id || undefined,
        deadline: formData.deadline || undefined,
        shared_with: [],
        added_by: user.id, // ✅ CRITICAL
      }

      let result: Document
      if (document) {
        result = await db.updateDocument(document.id, documentData)
        toast({
          title: "Document Updated",
          description: `${result.name} has been updated successfully.`,
        })
      } else {
        result = await db.addDocument(documentData)
        toast({
          title: "Document Added",
          description: `${result.name} has been added successfully.`,
        })
      }

      onSave(result)
      onClose()
    } catch (error) {
      console.error("Error saving document:", error)
      toast({
        title: "Error",
        description: "Failed to save document. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{document ? "Edit Document" : "Add Document"}</CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Document Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                  required
                  placeholder="e.g., Stanford SOP"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Document Type</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value: any) => setFormData((prev) => ({ ...prev, type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sop">Statement of Purpose</SelectItem>
                    <SelectItem value="personal-statement">Personal Statement</SelectItem>
                    <SelectItem value="research-statement">Research Statement</SelectItem>
                    <SelectItem value="cv">CV/Resume</SelectItem>
                    <SelectItem value="transcript">Transcript</SelectItem>
                    <SelectItem value="lor">Letter of Recommendation</SelectItem>
                    <SelectItem value="writing-sample">Writing Sample</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
