import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { adminClient } from '@/lib/supabase/admin'
import { TORRIDONIA_PROPERTY_ID } from '@/lib/constants'
import DashboardNav from '@/components/DashboardNav'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await adminClient
    .from('users')
    .select('role, full_name, property_id')
    .eq('auth_uid', user.id)
    .single()

  if (!profile || !['owner', 'manager'].includes(profile.role)) redirect('/login')

  const { data: property } = await adminClient
    .from('properties')
    .select('name')
    .eq('id', TORRIDONIA_PROPERTY_ID)
    .single()

  const propertyName = property?.name ?? 'Torridonia'

  const navItems = [
    { href: '/dashboard', label: '' },
    { href: '/dashboard/bookings', label: 'Reservas' },
    { href: '/dashboard/staff', label: 'Staff' },
    { href: '/dashboard/tasks', label: 'Tareas' },
    { href: '/dashboard/shifts', label: 'Turnos' },
    { href: '/dashboard/broadcast', label: 'Broadcast' },
    { href: '/dashboard/settings', label: 'Ajustes' },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardNav
        navItems={navItems}
        propertyName={propertyName}
        fullName={profile.full_name ?? ''}
      />
      <main className="max-w-6xl mx-auto px-4 py-6">{children}</main>
    </div>
  )
}
