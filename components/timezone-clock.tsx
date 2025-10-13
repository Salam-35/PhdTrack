"use client"

import { useEffect, useMemo, useState } from "react"
import { Clock, Edit2, Save, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

interface TimezoneClockProps {
  professorId: string
  professorName?: string
  university?: string
}

// LocalStorage key to persist per-professor timezones
const STORAGE_KEY = "prof_timezones_v1"

function loadMap(): Record<string, string> {
  if (typeof window === "undefined") return {}
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

function saveMap(map: Record<string, string>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(map))
  } catch {
    // ignore storage errors
  }
}

function isValidIana(tz: string): boolean {
  try {
    // Throws if invalid IANA
    new Intl.DateTimeFormat("en-US", { timeZone: tz }).format(new Date())
    return true
  } catch {
    return false
  }
}

function parseOffsetToMinutes(input: string): number | null {
  // Accept forms: +05, -04, +05:30, -03:45, UTC+2, GMT-7, +5.5
  const cleaned = input.trim().toUpperCase().replace(/^UTC|^GMT/, "")
  const match = cleaned.match(/^([+-]?)(\d{1,2})(?::?(\d{2}))?(?:\.(\d))?$/)
  if (!match) return null
  const sign = match[1] === "-" ? -1 : 1
  const hours = parseInt(match[2] || "0", 10)
  const mins = match[3] ? parseInt(match[3], 10) : (match[4] ? Math.round((parseInt(match[4], 10) / 10) * 60) : 0)
  if (hours > 14 || mins > 59) return null
  return sign * (hours * 60 + mins)
}

function formatInTimezone(date: Date, tz: string): { text: string; label: string } | null {
  if (isValidIana(tz)) {
    const text = date.toLocaleString(undefined, {
      timeZone: tz,
      hour: "2-digit",
      minute: "2-digit",
      weekday: "short",
      day: "2-digit",
      month: "short",
    })
    return { text, label: tz }
  }
  const offsetMins = parseOffsetToMinutes(tz)
  if (offsetMins !== null) {
    const utc = date.getTime() + date.getTimezoneOffset() * 60000
    const target = new Date(utc + offsetMins * 60000)
    const text = target.toLocaleString(undefined, {
      hour: "2-digit",
      minute: "2-digit",
      weekday: "short",
      day: "2-digit",
      month: "short",
    })
    const sign = offsetMins >= 0 ? "+" : "-"
    const abs = Math.abs(offsetMins)
    const h = Math.floor(abs / 60)
    const m = abs % 60
    const label = `UTC${sign}${String(h).padStart(2, "0")}${m ? ":" + String(m).padStart(2, "0") : ""}`
    return { text, label }
  }
  return null
}

