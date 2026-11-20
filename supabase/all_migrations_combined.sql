-- FILE: 20260624074650_create_leads_table.sql
CREATE TABLE IF NOT EXISTS public.leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  full_name TEXT NOT NULL,
  work_email TEXT NOT NULL,
  company TEXT,
  phone TEXT,
  intent TEXT NOT NULL DEFAULT 'consultation',
  message TEXT,
  status TEXT NOT NULL DEFAULT 'new',
  source TEXT,
  metadata JSONB
);

ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "insert_leads_public" ON public.leads FOR INSERT
  TO anon, authenticated WITH CHECK (true);

CREATE INDEX leads_created_at_idx ON public.leads (created_at DESC);
CREATE INDEX leads_status_idx ON public.leads (status);
CREATE INDEX leads_intent_idx ON public.leads (intent);


-- FILE: 20260625063716_create_integrations_table.sql
CREATE TABLE IF NOT EXISTS public.integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL UNIQUE,
  value TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.integrations ENABLE ROW LEVEL SECURITY;

-- No public access — only the service role (used by edge functions) can read
CREATE POLICY "select_integrations_service_only" ON public.integrations FOR SELECT
  TO authenticated USING (false);

INSERT INTO public.integrations (key, value) VALUES
  ('odoo_api_key', '86c3fd4322589a1bdbd605869e4222dfbcd89568'),
  ('odoo_url', 'https://elsxglobal.com'),
  ('odoo_db', 'elsxglobal')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = now();


-- FILE: 20260627074515_create_locations_and_services_tables.sql
-- Locations table for global city targeting
CREATE TABLE locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  city TEXT NOT NULL,
  state TEXT,
  country TEXT NOT NULL,
  country_code TEXT NOT NULL DEFAULT 'IN',
  region TEXT,
  slug TEXT UNIQUE NOT NULL,
  meta_title TEXT,
  meta_description TEXT,
  h1_title TEXT,
  population_tier TEXT DEFAULT 'tier-1',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Services table for deep-specific pages
CREATE TABLE services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  category TEXT NOT NULL,
  short_description TEXT,
  long_description TEXT,
  features JSONB DEFAULT '[]',
  benefits JSONB DEFAULT '[]',
  technologies JSONB DEFAULT '[]',
  industries JSONB DEFAULT '[]',
  meta_title TEXT,
  meta_description TEXT,
  h1_title TEXT,
  cta_text TEXT DEFAULT 'Get Started',
  is_featured BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Service-Location junction for localized content
CREATE TABLE service_locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id UUID REFERENCES services(id) ON DELETE CASCADE,
  location_id UUID REFERENCES locations(id) ON DELETE CASCADE,
  custom_title TEXT,
  custom_description TEXT,
  local_phone TEXT,
  local_address TEXT,
  meta_title TEXT,
  meta_description TEXT,
  UNIQUE(service_id, location_id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_locations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for public read
CREATE POLICY "locations_public_read" ON locations FOR SELECT TO anon, authenticated USING (is_active = true);
CREATE POLICY "services_public_read" ON services FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "service_locations_public_read" ON service_locations FOR SELECT TO anon, authenticated USING (true);

-- Create indexes for performance
CREATE INDEX idx_locations_slug ON locations(slug);
CREATE INDEX idx_locations_country ON locations(country);
CREATE INDEX idx_services_slug ON services(slug);
CREATE INDEX idx_services_category ON services(category);
CREATE INDEX idx_service_locations_service ON service_locations(service_id);
CREATE INDEX idx_service_locations_location ON service_locations(location_id);

-- Insert major Indian cities
INSERT INTO locations (city, state, country, country_code, region, slug, population_tier) VALUES
('Mumbai', 'Maharashtra', 'India', 'IN', 'West', 'mumbai', 'tier-1'),
('Delhi', 'Delhi', 'India', 'IN', 'North', 'delhi', 'tier-1'),
('Bangalore', 'Karnataka', 'India', 'IN', 'South', 'bangalore', 'tier-1'),
('Chennai', 'Tamil Nadu', 'India', 'IN', 'South', 'chennai', 'tier-1'),
('Hyderabad', 'Telangana', 'India', 'IN', 'South', 'hyderabad', 'tier-1'),
('Kolkata', 'West Bengal', 'India', 'IN', 'East', 'kolkata', 'tier-1'),
('Pune', 'Maharashtra', 'India', 'IN', 'West', 'pune', 'tier-1'),
('Ahmedabad', 'Gujarat', 'India', 'IN', 'West', 'ahmedabad', 'tier-1'),
('Jaipur', 'Rajasthan', 'India', 'IN', 'North', 'jaipur', 'tier-1'),
('Lucknow', 'Uttar Pradesh', 'India', 'IN', 'North', 'lucknow', 'tier-2'),
('Chandigarh', 'Chandigarh', 'India', 'IN', 'North', 'chandigarh', 'tier-2'),
('Indore', 'Madhya Pradesh', 'India', 'IN', 'Central', 'indore', 'tier-2'),
('Coimbatore', 'Tamil Nadu', 'India', 'IN', 'South', 'coimbatore', 'tier-2'),
('Nagpur', 'Maharashtra', 'India', 'IN', 'West', 'nagpur', 'tier-2'),
('Surat', 'Gujarat', 'India', 'IN', 'West', 'surat', 'tier-1'),
('Bhopal', 'Madhya Pradesh', 'India', 'IN', 'Central', 'bhopal', 'tier-2'),
('Visakhapatnam', 'Andhra Pradesh', 'India', 'IN', 'South', 'visakhapatnam', 'tier-2'),
('Mysore', 'Karnataka', 'India', 'IN', 'South', 'mysore', 'tier-2'),
('Kochi', 'Kerala', 'India', 'IN', 'South', 'kochi', 'tier-2'),
('Trivandrum', 'Kerala', 'India', 'IN', 'South', 'trivandrum', 'tier-2');

-- Insert major global cities
INSERT INTO locations (city, state, country, country_code, region, slug, population_tier) VALUES
('New York', 'NY', 'United States', 'US', 'North America', 'new-york', 'tier-1'),
('San Francisco', 'CA', 'United States', 'US', 'North America', 'san-francisco', 'tier-1'),
('London', 'England', 'United Kingdom', 'GB', 'Europe', 'london', 'tier-1'),
('Dubai', 'Dubai', 'United Arab Emirates', 'AE', 'Middle East', 'dubai', 'tier-1'),
('Singapore', 'Singapore', 'Singapore', 'SG', 'Asia Pacific', 'singapore', 'tier-1'),
('Sydney', 'NSW', 'Australia', 'AU', 'Oceania', 'sydney', 'tier-1'),
('Toronto', 'ON', 'Canada', 'CA', 'North America', 'toronto', 'tier-1'),
('Berlin', 'Berlin', 'Germany', 'DE', 'Europe', 'berlin', 'tier-1'),
('Tokyo', 'Tokyo', 'Japan', 'JP', 'Asia Pacific', 'tokyo', 'tier-1');

-- Insert core services
INSERT INTO services (name, slug, category, short_description, long_description, meta_title, meta_description, h1_title, features, benefits, is_featured, sort_order) VALUES
('Custom Software Development', 'custom-software-development', 'Development', 
'Enterprise-grade custom software solutions built for scale, security, and performance.',
'ELSxGlobal delivers bespoke software solutions engineered for enterprise excellence. From complex enterprise applications to scalable microservices architectures, we build software that transforms business operations and drives measurable growth. Our development methodology combines deep technical expertise with business acumen, ensuring every line of code serves strategic objectives.',
'Custom Software Development Company India | Enterprise Solutions',
'India''s leading custom software development company. Enterprise-grade solutions built for scale. 200+ successful projects. Get your free consultation today.',
'Custom Software Development Company in India',
'["Full-cycle development", "Enterprise architecture", "API-first design", "Cloud-native", "Microservices", "DevOps integration"]'::jsonb,
'["Reduce operational costs by 40%", "Accelerate time-to-market", "Enable business scalability", "Enhance data security"]'::jsonb,
true, 1),

('Website Development', 'website-development', 'Development',
'High-performance websites engineered for conversions, SEO, and user experience.',
'From enterprise websites to complex web applications, ELSxGlobal builds digital experiences that perform. Our websites combine cutting-edge technology with conversion-focused design, delivering measurable business results through superior UX, technical SEO optimization, and blazing-fast performance.',
'Website Development Company India | Custom Web Solutions',
'Top website development company in India. Custom websites, e-commerce platforms, and web applications. SEO-optimized, conversion-focused. Free consultation.',
'Professional Website Development Services',
'["Custom design", "Headless CMS", "E-commerce platforms", "Progressive web apps", "Performance optimization", "SEO-first approach"]'::jsonb,
'["Increase lead generation 3x", "Improve search rankings", "Reduce bounce rates", "Drive conversions"]'::jsonb,
true, 2),

('AI & Machine Learning Solutions', 'ai-solutions', 'AI & Data',
'AI solutions that automate decisions, predict outcomes, and unlock business value from data.',
'ELSxGlobal transforms enterprises with intelligent automation and predictive analytics. Our AI solutions go beyond hype—we implement machine learning systems that deliver quantifiable business outcomes, from customer churn prediction to supply chain optimization.',
'AI Solutions & Machine Learning Company India | Enterprise AI',
'Enterprise AI solutions and machine learning services. Predictive analytics, NLP, computer vision. Proven ROI across 50+ implementations. Consult now.',
'Enterprise AI Solutions & Machine Learning',
'["Machine Learning", "Natural Language Processing", "Computer Vision", "Predictive Analytics", "Process Automation", "AI Consulting"]'::jsonb,
'["Automate 60% of decisions", "Predict customer behavior", "Reduce operational costs", "Enable data-driven strategy"]'::jsonb,
true, 3),

('ERP & CRM Implementation', 'erp-crm', 'Enterprise Systems',
'Unified enterprise systems that connect every function and drive operational excellence.',
'ELSxGlobal implements and customizes ERP and CRM systems that transform fragmented operations into unified, intelligent enterprises. We specialize in Odoo, SAP, Salesforce, and Microsoft Dynamics, delivering solutions that scale with your business.',
'ERP & CRM Implementation Services India | Enterprise Systems',
'Enterprise ERP and CRM implementation services. Odoo, SAP, Salesforce specialists. 99% project success rate. Transform your operations today.',
'Enterprise ERP & CRM Solutions',
'["Odoo Implementation", "SAP Integration", "Salesforce Customization", "Microsoft Dynamics", "Custom Modules", "Data Migration"]'::jsonb,
'["Unify business operations", "Enable real-time visibility", "Automate workflows", "Improve decision making"]'::jsonb,
true, 4),

('Cloud Infrastructure', 'cloud-infrastructure', 'Infrastructure',
'Scalable cloud infrastructure designed for performance, security, and cost optimization.',
'ELSxGlobal architects cloud environments that scale without limits. From AWS and Azure to GCP and hybrid architectures, we design, migrate, and manage cloud infrastructure that powers enterprise growth while optimizing costs.',
'Cloud Infrastructure Services India | AWS Azure GCP',
'Enterprise cloud infrastructure services. AWS, Azure, GCP architects. Cloud migration, optimization, 24/7 management. Reduce costs 30%. Free assessment.',
'Cloud Infrastructure & Architecture Services',
'["AWS Architecture", "Azure Solutions", "GCP Services", "Cloud Migration", "Cost Optimization", "DevOps"]'::jsonb,
'["Reduce infrastructure costs", "Scale without limits", "Ensure high availability", "Accelerate deployment"]'::jsonb,
false, 5),

('Cybersecurity', 'cybersecurity', 'Security',
'Zero-trust security architecture that protects enterprise assets and ensures compliance.',
'ELSxGlobal delivers comprehensive cybersecurity solutions that protect enterprise assets from evolving threats. Our zero-trust architecture approach ensures compliance, resilience, and stakeholder confidence.',
'Cybersecurity Services India | Enterprise Security Solutions',
'Enterprise cybersecurity services. Zero-trust architecture, compliance, threat detection. ISO 27001 certified. Protect your business. Free assessment.',
'Enterprise Cybersecurity Solutions',
'["Zero-Trust Architecture", "Threat Detection", "Compliance Services", "Penetration Testing", "Security Audits", "Incident Response"]'::jsonb,
'["Prevent security breaches", "Ensure regulatory compliance", "Protect customer data", "Maintain business continuity"]'::jsonb,
false, 6),

('Digital Marketing', 'digital-marketing', 'Marketing',
'Data-driven digital marketing that generates qualified leads and accelerates growth.',
'ELSxGlobal combines strategic marketing expertise with technical capability to deliver digital marketing programs that generate measurable ROI. From SEO and content to paid acquisition and conversion optimization, we build marketing engines that scale.',
'Digital Marketing Agency India | SEO & Performance Marketing',
'Results-driven digital marketing agency in India. SEO, PPC, content marketing, conversion optimization. 300% average ROI. Free strategy session.',
'Digital Marketing & Growth Services',
'["SEO Services", "Paid Advertising", "Content Marketing", "Conversion Optimization", "Analytics", "Marketing Automation"]'::jsonb,
'["Increase organic traffic", "Generate qualified leads", "Improve conversion rates", "Maximize marketing ROI"]'::jsonb,
false, 7),

('BPO & KPO Services', 'bpo-kpo', 'Operations',
'Outsourced business operations that reduce costs while maintaining quality and compliance.',
'ELSxGlobal provides business and knowledge process outsourcing services that enable organizations to focus on core strategic activities. From customer support to specialized research, we deliver operational excellence at scale.',
'BPO & KPO Services India | Outsourcing Solutions',
'Enterprise BPO and KPO services. Customer support, finance, research, analytics. 60% cost reduction. ISO certified. Scale your operations today.',
'Business Process Outsourcing Services',
'["Customer Support", "Finance & Accounting", "Data Entry", "Research Services", "Analytics", "Back Office"]'::jsonb,
'["Reduce operational costs", "Access specialized expertise", "Scale operations flexibly", "Focus on core business"]'::jsonb,
false, 8);


-- FILE: 20260627075329_create_content_and_global_tables.sql
-- Blog articles table
CREATE TABLE articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  excerpt TEXT,
  content TEXT,
  category TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  author_name TEXT DEFAULT 'ELSxGlobal Team',
  author_title TEXT,
  read_time INTEGER DEFAULT 5,
  featured_image TEXT,
  is_published BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  published_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  meta_title TEXT,
  meta_description TEXT,
  lead_magnet_url TEXT,
  lead_magnet_title TEXT
);

-- Case studies table
CREATE TABLE case_studies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  client_name TEXT,
  client_industry TEXT,
  challenge TEXT,
  solution TEXT,
  results JSONB DEFAULT '{}',
  technologies TEXT[] DEFAULT '{}',
  testimonial TEXT,
  testimonial_author TEXT,
  testimonial_title TEXT,
  featured_image TEXT,
  is_published BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  published_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  meta_title TEXT,
  meta_description TEXT
);

-- Lead magnets table
CREATE TABLE lead_magnets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  file_url TEXT,
  file_type TEXT,
  category TEXT,
  tags TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Countries table for global expansion
CREATE TABLE countries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL,
  region TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Expand locations with more cities
ALTER TABLE locations ADD COLUMN IF NOT EXISTS is_hub BOOLEAN DEFAULT false;
ALTER TABLE locations ADD COLUMN IF NOT EXISTS h1_custom TEXT;
ALTER TABLE locations ADD COLUMN IF NOT EXISTS meta_title_custom TEXT;
ALTER TABLE locations ADD COLUMN IF NOT EXISTS meta_description_custom TEXT;

-- Enable RLS
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE case_studies ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_magnets ENABLE ROW LEVEL SECURITY;
ALTER TABLE countries ENABLE ROW LEVEL SECURITY;

