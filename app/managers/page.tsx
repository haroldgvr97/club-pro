import { AppSidebar } from '@/components/app-sidebar'
import { CreateManagerForm } from '@/components/create-manager-form'
import { DeleteManagerButton } from '@/components/delete-manager-button'
import { EditManagerForm } from '@/components/edit-manager-form'
import { ManagerStatusButton } from '@/components/manager-status-button'
import { getDashboardData } from '@/lib/data/get-dashboard-data'
import { getManagerPlayerStats } from '@/lib/stats/manager-player'

export default async function ManagersPage() {
  const { managers, matches } = await getDashboardData()

  return (
    <div className="min-h-screen bg-zinc-950 text-white md:flex">
      <AppSidebar />

      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-6 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Managers</h1>
            <p className="mt-1 text-sm text-zinc-400">
              Personas que han dirigido al equipo
            </p>
          </div>

          <section className="mb-8 rounded-xl border border-zinc-800 bg-zinc-900 p-5">
            <h2 className="mb-4 text-lg font-semibold">
              Agregar manager
            </h2>

            <CreateManagerForm />
          </section>

          <section className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900">
            {managers.length === 0 ? (
              <div className="px-6 py-12 text-center text-sm text-zinc-400">
                Todavía no hay managers registrados.
              </div>
            ) : (
              <div className="divide-y divide-zinc-800">
                {managers.map((manager) => {
                  const stats = getManagerPlayerStats(
                    matches,
                    manager.id,
                    manager.goals,
                    manager.assists
                  )

                  return (
                  <div
                    key={manager.id}
                    className="flex flex-col gap-4 px-5 py-4"
                  >
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                      <div>
                        <p className="font-medium">{manager.name}</p>
                        <p className="text-sm text-zinc-500">
                          {manager.is_active ? 'Activo' : 'Inactivo'}
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-3">
                        <ManagerStatusButton
                          managerId={manager.id}
                          isActive={manager.is_active}
                        />

                        <DeleteManagerButton
                          managerId={manager.id}
                        />
                      </div>
                    </div>

                    <section
                      aria-label={`Estadísticas como jugador de ${manager.name}`}
                      className="rounded-lg border border-zinc-800 bg-zinc-950 p-4"
                    >
                      <div className="mb-3 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                        <h2 className="font-medium">Estadísticas como jugador</h2>
                        <p className="text-xs text-zinc-500">
                          Goles y asistencias se editan abajo.
                        </p>
                      </div>
                      <dl className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
                        <div>
                          <dt className="text-xs text-zinc-400">Partidos jugados</dt>
                          <dd className="mt-1 text-xl font-semibold">{stats.played}</dd>
                        </div>
                        <div>
                          <dt className="text-xs text-zinc-400">Goles</dt>
                          <dd className="mt-1 text-xl font-semibold text-emerald-400">{stats.goals}</dd>
                        </div>
                        <div>
                          <dt className="text-xs text-zinc-400">Asistencias</dt>
                          <dd className="mt-1 text-xl font-semibold text-sky-400">{stats.assists}</dd>
                        </div>
                        <div>
                          <dt className="text-xs text-zinc-400">Goles por partido</dt>
                          <dd className="mt-1 text-xl font-semibold">{stats.goalsPerGame}</dd>
                        </div>
                        <div>
                          <dt className="text-xs text-zinc-400">Participaciones de gol</dt>
                          <dd className="mt-1 text-xl font-semibold">{stats.goalContributions}</dd>
                        </div>
                        <div>
                          <dt className="text-xs text-zinc-400">Participaciones por partido</dt>
                          <dd className="mt-1 text-xl font-semibold">{stats.contributionsPerGame}</dd>
                        </div>
                      </dl>
                    </section>

                    <EditManagerForm
                      managerId={manager.id}
                      currentName={manager.name}
                      goals={manager.goals}
                      assists={manager.assists}
                    />
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