export default function TimezoneClock({ professorId, professorName, university }: TimezoneClockProps) {
  const [now, setNow] = useState<Date>(new Date())
  const [editing, setEditing] = useState(false)
  const [input, setInput] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [tz, setTz] = useState<string | null>(null)
  const [resolving, setResolving] = useState(false)

  // Load saved timezone
  useEffect(() => {
    const map = loadMap()
    const saved = map[professorId]
    if (saved) {
      setTz(saved)
      setInput(saved)
    }
  }, [professorId])

  // Tick every 10 minutes
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 600000)
    return () => clearInterval(id)
  }, [])

  // Refresh immediately on mount and when tz changes
  useEffect(() => {
    setNow(new Date())
  }, [tz])

  const formatted = useMemo(() => {
    if (!tz) return null
    return formatInTimezone(now, tz)
  }, [now, tz])

  // One-time auto-resolution using OpenAI (client-side) if timezone missing
  useEffect(() => {
    const shouldResolve = !tz && university && !resolving
    if (!shouldResolve) return

    const key = process.env.NEXT_PUBLIC_OPENAI_API_KEY
    if (!key) return // No key configured; fallback to manual

    let aborted = false
    const controller = new AbortController()

    async function run() {
      try {
        setResolving(true)
        setError(null)
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
          }),
          signal: controller.signal,
        })
        if (!resp.ok) throw new Error(`OpenAI error ${resp.status}`)
        const data = await resp.json()
        let content: string = data.choices?.[0]?.message?.content || ''
        content = content.trim().replace(/^[`\s]*|[`\s]*$/g, '')
        // Try to extract a plausible tz token
        const candidate = content.split(/\s|\n/).find(tok => tok.includes('/') || tok.startsWith('UTC') || tok.startsWith('GMT')) || content
        const cleaned = candidate.replace(/^["']|["']$/g, '')

        if (isValidIana(cleaned) || parseOffsetToMinutes(cleaned) !== null) {
          const map = loadMap()
          map[professorId] = cleaned
          saveMap(map)
          if (!aborted) {
            setTz(cleaned)
            setInput(cleaned)
          }
        } else {
          // Keep silent; allow manual set
          console.warn('OpenAI returned non-timezone content:', content)
        }
      } catch (e) {
        console.warn('Timezone auto-resolution failed:', e)
      } finally {
        if (!aborted) setResolving(false)
      }
    }

    run()
    return () => {
      aborted = true
      controller.abort()
    }
  }, [tz, university, professorName, professorId, resolving])

  const onSave = () => {
    setError(null)
    const val = input.trim()
    if (!val) {
      setError("Timezone is required")
      return
    }
    const ok = isValidIana(val) || parseOffsetToMinutes(val) !== null
    if (!ok) {
      setError("Enter IANA timezone (e.g., America/New_York) or UTC offset (e.g., +05:30)")
      return
    }
    const map = loadMap()
    map[professorId] = val
    saveMap(map)
    setTz(val)
    setEditing(false)
  }

  const onClear = () => {
    const map = loadMap()
    delete map[professorId]
    saveMap(map)
    setTz(null)
    setInput("")
    setEditing(false)
  }

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-2">
          <Clock className="h-4 w-4 text-amber-600 mt-0.5" />
          <div className="text-sm">
            <div className="font-medium text-amber-900">Local Time</div>
            {tz && formatted ? (
              <div className="text-amber-800">
                <span className="font-mono">{formatted.text}</span>
                <span className="ml-2 text-xs text-amber-700">({formatted.label})</span>
              </div>
            ) : resolving ? (
              <div className="text-amber-800">Estimating timezone…</div>
            ) : (
              <div className="text-amber-800">Set timezone for accurate local time</div>
            )}
            {university && (
              <div className="text-xs text-amber-700 mt-1">Professor: {professorName || ""} • {university}</div>
            )}
            {editing && (
              <div className="mt-2 space-y-1">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="e.g., America/New_York or +05:30"
                />
                {error && <div className="text-xs text-red-600">{error}</div>}
                <div className="flex gap-2 mt-1">
                  <Button size="sm" onClick={onSave} className="h-7 px-2">
                    <Save className="h-3.5 w-3.5 mr-1" /> Save
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setEditing(false)} className="h-7 px-2">
                    <X className="h-3.5 w-3.5 mr-1" /> Cancel
                  </Button>
                  {tz && (
                    <Button size="sm" variant="outline" onClick={onClear} className="h-7 px-2 text-red-600 hover:text-red-700 hover:bg-red-50">
                      Clear
                    </Button>
                  )}
                </div>
                <div className="text-[11px] text-amber-700">
                  Tip: Use IANA timezone like "Europe/London" or UTC offset like "+05:30".
                </div>
              </div>
            )}
          </div>
        </div>
        {!editing && (
          <Button size="sm" variant="outline" onClick={() => setEditing(true)} className="h-7 px-2">
            <Edit2 className="h-3.5 w-3.5 mr-1" /> {tz ? "Edit" : "Set"}
          </Button>
        )}
      </div>
    </div>
  )
}
