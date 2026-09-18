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
