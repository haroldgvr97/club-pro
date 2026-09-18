import { ActivateSeasonButton } from '@/components/activate-season-button'
import { AppSidebar } from '@/components/app-sidebar'
import { CreateSeasonForm } from '@/components/create-season-form'
import { DeleteSeasonButton } from '@/components/delete-season-button'
import { EditSeasonForm } from '@/components/edit-season-form'
import { SeasonMatchHistory } from '@/components/season-match-history'
import { getDashboardData } from '@/lib/data/get-dashboard-data'

export default async function SeasonsPage() {
  const { seasons, matches, managers } = await getDashboardData()

  return (
    <div className="min-h-screen bg-zinc-950 text-white md:flex">
      <AppSidebar />

      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-6 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Temporadas</h1>
            <p className="mt-1 text-sm text-zinc-400">
              Historial y estado de las temporadas
            </p>
          </div>

          <section className="mb-8 rounded-xl border border-zinc-800 bg-zinc-900 p-5">
            <h2 className="mb-4 text-lg font-semibold">Agregar Temporada</h2>
            <CreateSeasonForm />
          </section>

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

                        <div className="flex flex-wrap items-center gap-3">
                          <ActivateSeasonButton seasonId={season.id} isActive={season.is_active} />
                          <DeleteSeasonButton seasonId={season.id} />
                        </div>
                      </div>

                      <EditSeasonForm seasonId={season.id} currentName={season.name}
                        startDate={season.start_date} endDate={season.end_date} />

                      <SeasonMatchHistory seasonName={season.name} matches={seasonMatches}
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
