-- ============================================================
-- Full Platform Schema Migration
-- VaultHost by ELSxGlobal — Complete Backend Infrastructure
-- Created: 2026-11-10
-- Tables: cloud_tunnels, cloud_containers, cloud_pages_projects,
--         cloud_deployments, cloud_kv_namespaces, cloud_kv_entries,
--         cloud_queues, api_keys, api_key_usage
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ─── 1. VaultTunnel Tunnels ──────────────────────────────────

CREATE TABLE IF NOT EXISTS cloud_tunnels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  subdomain TEXT NOT NULL UNIQUE,
  protocol TEXT NOT NULL DEFAULT 'http' CHECK (protocol IN ('http','https','tcp','udp')),
  local_port INTEGER,
  remote_port INTEGER,
  token TEXT NOT NULL DEFAULT encode(gen_random_bytes(32), 'hex'),
  status TEXT NOT NULL DEFAULT 'provisioning' CHECK (status IN ('online','offline','provisioning','error')),
  frpc_config TEXT, -- generated frpc.toml content
  public_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE cloud_tunnels ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE cloud_tunnels ADD COLUMN IF NOT EXISTS name TEXT;
ALTER TABLE cloud_tunnels ADD COLUMN IF NOT EXISTS subdomain TEXT;
ALTER TABLE cloud_tunnels ADD COLUMN IF NOT EXISTS protocol TEXT DEFAULT 'http';
ALTER TABLE cloud_tunnels ADD COLUMN IF NOT EXISTS local_port INTEGER;
ALTER TABLE cloud_tunnels ADD COLUMN IF NOT EXISTS remote_port INTEGER;
ALTER TABLE cloud_tunnels ADD COLUMN IF NOT EXISTS token TEXT DEFAULT encode(gen_random_bytes(32), 'hex');
ALTER TABLE cloud_tunnels ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'provisioning';
ALTER TABLE cloud_tunnels ADD COLUMN IF NOT EXISTS frpc_config TEXT;
ALTER TABLE cloud_tunnels ADD COLUMN IF NOT EXISTS public_url TEXT;
ALTER TABLE cloud_tunnels ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT now();
ALTER TABLE cloud_tunnels ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

-- ─── 2. VaultContainers Namespaces ───────────────────────────

CREATE TABLE IF NOT EXISTS cloud_containers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  namespace TEXT NOT NULL UNIQUE, -- k3s namespace name
  display_name TEXT NOT NULL,
  plan TEXT NOT NULL DEFAULT 'starter' CHECK (plan IN ('starter','pro','enterprise')),
  status TEXT NOT NULL DEFAULT 'provisioning' CHECK (status IN ('active','provisioning','suspended','deleted')),
  node_count INTEGER NOT NULL DEFAULT 1,
  cpu_limit TEXT NOT NULL DEFAULT '2',
  memory_limit TEXT NOT NULL DEFAULT '4Gi',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE cloud_containers ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE cloud_containers ADD COLUMN IF NOT EXISTS namespace TEXT;
ALTER TABLE cloud_containers ADD COLUMN IF NOT EXISTS display_name TEXT;
ALTER TABLE cloud_containers ADD COLUMN IF NOT EXISTS plan TEXT DEFAULT 'starter';
ALTER TABLE cloud_containers ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'provisioning';
ALTER TABLE cloud_containers ADD COLUMN IF NOT EXISTS node_count INTEGER DEFAULT 1;
ALTER TABLE cloud_containers ADD COLUMN IF NOT EXISTS cpu_limit TEXT DEFAULT '2';
ALTER TABLE cloud_containers ADD COLUMN IF NOT EXISTS memory_limit TEXT DEFAULT '4Gi';
ALTER TABLE cloud_containers ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT now();

-- ─── 3. VaultPages Projects ──────────────────────────────────

