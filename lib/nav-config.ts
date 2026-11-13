import {
  Server, Globe, Database, Cpu, Cloud, Mail, Layout, KeyRound,
  ShoppingCart, Plus, Building2, MapPin, BookOpen, FileText, Users,
  Phone, Briefcase, ShieldCheck, Zap, Network, HardDrive, Lock,
  Layers, Boxes, Monitor, Brain, Bot, Eye, Smartphone, RefreshCw,
  Scale, GitBranch, BarChart3, MessageSquare, type LucideIcon,
} from 'lucide-react';

export interface NavItem {
  label: string;
  href: string;
  desc: string;
  icon: LucideIcon;
}

export interface NavColumn {
  heading: string;
  items: NavItem[];
}

export interface NavMenu {
  columns: NavColumn[];
  footerLink: { label: string; href: string };
}

export const ENTERPRISE_MENU: NavMenu = {
  columns: [
    {
      heading: 'Development',
      items: [
        { label: 'Custom Software', href: '/software', desc: 'Enterprise applications', icon: FileText },
        { label: 'Website Development', href: '/website-development', desc: 'Web & e-commerce', icon: Globe },
        { label: 'Mobile Apps', href: '/services/custom-software/mobile-apps', desc: 'iOS & Android', icon: Smartphone },
        { label: 'SaaS Architecture', href: '/services/custom-software/saas-architecture', desc: 'Multi-tenant platforms', icon: Layers },
      ],
    },
    {
      heading: 'AI & Intelligence',
      items: [
        { label: 'AI & Machine Learning', href: '/ai-solutions', desc: 'Predictive analytics', icon: Cpu },
        { label: 'Predictive Analytics', href: '/services/ai-ml/predictive-analytics', desc: 'Forecast & BI', icon: Brain },
        { label: 'Generative AI & LLM', href: '/services/ai-ml/generative-ai', desc: 'Custom LLM pipelines', icon: Bot },
        { label: 'Computer Vision', href: '/services/ai-ml/computer-vision', desc: 'Object detection', icon: Eye },
      ],
    },
    {
      heading: 'Cloud & DevOps',
      items: [
        { label: 'Cloud Infrastructure', href: '/cloud', desc: 'AWS, Azure, GCP', icon: Cloud },
        { label: 'Kubernetes', href: '/services/cloud-devops/kubernetes', desc: 'Container orchestration', icon: Boxes },
        { label: 'Cloud Migration', href: '/services/cloud-devops/migration', desc: 'Legacy to cloud', icon: RefreshCw },
        { label: 'Pen Testing', href: '/services/cloud-devops/cybersecurity', desc: 'Security audits', icon: ShieldCheck },
      ],
    },
    {
      heading: 'Enterprise Systems',
      items: [
        { label: 'ERP & CRM', href: '/erp-crm', desc: 'Odoo, Salesforce', icon: Database },
        { label: 'SAP & Odoo', href: '/services/erp-crm/sap-integration', desc: 'ERP integration', icon: Database },
        { label: 'Salesforce', href: '/services/erp-crm/salesforce', desc: 'CRM customization', icon: Database },
        { label: 'Consulting', href: '/services/digital-transformation/consulting', desc: 'Tech advisory', icon: Briefcase },
        { label: 'Legacy Modernization', href: '/services/digital-transformation/legacy-modernization', desc: 'Monolith refactoring', icon: RefreshCw },
      ],
    },
  ],
  footerLink: { label: 'View All Enterprise Services', href: '/services' },
};

