import { AppSidebar } from '@/components/app-sidebar'
import { getDashboardData } from '@/lib/data/get-dashboard-data'
import { getMatchResult } from '@/lib/matches/result'

type SearchParams = Promise<{
  rival?: string
  manager?: string
}>

export default async function OpponentsPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const [{ rival = '', manager = '' }, { matches, managers }] = await Promise.all([
    searchParams,
    getDashboardData(),
  ])

  const normalizedRival = rival.trim().toLocaleLowerCase('es')
  const managerId = Number(manager)
  const filteredMatches = matches.filter((match) => {
    const matchesRival =
      !normalizedRival ||
      (match.opponents?.name ?? '').toLocaleLowerCase('es').includes(normalizedRival)
    const matchesManager =
      !Number.isInteger(managerId) || managerId <= 0 || match.manager_id === managerId

    return matchesRival && matchesManager
  })

  return (
    <div className="min-h-screen bg-zinc-950 text-white md:flex">
      <AppSidebar />

      <main className="min-w-0 flex-1">
        <div className="mx-auto max-w-7xl px-6 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Rivales</h1>
            <p className="mt-1 text-sm text-zinc-400">
              Historial de partidos contra cada equipo rival
            </p>
          </div>

          <section className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900">
            <form className="grid gap-4 border-b border-zinc-800 p-5 sm:grid-cols-[1fr_1fr_auto_auto]">
              <label className="text-sm text-zinc-300">
                <span className="mb-1 block">Nombre del rival</span>
                <input
                  name="rival"
                  type="search"
                  defaultValue={rival}
                  placeholder="Ej.: FC Barcelona"
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2"
                />
              </label>

              <label className="text-sm text-zinc-300">
                <span className="mb-1 block">Manager</span>
                <select
                  name="manager"
                  defaultValue={manager}
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2"
                >
                  <option value="">Todos los managers</option>
                  {managers.map((currentManager) => (
                    <option key={currentManager.id} value={currentManager.id}>
                      {currentManager.name}
                    </option>
                  ))}
                </select>
              </label>

              <button
                type="submit"
                className="self-end rounded-lg bg-white px-4 py-2 text-sm font-medium text-black"
              >
                Filtrar
              </button>

              <a
                href="/opponents"
                className="self-end rounded-lg border border-zinc-700 px-4 py-2 text-center text-sm hover:bg-zinc-800"
              >
                Limpiar
              </a>
            </form>

            {matches.length === 0 ? (
              <div className="px-6 py-12 text-center text-sm text-zinc-400">
                Todavía no hay partidos registrados. Los rivales aparecerán aquí cuando registres un partido.
              </div>
            ) : filteredMatches.length === 0 ? (
              <div className="px-6 py-12 text-center text-sm text-zinc-400">
                No hay partidos que coincidan con estos filtros.
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
                    {filteredMatches.map((match) => {
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
