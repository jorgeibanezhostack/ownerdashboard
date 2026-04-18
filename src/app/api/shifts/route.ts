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
  const { user_id, start_time, end_time, role } = body ?? {}

  if (!user_id || !start_time || !end_time || !role) {
    return NextResponse.json({ error: 'Faltan campos requeridos' }, { status: 400 })
  }

  const { data: shift, error: shiftError } = await adminClient
    .from('shifts')
    .insert({
      property_id: TORRIDONIA_PROPERTY_ID,
      user_id,
      start_time,
      end_time,
      role,
    })
    .select()
    .single()

  if (shiftError || !shift) {
    return NextResponse.json({ error: 'Error al crear turno' }, { status: 500 })
  }

  const { data: worker } = await adminClient
    .from('users')
    .select('full_name')
    .eq('id', user_id)
    .single()

  const shiftDate = new Date(start_time).toLocaleDateString('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })

  await adminClient.from('notifications').insert({
    property_id: TORRIDONIA_PROPERTY_ID,
    user_id,
    type: 'shift_assigned',
    title: 'Nuevo turno asignado',
    body: `Tienes un turno el ${shiftDate} (${role})`,
    link: null,
  })

  return NextResponse.json({ shift, worker_name: worker?.full_name })
}