-- Public read policies
CREATE POLICY "articles_public_read" ON articles FOR SELECT TO anon, authenticated USING (is_published = true);
CREATE POLICY "case_studies_public_read" ON case_studies FOR SELECT TO anon, authenticated USING (is_published = true);
CREATE POLICY "lead_magnets_public_read" ON lead_magnets FOR SELECT TO anon, authenticated USING (is_active = true);
CREATE POLICY "countries_public_read" ON countries FOR SELECT TO anon, authenticated USING (is_active = true);

-- Indexes
CREATE INDEX idx_articles_slug ON articles(slug);
CREATE INDEX idx_articles_category ON articles(category);
CREATE INDEX idx_articles_published ON articles(published_at DESC);
CREATE INDEX idx_case_studies_slug ON case_studies(slug);
CREATE INDEX idx_case_studies_industry ON case_studies(client_industry);
CREATE INDEX idx_lead_magnets_slug ON lead_magnets(slug);

-- Insert sample articles
INSERT INTO articles (title, slug, excerpt, category, tags, read_time, is_featured, meta_title, meta_description) VALUES
('Why Most AI Initiatives Fail — And How to Make Yours Succeed', 'ai-initiatives-fail-success', 'The gap between AI ambition and outcomes is almost always an execution problem. Here''s the framework that closes it.', 'AI & Automation', ARRAY['AI', 'Machine Learning', 'Enterprise AI'], 8, true, 'Why AI Projects Fail | ELSxGlobal', 'Discover why 80% of AI projects fail and learn the framework for success.'),
('The Complete Guide to ERP Implementation in 2026', 'erp-implementation-guide-2026', 'Everything you need to know about implementing ERP systems — from vendor selection to go-live.', 'ERP & CRM', ARRAY['ERP', 'Odoo', 'SAP', 'Enterprise Systems'], 15, true, 'ERP Implementation Guide 2026 | ELSxGlobal', 'Complete guide to ERP implementation success.'),
('Custom Software vs Off-the-Shelf: The Definitive Comparison', 'custom-software-vs-off-the-shelf', 'When to build custom software and when to buy existing solutions — a decision framework for business leaders.', 'Software Development', ARRAY['Custom Software', 'Enterprise Applications'], 10, true, 'Custom Software vs Off-the-Shelf | ELSxGlobal', 'Compare custom software vs off-the-shelf solutions.'),
('Cloud Migration Checklist: 50 Things You Need to Know', 'cloud-migration-checklist', 'A comprehensive checklist for successful cloud migration — covering security, costs, and technical considerations.', 'Cloud Infrastructure', ARRAY['Cloud', 'AWS', 'Azure', 'Migration'], 12, false, 'Cloud Migration Checklist | ELSxGlobal', '50-point cloud migration checklist.'),
('How to Choose the Right Technology Partner in India', 'choose-technology-partner-india', 'A comprehensive guide to selecting the right software development partner in India — what to ask, what to avoid.', 'Business', ARRAY['Outsourcing', 'India', 'Partnership'], 8, false, 'Choose Technology Partner India | ELSxGlobal', 'Guide to selecting software partners.'),
('Website Development Cost in India: 2026 Breakdown', 'website-development-cost-india-2026', 'Detailed breakdown of website development costs in India — from simple sites to enterprise platforms.', 'Website Development', ARRAY['Website', 'Cost', 'India'], 6, true, 'Website Development Cost India | ELSxGlobal', 'Complete cost breakdown for web development.'),
('Cybersecurity for SMEs: A Practical Guide', 'cybersecurity-sme-guide', 'Essential cybersecurity practices for small and medium enterprises — practical steps you can implement today.', 'Cybersecurity', ARRAY['Security', 'SME', 'Zero-Trust'], 7, false, 'SME Cybersecurity Guide | ELSxGlobal', 'Practical cybersecurity for growing businesses.');

-- Insert sample case studies
INSERT INTO case_studies (title, slug, client_name, client_industry, challenge, solution, results, technologies, testimonial, testimonial_author, testimonial_title, is_featured, meta_title, meta_description) VALUES
('Manufacturing ERP Transformation Saves ₹2.1 Cr', 'manufacturing-erp-transformation', 'Leading Auto Parts Manufacturer', 'Manufacturing', 'Manual production tracking, zero predictive capability, disconnected systems across 4 plants.', 'Implemented Odoo ERP with custom modules for production tracking, predictive maintenance AI, and real-time dashboards.', '{"downtime_reduction": "43%", "cost_savings": "₹2.1 Cr", "efficiency_gain": "2.4x", "roi_timeline": "8 months"}', ARRAY['Odoo', 'Python', 'TensorFlow', 'PostgreSQL'], 'ELSxGlobal didn''t just implement software — they rethought how our entire operation runs.', 'Rajesh Kumar', 'COO', true, 'Manufacturing ERP Case Study | ELSxGlobal', 'See how we saved ₹2.1 Cr through ERP transformation.'),
('E-commerce Platform Scales 10x Traffic', 'ecommerce-scales-10x-traffic', 'Fashion Retail Brand', 'E-commerce', 'Platform couldn''t handle traffic spikes, 15% cart abandonment, slow mobile experience.', 'Built headless commerce platform with CDN, optimized checkout, progressive web app.', '{"traffic_capacity": "10x", "cart_abandonment": "8%", "mobile_speed": "1.2s", "conversion_lift": "34%"}', ARRAY['Next.js', 'BigCommerce', 'Algolia', 'Cloudflare'], 'The difference is night and day. We went from struggling to scaling.', 'Priya Mehta', 'Head of Digital', true, 'E-commerce Case Study | ELSxGlobal', 'How we scaled e-commerce 10x.'),
('AI Fraud Detection Prevents ₹12M Loss', 'ai-fraud-detection-financial', 'Regional Bank', 'Financial Services', 'Manual fraud detection, high false positives, increasing fraud incidents.', 'Deployed ML fraud detection with real-time scoring, behavioral analysis, and automated alerts.', '{"fraud_prevented": "₹12M", "false_positives": "62% reduction", "detection_speed": "Real-time", "accuracy": "94%"}', ARRAY['Python', 'TensorFlow', 'AWS', 'Kafka'], 'Their AI solution pays for itself every month.', 'Vikram Singh', 'VP Risk', true, 'AI Fraud Detection Case Study | ELSxGlobal', 'Preventing ₹12M in fraud.'),
('Healthcare Records Platform Serves 50K Patients', 'healthcare-records-50k-patients', 'Multi-specialty Hospital Network', 'Healthcare', 'Fragmented patient records, slow diagnostics, compliance risks.', 'Built unified EMR platform with HL7 integration, patient portal, and predictive diagnostics.', '{"diagnostics_speed": "2.1x", "patient_satisfaction": "34% increase", "records_unified": "50K+", "compliance": "HIPAA"}', ARRAY['React', 'Node.js', 'PostgreSQL', 'HL7'], 'Patient care improved dramatically.', 'Dr. Anand Kumar', 'Medical Director', false, 'Healthcare EMR Case Study | ELSxGlobal', 'Unified healthcare records platform.');

-- Insert countries
INSERT INTO countries (name, code, region) VALUES
('India', 'IN', 'Asia'),
('United States', 'US', 'North America'),
('United Kingdom', 'GB', 'Europe'),
('United Arab Emirates', 'AE', 'Middle East'),
('Singapore', 'SG', 'Asia Pacific'),
('Australia', 'AU', 'Oceania'),
('Canada', 'CA', 'North America'),
('Germany', 'DE', 'Europe'),
('Japan', 'JP', 'Asia Pacific'),
('Netherlands', 'NL', 'Europe'),
('Switzerland', 'CH', 'Europe'),
('France', 'FR', 'Europe'),
('Saudi Arabia', 'SA', 'Middle East'),
('South Africa', 'ZA', 'Africa'),
('Malaysia', 'MY', 'Asia Pacific'),
('Indonesia', 'ID', 'Asia Pacific'),
('Philippines', 'PH', 'Asia Pacific'),
('Brazil', 'BR', 'South America'),
('Mexico', 'MX', 'North America'),
('New Zealand', 'NZ', 'Oceania');

-- Insert lead magnets
INSERT INTO lead_magnets (title, slug, description, category, tags) VALUES
('Enterprise AI Readiness Checklist', 'ai-readiness-checklist', '50-point checklist to assess your organization''s AI readiness.', 'AI & Automation', ARRAY['AI', 'Checklist']),
('ERP Vendor Comparison Template', 'erp-vendor-comparison', 'Excel template for comparing ERP vendors across key criteria.', 'ERP & CRM', ARRAY['ERP', 'Template']),
('Cloud Migration Planning Workbook', 'cloud-migration-workbook', 'Complete workbook for planning your cloud migration project.', 'Cloud', ARRAY['Cloud', 'Migration']),
('Website Redesign Project Brief', 'website-redesign-brief', 'Template for defining your website redesign requirements.', 'Website', ARRAY['Website', 'Template']),
('Digital Marketing ROI Calculator', 'marketing-roi-calculator', 'Spreadsheet calculator for digital marketing ROI projections.', 'Marketing', ARRAY['Marketing', 'ROI']);


-- FILE: 20260709084619_create_vaulthost_tables.sql
/*
# VaultHost Hosting Platform — Database Schema

## Overview
Creates the complete database schema for the VaultHost hosting marketplace, commerce engine, and client portal.

## New Tables

1. **hosting_plans** — Catalog of all hosting plans (shared, VPS, cloud, dedicated, etc.)
   - Public read (catalog is visible to all visitors)
   - Admin-only writes

2. **hosting_orders** — Orders placed by users for hosting plans
   - Owner-scoped (users see only their own orders)
   - Status tracking: pending → paid → provisioning → active

3. **hosting_subscriptions** — Active subscriptions tied to orders
   - Owner-scoped, tracks billing cycle and renewal dates

4. **hosting_invoices** — Invoices generated from orders/subscriptions
   - Owner-scoped, downloadable PDF references

5. **support_tickets** — Client portal support tickets
   - Owner-scoped, with status and priority tracking

6. **ticket_replies** — Threaded replies on support tickets
   - Owner-scoped via parent ticket ownership check

7. **hosting_services** — Provisioned hosting instances tied to orders
   - Owner-scoped, tracks provisioning status and renewal

## Security
- `hosting_plans`: public read (anon + authenticated), admin-only writes
- All user data tables: owner-scoped via `auth.uid() = user_id`
- RLS enabled on every table
- Owner columns default to `auth.uid()` so inserts work without explicit user_id
*/

-- ============================================================
-- HOSTING PLANS (public catalog)
-- ============================================================
CREATE TABLE IF NOT EXISTS hosting_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  tier text NOT NULL DEFAULT 'shared',
  name text NOT NULL,
  short_description text,
  long_description text,
  price_monthly numeric(10,2) NOT NULL DEFAULT 0,
  price_annual numeric(10,2) NOT NULL DEFAULT 0,
  cpu text,
  ram text,
  storage text,
  bandwidth text,
  features jsonb NOT NULL DEFAULT '[]'::jsonb,
  specs jsonb NOT NULL DEFAULT '{}'::jsonb,
  is_popular boolean NOT NULL DEFAULT false,
  is_active boolean NOT NULL DEFAULT true,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE hosting_plans ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_hosting_plans" ON hosting_plans;
CREATE POLICY "public_read_hosting_plans" ON hosting_plans FOR SELECT
  TO anon, authenticated USING (true);

-- ============================================================
-- HOSTING ORDERS
-- ============================================================
CREATE TABLE IF NOT EXISTS hosting_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id uuid REFERENCES hosting_plans(id) ON DELETE SET NULL,
  plan_name text NOT NULL,
  plan_tier text NOT NULL,
  billing_cycle text NOT NULL DEFAULT 'monthly',
  quantity int NOT NULL DEFAULT 1,
  subtotal numeric(10,2) NOT NULL DEFAULT 0,
  tax_amount numeric(10,2) NOT NULL DEFAULT 0,
  discount_amount numeric(10,2) NOT NULL DEFAULT 0,
  total numeric(10,2) NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'INR',
  status text NOT NULL DEFAULT 'pending',
  payment_method text,
  payment_id text,
  domain text,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE hosting_orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_hosting_orders" ON hosting_orders;
CREATE POLICY "select_own_hosting_orders" ON hosting_orders FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_hosting_orders" ON hosting_orders;
CREATE POLICY "insert_own_hosting_orders" ON hosting_orders FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_hosting_orders" ON hosting_orders;
CREATE POLICY "update_own_hosting_orders" ON hosting_orders FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- HOSTING SUBSCRIPTIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS hosting_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  order_id uuid REFERENCES hosting_orders(id) ON DELETE SET NULL,
  plan_id uuid REFERENCES hosting_plans(id) ON DELETE SET NULL,
  plan_name text NOT NULL,
  billing_cycle text NOT NULL DEFAULT 'monthly',
  status text NOT NULL DEFAULT 'active',
  current_period_end timestamptz,
  amount numeric(10,2) NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'INR',
  auto_renew boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE hosting_subscriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_hosting_subscriptions" ON hosting_subscriptions;
CREATE POLICY "select_own_hosting_subscriptions" ON hosting_subscriptions FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_hosting_subscriptions" ON hosting_subscriptions;
CREATE POLICY "insert_own_hosting_subscriptions" ON hosting_subscriptions FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_hosting_subscriptions" ON hosting_subscriptions;
CREATE POLICY "update_own_hosting_subscriptions" ON hosting_subscriptions FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- HOSTING INVOICES
-- ============================================================
CREATE TABLE IF NOT EXISTS hosting_invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  order_id uuid REFERENCES hosting_orders(id) ON DELETE SET NULL,
  subscription_id uuid REFERENCES hosting_subscriptions(id) ON DELETE SET NULL,
  invoice_number text UNIQUE NOT NULL,
  amount numeric(10,2) NOT NULL DEFAULT 0,
  tax_amount numeric(10,2) NOT NULL DEFAULT 0,
  total numeric(10,2) NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'INR',
  status text NOT NULL DEFAULT 'draft',
  due_date timestamptz,
  paid_at timestamptz,
  pdf_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE hosting_invoices ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_hosting_invoices" ON hosting_invoices;
CREATE POLICY "select_own_hosting_invoices" ON hosting_invoices FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_hosting_invoices" ON hosting_invoices;
CREATE POLICY "insert_own_hosting_invoices" ON hosting_invoices FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_hosting_invoices" ON hosting_invoices;
CREATE POLICY "update_own_hosting_invoices" ON hosting_invoices FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- SUPPORT TICKETS
-- ============================================================
CREATE TABLE IF NOT EXISTS support_tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  subject text NOT NULL,
  description text NOT NULL,
  priority text NOT NULL DEFAULT 'normal',
  status text NOT NULL DEFAULT 'open',
  category text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_support_tickets" ON support_tickets;
CREATE POLICY "select_own_support_tickets" ON support_tickets FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_support_tickets" ON support_tickets;
CREATE POLICY "insert_own_support_tickets" ON support_tickets FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_support_tickets" ON support_tickets;
CREATE POLICY "update_own_support_tickets" ON support_tickets FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- TICKET REPLIES
-- ============================================================
CREATE TABLE IF NOT EXISTS ticket_replies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id uuid NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  sender_type text NOT NULL DEFAULT 'user',
  message text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE ticket_replies ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_ticket_replies" ON ticket_replies;
