export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { engine } from '@/lib/provisioning/ProvisioningEngine';

export async function POST(request: Request) {
  try {
    const { serviceId, action } = await request.json(); // e.g. restart, stop, start
    const token = request.headers.get('Authorization')?.replace('Bearer ', '');
    
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
    const { data: user } = await supabaseAdmin.auth.getUser(token);
    
    if (!user.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // Fetch the service and its node
    const { data: service, error: svcError } = await supabaseAdmin
      .from('hosting_services')
      .select('*, hosting_plans(provisioning_type)')
      .eq('id', serviceId)
      .eq('user_id', user.user.id)
      .single();

    if (svcError || !service) return NextResponse.json({ error: 'Service not found' }, { status: 404 });

    const { data: allocation } = await supabaseAdmin
      .from('service_allocations')
      .select('*, infrastructure_nodes(*)')
      .eq('service_id', serviceId)
      .single();

    const providerType = (service as any).hosting_plans?.provisioning_type || 'manual';

    if (providerType === 'manual' || !allocation?.infrastructure_nodes) {
      // Manual action mock
      return NextResponse.json({ ok: true, message: `Mock ${action} sent to manual provider.` });
    }

    const node = allocation.infrastructure_nodes;
    
    if (action === 'restart' || action === 'stop') {
        await engine.suspend(providerType, node as any, `ext-${serviceId}`);
        // If restart, we would unsuspend right away or call restart method, this is a stub.
        if (action === 'restart') {
            await engine.unsuspend(providerType, node as any, `ext-${serviceId}`);
        }
        return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

  } catch (err: any) {
    console.error('Action API Error:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
