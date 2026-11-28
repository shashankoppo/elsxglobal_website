import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { buildPublicRedirectUrl } from '@/lib/http/origin'
import crypto from 'crypto'

// ----------------------------------------------------------------
// isMasterAdmin: ONLY use app_metadata (server-set by GoTrue admin API).
// user_metadata is user-editable — NEVER use it for auth decisions.
// ----------------------------------------------------------------
function isMasterAdmin(user: any): boolean {
  if (!user) return false
  return (
    user.email?.toLowerCase() === 'admin@elsxglobal.com' ||
    user.app_metadata?.role === 'superadmin' ||
    user.app_metadata?.claims_admin === true
  )
}

// Timing-safe header secret comparison. NOTE: SUPABASE_SERVICE_ROLE_KEY
// is intentionally NOT a fallback — set ADMIN_SECRET explicitly.
function isValidAdminSecret(req: NextRequest): boolean {
  const configured = process.env.ADMIN_SECRET
  if (!configured) return false
  const header = req.headers.get('x-admin-secret')
  if (!header) return false
  try {
    const bufA = Buffer.from(header, 'utf8')
    const bufB = Buffer.from(configured, 'utf8')
    return bufA.length === bufB.length && crypto.timingSafeEqual(bufA, bufB)
  } catch {
    return false
  }
}

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request: { headers: request.headers },
  })

  const supabaseUrl =
    process.env.SUPABASE_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    'http://api-gw:8000'
  const rawAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.ANON_KEY
  const anonKey = rawAnonKey && !rawAnonKey.includes('placeholder') ? rawAnonKey : undefined

  if (!anonKey) {
    console.error('CRITICAL: NEXT_PUBLIC_SUPABASE_ANON_KEY is not set')
  }

  // ── Get VERIFIED user from GoTrue ────────────────────────────────
  // This is the ONLY source of truth for auth decisions.
  // We do NOT fall back to unverified JWT cookie parsing for access control.
  let user: any = null
  if (anonKey) {
    const supabase = createServerClient(supabaseUrl, anonKey, {
      cookieOptions: { name: 'elsxglobal-auth-token' },
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
                  name: c.name.replace(
                    /^sb-(elsxglobal|api-gw)-auth-token/,
                    'elsxglobal-auth-token'
                  ),
                  value: c.value,
                })),
              ]
            }
          }
          return all
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request: { headers: request.headers } })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    })

    try {
      const { data: authData } = await supabase.auth.getUser()
      if (authData?.user) user = authData.user
    } catch {
      // Network / GoTrue unreachable — user stays null, protected routes will deny
    }
  }

  const pathname = request.nextUrl.pathname

  // ── 1. Customer Portal ───────────────────────────────────────────
  const isPortalRoute = pathname.startsWith('/portal')
  const isPortalAuthRoute =
    pathname.startsWith('/portal/login') ||
    pathname.startsWith('/portal/signup') ||
    pathname.startsWith('/portal/forgot-password') ||
    pathname.startsWith('/portal/reset-password')

  if (isPortalRoute && !isPortalAuthRoute && !user) {
    const redirectUrl = buildPublicRedirectUrl('/portal/login', request.headers, request.url, '/portal/login')
    redirectUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(redirectUrl)
  }

  if (isPortalAuthRoute && user) {
    const rawTarget = request.nextUrl.searchParams.get('redirect') || '/portal'
    // Guard against redirect loops (e.g. ?redirect=/portal/login)
    const isLoop =
      rawTarget.startsWith('/portal/login') ||
      rawTarget.startsWith('/portal/signup') ||
      rawTarget.startsWith('/portal/forgot-password') ||
      rawTarget.startsWith('/portal/reset-password')
    return NextResponse.redirect(
      buildPublicRedirectUrl(isLoop ? '/portal' : rawTarget, request.headers, request.url, '/portal')
    )
  }

  // ── 2. Admin UI ──────────────────────────────────────────────────
  const isAdminRoute = pathname.startsWith('/admin')
  const isAdminPublicRoute =
    pathname.startsWith('/admin/login') ||
    pathname.startsWith('/admin/setup') ||
    pathname.startsWith('/admin/reset')

  if (isAdminRoute && !isAdminPublicRoute) {
    if (!user || !isMasterAdmin(user)) {
      return NextResponse.redirect(
        buildPublicRedirectUrl('/admin/login', request.headers, request.url, '/admin/login')
      )
    }
  }

  if (pathname.startsWith('/admin/login') && user && isMasterAdmin(user)) {
    return NextResponse.redirect(
      buildPublicRedirectUrl('/admin/overview/', request.headers, request.url, '/admin/overview/')
    )
  }

  // ── 3. Admin API (/api/admin/*) — /api/admin-setup NOT matched ───
  if (pathname.startsWith('/api/admin/') || pathname === '/api/admin') {
    if (!isValidAdminSecret(request)) {
      if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      if (!isMasterAdmin(user)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
  }

  // ── 4. Cloud API (/api/cloud/*) ──────────────────────────────────
  // Requires verified session OR explicit admin secret. Bearer token alone is not sufficient.
  if (pathname.startsWith('/api/cloud')) {
    if (!user && !isValidAdminSecret(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
  }

  // ── 5. Action Gateway (/api/action-gateway/*) ───────────────────
  if (pathname.startsWith('/api/action-gateway')) {
    if (!user && !isValidAdminSecret(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    // Approve/reject mutations require admin
    if (request.method !== 'GET' && !isValidAdminSecret(request) && !isMasterAdmin(user)) {
      return NextResponse.json({ error: 'Forbidden: Admin required' }, { status: 403 })
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
    '/api/action-gateway/:path*',
  ],
}
