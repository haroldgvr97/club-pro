import { AppSidebar } from '@/components/app-sidebar'
import { getDashboardData } from '@/lib/data/get-dashboard-data'

export default async function ManagersPage() {
  const { managers } = await getDashboardData()

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

          <section className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900">
            {managers.length === 0 ? (
              <div className="px-6 py-12 text-center text-sm text-zinc-400">
                Todavía no hay managers registrados.
              </div>
            ) : (
              <div className="divide-y divide-zinc-800">
                {managers.map((manager) => (
                  <div
                    key={manager.id}
                    className="flex items-center justify-between px-5 py-4"
                  >
                    <div>
                      <p className="font-medium">{manager.name}</p>
                      <p className="text-sm text-zinc-500">
                        ID: {manager.id}
                      </p>
                    </div>

                    <span className="text-sm text-zinc-400">
                      {manager.is_active ? 'Activo' : 'Inactivo'}
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
