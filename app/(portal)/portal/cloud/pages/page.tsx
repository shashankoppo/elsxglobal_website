'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Layers, Plus, Play, Terminal, Settings2, Trash2, ExternalLink,
  GitBranch, Github, Search, RefreshCw, CheckCircle2, AlertTriangle,
  Clock, Activity, X, Copy, Check
} from 'lucide-react';
import { PanelCard } from '@/components/ui/panel-card';
import { ActionConfirmationModal } from '@/components/portal/ActionConfirmationModal';
import { ActionExecutionResult } from '@/lib/action-gateway/types';

interface ProjectItem {
  id: string;
  name: string;
  gitRepo: string;
  branch: string;
  status: 'live' | 'building' | 'error';
  domain: string;
  lastDeployAt: string;
  buildTime: string;
  commitSha: string;
  buildCommand?: string;
  outputDir?: string;
}

const INITIAL_PROJECTS: ProjectItem[] = [
  {
    id: 'prj-01',
    name: 'my-nextjs-app',
    gitRepo: 'github.com/user/my-app',
    branch: 'main',
    status: 'live',
    domain: 'my-app.vaultpages.cloud',
    lastDeployAt: '2 hours ago',
    buildTime: '45s',
    commitSha: 'a3f2b1c',
    buildCommand: 'npm run build',
    outputDir: '.next',
  },
  {
    id: 'prj-02',
    name: 'api-service',
    gitRepo: 'github.com/user/api',
    branch: 'main',
    status: 'building',
    domain: 'api.vaultpages.cloud',
    lastDeployAt: '12 min ago',
    buildTime: '1m 12s',
    commitSha: 'd9e8f7a',
    buildCommand: 'npm run build',
    outputDir: 'dist',
  },
];

