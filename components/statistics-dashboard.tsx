'use client'

import { useMemo, useState } from 'react'
import { EditManagerForm } from '@/components/edit-manager-form'
import { DeleteManagerButton } from '@/components/delete-manager-button'
import { getManagerPlayerStats } from '@/lib/stats/manager-player'
import { getMatchResult } from '@/lib/matches/result'
import styles from './statistics.module.css'

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
    <section className={styles.dashboard}>
      <div className={styles.sectionBar}>
        <div className={styles.tabs} aria-label="Tipo de estadísticas">
        <button
          type="button"
          onClick={showManagers}
          aria-pressed={section === 'managers'}
          className={`${styles.tab} ${section === 'managers' ? styles.activeTab : ''}`}
        >
          Managers
        </button>
        <button
          type="button"
          onClick={() => {
            setSection('players')
            setSelectedManagerId(null)
          }}
          aria-pressed={section === 'players'}
          className={`${styles.tab} ${section === 'players' ? styles.activeTab : ''}`}
        >
          Jugadores
        </button>
        </div>
        <span className={styles.sectionCount}>{visibleManagers.length} en la plantilla</span>
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
      <h2 className={styles.sectionTitle}>Al mando del equipo.</h2>
      <p className={styles.sectionDescription}>
        Elige un Manager para ver los resultados de los partidos que dirigió.
      </p>
      {managers.length === 0 ? (
        <p className="cp-empty">Todavía no hay Managers registrados.</p>
      ) : (
        <div className={styles.pickerGrid}>
          {managers.map((manager) => {
            const played = matches.filter((match) => match.manager_id === manager.id).length
            return (
              <button key={manager.id} type="button" onClick={() => onSelect(manager.id)}
                className={styles.personCard}>
                <div className={styles.personCardTop}>
                  <span className={styles.avatar} aria-hidden="true">{getInitials(manager.name)}</span>
                  <span className={styles.cardArrow} aria-hidden="true">↗</span>
                </div>
                <span className={styles.personRole}>Manager</span>
                <p className={styles.personName}>{manager.name}</p>
                <div className={styles.personFooter}><span>{played} {played === 1 ? 'partido dirigido' : 'partidos dirigidos'}</span><span aria-hidden="true">→</span></div>
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
      <button type="button" onClick={onBack} className={styles.backButton}>
        ← Volver a Managers
      </button>
      <div className={styles.detailHero}>
        <div className={styles.identity}>
          <span className={`${styles.avatar} ${styles.largeAvatar}`} aria-hidden="true">{getInitials(manager.name)}</span>
          <div><p className="cp-eyebrow">Perfil de manager</p>
          <h2 className={styles.detailName}>{manager.name}</h2>
          <p className={styles.sectionDescription}>Cada partido cuenta.</p></div>
        </div>
        <ResultChart wins={wins} draws={draws} losses={losses} />
      </div>

      <div className={styles.summaryGrid}>
        <SummaryCard label="Partidos dirigidos" value={managerMatches.length} />
        <SummaryCard label="Victorias" value={wins} color="text-emerald-400" />
        <SummaryCard label="Empates" value={draws} color="text-amber-300" />
        <SummaryCard label="Derrotas" value={losses} color="text-red-400" />
      </div>

      <div className={styles.matchToolbar}>
        <div><p className="cp-eyebrow">Historial</p><h3 className={styles.historyTitle}>Partido a partido</h3></div>
      <label className={styles.searchLabel}>
        <span className="mb-1 block">Filtrar por Equipo Rival</span>
        <input value={rivalFilter} onChange={(event) => setRivalFilter(event.target.value)} placeholder="Buscar rival"
          className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2" />
      </label>
      </div>

      <div className={styles.tableWrap}>
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
      <h2 className={styles.sectionTitle}>Talento en el campo.</h2>
      <p className={styles.sectionDescription}>Elige un Jugador para ver y actualizar sus estadísticas.</p>
      {managers.length === 0 ? (
        <p className="cp-empty">Todavía no hay Jugadores registrados.</p>
      ) : (
        <div className={styles.pickerGrid}>
          {managers.map((manager) => (
            <button key={manager.id} type="button" onClick={() => onSelect(manager.id)}
              className={`${styles.personCard} ${styles.playerCard}`}>
              <div className={styles.personCardTop}>
                <span className={styles.avatar} aria-hidden="true">{getInitials(manager.name)}</span>
                <span className={styles.cardArrow} aria-hidden="true">↗</span>
              </div>
              <span className={styles.personRole}>Jugador</span>
              <p className={styles.personName}>{manager.name}</p>
              <div className={styles.personFooter}><span><strong className="text-emerald-400">{manager.goals}</strong> goles <span className="text-zinc-600">/</span> <strong className="text-sky-400">{manager.assists}</strong> asistencias</span><span aria-hidden="true">→</span></div>
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
      <button type="button" onClick={onBack} className={styles.backButton}>
        ← Volver a Jugadores
      </button>
      <div className={`${styles.detailHero} ${styles.playerHero}`}>
        <div className={styles.identity}>
          <span className={`${styles.avatar} ${styles.largeAvatar}`} aria-hidden="true">{getInitials(manager.name)}</span>
          <div><p className="cp-eyebrow">Perfil de jugador</p>
          <h2 className={styles.detailName}>{manager.name}</h2>
          <p className={`${styles.playerStatus} ${manager.is_active ? styles.activeStatus : ''}`}>{manager.is_active ? 'Activo' : 'Inactivo'}</p></div>
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
    <td className="px-4 py-3"><span className={`${styles.resultBadge} ${color}`}><span aria-hidden="true">●</span> {label}</span></td>
  </tr>
}

function ResultChart({ wins, draws, losses }: { wins: number; draws: number; losses: number }) {
  const total = wins + draws + losses
  const winEnd = total ? (wins / total) * 100 : 0
  const drawEnd = winEnd + (total ? (draws / total) * 100 : 0)
  const background = total
    ? `conic-gradient(#34d399 0% ${winEnd}%, #fcd34d ${winEnd}% ${drawEnd}%, #f87171 ${drawEnd}% 100%)`
    : 'conic-gradient(#3f3f46 0% 100%)'

  return <div className={styles.chart}>
    <div role="img" aria-label={`Resultados: ${wins} victorias, ${draws} empates y ${losses} derrotas`} className={styles.chartRing} style={{ background }}>
      <div className={styles.chartCenter}><strong>{total ? Math.round((wins / total) * 100) : 0}<span>%</span></strong><span>Victorias</span></div>
    </div>
    <div className={styles.chartLegend}><p><span><i className="bg-emerald-400" />Victorias</span><strong>{wins}</strong></p><p><span><i className="bg-amber-300" />Empates</span><strong>{draws}</strong></p><p><span><i className="bg-red-400" />Derrotas</span><strong>{losses}</strong></p></div>
  </div>
}

function SummaryCard({ label, value, color = 'text-white' }: { label: string; value: number; color?: string }) {
  return <div className={styles.summaryCard}><p className={styles.metricLabel}>{label}</p><p className={`${styles.metricValue} ${color}`}>{value}</p></div>
}

function getInitials(name: string) {
  return name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toLocaleUpperCase('es')
}
