import { logout } from './logout-action'

import { AppSidebar } from '@/components/app-sidebar'
import { getDashboardData } from '@/lib/data/get-dashboard-data'
import { getDashboardStats } from '@/lib/stats/get-dashboard-stats'

export default async function Home() {
  const [data, stats] = await Promise.all([
    getDashboardData(),
    getDashboardStats(),
  ])

  const recentMatches = data.matches.slice(0, 5)

  const winRate =
    stats.summary.played > 0
      ? Number(
          ((stats.summary.wins / stats.summary.played) * 100).toFixed(1)
        )
      : 0

  const managerNames = new Map(
    data.managers.map((manager) => [manager.id, manager.name])
  )

  const managerStats = [...stats.managers]
    .sort((a, b) => b.played - a.played)
    .slice(0, 5)

  return (
    <div className="min-h-screen bg-zinc-950 text-white md:flex">
      <AppSidebar />

      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-6 py-8">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Dashboard</h1>
              <p className="mt-1 text-sm text-zinc-400">
                Resumen general del club
              </p>
            </div>

            <form action={logout}>
              <button
                type="submit"
                className="rounded-lg border border-zinc-700 px-4 py-2 text-sm hover:bg-zinc-900"
              >
                Cerrar sesión
              </button>
            </form>
          </div>

          <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
              <p className="text-sm text-zinc-400">Partidos</p>
              <p className="mt-2 text-3xl font-bold">
                {stats.summary.played}
              </p>
            </div>

            <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
              <p className="text-sm text-zinc-400">Victorias</p>
              <p className="mt-2 text-3xl font-bold">
                {stats.summary.wins}
              </p>
            </div>

            <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
              <p className="text-sm text-zinc-400">Win rate</p>
              <p className="mt-2 text-3xl font-bold">
                {winRate}%
              </p>
            </div>

            <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
              <p className="text-sm text-zinc-400">Diferencia de gol</p>
              <p className="mt-2 text-3xl font-bold">
                {stats.summary.goalDifference > 0 ? '+' : ''}
                {stats.summary.goalDifference}
              </p>
            </div>
          </section>

          <section className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
              <p className="text-sm text-zinc-400">Empates</p>
              <p className="mt-2 text-2xl font-bold">
                {stats.summary.draws}
              </p>
            </div>

            <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
              <p className="text-sm text-zinc-400">Derrotas</p>
              <p className="mt-2 text-2xl font-bold">
                {stats.summary.losses}
              </p>
            </div>

            <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
              <p className="text-sm text-zinc-400">Goles a favor</p>
              <p className="mt-2 text-2xl font-bold">
                {stats.summary.goalsFor}
              </p>
            </div>

            <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
              <p className="text-sm text-zinc-400">Goles en contra</p>
              <p className="mt-2 text-2xl font-bold">
                {stats.summary.goalsAgainst}
              </p>
            </div>
          </section>

          <div className="mt-8 grid gap-8 xl:grid-cols-2">
            <section className="rounded-xl border border-zinc-800 bg-zinc-900">
              <div className="border-b border-zinc-800 px-5 py-4">
                <h2 className="text-lg font-semibold">
                  Rendimiento por manager
                </h2>
              </div>

              {managerStats.length === 0 ? (
                <div className="px-5 py-10 text-center text-sm text-zinc-400">
                  Todavía no hay estadísticas de managers.
                </div>
              ) : (
                <div className="divide-y divide-zinc-800">
                  {managerStats.map((manager) => (
                    <div
                      key={manager.managerId}
                      className="px-5 py-4"
                    >
                      <div className="flex items-center justify-between gap-4">
                        <p className="font-medium">
                          {managerNames.get(manager.managerId) ?? 'Manager'}
                        </p>
                        <div className="text-right">
                          <p className="font-semibold">{manager.winRate}%</p>
                          <p className="text-xs text-zinc-500">Win rate</p>
                        </div>
                      </div>

                      <dl className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                        <div className="rounded-lg bg-zinc-950 p-3">
                          <dt className="text-xs text-zinc-400">Partidos jugados</dt>
                          <dd className="mt-1 text-xl font-semibold">{manager.played}</dd>
                        </div>
                        <div className="rounded-lg bg-zinc-950 p-3">
                          <dt className="text-xs text-zinc-400">Ganados</dt>
                          <dd className="mt-1 text-xl font-semibold text-emerald-400">{manager.wins}</dd>
                        </div>
                        <div className="rounded-lg bg-zinc-950 p-3">
                          <dt className="text-xs text-zinc-400">Perdidos</dt>
                          <dd className="mt-1 text-xl font-semibold text-red-400">{manager.losses}</dd>
                        </div>
                        <div className="rounded-lg bg-zinc-950 p-3">
                          <dt className="text-xs text-zinc-400">Empatados</dt>
                          <dd className="mt-1 text-xl font-semibold text-amber-400">{manager.draws}</dd>
                        </div>
                      </dl>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section className="rounded-xl border border-zinc-800 bg-zinc-900">
              <div className="border-b border-zinc-800 px-5 py-4">
                <h2 className="text-lg font-semibold">
                  Últimos partidos
                </h2>
              </div>

              {recentMatches.length === 0 ? (
                <div className="px-5 py-10 text-center text-sm text-zinc-400">
                  Todavía no hay partidos registrados.
                </div>
              ) : (
                <div className="divide-y divide-zinc-800">
                  {recentMatches.map((match) => (
                    <div
                      key={match.id}
                      className="flex items-center justify-between gap-4 px-5 py-4"
                    >
                      <div>
                        <p className="font-medium">
                          vs {match.opponents?.name ?? 'Rival'}
                        </p>
                        <p className="text-sm text-zinc-400">
                          Manager: {match.managers?.name ?? 'Sin manager'}
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="text-lg font-bold">
                          {match.our_goals} - {match.opponent_goals}
                        </p>
                        <p className="text-xs text-zinc-500">
                          {match.seasons?.name ?? 'Sin temporada'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        </div>
      </main>
    </div>
  )
}
