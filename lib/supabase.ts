import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database Types
export interface University {
  id: string
  name: string
  program: string
  degree: "PhD" | "Masters"
  location: string
  ranking: number
  application_fee: number
  deadline: string
  status:
    | "not-started"
    | "in-progress"
    | "submitted"
    | "under-review"
    | "interview"
    | "accepted"
    | "rejected"
    | "waitlisted"
  priority: "high" | "medium" | "low"
  requirements: string[]
  gre_required: boolean
  gre_score?: string
  sop_length: number
  funding_available: boolean
  funding_types: string[]
  funding_amount?: string
  notes: string
  created_at: string
  updated_at: string
}

export interface Professor {
  id: string
  name: string
  title: string
  university: string
  department: string
  email: string
  phone?: string
  office?: string
  research_areas: string[]
  recent_papers: string[]
  h_index: number
  citations: number
  contact_status: "not-contacted" | "contacted" | "replied" | "meeting-scheduled" | "rejected"
  last_contact?: string
  next_followup?: string
  notes: string
  fit_score: number
  availability: "available" | "limited" | "not-available"
  funding_status: "funded" | "seeking" | "unknown"
  response_time?: string
  created_at: string
  updated_at: string
}

export interface Document {
  id: string
  name: string
  type: "sop" | "personal-statement" | "research-statement" | "cv" | "transcript" | "lor" | "writing-sample" | "other"
  university_id?: string
  status: "not-started" | "draft" | "review" | "final" | "submitted"
  version: number
  word_count?: number
  word_limit?: number
  file_url?: string
  file_name?: string
  file_size?: number
  deadline?: string
  notes: string
  shared_with: string[]
  created_at: string
  updated_at: string
}

export interface TimelineEvent {
  id: string
  title: string
  description: string
  date: string
  time?: string
  type: "deadline" | "meeting" | "task" | "milestone" | "reminder"
  status: "upcoming" | "today" | "completed" | "overdue"
  priority: "high" | "medium" | "low"
  university_id?: string
  professor_id?: string
  category: "application" | "professor" | "document" | "test" | "interview" | "decision"
  created_at: string
  updated_at: string
}

// Database operations
export const db = {
  // Universities
  async getUniversities() {
    try {
      const { data, error } = await supabase.from("universities").select("*").order("created_at", { ascending: false })
      if (error) throw error
      return data as University[]
    } catch (error) {
      console.error("Error fetching universities:", error)
      return []
    }
  },

  async addUniversity(university: Omit<University, "id" | "created_at" | "updated_at">) {
    const { data, error } = await supabase.from("universities").insert([university]).select().single()
    if (error) throw error
    return data as University
  },

  async updateUniversity(id: string, updates: Partial<University>) {
    const { data, error } = await supabase
      .from("universities")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single()
    if (error) throw error
    return data as University
  },

  async deleteUniversity(id: string) {
    const { error } = await supabase.from("universities").delete().eq("id", id)
    if (error) throw error
  },

  // Professors
  async getProfessors() {
    try {
      const { data, error } = await supabase.from("professors").select("*").order("created_at", { ascending: false })
      if (error) throw error
      return data as Professor[]
    } catch (error) {
      console.error("Error fetching professors:", error)
      return []
    }
  },

  async addProfessor(professor: Omit<Professor, "id" | "created_at" | "updated_at">) {
    const { data, error } = await supabase.from("professors").insert([professor]).select().single()
    if (error) throw error
    return data as Professor
  },

  async updateProfessor(id: string, updates: Partial<Professor>) {
    const { data, error } = await supabase
      .from("professors")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single()
    if (error) throw error
    return data as Professor
  },

  async deleteProfessor(id: string) {
    const { error } = await supabase.from("professors").delete().eq("id", id)
    if (error) throw error
  },

  // Documents
  async getDocuments() {
    try {
      const { data, error } = await supabase.from("documents").select("*").order("created_at", { ascending: false })
      if (error) throw error
      return data as Document[]
    } catch (error) {
      console.error("Error fetching documents:", error)
      return []
    }
  },

  async addDocument(document: Omit<Document, "id" | "created_at" | "updated_at">) {
    const { data, error } = await supabase.from("documents").insert([document]).select().single()
    if (error) throw error
    return data as Document
  },

  async updateDocument(id: string, updates: Partial<Document>) {
    const { data, error } = await supabase
      .from("documents")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single()
    if (error) throw error
    return data as Document
  },

  async deleteDocument(id: string) {
    const { error } = await supabase.from("documents").delete().eq("id", id)
    if (error) throw error
  },

  // Timeline Events
  async getTimelineEvents() {
    try {
      const { data, error } = await supabase.from("timeline_events").select("*").order("date", { ascending: true })
      if (error) throw error
      return data as TimelineEvent[]
    } catch (error) {
      console.error("Error fetching timeline events:", error)
      return []
    }
  },

  async addTimelineEvent(event: Omit<TimelineEvent, "id" | "created_at" | "updated_at">) {
    const { data, error } = await supabase.from("timeline_events").insert([event]).select().single()
    if (error) throw error
    return data as TimelineEvent
  },

  async updateTimelineEvent(id: string, updates: Partial<TimelineEvent>) {
    const { data, error } = await supabase
      .from("timeline_events")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single()
    if (error) throw error
    return data as TimelineEvent
  },

  async deleteTimelineEvent(id: string) {
    const { error } = await supabase.from("timeline_events").delete().eq("id", id)
    if (error) throw error
  },

  // File Upload
  async uploadFile(file: File, bucket = "documents"): Promise<string> {
    const fileExt = file.name.split(".").pop()
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`

    const { data, error } = await supabase.storage.from(bucket).upload(fileName, file)
    if (error) throw error

    const {
      data: { publicUrl },
    } = supabase.storage.from(bucket).getPublicUrl(fileName)

    return publicUrl
  },

  async deleteFile(url: string, bucket = "documents") {
    const fileName = url.split("/").pop()
    if (!fileName) return

    const { error } = await supabase.storage.from(bucket).remove([fileName])
    if (error) throw error
  },
}
