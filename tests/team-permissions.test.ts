import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createClient } from '@/utils/supabase/server'
import { getAuthenticatedProfile, requirePermission } from '@/lib/auth/require-permission'

vi.mock('@/utils/supabase/server', () => ({ createClient: vi.fn() }))

function setup(role: string, membership: Record<string, boolean> | null) {
  const from = vi.fn((table: string) => {
    const data = table === 'profiles' ? { id: 'user', role, can_manage_matches: true } : membership
    const chain = { select: vi.fn(), eq: vi.fn(), order: vi.fn(), limit: vi.fn(), single: vi.fn(), maybeSingle: vi.fn() }
    for (const key of ['select', 'eq', 'order', 'limit'] as const) chain[key].mockReturnValue(chain)
    chain.single.mockResolvedValue({ data, error: null })
    chain.maybeSingle.mockResolvedValue({ data, error: null })
    return chain
  })
  vi.mocked(createClient).mockResolvedValue({ from, auth: {
    getUser: async () => ({ data: { user: { id: 'user' } } }),
    mfa: { getAuthenticatorAssuranceLevel: async () => ({ data: { currentLevel: 'aal2' } }) },
  } } as unknown as Awaited<ReturnType<typeof createClient>>)
}

beforeEach(() => vi.resetAllMocks())
describe('effective team permissions', () => {
  it('uses the team permission instead of the old global permission', async () => {
    setup('user', { can_manage_matches: false, can_manage_permissions: true })
    await expect(requirePermission('can_manage_matches')).rejects.toThrow('FORBIDDEN')
    expect((await getAuthenticatedProfile()).profile.can_manage_permissions).toBe(true)
  })
  it('denies permissions when there is no assigned team', async () => {
    setup('user', null)
    await expect(requirePermission('can_manage_matches')).rejects.toThrow('FORBIDDEN')
  })
  it('preserves administrator access independently of membership permissions', async () => {
    setup('admin', { can_manage_matches: false, can_manage_permissions: false })
    expect((await requirePermission('can_manage_matches')).profile.can_manage_permissions).toBe(true)
  })
})
