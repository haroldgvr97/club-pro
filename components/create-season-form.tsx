'use client'

import { useActionState } from 'react'

import { createSeason } from '@/app/actions/seasons'

type State = {
  error?: string
  success?: boolean
}

const initialState: State = {}

export function CreateSeasonForm() {
  const [state, formAction, pending] = useActionState(
    async (_previousState: State, formData: FormData) => {
      return createSeason(formData)
    },
    initialState
  )

  return (
    <form action={formAction} className="grid gap-4 md:grid-cols-4">
      <input
        name="name"
        type="text"
        placeholder="Nombre de la temporada"
        required
        className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2"
      />

      <input
        name="start_date"
        type="date"
        className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2"
      />

      <input
        name="end_date"
        type="date"
        className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2"
      />

      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-black disabled:opacity-50"
      >
        {pending ? 'Guardando...' : 'Agregar temporada'}
      </button>

      {state?.error ? (
        <p className="text-sm text-red-400 md:col-span-4">{state.error}</p>
      ) : null}

      {state?.success ? (
        <p className="text-sm text-green-400 md:col-span-4">
          Temporada creada.
        </p>
      ) : null}
    </form>
  )
}
