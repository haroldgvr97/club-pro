import { beforeEach, describe, expect, it, vi } from 'vitest'
import { getActiveTeamId } from '@/lib/teams/active-team'
import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'

vi.mock('@/utils/supabase/server', () => ({ createClient: vi.fn() }))
vi.mock('next/headers', () => ({ cookies: vi.fn() }))
vi.mock('next/navigation', () => ({ redirect: (url: string) => { throw new Error(`REDIRECT:${url}`) } }))

function setup(role: string, selected?: string, visible = true, member = true) {
  vi.mocked(cookies).mockResolvedValue({ get: () => selected ? { value: selected } : undefined } as unknown as Awaited<ReturnType<typeof cookies>>)
  const from = vi.fn((table: string) => {
    const result = table === 'profiles' ? { role } : table === 'teams' ? (visible ? { id: Number(selected) } : null) : (member ? { team_id: 7 } : null)
    const chain = { select: vi.fn(), eq: vi.fn(), order: vi.fn(), limit: vi.fn(), single: vi.fn(), maybeSingle: vi.fn() }
    for (const method of ['select', 'eq', 'order', 'limit'] as const) chain[method].mockReturnValue(chain)
    chain.single.mockResolvedValue({ data: result, error: null })
    chain.maybeSingle.mockResolvedValue({ data: result, error: null })
    return chain
  })
  vi.mocked(createClient).mockResolvedValue({ auth: { getUser: async () => ({ data: { user: { id: 'user-id' } } }) }, from } as unknown as Awaited<ReturnType<typeof createClient>>)
  return from
}

beforeEach(() => vi.resetAllMocks())
describe('active team navigation', () => {
  it('ignores a team selection cookie for regular users', async () => {
    const from = setup('user', '12')
    expect(await getActiveTeamId()).toBe(7)
    expect(from).not.toHaveBeenCalledWith('teams')
  })
  it('shows the unassigned state without redirecting users to Equipos', async () => {
    setup('user', undefined, true, false)
    await expect(getActiveTeamId()).rejects.toThrow('REDIRECT:/no-team')
  })
  it('takes administrators without a selection to Equipos', async () => {
    setup('admin')
    await expect(getActiveTeamId()).rejects.toThrow('REDIRECT:/teams')
  })
  it('uses the explicitly selected accessible team', async () => {
    setup('admin', '12')
    expect(await getActiveTeamId()).toBe(12)
  })
  it('takes administrators back to Equipos when their team was deleted', async () => {
    setup('admin', '12', false)
    await expect(getActiveTeamId()).rejects.toThrow('REDIRECT:/teams')
  })
  it('resolves a regular user through their own membership', async () => {
    const from = setup('user')
    expect(await getActiveTeamId()).toBe(7)
    expect(from).toHaveBeenCalledWith('team_members')
  })
})
