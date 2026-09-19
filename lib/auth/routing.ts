export function authRedirect(path: string, loggedIn: boolean, current?: string, next?: string): string | null {
  if (path === '/auth/callback') return null
  if (!loggedIn) return path === '/login' ? null : '/login'
  if (!current || !next) return path === '/login' ? null : '/login'
  if (current === 'aal2') return ['/login', '/mfa/setup', '/mfa/verify'].includes(path) ? '/' : null
  if (next === 'aal2') return path === '/mfa/verify' ? null : '/mfa/verify'
  return ['/mfa/setup', '/auth/set-password'].includes(path) ? null : '/mfa/setup'
}
