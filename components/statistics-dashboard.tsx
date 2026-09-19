'use client'

import { useMemo, useState } from 'react'
import { EditManagerForm } from '@/components/edit-manager-form'
import { DeleteManagerButton } from '@/components/delete-manager-button'
import { getManagerPlayerStats } from '@/lib/stats/manager-player'
import { getMatchResult } from '@/lib/matches/result'

type Manager = {
  id: number
  name: string
  is_active: boolean
  goals: number
  assists: number
  profile_id: string | null
}

type Match = {
  participants_recorded: boolean
  match_players: { player_id: number }[]
  id: number
  manager_id: number | null
  our_goals: number
  opponent_goals: number
  played_at: string
  opponents: { name: string } | null
}

type Props = {
  managers: Manager[]
  matches: Match[]
  viewerProfileId: string
  canViewOtherManagers: boolean
  canEditOtherPlayers: boolean
  isAdmin: boolean
}

export function StatisticsDashboard({ managers, matches, viewerProfileId, canViewOtherManagers, canEditOtherPlayers, isAdmin }: Props) {
  const [section, setSection] = useState<'managers' | 'players'>('managers')
  const [selectedManagerId, setSelectedManagerId] = useState<number | null>(null)

  const selectedManager = managers.find(
    (manager) => manager.id === selectedManagerId
  )
  const visibleManagers = canViewOtherManagers
    ? managers
    : managers.filter((manager) => manager.profile_id === viewerProfileId)

  function showManagers() {
    setSection('managers')
    setSelectedManagerId(null)
  }

  return (
    <section className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
      <div className="mb-6 flex flex-wrap gap-3 border-b border-zinc-800 pb-5">
        <button
          type="button"
          onClick={showManagers}
          className={`rounded-lg px-4 py-2 text-sm font-medium ${
            section === 'managers'
              ? 'bg-white text-black'
              : 'border border-zinc-700 hover:bg-zinc-800'
          }`}
        >
          Managers
        </button>
        <button
          type="button"
          onClick={() => {
            setSection('players')
            setSelectedManagerId(null)
          }}
          className={`rounded-lg px-4 py-2 text-sm font-medium ${
            section === 'players'
              ? 'bg-white text-black'
              : 'border border-zinc-700 hover:bg-zinc-800'
          }`}
        >
          Jugadores
        </button>
      </div>

      {section === 'managers' ? (
        selectedManager ? (
          <ManagerDetails manager={selectedManager} matches={matches} onBack={showManagers} />
        ) : (
          <ManagerPicker managers={visibleManagers} matches={matches} onSelect={setSelectedManagerId} />
        )
      ) : (
        selectedManager ? (
          <PlayerDetails manager={selectedManager} matches={matches} onBack={() => setSelectedManagerId(null)}
            canEdit={selectedManager.profile_id === viewerProfileId || canEditOtherPlayers}
            canDelete={isAdmin && selectedManager.profile_id === null} />
        ) : (
          <PlayerPicker managers={visibleManagers} onSelect={setSelectedManagerId} />
        )
      )}
    </section>
  )
}

