'use server'

import { revalidatePath } from 'next/cache'
import { requireAdmin } from '@/lib/auth/require-admin'
import { getActiveTeamId } from '@/lib/teams/active-team'

export async function createOpponent(formData: FormData) {
  const name = formData.get('name')

  if (typeof name !== 'string' || !name.trim()) {
    return { error: 'El nombre del rival es obligatorio.' }
  }

  try {
    const { supabase } = await requireAdmin()
    const teamId = await getActiveTeamId()

    const { error } = await supabase
      .from('opponents')
      .insert({
        name: name.trim(),
        team_id: teamId,
      })

    if (error) {
      if (error.code === '23505') {
        return { error: 'Ya existe un rival con ese nombre.' }
      }

      return { error: 'No se pudo crear el rival.' }
    }

    revalidatePath('/')

    return { success: true }
  } catch {
    return { error: 'No autorizado.' }
  }
}
export async function updateOpponent(formData: FormData) {
  const opponentId = Number(formData.get('opponent_id'))
  const name = formData.get('name')

  if (!Number.isInteger(opponentId) || opponentId <= 0) {
    return { error: 'Rival inválido.' }
  }

  if (typeof name !== 'string' || !name.trim()) {
    return { error: 'El nombre del rival es obligatorio.' }
  }

  try {
    const { supabase } = await requireAdmin()

    const { data, error } = await supabase
      .from('opponents')
      .update({
        name: name.trim(),
      })
      .eq('id', opponentId)
      .select('id')
      .maybeSingle()

    if (error) {
      if (error.code === '23505') {
        return { error: 'Ya existe un rival con ese nombre.' }
      }

      return { error: 'No se pudo actualizar el rival.' }
    }

    if (!data) {
      return { error: 'El rival no existe.' }
    }

    revalidatePath('/')

    return { success: true }
  } catch {
    return { error: 'No autorizado.' }
  }
}
export async function deleteOpponent(formData: FormData) {
  const opponentId = Number(formData.get('opponent_id'))

  if (!Number.isInteger(opponentId) || opponentId <= 0) {
    return { error: 'Rival inválido.' }
  }

  try {
    const { supabase } = await requireAdmin()

    const { data, error } = await supabase
      .from('opponents')
      .delete()
      .eq('id', opponentId)
      .select('id')
      .maybeSingle()

    if (error) {
      if (error.code === '23503') {
        return {
          error:
            'No se puede eliminar este rival porque tiene partidos asociados.',
        }
      }

      return { error: 'No se pudo eliminar el rival.' }
    }

    if (!data) {
      return { error: 'El rival no existe.' }
    }

    revalidatePath('/')

    return { success: true }
  } catch {
    return { error: 'No autorizado.' }
  }
}
