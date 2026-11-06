/**
 * Centralized Pricing Data
 *
 * Source of truth for hosting tier metadata used by the dynamic route
 * /vaulthost/hosting/[tier]. Prices are loaded from Supabase hosting_plans
 * at runtime; this file provides the tier-level metadata (hero, features,
 * comparison data) that does not change per-plan.
 */

export interface HostingTier {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  icon: string;
  heroImage: string;
  highlights: string[];
  features: { label: string; description: string }[];
  faqs: { question: string; answer: string }[];
  seoMeta: {
    title: string;
    description: string;
    keywords: string[];
    canonical: string;
  };
}

export const hostingTiers: HostingTier[] = [
  {
    slug: 'shared',
    name: 'Shared Hosting',
    tagline: 'Perfect for personal sites and small businesses',
    description: 'Affordable, reliable hosting with cPanel, free SSL, and 1-click app installers. Ideal for blogs, portfolios, and small business websites.',
    icon: 'Globe',
    heroImage: '',
    highlights: [
      'Free SSL certificate included',
      'cPanel access with 1-click app installer',
      'Free domain with annual plans',
      '99.99% uptime SLA',
      'Daily backups included',
      '24/7 human support',
    ],
    features: [
      { label: 'NVMe SSD Storage', description: 'All shared plans use NVMe SSD storage for 10x faster I/O than traditional SSDs.' },
      { label: 'Free CDN', description: 'Global CDN included on all plans for faster page loads worldwide.' },
      { label: 'Unlimited Bandwidth', description: 'No bandwidth caps on Business and Enterprise plans.' },
      { label: '1-Click Installer', description: 'Install WordPress, Joomla, Drupal, and 400+ apps with one click.' },
    ],
    faqs: [
      { question: 'Can I host multiple websites on shared hosting?', answer: 'Yes. The Business plan supports 10 websites and the Enterprise plan supports unlimited websites.' },
      { question: 'Do you offer a money-back guarantee?', answer: 'Yes, all shared hosting plans come with a 30-day money-back guarantee.' },
      { question: 'Is SSH access available?', answer: 'Yes, SSH access is included on all shared hosting plans for secure file management.' },
    ],
    seoMeta: {
      title: 'Shared Hosting India — Fast, Reliable, Affordable | VaultHost',
      description: 'Enterprise shared hosting with NVMe SSD, free SSL, cPanel, and 24/7 support. Plans from Rs 299/mo. 30-day money-back guarantee.',
      keywords: ['shared hosting India', 'cheap shared hosting', 'cPanel hosting India', 'best shared hosting'],
      canonical: 'https://elsxglobal.com/vaulthost/shared',
    },
  },
  {
    slug: 'wordpress',
    name: 'WordPress Hosting',
    tagline: 'Optimized for speed, built for scale',
    description: 'Managed WordPress hosting with automatic updates, daily backups, staging environments, and WP-CLI. Built on our NVMe infrastructure for blazing-fast page loads.',
    icon: 'FileText',
    heroImage: '',
    highlights: [
      'Automatic WordPress core updates',
      '1-click staging environments',
      'Daily backups with 30-day retention',
      'WP-CLI pre-installed',
      'Free SSL and CDN',
      'Built-in caching (LiteSpeed)',
    ],
    features: [
      { label: 'LiteSpeed Cache', description: 'Built-in LiteSpeed Cache plugin for 3x faster page loads than Apache.' },
      { label: 'Staging Sites', description: 'Create a staging copy of your site to test changes before going live.' },
      { label: 'Automatic Updates', description: 'WordPress core, themes, and plugins update automatically with rollback support.' },
      { label: 'WP-CLI', description: 'Manage WordPress from the command line with pre-installed WP-CLI.' },
    ],
    faqs: [
      { question: 'Can I migrate my existing WordPress site for free?', answer: 'Yes. Our white-glove migration team migrates your WordPress site at no cost with all annual plans.' },
      { question: 'Do you support WooCommerce?', answer: 'Yes, all WordPress plans fully support WooCommerce with optimized server configurations.' },
      { question: 'How many WordPress sites can I install?', answer: 'WP Agency plan supports unlimited WordPress installations with white-label options.' },
    ],
    seoMeta: {
      title: 'Managed WordPress Hosting India — Fast & Secure | VaultHost',
      description: 'Managed WordPress hosting with LiteSpeed caching, staging, daily backups, and free migration. Plans from Rs 349/mo.',
      keywords: ['wordpress hosting India', 'managed wordpress', 'wordpress hosting mumbai', 'best wordpress hosting'],
      canonical: 'https://elsxglobal.com/vaulthost/wordpress',
    },
  },
  {
    slug: 'vps',
    name: 'VPS Hosting',
    tagline: 'Full root access, enterprise performance',
    description: 'Virtual private servers with dedicated NVMe storage, full root access, and your choice of OS. Perfect for developers and growing businesses.',
    icon: 'Server',
    heroImage: '',
    highlights: [
      'Dedicated NVMe SSD storage',
      'Full root SSH access',
      'Choice of OS (Ubuntu, Debian, AlmaLinux)',
      '99.99% uptime SLA',
      'Free DDoS protection',
      'Instant provisioning',
    ],
    features: [
      { label: 'Dedicated Resources', description: 'Your vCPU, RAM, and storage are guaranteed — no noisy neighbors.' },
      { label: 'NVMe Storage', description: 'NVMe SSDs deliver 10x the IOPS of traditional SSDs for faster database queries.' },
      { label: 'DDoS Protection', description: 'Up to 10Gbps DDoS mitigation included on all VPS plans at no extra cost.' },
      { label: 'Snapshots', description: 'Take on-demand snapshots and restore your server to any point in time.' },
    ],
    faqs: [
      { question: 'Do I get root access?', answer: 'Yes, all VPS plans include full root SSH access. You have complete control over your server.' },
      { question: 'Can I upgrade my VPS later?', answer: 'Yes, you can upgrade at any time with zero downtime. We prorate the difference automatically.' },
      { question: 'Which OS can I install?', answer: 'Choose from Ubuntu 22.04/24.04, Debian 12, AlmaLinux 9, Rocky Linux 9, or Windows Server 2022.' },
    ],
    seoMeta: {
      title: 'VPS Hosting India — NVMe SSD, Root Access, DDoS Protection | VaultHost',
      description: 'Enterprise VPS hosting with NVMe SSD, full root access, free DDoS protection, and 99.99% SLA. Plans from Rs 1,499/mo.',
      keywords: ['vps hosting India', 'nvme vps', 'cheap vps India', 'linux vps mumbai', 'root access vps'],
      canonical: 'https://elsxglobal.com/vaulthost/vps',
    },
  },
  {
    slug: 'cloud',
    name: 'Cloud Hosting',
    tagline: 'Auto-scaling infrastructure for modern apps',
    description: 'Cloud hosting with automatic scaling, high availability, and 99.99% SLA. Deploy across multiple regions with one click.',
    icon: 'Cloud',
    heroImage: '',
    highlights: [
      'Automatic vertical and horizontal scaling',
      'Multi-region deployment',
      '99.99% SLA with N+1 redundancy',
      'Built-in WAF and DDoS protection',
      'Load balancer included',
      'API-driven infrastructure',
    ],
    features: [
      { label: 'Auto-Scaling', description: 'CPU and RAM scale automatically based on traffic. Pay only for what you use.' },
      { label: 'Multi-Region', description: 'Deploy across Pune, Delhi NCR, and Mumbai with automatic failover.' },
      { label: 'Load Balancer', description: 'Built-in load balancer distributes traffic across your instances.' },
      { label: 'WAF', description: 'Web Application Firewall with OWASP rules protects against SQL injection, XSS, and more.' },
    ],
    faqs: [
      { question: 'How does auto-scaling work?', answer: 'When your traffic spikes, we automatically add more CPU and RAM. When traffic drops, resources scale down. You pay for actual usage.' },
      { question: 'Can I deploy in multiple regions?', answer: 'Yes. Cloud Pro and Enterprise plans support multi-region deployment with automatic DNS failover.' },
      { question: 'Is there a long-term contract?', answer: 'No. Cloud hosting is pay-as-you-go with no lock-in. You can cancel anytime.' },
    ],
    seoMeta: {
      title: 'Cloud Hosting India — Auto-Scaling, Multi-Region | VaultHost',
      description: 'Enterprise cloud hosting with auto-scaling, multi-region deployment, WAF, and 99.99% SLA. Plans from Rs 3,499/mo.',
      keywords: ['cloud hosting India', 'auto scaling hosting', 'multi region cloud', 'enterprise cloud hosting'],
      canonical: 'https://elsxglobal.com/vaulthost/cloud',
    },
  },
  {
    slug: 'dedicated',
    name: 'Dedicated Servers',
    tagline: 'Raw power for mission-critical workloads',
    description: 'Bare metal dedicated servers with Intel Xeon processors, ECC RAM, and enterprise NVMe storage. Full hardware control with no virtualization overhead.',
    icon: 'HardDrive',
    heroImage: '',
    highlights: [
      'Intel Xeon E/Silver/Gold processors',
      'ECC RAM (16GB to 64GB)',
      'Enterprise NVMe SSD storage',
      'Unmetered bandwidth options',
      'Hardware-level DDoS protection',
      'IPMI/KVM-over-IP access',
    ],
    features: [
      { label: 'Bare Metal', description: 'No virtualization layer. You get 100% of the hardware resources.' },
      { label: 'IPMI Access', description: 'Remote management via IPMI/KVM-over-IP for OS reinstalls and console access.' },
      { label: 'Hardware DDoS', description: 'Up to 100Gbps hardware-level DDoS mitigation at the network edge.' },
      { label: 'Custom Config', description: 'Custom RAM, storage, and GPU configurations available on request.' },
    ],
    faqs: [
      { question: 'How long does server provisioning take?', answer: 'Dedicated servers are provisioned within 2-4 hours of payment verification.' },
      { question: 'Can I customize the hardware?', answer: 'Yes. Contact our sales team for custom CPU, RAM, storage, and GPU configurations.' },
      { question: 'Is remote management included?', answer: 'Yes, all dedicated servers include IPMI/KVM-over-IP access for remote console and OS management.' },
    ],
    seoMeta: {
      title: 'Dedicated Servers India — Bare Metal, Xeon, DDoS Protection | VaultHost',
      description: 'Enterprise bare metal dedicated servers with Intel Xeon, ECC RAM, NVMe SSD, and 100Gbps DDoS protection. From Rs 12,999/mo.',
      keywords: ['dedicated server India', 'bare metal server', 'xeon dedicated server', 'enterprise dedicated hosting'],
      canonical: 'https://elsxglobal.com/vaulthost/dedicated',
    },
  },
  {
    slug: 'ssl',
    name: 'SSL Certificates',
    tagline: 'Secure your site with trusted SSL',
    description: 'Protect your visitors and boost your SEO with industry-standard 256-bit SSL certificates. Domain validation in minutes, browser-trusted across all devices.',
    icon: 'Shield',
    heroImage: '',
    highlights: [
      '256-bit encryption',
      'Browser padlock & trust seal',
      'SEO ranking boost',
      '99.9% browser compatibility',
      'Free re-issuance anytime',
      '30-day money-back guarantee',
    ],
    features: [
      { label: 'Domain Validation', description: 'DV certificates issued within minutes — no paperwork required.' },
      { label: 'Wildcard Support', description: 'Wildcard SSL covers unlimited subdomains with one certificate.' },
      { label: 'EV Validation', description: 'Extended Validation certificates display your company name in the browser.' },
      { label: 'SEO Boost', description: 'Google prioritizes HTTPS sites in search rankings. SSL gives you an edge.' },
    ],
    faqs: [
      { question: 'How long does SSL issuance take?', answer: 'Domain-validated SSL certificates are issued within minutes.' },
      { question: 'Can I get a wildcard SSL?', answer: 'Yes, wildcard SSL covers all subdomains. See our Wildcard SSL page.' },
      { question: 'Do you offer EV certificates?', answer: 'Yes, Extended Validation certificates are available with organization validation.' },
    ],
    seoMeta: {
      title: 'SSL Certificates India — Comodo, Wildcard, EV SSL | VaultHost',
      description: 'Secure your website with trusted SSL certificates. 256-bit encryption, browser padlock, SEO boost. From Rs 99/mo.',
      keywords: ['ssl certificate india', 'comodo ssl', 'wildcard ssl', 'ev ssl', 'cheap ssl'],
      canonical: 'https://elsxglobal.com/vaulthost/ssl',
    },
  },
];

export function getTierBySlug(slug: string): HostingTier | undefined {
  return hostingTiers.find((t) => t.slug === slug);
}

export const validTierSlugs = hostingTiers.map((t) => t.slug);
