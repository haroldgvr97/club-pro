import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { inviteUserV2 } from '@/app/admin/users/invite-action'
import { requirePermission } from '@/lib/auth/require-permission'
import { getActiveTeamId } from '@/lib/teams/active-team'
import { createAdminClient } from '@/utils/supabase/admin'

vi.mock('@/lib/auth/require-permission', () => ({ requirePermission: vi.fn() }))
vi.mock('@/lib/teams/active-team', () => ({ getActiveTeamId: vi.fn() }))
vi.mock('@/utils/supabase/admin', () => ({ createAdminClient: vi.fn() }))
vi.mock('next/headers', () => ({ headers: async () => ({ get: () => 'http://localhost:3000' }) }))
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }))

beforeEach(() => {
  vi.resetAllMocks()
  vi.stubEnv('NEXT_PUBLIC_APP_URL', '')
})
afterEach(() => vi.unstubAllEnvs())

describe('team invitations', () => {
  it('assigns an invited user through the protected team-assignment function', async () => {
    const rpc = vi.fn().mockResolvedValue({ error: null })
    vi.mocked(requirePermission).mockResolvedValue({ user: { id: 'inviter' } } as never)
    vi.mocked(getActiveTeamId).mockResolvedValue(27)
    vi.mocked(createAdminClient).mockReturnValue({ rpc, auth: { admin: { inviteUserByEmail: vi.fn().mockResolvedValue({ data: { user: { id: 'new-user' } }, error: null }) } } } as never)
    const form = new FormData()
    form.set('email', 'member@example.com')

    await expect(inviteUserV2(form)).resolves.toEqual({ success: true })
    expect(rpc).toHaveBeenCalledWith('assign_invited_user_to_team', { p_team_id: 27, p_user_id: 'new-user', p_inviter_id: 'inviter' })
  })
  it('does not send an invitation when permission is denied', async () => {
    vi.mocked(requirePermission).mockRejectedValue(new Error('FORBIDDEN'))
    const form = new FormData()
    form.set('email', 'member@example.com')
    expect(await inviteUserV2(form)).toEqual({ error: 'No autorizado para enviar invitaciones.' })
    expect(createAdminClient).not.toHaveBeenCalled()
  })
  it.each([false, true])('retries assignment without resending the email; persistent failure: %s', async (persistentFailure) => {
    const failure = { error: { message: 'Unavailable' } }
    const rpc = vi.fn().mockResolvedValueOnce(failure).mockResolvedValueOnce(persistentFailure ? failure : { error: null })
    const send = vi.fn().mockResolvedValue({ data: { user: { id: 'new-user' } }, error: null })
    vi.mocked(requirePermission).mockResolvedValue({ user: { id: 'inviter' } } as never)
    vi.mocked(getActiveTeamId).mockResolvedValue(27)
    vi.mocked(createAdminClient).mockReturnValue({ rpc, auth: { admin: { inviteUserByEmail: send } } } as never)
    const form = new FormData()
    form.set('email', 'member@example.com')
    expect(await inviteUserV2(form)).toEqual(persistentFailure
      ? { error: 'La invitación se creó, pero no se pudo asociar al equipo.' }
      : { success: true })
    expect(send).toHaveBeenCalledTimes(1)
    expect(rpc).toHaveBeenCalledTimes(2)
  })
  it('rejects an unsafe callback configuration before sending email', async () => {
    vi.stubEnv('NEXT_PUBLIC_APP_URL', 'http://example.com')
    vi.mocked(requirePermission).mockResolvedValue({ user: { id: 'inviter' } } as never)
    vi.mocked(getActiveTeamId).mockResolvedValue(27)
    const form = new FormData()
    form.set('email', 'member@example.com')
    expect(await inviteUserV2(form)).toHaveProperty('error')
    expect(createAdminClient).not.toHaveBeenCalled()
  })
})
