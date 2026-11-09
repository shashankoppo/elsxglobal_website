import { createClient } from '@supabase/supabase-js';

export interface CoolifyProject {
  id: string;
  name: string;
  status: 'running' | 'stopped' | 'deploying' | 'error';
  url?: string;
  domain?: string;
  repo?: string;
  branch?: string;
  buildpackType?: string;
}

export interface Deployment {
  id: string;
  projectId: string;
  status: 'success' | 'failed' | 'running' | 'queued';
  commitSha: string;
  createdAt: string;
  logs?: string;
}

export interface CoolifyResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Coolify API Client.
 * Orchestrates Git-backed web applications, automated builds, deployments, environment variables, and custom domains.
 */
export class CoolifyClient {
  private config: Record<string, any>;
  private configLoaded: boolean = false;

  /**
   * Initializes the Coolify client.
   * @param config Optional initial configuration object (e.g. from provisioning_settings).
   */
  constructor(config?: Record<string, any>) {
    this.config = config ? { ...config } : {};
  }

  /**
   * Resolves a configuration value from explicit config, Supabase provisioning_settings row id=1, or environment variables.
   */
  private async getConfigValue(key: string, envVar?: string): Promise<string | undefined> {
    if (this.config[key] !== undefined && this.config[key] !== '') {
      return String(this.config[key]);
    }

    if (!this.configLoaded) {
      try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
        if (supabaseUrl && supabaseServiceKey) {
          const supabase = createClient(supabaseUrl, supabaseServiceKey);
          const { data } = await supabase.from('provisioning_settings').select('*').eq('id', 1).single();
          if (data) {
            this.config = { ...data, ...this.config };
          }
        }
      } catch (err: any) {
        console.warn('[CoolifyClient] Failed to load configuration from Supabase:', err.message);
      }
      this.configLoaded = true;
    }

    if (this.config[key] !== undefined && this.config[key] !== '') {
      return String(this.config[key]);
    }

    if (envVar && process.env[envVar] !== undefined && process.env[envVar] !== '') {
      return process.env[envVar];
    }

