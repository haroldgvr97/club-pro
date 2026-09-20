import { ActivateSeasonButton } from '@/components/activate-season-button'
import { AppSidebar } from '@/components/app-sidebar'
import { CreateSeasonForm } from '@/components/create-season-form'
import { DeleteSeasonButton } from '@/components/delete-season-button'
import { EditSeasonForm } from '@/components/edit-season-form'
import { SeasonMatchHistory } from '@/components/season-match-history'
import { getDashboardData } from '@/lib/data/get-dashboard-data'
import { getAuthenticatedProfile } from '@/lib/auth/require-permission'
import { PageHeading } from '@/components/page-heading'

export default async function SeasonsPage() {
  const [{ seasons, matches, managers, opponents }, { profile }] = await Promise.all([
    getDashboardData(),
    getAuthenticatedProfile(),
  ])
  const canManageSeasons = profile.role === 'admin' || profile.can_manage_seasons

  return (
    <div className="cp-workspace min-h-screen text-white md:flex">
      <AppSidebar />

      <main className="cp-main">
        <div className="cp-content">
          <PageHeading eyebrow="La historia de tu club" title="Temporadas"
            description="Cada temporada, un nuevo capítulo. Todos tus partidos en un lugar." />

          {canManageSeasons ? <section className="mb-8 rounded-xl border border-zinc-800 bg-zinc-900 p-5">
            <div className="cp-form-guide"><h2>Agregar temporada</h2></div>
            <CreateSeasonForm />
          </section>
          : null}

          <section className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900">
            {seasons.length === 0 ? (
              <div className="px-6 py-12 text-center text-sm text-zinc-400">
                Todavía no hay temporadas registradas.
              </div>
            ) : (
              <div className="divide-y divide-zinc-800">
                {seasons.map((season) => {
                  const seasonMatches = matches.filter(
                    (match) => match.season_id === season.id
                  )

                  return (
                    <div key={season.id} className="flex flex-col gap-4 px-5 py-4">
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                          <p className="font-medium">{season.name}</p>
                          <p className="text-sm text-zinc-500">
                            {season.start_date ?? 'Sin fecha de inicio'} -{' '}
                            {season.end_date ?? 'Sin fecha de fin'}
                          </p>
                        </div>

                        {canManageSeasons ? <div className="flex flex-wrap items-center gap-3">
                          <ActivateSeasonButton seasonId={season.id} isActive={season.is_active} />
                          <DeleteSeasonButton seasonId={season.id} />
                        </div> : null}
                      </div>

                      {canManageSeasons ? <EditSeasonForm seasonId={season.id} currentName={season.name}
                        startDate={season.start_date} endDate={season.end_date} /> : null}

                      <SeasonMatchHistory seasonName={season.name} matches={seasonMatches}
                        seasons={seasons.map(({ id, name }) => ({ id, name }))}
                        opponents={opponents.map(({ id, name }) => ({ id, name }))}
                        canManageMatches={profile.role === 'admin' || profile.can_manage_matches}
                        managers={managers.map((manager) => ({ id: manager.id, name: manager.name }))} />
                    </div>
                  )
                })}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  )
}
