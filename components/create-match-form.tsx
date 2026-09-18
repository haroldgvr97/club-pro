'use client'

import { useActionState } from 'react'

import { createMatch } from '@/app/actions/matches'

type Option = {
  id: number
  name: string
}

type Props = {
  seasons: Option[]
  managers: Option[]
  opponents: Option[]
}

type State = {
  error?: string
  success?: boolean
}

const initialState: State = {}

export function CreateMatchForm({
  seasons,
  managers,
  opponents,
}: Props) {
  const [state, formAction, pending] = useActionState(
    async (_previousState: State, formData: FormData) => {
      return createMatch(formData)
    },
    initialState
  )

  return (
    <form action={formAction} className="space-y-4">
      <div className="grid gap-4 md:grid-cols-3">
        <select
          name="season_id"
          required
          className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2"
        >
          <option value="">Temporada</option>
          {seasons.map((season) => (
            <option key={season.id} value={season.id}>
              {season.name}
            </option>
          ))}
        </select>

        <select
          name="manager_id"
          required
          className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2"
        >
          <option value="">Manager</option>
          {managers.map((manager) => (
            <option key={manager.id} value={manager.id}>
              {manager.name}
            </option>
          ))}
        </select>

        <select
          name="opponent_id"
          required
          className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2"
        >
          <option value="">Rival</option>
          {opponents.map((opponent) => (
            <option key={opponent.id} value={opponent.id}>
              {opponent.name}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <input
          type="number"
          name="our_goals"
          min="0"
          required
          placeholder="Nuestros goles"
          className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2"
        />

        <input
          type="number"
          name="opponent_goals"
          min="0"
          required
          placeholder="Goles rival"
          className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2"
        />

        <select
          name="location"
          className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2"
        >
          <option value="">Ubicación</option>
          <option value="home">Local</option>
          <option value="away">Visitante</option>
        </select>

        <input
          type="datetime-local"
          name="played_at"
          className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2"
        />
      </div>

      <textarea
        name="notes"
        placeholder="Notas opcionales"
        className="min-h-24 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2"
      />

      {state?.error ? (
        <p className="text-sm text-red-400">{state.error}</p>
      ) : null}

      {state?.success ? (
        <p className="text-sm text-green-400">Partido registrado.</p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-black disabled:opacity-50"
      >
        {pending ? 'Guardando...' : 'Registrar partido'}
      </button>
    </form>
  )
}
