// // "use client"

// // import type React from "react"

// // import { useState } from "react"
// // import { Button } from "@/components/ui/button"
// // import { Input } from "@/components/ui/input"
// // import { Label } from "@/components/ui/label"
// // import { Textarea } from "@/components/ui/textarea"
// // import { Checkbox } from "@/components/ui/checkbox"
// // import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
// // import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
// // import { X } from "lucide-react"

// // interface ProfessorFormProps {
// //   universities: any[]
// //   onClose: () => void
// //   onSave: (professor: any) => void
// // }

// // export default function ProfessorForm({ universities, onClose, onSave }: ProfessorFormProps) {
// //   const [formData, setFormData] = useState({
// //     name: "",
// //     university: "",
// //     department: "",
// //     researchArea: "",
// //     email: "",
// //     contacted: false,
// //     response: "",
// //     notes: "",
// //   })

// //   const handleSubmit = (e: React.FormEvent) => {
// //     e.preventDefault()
// //     onSave(formData)
// //   }

// //   return (
// //     <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
// //       <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
// //         <CardHeader className="flex flex-row items-center justify-between">
// //           <CardTitle>Add Professor</CardTitle>
// //           <Button variant="ghost" size="icon" onClick={onClose}>
// //             <X className="h-4 w-4" />
// //           </Button>
// //         </CardHeader>
// //         <CardContent>
// //           <form onSubmit={handleSubmit} className="space-y-4">
// //             <div className="grid grid-cols-2 gap-4">
// //               <div className="space-y-2">
// //                 <Label htmlFor="name">Professor Name</Label>
// //                 <Input
// //                   id="name"
// //                   value={formData.name}
// //                   onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
// //                   required
// //                 />
// //               </div>
// //               <div className="space-y-2">
// //                 <Label htmlFor="email">Email</Label>
// //                 <Input
// //                   id="email"
// //                   type="email"
// //                   value={formData.email}
// //                   onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
// //                 />
// //               </div>
// //             </div>

// //             <div className="grid grid-cols-2 gap-4">
// //               <div className="space-y-2">
// //                 <Label htmlFor="university">University</Label>
// //                 <Select
// //                   value={formData.university}
// //                   onValueChange={(value) => setFormData((prev) => ({ ...prev, university: value }))}
// //                 >
// //                   <SelectTrigger>
// //                     <SelectValue placeholder="Select university" />
// //                   </SelectTrigger>
// //                   <SelectContent>
// //                     {universities.map((uni) => (
// //                       <SelectItem key={uni.id} value={uni.name}>
// //                         {uni.name}
// //                       </SelectItem>
// //                     ))}
// //                   </SelectContent>
// //                 </Select>
// //               </div>
// //               <div className="space-y-2">
// //                 <Label htmlFor="department">Department</Label>
// //                 <Input
// //                   id="department"
// //                   value={formData.department}
// //                   onChange={(e) => setFormData((prev) => ({ ...prev, department: e.target.value }))}
// //                 />
// //               </div>
// //             </div>

// //             <div className="space-y-2">
// //               <Label htmlFor="researchArea">Research Area</Label>
// //               <Input
// //                 id="researchArea"
// //                 value={formData.researchArea}
// //                 onChange={(e) => setFormData((prev) => ({ ...prev, researchArea: e.target.value }))}
// //                 placeholder="e.g., Machine Learning, Quantum Computing, etc."
// //               />
// //             </div>

// //             <div className="flex items-center space-x-2">
// //               <Checkbox
// //                 id="contacted"
// //                 checked={formData.contacted}
// //                 onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, contacted: !!checked }))}
// //               />
// //               <Label htmlFor="contacted">Already contacted this professor</Label>
// //             </div>

// //             {formData.contacted && (
// //               <div className="space-y-2">
// //                 <Label htmlFor="response">Response</Label>
// //                 <Textarea
// //                   id="response"
// //                   value={formData.response}
// //                   onChange={(e) => setFormData((prev) => ({ ...prev, response: e.target.value }))}
// //                   placeholder="What was their response?"
// //                 />
// //               </div>
// //             )}

// //             <div className="space-y-2">
// //               <Label htmlFor="notes">Notes</Label>
// //               <Textarea
// //                 id="notes"
// //                 value={formData.notes}
// //                 onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
// //                 placeholder="Research interests, publications, potential fit, etc."
// //               />
// //             </div>

