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
  return <div className="cp-workspace min-h-screen text-white md:flex">
    <AppSidebar teamsOnly />
    <main className="cp-main"><div className="cp-content">
      <header className="cp-page-header"><div><p className="cp-eyebrow">Tu centro de control</p><h1>Tus equipos.</h1><p>Elige un club. Entra a su historia. Construye lo que viene.</p></div><form action={logout}><button className="cp-button">Cerrar sesión</button></form></header>
      <TeamManagement teams={data ?? []} isAdmin={profile.role === 'admin'} />
    </div></main>
  </div>
}
