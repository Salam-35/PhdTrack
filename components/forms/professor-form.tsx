// // "use client"

// // import type React from "react"

// // import { useState } from "react"
// // import { Button } from "@/components/ui/button"
// // import { Input } from "@/components/ui/input"
// // import { Label } from "@/components/ui/label"
// // import { Textarea } from "@/components/ui/textarea"
// // import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
// // import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
// // import { Badge } from "@/components/ui/badge"
// // import { X, Plus, Loader2 } from "lucide-react"
// // import { db, type Professor } from "@/lib/supabase"
// // import { toast } from "@/hooks/use-toast"

// // interface ProfessorFormProps {
// //   onClose: () => void
// //   onSave: (professor: Professor) => void
// //   professor?: Professor
// // }

// // export default function ProfessorForm({ onClose, onSave, professor }: ProfessorFormProps) {
// //   const [loading, setLoading] = useState(false)
// //   const [formData, setFormData] = useState({
// //     name: professor?.name || "",
// //     title: professor?.title || "",
// //     university: professor?.university || "",
// //     department: professor?.department || "",
// //     email: professor?.email || "",
// //     phone: professor?.phone || "",
// //     office: professor?.office || "",
// //     research_areas: professor?.research_areas || [],
// //     recent_papers: professor?.recent_papers || [],
// //     h_index: professor?.h_index?.toString() || "",
// //     citations: professor?.citations?.toString() || "",
// //     contact_status: professor?.contact_status || ("not-contacted" as const),
// //     last_contact: professor?.last_contact || "",
// //     next_followup: professor?.next_followup || "",
// //     notes: professor?.notes || "",
// //     fit_score: professor?.fit_score?.toString() || "5",
// //     availability: professor?.availability || ("available" as const),
// //     funding_status: professor?.funding_status || ("unknown" as const),
// //     response_time: professor?.response_time || "",
// //   })

// //   const [newResearchArea, setNewResearchArea] = useState("")
// //   const [newPaper, setNewPaper] = useState("")

// //   const addResearchArea = () => {
// //     if (newResearchArea && !formData.research_areas.includes(newResearchArea)) {
// //       setFormData((prev) => ({
// //         ...prev,
// //         research_areas: [...prev.research_areas, newResearchArea],
// //       }))
// //       setNewResearchArea("")
// //     }
// //   }

// //   const removeResearchArea = (area: string) => {
// //     setFormData((prev) => ({
// //       ...prev,
// //       research_areas: prev.research_areas.filter((a) => a !== area),
// //     }))
// //   }

// //   const addPaper = () => {
// //     if (newPaper && !formData.recent_papers.includes(newPaper)) {
// //       setFormData((prev) => ({
// //         ...prev,
// //         recent_papers: [...prev.recent_papers, newPaper],
// //       }))
// //       setNewPaper("")
// //     }
// //   }

// //   const removePaper = (paper: string) => {
// //     setFormData((prev) => ({
// //       ...prev,
// //       recent_papers: prev.recent_papers.filter((p) => p !== paper),
// //     }))
// //   }

// //   const handleSubmit = async (e: React.FormEvent) => {
// //     e.preventDefault()
// //     setLoading(true)

// //     try {
// //       const professorData = {
// //         ...formData,
// //         h_index: Number.parseInt(formData.h_index) || 0,
// //         citations: Number.parseInt(formData.citations) || 0,
// //         fit_score: Number.parseInt(formData.fit_score) || 5,
// //         last_contact: formData.last_contact || undefined,
// //         next_followup: formData.next_followup || undefined,
// //         phone: formData.phone || undefined,
// //         office: formData.office || undefined,
// //         response_time: formData.response_time || undefined,
// //       }

// //       let result: Professor
// //       if (professor) {
// //         result = await db.updateProfessor(professor.id, professorData)
// //         toast({
// //           title: "Professor Updated",
// //           description: `${result.name} has been updated successfully.`,
// //         })
// //       } else {
// //         result = await db.addProfessor(professorData)
// //         toast({
// //           title: "Professor Added",
// //           description: `${result.name} has been added successfully.`,
// //         })
// //       }

// //       onSave(result)
// //       onClose()
// //     } catch (error) {
// //       console.error("Error saving professor:", error)
// //       toast({
// //         title: "Error",
// //         description: "Failed to save professor. Please try again.",
// //         variant: "destructive",
// //       })
// //     } finally {
// //       setLoading(false)
// //     }
// //   }

