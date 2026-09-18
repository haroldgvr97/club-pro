import Link from 'next/link'

const links = [
  { href: '/', label: 'Dashboard' },
  { href: '/matches', label: 'Partidos' },
  { href: '/managers', label: 'Managers' },
  { href: '/opponents', label: 'Rivales' },
  { href: '/seasons', label: 'Temporadas' },
  { href: '/admin/users', label: 'Usuarios' },
]

export function AppSidebar() {
  return (
    <aside className="w-full border-b border-zinc-800 bg-zinc-950 md:min-h-screen md:w-64 md:border-b-0 md:border-r">
      <div className="p-6">
        <h2 className="text-xl font-bold text-white">Club Pro</h2>
      </div>

      <nav className="flex gap-2 overflow-x-auto px-4 pb-4 md:flex-col md:overflow-visible">
        {links.map((link) => (
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
