'use client'

import { useState } from 'react'
import { inviteUserV2 } from './invite-action'

export default function AdminUsersPage() {
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setMessage('')

    const result = await inviteUserV2(formData)

    if (result.error) {
      setMessage(result.error)
    } else {
      setMessage('Invitación enviada correctamente.')
    }

    setLoading(false)
  }

  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <form
        action={handleSubmit}
        className="flex w-full max-w-sm flex-col gap-4"
      >
        <h1 className="text-2xl font-bold">Invitar usuario</h1>

        <input
          name="email"
          type="email"
          placeholder="Correo electrónico"
          required
          className="rounded border p-3"
        />

        <button
          type="submit"
          disabled={loading}
          className="rounded bg-black p-3 text-white disabled:opacity-50"
        >
          {loading ? 'Enviando...' : 'Enviar invitación'}
        </button>

        {message && <p>{message}</p>}
      </form>
    </main>
  )
}
