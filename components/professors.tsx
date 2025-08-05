// "use client"

// import { useState } from "react"
// import { Card, CardContent, CardHeader } from "@/components/ui/card"
// import { Badge } from "@/components/ui/badge"
// import { Button } from "@/components/ui/button"
// import { Input } from "@/components/ui/input"
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
// import {
//   Users,
//   Mail,
//   Phone,
//   MapPin,
//   Star,
//   Calendar,
//   MessageCircle,
//   ExternalLink,
//   Search,
//   Plus,
//   Clock,
//   X,
//   Edit,
//   Trash2,
// } from "lucide-react"
// import { db, type Professor } from "@/lib/supabase"
// import { toast } from "@/hooks/use-toast"
// import ProfessorForm from "./forms/professor-form"

// interface ProfessorsProps {
//   professors: Professor[]
//   setProfessors: (professors: Professor[]) => void
// }

// export default function Professors({ professors, setProfessors }: ProfessorsProps) {
//   const [searchQuery, setSearchQuery] = useState("")
//   const [filterStatus, setFilterStatus] = useState("all")
//   const [showForm, setShowForm] = useState(false)
//   const [editingProfessor, setEditingProfessor] = useState<Professor | undefined>()

//   const getStatusColor = (status: Professor["contact_status"]) => {
//     switch (status) {
//       case "not-contacted":
//         return "bg-gray-500"
//       case "contacted":
//         return "bg-blue-500"
//       case "replied":
//         return "bg-green-500"
//       case "meeting-scheduled":
//         return "bg-purple-500"
//       case "rejected":
//         return "bg-red-500"
//       default:
//         return "bg-gray-500"
//     }
//   }

//   const getStatusIcon = (status: Professor["contact_status"]) => {
//     switch (status) {
//       case "not-contacted":
//         return <Clock className="h-4 w-4" />
//       case "contacted":
//         return <Mail className="h-4 w-4" />
//       case "replied":
//         return <MessageCircle className="h-4 w-4" />
//       case "meeting-scheduled":
//         return <Calendar className="h-4 w-4" />
//       case "rejected":
//         return <X className="h-4 w-4" />
//       default:
//         return <Clock className="h-4 w-4" />
//     }
//   }

//   const getFitColor = (fit: number) => {
//     if (fit >= 8) return "text-green-500"
//     if (fit >= 6) return "text-yellow-500"
//     return "text-red-500"
//   }

//   const handleEdit = (professor: Professor) => {
//     setEditingProfessor(professor)
//     setShowForm(true)
//   }

//   const handleDelete = async (id: string) => {
//     if (!confirm("Are you sure you want to delete this professor?")) return

//     try {
//       await db.deleteProfessor(id)
//       setProfessors(professors.filter((prof) => prof.id !== id))
//       toast({
//         title: "Professor Deleted",
//         description: "The professor has been deleted successfully.",
//       })
//     } catch (error) {
//       console.error("Error deleting professor:", error)
//       toast({
//         title: "Error",
//         description: "Failed to delete professor. Please try again.",
//         variant: "destructive",
//       })
//     }
//   }

//   const handleSave = (professor: Professor) => {
//     if (editingProfessor) {
//       setProfessors(professors.map((prof) => (prof.id === professor.id ? professor : prof)))
//     } else {
//       setProfessors([professor, ...professors])
//     }
//     setEditingProfessor(undefined)
//   }

//   const updateContactStatus = async (id: string, newStatus: Professor["contact_status"]) => {
//     try {
//       const updatedProfessor = await db.updateProfessor(id, {
//         contact_status: newStatus,
//         last_contact: newStatus !== "not-contacted" ? new Date().toISOString().split("T")[0] : undefined,
//       })
//       setProfessors(professors.map((prof) => (prof.id === id ? updatedProfessor : prof)))
//       toast({
//         title: "Status Updated",
//         description: `Contact status updated to ${newStatus.replace("-", " ")}`,
//       })
//     } catch (error) {
//       console.error("Error updating status:", error)
//       toast({
//         title: "Error",
//         description: "Failed to update status. Please try again.",
//         variant: "destructive",
//       })
//     }
//   }