// //   return (
// //     <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
// //       <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
// //         <CardHeader className="flex flex-row items-center justify-between">
// //           <CardTitle>{professor ? "Edit Professor" : "Add Professor"}</CardTitle>
// //           <Button variant="ghost" size="icon" onClick={onClose}>
// //             <X className="h-4 w-4" />
// //           </Button>
// //         </CardHeader>
// //         <CardContent>
// //           <form onSubmit={handleSubmit} className="space-y-6">
// //             {/* Basic Information */}
// //             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
// //               <div className="space-y-2">
// //                 <Label htmlFor="name">Professor Name *</Label>
// //                 <Input
// //                   id="name"
// //                   value={formData.name}
// //                   onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
// //                   required
// //                   placeholder="e.g., Dr. Sarah Chen"
// //                 />
// //               </div>
// //               <div className="space-y-2">
// //                 <Label htmlFor="title">Title</Label>
// //                 <Select
// //                   value={formData.title}
// //                   onValueChange={(value) => setFormData((prev) => ({ ...prev, title: value }))}
// //                 >
// //                   <SelectTrigger>
// //                     <SelectValue placeholder="Select title" />
// //                   </SelectTrigger>
// //                   <SelectContent>
// //                     <SelectItem value="Professor">Professor</SelectItem>
// //                     <SelectItem value="Associate Professor">Associate Professor</SelectItem>
// //                     <SelectItem value="Assistant Professor">Assistant Professor</SelectItem>
// //                     <SelectItem value="Lecturer">Lecturer</SelectItem>
// //                     <SelectItem value="Research Scientist">Research Scientist</SelectItem>
// //                   </SelectContent>
// //                 </Select>
// //               </div>
// //             </div>

// //             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
// //               <div className="space-y-2">
// //                 <Label htmlFor="university">University *</Label>
// //                 <Input
// //                   id="university"
// //                   value={formData.university}
// //                   onChange={(e) => setFormData((prev) => ({ ...prev, university: e.target.value }))}
// //                   required
// //                   placeholder="e.g., Stanford University"
// //                 />
// //               </div>
// //               <div className="space-y-2">
// //                 <Label htmlFor="department">Department *</Label>
// //                 <Input
// //                   id="department"
// //                   value={formData.department}
// //                   onChange={(e) => setFormData((prev) => ({ ...prev, department: e.target.value }))}
// //                   required
// //                   placeholder="e.g., Computer Science"
// //                 />
// //               </div>
// //             </div>

// //             {/* Contact Information */}
// //             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
// //               <div className="space-y-2">
// //                 <Label htmlFor="email">Email *</Label>
// //                 <Input
// //                   id="email"
// //                   type="email"
// //                   value={formData.email}
// //                   onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
// //                   required
// //                   placeholder="professor@university.edu"
// //                 />
// //               </div>
// //               <div className="space-y-2">
// //                 <Label htmlFor="phone">Phone</Label>
// //                 <Input
// //                   id="phone"
// //                   type="tel"
// //                   value={formData.phone}
// //                   onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
// //                   placeholder="+1-650-123-4567"
// //                 />
// //               </div>
// //               <div className="space-y-2">
// //                 <Label htmlFor="office">Office</Label>
// //                 <Input
// //                   id="office"
// //                   value={formData.office}
// //                   onChange={(e) => setFormData((prev) => ({ ...prev, office: e.target.value }))}
// //                   placeholder="e.g., Gates 314"
// //                 />
// //               </div>
// //             </div>

// //             {/* Academic Metrics */}
// //             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
// //               <div className="space-y-2">
// //                 <Label htmlFor="h_index">h-index</Label>
// //                 <Input
// //                   id="h_index"
// //                   type="number"
// //                   value={formData.h_index}
// //                   onChange={(e) => setFormData((prev) => ({ ...prev, h_index: e.target.value }))}
// //                   placeholder="45"
// //                 />
// //               </div>
// //               <div className="space-y-2">
// //                 <Label htmlFor="citations">Citations</Label>
// //                 <Input
// //                   id="citations"
// //                   type="number"
// //                   value={formData.citations}
// //                   onChange={(e) => setFormData((prev) => ({ ...prev, citations: e.target.value }))}
// //                   placeholder="12500"
// //                 />
// //               </div>
// //             </div>

// //             {/* Research Areas */}
// //             <div className="space-y-4">
// //               <Label>Research Areas</Label>
// //               <div className="flex flex-wrap gap-2 mb-2">
// //                 {formData.research_areas.map((area, index) => (
// //                   <Badge key={index} variant="secondary" className="flex items-center gap-1">
// //                     {area}
// //                     <X className="h-3 w-3 cursor-pointer" onClick={() => removeResearchArea(area)} />
// //                   </Badge>
// //                 ))}
// //               </div>
// //               <div className="flex gap-2">
// //                 <Input
// //                   value={newResearchArea}
// //                   onChange={(e) => setNewResearchArea(e.target.value)}
// //                   placeholder="e.g., Machine Learning"
// //                   onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addResearchArea())}
// //                 />
// //                 <Button type="button" onClick={addResearchArea} disabled={!newResearchArea}>
// //                   <Plus className="h-4 w-4" />
// //                 </Button>
// //               </div>
// //             </div>

