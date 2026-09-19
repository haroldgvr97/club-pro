import Link from 'next/link'
import { createClient } from '@/utils/supabase/server'
import { getActiveTeamId } from '@/lib/teams/active-team'
import { AppNavigation, type NavigationItem } from '@/components/app-navigation'
import styles from './app-navigation.module.css'

const links: NavigationItem[] = [
  { href: '/', label: 'Dashboard', icon: 'dashboard' },
  { href: '/matches', label: 'Partidos', icon: 'matches' },
  { href: '/managers', label: 'Estadísticas', icon: 'statistics' },
  { href: '/opponents', label: 'Rivales', icon: 'opponents' },
  { href: '/seasons', label: 'Temporadas', icon: 'seasons' },
  { href: '/admin/users', label: 'Usuarios', icon: 'users' },
]

// La sección se conserva para poder volver a activarla más adelante.
const showOpponentsLink = false

function SidebarFrame({ teamName, teamsOnly = false }: { teamName?: string; teamsOnly?: boolean }) {
  return (
    <aside className={styles.sidebar}>
      <Link
        href={teamsOnly ? '/teams' : '/'}
        className={styles.brand}
        aria-label={teamsOnly ? 'Clubes Pro' : `Clubes Pro: ${teamName}`}
      >
        <span className={styles.monogram} aria-hidden="true">CP<span /></span>
        <span className={styles.brandText}>
          <span className={styles.brandName}>Clubes Pro{teamsOnly ? '' : ':'}</span>
          <span className={styles.teamName}>{teamsOnly ? 'Administración' : teamName}</span>
        </span>
      </Link>

      <div className={styles.sectionLabel}>{teamsOnly ? 'Tu plataforma' : 'Centro del club'}</div>
      <AppNavigation
        links={teamsOnly
          ? [{ href: '/teams', label: 'Equipos', icon: 'teams' }]
          : links.filter((link) => showOpponentsLink || link.href !== '/opponents')}
      />

      <div className={styles.signature} aria-hidden="true">
        <div className={styles.signatureLines}><span /><span /><span /></div>
        <span>Creado para competir.</span>
        <span className={styles.signatureBrand}>CLUBES PRO</span>
      </div>
    </aside>
  )
}

export async function AppSidebar({ teamsOnly = false }: { teamsOnly?: boolean } = {}) {
  if (teamsOnly) return <SidebarFrame teamsOnly />
  const supabase = await createClient()
  const teamId = await getActiveTeamId()
  const { data: team } = await supabase.from('teams').select('name').eq('id', teamId).maybeSingle()
  return <SidebarFrame teamName={team?.name ?? 'Equipo'} />
}
