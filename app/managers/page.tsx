import { AppSidebar } from '@/components/app-sidebar'
import { CreateManagerForm } from '@/components/create-manager-form'
import { StatisticsDashboard } from '@/components/statistics-dashboard'
import { getDashboardData } from '@/lib/data/get-dashboard-data'

export default async function ManagersPage() {
  const { managers, matches } = await getDashboardData()

  return (
    <div className="min-h-screen bg-zinc-950 text-white md:flex">
      <AppSidebar />

      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-6 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Estadísticas</h1>
            <p className="mt-1 text-sm text-zinc-400">
              Resultados de Managers y estadísticas de Jugadores
            </p>
          </div>

          <section className="mb-8 rounded-xl border border-zinc-800 bg-zinc-900 p-5">
            <h2 className="mb-4 text-lg font-semibold">
              Agregar Manager/Jugador
            </h2>

            <CreateManagerForm />
          </section>

          <StatisticsDashboard managers={managers} matches={matches} />
        </div>
      </main>
    </div>
  )
}