//   const filteredProfessors = professors.filter((prof) => {
//     const matchesSearch =
//       prof.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
//       prof.university.toLowerCase().includes(searchQuery.toLowerCase()) ||
//       prof.research_areas.some((area) => area.toLowerCase().includes(searchQuery.toLowerCase()))

//     const matchesFilter = filterStatus === "all" || prof.contact_status === filterStatus

//     return matchesSearch && matchesFilter
//   })

//   return (
//     <div className="p-4 space-y-6">
//       {/* Header */}
//       <div className="flex items-center justify-between">
//         <div>
//           <h2 className="text-2xl font-bold">Professor Management</h2>
//           <p className="text-gray-600">Track and manage your potential supervisors</p>
//         </div>
//         <Button onClick={() => setShowForm(true)} className="bg-primary-500 hover:bg-primary-600">
//           <Plus className="h-4 w-4 mr-2" />
//           Add Professor
//         </Button>
//       </div>

//       {/* Stats Cards */}
//       <div className="grid grid-cols-2 gap-4">
//         <Card>
//           <CardContent className="p-4">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-sm text-gray-600">Total Professors</p>
//                 <p className="text-2xl font-bold">{professors.length}</p>
//               </div>
//               <Users className="h-8 w-8 text-primary-500" />
//             </div>
//           </CardContent>
//         </Card>
//         <Card>
//           <CardContent className="p-4">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-sm text-gray-600">Meetings Scheduled</p>
//                 <p className="text-2xl font-bold">
//                   {professors.filter((p) => p.contact_status === "meeting-scheduled").length}
//                 </p>
//               </div>
//               <Calendar className="h-8 w-8 text-green-500" />
//             </div>
//           </CardContent>
//         </Card>
//       </div>

//       {/* Search and Filter */}
//       <div className="space-y-3">
//         <div className="relative">
//           <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
//           <Input
//             placeholder="Search professors, universities, research areas..."
//             value={searchQuery}
//             onChange={(e) => setSearchQuery(e.target.value)}
//             className="pl-10"
//           />
//         </div>

//         <div className="flex space-x-2 overflow-x-auto pb-2">
//           {["all", "not-contacted", "contacted", "replied", "meeting-scheduled"].map((status) => (
//             <Button
//               key={status}
//               variant={filterStatus === status ? "default" : "outline"}
//               size="sm"
//               onClick={() => setFilterStatus(status)}
//               className="whitespace-nowrap"
//             >
//               {status.replace("-", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
//             </Button>
//           ))}
//         </div>
//       </div>

//       {/* Professors List */}
//       <div className="space-y-4">
//         {filteredProfessors.map((professor) => (
//           <Card key={professor.id} className="overflow-hidden">
//             <CardHeader className="pb-3">
//               <div className="flex items-start justify-between">
//                 <div className="flex-1">
//                   <div className="flex items-center space-x-2 mb-1">
//                     <h3 className="font-bold text-lg">{professor.name}</h3>
//                     <Badge className={`${getStatusColor(professor.contact_status)} text-white`}>
//                       {professor.contact_status.replace("-", " ")}
//                     </Badge>
//                   </div>
//                   <p className="text-sm text-gray-600">
//                     {professor.title} • {professor.university}
//                   </p>
//                   <p className="text-sm text-gray-500">{professor.department}</p>
//                 </div>
//                 <div className="flex items-center space-x-2">
//                   <div className="text-right">
//                     <div className="flex items-center space-x-1 mb-1">
//                       <Star className={`h-4 w-4 ${getFitColor(professor.fit_score)}`} />
//                       <span className={`font-bold ${getFitColor(professor.fit_score)}`}>{professor.fit_score}/10</span>
//                     </div>
//                     <p className="text-xs text-gray-500">Research Fit</p>
//                   </div>
//                   <div className="flex gap-1">
//                     <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(professor)}>
//                       <Edit className="h-4 w-4" />
//                     </Button>
//                     <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDelete(professor.id)}>
//                       <Trash2 className="h-4 w-4" />
//                     </Button>
//                   </div>
//                 </div>
//               </div>
//             </CardHeader>