CREATE TABLE IF NOT EXISTS cloud_pages_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  git_repo TEXT NOT NULL,
  branch TEXT NOT NULL DEFAULT 'main',
  build_command TEXT DEFAULT 'npm run build',
  output_dir TEXT DEFAULT '.next',
  domain TEXT,
  coolify_project_id TEXT, -- external coolify UUID
  status TEXT NOT NULL DEFAULT 'idle' CHECK (status IN ('idle','building','deploying','live','error')),
  last_deploy_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE cloud_pages_projects ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE cloud_pages_projects ADD COLUMN IF NOT EXISTS name TEXT;
ALTER TABLE cloud_pages_projects ADD COLUMN IF NOT EXISTS git_repo TEXT;
ALTER TABLE cloud_pages_projects ADD COLUMN IF NOT EXISTS branch TEXT DEFAULT 'main';
ALTER TABLE cloud_pages_projects ADD COLUMN IF NOT EXISTS build_command TEXT DEFAULT 'npm run build';
ALTER TABLE cloud_pages_projects ADD COLUMN IF NOT EXISTS output_dir TEXT DEFAULT '.next';
ALTER TABLE cloud_pages_projects ADD COLUMN IF NOT EXISTS domain TEXT;
ALTER TABLE cloud_pages_projects ADD COLUMN IF NOT EXISTS coolify_project_id TEXT;
ALTER TABLE cloud_pages_projects ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'idle';
ALTER TABLE cloud_pages_projects ADD COLUMN IF NOT EXISTS last_deploy_at TIMESTAMPTZ;
ALTER TABLE cloud_pages_projects ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT now();

-- ─── 4. VaultPages Deployments ───────────────────────────────

CREATE TABLE IF NOT EXISTS cloud_deployments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES cloud_pages_projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'queued' CHECK (status IN ('queued','building','success','failed')),
  commit_sha TEXT,
  coolify_deployment_id TEXT,
  logs TEXT,
  started_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE cloud_deployments ADD COLUMN IF NOT EXISTS project_id UUID REFERENCES cloud_pages_projects(id) ON DELETE CASCADE;
ALTER TABLE cloud_deployments ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE cloud_deployments ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'queued';
ALTER TABLE cloud_deployments ADD COLUMN IF NOT EXISTS commit_sha TEXT;
ALTER TABLE cloud_deployments ADD COLUMN IF NOT EXISTS coolify_deployment_id TEXT;
ALTER TABLE cloud_deployments ADD COLUMN IF NOT EXISTS logs TEXT;
ALTER TABLE cloud_deployments ADD COLUMN IF NOT EXISTS started_at TIMESTAMPTZ DEFAULT now();
ALTER TABLE cloud_deployments ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ;
ALTER TABLE cloud_deployments ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT now();

-- ─── 5. VaultKV Namespaces ───────────────────────────────────

CREATE TABLE IF NOT EXISTS cloud_kv_namespaces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE cloud_kv_namespaces ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE cloud_kv_namespaces ADD COLUMN IF NOT EXISTS name TEXT;
ALTER TABLE cloud_kv_namespaces ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE cloud_kv_namespaces ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT now();

-- ─── 6. VaultKV Entries ──────────────────────────────────────

CREATE TABLE IF NOT EXISTS cloud_kv_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  namespace_id UUID NOT NULL REFERENCES cloud_kv_namespaces(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid(),
  key TEXT NOT NULL,
  value TEXT NOT NULL,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(namespace_id, key)
);

ALTER TABLE cloud_kv_entries ADD COLUMN IF NOT EXISTS namespace_id UUID REFERENCES cloud_kv_namespaces(id) ON DELETE CASCADE;
ALTER TABLE cloud_kv_entries ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid();
ALTER TABLE cloud_kv_entries ADD COLUMN IF NOT EXISTS key TEXT;
ALTER TABLE cloud_kv_entries ADD COLUMN IF NOT EXISTS value TEXT;
ALTER TABLE cloud_kv_entries ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ;
ALTER TABLE cloud_kv_entries ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT now();
ALTER TABLE cloud_kv_entries ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

