'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Task {
  id: string
  title: string
  role_category: string
}

interface StaffUser {
  id: string
  full_name: string
  role: string
}

export default function TaskAssignForm({
  tasks,
  staff,
}: {
  tasks: Task[]
  staff: StaffUser[]
}) {
  const [taskId, setTaskId] = useState('')
  const [assignedTo, setAssignedTo] = useState('')
  const [dueDate, setDueDate] = useState('')
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

    const res = await fetch('/api/tasks/assign', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session?.access_token}`,
      },
      body: JSON.stringify({ task_id: taskId, assigned_to: assignedTo, due_date: dueDate }),
    })

    if (res.ok) {
      const data = await res.json()
      setStatus('success')
      setMessage(`Tarea asignada a ${data.assignee_name}. Notificación enviada.`)
      setTaskId('')
      setAssignedTo('')
      setDueDate('')
    } else {
      setStatus('error')
      setMessage('Error al asignar la tarea. Intenta de nuevo.')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Tarea</label>
        <select
          required
          value={taskId}
          onChange={(e) => setTaskId(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
        >
          <option value="">Selecciona una tarea</option>
          {tasks.map((t) => (
            <option key={t.id} value={t.id}>
              {t.title} — {t.role_category}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Asignar a</label>
        <select
          required
          value={assignedTo}
          onChange={(e) => setAssignedTo(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
        >
          <option value="">Selecciona un miembro del staff</option>
          {staff.map((u) => (
            <option key={u.id} value={u.id}>
              {u.full_name} ({u.role})
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Fecha límite</label>
        <input
          type="date"
          required
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
        />
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
        {status === 'loading' ? 'Asignando...' : 'Asignar tarea y notificar'}
      </button>
    </form>
  )
}