export const VAULTHOST_MENU: NavMenu = {
  columns: [
    {
      heading: 'Compute',
      items: [
        { label: 'Workers (Edge)', href: '/vaulthost/workers', desc: 'Run code at 300+ PoPs', icon: Zap },
        { label: 'Serverless', href: '/vaulthost/serverless', desc: 'Auto-scaling functions', icon: Cloud },
        { label: 'Containers (K8s)', href: '/vaulthost/containers', desc: 'Managed Kubernetes', icon: Boxes },
        { label: 'VPS Hosting', href: '/vaulthost/vps', desc: 'Virtual machines', icon: Cpu },
        { label: 'Pages (Jamstack)', href: '/vaulthost/pages', desc: 'Git-deploy in seconds', icon: Layout },
        { label: 'Cloud Hosting', href: '/vaulthost/cloud', desc: 'Auto-scaling', icon: Cloud },
        { label: 'Shared Hosting', href: '/vaulthost/shared', desc: 'From ₹99/mo', icon: Globe },
        { label: 'WordPress', href: '/vaulthost/wordpress', desc: 'Managed WP', icon: Database },
      ],
    },
    {
      heading: 'Storage & Data',
      items: [
        { label: 'VaultBase (Supabase)', href: '/vaulthost/managed-supabase', desc: 'Managed Postgres & Auth', icon: Database },
        { label: 'Object Storage (R2)', href: '/vaulthost/storage', desc: 'S3 compatible, 0 egress', icon: HardDrive },
        { label: 'KV Store', href: '/vaulthost/kv', desc: 'Global key-value', icon: Database },
        { label: 'Edge SQL (D1)', href: '/vaulthost/database', desc: 'SQLite at edge', icon: Database },
        { label: 'Vector DB', href: '/vaulthost/vectorize', desc: 'AI embeddings', icon: Brain },
        { label: 'Queues', href: '/vaulthost/queues', desc: 'Message queue', icon: Layers },
        { label: 'Managed DB', href: '/vaulthost/managed-databases', desc: 'Postgres, MySQL, Redis', icon: Database },
      ],
    },
    {
      heading: 'Network & Security',
      items: [
        { label: 'CDN (Edge)', href: '/vaulthost/edge', desc: '300+ PoPs', icon: Globe },
        { label: 'DNS', href: '/vaulthost/dns', desc: 'Fastest authoritative DNS', icon: Network },
        { label: 'DDoS Protection', href: '/vaulthost/ddos', desc: 'Free, unmetered', icon: ShieldCheck },
        { label: 'Load Balancer', href: '/vaulthost/load-balancer', desc: 'Global traffic routing', icon: Network },
        { label: 'Tunnel', href: '/vaulthost/tunnel', desc: 'Secure ingress, no ports', icon: Lock },
        { label: 'Bot Management', href: '/vaulthost/bot-management', desc: 'ML-powered detection', icon: Bot },
        { label: 'Zero Trust', href: '/vaulthost/zero-trust', desc: 'Replace your VPN', icon: ShieldCheck },
        { label: 'SSL Certificates', href: '/vaulthost/ssl', desc: 'From ₹99/mo', icon: KeyRound },
      ],
    },
    {
      heading: 'AI Platform',
      items: [
        { label: 'AI Gateway', href: '/vaulthost/ai-gateway', desc: 'One API, 15+ providers', icon: Brain },
        { label: 'AI Inference', href: '/vaulthost/inference', desc: '50+ models serverless', icon: Cpu },
        { label: 'AI Pipelines', href: '/vaulthost/ai-pipelines', desc: 'Visual workflow builder', icon: Bot },
        { label: 'AI Ops', href: '/vaulthost/ai-ops', desc: 'Auto-scaling infra', icon: Zap },
      ],
    },
    {
      heading: 'Developer & SaaS Tools',
      items: [
        { label: 'VaultGit (Gitea)', href: '/vaulthost/vaultgit', desc: 'Self-hosted Git & Actions', icon: GitBranch },
        { label: 'VaultAutomation (n8n)', href: '/vaulthost/vaultautomation', desc: 'Visual workflow canvas', icon: Zap },
        { label: 'VaultAnalytics', href: '/vaulthost/vaultanalytics', desc: 'Metabase + Plausible', icon: BarChart3 },
        { label: 'VaultChat (Mattermost)', href: '/vaulthost/vaultchat', desc: 'Enterprise team chat', icon: MessageSquare },
        { label: 'Stream (Video)', href: '/vaulthost/stream', desc: 'Upload, transcode, play', icon: Monitor },
        { label: 'Images', href: '/vaulthost/images', desc: 'WebP/AVIF optimization', icon: Eye },
        { label: 'Email Routing', href: '/vaulthost/email-routing', desc: '@yourdomain forwarding', icon: Mail },
        { label: 'Monitoring', href: '/vaulthost/monitoring', desc: 'Metrics, logs, traces', icon: Monitor },
        { label: 'CI/CD', href: '/vaulthost/ci-cd', desc: 'Build & deploy pipelines', icon: RefreshCw },
        { label: 'Domains', href: '/vaulthost/domains', desc: '15+ TLDs', icon: ShoppingCart },
      ],
    },
    {
      heading: 'Resources',
      items: [
        { label: 'Compare Plans', href: '/vaulthost/compare', desc: 'Side-by-side', icon: Server },
        { label: 'Pricing', href: '/vaulthost/pricing', desc: 'All plans', icon: Zap },
        { label: 'Knowledge Base', href: '/vaulthost/kb', desc: 'Guides', icon: BookOpen },
        { label: 'Data Centers', href: '/vaulthost/data-centers', desc: 'Global PoPs', icon: MapPin },
        { label: 'Status', href: '/vaulthost/status', desc: '99.99% uptime', icon: Zap },
        { label: 'Migration', href: '/vaulthost/migration', desc: 'Free transfers', icon: RefreshCw },
        { label: 'Security', href: '/vaulthost/security', desc: 'WAF & compliance', icon: ShieldCheck },
        { label: 'SLA', href: '/vaulthost/legal/sla', desc: 'Uptime guarantee', icon: Scale },
      ],
    },
  ],
  footerLink: { label: 'Explore All VaultHost Products', href: '/vaulthost' },
};


