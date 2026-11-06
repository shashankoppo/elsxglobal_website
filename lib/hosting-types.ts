export type HostingTier = 'shared' | 'wordpress' | 'vps' | 'cloud' | 'dedicated' | 'email' | 'website-builder' | 'ssl';

export interface HostingPlan {
  id: string;
  slug: string;
  tier: HostingTier;
  name: string;
  short_description: string | null;
  long_description: string | null;
  price_monthly: number;
  price_annual: number;
  cpu: string | null;
  ram: string | null;
  storage: string | null;
  bandwidth: string | null;
  features: string[];
  specs: Record<string, number>;
  is_popular: boolean;
  is_active: boolean;
  sort_order: number;
}

export interface HostingOrder {
  id: string;
  user_id: string;
  plan_id: string | null;
  plan_name: string;
  plan_tier: string;
  billing_cycle: 'monthly' | 'annual';
  quantity: number;
  subtotal: number;
  tax_amount: number;
  discount_amount: number;
  total: number;
  currency: string;
  status: string;
  payment_method: string | null;
  payment_id: string | null;
  domain: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface SupportTicket {
  id: string;
  user_id: string;
  subject: string;
  description: string;
  priority: string;
  status: string;
  category: string | null;
  created_at: string;
  updated_at: string;
}

export interface TicketReply {
  id: string;
  ticket_id: string;
  user_id: string;
  sender_type: string;
  message: string;
  created_at: string;
}

export interface HostingService {
  id: string;
  user_id: string;
  order_id: string | null;
  plan_id: string | null;
  plan_name: string;
  domain: string | null;
  status: string;
  control_panel_url: string | null;
  ip_address: string | null;
  renewal_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface HostingInvoice {
  id: string;
  user_id: string;
  order_id: string | null;
  subscription_id: string | null;
  invoice_number: string;
  amount: number;
  tax_amount: number;
  total: number;
  currency: string;
  status: string;
  due_date: string | null;
  paid_at: string | null;
  pdf_url: string | null;
  created_at: string;
}

export interface HostingAddon {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  category: string;
  price_monthly: number;
  price_annual: number;
  icon: string | null;
  is_active: boolean;
  sort_order: number;
}

export interface DomainRegistration {
  id: string;
  user_id: string;
  domain: string;
  tld: string;
  registration_period: number;
  registered_at: string;
  expires_at: string | null;
  auto_renew: boolean;
  status: string;
  nameservers: string[];
  privacy_protected: boolean;
  order_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface DnsZone {
  id: string;
  user_id: string;
  domain_id: string | null;
  domain: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface DnsRecord {
  id: string;
  zone_id: string;
  user_id: string;
  type: string;
  name: string;
  value: string;
  ttl: number;
  priority: number | null;
  created_at: string;
  updated_at: string;
}

export interface EmailAccount {
  id: string;
  user_id: string;
  domain_id: string | null;
  domain: string;
  local_part: string;
  storage_quota_mb: number;
  storage_used_mb: number;
  status: string;
  forward_to: string | null;
  is_catch_all: boolean;
  created_at: string;
  updated_at: string;
}

export interface HostingDatabase {
  id: string;
  user_id: string;
  service_id: string | null;
  db_name: string;
  db_type: string;
  db_user: string;
  db_host: string | null;
  db_port: number;
  size_mb: number;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface SslCertificate {
  id: string;
  user_id: string;
  domain: string;
  cert_type: string;
  issuer: string | null;
  valid_from: string | null;
  valid_until: string | null;
  status: string;
  auto_renew: boolean;
  order_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface BackupSnapshot {
  id: string;
  user_id: string;
  service_id: string | null;
  backup_type: string;
  size_mb: number;
  status: string;
  storage_url: string | null;
  created_at: string;
  expires_at: string | null;
}

export const TIER_LABELS: Record<HostingTier, string> = {
  shared: 'Shared Hosting',
  wordpress: 'WordPress Hosting',
  vps: 'VPS Hosting',
  cloud: 'Cloud Hosting',
  dedicated: 'Dedicated Servers',
  email: 'Email Hosting',
  'website-builder': 'Website Builder',
  ssl: 'SSL Certificates',
};

export const TIER_DESCRIPTIONS: Record<HostingTier, string> = {
  shared: 'Affordable, reliable hosting for websites of all sizes. Perfect for getting started.',
  wordpress: 'Managed WordPress with automatic updates, caching, and one-click staging.',
  vps: 'Dedicated resources with full root control. Scale as you grow.',
  cloud: 'Auto-scaling cloud infrastructure with multi-region deployment.',
  dedicated: 'Maximum performance with dedicated enterprise-grade hardware.',
  email: 'Professional email on your custom domain with webmail, IMAP, and ActiveSync.',
  'website-builder': 'AI-powered drag-and-drop builder with 100+ templates and ecommerce.',
  ssl: 'SSL certificates with domain, wildcard, and extended validation options.',
};

export const TIER_PATHS: Record<HostingTier, string> = {
  shared: '/vaulthost/shared',
  wordpress: '/vaulthost/wordpress',
  vps: '/vaulthost/vps',
  cloud: '/vaulthost/cloud',
  dedicated: '/vaulthost/dedicated',
  email: '/vaulthost/email',
  'website-builder': '/vaulthost/website-builder',
  ssl: '/vaulthost/ssl',
};

export const GST_RATE = 0.18;
