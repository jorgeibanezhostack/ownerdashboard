import { NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { adminClient } from '@/lib/supabase/admin'

export async function requireOwnerOrManager(req: NextRequest) {
  const token = req.headers.get('authorization')?.replace('Bearer ', '').trim()
  if (!token) return null

  // Verify JWT via anon client (getUser with token calls /auth/v1/user with Bearer header)
  const anonClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  const {
    data: { user },
  } = await anonClient.auth.getUser(token)
  if (!user) return null

  const { data: profile } = await adminClient
    .from('users')
    .select('id, role, property_id')
    .eq('auth_uid', user.id)
    .single()

  if (!profile || !['owner', 'manager'].includes(profile.role)) return null
  return profile
}
