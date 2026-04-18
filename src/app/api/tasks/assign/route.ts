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
  const { task_id, assigned_to, due_date } = body ?? {}

  if (!task_id || !assigned_to || !due_date) {
    return NextResponse.json({ error: 'Faltan campos requeridos' }, { status: 400 })
  }

  const { data: assignment, error: assignError } = await adminClient
    .from('task_assignments')
    .insert({
      property_id: TORRIDONIA_PROPERTY_ID,
      task_id,
      assigned_to,
      due_date,
    })
    .select()
    .single()

  if (assignError || !assignment) {
    return NextResponse.json({ error: 'Error al asignar tarea' }, { status: 500 })
  }

  const [{ data: task }, { data: assignee }] = await Promise.all([
    adminClient.from('tasks').select('title').eq('id', task_id).single(),
    adminClient.from('users').select('full_name').eq('id', assigned_to).single(),
  ])

  await adminClient.from('notifications').insert({
    property_id: TORRIDONIA_PROPERTY_ID,
    user_id: assigned_to,
    type: 'task_assigned',
    title: 'Nueva tarea asignada',
    body: `Se te ha asignado: ${task?.title ?? 'una tarea'}`,
    link: `/tasks/${assignment.id}`,
  })

  return NextResponse.json({ assignment, assignee_name: assignee?.full_name })
}
