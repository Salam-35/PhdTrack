
"use client"

import { useEffect, useMemo, useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { supabase } from "@/lib/supabase"
import { useUser } from "@/components/UserProvider"
import ProfessorForm from "@/components/forms/professor-form"
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
  XCircle,
  AlertTriangle,
  Wand2
} from "lucide-react"
import { toast } from "@/hooks/use-toast"
import EmailGenerator from "@/components/email-generator"

type ZonedParts = {
  year: number
  month: number
  day: number
  hour: number
  minute: number
  second: number
}

function getTimeZoneParts(date: Date, timeZone: string): ZonedParts | null {
  try {
    const formatter = new Intl.DateTimeFormat("en-US", {
      timeZone,
      hour12: false,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })
    const parts = formatter.formatToParts(date)
    const map: Record<string, number> = {}
    for (const part of parts) {
      if (part.type === "literal") continue
      map[part.type] = Number(part.value)
    }
    if (
      Number.isFinite(map.year) &&
      Number.isFinite(map.month) &&
      Number.isFinite(map.day) &&
      Number.isFinite(map.hour) &&
      Number.isFinite(map.minute) &&
      Number.isFinite(map.second)
    ) {
      return {
        year: map.year,
        month: map.month,
        day: map.day,
        hour: map.hour,
        minute: map.minute,
        second: map.second,
      }
    }
    return null
  } catch {
    return null
  }
}

function getTimeZoneOffset(date: Date, timeZone: string): number {
  const parts = getTimeZoneParts(date, timeZone)
  if (!parts) return 0
  const utcMillis = Date.UTC(
    parts.year,
    parts.month - 1,
    parts.day,
    parts.hour,
    parts.minute,
    parts.second,
    date.getUTCMilliseconds()
  )
  return utcMillis - date.getTime()
}

function makeDateInTimeZone(
  timeZone: string,
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
  second = 0
): Date | null {
  try {
    const guess = Date.UTC(year, month - 1, day, hour, minute, second)
    const initial = new Date(guess)
    const offset = getTimeZoneOffset(initial, timeZone)
    let adjusted = new Date(guess - offset)
    const adjustedOffset = getTimeZoneOffset(adjusted, timeZone)
    if (adjustedOffset !== offset) {
      adjusted = new Date(guess - adjustedOffset)
    }
    return adjusted
  } catch {
    return null
  }
}

function getNextNineAmDate(reference: Date, timeZone: string): Date | null {
  const parts = getTimeZoneParts(reference, timeZone)
  if (!parts) return null
  let candidate = makeDateInTimeZone(timeZone, parts.year, parts.month, parts.day, 9, 0, 0)
  if (!candidate) return null
  if (candidate <= reference) {
    const nextDayProbe = new Date(candidate.getTime() + 24 * 60 * 60 * 1000)
    const nextParts = getTimeZoneParts(nextDayProbe, timeZone)
    if (!nextParts) return null
    candidate = makeDateInTimeZone(timeZone, nextParts.year, nextParts.month, nextParts.day, 9, 0, 0)
  }
  return candidate
}

function formatDateTimeForDisplay(date: Date, timeZone: string): string | null {
  try {
    const formatted = new Intl.DateTimeFormat("en-US", {
      timeZone,
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }).format(date)
    return formatted
      .replace(/\u202F/g, "")
      .replace(/ ([AP]M)$/i, "$1")
  } catch {
    return null
  }
}

function getReferenceTimeAtNextMorning(reference: Date, professorTimeZone?: string, referenceTimeZone?: string): string | null {
  if (!professorTimeZone || !referenceTimeZone) return null
  const targetInstant = getNextNineAmDate(reference, professorTimeZone)
  if (!targetInstant) return null
  return formatDateTimeForDisplay(targetInstant, referenceTimeZone)
}

function formatTimezoneLabel(tz: string): string {
  if (!tz) return ""
  const parts = tz.split("/")
  const friendly = parts[parts.length - 1] || tz
  return friendly.replace(/_/g, " ")
}

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

interface ProfessorsPageProps {
  professors: any[]
  setProfessors: (professors: any[]) => void
  searchQuery: string
}

