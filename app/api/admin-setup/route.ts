export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: Request) {
  try {
    const { action, email, password } = await request.json();

    if (action !== 'setup') {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password required' }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    // Create admin client bypassing RLS
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // Check if an admin already exists in the admin_users table
    const { count, error: countError } = await supabaseAdmin
      .from('admin_users')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    if (count && count > 0) {
      return NextResponse.json({ error: 'Admin account already exists' }, { status: 403 });
    }

    // Attempt to create the user in Supabase Auth
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: email.toLowerCase(),
      password: password,
      email_confirm: true, // Auto confirm for admin
    });

    if (authError) {
      // If user exists in auth but not in admin_users, we might need to handle that,
      // but typically we can just return the error.
      return NextResponse.json({ error: authError.message }, { status: 500 });
    }

    if (!authUser.user) {
      return NextResponse.json({ error: 'Failed to create auth user' }, { status: 500 });
    }

    // Insert into admin_users
    const { error: insertError } = await supabaseAdmin
      .from('admin_users')
      .insert({
        user_id: authUser.user.id,
        email: email.toLowerCase(),
        role: 'superadmin',
        is_active: true
      });

    if (insertError) {
      // Rollback auth user creation if inserting into admin_users fails
      await supabaseAdmin.auth.admin.deleteUser(authUser.user.id);
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    // To sign in immediately, the client will need to make a login request.
    // For now, we just return success. The frontend will redirect to login.
    return NextResponse.json({ success: true });

  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal error' }, { status: 500 });
  }
}
