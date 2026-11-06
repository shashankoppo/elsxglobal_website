import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';

type Plan = any;

const FALLBACK_PLANS: Record<string, Plan[]> = {
  shared: [
    {
      id: 'shared-starter',
      slug: 'shared-starter',
      tier: 'shared',
      name: 'Starter Shared',
      short_description: 'Perfect for personal websites and early blogs.',
      price_monthly: 99,
      price_annual: 999,
      cpu: '1 vCPU',
      ram: '1 GB RAM',
      storage: '20 GB NVMe',
      bandwidth: '500 GB',
      features: ['1 Website', 'Free SSL Certificate', '5 Business Mailboxes', 'cPanel / DirectAdmin', 'Daily Automated Backups', '99.9% Uptime Guarantee'],
      is_popular: false,
      sort_order: 1,
    },
    {
      id: 'shared-pro',
      slug: 'shared-pro',
      tier: 'shared',
      name: 'Professional Shared',
      short_description: 'Ideal for growing businesses and multi-site portfolios.',
      price_monthly: 199,
      price_annual: 1999,
      cpu: '2 vCPU',
      ram: '2 GB RAM',
      storage: '50 GB NVMe',
      bandwidth: '1.5 TB',
      features: ['Unlimited Websites', 'Free Wildcard SSL', 'Unlimited Mailboxes', 'LiteSpeed Web Server', 'Free Domain (Annual)', 'Priority 24/7 Support'],
      is_popular: true,
      sort_order: 2,
    },
    {
      id: 'shared-business',
      slug: 'shared-business',
      tier: 'shared',
      name: 'Business Turbo',
      short_description: 'Maximum throughput and isolated resources for high-traffic sites.',
      price_monthly: 399,
      price_annual: 3999,
      cpu: '4 vCPU',
      ram: '4 GB RAM',
      storage: '100 GB NVMe',
      bandwidth: 'Unlimited',
      features: ['Dedicated IP Address', 'Free Cloudflare CDN', 'PCI-DSS Compliance Ready', 'Redis Object Cache', 'Staging Environment', 'Dedicated Account Manager'],
      is_popular: false,
      sort_order: 3,
    },
  ],
  wordpress: [
    {
      id: 'wp-starter',
      slug: 'wp-starter',
      tier: 'wordpress',
      name: 'WP Starter',
      short_description: 'Managed WordPress optimized for blogs and creator portfolios.',
      price_monthly: 199,
      price_annual: 1999,
      cpu: '1 vCPU',
      ram: '2 GB RAM',
      storage: '25 GB NVMe',
      bandwidth: '1 TB',
      features: ['1 WordPress Site', 'Automatic WP Updates', 'WP-CLI & SSH Access', 'Built-in Page Cache', 'Free Wildcard SSL', 'Free Migration Service'],
      is_popular: false,
      sort_order: 1,
    },
    {
      id: 'wp-pro',
      slug: 'wp-pro',
      tier: 'wordpress',
      name: 'WP Growth & WooCommerce',
      short_description: 'High-speed WooCommerce and business platform with Redis caching.',
      price_monthly: 399,
      price_annual: 3999,
      cpu: '2 vCPU',
      ram: '4 GB RAM',
      storage: '60 GB NVMe',
      bandwidth: '3 TB',
      features: ['Up to 5 Sites', '1-Click Staging & Push', 'Redis Object Cache', 'WooCommerce Optimized', 'Malware Scanner & Removal', 'Daily Cloud Backups'],
      is_popular: true,
      sort_order: 2,
    },
    {
      id: 'wp-scale',
      slug: 'wp-scale',
      tier: 'wordpress',
      name: 'WP Enterprise Scale',
      short_description: 'Enterprise WordPress with dedicated PHP workers and edge CDN.',
      price_monthly: 799,
      price_annual: 7999,
      cpu: '4 vCPU',
      ram: '8 GB RAM',
      storage: '150 GB NVMe',
      bandwidth: 'Unlimited',
      features: ['Unlimited WP Sites', 'Edge Cache Routing', 'Dedicated PHP-FPM Pools', 'Global Anycast CDN', 'Automated Failover', 'Custom Varnish Rules'],
      is_popular: false,
      sort_order: 3,
    },
  ],
  vps: [
    {
      id: 'vps-standard',
      slug: 'vps-standard',
      tier: 'vps',
      name: 'VPS Standard',
      short_description: 'General purpose cloud instance on pure NVMe.',
      price_monthly: 799,
      price_annual: 7990,
      cpu: '2 vCPU EPYC',
      ram: '4 GB RAM',
      storage: '80 GB NVMe',
      bandwidth: '3 TB',
      features: ['Full Root / SSH Access', 'KVM Virtualization', 'Dedicated IPv4 + IPv6', 'Custom ISO Mounting', '1-Click Snapshots', 'Mumbai Datacenter'],
      is_popular: false,
      sort_order: 1,
    },
    {
      id: 'vps-pro',
      slug: 'vps-pro',
      tier: 'vps',
      name: 'VPS Pro',
      short_description: 'Production-tier instance for scalable APIs and web apps.',
      price_monthly: 1499,
      price_annual: 14990,
      cpu: '4 vCPU EPYC',
      ram: '8 GB RAM',
      storage: '160 GB NVMe',
      bandwidth: '6 TB',
      features: ['High-Frequency EPYC Cores', '10 Gbps Redundant Uplink', 'Weekly Automated Backups', 'Private VPC Networking', 'DDoS Protection Included', 'API & Terraform Support'],
      is_popular: true,
      sort_order: 2,
    },
    {
      id: 'vps-elite',
      slug: 'vps-elite',
      tier: 'vps',
      name: 'VPS Elite Compute',
      short_description: 'High-memory instance for data-intensive databases and backend services.',
      price_monthly: 2999,
      price_annual: 29990,
      cpu: '8 vCPU EPYC',
      ram: '16 GB RAM',
      storage: '320 GB NVMe',
      bandwidth: '10 TB',
      features: ['Dedicated Core Allocation', 'Zero Resource Contention', 'Live Kernel Patching', 'BGP Anycast Routing', 'Custom Firewalls', '24/7 Dedicated Slack Channel'],
      is_popular: false,
      sort_order: 3,
    },
  ],
  cloud: [
    {
      id: 'cloud-s',
      slug: 'cloud-s',
      tier: 'cloud',
      name: 'Cloud Cluster Small',
      short_description: 'Managed multi-node cloud cluster with auto-healing.',
      price_monthly: 1999,
      price_annual: 19990,
      cpu: '4 vCPU Shared',
      ram: '8 GB RAM',
      storage: '100 GB NVMe',
      bandwidth: '5 TB',
      features: ['Managed Load Balancer', 'Auto-Scaling 1-3 Nodes', 'Automated Failover', 'Prometheus Metrics', 'Private Subnet', '99.99% High Availability SLA'],
      is_popular: false,
      sort_order: 1,
    },
    {
      id: 'cloud-m',
      slug: 'cloud-m',
      tier: 'cloud',
      name: 'Cloud Cluster Medium',
      short_description: 'High-availability Kubernetes and distributed database clusters.',
      price_monthly: 4999,
      price_annual: 49990,
      cpu: '8 vCPU Dedicated',
      ram: '16 GB RAM',
      storage: '250 GB NVMe',
      bandwidth: '10 TB',
      features: ['Managed K8s Control Plane', 'Dedicated Ingress Controller', 'Distributed Storage Replicas', 'Grafana Dashboard Suite', 'Zero-Downtime Rolling Deploys', 'Enterprise Backup Vault'],
      is_popular: true,
      sort_order: 2,
    },
  ],
  dedicated: [
    {
      id: 'ded-epyc-64',
      slug: 'ded-epyc-64',
      tier: 'dedicated',
      name: 'AMD EPYC Compute-64',
      short_description: 'Single-tenant physical server with 100% bare-metal performance.',
      price_monthly: 14999,
      price_annual: 149990,
      cpu: 'AMD EPYC 9354 (32c/64t)',
      ram: '128 GB DDR5 ECC',
      storage: '2x 1.92TB Enterprise NVMe',
      bandwidth: '10 Gbps Unmetered',
      features: ['IPMI 2.0 / KVM-over-IP', 'Hardware RAID Controller', 'Dual Redundant 1200W PSU', '100% Power & Network SLA', '4-Hour Hardware Replacement', 'Mumbai & Frankfurt PoPs'],
      is_popular: true,
      sort_order: 1,
    },
    {
      id: 'ded-epyc-128',
      slug: 'ded-epyc-128',
      tier: 'dedicated',
      name: 'AMD EPYC Heavy-128',
      short_description: 'Heavy computational horsepower for enterprise virtualization and AI.',
      price_monthly: 26999,
      price_annual: 269990,
      cpu: 'AMD EPYC 9554 (64c/128t)',
      ram: '256 GB DDR5 ECC',
      storage: '4x 3.84TB Enterprise NVMe',
      bandwidth: '20 Gbps Unmetered',
      features: ['AMD SEV-SNP Confidential Compute', 'Hardware Enclave Encryption', 'Direct BGP Transit Peering', 'Custom OS & BIOS Provisioning', 'Dedicated Account Engineer', 'Tier 4 Datacenter'],
      is_popular: false,
      sort_order: 2,
    },
  ],
  email: [
    {
      id: 'email-starter',
      slug: 'email-starter',
      tier: 'email',
      name: 'Business Mail Starter',
      short_description: 'Custom domain email for freelancers and small agencies.',
      price_monthly: 49,
      price_annual: 499,
      storage: '5 GB / Mailbox',
      features: ['Custom Domain (you@company.com)', 'Modern Webmail Client', 'IMAP, POP3 & ActiveSync', 'Advanced Anti-Spam & Anti-Phishing', 'DKIM, SPF & DMARC Wizard', 'Mobile App Sync'],
      is_popular: false,
      sort_order: 1,
    },
    {
      id: 'email-pro',
      slug: 'email-pro',
      tier: 'email',
      name: 'Enterprise Mail Suite',
      short_description: 'Large mailboxes with collaborative calendar and cloud storage.',
      price_monthly: 99,
      price_annual: 999,
      storage: '25 GB / Mailbox',
      features: ['Shared Team Calendars', 'Contacts & Task Manager', 'Email Archiving & Retention', 'Encrypted TLS Transmission', 'Attachment Limit up to 50MB', '24/7 Priority Mail Support'],
      is_popular: true,
      sort_order: 2,
    },
  ],
  ssl: [
    {
      id: 'ssl-standard',
      slug: 'ssl-standard',
      tier: 'ssl',
      name: 'Automated Wildcard SSL',
      short_description: 'Instant domain validation certificate covering root and subdomains.',
      price_monthly: 99,
      price_annual: 899,
      features: ['Secures *.yourdomain.com', 'NIST Post-Quantum Hybrid (ML-KEM)', 'Instant Automated Issuance', '99.9% Browser Compatibility', '256-Bit SHA-2 Encryption', 'Free Unlimited Reissues'],
      is_popular: true,
      sort_order: 1,
    },
    {
      id: 'ssl-ov',
      slug: 'ssl-ov',
      tier: 'ssl',
      name: 'Organization Validated (OV)',
      short_description: 'Business verified certificate showing legal company details.',
      price_monthly: 249,
      price_annual: 2499,
      features: ['Verified Legal Company Identity', 'Dynamic Security Site Seal', '$1.25M Underwritten Warranty', 'Priority OCSP Stapling', 'Sub-Millisecond 0-RTT Handshake', 'Dedicated Support Verification'],
      is_popular: false,
      sort_order: 2,
    },
  ],
  'website-builder': [
    {
      id: 'builder-starter',
      slug: 'builder-starter',
      tier: 'website-builder',
      name: 'AI Site Builder Starter',
      short_description: 'Build professional responsive websites in minutes with AI.',
      price_monthly: 149,
      price_annual: 1490,
      features: ['Drag-and-Drop Visual Editor', '100+ Designer Templates', 'AI Copy & Image Generator', 'Free Custom Domain Connect', 'Mobile Responsive Engine', 'Built-in Contact Forms'],
      is_popular: false,
      sort_order: 1,
    },
    {
      id: 'builder-ecom',
      slug: 'builder-ecom',
      tier: 'website-builder',
      name: 'E-Commerce Store Builder',
      short_description: 'Launch an online store with UPI, Razorpay & Stripe integration.',
      price_monthly: 499,
      price_annual: 4990,
      features: ['Unlimited Product Listings', '0% Transaction Fees', 'UPI, Cards & NetBanking Integration', 'Automated Inventory & Shipping Tracking', 'Abandoned Cart Recovery', 'SEO Optimizer Engine'],
      is_popular: true,
      sort_order: 2,
    },
  ],
};

