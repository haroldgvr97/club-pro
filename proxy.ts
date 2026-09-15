import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )

          response = NextResponse.next({
            request,
          })

          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const pathname = request.nextUrl.pathname

  const isLogin = pathname.startsWith('/login')
  const isMFASetup = pathname.startsWith('/mfa/setup')
  const isMFAVerify = pathname.startsWith('/mfa/verify')

  if (!user) {
    if (!isLogin) {
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      return NextResponse.redirect(url)
    }

    return response
  }

  const { data: aal } =
    await supabase.auth.mfa.getAuthenticatorAssuranceLevel()

  const currentLevel = aal?.currentLevel
  const nextLevel = aal?.nextLevel

  // No MFA enrolled yet
  if (currentLevel === 'aal1' && nextLevel === 'aal1') {
    if (!isMFASetup) {
      const url = request.nextUrl.clone()
      url.pathname = '/mfa/setup'
      return NextResponse.redirect(url)
    }

    return response
  }

  // MFA enrolled but not verified for this session
  if (nextLevel === 'aal2' && currentLevel !== 'aal2') {
    if (!isMFAVerify) {
      const url = request.nextUrl.clone()
      url.pathname = '/mfa/verify'
      return NextResponse.redirect(url)
    }

    return response
  }

  // Fully authenticated with MFA
  if (currentLevel === 'aal2') {
    if (isLogin || isMFASetup || isMFAVerify) {
      const url = request.nextUrl.clone()
      url.pathname = '/'
      return NextResponse.redirect(url)
    }

    return response
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
