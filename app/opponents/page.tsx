import { AppSidebar } from '@/components/app-sidebar'
import { getDashboardData } from '@/lib/data/get-dashboard-data'
import { getMatchResult } from '@/lib/matches/result'

export default async function OpponentsPage() {
  const { matches } = await getDashboardData()

  return (
    <div className="min-h-screen bg-zinc-950 text-white md:flex">
      <AppSidebar />

      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-6 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Rivales</h1>
            <p className="mt-1 text-sm text-zinc-400">
              Historial de partidos contra cada equipo rival
            </p>
          </div>

          <section className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900">
            {matches.length === 0 ? (
              <div className="px-6 py-12 text-center text-sm text-zinc-400">
                Todavía no hay partidos registrados. Los rivales aparecerán aquí cuando registres un partido.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[700px] text-left text-sm">
                  <thead className="border-b border-zinc-800 bg-zinc-950 text-xs uppercase text-zinc-400">
                    <tr>
                      <th className="px-5 py-3 font-medium">Rival</th>
                      <th className="px-5 py-3 font-medium">Fecha</th>
                      <th className="px-5 py-3 font-medium">Resultado</th>
                      <th className="px-5 py-3 font-medium">Manager</th>
                      <th className="px-5 py-3 font-medium">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800">
                    {matches.map((match) => {
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
                        <tr key={match.id} className="hover:bg-zinc-800/40">
                          <td className="px-5 py-4 font-medium">
                            {match.opponents?.name ?? 'Rival'}
                          </td>
                          <td className="whitespace-nowrap px-5 py-4 text-zinc-400">
                            {new Date(match.played_at).toLocaleString('es-ES')}
                          </td>
                          <td className="whitespace-nowrap px-5 py-4 text-lg font-semibold">
                            {match.our_goals} - {match.opponent_goals}
                          </td>
                          <td className="px-5 py-4">
                            {match.managers?.name ?? 'Sin manager'}
                          </td>
                          <td className={`px-5 py-4 font-medium ${color}`}>
                            {label}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  )
}
