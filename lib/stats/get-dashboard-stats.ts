import { createClient } from '@/utils/supabase/server'
import { getActiveTeamId } from '@/lib/teams/active-team'
import { getMatchSummary } from '@/lib/stats/summary'
import { getManagerStats } from '@/lib/stats/managers'
import { getOpponentStats } from '@/lib/stats/opponents'
import { getSeasonStats } from '@/lib/stats/seasons'

export async function getDashboardStats() {
  const supabase = await createClient()
  const teamId = await getActiveTeamId()

  const { data: matches, error } = await supabase
    .from('matches')
    .select(
      `
        manager_id,
        opponent_id,
        season_id,
        our_goals,
        opponent_goals
      `
    ).eq('team_id', teamId)

  if (error) {
    throw new Error('No se pudieron cargar las estadísticas.')
  }

  const safeMatches = matches ?? []

  return {
    summary: getMatchSummary(safeMatches),
    managers: getManagerStats(safeMatches),
    opponents: getOpponentStats(safeMatches),
    seasons: getSeasonStats(safeMatches),
  }
}
