export type UniversityTermDeadline = {
  term: string
  deadline: string
}

const DEFAULT_TERM_PREFIX = "Deadline"

export function parseDeadline(date: string | undefined | null): Date | null {
  if (!date) return null
  const parsed = new Date(date)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

export function sanitizeDeadlines(
  deadlines?: any,
  fallbackDeadline?: string
): UniversityTermDeadline[] {
  const raw: any[] = Array.isArray(deadlines) ? deadlines : []
  const cleaned: UniversityTermDeadline[] = raw
    .map((entry, index) => {
      const term = typeof entry?.term === "string" ? entry.term.trim() : ""
      const deadline =
        typeof entry?.deadline === "string" ? entry.deadline.trim() : ""
      const parsed = parseDeadline(deadline)
      if (!parsed) return null
      return {
        term: term || `${DEFAULT_TERM_PREFIX} ${index + 1}`,
        deadline,
      }
    })
    .filter((entry): entry is UniversityTermDeadline => Boolean(entry))

  if ((!cleaned || cleaned.length === 0) && fallbackDeadline) {
    const fallbackParsed = parseDeadline(fallbackDeadline)
    if (fallbackParsed) {
      cleaned.push({
        term: `${DEFAULT_TERM_PREFIX} 1`,
        deadline: fallbackDeadline,
      })
    }
  }

  cleaned.sort((a, b) => {
    const da = parseDeadline(a.deadline)?.getTime() ?? 0
    const db = parseDeadline(b.deadline)?.getTime() ?? 0
    return da - db
  })

  return cleaned
}

export function getDeadlineInfo(
  deadlines: UniversityTermDeadline[],
  now = new Date()
) {
  const nowTs = now.getTime()
  let currentIndex = deadlines.findIndex((deadline) => {
    const parsed = parseDeadline(deadline.deadline)
    return parsed ? parsed.getTime() >= nowTs : false
  })

  let isPast = false
  if (currentIndex === -1) {
    currentIndex = deadlines.length - 1
    isPast = true
  }

  const current =
    currentIndex >= 0 && currentIndex < deadlines.length
      ? deadlines[currentIndex]
      : null
  const next =
    currentIndex >= 0 && currentIndex + 1 < deadlines.length
      ? deadlines[currentIndex + 1]
      : null

  return {
    current,
    next,
    isPast,
    all: deadlines,
  }
}

export function daysUntilDeadline(
  deadline: UniversityTermDeadline | null,
  now = new Date()
): number | null {
  if (!deadline) return null
  const parsed = parseDeadline(deadline.deadline)
  if (!parsed) return null
  const diff = Math.ceil(
    (parsed.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  )
  return diff
}

export function formatDeadlineLabel(deadline: UniversityTermDeadline): string {
  const parsed = parseDeadline(deadline.deadline)
  if (!parsed) return `${deadline.term}`
  return `${deadline.term}: ${parsed.toLocaleDateString()}`
}
