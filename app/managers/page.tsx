import { AppSidebar } from '@/components/app-sidebar'
import { CreateManagerForm } from '@/components/create-manager-form'
import { DeleteManagerButton } from '@/components/delete-manager-button'
import { EditManagerForm } from '@/components/edit-manager-form'
import { ManagerStatusButton } from '@/components/manager-status-button'
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
                {managers.map((manager) => (
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

                    <EditManagerForm
                      managerId={manager.id}
                      currentName={manager.name}
                    />
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
