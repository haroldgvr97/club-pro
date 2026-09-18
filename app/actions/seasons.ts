'use server'

import { revalidatePath } from 'next/cache'
import { requirePermission } from '@/lib/auth/require-permission'
import { createAdminClient } from '@/utils/supabase/admin'

export async function createSeason(formData: FormData) {
  const name = formData.get('name')
  const startDate = formData.get('start_date')
  const endDate = formData.get('end_date')

  if (typeof name !== 'string' || !name.trim()) {
    return { error: 'El nombre de la temporada es obligatorio.' }
  }

  const cleanStartDate =
    typeof startDate === 'string' && startDate ? startDate : null

  const cleanEndDate =
    typeof endDate === 'string' && endDate ? endDate : null

  if (
    cleanStartDate &&
    cleanEndDate &&
    cleanEndDate < cleanStartDate
  ) {
    return {
      error: 'La fecha final no puede ser anterior a la fecha inicial.',
    }
  }

  try {
    await requirePermission('can_manage_seasons')
    const supabase = createAdminClient()

    const { error } = await supabase
      .from('seasons')
      .insert({
        name: name.trim(),
        start_date: cleanStartDate,
        end_date: cleanEndDate,
      })

    if (error) {
      if (error.code === '23505') {
        return { error: 'Ya existe una temporada con ese nombre.' }
      }

      return { error: 'No se pudo crear la temporada.' }
    }

    revalidatePath('/')

    return { success: true }
  } catch {
    return { error: 'No autorizado.' }
  }
}
export async function activateSeason(formData: FormData) {
  const seasonId = Number(formData.get('season_id'))

  if (!Number.isInteger(seasonId) || seasonId <= 0) {
    return { error: 'Temporada inválida.' }
  }

  try {
    await requirePermission('can_manage_seasons')
    const supabase = createAdminClient()

    const { error } = await supabase.rpc('activate_season', {
      p_season_id: seasonId,
    })

    if (error) {
      if (error.message.includes('SEASON_NOT_FOUND')) {
        return { error: 'La temporada no existe.' }
      }

      return { error: 'No se pudo activar la temporada.' }
    }

    revalidatePath('/')

    return { success: true }
  } catch {
    return { error: 'No autorizado.' }
  }
}
export async function deleteSeason(formData: FormData) {
  const seasonId = Number(formData.get('season_id'))

  if (!Number.isInteger(seasonId) || seasonId <= 0) {
    return { error: 'Temporada inválida.' }
  }

  try {
    await requirePermission('can_manage_seasons')
    const supabase = createAdminClient()

    const { data, error } = await supabase
      .from('seasons')
      .delete()
      .eq('id', seasonId)
      .select('id')
      .maybeSingle()

    if (error) {
      if (error.code === '23503') {
        return {
          error:
            'No se puede eliminar esta temporada porque tiene partidos asociados.',
        }
      }

      return { error: 'No se pudo eliminar la temporada.' }
    }

    if (!data) {
      return { error: 'La temporada no existe.' }
    }

    revalidatePath('/')

    return { success: true }
  } catch {
    return { error: 'No autorizado.' }
  }
}

export async function updateSeason(formData: FormData) {
  const seasonId = Number(formData.get('season_id'))
  const name = formData.get('name')
  const startDate = formData.get('start_date')
  const endDate = formData.get('end_date')

  if (!Number.isInteger(seasonId) || seasonId <= 0) {
    return { error: 'Temporada inválida.' }
  }

  if (typeof name !== 'string' || !name.trim()) {
    return { error: 'El nombre de la temporada es obligatorio.' }
  }

  const cleanStartDate =
    typeof startDate === 'string' && startDate ? startDate : null

  const cleanEndDate =
    typeof endDate === 'string' && endDate ? endDate : null

  if (
    cleanStartDate &&
    cleanEndDate &&
    cleanEndDate < cleanStartDate
  ) {
    return {
      error: 'La fecha final no puede ser anterior a la fecha inicial.',
    }
  }

  try {
    await requirePermission('can_manage_seasons')
    const supabase = createAdminClient()

    const { data, error } = await supabase
      .from('seasons')
      .update({
        name: name.trim(),
        start_date: cleanStartDate,
        end_date: cleanEndDate,
      })
      .eq('id', seasonId)
      .select('id')
      .maybeSingle()

    if (error) {
      if (error.code === '23505') {
        return { error: 'Ya existe una temporada con ese nombre.' }
      }

      return { error: 'No se pudo actualizar la temporada.' }
    }

    if (!data) {
      return { error: 'La temporada no existe.' }
    }

    revalidatePath('/')

    return { success: true }
  } catch {
    return { error: 'No autorizado.' }
  }
}
