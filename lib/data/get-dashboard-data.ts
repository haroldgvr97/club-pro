import { createClient } from '@/utils/supabase/server'
import { getActiveTeamId } from '@/lib/teams/active-team'

export async function getDashboardData() {
  const supabase = await createClient()
  const teamId = await getActiveTeamId()

  const [
    seasonsResult,
    managersResult,
    opponentsResult,
    matchesResult,
    rosterResult,
  ] = await Promise.all([
    supabase
      .from('seasons')
      .select('*')
      .eq('team_id', teamId)
      .order('is_active', { ascending: false })
      .order('start_date', { ascending: false }),

    supabase
      .from('managers')
      .select('*')
      .eq('team_id', teamId)
      .order('is_active', { ascending: false })
      .order('name'),

    supabase
      .from('opponents')
      .select('*')
      .eq('team_id', teamId)
      .order('name'),

    supabase
      .from('matches')
      .select(`
        *,
        match_players (player_id),
        seasons (
          id,
          name
        ),
        opponents (
          id,
          name
        )
      `)
      .eq('team_id', teamId)
      .order('played_at', { ascending: false }),
    supabase.rpc('get_team_roster', { p_team_id: teamId }),
  ])

  if (seasonsResult.error) {
    throw new Error('No se pudieron cargar las temporadas.')
  }

  if (managersResult.error || rosterResult.error) {
    throw new Error('No se pudieron cargar los managers.')
  }

  if (opponentsResult.error) {
    throw new Error('No se pudieron cargar los rivales.')
  }

  if (matchesResult.error) {
    throw new Error('No se pudieron cargar los partidos.')
  }

  const statisticsById = new Map((managersResult.data ?? []).map(manager => [manager.id, manager]))
  const managers = (rosterResult.data ?? []).map(manager => ({
    ...manager,
    goals: statisticsById.get(manager.id)?.goals ?? 0,
    assists: statisticsById.get(manager.id)?.assists ?? 0,
    can_view_stats: statisticsById.has(manager.id),
  }))
  const namesById = new Map(managers.map(manager => [manager.id, { id: manager.id, name: manager.name }]))
  return {
    seasons: seasonsResult.data ?? [],
    managers,
    opponents: opponentsResult.data ?? [],
    matches: (matchesResult.data ?? []).map(match => ({
      ...match,
      managers: match.manager_id === null ? null : namesById.get(match.manager_id) ?? null,
    })),
  }
}
