"use client"

import { useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Loader2, Wand2, Trash2, Plus } from "lucide-react"
import { db } from "@/lib/supabase"
import { useUser } from "@/components/UserProvider"
import { extractCoursesWithOpenAI } from "@/lib/course-extraction"

type Course = {
  id: string
  code: string
  name: string
  grade: string
  creditHours: number
  included: boolean
}

type GradeMap = Record<string, number>

const STORAGE_KEY = "course_eval_v1"

function loadStored(): { courses: Course[]; gradeMap: GradeMap } | null {
  if (typeof window === "undefined") return null
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function saveStored(data: { courses: Course[]; gradeMap: GradeMap }) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch {}
}

const defaultGradeMap: GradeMap = {
  "A+": 4.0,
  "A": 3.75,
  "A-": 3.5,
  "B+": 3.25,
  "B": 3.0,
  "B-": 2.75,
  "C+": 2.5,
  "C": 2.25,
  "C-": 2.0,
  "D": 1.0,
  "F": 0.0,
}

function asciiExtractFromPdfBuffer(buf: ArrayBuffer): string {
  const bytes = new Uint8Array(buf)
  let out = ""
  for (let i = 0; i < bytes.length; i++) {
    const b = bytes[i]
    if ((b >= 32 && b <= 126) || b === 9 || b === 10 || b === 13) {
      out += String.fromCharCode(b)
    } else {
      out += " "
    }
  }
  // Reduce multiple spaces/newlines
  out = out.replace(/\s+/g, " ").trim()
  return out
}

async function ensurePdfJs(): Promise<any | null> {
  if (typeof window === 'undefined') return null
  const w = window as any
  if (w.pdfjsLib) return w.pdfjsLib

  // Inject UMD scripts at runtime
  const base = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build'

  await new Promise<void>((resolve, reject) => {
    const s = document.createElement('script')
    s.src = `${base}/pdf.min.js`
    s.async = true
    s.onload = () => resolve()
    s.onerror = () => reject(new Error('Failed to load pdf.min.js'))
    document.head.appendChild(s)
  })

  const pdfjsLib = (window as any).pdfjsLib
  if (!pdfjsLib) return null
  try {
    pdfjsLib.GlobalWorkerOptions.workerSrc = `${base}/pdf.worker.min.js`
  } catch {}
  return pdfjsLib
}

async function extractPdfTextWithPdfJs(file: File): Promise<string | null> {
  try {
    const pdfjsLib = await ensurePdfJs()
    if (!pdfjsLib) return null
    const buf = await file.arrayBuffer()
    const task = pdfjsLib.getDocument({ data: buf })
    const pdf = await task.promise
    let fullText = ''
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i)
      const content = await page.getTextContent()
      const pageText = (content.items || []).map((it: any) => (it.str || '')).join(' ')
      fullText += pageText + '\n'
    }
    return fullText.replace(/\s+/g, ' ').trim()
  } catch (e) {
    console.warn('PDF.js extraction failed:', e)
    return null
  }
}

function computeCGPA(courses: Course[], gradeMap: GradeMap): { cgpa: number; totalCredits: number } {
  let totalPoints = 0
  let totalCredits = 0
  for (const c of courses) {
    if (!c.included) continue
    const gp = gradeMap[c.grade?.toUpperCase()] ?? null
    if (gp === null || gp === undefined) continue
    const ch = Number(c.creditHours) || 0
    totalPoints += gp * ch
    totalCredits += ch
  }
  return {
    cgpa: totalCredits > 0 ? Number((totalPoints / totalCredits).toFixed(3)) : 0,
    totalCredits,
  }
}

