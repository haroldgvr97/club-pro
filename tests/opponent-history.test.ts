import { describe, expect, it } from 'vitest'
import { getOpponentHistory, type OpponentMatch } from '@/lib/matches/opponents'

const matches: OpponentMatch[] = [
  { id: 1, opponent_id: 2, our_goals: 2, opponent_goals: 1, played_at: '2026-09-15T12:00:00Z', opponents: { name: 'Real FC' }, managers: { name: 'Ana' } },
  { id: 2, opponent_id: 2, our_goals: 0, opponent_goals: 0, played_at: '2026-09-17T12:00:00Z', opponents: { name: 'Real FC' }, managers: { name: 'Luis' } },
  { id: 3, opponent_id: 3, our_goals: 1, opponent_goals: 3, played_at: '2026-09-18T12:00:00Z', opponents: { name: 'Real FC B' }, managers: { name: 'Ana' } },
]

describe('opponent history', () => {
  it('shows all matches for the same team, newest first, regardless of manager or capitalization', () => {
    expect(getOpponentHistory(matches, '  REAL   fc ').map((match) => match.id)).toEqual([2, 1])
    expect(matches.map((match) => match.id)).toEqual([1, 2, 3])
  })
  it('does not mix similar names or show history for an empty or new team', () => {
    expect(getOpponentHistory(matches, 'Real')).toEqual([])
    expect(getOpponentHistory(matches, '')).toEqual([])
    expect(getOpponentHistory(matches, 'Nuevo FC')).toEqual([])
  })
})