function getFallbackPlans(tier?: string): Plan[] {
  if (tier && FALLBACK_PLANS[tier]) {
    return FALLBACK_PLANS[tier];
  }
  // Return all combined plans
  return Object.values(FALLBACK_PLANS).flat();
}

export function useRealtimePlans(initialTier?: string) {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const supabase = createClient();

    // Initial fetch
    const fetchPlans = async () => {
      try {
        let query = supabase.from('hosting_plans').select('*').eq('is_active', true);
        if (initialTier) {
          query = query.eq('tier', initialTier);
        }
        const { data } = await query.order('sort_order', { ascending: true });
        if (isMounted) {
          if (data && data.length > 0) {
            setPlans(data);
          } else {
            // Graceful fallback to rich enterprise plans
            setPlans(getFallbackPlans(initialTier));
          }
        }
      } catch {
        if (isMounted) {
          setPlans(getFallbackPlans(initialTier));
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchPlans();

    // Subscribe to realtime changes
    const channel = supabase
      .channel('public:hosting_plans')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'hosting_plans' },
        (payload) => {
          if (!isMounted) return;
          
          if (payload.eventType === 'INSERT') {
            const newPlan = payload.new as Plan;
            if (newPlan.is_active && (!initialTier || newPlan.tier === initialTier)) {
              setPlans(prev => [...prev, newPlan].sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0)));
            }
          } else if (payload.eventType === 'UPDATE') {
            const updatedPlan = payload.new as Plan;
            setPlans(prev => {
              if (!updatedPlan.is_active || (initialTier && updatedPlan.tier !== initialTier)) {
                return prev.filter(p => p.id !== updatedPlan.id);
              }
              const exists = prev.some(p => p.id === updatedPlan.id);
              if (exists) {
                return prev.map(p => p.id === updatedPlan.id ? updatedPlan : p).sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
              } else {
                return [...prev, updatedPlan].sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
              }
            });
          } else if (payload.eventType === 'DELETE') {
            setPlans(prev => prev.filter(p => p.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      isMounted = false;
      supabase.removeChannel(channel);
    };
  }, [initialTier]);

  return { plans, loading };
}
