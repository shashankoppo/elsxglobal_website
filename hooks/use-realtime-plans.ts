import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';

type Plan = any;

/**
 * Calibrated enterprise fallback plans (3-5% lower than AWS / Google Cloud / Azure)
 * Kept strictly aligned with lib/data/all-plans.ts and PostgreSQL hosting_plans.
 */
const FALLBACK_PLANS: Record<string, Plan[]> = {
  shared: [
    {
      id: 'shared-starter',
      slug: 'shared-starter',
      tier: 'shared',
      name: 'Shared Starter',
      short_description: 'High-speed NVMe hosting for blogs, portfolios, and personal sites.',
      price_monthly: 790,
      price_annual: 7897,
      cpu: '1 vCPU',
      ram: '1 GB RAM',
      storage: '10 GB NVMe',
      bandwidth: 'Unmetered',
      features: ['1 Website', '10 GB NVMe Storage', 'Free Wildcard SSL', 'Unmetered Bandwidth', 'HestiaCP / cPanel'],
      is_popular: false,
      sort_order: 1,
    },
    {
      id: 'shared-pro',
      slug: 'shared-pro',
      tier: 'shared',
      name: 'Shared Professional',
      short_description: 'High-speed shared hosting for growing businesses, agencies, and online stores.',
      price_monthly: 1490,
      price_annual: 14894,
      cpu: '2 vCPU',
      ram: '2 GB RAM',
      storage: '50 GB NVMe',
      bandwidth: 'Unmetered',
      features: ['Unlimited Websites', '50 GB NVMe Storage', 'Free Wildcard SSL', 'Daily Backups', 'Free White-Glove Migration'],
      is_popular: true,
      sort_order: 2,
    },
    {
      id: 'shared-business',
      slug: 'shared-business',
      tier: 'shared',
      name: 'Shared Business',
      short_description: 'Maximum shared resources and NVMe I/O throughput for demanding eCommerce portals.',
      price_monthly: 2790,
      price_annual: 27889,
      cpu: '4 vCPU',
      ram: '4 GB RAM',
      storage: '100 GB NVMe',
      bandwidth: 'Unmetered',
      features: ['Unlimited Websites', '100 GB NVMe Storage', 'Premium EV SSL', 'Daily Automated Backups', 'Priority VIP Support'],
      is_popular: false,
      sort_order: 3,
    },
  ],
  wordpress: [
    {
      id: 'wp-starter',
      slug: 'wp-starter',
      tier: 'wordpress',
      name: 'WordPress Starter',
      short_description: 'Fast, secure WordPress hosting for solo creators and blogs. 4% below AWS Lightsail WP.',
      price_monthly: 1490,
      price_annual: 14894,
      cpu: '1 vCPU',
      ram: '2 GB RAM',
      storage: '25 GB NVMe',
      bandwidth: '1 TB',
      features: ['1 WordPress Site', '25 GB NVMe Storage', 'LiteSpeed Caching', 'Free SSL & CDN', 'Auto-Updates'],
      is_popular: false,
      sort_order: 1,
    },
    {
      id: 'wp-business',
      slug: 'wp-business',
      tier: 'wordpress',
      name: 'WordPress Business',
      short_description: 'Performance WordPress hosting for small businesses and e-commerce.',
      price_monthly: 2990,
      price_annual: 29888,
      cpu: '2 vCPU',
      ram: '4 GB RAM',
      storage: '50 GB NVMe',
      bandwidth: '3 TB',
      features: ['5 WordPress Sites', '50 GB NVMe Storage', 'WooCommerce Optimized', '1-Click Staging', 'Daily Backups'],
      is_popular: true,
      sort_order: 2,
    },
    {
      id: 'wp-pro',
      slug: 'wp-pro',
      tier: 'wordpress',
      name: 'WordPress Pro',
      short_description: 'High-traffic managed WordPress cluster with Redis object caching.',
      price_monthly: 5890,
      price_annual: 58876,
      cpu: '4 vCPU',
      ram: '8 GB RAM',
      storage: '150 GB NVMe',
      bandwidth: '6 TB',
      features: ['25 WordPress Sites', '150 GB NVMe Storage', 'Dedicated PHP Workers', 'Redis Object Cache', 'Priority Migration'],
      is_popular: false,
      sort_order: 3,
    },
  ],
  vps: [
    {
      id: 'vps-nano',
      slug: 'vps-nano',
      tier: 'vps',
      name: 'VPS Nano',
      short_description: 'Entry-level high-performance virtual server. 4.5% below AWS t3.small.',
      price_monthly: 1480,
      price_annual: 14794,
      cpu: '1 vCPU EPYC',
      ram: '2 GB DDR5',
      storage: '40 GB NVMe',
      bandwidth: '1 TB',
      features: ['Full Root / SSH Access', 'KVM Virtualization', 'Dedicated IPv4 + IPv6', 'Custom ISO Mounting', '1-Click Snapshots', 'Mumbai / Pune DC'],
      is_popular: false,
      sort_order: 1,
    },
    {
      id: 'vps-standard',
      slug: 'vps-standard',
      tier: 'vps',
      name: 'VPS Standard',
      short_description: 'Balanced cloud compute for production web applications. 4.2% below AWS t3.medium.',
      price_monthly: 2960,
      price_annual: 29588,
      cpu: '2 vCPU EPYC',
      ram: '4 GB DDR5',
      storage: '80 GB NVMe',
      bandwidth: '3 TB',
      features: ['Full Root / SSH Access', 'KVM Virtualization', 'Dedicated IPv4 + IPv6', 'Automated Backups', 'DDoS Protection Included', 'API & Cloud-Init'],
      is_popular: false,
      sort_order: 2,
    },
    {
      id: 'vps-pro',
      slug: 'vps-pro',
      tier: 'vps',
      name: 'VPS Pro',
      short_description: 'Production-tier instance for scalable APIs & DBs. 4.1% below AWS t3.large.',
      price_monthly: 5850,
      price_annual: 58476,
      cpu: '4 vCPU EPYC',
      ram: '8 GB DDR5',
      storage: '160 GB NVMe',
      bandwidth: '6 TB',
      features: ['High-Frequency EPYC Cores', '10 Gbps Redundant Uplink', 'Automated Snapshots', 'Private VPC Networking', 'DDoS Protection Included', 'API & Terraform Support'],
      is_popular: true,
      sort_order: 3,
    },
  ],
  cloud: [
    {
      id: 'cloud-compute',
      slug: 'cloud-compute',
      tier: 'cloud',
      name: 'Cloud Compute High Availability',
      short_description: 'Enterprise-grade cloud cluster with N+1 redundancy and zero egress fees.',
      price_monthly: 4890,
      price_annual: 48880,
      cpu: '4 vCPU HA',
      ram: '8 GB DDR5',
      storage: '100 GB NVMe',
      bandwidth: 'Unmetered',
      features: ['Auto-scaling Cluster', 'Integrated Load Balancing', 'N+1 Multi-Zone Redundancy', 'Full REST API Automation', 'Automated Backups', '99.999% High Availability SLA'],
      is_popular: true,
      sort_order: 1,
    },
    {
      id: 'containers-pro',
      slug: 'containers-pro',
      tier: 'cloud',
      name: 'Managed Kubernetes Fleet',
      short_description: 'High-availability K3s Kubernetes control plane with zero egress.',
      price_monthly: 11850,
      price_annual: 118453,
      cpu: '8 vCPU Dedicated',
      ram: '16 GB DDR5',
      storage: '200 GB NVMe',
      bandwidth: 'Unmetered',
      features: ['Managed K3s Control Plane', 'Dedicated Ingress Controller', 'Horizontal Pod Autoscaling', 'Private Container Registry', 'Zero-Downtime Rolling Deploys', 'Enterprise Backup Vault'],
      is_popular: false,
      sort_order: 2,
    },
  ],
  dedicated: [
    {
      id: 'dedicated-metal',
      slug: 'dedicated-metal',
      tier: 'dedicated',
      name: 'Bare Metal Dedicated Server',
      short_description: 'Single-tenant physical server. 4% below AWS c5.metal with 10Gbps unmetered.',
      price_monthly: 59990,
      price_annual: 599660,
      cpu: '16 Cores / 32 Threads Xeon',
      ram: '64 GB ECC DDR5',
      storage: '2x 1TB NVMe RAID-1',
      bandwidth: '10 Gbps Unmetered',
      features: ['IPMI 2.0 / KVM-over-IP', 'Hardware RAID Controller', 'Dual Redundant 1200W PSU', '100% Power & Network SLA', '4-Hour Hardware Replacement', 'Mumbai & Pune DCs'],
      is_popular: true,
      sort_order: 1,
    },
  ],
  email: [
    {
      id: 'email-starter',
      slug: 'email-starter',
      tier: 'email',
      name: 'Business Email Starter',
      short_description: 'Professional business email with 10 GB mailbox and spam protection.',
      price_monthly: 149,
      price_annual: 1489,
      storage: '10 GB / Mailbox',
      features: ['1 Business Mailbox', 'Webmail & Mobile Sync', 'Anti-Spam & Virus Defense', 'IMAP/POP3/SMTP Access', 'Free SSL/TLS Encryption'],
      is_popular: false,
      sort_order: 1,
    },
    {
      id: 'email-business',
      slug: 'email-business',
      tier: 'email',
      name: 'Business Email Pro',
      short_description: 'Multi-mailbox enterprise communication with Exchange ActiveSync and DKIM.',
      price_monthly: 299,
      price_annual: 2989,
      storage: '25 GB / Mailbox',
      features: ['5 Business Mailboxes', '25 GB Storage per User', 'Exchange ActiveSync', 'DKIM/SPF/DMARC', 'Priority Support'],
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
      price_monthly: 5999,
      price_annual: 5999,
      features: ['Secures *.yourdomain.com', 'NIST Post-Quantum Hybrid (ML-KEM)', 'Instant Automated Issuance', '99.9% Browser Compatibility', 'Free Unlimited Reissues'],
      is_popular: true,
      sort_order: 1,
    },
  ],
  'website-builder': [
    {
      id: 'builder-starter',
      slug: 'builder-starter',
      tier: 'website-builder',
      name: 'AI Website Builder Starter',
      short_description: 'Generate a professional 5-page business website with AI in 60 seconds.',
      price_monthly: 490,
      price_annual: 4898,
      features: ['Up to 5 Pages', '10 GB NVMe Storage', 'AI Copy & Layout Assistant', 'Free Let’s Encrypt SSL'],
      is_popular: false,
      sort_order: 1,
    },
    {
      id: 'builder-business',
      slug: 'builder-business',
      tier: 'website-builder',
      name: 'AI Website Builder Business',
      short_description: 'Unlimited pages with integrated ecommerce, UPI & Razorpay payments.',
      price_monthly: 1190,
      price_annual: 11895,
      features: ['Unlimited Pages', '50 GB NVMe Storage', 'Up to 100 Ecommerce Products', '0% Transaction Fee', 'Free Domain (1st Year)'],
      is_popular: true,
      sort_order: 2,
    },
  ],
};

function getFallbackPlans(tier?: string): Plan[] {
  if (tier && FALLBACK_PLANS[tier]) {
    return FALLBACK_PLANS[tier];
  }
  return Object.values(FALLBACK_PLANS).flat();
}

export function useRealtimePlans(initialTier?: string) {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const supabase = createClient();

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
