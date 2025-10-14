type RawCourse = {
  code: string
  name: string
  grade: string
  creditHours: number
}

type ExtractResult = {
  courses: RawCourse[]
  meta: {
    source: "file" | "text"
    usedFileUpload: boolean
    chunks: number
  }
}

// Removed file upload endpoint
const OPENAI_CHAT_ENDPOINT = "https://api.openai.com/v1/chat/completions"
const CHUNK_CHARACTER_LIMIT = 12000 // Reduced for better processing

const COURSE_SCHEMA = {
  name: "course_list",
  strict: true,
  schema: {
    type: "object",
    properties: {
      courses: {
        type: "array",
        items: {
          type: "object",
          additionalProperties: false,
          required: ["code", "name", "grade", "creditHours"],
          properties: {
            code: {
              type: "string",
              description: "Course code/number such as CSE101, MATH-201, PHYS 101, ENG1101. Extract from course listings. Use empty string only if completely unavailable."
            },
            name: {
              type: "string",
              description: "Full descriptive course title/name such as 'Introduction to Computer Science', 'Calculus I', 'General Physics'."
            },
            grade: {
              type: "string",
              description: "Final letter or numeric grade: A, A-, B+, B, B-, C+, C, C-, D+, D, F, P, NP, W, I, or numeric like 4.0, 3.7, etc. Always uppercase letters."
            },
            creditHours: {
              type: "number",
              description: "Credit hours for the course, typically 1-6 credits. Common values: 1 (labs), 3-4 (regular courses), 6 (intensive courses). Infer reasonable values based on course type if not explicit.",
              minimum: 0,
              maximum: 10
            }
          }
        }
      }
    },
    additionalProperties: false,
    required: ["courses"]
  }
}

const SYSTEM_INSTRUCTIONS = [
  "You are an expert academic transcript analyst with deep knowledge of university grading systems and transcript formats.",
  "Your task is to extract EVERY individual course record from academic documents with high accuracy.",
  "INCLUDE: Individual course entries with codes, names, grades, and credit hours.",
  "EXCLUDE: Headers, footers, semester summaries, cumulative totals, GPA calculations, degree requirements, student info.",
  "Course patterns to recognize:",
  "- Codes: CSE101, MATH-201, PHYS 101, ENG1101, BIO 205, CHEM120, etc.",
  "- Names: Full course titles, not abbreviations",
  "- Grades: A, A-, B+, B, B-, C+, C, C-, D+, D, F, P/PASS, NP/NO PASS, W/WITHDRAW, I/INCOMPLETE, or numeric (4.0, 3.7, etc.)",
  "- Credits: Usually 1-6, commonly 3-4 for lectures, 1 for labs, 0-1 for seminars",
  "Handle various transcript formats: tabular, list-based, or paragraph style.",
  "For missing credit hours, infer intelligently: lab courses=1, regular courses=3, intensive=4-6.",
  "Maintain course sequence and include repeated courses if they appear multiple times.",
  "Always return valid JSON with a 'courses' array containing objects with code, name, grade, creditHours fields.",
  "Be thorough - missing courses is worse than including borderline cases.",
].join(" ")

type OpenAIResponse = {
  output?: Array<{
    type?: string
    role?: string
    content?: Array<any>
    text?: string
    json?: unknown
  }>
  output_text?: string
  choices?: Array<{
    message?: {
      content?: string
    }
  }>
}

async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result as string
      if (!result || !result.includes(',')) {
        reject(new Error('Failed to read file as base64'))
        return
      }
      const base64 = result.split(',')[1]
      if (!base64) {
        reject(new Error('Invalid base64 data from file'))
        return
      }
      resolve(base64)
    }
    reader.onerror = () => reject(new Error('FileReader error: Unable to read file'))
    reader.readAsDataURL(file)
  })
}

function sanitizeTranscriptText(text: string): string {
  return text
    .replace(/\r\n/g, "\n") // Normalize line endings
    .replace(/\u00A0/g, " ") // Replace non-breaking spaces
    .replace(/[ \t]+\n/g, "\n") // Remove trailing whitespace
    .replace(/\n{3,}/g, "\n\n") // Collapse multiple newlines
    .replace(/[\x00-\x1F\x7F]/g, "") // Remove control characters except newlines/tabs
    .replace(/\t+/g, " ") // Replace tabs with spaces
    .replace(/ {2,}/g, " ") // Collapse multiple spaces
    .trim()
}

