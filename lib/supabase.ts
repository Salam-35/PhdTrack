
import { createClient } from "@supabase/supabase-js"
import { sanitizeDeadlines, getDeadlineInfo } from "./university-deadlines"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("❌ Missing Supabase environment variables. Please check your .env file.")
  console.error("NEXT_PUBLIC_SUPABASE_URL:", supabaseUrl ? "✓" : "✗")
  console.error("NEXT_PUBLIC_SUPABASE_ANON_KEY:", supabaseAnonKey ? "✓" : "✗")
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  db: {
    schema: 'public'
  },
  global: {
    headers: {
      'x-client-info': 'phdtrack-web'
    }
  }
})

// User Profile Interface
export interface UserProfile {
  id: string // This will be the same as auth.users.id
  email: string
  display_name: string
  first_name: string
  last_name: string
  phone?: string
  current_university?: string
  degree_seeking?: "PhD" | "Masters"
  field_of_study?: string
  graduation_year?: number
  gpa?: number
  avatar_url?: string
  bio?: string
  linkedin_url?: string
  website_url?: string
  research_interests: string[]
  location?: string
  timezone?: string
  notification_preferences: {
    deadlines: boolean
    professor_replies: boolean
    document_reminders: boolean
    weekly_digest: boolean
    email_notifications: boolean
    push_notifications: boolean
  }
  created_at: string
  updated_at: string
}

// Database Types (existing interfaces remain the same)
export type UniversityDeadline = {
  term: string
  deadline: string
}

export interface University {
  id: string
  name: string
  program: string
  degree: "PhD" | "Masters"
  location: string
  ranking: number
  application_fee: number
  deadline?: string | null
  deadlines?: UniversityDeadline[]
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
  acceptance_funding_status?: "with-funding" | "without-funding" | "pending" | "unknown"
  notes: string
  user_id: string // Add user_id to link to profiles
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
  timezone?: string
  user_id: string // Add user_id to link to profiles
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
  user_id: string // Add user_id to link to profiles
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
  user_id: string // Add user_id to link to profiles
  created_at: string
  updated_at: string
}

// Course Evaluation Types
export interface CourseEvaluation {
  id: string
  user_id: string
  name: string
  level: string // e.g., Bachelor, Masters, PhD, Other
  created_at: string
  updated_at: string
}

export interface CourseEvaluationCourse {
  id: string
  evaluation_id: string
  code: string
  name: string
  grade: string
  credit_hours: number
  created_at: string
  updated_at: string
}

function removeUndefined<T extends Record<string, any>>(record: T): T {
  const entries = Object.entries(record).filter(([, value]) => value !== undefined)
  return Object.fromEntries(entries) as T
}

function normalizeUniversityRow(row: any): University {
  const deadlines = sanitizeDeadlines(row?.deadlines, row?.deadline ?? undefined)
  const info = getDeadlineInfo(deadlines)
  const primaryDeadline = info.current?.deadline ?? row?.deadline ?? null
  return {
    ...row,
    deadlines,
    deadline: primaryDeadline,
  }
}

function prepareUniversityPayload(university: Partial<University>) {
  const deadlines = sanitizeDeadlines(university.deadlines, university.deadline ?? undefined)
  const info = getDeadlineInfo(deadlines)
  const payload = {
    ...university,
    deadlines,
    deadline: info.current?.deadline ?? university.deadline ?? undefined,
  }
  return removeUndefined(payload)
}

