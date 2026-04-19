import { NextRequest, NextResponse } from 'next/server'
import { adminClient } from '@/lib/supabase/admin'

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null)
  const email = body?.email

  if (!email || typeof email !== 'string') {
    return NextResponse.json({ ok: false, error: 'Email requerido' }, { status: 400 })
  }

  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000')

  const { data, error } = await adminClient.auth.admin.generateLink({
    type: 'magiclink',
    email,
    options: {
      redirectTo: `${appUrl}/auth/callback`,
    },
  })

  if (error) {
    console.error('[send-magic-link] error:', error.message)
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
  }

  // Link the Supabase auth user ID to the users table auth_uid column.
  // Without this, dashboard/layout.tsx can't find the profile and loops back to login.
  const authUserId = data?.user?.id
  if (authUserId) {
    const { error: updateError } = await adminClient
      .from('users')
      .update({ auth_uid: authUserId })
      .eq('email', email)

    if (updateError) {
      console.error('[send-magic-link] auth_uid update error:', updateError.message)
    } else {
      console.log('[send-magic-link] auth_uid linked for', email)
    }
  }

  // Build callback URL directly from hashed_token — bypasses Supabase redirect
  // servers so token_hash arrives as query param (not URL fragment)
  const hashedToken = data?.properties?.hashed_token
  const callbackUrl = hashedToken
    ? `${appUrl}/auth/callback?token_hash=${encodeURIComponent(hashedToken)}&type=email`
    : null

  console.log('[send-magic-link] callback_url for', email, ':', callbackUrl)

  return NextResponse.json({ ok: true, callback_url: callbackUrl })
}
