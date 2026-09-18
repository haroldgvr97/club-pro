import { beforeEach, describe, expect, it, vi } from 'vitest'
import { inviteUserV2 } from '@/app/admin/users/invite-action'
import { requirePermission } from '@/lib/auth/require-permission'
import { getActiveTeamId } from '@/lib/teams/active-team'
import { createAdminClient } from '@/utils/supabase/admin'

vi.mock('@/lib/auth/require-permission', () => ({ requirePermission: vi.fn() }))
vi.mock('@/lib/teams/active-team', () => ({ getActiveTeamId: vi.fn() }))
vi.mock('@/utils/supabase/admin', () => ({ createAdminClient: vi.fn() }))

beforeEach(() => vi.resetAllMocks())

describe('team invitations', () => {
  it('assigns an invited user through the protected team-assignment function', async () => {
    const rpc = vi.fn().mockResolvedValue({ error: null })
    vi.mocked(requirePermission).mockResolvedValue({ supabase: { rpc } } as never)
    vi.mocked(getActiveTeamId).mockResolvedValue(27)
    vi.mocked(createAdminClient).mockReturnValue({ auth: { admin: { inviteUserByEmail: vi.fn().mockResolvedValue({ data: { user: { id: 'new-user' } }, error: null }) } } } as never)
    const form = new FormData()
    form.set('email', 'member@example.com')

    await expect(inviteUserV2(form)).resolves.toEqual({ success: true })
    expect(rpc).toHaveBeenCalledWith('assign_invited_user_to_team', { p_team_id: 27, p_user_id: 'new-user' })
  })
})