    return undefined;
  }

  /**
   * Sends an authenticated request to the Coolify v1 API.
   * @param endpoint API subpath (e.g. /api/v1/applications)
   * @param method HTTP method
   * @param body Optional request payload
   */
  private async fetchCoolifyAPI(endpoint: string, method: string = 'GET', body?: any): Promise<Response> {
    const rawUrl = (await this.getConfigValue('coolify_base_url', 'COOLIFY_BASE_URL')) || 'http://localhost:8000';
    const apiKey = (await this.getConfigValue('coolify_api_key', 'COOLIFY_API_KEY')) || '';

    const baseUrl = rawUrl.replace(/\/+$/, '');
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    if (apiKey) {
      headers['Authorization'] = `Bearer ${apiKey}`;
    }

    return fetch(`${baseUrl}${cleanEndpoint}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  /**
   * Maps a raw Coolify application response object into the standard CoolifyProject interface.
   */
  private mapCoolifyProject(item: any): CoolifyProject {
    const rawStatus = String(item.status || '').toLowerCase();
    let status: 'running' | 'stopped' | 'deploying' | 'error' = 'stopped';

    if (rawStatus.includes('running') || rawStatus === 'active') {
      status = 'running';
    } else if (rawStatus.includes('deploy') || rawStatus.includes('building') || rawStatus === 'queued') {
      status = 'deploying';
    } else if (rawStatus.includes('error') || rawStatus.includes('failed') || rawStatus.includes('crashed')) {
      status = 'error';
    }

    return {
      id: item.uuid || item.id || '',
      name: item.name || '',
      status,
      url: item.fqdn || undefined,
      domain: item.fqdn || undefined,
      repo: item.git_repository || undefined,
      branch: item.git_branch || undefined,
      buildpackType: item.build_pack || undefined,
    };
  }

  /**
   * Lists applications deployed on Coolify, optionally filtered by team ID.
   * @param teamId Optional team ID filter
   */
  async listProjects(teamId?: string): Promise<CoolifyResponse<CoolifyProject[]>> {
    try {
      const endpoint = teamId ? `/api/v1/applications?team_id=${encodeURIComponent(teamId)}` : '/api/v1/applications';
      const res = await this.fetchCoolifyAPI(endpoint, 'GET');

      if (!res.ok) {
        const errText = await res.text();
        return { success: false, error: `Failed to list Coolify applications: ${errText}` };
      }

      const json = await res.json();
      const rawList: any[] = Array.isArray(json) ? json : json.data || [];
      const projects = rawList.map((item) => this.mapCoolifyProject(item));

      return { success: true, data: projects };
    } catch (error: any) {
      return { success: false, error: error.message || 'Unknown error occurred while listing projects' };
    }
  }

  /**
   * Creates a new Git-connected web application on Coolify.
   * @param opts Project build and deployment parameters
   */
  async createProject(opts: {
    name: string;
    gitRepo: string;
    branch: string;
    buildCommand?: string;
    startCommand?: string;
    envVars?: Record<string, string>;
    domain?: string;
  }): Promise<CoolifyResponse<CoolifyProject>> {
    try {
      const payload: Record<string, any> = {
        name: opts.name,
        git_repository: opts.gitRepo,
        git_branch: opts.branch,
        build_pack: 'nixpacks',
        ports_exposes: '3000',
        fqdn: opts.domain || null,
        build_command: opts.buildCommand || null,
        start_command: opts.startCommand || null,
      };

      const res = await this.fetchCoolifyAPI('/api/v1/applications', 'POST', payload);
      if (!res.ok) {
        const errText = await res.text();
        return { success: false, error: `Failed to create Coolify application: ${errText}` };
      }

      const created = await res.json();
      const project = this.mapCoolifyProject(created);

      // Set environment variables if provided
      if (opts.envVars && Object.keys(opts.envVars).length > 0 && project.id) {
        await this.setEnvVars(project.id, opts.envVars);
      }

      return { success: true, data: project };
    } catch (error: any) {
      return { success: false, error: error.message || 'Unknown error occurred while creating project' };
    }
  }

  /**
   * Deletes an application project from Coolify.
   * @param projectId Project UUID or identifier
   */
  async deleteProject(projectId: string): Promise<CoolifyResponse<void>> {
    try {
      const res = await this.fetchCoolifyAPI(`/api/v1/applications/${encodeURIComponent(projectId)}`, 'DELETE');
      if (!res.ok && res.status !== 404) {
        const errText = await res.text();
        return { success: false, error: `Failed to delete Coolify project: ${errText}` };
      }

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message || 'Unknown error occurred while deleting project' };
    }
  }

  /**
   * Triggers a new build and deployment for the given application.
   * @param projectId Project UUID or identifier
   */
  async triggerDeploy(projectId: string): Promise<CoolifyResponse<{ deploymentId: string }>> {
    try {
      const res = await this.fetchCoolifyAPI(`/api/v1/deploy?uuid=${encodeURIComponent(projectId)}&force=true`, 'POST');
      if (!res.ok) {
        const errText = await res.text();
        return { success: false, error: `Failed to trigger deployment: ${errText}` };
      }

      const json = await res.json();
      const deploymentId = json.deployment_uuid || json.id || json.uuid || projectId;

      return { success: true, data: { deploymentId } };
    } catch (error: any) {
      return { success: false, error: error.message || 'Unknown error occurred while triggering deployment' };
    }
  }

  /**
   * Retrieves status and build logs for an application deployment.
   * @param deploymentId Deployment UUID
   */
  async getDeploymentLogs(deploymentId: string): Promise<CoolifyResponse<Deployment>> {
    try {
      const res = await this.fetchCoolifyAPI(`/api/v1/deployments/${encodeURIComponent(deploymentId)}`, 'GET');
      if (!res.ok) {
        const errText = await res.text();
        return { success: false, error: `Failed to fetch deployment logs: ${errText}` };
      }

      const data = await res.json();
      const rawStatus = String(data.status || '').toLowerCase();
      let status: 'success' | 'failed' | 'running' | 'queued' = 'queued';

      if (rawStatus === 'finished' || rawStatus === 'success') {
        status = 'success';
      } else if (rawStatus === 'failed' || rawStatus === 'error') {
        status = 'failed';
      } else if (rawStatus === 'in_progress' || rawStatus === 'running') {
        status = 'running';
      }

      const deployment: Deployment = {
        id: deploymentId,
        projectId: data.application_id || data.application_uuid || '',
        status,
        commitSha: data.commit || data.commit_sha || '',
        createdAt: data.created_at || new Date().toISOString(),
        logs: data.logs || data.deployment_logs || '',
      };

      return { success: true, data: deployment };
    } catch (error: any) {
      return { success: false, error: error.message || 'Unknown error occurred while fetching deployment logs' };
    }
  }

  /**
   * Updates the public FQDN domain associated with the project.
   * @param projectId Project UUID
   * @param domain Fully-qualified domain name (e.g. 'app.example.com')
   */
  async setDomain(projectId: string, domain: string): Promise<CoolifyResponse<void>> {
    try {
      const payload = { fqdn: domain };
      const res = await this.fetchCoolifyAPI(`/api/v1/applications/${encodeURIComponent(projectId)}`, 'PATCH', payload);

      if (!res.ok) {
        const errText = await res.text();
        return { success: false, error: `Failed to update project domain: ${errText}` };
      }

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message || 'Unknown error occurred while setting domain' };
    }
  }

  /**
   * Bulk updates environment variables for an application.
   * @param projectId Project UUID
   * @param vars Map of variable keys and string values
   */
  async setEnvVars(projectId: string, vars: Record<string, string>): Promise<CoolifyResponse<void>> {
    try {
      const envList = Object.entries(vars).map(([key, value]) => ({
        key,
        value,
        is_build_time: false,
        is_preview: false,
      }));

      const payload = { envs: envList };
      const res = await this.fetchCoolifyAPI(`/api/v1/applications/${encodeURIComponent(projectId)}/envs/bulk`, 'POST', payload);

      if (!res.ok) {
        const errText = await res.text();
        return { success: false, error: `Failed to set environment variables: ${errText}` };
      }

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message || 'Unknown error occurred while setting environment variables' };
    }
  }

  /**
   * Retrieves operational metrics and health status for an application.
   * @param projectId Project UUID
   */
  async getProjectMetrics(projectId: string): Promise<CoolifyResponse<any>> {
    try {
      const res = await this.fetchCoolifyAPI(`/api/v1/applications/${encodeURIComponent(projectId)}`, 'GET');
      if (!res.ok) {
        const errText = await res.text();
        return { success: false, error: `Failed to get project metrics: ${errText}` };
      }

      const data = await res.json();
      return {
        success: true,
        data: {
          id: projectId,
          status: data.status,
          updatedAt: data.updated_at,
          gitCommit: data.git_commit_sha,
        },
      };
    } catch (error: any) {
      return { success: false, error: error.message || 'Unknown error occurred while fetching project metrics' };
    }
  }
}
