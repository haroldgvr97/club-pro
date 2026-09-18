'use server'

import { requirePermission } from '@/lib/auth/require-permission'
import { createAdminClient } from '@/utils/supabase/admin'

export async function inviteUserV2(formData: FormData) {
  const email = formData.get('email')

  if (typeof email !== 'string' || !email.trim()) {
    return { error: 'Correo inválido.' }
  }

  try {
    await requirePermission('can_send_invites')
  } catch {
    return { error: 'No autorizado para enviar invitaciones.' }
  }

  const admin = createAdminClient()

  const { error: inviteError } =
    await admin.auth.admin.inviteUserByEmail(
      email.trim().toLowerCase(),
      {
        redirectTo: 'http://localhost:3000/auth/callback',
      }
    )

  if (inviteError) {
    return { error: `Error al invitar: ${inviteError.message}` }
  }

  return { success: true }
}
