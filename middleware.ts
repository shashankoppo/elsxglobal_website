import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

/**
 * Fast JWT cookie parser that extracts user identity directly from
 * session cookie without network calls (immunity to network/PostgREST outages).
 */
function extractUserFromCookies(cookies: { name: string; value: string }[]) {
  try {
    const baseNames = ['elsxglobal-auth-token']
    const legacyCookie = cookies.find((c) => c.name.startsWith('sb-') && c.name.includes('-auth-token'))
    if (legacyCookie) {
      const match = legacyCookie.name.match(/^(sb-[a-zA-Z0-9_-]+-auth-token)/)
      if (match) baseNames.push(match[1])
    }

    for (const base of baseNames) {
      let rawVal = cookies.find((c) => c.name === base)?.value
      if (!rawVal) {
        const chunks: string[] = []
        let i = 0
        while (true) {
          const chunk = cookies.find((c) => c.name === `${base}.${i}`)
          if (!chunk) break
          chunks.push(chunk.value)
          i++
        }
        if (chunks.length > 0) {
          rawVal = chunks.join('')
        }
      }

      if (!rawVal) continue

      let decodedStr = rawVal
      if (decodedStr.startsWith('base64-')) {
        const b64 = decodedStr.slice(7)
        decodedStr = Buffer.from(b64, 'base64url').toString('utf8')
      }

      let parsedSession: any = null
      try {
        parsedSession = JSON.parse(decodedStr)
      } catch {
        continue
      }

      const accessToken = parsedSession?.access_token
      if (!accessToken || typeof accessToken !== 'string') continue

      const parts = accessToken.split('.')
      if (parts.length !== 3) continue

      const payloadJson = Buffer.from(parts[1], 'base64url').toString('utf8')
      const payload = JSON.parse(payloadJson)

      // Expiry check (with 60s clock skew tolerance)
      if (payload.exp && payload.exp * 1000 < Date.now() - 60000) {
        continue
      }

      return {
        id: payload.sub,
        email: payload.email,
        role: payload.role || 'authenticated',
        app_metadata: payload.app_metadata || {},
        user_metadata: payload.user_metadata || {},
      }
    }
  } catch {
    // Silently continue
  }
  return null
}

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabaseUrl =
    process.env.SUPABASE_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    'http://api-gw:8000'
  const rawAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const anonKey =
    rawAnonKey && !rawAnonKey.includes('placeholder') ? rawAnonKey : undefined
  if (!anonKey) {
    console.error('CRITICAL: NEXT_PUBLIC_SUPABASE_ANON_KEY is not set')
    // Allow the request to pass through without Supabase client
    // The route handlers will enforce auth independently
  }

  let user: any = null
  if (anonKey) {
    const supabase = createServerClient(
      supabaseUrl,
      anonKey,
      {
        cookieOptions: {
          name: 'elsxglobal-auth-token',
        },
        cookies: {
          getAll() {
            const all = request.cookies.getAll()
            const hasAuthToken = all.some((c) => c.name.startsWith('elsxglobal-auth-token'))
            if (!hasAuthToken) {
              const legacy = all.filter(
                (c) =>
                  c.name.startsWith('sb-elsxglobal-auth-token') ||
                  c.name.startsWith('sb-api-gw-auth-token')
              )
              if (legacy.length > 0) {
                return [
                  ...all,
                  ...legacy.map((c) => ({
                    name: c.name.replace(/^sb-(elsxglobal|api-gw)-auth-token/, 'elsxglobal-auth-token'),
                    value: c.value,
                  })),
                ]
              }
            }
            return all
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
            supabaseResponse = NextResponse.next({
              request: {
                headers: request.headers,
              },
            })
            cookiesToSet.forEach(({ name, value, options }) =>
              supabaseResponse.cookies.set(name, value, options)
            )
          },
        },
      }
    )

    try {
      const { data: authData } = await supabase.auth.getUser()
      if (authData?.user) {
        user = authData.user
      }
    } catch {
      // Fall back to direct cookie decoding
    }
  }

  // Cookie-based fallback still works
  if (!user) {
    user = extractUserFromCookies(request.cookies.getAll())
  }

  const pathname = request.nextUrl.pathname

  // 1. Customer Portal UI routes protection
  const isPortalRoute = pathname.startsWith('/portal')
  const isPortalLoginRoute =
    pathname.startsWith('/portal/login') ||
    pathname.startsWith('/portal/signup') ||
    pathname.startsWith('/portal/forgot-password') ||
    pathname.startsWith('/portal/reset-password')

  if (isPortalRoute && !isPortalLoginRoute && !user) {
    const redirectUrl = new URL('/portal/login', request.url)
    redirectUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(redirectUrl)
  }

  if (isPortalLoginRoute && user) {
    const target = request.nextUrl.searchParams.get('redirect') || '/portal'
    return NextResponse.redirect(new URL(target, request.url))
  }

  // 2. Admin UI routes protection
  const isAdminRoute = pathname.startsWith('/admin')
  const isAdminPublicRoute =
    pathname.startsWith('/admin/login') ||
    pathname.startsWith('/admin/setup') ||
    pathname.startsWith('/admin/reset')

  if (isAdminRoute && !isAdminPublicRoute) {
    if (!user) {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }

    const isMasterAdmin =
      user.email?.toLowerCase() === 'admin@elsxglobal.com' ||
      user.app_metadata?.role === 'superadmin' ||
      user.user_metadata?.role === 'superadmin' ||
      user.app_metadata?.claims_admin === true

    if (!isMasterAdmin) {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }
  }

  // If already logged in as Master Admin and visiting /admin/login
  if (pathname.startsWith('/admin/login') && user) {
    const isMasterAdmin =
      user.email?.toLowerCase() === 'admin@elsxglobal.com' ||
      user.app_metadata?.role === 'superadmin' ||
      user.user_metadata?.role === 'superadmin'

    if (isMasterAdmin) {
      return NextResponse.redirect(new URL('/admin/overview/', request.url))
    }
  }

  // 3. Admin API routes protection (/api/admin/*)
  if (pathname.startsWith('/api/admin')) {
    const adminSecret = request.headers.get('x-admin-secret')
    const configuredSecret = process.env.ADMIN_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY
    const isSecretValid = adminSecret && configuredSecret && adminSecret === configuredSecret

    if (!isSecretValid) {
      if (!user) {
        return NextResponse.json(
          { error: 'Unauthorized: Admin authentication required' },
          { status: 401 }
        )
      }

      const isMasterAdmin =
        user.email?.toLowerCase() === 'admin@elsxglobal.com' ||
        user.app_metadata?.role === 'superadmin' ||
        user.user_metadata?.role === 'superadmin' ||
        user.app_metadata?.claims_admin === true

      if (!isMasterAdmin) {
        return NextResponse.json(
          { error: 'Forbidden: Admin privileges required' },
          { status: 403 }
        )
      }
    }
  }

  // 4. Cloud API routes protection (/api/cloud/*)
  if (pathname.startsWith('/api/cloud')) {
    const authHeader = request.headers.get('authorization')
    const hasBearer = authHeader && authHeader.startsWith('Bearer ')
    const adminSecret = request.headers.get('x-admin-secret')
    const configuredSecret = process.env.ADMIN_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY
    const isSecretValid = adminSecret && configuredSecret && adminSecret === configuredSecret

    if (!user && !hasBearer && !isSecretValid) {
      return NextResponse.json(
        { error: 'Unauthorized: Authentication required for cloud resource APIs' },
        { status: 401 }
      )
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/portal/:path*',
    '/admin/:path*',
    '/api/admin/:path*',
    '/api/cloud/:path*',
  ],
}
