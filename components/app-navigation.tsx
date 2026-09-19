'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { ReactNode } from 'react'
import styles from './app-navigation.module.css'

type NavigationIcon = 'dashboard' | 'matches' | 'statistics' | 'opponents' | 'seasons' | 'users' | 'teams'

export type NavigationItem = {
  href: string
  label: string
  icon: NavigationIcon
}

function NavIcon({ name }: { name: NavigationIcon }) {
  const paths: Record<NavigationIcon, ReactNode> = {
    dashboard: <><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /></>,
    matches: <><rect x="2" y="5" width="20" height="14" rx="2" /><path d="M12 5v14M2 9h4v6H2m20-6h-4v6h4" /><circle cx="12" cy="12" r="3" /></>,
    statistics: <><path d="M4 20V10m8 10V4m8 16v-7M2 20h20" /><path d="m3 5 5-2m9 5 4-4" /></>,
    opponents: <><circle cx="7" cy="7" r="3" /><circle cx="17" cy="7" r="3" /><path d="M2 20v-3a5 5 0 0 1 10 0v3m0-3a5 5 0 0 1 10 0v3" /></>,
    seasons: <><path d="M8 3h8v6a4 4 0 0 1-8 0V3Zm0 2H4v2a4 4 0 0 0 4 4m8-6h4v2a4 4 0 0 1-4 4m-4 2v5m-4 3h8m-7-3h6" /></>,
    users: <><circle cx="9" cy="7" r="3" /><path d="M3 21v-3a6 6 0 0 1 12 0v3m2-17a3 3 0 0 1 0 6m2 4a5 5 0 0 1 2 4v3" /></>,
    teams: <><path d="m12 2 9 4v6c0 5-9 10-9 10S3 17 3 12V6l9-4Z" /><path d="m8 12 3 3 5-6" /></>,
  }

  return <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>
}

export function AppNavigation({ links }: { links: NavigationItem[] }) {
  const pathname = usePathname()

  return (
    <nav className={styles.navigation} aria-label="Navegación principal">
      {links.map((link) => {
        const active = pathname === link.href || (link.href !== '/' && pathname.startsWith(`${link.href}/`))
        return (
          <Link key={link.href} href={link.href} className={`${styles.link} ${active ? styles.active : ''}`} aria-current={active ? 'page' : undefined}>
            <NavIcon name={link.icon} />
            <span>{link.label}</span>
            <svg className={styles.arrow} width="15" height="15" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="m8 5 5 5-5 5" /></svg>
          </Link>
        )
      })}
    </nav>
  )
}