//             <CardContent className="space-y-4">
//               {/* Research Areas */}
//               <div>
//                 <p className="text-sm font-medium mb-2">Research Areas</p>
//                 <div className="flex flex-wrap gap-1">
//                   {professor.research_areas.map((area, index) => (
//                     <Badge key={index} variant="secondary" className="text-xs">
//                       {area}
//                     </Badge>
//                   ))}
//                 </div>
//               </div>

//               {/* Academic Metrics */}
//               <div className="grid grid-cols-3 gap-4 text-center bg-gray-50 rounded-lg p-3">
//                 <div>
//                   <div className="font-bold text-primary-600">{professor.h_index}</div>
//                   <div className="text-xs text-gray-500">h-index</div>
//                 </div>
//                 <div>
//                   <div className="font-bold text-primary-600">{professor.citations.toLocaleString()}</div>
//                   <div className="text-xs text-gray-500">Citations</div>
//                 </div>
//                 <div>
//                   <div className="font-bold text-primary-600">{professor.recent_papers.length}</div>
//                   <div className="text-xs text-gray-500">Recent Papers</div>
//                 </div>
//               </div>

//               {/* Contact Info */}
//               <div className="space-y-2">
//                 <div className="flex items-center space-x-2 text-sm">
//                   <Mail className="h-4 w-4 text-gray-400" />
//                   <span>{professor.email}</span>
//                 </div>
//                 {professor.phone && (
//                   <div className="flex items-center space-x-2 text-sm">
//                     <Phone className="h-4 w-4 text-gray-400" />
//                     <span>{professor.phone}</span>
//                   </div>
//                 )}
//                 {professor.office && (
//                   <div className="flex items-center space-x-2 text-sm">
//                     <MapPin className="h-4 w-4 text-gray-400" />
//                     <span>{professor.office}</span>
//                   </div>
//                 )}
//               </div>

//               {/* Status Info */}
//               <div className="grid grid-cols-2 gap-4 text-sm">
//                 <div>
//                   <span className="font-medium">Availability: </span>
//                   <Badge variant={professor.availability === "available" ? "default" : "secondary"}>
//                     {professor.availability}
//                   </Badge>
//                 </div>
//                 <div>
//                   <span className="font-medium">Funding: </span>
//                   <Badge variant={professor.funding_status === "funded" ? "default" : "outline"}>
//                     {professor.funding_status}
//                   </Badge>
//                 </div>
//               </div>

//               {/* Last Contact & Next Follow-up */}
//               {professor.last_contact && (
//                 <div className="bg-blue-50 rounded-lg p-3 space-y-2">
//                   <div className="flex items-center justify-between text-sm">
//                     <span className="font-medium">Last Contact:</span>
//                     <span>{new Date(professor.last_contact).toLocaleDateString()}</span>
//                   </div>
//                   {professor.next_followup && (
//                     <div className="flex items-center justify-between text-sm">
//                       <span className="font-medium">Next Follow-up:</span>
//                       <span className="text-primary-600 font-medium">
//                         {new Date(professor.next_followup).toLocaleDateString()}
//                       </span>
//                     </div>
//                   )}
//                   {professor.response_time && professor.response_time !== "pending" && (
//                     <div className="flex items-center justify-between text-sm">
//                       <span className="font-medium">Response Time:</span>
//                       <span>{professor.response_time}</span>
//                     </div>
//                   )}
//                 </div>
//               )}

//               {/* Notes */}
//               {professor.notes && (
//                 <div className="bg-yellow-50 rounded-lg p-3">
//                   <p className="text-sm font-medium mb-1">Notes:</p>
//                   <p className="text-sm text-gray-700">{professor.notes}</p>
//                 </div>
//               )}

