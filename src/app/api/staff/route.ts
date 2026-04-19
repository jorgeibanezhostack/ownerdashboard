import { NextRequest, NextResponse } from 'next/server'
import { adminClient } from '@/lib/supabase/admin'
import { requireOwnerOrManager } from '@/lib/apiAuth'
import { TORRIDONIA_PROPERTY_ID } from '@/lib/constants'

export async function GET(req: NextRequest) {
  const caller = await requireOwnerOrManager(req)
  if (!caller) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { data } = await adminClient
    .from('users')
    .select('id, full_name, email, role, is_active, check_in_date, check_out_date')
    .eq('property_id', TORRIDONIA_PROPERTY_ID)
    .order('role')
    .order('full_name')

  return NextResponse.json({ staff: data ?? [] })
}

export async function POST(req: NextRequest) {
  const caller = await requireOwnerOrManager(req)
  if (!caller) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const body = await req.json().catch(() => null)
  const { full_name, email, role, check_in_date, check_out_date } = body ?? {}

  if (!full_name || !email || !role) {
    return NextResponse.json({ error: 'full_name, email y role son requeridos' }, { status: 400 })
  }

  const { data, error } = await adminClient
    .from('users')
    .insert({
      property_id: TORRIDONIA_PROPERTY_ID,
      full_name,
      email,
      role,
      is_active: true,
      check_in_date: check_in_date ?? null,
      check_out_date: check_out_date ?? null,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ user: data })
}

export async function PATCH(req: NextRequest) {
  const caller = await requireOwnerOrManager(req)
  if (!caller) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const body = await req.json().catch(() => null)
  const { id, ...updates } = body ?? {}
  if (!id) return NextResponse.json({ error: 'id requerido' }, { status: 400 })

  const allowed = ['full_name', 'role', 'is_active', 'check_in_date', 'check_out_date']
  const filtered = Object.fromEntries(Object.entries(updates).filter(([k]) => allowed.includes(k)))

  const { data, error } = await adminClient
    .from('users')
    .update(filtered)
    .eq('id', id)
    .eq('property_id', TORRIDONIA_PROPERTY_ID)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ user: data })
}
