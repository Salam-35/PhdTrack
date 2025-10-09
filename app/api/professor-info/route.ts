import { NextResponse } from 'next/server'
import { fetchProfessorInsights } from '@/lib/google-search'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      name,
      email,
      university,
      department,
    } = body ?? {}

    if (!name || !university) {
      return NextResponse.json(
        {
          success: false,
          error: 'Professor name and university are required.',
        },
        { status: 400 }
      )
    }

    const emailParts = typeof email === 'string' ? email.split('@') : []
    const emailLocalPart = emailParts.length === 2 ? emailParts[0] : undefined
    const emailDomain = emailParts.length === 2 ? emailParts[1] : undefined

    const insights = await fetchProfessorInsights({
      name,
      university,
      department,
      emailDomain,
      emailLocalPart,
    })

    return NextResponse.json({
      success: true,
      insights,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch professor information.'

    console.error('Professor info lookup error:', message)

    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      { status: 500 }
    )
  }
}
