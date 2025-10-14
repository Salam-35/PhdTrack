interface CustomSearchItem {
  title?: string
  link?: string
  snippet?: string
  pagemap?: {
    organization?: Array<{ name?: string; url?: string }>
    person?: Array<{ name?: string; url?: string }>
    metatags?: Array<Record<string, string>>
  }
}

interface CustomSearchResponse {
  items?: CustomSearchItem[]
  searchInformation?: {
    totalResults?: string
  }
  error?: {
    code?: number
    message?: string
  }
}

interface ProfessorLink {
  title: string
  url: string
  snippet?: string
}

export interface ProfessorInsights {
  summary: string
  labName?: string
  labWebsite?: string
  personalWebsite?: string
  relatedLinks: ProfessorLink[]
  publications: ProfessorLink[]
  alignedPublications: ProfessorLink[]
  researchTopics: string[]
  usedQueries: string[]
  notes?: string
}

const MAX_SEARCHES = 2
const MAX_LINKS = 5
const LAB_REGEX = /(lab|laboratory|centre|center|group|institute|research\s+(?:center|centre|group|lab)|research team|vision lab|ai lab|machine learning|computer vision|robotics|nlp lab|data science)/i
const GENERIC_EMAIL_DOMAINS = new Set([
  'gmail.com',
  'outlook.com',
  'hotmail.com',
  'yahoo.com',
  'icloud.com',
  'protonmail.com',
  'aol.com',
  'zoho.com',
  'pm.me',
])

const PUBLICATION_KEYWORDS = [
  'journal',
  'conference',
  'proceedings',
  'transactions',
  'ieee',
  'acm',
  'publication',
  'paper',
  'arxiv',
  'springer',
  'elsevier',
  'nature',
  'science',
  'cvpr',
  'iccv',
  'neurips',
  'nips',
  'miccai',
  'pattern recognition',
  'medical imaging',
  'computer vision',
  'deep learning',
  'machine learning',
  'ai',
  'healthcare',
  'analysis',
]

const ALIGNMENT_KEYWORDS = [
  'medical imaging',
  'medical image',
  'healthcare',
  'health care',
  'computer vision',
  'vision',
  'deep learning',
  'machine learning',
  'ai',
  'artificial intelligence',
  'pose estimation',
  'gait',
  'keypoint',
  'segmentation',
  'detection',
  'classification',
  'radiology',
  'medical data',
  'biomedical',
  'clinical',
  'explainable',
  'interpretability',
]

const truncate = (text: string, maxLength: number) => {
  if (!text) return ''
  if (text.length <= maxLength) return text
  return `${text.slice(0, maxLength - 3).trim()}...`
}

const normalizeUrl = (url?: string) => {
  if (!url) return undefined
  try {
    const parsed = new URL(url)
    parsed.hash = ''
    return parsed.toString()
  } catch {
    return url
  }
}

const normalize = (value: string) => value.toLowerCase()

const normalizeUniversityName = (universityName: string) => {
  // Fix only obvious typos, don't try to be smart about abbreviations
  let normalized = universityName.trim()

  // Fix common spelling mistakes
  normalized = normalized.replace(/Univesity/gi, 'University')
  normalized = normalized.replace(/Universty/gi, 'University')
  normalized = normalized.replace(/Unversity/gi, 'University')
  normalized = normalized.replace(/Univeristy/gi, 'University')

  return normalized
}

const textIncludesIdentifier = (text: string | undefined, identifiers: string[]) => {
  if (!text) return false
  const lower = text.toLowerCase()
  return identifiers.some(token => token && lower.includes(token))
}

