import { NextRequest, NextResponse } from 'next/server'
import { adminClient } from '@/lib/supabase/admin'
import { requireOwnerOrManager } from '@/lib/apiAuth'
import { TORRIDONIA_PROPERTY_ID } from '@/lib/constants'

export async function POST(req: NextRequest) {
  const caller = await requireOwnerOrManager(req)
  if (!caller) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const body = await req.json().catch(() => null)
  const { title, body: msgBody, link, recipient_ids } = body ?? {}

  if (!title || !msgBody) {
    return NextResponse.json({ error: 'Título y mensaje son requeridos' }, { status: 400 })
  }

  let userIds: string[] = Array.isArray(recipient_ids) ? recipient_ids : []

  if (userIds.length === 0) {
    const { data: users } = await adminClient
      .from('users')
      .select('id')
      .eq('property_id', TORRIDONIA_PROPERTY_ID)
      .in('role', ['staff', 'volunteer'])
      .eq('is_active', true)

    userIds = users?.map((u: { id: string }) => u.id) ?? []
  }

  if (userIds.length === 0) {
    return NextResponse.json({ sent: 0 })
  }

  const rows = userIds.map((uid) => ({
    property_id: TORRIDONIA_PROPERTY_ID,
    user_id: uid,
    type: 'broadcast',
    title,
    body: msgBody,
    link: link ?? null,
  }))

  await adminClient.from('notifications').insert(rows)

  return NextResponse.json({ sent: rows.length })
}
