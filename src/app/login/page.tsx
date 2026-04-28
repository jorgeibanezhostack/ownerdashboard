'use client'

import { useState } from 'react'
import HostackLogo from '@/components/Logo'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'sent' | 'error'>('idle')
  const [callbackUrl, setCallbackUrl] = useState<string | null>(null)
  const [errorMsg, setErrorMsg] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('loading')
    setCallbackUrl(null)
    setErrorMsg('')

    const res = await fetch('/api/send-magic-link', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    })

    const data = await res.json()

    if (res.ok && data.ok) {
      setStatus('sent')
      if (data.callback_url) setCallbackUrl(data.callback_url)
    } else {
      setStatus('error')
      setErrorMsg(data.error ?? 'Unknown error')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 w-full max-w-sm">
        <div className="mb-6">
          <HostackLogo />
          <p className="text-sm text-gray-500 mt-1 ml-9">Owner Dashboard</p>
        </div>

        {status === 'sent' ? (
          <div className="space-y-4">
            <div className="text-center py-2">
              <p className="text-gray-700 font-medium">Check your email</p>
              <p className="text-sm text-gray-500 mt-1">
                We sent a link to <strong>{email}</strong>
              </p>
            </div>

            {callbackUrl && (
              <div className="bg-teal-50 border border-teal-200 rounded-lg p-3">
                <p className="text-xs text-teal-700 mb-2">Didn&apos;t get the email? Access directly:</p>

                <a
                  href={callbackUrl}
                  className="block w-full text-center bg-teal-700 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-teal-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  Access dashboard →
                </a>
              </div>
            )}

            <button
              onClick={() => { setStatus('idle'); setCallbackUrl(null) }}
              className="w-full bg-white border border-gray-300 text-gray-700 py-2 px-4 rounded-lg text-sm font-medium hover:bg-gray-50 transition-all"
            >
              Send another link
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              />
            </div>

            {status === 'error' && (
              <p className="text-sm text-red-600">{errorMsg || 'There was an error. Please try again.'}</p>
            )}

            <button
              type="submit"
              disabled={status === 'loading'}
              className="w-full bg-teal-700 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-teal-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {status === 'loading' ? 'Sending...' : 'Send access link'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