-- ─── 7. VaultQueues ──────────────────────────────────────────

CREATE TABLE IF NOT EXISTS cloud_queues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  vhost TEXT NOT NULL DEFAULT '/',
  durable BOOLEAN NOT NULL DEFAULT true,
  max_length INTEGER,
  dlx_name TEXT, -- dead letter exchange
  rabbitmq_queue_name TEXT, -- actual name on RabbitMQ server
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','deleted','paused')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE cloud_queues ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE cloud_queues ADD COLUMN IF NOT EXISTS name TEXT;
ALTER TABLE cloud_queues ADD COLUMN IF NOT EXISTS vhost TEXT DEFAULT '/';
ALTER TABLE cloud_queues ADD COLUMN IF NOT EXISTS durable BOOLEAN DEFAULT true;
ALTER TABLE cloud_queues ADD COLUMN IF NOT EXISTS max_length INTEGER;
ALTER TABLE cloud_queues ADD COLUMN IF NOT EXISTS dlx_name TEXT;
ALTER TABLE cloud_queues ADD COLUMN IF NOT EXISTS rabbitmq_queue_name TEXT;
ALTER TABLE cloud_queues ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';
ALTER TABLE cloud_queues ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT now();

-- ─── 8. API Keys for Developer API ───────────────────────────

CREATE TABLE IF NOT EXISTS api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  key_hash TEXT NOT NULL DEFAULT encode(gen_random_bytes(32), 'hex') UNIQUE, -- sha256 of actual key
  key_prefix TEXT NOT NULL, -- first 8 chars: 'vh_live_'
  scopes TEXT[] NOT NULL DEFAULT ARRAY['dns:read','storage:read'],
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_used_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE api_keys ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE api_keys ADD COLUMN IF NOT EXISTS name TEXT;
ALTER TABLE api_keys ADD COLUMN IF NOT EXISTS key_hash TEXT DEFAULT encode(gen_random_bytes(32), 'hex');
ALTER TABLE api_keys ADD COLUMN IF NOT EXISTS key_prefix TEXT;
ALTER TABLE api_keys ADD COLUMN IF NOT EXISTS scopes TEXT[] DEFAULT ARRAY['dns:read','storage:read'];
ALTER TABLE api_keys ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE api_keys ADD COLUMN IF NOT EXISTS last_used_at TIMESTAMPTZ;
ALTER TABLE api_keys ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ;
ALTER TABLE api_keys ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT now();

-- ─── 9. API Key Usage Log ────────────────────────────────────

