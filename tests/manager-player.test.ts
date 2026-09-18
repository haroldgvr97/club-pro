import { describe, expect, it } from 'vitest'
import { getManagerPlayerStats } from '@/lib/stats/manager-player'

describe('manager player stats', () => {
  it('calculates games and player contributions for the selected manager', () => {
    expect(
      getManagerPlayerStats(
        [{ manager_id: 1 }, { manager_id: 2 }, { manager_id: 1 }],
        1,
        3,
        2
      )
    ).toEqual({
      played: 2,
      goals: 3,
      assists: 2,
      goalsPerGame: 1.5,
      goalContributions: 5,
      contributionsPerGame: 2.5,
    })
  })

  it('does not divide by zero when the manager has not directed a match', () => {
    expect(getManagerPlayerStats([], 1, 4, 1)).toMatchObject({
      played: 0,
      goalsPerGame: 0,
      contributionsPerGame: 0,
    })
  })
})
