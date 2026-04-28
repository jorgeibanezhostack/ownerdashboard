'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export const dynamic = 'force-dynamic'

type Booking = {
  id: string; guest_name: string; check_in: string; check_out: string
  room: string | null; source: string; guests_count: number; notes: string | null
}

const SOURCE_COLORS: Record<string, string> = {
  manual: 'bg-gray-100 text-gray-600',
  airbnb: 'bg-rose-100 text-rose-700',
  booking: 'bg-blue-100 text-blue-700',
  ical: 'bg-purple-100 text-purple-700',
}

function nights(ci: string, co: string) {
  return Math.round((new Date(co).getTime() - new Date(ci).getTime()) / 86400000)
}

function fmt(d: string) {
  return new Date(d + 'T12:00:00').toLocaleDateString('en-US', { day: 'numeric', month: 'short' })
}

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'list' | 'add' | 'ical'>('list')
  const [form, setForm] = useState({ guest_name: '', check_in: '', check_out: '', room: '', source: 'manual', guests_count: '1', notes: '' })
  const [icalUrl, setIcalUrl] = useState('')
  const [icalSource, setIcalSource] = useState('airbnb')
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')
  const [msgType, setMsgType] = useState<'ok' | 'err'>('ok')

  const getToken = useCallback(async () => {
    const { data: { session } } = await createClient().auth.getSession()
    return session?.access_token ?? ''
  }, [])

  const load = useCallback(async () => {
    setLoading(true)
    const token = await getToken()
    const res = await fetch('/api/bookings', { headers: { Authorization: `Bearer ${token}` } })
    const data = await res.json()
    setBookings(data.bookings ?? [])
    setLoading(false)
  }, [getToken])

  useEffect(() => { load() }, [load])

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true); setMsg('')
    const token = await getToken()
    const res = await fetch('/api/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ ...form, guests_count: Number(form.guests_count) }),
    })
    const data = await res.json()
    if (res.ok) {
      setMsg('Booking added.'); setMsgType('ok')
      setForm({ guest_name: '', check_in: '', check_out: '', room: '', source: 'manual', guests_count: '1', notes: '' })
      setTab('list'); load()
    } else { setMsg(data.error ?? 'Error'); setMsgType('err') }
    setSaving(false)
  }

  async function handleIcal(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true); setMsg('')
    const token = await getToken()
    const res = await fetch('/api/bookings/ical', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ url: icalUrl, source: icalSource }),
    })
    const data = await res.json()
    if (res.ok) {
      setMsg(`${data.imported} bookings imported.`); setMsgType('ok')
      setIcalUrl(''); load()
    } else { setMsg(data.error ?? 'Error'); setMsgType('err') }
    setSaving(false)
  }

  async function handleDelete(id: string) {
    const token = await getToken()
    await fetch(`/api/bookings?id=${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } })
    load()
  }

  const upcoming = bookings.filter(b => new Date(b.check_out) >= new Date())
  const past = bookings.filter(b => new Date(b.check_out) < new Date())

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Bookings</h1>
          <p className="text-sm text-gray-500 mt-0.5">{upcoming.length} upcoming · {past.length} past</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setTab('ical')}
            className={`py-2 px-3 rounded-lg text-sm font-medium border transition-colors ${tab === 'ical' ? 'bg-teal-700 text-white border-teal-700' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
            Sync iCal
          </button>
          <button onClick={() => setTab('add')}
            className={`py-2 px-3 rounded-lg text-sm font-medium border transition-colors ${tab === 'add' ? 'bg-teal-700 text-white border-teal-700' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
            + Manual
          </button>
        </div>
      </div>

      {msg && <p className={`text-sm ${msgType === 'ok' ? 'text-teal-700' : 'text-red-600'}`}>{msg}</p>}

      {tab === 'add' && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Add manual booking</h2>
          <form onSubmit={handleAdd} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Guest name</label>
                <input required value={form.guest_name} onChange={e => setForm(f => ({ ...f, guest_name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-600" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Room / Bed</label>
                <input value={form.room} onChange={e => setForm(f => ({ ...f, room: e.target.value }))}
                  placeholder="Ej: Dorm 4, Bed 2"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-600" />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Check-in</label>
                <input type="date" required value={form.check_in} onChange={e => setForm(f => ({ ...f, check_in: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-600" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Check-out</label>
                <input type="date" required value={form.check_out} onChange={e => setForm(f => ({ ...f, check_out: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-600" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Guests</label>
                <input type="number" min="1" value={form.guests_count} onChange={e => setForm(f => ({ ...f, guests_count: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-600" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Channel</label>
              <select value={form.source} onChange={e => setForm(f => ({ ...f, source: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-600">
                <option value="manual">Manual</option>
                <option value="airbnb">Airbnb</option>
                <option value="booking">Booking.com</option>
                <option value="direct">Directo</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Notes</label>
              <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                rows={2} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-600 resize-none" />
            </div>
            <div className="flex gap-2">
              <button type="submit" disabled={saving}
                className="bg-teal-700 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-teal-800 disabled:opacity-50 transition-colors">
                {saving ? 'Saving...' : 'Add booking'}
              </button>
              <button type="button" onClick={() => setTab('list')}
                className="py-2 px-4 rounded-lg text-sm text-gray-600 hover:bg-gray-100 transition-colors">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {tab === 'ical' && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-sm font-semibold text-gray-700 mb-1">Sync from iCal</h2>
          <p className="text-xs text-gray-400 mb-4">Import bookings from Airbnb, Booking.com or other channel via calendar URL.</p>
          <form onSubmit={handleIcal} className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Channel</label>
              <select value={icalSource} onChange={e => setIcalSource(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-600">
                <option value="airbnb">Airbnb</option>
                <option value="booking">Booking.com</option>
                <option value="ical">Otro (iCal)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Calendar URL (.ics)</label>
              <input type="url" required value={icalUrl} onChange={e => setIcalUrl(e.target.value)}
                placeholder="https://www.airbnb.com/calendar/ical/..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-600" />
            </div>
            <p className="text-xs text-gray-400">
              Airbnb: Calendario → Exportar → Copiar link | Booking.com: Extranet → Bookings → iCal
            </p>
            <div className="flex gap-2">
              <button type="submit" disabled={saving}
                className="bg-teal-700 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-teal-800 disabled:opacity-50 transition-colors">
                {saving ? 'Importing...' : 'Import bookings'}
              </button>
              <button type="button" onClick={() => setTab('list')}
                className="py-2 px-4 rounded-lg text-sm text-gray-600 hover:bg-gray-100 transition-colors">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <p className="text-sm text-gray-400">Loading bookings...</p>
      ) : (
        <div className="space-y-4">
          {upcoming.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-5 py-3 border-b border-gray-100">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Upcoming</span>
              </div>
              <ul className="divide-y divide-gray-50">
                {upcoming.map(b => (
                  <li key={b.id} className="px-5 py-3 flex items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-gray-900 truncate">{b.guest_name}</p>
                        <span className={`text-xs px-1.5 py-0.5 rounded-full ${SOURCE_COLORS[b.source] ?? SOURCE_COLORS.ical}`}>
                          {b.source}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {fmt(b.check_in)} → {fmt(b.check_out)} · {nights(b.check_in, b.check_out)}n
                        {b.room && ` · ${b.room}`}
                        {b.guests_count > 1 && ` · ${b.guests_count} guests`}
                      </p>
                    </div>
                    <button onClick={() => handleDelete(b.id)}
                      className="text-xs text-gray-400 hover:text-red-500 transition-colors shrink-0">
                      Delete
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {past.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden opacity-60">
              <div className="px-5 py-3 border-b border-gray-100">
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Past ({past.length})</span>
              </div>
              <ul className="divide-y divide-gray-50">
                {past.slice(0, 5).map(b => (
                  <li key={b.id} className="px-5 py-3 flex items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-500 truncate">{b.guest_name}</p>
                      <p className="text-xs text-gray-400">{fmt(b.check_in)} → {fmt(b.check_out)}</p>
                    </div>
                    <span className={`text-xs px-1.5 py-0.5 rounded-full ${SOURCE_COLORS[b.source] ?? SOURCE_COLORS.ical}`}>
                      {b.source}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {bookings.length === 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
              <p className="text-gray-400 text-sm">No bookings registered.</p>
              <p className="text-gray-400 text-xs mt-1">Add manually or sync from iCal.</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
