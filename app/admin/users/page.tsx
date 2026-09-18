'use client'

import { useState } from 'react'

import { AppSidebar } from '@/components/app-sidebar'
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
    <div className="min-h-screen bg-zinc-950 text-white md:flex">
      <AppSidebar />

      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-6 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Usuarios</h1>
            <p className="mt-1 text-sm text-zinc-400">
              Administración e invitación de usuarios
            </p>
          </div>

          <section className="max-w-xl rounded-xl border border-zinc-800 bg-zinc-900 p-5">
            <h2 className="mb-4 text-lg font-semibold">
              Invitar usuario
            </h2>

            <form
              action={handleSubmit}
              className="flex flex-col gap-4"
            >
              <input
                name="email"
                type="email"
                placeholder="Correo electrónico"
                required
                className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2"
              />

              <button
                type="submit"
                disabled={loading}
                className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-black disabled:opacity-50"
              >
                {loading ? 'Enviando...' : 'Enviar invitación'}
              </button>

              {message ? (
                <p className="text-sm text-zinc-300">{message}</p>
              ) : null}
            </form>
          </section>
        </div>
      </main>
    </div>
  )
}