//               {/* Action Buttons */}
//               <div className="flex space-x-2 pt-2">
//                 <Button
//                   size="sm"
//                   className="flex-1 bg-primary-500 hover:bg-primary-600"
//                   onClick={() => window.open(`mailto:${professor.email}`, "_blank")}
//                 >
//                   <Mail className="h-4 w-4 mr-1" />
//                   Email
//                 </Button>
//                 <Select
//                   value={professor.contact_status}
//                   onValueChange={(value: Professor["contact_status"]) => updateContactStatus(professor.id, value)}
//                 >
//                   <SelectTrigger className="flex-1">
//                     <SelectValue />
//                   </SelectTrigger>
//                   <SelectContent>
//                     <SelectItem value="not-contacted">Not Contacted</SelectItem>
//                     <SelectItem value="contacted">Contacted</SelectItem>
//                     <SelectItem value="replied">Replied</SelectItem>
//                     <SelectItem value="meeting-scheduled">Meeting Scheduled</SelectItem>
//                     <SelectItem value="rejected">Rejected</SelectItem>
//                   </SelectContent>
//                 </Select>
//                 <Button size="sm" variant="outline">
//                   <ExternalLink className="h-4 w-4" />
//                 </Button>
//               </div>
//             </CardContent>
//           </Card>
//         ))}
//       </div>

//       {filteredProfessors.length === 0 && (
//         <div className="text-center py-12">
//           <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
//           <h3 className="text-lg font-medium text-gray-900 mb-2">No professors found</h3>
//           <p className="text-gray-500 mb-4">Get started by adding your first professor.</p>
//           <Button onClick={() => setShowForm(true)} className="bg-primary-500 hover:bg-primary-600">
//             <Plus className="h-4 w-4 mr-2" />
//             Add Professor
//           </Button>
//         </div>
//       )}

//       {/* Form Modal */}
//       {showForm && (
//         <ProfessorForm
//           onClose={() => {
//             setShowForm(false)
//             setEditingProfessor(undefined)
//           }}
//           onSave={handleSave}
//           professor={editingProfessor}
//         />
//       )}
//     </div>
//   )
// }




// "use client"

// import { useEffect, useState } from "react"
// import { Input } from "@/components/ui/input"
// import { Button } from "@/components/ui/button"
// import { supabase } from "@/lib/supabase"
// import { useUser } from "@/context/UserProvider"
// import ProfessorForm from "./professor-form"
// import { Badge } from "@/components/ui/badge"

// const statusFilters = [
//   { label: "all", value: "all" },
//   { label: "not contacted", value: "not_contacted" },
//   { label: "contacted", value: "contacted" },
//   { label: "replied", value: "replied" },
//   { label: "meeting scheduled", value: "meeting_scheduled" },
// ]

// export default function ProfessorsPage() {
//   const { user } = useUser()
//   const [professors, setProfessors] = useState<any[]>([])
//   const [filteredProfessors, setFilteredProfessors] = useState<any[]>([])
//   const [search, setSearch] = useState("")
//   const [filter, setFilter] = useState("all")
//   const [openForm, setOpenForm] = useState(false)
//   const [editingProfessor, setEditingProfessor] = useState(null)

//   const fetchProfessors = async () => {
//     const { data, error } = await supabase
//       .from("professors")
//       .select("*")
//       .eq("added_by", user.id)

//     if (error) console.error("Error fetching professors:", error)
//     else {
//       setProfessors(data ?? [])
//       filterAndSearch(data ?? [])
//     }
//   }

//   const handleDelete = async (id: string) => {
//     await supabase.from("professors").delete().eq("id", id)
//     fetchProfessors()
//   }

//   const sendMail = (email: string) => {
//     window.location.href = `mailto:${email}`
//   }

//   const openEdit = (prof: any) => {
//     setEditingProfessor(prof)
//     setOpenForm(true)
//   }

//   const filterAndSearch = (list: any[]) => {
//     const filtered = list.filter((p) => {
//       const matchSearch =
//         p.name?.toLowerCase().includes(search.toLowerCase()) ||
//         p.university?.toLowerCase().includes(search.toLowerCase())
//       const matchFilter = filter === "all" || p.status === filter
//       return matchSearch && matchFilter
//     })
//     setFilteredProfessors(filtered)
//   }

//   useEffect(() => {
//     fetchProfessors()
//   }, [user])

//   useEffect(() => {
//     filterAndSearch(professors)
//   }, [search, filter])

//   return (
//     <div className="p-6">
//       <h2 className="text-2xl font-bold mb-2">Professor Management</h2>
//       <p className="text-gray-600 mb-4">Track and manage your potential supervisors</p>

