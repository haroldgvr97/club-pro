import { createClient } from '@/utils/supabase/server'
import { createTeam, deleteTeam, renameTeam, selectTeam } from './actions'

export default async function TeamsPage() {
  const supabase = await createClient()
  const { data: teams } = await supabase.from('teams').select('id, name').order('name')
  return <main className="min-h-screen bg-zinc-950 p-6 text-white"><div className="mx-auto max-w-5xl"><h1 className="text-3xl font-bold">Clubes Pro: Equipos</h1><p className="mt-1 text-sm text-zinc-400">Crea y administra los espacios independientes de cada equipo.</p>
    <section className="mt-8 rounded-xl border border-zinc-800 bg-zinc-900 p-5"><h2 className="mb-4 text-lg font-semibold">Crear Equipo</h2><form action={createTeam} className="flex gap-3"><input name="name" placeholder="Nombre del equipo" required className="flex-1 rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2" /><button className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-black">Crear Equipo</button></form></section>
    <section className="mt-8 divide-y divide-zinc-800 overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900">{teams?.map((team) => <div key={team.id} className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center"><form action={selectTeam}><input type="hidden" name="team_id" value={team.id} /><button className="text-left text-lg font-semibold hover:underline">{team.name}</button></form><form action={renameTeam} className="flex flex-1 gap-2"><input type="hidden" name="team_id" value={team.id} /><input name="name" defaultValue={team.name} className="min-w-0 flex-1 rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm" /><button className="rounded-lg border border-zinc-700 px-3 py-2 text-sm">Guardar</button></form><form action={deleteTeam}><input type="hidden" name="team_id" value={team.id} /><button className="rounded-lg border border-red-900 px-3 py-2 text-sm text-red-400">Eliminar</button></form></div>)}</section>
  </div></main>
}
