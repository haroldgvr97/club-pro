'use client'

import { useActionState } from 'react'

import { updateOpponent } from '@/app/actions/opponents'

type Props = {
  opponentId: number
  currentName: string
}

type State = {
  error?: string
  success?: boolean
}

const initialState: State = {}

export function EditOpponentForm({
  opponentId,
  currentName,
}: Props) {
  const [state, formAction, pending] = useActionState(
    async (_previousState: State, formData: FormData) => {
      return updateOpponent(formData)
    },
    initialState
  )

  return (
    <form action={formAction} className="flex flex-col gap-3 sm:flex-row">
      <input type="hidden" name="opponent_id" value={opponentId} />

      <input
        name="name"
        type="text"
        defaultValue={currentName}
        required
        className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2"
      />

      <button
        type="submit"
        disabled={pending}
        className="rounded-lg border border-zinc-700 px-3 py-2 text-sm hover:bg-zinc-800 disabled:opacity-50"
      >
        {pending ? 'Guardando...' : 'Guardar'}
      </button>

      {state?.error ? (
        <span className="text-sm text-red-400">{state.error}</span>
      ) : null}

      {state?.success ? (
        <span className="text-sm text-green-400">Actualizado.</span>
      ) : null}
    </form>
  )
}
