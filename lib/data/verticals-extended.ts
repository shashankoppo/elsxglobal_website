import {
  HeartPulse, Banknote, ShoppingBag, Truck, Factory,
  ShieldCheck, Lock, Database, Cloud, Eye, Zap, Cpu,
  type LucideIcon,
} from 'lucide-react';

export interface VerticalData {
  slug: string;
  title: string;
  metaTitle: string;
  metaDescription: string;
  keywords: string[];
  canonical: string;
  eyebrow: string;
  heroTitle: string;
  heroDescription: string;
  compliance: string[];
  challenges: string[];
  solutions: { icon: LucideIcon; title: string; desc: string }[];
  results: { metric: string; label: string }[];
  faqs: { question: string; answer: string }[];
  serviceSchemaName: string;
  serviceSchemaDescription: string;
  category: string;
}

export const verticalsData: Record<string, VerticalData> = {
  'healthcare-pharma': {
    slug: 'healthcare-pharma',
    title: 'Healthcare & Pharmaceutical Technology',
    metaTitle: 'Healthcare & Pharma Software India — HIPAA-Compliant Health Apps | ELSxGlobal',
    metaDescription: 'HIPAA/Data secure health apps and complex, highly compliant medical tracking suites. EMR, telemedicine, clinical trials, and pharma compliance software.',
    keywords: ['healthcare software India', 'HIPAA compliant apps', 'pharma software Mumbai', 'EMR India', 'telemedicine platform', 'clinical trial software', 'medical tracking system', 'healthcare compliance India'],
    canonical: 'https://elsxglobal.com/industries/healthcare-pharma/',
    eyebrow: 'Healthcare & Pharma',
    heroTitle: 'HIPAA/Data Secure Health Apps',
    heroDescription: 'Complex, highly compliant medical tracking suites. From EMR and telemedicine to clinical trial management — built to HIPAA, FDA, and CDSCO standards.',
    compliance: ['HIPAA', 'FDA 21 CFR Part 11', 'CDSCO', 'GDPR', 'ISO 13485', 'NABH'],
    challenges: [
      'Strict regulatory compliance (HIPAA, FDA, CDSCO) requirements',
      'Fragmented patient data across hospitals, labs, and pharmacies',
      'Need for secure telemedicine and remote patient monitoring',
      'Clinical trial data integrity and audit trails',
      'Interoperability with existing hospital systems (HL7, FHIR)',
    ],
    solutions: [
      { icon: HeartPulse, title: 'EMR & EHR Systems', desc: 'Electronic Medical Records with HL7 FHIR interoperability, e-prescriptions, and clinical decision support.' },
      { icon: Eye, title: 'Telemedicine Platforms', desc: 'HIPAA-compliant video consultations, e-prescriptions, and remote patient monitoring with IoT devices.' },
      { icon: Database, title: 'Clinical Trial Management', desc: '21 CFR Part 11 compliant CTMS with eCRF, randomization, pharmacovigilance, and audit trails.' },
      { icon: ShieldCheck, title: 'Pharma Compliance Suite', desc: 'Drug safety, adverse event reporting, and regulatory submission management for pharma companies.' },
      { icon: Cloud, title: 'Health Data Exchange', desc: 'Secure HIE platform connecting hospitals, labs, pharmacies, and insurance with FHIR APIs.' },
      { icon: Cpu, title: 'Medical AI', desc: 'AI-assisted diagnosis from medical imaging, drug discovery ML, and clinical NLP for notes.' },
    ],
    results: [
      { metric: '60%', label: 'Faster Diagnosis' },
      { metric: '40%', label: 'Admin Cost Reduction' },
      { metric: '99.9%', label: 'Compliance Score' },
      { metric: '3x', label: 'Patient Throughput' },
    ],
    faqs: [
      { question: 'Are your healthcare apps HIPAA compliant?', answer: 'Yes. All our healthcare applications are built to HIPAA standards — encrypted data at rest and in transit, role-based access, audit logging, and BAA agreements. We also support FDA 21 CFR Part 11 for clinical trials.' },
      { question: 'Do you integrate with existing hospital systems?', answer: 'Yes. We support HL7 v2, FHIR R4, DICOM, and ICD-10/ICD-11 standards. We integrate with Epic, Cerner, Allscripts, and custom hospital management systems.' },
      { question: 'Can you build telemedicine platforms?', answer: 'Yes. We build HIPAA-compliant telemedicine platforms with video consultations, e-prescriptions, remote monitoring, and integration with EMR and pharmacy systems.' },
      { question: 'Do you support clinical trial software?', answer: 'Yes. We build CTMS, eTMF, ePRO, and pharmacovigilance systems compliant with FDA 21 CFR Part 11, EMA, and CDSCO regulations. We provide audit trails, electronic signatures, and data integrity controls.' },
    ],
    serviceSchemaName: 'Healthcare & Pharmaceutical Technology',
    serviceSchemaDescription: 'HIPAA-compliant health apps, EMR, telemedicine, clinical trial management, and pharma compliance software.',
    category: 'Healthcare Technology',
  },
  'fintech-banking': {
    slug: 'fintech-banking',
    title: 'Fintech & Banking Technology',
    metaTitle: 'Fintech & Banking Software India — PCI-DSS Transaction Architecture | ELSxGlobal',
    metaDescription: 'PCI-DSS transaction architectures and secure ledgering systems. Core banking, payment processing, digital wallets, and regulatory compliance.',
    keywords: ['fintech software India', 'banking software Mumbai', 'PCI-DSS compliance', 'payment processing India', 'digital wallet', 'core banking system', 'regulatory compliance fintech', 'secure ledgering'],
    canonical: 'https://elsxglobal.com/industries/fintech-banking/',
    eyebrow: 'Fintech & Banking',
    heroTitle: 'PCI-DSS Transaction Architectures',
    heroDescription: 'Secure ledgering systems and payment processing platforms. From core banking to digital wallets — built to PCI-DSS, RBI, and SEBI standards.',
    compliance: ['PCI-DSS Level 1', 'RBI Guidelines', 'SEBI', 'GDPR', 'ISO 27001', 'SOC 2 Type II'],
    challenges: [
      'PCI-DSS compliance for payment processing systems',
      'Real-time fraud detection and prevention',
      'Core banking system modernization and integration',
      'Regulatory reporting (RBI, SEBI, GST) automation',
      'High-availability requirements (99.999% uptime)',
    ],
    solutions: [
      { icon: Banknote, title: 'Core Banking Systems', desc: 'Core banking with account management, ledger, interest calculation, and multi-currency support.' },
      { icon: Lock, title: 'Payment Processing', desc: 'PCI-DSS compliant payment gateway with UPI, cards, net banking, and international payments.' },
      { icon: ShieldCheck, title: 'Fraud Detection AI', desc: 'Real-time ML fraud detection with behavioral analysis, velocity checks, and risk scoring.' },
      { icon: Database, title: 'Digital Wallet', desc: 'Mobile wallet with P2P transfers, bill payments, QR codes, and loyalty programs.' },
      { icon: Cloud, title: 'Regulatory Reporting', desc: 'Automated RBI, SEBI, and GST reporting with audit trails and data lineage.' },
      { icon: Zap, title: 'API Banking', desc: 'Open banking APIs (Account Aggregator, BBPS) for third-party fintech integration.' },
    ],
    results: [
      { metric: '99.999%', label: 'Uptime' },
      { metric: '< 100ms', label: 'Transaction Latency' },
      { metric: '90%', label: 'Fraud Detection Rate' },
      { metric: '50%', label: 'Cost Reduction' },
    ],
    faqs: [
      { question: 'Are your fintech solutions PCI-DSS compliant?', answer: 'Yes. We build payment systems to PCI-DSS Level 1 standards — tokenization, encryption, secure key management, and quarterly ASV scans. We also handle SAQ-D documentation.' },
      { question: 'Do you support RBI regulatory compliance?', answer: 'Yes. We implement RBI guidelines for data localization, KYC, AML, CTF, and regulatory reporting. Our systems generate RBI-compliant reports automatically.' },
      { question: 'Can you integrate with UPI and BBPS?', answer: 'Yes. We integrate with NPCI UPI, BBPS, IMPS, NEFT, RTGS, and Account Aggregator framework. We are a licensed TPP for Account Aggregator APIs.' },
      { question: 'How do you ensure high availability?', answer: 'We architect for 99.999% uptime with multi-AZ deployment, active-active clustering, automated failover, and chaos engineering. Our SLA includes service credits for any downtime.' },
    ],
    serviceSchemaName: 'Fintech & Banking Technology',
    serviceSchemaDescription: 'PCI-DSS compliant banking, payment processing, digital wallet, and regulatory reporting systems.',
    category: 'Fintech Technology',
  },
  'e-commerce-retail': {
    slug: 'e-commerce-retail',
    title: 'E-commerce & Retail Technology',
    metaTitle: 'E-commerce & Retail Software India — Headless Commerce Engines | ELSxGlobal',
    metaDescription: 'Headless commerce engines and high-speed product catalogs. Omnichannel retail, POS, inventory, and customer engagement platforms.',
    keywords: ['e-commerce software India', 'headless commerce Mumbai', 'retail technology', 'POS system India', 'inventory management', 'omnichannel commerce', 'product catalog software', 'retail customer engagement'],
    canonical: 'https://elsxglobal.com/industries/e-commerce-retail/',
    eyebrow: 'E-commerce & Retail',
    heroTitle: 'Headless Commerce Engines',
    heroDescription: 'High-speed product catalogs and omnichannel commerce platforms. From headless e-commerce to POS and inventory — built for retail at scale.',
    compliance: ['PCI-DSS', 'GDPR', 'GST Compliance', 'Consumer Protection Act'],
    challenges: [
      'Slow page load times reducing conversion rates',
      'Inventory sync across online and offline channels',
      'Personalization at scale for millions of customers',
      'High-traffic flash sale handling without downtime',
      'Multi-vendor marketplace complexity',
    ],
    solutions: [
      { icon: ShoppingBag, title: 'Headless Commerce', desc: 'Headless commerce engine with GraphQL API, Next.js storefront, and 100ms page loads.' },
      { icon: Database, title: 'Product Catalog', desc: 'Elasticsearch-powered catalog with faceted search, filters, and 10M+ SKU handling.' },
      { icon: Cloud, title: 'Omnichannel POS', desc: 'Unified POS for online and offline — inventory, orders, and customer data synced in real-time.' },
      { icon: Zap, title: 'Flash Sale Engine', desc: 'Queue-based flash sale handling that processes 100K+ orders/minute without downtime.' },
      { icon: Eye, title: 'Personalization AI', desc: 'ML-powered product recommendations, dynamic pricing, and personalized search results.' },
      { icon: ShieldCheck, title: 'Multi-Vendor Marketplace', desc: 'Vendor onboarding, commission management, split payments, and vendor dashboards.' },
    ],
    results: [
      { metric: '2.5x', label: 'Conversion Increase' },
      { metric: '100ms', label: 'Page Load Time' },
      { metric: '100K/min', label: 'Order Throughput' },
      { metric: '99.99%', label: 'Uptime' },
    ],
    faqs: [
      { question: 'What is headless commerce?', answer: 'Headless commerce separates the frontend (storefront) from the backend (commerce engine). This allows you to build fast, custom storefronts with Next.js, React, or mobile apps while the commerce API handles catalog, cart, checkout, and payments.' },
      { question: 'Can you handle flash sales and high traffic?', answer: 'Yes. Our flash sale engine uses queue-based ordering, auto-scaling, and CDN caching to handle 100K+ orders per minute. We have successfully run flash sales for brands with 10M+ concurrent users.' },
      { question: 'Do you integrate with POS and ERP systems?', answer: 'Yes. We integrate with Shopify POS, Lightspeed, SAP, Odoo, Tally, and custom POS/ERP systems. Inventory, orders, and customer data sync in real-time across all channels.' },
      { question: 'Can you build a multi-vendor marketplace?', answer: 'Yes. We build multi-vendor marketplaces with vendor onboarding, product management, commission rules, split payments, vendor dashboards, and vendor settlement.' },
    ],
    serviceSchemaName: 'E-commerce & Retail Technology',
    serviceSchemaDescription: 'Headless commerce engines, omnichannel POS, inventory management, and high-speed product catalogs.',
    category: 'Retail Technology',
  },
  'logistics-supply-chain': {
    slug: 'logistics-supply-chain',
    title: 'Logistics & Supply Chain Technology',
    metaTitle: 'Logistics Software India — Fleet & Warehouse Optimization | ELSxGlobal',
    metaDescription: 'Fleet and warehouse optimization with inventory flow solutions. TMS, WMS, route optimization, real-time tracking, and supply chain analytics.',
    keywords: ['logistics software India', 'fleet management Mumbai', 'warehouse management system', 'TMS India', 'WMS software', 'route optimization', 'supply chain analytics', 'freight tracking India'],
    canonical: 'https://elsxglobal.com/industries/logistics-supply-chain/',
    eyebrow: 'Logistics & Supply Chain',
    heroTitle: 'Fleet & Warehouse Optimization',
    heroDescription: 'Inventory flow solutions for logistics and supply chain. TMS, WMS, route optimization, real-time tracking, and predictive supply chain analytics.',
    compliance: ['E-way Bill', 'GST', 'DGCA (Drones)', 'AAR/CMVR'],
    challenges: [
      'Inefficient route planning causing fuel waste and delays',
      'Lack of real-time visibility into shipment status',
      'Warehouse inventory accuracy and picking efficiency',
      'Demand forecasting and inventory optimization',
      'Integration with e-commerce, ERP, and logistics partners',
    ],
    solutions: [
      { icon: Truck, title: 'Fleet Management', desc: 'GPS tracking, fuel monitoring, driver behavior analytics, and predictive maintenance for fleets.' },
      { icon: Zap, title: 'Route Optimization AI', desc: 'ML-powered routing that considers traffic, weather, vehicle capacity, and delivery windows — 25% fuel savings.' },
      { icon: Database, title: 'Warehouse Management', desc: 'WMS with barcode/RFID scanning, wave picking, slot optimization, and cycle counting.' },
      { icon: Eye, title: 'Real-Time Tracking', desc: 'End-to-end shipment visibility with geofencing, ETA prediction, and customer notifications.' },
      { icon: Cloud, title: 'TMS Integration', desc: 'Transportation Management System with carrier selection, freight auditing, and document automation.' },
      { icon: Cpu, title: 'Supply Chain Analytics', desc: 'Demand forecasting, inventory optimization, and supplier performance analytics with ML.' },
    ],
    results: [
      { metric: '25%', label: 'Fuel Cost Reduction' },
      { metric: '40%', label: 'Faster Dispatch' },
      { metric: '99%', label: 'Tracking Accuracy' },
      { metric: '30%', label: 'Warehouse Efficiency' },
    ],
    faqs: [
      { question: 'Can you track shipments in real-time?', answer: 'Yes. We provide real-time GPS tracking with geofencing, ETA prediction, and automated customer notifications via SMS, email, and WhatsApp.' },
      { question: 'Does your route optimization handle multi-stop routes?', answer: 'Yes. Our ML-powered route optimization handles multi-stop, multi-vehicle routes with constraints for capacity, time windows, driver hours, and vehicle types. We use OR-Tools and custom algorithms.' },
      { question: 'Can you integrate with our existing WMS/ERP?', answer: 'Yes. We integrate with SAP, Oracle, Odoo, Manhattan, Blue Yonder, and custom WMS/ERP systems via REST APIs, EDI, and webhooks.' },
      { question: 'Do you support e-way bill and GST compliance?', answer: 'Yes. We integrate with the NIC e-way bill portal for automatic e-way bill generation, GST calculation, and transport document management.' },
    ],
    serviceSchemaName: 'Logistics & Supply Chain Technology',
    serviceSchemaDescription: 'Fleet management, warehouse optimization, route optimization, and real-time tracking for logistics.',
    category: 'Logistics Technology',
  },
  'manufacturing-iot': {
    slug: 'manufacturing-iot',
    title: 'Manufacturing & IoT Technology',
    metaTitle: 'Manufacturing IoT India — Shop Floor Telemetry & MES | ELSxGlobal',
    metaDescription: 'IoT telemetry integrations and shop floor execution data systems. Smart factory, OEE monitoring, MES, and Industry 4.0 solutions.',
    keywords: ['manufacturing IoT India', 'smart factory Mumbai', 'Industry 4.0 India', 'OEE monitoring', 'MES software', 'shop floor data', 'IoT telemetry', 'manufacturing execution system'],
    canonical: 'https://elsxglobal.com/industries/manufacturing-iot/',
    eyebrow: 'Manufacturing & IoT',
    heroTitle: 'IoT Telemetry Integrations',
    heroDescription: 'Shop floor execution data systems and smart factory solutions. OEE monitoring, MES, predictive maintenance, and Industry 4.0 for manufacturers.',
    compliance: ['ISA-95', 'IEC 62443', 'ISO 9001', 'GMP'],
    challenges: [
      'Disconnected shop floor machines and IT systems',
      'Lack of real-time OEE (Overall Equipment Effectiveness) visibility',
      'Unplanned downtime and reactive maintenance',
      'Quality control and traceability across production lines',
      'Energy management and sustainability reporting',
    ],
    solutions: [
      { icon: Factory, title: 'IoT Telemetry', desc: 'Connect PLCs, sensors, and machines to collect real-time telemetry — temperature, vibration, output, energy.' },
      { icon: Eye, title: 'OEE Dashboard', desc: 'Real-time OEE monitoring with availability, performance, and quality metrics per machine, line, and plant.' },
      { icon: Database, title: 'MES Platform', desc: 'Manufacturing Execution System with production scheduling, work orders, BOM management, and traceability.' },
      { icon: Cpu, title: 'Predictive Maintenance', desc: 'ML models predict equipment failures from sensor data — schedule maintenance before breakdowns.' },
      { icon: ShieldCheck, title: 'Quality Control AI', desc: 'Computer vision for automated defect detection on production lines — 99%+ accuracy.' },
      { icon: Cloud, title: 'Energy Management', desc: 'Monitor and optimize energy consumption per machine and line — 20%+ energy savings.' },
    ],
    results: [
      { metric: '40%', label: 'Efficiency Improvement' },
      { metric: '50%', label: 'Downtime Reduction' },
      { metric: '99%', label: 'Quality Inspection' },
      { metric: '20%', label: 'Energy Savings' },
    ],
    faqs: [
      { question: 'Can you connect to our existing PLCs and machines?', answer: 'Yes. We support OPC-UA, Modbus, MQTT, Profinet, and custom protocols. We connect to Siemens, Allen-Bradley, Mitsubishi, Schneider, and custom PLCs.' },
      { question: 'What is OEE and why is it important?', answer: 'OEE (Overall Equipment Effectiveness) measures availability × performance × quality. World-class OEE is 85+. Most manufacturers operate at 60-70 OEE. Our solutions help you identify and close the gap.' },
      { question: 'How does predictive maintenance work?', answer: 'We collect sensor data (vibration, temperature, current) from machines, train ML models on failure patterns, and predict failures before they happen. This reduces unplanned downtime by 50% and maintenance costs by 30%.' },
      { question: 'Do you support Industry 4.0 and smart factory initiatives?', answer: 'Yes. We build complete Industry 4.0 solutions — IoT data collection, edge computing, real-time analytics, digital twins, and MES integration. We follow ISA-95 and IEC 62443 standards.' },
    ],
    serviceSchemaName: 'Manufacturing & IoT Technology',
    serviceSchemaDescription: 'IoT telemetry, OEE monitoring, MES, predictive maintenance, and smart factory solutions for manufacturers.',
    category: 'Manufacturing Technology',
  },
};

