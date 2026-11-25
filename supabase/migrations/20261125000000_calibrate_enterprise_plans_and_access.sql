-- Migration: Calibrate Enterprise Plans (3-5% below AWS/GCP/Azure) & Add Dedicated Access / Manual Setup Columns
-- Date: 2026-11-25

-- 1. Expand hosting_services for complete dedicated server access, flexible manual/automated setup, firewall, and endpoint delivery
ALTER TABLE public.hosting_services
  ADD COLUMN IF NOT EXISTS username text,
  ADD COLUMN IF NOT EXISTS password text,
  ADD COLUMN IF NOT EXISTS ssh_port integer DEFAULT 22,
  ADD COLUMN IF NOT EXISTS web_console_url text,
  ADD COLUMN IF NOT EXISTS ip_address text,
  ADD COLUMN IF NOT EXISTS ipv6_address text,
  ADD COLUMN IF NOT EXISTS hostname text,
  ADD COLUMN IF NOT EXISTS os_template text DEFAULT 'ubuntu-22.04',
  ADD COLUMN IF NOT EXISTS ssh_public_key text,
  ADD COLUMN IF NOT EXISTS provisioning_mode text DEFAULT 'auto',
  ADD COLUMN IF NOT EXISTS setup_status text DEFAULT 'ready',
  ADD COLUMN IF NOT EXISTS firewall_rules jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS access_endpoints jsonb DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS specs_json jsonb DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS manual_setup_notes text,
  ADD COLUMN IF NOT EXISTS external_id text,
  ADD COLUMN IF NOT EXISTS adapter text,
  ADD COLUMN IF NOT EXISTS location text DEFAULT 'pune',
  ADD COLUMN IF NOT EXISTS node_id uuid;

-- 2. Expand infrastructure_nodes for flexible manual / self-hosted node metadata
ALTER TABLE public.infrastructure_nodes
  ADD COLUMN IF NOT EXISTS ssh_port integer DEFAULT 22,
  ADD COLUMN IF NOT EXISTS region text DEFAULT 'Mumbai (ap-south-1)',
  ADD COLUMN IF NOT EXISTS capacity_cpu integer DEFAULT 64,
  ADD COLUMN IF NOT EXISTS capacity_ram_gb integer DEFAULT 256,
  ADD COLUMN IF NOT EXISTS capacity_storage_gb integer DEFAULT 4000,
  ADD COLUMN IF NOT EXISTS notes text;

-- 3. Ensure hosting_coupons has current_uses
ALTER TABLE public.hosting_coupons
  ADD COLUMN IF NOT EXISTS current_uses integer DEFAULT 0;

