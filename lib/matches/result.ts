export type MatchResult = 'win' | 'draw' | 'loss'

export function getMatchResult(
  ourGoals: number,
  opponentGoals: number
): MatchResult {
  if (ourGoals > opponentGoals) {
    return 'win'
  }

  if (ourGoals < opponentGoals) {
    return 'loss'
  }

  return 'draw'
}
