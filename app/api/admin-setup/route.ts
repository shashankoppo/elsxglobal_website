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

    if (count && count > 0 && email.toLowerCase() !== 'admin@elsxglobal.com') {
      return NextResponse.json({ error: 'Admin account already exists' }, { status: 403 });
    }

    let userId = '';

    // Attempt to create the user in Supabase Auth
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: email.toLowerCase(),
      password: password,
      email_confirm: true, // Auto confirm for admin
    });

    if (authError) {
      if (authError.message.toLowerCase().includes('already') || authError.message.toLowerCase().includes('registered')) {
        // Find existing user to update password
        const { data: listData } = await supabaseAdmin.auth.admin.listUsers();
        const existing = listData?.users?.find(u => u.email?.toLowerCase() === email.toLowerCase());
        if (existing) {
          userId = existing.id;
          await supabaseAdmin.auth.admin.updateUserById(existing.id, {
            password,
            email_confirm: true,
          });
        } else {
          return NextResponse.json({ error: authError.message }, { status: 500 });
        }
      } else {
        return NextResponse.json({ error: authError.message }, { status: 500 });
      }
    } else if (authUser?.user) {
      userId = authUser.user.id;
    }

    if (!userId) {
      return NextResponse.json({ error: 'Failed to create or update auth user' }, { status: 500 });
    }

    // Upsert into admin_users
    const { error: upsertError } = await supabaseAdmin
      .from('admin_users')
      .upsert({
        user_id: userId,
        email: email.toLowerCase(),
        role: 'superadmin',
        is_active: true
      }, { onConflict: 'email' });

    if (upsertError) {
      return NextResponse.json({ error: upsertError.message }, { status: 500 });
    }

    // To sign in immediately, the client will need to make a login request.
    // For now, we just return success. The frontend will redirect to login.
    return NextResponse.json({ success: true });

  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal error' }, { status: 500 });
  }
}
