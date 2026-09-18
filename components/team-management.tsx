'use client'

import { useActionState } from 'react'
import { createTeam, renameTeam, deleteTeam, selectTeam } from '@/app/teams/actions'

type State = { error?: string; success?: string }
type Team = { id: number; name: string }
const field = 'min-w-0 flex-1 rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2'
const button = 'rounded-lg border border-zinc-700 px-4 py-2 text-sm hover:bg-zinc-800 disabled:opacity-50'

export function TeamManagement({ teams, isAdmin }: { teams: Team[]; isAdmin: boolean }) {
  const [state, action, pending] = useActionState<State, FormData>((_, form) => createTeam(form), {})
  return <div className="space-y-6">
    {isAdmin && <section className="rounded-xl border border-zinc-800 bg-zinc-900 p-5"><h2 className="mb-4 text-lg font-semibold">Crear Equipo</h2><form action={action} className="flex flex-col gap-3 sm:flex-row"><input aria-label="Nombre del nuevo equipo" name="name" required maxLength={80} placeholder="Nombre del equipo" className={field} /><button disabled={pending} className={button}>{pending ? 'Creando…' : 'Crear Equipo'}</button></form><Feedback state={state} /></section>}
    {teams.length === 0 && <p className="text-zinc-400">{isAdmin ? 'Todavía no hay equipos. Crea el primero.' : 'Todavía no tienes equipos asignados.'}</p>}
    {teams.map(team => <TeamRow key={team.id} team={team} isAdmin={isAdmin} />)}
  </div>
}

function TeamRow({ team, isAdmin }: { team: Team; isAdmin: boolean }) {
  const [saved, save, saving] = useActionState<State, FormData>((_, form) => renameTeam(form), {})
  const [removed, remove, deleting] = useActionState<State, FormData>((_, form) => deleteTeam(form), {})
  return <section className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
    <form action={selectTeam} className="flex items-center justify-between gap-4"><input type="hidden" name="team_id" value={team.id} /><h2 className="text-xl font-semibold"><button>{team.name}</button></h2><button className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-black">Entrar al equipo</button></form>
    {isAdmin && <><form action={save} className="mt-5 flex flex-col gap-3 sm:flex-row"><input type="hidden" name="team_id" value={team.id} /><input aria-label={`Nombre de ${team.name}`} name="name" defaultValue={team.name} required maxLength={80} className={field} /><button disabled={saving || deleting} className={button}>{saving ? 'Guardando…' : 'Guardar nombre'}</button></form><Feedback state={saved} />
      <form action={remove} className="mt-4" onSubmit={event => { if (!window.confirm(`¿Eliminar ${team.name} y todos sus partidos, temporadas, estadísticas y miembros? Esta acción no se puede deshacer. Las cuentas compartidas con otros equipos se conservan.`)) event.preventDefault() }}><input type="hidden" name="team_id" value={team.id} /><button disabled={deleting || saving} className="rounded-lg border border-red-900 px-4 py-2 text-sm text-red-400 disabled:opacity-50">{deleting ? 'Eliminando…' : 'Eliminar equipo'}</button></form><Feedback state={removed} /></>}
  </section>
}

function Feedback({ state }: { state: State }) {
  return <p aria-live="polite" className={`mt-2 text-sm ${state.error ? 'text-red-400' : 'text-emerald-400'}`}>{state.error ?? state.success}</p>
}
