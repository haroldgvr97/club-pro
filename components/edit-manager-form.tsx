'use client'

import { useActionState } from 'react'

import { updateManager } from '@/app/actions/managers'

type Props = {
  managerId: number
  currentName: string
  goals: number
  assists: number
}

type State = {
  error?: string
  success?: boolean
}

const initialState: State = {}

export function EditManagerForm({
  managerId,
  currentName,
  goals,
  assists,
}: Props) {
  const [state, formAction, pending] = useActionState(
    async (_previousState: State, formData: FormData) => {
      return updateManager(formData)
    },
    initialState
  )

  return (
    <form action={formAction} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <input type="hidden" name="manager_id" value={managerId} />

      <input
        name="name"
        type="text"
        defaultValue={currentName}
        required
        className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2"
      />

      <label className="text-sm text-zinc-300">
        <span className="mb-1 block">Goles</span>
        <input
          name="goals"
          type="number"
          min="0"
          step="1"
          defaultValue={goals}
          required
          className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2"
        />
      </label>

      <label className="text-sm text-zinc-300">
        <span className="mb-1 block">Asistencias</span>
        <input
          name="assists"
          type="number"
          min="0"
          step="1"
          defaultValue={assists}
          required
          className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2"
        />
      </label>

      <button
        type="submit"
        disabled={pending}
        className="rounded-lg border border-zinc-700 px-3 py-2 text-sm hover:bg-zinc-800 disabled:opacity-50"
      >
        {pending ? 'Guardando...' : 'Guardar'}
      </button>

      {state?.error ? (
        <span className="text-sm text-red-400 sm:col-span-2 lg:col-span-4">{state.error}</span>
      ) : null}

      {state?.success ? (
        <span className="text-sm text-green-400 sm:col-span-2 lg:col-span-4">Actualizado.</span>
      ) : null}
    </form>
  )
}