//       <div className="flex flex-col md:flex-row items-start md:items-center gap-4 mb-4">
//         <Input
//           placeholder="Search professors or universities"
//           value={search}
//           onChange={(e) => setSearch(e.target.value)}
//           className="w-full md:w-1/2"
//         />
//         <div className="flex gap-2 flex-wrap">
//           {statusFilters.map((f) => (
//             <Button
//               key={f.value}
//               variant={filter === f.value ? "default" : "outline"}
//               onClick={() => setFilter(f.value)}
//               className="capitalize"
//             >
//               {f.label}
//             </Button>
//           ))}
//         </div>
//         <Button onClick={() => { setOpenForm(true); setEditingProfessor(null) }} className="ml-auto">
//           + Add Professor
//         </Button>
//       </div>

//       {filteredProfessors.length === 0 ? (
//         <p className="text-gray-500 mt-4">No professors found. Add new professors to get started.</p>
//       ) : (
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//           {filteredProfessors.map((professor) => {
//             const needsFollowUp =
//               professor.status === "contacted" &&
//               professor.mailing_date &&
//               new Date().getTime() - new Date(professor.mailing_date).getTime() > 14 * 24 * 60 * 60 * 1000

//             return (
//               <div
//                 key={professor.id}
//                 className={`border rounded-lg p-4 shadow-sm relative bg-white ${
//                   needsFollowUp ? "border-red-500" : "border-gray-200"
//                 }`}
//               >
//                 <h3 className="text-lg font-semibold">{professor.name}</h3>
//                 <p className="text-sm text-gray-600">{professor.university}</p>
//                 {professor.department && <p className="text-sm text-gray-600">{professor.department}</p>}
//                 <p className="text-sm text-gray-600">{professor.email}</p>

//                 {professor.mailing_date && (
//                   <p className="text-xs text-gray-500 mt-1">
//                     Mailing Date: {new Date(professor.mailing_date).toLocaleDateString()}{" "}
//                     {needsFollowUp && (
//                       <span className="text-red-600 font-semibold">(Follow Up!)</span>
//                     )}
//                   </p>
//                 )}

//                 <Badge
//                   variant="outline"
//                   className={`absolute top-2 right-2 text-xs capitalize ${
//                     professor.status === "contacted" ? "bg-blue-100 text-blue-800" :
//                     professor.status === "replied" ? "bg-green-100 text-green-800" :
//                     professor.status === "meeting_scheduled" ? "bg-purple-100 text-purple-800" :
//                     "bg-gray-100 text-gray-800"
//                   }`}
//                 >
//                   {professor.status}
//                 </Badge>

//                 <div className="flex gap-2 mt-4">
//                   <Button size="sm" variant="outline" onClick={() => sendMail(professor.email)}>
//                     Email
//                   </Button>
//                   <Button size="sm" variant="ghost" onClick={() => openEdit(professor)}>
//                     ✏️
//                   </Button>
//                   <Button size="sm" variant="destructive" onClick={() => handleDelete(professor.id)}>
//                     🗑
//                   </Button>
//                 </div>
//               </div>
//             )
//           })}
//         </div>
//       )}

//       <ProfessorForm
//         open={openForm}
//         setOpen={setOpenForm}
//         editingProfessor={editingProfessor}
//         refresh={fetchProfessors}
//       />
//     </div>
//   )
// }



"use client"

