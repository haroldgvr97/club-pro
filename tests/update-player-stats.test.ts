import { beforeEach, describe, expect, it, vi } from 'vitest'
import { updateManager } from '@/app/actions/managers'
import { getAuthenticatedProfile } from '@/lib/auth/require-permission'
import { getActiveTeamId } from '@/lib/teams/active-team'

vi.mock('@/lib/auth/require-permission', () => ({ getAuthenticatedProfile: vi.fn() }))
vi.mock('@/lib/teams/active-team', () => ({ getActiveTeamId: vi.fn() }))
vi.mock('@/utils/supabase/admin', () => ({ createAdminClient: vi.fn() }))
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }))

function playerForm() {
  const form = new FormData()
  form.set('manager_id', '10')
  form.set('goals', '2')
  form.set('assists', '2')
  return form
}

beforeEach(() => vi.resetAllMocks())
describe('player statistics updates', () => {
  it('updates the player through the team-scoped protected function', async () => {
    const rpc = vi.fn().mockResolvedValue({ error: null })
    vi.mocked(getAuthenticatedProfile).mockResolvedValue({ supabase: { rpc } } as never)
    vi.mocked(getActiveTeamId).mockResolvedValue(1)

    await expect(updateManager(playerForm())).resolves.toEqual({ success: true })
    expect(rpc).toHaveBeenCalledWith('update_player_stats', {
      p_team_id: 1, p_manager_id: 10, p_goals: 2, p_assists: 2,
    })
  })

  it('reports an ownership rejection without exposing player data', async () => {
    vi.mocked(getAuthenticatedProfile).mockResolvedValue({ supabase: { rpc: vi.fn().mockResolvedValue({ error: { code: '42501', message: 'Cannot edit another player' } }) } } as never)
    vi.mocked(getActiveTeamId).mockResolvedValue(1)
    await expect(updateManager(playerForm())).resolves.toEqual({ error: 'Solo puedes editar tus propias estadísticas de jugador.' })
  })
})