// //             <div className="flex justify-end space-x-2">
// //               <Button type="button" variant="outline" onClick={onClose}>
// //                 Cancel
// //               </Button>
// //               <Button type="submit">Save Professor</Button>
// //             </div>
// //           </form>
// //         </CardContent>
// //       </Card>
// //     </div>
// //   )
// // }


// // components/professor-form.tsx
// // "use client"

// // import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
// // import { Input } from "@/components/ui/input"
// // import { Button } from "@/components/ui/button"
// // import { Label } from "@/components/ui/label"
// // import { supabase } from "@/lib/supabase"
// // import { useUser } from "@/context/UserProvider"
// // import { useEffect, useState } from "react"
// // import { Textarea } from "@/components/ui/textarea"
// // import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"

// // export default function ProfessorForm({ open, setOpen, editingProfessor, refresh }: any) {
// //   const { user } = useUser()

// //   const [name, setName] = useState("")
// //   const [university, setUniversity] = useState("")
// //   const [department, setDepartment] = useState("")
// //   const [email, setEmail] = useState("")
// //   const [status, setStatus] = useState("not_contacted")
// //   const [notes, setNotes] = useState("")
// //   const [mailingDate, setMailingDate] = useState("")

// //   useEffect(() => {
// //     if (editingProfessor) {
// //       setName(editingProfessor.name || "")
// //       setUniversity(editingProfessor.university || "")
// //       setDepartment(editingProfessor.department || "")
// //       setEmail(editingProfessor.email || "")
// //       setStatus(editingProfessor.status || "not_contacted")
// //       setNotes(editingProfessor.notes || "")
// //       setMailingDate(editingProfessor.mailing_date || "")
// //     } else {
// //       setName("")
// //       setUniversity("")
// //       setDepartment("")
// //       setEmail("")
// //       setStatus("not_contacted")
// //       setNotes("")
// //       setMailingDate("")
// //     }
// //   }, [editingProfessor, open])

// //   const saveProfessor = async () => {
// //     if (!user?.id) {
// //       console.error("No user found.")
// //       return
// //     }

// //     const payload = {
// //       name,
// //       university,
// //       department,
// //       email,
// //       status,
// //       notes,
// //       mailing_date: mailingDate || null,
// //       added_by: user.id,
// //     }

// //     let result
// //     if (editingProfessor) {
// //       result = await supabase
// //         .from("professors")
// //         .update(payload)
// //         .eq("id", editingProfessor.id)
// //     } else {
// //       result = await supabase.from("professors").insert(payload)
// //     }

// //     if (result.error) {
// //       console.error("Failed to save professor:", result.error)
// //     } else {
// //       setOpen(false)
// //       refresh()
// //     }
// //   }

// //   return (
// //     <Dialog open={open} onOpenChange={setOpen}>
// //       <DialogContent aria-describedby="professor-desc">
// //         <DialogHeader>
// //           <DialogTitle>{editingProfessor ? "Edit Professor" : "Add New Professor"}</DialogTitle>
// //         </DialogHeader>
// //         <p id="professor-desc" className="sr-only">
// //           Enter professor details to save them to your list.
// //         </p>

// //         <div className="space-y-4">
// //           <div>
// //             <Label>Name</Label>
// //             <Input value={name} onChange={(e) => setName(e.target.value)} />
// //           </div>
// //           <div>
// //             <Label>University</Label>
// //             <Input value={university} onChange={(e) => setUniversity(e.target.value)} />
// //           </div>
// //           <div>
// //             <Label>Department (optional)</Label>
// //             <Input value={department} onChange={(e) => setDepartment(e.target.value)} />
// //           </div>
// //           <div>
// //             <Label>Email</Label>
// //             <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
// //           </div>
// //           <div>
// //             <Label>Status</Label>
// //             <Select value={status} onValueChange={setStatus}>
// //               <SelectTrigger>
// //                 <SelectValue placeholder="Select status" />
// //               </SelectTrigger>
// //               <SelectContent>
// //                 <SelectItem value="not_contacted">Not Contacted</SelectItem>
// //                 <SelectItem value="contacted">Contacted</SelectItem>
// //                 <SelectItem value="replied">Replied</SelectItem>
// //                 <SelectItem value="meeting_scheduled">Meeting Scheduled</SelectItem>
// //               </SelectContent>
// //             </Select>
// //           </div>
// //           <div>
// //             <Label>Mailing Date (optional)</Label>
// //             <Input
// //               type="date"
// //               value={mailingDate}
// //               onChange={(e) => setMailingDate(e.target.value)}
// //             />
// //           </div>
// //           <div>
// //             <Label>Notes (optional)</Label>
// //             <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} />
// //           </div>

