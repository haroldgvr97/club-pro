'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'

export default function MFASetupPage() {
  const [qrCode, setQrCode] = useState<string | null>(null)
  const [factorId, setFactorId] = useState<string | null>(null)
  const [code, setCode] = useState('')
  const [message, setMessage] = useState('')

  const router = useRouter()
  const supabase = createClient()

  async function enrollMFA() {
    setMessage('')

    const { data, error } = await supabase.auth.mfa.enroll({
      factorType: 'totp',
      friendlyName: 'Club Pro',
    })

    if (error) {
      setMessage(error.message)
      return
    }

    setFactorId(data.id)
    setQrCode(data.totp.qr_code)
  }

  async function verifyMFA() {
    if (!factorId) return

    setMessage('')

    const { data: challengeData, error: challengeError } =
      await supabase.auth.mfa.challenge({
        factorId,
      })

    if (challengeError) {
      setMessage(challengeError.message)
      return
    }

    const { error } = await supabase.auth.mfa.verify({
      factorId,
      challengeId: challengeData.id,
      code,
    })

    if (error) {
      setMessage(error.message)
      return
    }

    router.push('/')
  }

  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <div className="flex w-full max-w-sm flex-col gap-4">
        <h1 className="text-2xl font-bold">Configurar 2FA</h1>

        {!qrCode && (
          <button
            onClick={enrollMFA}
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
              placeholder="Código de 6 dígitos"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="rounded border p-3"
            />

            <button
              onClick={verifyMFA}
              className="rounded bg-black p-3 text-white"
            >
              Verificar 2FA
            </button>
          </>
        )}

        {message && <p>{message}</p>}
      </div>
    </main>
  )
}
