import { AppSidebar } from '@/components/app-sidebar'
import { CreateMatchForm } from '@/components/create-match-form'
import { EditMatchForm } from '@/components/edit-match-form'
import { getDashboardData } from '@/lib/data/get-dashboard-data'
import { getMatchResult } from '@/lib/matches/result'
import { DeleteMatchButton } from '@/components/delete-match-button'
import { getAuthenticatedProfile } from '@/lib/auth/require-permission'
import { PageHeading } from '@/components/page-heading'

export default async function MatchesPage() {
  const {
    matches,
    seasons,
    managers,
    opponents,
  } = await getDashboardData()
  const { profile } = await getAuthenticatedProfile()
  const canManageMatches = profile.role === 'admin' || profile.can_manage_matches

  const seasonOptions = seasons.map((season) => ({
    id: season.id,
    name: season.name,
  }))

  const managerOptions = managers.map((manager) => ({
    id: manager.id,
    name: manager.name,
  }))

  const activeManagerOptions = managers
    .filter((manager) => manager.is_active)
    .map((manager) => ({
      id: manager.id,
      name: manager.name,
    }))

  const opponentOptions = opponents.map((opponent) => ({
    id: opponent.id,
    name: opponent.name,
  }))

  // Se conserva para poder volver a mostrar el historial en esta pantalla.
  const showRecentMatches = false

  return (
    <div className="cp-workspace min-h-screen text-white md:flex">
      <AppSidebar />

      <main className="cp-main">
        <div className="cp-content">
          <PageHeading eyebrow="En la cancha" title="Partidos"
            description="Cada partido cuenta. Registra tu equipo y guarda el resultado final." />

          {canManageMatches ? <section className="mb-8 rounded-xl border border-zinc-800 bg-zinc-900 p-5">
            <div className="cp-form-guide"><h2>Registrar partido</h2></div>

            <CreateMatchForm
              seasons={seasonOptions}
              managers={activeManagerOptions}
              opponents={opponentOptions}
              matches={matches}
            />
          </section>
          : <section className="mb-8 rounded-xl border border-zinc-800 bg-zinc-900 p-5 text-sm text-zinc-400">Puedes consultar la información de partidos, pero no tienes permiso para registrarlos o editarlos.</section>}

          {showRecentMatches && (
          <section className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900">
            {matches.length === 0 ? (
              <div className="px-6 py-12 text-center text-sm text-zinc-400">
                Todavía no hay partidos registrados.
              </div>
            ) : (
              <div className="divide-y divide-zinc-800">
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
                    <div
                      key={match.id}
                      className="flex flex-col gap-5 px-5 py-5"
                    >
                      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                        <div>
                          <p className="text-lg font-semibold">
                            vs {match.opponents?.name ?? 'Rival'}
                          </p>

                          <p className="text-sm text-zinc-400">
                            Manager: {match.managers?.name ?? 'Sin manager'}
                            {' · '}
                            {match.seasons?.name ?? 'Sin temporada'}
                          </p>

                          <p className="mt-1 text-xs text-zinc-500">
                            {new Date(match.played_at).toLocaleString('es-ES')}
                          </p>
                        </div>

                        <div className="text-left md:text-right">
                          <p className="text-2xl font-bold">
                            {match.our_goals} - {match.opponent_goals}
                          </p>

                          <p className="text-sm text-zinc-400">
                            {resultLabel}
                          </p>
                        </div>
                      </div>

                      <details className="rounded-lg border border-zinc-800 p-3">
                        <summary className="cursor-pointer text-sm text-zinc-400">Editar o eliminar partido</summary>
                        <div className="mt-4 space-y-3">
                      {match.manager_id !== null ? <EditMatchForm
                        matchId={match.id}
                        seasonId={match.season_id}
                        managerId={match.manager_id}
                        playerIds={match.match_players.map(player => player.player_id)}
                        opponentId={match.opponent_id}
                        ourGoals={match.our_goals}
                        opponentGoals={match.opponent_goals}
                        notes={match.notes}
                        playedAt={match.played_at}
                        seasons={seasonOptions}
                        managers={managerOptions}
                        opponents={opponentOptions}
                      /> : <p className="text-sm text-zinc-400">Este partido no tiene Manager asignado.</p>}
                          <DeleteMatchButton matchId={match.id} />
                        </div>
                      </details>
                    </div>
                  )
                })}
              </div>
            )}
          </section>
          )}
        </div>
      </main>
    </div>
  )
}
