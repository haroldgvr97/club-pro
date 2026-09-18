'use client'

import { useActionState } from 'react'

import { deleteSeason } from '@/app/actions/seasons'

type Props = {
  seasonId: number
}

type State = {
  error?: string
  success?: boolean
}

const initialState: State = {}

export function DeleteSeasonButton({ seasonId }: Props) {
  const [state, formAction, pending] = useActionState(
    async (_previousState: State, formData: FormData) => {
      return deleteSeason(formData)
    },
    initialState
  )

  return (
    <form action={formAction} className="flex items-center gap-3">
      <input type="hidden" name="season_id" value={seasonId} />

      <button
        type="submit"
        disabled={pending}
        className="rounded-lg border border-red-900 px-3 py-2 text-sm text-red-400 hover:bg-red-950 disabled:opacity-50"
      >
        {pending ? 'Eliminando...' : 'Eliminar'}
      </button>

      {state?.error ? (
        <span className="text-sm text-red-400">{state.error}</span>
      ) : null}
    </form>
  )
}
