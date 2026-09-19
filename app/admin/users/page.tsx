import { AppSidebar } from '@/components/app-sidebar'
import { UserManagement } from '@/components/user-management'
import { getAuthenticatedProfile } from '@/lib/auth/require-permission'
import { getActiveTeamId } from '@/lib/teams/active-team'
import { createAdminClient } from '@/utils/supabase/admin'
import { PageHeading } from '@/components/page-heading'

export default async function AdminUsersPage() {
  const { profile, user } = await getAuthenticatedProfile()
  const teamId = await getActiveTeamId()
  const isAdmin = profile.role === 'admin'
  const canSendInvites = isAdmin || profile.can_send_invites
  const canManagePermissions = isAdmin || profile.can_manage_permissions
  const supabase = createAdminClient()
  const { data: members, error: membersError } = canManagePermissions
    ? await supabase.from('team_members').select('*').eq('team_id', teamId)
    : { data: [], error: null }
  if (membersError) throw new Error('No se pudieron cargar los miembros del equipo.')
  const result = canManagePermissions && members?.length
    ? await supabase
        .from('profiles')
        .select('id, email, display_name, role, can_manage_matches, can_edit_other_player_stats, can_view_other_manager_stats, can_send_invites, can_manage_seasons')
        .in('id', members.map(member => member.profile_id))
        .order('created_at')
    : { data: [], error: null }
  if (result.error) throw new Error('No se pudieron cargar los usuarios del equipo.')
  const profiles = (result.data ?? []).map(memberProfile => ({ ...memberProfile, ...members?.find(member => member.profile_id === memberProfile.id), can_manage_permissions: members?.find(member => member.profile_id === memberProfile.id)?.can_manage_permissions ?? false }))

  return (
    <div className="cp-workspace min-h-screen text-white md:flex">
      <AppSidebar />
      <main className="cp-main"><div className="cp-content">
        <PageHeading eyebrow="Dentro del equipo" title="Usuarios" description="Reúne a tu equipo. Gestiona invitaciones, cuentas y permisos." />
        <UserManagement profiles={profiles.map(member => ({ ...member, email: member.role === 'admin' ? '' : member.email }))} currentUserId={user.id} isAdmin={isAdmin} canManagePermissions={canManagePermissions} canSendInvites={canSendInvites} />
      </div></main>
    </div>
  )
}
