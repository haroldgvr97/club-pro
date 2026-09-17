import { describe, expect, it } from 'vitest'
import {
  createManager,
  updateManager,
  setManagerActive,
  deleteManager,
} from '@/app/actions/managers'
import {
  createOpponent,
  updateOpponent,
  deleteOpponent,
} from '@/app/actions/opponents'

describe('manager action validation', () => {
  it('rejects empty manager name', async () => {
    const formData = new FormData()
    formData.set('name', '')

    expect(await createManager(formData)).toEqual({
      error: 'El nombre del manager es obligatorio.',
    })
  })

  it('rejects invalid manager id when updating', async () => {
    const formData = new FormData()
    formData.set('manager_id', '0')
    formData.set('name', 'Harold')

    expect(await updateManager(formData)).toEqual({
      error: 'Manager inválido.',
    })
  })

  it('rejects invalid manager active state', async () => {
    const formData = new FormData()
    formData.set('manager_id', '1')
    formData.set('is_active', 'invalid')

    expect(await setManagerActive(formData)).toEqual({
      error: 'Estado inválido.',
    })
  })

  it('rejects invalid manager id when deleting', async () => {
    const formData = new FormData()
    formData.set('manager_id', '0')

    expect(await deleteManager(formData)).toEqual({
      error: 'Manager inválido.',
    })
  })
})

describe('opponent action validation', () => {
  it('rejects empty opponent name', async () => {
    const formData = new FormData()
    formData.set('name', '')

    expect(await createOpponent(formData)).toEqual({
      error: 'El nombre del rival es obligatorio.',
    })
  })

  it('rejects invalid opponent id when updating', async () => {
    const formData = new FormData()
    formData.set('opponent_id', '0')
    formData.set('name', 'Rival FC')

    expect(await updateOpponent(formData)).toEqual({
      error: 'Rival inválido.',
    })
  })

  it('rejects invalid opponent id when deleting', async () => {
    const formData = new FormData()
    formData.set('opponent_id', '0')

    expect(await deleteOpponent(formData)).toEqual({
      error: 'Rival inválido.',
    })
  })
})
