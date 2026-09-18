'use client'

import { useActionState } from 'react'

import { createManager } from '@/app/actions/managers'

type State = {
  error?: string
  success?: boolean
}

const initialState: State = {}

export function CreateManagerForm() {
  const [state, formAction, pending] = useActionState(
    async (_previousState: State, formData: FormData) => {
      return createManager(formData)
    },
    initialState
  )

  return (
    <form action={formAction} className="flex flex-col gap-4 sm:flex-row">
      <input
        name="name"
        type="text"
        placeholder="Nombre del Manager/Jugador"
        required
        className="flex-1 rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2"
      />

      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-black disabled:opacity-50"
      >
        {pending ? 'Guardando...' : 'Agregar Manager/Jugador'}
      </button>

      {state?.error ? (
        <p className="text-sm text-red-400">{state.error}</p>
      ) : null}

      {state?.success ? (
        <p className="text-sm text-green-400">Manager/Jugador creado.</p>
      ) : null}
    </form>
  )
}
