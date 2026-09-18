import { cookies } from 'next/headers'
import { createClient } from '@/utils/supabase/server'

const ACTIVE_TEAM_COOKIE = 'clubes-pro-active-team'

export async function getActiveTeamId() {
  const supabase = await createClient()
  const cookieStore = await cookies()
  const requestedTeamId = Number(cookieStore.get(ACTIVE_TEAM_COOKIE)?.value)
  const { data: requestedTeam } =
    Number.isInteger(requestedTeamId) && requestedTeamId > 0
      ? await supabase
          .from('team_members')
          .select('team_id')
          .eq('team_id', requestedTeamId)
          .maybeSingle()
      : { data: null }
  const { data: visibleTeam } = requestedTeam
    ? { data: requestedTeam }
    : { data: null }

  const { data: resolvedTeamId } = visibleTeam
    ? { data: visibleTeam.team_id }
    : await supabase.rpc('get_my_team_id')

  const data = resolvedTeamId ? { team_id: Number(resolvedTeamId) } : null

  if (!data) {
    const { data: authData } = await supabase.auth.getUser()
    const { data: profile } = authData.user
      ? await supabase.from('profiles').select('role').eq('id', authData.user.id).maybeSingle()
      : { data: null }
    if (profile?.role === 'admin') {
      const { data: firstTeam } = await supabase.from('teams').select('id').limit(1).maybeSingle()
      if (firstTeam) return firstTeam.id
    }
    throw new Error('No tienes acceso a ningún equipo.')
  }
  return data.team_id
}

export { ACTIVE_TEAM_COOKIE }
