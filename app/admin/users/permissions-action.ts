'use server'

import { revalidatePath } from 'next/cache'
import { requireAdmin } from '@/lib/auth/require-admin'
import { createAdminClient } from '@/utils/supabase/admin'

export async function updateUserPermissions(formData: FormData) {
  const userId = formData.get('user_id')
  if (typeof userId !== 'string' || !userId) return { error: 'Usuario inválido.' }
  try {
    await requireAdmin()
    const permissions = {
      can_manage_matches: formData.get('can_manage_matches') === 'on',
      can_edit_other_player_stats: formData.get('can_edit_other_player_stats') === 'on',
      can_view_other_manager_stats: formData.get('can_view_other_manager_stats') === 'on',
      can_send_invites: formData.get('can_send_invites') === 'on',
      can_manage_seasons: formData.get('can_manage_seasons') === 'on',
    }
    const { error } = await createAdminClient().from('profiles').update(permissions).eq('id', userId)
    if (error) return { error: 'No se pudieron actualizar los permisos.' }
    revalidatePath('/admin/users')
    return { success: true }
  } catch {
    return { error: 'No autorizado.' }
  }
}

export async function updateUserName(formData: FormData) {
  const userId = formData.get('user_id')
  const displayName = formData.get('display_name')
  const cleanName = typeof displayName === 'string' ? displayName.trim() : ''
  if (typeof userId !== 'string' || !userId || !cleanName || cleanName.length > 50) {
    return { error: 'El nombre debe contener entre 1 y 50 caracteres.' }
  }

  try {
    await requireAdmin()
    const admin = createAdminClient()
    const { error: managerError } = await admin
      .from('managers')
      .update({ name: cleanName })
      .eq('profile_id', userId)
    if (managerError) {
      if (managerError.code === '23505') return { error: 'Ya existe un Manager/Jugador con ese nombre.' }
      return { error: 'No se pudo actualizar el Manager/Jugador.' }
    }
    const { error } = await admin
      .from('profiles')
      .update({ display_name: cleanName })
      .eq('id', userId)
    if (error) return { error: 'No se pudo actualizar el nombre.' }
    revalidatePath('/admin/users')
    revalidatePath('/managers')
    return { success: true }
  } catch {
    return { error: 'No autorizado.' }
  }
}

export async function deleteUser(formData: FormData) {
  const userId = formData.get('user_id')
  if (typeof userId !== 'string' || !userId) return { error: 'Usuario inválido.' }
  try {
    const { user } = await requireAdmin()
    if (user.id === userId) return { error: 'No puedes eliminar tu propia cuenta administradora.' }
    const { error } = await createAdminClient().auth.admin.deleteUser(userId)
    if (error) return { error: 'No se pudo eliminar el usuario.' }
    revalidatePath('/admin/users')
    revalidatePath('/managers')
    return { success: true }
  } catch {
    return { error: 'No autorizado.' }
  }
}

export async function deleteOrphanManager(formData: FormData) {
  const managerId = Number(formData.get('manager_id'))
  if (!Number.isInteger(managerId) || managerId <= 0) return { error: 'Manager inválido.' }
  try {
    await requireAdmin()
    const admin = createAdminClient()
    const { data: manager, error: lookupError } = await admin
      .from('managers')
      .select('profile_id')
      .eq('id', managerId)
      .maybeSingle()
    if (lookupError || !manager || manager.profile_id) {
      return { error: 'Este Manager todavía pertenece a un usuario.' }
    }
    const { error } = await admin.from('managers').delete().eq('id', managerId)
    if (error?.code === '23503') {
      return { error: 'No se puede eliminar porque tiene partidos históricos asociados.' }
    }
    if (error) return { error: 'No se pudo eliminar el Manager.' }
    revalidatePath('/admin/users')
    return { success: true }
  } catch {
    return { error: 'No autorizado.' }
  }
}
