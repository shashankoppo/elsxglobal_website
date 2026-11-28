-- Dynamic Infrastructure Node and Allocation Tables

CREATE TABLE IF NOT EXISTS infrastructure_nodes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    provider_type TEXT NOT NULL,
    hostname TEXT NOT NULL,
    api_key TEXT NOT NULL,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS: infrastructure_nodes contains hypervisor API keys — only service_role can touch it.
-- anon and authenticated roles must NEVER be able to read api_key via PostgREST.
ALTER TABLE infrastructure_nodes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS infra_nodes_service_only ON infrastructure_nodes;
CREATE POLICY infra_nodes_service_only ON infrastructure_nodes
  USING (auth.role() = 'service_role');

CREATE TABLE IF NOT EXISTS service_allocations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    service_id UUID REFERENCES hosting_services(id) ON DELETE CASCADE,
    node_id UUID REFERENCES infrastructure_nodes(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS: authenticated users may only read their own allocations (via hosting_services).
ALTER TABLE service_allocations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS svc_alloc_own ON service_allocations;
CREATE POLICY svc_alloc_own ON service_allocations FOR SELECT
  USING (
    auth.role() = 'service_role'
    OR service_id IN (
      SELECT id FROM hosting_services WHERE user_id = auth.uid()
    )
  );

ALTER TABLE hosting_plans ADD COLUMN IF NOT EXISTS provisioning_type TEXT DEFAULT 'manual';

