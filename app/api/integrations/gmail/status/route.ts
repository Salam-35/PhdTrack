import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function GET() {
  const supabase = createRouteHandlerClient({ cookies })

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    return NextResponse.json({ connected: false })
  }

  const { data, error: selectError } = await supabase
    .from('gmail_integrations')
    .select('gmail_address, updated_at')
    .eq('user_id', user.id)
    .maybeSingle()

  if (selectError) {
    console.error('Failed to load Gmail integration status:', selectError)
    return NextResponse.json({ connected: false, error: 'Failed to load integration state.' }, { status: 500 })
  }

  if (!data) {
    return NextResponse.json({ connected: false })
  }

  return NextResponse.json({
    connected: true,
    gmailAddress: data.gmail_address,
    updatedAt: data.updated_at,
  })
}
