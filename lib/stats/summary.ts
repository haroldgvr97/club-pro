import { getMatchResult } from '@/lib/matches/result'

type MatchForStats = {
  our_goals: number
  opponent_goals: number
}

export type MatchSummary = {
  played: number
  wins: number
  draws: number
  losses: number
  goalsFor: number
  goalsAgainst: number
  goalDifference: number
}

export function getMatchSummary(matches: MatchForStats[]): MatchSummary {
  return matches.reduce<MatchSummary>(
    (summary, match) => {
      const result = getMatchResult(
        match.our_goals,
        match.opponent_goals
      )

      summary.played += 1
      summary.goalsFor += match.our_goals
      summary.goalsAgainst += match.opponent_goals

      if (result === 'win') summary.wins += 1
      if (result === 'draw') summary.draws += 1
      if (result === 'loss') summary.losses += 1

      summary.goalDifference =
        summary.goalsFor - summary.goalsAgainst

      return summary
    },
    {
      played: 0,
      wins: 0,
      draws: 0,
      losses: 0,
      goalsFor: 0,
      goalsAgainst: 0,
      goalDifference: 0,
    }
  )
}