CREATE POLICY "select_own_ticket_replies" ON ticket_replies FOR SELECT
  TO authenticated USING (
    EXISTS (
      SELECT 1 FROM support_tickets
      WHERE support_tickets.id = ticket_replies.ticket_id
      AND support_tickets.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "insert_own_ticket_replies" ON ticket_replies;
CREATE POLICY "insert_own_ticket_replies" ON ticket_replies FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (
      SELECT 1 FROM support_tickets
      WHERE support_tickets.id = ticket_replies.ticket_id
      AND support_tickets.user_id = auth.uid()
    )
  );

-- ============================================================
-- HOSTING SERVICES (provisioned instances)
-- ============================================================
CREATE TABLE IF NOT EXISTS hosting_services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  order_id uuid REFERENCES hosting_orders(id) ON DELETE SET NULL,
  plan_id uuid REFERENCES hosting_plans(id) ON DELETE SET NULL,
  plan_name text NOT NULL,
  domain text,
  status text NOT NULL DEFAULT 'provisioning',
  control_panel_url text,
  ip_address text,
  renewal_date timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE hosting_services ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_hosting_services" ON hosting_services;
CREATE POLICY "select_own_hosting_services" ON hosting_services FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_hosting_services" ON hosting_services;
CREATE POLICY "insert_own_hosting_services" ON hosting_services FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_hosting_services" ON hosting_services;
CREATE POLICY "update_own_hosting_services" ON hosting_services FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_hosting_plans_tier ON hosting_plans(tier);
CREATE INDEX IF NOT EXISTS idx_hosting_plans_active ON hosting_plans(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_hosting_orders_user ON hosting_orders(user_id);
CREATE INDEX IF NOT EXISTS idx_hosting_orders_status ON hosting_orders(status);
CREATE INDEX IF NOT EXISTS idx_hosting_subscriptions_user ON hosting_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_hosting_invoices_user ON hosting_invoices(user_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_user ON support_tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_ticket_replies_ticket ON ticket_replies(ticket_id);
CREATE INDEX IF NOT EXISTS idx_hosting_services_user ON hosting_services(user_id);


-- FILE: 20260709113608_create_vaulthost_extended_tables.sql
/*
# VaultHost Extended — Domains, Add-ons, DNS, Email, Databases, SSL, Backups

## Overview
Extends the VaultHost hosting platform with Hostinger-style features:
domain registration, add-on marketplace, DNS zone management, email accounts,
MySQL/PostgreSQL databases, SSL certificates, and backup snapshots.

## New Tables

1. **hosting_addons** — Public catalog of purchasable add-ons (SSL, backup, CDN, etc.)
   - Public read (catalog visible to all visitors)
   - Admin-only writes (no insert/update/delete policies for anon/authenticated)

2. **hosting_order_addons** — Junction table linking orders to add-ons (many-to-many)
   - Owner-scoped via parent order ownership check

3. **domain_registrations** — Registered domains tied to a user
   - Owner-scoped, tracks registration, expiry, auto-renew, status

4. **dns_zones** — DNS zones for domains owned by a user
   - Owner-scoped via domain ownership check

5. **dns_records** — Individual DNS records (A, AAAA, CNAME, MX, TXT, etc.)
   - Owner-scoped via parent zone ownership check

6. **email_accounts** — Mailboxes tied to a domain
   - Owner-scoped via domain ownership check

7. **hosting_databases** — MySQL/PostgreSQL databases for hosting services
   - Owner-scoped, linked to hosting_services

8. **ssl_certificates** — SSL certificates (free Let's Encrypt + paid premium)
   - Owner-scoped, linked to domains

9. **backup_snapshots** — Backup snapshots for hosting services
   - Owner-scoped, linked to hosting_services

## Security
- `hosting_addons`: public read (anon + authenticated), no writes from app
- All user data tables: owner-scoped via `auth.uid() = user_id` or parent ownership
- RLS enabled on every table
- Owner columns default to `auth.uid()` so inserts work without explicit user_id
*/

-- ============================================================
-- HOSTING ADDONS (public catalog)
-- ============================================================
CREATE TABLE IF NOT EXISTS hosting_addons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  name text NOT NULL,
  description text,
  category text NOT NULL DEFAULT 'security',
  price_monthly numeric(10,2) NOT NULL DEFAULT 0,
  price_annual numeric(10,2) NOT NULL DEFAULT 0,
  icon text,
  is_active boolean NOT NULL DEFAULT true,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE hosting_addons ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_hosting_addons" ON hosting_addons;
CREATE POLICY "public_read_hosting_addons" ON hosting_addons FOR SELECT
  TO anon, authenticated USING (true);

-- ============================================================
-- HOSTING ORDER ADDONS (junction)
-- ============================================================
CREATE TABLE IF NOT EXISTS hosting_order_addons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES hosting_orders(id) ON DELETE CASCADE,
  addon_id uuid NOT NULL REFERENCES hosting_addons(id) ON DELETE RESTRICT,
  addon_name text NOT NULL,
  price numeric(10,2) NOT NULL DEFAULT 0,
  billing_cycle text NOT NULL DEFAULT 'monthly',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE hosting_order_addons ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_order_addons" ON hosting_order_addons;
CREATE POLICY "select_own_order_addons" ON hosting_order_addons FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM hosting_orders WHERE hosting_orders.id = hosting_order_addons.order_id AND hosting_orders.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "insert_own_order_addons" ON hosting_order_addons;
CREATE POLICY "insert_own_order_addons" ON hosting_order_addons FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM hosting_orders WHERE hosting_orders.id = hosting_order_addons.order_id AND hosting_orders.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "delete_own_order_addons" ON hosting_order_addons;
CREATE POLICY "delete_own_order_addons" ON hosting_order_addons FOR DELETE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM hosting_orders WHERE hosting_orders.id = hosting_order_addons.order_id AND hosting_orders.user_id = auth.uid())
  );

-- ============================================================
-- DOMAIN REGISTRATIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS domain_registrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  domain text NOT NULL,
  tld text NOT NULL,
  registration_period int NOT NULL DEFAULT 1,
  registered_at timestamptz DEFAULT now(),
  expires_at timestamptz,
  auto_renew boolean NOT NULL DEFAULT true,
  status text NOT NULL DEFAULT 'active',
  nameservers jsonb DEFAULT '[]'::jsonb,
  privacy_protected boolean NOT NULL DEFAULT false,
  order_id uuid REFERENCES hosting_orders(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE domain_registrations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_domains" ON domain_registrations;
CREATE POLICY "select_own_domains" ON domain_registrations FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_domains" ON domain_registrations;
CREATE POLICY "insert_own_domains" ON domain_registrations FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_domains" ON domain_registrations;
CREATE POLICY "update_own_domains" ON domain_registrations FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_domains" ON domain_registrations;
CREATE POLICY "delete_own_domains" ON domain_registrations FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- ============================================================
-- DNS ZONES
-- ============================================================
CREATE TABLE IF NOT EXISTS dns_zones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  domain_id uuid REFERENCES domain_registrations(id) ON DELETE CASCADE,
  domain text NOT NULL,
  status text NOT NULL DEFAULT 'active',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE dns_zones ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_dns_zones" ON dns_zones;
CREATE POLICY "select_own_dns_zones" ON dns_zones FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_dns_zones" ON dns_zones;
CREATE POLICY "insert_own_dns_zones" ON dns_zones FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_dns_zones" ON dns_zones;
CREATE POLICY "update_own_dns_zones" ON dns_zones FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_dns_zones" ON dns_zones;
CREATE POLICY "delete_own_dns_zones" ON dns_zones FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- ============================================================
-- DNS RECORDS
-- ============================================================
CREATE TABLE IF NOT EXISTS dns_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  zone_id uuid NOT NULL REFERENCES dns_zones(id) ON DELETE CASCADE,
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  type text NOT NULL,
  name text NOT NULL DEFAULT '@',
  value text NOT NULL,
  ttl int NOT NULL DEFAULT 3600,
  priority int,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE dns_records ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_dns_records" ON dns_records;
CREATE POLICY "select_own_dns_records" ON dns_records FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM dns_zones WHERE dns_zones.id = dns_records.zone_id AND dns_zones.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "insert_own_dns_records" ON dns_records;
CREATE POLICY "insert_own_dns_records" ON dns_records FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM dns_zones WHERE dns_zones.id = dns_records.zone_id AND dns_zones.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "update_own_dns_records" ON dns_records;
CREATE POLICY "update_own_dns_records" ON dns_records FOR UPDATE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM dns_zones WHERE dns_zones.id = dns_records.zone_id AND dns_zones.user_id = auth.uid())
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM dns_zones WHERE dns_zones.id = dns_records.zone_id AND dns_zones.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "delete_own_dns_records" ON dns_records;
CREATE POLICY "delete_own_dns_records" ON dns_records FOR DELETE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM dns_zones WHERE dns_zones.id = dns_records.zone_id AND dns_zones.user_id = auth.uid())
  );

-- ============================================================
-- EMAIL ACCOUNTS
-- ============================================================
CREATE TABLE IF NOT EXISTS email_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  domain_id uuid REFERENCES domain_registrations(id) ON DELETE CASCADE,
  domain text NOT NULL,
  local_part text NOT NULL,
  password_hash text,
  storage_quota_mb int NOT NULL DEFAULT 1024,
  storage_used_mb numeric(10,2) NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'active',
  forward_to text,
  is_catch_all boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE email_accounts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_email_accounts" ON email_accounts;
CREATE POLICY "select_own_email_accounts" ON email_accounts FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_email_accounts" ON email_accounts;
CREATE POLICY "insert_own_email_accounts" ON email_accounts FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_email_accounts" ON email_accounts;
CREATE POLICY "update_own_email_accounts" ON email_accounts FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_email_accounts" ON email_accounts;
CREATE POLICY "delete_own_email_accounts" ON email_accounts FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- ============================================================
-- HOSTING DATABASES (MySQL/PostgreSQL)
-- ============================================================
CREATE TABLE IF NOT EXISTS hosting_databases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  service_id uuid REFERENCES hosting_services(id) ON DELETE CASCADE,
  db_name text NOT NULL,
  db_type text NOT NULL DEFAULT 'mysql',
  db_user text NOT NULL,
  db_host text,
  db_port int DEFAULT 3306,
  size_mb numeric(10,2) NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'active',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE hosting_databases ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_hosting_databases" ON hosting_databases;
CREATE POLICY "select_own_hosting_databases" ON hosting_databases FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_hosting_databases" ON hosting_databases;
CREATE POLICY "insert_own_hosting_databases" ON hosting_databases FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_hosting_databases" ON hosting_databases;
CREATE POLICY "update_own_hosting_databases" ON hosting_databases FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_hosting_databases" ON hosting_databases;
CREATE POLICY "delete_own_hosting_databases" ON hosting_databases FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- ============================================================
-- SSL CERTIFICATES
-- ============================================================
CREATE TABLE IF NOT EXISTS ssl_certificates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  domain text NOT NULL,
  cert_type text NOT NULL DEFAULT 'lets_encrypt',
  issuer text,
  valid_from timestamptz,
  valid_until timestamptz,
  status text NOT NULL DEFAULT 'active',
  auto_renew boolean NOT NULL DEFAULT true,
  order_id uuid REFERENCES hosting_orders(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE ssl_certificates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_ssl_certs" ON ssl_certificates;
CREATE POLICY "select_own_ssl_certs" ON ssl_certificates FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_ssl_certs" ON ssl_certificates;
CREATE POLICY "insert_own_ssl_certs" ON ssl_certificates FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_ssl_certs" ON ssl_certificates;
CREATE POLICY "update_own_ssl_certs" ON ssl_certificates FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_ssl_certs" ON ssl_certificates;
CREATE POLICY "delete_own_ssl_certs" ON ssl_certificates FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- ============================================================
-- BACKUP SNAPSHOTS
-- ============================================================
CREATE TABLE IF NOT EXISTS backup_snapshots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  service_id uuid REFERENCES hosting_services(id) ON DELETE CASCADE,
  backup_type text NOT NULL DEFAULT 'daily',
  size_mb numeric(10,2) NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'completed',
  storage_url text,
  created_at timestamptz DEFAULT now(),
  expires_at timestamptz
);

ALTER TABLE backup_snapshots ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_backups" ON backup_snapshots;
CREATE POLICY "select_own_backups" ON backup_snapshots FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_backups" ON backup_snapshots;
CREATE POLICY "insert_own_backups" ON backup_snapshots FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_backups" ON backup_snapshots;
CREATE POLICY "delete_own_backups" ON backup_snapshots FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_hosting_addons_active ON hosting_addons(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_order_addons_order ON hosting_order_addons(order_id);
CREATE INDEX IF NOT EXISTS idx_domains_user ON domain_registrations(user_id);
CREATE INDEX IF NOT EXISTS idx_domains_domain ON domain_registrations(domain);
CREATE INDEX IF NOT EXISTS idx_dns_zones_user ON dns_zones(user_id);
CREATE INDEX IF NOT EXISTS idx_dns_records_zone ON dns_records(zone_id);
CREATE INDEX IF NOT EXISTS idx_email_accounts_user ON email_accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_email_accounts_domain ON email_accounts(domain);
CREATE INDEX IF NOT EXISTS idx_hosting_databases_user ON hosting_databases(user_id);
CREATE INDEX IF NOT EXISTS idx_hosting_databases_service ON hosting_databases(service_id);
CREATE INDEX IF NOT EXISTS idx_ssl_certs_user ON ssl_certificates(user_id);
CREATE INDEX IF NOT EXISTS idx_ssl_certs_domain ON ssl_certificates(domain);
CREATE INDEX IF NOT EXISTS idx_backup_snapshots_user ON backup_snapshots(user_id);
CREATE INDEX IF NOT EXISTS idx_backup_snapshots_service ON backup_snapshots(service_id);


-- FILE: 20260709122124_create_admin_users_table.sql

-- Admin users table for admin panel access control
CREATE TABLE IF NOT EXISTS admin_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL UNIQUE,
  role text NOT NULL DEFAULT 'admin',
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Admin users can read the table (to check their own admin status)
-- Also allow authenticated users to check if they are admin (for login redirect)
CREATE POLICY "read_admin_users" ON admin_users
  FOR SELECT TO authenticated USING (true);

-- Only service role can insert/update/delete (via edge functions or SQL)
CREATE POLICY "insert_admin_users" ON admin_users
  FOR INSERT TO authenticated WITH CHECK (false);

CREATE POLICY "update_admin_users" ON admin_users
  FOR UPDATE TO authenticated USING (false) WITH CHECK (false);

CREATE POLICY "delete_admin_users" ON admin_users
  FOR DELETE TO authenticated USING (false);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_admin_users_email ON admin_users(email);
CREATE INDEX IF NOT EXISTS idx_admin_users_user_id ON admin_users(user_id);


-- FILE: 20260709122151_alter_admin_users_add_password.sql

-- Add password_hash column to admin_users for standalone auth
ALTER TABLE admin_users ADD COLUMN IF NOT EXISTS password_hash text;
ALTER TABLE admin_users ADD COLUMN IF NOT EXISTS full_name text;

-- Drop the restrictive insert policy so the edge function (service role) can insert
DROP POLICY IF EXISTS "insert_admin_users" ON admin_users;
DROP POLICY IF EXISTS "update_admin_users" ON admin_users;
DROP POLICY IF EXISTS "delete_admin_users" ON admin_users;

-- Service role bypasses RLS, so these policies are for authenticated users
-- Allow authenticated users to read (for admin check)
-- Keep insert/update/delete restricted to service role (which bypasses RLS)
CREATE POLICY "insert_admin_users_service" ON admin_users
  FOR INSERT TO authenticated WITH CHECK (false);
CREATE POLICY "update_admin_users_service" ON admin_users
  FOR UPDATE TO authenticated USING (false) WITH CHECK (false);
CREATE POLICY "delete_admin_users_service" ON admin_users
  FOR DELETE TO authenticated USING (false);


-- FILE: 20260718110058_create_payment_and_site_settings_tables.sql
/*
# Create payment_settings, site_settings, and transactions tables

1. New Tables
- `payment_settings` (single-row, admin-controlled config for Razorpay/UPI/Bank/Custom QR)
- `site_settings` (single-row, org metadata + trust badges JSON)
- `transactions` (payment audit log per order)

2. payment_settings columns
- id int primary key default 1 (enforces single row)
- razorpay_enabled, razorpay_key_id, razorpay_key_secret, razorpay_mode
- upi_enabled, upi_id, upi_display_name
- bank_transfer_enabled, bank_details jsonb
- custom_qr_image_url text (Supabase Storage URL, overrides dynamic QR)
- updated_at timestamptz

3. site_settings columns
- id int primary key default 1
- org_name, tagline, support_email, support_phone
- trust_badges jsonb (array of {id, name, logo_url, verify_url, verified, display})
- seo_defaults jsonb, updated_at

4. transactions columns
- id uuid, order_id (FK to hosting_orders), user_id, amount, currency
- gateway, gateway_transaction_id, status, metadata, created_at

5. Security (RLS)
- payment_settings: admin-only via auth.jwt() email match against admin_users.
  A public view `public_payment_settings` exposes non-secret columns to anon/authenticated.
- site_settings: public read; admin write.
- transactions: owner read own; admin read all; owner insert own.

6. Important notes
- Single-row enforced via CHECK(id=1).
- Admin check uses auth.jwt() ->> 'email' to match admin_users.email.
- The public view never exposes razorpay_key_secret.
*/

-- payment_settings
CREATE TABLE IF NOT EXISTS payment_settings (
  id int PRIMARY KEY DEFAULT 1,
  razorpay_enabled boolean NOT NULL DEFAULT false,
  razorpay_key_id text DEFAULT '',
  razorpay_key_secret text DEFAULT '',
  razorpay_mode text NOT NULL DEFAULT 'sandbox',
  upi_enabled boolean NOT NULL DEFAULT true,
  upi_id text DEFAULT '',
  upi_display_name text DEFAULT 'ELSxGlobal',
  bank_transfer_enabled boolean NOT NULL DEFAULT false,
  bank_details jsonb DEFAULT '{}'::jsonb,
  custom_qr_image_url text DEFAULT '',
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT payment_settings_single_row CHECK (id = 1)
);

ALTER TABLE payment_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admin_read_payment_settings" ON payment_settings;
CREATE POLICY "admin_read_payment_settings" ON payment_settings
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.email = (auth.jwt() ->> 'email')
      AND admin_users.is_active = true
    )
  );

