import { describe, expect, it } from 'vitest'
import { authRedirect } from '@/lib/auth/routing'
import { getInviteRedirect } from '@/lib/auth/invite-url'

describe('protected navigation', () => {
  it('requires login everywhere and only admins require MFA', () => {
    for (const path of ['/', '/matches', '/managers', '/seasons', '/teams', '/admin/users', '/login-other']) {
      expect(authRedirect(path, false)).toBe('/login')
      expect(authRedirect(path, true, 'aal1', 'aal1', 'admin')).toBe('/mfa/setup')
      expect(authRedirect(path, true, 'aal1', 'aal2')).toBe('/mfa/verify')
      expect(authRedirect(path, true, 'aal1', 'aal1', 'user')).toBeNull()
      expect(authRedirect(path, true)).toBe('/login')
    }
  })
  it('allows invitation processing even with a previous session', () => {
    expect(authRedirect('/auth/callback', false)).toBeNull()
    expect(authRedirect('/auth/callback', true, 'aal1', 'aal2')).toBeNull()
    expect(authRedirect('/auth/callback', true, 'aal2', 'aal2')).toBeNull()
    expect(authRedirect('/auth/callback-extra', false)).toBe('/login')
  })
  it('permits initial onboarding and completed MFA without loops', () => {
    expect(authRedirect('/auth/set-password', true, 'aal1', 'aal1')).toBeNull()
    expect(authRedirect('/mfa/setup', true, 'aal1', 'aal1')).toBeNull()
    expect(authRedirect('/mfa/verify', true, 'aal1', 'aal2')).toBeNull()
    expect(authRedirect('/matches', true, 'aal2', 'aal2')).toBeNull()
    expect(authRedirect('/mfa/verify', true, 'aal2', 'aal2')).toBe('/')
  })
})

describe('invitation destinations', () => {
  it('uses the configured site regardless of the request origin', () => {
    expect(getInviteRedirect('https://example.com/', 'https://untrusted.example')).toBe('https://example.com/auth/callback')
  })
  it('uses the LAN address during phone testing', () => {
    expect(getInviteRedirect(undefined, 'http://192.168.1.3:3000')).toBe('http://192.168.1.3:3000/auth/callback')
  })
  it('rejects unknown destinations and unsafe configurations', () => {
    expect(() => getInviteRedirect(undefined, 'https://untrusted.example')).toThrow()
    expect(() => getInviteRedirect('http://example.com', null)).toThrow()
    expect(() => getInviteRedirect('https://user:secret@example.com', null)).toThrow()
  })
})