function chunkTranscriptText(text: string, chunkSize: number): string[] {
  if (text.length <= chunkSize) return [text]

  const chunks: string[] = []
  let start = 0
  const total = text.length

  while (start < total) {
    let end = Math.min(start + chunkSize, total)

    // Try to break at natural boundaries
    if (end < total) {
      // First try to break at double newlines (paragraph breaks)
      const paragraphBreak = text.lastIndexOf("\n\n", end)
      if (paragraphBreak > start + Math.floor(chunkSize * 0.4)) {
        end = paragraphBreak
      } else {
        // Fall back to single newline
        const lineBreak = text.lastIndexOf("\n", end)
        if (lineBreak > start + Math.floor(chunkSize * 0.3)) {
          end = lineBreak
        }
      }
    }

    // Ensure we make progress
    if (end <= start) {
      end = Math.min(start + chunkSize, total)
    }

    const chunk = text.slice(start, end).trim()
    if (chunk) {
      chunks.push(chunk)
    }

    start = end
  }

  return chunks
}

function normalizeCourse(raw: any): RawCourse {
  const code = (raw?.code ?? "").toString().trim().replace(/\s+/g, " ")
  const name = (raw?.name ?? "").toString().trim().replace(/\s+/g, " ")
  let grade = (raw?.grade ?? "").toString().trim().toUpperCase()

  // Normalize common grade variations
  grade = grade.replace(/PASS/gi, "P").replace(/NO\s*PASS/gi, "NP")
  grade = grade.replace(/WITHDRAW/gi, "W").replace(/INCOMPLETE/gi, "I")

  const creditHoursRaw = Number(raw?.creditHours)
  let creditHours = Number.isFinite(creditHoursRaw) && creditHoursRaw >= 0 ? Number(creditHoursRaw.toFixed(2)) : 0

  // Intelligent credit hour inference if missing
  if (creditHours === 0 && name) {
    const nameLower = name.toLowerCase()
    if (nameLower.includes("lab") || nameLower.includes("laboratory")) {
      creditHours = 1
    } else if (nameLower.includes("seminar") || nameLower.includes("workshop")) {
      creditHours = 1
    } else if (nameLower.includes("independent study") || nameLower.includes("research")) {
      creditHours = 3
    } else if (nameLower.includes("capstone") || nameLower.includes("thesis")) {
      creditHours = 3
    } else {
      // Default for regular courses
      creditHours = 3
    }
  }

  return { code, name, grade, creditHours }
}

function mergeCourses(existing: RawCourse, incoming: RawCourse): RawCourse {
  const next = { ...existing }
  if (!next.code && incoming.code) next.code = incoming.code
  if (incoming.name && incoming.name.length > next.name.length) next.name = incoming.name
  if (!next.grade && incoming.grade) next.grade = incoming.grade
  if (next.creditHours === 0 && incoming.creditHours > 0) next.creditHours = incoming.creditHours
  return next
}

function dedupeCourses(courses: RawCourse[]): RawCourse[] {
  const map = new Map<string, RawCourse>()

  for (const course of courses) {
    // Skip empty/invalid courses
    if (!course.code && !course.name) continue
    if (course.name.length < 3) continue // Skip very short names

    const normCode = course.code.replace(/\s+/g, "").toUpperCase()
    const normName = course.name.toLowerCase().trim()

    // Create a more sophisticated key for deduplication
    const key = `${normCode || normName.substring(0, 20)}::${course.grade}::${course.creditHours}`

    const existing = map.get(key)
    if (existing) {
      map.set(key, mergeCourses(existing, course))
    } else {
      map.set(key, course)
    }
  }

  return Array.from(map.values()).filter(course =>
    // Final validation - ensure we have meaningful data
    (course.code && course.code.length > 0) ||
    (course.name && course.name.length > 3)
  )
}

