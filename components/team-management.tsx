'use client'

import { useActionState } from 'react'
import { createTeam, renameTeam, deleteTeam, selectTeam } from '@/app/teams/actions'
import styles from './statistics.module.css'

type State = { error?: string; success?: string }
type Team = { id: number; name: string }
const field = 'min-w-0 flex-1 rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2'
const button = 'rounded-lg border border-zinc-700 px-4 py-2 text-sm font-medium hover:bg-zinc-800 disabled:opacity-50'

export function TeamManagement({ teams, isAdmin }: { teams: Team[]; isAdmin: boolean }) {
  const [state, action, pending] = useActionState<State, FormData>((_, form) => createTeam(form), {})
  return <div className={styles.teamManagement}>
    {isAdmin && <section className={styles.createTeam}>
      <div className={styles.createTeamHeading}><span className={styles.createIcon} aria-hidden="true">+</span><div><p className="cp-eyebrow">Un nuevo comienzo</p><h2 className={styles.historyTitle}>Crea tu próximo equipo</h2></div></div>
      <form action={action} className="flex flex-col gap-3 sm:flex-row"><input aria-label="Nombre del nuevo equipo" name="name" required maxLength={80} placeholder="Nombre del equipo" className={field} /><button disabled={pending} className="cp-button disabled:opacity-50">{pending ? 'Creando…' : 'Crear Equipo'}</button></form><Feedback state={state} /></section>}
    <div className={styles.teamListHeading}><h2>Mis equipos</h2><span>{teams.length.toString().padStart(2, '0')}</span></div>
    {teams.length === 0 && <p className="cp-empty">{isAdmin ? 'Todavía no hay equipos. Crea el primero.' : 'Todavía no tienes equipos asignados.'}</p>}
    <div className={styles.teamGrid}>{teams.map(team => <TeamRow key={team.id} team={team} isAdmin={isAdmin} />)}</div>
  </div>
}

function TeamRow({ team, isAdmin }: { team: Team; isAdmin: boolean }) {
  const [saved, save, saving] = useActionState<State, FormData>((_, form) => renameTeam(form), {})
  const [removed, remove, deleting] = useActionState<State, FormData>((_, form) => deleteTeam(form), {})
  return <section className={styles.teamCard}>
    <form action={selectTeam} className={styles.teamEntry}><input type="hidden" name="team_id" value={team.id} />
      <div className={styles.teamCardTop}><span className={styles.teamBadge} aria-hidden="true">{team.name.trim().split(/\s+/).slice(0, 2).map(part => part[0]).join('').toLocaleUpperCase('es')}</span><span className={styles.teamTag}>Clubes Pro</span></div>
      <p className="cp-eyebrow">Tu club. Tu historia.</p><h3 className={styles.teamName}><button>{team.name}</button></h3>
      <button className={styles.enterTeam}>Entrar al equipo <span aria-hidden="true">↗</span></button>
    </form>
    {isAdmin && <div className={styles.teamSettings}><form action={save} className="flex flex-col gap-3 sm:flex-row"><input type="hidden" name="team_id" value={team.id} /><input aria-label={`Nombre de ${team.name}`} name="name" defaultValue={team.name} required maxLength={80} className={field} /><button disabled={saving || deleting} className={button}>{saving ? 'Guardando…' : 'Guardar nombre'}</button></form><Feedback state={saved} />
      <form action={remove} className="mt-4" onSubmit={event => { if (!window.confirm(`¿Eliminar ${team.name} y todos sus partidos, temporadas, estadísticas y miembros? Esta acción no se puede deshacer. Las cuentas compartidas con otros equipos se conservan.`)) event.preventDefault() }}><input type="hidden" name="team_id" value={team.id} /><button disabled={deleting || saving} className={styles.deleteTeam}>{deleting ? 'Eliminando…' : 'Eliminar equipo'}</button></form><Feedback state={removed} /></div>}
  </section>
}

function Feedback({ state }: { state: State }) {
  return <p aria-live="polite" className={`mt-2 text-sm ${state.error ? 'text-red-400' : 'text-emerald-400'}`}>{state.error ?? state.success}</p>
}
