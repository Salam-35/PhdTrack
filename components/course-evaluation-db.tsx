"use client"

import { useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Loader2, Plus, Trash2, Save, Wand2 } from "lucide-react"
import { db, type CourseEvaluation, type CourseEvaluationCourse } from "@/lib/supabase"
import { useUser } from "@/components/UserProvider"
import { extractCoursesWithOpenAI } from "@/lib/course-extraction"

type GradeMap = Record<string, number>

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

function computeCGPA(courses: CourseEvaluationCourse[], includeMap: Record<string, boolean>, gradeMap: GradeMap) {
  let totalPoints = 0
  let totalCredits = 0
  for (const c of courses) {
    const include = includeMap[c.id] !== false // default include
    if (!include) continue
    const gp = gradeMap[c.grade?.toUpperCase()] ?? null
    if (gp === null || gp === undefined) continue
    const ch = Number(c.credit_hours) || 0
    totalPoints += gp * ch
    totalCredits += ch
  }
  const cgpa = totalCredits > 0 ? Number((totalPoints / totalCredits).toFixed(3)) : 0
  return { cgpa, totalCredits }
}

export default function CourseEvaluationDB() {
  const { user } = useUser()
  const [loading, setLoading] = useState(false)
  const [evaluations, setEvaluations] = useState<CourseEvaluation[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [courses, setCourses] = useState<CourseEvaluationCourse[]>([])
  const [includeMap, setIncludeMap] = useState<Record<string, boolean>>({})
  const [gradeMap, setGradeMap] = useState<GradeMap>({ ...defaultGradeMap })
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    if (!user?.id) return
    (async () => {
      setLoading(true)
      try {
        const list = await db.getCourseEvaluations(user.id)
        setEvaluations(list)
        // Do not auto-select; require user to pick from dropdown
        if (!selectedId) setSelectedId(null)
      } finally {
        setLoading(false)
      }
    })()
  }, [user?.id])

  // Listen for external updates (e.g., saved from local extractor)
  useEffect(() => {
    function onUpdated(e: any) {
      const evalId = e?.detail?.evaluationId as string | undefined
      ;(async () => {
        setLoading(true)
        try {
          const list = await db.getCourseEvaluations(user?.id)
          setEvaluations(list)
          if (evalId) setSelectedId(evalId)
        } finally {
          setLoading(false)
        }
      })()
    }
    window.addEventListener('course-eval:updated', onUpdated as any)
    return () => window.removeEventListener('course-eval:updated', onUpdated as any)
  }, [user?.id])

  useEffect(() => {
    if (!selectedId) return
    ;(async () => {
      setLoading(true)
      try {
        const rows = await db.getEvaluationCourses(selectedId)
        setCourses(rows)
        // Reset include map (all included by default)
        const map: Record<string, boolean> = {}
        rows.forEach(r => { map[r.id] = true })
        setIncludeMap(map)
      } finally {
        setLoading(false)
      }
    })()
  }, [selectedId])

  const { cgpa, totalCredits } = useMemo(() => computeCGPA(courses, includeMap, gradeMap), [courses, includeMap, gradeMap])

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

  // Creation UI removed; use the extractor's Save to Database instead

  const updateEvalMeta = async (id: string, patch: Partial<Pick<CourseEvaluation, 'name' | 'level'>>) => {
    setEvaluations(prev => prev.map(e => e.id === id ? { ...e, ...patch } as CourseEvaluation : e))
    await db.updateCourseEvaluation(id, patch)
  }

  const deleteEvaluation = async (id: string) => {
    if (!confirm('Delete this evaluation and its courses?')) return
    setLoading(true)
    try {
      await db.deleteCourseEvaluation(id)
      setEvaluations(prev => prev.filter(e => e.id !== id))
      if (selectedId === id) {
        setSelectedId(null)
        setCourses([])
      }
    } finally {
      setLoading(false)
    }
  }

  const addCourse = async () => {
    if (!selectedId) return
    const created = await db.addEvaluationCourse(selectedId, { code: "", name: "", grade: "", credit_hours: 0 })
    setCourses(prev => [...prev, created])
    setIncludeMap(prev => ({ ...prev, [created.id]: true }))
  }

  const updateCourse = async (id: string, patch: Partial<Pick<CourseEvaluationCourse, 'code' | 'name' | 'grade' | 'credit_hours'>>) => {
    setCourses(prev => prev.map(c => c.id === id ? { ...c, ...patch } as CourseEvaluationCourse : c))
    await db.updateEvaluationCourse(id, patch)
  }

  const removeCourse = async (id: string) => {
    await db.deleteEvaluationCourse(id)
    setCourses(prev => prev.filter(c => c.id !== id))
    setIncludeMap(prev => { const m = { ...prev }; delete m[id]; return m })
  }

  async function ensurePdfJs(): Promise<any | null> {
    const w = window as any
    if (w.pdfjsLib) return w.pdfjsLib
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
    try { pdfjsLib.GlobalWorkerOptions.workerSrc = `${base}/pdf.worker.min.js` } catch {}
    return pdfjsLib
  }

  async function parsePdf(file: File): Promise<string | null> {
    try {
      const pdfjsLib = await ensurePdfJs()
      if (!pdfjsLib) return null
      const buf = await file.arrayBuffer()
      const pdf = await pdfjsLib.getDocument({ data: buf }).promise
      let text = ''
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i)
        const content = await page.getTextContent()
        text += (content.items || []).map((it: any) => it.str || '').join(' ') + '\n'
      }
      return text.replace(/\s+/g, ' ').trim()
    } catch {
      return null
    }
  }

  async function extractWithAIFromFile(file: File) {
    try {
      setLoading(true)
      setMessage(null)
      const parsed = await parsePdf(file)
      const text = parsed || await file.text()
      const key = process.env.NEXT_PUBLIC_OPENAI_API_KEY
      if (!key) { setMessage('Missing NEXT_PUBLIC_OPENAI_API_KEY'); return }
      if (!selectedId) { setMessage('Select an evaluation first.'); return }
      if ((!file || file.size === 0) && (!text || text.trim().length < 20)) { setMessage('Transcript appears empty'); return }

      const result = await extractCoursesWithOpenAI({ apiKey: key, transcriptText: text, file })
      if (!selectedId) return
      if (!result.courses.length) { setMessage('No courses found by AI'); return }
      for (const course of result.courses) {
        const created = await db.addEvaluationCourse(selectedId, {
          code: course.code,
          name: course.name,
          grade: course.grade.toUpperCase(),
          credit_hours: Number(course.creditHours) || 0,
        })
        setCourses(prev => [...prev, created])
        setIncludeMap(prev => ({ ...prev, [created.id]: true }))
      }
      const from = result.meta.source === 'file' ? 'file analysis' : 'text analysis'
      const chunkNote = result.meta.chunks > 1 ? ` across ${result.meta.chunks} chunks` : ''
      setMessage(`Added ${result.courses.length} AI extracted courses via ${from}${chunkNote}.`)
    } catch (e: any) {
      setMessage(`Extraction failed: ${e?.message || e}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="shadow-lg">
      <CardHeader className="bg-gradient-to-r from-slate-50 to-gray-50 border-b">
        <CardTitle className="flex items-center justify-between text-xl">
          <div className="flex items-center gap-3">
            <span>Saved Course Evaluations</span>
            {selectedId && <Badge variant="secondary">{courses.length} courses</Badge>}
          </div>
          {loading && <Loader2 className="h-4 w-4 animate-spin text-gray-500" />}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        {/* Create / List Evaluations */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-3">
            <Label>Evaluations</Label>
            <div className="flex items-center gap-2 mt-2">
              <Select
                value={selectedId || '__none__'}
                onValueChange={(v) => {
                  if (v === '__none__') setSelectedId(null)
                  else setSelectedId(v)
                }}
              >
                <SelectTrigger className="w-full max-w-md">
                  <SelectValue placeholder={evaluations.length ? 'Select an evaluation' : 'No evaluations'} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">Select none</SelectItem>
                  {evaluations.map(ev => (
                    <SelectItem key={ev.id} value={ev.id}>
                      {ev.name} <span className="text-xs text-gray-600">[{ev.level}]</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                variant="ghost"
                size="sm"
                disabled={!selectedId}
                onClick={() => { if (selectedId) deleteEvaluation(selectedId) }}
                className="text-red-600 hover:bg-red-50"
                title="Delete selected evaluation"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
            {evaluations.length === 0 && (
              <div className="text-sm text-gray-600 mt-2">No evaluations yet</div>
            )}
          </div>
        </div>

        {!selectedId && (
          <div className="border-t pt-6 text-sm text-gray-600">Select an evaluation to view its courses.</div>
        )}

        {selectedId && (
          <div className="space-y-6 border-t pt-6">
            {/* Meta */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Evaluation Name</Label>
                <Input value={evaluations.find(e => e.id === selectedId)?.name || ''} onChange={(e) => updateEvalMeta(selectedId, { name: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Level</Label>
                <Select value={evaluations.find(e => e.id === selectedId)?.level || 'Bachelor'} onValueChange={(v) => updateEvalMeta(selectedId, { level: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Bachelor">Bachelor</SelectItem>
                    <SelectItem value="Masters">Masters</SelectItem>
                    <SelectItem value="PhD">PhD</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Import from Transcript</Label>
                <Input type="file" accept=".pdf,.txt,.text" onChange={(e) => e.target.files?.[0] && extractWithAIFromFile(e.target.files[0])} />
              </div>
            </div>

            {/* Grade map */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Grade to GPA Mapping</Label>
                <span className="text-xs text-gray-600">Local only</span>
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

            {/* Courses table */}
            <div className="flex items-center justify-between">
              <Label>Courses</Label>
              <div className="flex items-center gap-2">
                {message && <div className="text-sm text-amber-700 bg-amber-50 border border-amber-200 px-2 py-1 rounded">{message}</div>}
                <Button onClick={addCourse}><Plus className="h-4 w-4 mr-1" /> Add Row</Button>
              </div>
            </div>
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
                        <input type="checkbox" checked={includeMap[c.id] !== false} onChange={(e) => setIncludeMap(prev => ({ ...prev, [c.id]: e.target.checked }))} />
                      </td>
                      <td className="px-3 py-2">
                        <Input value={c.code} onChange={(e) => setCourses(prev => prev.map(r => r.id === c.id ? { ...r, code: e.target.value } : r))} onBlur={(e) => updateCourse(c.id, { code: e.target.value })} className="h-8 w-28" />
                      </td>
                      <td className="px-3 py-2 min-w-[240px]">
                        <Input value={c.name} onChange={(e) => setCourses(prev => prev.map(r => r.id === c.id ? { ...r, name: e.target.value } : r))} onBlur={(e) => updateCourse(c.id, { name: e.target.value })} className="h-8" />
                      </td>
                      <td className="px-3 py-2">
                        <Input value={c.grade} onChange={(e) => setCourses(prev => prev.map(r => r.id === c.id ? { ...r, grade: e.target.value.toUpperCase() } : r))} onBlur={(e) => updateCourse(c.id, { grade: e.target.value.toUpperCase() })} className="h-8 w-20" />
                      </td>
                      <td className="px-3 py-2">
                        <Input type="number" step="0.5" value={c.credit_hours} onChange={(e) => setCourses(prev => prev.map(r => r.id === c.id ? { ...r, credit_hours: parseFloat(e.target.value) || 0 } : r))} onBlur={(e) => updateCourse(c.id, { credit_hours: parseFloat(e.target.value) || 0 })} className="h-8 w-24" />
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex gap-1">
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

            {/* Summary */}
            <div className="flex items-center justify-between border-t pt-4">
              <div className="text-sm text-gray-600">Total Credits: <span className="font-medium text-gray-900">{totalCredits}</span></div>
              <div className="text-lg">CGPA: <span className="font-semibold">{cgpa.toFixed(3)}</span></div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