// //             {/* Recent Papers */}
// //             <div className="space-y-4">
// //               <Label>Recent Papers</Label>
// //               <div className="space-y-2">
// //                 {formData.recent_papers.map((paper, index) => (
// //                   <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
// //                     <span className="flex-1 text-sm">{paper}</span>
// //                     <X className="h-4 w-4 cursor-pointer text-gray-500" onClick={() => removePaper(paper)} />
// //                   </div>
// //                 ))}
// //               </div>
// //               <div className="flex gap-2">
// //                 <Input
// //                   value={newPaper}
// //                   onChange={(e) => setNewPaper(e.target.value)}
// //                   placeholder="e.g., Advances in AI Alignment (2024)"
// //                   onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addPaper())}
// //                 />
// //                 <Button type="button" onClick={addPaper} disabled={!newPaper}>
// //                   <Plus className="h-4 w-4" />
// //                 </Button>
// //               </div>
// //             </div>

// //             {/* Status Information */}
// //             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
// //               <div className="space-y-2">
// //                 <Label htmlFor="contact_status">Contact Status</Label>
// //                 <Select
// //                   value={formData.contact_status}
// //                   onValueChange={(value: any) => setFormData((prev) => ({ ...prev, contact_status: value }))}
// //                 >
// //                   <SelectTrigger>
// //                     <SelectValue />
// //                   </SelectTrigger>
// //                   <SelectContent>
// //                     <SelectItem value="not-contacted">Not Contacted</SelectItem>
// //                     <SelectItem value="contacted">Contacted</SelectItem>
// //                     <SelectItem value="replied">Replied</SelectItem>
// //                     <SelectItem value="meeting-scheduled">Meeting Scheduled</SelectItem>
// //                     <SelectItem value="rejected">Rejected</SelectItem>
// //                   </SelectContent>
// //                 </Select>
// //               </div>
// //               <div className="space-y-2">
// //                 <Label htmlFor="availability">Availability</Label>
// //                 <Select
// //                   value={formData.availability}
// //                   onValueChange={(value: any) => setFormData((prev) => ({ ...prev, availability: value }))}
// //                 >
// //                   <SelectTrigger>
// //                     <SelectValue />
// //                   </SelectTrigger>
// //                   <SelectContent>
// //                     <SelectItem value="available">Available</SelectItem>
// //                     <SelectItem value="limited">Limited</SelectItem>
// //                     <SelectItem value="not-available">Not Available</SelectItem>
// //                   </SelectContent>
// //                 </Select>
// //               </div>
// //               <div className="space-y-2">
// //                 <Label htmlFor="funding_status">Funding Status</Label>
// //                 <Select
// //                   value={formData.funding_status}
// //                   onValueChange={(value: any) => setFormData((prev) => ({ ...prev, funding_status: value }))}
// //                 >
// //                   <SelectTrigger>
// //                     <SelectValue />
// //                   </SelectTrigger>
// //                   <SelectContent>
// //                     <SelectItem value="funded">Funded</SelectItem>
// //                     <SelectItem value="seeking">Seeking</SelectItem>
// //                     <SelectItem value="unknown">Unknown</SelectItem>
// //                   </SelectContent>
// //                 </Select>
// //               </div>
// //             </div>

// //             {/* Contact Dates */}
// //             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
// //               <div className="space-y-2">
// //                 <Label htmlFor="last_contact">Last Contact</Label>
// //                 <Input
// //                   id="last_contact"
// //                   type="date"
// //                   value={formData.last_contact}
// //                   onChange={(e) => setFormData((prev) => ({ ...prev, last_contact: e.target.value }))}
// //                 />
// //               </div>
// //               <div className="space-y-2">
// //                 <Label htmlFor="next_followup">Next Follow-up</Label>
// //                 <Input
// //                   id="next_followup"
// //                   type="date"
// //                   value={formData.next_followup}
// //                   onChange={(e) => setFormData((prev) => ({ ...prev, next_followup: e.target.value }))}
// //                 />
// //               </div>
// //               <div className="space-y-2">
// //                 <Label htmlFor="response_time">Response Time</Label>
// //                 <Input
// //                   id="response_time"
// //                   value={formData.response_time}
// //                   onChange={(e) => setFormData((prev) => ({ ...prev, response_time: e.target.value }))}
// //                   placeholder="e.g., 2 days"
// //                 />
// //               </div>
// //             </div>

// //             {/* Research Fit Score */}
// //             <div className="space-y-2">
// //               <Label htmlFor="fit_score">Research Fit Score (1-10)</Label>
// //               <Input
// //                 id="fit_score"
// //                 type="number"
// //                 min="1"
// //                 max="10"
// //                 value={formData.fit_score}
// //                 onChange={(e) => setFormData((prev) => ({ ...prev, fit_score: e.target.value }))}
// //               />
// //             </div>

