'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'

export default function AuthCallbackPage() {
  const [message, setMessage] = useState('Procesando invitación...')
  const router = useRouter()
  const supabase = useMemo(() => createClient(), [])

  useEffect(() => {
    async function handleInvite() {
      const params = new URLSearchParams(window.location.hash.substring(1))

      const accessToken = params.get('access_token')
      const refreshToken = params.get('refresh_token')
      const errorDescription = params.get('error_description')

      if (errorDescription) {
        setMessage('La invitación no es válida o ha expirado.')
        return
      }

      if (!accessToken || !refreshToken) {
        setMessage('No se pudo validar la invitación.')
        return
      }

      const { error } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      })

      if (error) {
        setMessage('No se pudo iniciar la sesión de la invitación.')
        return
      }

      router.replace('/auth/set-password')
    }

    handleInvite()
  }, [router, supabase])

  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <p>{message}</p>
    </main>
  )
}