import { useEffect, useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { supabase } from "@/lib/supabase"
import { useUser } from "@/context/UserProvider"
import ProfessorForm from "./professor-form"
import { 
  Users, 
  Search, 
  Plus, 
  Mail, 
  Edit, 
  Trash2, 
  Calendar,
  MessageCircle,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle
} from "lucide-react"
import { toast } from "@/hooks/use-toast"

const statusConfig = {
  "not-contacted": {
    label: "Not Contacted",
    color: "bg-gray-100 text-gray-800 border-gray-200",
    icon: Clock
  },
  "contacted": {
    label: "Contacted",
    color: "bg-blue-100 text-blue-800 border-blue-200",
    icon: Mail
  },
  "replied": {
    label: "Replied",
    color: "bg-green-100 text-green-800 border-green-200",
    icon: MessageCircle
  },
  "meeting-scheduled": {
    label: "Meeting Scheduled",
    color: "bg-purple-100 text-purple-800 border-purple-200",
    icon: Calendar
  },
  "rejected": {
    label: "Rejected",
    color: "bg-red-100 text-red-800 border-red-200",
    icon: XCircle
  }
}

const statusFilters = [
  { label: "All", value: "all" },
  { label: "Not Contacted", value: "not-contacted" },
  { label: "Contacted", value: "contacted" },
  { label: "Replied", value: "replied" },
  { label: "Meeting Scheduled", value: "meeting-scheduled" },
  { label: "Rejected", value: "rejected" },
]

export default function ProfessorsPage() {
  const user = useUser()
  const [professors, setProfessors] = useState<any[]>([])
  const [filteredProfessors, setFilteredProfessors] = useState<any[]>([])
  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState("all")
  const [openForm, setOpenForm] = useState(false)
  const [editingProfessor, setEditingProfessor] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchProfessors = async () => {
    if (!user?.id) {
      setLoading(false)
      return
    }
    
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from("professors")
        .select("*")
        .eq("added_by", user.id)
        .order('created_at', { ascending: false })

      if (error) {
        console.error("Error fetching professors:", error)
        toast({
          title: "Error",
          description: "Failed to fetch professors",
          variant: "destructive",
        })
      } else {
        setProfessors(data ?? [])
      }
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete ${name}?`)) return

    try {
      const { error } = await supabase.from("professors").delete().eq("id", id)
      
      if (error) throw error
      
      toast({
        title: "Success",
        description: "Professor deleted successfully",
      })
      fetchProfessors()
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to delete professor",
        variant: "destructive",
      })
    }
  }

  const sendEmail = (email: string, name: string) => {
    const subject = encodeURIComponent(`Graduate Research Opportunity`)
    const body = encodeURIComponent(`Dear Professor ${name},\n\nI hope this email finds you well.\n\nBest regards,`)
    window.open(`mailto:${email}?subject=${subject}&body=${body}`, '_blank')
  }

  const openEdit = (prof: any) => {
    setEditingProfessor(prof)
    setOpenForm(true)
  }

  const closeForm = () => {
    setOpenForm(false)
    setEditingProfessor(null)
  }

  const openNewProfessorForm = () => {
    setEditingProfessor(null) // Make sure this is null for new professor
    setOpenForm(true)
  }

  const filterAndSearch = () => {
    let filtered = professors.filter((p) => {
      const matchSearch =
        p.name?.toLowerCase().includes(search.toLowerCase()) ||
        p.university?.toLowerCase().includes(search.toLowerCase()) ||
        p.department?.toLowerCase().includes(search.toLowerCase()) ||
        p.email?.toLowerCase().includes(search.toLowerCase())
      
      const matchFilter = filter === "all" || p.contact_status === filter
      return matchSearch && matchFilter
    })
    setFilteredProfessors(filtered)
  }

  const getFollowUpStatus = (professor: any) => {
    if (professor.contact_status === "contacted" && professor.mailing_date) {
      const daysSinceContact = Math.floor(
        (new Date().getTime() - new Date(professor.mailing_date).getTime()) / (1000 * 60 * 60 * 24)
      )
      if (daysSinceContact > 14) {
        return { needsFollowUp: true, days: daysSinceContact }
      }
    }
    return { needsFollowUp: false, days: 0 }
  }

  const getStats = () => {
    const total = professors.length
    const contacted = professors.filter(p => p.contact_status === "contacted").length
    const replied = professors.filter(p => p.contact_status === "replied").length
    const meetings = professors.filter(p => p.contact_status === "meeting-scheduled").length
    const needFollowUp = professors.filter(p => getFollowUpStatus(p).needsFollowUp).length

    return { total, contacted, replied, meetings, needFollowUp }
  }

  useEffect(() => {
    if (user?.id) {
      fetchProfessors()
    } else if (user === null) {
      // User is definitely not logged in
      setLoading(false)
    }
    // If user is undefined, we're still loading the auth state
  }, [user])

  useEffect(() => {
    filterAndSearch()
  }, [search, filter, professors])

  const stats = getStats()

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Loading professors...</span>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Please log in</h3>
            <p className="text-gray-500">You need to be logged in to manage professors.</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Professor Management</h1>
          <p className="text-gray-600 mt-1">Track and manage your potential supervisors</p>
        </div>
        <Button
          onClick={openNewProfessorForm}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Professor
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <Users className="h-6 w-6 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Contacted</p>
                <p className="text-2xl font-bold">{stats.contacted}</p>
              </div>
              <Mail className="h-6 w-6 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Replied</p>
                <p className="text-2xl font-bold">{stats.replied}</p>
              </div>
              <MessageCircle className="h-6 w-6 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Meetings</p>
                <p className="text-2xl font-bold">{stats.meetings}</p>
              </div>
              <Calendar className="h-6 w-6 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Follow Up</p>
                <p className="text-2xl font-bold text-red-600">{stats.needFollowUp}</p>
              </div>
              <AlertTriangle className="h-6 w-6 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search professors, universities, departments..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 max-w-md"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {statusFilters.map((statusFilter) => (
            <Button
              key={statusFilter.value}
              variant={filter === statusFilter.value ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter(statusFilter.value)}
              className="text-sm"
            >
              {statusFilter.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Professors List */}
      {filteredProfessors.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {professors.length === 0 ? "No professors yet" : "No professors found"}
            </h3>
            <p className="text-gray-500 mb-4">
              {professors.length === 0 
                ? "Get started by adding your first professor." 
                : "Try adjusting your search or filters."}
            </p>
            {professors.length === 0 && (
              <Button onClick={openNewProfessorForm} className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Professor
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredProfessors.map((professor) => {
            const StatusIcon = statusConfig[professor.contact_status as keyof typeof statusConfig]?.icon || Clock
            const statusColor = statusConfig[professor.contact_status as keyof typeof statusConfig]?.color || "bg-gray-100 text-gray-800"
            const statusLabel = statusConfig[professor.contact_status as keyof typeof statusConfig]?.label || professor.contact_status
            const followUpStatus = getFollowUpStatus(professor)

            return (
              <Card key={professor.id} className={`relative ${followUpStatus.needsFollowUp ? 'border-red-300 bg-red-50/50' : ''}`}>
                {followUpStatus.needsFollowUp && (
                  <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                    Follow up needed!
                  </div>
                )}
                
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-2">{professor.name}</CardTitle>
                      <div className="space-y-1">
                        <p className="text-sm text-gray-600 font-medium">{professor.university}</p>
                        {professor.department && (
                          <p className="text-sm text-gray-500">{professor.department}</p>
                        )}
                        <p className="text-sm text-gray-600">{professor.email}</p>
                      </div>
                    </div>
                    <Badge className={`${statusColor} border flex items-center gap-1`}>
                      <StatusIcon className="h-3 w-3" />
                      {statusLabel}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Contact Information */}
                  {professor.mailing_date && (
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">Contact Date:</span>
                        <span>{new Date(professor.mailing_date).toLocaleDateString()}</span>
                      </div>
                      {followUpStatus.needsFollowUp && (
                        <div className="text-red-600 text-xs mt-1">
                          {followUpStatus.days} days ago - Consider following up
                        </div>
                      )}
                    </div>
                  )}

                  {/* Notes */}
                  {professor.notes && (
                    <div className="bg-blue-50 rounded-lg p-3">
                      <p className="text-sm font-medium mb-1 text-blue-800">Notes:</p>
                      <p className="text-sm text-blue-700 line-clamp-3">{professor.notes}</p>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-2">
                    <Button
                      size="sm"
                      onClick={() => sendEmail(professor.email, professor.name)}
                      className="flex-1 bg-blue-600 hover:bg-blue-700"
                    >
                      <Mail className="h-4 w-4 mr-1" />
                      Email
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openEdit(professor)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(professor.id, professor.name)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Professor Form Modal */}
      <ProfessorForm
        open={openForm}
        setOpen={closeForm}
        editingProfessor={editingProfessor}
        refresh={fetchProfessors}
      />
    </div>
  )
}