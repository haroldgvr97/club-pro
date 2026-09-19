import { expect, it, vi } from 'vitest'
import { getDashboardData } from '@/lib/data/get-dashboard-data'
import { createClient } from '@/utils/supabase/server'

vi.mock('@/utils/supabase/server', () => ({ createClient: vi.fn() }))
vi.mock('@/lib/teams/active-team', () => ({ getActiveTeamId: async () => 1 }))

it('resolves the directing manager from the roster while preserving separate player attendance', async () => {
  const tableData: Record<string, object[]> = {
    seasons: [],
    opponents: [],
    managers: [{ id: 8, goals: 2, assists: 1 }],
    matches: [
      { id: 1, manager_id: 10, match_players: [{ player_id: 8 }, { player_id: 10 }], our_goals: 0, opponent_goals: 0 },
      { id: 2, manager_id: null, match_players: [] },
    ],
  }
  const from = (table: string) => {
    const result = Promise.resolve({ data: tableData[table], error: null })
    const query = {
      select: () => query,
      eq: () => query,
      order: () => query,
      then: result.then.bind(result),
    }
    return query
  }
  vi.mocked(createClient).mockResolvedValue({
    from,
    rpc: async () => ({ error: null, data: [
      { id: 8, name: 'PLAYER', profile_id: 'self', is_active: true },
      { id: 10, name: 'MANAGER', profile_id: 'other', is_active: true },
    ] }),
  } as never)

  const data = await getDashboardData()
  expect(data.matches[0]).toMatchObject({
    managers: { id: 10, name: 'MANAGER' },
    match_players: [{ player_id: 8 }, { player_id: 10 }],
    our_goals: 0,
    opponent_goals: 0,
  })
  expect(data.matches[1].managers).toBeNull()
  expect(data.managers.find(manager => manager.id === 8)).toMatchObject({ goals: 2, assists: 1, can_view_stats: true })
  expect(data.managers.find(manager => manager.id === 10)?.can_view_stats).toBe(false)
})
