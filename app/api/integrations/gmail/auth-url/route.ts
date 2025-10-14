import crypto from 'crypto'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { GMAIL_SCOPES, getOAuthClient } from '@/lib/google-oauth'

const generateCodeVerifier = () => {
  const randomBytes = crypto.randomBytes(32)
  return randomBytes.toString('base64url')
}

const generateCodeChallenge = (verifier: string) => {
  return crypto
    .createHash('sha256')
    .update(verifier)
    .digest()
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
}

export async function POST(request: Request) {
  const cookieStore = cookies()
  const supabase = createRouteHandlerClient({ cookies })

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const oauth2Client = getOAuthClient()

    const state = crypto.randomUUID()
    const codeVerifier = generateCodeVerifier()
    const codeChallenge = generateCodeChallenge(codeVerifier)

    const expires = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

    cookieStore.set('gmail_oauth_state', state, {
      httpOnly: true,
      secure: true,
      path: '/',
      sameSite: 'lax',
      expires,
    })

    cookieStore.set('gmail_oauth_verifier', codeVerifier, {
      httpOnly: true,
      secure: true,
      path: '/',
      sameSite: 'lax',
      expires,
    })

    const url = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: GMAIL_SCOPES,
      include_granted_scopes: true,
      prompt: 'consent',
      state,
      code_challenge: codeChallenge,
      code_challenge_method: 'S256',
    })

    return NextResponse.json({ url })
  } catch (err) {
    console.error('Failed to create Gmail auth URL:', err)
    return NextResponse.json({ error: 'Failed to start Gmail integration' }, { status: 500 })
  }
}