DROP POLICY IF EXISTS "admin_write_payment_settings" ON payment_settings;
CREATE POLICY "admin_write_payment_settings" ON payment_settings
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.email = (auth.jwt() ->> 'email')
      AND admin_users.is_active = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.email = (auth.jwt() ->> 'email')
      AND admin_users.is_active = true
    )
  );

DROP POLICY IF EXISTS "admin_insert_payment_settings" ON payment_settings;
CREATE POLICY "admin_insert_payment_settings" ON payment_settings
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.email = (auth.jwt() ->> 'email')
      AND admin_users.is_active = true
    )
  );

INSERT INTO payment_settings (id) VALUES (1)
ON CONFLICT (id) DO NOTHING;

-- Public view (no secret)
CREATE OR REPLACE VIEW public_payment_settings AS
SELECT
  id,
  razorpay_enabled,
  razorpay_key_id,
  razorpay_mode,
  upi_enabled,
  upi_id,
  upi_display_name,
  bank_transfer_enabled,
  bank_details,
  custom_qr_image_url,
  updated_at
FROM payment_settings;

GRANT SELECT ON public_payment_settings TO anon, authenticated;

-- site_settings
CREATE TABLE IF NOT EXISTS site_settings (
  id int PRIMARY KEY DEFAULT 1,
  org_name text NOT NULL DEFAULT 'EvolucentSphere',
  tagline text DEFAULT 'Enterprise Technology Solutions',
  support_email text DEFAULT 'contact@elsxglobal.com',
  support_phone text DEFAULT '+917247558873',
  trust_badges jsonb NOT NULL DEFAULT '[]'::jsonb,
  seo_defaults jsonb DEFAULT '{}'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT site_settings_single_row CHECK (id = 1)
);

ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_site_settings" ON site_settings;
CREATE POLICY "public_read_site_settings" ON site_settings
  FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "admin_update_site_settings" ON site_settings;
CREATE POLICY "admin_update_site_settings" ON site_settings
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.email = (auth.jwt() ->> 'email')
      AND admin_users.is_active = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.email = (auth.jwt() ->> 'email')
      AND admin_users.is_active = true
    )
  );

DROP POLICY IF EXISTS "admin_insert_site_settings" ON site_settings;
CREATE POLICY "admin_insert_site_settings" ON site_settings
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.email = (auth.jwt() ->> 'email')
      AND admin_users.is_active = true
    )
  );

INSERT INTO site_settings (id, trust_badges) VALUES (
  1,
  '[{"id":"meta-partner","name":"Meta Business Partner","logo_url":"","verify_url":"https://www.facebook.com/business/partner-directory","verified":true,"display":true},{"id":"godaddy-reseller","name":"GoDaddy Authorized Reseller","logo_url":"","verify_url":"https://godaddy.com","verified":true,"display":true},{"id":"aws-partner","name":"AWS Partner Network","logo_url":"","verify_url":"https://aws.amazon.com/partners","verified":true,"display":true},{"id":"microsoft-partner","name":"Microsoft Cloud Partner","logo_url":"","verify_url":"https://partner.microsoft.com","verified":true,"display":true},{"id":"google-cloud","name":"Google Cloud Partner","logo_url":"","verify_url":"https://cloud.google.com/partners","verified":true,"display":true},{"id":"iso-27001","name":"ISO 27001 Certified","logo_url":"","verify_url":"","verified":true,"display":true}]'::jsonb
)
ON CONFLICT (id) DO NOTHING;

-- transactions
CREATE TABLE IF NOT EXISTS transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES hosting_orders(id) ON DELETE CASCADE,
  user_id uuid,
  amount numeric NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'INR',
  gateway text,
  gateway_transaction_id text,
  status text NOT NULL DEFAULT 'initiated',
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "owner_read_transactions" ON transactions;
CREATE POLICY "owner_read_transactions" ON transactions
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "admin_read_transactions" ON transactions;
CREATE POLICY "admin_read_transactions" ON transactions
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.email = (auth.jwt() ->> 'email')
      AND admin_users.is_active = true
    )
  );

DROP POLICY IF EXISTS "owner_insert_transactions" ON transactions;
CREATE POLICY "owner_insert_transactions" ON transactions
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_transactions_order_id ON transactions(order_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);


-- FILE: 20260724132636_add_server_config_to_hosting_orders.sql
-- Add server configuration columns to hosting_orders
ALTER TABLE hosting_orders
  ADD COLUMN IF NOT EXISTS os_selection text DEFAULT 'ubuntu-22.04',
  ADD COLUMN IF NOT EXISTS panel_selection text DEFAULT 'none',
  ADD COLUMN IF NOT EXISTS server_location text DEFAULT 'pune';

-- Create email_log table for tracking outgoing emails
CREATE TABLE IF NOT EXISTS email_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient text NOT NULL,
  subject text NOT NULL,
  body text,
  template text,
  related_id uuid,
  related_type text,
  status text NOT NULL DEFAULT 'sent',
  error text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE email_log ENABLE ROW LEVEL SECURITY;

-- Admin can read all emails
CREATE POLICY "admin_read_email_log" ON email_log
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.email = (auth.jwt() ->> 'email')
      AND admin_users.is_active = true
    )
  );

-- Owner can read their own emails (matched via related_id + user_id on related record)
CREATE POLICY "owner_read_email_log" ON email_log
  FOR SELECT TO authenticated
  USING (
    related_id IN (
      SELECT id FROM hosting_orders WHERE user_id = auth.uid()
    )
  );

-- Edge function (service role) can insert
CREATE POLICY "service_insert_email_log" ON email_log
  FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_email_log_recipient ON email_log(recipient);
CREATE INDEX IF NOT EXISTS idx_email_log_created_at ON email_log(created_at);
CREATE INDEX IF NOT EXISTS idx_email_log_related_id ON email_log(related_id);


-- FILE: 20260724194946_add_user_email_and_proof_to_hosting_orders.sql
/*
# Add user_email and payment_proof_url to hosting_orders

1. Modified Tables
- `hosting_orders`
  - Add `user_email` (text, nullable) — denormalized email for admin display without joining auth.users
  - Add `payment_proof_url` (text, nullable) — URL to uploaded payment proof image (UPI/bank transfer)

2. Notes
- Both columns are nullable so existing rows are unaffected.
- The checkout flow already writes to these columns; this migration makes the schema match the code.
*/

ALTER TABLE hosting_orders
  ADD COLUMN IF NOT EXISTS user_email text,
  ADD COLUMN IF NOT EXISTS payment_proof_url text;


-- FILE: 20260724201149_add_qr_uploads_storage_policy.sql
/*
# Storage policy for qr-uploads bucket

1. Security
- Allow public read access to QR upload images (they need to be displayed on checkout)
- Allow authenticated users to upload (admin uploads via portal)
*/

DROP POLICY IF EXISTS "public_read_qr_uploads" ON storage.objects;
CREATE POLICY "public_read_qr_uploads" ON storage.objects
  FOR SELECT TO anon, authenticated
  USING (bucket_id = 'qr-uploads');

DROP POLICY IF EXISTS "auth_upload_qr_uploads" ON storage.objects;
CREATE POLICY "auth_upload_qr_uploads" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'qr-uploads');


-- FILE: 20260724205717_fix_admin_schema_and_security.sql
/*
# Fix Admin Schema and Security

1. New Tables
- `admin_sessions` — stores issued admin tokens for server-side validation.
  - `id` (uuid, PK)
  - `admin_id` (uuid, FK to admin_users)
  - `token` (text, unique, not null) — the token string
  - `expires_at` (timestamptz, not null)
  - `created_at` (timestamptz, default now())
  - `revoked` (boolean, default false)

2. Modified Tables
- `support_tickets` — add `order_id` column (uuid, nullable, FK to hosting_orders) so tickets can be linked to orders.

3. Security Changes
- Enable RLS on `admin_sessions`.
- `admin_sessions` has no SELECT/INSERT/UPDATE/DELETE policies for any role — only the service role (edge functions) can access it.
- Fix `admin_users` SELECT policy: change from `USING (true)` (which leaks all admin emails to any authenticated user) to `USING (false)` — only the service role can read admin users.
- Add index on `admin_sessions.token` for fast lookups.

4. Important Notes
- The admin_sessions table replaces the previous forgeable token scheme. The admin-auth edge function will now store issued tokens here and verify them on every request.
- The support_tickets.order_id column fixes the schema mismatch where admin-auth's order-detail action queried a non-existent column.
- The admin_users RLS fix prevents any logged-in non-admin user from reading the admin roster.
*/

-- Add order_id to support_tickets
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'support_tickets' AND column_name = 'order_id'
  ) THEN
    ALTER TABLE support_tickets ADD COLUMN order_id uuid REFERENCES hosting_orders(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Create admin_sessions table
CREATE TABLE IF NOT EXISTS admin_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id uuid NOT NULL REFERENCES admin_users(id) ON DELETE CASCADE,
  token text UNIQUE NOT NULL,
  expires_at timestamptz NOT NULL,
  created_at timestamptz DEFAULT now(),
  revoked boolean NOT NULL DEFAULT false
);

ALTER TABLE admin_sessions ENABLE ROW LEVEL SECURITY;

-- No policies: only service role can access admin_sessions

-- Index for fast token lookups
CREATE INDEX IF NOT EXISTS idx_admin_sessions_token ON admin_sessions(token);

-- Fix admin_users SELECT policy: was USING(true), now USING(false)
DROP POLICY IF EXISTS "read_admin_users" ON admin_users;
CREATE POLICY "read_admin_users" ON admin_users FOR SELECT
  TO authenticated USING (false);

-- Keep the service-role-only insert/update/delete policies as-is
-- (they already have WITH CHECK (false) / USING (false) which is correct)


-- FILE: 20260731000000_add_stripe_to_payment_settings.sql
-- Add Stripe columns to payment_settings

ALTER TABLE payment_settings 
ADD COLUMN IF NOT EXISTS stripe_enabled boolean NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS stripe_publishable_key text DEFAULT '',
ADD COLUMN IF NOT EXISTS stripe_secret_key text DEFAULT '',
ADD COLUMN IF NOT EXISTS stripe_webhook_secret text DEFAULT '';

-- Update public view
DROP VIEW IF EXISTS public_payment_settings;

CREATE OR REPLACE VIEW public_payment_settings AS
SELECT
  id,
  razorpay_enabled,
  razorpay_key_id,
  razorpay_mode,
  stripe_enabled,
  stripe_publishable_key,
  upi_enabled,
  upi_id,
  upi_display_name,
  bank_transfer_enabled,
  bank_details,
  custom_qr_image_url,
  updated_at
FROM payment_settings;

GRANT SELECT ON public_payment_settings TO anon, authenticated;


-- FILE: 20260731010000_add_provisioning_settings.sql
-- Migration: add_provisioning_settings
-- Creates a single-row table to store hypervisor and panel API credentials.

