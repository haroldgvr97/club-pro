import { describe, expect, it } from 'vitest'
import { getManagerStats } from '@/lib/stats/managers'
import { getOpponentStats } from '@/lib/stats/opponents'
import { getSeasonStats } from '@/lib/stats/seasons'

const matches = [
  {
    manager_id: 1,
    opponent_id: 10,
    season_id: 100,
    our_goals: 3,
    opponent_goals: 1,
  },
  {
    manager_id: 1,
    opponent_id: 11,
    season_id: 100,
    our_goals: 2,
    opponent_goals: 2,
  },
  {
    manager_id: 2,
    opponent_id: 10,
    season_id: 101,
    our_goals: 0,
    opponent_goals: 1,
  },
]

describe('grouped stats', () => {
  it('calculates manager stats correctly', () => {
    expect(getManagerStats(matches)).toEqual([
      {
        managerId: 1,
        played: 2,
        wins: 1,
        draws: 1,
        losses: 0,
        goalsFor: 5,
        goalsAgainst: 3,
        goalDifference: 2,
        winRate: 50,
      },
      {
        managerId: 2,
        played: 1,
        wins: 0,
        draws: 0,
        losses: 1,
        goalsFor: 0,
        goalsAgainst: 1,
        goalDifference: -1,
        winRate: 0,
      },
    ])
  })

  it('calculates opponent stats correctly', () => {
    expect(getOpponentStats(matches)).toEqual([
      {
        opponentId: 10,
        played: 2,
        wins: 1,
        draws: 0,
        losses: 1,
        goalsFor: 3,
        goalsAgainst: 2,
        goalDifference: 1,
        winRate: 50,
      },
      {
        opponentId: 11,
        played: 1,
        wins: 0,
        draws: 1,
        losses: 0,
        goalsFor: 2,
        goalsAgainst: 2,
        goalDifference: 0,
        winRate: 0,
      },
    ])
  })

  it('calculates season stats correctly', () => {
    expect(getSeasonStats(matches)).toEqual([
      {
        seasonId: 100,
        played: 2,
        wins: 1,
        draws: 1,
        losses: 0,
        goalsFor: 5,
        goalsAgainst: 3,
        goalDifference: 2,
        winRate: 50,
      },
      {
        seasonId: 101,
        played: 1,
        wins: 0,
        draws: 0,
        losses: 1,
        goalsFor: 0,
        goalsAgainst: 1,
        goalDifference: -1,
        winRate: 0,
      },
    ])
  })
})
