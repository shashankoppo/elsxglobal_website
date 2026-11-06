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
