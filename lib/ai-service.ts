export interface EmailGenerationParams {
  professorName: string
  professorUniversity: string
  professorDepartment?: string
  researchInterests?: string
  studentName: string
  studentUniversity: string
  studentDegree: string
  emailType: 'initial_inquiry' | 'follow_up' | 'meeting_request' | 'thank_you'
  customInstructions?: string
}

export interface EmailGenerationResult {
  success: boolean
  subject: string
  body: string
  error?: string
}

export const emailTemplates = {
  initial_inquiry: {
    subject: "PhD Application - Research Inquiry",
    body: `Dear Professor [PROFESSOR_NAME],

I hope this email finds you well. I am [STUDENT_NAME], a [DEGREE] student at [STUDENT_UNIVERSITY] with a strong interest in [RESEARCH_AREA].

I am writing to inquire about potential PhD opportunities in your research group. Your work in [SPECIFIC_RESEARCH] aligns closely with my research interests and academic background.

I would be grateful for the opportunity to discuss how my background and interests might contribute to your ongoing research projects.

Thank you for your time and consideration.

Best regards,
[STUDENT_NAME]`
  },
  follow_up: {
    subject: "Follow-up: PhD Application - [STUDENT_NAME]",
    body: `Dear Professor [PROFESSOR_NAME],

I hope you are doing well. I am following up on my previous email regarding PhD opportunities in your research group.

I remain very interested in your work on [SPECIFIC_RESEARCH] and would welcome the chance to discuss potential collaboration.

Please let me know if you need any additional information from me.

Best regards,
[STUDENT_NAME]`
  },
  meeting_request: {
    subject: "Meeting Request - PhD Applicant",
    body: `Dear Professor [PROFESSOR_NAME],

I hope this email finds you well. I am [STUDENT_NAME], and I have been following your research in [RESEARCH_AREA].

I would be honored to have the opportunity to meet with you to discuss potential PhD opportunities in your lab. I am flexible with timing and can accommodate your schedule.

Would you be available for a brief meeting in the coming weeks?

Thank you for your consideration.

Best regards,
[STUDENT_NAME]`
  },
  thank_you: {
    subject: "Thank you - [STUDENT_NAME]",
    body: `Dear Professor [PROFESSOR_NAME],

Thank you very much for taking the time to meet with me. I greatly appreciate the insights you shared about your research and the PhD program.

Our discussion has strengthened my interest in joining your research group, and I look forward to the possibility of contributing to your work on [SPECIFIC_RESEARCH].

Please let me know if you need any additional information from me.

Best regards,
[STUDENT_NAME]`
  }
}

class AIService {
  private openaiApiKey: string | null = null
  private geminiApiKey: string | null = null
  private currentProvider: 'openai' | 'gemini' | null = null

  constructor() {
    if (typeof window !== 'undefined') {
      this.openaiApiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY || null
      this.geminiApiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || null

      // Determine which provider to use
      if (this.openaiApiKey) {
        this.currentProvider = 'openai'
      } else if (this.geminiApiKey) {
        this.currentProvider = 'gemini'
      }
    }
  }

  getAvailableProviders(): string[] {
    const providers: string[] = []
    if (this.openaiApiKey) providers.push('OpenAI')
    if (this.geminiApiKey) providers.push('Gemini')
    return providers
  }

  getCurrentProvider(): string {
    if (this.currentProvider === 'openai') return 'OpenAI'
    if (this.currentProvider === 'gemini') return 'Gemini'
    return 'None'
  }

  async generateEmail(params: EmailGenerationParams): Promise<EmailGenerationResult> {
    if (!this.currentProvider) {
      return {
        success: false,
        subject: '',
        body: '',
        error: 'No AI provider configured'
      }
    }

    try {
      if (this.currentProvider === 'openai') {
        return await this.generateWithOpenAI(params)
      } else if (this.currentProvider === 'gemini') {
        return await this.generateWithGemini(params)
      }
    } catch (error: any) {
      console.error(`${this.currentProvider} API error:`, error)
      return {
        success: false,
        subject: '',
        body: '',
        error: error.message
      }
    }

    return {
      success: false,
      subject: '',
      body: '',
      error: 'Unknown error'
    }
  }

  private async generateWithOpenAI(params: EmailGenerationParams): Promise<EmailGenerationResult> {
    const prompt = this.createPrompt(params)

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 800,
        temperature: 0.7
      })
    })

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`)
    }

    const data = await response.json()
    const generatedText = data.choices[0]?.message?.content || ''

    return this.parseEmailResponse(generatedText)
  }

  private async generateWithGemini(params: EmailGenerationParams): Promise<EmailGenerationResult> {
    const prompt = this.createPrompt(params)

    const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${this.geminiApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 800,
        }
      })
    })

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`)
    }

    const data = await response.json()
    const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text || ''

    return this.parseEmailResponse(generatedText)
  }

  private createPrompt(params: EmailGenerationParams): string {
    const {
      professorName,
      professorUniversity,
      professorDepartment,
      researchInterests,
      studentName,
      studentUniversity,
      studentDegree,
      emailType,
      customInstructions
    } = params

    const emailTypeDescriptions = {
      initial_inquiry: 'an initial inquiry about PhD opportunities',
      follow_up: 'a follow-up email after a previous inquiry',
      meeting_request: 'a request for a meeting or video call',
      thank_you: 'a thank you note after a meeting or conversation'
    }

    return `Generate a professional academic email for ${emailTypeDescriptions[emailType]}.

Email Details:
- To: Professor ${professorName} at ${professorUniversity}${professorDepartment ? ` (${professorDepartment})` : ''}
- From: ${studentName}, ${studentDegree} student at ${studentUniversity}
- Type: ${emailType}
${researchInterests ? `- Research interests: ${researchInterests}` : ''}
${customInstructions ? `- Special instructions: ${customInstructions}` : ''}

Requirements:
1. Professional and respectful tone
2. Concise but informative (200-300 words)
3. Clear subject line
4. Specific to the professor's research area when possible
5. Include relevant background about the student
6. End with appropriate call to action

Return the response in this exact format:
Subject: [email subject]

[email body]`
  }

  private parseEmailResponse(response: string): EmailGenerationResult {
    const lines = response.trim().split('\n')
    const subjectLine = lines.find(line => line.toLowerCase().startsWith('subject:'))

    if (!subjectLine) {
      return {
        success: true,
        subject: 'PhD Application - Research Inquiry',
        body: response
      }
    }

    const subject = subjectLine.replace(/^subject:\s*/i, '').trim()
    const bodyStartIndex = lines.findIndex(line => line.toLowerCase().startsWith('subject:')) + 1
    const body = lines.slice(bodyStartIndex).join('\n').trim()

    return {
      success: true,
      subject,
      body
    }
  }
}

export const aiService = new AIService()