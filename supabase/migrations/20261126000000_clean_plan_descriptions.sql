-- Clean up legacy "below AWS / Cloudflare / Vercel / Portkey / Neon / Pinecone" phrases
-- from hosting_plans.short_description for already-migrated databases.

UPDATE public.hosting_plans
SET short_description = CASE id
  WHEN 'vps-nano' THEN 'Entry-level high-performance virtual private server on AMD EPYC.'
  WHEN 'vps-standard' THEN 'Balanced cloud compute for production web applications and APIs.'
  WHEN 'vps-pro' THEN 'High-frequency compute instance for APIs, databases, and microservices.'
  WHEN 'vps-elite' THEN 'Heavy compute power with dedicated vCPU guarantees on AMD EPYC 9004.'
  WHEN 'vps-ultra' THEN 'Enterprise virtual server for heavy analytics, CI/CD clusters, and large backends.'
  WHEN 'vps-beast' THEN 'Maximum density cloud compute instance for massive enterprise workloads.'
  WHEN 'wp-starter' THEN 'Fast, secure managed WordPress hosting with LiteSpeed caching.'
  WHEN 'dedicated-metal' THEN 'Uncompromised dedicated physical bare-metal server with zero virtualization overhead.'
  WHEN 'workers-pro' THEN 'Production-ready edge compute for growing web apps and APIs.'
  WHEN 'storage-pro' THEN 'Reliable, high-throughput S3 storage with ₹0 egress fees.'
  WHEN 'ai-gateway-pro' THEN 'Intelligent AI gateway with semantic caching and automated model fallback.'
  WHEN 'containers-starter' THEN 'Managed K3s Kubernetes container fleet with automatic TLS ingress.'
  WHEN 'pages-pro' THEN 'Full-stack SSR deployments with unlimited builds and global edge caching.'
  WHEN 'database-pro' THEN 'Production edge SQL database with automatic read replicas.'
  ELSE regexp_replace(short_description, '\s*\d+(\.\d+)?%\s*(below|lower than|<)\s*[^.]+\.?', '', 'gi')
END
WHERE short_description ~* '(below|lower than|<)\s*(aws|azure|gcp|cloudflare|portkey|pinecone|vercel|neon|redis|ngrok)';