export const INDUSTRIES_MENU: NavMenu = {
  columns: [
    {
      heading: 'Verticals',
      items: [
        { label: 'Healthcare & Pharma', href: '/industries/healthcare-pharma', desc: 'HIPAA compliant', icon: ShieldCheck },
        { label: 'Fintech & Banking', href: '/industries/fintech-banking', desc: 'PCI-DSS', icon: Database },
        { label: 'E-commerce & Retail', href: '/industries/e-commerce-retail', desc: 'Headless commerce', icon: ShoppingCart },
        { label: 'Logistics & Supply Chain', href: '/industries/logistics-supply-chain', desc: 'Fleet & WMS', icon: Network },
        { label: 'Manufacturing & IoT', href: '/industries/manufacturing-iot', desc: 'Shop floor IoT', icon: Cpu },
      ],
    },
    {
      heading: 'More Industries',
      items: [
        { label: 'Manufacturing', href: '/industries/manufacturing', desc: 'Industry 4.0', icon: Building2 },
        { label: 'Healthcare', href: '/industries/healthcare', desc: 'EMR & telemedicine', icon: ShieldCheck },
        { label: 'Financial Services', href: '/industries/financial-services', desc: 'Fintech & banking', icon: Database },
        { label: 'Retail', href: '/industries/retail', desc: 'Omnichannel', icon: ShoppingCart },
        { label: 'Logistics', href: '/industries/logistics', desc: 'Fleet & warehouse', icon: Network },
        { label: 'Real Estate', href: '/industries/real-estate', desc: 'Property mgmt', icon: Building2 },
        { label: 'Education', href: '/industries/education', desc: 'EdTech & LMS', icon: BookOpen },
        { label: 'Startups', href: '/industries/startups', desc: 'MVP & scale', icon: Zap },
      ],
    },
    {
      heading: 'Locations',
      items: [
        { label: 'Mumbai', href: '/locations/mumbai', desc: 'Maharashtra', icon: MapPin },
        { label: 'Bangalore', href: '/locations/bangalore', desc: 'Karnataka', icon: MapPin },
        { label: 'Pune', href: '/locations/pune', desc: 'Hinjawadi', icon: MapPin },
        { label: 'Gurgaon', href: '/locations/gurgaon', desc: 'Cyber City', icon: MapPin },
        { label: 'Noida', href: '/locations/noida', desc: 'Sector 62', icon: MapPin },
        { label: 'Dubai', href: '/locations/dubai', desc: 'UAE', icon: MapPin },
        { label: 'Singapore', href: '/locations/singapore', desc: 'APAC hub', icon: MapPin },
        { label: 'All Locations', href: '/locations', desc: '15+ cities', icon: Globe },
      ],
    },
  ],
  footerLink: { label: 'View All Industries', href: '/industries' },
};

export const COMPANY_MENU: NavMenu = {
  columns: [
    {
      heading: 'Company',
      items: [
        { label: 'About Us', href: '/about', desc: 'Our story & mission', icon: Users },
        { label: 'Case Studies', href: '/case-studies', desc: 'Client success stories', icon: FileText },
        { label: 'Careers', href: '/careers', desc: 'Join our team', icon: Briefcase },
        { label: 'Contact', href: '/contact', desc: 'Get in touch', icon: Phone },
      ],
    },
    {
      heading: 'Resources',
      items: [
        { label: 'Blog', href: '/blog', desc: 'Insights & articles', icon: BookOpen },
        { label: 'Resources Hub', href: '/resources', desc: 'Guides & whitepapers', icon: FileText },
        { label: 'Compare Services', href: '/compare', desc: 'Find your fit', icon: Server },
      ],
    },
  ],
  footerLink: { label: 'About EvolucentSphere', href: '/about' },
};

export const NAV_PILLARS: { label: string; href: string; menu: NavMenu }[] = [
  { label: 'Enterprise Services', href: '/services', menu: ENTERPRISE_MENU },
  { label: 'VaultHost', href: '/vaulthost', menu: VAULTHOST_MENU },
  { label: 'Industries & Locations', href: '/industries', menu: INDUSTRIES_MENU },
  { label: 'Company & Resources', href: '/about', menu: COMPANY_MENU },
];

export const ALL_NAV_ITEMS = NAV_PILLARS.flatMap((p) =>
  p.menu.columns.flatMap((col) =>
    col.items.map((item) => ({
      ...item,
      category: `${p.label} / ${col.heading}`,
    }))
  )
);