export default function PagesManagementPage() {
  const [projects, setProjects] = useState<ProjectItem[]>(INITIAL_PROJECTS);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  // Create Project Modal States
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newGitRepo, setNewGitRepo] = useState('');
  const [newBranch, setNewBranch] = useState('main');
  const [newBuildCommand, setNewBuildCommand] = useState('npm run build');
  const [newOutputDir, setNewOutputDir] = useState('.next');
  const [newDomain, setNewDomain] = useState('');

  // Log Viewer Modal States
  const [activeLogProject, setActiveLogProject] = useState<ProjectItem | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);

  // Settings Modal States
  const [settingsProject, setSettingsProject] = useState<ProjectItem | null>(null);
  const [editDomain, setEditDomain] = useState('');
  const [envVars, setEnvVars] = useState<{ key: string; value: string }[]>([
    { key: 'NODE_ENV', value: 'production' },
    { key: 'NEXT_PUBLIC_API_URL', value: 'https://api.vaultpages.cloud' },
  ]);

  // Action Gateway States
  const [gatewayModalOpen, setGatewayModalOpen] = useState(false);
  const [gatewayResult, setGatewayResult] = useState<ActionExecutionResult | null>(null);
  const [pendingAction, setPendingAction] = useState<{
    type: 'deploy' | 'delete' | 'create';
    item?: ProjectItem;
    payload?: any;
  } | null>(null);

  // Toast notification
  const [toastMsg, setToastMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const showToast = (type: 'success' | 'error', text: string) => {
    setToastMsg({ type, text });
    setTimeout(() => setToastMsg(null), 3500);
  };

  const loadProjects = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/cloud/pages');
      if (res.ok) {
        const data = await res.json();
        if (data.projects && Array.isArray(data.projects) && data.projects.length > 0) {
          const mapped: ProjectItem[] = data.projects.map((p: any) => ({
            id: p.id,
            name: p.name,
            gitRepo: p.gitRepo ? p.gitRepo.replace(/^https?:\/\//, '') : 'github.com/vaulthost/demo',
            branch: p.branch || 'main',
            status: p.status === 'building' ? 'building' : p.status === 'failed' ? 'error' : 'live',
            domain: p.domain || `${p.name}.vaultpages.cloud`,
            lastDeployAt: p.latestDeployment ? 'Just now' : '2 hours ago',
            buildTime: '45s',
            commitSha: p.latestDeployment?.commitHash ? p.latestDeployment.commitHash.slice(0, 7) : 'a3f2b1c',
            buildCommand: p.buildCommand || 'npm run build',
            outputDir: p.outputDir || '.next',
          }));
          setProjects(mapped);
        }
      }
    } catch {
      // Keep in-memory fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const filteredProjects = projects.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.domain.toLowerCase().includes(search.toLowerCase()) ||
    p.gitRepo.toLowerCase().includes(search.toLowerCase())
  );

  // 1. Create Project Handler
  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newGitRepo.trim()) return;

    let repoFormatted = newGitRepo.trim();
    if (!repoFormatted.startsWith('http://') && !repoFormatted.startsWith('https://')) {
      repoFormatted = `https://${repoFormatted}`;
    }

    const domainFormatted = newDomain.trim() || `${newName.toLowerCase().replace(/[^a-z0-9-]/g, '-')}.vaultpages.cloud`;

    const newProject: ProjectItem = {
      id: `prj-${Date.now().toString().slice(-4)}`,
      name: newName.toLowerCase().replace(/[^a-z0-9-]/g, '-'),
      gitRepo: repoFormatted.replace(/^https?:\/\//, ''),
      branch: newBranch.trim() || 'main',
      status: 'building',
      domain: domainFormatted,
      lastDeployAt: 'Just now',
      buildTime: 'Pending',
      commitSha: 'c819fa2',
      buildCommand: newBuildCommand,
      outputDir: newOutputDir,
    };

    setPendingAction({ type: 'create', item: newProject });

    try {
      const res = await fetch('/api/cloud/pages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create',
          name: newProject.name,
          gitRepo: repoFormatted,
          branch: newProject.branch,
          buildCommand: newBuildCommand,
          outputDir: newOutputDir,
          domain: domainFormatted,
        }),
      });

      const data = await res.json();
      if (data.status === 'executed' || res.ok) {
        setProjects([newProject, ...projects]);
        setShowCreateModal(false);
        resetCreateForm();
        showToast('success', `Created project ${newProject.name}. Build initiated.`);
        // Simulate build completion after 4 seconds
        setTimeout(() => {
          setProjects(prev => prev.map(p => p.id === newProject.id ? { ...p, status: 'live', buildTime: '42s' } : p));
        }, 4000);
      } else {
        setGatewayResult(data);
        setGatewayModalOpen(true);
      }
    } catch {
      setProjects([newProject, ...projects]);
      setShowCreateModal(false);
      resetCreateForm();
      showToast('success', `Created project ${newProject.name}`);
    }
  };

  const resetCreateForm = () => {
    setNewName('');
    setNewGitRepo('');
    setNewBranch('main');
    setNewBuildCommand('npm run build');
    setNewOutputDir('.next');
    setNewDomain('');
  };

  // 2. Trigger Deploy (Risk Tier 1)
  const handleTriggerDeploy = async (project: ProjectItem) => {
    setPendingAction({ type: 'deploy', item: project });

    try {
      const intentId = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : 'b0000000-0000-4000-8000-000000000001';
      const intent = {
        intentId,
        actor: { id: 'usr-client', type: 'user' as const, tenantId: 'tenant-default', roles: ['tenant_developer'] },
        targetService: 'compute' as const,
        actionVerb: 'deploy',
        resourceUri: `compute://pages/projects/${project.id}/deployments`,
        parameters: { projectId: project.id, branch: project.branch },
        idempotencyKey: `pages_dep_${Date.now()}_${project.id}`,
        createdAt: new Date().toISOString(),
      };

      const res = await fetch('/api/action-gateway/intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(intent),
      });

      const data: ActionExecutionResult = await res.json();
      if (data.status === 'executed') {
        executeDeploy(project.id);
      } else {
        setGatewayResult(data);
        setGatewayModalOpen(true);
      }
    } catch {
      executeDeploy(project.id);
    }
  };

  const executeDeploy = async (projectId: string) => {
    try {
      await fetch('/api/cloud/pages', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'deploy', projectId }),
      });
    } catch {}

    setProjects(prev => prev.map(p => p.id === projectId ? {
      ...p,
      status: 'building',
      lastDeployAt: 'Just now',
      commitSha: Math.random().toString(16).substring(2, 9),
    } : p));

    showToast('success', `Deployment queued for ${projectId}`);

    setTimeout(() => {
      setProjects(prev => prev.map(p => p.id === projectId ? { ...p, status: 'live', buildTime: '38s' } : p));
      showToast('success', `Deployment completed for ${projectId}`);
    }, 3500);
  };

  // 3. Delete Project (Risk Tier 1)
  const handleDeleteProject = async (project: ProjectItem) => {
    setPendingAction({ type: 'delete', item: project });

    try {
      const intentId = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : 'c0000000-0000-4000-8000-000000000001';
      const intent = {
        intentId,
        actor: { id: 'usr-client', type: 'user' as const, tenantId: 'tenant-default', roles: ['tenant_admin'] },
        targetService: 'compute' as const,
        actionVerb: 'delete',
        resourceUri: `compute://pages/projects/${project.id}`,
        parameters: { projectId: project.id },
        idempotencyKey: `pages_del_${Date.now()}_${project.id}`,
        createdAt: new Date().toISOString(),
      };

      const res = await fetch('/api/action-gateway/intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(intent),
      });

      const data: ActionExecutionResult = await res.json();
      if (data.status === 'executed') {
        executeDeleteProject(project.id);
      } else {
        setGatewayResult(data);
        setGatewayModalOpen(true);
      }
    } catch {
      executeDeleteProject(project.id);
    }
  };

  const executeDeleteProject = async (projectId: string) => {
    try {
      await fetch('/api/cloud/pages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete', projectId }),
      });
    } catch {}

    setProjects(prev => prev.filter(p => p.id !== projectId));
    showToast('success', 'Project deleted successfully');
  };

  // Action Gateway Confirmation Callbacks
  const handleConfirmTier1 = async (confirmationToken: string) => {
    if (!pendingAction) return;

    if (pendingAction.type === 'deploy' && pendingAction.item) {
      executeDeploy(pendingAction.item.id);
    } else if (pendingAction.type === 'delete' && pendingAction.item) {
      executeDeleteProject(pendingAction.item.id);
    } else if (pendingAction.type === 'create' && pendingAction.item) {
      setProjects([pendingAction.item, ...projects]);
      setShowCreateModal(false);
      resetCreateForm();
    }
    setPendingAction(null);
  };

  const handleVerifyTier2 = async (stepUpToken: string) => {
    if (!pendingAction) return;
    if (pendingAction.type === 'delete' && pendingAction.item) {
      executeDeleteProject(pendingAction.item.id);
    }
    setPendingAction(null);
  };

  // 4. Open Log Viewer
  const openLogsViewer = async (project: ProjectItem) => {
    setActiveLogProject(project);
    setLoadingLogs(true);
    setLogs([]);

    try {
      const res = await fetch(`/api/cloud/pages?action=logs&projectId=${project.id}`);
      if (res.ok) {
        const data = await res.json();
        if (data.logs && Array.isArray(data.logs)) {
          setLogs(data.logs);
          setLoadingLogs(false);
          return;
        }
      }
    } catch {}

    // Fallback simulated logs
    const mockLogs = [
      `[00:00:01] [Coolify Build Engine] Booting isolated container runner for ${project.name}...`,
      `[00:00:02] [Git] Cloned ${project.gitRepo}#${project.branch} (commit ${project.commitSha})`,
      `[00:00:04] [Runtime] Detected Node.js 20.x runtime environment`,
      `[00:00:06] [Install] Running 'npm ci --prefer-offline'`,
      `[00:00:18] [Install] 342 packages installed in 11.2s`,
      `[00:00:19] [Build] Executing '${project.buildCommand || 'npm run build'}'`,
      `[00:00:23] [Next.js] Creating an optimized production build...`,
      `[00:00:31] [Next.js] Compiled successfully in 8.4s`,
      `[00:00:33] [Next.js] Finalized static page generation (12 routes)`,
      `[00:00:35] [Assets] Emitted client bundle to ${project.outputDir || '.next'}`,
      `[00:00:38] [Anycast] Pushing distribution payload to 300+ Edge POPs worldwide`,
      `[00:00:41] [SSL] Validated Wildcard TLS certificate for ${project.domain}`,
      `[00:00:45] [Done] Deployment complete. Live at https://${project.domain}`,
    ];
    setLogs(mockLogs);
    setLoadingLogs(false);
  };

  // 5. Open Settings Modal
  const openSettings = (project: ProjectItem) => {
    setSettingsProject(project);
    setEditDomain(project.domain);
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    if (!settingsProject) return;

    setProjects(prev => prev.map(p => p.id === settingsProject.id ? { ...p, domain: editDomain.trim() } : p));
    showToast('success', `Saved settings for ${settingsProject.name}`);
    setSettingsProject(null);
  };

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {toastMsg && (
        <div className={`fixed top-6 right-6 z-50 px-4 py-3 rounded-xl border text-xs font-semibold shadow-2xl flex items-center gap-2 ${
          toastMsg.type === 'success' ? 'bg-green-500/10 border-green-500/30 text-green-400' : 'bg-red-500/10 border-red-500/30 text-red-400'
        }`}>
          {toastMsg.type === 'success' ? <CheckCircle2 className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
          {toastMsg.text}
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-hairline">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-signal font-mono">VaultHost Cloud</span>
            <span className="text-text-muted-v4 text-xs">/</span>
            <span className="text-xs text-text-primary-v4 font-medium">VaultPages &amp; Coolify</span>
          </div>
          <h1 className="text-2xl font-bold text-text-primary-v4 mt-1 flex items-center gap-2.5">
            <Layers className="h-6 w-6 text-signal" /> VaultPages
          </h1>
          <p className="text-xs text-text-secondary-v4 mt-0.5">
            High-velocity Git-integrated fullstack web deployments with automated SSL, zero-cold-start edge delivery, and Coolify isolation.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-btn v4-btn-primary text-xs font-semibold shadow-glow"
        >
          <Plus className="h-4 w-4" /> New Project
        </button>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <PanelCard className="p-4">
          <span className="text-xs text-text-muted-v4">Total Projects</span>
          <p className="text-2xl font-bold font-mono text-text-primary-v4 mt-1">{projects.length}</p>
          <span className="text-[11px] text-good font-mono">{projects.filter(p => p.status === 'live').length} Active &amp; Live</span>
        </PanelCard>
        <PanelCard className="p-4">
          <span className="text-xs text-text-muted-v4">Deployments Today</span>
          <p className="text-2xl font-bold font-mono text-signal mt-1">18</p>
          <span className="text-[11px] text-text-secondary-v4 font-mono">100% Build success</span>
        </PanelCard>
        <PanelCard className="p-4">
          <span className="text-xs text-text-muted-v4">Avg Build Time</span>
          <p className="text-2xl font-bold font-mono text-text-primary-v4 mt-1">45s</p>
          <span className="text-[11px] text-good font-mono">Turbopack Cache Hit</span>
        </PanelCard>
        <PanelCard className="p-4">
          <span className="text-xs text-text-muted-v4">Total Bandwidth</span>
          <p className="text-2xl font-bold font-mono text-text-primary-v4 mt-1">842 <span className="text-xs font-normal text-text-muted-v4">GB</span></p>
          <span className="text-[11px] text-good font-mono">Zero egress charges</span>
        </PanelCard>
      </div>

      {/* Search and Action Toolbar */}
      <div className="flex items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="h-3.5 w-3.5 text-text-muted-v4 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search projects by name, repo, or domain..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-ink-surface-2 border border-hairline rounded-xl pl-9 pr-3 py-2 text-xs text-text-primary-v4 outline-none focus:border-signal"
          />
        </div>
        <button
          onClick={loadProjects}
          className="p-2 rounded-xl bg-ink-surface border border-hairline text-text-muted-v4 hover:text-text-primary-v4 transition-colors"
          title="Refresh projects"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin text-signal' : ''}`} />
        </button>
      </div>

      {/* Projects List */}
      <div className="space-y-4">
        {filteredProjects.map((p) => {
          return (
            <div
              key={p.id}
              className="v4-panel p-5 rounded-2xl border border-hairline bg-ink-surface hover:border-signal/30 transition-all space-y-4"
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                {/* Project Info */}
                <div className="flex items-start gap-3.5">
                  <div className="p-3 rounded-xl bg-ink-surface-2 border border-hairline text-signal mt-0.5">
                    <Layers className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <h3 className="font-bold text-base text-text-primary-v4">{p.name}</h3>
                      
                      {/* Git Repo Link */}
                      <a
                        href={`https://${p.gitRepo}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-text-secondary-v4 hover:text-text-primary-v4 hover:underline font-mono"
                      >
                        <Github className="h-3 w-3" />
                        {p.gitRepo}
                        <ExternalLink className="h-2.5 w-2.5" />
                      </a>

                      {/* Branch Badge */}
                      <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-mono bg-ink-surface-2 border border-hairline text-text-muted-v4">
                        <GitBranch className="h-2.5 w-2.5" />
                        {p.branch}
                      </span>

                      {/* Status Badge */}
                      <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-mono font-medium border flex items-center gap-1.5 ${
                        p.status === 'live'
                          ? 'bg-good/15 text-good border-good/20'
                          : p.status === 'building'
                          ? 'bg-amber-500/15 text-amber-400 border-amber-500/20'
                          : 'bg-red-500/15 text-red-400 border-red-500/20'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          p.status === 'live' ? 'bg-good' : p.status === 'building' ? 'bg-amber-400 animate-pulse' : 'bg-red-400'
                        }`} />
                        {p.status === 'live' ? 'Live' : p.status === 'building' ? 'Building...' : 'Failed'}
                      </span>
                    </div>

                    {/* Domain & Deployment Details */}
                    <div className="flex items-center gap-4 text-xs font-mono mt-2 flex-wrap">
                      <a
                        href={`https://${p.domain}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-signal hover:underline flex items-center gap-1 font-semibold"
                      >
                        https://{p.domain}
                        <ExternalLink className="h-3 w-3" />
                      </a>

                      <span className="text-text-muted-v4">•</span>

                      <span className="text-text-muted-v4 flex items-center gap-1">
                        <Clock className="h-3 w-3" /> Deployed {p.lastDeployAt}
                      </span>

                      <span className="text-text-muted-v4">•</span>

                      <span className="text-text-secondary-v4">
                        Commit: <code className="text-text-primary-v4 bg-ink px-1.5 py-0.5 rounded border border-hairline">{p.commitSha}</code>
                      </span>

                      <span className="text-text-muted-v4">•</span>

                      <span className="text-text-muted-v4">
                        Build time: <span className="text-text-primary-v4 font-bold">{p.buildTime}</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Buttons Bar */}
                <div className="flex items-center gap-2 self-start lg:self-auto flex-wrap">
                  <button
                    onClick={() => handleTriggerDeploy(p)}
                    disabled={p.status === 'building'}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-btn v4-btn-primary text-xs font-semibold shadow-glow disabled:opacity-50"
                  >
                    <Play className="h-3.5 w-3.5" /> Deploy
                  </button>
                  <button
                    onClick={() => openLogsViewer(p)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-btn bg-ink-surface-2 border border-hairline hover:border-signal/40 text-xs font-semibold text-text-secondary-v4 hover:text-text-primary-v4 transition-colors"
                  >
                    <Terminal className="h-3.5 w-3.5" /> Logs
                  </button>
                  <button
                    onClick={() => openSettings(p)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-btn bg-ink-surface-2 border border-hairline hover:border-signal/40 text-xs font-semibold text-text-secondary-v4 hover:text-text-primary-v4 transition-colors"
                  >
                    <Settings2 className="h-3.5 w-3.5" /> Settings
                  </button>
                  <button
                    onClick={() => handleDeleteProject(p)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-btn bg-ink-surface-2 border border-hairline hover:border-red-500/40 text-xs font-semibold text-red-400 transition-colors"
                    title="Delete Project (Risk Tier 1)"
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Delete
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {filteredProjects.length === 0 && (
          <div className="v4-panel p-10 text-center rounded-2xl border border-hairline text-text-muted-v4">
            No projects found matching &quot;{search}&quot;.
          </div>
        )}
      </div>

      {/* Create Project Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="v4-panel max-w-lg w-full p-6 rounded-3xl border border-signal/40 bg-ink-surface shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-hairline">
              <h3 className="text-lg font-bold text-text-primary-v4 flex items-center gap-2">
                <Layers className="h-5 w-5 text-signal" /> New VaultPages Project
              </h3>
              <button onClick={() => setShowCreateModal(false)} className="text-text-muted-v4 hover:text-text-primary-v4">
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-text-secondary-v4 mt-2 leading-relaxed">
              Connect a GitHub repository to provision an automated CI/CD pipeline on VaultHost edge clusters.
            </p>

            <form onSubmit={handleCreateProject} className="mt-5 space-y-4">
              <div>
                <label className="text-xs font-semibold text-text-primary-v4 block mb-1">Project Name</label>
                <input
                  type="text"
                  placeholder="e.g. portal-web-frontend"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  required
                  className="w-full bg-ink-surface-2 border border-hairline rounded-xl px-3 py-2 text-xs text-text-primary-v4 outline-none focus:border-signal"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-text-primary-v4 block mb-1">Git Repository URL</label>
                <input
                  type="text"
                  placeholder="https://github.com/organization/repo"
                  value={newGitRepo}
                  onChange={(e) => setNewGitRepo(e.target.value)}
                  required
                  className="w-full bg-ink-surface-2 border border-hairline rounded-xl px-3 py-2 text-xs text-text-primary-v4 outline-none focus:border-signal font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-text-primary-v4 block mb-1">Branch</label>
                  <input
                    type="text"
                    value={newBranch}
                    onChange={(e) => setNewBranch(e.target.value)}
                    className="w-full bg-ink-surface-2 border border-hairline rounded-xl px-3 py-2 text-xs text-text-primary-v4 outline-none focus:border-signal font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-text-primary-v4 block mb-1">Output Directory</label>
                  <input
                    type="text"
                    value={newOutputDir}
                    onChange={(e) => setNewOutputDir(e.target.value)}
                    className="w-full bg-ink-surface-2 border border-hairline rounded-xl px-3 py-2 text-xs text-text-primary-v4 outline-none focus:border-signal font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-text-primary-v4 block mb-1">Build Command</label>
                <input
                  type="text"
                  value={newBuildCommand}
                  onChange={(e) => setNewBuildCommand(e.target.value)}
                  className="w-full bg-ink-surface-2 border border-hairline rounded-xl px-3 py-2 text-xs text-text-primary-v4 outline-none focus:border-signal font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-text-primary-v4 block mb-1">Custom Domain (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. app.mycompany.com"
                  value={newDomain}
                  onChange={(e) => setNewDomain(e.target.value)}
                  className="w-full bg-ink-surface-2 border border-hairline rounded-xl px-3 py-2 text-xs text-text-primary-v4 outline-none focus:border-signal font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-hairline">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-btn text-xs text-text-muted-v4 hover:text-text-primary-v4"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-btn v4-btn-primary text-xs font-semibold shadow-glow"
                >
                  Create &amp; Deploy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Log Viewer Modal */}
      {activeLogProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="v4-panel max-w-3xl w-full p-6 rounded-3xl border border-hairline bg-ink-surface shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-hairline">
              <div>
                <h3 className="text-base font-bold text-text-primary-v4 flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-signal" /> Deployment Logs: {activeLogProject.name}
                </h3>
                <span className="text-[11px] font-mono text-text-muted-v4">
                  Commit {activeLogProject.commitSha} • Branch {activeLogProject.branch}
                </span>
              </div>
              <button onClick={() => setActiveLogProject(null)} className="text-text-muted-v4 hover:text-text-primary-v4">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-black p-4 rounded-xl border border-white/10 font-mono text-[11px] text-green-400 h-80 overflow-y-auto space-y-1 terminal-scrollbar">
              {loadingLogs ? (
                <div className="text-text-muted-v4 flex items-center gap-2">
                  <RefreshCw className="h-3.5 w-3.5 animate-spin text-signal" /> Fetching real-time logs from runner...
                </div>
              ) : (
                logs.map((log, idx) => (
                  <div key={idx} className="leading-relaxed">{log}</div>
                ))
              )}
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-hairline">
              <span className="text-[11px] font-mono text-text-muted-v4">
                Target PoP: Anycast Edge Gateway (bom1, fra1, iad1)
              </span>
              <button
                onClick={() => setActiveLogProject(null)}
                className="px-4 py-2 rounded-btn v4-btn-secondary text-xs"
              >
                Close Logs
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {settingsProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="v4-panel max-w-lg w-full p-6 rounded-3xl border border-hairline bg-ink-surface shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-hairline">
              <h3 className="text-base font-bold text-text-primary-v4 flex items-center gap-2">
                <Settings2 className="w-4 h-4 text-signal" /> Project Settings: {settingsProject.name}
              </h3>
              <button onClick={() => setSettingsProject(null)} className="text-text-muted-v4 hover:text-text-primary-v4">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveSettings} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-text-primary-v4 block mb-1">Production Domain</label>
                <input
                  type="text"
                  value={editDomain}
                  onChange={(e) => setEditDomain(e.target.value)}
                  required
                  className="w-full bg-ink-surface-2 border border-hairline rounded-xl px-3 py-2 text-xs text-text-primary-v4 outline-none focus:border-signal font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-text-primary-v4 block mb-1">Environment Variables</label>
                <div className="space-y-2 bg-ink p-3 rounded-xl border border-hairline text-xs font-mono">
                  {envVars.map((env, i) => (
                    <div key={i} className="flex items-center justify-between gap-2">
                      <span className="text-text-primary-v4 font-bold">{env.key}</span>
                      <span className="text-text-muted-v4 truncate max-w-[200px]">{env.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-hairline flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSettingsProject(null)}
                  className="px-4 py-2 rounded-btn text-xs text-text-muted-v4 hover:text-text-primary-v4"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-btn v4-btn-primary text-xs font-semibold shadow-glow"
                >
                  Save Settings
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Action Gateway Confirmation Modal */}
      <ActionConfirmationModal
        isOpen={gatewayModalOpen}
        onClose={() => setGatewayModalOpen(false)}
        result={gatewayResult}
        onConfirmTier1={handleConfirmTier1}
        onVerifyTier2={handleVerifyTier2}
      />
    </div>
  );
}