function ManagerPicker({ managers, matches, onSelect }: { managers: Manager[]; matches: Match[]; onSelect: (id: number) => void }) {
  return (
    <div>
      <h2 className="text-lg font-semibold">Estadísticas de Managers</h2>
      <p className="mt-1 text-sm text-zinc-400">
        Elige un Manager para ver los resultados de los partidos que dirigió.
      </p>
      {managers.length === 0 ? (
        <p className="py-10 text-center text-sm text-zinc-400">Todavía no hay Managers registrados.</p>
      ) : (
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {managers.map((manager) => {
            const played = matches.filter((match) => match.manager_id === manager.id).length
            return (
              <button key={manager.id} type="button" onClick={() => onSelect(manager.id)}
                className="rounded-xl border border-zinc-700 bg-zinc-950 p-4 text-left transition hover:border-zinc-500 hover:bg-zinc-800">
                <p className="font-semibold">{manager.name}</p>
                <p className="mt-1 text-sm text-zinc-400">{played} {played === 1 ? 'partido dirigido' : 'partidos dirigidos'}</p>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

function ManagerDetails({ manager, matches, onBack }: { manager: Manager; matches: Match[]; onBack: () => void }) {
  const [rivalFilter, setRivalFilter] = useState('')
  const managerMatches = useMemo(
    () => matches.filter((match) => match.manager_id === manager.id),
    [manager.id, matches]
  )
  const normalizedFilter = rivalFilter.trim().toLocaleLowerCase('es')
  const visibleMatches = managerMatches.filter((match) =>
    !normalizedFilter || (match.opponents?.name ?? '').toLocaleLowerCase('es').includes(normalizedFilter)
  )
  const wins = managerMatches.filter((match) => getMatchResult(match.our_goals, match.opponent_goals) === 'win').length
  const draws = managerMatches.filter((match) => getMatchResult(match.our_goals, match.opponent_goals) === 'draw').length
  const losses = managerMatches.length - wins - draws

  return (
    <div>
      <button type="button" onClick={onBack} className="mb-5 rounded-lg border border-zinc-700 px-3 py-2 text-sm hover:bg-zinc-800">
        ← Volver a Managers
      </button>
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-2xl font-bold">{manager.name}</h2>
          <p className="mt-1 text-sm text-zinc-400">Resultados como Manager</p>
        </div>
        <ResultChart wins={wins} draws={draws} losses={losses} />
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-4">
        <SummaryCard label="Partidos" value={managerMatches.length} />
        <SummaryCard label="Victorias" value={wins} color="text-emerald-400" />
        <SummaryCard label="Empates" value={draws} color="text-amber-300" />
        <SummaryCard label="Derrotas" value={losses} color="text-red-400" />
      </div>

      <label className="mt-6 block max-w-md text-sm text-zinc-300">
        <span className="mb-1 block">Filtrar por Equipo Rival</span>
        <input value={rivalFilter} onChange={(event) => setRivalFilter(event.target.value)} placeholder="Buscar rival"
          className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2" />
      </label>

      <div className="mt-4 overflow-x-auto rounded-lg border border-zinc-800">
        <table className="w-full min-w-[650px] text-left text-sm">
          <thead className="bg-zinc-950 text-xs uppercase text-zinc-400"><tr>
            <th className="px-4 py-3">Equipo Rival</th><th className="px-4 py-3">Fecha</th><th className="px-4 py-3">Marcador</th><th className="px-4 py-3">Resultado</th>
          </tr></thead>
          <tbody className="divide-y divide-zinc-800">
            {visibleMatches.map((match) => <ManagerMatchRow key={match.id} match={match} />)}
            {visibleMatches.length === 0 ? <tr><td colSpan={4} className="px-4 py-8 text-center text-zinc-400">No hay partidos que coincidan.</td></tr> : null}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function PlayerPicker({ managers, onSelect }: { managers: Manager[]; onSelect: (id: number) => void }) {
  return (
    <div>
      <h2 className="text-lg font-semibold">Estadísticas de Jugadores</h2>
      <p className="mt-1 text-sm text-zinc-400">Elige un Jugador para ver y actualizar sus estadísticas.</p>
      {managers.length === 0 ? (
        <p className="py-10 text-center text-sm text-zinc-400">Todavía no hay Jugadores registrados.</p>
      ) : (
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {managers.map((manager) => (
            <button key={manager.id} type="button" onClick={() => onSelect(manager.id)}
              className="rounded-xl border border-zinc-700 bg-zinc-950 p-4 text-left transition hover:border-zinc-500 hover:bg-zinc-800">
              <p className="font-semibold">{manager.name}</p>
              <p className="mt-1 text-sm text-zinc-400">{manager.goals} goles · {manager.assists} asistencias</p>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function PlayerDetails({ manager, matches, onBack, canEdit, canDelete }: { manager: Manager; matches: Match[]; onBack: () => void; canEdit: boolean; canDelete: boolean }) {
  const stats = getManagerPlayerStats(matches, manager.id, manager.goals, manager.assists)

  return (
    <div>
      <button type="button" onClick={onBack} className="mb-5 rounded-lg border border-zinc-700 px-3 py-2 text-sm hover:bg-zinc-800">
        ← Volver a Jugadores
      </button>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold">{manager.name}</h2>
          <p className="text-sm text-zinc-500">{manager.is_active ? 'Activo' : 'Inactivo'}</p>
        </div>
        {canDelete ? <DeleteManagerButton managerId={manager.id} label="Eliminar Manager/Jugador" /> : null}
      </div>
      <EditManagerForm managerId={manager.id} goals={manager.goals} assists={manager.assists} stats={stats} canEdit={canEdit} />
      {matches.some(match => !match.participants_recorded) && <p className="mt-3 text-sm text-amber-300">Hay partidos con participantes pendientes en Temporadas. Los partidos jugados y goles por partido solo incluyen participaciones registradas.</p>}
    </div>
  )
}

function ManagerMatchRow({ match }: { match: Match }) {
  const result = getMatchResult(match.our_goals, match.opponent_goals)
  const label = result === 'win' ? 'Victoria' : result === 'draw' ? 'Empate' : 'Derrota'
  const color = result === 'win' ? 'text-emerald-400' : result === 'draw' ? 'text-amber-300' : 'text-red-400'
  return <tr>
    <td className="px-4 py-3 font-medium">{match.opponents?.name ?? 'Rival'}</td>
    <td className="whitespace-nowrap px-4 py-3 text-zinc-400">{new Date(match.played_at).toLocaleString('es-ES')}</td>
    <td className="whitespace-nowrap px-4 py-3 font-semibold">{match.our_goals} – {match.opponent_goals}</td>
    <td className={`px-4 py-3 font-medium ${color}`}>{label}</td>
  </tr>
}

function ResultChart({ wins, draws, losses }: { wins: number; draws: number; losses: number }) {
  const total = wins + draws + losses
  const winEnd = total ? (wins / total) * 100 : 0
  const drawEnd = winEnd + (total ? (draws / total) * 100 : 0)
  const background = total
    ? `conic-gradient(#34d399 0% ${winEnd}%, #fcd34d ${winEnd}% ${drawEnd}%, #f87171 ${drawEnd}% 100%)`
    : 'conic-gradient(#3f3f46 0% 100%)'

  return <div className="flex items-center gap-4">
    <div aria-label="Gráfica de resultados" className="grid size-28 place-items-center rounded-full" style={{ background }}>
      <div className="grid size-16 place-items-center rounded-full bg-zinc-900 text-sm font-semibold">{total}</div>
    </div>
    <div className="space-y-1 text-sm"><p className="text-emerald-400">● Victorias: {wins}</p><p className="text-amber-300">● Empates: {draws}</p><p className="text-red-400">● Derrotas: {losses}</p></div>
  </div>
}

function SummaryCard({ label, value, color = 'text-white' }: { label: string; value: number; color?: string }) {
  return <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-3"><p className="text-xs text-zinc-400">{label}</p><p className={`mt-1 text-2xl font-semibold ${color}`}>{value}</p></div>
}