const extractLabCandidate = (
  item: CustomSearchItem,
  identifiers: string[],
  preferredDomains: string[]
) => {
  const title = item.title || ''
  if (LAB_REGEX.test(title)) {
    const url = normalizeUrl(item.link)
    if (
      textIncludesIdentifier(title, identifiers) ||
      textIncludesIdentifier(item.snippet, identifiers) ||
      (url && preferredDomains.some(domain => url.includes(domain)))
    ) {
      return {
        name: title,
        url,
      }
    }
  }

  const snippet = item.snippet || ''
  if (LAB_REGEX.test(snippet)) {
    const url = normalizeUrl(item.link)
    if (
      textIncludesIdentifier(snippet, identifiers) ||
      (url && preferredDomains.some(domain => url.includes(domain)))
    ) {
      return {
        name: title,
        url,
      }
    }
  }

  const org = item.pagemap?.organization?.find(orgItem => orgItem.name && LAB_REGEX.test(orgItem.name))
  if (org) {
    const url = normalizeUrl(org.url)
    if (
      textIncludesIdentifier(org.name, identifiers) ||
      (url && preferredDomains.some(domain => url.includes(domain)))
    ) {
      return {
        name: org.name,
        url,
      }
    }
  }

  return null
}

const extractPersonalWebsiteCandidate = (
  item: CustomSearchItem,
  professorName: string,
  identifiers: string[],
  preferredDomains: string[]
) => {
  const link = normalizeUrl(item.link)
  if (!link) return null

  const lowerTitle = (item.title || '').toLowerCase()
  const lowerName = professorName.toLowerCase()
  const lastName = lowerName.split(' ').slice(-1)[0] || ''

  if (
    lowerTitle.includes(lowerName) ||
    (lastName && lowerTitle.includes(lastName)) ||
    textIncludesIdentifier(item.snippet, identifiers) ||
    preferredDomains.some(domain => link.includes(domain))
  ) {
    return {
      title: item.title || link,
      url: link,
    }
  }

  const person = item.pagemap?.person?.find(personItem => {
    const candidate = (personItem.name || '').toLowerCase()
    return (
      candidate.includes(lowerName) ||
      (lastName && candidate.includes(lastName))
    )
  })

  if (person) {
    return {
      title: person.name || item.title || link,
      url: normalizeUrl(person.url) || link,
    }
  }

  return null
}

const extractResearchInterests = (items: CustomSearchItem[], professorName: string) => {
  const interests: string[] = []
  const keywords = ['research', 'interest', 'focus', 'work', 'area', 'field', 'study', 'specialize']

  for (const item of items) {
    const text = `${item.title || ''} ${item.snippet || ''}`.toLowerCase()
    if (text.includes(professorName.toLowerCase())) {
      // Extract research-related sentences
      const sentences = text.split(/[.!?]+/)
      for (const sentence of sentences) {
        if (keywords.some(keyword => sentence.includes(keyword)) &&
            sentence.includes(professorName.toLowerCase().split(' ')[0])) {
          interests.push(sentence.trim())
        }
      }
    }
  }

  return Array.from(new Set(interests)).slice(0, 3)
}

const buildSummary = (items: CustomSearchItem[], professorName: string) => {
  if (!items.length) {
    return {
      summary: '',
      researchTopics: [],
    }
  }

  const researchInterests = extractResearchInterests(items, professorName)

  const snippets = items
    .map(item => item.snippet || '')
    .filter(Boolean)
    .filter(snippet => snippet.toLowerCase().includes(professorName.toLowerCase()))

  if (!snippets.length && !researchInterests.length) {
    return {
      summary: '',
      researchTopics: researchInterests,
    }
  }

  const uniqueSnippets = Array.from(new Set(snippets))
  let summary = uniqueSnippets.join(' ').substring(0, 400)

  if (researchInterests.length > 0) {
    summary = `Research Focus: ${researchInterests.join('; ')}. ${summary}`
  }

  return {
    summary: truncate(summary, 600),
    researchTopics: researchInterests,
  }
}

