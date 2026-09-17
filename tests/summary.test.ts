import { describe, expect, it } from 'vitest'
import { getMatchSummary } from '@/lib/stats/summary'

describe('getMatchSummary', () => {
  it('calculates summary correctly', () => {
    const matches = [
      { our_goals: 3, opponent_goals: 1 },
      { our_goals: 2, opponent_goals: 2 },
      { our_goals: 0, opponent_goals: 1 },
    ]

    expect(getMatchSummary(matches)).toEqual({
      played: 3,
      wins: 1,
      draws: 1,
      losses: 1,
      goalsFor: 5,
      goalsAgainst: 4,
      goalDifference: 1,
    })
  })

  it('returns zeroed stats for no matches', () => {
    expect(getMatchSummary([])).toEqual({
      played: 0,
      wins: 0,
      draws: 0,
      losses: 0,
      goalsFor: 0,
      goalsAgainst: 0,
      goalDifference: 0,
    })
  })
})
