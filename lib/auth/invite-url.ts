export function getInviteRedirect(configuredUrl: string | undefined, requestOrigin: string | null) {
  if (configuredUrl) {
    const url = new URL(configuredUrl)
    if (url.protocol !== 'https:' || url.username || url.password) throw new Error('Configura NEXT_PUBLIC_APP_URL con la dirección HTTPS de la web.')
    return `${url.origin}/auth/callback`
  }
  // Local testing only: do not send invitation tokens to an arbitrary Origin.
  const url = new URL(requestOrigin ?? 'http://localhost:3000')
  if (url.protocol !== 'http:' || !/^(localhost|127\.0\.0\.1|192\.168\.\d{1,3}\.\d{1,3}|10\.\d{1,3}\.\d{1,3}\.\d{1,3}|172\.(1[6-9]|2\d|3[01])\.\d{1,3}\.\d{1,3})$/.test(url.hostname)) {
    throw new Error('Configura NEXT_PUBLIC_APP_URL antes de enviar invitaciones desde esta dirección.')
  }
  return `${url.origin}/auth/callback`
}
