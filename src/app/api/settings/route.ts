import { NextRequest, NextResponse } from 'next/server'
import { adminClient } from '@/lib/supabase/admin'
import { requireOwnerOrManager } from '@/lib/apiAuth'
import { TORRIDONIA_PROPERTY_ID } from '@/lib/constants'

export async function PATCH(req: NextRequest) {
  const caller = await requireOwnerOrManager(req)
  if (!caller) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const body = await req.json().catch(() => null)
  const { name } = body ?? {}
  if (!name || typeof name !== 'string' || name.trim().length < 2) {
    return NextResponse.json({ error: 'Nombre inválido' }, { status: 400 })
  }

  const { data, error } = await adminClient
    .from('properties')
    .update({ name: name.trim() })
    .eq('id', TORRIDONIA_PROPERTY_ID)
    .select('name')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ name: data.name })
}
