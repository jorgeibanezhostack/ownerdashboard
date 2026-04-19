import { NextRequest, NextResponse } from 'next/server'
import { adminClient } from '@/lib/supabase/admin'
import { requireOwnerOrManager } from '@/lib/apiAuth'
import { TORRIDONIA_PROPERTY_ID } from '@/lib/constants'

export async function GET(req: NextRequest) {
  const caller = await requireOwnerOrManager(req)
  if (!caller) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { data } = await adminClient
    .from('bookings')
    .select('*')
    .eq('property_id', TORRIDONIA_PROPERTY_ID)
    .order('check_in', { ascending: true })

  return NextResponse.json({ bookings: data ?? [] })
}

export async function POST(req: NextRequest) {
  const caller = await requireOwnerOrManager(req)
  if (!caller) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const body = await req.json().catch(() => null)
  const { guest_name, check_in, check_out, room, source, notes, guests_count } = body ?? {}

  if (!guest_name || !check_in || !check_out) {
    return NextResponse.json({ error: 'guest_name, check_in y check_out son requeridos' }, { status: 400 })
  }

  const { data, error } = await adminClient
    .from('bookings')
    .insert({
      property_id: TORRIDONIA_PROPERTY_ID,
      guest_name,
      check_in,
      check_out,
      room: room ?? null,
      source: source ?? 'manual',
      notes: notes ?? null,
      guests_count: guests_count ?? 1,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ booking: data })
}

export async function DELETE(req: NextRequest) {
  const caller = await requireOwnerOrManager(req)
  if (!caller) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'id requerido' }, { status: 400 })

  const { error } = await adminClient
    .from('bookings')
    .delete()
    .eq('id', id)
    .eq('property_id', TORRIDONIA_PROPERTY_ID)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
