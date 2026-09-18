'use client'

import { useActionState } from 'react'

import { activateSeason } from '@/app/actions/seasons'

type Props = {
  seasonId: number
  isActive: boolean
}

type State = {
  error?: string
  success?: boolean
}

const initialState: State = {}

export function ActivateSeasonButton({
  seasonId,
  isActive,
}: Props) {
  const [state, formAction, pending] = useActionState(
    async (_previousState: State, formData: FormData) => {
      return activateSeason(formData)
    },
    initialState
  )

  if (isActive) {
    return (
      <span className="text-sm text-green-400">
        Activa
      </span>
    )
  }

  return (
    <form action={formAction} className="flex items-center gap-3">
      <input type="hidden" name="season_id" value={seasonId} />

      <button
        type="submit"
        disabled={pending}
        className="rounded-lg border border-zinc-700 px-3 py-2 text-sm hover:bg-zinc-800 disabled:opacity-50"
      >
        {pending ? 'Activando...' : 'Activar'}
      </button>

      {state?.error ? (
        <span className="text-sm text-red-400">{state.error}</span>
      ) : null}
    </form>
  )
}
