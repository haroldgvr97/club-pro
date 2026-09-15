'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'

export default function MFAVerifyPage() {
  const [code, setCode] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const router = useRouter()
  const supabase = createClient()

  async function verifyMFA() {
    setLoading(true)
    setMessage('')

    const { data, error: factorsError } =
      await supabase.auth.mfa.listFactors()

    if (factorsError) {
      setMessage(factorsError.message)
      setLoading(false)
      return
    }

    const factor = data.totp.find((factor) => factor.status === 'verified')

    if (!factor) {
      router.push('/mfa/setup')
      return
    }

    const { data: challenge, error: challengeError } =
      await supabase.auth.mfa.challenge({
        factorId: factor.id,
      })

    if (challengeError) {
      setMessage(challengeError.message)
      setLoading(false)
      return
    }

    const { error: verifyError } = await supabase.auth.mfa.verify({
      factorId: factor.id,
      challengeId: challenge.id,
      code,
    })

    if (verifyError) {
      setMessage('Código incorrecto. Inténtalo nuevamente.')
      setLoading(false)
      return
    }

    router.push('/')
  }

  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <div className="flex w-full max-w-sm flex-col gap-4">
        <h1 className="text-2xl font-bold">Verificación 2FA</h1>

        <p>Introduce el código de 6 dígitos de tu aplicación autenticadora.</p>

        <input
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={6}
          placeholder="Código de 6 dígitos"
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
          className="rounded border p-3"
        />

        <button
          onClick={verifyMFA}
          disabled={loading || code.length !== 6}
          className="rounded bg-black p-3 text-white disabled:opacity-50"
        >
          {loading ? 'Verificando...' : 'Verificar 2FA'}
        </button>

        {message && <p>{message}</p>}
      </div>
    </main>
  )
}
