import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value,
            ...options,
          })
          supabaseResponse = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          supabaseResponse.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          })
          supabaseResponse = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          supabaseResponse.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  const pathname = request.nextUrl.pathname

  // 1. Customer Portal UI routes protection
  const isPortalRoute = pathname.startsWith('/portal')
  const isPortalLoginRoute = pathname.startsWith('/portal/login') || pathname.startsWith('/portal/signup') || pathname.startsWith('/portal/forgot-password') || pathname.startsWith('/portal/reset-password')

  if (isPortalRoute && !isPortalLoginRoute && !user) {
    return NextResponse.redirect(new URL('/portal/login', request.url))
  }

  if (isPortalLoginRoute && user) {
    return NextResponse.redirect(new URL('/portal', request.url))
  }

  // 2. Admin UI routes protection
  const isAdminRoute = pathname.startsWith('/admin')
  const isAdminPublicRoute = 
    pathname.startsWith('/admin/login') || 
    pathname.startsWith('/admin/setup')

  if (isAdminRoute && !isAdminPublicRoute) {
    if (!user) {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }

    const supabaseAdmin = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        cookies: {
          get(name: string) { return request.cookies.get(name)?.value },
          set() {},
          remove() {}
        }
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
        return NextResponse.json({ error: 'Unauthorized: Admin authentication required' }, { status: 401 })
      }

      const supabaseAdmin = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        {
          cookies: {
            get(name: string) { return request.cookies.get(name)?.value },
            set() {},
            remove() {}
          }
        }
      )

      const { data: adminUser } = await supabaseAdmin
        .from('admin_users')
        .select('id, is_active')
        .eq('user_id', user.id)
        .maybeSingle()

      if (!adminUser || !adminUser.is_active) {
        return NextResponse.json({ error: 'Forbidden: Admin privileges required' }, { status: 403 })
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
      return NextResponse.json({ error: 'Unauthorized: Authentication required for cloud resource APIs' }, { status: 401 })
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
