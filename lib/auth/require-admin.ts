import { createClient } from '@/utils/supabase/server'

export async function requireAdmin() {
  const supabase = await createClient()

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    throw new Error('UNAUTHORIZED')
  }

  const { data: aal, error: aalError } =
    await supabase.auth.mfa.getAuthenticatorAssuranceLevel()

  if (aalError || aal?.currentLevel !== 'aal2') {
    throw new Error('MFA_REQUIRED')
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profileError || profile?.role !== 'admin') {
    throw new Error('ADMIN_REQUIRED')
  }

  return {
    supabase,
    user,
  }
}
