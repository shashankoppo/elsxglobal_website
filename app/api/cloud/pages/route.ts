export const dynamic = 'force-dynamic';

import { NextRequest } from 'next/server';
import crypto from 'crypto';
import { createServerClient } from '@/lib/supabase/server';
import { processActionIntent } from '@/lib/action-gateway/gateway';
import { ActionIntent } from '@/lib/action-gateway/types';
import { ok, err } from '@/lib/core/api-response';

export interface DeploymentInfo {
  id: string;
  commitHash: string;
  commitMessage: string;
  status: 'success' | 'building' | 'queued' | 'failed';
  createdAt: string;
}

export interface PagesProject {
  id: string;
  name: string;
  gitRepo: string;
  branch: string;
  framework: string;
  buildCommand: string;
  outputDir: string;
  domain: string;
  status: 'active' | 'building' | 'failed';
  latestDeployment?: DeploymentInfo;
  createdAt: string;
}

let fallbackProjects: PagesProject[] = [
  {
    id: 'proj-001',
    name: 'vaulthost-docs',
    gitRepo: 'https://github.com/vaulthost/docs',
    branch: 'main',
    framework: 'nextjs',
    buildCommand: 'npm run build',
    outputDir: '.next',
    domain: 'docs.vaulthost.cloud',
    status: 'active',
    latestDeployment: {
      id: 'dep-901',
      commitHash: '7c81d2a',
      commitMessage: 'feat(api): update OpenAPI spec for MCP tools',
      status: 'success',
      createdAt: '2026-03-12T09:15:00Z',
    },
    createdAt: '2026-01-10T12:00:00Z',
  },
  {
    id: 'proj-002',
    name: 'apexdigital-landing',
    gitRepo: 'https://github.com/apexdigital/landing',
    branch: 'production',
    framework: 'astro',
    buildCommand: 'npm run build',
    outputDir: 'dist',
    domain: 'apexdigital.io',
    status: 'active',
    latestDeployment: {
      id: 'dep-902',
      commitHash: '3a49f1b',
      commitMessage: 'chore(deps): bump tailwind and react',
      status: 'success',
      createdAt: '2026-03-14T18:42:00Z',
    },
    createdAt: '2026-02-01T15:20:00Z',
  },
];

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get('id') || searchParams.get('projectId');
    const action = searchParams.get('action');

    if (action === 'logs') {
      const targetId = projectId || 'prj-01';
      const sampleLogs = [
        `[00:00:01] Initializing build environment for ${targetId}...`,
        `[00:00:02] Fetching repository commit metadata: HEAD -> origin/main`,
        `[00:00:03] Pulling base runner image: node:20-alpine`,
        `[00:00:05] Running 'npm ci --prefer-offline --no-audit'`,
        `[00:00:14] added 284 packages in 8.42s`,
        `[00:00:15] Executing build command: npm run build`,
        `[00:00:18] > next build`,
        `[00:00:20] ▲ Next.js 14.2.5`,
        `[00:00:21] - Environments: .env.production`,
        `[00:00:23] Creating an optimized production build ...`,
        `[00:00:32] ✓ Compiled successfully in 8.9s`,
        `[00:00:33] Collecting page data ...`,
        `[00:00:36] Generating static pages (0/18) ...`,
        `[00:00:39] Generating static pages (18/18) [completed in 2.8s]`,
        `[00:00:40] Finalizing page optimization ...`,
        `[00:00:42] Output directory size: 48.2 MB`,
        `[00:00:43] Syncing artifacts to Anycast Edge Storage (300+ PoPs)...`,
        `[00:00:44] Purging CDN cache for edge zones...`,
        `[00:00:45] Deployment successful! Target live on Anycast Edge mesh.`,
      ];
      return ok({ projectId: targetId, logs: sampleLogs });
    }

    const supabase = createServerClient();
    const { data: { user } } = await supabase.auth.getUser().catch(() => ({ data: { user: null } }));

    let projects = fallbackProjects;
    try {
      const { data: dbProjects, error } = await supabase
        .from('cloud_pages_projects')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && dbProjects && dbProjects.length > 0) {
        projects = dbProjects.map((p: any) => ({
          id: p.id,
          name: p.name,
          gitRepo: p.git_repo || p.repo_url,
          branch: p.branch || 'main',
          framework: p.framework || 'nextjs',
          buildCommand: p.build_command || 'npm run build',
          outputDir: p.output_dir || '.next',
          domain: p.domain || `${p.name}.vaulthost.page`,
          status: p.status || 'active',
          latestDeployment: p.latest_deployment,
          createdAt: p.created_at,
        }));
      }
    } catch {}

    if (projectId) {
      const project = projects.find(p => p.id === projectId || p.name === projectId);
      if (!project) return err('NOT_FOUND', 'Pages project not found', { status: 404 });
      return ok({ project, user: user ? { id: user.id, email: user.email } : null });
    }

    return ok({
      projects,
      stats: {
        totalProjects: projects.length,
        activeDeployments: projects.filter(p => p.status === 'active').length,
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
    const { action = 'create', name, gitRepo, repoUrl, branch = 'main', buildCommand = 'npm run build', outputDir = '.next', domain, options = {}, intent } = body;
    const finalGitRepo = gitRepo || repoUrl;

    const supabase = createServerClient();
    const { data: { user } } = await supabase.auth.getUser().catch(() => ({ data: { user: null } }));
    const actorId = user?.id || 'user_active_session';
    const tenantId = (user?.user_metadata?.tenant_id as string) || 'ten_portal_default';

    if (intent) {
      const result = await processActionIntent(intent as ActionIntent, options);
      return ok(result);
    }

    if (action === 'delete') {
      const targetId = body.projectId || body.id || name;
      if (!targetId) {
        return err('BAD_REQUEST', 'Project ID is required for deletion', { status: 400 });
      }
      const actionIntent: ActionIntent = {
        intentId: crypto.randomUUID(),
        actor: { id: actorId, type: 'user', tenantId, roles: ['tenant_admin'] },
        targetService: 'compute',
        actionVerb: 'delete',
        resourceUri: `compute://pages/projects/${targetId}`,
        parameters: { projectId: targetId },
        idempotencyKey: `pages_del_${Date.now()}_${targetId}`,
        createdAt: new Date().toISOString(),
      };
      const execOptions = {
        ...options,
        tenantPolicyOverrides: [
          ...(options.tenantPolicyOverrides || []),
          { tenantId, enforceTier: 1 as const },
        ],
      };
      const gatewayResult = await processActionIntent(actionIntent, execOptions);
      if (gatewayResult.status === 'executed') {
        fallbackProjects = fallbackProjects.filter(p => p.id !== targetId && p.name !== targetId);
        try {
          await supabase.from('cloud_pages_projects').delete().or(`id.eq.${targetId},name.eq.${targetId}`);
        } catch {}
        return ok({ message: `Project ${targetId} deleted.`, gateway: gatewayResult });
      }
      return ok(gatewayResult, { status: 202 });
    }

    if (!finalGitRepo || !/^https:\/\/(github\.com|gitlab\.com|bitbucket\.org)\/[\w.-]+\/[\w.-]+/.test(finalGitRepo)) {
      return err('BAD_REQUEST', 'A valid git repository URL (HTTPS) is required (e.g. https://github.com/org/repo)', { status: 400 });
    }

    const projectName = name || finalGitRepo.split('/').pop()?.replace(/\.git$/, '') || `project-${Date.now().toString().slice(-4)}`;
    const projectDomain = domain || `${projectName}.vaulthost.page`;

    // Tier 1 for create project
    const actionIntent: ActionIntent = {
      intentId: crypto.randomUUID(),
      actor: {
        id: actorId,
        type: 'user',
        tenantId,
        roles: ['tenant_developer'],
      },
      targetService: 'compute',
      actionVerb: 'create',
      resourceUri: `compute://pages/projects/${projectName}`,
      parameters: { name: projectName, gitRepo: finalGitRepo, branch, buildCommand, outputDir, domain: projectDomain },
      idempotencyKey: `pages_create_${Date.now()}_${projectName}`,
      createdAt: new Date().toISOString(),
    };

    const execOptions = {
      ...options,
      tenantPolicyOverrides: [
        ...(options.tenantPolicyOverrides || []),
        { tenantId, enforceTier: 1 as const },
      ],
    };

    const gatewayResult = await processActionIntent(actionIntent, execOptions);
    if (gatewayResult.status === 'executed') {
      const newProject: PagesProject = {
        id: `proj-${Date.now()}`,
        name: projectName,
        gitRepo: finalGitRepo,
        branch,
        framework: 'nextjs',
        buildCommand,
        outputDir,
        domain: projectDomain,
        status: 'active',
        latestDeployment: {
          id: `dep-${Date.now()}`,
          commitHash: 'initial',
          commitMessage: 'Initial project setup and trigger',
          status: 'success',
          createdAt: new Date().toISOString(),
        },
        createdAt: new Date().toISOString(),
      };
      fallbackProjects.unshift(newProject);

      try {
        await supabase.from('cloud_pages_projects').insert({
          tenant_id: tenantId,
          name: projectName,
          git_repo: finalGitRepo,
          branch,
          build_command: buildCommand,
          output_dir: outputDir,
          domain: projectDomain,
          status: 'active',
        });
      } catch {}

      return ok({
        status: 'executed',
        project: newProject,
        gateway: gatewayResult,
      });
    }

    return ok(gatewayResult, { status: 202 });
  } catch (caughtErr: unknown) {
    const errorMsg = caughtErr instanceof Error ? caughtErr.message : 'Unknown error';
    return err('INTERNAL_ERROR', errorMsg, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { projectId, id, branch = 'main', commitMessage, options = {}, intent } = body;
    const targetId = projectId || id;

    const supabase = createServerClient();
    const { data: { user } } = await supabase.auth.getUser().catch(() => ({ data: { user: null } }));
    const actorId = user?.id || 'user_active_session';
    const tenantId = (user?.user_metadata?.tenant_id as string) || 'ten_portal_default';

    if (intent) {
      const result = await processActionIntent(intent as ActionIntent, options);
      return ok(result);
    }

    if (!targetId) {
      return err('BAD_REQUEST', 'Project ID is required to trigger deployment', { status: 400 });
    }

    // Tier 1 for deploy
    const actionIntent: ActionIntent = {
      intentId: crypto.randomUUID(),
      actor: {
        id: actorId,
        type: 'user',
        tenantId,
        roles: ['tenant_developer'],
      },
      targetService: 'compute',
      actionVerb: 'deploy',
      resourceUri: `compute://pages/projects/${targetId}/deployments`,
      parameters: { projectId: targetId, branch, commitMessage: commitMessage || 'Manual trigger from API' },
      idempotencyKey: `pages_dep_${Date.now()}_${targetId}`,
      createdAt: new Date().toISOString(),
    };

    const execOptions = {
      ...options,
      tenantPolicyOverrides: [
        ...(options.tenantPolicyOverrides || []),
        { tenantId, enforceTier: 1 as const },
      ],
    };

    const gatewayResult = await processActionIntent(actionIntent, execOptions);
    if (gatewayResult.status === 'executed') {
      const deployment: DeploymentInfo = {
        id: `dep-${Date.now()}`,
        commitHash: crypto.randomUUID().slice(0, 7),
        commitMessage: commitMessage || 'Manual deployment triggered',
        status: 'building',
        createdAt: new Date().toISOString(),
      };

      const project = fallbackProjects.find(p => p.id === targetId || p.name === targetId);
      if (project) {
        project.latestDeployment = deployment;
        project.status = 'building';
        setTimeout(() => {
          project.status = 'active';
          if (project.latestDeployment) project.latestDeployment.status = 'success';
        }, 3000);
      }

      try {
        await supabase.from('cloud_deployments').insert({
          project_id: targetId,
          commit_hash: deployment.commitHash,
          commit_message: deployment.commitMessage,
          status: 'building',
        });
      } catch {}

      return ok({
        status: 'executed',
        deployment,
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
    const id = searchParams.get('id') || searchParams.get('projectId') || body.id || body.projectId;
    const options = body.options || {};

    if (!id) {
      return err('BAD_REQUEST', 'Project ID is required for deletion', { status: 400 });
    }

    const supabase = createServerClient();
    const { data: { user } } = await supabase.auth.getUser().catch(() => ({ data: { user: null } }));
    const actorId = user?.id || 'user_active_session';
    const tenantId = (user?.user_metadata?.tenant_id as string) || 'ten_portal_default';

    // Tier 1 for delete
    const actionIntent: ActionIntent = {
      intentId: crypto.randomUUID(),
      actor: {
        id: actorId,
        type: 'user',
        tenantId,
        roles: ['tenant_admin'],
      },
      targetService: 'compute',
      actionVerb: 'delete',
      resourceUri: `compute://pages/projects/${id}`,
      parameters: { projectId: id },
      idempotencyKey: `pages_del_${Date.now()}_${id}`,
      createdAt: new Date().toISOString(),
    };

    const execOptions = {
      ...options,
      tenantPolicyOverrides: [
        ...(options.tenantPolicyOverrides || []),
        { tenantId, enforceTier: 1 as const },
      ],
    };

    const gatewayResult = await processActionIntent(actionIntent, execOptions);
    if (gatewayResult.status === 'executed') {
      fallbackProjects = fallbackProjects.filter(p => p.id !== id && p.name !== id);
      try {
        await supabase.from('cloud_pages_projects').delete().or(`id.eq.${id},name.eq.${id}`);
      } catch {}

      return ok({ message: `Project ${id} deleted.`, gateway: gatewayResult });
    }

    return ok(gatewayResult, { status: 202 });
  } catch (caughtErr: unknown) {
    const errorMsg = caughtErr instanceof Error ? caughtErr.message : 'Unknown error';
    return err('INTERNAL_ERROR', errorMsg, { status: 500 });
  }
}
