import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createMatch } from '@/app/actions/matches'
import { requireAdmin } from '@/lib/auth/require-admin'
import { revalidatePath } from 'next/cache'

vi.mock('@/lib/auth/require-admin', () => ({ requireAdmin: vi.fn() }))
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }))

function form() {
  const data = new FormData()
  Object.entries({ season_id: '1', manager_id: '2', opponent_name: '  REAL   fc ', our_goals: '2', opponent_goals: '1' }).forEach(([key, value]) => data.set(key, value))
  return data
}

function database(existing: { id: number; name: string }[] = []) {
  const saveMatch = vi.fn().mockResolvedValue({ error: null })
  const createTeam = vi.fn().mockReturnValue({ select: () => ({ single: async () => ({ data: { id: 8 }, error: null }) }) })
  const client = { from: vi.fn((table: string) => table === 'matches'
    ? { insert: saveMatch }
    : { select: async () => ({ data: existing, error: null }), insert: createTeam }) }
  vi.mocked(requireAdmin).mockResolvedValue({ supabase: client } as unknown as Awaited<ReturnType<typeof requireAdmin>>)
  return { saveMatch, createTeam }
}

beforeEach(() => vi.resetAllMocks())
describe('record a match by team name', () => {
  it('reuses an existing team and refreshes the match history', async () => {
    const { saveMatch, createTeam } = database([{ id: 7, name: 'Real FC' }])
    expect(await createMatch(form())).toEqual({ success: true })
    expect(createTeam).not.toHaveBeenCalled()
    expect(saveMatch).toHaveBeenCalledWith(expect.objectContaining({ opponent_id: 7, manager_id: 2, our_goals: 2, opponent_goals: 1, location: null, played_at: expect.any(String) }))
    expect(revalidatePath).toHaveBeenCalledWith('/matches')
  })
  it('creates a new team and associates the result with it', async () => {
    const { saveMatch, createTeam } = database()
    expect(await createMatch(form())).toEqual({ success: true })
    expect(createTeam).toHaveBeenCalledWith({ name: 'REAL fc' })
    expect(saveMatch).toHaveBeenCalledWith(expect.objectContaining({ opponent_id: 8 }))
  })
  it('does not silently record an unfinished match as 0–0', async () => {
    const data = form()
    data.delete('our_goals')
    expect(await createMatch(data)).toEqual({ error: 'Nuestros goles son inválidos.' })
    expect(requireAdmin).not.toHaveBeenCalled()
  })
  it('does not write when the user is unauthorized', async () => {
    vi.mocked(requireAdmin).mockRejectedValue(new Error('UNAUTHORIZED'))
    expect(await createMatch(form())).toEqual({ error: 'No autorizado.' })
  })
})
