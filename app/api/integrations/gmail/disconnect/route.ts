import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { oauth2ClientFor } from '@/lib/google-oauth'

export async function POST() {
  const supabase = createRouteHandlerClient({ cookies })

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: record, error: selectError } = await supabase
    .from('gmail_integrations')
    .select('refresh_token, access_token')
    .eq('user_id', user.id)
    .maybeSingle()

  if (selectError) {
    console.error('Failed to load Gmail integration for disconnect:', selectError)
    return NextResponse.json({ error: 'Failed to disconnect Gmail integration.' }, { status: 500 })
  }

  if (!record) {
    return NextResponse.json({ success: true })
  }

  try {
    const oauthClient = oauth2ClientFor({
      access_token: record.access_token || undefined,
      refresh_token: record.refresh_token || undefined,
    })

    const tokenToRevoke = record.refresh_token || record.access_token
    if (tokenToRevoke) {
      await oauthClient.revokeToken(tokenToRevoke)
    }
  } catch (revokeError) {
    console.warn('Gmail token revocation failed (continuing):', revokeError)
  }

  const { error: deleteError } = await supabase
    .from('gmail_integrations')
    .delete()
    .eq('user_id', user.id)

  if (deleteError) {
    console.error('Failed to delete Gmail integration record:', deleteError)
    return NextResponse.json({ error: 'Failed to disconnect Gmail integration.' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
