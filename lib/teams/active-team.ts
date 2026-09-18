import { cookies } from 'next/headers'
import { createClient } from '@/utils/supabase/server'

const ACTIVE_TEAM_COOKIE = 'clubes-pro-active-team'

export async function getActiveTeamId() {
  const supabase = await createClient()
  const cookieStore = await cookies()
  const requestedTeamId = Number(cookieStore.get(ACTIVE_TEAM_COOKIE)?.value)
  const query = supabase.from('team_members').select('team_id')
  const { data } = Number.isInteger(requestedTeamId) && requestedTeamId > 0
    ? await query.eq('team_id', requestedTeamId).maybeSingle()
    : await query.limit(1).maybeSingle()

  if (!data) throw new Error('No tienes acceso a ningún equipo.')
  return data.team_id
}

export { ACTIVE_TEAM_COOKIE }