export const hyperLocalData: Record<string, {
  slug: string;
  city: string;
  state: string;
  metaTitle: string;
  metaDescription: string;
  keywords: string[];
  canonical: string;
  eyebrow: string;
  heroTitle: string;
  heroDescription: string;
  techParks: string[];
  specializations: string[];
  localBusinessInfo: {
    address: string;
    city: string;
    state: string;
    phone: string;
    latitude: string;
    longitude: string;
  };
}> = {
  pune: {
    slug: 'pune',
    city: 'Pune',
    state: 'Maharashtra',
    metaTitle: 'Software Development Company Pune — IT Services Hinjawadi & Magarpatta | ELSxGlobal',
    metaDescription: 'Pune regional IT node with localized focus on Hinjawadi and Magarpatta tech parks. Custom software, ERP, AI, and cloud services for Pune enterprises.',
    keywords: ['software development company Pune', 'IT company Pune', 'Hinjawadi software company', 'Magarpatta IT services', 'Pune tech solutions', 'Pune software development', 'Pune IT services', 'Maharashtra software company'],
    canonical: 'https://elsxglobal.com/locations/pune/',
    eyebrow: 'Pune · Maharashtra',
    heroTitle: 'Pune Regional IT Node',
    heroDescription: 'Localized focus on Hinjawadi and Magarpatta tech parks. Enterprise software, AI, cloud, and digital transformation for Pune-based businesses.',
    techParks: ['Hinjawadi IT Park (Rajiv Gandhi Infotech Park)', 'Magarpatta City', 'EON IT Park (Kharadi)', 'World Trade Center Pune', 'Cerebrum IT Park'],
    specializations: [
      'Automotive and manufacturing ERP for Pune auto cluster',
      'SaaS platform development for Pune IT startups',
      'Cloud migration for Hinjawadi-based IT companies',
      'AI and ML solutions for Pune automotive R&D',
    ],
    localBusinessInfo: {
      address: 'Hinjawadi, Pune',
      city: 'Pune',
      state: 'Maharashtra',
      phone: '+91-72475-58873',
      latitude: '18.5912',
      longitude: '73.7389',
    },
  },
  gurgaon: {
    slug: 'gurgaon',
    city: 'Gurgaon',
    state: 'Haryana',
    metaTitle: 'Software Development Company Gurgaon — Cyber City Enterprise Hub | ELSxGlobal',
    metaDescription: 'Gurgaon enterprise hub with B2B technical delivery frameworks for the Cyber City corridor. Custom software, ERP, and cloud services for Gurgaon businesses.',
    keywords: ['software development company Gurgaon', 'IT company Gurgaon', 'Cyber City software', 'Gurgaon tech solutions', 'Gurgaon IT services', 'Haryana software company', 'Gurgaon enterprise software', 'DLF Cyber City IT'],
    canonical: 'https://elsxglobal.com/locations/gurgaon/',
    eyebrow: 'Gurgaon · Haryana',
    heroTitle: 'Gurgaon Enterprise Hub',
    heroDescription: 'B2B technical delivery frameworks for the Cyber City corridor. Enterprise software, ERP, cloud, and AI for Gurgaon-based corporations.',
    techParks: ['DLF Cyber City', 'Cyber Hub Gurgaon', 'Unitech Cyber Park', 'World Trade Center Gurgaon', 'Vatika Mindspace'],
    specializations: [
      'Enterprise software for MNCs in DLF Cyber City',
      'ERP and CRM for Gurgaon-based startups and SMEs',
      'Cloud infrastructure for Gurgaon fintech companies',
      'AI and data analytics for Gurgaon e-commerce',
    ],
    localBusinessInfo: {
      address: 'DLF Cyber City, Gurgaon',
      city: 'Gurgaon',
      state: 'Haryana',
      phone: '+91-72475-58873',
      latitude: '28.4949',
      longitude: '77.0890',
    },
  },
  noida: {
    slug: 'noida',
    city: 'Noida',
    state: 'Uttar Pradesh',
    metaTitle: 'Software Development Company Noida — Sector 62 Tech Hub | ELSxGlobal',
    metaDescription: 'Noida software development center with digital delivery systems optimized for Sector 62 tech hubs. Custom software, AI, and cloud services for Noida.',
    keywords: ['software development company Noida', 'IT company Noida', 'Sector 62 software', 'Noida tech solutions', 'Noida IT services', 'UP software company', 'Noida enterprise software', 'Noida digital delivery'],
    canonical: 'https://elsxglobal.com/locations/noida/',
    eyebrow: 'Noida · Uttar Pradesh',
    heroTitle: 'Noida Software Development Center',
    heroDescription: 'Digital delivery systems optimized for Sector 62 tech hubs. Enterprise software, AI, cloud, and digital transformation for Noida-based companies.',
    techParks: ['Sector 62 IT Hub', 'World Trade Center Noida', 'Stellar IT Park', 'Logix Techno Park', 'Unitech Business Park'],
    specializations: [
      'Custom software for Noida IT and BPO companies',
      'Mobile app development for Noida startups',
      'Cloud and DevOps for Sector 62 tech companies',
      'AI and ML solutions for Noida e-commerce and education',
    ],
    localBusinessInfo: {
      address: 'Sector 62, Noida',
      city: 'Noida',
      state: 'Uttar Pradesh',
      phone: '+91-72475-58873',
      latitude: '28.6258',
      longitude: '77.3715',
    },
  },
};