CREATE TABLE IF NOT EXISTS public.provisioning_settings (
  id integer PRIMARY KEY CHECK (id = 1),
  
  -- Pterodactyl Config
  pterodactyl_enabled boolean DEFAULT false,
  pterodactyl_url text,
  pterodactyl_api_key text,
  
  -- Proxmox Config
  proxmox_enabled boolean DEFAULT false,
  proxmox_url text,
  proxmox_token_id text,
  proxmox_secret text,
  proxmox_node text,
  
  -- cPanel/WHM Config
  cpanel_enabled boolean DEFAULT false,
  cpanel_url text,
  cpanel_username text,
  cpanel_api_token text,
  
  -- Default mapping for tiers
  default_game_adapter text DEFAULT 'pterodactyl',
  default_vps_adapter text DEFAULT 'proxmox',
  default_shared_adapter text DEFAULT 'cpanel',

  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Insert default row
INSERT INTO public.provisioning_settings (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

-- Enable RLS
ALTER TABLE public.provisioning_settings ENABLE ROW LEVEL SECURITY;

-- Allow only admins to select/update
CREATE POLICY "Admins can view provisioning settings" 
  ON public.provisioning_settings FOR SELECT 
  USING (
    auth.uid() IN (SELECT user_id FROM public.admin_users)
  );

CREATE POLICY "Admins can update provisioning settings" 
  ON public.provisioning_settings FOR UPDATE 
  USING (
    auth.uid() IN (SELECT user_id FROM public.admin_users)
  );


-- FILE: 20260731013000_open_source_integrations.sql
-- Migration: open_source_integrations
-- Replaces cPanel with HestiaCP/CyberPanel, adds Integrations table.

-- 1. Modify provisioning_settings table
ALTER TABLE public.provisioning_settings
  DROP COLUMN IF EXISTS cpanel_enabled,
  DROP COLUMN IF EXISTS cpanel_url,
  DROP COLUMN IF EXISTS cpanel_username,
  DROP COLUMN IF EXISTS cpanel_api_token;

ALTER TABLE public.provisioning_settings
  ADD COLUMN IF NOT EXISTS hestiacp_enabled boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS hestiacp_url text,
  ADD COLUMN IF NOT EXISTS hestiacp_username text,
  ADD COLUMN IF NOT EXISTS hestiacp_password text,
  
  ADD COLUMN IF NOT EXISTS cyberpanel_enabled boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS cyberpanel_url text,
  ADD COLUMN IF NOT EXISTS cyberpanel_admin_user text,
  ADD COLUMN IF NOT EXISTS cyberpanel_admin_pass text,
  
  ADD COLUMN IF NOT EXISTS domains_enabled boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS domains_provider text DEFAULT 'namesilo',
  ADD COLUMN IF NOT EXISTS domains_api_key text,
  ADD COLUMN IF NOT EXISTS domains_username text;

-- Update the default shared adapter
UPDATE public.provisioning_settings SET default_shared_adapter = 'hestiacp' WHERE id = 1;

-- 2. Create integrations table for Webhooks & CRM
CREATE TABLE IF NOT EXISTS public.integrations (
  key text PRIMARY KEY,
  value text NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Insert default Odoo placeholder keys if they don't exist
INSERT INTO public.integrations (key, value) VALUES
  ('odoo_url', 'https://odoo.elsxglobal.com'),
  ('odoo_db', 'elsxglobal'),
  ('odoo_api_key', '')
ON CONFLICT (key) DO NOTHING;

-- Enable RLS on integrations
ALTER TABLE public.integrations ENABLE ROW LEVEL SECURITY;

-- Allow only admins to select/update
CREATE POLICY "Admins can view integrations" 
  ON public.integrations FOR SELECT 
  USING (auth.uid() IN (SELECT user_id FROM public.admin_users));

CREATE POLICY "Admins can insert integrations" 
  ON public.integrations FOR INSERT 
  WITH CHECK (auth.uid() IN (SELECT user_id FROM public.admin_users));

CREATE POLICY "Admins can update integrations" 
  ON public.integrations FOR UPDATE 
  USING (auth.uid() IN (SELECT user_id FROM public.admin_users));


-- FILE: 20260801110000_create_coupons_table.sql
-- Create coupons table
CREATE TABLE IF NOT EXISTS hosting_coupons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  discount_type text NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value numeric NOT NULL,
  max_uses integer,
  current_uses integer DEFAULT 0,
  valid_from timestamp with time zone,
  valid_until timestamp with time zone,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

-- RLS Policies
ALTER TABLE hosting_coupons ENABLE ROW LEVEL SECURITY;

-- Only admins can manage coupons
CREATE POLICY "Admins can manage coupons" ON hosting_coupons
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE admin_users.id = auth.uid() 
      AND admin_users.is_active = true
    )
  );

-- Users can view active coupons (for checkout validation)
CREATE POLICY "Users can view active coupons" ON hosting_coupons
  FOR SELECT
  USING (is_active = true);


-- FILE: 20260802000000_infrastructure_nodes.sql
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


-- FILE: 20260816214331_change_plan_id_types.sql
-- Drop foreign key constraints
ALTER TABLE public.hosting_orders DROP CONSTRAINT IF EXISTS hosting_orders_plan_id_fkey;
ALTER TABLE public.hosting_subscriptions DROP CONSTRAINT IF EXISTS hosting_subscriptions_plan_id_fkey;
ALTER TABLE public.hosting_services DROP CONSTRAINT IF EXISTS hosting_services_plan_id_fkey;
ALTER TABLE public.hosting_order_addons DROP CONSTRAINT IF EXISTS hosting_order_addons_addon_id_fkey;
ALTER TABLE public.hosting_order_addons DROP CONSTRAINT IF EXISTS hosting_order_addons_order_id_fkey;

-- Change base table IDs
ALTER TABLE public.hosting_plans ALTER COLUMN id TYPE text USING id::text;
ALTER TABLE public.hosting_addons ALTER COLUMN id TYPE text USING id::text;

-- Change referencing columns
ALTER TABLE public.hosting_orders ALTER COLUMN plan_id TYPE text USING plan_id::text;
ALTER TABLE public.hosting_subscriptions ALTER COLUMN plan_id TYPE text USING plan_id::text;
ALTER TABLE public.hosting_services ALTER COLUMN plan_id TYPE text USING plan_id::text;
ALTER TABLE public.hosting_order_addons ALTER COLUMN addon_id TYPE text USING addon_id::text;

-- Add foreign key constraints back
ALTER TABLE public.hosting_orders ADD CONSTRAINT hosting_orders_plan_id_fkey FOREIGN KEY (plan_id) REFERENCES public.hosting_plans(id);
ALTER TABLE public.hosting_subscriptions ADD CONSTRAINT hosting_subscriptions_plan_id_fkey FOREIGN KEY (plan_id) REFERENCES public.hosting_plans(id);
ALTER TABLE public.hosting_services ADD CONSTRAINT hosting_services_plan_id_fkey FOREIGN KEY (plan_id) REFERENCES public.hosting_plans(id);
ALTER TABLE public.hosting_order_addons ADD CONSTRAINT hosting_order_addons_addon_id_fkey FOREIGN KEY (addon_id) REFERENCES public.hosting_addons(id);
ALTER TABLE public.hosting_order_addons ADD CONSTRAINT hosting_order_addons_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.hosting_orders(id);


-- FILE: 20260927000000_create_action_gateway_tables.sql
-- ============================================================
-- Action Gateway Tables Migration
-- VaultHost by ELSxGlobal — Phase 2 Infrastructure
-- Created: 2026-09-27
-- ============================================================

-- ─── Action Gateway Audit Logs ───────────────────────────────
-- Immutable, HMAC-SHA256 chained audit ledger
CREATE TABLE IF NOT EXISTS action_gateway_audit_logs (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  intent_id        TEXT NOT NULL,
  timestamp        TIMESTAMPTZ NOT NULL DEFAULT now(),
  actor_id         TEXT NOT NULL,
  actor_type       TEXT NOT NULL CHECK (actor_type IN ('human_user', 'ai_agent', 'system', 'scheduled_job')),
  actor_role       TEXT NOT NULL,
  tenant_id        TEXT NOT NULL,
  action_verb      TEXT NOT NULL,
  resource_type    TEXT NOT NULL,
  resource_id      TEXT NOT NULL,
  risk_tier        INTEGER NOT NULL CHECK (risk_tier BETWEEN 0 AND 3),
  outcome          TEXT NOT NULL CHECK (outcome IN ('executed', 'rejected', 'confirmed', 'cancelled', 'enqueued', 'approved', 'timed_out')),
  parameters       JSONB NOT NULL DEFAULT '{}',
  diff_preview     JSONB,
  approver_staff_id TEXT,
  confirmation_token TEXT,
  step_up_token    TEXT,
  hmac_signature   TEXT NOT NULL,
  previous_log_hash TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_audit_logs_tenant_id       ON action_gateway_audit_logs(tenant_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_actor_id        ON action_gateway_audit_logs(actor_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_intent_id       ON action_gateway_audit_logs(intent_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at      ON action_gateway_audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_risk_tier       ON action_gateway_audit_logs(risk_tier);
CREATE INDEX IF NOT EXISTS idx_audit_logs_outcome         ON action_gateway_audit_logs(outcome);

-- Row Level Security
ALTER TABLE action_gateway_audit_logs ENABLE ROW LEVEL SECURITY;

-- Admins (super_admin, system_admin, staff) can read all logs
CREATE POLICY "Admins can read all audit logs" ON action_gateway_audit_logs
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.user_id = auth.uid()
        AND admin_users.role IN ('super_admin', 'system_admin', 'staff')
    )
  );

-- Tenants can read their own logs
CREATE POLICY "Tenants can read own audit logs" ON action_gateway_audit_logs
  FOR SELECT
  TO authenticated
  USING (tenant_id = auth.uid()::text);

-- No direct INSERT for regular users — only via service_role (Action Gateway server)
-- INSERT allowed via service_role key only (no policy = deny for anon/authenticated)

-- ─── Action Gateway Approvals (Tier 3 Queue) ─────────────────
-- Persistent queue for Tier 3 staff approval requests
CREATE TABLE IF NOT EXISTS action_gateway_approvals (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  intent_id        TEXT NOT NULL UNIQUE,
  tenant_id        TEXT NOT NULL,
  actor_id         TEXT NOT NULL,
  actor_type       TEXT NOT NULL,
  actor_role       TEXT NOT NULL,
  action_verb      TEXT NOT NULL,
  resource_type    TEXT NOT NULL,
  resource_id      TEXT NOT NULL,
  parameters       JSONB NOT NULL DEFAULT '{}',
  diff_preview     JSONB,
  ai_reasoning     TEXT,
  risk_tier        INTEGER NOT NULL DEFAULT 3,
  status           TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'expired', 'cancelled')),
  approver_staff_id TEXT,
  approver_note    TEXT,
  approved_at      TIMESTAMPTZ,
  expires_at       TIMESTAMPTZ NOT NULL DEFAULT (now() + INTERVAL '48 hours'),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_approvals_tenant_id    ON action_gateway_approvals(tenant_id);
CREATE INDEX IF NOT EXISTS idx_approvals_status       ON action_gateway_approvals(status);
CREATE INDEX IF NOT EXISTS idx_approvals_created_at   ON action_gateway_approvals(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_approvals_expires_at   ON action_gateway_approvals(expires_at);

ALTER TABLE action_gateway_approvals ENABLE ROW LEVEL SECURITY;

-- Admins can read and update approvals
CREATE POLICY "Admins can manage approvals" ON action_gateway_approvals
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.user_id = auth.uid()
        AND admin_users.role IN ('super_admin', 'system_admin', 'staff')
    )
  );

-- Tenants can see their own pending approvals (read-only)
CREATE POLICY "Tenants can read own approvals" ON action_gateway_approvals
  FOR SELECT
  TO authenticated
  USING (tenant_id = auth.uid()::text);

-- Auto-update updated_at on change
CREATE OR REPLACE FUNCTION update_action_gateway_approvals_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_approvals_updated_at
  BEFORE UPDATE ON action_gateway_approvals
  FOR EACH ROW EXECUTE FUNCTION update_action_gateway_approvals_updated_at();

-- ─── Action Gateway Idempotency Keys ─────────────────────────
-- 24-hour TTL cache for idempotency enforcement
CREATE TABLE IF NOT EXISTS action_gateway_idempotency (
  key              TEXT PRIMARY KEY,
  intent_id        TEXT NOT NULL,
  tenant_id        TEXT NOT NULL,
  outcome          TEXT NOT NULL,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at       TIMESTAMPTZ NOT NULL DEFAULT (now() + INTERVAL '24 hours')
);

CREATE INDEX IF NOT EXISTS idx_idempotency_expires_at ON action_gateway_idempotency(expires_at);
CREATE INDEX IF NOT EXISTS idx_idempotency_tenant_id  ON action_gateway_idempotency(tenant_id);

ALTER TABLE action_gateway_idempotency ENABLE ROW LEVEL SECURITY;

-- Only service_role can manage idempotency keys (no user policies = deny for all roles)

-- ─── Comments / Documentation ────────────────────────────────
COMMENT ON TABLE action_gateway_audit_logs IS
  'Immutable HMAC-SHA256 chained audit log for all Action Gateway mutations. Every record is cryptographically linked to the previous (blockchain-style ledger). Append-only via service_role.';

COMMENT ON TABLE action_gateway_approvals IS
  'Persistent queue for Tier 3 (staff-authorized) Action Gateway intents. Entries expire after 48 hours. Approved entries trigger execution via the Action Gateway.';

COMMENT ON TABLE action_gateway_idempotency IS
  'Short-lived idempotency key store for Action Gateway. Prevents duplicate mutations from retried requests. TTL = 24 hours.';

COMMENT ON COLUMN action_gateway_audit_logs.hmac_signature IS
  'HMAC-SHA256(secret, intentId + timestamp + actorId + outcome + previousLogHash). Provides tamper-evidence.';

COMMENT ON COLUMN action_gateway_audit_logs.previous_log_hash IS
  'SHA-256 hash of the previous audit log entry. Creates a cryptographic chain (like a blockchain) for tamper detection.';


-- FILE: 20260928120000_enterprise_cloud_fleet_schema.sql
-- ============================================================
-- Enterprise Cloud Fleet Schema Migration
-- VaultHost by ELSxGlobal — Complete Backend Infrastructure
-- Created: 2026-09-28
-- ============================================================

-- ─── 1. DNS Subsystem ──────────────────────────────────────────

CREATE TABLE IF NOT EXISTS cloud_dns_zones (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id        TEXT NOT NULL,
  domain           TEXT NOT NULL UNIQUE,
  status           TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'pending_delegation', 'suspended', 'degraded')),
  nameservers      TEXT[] NOT NULL DEFAULT ARRAY['ns1.vaulthost.cloud', 'ns2.vaulthost.cloud'],
  dnssec_status    TEXT NOT NULL DEFAULT 'disabled' CHECK (dnssec_status IN ('disabled', 'active', 'pending')),
  query_count_24h  BIGINT NOT NULL DEFAULT 0,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS cloud_dns_records (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  zone_id          UUID NOT NULL REFERENCES cloud_dns_zones(id) ON DELETE CASCADE,
  tenant_id        TEXT NOT NULL,
  type             TEXT NOT NULL CHECK (type IN ('A', 'AAAA', 'CNAME', 'TXT', 'MX', 'NS', 'SRV', 'CAA', 'PTR')),
  name             TEXT NOT NULL,
  content          TEXT NOT NULL,
  ttl              INTEGER NOT NULL DEFAULT 300,
  proxied          BOOLEAN NOT NULL DEFAULT true,
  priority         INTEGER,
  comment          TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_dns_zones_tenant      ON cloud_dns_zones(tenant_id);
CREATE INDEX IF NOT EXISTS idx_dns_records_zone      ON cloud_dns_records(zone_id);
CREATE INDEX IF NOT EXISTS idx_dns_records_tenant    ON cloud_dns_records(tenant_id);
CREATE INDEX IF NOT EXISTS idx_dns_records_name_type ON cloud_dns_records(name, type);

-- ─── 2. Edge Compute & Workers Subsystem ───────────────────────

CREATE TABLE IF NOT EXISTS cloud_workers (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id        TEXT NOT NULL,
  name             TEXT NOT NULL,
  route_pattern    TEXT NOT NULL,
  script_code      TEXT NOT NULL,
  runtime          TEXT NOT NULL DEFAULT 'v8_isolate' CHECK (runtime IN ('v8_isolate', 'wasm', 'python_edge')),
  memory_limit_mb  INTEGER NOT NULL DEFAULT 128,
  cpu_limit_ms     INTEGER NOT NULL DEFAULT 50,
  replicas         TEXT NOT NULL DEFAULT 'global_anycast' CHECK (replicas IN ('global_anycast', 'regional_apac', 'regional_eu', 'regional_us')),
  status           TEXT NOT NULL DEFAULT 'running' CHECK (status IN ('running', 'throttled', 'suspended')),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(tenant_id, name)
);

CREATE TABLE IF NOT EXISTS cloud_worker_deployments (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  worker_id        UUID NOT NULL REFERENCES cloud_workers(id) ON DELETE CASCADE,
  version          TEXT NOT NULL,
  code_hash        TEXT NOT NULL,
  deployed_by      TEXT NOT NULL,
  status           TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'rollback', 'superseded')),
  deployed_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS cloud_worker_bindings (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  worker_id        UUID NOT NULL REFERENCES cloud_workers(id) ON DELETE CASCADE,
  binding_type     TEXT NOT NULL CHECK (binding_type IN ('kv_namespace', 'r2_bucket', 'd1_database', 'ai_gateway', 'queue', 'secret')),
  binding_name     TEXT NOT NULL,
  target_resource  TEXT NOT NULL,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(worker_id, binding_name)
);