export default function ProfessorsPage({ professors: propProfessors, setProfessors: setPropProfessors, searchQuery }: ProfessorsPageProps) {
  const { user, loading: userLoading, profile } = useUser()
  const [filter, setFilter] = useState("all")
  const [openForm, setOpenForm] = useState(false)
  const [editingProfessor, setEditingProfessor] = useState(null)
  const [loading, setLoading] = useState(true)
  const [emailGeneratorOpen, setEmailGeneratorOpen] = useState(false)
  const [selectedProfessor, setSelectedProfessor] = useState<any>(null)
  const [localSearch, setLocalSearch] = useState("")
  const [now, setNow] = useState(new Date())
  const [resolvingIds, setResolvingIds] = useState<Set<string>>(new Set())
  const referenceTimezone = profile?.timezone || "Asia/Dhaka"
  const referenceTimezoneLabel = formatTimezoneLabel(referenceTimezone)

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
        setPropProfessors(data ?? [])
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

  const openEmailGenerator = (professor: any) => {
    setSelectedProfessor(professor)
    setEmailGeneratorOpen(true)
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

  const toggleFollowedUp = async (prof: any, value: boolean) => {
    try {
      const { error } = await supabase
        .from("professors")
        .update({ ifFowllowedUp: value })
        .eq("id", prof.id)
      if (error) {
        console.warn("Could not persist ifFowllowedUp (ensure column exists):", error)
      }
    } catch (e) {
      console.warn("Failed to update ifFowllowedUp:", e)
    } finally {
      setPropProfessors(prev => prev.map(p => p.id === prof.id ? { ...p, ifFowllowedUp: value } : p))
    }
  }

  const isGlobalSearchActive = Boolean(searchQuery?.trim())
  const externalQuery = searchQuery?.trim().toLowerCase() ?? ""
  const internalQuery = localSearch.trim().toLowerCase()
  const searchTerm = externalQuery || internalQuery

  const filteredProfessors = useMemo(() => {
    const normaliseValue = (value: unknown) => {
      if (!value) return ""
      if (Array.isArray(value)) return value.join(" ").toLowerCase()
      return String(value).toLowerCase()
    }
    const matchesSearch = (value: unknown) => normaliseValue(value).includes(searchTerm)
    return propProfessors.filter((p) => {
      const matchesFilter = filter === "all" || p.contact_status === filter
      if (!matchesFilter) return false

      if (!searchTerm) return true

      return (
        matchesSearch(p.name) ||
        matchesSearch(p.email) ||
        matchesSearch(p.university) ||
        matchesSearch(p.department) ||
        matchesSearch(p.research_interests)
      )
    })
  }, [propProfessors, filter, searchTerm])

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
    const total = propProfessors.length
    const contacted = propProfessors.filter(p => p.contact_status === "contacted").length
    const replied = propProfessors.filter(p => p.contact_status === "replied").length
    const meetings = propProfessors.filter(p => p.contact_status === "meeting-scheduled").length
    const needFollowUp = propProfessors.filter(p => getFollowUpStatus(p).needsFollowUp).length

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

  // Global tick every 10 minutes to refresh local-time text
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 600000)
    return () => clearInterval(id)
  }, [])

  // Attempt one-time timezone backfill for professors missing timezone
  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_OPENAI_API_KEY
    if (!key) return // No key configured; skip auto-detect
    const missing = (propProfessors || []).filter(p => !p.timezone && p.university && !resolvingIds.has(p.id))
    if (missing.length === 0) return

    let cancelled = false
    const ids = new Set(resolvingIds)

    async function resolveAll() {
      for (const prof of missing) {
        if (cancelled) break
        ids.add(prof.id)
        setResolvingIds(new Set(ids))
        try {
          const tz = await resolveTimezoneWithOpenAI(prof.university, prof.name, key)
          if (!tz) continue
          // Persist to DB
          const { error } = await supabase
            .from("professors")
            .update({ timezone: tz })
            .eq("id", prof.id)
          if (error) {
            console.warn("Failed to persist timezone (ensure 'timezone' column exists):", error)
            continue
          }
          // Update local state for immediate UI reflection
          setPropProfessors(prev => prev.map(p => p.id === prof.id ? { ...p, timezone: tz } : p))
        } catch (e) {
          console.warn("Timezone resolve/update failed for", prof.id, e)
        }
      }
    }

    resolveAll()
    return () => { cancelled = true }
  }, [propProfessors, setPropProfessors, resolvingIds])

  function formatLocalTime(date: Date, tz?: string): string | null {
    if (!tz) return null
    return formatDateTimeForDisplay(date, tz)
  }

  async function resolveTimezoneWithOpenAI(university: string, professorName: string, key: string): Promise<string | null> {
    try {
      const prompt = `Given the university name below, return only the IANA time zone identifier for its primary campus location.\n- Return just the identifier like America/New_York or Europe/London.\n- If multiple campuses exist, pick the most common main campus.\n- Do not include extra text or code blocks.\n\nUniversity: ${university}${professorName ? `\nProfessor: ${professorName}` : ""}`
      const resp = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${key}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: 'Return only a valid IANA time zone identifier.' },
            { role: 'user', content: prompt },
          ],
          temperature: 0,
          max_tokens: 16,
        })
      })
      if (!resp.ok) return null
      const data = await resp.json()
      let content: string = data.choices?.[0]?.message?.content || ''
      content = content.trim().replace(/^[`\s]*|[`\s]*$/g, '')
      // Extract plausible tz token
      const candidate = content.split(/\s|\n/).find((tok: string) => tok.includes('/')) || content
      const cleaned = candidate.replace(/^["']|["']$/g, '')
      // Validate IANA
      new Intl.DateTimeFormat("en-US", { timeZone: cleaned }).format(new Date())
      return cleaned
    } catch {
      return null
    }
  }

  useEffect(() => {
    if (!isGlobalSearchActive) return
    setLocalSearch("")
  }, [isGlobalSearchActive])

  // Add timeout for loading state
  useEffect(() => {
    if (loading && user === undefined) {
      const timeout = setTimeout(() => {
        console.log('Professors page loading timeout - refreshing')
        setLoading(false)
      }, 8000) // 8 second timeout

      return () => clearTimeout(timeout)
    }
  }, [loading, user])

  const stats = useMemo(() => getStats(), [propProfessors])

  if (userLoading || (loading && user === undefined)) {
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
          <h1 className="text-xl font-bold text-foreground">Professor Management</h1>
          <p className="text-muted-foreground mt-1">Track and manage your potential supervisors</p>
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

      {/* Filters */}
      <div className="space-y-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
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

          {/*
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              value={isGlobalSearchActive ? searchQuery : localSearch}
              onChange={(e) => !isGlobalSearchActive && setLocalSearch(e.target.value)}
              placeholder={
                isGlobalSearchActive
                  ? `Filtering by "${searchQuery}"`
                  : "Search by name, email, or university..."
              }
              disabled={isGlobalSearchActive}
              className="pl-9 text-sm"
            />
          </div>
          */}
        </div>
        {isGlobalSearchActive && (
          <p className="text-xs text-purple-600">
            Global search is active. Clear the main search to use the professor-specific search bar.
          </p>
        )}
      </div>

      {/* Professors List */}
      {filteredProfessors.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {propProfessors.length === 0 ? "No professors yet" : "No professors found"}
            </h3>
            <p className="text-gray-500 mb-4">
              {propProfessors.length === 0 
                ? "Get started by adding your first professor." 
                : "Try adjusting your search or filters."}
            </p>
            {propProfessors.length === 0 && (
              <Button onClick={openNewProfessorForm} className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Professor
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {filteredProfessors.map((professor) => {
            const StatusIcon = statusConfig[professor.contact_status as keyof typeof statusConfig]?.icon || Clock
            const statusColor = statusConfig[professor.contact_status as keyof typeof statusConfig]?.color || "bg-black-100 text-black-800"
            const statusLabel = statusConfig[professor.contact_status as keyof typeof statusConfig]?.label || professor.contact_status
            const followUpStatus = getFollowUpStatus(professor)
            const localTime = formatLocalTime(now, professor.timezone)
            const referenceNextMorning = getReferenceTimeAtNextMorning(now, professor.timezone, referenceTimezone)

            return (
              <Card
  key={professor.id}
  className={`relative overflow-hidden rounded-xl shadow-sm border transition-all duration-200 hover:shadow-md ${
    followUpStatus.needsFollowUp ? "border-red-300 bg-red-50/50" : "border-gray-200 bg-card dark:border-gray-700 dark:bg-gray-800"
  }`}
>
  {/* Edit button moved to bottom actions */}

  {/* Inner Grid (Main Content) */}
  <div className="grid grid-cols-1 md:grid-cols-5 gap-3 p-4">
    {/* Professor Info (wider) */}
    <div className="md:col-span-3 bg-purple-50 border border-purple-100 rounded-lg p-3 dark:bg-gray-800 dark:border-gray-700">
      <h4 className="text-sm font-semibold text-purple-800 mb-1 dark:text-foreground">Professor Info</h4>
      <ul className="text-sm text-gray-700 space-y-1 dark:text-foreground">
        <li>
          <span className="font-medium">Name:</span> {professor.name}
        </li>
        <li>
          <span className="font-medium">University:</span> {professor.university}
        </li>
        {professor.department && (
          <li>
            <span className="font-medium">Department:</span> {professor.department}
          </li>
        )}
        <li>
          <span className="font-medium">Email:</span>{" "}
          <a
            href={`mailto:${professor.email}`}
            className="text-blue-700 dark:text-blue-400 hover:underline break-all"
          >
            {professor.email}
          </a>
        </li>
      </ul>
    </div>

    {/* Contact & Time Info */}
    <div className="md:col-span-2 bg-blue-50 border border-blue-100 rounded-lg p-3 dark:bg-gray-800 dark:border-gray-700">
      <h4 className="text-sm font-semibold text-blue-800 mb-1 dark:text-foreground">Contact & Time</h4>
      <div className="space-y-1 text-sm text-gray-700 dark:text-foreground">
        {/* Follow-up checkbox */}
        <label className="flex items-center gap-2 mb-1">
          <Checkbox
            checked={Boolean((professor as any).ifFowllowedUp)}
            onCheckedChange={(checked) => toggleFollowedUp(professor, Boolean(checked))}
          />
          <span className="text-xs text-gray-700 dark:text-foreground">Followed up</span>
        </label>
        {professor.mailing_date && (
          <div className="flex justify-between">
            <span className="font-medium">Contact Date:</span>
            <span>{new Date(professor.mailing_date).toLocaleDateString()}</span>
          </div>
        )}
        {followUpStatus.needsFollowUp && !Boolean((professor as any).ifFowllowedUp) && (
          <p className="text-red-600 text-xs">
            {followUpStatus.days} days ago – follow up soon
          </p>
        )}
        {localTime && (
          <div className="flex justify-between">
            <span className="font-medium">Local Time:</span>
            <span>{localTime}</span>
          </div>
        )}
        {referenceNextMorning && (
          <div className="flex justify-between">
            <span className="font-medium">{referenceTimezoneLabel}:</span>
            <span>{referenceNextMorning}</span>
          </div>
        )}
        <div className="pt-1">
          <Badge className={`${statusColor} flex items-center gap-1 px-2 py-0.5 text-xs font-medium border` }>
            <StatusIcon className="h-3 w-3" />
            {statusLabel}
          </Badge>
        </div>
      </div>
    </div>
  </div>

  {/* Notes Section */}
  {professor.notes && (
    <div className="bg-gray-50 border-t border-gray-100 px-4 py-3 dark:bg-gray-800 dark:border-gray-700">
      <p className="text-sm font-medium text-gray-800 mb-1">Notes:</p>
      <p className="text-sm text-gray-600 line-clamp-3">{professor.notes}</p>
    </div>
  )}

  {/* Action Buttons */}
  <CardContent className="space-y-2 pt-3">
    <div className="flex gap-2">
      <Button
        size="sm"
        onClick={() => openEmailGenerator(professor)}
        className="flex-1 bg-purple-600 hover:bg-purple-700 text-white"
      >
        <Wand2 className="h-4 w-4 mr-1" />
        AI Email
      </Button>
      <Button
        size="sm"
        variant="outline"
        onClick={() => sendEmail(professor.email, professor.name)}
        className="bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200"
      >
        <Mail className="h-4 w-4 mr-1" />
        Quick Email
      </Button>
    </div>

    <div className="flex items-center justify-between">
      <Button
        size="sm"
        variant="outline"
        onClick={() => handleDelete(professor.id, professor.name)}
        className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
      >
        <Trash2 className="h-4 w-4 mr-1" /> Delete
      </Button>

      <Button
        size="sm"
        variant="outline"
        onClick={() => openEdit(professor)}
        className="text-purple-700 hover:text-purple-800 hover:bg-purple-50 border-purple-200"
      >
        <Edit className="h-4 w-4 mr-1" /> Edit
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

      {/* AI Email Generator Modal */}
      {selectedProfessor && (
        <EmailGenerator
          open={emailGeneratorOpen}
          onClose={() => {
            setEmailGeneratorOpen(false)
            setSelectedProfessor(null)
          }}
          professor={selectedProfessor}
        />
      )}
    </div>
  )
}