// //             {/* Notes */}
// //             <div className="space-y-2">
// //               <Label htmlFor="notes">Notes</Label>
// //               <Textarea
// //                 id="notes"
// //                 value={formData.notes}
// //                 onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
// //                 placeholder="Research interests, publications, potential fit, etc."
// //                 rows={3}
// //               />
// //             </div>

// //             {/* Submit Buttons */}
// //             <div className="flex justify-end space-x-2 pt-4">
// //               <Button type="button" variant="outline" onClick={onClose}>
// //                 Cancel
// //               </Button>
// //               <Button type="submit" disabled={loading} className="bg-primary-500 hover:bg-primary-600">
// //                 {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
// //                 {professor ? "Update Professor" : "Add Professor"}
// //               </Button>
// //             </div>
// //           </form>
// //         </CardContent>
// //       </Card>
// //     </div>
// //   )
// // }
// "use client"

// import { useState } from "react"
// import { supabase } from "@/lib/supabase"
// import { useUser } from "@/context/UserProvider"
// import { Input } from "@/components/ui/input"
// import { Button } from "@/components/ui/button"

// export default function ProfessorForm({ onSave }: { onSave: () => void }) {
//   const user = useUser()
//   const [form, setForm] = useState({
//     name: "",
//     university: "",
//     email: "",
//     contact_status: "not-contacted",
//   })
//   const [loading, setLoading] = useState(false)

//   const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
//     setForm({ ...form, [e.target.name]: e.target.value })
//   }

//   const handleSubmit = async () => {
//     if (!user) return
//     setLoading(true)
//     const { error } = await supabase.from("professors").insert({
//       ...form,
//       added_by: user.id,
//     })
//     if (error) alert(error.message)
//     else {
//       setForm({ name: "", university: "", email: "", contact_status: "not-contacted" })
//       onSave()
//     }
//     setLoading(false)
//   }

//   return (
//     <div className="p-4 border rounded shadow space-y-4 bg-white">
//       <Input
//         name="name"
//         placeholder="Professor Name"
//         value={form.name}
//         onChange={handleChange}
//       />
//       <Input
//         name="university"
//         placeholder="University"
//         value={form.university}
//         onChange={handleChange}
//       />
//       <Input
//         name="email"
//         placeholder="Email"
//         value={form.email}
//         onChange={handleChange}
//       />
//       <select
//         name="contact_status"
//         value={form.contact_status}
//         onChange={handleChange}
//         className="w-full border p-2 rounded"
//       >
//         <option value="not-contacted">Not Contacted</option>
//         <option value="contacted">Contacted</option>
//       </select>
//       <Button onClick={handleSubmit} disabled={loading}>
//         {loading ? "Saving..." : "Save Professor"}
//       </Button>
//     </div>
//   )
// }


"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { supabase } from "@/lib/supabase"
import { useUser } from "@/context/UserProvider"
import { useEffect, useState } from "react"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { toast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"

interface ProfessorFormProps {
  open: boolean
  setOpen: (open: boolean) => void
  editingProfessor?: any
  refresh: () => void
}

export default function ProfessorForm({ open, setOpen, editingProfessor, refresh }: ProfessorFormProps) {
  const user = useUser()
  const [loading, setLoading] = useState(false)

  const [formData, setFormData] = useState({
    name: "",
    university: "",
    department: "",
    email: "",
    contact_status: "not-contacted",
    notes: "",
    mailing_date: "",
  })

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

  const saveProfessor = async () => {
    if (!user?.id) {
      toast({
        title: "Error",
        description: "You must be logged in to save professors",
        variant: "destructive",
      })
      return
    }

    if (!formData.name || !formData.university || !formData.email) {
      toast({
        title: "Error",
        description: "Please fill in all required fields (Name, University, Email)",
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

      toast({
        title: "Success",
        description: `Professor ${editingProfessor ? 'updated' : 'added'} successfully`,
      })

      setOpen(false)
      refresh()
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
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            {editingProfessor ? "Edit Professor" : "Add New Professor"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium">
                Full Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                placeholder="e.g., Dr. Sarah Chen"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                Email <span className="text-red-500">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="professor@university.edu"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                className="w-full"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="university" className="text-sm font-medium">
                University <span className="text-red-500">*</span>
              </Label>
              <Input
                id="university"
                placeholder="e.g., Stanford University"
                value={formData.university}
                onChange={(e) => handleInputChange("university", e.target.value)}
                className="w-full"
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
                className="w-full"
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
                <SelectTrigger className="w-full">
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
                className="w-full"
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
              className="w-full min-h-[100px]"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              onClick={saveProfessor}
              disabled={loading}
              className="min-w-[120px]"
            >
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {editingProfessor ? "Update" : "Save"} Professor
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}