CREATE TABLE IF NOT EXISTS cloud_worker_logs (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  worker_id        UUID NOT NULL REFERENCES cloud_workers(id) ON DELETE CASCADE,
  timestamp        TIMESTAMPTZ NOT NULL DEFAULT now(),
  level            TEXT NOT NULL DEFAULT 'info' CHECK (level IN ('debug', 'info', 'warn', 'error')),
  method           TEXT NOT NULL DEFAULT 'GET',
  path             TEXT NOT NULL,
  status_code      INTEGER NOT NULL DEFAULT 200,
  colo             TEXT NOT NULL DEFAULT 'BOM',
  duration_ms      NUMERIC(8, 2) NOT NULL DEFAULT 1.5,
  message          TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_workers_tenant       ON cloud_workers(tenant_id);
CREATE INDEX IF NOT EXISTS idx_workers_status       ON cloud_workers(status);
CREATE INDEX IF NOT EXISTS idx_worker_deployments   ON cloud_worker_deployments(worker_id);
CREATE INDEX IF NOT EXISTS idx_worker_logs_worker   ON cloud_worker_logs(worker_id, timestamp DESC);

-- ─── 3. VaultR2 Object Storage Subsystem ───────────────────────

CREATE TABLE IF NOT EXISTS cloud_storage_buckets (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id        TEXT NOT NULL,
  name             TEXT NOT NULL UNIQUE,
  region           TEXT NOT NULL DEFAULT 'auto_anycast' CHECK (region IN ('auto_anycast', 'ap_south_mumbai', 'eu_west_frankfurt', 'us_east_virginia')),
  object_count     BIGINT NOT NULL DEFAULT 0,
  size_bytes       BIGINT NOT NULL DEFAULT 0,
  public_access    BOOLEAN NOT NULL DEFAULT false,
  cors_enabled     BOOLEAN NOT NULL DEFAULT true,
  status           TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended')),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS cloud_storage_objects (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bucket_id        UUID NOT NULL REFERENCES cloud_storage_buckets(id) ON DELETE CASCADE,
  tenant_id        TEXT NOT NULL,
  object_key       TEXT NOT NULL,
  size_bytes       BIGINT NOT NULL DEFAULT 0,
  content_type     TEXT NOT NULL DEFAULT 'application/octet-stream',
  etag             TEXT NOT NULL,
  storage_class    TEXT NOT NULL DEFAULT 'standard' CHECK (storage_class IN ('standard', 'infrequent_access', 'archive')),
  uploaded_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(bucket_id, object_key)
);

CREATE TABLE IF NOT EXISTS cloud_s3_credentials (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id        TEXT NOT NULL,
  access_key_id    TEXT NOT NULL UNIQUE,
  secret_key_hash  TEXT NOT NULL,
  permissions      TEXT NOT NULL DEFAULT 'Read-Write' CHECK (permissions IN ('Read-Write', 'Read-Only', 'Admin')),
  ip_allowlist     TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  last_accessed_ip TEXT,
  last_active      TIMESTAMPTZ,
  status           TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'revoked')),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_buckets_tenant       ON cloud_storage_buckets(tenant_id);
CREATE INDEX IF NOT EXISTS idx_objects_bucket       ON cloud_storage_objects(bucket_id);
CREATE INDEX IF NOT EXISTS idx_objects_tenant       ON cloud_storage_objects(tenant_id);
CREATE INDEX IF NOT EXISTS idx_s3_creds_tenant      ON cloud_s3_credentials(tenant_id);

-- ─── 4. Security & DDoS Subsystem ──────────────────────────────

CREATE TABLE IF NOT EXISTS cloud_security_rules (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id        TEXT NOT NULL,
  rule_type        TEXT NOT NULL CHECK (rule_type IN ('IP_CIDR', 'COUNTRY', 'ASN', 'WAF_OWASP', 'RATE_LIMIT', 'BOT_MANAGEMENT')),
  target_domain    TEXT NOT NULL DEFAULT '*',
  action           TEXT NOT NULL CHECK (action IN ('Block', 'Managed Challenge', 'JS Challenge', 'Allow', 'Log')),
  expression       TEXT NOT NULL,
  description      TEXT,
  hits_count       BIGINT NOT NULL DEFAULT 0,
  enabled          BOOLEAN NOT NULL DEFAULT true,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS cloud_attack_events (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  timestamp        TIMESTAMPTZ NOT NULL DEFAULT now(),
  target_domain    TEXT NOT NULL,
  vector           TEXT NOT NULL,
  peak_rate        TEXT NOT NULL,
  layer            TEXT NOT NULL DEFAULT 'L7' CHECK (layer IN ('L3/L4', 'L7')),
  scrubbing_center TEXT NOT NULL DEFAULT 'BOM-01',
  mitigation       TEXT NOT NULL,
  packets_dropped  TEXT NOT NULL DEFAULT '0',
  status           TEXT NOT NULL DEFAULT 'mitigated' CHECK (status IN ('mitigated', 'absorbing', 'blocked'))
);

CREATE INDEX IF NOT EXISTS idx_security_rules_tenant ON cloud_security_rules(tenant_id);
CREATE INDEX IF NOT EXISTS idx_attack_events_time    ON cloud_attack_events(timestamp DESC);

-- ─── 5. AI Gateway Governance Subsystem ─────────────────────────

CREATE TABLE IF NOT EXISTS cloud_ai_providers (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id        TEXT NOT NULL,
  provider_id      TEXT NOT NULL,
  provider_name    TEXT NOT NULL,
  default_model    TEXT NOT NULL,
  spend_limit_usd  NUMERIC(10, 2) NOT NULL DEFAULT 500.00,
  spend_current_usd NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  rate_limit_tpm   TEXT NOT NULL DEFAULT '1,000,000 TPM',
  rate_limit_rpm   TEXT NOT NULL DEFAULT '5,000 RPM',
  api_key_masked   TEXT NOT NULL,
  status           TEXT NOT NULL DEFAULT 'operational' CHECK (status IN ('operational', 'degraded', 'maintenance')),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(tenant_id, provider_id)
);

CREATE TABLE IF NOT EXISTS cloud_ai_cache_entries (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id        TEXT NOT NULL,
  prompt_hash      TEXT NOT NULL,
  prompt_preview   TEXT NOT NULL,
  response_text    TEXT NOT NULL,
  model            TEXT NOT NULL,
  provider         TEXT NOT NULL,
  tokens_saved     INTEGER NOT NULL DEFAULT 0,
  cost_saved_usd   NUMERIC(8, 4) NOT NULL DEFAULT 0.0000,
  hit_count        INTEGER NOT NULL DEFAULT 1,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at       TIMESTAMPTZ NOT NULL DEFAULT (now() + INTERVAL '7 days'),
  UNIQUE(tenant_id, prompt_hash)
);

CREATE INDEX IF NOT EXISTS idx_ai_cache_hash         ON cloud_ai_cache_entries(prompt_hash);
CREATE INDEX IF NOT EXISTS idx_ai_cache_tenant       ON cloud_ai_cache_entries(tenant_id);
CREATE INDEX IF NOT EXISTS idx_ai_providers_tenant   ON cloud_ai_providers(tenant_id);

-- ─── 6. VPS & Dedicated Server Subsystem ───────────────────────

CREATE TABLE IF NOT EXISTS cloud_vps_instances (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id        TEXT NOT NULL,
  name             TEXT NOT NULL,
  hostname         TEXT NOT NULL,
  plan_name        TEXT NOT NULL,
  ip_address       TEXT NOT NULL,
  ipv6_address     TEXT,
  vcpu             INTEGER NOT NULL DEFAULT 2,
  ram_gb           INTEGER NOT NULL DEFAULT 4,
  storage_gb       INTEGER NOT NULL DEFAULT 80,
  bandwidth_tb     INTEGER NOT NULL DEFAULT 3,
  os               TEXT NOT NULL DEFAULT 'Ubuntu 24.04 LTS',
  location         TEXT NOT NULL DEFAULT 'Mumbai, India (BOM-01)',
  status           TEXT NOT NULL DEFAULT 'running' CHECK (status IN ('running', 'stopped', 'rebuilding', 'suspended')),
  cpu_usage_pct    NUMERIC(5, 2) NOT NULL DEFAULT 14.5,
  ram_usage_pct    NUMERIC(5, 2) NOT NULL DEFAULT 42.1,
  disk_usage_pct   NUMERIC(5, 2) NOT NULL DEFAULT 28.0,
  renewal_date     TIMESTAMPTZ NOT NULL DEFAULT (now() + INTERVAL '30 days'),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS cloud_vps_snapshots (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  instance_id      UUID NOT NULL REFERENCES cloud_vps_instances(id) ON DELETE CASCADE,
  tenant_id        TEXT NOT NULL,
  name             TEXT NOT NULL,
  size_gb          NUMERIC(8, 2) NOT NULL DEFAULT 5.4,
  status           TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed')),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_vps_tenant            ON cloud_vps_instances(tenant_id);
CREATE INDEX IF NOT EXISTS idx_vps_snapshots         ON cloud_vps_snapshots(instance_id);

-- ─── 7. Row Level Security & Access Policies ───────────────────

ALTER TABLE cloud_dns_zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE cloud_dns_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE cloud_workers ENABLE ROW LEVEL SECURITY;
ALTER TABLE cloud_worker_deployments ENABLE ROW LEVEL SECURITY;
ALTER TABLE cloud_worker_bindings ENABLE ROW LEVEL SECURITY;
ALTER TABLE cloud_worker_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE cloud_storage_buckets ENABLE ROW LEVEL SECURITY;
ALTER TABLE cloud_storage_objects ENABLE ROW LEVEL SECURITY;
ALTER TABLE cloud_s3_credentials ENABLE ROW LEVEL SECURITY;
ALTER TABLE cloud_security_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE cloud_ai_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE cloud_ai_cache_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE cloud_vps_instances ENABLE ROW LEVEL SECURITY;
ALTER TABLE cloud_vps_snapshots ENABLE ROW LEVEL SECURITY;

-- Admins full access policy template
CREATE POLICY "Admins full access dns_zones" ON cloud_dns_zones FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.user_id = auth.uid()));

CREATE POLICY "Tenants read own dns_zones" ON cloud_dns_zones FOR SELECT TO authenticated
  USING (tenant_id = auth.uid()::text);

CREATE POLICY "Tenants manage own dns_records" ON cloud_dns_records FOR ALL TO authenticated
  USING (tenant_id = auth.uid()::text);

CREATE POLICY "Tenants manage own workers" ON cloud_workers FOR ALL TO authenticated
  USING (tenant_id = auth.uid()::text);

CREATE POLICY "Tenants read own worker_logs" ON cloud_worker_logs FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM cloud_workers WHERE cloud_workers.id = cloud_worker_logs.worker_id AND cloud_workers.tenant_id = auth.uid()::text));

CREATE POLICY "Tenants manage own storage_buckets" ON cloud_storage_buckets FOR ALL TO authenticated
  USING (tenant_id = auth.uid()::text);

CREATE POLICY "Tenants manage own storage_objects" ON cloud_storage_objects FOR ALL TO authenticated
  USING (tenant_id = auth.uid()::text);

CREATE POLICY "Tenants manage own s3_credentials" ON cloud_s3_credentials FOR ALL TO authenticated
  USING (tenant_id = auth.uid()::text);

CREATE POLICY "Tenants manage own security_rules" ON cloud_security_rules FOR ALL TO authenticated
  USING (tenant_id = auth.uid()::text);

CREATE POLICY "Tenants manage own ai_providers" ON cloud_ai_providers FOR ALL TO authenticated
  USING (tenant_id = auth.uid()::text);

CREATE POLICY "Tenants manage own vps_instances" ON cloud_vps_instances FOR ALL TO authenticated
  USING (tenant_id = auth.uid()::text);


-- FILE: 20261107000000_add_razorpay_webhook_to_payment_settings.sql
-- Add Razorpay webhook secret to payment_settings table
ALTER TABLE payment_settings ADD COLUMN IF NOT EXISTS razorpay_webhook_secret TEXT;

-- Add razorpay_order_id to hosting_orders so we can match webhooks to orders
ALTER TABLE hosting_orders ADD COLUMN IF NOT EXISTS razorpay_order_id TEXT;

COMMENT ON COLUMN payment_settings.razorpay_webhook_secret IS 'Razorpay webhook signing secret from Razorpay dashboard';
COMMENT ON COLUMN hosting_orders.razorpay_order_id IS 'Razorpay order ID (rzp_order_xxx) for webhook matching';


-- FILE: 20261110010000_add_full_platform_tables.sql
-- ============================================================
-- Full Platform Schema Migration
-- VaultHost by ELSxGlobal — Complete Backend Infrastructure
-- Created: 2026-11-10
-- Tables: cloud_tunnels, cloud_containers, cloud_pages_projects,
--         cloud_deployments, cloud_kv_namespaces, cloud_kv_entries,
--         cloud_queues, api_keys, api_key_usage
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ─── 1. VaultTunnel Tunnels ──────────────────────────────────

CREATE TABLE IF NOT EXISTS cloud_tunnels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  subdomain TEXT NOT NULL UNIQUE,
  protocol TEXT NOT NULL DEFAULT 'http' CHECK (protocol IN ('http','https','tcp','udp')),
  local_port INTEGER,
  remote_port INTEGER,
  token TEXT NOT NULL DEFAULT encode(gen_random_bytes(32), 'hex'),
  status TEXT NOT NULL DEFAULT 'provisioning' CHECK (status IN ('online','offline','provisioning','error')),
  frpc_config TEXT, -- generated frpc.toml content
  public_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE cloud_tunnels ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE cloud_tunnels ADD COLUMN IF NOT EXISTS name TEXT;
ALTER TABLE cloud_tunnels ADD COLUMN IF NOT EXISTS subdomain TEXT;
ALTER TABLE cloud_tunnels ADD COLUMN IF NOT EXISTS protocol TEXT DEFAULT 'http';
ALTER TABLE cloud_tunnels ADD COLUMN IF NOT EXISTS local_port INTEGER;
ALTER TABLE cloud_tunnels ADD COLUMN IF NOT EXISTS remote_port INTEGER;
ALTER TABLE cloud_tunnels ADD COLUMN IF NOT EXISTS token TEXT DEFAULT encode(gen_random_bytes(32), 'hex');
ALTER TABLE cloud_tunnels ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'provisioning';
ALTER TABLE cloud_tunnels ADD COLUMN IF NOT EXISTS frpc_config TEXT;
ALTER TABLE cloud_tunnels ADD COLUMN IF NOT EXISTS public_url TEXT;
ALTER TABLE cloud_tunnels ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT now();
ALTER TABLE cloud_tunnels ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

-- ─── 2. VaultContainers Namespaces ───────────────────────────

CREATE TABLE IF NOT EXISTS cloud_containers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  namespace TEXT NOT NULL UNIQUE, -- k3s namespace name
  display_name TEXT NOT NULL,
  plan TEXT NOT NULL DEFAULT 'starter' CHECK (plan IN ('starter','pro','enterprise')),
  status TEXT NOT NULL DEFAULT 'provisioning' CHECK (status IN ('active','provisioning','suspended','deleted')),
  node_count INTEGER NOT NULL DEFAULT 1,
  cpu_limit TEXT NOT NULL DEFAULT '2',
  memory_limit TEXT NOT NULL DEFAULT '4Gi',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE cloud_containers ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE cloud_containers ADD COLUMN IF NOT EXISTS namespace TEXT;
ALTER TABLE cloud_containers ADD COLUMN IF NOT EXISTS display_name TEXT;
ALTER TABLE cloud_containers ADD COLUMN IF NOT EXISTS plan TEXT DEFAULT 'starter';
ALTER TABLE cloud_containers ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'provisioning';
ALTER TABLE cloud_containers ADD COLUMN IF NOT EXISTS node_count INTEGER DEFAULT 1;
ALTER TABLE cloud_containers ADD COLUMN IF NOT EXISTS cpu_limit TEXT DEFAULT '2';
ALTER TABLE cloud_containers ADD COLUMN IF NOT EXISTS memory_limit TEXT DEFAULT '4Gi';
ALTER TABLE cloud_containers ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT now();

-- ─── 3. VaultPages Projects ──────────────────────────────────