function extractJsonArrayFromResponse(data: OpenAIResponse | any): any[] {
  if (!data) return []

  // Handle standard chat completions response
  if (Array.isArray((data as any).choices)) {
    for (const choice of (data as any).choices) {
      const content = choice?.message?.content
      if (typeof content === "string") {
        try {
          const parsed = JSON.parse(content.trim())
          // Extract courses array from the structured response
          if (parsed?.courses && Array.isArray(parsed.courses)) {
            return parsed.courses
          }
          // Fallback for direct array response
          return Array.isArray(parsed) ? parsed : []
        } catch (error) {
          console.warn('Failed to parse JSON from OpenAI response:', error)
          return []
        }
      }
    }
  }

  // Legacy response format handling
  const inspectContent = (content: any): any | null => {
    if (!content) return null
    if (Array.isArray(content)) {
      for (const item of content) {
        const found = inspectContent(item)
        if (found) return found
      }
      return null
    }
    if (typeof content === "string") {
      const trimmed = content.trim()
      try {
        const parsed = JSON.parse(trimmed)
        return parsed
      } catch {
        return null
      }
    }
    if (typeof content === "object") {
      if (Array.isArray((content as any).json)) {
        return (content as any).json
      }
      if (typeof (content as any).json === "object") {
        return (content as any).json
      }
      if (typeof (content as any).text === "string") {
        const trimmed = (content as any).text.trim()
        try {
          const parsed = JSON.parse(trimmed)
          return parsed
        } catch {
          return null
        }
      }
    }
    return null
  }

  if (Array.isArray((data as any).output)) {
    for (const item of (data as any).output) {
      if (!item) continue
      if (Array.isArray(item.content)) {
        const found = inspectContent(item.content)
        if (found) return Array.isArray(found) ? found : (found?.courses ?? [])
      }
      if (item.json) {
        if (Array.isArray(item.json)) return item.json
        if (item.json?.courses && Array.isArray(item.json.courses)) return item.json.courses
      }
      if (typeof item.text === "string") {
        const attempt = inspectContent(item.text)
        if (attempt) return Array.isArray(attempt) ? attempt : attempt.courses ?? []
      }
    }
  }

  if (typeof data === "string") {
    try {
      const parsed = JSON.parse(data.trim())
      return Array.isArray(parsed) ? parsed : parsed?.courses ?? []
    } catch {}
  }

  return []
}

// Removed file upload functions as we're using vision API directly

async function callOpenAIChat(apiKey: string, payload: Record<string, unknown>): Promise<any> {
  const resp = await fetch(OPENAI_CHAT_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(payload),
  })

  if (!resp.ok) {
    const detail = await resp.text().catch(() => "")
    throw new Error(`OpenAI response error (${resp.status}): ${detail}`)
  }

  return resp.json()
}

