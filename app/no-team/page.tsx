import { redirect } from 'next/navigation'
import { getAuthenticatedProfile } from '@/lib/auth/require-permission'
import { logout } from '@/app/logout-action'

export default async function NoTeamPage() {
  const { supabase, user, profile } = await getAuthenticatedProfile()
  if (profile.role === 'admin') redirect('/teams')
  const { data, error } = await supabase.from('team_members').select('team_id').eq('profile_id', user.id).limit(1).maybeSingle()
  if (error) throw new Error('No se pudo comprobar tu equipo asignado.')
  if (data) redirect('/')
  return <main className="min-h-screen bg-zinc-950 px-6 py-12 text-white">
    <h1 className="text-2xl font-bold">Sin equipo asignado</h1>
    <p className="mt-3 text-zinc-400">Pide al administrador una invitación para acceder a tu equipo.</p>
    <form action={logout}><button className="mt-6 rounded-lg border border-zinc-700 px-4 py-2">Cerrar sesión</button></form>
  </main>
}
