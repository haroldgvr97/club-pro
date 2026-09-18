'use server'

import { revalidatePath } from 'next/cache'
import { requireAdmin } from '@/lib/auth/require-admin'
import { getAuthenticatedProfile } from '@/lib/auth/require-permission'
import { createAdminClient } from '@/utils/supabase/admin'
import { getActiveTeamId } from '@/lib/teams/active-team'

export async function createManager(formData: FormData) {
  const name = formData.get('name')

  if (typeof name !== 'string' || !name.trim()) {
    return { error: 'El nombre del manager es obligatorio.' }
  }

  try {
    const { supabase } = await requireAdmin()
    const teamId = await getActiveTeamId()

    const { error } = await supabase
      .from('managers')
      .insert({
        name: name.trim(),
        team_id: teamId,
      })

    if (error) {
      if (error.code === '23505') {
        return { error: 'Ya existe un manager con ese nombre.' }
      }

      return { error: 'No se pudo crear el manager.' }
    }

    revalidatePath('/')

    return { success: true }
  } catch {
    return { error: 'No autorizado.' }
  }
}
export async function updateManager(formData: FormData) {
  const managerId = Number(formData.get('manager_id'))
  const goals = Number(formData.get('goals'))
  const assists = Number(formData.get('assists'))

  if (!Number.isInteger(managerId) || managerId <= 0) {
    return { error: 'Manager inválido.' }
  }

  if (!Number.isInteger(goals) || goals < 0) {
    return { error: 'Los goles deben ser un número entero igual o mayor que cero.' }
  }

  if (!Number.isInteger(assists) || assists < 0) {
    return { error: 'Las asistencias deben ser un número entero igual o mayor que cero.' }
  }

  try {
    const { supabase } = await getAuthenticatedProfile()
    const teamId = await getActiveTeamId()
    const { error } = await supabase.rpc('update_player_stats', {
      p_team_id: teamId,
      p_manager_id: managerId,
      p_goals: goals,
      p_assists: assists,
    })
    if (error) {
      if (error.code === '42501') return { error: 'Solo puedes editar tus propias estadísticas de jugador.' }
      if (error.message.includes('Player not found')) return { error: 'El Jugador no existe en este equipo.' }
      return { error: 'No se pudieron actualizar las estadísticas del Jugador.' }
    }

    revalidatePath('/')
    revalidatePath('/managers')

    return { success: true }
  } catch {
    return { error: 'No autorizado.' }
  }
}
export async function setManagerActive(formData: FormData) {
  const managerId = Number(formData.get('manager_id'))
  const isActive = formData.get('is_active')

  if (!Number.isInteger(managerId) || managerId <= 0) {
    return { error: 'Manager inválido.' }
  }

  if (isActive !== 'true' && isActive !== 'false') {
    return { error: 'Estado inválido.' }
  }

  try {
    const { supabase } = await requireAdmin()

    const { data: manager } = await supabase
      .from('managers')
      .select('profile_id')
      .eq('id', managerId)
      .maybeSingle()

    if (!manager) {
      return { error: 'El Manager no existe.' }
    }

    if (manager.profile_id) {
      return { error: 'Primero elimina la cuenta de usuario asociada.' }
    }

    const { data, error } = await supabase
      .from('managers')
      .update({
        is_active: isActive === 'true',
      })
      .eq('id', managerId)
      .select('id')
      .maybeSingle()

    if (error) {
      return { error: 'No se pudo actualizar el estado del manager.' }
    }

    if (!data) {
      return { error: 'El manager no existe.' }
    }

    revalidatePath('/')

    return { success: true }
  } catch {
    return { error: 'No autorizado.' }
  }
}
export async function deleteManager(formData: FormData) {
  const managerId = Number(formData.get('manager_id'))

  if (!Number.isInteger(managerId) || managerId <= 0) {
    return { error: 'Manager inválido.' }
  }

  try {
    const { supabase } = await requireAdmin()

    const { data, error } = await supabase
      .from('managers')
      .delete()
      .eq('id', managerId)
      .select('id')
      .maybeSingle()

    if (error) {
      return { error: 'No se pudo eliminar el manager.' }
    }

    if (!data) {
      return { error: 'El manager no existe.' }
    }

    revalidatePath('/')
    revalidatePath('/managers')

    return { success: true }
  } catch {
    return { error: 'No autorizado.' }
  }
}
