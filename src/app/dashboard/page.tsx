import { adminClient } from '@/lib/supabase/admin'
import { TORRIDONIA_PROPERTY_ID } from '@/lib/constants'
import LiveFeed from '@/components/LiveFeed'

export default async function DashboardPage() {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const { data: completions } = await adminClient
    .from('task_assignments')
    .select('id, completed_at, tasks(title), users!assigned_to(full_name)')
    .eq('property_id', TORRIDONIA_PROPERTY_ID)
    .gte('completed_at', today.toISOString())
    .order('completed_at', { ascending: false })

  const { count: activeShifts } = await adminClient
    .from('shifts')
    .select('id', { count: 'exact', head: true })
    .eq('property_id', TORRIDONIA_PROPERTY_ID)
    .not('checked_in_at', 'is', null)
    .is('checked_out_at', null)

  const { count: pendingTasks } = await adminClient
    .from('task_assignments')
    .select('id', { count: 'exact', head: true })
    .eq('property_id', TORRIDONIA_PROPERTY_ID)
    .is('completed_at', null)
    .gte('due_date', today.toISOString().split('T')[0])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">Torridonia Highland Hostel</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          {today.toLocaleDateString('es-ES', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          })}
        </p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-xs text-gray-500 mb-1">Tareas completadas hoy</p>
          <p className="text-2xl font-semibold text-gray-900">{completions?.length ?? 0}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-xs text-gray-500 mb-1">Staff en turno ahora</p>
          <p className="text-2xl font-semibold text-gray-900">{activeShifts ?? 0}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-xs text-gray-500 mb-1">Tareas pendientes hoy</p>
          <p className="text-2xl font-semibold text-gray-900">{pendingTasks ?? 0}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h2 className="text-sm font-semibold text-gray-900 mb-4">Actividad en tiempo real</h2>
        <LiveFeed
          initialCompletions={
            ((completions ?? []) as unknown as Array<{
              id: string
              completed_at: string
              tasks: { title: string } | null
              users: { full_name: string } | null
            }>)
          }
        />
      </div>
    </div>
  )
}