// //           <div className="flex justify-end gap-2 pt-2">
// //             <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
// //             <Button onClick={saveProfessor}>Save</Button>
// //           </div>
// //         </div>
// //       </DialogContent>
// //     </Dialog>
// //   )
// // }




// "use client"

// import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
// import { Input } from "@/components/ui/input"
// import { Button } from "@/components/ui/button"
// import { Label } from "@/components/ui/label"
// import { supabase } from "@/lib/supabase"
// import { useUser } from "@/context/UserProvider"
// import { useEffect, useState } from "react"
// import { Textarea } from "@/components/ui/textarea"
// import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
// import { toast } from "@/hooks/use-toast"
// import { Loader2 } from "lucide-react"

// interface ProfessorFormProps {
//   open: boolean
//   setOpen: (open: boolean) => void
//   editingProfessor?: any
//   refresh: () => void
// }

// export default function ProfessorForm({ open, setOpen, editingProfessor, refresh }: ProfessorFormProps) {
//   const user = useUser()
//   const [loading, setLoading] = useState(false)

//   const [formData, setFormData] = useState({
//     name: "",
//     university: "",
//     department: "",
//     email: "",
//     contact_status: "not-contacted",
//     notes: "",
//     mailing_date: "",
//   })

//   useEffect(() => {
//     if (open) {
//       if (editingProfessor) {
//         // Editing existing professor
//         setFormData({
//           name: editingProfessor.name || "",
//           university: editingProfessor.university || "",
//           department: editingProfessor.department || "",
//           email: editingProfessor.email || "",
//           contact_status: editingProfessor.contact_status || "not-contacted",
//           notes: editingProfessor.notes || "",
//           mailing_date: editingProfessor.mailing_date || "",
//         })
//       } else {
//         // Creating new professor - reset form
//         setFormData({
//           name: "",
//           university: "",
//           department: "",
//           email: "",
//           contact_status: "not-contacted",
//           notes: "",
//           mailing_date: "",
//         })
//       }
//     }
//   }, [open, editingProfessor])

//   const handleInputChange = (field: string, value: string) => {
//     setFormData(prev => ({ ...prev, [field]: value }))
//   }

//   const saveProfessor = async () => {
//     if (!user?.id) {
//       toast({
//         title: "Error",
//         description: "You must be logged in to save professors",
//         variant: "destructive",
//       })
//       return
//     }

//     if (!formData.name || !formData.university || !formData.email) {
//       toast({
//         title: "Error",
//         description: "Please fill in all required fields (Name, University, Email)",
//         variant: "destructive",
//       })
//       return
//     }

//     setLoading(true)

//     try {
//       const payload = {
//         ...formData,
//         mailing_date: formData.mailing_date || null,
//         added_by: user.id,
//       }

//       let result
//       if (editingProfessor) {
//         result = await supabase
//           .from("professors")
//           .update(payload)
//           .eq("id", editingProfessor.id)
//           .select()
//       } else {
//         result = await supabase
//           .from("professors")
//           .insert(payload)
//           .select()
//       }

//       if (result.error) {
//         throw result.error
//       }

//       toast({
//         title: "Success",
//         description: `Professor ${editingProfessor ? 'updated' : 'added'} successfully`,
//       })

//       setOpen(false)
//       refresh()
//     } catch (error: any) {
//       console.error("Failed to save professor:", error)
//       toast({
//         title: "Error",
//         description: error.message || "Failed to save professor",
//         variant: "destructive",
//       })
//     } finally {
//       setLoading(false)
//     }
//   }

//   const handleClose = () => {
//     setOpen(false)
//     // Reset form when closing
//     setFormData({
//       name: "",
//       university: "",
//       department: "",
//       email: "",
//       contact_status: "not-contacted",
//       notes: "",
//       mailing_date: "",
//     })
//   }

