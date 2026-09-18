import { AppSidebar } from '@/components/app-sidebar'
import { TeamManagement } from '@/components/team-management'
import { getAuthenticatedProfile } from '@/lib/auth/require-permission'
import { logout } from '@/app/logout-action'
import { redirect } from 'next/navigation'

export default async function TeamsPage() {
  const { supabase, profile } = await getAuthenticatedProfile()
  if (profile.role !== 'admin') redirect('/')
  const { data, error } = await supabase.from('teams').select('id, name').order('name')
  if (error) throw new Error('No se pudieron cargar los equipos.')
  return <div className="min-h-screen bg-zinc-950 text-white md:flex">
    <AppSidebar teamsOnly />
    <main className="min-w-0 flex-1 px-6 py-8"><div className="mx-auto max-w-5xl">
      <div className="mb-8 flex items-center justify-between gap-4"><div><h1 className="text-3xl font-bold">Equipos</h1><p className="mt-1 text-sm text-zinc-400">Selecciona un equipo para acceder a su Dashboard, Partidos, Estadísticas, Temporadas y Usuarios.</p></div><form action={logout}><button className="whitespace-nowrap rounded-lg border border-zinc-700 px-3 py-2 text-sm">Cerrar sesión</button></form></div>
      <TeamManagement teams={data ?? []} isAdmin={profile.role === 'admin'} />
    </div></main>
  </div>
}
