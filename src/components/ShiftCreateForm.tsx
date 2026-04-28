'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface StaffUser {
  id: string
  full_name: string
  role: string
}

export default function ShiftCreateForm({ staff }: { staff: StaffUser[] }) {
  const [userId, setUserId] = useState('')
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')
  const [role, setRole] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('loading')
    setMessage('')

    const supabase = createClient()
    const {
      data: { session },
    } = await supabase.auth.getSession()

    const res = await fetch('/api/shifts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session?.access_token}`,
      },
      body: JSON.stringify({
        user_id: userId,
        start_time: startTime,
        end_time: endTime,
        role,
      }),
    })

    if (res.ok) {
      const data = await res.json()
      setStatus('success')
      setMessage(`Turno creado para ${data.worker_name}. Notificación enviada.`)
      setUserId('')
      setStartTime('')
      setEndTime('')
      setRole('')
    } else {
      setStatus('error')
      setMessage('Error al crear el turno. Intenta de nuevo.')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Staff</label>
        <select
          required
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
        >
          <option value="">Select a staff member</option>
          {staff.map((u) => (
            <option key={u.id} value={u.id}>
              {u.full_name} ({u.role})
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Shift role</label>
        <input
          type="text"
          required
          placeholder="E.g.: Reception, Cleaning, Kitchen"
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Start</label>
          <input
            type="datetime-local"
            required
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">End</label>
          <input
            type="datetime-local"
            required
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
          />
        </div>
      </div>

      {message && (
        <p
          className={`text-sm ${status === 'success' ? 'text-green-600' : 'text-red-600'}`}
        >
          {message}
        </p>
      )}

      <button
        type="submit"
        disabled={status === 'loading'}
        className="w-full bg-gray-900 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {status === 'loading' ? 'Creando...' : 'Create shift y notificar'}
      </button>
    </form>
  )
}
