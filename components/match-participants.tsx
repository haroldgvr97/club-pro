'use client'

type Props = {
  players: { id: number; name: string }[]
  managerId: number
  selected: number[]
  onChange: (ids: number[]) => void
}

export function MatchParticipants({ players, managerId, selected, onChange }: Props) {
  return <fieldset className="rounded-lg border border-zinc-700 p-4">
    <legend className="px-1 font-medium">Jugadores participantes</legend>
    <p className="mb-3 text-sm text-zinc-400">Marca a quienes jugaron. El manager seleccionado también cuenta como jugador.</p>
    {managerId > 0 && <input type="hidden" name="player_ids" value={managerId} />}
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {players.map(player => <label key={player.id} className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="player_ids" value={player.id}
          checked={player.id === managerId || selected.includes(player.id)} disabled={player.id === managerId}
          onChange={event => onChange(event.target.checked ? [...selected, player.id] : selected.filter(id => id !== player.id))} />
        {player.name}{player.id === managerId ? ' · Manager' : ''}
      </label>)}
    </div>
  </fieldset>
}
