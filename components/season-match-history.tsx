'use client'

import { Fragment, useMemo, useState } from 'react'
import { getMatchResult } from '@/lib/matches/result'
import { EditMatchForm } from '@/components/edit-match-form'
import { DeleteMatchButton } from '@/components/delete-match-button'

type Manager = { id: number; name: string }
type Match = {
  season_id: number
  opponent_id: number
  notes: string | null
  participants_recorded: boolean
  match_players: { player_id: number }[]
  id: number
  manager_id: number | null
  our_goals: number
  opponent_goals: number
  played_at: string
  managers: { name: string } | null
  opponents: { name: string } | null
}

export function SeasonMatchHistory({
  seasonName,
  matches,
  managers,
  seasons,
  opponents,
  canManageMatches,
}: {
  seasonName: string
  matches: Match[]
  managers: Manager[]
  seasons: Manager[]
  opponents: Manager[]
  canManageMatches: boolean
}) {
  const [rival, setRival] = useState('')
  const [managerId, setManagerId] = useState('')
  const normalizedRival = rival.trim().toLocaleLowerCase('es')
  const filteredMatches = useMemo(
    () =>
      matches.filter((match) => {
        const matchesRival =
          !normalizedRival ||
          (match.opponents?.name ?? '')
            .toLocaleLowerCase('es')
            .includes(normalizedRival)
        const matchesManager = !managerId || match.manager_id === Number(managerId)

        return matchesRival && matchesManager
      }),
    [managerId, matches, normalizedRival]
  )

  return (
    <details open className="rounded-lg border border-zinc-800 bg-zinc-950">
      <summary className="cursor-pointer px-4 py-3 text-sm font-medium">
        Partidos de {seasonName} ({filteredMatches.length})
      </summary>

      <div className="border-t border-zinc-800 p-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="text-sm text-zinc-300">
            <span className="mb-1 block">Equipo Rival</span>
            <input
              value={rival}
              onChange={(event) => setRival(event.target.value)}
              placeholder="Buscar rival"
              className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2"
            />
          </label>
          <label className="text-sm text-zinc-300">
            <span className="mb-1 block">Manager</span>
            <select
              value={managerId}
              onChange={(event) => setManagerId(event.target.value)}
              className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2"
            >
              <option value="">Todos los Managers</option>
              {managers.map((manager) => (
                <option key={manager.id} value={manager.id}>
                  {manager.name}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      {filteredMatches.length === 0 ? (
        <p className="border-t border-zinc-800 px-4 py-5 text-sm text-zinc-400">
          {matches.length === 0
            ? 'Todavía no hay partidos registrados en esta temporada.'
            : 'No hay partidos que coincidan con estos filtros.'}
        </p>
      ) : (
        <div className="overflow-x-auto border-t border-zinc-800">
          <table className="w-full min-w-[650px] text-left text-sm">
            <thead className="bg-zinc-900 text-xs uppercase text-zinc-400">
              <tr>
                <th className="px-4 py-3 font-medium">Rival</th>
                <th className="px-4 py-3 font-medium">Fecha</th>
                <th className="px-4 py-3 font-medium">Resultado</th>
                <th className="px-4 py-3 font-medium">Manager</th>
                <th className="px-4 py-3 font-medium">Estado</th>
                <th className="px-4 py-3 font-medium">Participantes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {filteredMatches.map((match) => {
                const result = getMatchResult(match.our_goals, match.opponent_goals)
                const label = result === 'win' ? 'Victoria' : result === 'draw' ? 'Empate' : 'Derrota'
                const color = result === 'win' ? 'text-emerald-400' : result === 'draw' ? 'text-amber-400' : 'text-red-400'

                return (
                  <Fragment key={match.id}><tr>
                    <td className="px-4 py-3 font-medium">{match.opponents?.name ?? 'Rival'}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-zinc-400">{new Date(match.played_at).toLocaleString('es-ES')}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-lg font-semibold">{match.our_goals} - {match.opponent_goals}</td>
                    <td className="px-4 py-3">{match.managers?.name ?? 'Sin Manager'}</td>
                    <td className={`px-4 py-3 font-medium ${color}`}>{label}</td>
                    <td className="px-4 py-3 text-zinc-300">{match.participants_recorded
                      ? match.match_players.map(player => managers.find(manager => manager.id === player.player_id)?.name ?? 'Jugador eliminado').join(', ') || 'Sin participantes'
                      : <span className="text-amber-300">Participantes pendientes</span>}</td>
                  </tr>
                  {canManageMatches && <tr><td colSpan={6} className="px-4 pb-4">
                    <details className="rounded-lg border border-zinc-800 p-3">
                      <summary className="cursor-pointer text-sm text-zinc-300">Editar partido y participantes</summary>
                      <div className="mt-4 space-y-4">
                        <EditMatchForm matchId={match.id} seasonId={match.season_id} managerId={match.manager_id}
                          opponentId={match.opponent_id} ourGoals={match.our_goals} opponentGoals={match.opponent_goals}
                          notes={match.notes} playedAt={match.played_at} seasons={seasons} managers={managers} opponents={opponents}
                          playerIds={match.match_players.map(player => player.player_id)} />
                        <DeleteMatchButton matchId={match.id} />
                      </div>
                    </details>
                  </td></tr>}</Fragment>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </details>
  )
}
