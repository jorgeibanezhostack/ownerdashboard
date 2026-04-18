'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function AuthCallbackPage() {
  const router = useRouter()
  const params = useSearchParams()

  useEffect(() => {
    const token_hash = params.get('token_hash')
    const type = params.get('type')

    if (token_hash && type) {
      const supabase = createClient()
      supabase.auth
        .verifyOtp({ token_hash, type: 'email' })
        .then(({ error }) => {
          if (error) {
            router.replace('/login?error=invalid_link')
          } else {
            router.replace('/dashboard')
          }
        })
    } else {
      router.replace('/login')
    }
  }, [params, router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <p className="text-gray-500 text-sm">Verificando acceso...</p>
    </div>
  )
}
