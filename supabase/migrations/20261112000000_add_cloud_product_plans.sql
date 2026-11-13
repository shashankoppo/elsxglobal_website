-- Migration: Add VaultHost Cloud Product Hosting Plans
-- Date: 2026-11-12
-- Adds all 11 new cloud products (33 tiers) + DNS plans to hosting_plans table
-- Ensures category column exists and upserts idempotent plan definitions.

-- 1. Ensure category column exists on hosting_plans
ALTER TABLE public.hosting_plans ADD COLUMN IF NOT EXISTS category text;

-- 2. Upsert cloud product plans
INSERT INTO public.hosting_plans (
  id, slug, name, tier, category, price_monthly, price_annual, features, short_description, is_popular, is_active, sort_order
)
VALUES
  -- 1. Workers Plans
  ('workers-free', 'workers-free', 'Workers Free', 'free', 'edge_compute', 0, 0,
   '["100K req/day", "10ms CPU limit", "Basic KV access", "Global Anycast across 300+ PoPs", "Community support"]'::jsonb,
   'Get started with edge compute at zero cost', false, true, 10),
  ('workers-pro', 'workers-pro', 'Workers Pro', 'pro', 'edge_compute', 699, 559,
   '["Unlimited requests", "30s CPU limit", "KV + R2 + D1 bindings", "Custom domains & SSL", "Priority support"]'::jsonb,
   'Production-ready edge compute for growing teams', true, true, 11),
  ('workers-business', 'workers-business', 'Workers Business', 'business', 'edge_compute', 2499, 1999,
   '["Unlimited requests", "No CPU limits", "All bindings + Private peering", "99.999% SLA guarantee", "Dedicated support"]'::jsonb,
   'Enterprise edge compute with SLA', false, true, 12),

  -- 2. Storage Plans
  ('storage-free', 'storage-free', 'Storage Free', 'free', 'object_storage', 0, 0,
   '["10GB NVMe storage", "Zero egress fees", "1M API ops/mo", "S3 API compatibility", "Community support"]'::jsonb,
   'Zero-egress S3 object storage for prototypes', false, true, 20),
  ('storage-pro', 'storage-pro', 'Storage Pro', 'pro', 'object_storage', 499, 399,
   '["100GB NVMe storage", "Zero egress fees forever", "10M API ops/mo", "Custom bucket domains", "Priority support"]'::jsonb,
   'Production S3 object storage with zero egress fees', true, true, 21),
  ('storage-business', 'storage-business', 'Storage Business', 'business', 'object_storage', 1999, 1599,
   '["1TB NVMe storage", "Zero egress fees forever", "Unlimited API ops", "Multi-region replication", "24/7 SLA & support"]'::jsonb,
   'Enterprise multi-terabyte storage with global replication', false, true, 22),

  -- 3. AI Gateway Plans
  ('ai-gateway-free', 'ai-gateway-free', 'AI Gateway Free', 'free', 'ai_services', 0, 0,
   '["10K requests/mo", "1 AI Provider", "Basic request logging", "Standard latency analytics", "Community support"]'::jsonb,
   'Unified AI API gateway for hobbyists and developers', false, true, 30),
  ('ai-gateway-pro', 'ai-gateway-pro', 'AI Gateway Pro', 'pro', 'ai_services', 999, 799,
   '["1M requests/mo", "Unlimited AI Providers", "Semantic caching", "Custom rate limits & alerts", "Automatic model fallback"]'::jsonb,
   'Intelligent caching and fallback routing for AI apps', true, true, 31),
  ('ai-gateway-business', 'ai-gateway-business', 'AI Gateway Business', 'business', 'ai_services', 3999, 3199,
   '["10M requests/mo", "Unlimited AI Providers", "Dedicated proxy instances", "Enterprise SSO & audit logs", "99.99% uptime SLA"]'::jsonb,
   'Enterprise AI proxy fleet with dedicated throughput', false, true, 32),

  -- 4. Inference Plans
  ('inference-free', 'inference-free', 'Inference Free', 'free', 'ai_services', 0, 0,
   '["100K tokens/day free", "Llama 3 8B & Whisper v3 access", "OpenAI-compatible completions", "Streaming responses", "Community support"]'::jsonb,
   'Free tier serverless inference for open-source AI models', false, true, 40),
  ('inference-pro', 'inference-pro', 'Inference Pro', 'pro', 'ai_services', 999, 799,
   '["50M tokens included", "Llama 3 70B & Mixtral access", "Pay-as-you-go from ₹0.08/1M", "50 concurrent streams", "Priority GPU queue"]'::jsonb,
   'Production open-source model inference with sub-20ms TTFT', true, true, 41),
  ('inference-business', 'inference-business', 'Inference Business', 'business', 'ai_services', 3999, 3199,
   '["250M tokens included", "Unlimited concurrency", "Custom weights & LoRA fine-tunes", "Dedicated GPU clusters", "99.95% inference SLA"]'::jsonb,
   'Dedicated GPU infrastructure for enterprise AI workloads', false, true, 42),

  -- 5. Containers Plans
  ('containers-starter', 'containers-starter', 'Containers Starter', 'starter', 'containers', 999, 799,
   '["3 Managed container nodes", "6 vCPU total compute", "12GB RAM total memory", "Automatic ingress & TLS", "Git push deploy"]'::jsonb,
   'Managed K3s container fleet for web apps and microservices', false, true, 50),
  ('containers-pro', 'containers-pro', 'Containers Pro', 'pro', 'containers', 4999, 3999,
   '["10 Managed container nodes", "20 vCPU total compute", "40GB RAM total memory", "Dedicated Load Balancer", "Horizontal pod autoscaling"]'::jsonb,
   'Production container orchestration with auto-scaling', true, true, 51),
  ('containers-enterprise', 'containers-enterprise', 'Containers Enterprise', 'enterprise', 'containers', 14999, 11999,
   '["Unlimited container nodes", "Dedicated bare-metal hardware", "NVIDIA GPU node support", "Multi-zone high availability", "24/7 DevOps SLA"]'::jsonb,
   'High-density bare-metal Kubernetes fleet with GPU nodes', false, true, 52),

  -- 6. Pages Plans
  ('pages-free', 'pages-free', 'Pages Free', 'free', 'web_hosting', 0, 0,
   '["500 builds/mo", "100GB edge bandwidth", "Unlimited preview environments", "Automatic SSL & domains", "Community support"]'::jsonb,
   'Fast git-connected deployments for static and frontend sites', false, true, 60),
  ('pages-pro', 'pages-pro', 'Pages Pro', 'pro', 'web_hosting', 499, 399,
   '["Unlimited builds/mo", "1TB edge bandwidth", "Next.js SSR & App Router support", "Edge caching headers", "Priority support"]'::jsonb,
   'Unlimited builds and full-stack SSR for commercial apps', true, true, 61),
  ('pages-business', 'pages-business', 'Pages Business', 'business', 'web_hosting', 1999, 1599,
   '["Unlimited concurrent builds", "5TB edge bandwidth", "Dedicated build runners", "Custom WAF rules", "99.99% uptime SLA"]'::jsonb,
   'High-traffic enterprise frontends with priority build queues', false, true, 62),

  -- 7. Database Plans
  ('database-free', 'database-free', 'Database Free', 'free', 'database', 0, 0,
   '["500MB distributed storage", "100K row reads/day", "10K row writes/day", "24h time-travel rollback", "Community support"]'::jsonb,
   'Serverless distributed SQL database at zero cost', false, true, 70),
  ('database-pro', 'database-pro', 'Database Pro', 'pro', 'database', 349, 279,
   '["10GB distributed storage", "25M row reads/mo", "5M row writes/mo", "7-day time-travel recovery", "Automatic read replicas"]'::jsonb,
   'Production edge database with 10GB storage and read replicas', true, true, 71),
  ('database-business', 'database-business', 'Database Business', 'business', 'database', 1499, 1199,
   '["100GB distributed storage", "Unlimited reads (fair use)", "Unlimited writes (fair use)", "30-day continuous backup", "99.99% database SLA"]'::jsonb,
   '100GB distributed SQL database with instant time-travel rollback', false, true, 72),

  -- 8. Queues Plans
  ('queues-free', 'queues-free', 'Queues Free', 'free', 'messaging', 0, 0,
   '["1M operations/mo", "Standard FIFO ordering", "128KB payload size", "4-day retention", "Community support"]'::jsonb,
   'Zero-cost message queuing for background jobs and tasks', false, true, 80),
  ('queues-pro', 'queues-pro', 'Queues Pro', 'pro', 'messaging', 499, 399,
   '["50M operations/mo", "Delay & priority queues up to 14 days", "Dead-letter queues (DLQ)", "256KB payload size", "Priority support"]'::jsonb,
   'High-throughput message broker with delay queues & retries', true, true, 81),
  ('queues-business', 'queues-business', 'Queues Business', 'business', 'messaging', 1999, 1599,
   '["Unlimited operations/mo", "1MB payload size support", "30-day retention", "Private VPC peering", "99.99% delivery SLA"]'::jsonb,
   'Enterprise event fabric with guaranteed SLA and unlimited ops', false, true, 82),

  -- 9. KV Store Plans
  ('kv-free', 'kv-free', 'KV Free', 'free', 'caching', 0, 0,
   '["100K reads/day", "1K writes/day", "1GB storage capacity", "Sub-5ms global read latency", "Community support"]'::jsonb,
   'Ultra-low latency key-value store for sessions and tokens', false, true, 90),
  ('kv-pro', 'kv-pro', 'KV Pro', 'pro', 'caching', 249, 199,
   '["10M reads/mo", "1M writes/mo", "10GB storage capacity", "Automatic TTL expiration", "Priority support"]'::jsonb,
   'High-read scale for active session storage and API caches', true, true, 91),
  ('kv-business', 'kv-business', 'KV Business', 'business', 'caching', 999, 799,
   '["Unlimited reads/mo", "Unlimited writes/mo", "100GB storage capacity", "Multi-master synchronization", "99.99% uptime SLA"]'::jsonb,
   'Unlimited reads and 100GB storage for enterprise caching fleets', false, true, 92),

  -- 10. Tunnel Plans
  ('tunnel-free', 'tunnel-free', 'Tunnel Free', 'free', 'networking', 0, 0,
   '["1 Active tunnel", "100GB transfer/mo", "HTTP & HTTPS protocols", "Random subdomain", "Lightweight CLI"]'::jsonb,
   'Expose local servers safely without public IP addresses', false, true, 100),
  ('tunnel-pro', 'tunnel-pro', 'Tunnel Pro', 'pro', 'networking', 299, 239,
   '["10 Active tunnels", "1TB transfer/mo", "Custom domain routing", "TCP, UDP & RDP support", "Basic auth & IP allowlist"]'::jsonb,
   'Custom domains, TCP/UDP tunnels, and access control', true, true, 101),
  ('tunnel-business', 'tunnel-business', 'Tunnel Business', 'business', 'networking', 999, 799,
   '["Unlimited active tunnels", "10TB transfer/mo", "OIDC / SAML SSO authentication", "Dedicated Anycast ingress IPs", "99.99% connection SLA"]'::jsonb,
   'Zero-trust network access with SSO and dedicated ingress', false, true, 102),

  -- 11. Vectorize Plans
  ('vectorize-free', 'vectorize-free', 'Vectorize Free', 'free', 'vector_database', 0, 0,
   '["100K vectors stored", "Up to 1536 query dimensions", "10K queries/mo", "Cosine & dot similarity", "Community support"]'::jsonb,
   'Vector database for embeddings and AI RAG prototypes', false, true, 110),
  ('vectorize-pro', 'vectorize-pro', 'Vectorize Pro', 'pro', 'vector_database', 1499, 1199,
   '["2M vectors stored", "Up to 1536 query dimensions", "1M queries/mo", "Metadata filtering & hybrid search", "Sub-20ms latency"]'::jsonb,
   'High-scale vector store for production AI search and RAG', true, true, 111),
  ('vectorize-business', 'vectorize-business', 'Vectorize Business', 'business', 'vector_database', 3999, 3199,
   '["10M vectors stored", "Up to 3072 query dimensions", "Unlimited queries", "Namespace isolation", "99.95% search SLA"]'::jsonb,
   'Enterprise embeddings engine with 10M vectors and custom distances', false, true, 112),

  -- 12. DNS Plans
  ('dns-free', 'dns-free', 'DNS Free', 'free', 'networking', 0, 0,
   '["500K queries/mo", "Up to 5 DNS zones", "Sub-10ms global propagation", "Standard DDoS protection", "Community support"]'::jsonb,
   'Global Anycast authoritative DNS resolution at zero cost', false, true, 120),
  ('dns-pro', 'dns-pro', 'DNS Pro', 'pro', 'networking', 199, 159,
   '["10M queries/mo", "Up to 50 DNS zones", "DNSSEC 1-click automatic signing", "Health checks & failover", "Priority support"]'::jsonb,
   'High-query authoritative DNS with DNSSEC and health checks', true, true, 121),
  ('dns-business', 'dns-business', 'DNS Business', 'business', 'networking', 799, 639,
   '["Unlimited queries/mo", "Unlimited DNS zones", "Custom vanity nameservers", "Anycast BGP across 300+ PoPs", "100% SLA guarantee"]'::jsonb,
   'Mission-critical enterprise DNS with vanity nameservers and 100% SLA', false, true, 122)

