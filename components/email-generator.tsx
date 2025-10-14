"use client"

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import {
  Loader2,
  Wand2,
  Copy,
  Mail,
  Sparkles,
  RefreshCw,
  CheckCircle,
  AlertCircle
} from "lucide-react"
import type { ProfessorInsights } from "@/lib/google-search"

interface EmailGeneratorProps {
  open: boolean
  onClose: () => void
  professor: {
    name: string
    email: string
    university: string
    department?: string
    notes?: string
  }
}

// CV Context from cv-context.md
const cvContext = `# Abdus Salam - Background

## Current Position
Software Engineer (AI) at MyMedicalHub International Ltd. + Research Assistant at Qatar University

## Education
- MSc in Computer Science & Engineering (CGPA: 3.50, Expected: March 2025)
- BSc in Electrical & Computer Engineering (CGPA: 3.42)
- University: Rajshahi University of Engineering & Technology (RUET), Bangladesh

## Core Expertise
- **Medical Imaging & Computer Vision**: Classification, segmentation, detection pipelines with PyTorch
- **Keypoint Detection & Pose Estimation**: Using Google Mediapipe and Vision Transformer models
- **Healthcare AI Applications**:
  - Range of Motion (ROM) analysis from patient videos
  - Human gait abnormality detection using pose/keypoint analysis
  - Clinical Q&A systems with Azure Speech
  - Reduced AI retake rate by ~30% through model optimization

## Key Research Experience
- Deep learning for medical imaging (malaria detection, colon polyp detection)
- Smart agriculture (mulberry & rice leaf disease detection, mobile/edge deployment)
- AI-assisted healthcare (urinary sediment detection with YOLOv9e)
- Focus on explainable AI models

## Publications
- 9 journal articles in Q1/Q2 journals (IEEE Access, IJIST, Frontiers in Plant Science, Diagnostics)
- 2 Elsevier book chapters on ML for resource recovery
- Publications cover medical imaging, smart agriculture, and AI in pediatric urology

## Technical Skills
Python, PyTorch, TensorFlow/Keras, Computer Vision, Deep Learning, Medical Imaging, Edge Deployment

## Competitive Programming
Specialist rank in Codeforces, multiple top-10 finishes in national programming contests

## Application Status
Applying for PhD in Computer Science for Spring 2026 semester`

// Email template structure
const emailTemplate = `Hello Professor [PROFESSOR_NAME],

Greetings, I'm Abdus Salam, a recent graduate from the Department of Electrical & Computer Engineering, Rajshahi University of Engineering & Technology, Bangladesh. I am writing to express my strong interest in pursuing a PhD in [RESEARCH_AREA] within the [DEPARTMENT] at [UNIVERSITY]. I've already submitted my application for the upcoming spring 26 semester.

While visiting your webpage, I came across one of your projects, "[PROJECT_NAME]." I found that very interesting and closely related to the work I do in my professional life. [CONNECTION_TO_WORK]

Currently, I'm working at MyMedicalHub International Ltd, Dhaka. My main role is to develop or fine-tune computer vision models and make applications using them for precise healthcare applications. After graduation, I also worked as a Research Assistant at Qatar University's Machine Learning Group. My primary research area and interest is building machine learning models with explainability. While working with them, I was able to contribute to many projects, and most of them produced one or two journals.

A short credential is listed below for your convenience, and my complete CV is attached for your consideration.

Credentials:
• B.Sc. in ECE from RUET, Bangladesh (CGPA: 3.42/4.00)
• MSc ongoing in CSE (CGPA 3.50/4.00 till now)

Publications:
• 9 journal articles (Q1 and Q2)
• 02 Elsevier book chapters

I'm very excited about your projects, and it would be great to work under your supervision. I believe this lab would be a perfect place to pursue my PhD in Computer Science. I look forward to hearing from you at your earliest convenience. Thank you.

Best regards,
Abdus Salam`

