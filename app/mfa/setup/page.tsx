'use client'

import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { createClient } from '@/utils/supabase/client'

export default function MFASetupPage() {
  const [qrCode, setQrCode] = useState<string | null>(null)
  const [factorId, setFactorId] = useState<string | null>(null)
  const [code, setCode] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const attemptedCode = useRef<string | null>(null)
  const inFlight = useRef(false)

  const router = useRouter()
  const supabase = useMemo(() => createClient(), [])

  function getReturnTo() {
    const value = new URLSearchParams(window.location.search).get('returnTo')
    return value && value.startsWith('/') ? value : '/'
  }

  async function enrollMFA() {
    if (inFlight.current) return
    inFlight.current = true
    setLoading(true)
    setMessage('')
    try {
      const { data: factors, error: factorsError } = await supabase.auth.mfa.listFactors()
      if (factorsError) throw factorsError
      if (factors.totp.some(factor => factor.status === 'verified')) { router.replace(`/mfa/verify?returnTo=${encodeURIComponent(getReturnTo())}`); return }
      for (const factor of factors.all.filter(factor => factor.factor_type === 'totp' && factor.status === 'unverified')) {
        const { error } = await supabase.auth.mfa.unenroll({ factorId: factor.id })
        if (error) throw error
      }

      const { data, error } = await supabase.auth.mfa.enroll({
        factorType: 'totp',
        friendlyName: 'Clubes Pro',
      })

      if (error) {
        setMessage(error.message)
        return
      }

      setFactorId(data.id)
      setQrCode(data.totp.qr_code)
    } catch {
      setMessage('No se pudo iniciar la configuración. Revisa tu conexión e inténtalo de nuevo.')
    } finally {
      inFlight.current = false
      setLoading(false)
    }
  }

  const verifyMFA = useCallback(async (verificationCode: string) => {
    if (!factorId || inFlight.current || !/^\d{6}$/.test(verificationCode)) return
    inFlight.current = true
    attemptedCode.current = verificationCode

    setLoading(true)
    setMessage('')
    try {
      const { data: challengeData, error: challengeError } =
        await supabase.auth.mfa.challenge({
          factorId,
        })

      if (challengeError) {
        setMessage(challengeError.message)
        setLoading(false)
        return
      }

      const { error } = await supabase.auth.mfa.verify({
        factorId,
        challengeId: challengeData.id,
        code: verificationCode,
      })

      if (error) {
        setMessage('Código incorrecto. Inténtalo nuevamente.')
        setLoading(false)
        return
      }

      router.replace(getReturnTo())
      router.refresh()
    } catch {
      setMessage('No se pudo conectar. Revisa tu conexión e inténtalo de nuevo.')
    } finally {
      inFlight.current = false
      setLoading(false)
    }
  }, [factorId, router, supabase])

  useEffect(() => {
    if (code.length !== 6) {
      attemptedCode.current = null
      return
    }

    if (!factorId || loading || attemptedCode.current === code) return

    attemptedCode.current = code
    void verifyMFA(code)
  }, [code, factorId, loading, verifyMFA])

  return (
    <main className="cp-auth-page">
      <div className="cp-auth-card">
        <h1 className="text-2xl font-bold">Configurar 2FA</h1>

        {!qrCode && (
          <button
            onClick={enrollMFA}
            disabled={loading}
            className="rounded bg-black p-3 text-white"
          >
            Configurar autenticador
          </button>
        )}

        {qrCode && (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={qrCode}
              alt="Código QR para configurar 2FA"
              width={256}
              height={256}
              className="mx-auto"
            />

            <input
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              aria-label="Código de verificación de 6 dígitos"
              placeholder="Código de 6 dígitos"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              maxLength={6}
              className="rounded border p-3"
            />

            <p className="text-sm text-zinc-500">
              {loading
                ? 'Verificando código…'
                : 'La verificación comenzará automáticamente al introducir los 6 dígitos.'}
            </p>
          </>
        )}

        {message && <p role="alert">{message}</p>}
        {message && factorId && <button disabled={loading || code.length !== 6} onClick={() => void verifyMFA(code)} className="rounded border p-3 disabled:opacity-50">Reintentar verificación</button>}
      </div>
    </main>
  )
}
