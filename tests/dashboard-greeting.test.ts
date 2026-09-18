import { describe, expect, it } from 'vitest'
import { getDashboardGreeting } from '@/lib/dashboard-greeting'

describe('getDashboardGreeting', () => {
  it('uses a morning greeting from 5:00 through 11:59', () => {
    expect(getDashboardGreeting(5)).toBe('Buenos días')
    expect(getDashboardGreeting(11)).toBe('Buenos días')
  })

  it('uses an afternoon greeting from 12:00 through 19:59', () => {
    expect(getDashboardGreeting(12)).toBe('Buenas tardes')
    expect(getDashboardGreeting(19)).toBe('Buenas tardes')
  })

  it('uses a night greeting outside daytime hours', () => {
    expect(getDashboardGreeting(4)).toBe('Buenas noches')
    expect(getDashboardGreeting(20)).toBe('Buenas noches')
  })
})
