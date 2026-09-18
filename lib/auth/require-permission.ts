import { createClient } from '@/utils/supabase/server'

export type Permission =
  | 'can_manage_matches'
  | 'can_edit_other_player_stats'
  | 'can_view_other_manager_stats'
  | 'can_send_invites'
  | 'can_manage_seasons'

export async function getAuthenticatedProfile() {
  const supabase = await createClient()
  const { data: { user }, error: userError } = await supabase.auth.getUser()

  if (userError || !user) throw new Error('UNAUTHORIZED')

  const { data: aal, error: aalError } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel()
  if (aalError || aal?.currentLevel !== 'aal2') throw new Error('MFA_REQUIRED')

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id, role, can_edit_other_player_stats, can_manage_matches, can_manage_seasons, can_send_invites, can_view_other_manager_stats')
    .eq('id', user.id)
    .single()

  if (profileError || !profile) throw new Error('UNAUTHORIZED')

  return { supabase, user, profile }
}

export async function requirePermission(permission: Permission) {
  const { supabase, user, profile } = await getAuthenticatedProfile()
  if (profile.role !== 'admin' && !profile[permission]) throw new Error('FORBIDDEN')

  return { supabase, user, profile }
}
