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
              <p className="mt-2 text-3xl font-bold">{stats.summary.played}</p>
            </div>

            <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
              <p className="text-sm text-zinc-400">Victorias</p>
              <p className="mt-2 text-3xl font-bold">{stats.summary.wins}</p>
            </div>

            <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
              <p className="text-sm text-zinc-400">Empates</p>
              <p className="mt-2 text-3xl font-bold">{stats.summary.draws}</p>
            </div>

            <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
              <p className="text-sm text-zinc-400">Derrotas</p>
              <p className="mt-2 text-3xl font-bold">{stats.summary.losses}</p>
            </div>
          </section>

          <section className="mt-8 rounded-xl border border-zinc-800 bg-zinc-900">
            <div className="border-b border-zinc-800 px-5 py-4">
              <h2 className="text-lg font-semibold">Últimos partidos</h2>
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
      </main>
    </div>
  )
}
