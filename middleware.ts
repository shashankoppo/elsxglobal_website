import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

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
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder'

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

  const { data: { user } } = await supabase.auth.getUser()
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

    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
    const supabaseAdmin = createServerClient(
      supabaseUrl,
      serviceKey,
      {
        cookieOptions: {
          name: 'elsxglobal-auth-token',
        },
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll() {},
        },
      }
    )

    const { data: adminUser } = await supabaseAdmin
      .from('admin_users')
      .select('id, is_active')
      .eq('user_id', user.id)
      .maybeSingle()

    if (!adminUser || !adminUser.is_active) {
      return NextResponse.redirect(new URL('/admin/login', request.url))
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

      const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
      const supabaseAdmin = createServerClient(
        supabaseUrl,
        serviceKey,
        {
          cookieOptions: {
            name: 'elsxglobal-auth-token',
          },
          cookies: {
            getAll() {
              return request.cookies.getAll()
            },
            setAll() {},
          },
        }
      )

      const { data: adminUser } = await supabaseAdmin
        .from('admin_users')
        .select('id, is_active')
        .eq('user_id', user.id)
        .maybeSingle()

      if (!adminUser || !adminUser.is_active) {
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
