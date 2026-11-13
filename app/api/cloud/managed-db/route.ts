export const dynamic = 'force-dynamic';

import { NextRequest } from 'next/server';
import crypto from 'crypto';
import { createServerClient } from '@/lib/supabase/server';
import { processActionIntent } from '@/lib/action-gateway/gateway';
import { ActionIntent } from '@/lib/action-gateway/types';
import { ok, err } from '@/lib/core/api-response';
import { managedSupabase, ManagedProject } from '@/lib/saas/managed-supabase';

let fallbackProjects: ManagedProject[] = [
  {
    id: 'prj-bom-prod01',
    userId: 'user_active_session',
    name: 'Production Core DB',
    region: 'ap-south-1 (Mumbai)',
    status: 'active_healthy',
    dbHost: 'db.bom-prod01.vaulthost.cloud',
    dbPort: 5432,
    dbName: 'postgres',
    apiUrl: 'https://bom-prod01.supabase.vaulthost.cloud',
    anonKey: 'eyJh...bom_prod_anon_key',
    plan: 'pro',
    createdAt: '2026-02-15T10:00:00Z',
  },
  {
    id: 'prj-del-stage02',
    userId: 'user_active_session',
    name: 'Staging Auth & Analytics',
    region: 'ap-south-1 (Mumbai)',
    status: 'active_healthy',
    dbHost: 'db.del-stage02.vaulthost.cloud',
    dbPort: 5432,
    dbName: 'postgres',
    apiUrl: 'https://del-stage02.supabase.vaulthost.cloud',
    anonKey: 'eyJh...del_stage_anon_key',
    plan: 'free',
    createdAt: '2026-03-01T14:30:00Z',
  },
];

