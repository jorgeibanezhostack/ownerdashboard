import Link from 'next/link'
import { adminClient } from '@/lib/supabase/admin'
import { TORRIDONIA_PROPERTY_ID } from '@/lib/constants'
import LiveFeed from '@/components/LiveFeed'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const todayStr = today.toISOString().split('T')[0]

  const [
    { data: completions },
    { count: activeShifts },
    { count: pendingTasks },
    { count: checkInsToday },
    { count: checkOutsToday },
  ] = await Promise.all([
    adminClient
      .from('task_assignments')
      .select('id, completed_at, tasks(title), users!assigned_to(full_name)')
      .eq('property_id', TORRIDONIA_PROPERTY_ID)
      .gte('completed_at', today.toISOString())
      .order('completed_at', { ascending: false }),

    adminClient
      .from('shifts')
      .select('id', { count: 'exact', head: true })
      .eq('property_id', TORRIDONIA_PROPERTY_ID)
      .not('checked_in_at', 'is', null)
      .is('checked_out_at', null),

    adminClient
      .from('task_assignments')
      .select('id', { count: 'exact', head: true })
      .eq('property_id', TORRIDONIA_PROPERTY_ID)
      .is('completed_at', null)
      .gte('due_date', todayStr),

    adminClient
      .from('bookings')
      .select('id', { count: 'exact', head: true })
      .eq('property_id', TORRIDONIA_PROPERTY_ID)
      .eq('check_in', todayStr),

    adminClient
      .from('bookings')
      .select('id', { count: 'exact', head: true })
      .eq('property_id', TORRIDONIA_PROPERTY_ID)
      .eq('check_out', todayStr),
  ])

  const quickActions = [
    { href: '/dashboard/tasks', label: '+ Asignar tarea' },
    { href: '/dashboard/shifts', label: '+ Crear turno' },
    { href: '/dashboard/staff', label: '+ Agregar staff' },
    { href: '/dashboard/broadcast', label: '→ Broadcast' },
  ]

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

      {/* KPI Row 1 — Operaciones */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 border-l-4 border-l-[#004F59] p-4">
          <p className="text-xs text-gray-500 mb-1">Tareas completadas hoy</p>
          <p className="text-2xl font-semibold text-[#004F59]">{completions?.length ?? 0}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 border-l-4 border-l-[#00BFB3] p-4">
          <p className="text-xs text-gray-500 mb-1">Staff en turno ahora</p>
          <p className="text-2xl font-semibold text-[#00BFB3]">{activeShifts ?? 0}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 border-l-4 border-l-amber-400 p-4">
          <p className="text-xs text-gray-500 mb-1">Tareas pendientes hoy</p>
          <p className="text-2xl font-semibold text-amber-500">{pendingTasks ?? 0}</p>
        </div>
      </div>

      {/* KPI Row 2 — Reservas del día (desde iCal) */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 border-l-4 border-l-[#4af8d4] p-4">
          <p className="text-xs text-gray-500 mb-1">Check-ins hoy</p>
          <p className="text-2xl font-semibold text-[#004F59]">{checkInsToday ?? 0}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 border-l-4 border-l-[#4af8d4] p-4">
          <p className="text-xs text-gray-500 mb-1">Check-outs hoy</p>
          <p className="text-2xl font-semibold text-[#004F59]">{checkOutsToday ?? 0}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 border-l-4 border-l-gray-200 p-4">
          <p className="text-xs text-gray-500 mb-1">Reservas activas</p>
          <p className="text-2xl font-semibold text-gray-400">—</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-2">
        {quickActions.map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            className="px-4 py-2 rounded-lg text-sm font-medium border border-[#004F59] text-[#004F59] hover:bg-[#004F59] hover:text-white transition-colors"
          >
            {label}
          </Link>
        ))}
      </div>

      {/* Live Feed */}
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