// Database operations
export const db = {
  // User Profile Operations
  async getUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      console.log("🔍 Fetching profile for userId:", userId)
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single()

      if (error) {
        console.error("❌ Supabase error:", error.code, error.message, error.details, error.hint)
        if (error.code === 'PGRST116') {
          console.log("ℹ️ No profile found (PGRST116)")
          return null // No profile found
        }
        throw error
      }
//       console.log("✅ Profile fetched successfully:", data)
      return data as UserProfile
    } catch (error) {
      console.error("❌ Error fetching user profile:", error)
      return null
    }
  },

  async createUserProfile(profile: Omit<UserProfile, "created_at" | "updated_at">): Promise<UserProfile> {
    const { data, error } = await supabase
      .from("profiles")
      .insert([{
        ...profile,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single()
    
    if (error) throw error
    
    // Also update the display_name in auth.users if provided
    if (profile.display_name) {
      await supabase.auth.updateUser({
        data: { display_name: profile.display_name }
      })
    }
    
    return data as UserProfile
  },

  async updateUserProfile(userId: string, updates: Partial<UserProfile>): Promise<UserProfile> {
  // Strip undefined/null values
    const cleanUpdates = Object.entries(updates).reduce((acc, [key, value]) => {
      if (
        value !== undefined &&
        value !== null &&
        !(typeof value === "string" && value.trim() === "")
      ) {
        acc[key as keyof UserProfile] = value
      }
      return acc
    }, {} as Partial<UserProfile>)


    const { data, error } = await supabase
      .from("profiles")
      .update({
        ...cleanUpdates,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId)
      .select()
      .single()

    if (error) {
      console.error("❌ Supabase update error:", error)
      throw error
    }

    return data as UserProfile
  },

  async uploadAvatar(userId: string, file: File): Promise<string> {
    const fileExt = file.name.split(".").pop()
    const fileName = `avatar-${userId}-${Date.now()}.${fileExt}`

    const { data, error } = await supabase.storage
      .from("avatars")
      .upload(fileName, file)
    
    if (error) throw error

    const { data: { publicUrl } } = supabase.storage
      .from("avatars")
      .getPublicUrl(fileName)

    // Update the profile with the new avatar URL
    await this.updateUserProfile(userId, { avatar_url: publicUrl })

    return publicUrl
  },

  async deleteAvatar(userId: string, avatarUrl: string): Promise<void> {
  const fileName = avatarUrl.split("/").pop()
  if (!fileName) return

  const { error } = await supabase.storage
    .from("avatars")
    .remove([fileName])

  if (error) throw error

  await this.updateUserProfile(userId, { avatar_url: null })
  },

  // Helper function to create default profile after signup
  async createDefaultProfile(user: any): Promise<UserProfile> {
    const metadata = user?.user_metadata || {}
    const emailFallback = user?.email?.split("@")[0] || "User"
    const fullNameFromMeta = metadata.full_name || metadata.name || metadata.display_name || ""
    let firstName = metadata.first_name || metadata.given_name || ""
    let lastName = metadata.last_name || metadata.family_name || ""

    if ((!firstName || !lastName) && fullNameFromMeta) {
      const parts = fullNameFromMeta.trim().split(/\s+/)
      if (!firstName && parts.length) {
        firstName = parts.shift() || ""
      }
      if (!lastName && parts.length) {
        lastName = parts.join(" ")
      }
    }

    const displayName = (metadata.display_name ||
      fullNameFromMeta ||
      [firstName, lastName].filter(Boolean).join(" ") ||
      emailFallback).trim()

    const avatarUrl = metadata.avatar_url || metadata.picture || metadata.avatar || ""

    const defaultProfile: Omit<UserProfile, "created_at" | "updated_at"> = {
      id: user.id,
      email: user.email,
      display_name: displayName,
      first_name: firstName,
      last_name: lastName,
      phone: metadata.phone || "",
      avatar_url: avatarUrl || undefined,
      research_interests: [],
      notification_preferences: {
        deadlines: true,
        professor_replies: true,
        document_reminders: true,
        weekly_digest: false,
        email_notifications: true,
        push_notifications: true,
      }
    }

    const createdProfile = await this.createUserProfile(defaultProfile)

    try {
      await supabase.auth.updateUser({
        data: {
          display_name: displayName,
          first_name: firstName,
          last_name: lastName,
          full_name: displayName,
        },
      })
    } catch (error) {
      console.error("Error updating auth metadata:", error)
    }

    return createdProfile
  },

  // Universities (updated with user_id)
  async getUniversities(userId?: string) {
    try {
      // If no userId provided, try to get current user
      if (!userId) {
        const { data: { user } } = await supabase.auth.getUser()
        userId = user?.id
      }
      
      if (!userId) {
        console.warn("No user ID available for fetching universities")
        return []
      }

      const { data, error } = await supabase
        .from("universities")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
      if (error) throw error
      return (data as University[]).map(normalizeUniversityRow)
    } catch (error) {
      console.error("Error fetching universities:", error)
      return []
    }
  },

  async addUniversity(university: Omit<University, "id" | "created_at" | "updated_at">) {
    const payload = prepareUniversityPayload(university)
    const { data, error } = await supabase
      .from("universities")
      .insert([{
        ...payload,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single()
    if (error) throw error
    return normalizeUniversityRow(data)
  },

  async updateUniversity(id: string, updates: Partial<University>) {
    const payload = prepareUniversityPayload(updates)
    const { data, error } = await supabase
      .from("universities")
      .update({ ...payload, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single()
    if (error) throw error
    return normalizeUniversityRow(data)
  },

  async deleteUniversity(id: string) {
    const { error } = await supabase.from("universities").delete().eq("id", id)
    if (error) throw error
  },

  // Professors (updated with user_id)
  async getProfessors(userId?: string) {
    try {
      // If no userId provided, try to get current user
      if (!userId) {
        const { data: { user } } = await supabase.auth.getUser()
        userId = user?.id
      }
      
      if (!userId) {
        console.warn("No user ID available for fetching professors")
        return []
      }

      const { data, error } = await supabase
        .from("professors")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
      if (error) throw error
      return data as Professor[]
    } catch (error) {
      console.error("Error fetching professors:", error)
      return []
    }
  },

  async addProfessor(professor: Omit<Professor, "id" | "created_at" | "updated_at">) {
    const { data, error } = await supabase
      .from("professors")
      .insert([{
        ...professor,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single()
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

  // Documents (updated with user_id)
  async getDocuments(userId?: string) {
    try {
      // If no userId provided, try to get current user
      if (!userId) {
        const { data: { user } } = await supabase.auth.getUser()
        userId = user?.id
      }
      
      if (!userId) {
        console.warn("No user ID available for fetching documents")
        return []
      }

      const { data, error } = await supabase
        .from("documents")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
      if (error) throw error
      return data as Document[]
    } catch (error) {
      console.error("Error fetching documents:", error)
      return []
    }
  },

  async addDocument(document: Omit<Document, "id" | "created_at" | "updated_at">) {
    const { data, error } = await supabase
      .from("documents")
      .insert([{
        ...document,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single()
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

  // Timeline Events (updated with user_id)
  async getTimelineEvents(userId?: string) {
    try {
      // If no userId provided, try to get current user
      if (!userId) {
        const { data: { user } } = await supabase.auth.getUser()
        userId = user?.id
      }
      
      if (!userId) {
        console.warn("No user ID available for fetching timeline events")
        return []
      }

      const { data, error } = await supabase
        .from("timeline_events")
        .select("*")
        .eq("user_id", userId)
        .order("date", { ascending: true })
      if (error) throw error
      return data as TimelineEvent[]
    } catch (error) {
      console.error("Error fetching timeline events:", error)
      return []
    }
  },

  async addTimelineEvent(event: Omit<TimelineEvent, "id" | "created_at" | "updated_at">) {
    const { data, error } = await supabase
      .from("timeline_events")
      .insert([{
        ...event,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single()
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

  async deleteTimelineEvent(id: string): Promise<void> {
    const { error } = await supabase
      .from('timeline_events')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting timeline event:', error)
      throw error
    }
  },

  // File Upload
  async uploadFile(file: File, bucket = "documents"): Promise<string> {
    const fileExt = file.name.split(".").pop()
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`

    const { data, error } = await supabase.storage.from(bucket).upload(fileName, file)
    if (error) throw error

    const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(fileName)

    return publicUrl
  },

  async deleteFile(url: string, bucket = "documents") {
    const fileName = url.split("/").pop()
    if (!fileName) return

    const { error } = await supabase.storage.from(bucket).remove([fileName])
    if (error) throw error
  },

  // Course Evaluations (DB-backed)
  async getCourseEvaluations(userId?: string): Promise<CourseEvaluation[]> {
    try {
      if (!userId) {
        const { data: { user } } = await supabase.auth.getUser()
        userId = user?.id
      }
      if (!userId) return []
      const { data, error } = await supabase
        .from('course_evaluations')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
      if (error) throw error
      return (data || []) as CourseEvaluation[]
    } catch (e) {
      console.error('Error fetching course evaluations:', e)
      return []
    }
  },

  async createCourseEvaluation(payload: { name: string; level: string; user_id?: string }): Promise<CourseEvaluation> {
    let userId = payload.user_id
    if (!userId) {
      const { data: { user } } = await supabase.auth.getUser()
      userId = user?.id || ''
    }
    const { data, error } = await supabase
      .from('course_evaluations')
      .insert([{ name: payload.name, level: payload.level, user_id: userId }])
      .select()
      .single()
    if (error) throw error
    return data as CourseEvaluation
  },

  async updateCourseEvaluation(id: string, updates: Partial<Pick<CourseEvaluation, 'name' | 'level'>>): Promise<CourseEvaluation> {
    const { data, error } = await supabase
      .from('course_evaluations')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    return data as CourseEvaluation
  },

  async deleteCourseEvaluation(id: string): Promise<void> {
    // Attempt to delete child rows first for safety
    const { error: childErr } = await supabase.from('course_evaluation_courses').delete().eq('evaluation_id', id)
    if (childErr) console.warn('Warning deleting child courses:', childErr)
    const { error } = await supabase.from('course_evaluations').delete().eq('id', id)
    if (error) throw error
  },

  async getEvaluationCourses(evaluationId: string): Promise<CourseEvaluationCourse[]> {
    try {
      const { data, error } = await supabase
        .from('course_evaluation_courses')
        .select('*')
        .eq('evaluation_id', evaluationId)
        .order('created_at', { ascending: true })
      if (error) throw error
      return (data || []) as CourseEvaluationCourse[]
    } catch (e) {
      console.error('Error fetching courses for evaluation:', e)
      return []
    }
  },

  async addEvaluationCourse(evaluationId: string, course: { code: string; name: string; grade: string; credit_hours: number }): Promise<CourseEvaluationCourse> {
    const { data, error } = await supabase
      .from('course_evaluation_courses')
      .insert([{ evaluation_id: evaluationId, ...course }])
      .select()
      .single()
    if (error) throw error
    return data as CourseEvaluationCourse
  },

  async updateEvaluationCourse(id: string, updates: Partial<Pick<CourseEvaluationCourse, 'code' | 'name' | 'grade' | 'credit_hours'>>): Promise<CourseEvaluationCourse> {
    const { data, error } = await supabase
      .from('course_evaluation_courses')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    return data as CourseEvaluationCourse
  },

  async deleteEvaluationCourse(id: string): Promise<void> {
    const { error } = await supabase.from('course_evaluation_courses').delete().eq('id', id)
    if (error) throw error
  },
}