export default function CourseEvaluator() {
  const { user } = useUser()
  const [courses, setCourses] = useState<Course[]>([])
  const [gradeMap, setGradeMap] = useState<GradeMap>({ ...defaultGradeMap })
  const [file, setFile] = useState<File | null>(null)
  const [transcriptText, setTranscriptText] = useState("")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [saveName, setSaveName] = useState("")
  const [saveLevel, setSaveLevel] = useState("Bachelor")
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const stored = loadStored()
    if (stored) {
      setCourses(stored.courses || [])
      setGradeMap(stored.gradeMap || { ...defaultGradeMap })
    }
  }, [])

  useEffect(() => {
    saveStored({ courses, gradeMap })
  }, [courses, gradeMap])

  const { cgpa, totalCredits } = useMemo(() => computeCGPA(courses, gradeMap), [courses, gradeMap])

  const sortedCourses = useMemo(() => {
    const getNum = (code: string) => {
      const m = (code || '').match(/(\d{4})/)
      return m ? parseInt(m[1], 10) : Number.MAX_SAFE_INTEGER
    }
    return [...courses].sort((a, b) => {
      const na = getNum(a.code)
      const nb = getNum(b.code)
      if (na !== nb) return na - nb
      return (a.code || '').localeCompare(b.code || '')
    })
  }, [courses])

  const handleFileChange = (f: File | null) => {
    setFile(f)
    setMessage(null)
  }

  async function readTranscriptAsText(): Promise<string> {
    if (transcriptText.trim()) return transcriptText.trim()
    if (!file) return ""
    if (file.type === "application/pdf") {
      // Try robust PDF.js first
      const pdfJsText = await extractPdfTextWithPdfJs(file)
      if (pdfJsText && pdfJsText.length > 0) return pdfJsText
      // Fallback to lightweight ASCII extraction
      const buf = await file.arrayBuffer()
      const text = asciiExtractFromPdfBuffer(buf)
      return text
    }
    return await file.text()
  }

  async function extractWithOpenAI() {
    try {
      setLoading(true)
      setMessage(null)
      const text = await readTranscriptAsText()
      const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY
      if (!apiKey) {
        setMessage("Missing NEXT_PUBLIC_OPENAI_API_KEY. Configure it to use AI extraction.")
        return
      }
      if ((!file || file.size === 0) && (!text || text.trim().length < 20)) {
        setMessage("Transcript text appears empty. Try pasting transcript text if PDF parsing fails.")
        return
      }
      const result = await extractCoursesWithOpenAI({ apiKey, transcriptText: text, file })
      const stamp = Date.now()
      const next: Course[] = result.courses.map((course, idx) => ({
        id: `c-${stamp}-${idx}`,
        code: course.code,
        name: course.name,
        grade: course.grade.toUpperCase(),
        creditHours: Number(course.creditHours) || 0,
        included: true,
      }))
      setCourses(next)
      if (next.length === 0) {
        setMessage("No courses found. Consider pasting plain text transcript.")
      } else {
        const from = result.meta.source === "file" ? "file analysis" : "text analysis"
        const chunkNote = result.meta.chunks > 1 ? ` across ${result.meta.chunks} chunks` : ""
        setMessage(`Extracted ${next.length} courses via ${from}${chunkNote}. Review for accuracy.`)
      }
    } catch (e: any) {
      setMessage(`Extraction failed: ${e?.message || e}`)
    } finally {
      setLoading(false)
    }
  }

  const updateCourse = (id: string, patch: Partial<Course>) => {
    setCourses(prev => prev.map(c => c.id === id ? { ...c, ...patch } : c))
  }

  const removeCourse = (id: string) => setCourses(prev => prev.filter(c => c.id !== id))

  const addCourseAfter = (afterId: string) => {
    const newCourse: Course = {
      id: `c-${Date.now()}-${Math.random().toString(36).slice(2,6)}`,
      code: "",
      name: "",
      grade: "",
      creditHours: 0,
      included: true,
    }
    setCourses(prev => {
      const idx = prev.findIndex(c => c.id === afterId)
      if (idx === -1) return [...prev, newCourse]
      const copy = prev.slice()
      copy.splice(idx + 1, 0, newCourse)
      return copy
    })
  }

  const addGradeRow = () => {
    const nextKey = prompt('Enter new grade label (e.g., A+, A, A-, B+):')
    if (!nextKey) return
    if (gradeMap[nextKey]) return
    setGradeMap(prev => ({ ...prev, [nextKey.toUpperCase()]: 0 }))
  }

  async function saveToDatabase() {
    if (!user?.id) { setMessage('Please log in to save.'); return }
    if (!saveName.trim()) { setMessage('Enter a name for this evaluation.'); return }
    if (courses.length === 0) { setMessage('No courses to save.'); return }
    setSaving(true)
    setMessage(null)
    try {
      const evaluation = await db.createCourseEvaluation({ name: saveName.trim(), level: saveLevel })
      // Persist courses
      for (const c of courses) {
        await db.addEvaluationCourse(evaluation.id, {
          code: c.code,
          name: c.name,
          grade: c.grade.toUpperCase(),
          credit_hours: Number(c.creditHours) || 0,
        })
      }
      setMessage(`Saved as "${evaluation.name}". Edit it under Saved Course Evaluations below.`)
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('course-eval:updated', { detail: { evaluationId: evaluation.id } }))
      }
    } catch (e: any) {
      setMessage(`Save failed: ${e?.message || e}`)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Card className="shadow-lg">
      <CardHeader className="bg-gradient-to-r from-slate-50 to-gray-50 border-b">
        <CardTitle className="flex items-center justify-between text-xl">
          <div className="flex items-center gap-3">
            <span>Course-wise Evaluation</span>
            {courses.length > 0 && (
              <Badge variant="secondary">{courses.length} courses</Badge>
            )}
          </div>
          <div className="text-sm text-gray-600">Stored locally</div>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        {/* Input Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="space-y-3">
            <Label>Upload Transcript (PDF or Text)</Label>
            <Input type="file" accept=".pdf,.txt,.text" onChange={(e) => handleFileChange(e.target.files?.[0] || null)} />
            <p className="text-xs text-gray-600">If PDF parsing fails, paste transcript text below and run AI extraction.</p>
          </div>
          <div className="space-y-2">
            <Label>Or Paste Transcript Text</Label>
            <Textarea rows={5} placeholder="Paste transcript text here..." value={transcriptText} onChange={(e) => setTranscriptText(e.target.value)} />
          </div>
        </div>

        <div className="flex gap-2">
          <Button onClick={extractWithOpenAI} disabled={loading} className="bg-purple-600 hover:bg-purple-700">
            {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Wand2 className="h-4 w-4 mr-2" />}
            Extract Courses with AI
          </Button>
          {message && <div className="text-sm text-amber-700 bg-amber-50 border border-amber-200 px-2 py-1 rounded">{message}</div>}
        </div>

        {/* Save to Database */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
          <div>
            <Label>Save as Evaluation Name</Label>
            <Input placeholder="e.g., RUET Bachelor Transcript" value={saveName} onChange={(e) => setSaveName(e.target.value)} />
          </div>
          <div>
            <Label>Level</Label>
            <select className="border rounded h-10 px-2 w-full" value={saveLevel} onChange={(e) => setSaveLevel(e.target.value)}>
              <option value="Bachelor">Bachelor</option>
              <option value="Masters">Masters</option>
              <option value="PhD">PhD</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div>
            <Button onClick={saveToDatabase} disabled={saving || !user?.id || !saveName.trim() || courses.length === 0} className="w-full">
              {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
              Save to Database
            </Button>
          </div>
        </div>

        {/* Grade Map */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Grade to GPA Mapping</Label>
            <Button size="sm" variant="outline" onClick={addGradeRow}><Plus className="h-3 w-3 mr-1" /> Add Grade</Button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
            {Object.entries(gradeMap).map(([g, p]) => (
              <div key={g} className="flex items-center gap-2 border rounded px-2 py-1">
                <Input value={g} readOnly className="h-8 w-16" />
                <Input type="number" step="0.01" value={p} onChange={(e) => setGradeMap(prev => ({ ...prev, [g]: parseFloat(e.target.value) || 0 }))} className="h-8 w-20" />
              </div>
            ))}
          </div>
        </div>

        {/* Courses Table */}
        <div className="space-y-2">
          <Label>Courses</Label>
          {courses.length === 0 ? (
            <div className="text-sm text-gray-600">No courses extracted yet.</div>
          ) : (
            <div className="overflow-x-auto border rounded">
              <table className="min-w-full text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="text-left px-3 py-2">Include</th>
                    <th className="text-left px-3 py-2">Code</th>
                    <th className="text-left px-3 py-2">Course Name</th>
                    <th className="text-left px-3 py-2">Grade</th>
                    <th className="text-left px-3 py-2">Credit Hours</th>
                    <th className="text-left px-3 py-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedCourses.map((c) => (
                    <tr key={c.id} className="border-t">
                      <td className="px-3 py-2">
                        <input type="checkbox" checked={c.included} onChange={(e) => updateCourse(c.id, { included: e.target.checked })} />
                      </td>
                      <td className="px-3 py-2">
                        <Input value={c.code} onChange={(e) => updateCourse(c.id, { code: e.target.value })} className="h-8 w-28" />
                      </td>
                      <td className="px-3 py-2 min-w-[240px]">
                        <Input value={c.name} onChange={(e) => updateCourse(c.id, { name: e.target.value })} className="h-8" />
                      </td>
                      <td className="px-3 py-2">
                        <Input value={c.grade} onChange={(e) => updateCourse(c.id, { grade: e.target.value.toUpperCase() })} className="h-8 w-20" />
                      </td>
                      <td className="px-3 py-2">
                        <Input type="number" step="0.5" value={c.creditHours} onChange={(e) => updateCourse(c.id, { creditHours: parseFloat(e.target.value) || 0 })} className="h-8 w-24" />
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex gap-1">
                          <Button variant="outline" size="sm" onClick={() => addCourseAfter(c.id)} className="h-8 px-2">
                            <Plus className="h-3.5 w-3.5 mr-1" /> Add
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => removeCourse(c.id)} className="text-red-600 hover:bg-red-50 h-8 px-2">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Summary */}
        <div className="flex items-center justify-between border-t pt-4">
          <div className="text-sm text-gray-600">Total Credits: <span className="font-medium text-gray-900">{totalCredits}</span></div>
          <div className="text-lg">CGPA: <span className="font-semibold">{cgpa.toFixed(3)}</span></div>
        </div>
      </CardContent>
    </Card>
  )
}
