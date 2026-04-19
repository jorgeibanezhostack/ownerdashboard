'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { TORRIDONIA_PROPERTY_ID } from '@/lib/constants'

export const dynamic = 'force-dynamic'

export default function SettingsPage() {
  const [name, setName] = useState('')
  const [original, setOriginal] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [msg, setMsg] = useState('')

  useEffect(() => {
    const supabase = createClient()
    supabase.from('properties').select('name').eq('id', TORRIDONIA_PROPERTY_ID).single()
      .then(({ data }) => { if (data) { setName(data.name); setOriginal(data.name) } })
  }, [])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (name.trim() === original) return
    setStatus('loading')
    setMsg('')

    const supabase = createClient()
    const { data: { session } } = await supabase.auth.getSession()

    const res = await fetch('/api/settings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session?.access_token}` },
      body: JSON.stringify({ name }),
    })
    const data = await res.json()

    if (res.ok) {
      setOriginal(data.name)
      setStatus('success')
      setMsg('Nombre actualizado correctamente.')
    } else {
      setStatus('error')
      setMsg(data.error ?? 'Error al guardar.')
    }
  }

  return (
    <div className="max-w-lg space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">Ajustes de propiedad</h1>
        <p className="text-sm text-gray-500 mt-1">Configura los datos de tu propiedad.</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-sm font-semibold text-gray-700 mb-4">Nombre de la propiedad</h2>
        <form onSubmit={handleSave} className="space-y-4">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nombre de la propiedad"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-600"
          />
          {msg && (
            <p className={`text-sm ${status === 'success' ? 'text-teal-700' : 'text-red-600'}`}>{msg}</p>
          )}
          <button
            type="submit"
            disabled={status === 'loading' || name.trim() === original}
            className="bg-teal-700 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-teal-800 disabled:opacity-40 transition-colors"
          >
            {status === 'loading' ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </form>
      </div>
    </div>
  )
}
