import { google } from 'googleapis'

const DEFAULT_SCOPES = [
  'https://www.googleapis.com/auth/gmail.readonly',
  'https://www.googleapis.com/auth/gmail.send',
  'https://www.googleapis.com/auth/userinfo.email',
  'https://www.googleapis.com/auth/userinfo.profile',
]

export const GMAIL_SCOPES = DEFAULT_SCOPES

export const getRedirectUri = () => {
  const explicit = process.env.GOOGLE_GMAIL_REDIRECT_URI || process.env.GOOGLE_OAUTH_REDIRECT_URI
  if (explicit) return explicit

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL || 'http://localhost:3000'
  return `${baseUrl.replace(/\/$/, '')}/api/integrations/gmail/callback`
}

export const getOAuthClient = () => {
  const clientId = process.env.GOOGLE_GMAIL_CLIENT_ID || process.env.GOOGLE_CLIENT_ID
  const clientSecret = process.env.GOOGLE_GMAIL_CLIENT_SECRET || process.env.GOOGLE_CLIENT_SECRET
  const redirectUri = getRedirectUri()

  if (!clientId || !clientSecret) {
    throw new Error('Gmail OAuth environment variables are not configured. Please set GOOGLE_GMAIL_CLIENT_ID and GOOGLE_GMAIL_CLIENT_SECRET (or GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET).')
  }

  return new google.auth.OAuth2(clientId, clientSecret, redirectUri)
}

export const oauth2ClientFor = (tokens: {
  access_token?: string | null
  refresh_token?: string | null
  expiry_date?: number | null
  token_type?: string | null
}) => {
  const client = getOAuthClient()
  client.setCredentials(tokens)
  return client
}