const buildProfessorProfileText = (
  insights: ProfessorInsights | null,
  professor: EmailGeneratorProps['professor'],
  fallbackMessage?: string
) => {
  const lines: string[] = [
    `Professor: ${professor.name} (${professor.email}) at ${professor.university}${professor.department ? `, ${professor.department}` : ''}`
  ]

  if (professor.notes) {
    lines.push(`Existing notes: ${professor.notes}`)
  }

  if (insights) {
    if (insights.summary) {
      lines.push(`Summary: ${insights.summary}`)
    }

    if (insights.researchTopics && insights.researchTopics.length > 0) {
      lines.push(`Research focus areas: ${insights.researchTopics.join(', ')}`)
    }

    if (insights.labName) {
      lines.push(`Lab: ${insights.labName}${insights.labWebsite ? ` (${insights.labWebsite})` : ''}`)
    }

    if (insights.personalWebsite) {
      lines.push(`Personal website: ${insights.personalWebsite}`)
    }

    const alignedPublications = insights.alignedPublications || []
    const publications = insights.publications || []

    if (alignedPublications.length > 0) {
      const pubLines = alignedPublications
        .map((pub) => `- ${pub.title}${pub.url ? ` (${pub.url})` : ''}${pub.snippet ? ` — ${pub.snippet}` : ''}`)
        .join('\n')
      lines.push(`Aligned publications with healthcare AI/computer vision focus:\n${pubLines}`)
    } else if (publications.length > 0) {
      const pubLines = publications.slice(0, 3)
        .map((pub) => `- ${pub.title}${pub.url ? ` (${pub.url})` : ''}${pub.snippet ? ` — ${pub.snippet}` : ''}`)
        .join('\n')
      lines.push(`Representative publications:\n${pubLines}`)
    }

    if (insights.relatedLinks.length > 0) {
      const links = insights.relatedLinks
        .map((link) => `- ${link.title}${link.url ? ` (${link.url})` : ''}${link.snippet ? ` — ${link.snippet}` : ''}`)
        .join('\n')
      lines.push(`Notable links:\n${links}`)
    }

    if (insights.notes) {
      lines.push(`Google notes: ${insights.notes}`)
    }
  } else if (fallbackMessage) {
    lines.push(`Google search notes: ${fallbackMessage}`)
  }

  return lines.join('\n')
}

export default function EmailGenerator({ open, onClose, professor }: EmailGeneratorProps) {
  const [loading, setLoading] = useState(false)
  const [professorInsights, setProfessorInsights] = useState<ProfessorInsights | null>(null)
  const [infoMessage, setInfoMessage] = useState<string | null>(null)
  const [customInstructions, setCustomInstructions] = useState('')
  const [manualResearchInfo, setManualResearchInfo] = useState('')
  const [generatedEmail, setGeneratedEmail] = useState<{subject: string, body: string} | null>(null)

  const generateEmailWithOpenAI = async () => {
    setLoading(true)
    setProfessorInsights(null)
    setInfoMessage(null)
    setGeneratedEmail(null)

    try {
      const openaiApiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY

      if (!openaiApiKey) {
        alert('OpenAI API key not configured. Please add NEXT_PUBLIC_OPENAI_API_KEY to your environment variables.')
        setLoading(false)
        return
      }

      console.log('Starting email generation with OpenAI for:', professor.name)

      let professorProfileText = ''

      try {
        const infoResponse = await fetch('/api/professor-info', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: professor.name,
            email: professor.email,
            university: professor.university,
            department: professor.department,
          }),
        })

        if (!infoResponse.ok) {
          throw new Error(`Professor info lookup failed (${infoResponse.status})`)
        }

        const infoData = await infoResponse.json()

        if (infoData.success && infoData.insights) {
          const insights = infoData.insights as ProfessorInsights
          setProfessorInsights(insights)
          if (insights.notes) {
            setInfoMessage(insights.notes)
          } else if (insights.summary) {
            setInfoMessage('Google search results retrieved successfully.')
          } else {
            setInfoMessage('Google search returned limited details; see links below.')
          }
          professorProfileText = buildProfessorProfileText(insights, professor, insights.notes ?? undefined)
        } else {
          const fallbackMessage = infoData.error || 'No professor information found via Google search.'
          setInfoMessage(fallbackMessage)
          setProfessorInsights(null)
          professorProfileText = buildProfessorProfileText(null, professor, fallbackMessage)
        }
      } catch (error) {
        const fallbackMessage = error instanceof Error ? error.message : 'Professor information lookup failed.'
        setInfoMessage(fallbackMessage)
        setProfessorInsights(null)
        professorProfileText = buildProfessorProfileText(null, professor, fallbackMessage)
      }

      // Step 2: Generate email based on professor info
