import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { google } from 'googleapis'
import { getOAuthClient } from '@/lib/google-oauth'

const getRedirectPath = () => {
  const base = process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL
  if (base) {
    return `${base.replace(/\/$/, '')}/settings?gmail=connected`
  }
  return '/settings?gmail=connected'
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const state = searchParams.get('state')
  const code = searchParams.get('code')
  const errorParam = searchParams.get('error')

  const cookieStore = cookies()
  const supabase = createRouteHandlerClient({ cookies })

  const expectedState = cookieStore.get('gmail_oauth_state')?.value
  const codeVerifier = cookieStore.get('gmail_oauth_verifier')?.value

  cookieStore.delete('gmail_oauth_state')
  cookieStore.delete('gmail_oauth_verifier')

  if (errorParam) {
    const redirectUrl = `/settings?gmail=error&message=${encodeURIComponent(errorParam)}`
    return NextResponse.redirect(redirectUrl)
  }

  if (!state || !code || !expectedState || state !== expectedState) {
    const redirectUrl = '/settings?gmail=error&message=invalid_state'
    return NextResponse.redirect(redirectUrl)
  }

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    return NextResponse.redirect('/login')
  }

  try {
    const oauth2Client = getOAuthClient()

    const tokenParams: {
      code: string
      codeVerifier?: string
    } = { code }

    if (codeVerifier) {
      tokenParams.codeVerifier = codeVerifier
    }

    const { tokens } = await oauth2Client.getToken(tokenParams)
    oauth2Client.setCredentials(tokens)

    const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client })
    const userInfoResponse = await oauth2.userinfo.get()
    const gmailAddress = userInfoResponse.data.email

    if (!gmailAddress) {
      const redirectUrl = '/settings?gmail=error&message=no_email_returned'
      return NextResponse.redirect(redirectUrl)
    }

    const expiryDate = tokens.expiry_date
      ? new Date(tokens.expiry_date).toISOString()
      : null

    const { error: upsertError } = await supabase.from('gmail_integrations').upsert(
      {
        user_id: user.id,
        gmail_address: gmailAddress,
        access_token: tokens.access_token ?? null,
        refresh_token: tokens.refresh_token ?? null,
        scope: tokens.scope ?? null,
        token_type: tokens.token_type ?? null,
        expiry_date: expiryDate,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id' }
    )

    if (upsertError) {
      console.error('Failed to persist Gmail integration:', upsertError)
      const redirectUrl = '/settings?gmail=error&message=persist_failed'
      return NextResponse.redirect(redirectUrl)
    }

    return NextResponse.redirect(getRedirectPath())
  } catch (callbackError) {
    console.error('Gmail OAuth callback error:', callbackError)
    return NextResponse.redirect('/settings?gmail=error&message=callback_failed')
  }
}
