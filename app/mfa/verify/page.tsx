'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'

export default function MFAVerifyPage() {
  const [code, setCode] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const attemptedCode = useRef<string | null>(null)

  const router = useRouter()
  const supabase = useMemo(() => createClient(), [])

  const verifyMFA = useCallback(async (verificationCode: string) => {
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
      code: verificationCode,
    })

    if (verifyError) {
      setMessage('Código incorrecto. Inténtalo nuevamente.')
      setLoading(false)
      return
    }

    router.push('/')
  }, [router, supabase])

  useEffect(() => {
    if (code.length !== 6) {
      attemptedCode.current = null
      return
    }

    if (loading || attemptedCode.current === code) {
      return
    }

    attemptedCode.current = code
    void verifyMFA(code)
  }, [code, loading, verifyMFA])

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

        <p className="text-sm text-zinc-500">
          {loading
            ? 'Verificando código…'
            : 'La verificación comenzará automáticamente al introducir los 6 dígitos.'}
        </p>

        {message && <p>{message}</p>}
      </div>
    </main>
  )
}
