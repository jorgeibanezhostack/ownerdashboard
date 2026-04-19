'use client'

import { useState } from 'react'

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
      setErrorMsg(data.error ?? 'Error desconocido')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 w-full max-w-sm">
        <h1 className="text-2xl font-semibold text-gray-900 mb-1">Hostack</h1>
        <p className="text-sm text-gray-500 mb-6">Owner Dashboard</p>

        {status === 'sent' ? (
          <div className="space-y-4">
            <div className="text-center py-2">
              <p className="text-gray-700 font-medium">Revisa tu email</p>
              <p className="text-sm text-gray-500 mt-1">
                Te enviamos un enlace de acceso a <strong>{email}</strong>
              </p>
            </div>

            {callbackUrl && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                <p className="text-xs text-gray-500 mb-2">
                  ¿No llegó el email? Accede directamente:
                </p>
                <a
                  href={callbackUrl}
                  className="block w-full text-center bg-gray-900 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors"
                >
                  Acceder al dashboard →
                </a>
              </div>
            )}

            <button
              onClick={() => { setStatus('idle'); setCallbackUrl(null) }}
              className="w-full text-sm text-gray-400 hover:text-gray-600 text-center"
            >
              Volver
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              />
            </div>

            {status === 'error' && (
              <p className="text-sm text-red-600">{errorMsg || 'Hubo un error. Intenta de nuevo.'}</p>
            )}

            <button
              type="submit"
              disabled={status === 'loading'}
              className="w-full bg-gray-900 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {status === 'loading' ? 'Enviando...' : 'Enviar enlace de acceso'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
