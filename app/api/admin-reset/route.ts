export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: Request) {
  try {
    const { email, password, name, confirmReset } = await request.json();

    if (confirmReset !== 'RESET_ADMIN_CONFIRMED') {
      return NextResponse.json({ error: 'Invalid confirmation' }, { status: 403 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // Delete all existing sessions
    await supabaseAdmin.from('admin_sessions').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    // Delete all existing admin users
    await supabaseAdmin.from('admin_users').delete().neq('id', '00000000-0000-0000-0000-000000000000');

    // Create the new admin user
    // Generate a simple hash (same as what the edge function uses)
    const encoder = new TextEncoder();
    const data = encoder.encode(password + supabaseUrl);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const passwordHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    const { data: newAdmin, error: insertError } = await supabaseAdmin
      .from('admin_users')
      .insert({
        email: email.toLowerCase(),
        password_hash: passwordHash,
        role: 'superadmin',
        is_active: true
      })
      .select('id, email, role')
      .single();

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    // Create a new session for the admin
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    const { data: newSession, error: sessionError } = await supabaseAdmin
      .from('admin_sessions')
      .insert({
        admin_id: newAdmin.id,
        token: crypto.randomUUID(),
        expires_at: expiresAt.toISOString()
      })
      .select('token')
      .single();

    if (sessionError) {
      return NextResponse.json({ error: sessionError.message }, { status: 500 });
    }

    const response = NextResponse.json({
      token: newSession.token,
      admin: {
        email: newAdmin.email,
        name: 'Administrator',
        role: newAdmin.role
      }
    });
    
    // Set cookie for middleware
    response.cookies.set('admin_token', newSession.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/admin',
      maxAge: 60 * 60 * 24 // 24 hours
    });

    return response;
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal error' }, { status: 500 });
  }
}
