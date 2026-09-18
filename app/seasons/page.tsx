import { ActivateSeasonButton } from '@/components/activate-season-button'
import { AppSidebar } from '@/components/app-sidebar'
import { CreateSeasonForm } from '@/components/create-season-form'
import { DeleteSeasonButton } from '@/components/delete-season-button'
import { EditSeasonForm } from '@/components/edit-season-form'
import { getDashboardData } from '@/lib/data/get-dashboard-data'
import { getMatchResult } from '@/lib/matches/result'

export default async function SeasonsPage() {
  const { seasons, matches } = await getDashboardData()

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
            <h2 className="mb-4 text-lg font-semibold">
              Agregar temporada
            </h2>

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
                        <ActivateSeasonButton
                          seasonId={season.id}
                          isActive={season.is_active}
                        />

                        <DeleteSeasonButton
                          seasonId={season.id}
                        />
                      </div>
                    </div>

                    <EditSeasonForm
                      seasonId={season.id}
                      currentName={season.name}
                      startDate={season.start_date}
                      endDate={season.end_date}
                    />

                    <details open className="rounded-lg border border-zinc-800 bg-zinc-950">
                      <summary className="cursor-pointer px-4 py-3 text-sm font-medium">
                        Partidos de {season.name} ({seasonMatches.length})
                      </summary>

                      {seasonMatches.length === 0 ? (
                        <p className="border-t border-zinc-800 px-4 py-5 text-sm text-zinc-400">
                          Todavía no hay partidos registrados en esta temporada.
                        </p>
                      ) : (
                        <div className="overflow-x-auto border-t border-zinc-800">
                          <table className="w-full min-w-[650px] text-left text-sm">
                            <thead className="bg-zinc-900 text-xs uppercase text-zinc-400">
                              <tr>
                                <th className="px-4 py-3 font-medium">Rival</th>
                                <th className="px-4 py-3 font-medium">Fecha</th>
                                <th className="px-4 py-3 font-medium">Resultado</th>
                                <th className="px-4 py-3 font-medium">Manager</th>
                                <th className="px-4 py-3 font-medium">Estado</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-800">
                              {seasonMatches.map((match) => {
                                const result = getMatchResult(
                                  match.our_goals,
                                  match.opponent_goals
                                )
                                const label =
                                  result === 'win'
                                    ? 'Victoria'
                                    : result === 'draw'
                                      ? 'Empate'
                                      : 'Derrota'
                                const color =
                                  result === 'win'
                                    ? 'text-emerald-400'
                                    : result === 'draw'
                                      ? 'text-amber-400'
                                      : 'text-red-400'

                                return (
                                  <tr key={match.id}>
                                    <td className="px-4 py-3 font-medium">
                                      {match.opponents?.name ?? 'Rival'}
                                    </td>
                                    <td className="whitespace-nowrap px-4 py-3 text-zinc-400">
                                      {new Date(match.played_at).toLocaleString('es-ES')}
                                    </td>
                                    <td className="whitespace-nowrap px-4 py-3 text-lg font-semibold">
                                      {match.our_goals} - {match.opponent_goals}
                                    </td>
                                    <td className="px-4 py-3">
                                      {match.managers?.name ?? 'Sin manager'}
                                    </td>
                                    <td className={`px-4 py-3 font-medium ${color}`}>
                                      {label}
                                    </td>
                                  </tr>
                                )
                              })}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </details>
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
