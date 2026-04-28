'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface StaffUser {
  id: string
  full_name: string
  role: string
}

export default function BroadcastForm({ staff }: { staff: StaffUser[] }) {
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [link, setLink] = useState('')
  const [sendToAll, setSendToAll] = useState(true)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  function toggleRecipient(id: string) {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('loading')
    setMessage('')

    const supabase = createClient()
    const {
      data: { session },
    } = await supabase.auth.getSession()

    const payload = {
      title,
      body,
      link: link || undefined,
      recipient_ids: sendToAll ? [] : selectedIds,
    }

    const res = await fetch('/api/broadcast', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session?.access_token}`,
      },
      body: JSON.stringify(payload),
    })

    if (res.ok) {
      const data = await res.json()
      setStatus('success')
      setMessage(`Message enviado a ${data.sent} miembro${data.sent !== 1 ? 's' : ''} del staff.`)
      setTitle('')
      setBody('')
      setLink('')
      setSelectedIds([])
    } else {
      setStatus('error')
      setMessage('Error al enviar el mensaje. Intenta de nuevo.')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
        <input
          type="text"
          required
          placeholder="E.g.: Meeting today at 6pm"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
        <textarea
          required
          rows={3}
          placeholder="Write your message here..."
          value={body}
          onChange={(e) => setBody(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 resize-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Link (optional)
        </label>
        <input
          type="text"
          placeholder="https://..."
          value={link}
          onChange={(e) => setLink(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Recipients</label>
        <label className="flex items-center gap-2 mb-2 cursor-pointer">
          <input
            type="checkbox"
            checked={sendToAll}
            onChange={(e) => {
              setSendToAll(e.target.checked)
              if (e.target.checked) setSelectedIds([])
            }}
            className="rounded border-gray-300"
          />
          <span className="text-sm text-gray-700">All active staff</span>
        </label>

        {!sendToAll && (
          <div className="space-y-1 max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-3">
            {staff.map((u) => (
              <label key={u.id} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedIds.includes(u.id)}
                  onChange={() => toggleRecipient(u.id)}
                  className="rounded border-gray-300"
                />
                <span className="text-sm text-gray-700">
                  {u.full_name}{' '}
                  <span className="text-gray-400">({u.role})</span>
                </span>
              </label>
            ))}
          </div>
        )}
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
        disabled={status === 'loading' || (!sendToAll && selectedIds.length === 0)}
        className="w-full bg-gray-900 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {status === 'loading' ? 'Enviando...' : 'Send notification'}
      </button>
    </form>
  )
}
