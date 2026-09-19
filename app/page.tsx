import Link from 'next/link'
import { logout } from './logout-action'
import { AppSidebar } from '@/components/app-sidebar'
import { DashboardGreeting } from '@/components/dashboard-greeting'
import { getDashboardData } from '@/lib/data/get-dashboard-data'
import { getDashboardStats } from '@/lib/stats/get-dashboard-stats'
import { getMatchResult } from '@/lib/matches/result'
import { createClient } from '@/utils/supabase/server'

export default async function Home() {
  const supabase = await createClient()
  const [{ data: authData }, data, stats] = await Promise.all([
    supabase.auth.getUser(), getDashboardData(), getDashboardStats(),
  ])
  const user = authData.user
  const { data: profile } = user
    ? await supabase.from('profiles').select('display_name, role').eq('id', user.id).maybeSingle()
    : { data: null }
  const displayName = profile?.display_name ?? user?.email?.split('@')[0] ?? 'jugador'
  const recentMatches = data.matches.slice(0, 5)
  const summary = stats.summary
  const winRate = summary.played > 0
    ? Number(((summary.wins / summary.played) * 100).toFixed(1)) : 0
  const managerNames = new Map(data.managers.map(manager => [manager.id, manager.name]))
  const managerStats = [...stats.managers]
    .filter(stat => data.managers.some(manager => manager.id === stat.managerId && manager.can_view_stats))
    .sort((a, b) => b.played - a.played).slice(0, 5)
  const activeSeason = data.seasons.find(season => season.is_active)
  const metrics = [
    { label: 'Partidos jugados', value: summary.played, caption: 'Cada partido es parte de tu historia', color: 'text-white' },
    { label: 'Victorias', value: summary.wins, caption: 'Partidos que terminaron a tu favor', color: 'text-emerald-400' },
    { label: 'Porcentaje de victorias', value: `${winRate}%`, caption: 'Victorias sobre partidos jugados', color: 'text-white' },
    { label: 'Diferencia de gol', value: `${summary.goalDifference > 0 ? '+' : ''}${summary.goalDifference}`, caption: 'Goles a favor menos goles en contra', color: 'text-cyan-400' },
  ]

  return (
    <div className="cp-workspace min-h-screen text-white md:flex">
      <AppSidebar />
      <main className="cp-main">
        <div className="cp-content">
          <header className="cp-page-header">
            <div>
              <p className="cp-eyebrow">Dashboard / Tu club, en perspectiva</p>
              <DashboardGreeting name={displayName} />
              <p>Tu equipo sigue escribiendo su historia.</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {profile?.role === 'admin' && <Link href="/teams" aria-label="Regresar a equipos" className="cp-button">← Equipos</Link>}
              <form action={logout}><button type="submit" className="cp-button">Cerrar sesión</button></form>
            </div>
          </header>

          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-xs font-medium tracking-widest text-zinc-400 uppercase">Balance del club</h2>
            {activeSeason && <span className="inline-flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-[10px] text-zinc-300"><span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />{activeSeason.name}</span>}
          </div>
          <section className="cp-metrics" aria-label="Resumen del club">
            {metrics.map((metric, index) => <div className="cp-metric" key={metric.label}>
              <p>{metric.label}</p><span className="cp-metric-index" aria-hidden="true">0{index + 1}</span>
              <p className={`cp-metric-value ${metric.color}`}>{metric.value}</p>
              <p className="cp-metric-caption">{metric.caption}</p>
              {index === 1 && <span className="cp-metric-line" aria-hidden="true" />}
            </div>)}
          </section>
          <dl className="cp-detail-metrics">
            <div><dt>Empates</dt><dd className="text-amber-300">{summary.draws}</dd></div>
            <div><dt>Derrotas</dt><dd className="text-red-400">{summary.losses}</dd></div>
            <div><dt>Goles a favor</dt><dd>{summary.goalsFor}</dd></div>
            <div><dt>Goles en contra</dt><dd>{summary.goalsAgainst}</dd></div>
          </dl>

          {summary.played > 0 && <section className="mt-7" aria-label="Distribución de resultados">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-3 text-[10px] text-zinc-400">
              <p className="tracking-widest uppercase">Así se reparten tus resultados</p>
              <div className="flex gap-4"><span className="text-emerald-400">Victorias</span><span className="text-amber-300">Empates</span><span className="text-red-400">Derrotas</span></div>
            </div>
            <div className="flex h-1.5 overflow-hidden rounded-full bg-zinc-800" aria-hidden="true">
              <span className="bg-emerald-400" style={{ width: `${summary.wins / summary.played * 100}%` }} />
              <span className="bg-amber-300" style={{ width: `${summary.draws / summary.played * 100}%` }} />
              <span className="bg-red-400" style={{ width: `${summary.losses / summary.played * 100}%` }} />
            </div>
          </section>}

          <div className="mt-8 grid gap-5 xl:grid-cols-2">
            <section className="cp-panel">
              <div className="cp-section-heading"><h2>Rendimiento por manager</h2><span>01 / EQUIPO</span></div>
              {managerStats.length === 0 ? <div className="cp-empty"><span className="cp-empty-mark" aria-hidden="true">↗</span><p>Las estadísticas comienzan con el primer partido.</p><Link href="/managers" className="text-xs text-emerald-400 hover:underline">Ver estadísticas →</Link></div>
                : <div className="divide-y divide-zinc-800">{managerStats.map(manager => <div key={manager.managerId} className="px-5 py-5">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex min-w-0 items-center gap-3"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-zinc-700 bg-zinc-900 text-xs font-medium text-zinc-300" aria-hidden="true">{(managerNames.get(manager.managerId) ?? 'M').slice(0, 2).toUpperCase()}</span><p className="truncate text-sm font-medium">{managerNames.get(manager.managerId) ?? 'Manager'}</p></div>
                    <div className="shrink-0 text-right"><p className="text-lg font-semibold tracking-tight">{manager.winRate}%</p><p className="text-[10px] text-zinc-500">Victorias</p></div>
                  </div>
                  <dl className="mt-4 grid grid-cols-4 gap-2">
                    {[{ label: 'Jugados', value: manager.played, color: 'text-white' }, { label: 'Ganados', value: manager.wins, color: 'text-emerald-400' }, { label: 'Perdidos', value: manager.losses, color: 'text-red-400' }, { label: 'Empatados', value: manager.draws, color: 'text-amber-300' }].map(item =>
                      <div key={item.label} className="rounded-lg bg-zinc-950 px-2 py-3 sm:px-3"><dt className="text-[10px] text-zinc-400">{item.label}</dt><dd className={`mt-1 text-xl font-semibold ${item.color}`}>{item.value}</dd></div>)}
                  </dl>
                </div>)}</div>}
            </section>

            <section className="cp-panel">
              <div className="cp-section-heading"><h2>Últimos partidos</h2><span>02 / HISTORIAL</span></div>
              {recentMatches.length === 0 ? <div className="cp-empty"><span className="cp-empty-mark" aria-hidden="true">—</span><p>La cancha está lista. Aún no hay partidos registrados.</p><Link href="/matches" className="text-xs text-emerald-400 hover:underline">Ir a partidos →</Link></div>
                : <div className="divide-y divide-zinc-800">{recentMatches.map(match => {
                  const result = getMatchResult(match.our_goals, match.opponent_goals)
                  const label = result === 'win' ? 'Victoria' : result === 'draw' ? 'Empate' : 'Derrota'
                  const color = result === 'win' ? 'text-emerald-400' : result === 'draw' ? 'text-amber-300' : 'text-red-400'
                  return <div key={match.id} className="flex items-center justify-between gap-4 px-5 py-5">
                    <div className="min-w-0"><p className="truncate text-sm font-medium"><span className="mr-2 text-xs text-zinc-500">vs</span>{match.opponents?.name ?? 'Rival'}</p><p className="mt-1.5 text-xs text-zinc-500">{match.managers?.name ?? 'Sin manager'} · {match.seasons?.name ?? 'Sin temporada'}</p></div>
                    <div className="shrink-0 text-right"><p className="text-xl font-semibold tabular-nums">{match.our_goals} <span className="text-zinc-600">:</span> {match.opponent_goals}</p><p className={`mt-1 text-[10px] ${color}`}>{label}</p></div>
                  </div>
                })}</div>}
            </section>
          </div>
          <p className="mt-8 text-[9px] tracking-[.18em] text-zinc-600 uppercase">Clubes Pro · Un equipo. Una misma ambición.</p>
        </div>
      </main>
    </div>
  )
}