CREATE TABLE IF NOT EXISTS cloud_pages_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  git_repo TEXT NOT NULL,
  branch TEXT NOT NULL DEFAULT 'main',
  build_command TEXT DEFAULT 'npm run build',
  output_dir TEXT DEFAULT '.next',
  domain TEXT,
  coolify_project_id TEXT, -- external coolify UUID
  status TEXT NOT NULL DEFAULT 'idle' CHECK (status IN ('idle','building','deploying','live','error')),
  last_deploy_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE cloud_pages_projects ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE cloud_pages_projects ADD COLUMN IF NOT EXISTS name TEXT;
ALTER TABLE cloud_pages_projects ADD COLUMN IF NOT EXISTS git_repo TEXT;
ALTER TABLE cloud_pages_projects ADD COLUMN IF NOT EXISTS branch TEXT DEFAULT 'main';
ALTER TABLE cloud_pages_projects ADD COLUMN IF NOT EXISTS build_command TEXT DEFAULT 'npm run build';
ALTER TABLE cloud_pages_projects ADD COLUMN IF NOT EXISTS output_dir TEXT DEFAULT '.next';
ALTER TABLE cloud_pages_projects ADD COLUMN IF NOT EXISTS domain TEXT;
ALTER TABLE cloud_pages_projects ADD COLUMN IF NOT EXISTS coolify_project_id TEXT;
ALTER TABLE cloud_pages_projects ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'idle';
ALTER TABLE cloud_pages_projects ADD COLUMN IF NOT EXISTS last_deploy_at TIMESTAMPTZ;
ALTER TABLE cloud_pages_projects ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT now();

-- ─── 4. VaultPages Deployments ───────────────────────────────

CREATE TABLE IF NOT EXISTS cloud_deployments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES cloud_pages_projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'queued' CHECK (status IN ('queued','building','success','failed')),
  commit_sha TEXT,
  coolify_deployment_id TEXT,
  logs TEXT,
  started_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE cloud_deployments ADD COLUMN IF NOT EXISTS project_id UUID REFERENCES cloud_pages_projects(id) ON DELETE CASCADE;
ALTER TABLE cloud_deployments ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE cloud_deployments ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'queued';
ALTER TABLE cloud_deployments ADD COLUMN IF NOT EXISTS commit_sha TEXT;
ALTER TABLE cloud_deployments ADD COLUMN IF NOT EXISTS coolify_deployment_id TEXT;
ALTER TABLE cloud_deployments ADD COLUMN IF NOT EXISTS logs TEXT;
ALTER TABLE cloud_deployments ADD COLUMN IF NOT EXISTS started_at TIMESTAMPTZ DEFAULT now();
ALTER TABLE cloud_deployments ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ;
ALTER TABLE cloud_deployments ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT now();

-- ─── 5. VaultKV Namespaces ───────────────────────────────────

CREATE TABLE IF NOT EXISTS cloud_kv_namespaces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE cloud_kv_namespaces ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE cloud_kv_namespaces ADD COLUMN IF NOT EXISTS name TEXT;
ALTER TABLE cloud_kv_namespaces ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE cloud_kv_namespaces ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT now();

-- ─── 6. VaultKV Entries ──────────────────────────────────────

CREATE TABLE IF NOT EXISTS cloud_kv_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  namespace_id UUID NOT NULL REFERENCES cloud_kv_namespaces(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid(),
  key TEXT NOT NULL,
  value TEXT NOT NULL,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(namespace_id, key)
);

ALTER TABLE cloud_kv_entries ADD COLUMN IF NOT EXISTS namespace_id UUID REFERENCES cloud_kv_namespaces(id) ON DELETE CASCADE;
ALTER TABLE cloud_kv_entries ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid();
ALTER TABLE cloud_kv_entries ADD COLUMN IF NOT EXISTS key TEXT;
ALTER TABLE cloud_kv_entries ADD COLUMN IF NOT EXISTS value TEXT;
ALTER TABLE cloud_kv_entries ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ;
ALTER TABLE cloud_kv_entries ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT now();
ALTER TABLE cloud_kv_entries ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

-- ─── 7. VaultQueues ──────────────────────────────────────────

CREATE TABLE IF NOT EXISTS cloud_queues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  vhost TEXT NOT NULL DEFAULT '/',
  durable BOOLEAN NOT NULL DEFAULT true,
  max_length INTEGER,
  dlx_name TEXT, -- dead letter exchange
  rabbitmq_queue_name TEXT, -- actual name on RabbitMQ server
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','deleted','paused')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE cloud_queues ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE cloud_queues ADD COLUMN IF NOT EXISTS name TEXT;
ALTER TABLE cloud_queues ADD COLUMN IF NOT EXISTS vhost TEXT DEFAULT '/';
ALTER TABLE cloud_queues ADD COLUMN IF NOT EXISTS durable BOOLEAN DEFAULT true;
ALTER TABLE cloud_queues ADD COLUMN IF NOT EXISTS max_length INTEGER;
ALTER TABLE cloud_queues ADD COLUMN IF NOT EXISTS dlx_name TEXT;
ALTER TABLE cloud_queues ADD COLUMN IF NOT EXISTS rabbitmq_queue_name TEXT;
ALTER TABLE cloud_queues ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';
ALTER TABLE cloud_queues ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT now();

-- ─── 8. API Keys for Developer API ───────────────────────────

CREATE TABLE IF NOT EXISTS api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  key_hash TEXT NOT NULL DEFAULT encode(gen_random_bytes(32), 'hex') UNIQUE, -- sha256 of actual key
  key_prefix TEXT NOT NULL, -- first 8 chars: 'vh_live_'
  scopes TEXT[] NOT NULL DEFAULT ARRAY['dns:read','storage:read'],
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_used_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE api_keys ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE api_keys ADD COLUMN IF NOT EXISTS name TEXT;
ALTER TABLE api_keys ADD COLUMN IF NOT EXISTS key_hash TEXT DEFAULT encode(gen_random_bytes(32), 'hex');
ALTER TABLE api_keys ADD COLUMN IF NOT EXISTS key_prefix TEXT;
ALTER TABLE api_keys ADD COLUMN IF NOT EXISTS scopes TEXT[] DEFAULT ARRAY['dns:read','storage:read'];
ALTER TABLE api_keys ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE api_keys ADD COLUMN IF NOT EXISTS last_used_at TIMESTAMPTZ;
ALTER TABLE api_keys ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ;
ALTER TABLE api_keys ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT now();

-- ─── 9. API Key Usage Log ────────────────────────────────────

CREATE TABLE IF NOT EXISTS api_key_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  api_key_id UUID NOT NULL REFERENCES api_keys(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL,
  method TEXT NOT NULL,
  status_code INTEGER,
  ip_address TEXT,
  user_agent TEXT,
  response_ms INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE api_key_usage ADD COLUMN IF NOT EXISTS api_key_id UUID REFERENCES api_keys(id) ON DELETE CASCADE;
ALTER TABLE api_key_usage ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE api_key_usage ADD COLUMN IF NOT EXISTS endpoint TEXT;
ALTER TABLE api_key_usage ADD COLUMN IF NOT EXISTS method TEXT;
ALTER TABLE api_key_usage ADD COLUMN IF NOT EXISTS status_code INTEGER;
ALTER TABLE api_key_usage ADD COLUMN IF NOT EXISTS ip_address TEXT;
ALTER TABLE api_key_usage ADD COLUMN IF NOT EXISTS user_agent TEXT;
ALTER TABLE api_key_usage ADD COLUMN IF NOT EXISTS response_ms INTEGER;
ALTER TABLE api_key_usage ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT now();

-- ─── Trigger Function for updated_at ─────────────────────────

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_cloud_tunnels_updated_at ON cloud_tunnels;
CREATE TRIGGER tr_cloud_tunnels_updated_at
  BEFORE UPDATE ON cloud_tunnels
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS tr_cloud_kv_entries_updated_at ON cloud_kv_entries;
CREATE TRIGGER tr_cloud_kv_entries_updated_at
  BEFORE UPDATE ON cloud_kv_entries
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ─── Indexes ─────────────────────────────────────────────────

-- cloud_tunnels
CREATE INDEX IF NOT EXISTS idx_cloud_tunnels_user_id ON cloud_tunnels(user_id);
CREATE INDEX IF NOT EXISTS idx_cloud_tunnels_created_at ON cloud_tunnels(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_cloud_tunnels_subdomain ON cloud_tunnels(subdomain);
CREATE INDEX IF NOT EXISTS idx_cloud_tunnels_status ON cloud_tunnels(status);

-- cloud_containers
CREATE INDEX IF NOT EXISTS idx_cloud_containers_user_id ON cloud_containers(user_id);
CREATE INDEX IF NOT EXISTS idx_cloud_containers_created_at ON cloud_containers(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_cloud_containers_namespace ON cloud_containers(namespace);
CREATE INDEX IF NOT EXISTS idx_cloud_containers_status ON cloud_containers(status);

-- cloud_pages_projects
CREATE INDEX IF NOT EXISTS idx_cloud_pages_projects_user_id ON cloud_pages_projects(user_id);
CREATE INDEX IF NOT EXISTS idx_cloud_pages_projects_created_at ON cloud_pages_projects(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_cloud_pages_projects_status ON cloud_pages_projects(status);

-- cloud_deployments
CREATE INDEX IF NOT EXISTS idx_cloud_deployments_user_id ON cloud_deployments(user_id);
CREATE INDEX IF NOT EXISTS idx_cloud_deployments_created_at ON cloud_deployments(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_cloud_deployments_project_id ON cloud_deployments(project_id);
CREATE INDEX IF NOT EXISTS idx_cloud_deployments_status ON cloud_deployments(status);

-- cloud_kv_namespaces
CREATE INDEX IF NOT EXISTS idx_cloud_kv_namespaces_user_id ON cloud_kv_namespaces(user_id);
CREATE INDEX IF NOT EXISTS idx_cloud_kv_namespaces_created_at ON cloud_kv_namespaces(created_at DESC);

-- cloud_kv_entries
CREATE INDEX IF NOT EXISTS idx_cloud_kv_entries_user_id ON cloud_kv_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_cloud_kv_entries_created_at ON cloud_kv_entries(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_cloud_kv_entries_namespace_id ON cloud_kv_entries(namespace_id);
CREATE INDEX IF NOT EXISTS idx_cloud_kv_entries_key ON cloud_kv_entries(key);

-- cloud_queues
CREATE INDEX IF NOT EXISTS idx_cloud_queues_user_id ON cloud_queues(user_id);
CREATE INDEX IF NOT EXISTS idx_cloud_queues_created_at ON cloud_queues(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_cloud_queues_status ON cloud_queues(status);

-- api_keys
CREATE INDEX IF NOT EXISTS idx_api_keys_user_id ON api_keys(user_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_created_at ON api_keys(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_api_keys_hash ON api_keys(key_hash);
CREATE INDEX IF NOT EXISTS idx_api_keys_prefix ON api_keys(key_prefix);

-- api_key_usage
CREATE INDEX IF NOT EXISTS idx_api_key_usage_user_id ON api_key_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_api_key_usage_created_at ON api_key_usage(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_api_key_usage_api_key_id ON api_key_usage(api_key_id);

-- ─── Row Level Security & Access Policies ────────────────────

ALTER TABLE cloud_tunnels ENABLE ROW LEVEL SECURITY;
ALTER TABLE cloud_containers ENABLE ROW LEVEL SECURITY;
ALTER TABLE cloud_pages_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE cloud_deployments ENABLE ROW LEVEL SECURITY;
ALTER TABLE cloud_kv_namespaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE cloud_kv_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE cloud_queues ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_key_usage ENABLE ROW LEVEL SECURITY;

-- 1. cloud_tunnels
DROP POLICY IF EXISTS "Users can manage own cloud_tunnels" ON cloud_tunnels;
CREATE POLICY "Users can manage own cloud_tunnels" ON cloud_tunnels
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Service role bypass cloud_tunnels" ON cloud_tunnels;
CREATE POLICY "Service role bypass cloud_tunnels" ON cloud_tunnels
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);

-- 2. cloud_containers
DROP POLICY IF EXISTS "Users can manage own cloud_containers" ON cloud_containers;
CREATE POLICY "Users can manage own cloud_containers" ON cloud_containers
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Service role bypass cloud_containers" ON cloud_containers;
CREATE POLICY "Service role bypass cloud_containers" ON cloud_containers
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);

-- 3. cloud_pages_projects
DROP POLICY IF EXISTS "Users can manage own cloud_pages_projects" ON cloud_pages_projects;
CREATE POLICY "Users can manage own cloud_pages_projects" ON cloud_pages_projects
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Service role bypass cloud_pages_projects" ON cloud_pages_projects;
CREATE POLICY "Service role bypass cloud_pages_projects" ON cloud_pages_projects
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);

-- 4. cloud_deployments
DROP POLICY IF EXISTS "Users can manage own cloud_deployments" ON cloud_deployments;
CREATE POLICY "Users can manage own cloud_deployments" ON cloud_deployments
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Service role bypass cloud_deployments" ON cloud_deployments;
CREATE POLICY "Service role bypass cloud_deployments" ON cloud_deployments
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);

-- 5. cloud_kv_namespaces
DROP POLICY IF EXISTS "Users can manage own cloud_kv_namespaces" ON cloud_kv_namespaces;
CREATE POLICY "Users can manage own cloud_kv_namespaces" ON cloud_kv_namespaces
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Service role bypass cloud_kv_namespaces" ON cloud_kv_namespaces;
CREATE POLICY "Service role bypass cloud_kv_namespaces" ON cloud_kv_namespaces
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);

-- 6. cloud_kv_entries
DROP POLICY IF EXISTS "Users can manage own cloud_kv_entries" ON cloud_kv_entries;
CREATE POLICY "Users can manage own cloud_kv_entries" ON cloud_kv_entries
  FOR ALL TO authenticated
  USING (
    user_id = auth.uid() OR EXISTS (
      SELECT 1 FROM cloud_kv_namespaces n
      WHERE n.id = cloud_kv_entries.namespace_id
        AND n.user_id = auth.uid()
    )
  )
  WITH CHECK (
    user_id = auth.uid() OR EXISTS (
      SELECT 1 FROM cloud_kv_namespaces n
      WHERE n.id = cloud_kv_entries.namespace_id
        AND n.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Service role bypass cloud_kv_entries" ON cloud_kv_entries;
CREATE POLICY "Service role bypass cloud_kv_entries" ON cloud_kv_entries
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);

-- 7. cloud_queues
DROP POLICY IF EXISTS "Users can manage own cloud_queues" ON cloud_queues;
CREATE POLICY "Users can manage own cloud_queues" ON cloud_queues
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Service role bypass cloud_queues" ON cloud_queues;
CREATE POLICY "Service role bypass cloud_queues" ON cloud_queues
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);

-- 8. api_keys
DROP POLICY IF EXISTS "Users can manage own api_keys" ON api_keys;
CREATE POLICY "Users can manage own api_keys" ON api_keys
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Service role bypass api_keys" ON api_keys;
CREATE POLICY "Service role bypass api_keys" ON api_keys
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);

-- 9. api_key_usage
DROP POLICY IF EXISTS "Users can read own api_key_usage" ON api_key_usage;
CREATE POLICY "Users can read own api_key_usage" ON api_key_usage
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own api_key_usage" ON api_key_usage;
CREATE POLICY "Users can insert own api_key_usage" ON api_key_usage
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Service role bypass api_key_usage" ON api_key_usage;
CREATE POLICY "Service role bypass api_key_usage" ON api_key_usage
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);


-- FILE: 20261110020000_add_backend_settings_columns.sql
-- Add new backend configuration columns to provisioning_settings
ALTER TABLE provisioning_settings
  ADD COLUMN IF NOT EXISTS powerdns_url TEXT,
  ADD COLUMN IF NOT EXISTS powerdns_api_key TEXT,
  ADD COLUMN IF NOT EXISTS minio_endpoint TEXT,
  ADD COLUMN IF NOT EXISTS minio_access_key TEXT,
  ADD COLUMN IF NOT EXISTS minio_secret_key TEXT,
  ADD COLUMN IF NOT EXISTS litellm_base_url TEXT,
  ADD COLUMN IF NOT EXISTS litellm_master_key TEXT,
  ADD COLUMN IF NOT EXISTS frp_server_url TEXT,
  ADD COLUMN IF NOT EXISTS frp_server_token TEXT,
  ADD COLUMN IF NOT EXISTS frp_base_domain TEXT DEFAULT 'tunnel.vaulthost.cloud',
  ADD COLUMN IF NOT EXISTS rabbitmq_url TEXT,
  ADD COLUMN IF NOT EXISTS rabbitmq_management_url TEXT,
  ADD COLUMN IF NOT EXISTS rabbitmq_username TEXT,
  ADD COLUMN IF NOT EXISTS rabbitmq_password TEXT,
  ADD COLUMN IF NOT EXISTS coolify_base_url TEXT,
  ADD COLUMN IF NOT EXISTS coolify_api_key TEXT,
  ADD COLUMN IF NOT EXISTS namecheap_api_user TEXT,
  ADD COLUMN IF NOT EXISTS namecheap_api_key TEXT,
  ADD COLUMN IF NOT EXISTS namecheap_client_ip TEXT,
  ADD COLUMN IF NOT EXISTS namecheap_sandbox BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS workerd_api_url TEXT DEFAULT 'http://localhost:8787',
  ADD COLUMN IF NOT EXISTS k3s_api_url TEXT,
  ADD COLUMN IF NOT EXISTS k3s_bearer_token TEXT;


-- FILE: 20261112000000_add_cloud_product_plans.sql
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


-- FILE: 20261113000000_add_billing_control_plane.sql
-- ============================================================
-- VaultHost Billing Control Plane & Metering Infrastructure
-- Migration: 20261113000000_add_billing_control_plane.sql
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ─── 1. Usage Metering Table ─────────────────────────────────
CREATE TABLE IF NOT EXISTS usage_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  service_id UUID REFERENCES hosting_services(id) ON DELETE SET NULL,
  product_type TEXT NOT NULL, -- 'workers','storage','ai_tokens','bandwidth','containers' etc
  quantity NUMERIC NOT NULL,
  unit TEXT NOT NULL, -- 'requests','gb_hours','tokens','gb','pod_hours'
  unit_price_paise INTEGER NOT NULL, -- price per unit in paise (1 INR = 100 paise)
  amount_paise INTEGER NOT NULL, -- quantity * unit_price_paise
  billing_period_start TIMESTAMPTZ NOT NULL,
  billing_period_end TIMESTAMPTZ NOT NULL,
  invoiced BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── 2. Credit Ledger Table ──────────────────────────────────
CREATE TABLE IF NOT EXISTS credit_ledger (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount_paise INTEGER NOT NULL, -- positive = credit added, negative = credit used
  balance_after_paise INTEGER NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('topup','refund','promo','usage_deduction','adjustment')),
  description TEXT NOT NULL,
  reference_id TEXT, -- invoice_id or order_id
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── 3. Customer Credit Balance View / Table ─────────────────
CREATE TABLE IF NOT EXISTS credit_balances (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  balance_paise INTEGER NOT NULL DEFAULT 0,
  lifetime_credited_paise INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── 4. Subscriptions (Recurring Billing) ─────────────────────
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id TEXT NOT NULL REFERENCES hosting_plans(id),
  service_id UUID REFERENCES hosting_services(id),
  status TEXT NOT NULL DEFAULT 'trialing' CHECK (status IN ('trialing','active','past_due','paused','cancelled','expired')),
  billing_cycle TEXT NOT NULL DEFAULT 'monthly' CHECK (billing_cycle IN ('monthly','annual')),
  current_period_start TIMESTAMPTZ NOT NULL DEFAULT now(),
  current_period_end TIMESTAMPTZ NOT NULL DEFAULT (now() + INTERVAL '1 month'),
  trial_end TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN NOT NULL DEFAULT false,
  next_invoice_amount_paise INTEGER,
  razorpay_subscription_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── 5. Reseller Accounts ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS resellers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  margin_percent NUMERIC(5,2) NOT NULL DEFAULT 20.00, -- reseller margin
  credit_limit_paise INTEGER NOT NULL DEFAULT 1000000, -- 10,000 INR default credit limit
  balance_paise INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','suspended','pending')),
  gst_number TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── 6. Reseller Customers (Sub-accounts) ────────────────────
CREATE TABLE IF NOT EXISTS reseller_customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reseller_id UUID NOT NULL REFERENCES resellers(id) ON DELETE CASCADE,
  customer_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(reseller_id, customer_user_id)
);

-- ─── 7. Tax Records (GST for India) ──────────────────────────
CREATE TABLE IF NOT EXISTS tax_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id TEXT,
  user_id UUID NOT NULL,
  gst_number TEXT,
  cgst_paise INTEGER NOT NULL DEFAULT 0,
  sgst_paise INTEGER NOT NULL DEFAULT 0,
  igst_paise INTEGER NOT NULL DEFAULT 0,
  total_tax_paise INTEGER NOT NULL DEFAULT 0,
  tax_period TEXT NOT NULL, -- 'YYYY-MM'
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── 8. Service Quotas and Limits ────────────────────────────
CREATE TABLE IF NOT EXISTS service_quotas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_type TEXT NOT NULL,
  quota_limit NUMERIC NOT NULL,
  quota_used NUMERIC NOT NULL DEFAULT 0,
  unit TEXT NOT NULL,
  reset_period TEXT NOT NULL DEFAULT 'monthly',
  last_reset_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, product_type)
);

-- ─── 9. Foreign Key Verification for tax_records ─────────────
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'hosting_invoices' AND column_name = 'id' AND data_type = 'text'
  ) THEN
    ALTER TABLE tax_records ADD CONSTRAINT fk_tax_records_invoice FOREIGN KEY (invoice_id) REFERENCES hosting_invoices(id) ON DELETE SET NULL;
  END IF;
