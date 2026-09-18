import { AppSidebar } from '@/components/app-sidebar'
import { CreateMatchForm } from '@/components/create-match-form'
import { getDashboardData } from '@/lib/data/get-dashboard-data'
import { getMatchResult } from '@/lib/matches/result'

export default async function MatchesPage() {
  const {
    matches,
    seasons,
    managers,
    opponents,
  } = await getDashboardData()

  return (
    <div className="min-h-screen bg-zinc-950 text-white md:flex">
      <AppSidebar />

      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-6 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Partidos</h1>
            <p className="mt-1 text-sm text-zinc-400">
              Historial y registro de partidos
            </p>
          </div>

          <section className="mb-8 rounded-xl border border-zinc-800 bg-zinc-900 p-5">
            <h2 className="mb-4 text-lg font-semibold">
              Registrar partido
            </h2>

            <CreateMatchForm
              seasons={seasons.map((season) => ({
                id: season.id,
                name: season.name,
              }))}
              managers={managers
                .filter((manager) => manager.is_active)
                .map((manager) => ({
                  id: manager.id,
                  name: manager.name,
                }))}
              opponents={opponents.map((opponent) => ({
                id: opponent.id,
                name: opponent.name,
              }))}
            />
          </section>

          <section className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900">
            {matches.length === 0 ? (
              <div className="px-6 py-12 text-center text-sm text-zinc-400">
                Todavía no hay partidos registrados.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-zinc-800 text-zinc-400">
                    <tr>
                      <th className="px-5 py-4 font-medium">Fecha</th>
                      <th className="px-5 py-4 font-medium">Rival</th>
                      <th className="px-5 py-4 font-medium">Manager</th>
                      <th className="px-5 py-4 font-medium">Resultado</th>
                      <th className="px-5 py-4 font-medium">Marcador</th>
                      <th className="px-5 py-4 font-medium">Temporada</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-zinc-800">
                    {matches.map((match) => {
                      const result = getMatchResult(
                        match.our_goals,
                        match.opponent_goals
                      )

                      const resultLabel =
                        result === 'win'
                          ? 'Victoria'
                          : result === 'draw'
                            ? 'Empate'
                            : 'Derrota'

                      return (
                        <tr key={match.id}>
                          <td className="px-5 py-4 text-zinc-400">
                            {new Date(match.played_at).toLocaleDateString('es-ES')}
                          </td>

                          <td className="px-5 py-4 font-medium">
                            {match.opponents?.name ?? 'Rival'}
                          </td>

                          <td className="px-5 py-4 text-zinc-300">
                            {match.managers?.name ?? 'Sin manager'}
                          </td>

                          <td className="px-5 py-4">{resultLabel}</td>

                          <td className="px-5 py-4 font-bold">
                            {match.our_goals} - {match.opponent_goals}
                          </td>

                          <td className="px-5 py-4 text-zinc-400">
                            {match.seasons?.name ?? 'Sin temporada'}
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
