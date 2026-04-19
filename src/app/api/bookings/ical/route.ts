import { NextRequest, NextResponse } from 'next/server'
import { adminClient } from '@/lib/supabase/admin'
import { requireOwnerOrManager } from '@/lib/apiAuth'
import { TORRIDONIA_PROPERTY_ID } from '@/lib/constants'

function parseIcalDate(str: string): Date {
  const clean = str.replace(/[TZ]/g, '').replace(/;.*/, '')
  const y = +clean.slice(0, 4), m = +clean.slice(4, 6) - 1, d = +clean.slice(6, 8)
  if (clean.length > 8) {
    const h = +clean.slice(8, 10), min = +clean.slice(10, 12), s = +clean.slice(12, 14)
    return new Date(Date.UTC(y, m, d, h, min, s))
  }
  return new Date(Date.UTC(y, m, d))
}

function parseIcal(text: string) {
  const events: { start: Date; end: Date; summary: string; uid: string; description: string | null }[] = []
  const lines = text.replace(/\r\n[ \t]/g, '').split(/\r\n|\n|\r/)
  let inEvent = false
  let cur: Record<string, string> = {}
  for (const line of lines) {
    if (line === 'BEGIN:VEVENT') { inEvent = true; cur = {}; continue }
    if (line === 'END:VEVENT') {
      if (cur['DTSTART'] && cur['DTEND']) {
        events.push({
          start: parseIcalDate(cur['DTSTART']),
          end: parseIcalDate(cur['DTEND']),
          summary: cur['SUMMARY'] ?? 'Reserva',
          uid: cur['UID'] ?? `${cur['DTSTART']}-${cur['SUMMARY'] ?? ''}`,
          description: cur['DESCRIPTION'] ?? null,
        })
      }
      inEvent = false; continue
    }
    if (!inEvent) continue
    const colon = line.indexOf(':')
    if (colon < 0) continue
    const key = line.slice(0, colon).split(';')[0]
    cur[key] = line.slice(colon + 1)
  }
  return events
}

export async function POST(req: NextRequest) {
  const caller = await requireOwnerOrManager(req)
  if (!caller) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const body = await req.json().catch(() => null)
  const { url, source } = body ?? {}
  if (!url) return NextResponse.json({ error: 'url requerida' }, { status: 400 })

  let text: string
  try {
    const res = await fetch(url)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    text = await res.text()
  } catch {
    return NextResponse.json({ error: 'No se pudo leer el calendario. Verifica la URL.' }, { status: 422 })
  }

  const events = parseIcal(text)
  if (events.length === 0) return NextResponse.json({ imported: 0 })

  const rows = events.map(e => ({
    property_id: TORRIDONIA_PROPERTY_ID,
    guest_name: e.summary,
    check_in: e.start.toISOString().split('T')[0],
    check_out: e.end.toISOString().split('T')[0],
    source: source ?? 'ical',
    notes: e.description,
    ical_uid: e.uid,
  }))

  const { error } = await adminClient
    .from('bookings')
    .upsert(rows, { onConflict: 'ical_uid' })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ imported: rows.length })
}