CREATE TABLE IF NOT EXISTS api_key_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  api_key_id UUID NOT NULL REFERENCES api_keys(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL,
  method TEXT NOT NULL,
  status_code INTEGER,
  ip_address TEXT,
  user_agent TEXT,
  response_ms INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE api_key_usage ADD COLUMN IF NOT EXISTS api_key_id UUID REFERENCES api_keys(id) ON DELETE CASCADE;
ALTER TABLE api_key_usage ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE api_key_usage ADD COLUMN IF NOT EXISTS endpoint TEXT;
ALTER TABLE api_key_usage ADD COLUMN IF NOT EXISTS method TEXT;
ALTER TABLE api_key_usage ADD COLUMN IF NOT EXISTS status_code INTEGER;
ALTER TABLE api_key_usage ADD COLUMN IF NOT EXISTS ip_address TEXT;
ALTER TABLE api_key_usage ADD COLUMN IF NOT EXISTS user_agent TEXT;
ALTER TABLE api_key_usage ADD COLUMN IF NOT EXISTS response_ms INTEGER;
ALTER TABLE api_key_usage ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT now();

-- ─── Trigger Function for updated_at ─────────────────────────

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_cloud_tunnels_updated_at ON cloud_tunnels;
CREATE TRIGGER tr_cloud_tunnels_updated_at
  BEFORE UPDATE ON cloud_tunnels
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS tr_cloud_kv_entries_updated_at ON cloud_kv_entries;
CREATE TRIGGER tr_cloud_kv_entries_updated_at
  BEFORE UPDATE ON cloud_kv_entries
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ─── Indexes ─────────────────────────────────────────────────

-- cloud_tunnels
CREATE INDEX IF NOT EXISTS idx_cloud_tunnels_user_id ON cloud_tunnels(user_id);
CREATE INDEX IF NOT EXISTS idx_cloud_tunnels_created_at ON cloud_tunnels(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_cloud_tunnels_subdomain ON cloud_tunnels(subdomain);
CREATE INDEX IF NOT EXISTS idx_cloud_tunnels_status ON cloud_tunnels(status);

-- cloud_containers
CREATE INDEX IF NOT EXISTS idx_cloud_containers_user_id ON cloud_containers(user_id);
CREATE INDEX IF NOT EXISTS idx_cloud_containers_created_at ON cloud_containers(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_cloud_containers_namespace ON cloud_containers(namespace);
CREATE INDEX IF NOT EXISTS idx_cloud_containers_status ON cloud_containers(status);

-- cloud_pages_projects
CREATE INDEX IF NOT EXISTS idx_cloud_pages_projects_user_id ON cloud_pages_projects(user_id);
CREATE INDEX IF NOT EXISTS idx_cloud_pages_projects_created_at ON cloud_pages_projects(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_cloud_pages_projects_status ON cloud_pages_projects(status);

-- cloud_deployments
CREATE INDEX IF NOT EXISTS idx_cloud_deployments_user_id ON cloud_deployments(user_id);
CREATE INDEX IF NOT EXISTS idx_cloud_deployments_created_at ON cloud_deployments(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_cloud_deployments_project_id ON cloud_deployments(project_id);
CREATE INDEX IF NOT EXISTS idx_cloud_deployments_status ON cloud_deployments(status);

-- cloud_kv_namespaces
CREATE INDEX IF NOT EXISTS idx_cloud_kv_namespaces_user_id ON cloud_kv_namespaces(user_id);
CREATE INDEX IF NOT EXISTS idx_cloud_kv_namespaces_created_at ON cloud_kv_namespaces(created_at DESC);

-- cloud_kv_entries
CREATE INDEX IF NOT EXISTS idx_cloud_kv_entries_user_id ON cloud_kv_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_cloud_kv_entries_created_at ON cloud_kv_entries(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_cloud_kv_entries_namespace_id ON cloud_kv_entries(namespace_id);
CREATE INDEX IF NOT EXISTS idx_cloud_kv_entries_key ON cloud_kv_entries(key);

-- cloud_queues
CREATE INDEX IF NOT EXISTS idx_cloud_queues_user_id ON cloud_queues(user_id);
CREATE INDEX IF NOT EXISTS idx_cloud_queues_created_at ON cloud_queues(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_cloud_queues_status ON cloud_queues(status);

-- api_keys
CREATE INDEX IF NOT EXISTS idx_api_keys_user_id ON api_keys(user_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_created_at ON api_keys(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_api_keys_hash ON api_keys(key_hash);
CREATE INDEX IF NOT EXISTS idx_api_keys_prefix ON api_keys(key_prefix);

-- api_key_usage
CREATE INDEX IF NOT EXISTS idx_api_key_usage_user_id ON api_key_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_api_key_usage_created_at ON api_key_usage(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_api_key_usage_api_key_id ON api_key_usage(api_key_id);

-- ─── Row Level Security & Access Policies ────────────────────

ALTER TABLE cloud_tunnels ENABLE ROW LEVEL SECURITY;
ALTER TABLE cloud_containers ENABLE ROW LEVEL SECURITY;
ALTER TABLE cloud_pages_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE cloud_deployments ENABLE ROW LEVEL SECURITY;
ALTER TABLE cloud_kv_namespaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE cloud_kv_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE cloud_queues ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_key_usage ENABLE ROW LEVEL SECURITY;

-- 1. cloud_tunnels
DROP POLICY IF EXISTS "Users can manage own cloud_tunnels" ON cloud_tunnels;
CREATE POLICY "Users can manage own cloud_tunnels" ON cloud_tunnels
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Service role bypass cloud_tunnels" ON cloud_tunnels;
CREATE POLICY "Service role bypass cloud_tunnels" ON cloud_tunnels
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);

-- 2. cloud_containers
DROP POLICY IF EXISTS "Users can manage own cloud_containers" ON cloud_containers;
CREATE POLICY "Users can manage own cloud_containers" ON cloud_containers
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Service role bypass cloud_containers" ON cloud_containers;
CREATE POLICY "Service role bypass cloud_containers" ON cloud_containers
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);

-- 3. cloud_pages_projects
DROP POLICY IF EXISTS "Users can manage own cloud_pages_projects" ON cloud_pages_projects;
CREATE POLICY "Users can manage own cloud_pages_projects" ON cloud_pages_projects
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Service role bypass cloud_pages_projects" ON cloud_pages_projects;
CREATE POLICY "Service role bypass cloud_pages_projects" ON cloud_pages_projects
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);

-- 4. cloud_deployments
DROP POLICY IF EXISTS "Users can manage own cloud_deployments" ON cloud_deployments;
CREATE POLICY "Users can manage own cloud_deployments" ON cloud_deployments
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Service role bypass cloud_deployments" ON cloud_deployments;
CREATE POLICY "Service role bypass cloud_deployments" ON cloud_deployments
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);

-- 5. cloud_kv_namespaces
DROP POLICY IF EXISTS "Users can manage own cloud_kv_namespaces" ON cloud_kv_namespaces;
CREATE POLICY "Users can manage own cloud_kv_namespaces" ON cloud_kv_namespaces
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Service role bypass cloud_kv_namespaces" ON cloud_kv_namespaces;
CREATE POLICY "Service role bypass cloud_kv_namespaces" ON cloud_kv_namespaces
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);

-- 6. cloud_kv_entries
DROP POLICY IF EXISTS "Users can manage own cloud_kv_entries" ON cloud_kv_entries;
CREATE POLICY "Users can manage own cloud_kv_entries" ON cloud_kv_entries
  FOR ALL TO authenticated
  USING (
    user_id = auth.uid() OR EXISTS (
      SELECT 1 FROM cloud_kv_namespaces n
      WHERE n.id = cloud_kv_entries.namespace_id
        AND n.user_id = auth.uid()
    )
  )
  WITH CHECK (
    user_id = auth.uid() OR EXISTS (
      SELECT 1 FROM cloud_kv_namespaces n
      WHERE n.id = cloud_kv_entries.namespace_id
        AND n.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Service role bypass cloud_kv_entries" ON cloud_kv_entries;
CREATE POLICY "Service role bypass cloud_kv_entries" ON cloud_kv_entries
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);

-- 7. cloud_queues
DROP POLICY IF EXISTS "Users can manage own cloud_queues" ON cloud_queues;
CREATE POLICY "Users can manage own cloud_queues" ON cloud_queues
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Service role bypass cloud_queues" ON cloud_queues;
CREATE POLICY "Service role bypass cloud_queues" ON cloud_queues
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);

-- 8. api_keys
DROP POLICY IF EXISTS "Users can manage own api_keys" ON api_keys;
CREATE POLICY "Users can manage own api_keys" ON api_keys
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Service role bypass api_keys" ON api_keys;
CREATE POLICY "Service role bypass api_keys" ON api_keys
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);

-- 9. api_key_usage
DROP POLICY IF EXISTS "Users can read own api_key_usage" ON api_key_usage;
CREATE POLICY "Users can read own api_key_usage" ON api_key_usage
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own api_key_usage" ON api_key_usage;
CREATE POLICY "Users can insert own api_key_usage" ON api_key_usage
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Service role bypass api_key_usage" ON api_key_usage;
CREATE POLICY "Service role bypass api_key_usage" ON api_key_usage
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);
