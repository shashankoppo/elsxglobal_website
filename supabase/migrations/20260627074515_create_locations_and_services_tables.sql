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
