import { AppSidebar } from '@/components/app-sidebar'
import { UserManagement } from '@/components/user-management'
import { getAuthenticatedProfile } from '@/lib/auth/require-permission'
import { getActiveTeamId } from '@/lib/teams/active-team'

export default async function AdminUsersPage() {
  const { profile, supabase } = await getAuthenticatedProfile()
  const teamId = await getActiveTeamId()
  const isAdmin = profile.role === 'admin'
  const canSendInvites = isAdmin || profile.can_send_invites
  const { data: members, error: membersError } = await supabase.from('team_members').select('profile_id').eq('team_id', teamId)
  if (membersError) throw new Error('No se pudieron cargar los miembros del equipo.')
  const result = isAdmin && members?.length
    ? await supabase
        .from('profiles')
        .select('id, email, display_name, role, can_manage_matches, can_edit_other_player_stats, can_view_other_manager_stats, can_send_invites, can_manage_seasons')
        .in('id', members.map(member => member.profile_id))
        .order('created_at')
    : { data: [], error: null }
  if (result.error) throw new Error('No se pudieron cargar los usuarios del equipo.')
  const profiles = result.data ?? []

  return (
    <div className="min-h-screen bg-zinc-950 text-white md:flex">
      <AppSidebar />
      <main className="flex-1"><div className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-8"><h1 className="text-3xl font-bold">Usuarios</h1><p className="mt-1 text-sm text-zinc-400">Invitaciones, cuentas y permisos</p></div>
        <UserManagement profiles={profiles} canManagePermissions={isAdmin} canSendInvites={canSendInvites} />
      </div></main>
    </div>
  )
}
