import { describe, expect, it } from 'vitest'
import { getMatchResult } from '@/lib/matches/result'

describe('getMatchResult', () => {
  it('returns win when our goals are higher', () => {
    expect(getMatchResult(3, 1)).toBe('win')
  })

  it('returns draw when goals are equal', () => {
    expect(getMatchResult(2, 2)).toBe('draw')
  })

  it('returns loss when opponent goals are higher', () => {
    expect(getMatchResult(1, 4)).toBe('loss')
  })
})
