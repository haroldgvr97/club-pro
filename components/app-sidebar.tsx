import Link from 'next/link'
import { createClient } from '@/utils/supabase/server'
import { getActiveTeamId } from '@/lib/teams/active-team'

const links = [
  { href: '/', label: 'Dashboard' },
  { href: '/matches', label: 'Partidos' },
  { href: '/managers', label: 'Estadísticas' },
  { href: '/opponents', label: 'Rivales' },
  { href: '/seasons', label: 'Temporadas' },
  { href: '/admin/users', label: 'Usuarios' },
]

// La sección se conserva para poder volver a activarla más adelante.
const showOpponentsLink = false

export async function AppSidebar() {
  const supabase = await createClient()
  const teamId = await getActiveTeamId()
  const { data: team } = await supabase.from('teams').select('name').eq('id', teamId).maybeSingle()
  return (
    <aside className="w-full border-b border-zinc-800 bg-zinc-950 md:min-h-screen md:w-64 md:border-b-0 md:border-r">
      <div className="p-6">
        <Link href="/teams" className="text-xl font-bold text-white">Clubes Pro: {team?.name ?? 'Equipo'}</Link>
      </div>

      <nav className="flex gap-2 overflow-x-auto px-4 pb-4 md:flex-col md:overflow-visible">
        <Link href="/teams" className="whitespace-nowrap rounded-lg px-4 py-2 text-sm text-zinc-300 transition hover:bg-zinc-900 hover:text-white">Equipos</Link>
        {links
          .filter((link) => showOpponentsLink || link.href !== '/opponents')
          .map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="whitespace-nowrap rounded-lg px-4 py-2 text-sm text-zinc-300 transition hover:bg-zinc-900 hover:text-white"
          >
            {link.label}
          </Link>
          ))}
      </nav>
    </aside>
  )
}
