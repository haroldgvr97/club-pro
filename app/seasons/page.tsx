import { AppSidebar } from '@/components/app-sidebar'
import { getDashboardData } from '@/lib/data/get-dashboard-data'

export default async function SeasonsPage() {
  const { seasons } = await getDashboardData()

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

          <section className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900">
            {seasons.length === 0 ? (
              <div className="px-6 py-12 text-center text-sm text-zinc-400">
                Todavía no hay temporadas registradas.
              </div>
            ) : (
              <div className="divide-y divide-zinc-800">
                {seasons.map((season) => (
                  <div
                    key={season.id}
                    className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <p className="font-medium">{season.name}</p>
                      <p className="text-sm text-zinc-500">
                        {season.start_date ?? 'Sin fecha de inicio'} -{' '}
                        {season.end_date ?? 'Sin fecha de fin'}
                      </p>
                    </div>

                    <span className="text-sm text-zinc-400">
                      {season.is_active ? 'Activa' : 'Inactiva'}
                    </span>
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
