import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { adminClient } from '@/lib/supabase/admin'
import { TORRIDONIA_PROPERTY_ID } from '@/lib/constants'
import HostackLogo from '@/components/Logo'

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
    { href: '/dashboard', label: 'Inicio' },
    { href: '/dashboard/bookings', label: 'Reservas' },
    { href: '/dashboard/staff', label: 'Staff' },
    { href: '/dashboard/tasks', label: 'Tareas' },
    { href: '/dashboard/shifts', label: 'Turnos' },
    { href: '/dashboard/broadcast', label: 'Broadcast' },
    { href: '/dashboard/settings', label: 'Ajustes' },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <HostackLogo />
            <span className="text-xs text-gray-400 border-l pl-4 hidden sm:block">{propertyName}</span>
            <div className="flex items-center gap-0.5 overflow-x-auto">
              {navItems.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  className="px-3 py-1.5 rounded-md text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors whitespace-nowrap"
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>
          <span className="text-sm text-gray-500 hidden md:block">{profile.full_name}</span>
        </div>
      </nav>
      <main className="max-w-6xl mx-auto px-4 py-6">{children}</main>
    </div>
  )
}
