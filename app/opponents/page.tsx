import { AppSidebar } from '@/components/app-sidebar'
import { CreateOpponentForm } from '@/components/create-opponent-form'
import { DeleteOpponentButton } from '@/components/delete-opponent-button'
import { EditOpponentForm } from '@/components/edit-opponent-form'
import { getDashboardData } from '@/lib/data/get-dashboard-data'

export default async function OpponentsPage() {
  const { opponents } = await getDashboardData()

  return (
    <div className="min-h-screen bg-zinc-950 text-white md:flex">
      <AppSidebar />

      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-6 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Rivales</h1>
            <p className="mt-1 text-sm text-zinc-400">
              Equipos rivales registrados
            </p>
          </div>

          <section className="mb-8 rounded-xl border border-zinc-800 bg-zinc-900 p-5">
            <h2 className="mb-4 text-lg font-semibold">
              Agregar rival
            </h2>

            <CreateOpponentForm />
          </section>

          <section className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900">
            {opponents.length === 0 ? (
              <div className="px-6 py-12 text-center text-sm text-zinc-400">
                Todavía no hay rivales registrados.
              </div>
            ) : (
              <div className="divide-y divide-zinc-800">
                {opponents.map((opponent) => (
                  <div
                    key={opponent.id}
                    className="flex flex-col gap-4 px-5 py-4"
                  >
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                      <div>
                        <p className="font-medium">{opponent.name}</p>
                        <p className="text-sm text-zinc-500">
                          ID: {opponent.id}
                        </p>
                      </div>

                      <DeleteOpponentButton
                        opponentId={opponent.id}
                      />
                    </div>

                    <EditOpponentForm
                      opponentId={opponent.id}
                      currentName={opponent.name}
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
