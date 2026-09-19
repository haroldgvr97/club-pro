import { AppSidebar } from '@/components/app-sidebar'
import { StatisticsDashboard } from '@/components/statistics-dashboard'
import { getDashboardData } from '@/lib/data/get-dashboard-data'
import { getAuthenticatedProfile } from '@/lib/auth/require-permission'
import { PageHeading } from '@/components/page-heading'

export default async function ManagersPage() {
  const [{ managers, matches }, { user, profile }] = await Promise.all([
    getDashboardData(),
    getAuthenticatedProfile(),
  ])
  const visibleManagers = managers.filter(manager =>
    manager.can_view_stats && (profile.role !== 'admin' || manager.profile_id !== user.id)
  )

  return (
    <div className="cp-workspace min-h-screen text-white md:flex">
      <AppSidebar />

      <main className="cp-main">
        <div className="cp-content">
          <PageHeading eyebrow="El juego, en números" title="Estadísticas"
            description="El rendimiento de quienes dirigen. El impacto de quienes juegan." />

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
