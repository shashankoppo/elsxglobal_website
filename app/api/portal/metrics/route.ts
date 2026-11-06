export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { engine } from '@/lib/provisioning/ProvisioningEngine';

export async function POST(request: Request) {
  try {
    const { serviceId, action } = await request.json();
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
      // Mock metrics for manual
      return NextResponse.json({
        cpu: 0,
        ram: 0,
        disk: 0,
        network: { in: 0, out: 0 },
        status: service.status
      });
    }

    const node = allocation.infrastructure_nodes;
    const metrics = await engine.getMetrics(providerType, node as any, `ext-${serviceId}`);
    return NextResponse.json({ ...metrics, status: service.status });

  } catch (err: any) {
    console.error('Metrics API Error:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