ON CONFLICT (id) DO UPDATE SET
  slug = EXCLUDED.slug,
  name = EXCLUDED.name,
  tier = EXCLUDED.tier,
  category = EXCLUDED.category,
  price_monthly = EXCLUDED.price_monthly,
  price_annual = EXCLUDED.price_annual,
  features = EXCLUDED.features,
  short_description = EXCLUDED.short_description,
  is_popular = EXCLUDED.is_popular,
  is_active = EXCLUDED.is_active,
  sort_order = EXCLUDED.sort_order,
  updated_at = now();

-- 3. Optional Domain Pricing Table for Reference & Dynamic Lookup
CREATE TABLE IF NOT EXISTS public.domain_tld_pricing (
  tld text PRIMARY KEY,
  registration numeric(10,2) NOT NULL,
  renewal numeric(10,2) NOT NULL,
  transfer numeric(10,2) NOT NULL,
  is_popular boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.domain_tld_pricing ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_read_domain_tld_pricing" ON public.domain_tld_pricing;
CREATE POLICY "public_read_domain_tld_pricing" ON public.domain_tld_pricing FOR SELECT TO anon, authenticated USING (true);

INSERT INTO public.domain_tld_pricing (tld, registration, renewal, transfer, is_popular)
VALUES
  ('.com', 899, 999, 799, true),
  ('.in', 699, 799, 599, true),
  ('.io', 3499, 3999, 2999, true),
  ('.ai', 5999, 6999, 4999, true),
  ('.co', 2499, 2999, 1999, false),
  ('.net', 1099, 1199, 899, false),
  ('.org', 999, 1099, 799, false),
  ('.dev', 1299, 1499, 999, true),
  ('.app', 1499, 1699, 1299, false),
  ('.cloud', 1999, 2199, 1799, false),
  ('.tech', 2999, 3499, 2499, false),
  ('.store', 1799, 1999, 1599, false),
  ('.site', 999, 1199, 799, false),
  ('.online', 799, 999, 699, false),
  ('.info', 899, 999, 699, false)
ON CONFLICT (tld) DO UPDATE SET
  registration = EXCLUDED.registration,
  renewal = EXCLUDED.renewal,
  transfer = EXCLUDED.transfer,
  is_popular = EXCLUDED.is_popular,
  updated_at = now();
