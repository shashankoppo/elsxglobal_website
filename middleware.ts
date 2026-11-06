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

  const isPortalRoute = request.nextUrl.pathname.startsWith('/portal')
  const isPortalLoginRoute = request.nextUrl.pathname.startsWith('/portal/login') || request.nextUrl.pathname.startsWith('/portal/signup') || request.nextUrl.pathname.startsWith('/portal/forgot-password') || request.nextUrl.pathname.startsWith('/portal/reset-password');

  if (isPortalRoute && !isPortalLoginRoute && !user) {
    return NextResponse.redirect(new URL('/portal/login', request.url))
  }

  if (isPortalLoginRoute && user) {
    return NextResponse.redirect(new URL('/portal', request.url))
  }

  // Admin routes protection
  const isAdminRoute = request.nextUrl.pathname.startsWith('/admin')
  const isAdminPublicRoute = 
    request.nextUrl.pathname.startsWith('/admin/login') || 
    request.nextUrl.pathname.startsWith('/admin/setup') || 
    request.nextUrl.pathname.startsWith('/admin/reset')

  if (isAdminRoute && !isAdminPublicRoute) {
    if (!user) {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }

    // Because this runs on edge, querying the DB is possible using the Supabase client
    // We use a service_role client to bypass RLS since the edge might have issues with the anon client + cookies
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

  return supabaseResponse
}

export const config = {
  matcher: [
    '/portal/:path*',
    '/admin/:path*',
  ],
}
