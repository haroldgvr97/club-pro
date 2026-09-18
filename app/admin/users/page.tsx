import { AppSidebar } from '@/components/app-sidebar'
import { UserManagement } from '@/components/user-management'
import { getAuthenticatedProfile } from '@/lib/auth/require-permission'
import { createAdminClient } from '@/utils/supabase/admin'

export default async function AdminUsersPage() {
  const { profile } = await getAuthenticatedProfile()
  const isAdmin = profile.role === 'admin'
  const canSendInvites = isAdmin || profile.can_send_invites
  const profiles = isAdmin
    ? (await createAdminClient()
        .from('profiles')
        .select('id, email, display_name, role, can_manage_matches, can_edit_other_player_stats, can_view_other_manager_stats, can_send_invites, can_manage_seasons')
        .order('created_at')).data ?? []
    : []

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