async function extractViaFile(apiKey: string, file: File): Promise<RawCourse[]> {
  try {
    // Check file type
    const isImage = file.type.startsWith('image/') ||
                   /\.(jpg|jpeg|png|gif|bmp|webp)$/i.test(file.name)
    const isPDF = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')

    if (isImage) {
      // For image files, use vision API
      const base64Data = await fileToBase64(file)

      const payload = {
        model: "gpt-4o-mini",
        temperature: 0,
        response_format: {
          type: "json_schema",
          json_schema: COURSE_SCHEMA
        },
        messages: [
          {
            role: "system",
            content: SYSTEM_INSTRUCTIONS
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Analyze this transcript/grade sheet image and extract ALL individual course records. Look carefully for course codes, names, grades, and credit hours in tables or lists. Return a JSON object with a 'courses' array containing all found courses. Ignore header rows, totals, semester summaries, and cumulative GPA information. Focus on individual course entries only."
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:${file.type};base64,${base64Data}`,
                  detail: "high"
                }
              }
            ]
          }
        ]
      }

      const data = await callOpenAIChat(apiKey, payload)
      const parsed = extractJsonArrayFromResponse(data)
      const array = Array.isArray(parsed) ? parsed : []
      return dedupeCourses(array.map(normalizeCourse))
    } else if (isPDF) {
      // For PDF files, we need to extract text first since vision API doesn't support PDFs
      throw new Error("PDF files are not directly supported. Please convert your PDF to text or upload as an image (PNG/JPG). You can use the text input area to paste transcript content instead.")
    } else {
      // For text files and other readable formats
      try {
        const text = await file.text()
        if (!text || text.trim().length < 10) {
          throw new Error("File appears to be empty or unreadable. Please check the file format.")
        }
        return extractViaText(apiKey, text)
      } catch (textError) {
        throw new Error(`Unable to read file as text. Supported formats: images (PNG, JPG, etc.) and text files. Error: ${textError}`)
      }
    }
  } catch (error) {
    console.error('File extraction error:', error)
    // Re-throw with more helpful message
    if (error instanceof Error) {
      throw error
    }
    throw new Error(`File processing failed: ${error}`)
  }
}

async function extractViaText(apiKey: string, transcriptText: string): Promise<RawCourse[]> {
  const cleaned = sanitizeTranscriptText(transcriptText)
  if (!cleaned) return []
  const chunks = chunkTranscriptText(cleaned, CHUNK_CHARACTER_LIMIT)
  const collected: RawCourse[] = []

  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i]
    const prompt = `This is transcript chunk ${i + 1} of ${chunks.length}.

Analyze the following text and extract ALL individual course records. Look for patterns like:
- Course codes (CSE101, MATH-201, etc.)
- Course names/titles
- Grades (A, B+, C-, etc.)
- Credit hours (usually 1-6)

Ignore:
- Headers and repeated text
- Semester totals and GPA summaries
- Credit hour totals
- Administrative text

Transcript text:
${chunk}`

    const payload = {
      model: "gpt-4o-mini",
      temperature: 0,
      response_format: {
        type: "json_schema",
        json_schema: COURSE_SCHEMA
      },
      messages: [
        {
          role: "system",
          content: SYSTEM_INSTRUCTIONS
        },
        {
          role: "user",
          content: prompt
        }
      ]
    }

    try {
      const data = await callOpenAIChat(apiKey, payload)
      const parsed = extractJsonArrayFromResponse(data)
      if (Array.isArray(parsed)) {
        collected.push(...parsed.map(normalizeCourse))
      }
    } catch (error) {
      console.error(`Error processing chunk ${i + 1}:`, error)
      // Continue with other chunks even if one fails
    }
  }

  return dedupeCourses(collected)
}

export async function extractCoursesWithOpenAI(params: {
  apiKey: string
  transcriptText?: string
  file?: File | null
}): Promise<ExtractResult> {
  const { apiKey, transcriptText, file } = params
  if (!apiKey) throw new Error("Missing OpenAI API key. Please configure your OpenAI API key in the settings.")

  let lastError: Error | null = null
  let fileProcessed = false

  // Try file processing first if provided
  if (file) {
    try {
      const courses = await extractViaFile(apiKey, file)
      fileProcessed = true
      if (courses.length > 0) {
        return { courses, meta: { source: "file", usedFileUpload: true, chunks: 1 } }
      }
    } catch (err: any) {
      lastError = err instanceof Error ? err : new Error(String(err))
      fileProcessed = true

      // If file processing failed but we have text as fallback, continue
      if (!transcriptText || !transcriptText.trim()) {
        throw lastError
      }
    }
  }

  // Try text processing if available
  if (transcriptText && transcriptText.trim()) {
    try {
      const courses = await extractViaText(apiKey, transcriptText)
      if (courses.length > 0) {
        return {
          courses,
          meta: {
            source: "text",
            usedFileUpload: Boolean(file),
            chunks: Math.max(1, chunkTranscriptText(sanitizeTranscriptText(transcriptText), CHUNK_CHARACTER_LIMIT).length),
          },
        }
      }
    } catch (textError) {
      const textErr = textError instanceof Error ? textError : new Error(String(textError))
      if (lastError) {
        // Both file and text failed
        throw new Error(`Both file and text processing failed. File error: ${lastError.message}. Text error: ${textErr.message}`)
      } else {
        throw textErr
      }
    }
  }

  // No courses found in either method
  if (lastError) {
    throw lastError
  }

  const noDataError = !file && !transcriptText
    ? "No file or text provided for course extraction."
    : "No courses found in the provided data. Please check that your transcript contains course information with codes, names, and grades."

  throw new Error(noDataError)
}

export type { RawCourse, ExtractResult }
