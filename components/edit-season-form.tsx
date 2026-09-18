'use client'

import { useActionState } from 'react'

import { updateSeason } from '@/app/actions/seasons'

type Props = {
  seasonId: number
  currentName: string
  startDate: string | null
  endDate: string | null
}

type State = {
  error?: string
  success?: boolean
}

const initialState: State = {}

export function EditSeasonForm({
  seasonId,
  currentName,
  startDate,
  endDate,
}: Props) {
  const [state, formAction, pending] = useActionState(
    async (_previousState: State, formData: FormData) => {
      return updateSeason(formData)
    },
    initialState
  )

  return (
    <form action={formAction} className="grid gap-3 md:grid-cols-4">
      <input type="hidden" name="season_id" value={seasonId} />

      <input
        name="name"
        type="text"
        defaultValue={currentName}
        required
        className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2"
      />

      <input
        name="start_date"
        type="date"
        defaultValue={startDate ?? ''}
        className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2"
      />

      <input
        name="end_date"
        type="date"
        defaultValue={endDate ?? ''}
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
        <p className="text-sm text-red-400 md:col-span-4">{state.error}</p>
      ) : null}

      {state?.success ? (
        <p className="text-sm text-green-400 md:col-span-4">
          Temporada actualizada.
        </p>
      ) : null}
    </form>
  )
}