const emailPrompt = `Generate a highly personalized PhD application email based on the detailed research profile.

## EMAIL CONTEXT
**Professor:** ${professor.name} (${professor.email})
**University:** ${professor.university}
**Department:** ${professor.department || 'Not specified'}

**Student:** Abdus Salam
**Target Program:** PhD in Computer Science - Spring 2026
**Specialization:** Medical Imaging, Computer Vision, AI in Healthcare

## PROFESSOR'S RESEARCH PROFILE
${professorProfileText}

${manualResearchInfo ? `## ADDITIONAL RESEARCH DETAILS (User Provided)
${manualResearchInfo}

` : ''}

## STUDENT'S BACKGROUND
${cvContext}

## EMAIL REQUIREMENTS
1. **Subject Line:** Creative, specific, and professional (avoid generic "PhD Application")
2. **Opening:** Warm, specific reference to professor's recent work/lab/project
3. **Connection:** Explicit link between student's experience and professor's research
4. **Value Proposition:** What unique skills/perspective student brings
5. **Call to Action:** Specific request (meeting, discussion, etc.)
6. **Tone:** Professional but personable, showing genuine interest
7. **Publications:** Reference at least one provided publication (prefer aligned ones) without inventing any titles
8. **Length:** 150-250 words, concise but comprehensive
9. **Integrity:** Use only the supplied professor information—do not fabricate projects, labs, or publications

${customInstructions ? `## SPECIAL INSTRUCTIONS
${customInstructions}

