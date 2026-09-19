'use client'

import { useActionState, useState } from 'react'
import { MatchParticipants } from '@/components/match-participants'

import { updateMatch } from '@/app/actions/matches'

type Option = {
  id: number
  name: string
}

type Props = {
  matchId: number
  seasonId: number
  managerId: number | null
  playerIds: number[]
  opponentId: number
  ourGoals: number
  opponentGoals: number
  notes: string | null
  playedAt: string
  seasons: Option[]
  managers: Option[]
  opponents: Option[]
}

type State = {
  error?: string
  success?: boolean
}

const initialState: State = {}

export function EditMatchForm({
  matchId,
  seasonId,
  managerId,
  playerIds,
  opponentId,
  ourGoals,
  opponentGoals,
  notes,
  playedAt,
  seasons,
  managers,
  opponents,
}: Props) {
  const [selectedManager, setSelectedManager] = useState(String(managerId ?? ''))
  const [players, setPlayers] = useState(playerIds)
  const [state, formAction, pending] = useActionState(
    async (_previousState: State, formData: FormData) => {
      if (formData.get('played_at') === localPlayedAt) formData.set('played_at', playedAt)
      return updateMatch(formData)
    },
    initialState
  )

  const originalDate = new Date(playedAt)
  const localPlayedAt = new Date(originalDate.getTime() - originalDate.getTimezoneOffset() * 60000).toISOString().slice(0, 16)

  return (
    <form action={formAction} className="grid gap-3 md:grid-cols-4">
      <input type="hidden" name="match_id" value={matchId} />

      <select
        name="season_id"
        defaultValue={seasonId}
        required
        className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2"
      >
        {seasons.map((season) => (
          <option key={season.id} value={season.id}>
            {season.name}
          </option>
        ))}
      </select>

      <select
        name="manager_id"
        value={selectedManager}
        onChange={event => setSelectedManager(event.target.value)}
        required
        className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2"
      >
        <option value="">Selecciona un manager</option>
        {managers.map((manager) => (
          <option key={manager.id} value={manager.id}>
            {manager.name}
          </option>
        ))}
      </select>

      <select
        name="opponent_id"
        defaultValue={opponentId}
        required
        className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2"
      >
        {opponents.map((opponent) => (
          <option key={opponent.id} value={opponent.id}>
            {opponent.name}
          </option>
        ))}
      </select>

      <input
        type="datetime-local"
        name="played_at"
        defaultValue={localPlayedAt}
        className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2"
      />

      <input
        type="number"
        name="our_goals"
        min="0"
        defaultValue={ourGoals}
        required
        className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2"
      />

      <input
        type="number"
        name="opponent_goals"
        min="0"
        defaultValue={opponentGoals}
        required
        className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2"
      />

      <button
        type="submit"
        disabled={pending}
        className="rounded-lg border border-zinc-700 px-3 py-2 text-sm hover:bg-zinc-800 disabled:opacity-50"
      >
        {pending ? 'Guardando...' : 'Guardar cambios'}
      </button>

      <textarea
        name="notes"
        defaultValue={notes ?? ''}
        placeholder="Notas"
        className="min-h-20 rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 md:col-span-4"
      />
      <div className="md:col-span-4"><MatchParticipants players={managers} managerId={Number(selectedManager)} selected={players} onChange={setPlayers} /></div>

      {state?.error ? (
        <p className="text-sm text-red-400 md:col-span-4">{state.error}</p>
      ) : null}

      {state?.success ? (
        <p className="text-sm text-green-400 md:col-span-4">
          Partido actualizado.
        </p>
      ) : null}
    </form>
  )
}
