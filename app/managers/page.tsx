import { AppSidebar } from '@/components/app-sidebar'
import { StatisticsDashboard } from '@/components/statistics-dashboard'
import { getDashboardData } from '@/lib/data/get-dashboard-data'
import { getAuthenticatedProfile } from '@/lib/auth/require-permission'

export default async function ManagersPage() {
  const [{ managers, matches }, { user, profile }] = await Promise.all([
    getDashboardData(),
    getAuthenticatedProfile(),
  ])
  const visibleManagers = managers.filter(manager =>
    manager.can_view_stats && (profile.role !== 'admin' || manager.profile_id !== user.id)
  )

  return (
    <div className="min-h-screen bg-zinc-950 text-white md:flex">
      <AppSidebar />

      <main className="min-w-0 flex-1">
        <div className="mx-auto max-w-7xl px-6 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Estadísticas</h1>
            <p className="mt-1 text-sm text-zinc-400">
              Resultados de Managers y estadísticas de Jugadores
            </p>
          </div>

          <StatisticsDashboard
            managers={visibleManagers}
            matches={matches}
            viewerProfileId={user.id}
            canViewOtherManagers={
              profile.role === 'admin' || profile.can_view_other_manager_stats
            }
            canEditOtherPlayers={profile.role === 'admin'}
            isAdmin={profile.role === 'admin'}
          />
        </div>
      </main>
    </div>
  )
}
