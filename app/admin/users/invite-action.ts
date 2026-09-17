'use server'

import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin'

export async function inviteUserV2(formData: FormData) {
  const email = formData.get('email')

  if (typeof email !== 'string' || !email.trim()) {
    return { error: 'Correo inválido.' }
  }

  const supabase = await createClient()

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    return { error: 'Sesión no válida.' }
  }

  const { data: aal } =
    await supabase.auth.mfa.getAuthenticatorAssuranceLevel()

  if (aal?.currentLevel !== 'aal2') {
    return { error: 'Se requiere verificación 2FA.' }
  }

  const admin = createAdminClient()

  const { data: profile, error: profileError } = await admin
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profileError || profile?.role !== 'admin') {
    return { error: 'No autorizado como administrador.' }
  }

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