` : ''}## OUTPUT FORMAT
Return ONLY valid JSON in this exact format:
{
  "subject": "[Creative, specific subject line]",
  "body": "[Complete email body with proper formatting]"
}

**Important:** Make specific references to professor's research, lab name, or projects mentioned in the research profile. Avoid generic language.`

      const emailResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${openaiApiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: [
            {
              role: 'system',
              content: `You are an expert academic email writer specializing in PhD applications. You excel at:
1. Personalizing emails based on professor's research
2. Highlighting relevant student experience
3. Creating compelling connections between student and professor work
4. Writing concise, professional academic correspondence
5. Following proper academic email etiquette`
            },
            {
              role: 'user',
              content: emailPrompt
            }
          ],
          temperature: 0.6,
          max_tokens: 2000,
          presence_penalty: 0.1,
          frequency_penalty: 0.1
        })
      })

      if (!emailResponse.ok) {
        throw new Error(`OpenAI API error: ${emailResponse.status}`)
      }

      const emailData = await emailResponse.json()
      let responseText = emailData.choices?.[0]?.message?.content || ''

      // Clean up markdown formatting
      responseText = responseText.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim()

      try {
        const parsed = JSON.parse(responseText)
        setGeneratedEmail({
          subject: parsed.subject || 'PhD Application - Spring 2026',
          body: parsed.body || responseText
        })
      } catch (parseError) {
        // Fallback parsing
        const lines = responseText.split('\n')
        const subjectLine = lines.find(l => l.toLowerCase().includes('subject'))
        const subject = subjectLine?.replace(/.*subject[:\s]*/i, '').replace(/['"]/g, '').trim() || 'PhD Application - Spring 2026'
        const subjectIndex = lines.findIndex(l => l.toLowerCase().includes('subject'))
        const body = (subjectIndex >= 0 ? lines.slice(subjectIndex + 1) : lines).join('\n').trim() || responseText

        setGeneratedEmail({ subject, body })
      }

    } catch (error: any) {
      console.error('Email generation error:', error)

      // Try fallback with simpler prompt if main generation fails
      if (error.message.includes('gpt-4o')) {
        try {
          const fallbackResponse = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${openaiApiKey}`
            },
            body: JSON.stringify({
              model: 'gpt-4o-mini',
              messages: [
                {
                  role: 'system',
                  content: 'You are an expert at writing professional PhD application emails.'
                },
                {
                  role: 'user',
                  content: `Write a PhD application email to Professor ${professor.name} at ${professor.university}. Student: Abdus Salam, MSc Computer Science, specializing in medical imaging and computer vision. Application for Spring 2026. Return JSON format: {"subject": "...", "body": "..."}`
                }
              ],
              temperature: 0.7,
              max_tokens: 1500
            })
          })

          if (fallbackResponse.ok) {
            const fallbackData = await fallbackResponse.json()
            const fallbackText = fallbackData.choices?.[0]?.message?.content || ''

            try {
              const parsed = JSON.parse(fallbackText.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim())
              setGeneratedEmail({
                subject: parsed.subject || 'PhD Application - Spring 2026',
                body: parsed.body || fallbackText
              })
              setInfoMessage('Email generated using fallback method due to API limitations.')
              return
            } catch {
              setGeneratedEmail({
                subject: 'PhD Application - Spring 2026',
                body: fallbackText
              })
              setInfoMessage('Email generated using fallback method with basic formatting.')
              return
            }
          }
        } catch (fallbackError) {
          console.error('Fallback generation failed:', fallbackError)
        }
      }

      alert(`Failed to generate email: ${error.message}. Please try again or check your API key.`)
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
    } catch (error) {
      console.error('Copy failed:', error)
    }
  }

  const sendEmail = () => {
    if (!generatedEmail) return
    const subject = encodeURIComponent(generatedEmail.subject)
    const body = encodeURIComponent(generatedEmail.body)
    window.open(`mailto:${professor.email}?subject=${subject}&body=${body}`, '_blank')
  }

  const hasOpenAI = !!process.env.NEXT_PUBLIC_OPENAI_API_KEY

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wand2 className="h-5 w-5 text-purple-600" />
            AI Email Generator
          </DialogTitle>
          <DialogDescription>
            Generate personalized academic emails for PhD applications using AI.
          </DialogDescription>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">
              Professor: {professor.name} • {professor.email}
            </span>
            {hasOpenAI && (
              <Badge variant="outline" className="text-green-600 border-green-200">
                <Sparkles className="h-3 w-3 mr-1" />
                OpenAI Available
              </Badge>
            )}
          </div>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Panel */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Generate Email</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-sm text-blue-800">
                    AI will find professor information using their name and email, then generate a personalized email.
                  </p>
                </div>

                {!hasOpenAI && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                    <div className="flex items-center gap-2 text-yellow-800">
                      <AlertCircle className="h-4 w-4" />
                      <span className="text-sm font-medium">OpenAI Not Configured</span>
                    </div>
                    <p className="text-xs text-yellow-700 mt-1">
                      Add NEXT_PUBLIC_OPENAI_API_KEY to enable AI
                    </p>
                  </div>
                )}

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Manual Research Info (Optional)</Label>
                    <Textarea
                      placeholder="If you know specific details about the professor's research, lab, recent papers, or projects, add them here to improve email personalization..."
                      value={manualResearchInfo}
                      onChange={(e) => setManualResearchInfo(e.target.value)}
                      rows={3}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Additional Instructions (Optional)</Label>
                    <Textarea
                      placeholder="e.g., Mention specific deadline, emphasize keypoint detection experience, reference particular paper..."
                      value={customInstructions}
                      onChange={(e) => setCustomInstructions(e.target.value)}
                      rows={3}
                    />
                  </div>
                </div>

                <Button
                  onClick={generateEmailWithOpenAI}
                  disabled={loading || !hasOpenAI}
                  className="w-full bg-purple-600 hover:bg-purple-700"
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Sparkles className="h-4 w-4 mr-2" />
                  )}
                  {loading ? 'Generating Email...' : 'Generate Email'}
                </Button>
              </CardContent>
            </Card>

            {(professorInsights || infoMessage) && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Google Search Insights</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {infoMessage && (
                    <div className="bg-slate-50 border border-slate-200 rounded-md p-3 text-xs text-slate-700">
                      {infoMessage}
                    </div>
                  )}
                  {professorInsights ? (
                    <div className="space-y-3 text-sm text-gray-700">
                      <div>
                        <span className="font-medium text-gray-900">Summary</span>
                        <p className="mt-1 text-gray-600">
                          {professorInsights.summary || 'No verified summary found. See links for more context.'}
                        </p>
                      </div>

                      {(professorInsights.labName || professorInsights.personalWebsite) && (
                        <div className="grid grid-cols-1 gap-2">
                          {professorInsights.labName && (
                            <div>
                              <span className="font-medium text-gray-900">Lab</span>
                              <p className="mt-1 text-gray-600">
                                {professorInsights.labWebsite ? (
                                  <a
                                    href={professorInsights.labWebsite}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:underline"
                                  >
                                    {professorInsights.labName}
                                  </a>
                                ) : (
                                  professorInsights.labName
                                )}
                              </p>
                            </div>
                          )}
                          {professorInsights.personalWebsite && (
                            <div>
                              <span className="font-medium text-gray-900">Personal Website</span>
                              <p className="mt-1">
                                <a
                                  href={professorInsights.personalWebsite}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:underline"
                                >
                                  {professorInsights.personalWebsite}
                                </a>
                              </p>
                            </div>
                          )}
                        </div>
                      )}

                      {professorInsights.relatedLinks.length > 0 && (
                        <div>
                          <span className="font-medium text-gray-900">Notable Links</span>
                          <ul className="mt-2 space-y-2">
                            {professorInsights.relatedLinks.map((link) => (
                              <li key={link.url} className="text-sm">
                                <a
                                  href={link.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:underline"
                                >
                                  {link.title}
                                </a>
                                {link.snippet && (
                                  <p className="text-xs text-gray-500 mt-1">{link.snippet}</p>
                                )}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {professorInsights.usedQueries.length > 0 && (
                        <div>
                          <span className="font-medium text-gray-900">Search Queries</span>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {professorInsights.usedQueries.map((query) => (
                              <Badge key={query} variant="outline">
                                {query}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-600">
                      No structured information retrieved. Review the professor details manually before sending.
                    </p>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Generated Email Panel */}
          <div className="space-y-4">
            {generatedEmail ? (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      Your Personalized Email
                    </CardTitle>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={generateEmailWithOpenAI}
                      disabled={loading}
                    >
                      <RefreshCw className="h-4 w-4 mr-1" />
                      Regenerate
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Subject */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium">Subject</Label>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => copyToClipboard(generatedEmail.subject)}
                      >
                        <Copy className="h-3 w-3 mr-1" />
                        Copy
                      </Button>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3 border">
                      <p className="text-sm font-medium">{generatedEmail.subject}</p>
                    </div>
                  </div>

                  <Separator />

                  {/* Body */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium">Email Body</Label>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => copyToClipboard(generatedEmail.body)}
                      >
                        <Copy className="h-3 w-3 mr-1" />
                        Copy
                      </Button>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4 border max-h-96 overflow-y-auto">
                      <pre className="text-sm whitespace-pre-wrap font-sans">{generatedEmail.body}</pre>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-4">
                    <Button
                      onClick={sendEmail}
                      className="flex-1 bg-blue-600 hover:bg-blue-700"
                    >
                      <Mail className="h-4 w-4 mr-2" />
                      Open in Email Client
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => copyToClipboard(`Subject: ${generatedEmail.subject}\n\n${generatedEmail.body}`)}
                    >
                      <Copy className="h-4 w-4 mr-1" />
                      Copy All
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="text-center py-16">
                  <Sparkles className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Ready to Generate</h3>
                  <p className="text-gray-500 max-w-sm mx-auto">
                    Click "Generate Email" to create a personalized PhD application email using AI.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
