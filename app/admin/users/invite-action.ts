'use server'

import { requirePermission } from '@/lib/auth/require-permission'
import { createAdminClient } from '@/utils/supabase/admin'
import { getActiveTeamId } from '@/lib/teams/active-team'

export async function inviteUserV2(formData: FormData) {
  const email = formData.get('email')

  if (typeof email !== 'string' || !email.trim()) {
    return { error: 'Correo inválido.' }
  }

  try {
    const { supabase } = await requirePermission('can_send_invites')
    const teamId = await getActiveTeamId()

    const admin = createAdminClient()
    const { data: inviteData, error: inviteError } =
      await admin.auth.admin.inviteUserByEmail(
        email.trim().toLowerCase(),
        { redirectTo: 'http://localhost:3000/auth/callback' }
      )

    if (inviteError || !inviteData.user) {
      return { error: `Error al invitar: ${inviteError?.message ?? 'Usuario inválido.'}` }
    }

    const { error: memberError } = await supabase
      .from('team_members')
      .insert({ team_id: teamId, profile_id: inviteData.user.id })
    if (memberError) return { error: 'La invitación se creó, pero no se pudo asociar al equipo.' }
  } catch {
    return { error: 'No autorizado para enviar invitaciones.' }
  }

  return { success: true }
}
