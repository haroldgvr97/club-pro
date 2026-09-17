'use server'

import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin'

export async function inviteUser(formData: FormData) {
  const email = formData.get('email')

  if (typeof email !== 'string' || !email.trim()) {
    return { error: 'Correo inválido.' }
  }

  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

	if (!user) {
 	 return { error: 'ERROR_SESSION' }
	}

  const { data: aal } =
    await supabase.auth.mfa.getAuthenticatorAssuranceLevel()

  if (aal?.currentLevel !== 'aal2') {
    return { error: 'Se requiere verificación 2FA.' }
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
	return { error: 'ERROR_ADMIN_ROLE' }
  }

  const admin = createAdminClient()

  const { error } = await admin.auth.admin.inviteUserByEmail(
    email.trim().toLowerCase(),
    {
      redirectTo: 'http://localhost:3000/auth/callback',
    }
  )

  if (error) {
    return { error: 'No se pudo enviar la invitación.' }
  }

  return { success: true }
}