const extractPublications = (items: CustomSearchItem[]) => {
  const publications: ProfessorLink[] = []
  const alignedPublications: ProfessorLink[] = []
  const seenTitles = new Set<string>()
  const seenUrls = new Set<string>()

  for (const item of items) {
    const title = item.title?.trim()
    const snippet = item.snippet?.trim()
    const url = normalizeUrl(item.link)
    const combinedText = `${title || ''} ${snippet || ''}`.toLowerCase()

    const containsPublicationCue = PUBLICATION_KEYWORDS.some(keyword => combinedText.includes(keyword))
    const containsYear = /\b(19|20)\d{2}\b/.test(combinedText)

    if (!containsPublicationCue && !containsYear) {
      continue
    }

    const normalizedTitle = title ? title.toLowerCase() : undefined
    if (normalizedTitle && seenTitles.has(normalizedTitle)) {
      continue
    }
    if (url && seenUrls.has(url)) {
      continue
    }

    const entry: ProfessorLink = {
      title: title || (url ? url.replace(/^https?:\/\//, '') : 'Publication'),
      url,
      snippet: truncate(snippet || '', 260),
    }

    publications.push(entry)
    if (normalizedTitle) seenTitles.add(normalizedTitle)
    if (url) seenUrls.add(url)

    if (ALIGNMENT_KEYWORDS.some(keyword => combinedText.includes(keyword))) {
      alignedPublications.push(entry)
    }

    if (publications.length >= 8) break
  }

  return {
    publications,
    alignedPublications,
  }
}

const performSearch = async (query: string, apiKey: string, cx: string) => {
  const params = new URLSearchParams({
    key: apiKey,
    cx,
    q: query,
    num: '8',
    safe: 'off',
    lr: 'lang_en',
  })

  const response = await fetch(`https://www.googleapis.com/customsearch/v1?${params.toString()}`, {
    headers: {
      'Accept': 'application/json',
    },
  })

  const data = (await response.json()) as CustomSearchResponse

  if (!response.ok || data.error) {
    const message = data.error?.message || `Google Custom Search API error: ${response.status}`
    throw new Error(message)
  }

  return data.items ?? []
}

export const fetchProfessorInsights = async (params: {
  name: string
  university: string
  department?: string
  emailDomain?: string
  emailLocalPart?: string
}) : Promise<ProfessorInsights> => {
  const apiKey = process.env.GOOGLE_SEARCH_KEY
  const customSearchCx = process.env.GOOGLE_SEARCH_CX || process.env.GOOGLE_CUSTOM_SEARCH_CX

  if (!apiKey || !customSearchCx) {
    return {
      summary: '',
      relatedLinks: [],
      publications: [],
      alignedPublications: [],
      researchTopics: [],
      usedQueries: [],
      notes: apiKey
        ? 'Google Custom Search CX identifier missing.'
        : 'Google search API key missing.',
    }
  }

  const { name, department, emailDomain, emailLocalPart } = params
  const university = normalizeUniversityName(params.university)

  const identifiers = [
    normalize(name),
    ...name.split(' ').map(part => normalize(part)).filter(Boolean),
  ]

  const lastName = normalize(name).split(' ').slice(-1)[0]
  if (lastName) identifiers.push(lastName)

  if (emailLocalPart) {
    identifiers.push(normalize(emailLocalPart))
  }

  const universityTokens = university
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .map(token => normalize(token))
    .filter(token => token.length > 3)

  identifiers.push(...universityTokens)

  const uniqueIdentifiers = Array.from(new Set(identifiers))

  const emailDomainLower = emailDomain?.toLowerCase()
  const emailRootDomain = emailDomainLower
    ? emailDomainLower.split('.').slice(-2).join('.')
    : undefined
  const isGenericEmailDomain = emailDomainLower
    ? GENERIC_EMAIL_DOMAINS.has(emailDomainLower) || (emailRootDomain ? GENERIC_EMAIL_DOMAINS.has(emailRootDomain) : false)
    : false
  const isAcademicEmail = !!emailDomainLower && !isGenericEmailDomain

  const domainFiltersSet = new Set<string>()

  if (isAcademicEmail && emailDomainLower) {
    domainFiltersSet.add(`site:${emailDomainLower}`)
  }

  if (isAcademicEmail && emailRootDomain && emailRootDomain !== emailDomainLower) {
    domainFiltersSet.add(`site:${emailRootDomain}`)
  }

  domainFiltersSet.add('site:edu')

  const domainFilters = Array.from(domainFiltersSet)

  const domainPreferenceStrings = domainFilters
    .map(filter => filter.startsWith('site:') ? filter.slice(5) : '')
    .filter(Boolean)

  const preferredDomains = Array.from(new Set([
    emailDomainLower,
    emailRootDomain,
    ...domainPreferenceStrings,
    ...universityTokens
      .map(token => token.replace(/\s+/g, ''))
      .filter(Boolean),
  ].filter(Boolean))) as string[]

  const buildQuery = (...parts: (string | undefined)[]) =>
    parts.filter(Boolean).join(' ').replace(/\s+/g, ' ').trim()

  const quotedName = `"${name}"`
  const universityWithoutParentheses = university.replace(/\s*\(.*?\)\s*/g, ' ').replace(/\s+/g, ' ').trim()
  const altUniversityMatch = university.match(/\(([^)]+)\)/)
  const altUniversity = altUniversityMatch?.[1]?.trim()

  // Extract key words from university name for flexible searching
  const universityWords = university
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 2)
    .map(word => word.toLowerCase())

  const universityKeywords = universityWords.filter(word =>
    !['of', 'at', 'the', 'and', 'for', 'in'].includes(word)
  )

  const universityPhraseSet = new Set<string>()
  if (universityWithoutParentheses) universityPhraseSet.add(universityWithoutParentheses)
  if (altUniversity) universityPhraseSet.add(altUniversity)
  const originalUniversityTrimmed = university.trim()
  if (originalUniversityTrimmed && originalUniversityTrimmed !== universityWithoutParentheses) {
    universityPhraseSet.add(originalUniversityTrimmed)
  }

  const universityPhrases = Array.from(universityPhraseSet).map(value => `"${value}"`)
  const primaryUniversityPhrase = universityPhrases[0] ?? `"${university}"`
  const alternateUniversityPhrase = universityPhrases[1]

  const sanitizedDepartment = department
    ? department.replace(/\s*\(.*?\)\s*/g, ' ').replace(/\s+/g, ' ').trim()
    : undefined
  const departmentPhrase = sanitizedDepartment ? `"${sanitizedDepartment}"` : undefined
  const emailLocalPhrase = emailLocalPart && emailLocalPart.length > 2 ? `"${emailLocalPart}"` : undefined

  const sitePrimary = domainFilters[0] ?? 'site:edu'
  const siteSecondary = domainFilters[1] ?? sitePrimary

  const baseParts = [quotedName, primaryUniversityPhrase]
  const deptParts = departmentPhrase ? [...baseParts, departmentPhrase] : baseParts

  const queryCandidates: string[] = []

  // Strategy: Start specific, then get broader if no results

  // 1. Exact university match with site restriction
  queryCandidates.push(buildQuery(...deptParts, sitePrimary))
  queryCandidates.push(buildQuery(...baseParts, sitePrimary, 'inurl:faculty'))
  queryCandidates.push(buildQuery(...baseParts, sitePrimary, 'inurl:people'))

  // 2. Exact university without site restriction
  queryCandidates.push(buildQuery(...baseParts))
  if (departmentPhrase) {
    queryCandidates.push(buildQuery(...deptParts))
  }

  // 3. University keywords (handles typos and variations)
  const universityKeywordQuery = universityKeywords.slice(0, 3).join(' ')
  if (universityKeywordQuery) {
    queryCandidates.push(buildQuery(quotedName, universityKeywordQuery))
    queryCandidates.push(buildQuery(quotedName, universityKeywordQuery, 'inurl:faculty'))
  }

  // 4. Research-focused queries
  queryCandidates.push(buildQuery(quotedName, '"research"', '"professor"'))
  queryCandidates.push(buildQuery(quotedName, '"computer science"', '"faculty"'))
  queryCandidates.push(buildQuery(quotedName, '"CV"', '"publications"'))
  queryCandidates.push(buildQuery(quotedName, '"google scholar"'))

  // 5. Broad fallbacks
  queryCandidates.push(buildQuery(quotedName, 'professor'))
  queryCandidates.push(buildQuery(quotedName, 'faculty'))
  queryCandidates.push(buildQuery(quotedName, 'PhD'))

  if (alternateUniversityPhrase) {
    queryCandidates.push(buildQuery(quotedName, alternateUniversityPhrase))
  }

  if (isAcademicEmail && emailDomainLower) {
    queryCandidates.push(buildQuery(...baseParts, `"${emailDomainLower}"`))
    if (emailLocalPhrase) {
      queryCandidates.push(buildQuery(emailLocalPhrase, `"${emailDomainLower}"`))
    }
  }

  if (!isAcademicEmail && emailLocalPhrase) {
    queryCandidates.push(buildQuery(...baseParts, emailLocalPhrase))
  }

  const uniqueQueries = Array.from(new Set(queryCandidates.filter(query => query && query.length > 0)))

  const relatedLinks: ProfessorLink[] = []
  const usedQueries: string[] = []
  const processedUrls = new Set<string>()
  const collectedItems: CustomSearchItem[] = []

  let labName: string | undefined
  let labWebsite: string | undefined
  let personalWebsite: string | undefined

  let searchesPerformed = 0

  const processQuery = async (query: string) => {
    if (!query || searchesPerformed >= MAX_SEARCHES) return

    const items = await performSearch(query, apiKey, customSearchCx)
    searchesPerformed += 1
    usedQueries.push(query)

    for (const item of items) {
      const url = normalizeUrl(item.link)
      if (!url || processedUrls.has(url)) continue

      processedUrls.add(url)
      collectedItems.push(item)

      if (relatedLinks.length < MAX_LINKS) {
        relatedLinks.push({
          title: item.title || url,
          url,
          snippet: truncate(item.snippet || '', 200),
        })
      }

      if (!labName) {
        const labCandidate = extractLabCandidate(item, uniqueIdentifiers, preferredDomains)
        if (labCandidate) {
          labName = labCandidate.name
          labWebsite = labCandidate.url
        }
      }

      if (!personalWebsite) {
        const personalCandidate = extractPersonalWebsiteCandidate(item, name, uniqueIdentifiers, preferredDomains)
        if (personalCandidate) {
          personalWebsite = personalCandidate.url
        }
      }
    }
  }

  try {
    for (const query of uniqueQueries) {
      if (searchesPerformed >= MAX_SEARCHES) break
      await processQuery(query)
    }
  } catch (error) {
    return {
      summary: '',
      relatedLinks: [],
      publications: [],
      alignedPublications: [],
      researchTopics: [],
      usedQueries,
      notes: error instanceof Error ? error.message : 'Unknown Google search error.',
    }
  }

  const { summary, researchTopics } = buildSummary(collectedItems, name)
  const { publications, alignedPublications } = extractPublications(collectedItems)

  const noteMessages: string[] = []

  if (!summary) {
    noteMessages.push('No detailed information found via Google Custom Search.')
  }

  if (!labName) {
    noteMessages.push('Lab affiliation not confirmed; please verify manually.')
  }

  if (!personalWebsite) {
    noteMessages.push('Personal website not located in search results.')
  }

  if (!publications.length) {
    noteMessages.push('Publications not surfaced by Google search; consider manual verification.')
  }

  return {
    summary,
    labName,
    labWebsite,
    personalWebsite,
    relatedLinks,
    publications,
    alignedPublications,
    researchTopics,
    usedQueries,
    notes: noteMessages.length ? noteMessages.join(' ') : undefined,
  }
}
