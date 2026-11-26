import { NextResponse } from 'next/server'
// The client you created from the Server-Side Auth instructions
import { createClient } from '@/lib/supabase/server'
import { buildPublicRedirectUrl } from '@/lib/http/origin'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/portal'

  if (code) {
    const supabase = createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return NextResponse.redirect(
        buildPublicRedirectUrl(next, request.headers, request.url, '/portal')
      )
    }
  }

  return NextResponse.redirect(
    buildPublicRedirectUrl('/auth/auth-code-error', request.headers, request.url, '/auth/auth-code-error')
  )
}
