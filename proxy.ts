import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { authRedirect } from '@/lib/auth/routing'

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request })
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    { cookies: {
      getAll: () => request.cookies.getAll(),
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
        response = NextResponse.next({ request })
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options))
      },
    } },
  )
  const { data: { user } } = await supabase.auth.getUser()
  const { data: aal } = user ? await supabase.auth.mfa.getAuthenticatorAssuranceLevel() : { data: null }
  const destination = authRedirect(request.nextUrl.pathname, Boolean(user), aal?.currentLevel ?? undefined, aal?.nextLevel ?? undefined)
  if (!destination) return response
  const url = request.nextUrl.clone()
  url.pathname = destination
  url.search = ''
  const redirected = NextResponse.redirect(url)
  response.cookies.getAll().forEach(cookie => redirected.cookies.set(cookie))
  return redirected
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
