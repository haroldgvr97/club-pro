import { describe, expect, it } from 'vitest'
import { createMatch } from '@/app/actions/matches'

describe('createMatch validation', () => {
  it('rejects invalid season', async () => {
    const formData = new FormData()

    formData.set('season_id', '0')
    formData.set('manager_id', '1')
    formData.set('opponent_id', '1')
    formData.set('our_goals', '1')
    formData.set('opponent_goals', '0')

    const result = await createMatch(formData)

    expect(result).toEqual({
      error: 'Temporada inválida.',
    })
  })

  it('rejects invalid manager', async () => {
    const formData = new FormData()

    formData.set('season_id', '1')
    formData.set('manager_id', '0')
    formData.set('opponent_id', '1')
    formData.set('our_goals', '1')
    formData.set('opponent_goals', '0')

    const result = await createMatch(formData)

    expect(result).toEqual({
      error: 'Manager inválido.',
    })
  })

  it('rejects invalid opponent', async () => {
    const formData = new FormData()

    formData.set('season_id', '1')
    formData.set('manager_id', '1')
    formData.set('opponent_id', '0')
    formData.set('our_goals', '1')
    formData.set('opponent_goals', '0')

    const result = await createMatch(formData)

    expect(result).toEqual({
      error: 'Rival inválido.',
    })
  })

  it('rejects negative our goals', async () => {
    const formData = new FormData()

    formData.set('season_id', '1')
    formData.set('manager_id', '1')
    formData.set('opponent_id', '1')
    formData.set('our_goals', '-1')
    formData.set('opponent_goals', '0')

    const result = await createMatch(formData)

    expect(result).toEqual({
      error: 'Nuestros goles son inválidos.',
    })
  })

  it('rejects negative opponent goals', async () => {
    const formData = new FormData()

    formData.set('season_id', '1')
    formData.set('manager_id', '1')
    formData.set('opponent_id', '1')
    formData.set('our_goals', '1')
    formData.set('opponent_goals', '-1')

    const result = await createMatch(formData)

    expect(result).toEqual({
      error: 'Los goles del rival son inválidos.',
    })
  })

  it('rejects invalid location', async () => {
    const formData = new FormData()

    formData.set('season_id', '1')
    formData.set('manager_id', '1')
    formData.set('opponent_id', '1')
    formData.set('our_goals', '1')
    formData.set('opponent_goals', '0')
    formData.set('location', 'neutral')

    const result = await createMatch(formData)

    expect(result).toEqual({
      error: 'Ubicación inválida.',
    })
  })
})
it('rejects invalid played_at', async () => {
  const formData = new FormData()

  formData.set('season_id', '1')
  formData.set('manager_id', '1')
  formData.set('opponent_id', '1')
  formData.set('our_goals', '1')
  formData.set('opponent_goals', '0')
  formData.set('played_at', 'not-a-date')

  const result = await createMatch(formData)

  expect(result).toEqual({
    error: 'Fecha del partido inválida.',
  })
})
