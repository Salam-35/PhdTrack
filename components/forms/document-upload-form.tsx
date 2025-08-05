// "use client"

// import { useState } from "react"
// import { supabase } from "@/lib/supabase"
// import { useUser } from "@/context/UserProvider"
// import { Input } from "@/components/ui/input"
// import { Button } from "@/components/ui/button"

// export default function DocumentUploadForm({ onUpload }: { onUpload: () => void }) {
//   const user = useUser()
//   const [file, setFile] = useState<File | null>(null)
//   const [type, setType] = useState("CV")
//   const [note, setNote] = useState("")
//   const [uploading, setUploading] = useState(false)

//   const handleUpload = async () => {
//     if (!file || !user) return alert("Missing file or user.")

//     setUploading(true)

//     const filePath = `${user.id}/${Date.now()}_${file.name}`

//     const { error: uploadError } = await supabase.storage
//       .from("documents")
//       .upload(filePath, file)

//     if (uploadError) {
//       alert("Upload error: " + uploadError.message)
//       setUploading(false)
//       return
//     }

//     const { data: fileData } = supabase.storage.from("documents").getPublicUrl(filePath)

//     const { error: dbError } = await supabase.from("documents").insert({
//       name: file.name,
//       type,
//       note,
//       file_url: fileData.publicUrl,
//       added_by: user.id,
//     })

//     if (dbError) alert("DB error: " + dbError.message)
//     else onUpload()

//     setUploading(false)
//     setFile(null)
//     setNote("")
//   }

//   return (
//     <div className="border p-4 rounded space-y-2 bg-white shadow">
//       <Input
//         type="file"
//         accept=".pdf"
//         onChange={(e) => setFile(e.target.files?.[0] || null)}
//       />
//       <select
//         className="w-full border p-2"
//         value={type}
//         onChange={(e) => setType(e.target.value)}
//       >
//         <option value="CV">CV</option>
//         <option value="SOP">Statement of Purpose</option>
//         <option value="Transcript">Transcript</option>
//         <option value="LOR">Recommendation Letter</option>
//         <option value="Other">Other</option>
//       </select>
//       <Input
//         type="text"
//         placeholder="Optional note"
//         value={note}
//         onChange={(e) => setNote(e.target.value)}
//       />
//       <Button onClick={handleUpload} disabled={uploading}>
//         {uploading ? "Uploading..." : "Upload Document"}
//       </Button>
//     </div>
//   )
// }


"use client"

import { useState, useRef } from "react"
import { useUser } from "@/context/UserProvider"
import { supabase } from "@/lib/supabase"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { toast } from "@/hooks/use-toast"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select"
import { ChevronDown, Upload, Loader2 } from "lucide-react"

interface Props {
  onUpload: () => void
}

export default function DocumentUploadForm({ onUpload }: Props) {
  const user = useUser()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [file, setFile] = useState<File | null>(null)
  const [note, setNote] = useState("")
  const [docType, setDocType] = useState("")
  const [customType, setCustomType] = useState("")
  const [uploading, setUploading] = useState(false)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  const handleUpload = async () => {
    if (!user || !file || !docType || (docType === "custom" && !customType)) {
      toast({
        title: "Missing required fields",
        description: "Please select a file and document type.",
        variant: "destructive",
      })
      return
    }

    setUploading(true)

    try {
      const filePath = `${user.id}/${Date.now()}_${file.name}`
      const { error: uploadError } = await supabase.storage
        .from("documents")
        .upload(filePath, file)

      if (uploadError) throw uploadError

      const { data: fileData } = supabase.storage
        .from("documents")
        .getPublicUrl(filePath)

      const { error: insertError } = await supabase.from("documents").insert([
        {
          name: file.name,
          file_url: fileData.publicUrl,
          note,
          type: docType === "custom" ? customType : docType,
          added_by: user.id,
        },
      ])

      if (insertError) throw insertError

      toast({
        title: "Success",
        description: `${file.name} uploaded successfully.`,
      })

      // Reset form
      setFile(null)
      setNote("")
      setDocType("")
      setCustomType("")
      if (fileInputRef.current) fileInputRef.current.value = ""
      setIsDropdownOpen(false)

      onUpload()
    } catch (error: any) {
      console.error(error)
      toast({
        title: "Upload failed",
        description: error.message || "Something went wrong.",
        variant: "destructive",
      })
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-8">
      {/* Upload Section */}
      <div className="text-center space-y-4">
        <Button 
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          size="lg" 
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 px-8 py-6 text-lg font-semibold rounded-xl"
        >
          <Upload className="w-5 h-5 mr-2" />
          📥 Upload Documents
          <ChevronDown className={`w-4 h-4 ml-2 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
        </Button>

        {/* Expandable Upload Form */}
        {isDropdownOpen && (
          <div className="w-full max-w-2xl mx-auto">
            <div className="bg-white rounded-xl shadow-xl border border-gray-200 p-6 space-y-6 animate-in slide-in-from-top-2 duration-300">
              <div className="text-center">
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Upload a Document</h3>
                <p className="text-sm text-gray-600">Add your academic documents to your profile</p>
              </div>

              <form onSubmit={(e) => { e.preventDefault(); handleUpload(); }} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* File input */}
                  <div className="space-y-2">
                    <Label htmlFor="file">Select File *</Label>
                    <Input
                      id="file"
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={(e) => setFile(e.target.files?.[0] || null)}
                      disabled={uploading}
                    />
                  </div>

                  {/* Document type dropdown */}
                  <div className="space-y-2">
                    <Label htmlFor="type">Document Type *</Label>
                    <Select value={docType} onValueChange={setDocType} disabled={uploading}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select document type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sop">Statement of Purpose</SelectItem>
                        <SelectItem value="personal-statement">Personal Statement</SelectItem>
                        <SelectItem value="research-statement">Research Statement</SelectItem>
                        <SelectItem value="cv">CV/Resume</SelectItem>
                        <SelectItem value="transcript">Transcript</SelectItem>
                        <SelectItem value="lor">Letter of Recommendation</SelectItem>
                        <SelectItem value="writing-sample">Writing Sample</SelectItem>
                        <SelectItem value="custom">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Custom type input */}
                {docType === "custom" && (
                  <div className="space-y-2">
                    <Label htmlFor="customType">Custom Type *</Label>
                    <Input
                      id="customType"
                      placeholder="e.g. Research Statement, Portfolio"
                      value={customType}
                      onChange={(e) => setCustomType(e.target.value)}
                      disabled={uploading}
                    />
                  </div>
                )}

                {/* Note input */}
                <div className="space-y-2">
                  <Label htmlFor="note">Optional Note</Label>
                  <Input
                    id="note"
                    placeholder="e.g. for MIT application, reviewed by advisor"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    disabled={uploading}
                  />
                </div>

                {/* Upload Button */}
                <Button
                  type="submit"
                  disabled={!user || uploading || !file || !docType || (docType === "custom" && !customType)}
                  className="w-full"
                >
                  {uploading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      Upload Document
                    </>
                  )}
                </Button>
              </form>
            </div>
          </div>
        )}
      </div>

    </div>
  )
}