import { describe, expect, it } from 'vitest'
import { createSeason } from '@/app/actions/seasons'

describe('createSeason validation', () => {
  it('rejects an empty season name', async () => {
    const formData = new FormData()

    formData.set('name', '')

    const result = await createSeason(formData)

    expect(result).toEqual({
      error: 'El nombre de la temporada es obligatorio.',
    })
  })

  it('rejects an end date before the start date', async () => {
    const formData = new FormData()

    formData.set('name', 'FIFA 27 - Temporada 1')
    formData.set('start_date', '2026-10-10')
    formData.set('end_date', '2026-10-01')

    const result = await createSeason(formData)

    expect(result).toEqual({
      error: 'La fecha final no puede ser anterior a la fecha inicial.',
    })
  })
})
