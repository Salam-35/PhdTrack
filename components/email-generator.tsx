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
  AlertCircle,
  Search
} from "lucide-react"
import { aiService } from "@/lib/ai-service"

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

export default function EmailGenerator({ open, onClose, professor }: EmailGeneratorProps) {
  const [loading, setLoading] = useState(false)
  const [researchLoading, setResearchLoading] = useState(false)
  const [professorResearch, setProfessorResearch] = useState<string>('')
  const [customInstructions, setCustomInstructions] = useState('')
  const [generatedEmail, setGeneratedEmail] = useState<{subject: string, body: string} | null>(null)

  const searchProfessorResearch = async () => {
    setResearchLoading(true)
    try {
      const geminiApiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY

      if (!geminiApiKey) {
        setProfessorResearch('Gemini API key not configured. Please add NEXT_PUBLIC_GEMINI_API_KEY to your environment variables.')
        setResearchLoading(false)
        return
      }

      console.log('Starting research search for:', professor.name)

      const modelName = process.env.NEXT_PUBLIC_GEMINI_MODEL || 'gemini-2.5-pro-preview-03-25'
      console.log('Using Gemini model:', modelName)

      const prompt = `Based on the information provided about Professor ${professor.name} at ${professor.university}${professor.department ? ` in the ${professor.department}` : ''}, generate a research profile summary.

Since I cannot search the web, please generate a plausible research profile for a computer science professor that would include:

1. Main research areas (likely: computer vision, machine learning, AI, data science, or related fields)
2. 2-3 specific research projects or focus areas
3. Lab or research group name
4. Potential connections to: medical imaging, computer vision, deep learning, healthcare AI

Format as a 2-3 paragraph research summary that sounds realistic for a ${professor.department || 'Computer Science'} professor.

Note: This is a generated profile to help create personalized emails. The actual professor's research should be verified from their official website.`

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${geminiApiKey}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 1000,
          }
        })
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error(`Research API error: ${response.status}`, errorText)
        throw new Error(`Research API error: ${response.status} - ${errorText}`)
      }

      const data = await response.json()
      const researchInfo = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Unable to fetch research information'
      setProfessorResearch(researchInfo)

    } catch (error: any) {
      console.error('Research search error:', error)
      const errorMessage = error.message || 'Unknown error occurred'
      setProfessorResearch(`Error fetching research information: ${errorMessage}\n\nPlease add research information manually based on the professor's website or recent publications.`)
    } finally {
      setResearchLoading(false)
    }
  }

  const generateEmail = async () => {
    if (!professorResearch.trim()) {
      alert('Please search for professor research information first')
      return
    }

    setLoading(true)
    try {
      const geminiApiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY

      if (!geminiApiKey) {
        console.error('Gemini API key not configured')
        alert('Gemini API key not configured. Please add NEXT_PUBLIC_GEMINI_API_KEY to your environment variables.')
        setLoading(false)
        return
      }

      console.log('Starting email generation for:', professor.name)

      const modelName = process.env.NEXT_PUBLIC_GEMINI_MODEL || 'gemini-2.5-pro-preview-03-25'
      console.log('Using Gemini model:', modelName)

      const enhancedPrompt = `Generate a professional PhD application email.

Professor: ${professor.name} at ${professor.university}
Student: Abdus Salam (MSc Computer Science, specializes in medical imaging and computer vision)

Research areas to connect: ${professorResearch.substring(0, 500)}

Create an email with:
1. Professional subject line
2. Brief introduction
3. Connection between student's work and professor's research
4. Request for PhD supervision

Return ONLY valid JSON in this format:
{
  "subject": "PhD Application - Computer Vision Background",
  "body": "Dear Professor [Name],\n\n[Email content here]\n\nBest regards,\nAbdus Salam"
}

${customInstructions ? `Additional notes: ${customInstructions}` : ''}`

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${geminiApiKey}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: enhancedPrompt
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 2048,
          }
        })
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error(`Email generation API error: ${response.status}`, errorText)
        throw new Error(`Email generation API error: ${response.status} - ${errorText}`)
      }

      const data = await response.json()
      console.log('Full API response:', data)

      let responseText = data.candidates?.[0]?.content?.parts?.[0]?.text || ''

      console.log('Raw API response:', responseText)

      if (!responseText) {
        console.error('Empty response from Gemini API. Full response:', data)
        throw new Error('Received empty response from Gemini API. This might be due to content filtering or model issues.')
      }

      // Clean up markdown formatting
      responseText = responseText.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim()

      console.log('Cleaned response:', responseText)

      try {
        const emailData = JSON.parse(responseText)
        console.log('Parsed email data:', emailData)
        setGeneratedEmail({
          subject: emailData.subject || 'PhD Application - Research Inquiry',
          body: emailData.body || emailData.content || responseText
        })
      } catch (parseError) {
        console.log('JSON parse failed, trying manual extraction. Error:', parseError)
        // If not valid JSON, try to extract subject and body manually
        const lines = responseText.split('\n')
        const subjectLine = lines.find(l => l.toLowerCase().includes('subject'))
        const subject = subjectLine
          ? subjectLine.replace(/.*subject[:\s]*/i, '').replace(/['"]/g, '').trim()
          : 'PhD Application - Research Inquiry'

        // Try to extract body after subject line
        const subjectIndex = lines.findIndex(l => l.toLowerCase().includes('subject'))
        const bodyLines = subjectIndex >= 0 ? lines.slice(subjectIndex + 1) : lines
        const body = bodyLines.join('\n').trim() || responseText

        console.log('Manual extraction - Subject:', subject, 'Body:', body)

        setGeneratedEmail({
          subject,
          body
        })
      }

    } catch (error: any) {
      console.error('Email generation error:', error)
      const errorMessage = error.message || 'Unknown error occurred'
      alert(`Failed to generate email: ${errorMessage}. Please try again or check your API configuration.`)
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

  const availableProviders = aiService.getAvailableProviders()

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wand2 className="h-5 w-5 text-purple-600" />
            AI Email Generator
          </DialogTitle>
          <DialogDescription>
            Generate personalized academic emails for PhD applications using AI research discovery and professional templates.
          </DialogDescription>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">
              Professor: {professor.name} • {professor.university}
            </span>
            {availableProviders.length > 0 && (
              <Badge variant="outline" className="text-green-600 border-green-200">
                <Sparkles className="h-3 w-3 mr-1" />
                {availableProviders.join(', ')} Available
              </Badge>
            )}
          </div>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Research Discovery Panel */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Step 1: Discover Professor's Research</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-sm text-blue-800">
                    AI will generate a research profile based on the professor's department and university. Please verify and edit the information before generating the email.
                  </p>
                </div>

                {availableProviders.length === 0 && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                    <div className="flex items-center gap-2 text-yellow-800">
                      <AlertCircle className="h-4 w-4" />
                      <span className="text-sm font-medium">AI Not Configured</span>
                    </div>
                    <p className="text-xs text-yellow-700 mt-1">
                      Add NEXT_PUBLIC_GEMINI_API_KEY or NEXT_PUBLIC_OPENAI_API_KEY to enable AI
                    </p>
                  </div>
                )}

                <Button
                  onClick={searchProfessorResearch}
                  disabled={researchLoading || availableProviders.length === 0}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  {researchLoading ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Search className="h-4 w-4 mr-2" />
                  )}
                  {researchLoading ? 'Generating...' : 'Generate Research Profile'}
                </Button>

                {professorResearch && (
                  <div className="space-y-2">
                    <Label>Research Information Found:</Label>
                    <Textarea
                      value={professorResearch}
                      onChange={(e) => setProfessorResearch(e.target.value)}
                      rows={8}
                      className="text-sm"
                    />
                    <p className="text-xs text-gray-500">
                      You can edit this information before generating the email
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Step 2: Customize (Optional)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Additional Instructions</Label>
                  <Textarea
                    placeholder="e.g., Mention specific deadline, emphasize keypoint detection experience, reference particular paper..."
                    value={customInstructions}
                    onChange={(e) => setCustomInstructions(e.target.value)}
                    rows={4}
                  />
                </div>

                <Button
                  onClick={generateEmail}
                  disabled={loading || !professorResearch || availableProviders.length === 0}
                  className="w-full bg-purple-600 hover:bg-purple-700"
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Sparkles className="h-4 w-4 mr-2" />
                  )}
                  {loading ? 'Generating...' : 'Generate Personalized Email'}
                </Button>
              </CardContent>
            </Card>
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
                      onClick={generateEmail}
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
                    First, search for the professor's research to find meaningful connections with your background. Then generate a personalized email.
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