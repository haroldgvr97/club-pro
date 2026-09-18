import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export const ACTIVE_TEAM_COOKIE = 'clubes-pro-active-team'

export async function getActiveTeamId() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  const { data: profile, error: profileError } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profileError) throw new Error('No se pudo comprobar el acceso del usuario.')
  const requested = Number((await cookies()).get(ACTIVE_TEAM_COOKIE)?.value)
  if (Number.isSafeInteger(requested) && requested > 0) {
    const { data, error } = await supabase.from('teams').select('id').eq('id', requested).maybeSingle()
    if (error) throw new Error('No se pudo consultar el equipo seleccionado.')
    if (data) return data.id
  }
  if (profile.role === 'admin') redirect('/teams')
  const { data, error } = await supabase.from('team_members').select('team_id').eq('profile_id', user.id).order('team_id').limit(1).maybeSingle()
  if (error) throw new Error('No se pudo consultar tu equipo.')
  if (!data) redirect('/teams')
  return data.team_id
}
