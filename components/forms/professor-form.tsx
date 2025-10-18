"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { supabase, type Professor } from "@/lib/supabase"
import { useUser } from "@/components/UserProvider"
import { useEffect, useState, useRef } from "react"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { toast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"

interface ProfessorFormProps {
  open: boolean
  setOpen: (open: boolean) => void
  editingProfessor?: any
  refresh?: () => void
  onSaved?: (professor: Professor) => void
}

export default function ProfessorForm({ open, setOpen, editingProfessor, refresh, onSaved }: ProfessorFormProps) {
  const {user} = useUser()
  const [loading, setLoading] = useState(false)
  const [parsingImage, setParsingImage] = useState(false)
  const [parsingText, setParsingText] = useState(false)
  const [textImportOpen, setTextImportOpen] = useState(false)
  const [textInput, setTextInput] = useState("")
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const [formData, setFormData] = useState({
    name: "",
    university: "",
    department: "",
    email: "",
    contact_status: "not-contacted",
    notes: "",
    mailing_date: "",
  })

  const busy = loading || parsingImage || parsingText

  useEffect(() => {
    if (open) {
      if (editingProfessor) {
        // Editing existing professor
        setFormData({
          name: editingProfessor.name || "",
          university: editingProfessor.university || "",
          department: editingProfessor.department || "",
          email: editingProfessor.email || "",
          contact_status: editingProfessor.contact_status || "not-contacted",
          notes: editingProfessor.notes || "",
          mailing_date: editingProfessor.mailing_date || "",
        })
      } else {
        // Creating new professor - reset form
        setFormData({
          name: "",
          university: "",
          department: "",
          email: "",
          contact_status: "not-contacted",
          notes: "",
          mailing_date: "",
        })
      }
    }
  }, [open, editingProfessor])

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const mergeExtractedData = (data: Partial<typeof formData>) => {
    const sanitizedEntries = Object.entries(data).filter(
      ([, value]) => typeof value === "string" && value.trim().length > 0
    ) as Array<[keyof typeof formData, string]>

    setFormData((prev) => ({
      ...prev,
      ...Object.fromEntries(sanitizedEntries),
    }))
  }

  const handleTextButtonClick = () => {
    setTextInput("")
    setTextImportOpen(true)
  }

  const handleImageButtonClick = () => {
    if (parsingImage) return
    fileInputRef.current?.click()
  }

  const handleImageFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    event.target.value = ""

    if (!file.type.startsWith("image/")) {
      toast({
        title: "Unsupported file",
        description: "Please select an image file (PNG, JPG, etc.).",
        variant: "destructive",
      })
      return
    }

    const maxSizeMb = 8
    if (file.size > maxSizeMb * 1024 * 1024) {
      toast({
        title: "File too large",
        description: `Please choose an image under ${maxSizeMb} MB.`,
        variant: "destructive",
      })
      return
    }

    const openAIApiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY
    if (!openAIApiKey) {
      toast({
        title: "OpenAI API key missing",
        description: "Set NEXT_PUBLIC_OPENAI_API_KEY in your environment to enable image extraction.",
        variant: "destructive",
      })
      return
    }

    setParsingImage(true)

    try {
      const base64 = await readFileAsBase64(file)

      const imageDataUrl = `data:${file.type};base64,${base64}`

      const prompt = [
        "Review the attached image and extract professor contact details.",
        "Return JSON only with keys: name, university, department, email, notes.",
        "Use empty strings for any fields that are not present.",
        "Do not include explanations or additional text outside the JSON object."
      ].join("\n")

      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${openAIApiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          temperature: 0.2,
          max_tokens: 300,
          messages: [
            {
              role: "system",
              content: "You extract structured professor contact details from images. Respond with JSON only.",
            },
            {
              role: "user",
              content: [
                { type: "text", text: prompt },
                { type: "image_url", image_url: { url: imageDataUrl } },
              ],
            },
          ],
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`OpenAI request failed: ${response.status} ${errorText}`)
      }

      const payload = await response.json()
      const responseText = extractTextFromOpenAIResponse(payload)

      if (!responseText) {
        throw new Error("OpenAI response did not include usable content.")
      }

      const extractedJson = extractJsonFromText(responseText)
      if (!extractedJson) {
        throw new Error("OpenAI response did not include usable JSON.")
      }

      mergeExtractedData(extractedJson)

      toast({
        title: "Details loaded",
        description: "Review the imported professor details before saving.",
      })
    } catch (error: any) {
      console.error("Image extraction failed:", error)
      toast({
        title: "Failed to extract details",
        description: error.message || "Please try a clearer image or enter details manually.",
        variant: "destructive",
      })
    } finally {
      setParsingImage(false)
    }
  }

  const handleTextImport = async () => {
    const openAIApiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY

    if (!textInput.trim()) {
      toast({
        title: "No text provided",
        description: "Paste professor details or notes before running extraction.",
        variant: "destructive",
      })
      return
    }

    if (!openAIApiKey) {
      toast({
        title: "OpenAI API key missing",
        description: "Set NEXT_PUBLIC_OPENAI_API_KEY in your environment to enable text extraction.",
        variant: "destructive",
      })
      return
    }

    setParsingText(true)

    try {
      const prompt = [
        "Extract professor contact details from the following text snippet.",
        "Return JSON only with keys: name, university, department, email, notes.",
        "Use empty strings for any items that cannot be located.",
        "",
        textInput.trim(),
      ].join("\n")

      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${openAIApiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          temperature: 0.1,
          max_tokens: 300,
          messages: [
            {
              role: "system",
              content: "You extract structured professor contact details from user-provided notes. Respond with JSON only.",
            },
            {
              role: "user",
              content: prompt,
            },
          ],
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`OpenAI request failed: ${response.status} ${errorText}`)
      }

      const payload = await response.json()
      const responseText = extractTextFromOpenAIResponse(payload)

      if (!responseText) {
        throw new Error("OpenAI response did not include usable content.")
      }

      const extractedJson = extractJsonFromText(responseText)
      if (!extractedJson) {
        throw new Error("OpenAI response did not include usable JSON.")
      }

      mergeExtractedData(extractedJson)
      setTextImportOpen(false)

      toast({
        title: "Details loaded",
        description: "Review the imported professor details before saving.",
      })
    } catch (error: any) {
      console.error("Text extraction failed:", error)
      toast({
        title: "Failed to extract details",
        description: error.message || "Please adjust the text and try again.",
        variant: "destructive",
      })
    } finally {
      setParsingText(false)
    }
  }

  const saveProfessor = async () => {
    if (!user?.id) {
      toast({
        title: "Error",
        description: "You must be logged in to save professors",
        variant: "destructive",
      })
      return
    }

    if (!formData.name || !formData.email) {
      toast({
        title: "Error",
        description: "Please fill in all required fields (Name, Email)",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      const payload = {
        ...formData,
        mailing_date: formData.mailing_date || null,
        added_by: user.id,
      }

      let result
      if (editingProfessor) {
        result = await supabase
          .from("professors")
          .update(payload)
          .eq("id", editingProfessor.id)
          .select()
      } else {
        result = await supabase
          .from("professors")
          .insert(payload)
          .select()
      }

      if (result.error) {
        throw result.error
      }

      const savedProfessor = (result.data?.[0] ?? null) as Professor | null

      toast({
        title: "Success",
        description: `Professor ${editingProfessor ? 'updated' : 'added'} successfully`,
      })

      setOpen(false)
      if (savedProfessor) {
        onSaved?.(savedProfessor)
        if (!onSaved) {
          refresh?.()
        }
      } else {
        refresh?.()
      }
    } catch (error: any) {
      console.error("Failed to save professor:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to save professor",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setOpen(false)
    setTextImportOpen(false)
    setTextInput("")
    // Reset form when closing
    setFormData({
      name: "",
      university: "",
      department: "",
      email: "",
      contact_status: "not-contacted",
      notes: "",
      mailing_date: "",
    })
  }

  return (
    <>
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-background text-foreground">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">
              {editingProfessor ? "Edit Professor" : "Add New Professor"}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Save contact details, notes, and outreach status for your target professors.
            </DialogDescription>
          </DialogHeader>

          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            className="hidden"
            onChange={handleImageFileChange}
          />

          <div className="flex flex-wrap justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleTextButtonClick}
              disabled={busy}
              className="bg-background text-foreground hover:bg-muted"
            >
              {parsingText && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Load from Text
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={handleImageButtonClick}
              disabled={busy}
              className="bg-background text-foreground hover:bg-muted"
            >
              {parsingImage && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Load from Image
            </Button>
          </div>

          <div className="space-y-6 py-4">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium">
                  Full Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  placeholder="e.g., Abdus Salam"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  className="w-full bg-background"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">
                  Email <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="e.g., salam35.ruet17@gmail.com"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  className="w-full bg-background"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="university" className="text-sm font-medium">
                  University
                </Label>
                <Input
                  id="university"
                  placeholder="e.g., Stanford University"
                  value={formData.university}
                  onChange={(e) => handleInputChange("university", e.target.value)}
                  className="w-full bg-background"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="department" className="text-sm font-medium">
                  Department
                </Label>
                <Input
                  id="department"
                  placeholder="e.g., Computer Science"
                  value={formData.department}
                  onChange={(e) => handleInputChange("department", e.target.value)}
                  className="w-full bg-background"
                />
              </div>
            </div>

            {/* Status and Date */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contact_status" className="text-sm font-medium">
                  Contact Status
                </Label>
                <Select
                  value={formData.contact_status}
                  onValueChange={(value) => handleInputChange("contact_status", value)}
                >
                  <SelectTrigger className="w-full bg-background">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="not-contacted">Not Contacted</SelectItem>
                    <SelectItem value="contacted">Contacted</SelectItem>
                    <SelectItem value="replied">Replied</SelectItem>
                    <SelectItem value="meeting-scheduled">Meeting Scheduled</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="mailing_date" className="text-sm font-medium">
                  Contact Date
                </Label>
                <Input
                  id="mailing_date"
                  type="date"
                  value={formData.mailing_date}
                  onChange={(e) => handleInputChange("mailing_date", e.target.value)}
                  className="w-full bg-background"
                />
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes" className="text-sm font-medium">
                Notes
              </Label>
              <Textarea
                id="notes"
                placeholder="Research interests, publications, potential fit, meeting notes, etc."
                value={formData.notes}
                onChange={(e) => handleInputChange("notes", e.target.value)}
                className="w-full min-h-[100px] bg-background"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-4 border-t border-border">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={busy}
              >
                Cancel
              </Button>
              <Button
                onClick={saveProfessor}
                disabled={busy}
                className="min-w-[120px]"
              >
                {(loading || parsingImage || parsingText) && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {editingProfessor ? "Update" : "Save"} Professor
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        open={textImportOpen}
        onOpenChange={(open) => {
          if (parsingText) return
          setTextImportOpen(open)
          if (!open) setTextInput("")
        }}
      >
        <DialogContent className="max-w-lg bg-background text-foreground">
          <DialogHeader>
            <DialogTitle>Paste Professor Details</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Paste any text from portfolio pages, emails, or notes and we will extract the contact fields automatically.
            </DialogDescription>
          </DialogHeader>

          <Textarea
            value={textInput}
            onChange={(event) => setTextInput(event.target.value)}
            placeholder="Paste profile text, publication overview, or copied email signature..."
            className="min-h-[160px] bg-background"
            disabled={parsingText}
          />

          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                if (parsingText) return
                setTextImportOpen(false)
                setTextInput("")
              }}
              disabled={parsingText}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleTextImport}
              disabled={parsingText}
            >
              {parsingText && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Extract Details
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

async function readFileAsBase64(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer()
  let binary = ""
  const bytes = new Uint8Array(arrayBuffer)
  const chunkSize = 0x8000
  for (let i = 0; i < bytes.length; i += chunkSize) {
    const chunk = bytes.subarray(i, i + chunkSize)
    binary += String.fromCharCode(...chunk)
  }
  return btoa(binary)
}

function extractTextFromOpenAIResponse(response: any): string | null {
  const content = response?.choices?.[0]?.message?.content

  if (!content) return null

  if (typeof content === "string") {
    return content.trim()
  }

  if (Array.isArray(content)) {
    return content
      .map((part) => {
        if (typeof part === "string") return part
        if (typeof part?.text === "string") return part.text
        if (part?.type === "output_text" && typeof part.text === "string") return part.text
        if (part?.type === "text" && typeof part.text === "string") return part.text
        return ""
      })
      .join("\n")
      .trim()
  }

  return null
}

function extractJsonFromText(text: string): Partial<{
  name: string
  university: string
  department: string
  email: string
  notes: string
}> | null {
  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) return null

  try {
    const parsed = JSON.parse(jsonMatch[0])
    return {
      name: sanitizeField(parsed.name),
      university: sanitizeField(parsed.university),
      department: sanitizeField(parsed.department),
      email: sanitizeField(parsed.email),
      notes: sanitizeField(parsed.notes),
    }
  } catch (error) {
    console.warn("Failed to parse JSON from OpenAI:", error, text)
    return null
  }
}

function sanitizeField(value: unknown): string {
  return typeof value === "string" ? value.trim() : ""
}
