export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { checkoutSchema } from '@/lib/billing/checkoutSchema';

export async function POST(req: Request) {
  try {
    const rawBody = await req.json();
    const parseResult = checkoutSchema.safeParse(rawBody);

    if (!parseResult.success) {
      return NextResponse.json({ 
        error: 'Validation failed', 
        details: parseResult.error.flatten().fieldErrors 
      }, { status: 400 });
    }

    const { 
      planId, planName, planTier, billingCycle, domain, os, panel, location, addons,
      custom_vcpu, custom_ram, custom_storage
    } = parseResult.data;

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const authHeader = req.headers.get('Authorization');

    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json({ error: 'Missing configuration' }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: authHeader ? { Authorization: authHeader } : undefined
      }
    });

    // Verify user from the auth token, not from the request body
    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
    if (authError || !authUser) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { data: dbAddons } = await supabase.from('hosting_addons').select('*');
    const addonMap = new Map(dbAddons?.map(a => [a.id, a.price_monthly]) || []);
    
    let basePrice = 0;
    if (planId === 'custom') {
      const vcpu = Math.max(1, Number(custom_vcpu || 4));
      const ram = Math.max(1, Number(custom_ram || 8));
      const storage = Math.max(10, Number(custom_storage || 100));
      basePrice = (vcpu * 150) + (ram * 100) + (storage * 10);
    } else {
      const { data: planData } = await supabase.from('hosting_plans').select('price_monthly').eq('id', planId).single();
      if (planData) basePrice = planData.price_monthly;
    }

    const cycleMultiplier = billingCycle === 'annual' ? 12 : billingCycle === 'semi_annual' ? 6 : 1;
    const cycleDiscount = billingCycle === 'annual' ? 0.167 : billingCycle === 'semi_annual' ? 0.05 : 0;
    const panelPrice = panel === 'cpanel' ? 1500 : panel === 'plesk' ? 800 : panel === 'directadmin' ? 500 : 0;
    const addonTotal = addons.reduce((sum: number, id: string) => sum + (addonMap.get(id) || 0), 0);
    
    const calculatedAmount = Math.round(
      (basePrice + panelPrice) * cycleMultiplier * (1 - cycleDiscount) + (addonTotal * cycleMultiplier)
    );

    const { data, error } = await supabase
      .from('hosting_orders')
      .insert({
        plan_id: planId === 'custom' ? null : planId,
        plan_name: planName,
        plan_tier: planTier,
        billing_cycle: billingCycle,
        total: calculatedAmount,
        subtotal: calculatedAmount,
        domain: domain,
        notes: JSON.stringify({
          os_selection: os,
          panel_selection: panel,
          server_location: location,
          addons: addons,
          user_email: authUser.email,
        }),
        status: 'pending_payment',
        user_id: authUser.id,
      })
      .select('id')
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ id: data.id });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