//   return (
//     <Dialog open={open} onOpenChange={handleClose}>
//       <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
//         <DialogHeader>
//           <DialogTitle className="text-xl font-semibold">
//             {editingProfessor ? "Edit Professor" : "Add New Professor"}
//           </DialogTitle>
//         </DialogHeader>

//         <div className="space-y-6 py-4">
//           {/* Basic Information */}
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//             <div className="space-y-2">
//               <Label htmlFor="name" className="text-sm font-medium">
//                 Full Name <span className="text-red-500">*</span>
//               </Label>
//               <Input
//                 id="name"
//                 placeholder="e.g., Dr. Sarah Chen"
//                 value={formData.name}
//                 onChange={(e) => handleInputChange("name", e.target.value)}
//                 className="w-full"
//               />
//             </div>
//             <div className="space-y-2">
//               <Label htmlFor="email" className="text-sm font-medium">
//                 Email <span className="text-red-500">*</span>
//               </Label>
//               <Input
//                 id="email"
//                 type="email"
//                 placeholder="professor@university.edu"
//                 value={formData.email}
//                 onChange={(e) => handleInputChange("email", e.target.value)}
//                 className="w-full"
//               />
//             </div>
//           </div>

//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//             <div className="space-y-2">
//               <Label htmlFor="university" className="text-sm font-medium">
//                 University <span className="text-red-500">*</span>
//               </Label>
//               <Input
//                 id="university"
//                 placeholder="e.g., Stanford University"
//                 value={formData.university}
//                 onChange={(e) => handleInputChange("university", e.target.value)}
//                 className="w-full"
//               />
//             </div>
//             <div className="space-y-2">
//               <Label htmlFor="department" className="text-sm font-medium">
//                 Department
//               </Label>
//               <Input
//                 id="department"
//                 placeholder="e.g., Computer Science"
//                 value={formData.department}
//                 onChange={(e) => handleInputChange("department", e.target.value)}
//                 className="w-full"
//               />
//             </div>
//           </div>

//           {/* Status and Date */}
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//             <div className="space-y-2">
//               <Label htmlFor="contact_status" className="text-sm font-medium">
//                 Contact Status
//               </Label>
//               <Select
//                 value={formData.contact_status}
//                 onValueChange={(value) => handleInputChange("contact_status", value)}
//               >
//                 <SelectTrigger className="w-full">
//                   <SelectValue placeholder="Select status" />
//                 </SelectTrigger>
//                 <SelectContent>
//                   <SelectItem value="not-contacted">Not Contacted</SelectItem>
//                   <SelectItem value="contacted">Contacted</SelectItem>
//                   <SelectItem value="replied">Replied</SelectItem>
//                   <SelectItem value="meeting-scheduled">Meeting Scheduled</SelectItem>
//                   <SelectItem value="rejected">Rejected</SelectItem>
//                 </SelectContent>
//               </Select>
//             </div>
//             <div className="space-y-2">
//               <Label htmlFor="mailing_date" className="text-sm font-medium">
//                 Contact Date
//               </Label>
//               <Input
//                 id="mailing_date"
//                 type="date"
//                 value={formData.mailing_date}
//                 onChange={(e) => handleInputChange("mailing_date", e.target.value)}
//                 className="w-full"
//               />
//             </div>
//           </div>

//           {/* Notes */}
//           <div className="space-y-2">
//             <Label htmlFor="notes" className="text-sm font-medium">
//               Notes
//             </Label>
//             <Textarea
//               id="notes"
//               placeholder="Research interests, publications, potential fit, meeting notes, etc."
//               value={formData.notes}
//               onChange={(e) => handleInputChange("notes", e.target.value)}
//               className="w-full min-h-[100px]"
//             />
//           </div>

//           {/* Action Buttons */}
//           <div className="flex justify-end gap-3 pt-4 border-t">
//             <Button
//               type="button"
//               variant="outline"
//               onClick={handleClose}
//               disabled={loading}
//             >
//               Cancel
//             </Button>
//             <Button
//               onClick={saveProfessor}
//               disabled={loading}
//               className="min-w-[120px]"
//             >
//               {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
//               {editingProfessor ? "Update" : "Save"} Professor
//             </Button>
//           </div>
//         </div>
//       </DialogContent>
//     </Dialog>
//   )
// }