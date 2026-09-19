'use server'

import { requirePermission } from '@/lib/auth/require-permission'
import { createAdminClient } from '@/utils/supabase/admin'
import { getActiveTeamId } from '@/lib/teams/active-team'
import { headers } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { getInviteRedirect } from '@/lib/auth/invite-url'

export async function inviteUserV2(formData: FormData) {
  const email = formData.get('email')

  if (typeof email !== 'string' || !email.trim()) {
    return { error: 'Correo inválido.' }
  }

  try {
    const { user } = await requirePermission('can_send_invites')
    const teamId = await getActiveTeamId()
    let redirectTo: string
    try {
      redirectTo = getInviteRedirect(process.env.NEXT_PUBLIC_APP_URL, (await headers()).get('origin'))
    } catch {
      return { error: 'La dirección de la web no está configurada para enviar invitaciones. Contacta al administrador.' }
    }

    const admin = createAdminClient()
    const { data: inviteData, error: inviteError } =
      await admin.auth.admin.inviteUserByEmail(
        email.trim().toLowerCase(),
        { redirectTo }
      )

    if (inviteError || !inviteData.user) {
      return { error: `Error al invitar: ${inviteError?.message ?? 'Usuario inválido.'}` }
    }

    const assignment = {
      p_team_id: teamId,
      p_user_id: inviteData.user.id,
      p_inviter_id: user.id,
    }
    let { error: memberError } = await admin.rpc('assign_invited_user_to_team', assignment)
    if (memberError) ({ error: memberError } = await admin.rpc('assign_invited_user_to_team', assignment))
    if (memberError) return { error: 'La invitación se creó, pero no se pudo asociar al equipo.' }
    revalidatePath('/admin/users')
  } catch {
    return { error: 'No autorizado para enviar invitaciones.' }
  }

  return { success: true }
}