END $$;

-- ─── 10. Indexes for Performance & Partition Queries ─────────
CREATE INDEX IF NOT EXISTS idx_usage_records_user ON usage_records(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_records_period_start ON usage_records(billing_period_start);
CREATE INDEX IF NOT EXISTS idx_usage_records_created ON usage_records(created_at);
CREATE INDEX IF NOT EXISTS idx_usage_records_service ON usage_records(service_id);

CREATE INDEX IF NOT EXISTS idx_credit_ledger_user ON credit_ledger(user_id);
CREATE INDEX IF NOT EXISTS idx_credit_ledger_created ON credit_ledger(created_at);
CREATE INDEX IF NOT EXISTS idx_credit_ledger_ref ON credit_ledger(reference_id);

CREATE INDEX IF NOT EXISTS idx_credit_balances_user ON credit_balances(user_id);

CREATE INDEX IF NOT EXISTS idx_subscriptions_user ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_created ON subscriptions(created_at);
CREATE INDEX IF NOT EXISTS idx_subscriptions_plan ON subscriptions(plan_id);

CREATE INDEX IF NOT EXISTS idx_resellers_user ON resellers(user_id);
CREATE INDEX IF NOT EXISTS idx_resellers_status ON resellers(status);

CREATE INDEX IF NOT EXISTS idx_reseller_customers_reseller ON reseller_customers(reseller_id);
CREATE INDEX IF NOT EXISTS idx_reseller_customers_customer ON reseller_customers(customer_user_id);

CREATE INDEX IF NOT EXISTS idx_tax_records_user ON tax_records(user_id);
CREATE INDEX IF NOT EXISTS idx_tax_records_invoice ON tax_records(invoice_id);
CREATE INDEX IF NOT EXISTS idx_tax_records_period ON tax_records(tax_period);
CREATE INDEX IF NOT EXISTS idx_tax_records_created ON tax_records(created_at);

CREATE INDEX IF NOT EXISTS idx_service_quotas_user ON service_quotas(user_id);
CREATE INDEX IF NOT EXISTS idx_service_quotas_product ON service_quotas(product_type);

-- ─── 11. Security Helper Functions ───────────────────────────
CREATE OR REPLACE FUNCTION is_admin_user(p_uid UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM admin_users
    WHERE user_id = p_uid AND is_active = true
  );
$$;

CREATE OR REPLACE FUNCTION is_reseller_for_customer(p_reseller_uid UUID, p_customer_uid UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM reseller_customers rc
    JOIN resellers r ON rc.reseller_id = r.id
    WHERE r.user_id = p_reseller_uid AND rc.customer_user_id = p_customer_uid
  );
$$;

-- ─── 12. Row Level Security (RLS) ────────────────────────────

-- Enable RLS on all new tables
ALTER TABLE usage_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE resellers ENABLE ROW LEVEL SECURITY;
ALTER TABLE reseller_customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE tax_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_quotas ENABLE ROW LEVEL SECURITY;

-- 12.1. usage_records
DROP POLICY IF EXISTS "usage_records_select_policy" ON usage_records;
CREATE POLICY "usage_records_select_policy" ON usage_records
  FOR SELECT TO authenticated
  USING (
    user_id = auth.uid()
    OR is_admin_user(auth.uid())
    OR is_reseller_for_customer(auth.uid(), user_id)
  );

DROP POLICY IF EXISTS "usage_records_admin_all" ON usage_records;
CREATE POLICY "usage_records_admin_all" ON usage_records
  FOR ALL TO authenticated
  USING (is_admin_user(auth.uid()))
  WITH CHECK (is_admin_user(auth.uid()));

DROP POLICY IF EXISTS "usage_records_service_role" ON usage_records;
CREATE POLICY "usage_records_service_role" ON usage_records
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);

-- 12.2. credit_ledger
DROP POLICY IF EXISTS "credit_ledger_select_policy" ON credit_ledger;
CREATE POLICY "credit_ledger_select_policy" ON credit_ledger
  FOR SELECT TO authenticated
  USING (
    user_id = auth.uid()
    OR is_admin_user(auth.uid())
    OR is_reseller_for_customer(auth.uid(), user_id)
  );

DROP POLICY IF EXISTS "credit_ledger_admin_all" ON credit_ledger;
CREATE POLICY "credit_ledger_admin_all" ON credit_ledger
  FOR ALL TO authenticated
  USING (is_admin_user(auth.uid()))
  WITH CHECK (is_admin_user(auth.uid()));

DROP POLICY IF EXISTS "credit_ledger_service_role" ON credit_ledger;
CREATE POLICY "credit_ledger_service_role" ON credit_ledger
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);

-- 12.3. credit_balances
DROP POLICY IF EXISTS "credit_balances_select_policy" ON credit_balances;
CREATE POLICY "credit_balances_select_policy" ON credit_balances
  FOR SELECT TO authenticated
  USING (
    user_id = auth.uid()
    OR is_admin_user(auth.uid())
    OR is_reseller_for_customer(auth.uid(), user_id)
  );

DROP POLICY IF EXISTS "credit_balances_admin_all" ON credit_balances;
CREATE POLICY "credit_balances_admin_all" ON credit_balances
  FOR ALL TO authenticated
  USING (is_admin_user(auth.uid()))
  WITH CHECK (is_admin_user(auth.uid()));

DROP POLICY IF EXISTS "credit_balances_service_role" ON credit_balances;
CREATE POLICY "credit_balances_service_role" ON credit_balances
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);

-- 12.4. subscriptions
DROP POLICY IF EXISTS "subscriptions_select_policy" ON subscriptions;
CREATE POLICY "subscriptions_select_policy" ON subscriptions
  FOR SELECT TO authenticated
  USING (
    user_id = auth.uid()
    OR is_admin_user(auth.uid())
    OR is_reseller_for_customer(auth.uid(), user_id)
  );

DROP POLICY IF EXISTS "subscriptions_user_update" ON subscriptions;
CREATE POLICY "subscriptions_user_update" ON subscriptions
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "subscriptions_admin_all" ON subscriptions;
CREATE POLICY "subscriptions_admin_all" ON subscriptions
  FOR ALL TO authenticated
  USING (is_admin_user(auth.uid()))
  WITH CHECK (is_admin_user(auth.uid()));

DROP POLICY IF EXISTS "subscriptions_service_role" ON subscriptions;
CREATE POLICY "subscriptions_service_role" ON subscriptions
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);

-- 12.5. resellers
DROP POLICY IF EXISTS "resellers_select_policy" ON resellers;
CREATE POLICY "resellers_select_policy" ON resellers
  FOR SELECT TO authenticated
  USING (
    user_id = auth.uid()
    OR is_admin_user(auth.uid())
  );

DROP POLICY IF EXISTS "resellers_admin_all" ON resellers;
CREATE POLICY "resellers_admin_all" ON resellers
  FOR ALL TO authenticated
  USING (is_admin_user(auth.uid()))
  WITH CHECK (is_admin_user(auth.uid()));

DROP POLICY IF EXISTS "resellers_service_role" ON resellers;
CREATE POLICY "resellers_service_role" ON resellers
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);

-- 12.6. reseller_customers
DROP POLICY IF EXISTS "reseller_customers_select_policy" ON reseller_customers;
CREATE POLICY "reseller_customers_select_policy" ON reseller_customers
  FOR SELECT TO authenticated
  USING (
    customer_user_id = auth.uid()
    OR EXISTS (SELECT 1 FROM resellers r WHERE r.id = reseller_customers.reseller_id AND r.user_id = auth.uid())
    OR is_admin_user(auth.uid())
  );

DROP POLICY IF EXISTS "reseller_customers_admin_all" ON reseller_customers;
CREATE POLICY "reseller_customers_admin_all" ON reseller_customers
  FOR ALL TO authenticated
  USING (is_admin_user(auth.uid()))
  WITH CHECK (is_admin_user(auth.uid()));

DROP POLICY IF EXISTS "reseller_customers_service_role" ON reseller_customers;
CREATE POLICY "reseller_customers_service_role" ON reseller_customers
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);

-- 12.7. tax_records
DROP POLICY IF EXISTS "tax_records_select_policy" ON tax_records;
CREATE POLICY "tax_records_select_policy" ON tax_records
  FOR SELECT TO authenticated
  USING (
    user_id = auth.uid()
    OR is_admin_user(auth.uid())
    OR is_reseller_for_customer(auth.uid(), user_id)
  );

DROP POLICY IF EXISTS "tax_records_admin_all" ON tax_records;
CREATE POLICY "tax_records_admin_all" ON tax_records
  FOR ALL TO authenticated
  USING (is_admin_user(auth.uid()))
  WITH CHECK (is_admin_user(auth.uid()));

DROP POLICY IF EXISTS "tax_records_service_role" ON tax_records;
CREATE POLICY "tax_records_service_role" ON tax_records
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);

-- 12.8. service_quotas
DROP POLICY IF EXISTS "service_quotas_select_policy" ON service_quotas;
CREATE POLICY "service_quotas_select_policy" ON service_quotas
  FOR SELECT TO authenticated
  USING (
    user_id = auth.uid()
    OR is_admin_user(auth.uid())
    OR is_reseller_for_customer(auth.uid(), user_id)
  );

DROP POLICY IF EXISTS "service_quotas_admin_all" ON service_quotas;
CREATE POLICY "service_quotas_admin_all" ON service_quotas
  FOR ALL TO authenticated
  USING (is_admin_user(auth.uid()))
  WITH CHECK (is_admin_user(auth.uid()));

DROP POLICY IF EXISTS "service_quotas_service_role" ON service_quotas;
CREATE POLICY "service_quotas_service_role" ON service_quotas
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);


