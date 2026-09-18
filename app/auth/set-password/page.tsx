'use client'

import { FormEvent, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'

export default function SetPasswordPage() {
  const [displayName, setDisplayName] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const router = useRouter()
  const supabase = useMemo(() => createClient(), [])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setMessage('')

    if (password !== confirmPassword) {
      setMessage('Las contraseñas no coinciden.')
      return
    }

    const cleanDisplayName = displayName.trim()

    if (!cleanDisplayName) {
      setMessage('Escribe tu nombre o alias.')
      return
    }

    setLoading(true)

    const { error } = await supabase.auth.updateUser({
      password,
    })

    if (error) {
      setMessage(error.message)
      setLoading(false)
      return
    }

    const { error: profileError } = await supabase.rpc(
      'set_profile_display_name',
      { p_display_name: cleanDisplayName }
    )

    if (profileError) {
      setMessage('No se pudo guardar tu nombre o alias. Inténtalo de nuevo.')
      setLoading(false)
      return
    }

    router.push('/mfa/setup')
  }

  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <form
        onSubmit={handleSubmit}
        className="flex w-full max-w-sm flex-col gap-4"
      >
        <h1 className="text-2xl font-bold">Crear contraseña</h1>

        <input
          type="text"
          placeholder="Tu nombre o alias"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          required
          maxLength={50}
          autoComplete="nickname"
          className="rounded border p-3"
        />

        <input
          type="password"
          placeholder="Nueva contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={10}
          className="rounded border p-3"
        />

        <input
          type="password"
          placeholder="Confirmar contraseña"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          minLength={10}
          className="rounded border p-3"
        />

        <button
          type="submit"
          disabled={loading}
          className="rounded bg-black p-3 text-white disabled:opacity-50"
        >
          {loading ? 'Guardando...' : 'Crear contraseña'}
        </button>

        {message && <p>{message}</p>}
      </form>
    </main>
  )
}