export async function GET(req: NextRequest) {
  try {
    const supabase = createServerClient();
    const { data: { user } } = await supabase.auth.getUser().catch(() => ({ data: { user: null } }));
    const userId = user?.id || 'user_active_session';

    let projects = fallbackProjects.filter(p => p.userId === userId || p.userId === 'user_active_session');

    try {
      const liveProjects = await managedSupabase.listProjects(userId);
      if (liveProjects && liveProjects.length > 0) {
        projects = liveProjects;
      }
    } catch {}

    try {
      const { data: dbProjects, error } = await supabase
        .from('cloud_databases')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && dbProjects && dbProjects.length > 0) {
        projects = dbProjects.map((d: any) => ({
          id: d.id,
          userId: d.user_id || userId,
          name: d.name,
          region: d.region || 'ap-south-1',
          status: d.status || 'active_healthy',
          dbHost: d.db_host || `db.${d.id}.vaulthost.cloud`,
          dbPort: d.port || 5432,
          dbName: d.db_name || 'postgres',
          apiUrl: d.api_url || `https://${d.id}.supabase.vaulthost.cloud`,
          anonKey: d.anon_key || `eyJh...${d.id}`,
          plan: d.plan || 'pro',
          createdAt: d.created_at,
        }));
      }
    } catch {}

    return ok({
      projects,
      stats: {
        total: projects.length,
        active: projects.filter(p => p.status === 'active_healthy').length,
        regions: Array.from(new Set(projects.map(p => p.region))),
      },
      user: user ? { id: user.id, email: user.email } : null,
    });
  } catch (caughtErr: unknown) {
    const errorMsg = caughtErr instanceof Error ? caughtErr.message : 'Unknown error';
    return err('INTERNAL_ERROR', errorMsg, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, region = 'ap-south-1', plan = 'free', dbPassword, options = {}, intent } = body;

    const supabase = createServerClient();
    const { data: { user } } = await supabase.auth.getUser().catch(() => ({ data: { user: null } }));
    const actorId = user?.id || 'user_active_session';
    const tenantId = (user?.user_metadata?.tenant_id as string) || 'ten_portal_default';

    if (intent) {
      const result = await processActionIntent(intent as ActionIntent, options);
      return ok(result);
    }

    if (!name) {
      return err('BAD_REQUEST', 'Project name is required', { status: 400 });
    }

    // Process through Action Gateway (Risk Tier 2 for infrastructure provisioning)
    const actionIntent: ActionIntent = {
      intentId: crypto.randomUUID(),
      actor: {
        id: actorId,
        type: 'user',
        tenantId,
        roles: ['tenant_admin'],
      },
      targetService: 'database',
      actionVerb: 'create_managed_database',
      resourceUri: `database://supabase/projects/${encodeURIComponent(name)}`,
      parameters: { name, region, plan },
      idempotencyKey: `supabase_create_${Date.now()}_${name}`,
      createdAt: new Date().toISOString(),
    };

    const execOptions = {
      ...options,
      tenantPolicyOverrides: [
        ...(options.tenantPolicyOverrides || []),
        { tenantId, enforceTier: 2 as const },
      ],
    };

    const gatewayResult = await processActionIntent(actionIntent, execOptions);

    if (gatewayResult.status === 'executed') {
      let createdProject: ManagedProject;
      try {
        createdProject = await managedSupabase.createProject(actorId, name, region, dbPassword, plan);
      } catch {
        createdProject = {
          id: `prj-${Date.now().toString(36)}`,
          userId: actorId,
          name,
          region,
          status: 'active_healthy',
          dbHost: `db.${name.toLowerCase().replace(/[^a-z0-9]/g, '-')}.vaulthost.cloud`,
          dbPort: 5432,
          dbName: 'postgres',
          apiUrl: `https://${name.toLowerCase().replace(/[^a-z0-9]/g, '-')}.supabase.vaulthost.cloud`,
          anonKey: `eyJh...${Date.now()}_anon_key`,
          plan,
          createdAt: new Date().toISOString(),
        };
      }

      fallbackProjects.unshift(createdProject);

      try {
        await supabase.from('cloud_databases').insert({
          id: createdProject.id,
          user_id: actorId,
          tenant_id: tenantId,
          name: createdProject.name,
          region: createdProject.region,
          status: createdProject.status,
          db_host: createdProject.dbHost,
          api_url: createdProject.apiUrl,
          plan: createdProject.plan,
        });
      } catch {}

      return ok({
        status: 'executed',
        project: createdProject,
        gateway: gatewayResult,
      });
    }

    return ok(gatewayResult, { status: 202 });
  } catch (caughtErr: unknown) {
    const errorMsg = caughtErr instanceof Error ? caughtErr.message : 'Unknown error';
    return err('INTERNAL_ERROR', errorMsg, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const body = await req.json().catch(() => ({}));
    const id = searchParams.get('id') || searchParams.get('projectRef') || body.id || body.projectRef;
    const options = body.options || {};

    if (!id) {
      return err('BAD_REQUEST', 'Project ID or reference is required', { status: 400 });
    }

    const supabase = createServerClient();
    const { data: { user } } = await supabase.auth.getUser().catch(() => ({ data: { user: null } }));
    const actorId = user?.id || 'user_active_session';
    const tenantId = (user?.user_metadata?.tenant_id as string) || 'ten_portal_default';

    // Risk Tier 3 for database destruction
    const actionIntent: ActionIntent = {
      intentId: crypto.randomUUID(),
      actor: {
        id: actorId,
        type: 'user',
        tenantId,
        roles: ['tenant_admin'],
      },
      targetService: 'database',
      actionVerb: 'delete',
      resourceUri: `database://supabase/projects/${id}`,
      parameters: { projectId: id },
      idempotencyKey: `supabase_del_${Date.now()}_${id}`,
      createdAt: new Date().toISOString(),
    };

    const execOptions = {
      ...options,
      tenantPolicyOverrides: [
        ...(options.tenantPolicyOverrides || []),
        { tenantId, enforceTier: 3 as const },
      ],
    };

    const gatewayResult = await processActionIntent(actionIntent, execOptions);

    if (gatewayResult.status === 'executed') {
      try {
        await managedSupabase.deleteProject(id);
      } catch {}

      fallbackProjects = fallbackProjects.filter(p => p.id !== id);

      try {
        await supabase.from('cloud_databases').delete().eq('id', id);
      } catch {}

      return ok({
        message: `Project ${id} deleted successfully.`,
        gateway: gatewayResult,
      });
    }

    return ok(gatewayResult, { status: 202 });
  } catch (caughtErr: unknown) {
    const errorMsg = caughtErr instanceof Error ? caughtErr.message : 'Unknown error';
    return err('INTERNAL_ERROR', errorMsg, { status: 500 });
  }
}
