'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export const dynamic = 'force-dynamic'

type StaffMember = {
  id: string; full_name: string; email: string
  role: string; is_active: boolean
  check_in_date: string | null; check_out_date: string | null
}

const ROLE_LABELS: Record<string, string> = {
  owner: 'Owner', manager: 'Manager', staff: 'Staff', volunteer: 'Volunteer'
}
const ROLE_COLORS: Record<string, string> = {
  owner: 'bg-purple-100 text-purple-700',
  manager: 'bg-blue-100 text-blue-700',
  staff: 'bg-teal-100 text-teal-700',
  volunteer: 'bg-orange-100 text-orange-700',
}

export default function StaffPage() {
  const [staff, setStaff] = useState<StaffMember[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ full_name: '', email: '', role: 'staff', check_in_date: '', check_out_date: '' })
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')

  const getToken = useCallback(async () => {
    const { data: { session } } = await createClient().auth.getSession()
    return session?.access_token ?? ''
  }, [])

  const loadStaff = useCallback(async () => {
    setLoading(true)
    const token = await getToken()
    const res = await fetch('/api/staff', { headers: { Authorization: `Bearer ${token}` } })
    const data = await res.json()
    setStaff(data.staff ?? [])
    setLoading(false)
  }, [getToken])

  useEffect(() => { loadStaff() }, [loadStaff])

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setMsg('')
    const token = await getToken()
    const res = await fetch('/api/staff', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(form),
    })
    const data = await res.json()
    if (res.ok) {
      setMsg('Miembro agregado correctamente.')
      setShowForm(false)
      setForm({ full_name: '', email: '', role: 'staff', check_in_date: '', check_out_date: '' })
      loadStaff()
    } else {
      setMsg(data.error ?? 'Error al agregar.')
    }
    setSaving(false)
  }

  async function toggleActive(member: StaffMember) {
    const token = await getToken()
    await fetch('/api/staff', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ id: member.id, is_active: !member.is_active }),
    })
    loadStaff()
  }

  const grouped = ['owner', 'manager', 'staff', 'volunteer'].reduce((acc, role) => {
    acc[role] = staff.filter(s => s.role === role)
    return acc
  }, {} as Record<string, StaffMember[]>)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Staff</h1>
          <p className="text-sm text-gray-500 mt-0.5">{staff.length} registered members</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-teal-700 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-teal-800 transition-colors"
        >
          + Add member
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Nuevo miembro del staff</h2>
          <form onSubmit={handleAdd} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Nombre completo</label>
                <input required value={form.full_name} onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-600" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Email</label>
                <input type="email" required value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-600" />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Rol</label>
                <select value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-600">
                  <option value="staff">Staff</option>
                  <option value="volunteer">Volunteer</option>
                  <option value="manager">Manager</option>
                  <option value="owner">Owner</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Check-in</label>
                <input type="date" value={form.check_in_date} onChange={e => setForm(f => ({ ...f, check_in_date: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-600" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Check-out</label>
                <input type="date" value={form.check_out_date} onChange={e => setForm(f => ({ ...f, check_out_date: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-600" />
              </div>
            </div>
            {msg && <p className="text-sm text-red-600">{msg}</p>}
            <div className="flex gap-2">
              <button type="submit" disabled={saving}
                className="bg-teal-700 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-teal-800 disabled:opacity-50 transition-colors">
                {saving ? 'Saving...' : 'Agregar'}
              </button>
              <button type="button" onClick={() => setShowForm(false)}
                className="py-2 px-4 rounded-lg text-sm text-gray-600 hover:bg-gray-100 transition-colors">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {msg && !showForm && <p className="text-sm text-teal-700">{msg}</p>}

      {loading ? (
        <p className="text-sm text-gray-400">Cargando staff...</p>
      ) : (
        <div className="space-y-4">
          {Object.entries(grouped).map(([role, members]) =>
            members.length === 0 ? null : (
              <div key={role} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="px-5 py-3 border-b border-gray-100 flex items-center gap-2">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${ROLE_COLORS[role]}`}>
                    {ROLE_LABELS[role]}
                  </span>
                  <span className="text-xs text-gray-400">{members.length}</span>
                </div>
                <ul className="divide-y divide-gray-50">
                  {members.map(m => (
                    <li key={m.id} className="px-5 py-3 flex items-center justify-between">
                      <div>
                        <p className={`text-sm font-medium ${m.is_active ? 'text-gray-900' : 'text-gray-400'}`}>
                          {m.full_name}
                        </p>
                        <p className="text-xs text-gray-400">{m.email}</p>
                        {m.check_in_date && (
                          <p className="text-xs text-gray-400 mt-0.5">
                            {m.check_in_date} → {m.check_out_date ?? '?'}
                          </p>
                        )}
                      </div>
                      <button onClick={() => toggleActive(m)}
                        className={`text-xs px-2 py-1 rounded-md border transition-colors ${
                          m.is_active
                            ? 'border-gray-200 text-gray-500 hover:bg-gray-50'
                            : 'border-orange-200 text-orange-600 hover:bg-orange-50'
                        }`}>
                        {m.is_active ? 'Activo' : 'Inactivo'}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )
          )}
        </div>
      )}
    </div>
  )
}