-- 4. Calibrate all hosting_plans prices to 3-5% below AWS/GCP/Azure
-- Note: price_annual is stored as 12-month total (~16.7% / 2 months free discount), while pricingMath normalizes both conventions.
INSERT INTO public.hosting_plans (
  id, slug, name, tier, category, price_monthly, price_annual, cpu, ram, storage, bandwidth, features, short_description, is_popular, is_active, sort_order, provisioning_type
)
VALUES
  -- VPS Plans (3-5% below AWS EC2 on-demand)
  ('vps-nano', 'vps-nano', 'VPS Nano', 'vps', 'compute', 1480, 14794, '1 vCPU (AMD EPYC)', '2 GB DDR5', '40 GB NVMe', '1 TB',
   '["1 vCPU Core (AMD EPYC)","2 GB DDR5 RAM","40 GB NVMe Storage","1 TB Bandwidth","1 IPv4 & /64 IPv6","Full Root SSH Access"]'::jsonb,
   'Entry-level high-performance virtual server. 4.5% below AWS t3.small.', false, true, 1, 'proxmox'),
  ('vps-standard', 'vps-standard', 'VPS Standard', 'vps', 'compute', 2960, 29588, '2 vCPU (AMD EPYC)', '4 GB DDR5', '80 GB NVMe', '3 TB',
   '["2 vCPU Cores","4 GB DDR5 RAM","80 GB NVMe Storage","3 TB Bandwidth","1 IPv4 & /64 IPv6","Automated Snapshots"]'::jsonb,
   'Balanced cloud compute for production apps. 4.2% below AWS t3.medium.', false, true, 2, 'proxmox'),
  ('vps-pro', 'vps-pro', 'VPS Pro', 'vps', 'compute', 5850, 58476, '4 vCPU (AMD EPYC)', '8 GB DDR5', '160 GB NVMe', '6 TB',
   '["4 vCPU Cores","8 GB DDR5 RAM","160 GB NVMe Storage","6 TB Bandwidth","DDoS Protection & Snapshots","Mumbai / Pune DC"]'::jsonb,
   'High-frequency compute instance for APIs & databases. 4.1% below AWS t3.large.', true, true, 3, 'proxmox'),
  ('vps-elite', 'vps-elite', 'VPS Elite', 'vps', 'compute', 11700, 116953, '8 vCPU (AMD EPYC)', '16 GB DDR5', '320 GB NVMe', '10 TB',
   '["8 vCPU Cores","16 GB DDR5 RAM","320 GB NVMe Storage","10 TB Bandwidth","Dedicated IPv4","24/7 Priority Support"]'::jsonb,
   'Heavy compute power with dedicated vCPU guarantees. 4.1% below AWS t3.xlarge.', false, true, 4, 'proxmox'),
  ('vps-ultra', 'vps-ultra', 'VPS Ultra', 'vps', 'compute', 23800, 237904, '16 vCPU (AMD EPYC)', '32 GB DDR5', '640 GB NVMe', '15 TB',
   '["16 vCPU Cores","32 GB DDR5 RAM","640 GB NVMe Storage","15 TB Bandwidth","Dedicated IPv4","99.99% SLA"]'::jsonb,
   'Enterprise virtual server for heavy analytics & CI/CD. 4.0% below AWS c5.4xlarge.', false, true, 5, 'proxmox'),
  ('vps-beast', 'vps-beast', 'VPS Beast', 'vps', 'compute', 48300, 482806, '32 vCPU (AMD EPYC)', '64 GB DDR5', '1.2 TB NVMe', '20 TB',
   '["32 vCPU Cores","64 GB DDR5 RAM","1.2 TB NVMe Storage","20 TB Bandwidth","Dedicated IPv4","Dedicated Hardware Queue"]'::jsonb,
   'Maximum density cloud compute instance. 4.2% below AWS c5.9xlarge.', false, true, 6, 'proxmox'),

  -- Shared Hosting
  ('shared-starter', 'shared-starter', 'Shared Starter', 'shared', 'web_hosting', 790, 7897, '1 vCPU', '1 GB RAM', '10 GB NVMe', 'Unmetered',
   '["1 Website","10 GB NVMe Storage","Free Wildcard SSL","Unmetered Bandwidth","cPanel / HestiaCP"]'::jsonb,
   'High-speed NVMe hosting for blogs and small sites.', false, true, 10, 'hestiacp'),
  ('shared-pro', 'shared-pro', 'Shared Professional', 'shared', 'web_hosting', 1490, 14894, '2 vCPU', '2 GB RAM', '50 GB NVMe', 'Unmetered',
   '["Unlimited Websites","50 GB NVMe Storage","Free Wildcard SSL","Daily Backups","Free Migration"]'::jsonb,
   'High-speed shared hosting for growing businesses.', true, true, 11, 'hestiacp'),
  ('shared-business', 'shared-business', 'Shared Business', 'shared', 'web_hosting', 2790, 27889, '4 vCPU', '4 GB RAM', '100 GB NVMe', 'Unmetered',
   '["Unlimited Websites","100 GB NVMe Storage","Premium EV SSL","Daily Backups","Priority VIP Support"]'::jsonb,
   'Maximum shared resources and NVMe throughput.', false, true, 12, 'hestiacp'),

  -- Managed WordPress
  ('wp-starter', 'wp-starter', 'WordPress Starter', 'wordpress', 'web_hosting', 1490, 14894, '1 vCPU', '2 GB RAM', '25 GB NVMe', '1 TB',
   '["1 WordPress Site","25 GB NVMe Storage","LiteSpeed Caching","Free SSL & CDN","Auto-Updates"]'::jsonb,
   'Fast, secure WordPress hosting. 4% below AWS Lightsail WP.', false, true, 20, 'cyberpanel'),
  ('wp-business', 'wp-business', 'WordPress Business', 'wordpress', 'web_hosting', 2990, 29888, '2 vCPU', '4 GB RAM', '50 GB NVMe', '3 TB',
   '["5 WordPress Sites","50 GB NVMe Storage","WooCommerce Optimized","1-Click Staging","Daily Backups"]'::jsonb,
   'Performance WordPress hosting for businesses and e-commerce.', true, true, 21, 'cyberpanel'),
  ('wp-pro', 'wp-pro', 'WordPress Pro', 'wordpress', 'web_hosting', 5890, 58876, '4 vCPU', '8 GB RAM', '150 GB NVMe', '6 TB',
   '["25 WordPress Sites","150 GB NVMe Storage","Dedicated PHP Workers","Redis Object Cache","Priority Migration"]'::jsonb,
   'High-traffic managed WordPress cluster with Redis caching.', false, true, 22, 'cyberpanel'),
  ('wp-agency', 'wp-agency', 'WordPress Agency', 'wordpress', 'web_hosting', 14900, 148940, '8 vCPU', '16 GB RAM', '500 GB NVMe', '10 TB',
   '["100 WordPress Sites","500 GB NVMe Storage","White-Label Portal","Multisite Support","99.99% SLA"]'::jsonb,
   'Unlimited scale WordPress infrastructure for agencies.', false, true, 23, 'cyberpanel'),

  -- Cloud & Dedicated Bare Metal
  ('cloud-compute', 'cloud-compute', 'Cloud Compute High Availability', 'cloud', 'compute', 4890, 48880, '4 vCPU HA', '8 GB DDR5', '100 GB NVMe', 'Unmetered',
   '["Auto-scaling Cluster","Integrated Load Balancing","N+1 Multi-Zone Redundancy","Full REST API Automation","Automated Backups"]'::jsonb,
   'Enterprise-grade HA cloud infrastructure.', true, true, 30, 'proxmox'),
  ('dedicated-metal', 'dedicated-metal', 'Bare Metal Dedicated Server', 'dedicated', 'compute', 59990, 599660, '16 Cores / 32 Threads', '64 GB ECC', '2x 1TB NVMe RAID-1', '10 Gbps Unmetered',
   '["16 Cores / 32 Threads Intel Xeon","64GB ECC RAM","2x 1TB NVMe RAID-1","10Gbps Uplink","Unmetered Bandwidth","IPMI/KVM Root Console"]'::jsonb,
   'Single-tenant bare-metal server. 4% below AWS c5.metal.', true, true, 31, 'manual'),

  -- Calibrated Edge & Cloud Products (3-5% below AWS / Cloudflare / Portkey / Pinecone / Vercel)
  ('workers-free', 'workers-free', 'Workers Free', 'workers', 'edge_compute', 0, 0, 'Edge V8', '128 MB', 'N/A', 'Unmetered',
   '["100K requests/day","10ms CPU limit","Basic KV access","300+ PoPs"]'::jsonb,
   'Edge compute at zero cost.', false, true, 40, 'manual'),
  ('workers-pro', 'workers-pro', 'Workers Pro', 'workers', 'edge_compute', 1630, 16293, 'Edge V8', '128 MB', 'N/A', 'Unmetered',
   '["Unlimited requests","30s CPU limit","KV + R2 + D1 bindings","Custom domains & SSL"]'::jsonb,
   'Production edge compute. 4% below Cloudflare Workers Paid.', true, true, 41, 'manual'),
  ('workers-business', 'workers-business', 'Workers Business', 'workers', 'edge_compute', 4890, 48880, 'Dedicated V8', '512 MB', 'N/A', 'Unmetered',
   '["Unlimited requests","No CPU limits","Private peering","99.999% SLA"]'::jsonb,
   'Enterprise edge compute with guaranteed SLA.', false, true, 42, 'manual'),

  ('storage-pro', 'storage-pro', 'Storage Pro (1 TB)', 'storage', 'object_storage', 1850, 18493, 'S3 Gateway', 'Distributed', '1 TB NVMe', 'Zero Egress',
   '["1TB NVMe object storage","Zero egress fees forever","10M API ops/mo","Custom bucket domains"]'::jsonb,
   'High-throughput S3 storage. 5% below AWS S3 + ₹0 egress.', true, true, 50, 'manual'),
  ('storage-business', 'storage-business', 'Storage Business (5 TB)', 'storage', 'object_storage', 8900, 88964, 'S3 Cluster', 'Distributed', '5 TB NVMe', 'Zero Egress',
   '["5TB NVMe object storage","Zero egress fees forever","Unlimited API ops","Multi-region replication"]'::jsonb,
   'Multi-terabyte distributed object storage.', false, true, 51, 'manual'),

  ('ai-gateway-pro', 'ai-gateway-pro', 'AI Gateway Pro', 'ai-gateway', 'ai_services', 2490, 24890, 'Edge Proxy', 'Semantic Cache', 'Logs 30d', 'Unmetered',
   '["1M requests/mo","Unlimited AI providers","Semantic caching","Automated fallback"]'::jsonb,
   'Intelligent AI gateway. 4% below Portkey / Helicone.', true, true, 60, 'manual'),
  ('ai-gateway-business', 'ai-gateway-business', 'AI Gateway Business', 'ai-gateway', 'ai_services', 7990, 79868, 'Dedicated Proxy', 'Dedicated Redis', 'Logs 1y', 'Unmetered',
   '["10M requests/mo","Dedicated low-latency proxy","Enterprise RBAC & audit","99.99% SLA"]'::jsonb,
   'Enterprise AI proxy fleet with dedicated throughput.', false, true, 61, 'manual'),

  ('containers-starter', 'containers-starter', 'Containers Starter', 'containers', 'containers', 4650, 46481, '4 vCPU', '8 GB', '80 GB', 'Unmetered',
   '["3 Managed K3s nodes","4 vCPU compute","8GB RAM","Automatic TLS ingress"]'::jsonb,
   'Managed K3s container fleet. 4% below AWS EKS.', false, true, 70, 'manual'),
  ('containers-pro', 'containers-pro', 'Containers Pro', 'containers', 'containers', 11850, 118453, '8 vCPU', '16 GB', '200 GB', 'Unmetered',
   '["10 Managed K3s nodes","8 vCPU / 16GB RAM","Dedicated Load Balancer","Horizontal pod autoscaling"]'::jsonb,
   'Production Kubernetes orchestration.', true, true, 71, 'manual'),
  ('containers-enterprise', 'containers-enterprise', 'Containers Enterprise', 'containers', 'containers', 28900, 288884, '32 vCPU', '64 GB', '1 TB', 'Unmetered',
   '["Unlimited nodes","Dedicated bare-metal","NVIDIA GPU node support","Multi-zone HA"]'::jsonb,
   'High-density bare-metal K8s fleet.', false, true, 72, 'manual'),

  ('pages-pro', 'pages-pro', 'Pages Pro', 'pages', 'web_hosting', 1580, 15794, 'Edge SSR', 'Auto', 'Unlimited', '1 TB',
   '["Unlimited builds","1TB edge bandwidth","Next.js SSR & App Router","Edge caching"]'::jsonb,
   'Full-stack SSR deployments. 4.5% below Vercel Pro.', true, true, 80, 'manual'),
  ('pages-business', 'pages-business', 'Pages Business', 'pages', 'web_hosting', 4850, 48481, 'Dedicated Build', 'Auto', 'Unlimited', '5 TB',
   '["Concurrent builds","5TB edge bandwidth","Dedicated build runners","Custom WAF rules"]'::jsonb,
   'High-traffic enterprise frontends.', false, true, 81, 'manual'),

  ('database-pro', 'database-pro', 'Database Pro', 'database', 'database', 1520, 15194, '2 vCPU', '4 GB', '10 GB NVMe', 'Unmetered',
   '["10GB distributed storage","25M reads/mo","7-day time-travel recovery","Automatic read replicas"]'::jsonb,
   'Production edge SQL database. 4% below Neon/RDS.', true, true, 90, 'manual'),
  ('database-business', 'database-business', 'Database Business', 'database', 'database', 3090, 30888, '4 vCPU', '8 GB', '100 GB NVMe', 'Unmetered',
   '["100GB distributed storage","Unlimited reads","30-day continuous backup","99.99% SLA"]'::jsonb,
   '100GB distributed SQL database cluster.', false, true, 91, 'manual')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  tier = EXCLUDED.tier,
  category = COALESCE(EXCLUDED.category, hosting_plans.category),
  price_monthly = EXCLUDED.price_monthly,
  price_annual = EXCLUDED.price_annual,
  cpu = COALESCE(EXCLUDED.cpu, hosting_plans.cpu),
  ram = COALESCE(EXCLUDED.ram, hosting_plans.ram),
  storage = COALESCE(EXCLUDED.storage, hosting_plans.storage),
  bandwidth = COALESCE(EXCLUDED.bandwidth, hosting_plans.bandwidth),
  features = EXCLUDED.features,
  short_description = EXCLUDED.short_description,
  is_popular = EXCLUDED.is_popular,
  is_active = EXCLUDED.is_active,
  provisioning_type = COALESCE(EXCLUDED.provisioning_type, hosting_plans.provisioning_type),
  updated_at = now();
