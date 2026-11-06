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

CREATE TABLE IF NOT EXISTS service_allocations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    service_id UUID REFERENCES hosting_services(id) ON DELETE CASCADE,
    node_id UUID REFERENCES infrastructure_nodes(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE hosting_plans ADD COLUMN IF NOT EXISTS provisioning_type TEXT DEFAULT 'manual';
