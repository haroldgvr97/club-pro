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
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id, role, can_edit_other_player_stats, can_manage_matches, can_manage_seasons, can_send_invites, can_view_other_manager_stats')
    .eq('id', user.id)
    .single()

  if (profileError || !profile) throw new Error('UNAUTHORIZED')

  if (aalError || (profile.role === 'admin' && aal?.currentLevel !== 'aal2')) throw new Error('MFA_REQUIRED')

  if (profile.role === 'admin') return { supabase, user, profile: { ...profile, can_manage_permissions: true } }
  const { data: membership, error: membershipError } = await supabase
    .from('team_members')
    .select('can_manage_permissions, can_manage_matches, can_edit_other_player_stats, can_view_other_manager_stats, can_send_invites, can_manage_seasons')
    .eq('profile_id', user.id).order('team_id').limit(1).maybeSingle()
  if (membershipError) throw new Error('PERMISSIONS_UNAVAILABLE')
  return { supabase, user, profile: { ...profile,
    can_manage_permissions: membership?.can_manage_permissions ?? false,
    can_manage_matches: membership?.can_manage_matches ?? false,
    can_edit_other_player_stats: membership?.can_edit_other_player_stats ?? false,
    can_view_other_manager_stats: membership?.can_view_other_manager_stats ?? false,
    can_send_invites: membership?.can_send_invites ?? false,
    can_manage_seasons: membership?.can_manage_seasons ?? false,
  } }
}

export async function requirePermission(permission: Permission) {
  const { supabase, user, profile } = await getAuthenticatedProfile()
  if (profile.role !== 'admin' && !profile[permission]) throw new Error('FORBIDDEN')

  return { supabase, user, profile }
}
