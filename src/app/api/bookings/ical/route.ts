import { NextRequest, NextResponse } from 'next/server'
import { adminClient } from '@/lib/supabase/admin'
import { requireOwnerOrManager } from '@/lib/apiAuth'
import { TORRIDONIA_PROPERTY_ID } from '@/lib/constants'
import ical from 'node-ical'

export async function POST(req: NextRequest) {
  const caller = await requireOwnerOrManager(req)
  if (!caller) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const body = await req.json().catch(() => null)
  const { url, source } = body ?? {}
  if (!url) return NextResponse.json({ error: 'url requerida' }, { status: 400 })

  let events: Record<string, unknown>
  try {
    events = await ical.async.fromURL(url)
  } catch {
    return NextResponse.json({ error: 'No se pudo leer el calendario. Verifica la URL.' }, { status: 422 })
  }

  const rows: {
    property_id: string
    guest_name: string
    check_in: string
    check_out: string
    source: string
    notes: string | null
    ical_uid: string
  }[] = []

  for (const event of Object.values(events)) {
    const e = event as Record<string, unknown>
    if (e.type !== 'VEVENT') continue

    const start = e.start as Date | undefined
    const end = e.end as Date | undefined
    if (!start || !end) continue

    const summary = (e.summary as string | undefined) ?? 'Reserva'
    const uid = (e.uid as string | undefined) ?? `${start.toISOString()}-${summary}`

    rows.push({
      property_id: TORRIDONIA_PROPERTY_ID,
      guest_name: summary,
      check_in: start.toISOString().split('T')[0],
      check_out: end.toISOString().split('T')[0],
      source: source ?? 'ical',
      notes: (e.description as string | null) ?? null,
      ical_uid: uid,
    })
  }

  if (rows.length === 0) return NextResponse.json({ imported: 0 })

  // Upsert by ical_uid to avoid duplicates on re-sync
  const { error } = await adminClient
    .from('bookings')
    .upsert(rows, { onConflict: 'ical_uid' })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ imported: rows.length })
}
