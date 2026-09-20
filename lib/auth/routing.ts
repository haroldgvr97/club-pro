export function authRedirect(path: string, loggedIn: boolean, current?: string, next?: string, role?: string): string | null {
  if (path === '/auth/callback') return null
  if (!loggedIn) return path === '/login' ? null : '/login'
  if (!current || !next) return path === '/login' ? null : '/login'
  if (current === 'aal2') return ['/login', '/mfa/setup', '/mfa/verify'].includes(path) ? '/' : null
  if (next === 'aal2') return path === '/mfa/verify' ? null : '/mfa/verify'
  if (role === 'admin') return path === '/mfa/setup' || path === '/auth/set-password' ? null : '/mfa/setup'
  return path === '/login' ? '/' : null
}
