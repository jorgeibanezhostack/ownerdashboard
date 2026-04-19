'use client'

import { Suspense, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

function CallbackHandler() {
  const router = useRouter()
  const params = useSearchParams()

  useEffect(() => {
    const supabase = createClient()
    const token_hash = params.get('token_hash')
    const type = params.get('type')
    const code = params.get('code')

    if (token_hash && type) {
      // Direct token_hash flow (our bypass button)
      supabase.auth
        .verifyOtp({ token_hash, type: 'email' })
        .then(({ error }) => {
          if (error) {
            console.error('[callback] verifyOtp error:', error.message)
            router.replace('/login?error=invalid_link')
          } else {
            router.replace('/dashboard')
          }
        })
    } else if (code) {
      // PKCE flow fallback
      supabase.auth
        .exchangeCodeForSession(code)
        .then(({ error }) => {
          if (error) {
            console.error('[callback] exchangeCode error:', error.message)
            router.replace('/login?error=invalid_link')
          } else {
            router.replace('/dashboard')
          }
        })
    } else {
      router.replace('/login')
    }
  }, [params, router])

  return <p className="text-gray-500 text-sm">Verificando acceso...</p>
}

export default function AuthCallbackPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Suspense fallback={<p className="text-gray-500 text-sm">Cargando...</p>}>
        <CallbackHandler />
      </Suspense>
    </div>
  )
}
