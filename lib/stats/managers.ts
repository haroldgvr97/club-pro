import { getMatchResult } from '@/lib/matches/result'

type ManagerMatch = {
  manager_id: number
  our_goals: number
  opponent_goals: number
}

export type ManagerStats = {
  managerId: number
  played: number
  wins: number
  draws: number
  losses: number
  goalsFor: number
  goalsAgainst: number
  goalDifference: number
  winRate: number
}

export function getManagerStats(
  matches: ManagerMatch[]
): ManagerStats[] {
  const stats = new Map<number, ManagerStats>()

  for (const match of matches) {
    const current =
      stats.get(match.manager_id) ??
      {
        managerId: match.manager_id,
        played: 0,
        wins: 0,
        draws: 0,
        losses: 0,
        goalsFor: 0,
        goalsAgainst: 0,
        goalDifference: 0,
        winRate: 0,
      }

    const result = getMatchResult(
      match.our_goals,
      match.opponent_goals
    )

    current.played += 1
    current.goalsFor += match.our_goals
    current.goalsAgainst += match.opponent_goals

    if (result === 'win') current.wins += 1
    if (result === 'draw') current.draws += 1
    if (result === 'loss') current.losses += 1

    current.goalDifference =
      current.goalsFor - current.goalsAgainst

    current.winRate =
      current.played > 0
        ? Number(((current.wins / current.played) * 100).toFixed(1))
        : 0

    stats.set(match.manager_id, current)
  }

  return Array.from(stats.values())
}
