import { Metadata } from 'next';

const BASE_URL = 'https://elsxglobal.com';
const PARENT_URL = 'https://evolucentsphere.com';

export const parentOrganization = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'EvolucentSphere Pvt. Ltd.',
  alternateName: 'EvolucentSphere',
  url: PARENT_URL,
  logo: `${PARENT_URL}/logo.png`,
  description: 'India\'s premier technology conglomerate delivering AI-driven BPO, KPO, IT services, and consultancy solutions globally. Founded in 2020, headquartered in Jabalpur, Madhya Pradesh. ₹120Cr valuation, 200+ experts, 100+ enterprise clients.',
  foundingDate: '2020',
  founder: [
    { '@type': 'Person', name: 'Harsh Raj Patel', jobTitle: 'Co-Founder & CEO' },
    { '@type': 'Person', name: 'Shashank Patel', jobTitle: 'Co-Founder & CTO' },
  ],
  contactPoint: {
    '@type': 'ContactPoint',
    telephone: '+91-72475-58873',
    contactType: 'customer service',
    email: 'contact@evolucentsphere.com',
    areaServed: 'Worldwide',
    availableLanguage: ['English', 'Hindi'],
  },
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'Jabalpur, Madhya Pradesh',
    addressLocality: 'Jabalpur',
    addressRegion: 'Madhya Pradesh',
    addressCountry: 'IN',
  },
  sameAs: [
    'https://linkedin.com/company/elsxglobal',
    'https://twitter.com/elsxglobal',
    'https://www.instagram.com/elsxglobal',
    'https://elsxglobal.wordpress.com',
    'https://elsxtech.blogspot.com',
  ],
  areaServed: ['IN', 'US', 'GB', 'AE', 'SG', 'AU', 'CA', 'DE', 'RU'],
  industry: 'Information Technology and Services',
  numberOfEmployees: { '@type': 'QuantitativeValue', value: '201-500' },
};

export const defaultOrganization = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'ELSxGlobal',
  alternateName: 'EvolucentSphere Global',
  url: BASE_URL,
  logo: `${BASE_URL}/logo.png`,
  description: 'ELSxGlobal by EvolucentSphere Pvt. Ltd. — India\'s #1 enterprise transformation ecosystem. AI, BPO, KPO, Consultancy + VaultHost cloud. 200+ experts, 100+ clients, ₹120Cr valuation. Offices in Jabalpur, Indore, Pune, Eindhoven, Chicago.',
  foundingDate: '2020-01-01',
  parentOrganization: {
    '@type': 'Organization',
    name: 'EvolucentSphere Pvt. Ltd.',
    url: PARENT_URL,
  },
  founder: [
    { '@type': 'Person', name: 'Harsh Raj Patel', jobTitle: 'Co-Founder & CEO' },
    { '@type': 'Person', name: 'Shashank Patel', jobTitle: 'Co-Founder & CTO' },
  ],
  contactPoint: [
    {
      '@type': 'ContactPoint',
      telephone: '+91-72475-58873',
      contactType: 'sales',
      areaServed: 'India',
      availableLanguage: ['English', 'Hindi'],
    },
    {
      '@type': 'ContactPoint',
      telephone: '+91-87704-22622',
      contactType: 'technical support',
      areaServed: 'Worldwide',
      availableLanguage: ['English'],
    },
  ],
  sameAs: [
    'https://linkedin.com/company/elsxglobal',
    'https://twitter.com/elsxglobal',
    'https://facebook.com/elsxglobal',
    'https://instagram.com/elsxglobal',
    'https://elsxglobal.wordpress.com',
    PARENT_URL,
  ],
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'Jabalpur, Madhya Pradesh',
    addressLocality: 'Jabalpur',
    addressRegion: 'Madhya Pradesh',
    addressCountry: 'IN',
  },
  areaServed: ['IN', 'US', 'GB', 'AE', 'SG', 'AU', 'CA'],
  industry: 'Software Development',
  numberOfEmployees: { '@type': 'QuantitativeValue', value: '201-500' },
  subOrganization: [
    {
      '@type': 'Organization',
      name: 'ELSxGlobal',
      url: BASE_URL,
      description: 'Flagship division — enterprise software, AI, cloud, and digital transformation.',
    },
    {
      '@type': 'Organization',
      name: 'ELSxSoftwareoverload',
      url: `${PARENT_URL}/elsxsoftwareoverload`,
      description: 'Custom software development, SaaS, and cloud solutions division.',
    },
    {
      '@type': 'Organization',
      name: 'ELSxTech',
      url: 'https://elsxtech.blogspot.com',
      description: 'Technology consulting and IT infrastructure services.',
    },
  ],
  hasOfferCatalog: {
    '@type': 'OfferCatalog',
    name: 'Enterprise Technology Services',
    itemListElement: [
      { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Custom Software Development', url: `${BASE_URL}/software/` } },
      { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Website Development', url: `${BASE_URL}/website-development/` } },
      { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'AI & Machine Learning Solutions', url: `${BASE_URL}/ai-solutions/` } },
      { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Cloud Infrastructure & Migration', url: `${BASE_URL}/cloud/` } },
      { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'ERP & CRM Implementation', url: `${BASE_URL}/erp-crm/` } },
      { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Cybersecurity Solutions', url: `${BASE_URL}/cybersecurity/` } },
      { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Digital Marketing', url: `${BASE_URL}/digital-marketing/` } },
      { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Business Process Outsourcing', url: `${BASE_URL}/bpo-kpo/` } },
      { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Managed Hosting - VaultHost', url: `${BASE_URL}/vaulthost/` } },
    ],
  },
};

export interface SEOPageConfig {
  title?: string;
  description?: string;
  keywords?: string[];
  canonical?: string;
  ogImage?: string;
  ogTitle?: string;
  ogDescription?: string;
  type?: 'website' | 'article';
  publishedAt?: string;
  modifiedAt?: string;
  author?: string;
  breadcrumb?: Array<{ name: string; url: string }>;
  faq?: Array<{ question: string; answer: string }>;
  serviceSchema?: {
    name: string;
    description: string;
    provider?: string;
    areaServed?: string;
    category?: string;
  };
  productSchema?: {
    name: string;
    description: string;
    brand?: string;
    category?: string;
    offers: Array<{
      name: string;
      price: number;
      priceCurrency?: string;
      billingDuration?: string;
      availability?: string;
    }>;
  };
  articleSchema?: {
    headline: string;
    image: string;
    publishedAt: string;
    modifiedAt?: string;
    author: string;
    category: string;
    tags?: string[];
  };
  localBusiness?: {
    name: string;
    address: string;
    city: string;
    state: string;
    postalCode?: string;
    phone: string;
    latitude?: string;
    longitude?: string;
  };
  robots?: { index: boolean; follow: boolean };
}

export function createMetadata(config: SEOPageConfig): Metadata {
  const ogTitle = config.ogTitle || config.title || 'ELSxGlobal';
  const ogDesc = config.ogDescription || config.description || 'Premier enterprise technology partner.';

  return {
    metadataBase: new URL(BASE_URL),
    ...(config.title && { title: config.title }),
    ...(config.description && { description: config.description }),
    ...(config.keywords && { keywords: config.keywords }),
    ...(config.canonical && { alternates: { canonical: config.canonical } }),
    authors: [{ name: config.author || 'ELSxGlobal', url: BASE_URL }],
    creator: 'ELSxGlobal',
    publisher: 'ELSxGlobal',
    alternates: {
      canonical: config.canonical,
      languages: {
        'en-US': config.canonical,
        'en-IN': config.canonical,
      },
    },
    openGraph: {
      type: config.type || 'website',
      locale: 'en_US',
      url: config.canonical,
      siteName: 'ELSxGlobal — India\'s Best Enterprise Tech Partner',
      title: ogTitle,
      description: ogDesc,
      images: [
        {
          url: config.ogImage || '/og-image.png',
          width: 1200,
          height: 630,
          alt: ogTitle,
        },
      ],
      ...(config.publishedAt && {
        publishedTime: config.publishedAt,
        modifiedTime: config.modifiedAt,
      }),
    },
    twitter: {
      card: 'summary_large_image',
      title: ogTitle,
      description: ogDesc,
      images: [config.ogImage || '/og-image.png'],
      creator: '@elsxglobal',
      site: '@elsxglobal',
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-image-preview': 'large',
        'max-snippet': -1,
        'max-video-preview': -1,
      },
    },
    category: 'technology',
    classification: 'India\'s Best Enterprise Technology Solutions',
    other: {
      'geo.region': 'IN-MP',
      'geo.placename': 'Jabalpur, Madhya Pradesh, India',
      'geo.position': '23.1815;79.9557',
      'ICBM': '23.1815, 79.9557',
      'og:phone_number': '+91-72475-58873',
      'og:email': 'contact@elsxglobal.cloud',
      'og:street-address': 'Jabalpur, Madhya Pradesh',
      'og:locality': 'Jabalpur',
      'og:region': 'Madhya Pradesh',
      'og:country-name': 'India',
      'business:contact_data:street_address': 'Jabalpur, Madhya Pradesh',
      'business:contact_data:locality': 'Jabalpur',
      'business:contact_data:region': 'Madhya Pradesh',
      'business:contact_data:country_name': 'India',
      'business:contact_data:phone_number': '+91-72475-58873',
      'business:contact_data:email': 'contact@elsxglobal.cloud',
    },
    ...(config.type === 'article' && {
      verification: {
        google: 'your-google-verification-code',
        yandex: 'your-yandex-verification',
        yahoo: 'your-yahoo-verification',
        other: {
          me: ['contact@elsxglobal.com'],
        },
      },
    }),
  };
}

export function createSchemaMarkup(config: SEOPageConfig): string[] {
  const schemas: unknown[] = [defaultOrganization];

  // Breadcrumb
  if (config.breadcrumb) {
    schemas.push({
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: config.breadcrumb.map((item, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: item.name,
        item: item.url,
      })),
    });
  }

  // FAQ
  if (config.faq) {
    schemas.push({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: config.faq.map((q) => ({
        '@type': 'Question',
        name: q.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: q.answer,
        },
      })),
    });
  }

  // Service
  if (config.serviceSchema) {
    schemas.push({
      '@context': 'https://schema.org',
      '@type': 'Service',
      name: config.serviceSchema.name,
      description: config.serviceSchema.description,
      provider: {
        '@type': 'Organization',
        name: config.serviceSchema.provider || 'ELSxGlobal',
        url: BASE_URL,
        parentOrganization: {
          '@type': 'Organization',
          name: 'EvolucentSphere',
          url: 'https://evolucentsphere.com',
        },
      },
      ...(config.serviceSchema.areaServed && {
        areaServed: {
          '@type': 'Place',
          name: config.serviceSchema.areaServed,
        },
      }),
      ...(config.serviceSchema.category && {
        category: config.serviceSchema.category,
      }),
    });
  }

  // Product (for VaultHost tiers)
  if (config.productSchema) {
    schemas.push({
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: config.productSchema.name,
      description: config.productSchema.description,
      brand: {
        '@type': 'Brand',
        name: config.productSchema.brand || 'VaultHost',
      },
      ...(config.productSchema.category && {
        category: config.productSchema.category,
      }),
      offers: config.productSchema.offers.map((offer) => ({
        '@type': 'Offer',
        name: offer.name,
        price: offer.price,
        priceCurrency: offer.priceCurrency || 'INR',
        availability: offer.availability || 'https://schema.org/InStock',
        url: config.canonical,
        seller: {
          '@type': 'Organization',
          name: 'ELSxGlobal',
          url: BASE_URL,
        },
      })),
      isPartOf: {
        '@type': 'Organization',
        name: 'EvolucentSphere',
        url: 'https://evolucentsphere.com',
      },
    });
  }

  // Article
  if (config.articleSchema) {
    schemas.push({
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: config.articleSchema.headline,
      image: [`${BASE_URL}${config.articleSchema.image}`],
      datePublished: config.articleSchema.publishedAt,
      dateModified: config.articleSchema.modifiedAt || config.articleSchema.publishedAt,
      author: {
        '@type': 'Person',
        name: config.articleSchema.author,
      },
      publisher: {
        '@type': 'Organization',
        name: 'ELSxGlobal',
        logo: {
          '@type': 'ImageObject',
          url: `${BASE_URL}/logo.png`,
        },
      },
      articleSection: config.articleSchema.category,
      keywords: config.articleSchema.tags?.join(', '),
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': config.canonical,
      },
    });
  }

  // Local Business
  if (config.localBusiness) {
    schemas.push({
      '@context': 'https://schema.org',
      '@type': 'LocalBusiness',
      name: config.localBusiness.name,
      image: `${BASE_URL}/logo.png`,
      telephone: config.localBusiness.phone,
      address: {
        '@type': 'PostalAddress',
        streetAddress: config.localBusiness.address,
        addressLocality: config.localBusiness.city,
        addressRegion: config.localBusiness.state,
        addressCountry: 'IN',
        ...(config.localBusiness.postalCode && { postalCode: config.localBusiness.postalCode }),
      },
      ...(config.localBusiness.latitude && config.localBusiness.longitude && {
        geo: {
          '@type': 'GeoCoordinates',
          latitude: config.localBusiness.latitude,
          longitude: config.localBusiness.longitude,
        },
      }),
      url: config.canonical,
      parentOrganization: {
        '@type': 'Organization',
        name: 'ELSxGlobal',
        url: BASE_URL,
      },
    });
  }

  return schemas.map((s) => JSON.stringify(s));
}

// Site-wide service definitions
export const services = {
  software: {
    name: 'Custom Software Development',
    title: "India's Best Custom Software Development Company | ELSxGlobal",
    description: "India's best custom software development company. We build enterprise-grade web apps, mobile apps, and API solutions for India's top businesses. Trusted by 500+ enterprises across Mumbai, Bangalore, and Delhi.",
    keywords: ['custom software development India', 'enterprise software development Mumbai', 'web application development', 'mobile app development India', 'API development services', 'enterprise software solutions', 'software development company Bangalore', "India's best software company"],
    path: '/software',
  },
  website: {
    name: 'Website Development',
    title: "India's Best Website Development Company | ELSxGlobal",
    description: "India's best website development company. High-performance, SEO-optimized websites and e-commerce platforms. Corporate websites, online stores, and web applications built with Next.js and React.",
    keywords: ['website development company India', 'e-commerce development Mumbai', 'corporate website development', 'WordPress development India', 'Next.js development', 'web design company Bangalore', 'e-commerce website development', "India's best website development"],
    path: '/website-development',
  },
  ai: {
    name: 'AI & Machine Learning Solutions',
    title: "India's Best AI & Machine Learning Solutions | ELSxGlobal",
    description: "India's best AI and machine learning solutions provider. Predictive analytics, NLP, computer vision, and custom AI models for business intelligence. Top AI consulting in Mumbai and Bangalore.",
    keywords: ['AI solutions India', 'machine learning services', 'predictive analytics', 'NLP services India', 'computer vision solutions', 'AI consulting Mumbai', 'business intelligence AI', "India's best AI company"],
    path: '/ai-solutions',
  },
  cloud: {
    name: 'Cloud Infrastructure & Migration',
    title: "India's Best Cloud Infrastructure & Migration Services | ELSxGlobal",
    description: "India's best cloud infrastructure and migration services. Enterprise cloud architecture, AWS, Azure, and GCP solutions with DevOps, CI/CD, and infrastructure as code. Top cloud consulting in India.",
    keywords: ['cloud migration services India', 'AWS consulting Mumbai', 'Azure migration services', 'DevOps consulting India', 'infrastructure as code', 'cloud architecture services', 'GCP consulting', "India's best cloud services"],
    path: '/cloud',
  },
  erp: {
    name: 'ERP & CRM Implementation',
    title: "India's Best ERP & CRM Implementation Services | ELSxGlobal",
    description: "India's best ERP and CRM implementation services. Odoo, Salesforce, and custom solutions. Business process automation and digital transformation for India's top enterprises.",
    keywords: ['ERP implementation India', 'Odoo implementation Mumbai', 'CRM implementation services', 'Salesforce consulting India', 'business process automation', 'digital transformation ERP', "India's best ERP implementation"],
    path: '/erp-crm',
  },
  cybersecurity: {
    name: 'Cybersecurity Solutions',
    title: "India's Best Cybersecurity Solutions | ELSxGlobal",
    description: "India's best cybersecurity solutions. Enterprise security audits, penetration testing, SOC services, and compliance consulting. Top cybersecurity firm in Mumbai and Bangalore.",
    keywords: ['cybersecurity services India', 'penetration testing Mumbai', 'security audit services', 'compliance consulting India', 'SOC services', 'cybersecurity consulting Bangalore', "India's best cybersecurity company"],
    path: '/cybersecurity',
  },
  digitalMarketing: {
    name: 'Digital Marketing Services',
    title: "India's Best Digital Marketing Agency | ELSxGlobal",
    description: "India's best digital marketing agency. Results-driven SEO, PPC, social media, content marketing, and performance marketing for Indian businesses. Top digital marketing in Mumbai.",
    keywords: ['digital marketing agency India', 'SEO services Mumbai', 'PPC management India', 'social media marketing', 'content marketing services', 'performance marketing', 'search engine optimization', "India's best digital marketing"],
    path: '/digital-marketing',
  },
  bpo: {
    name: 'Business Process Outsourcing',
    title: "India's Best BPO & KPO Services | ELSxGlobal",
    description: "India's best BPO and KPO services. Data processing, customer support, research, and back-office operations for Indian and global enterprises. Top outsourcing partner in India.",
    keywords: ['BPO services India', 'KPO services Mumbai', 'business process outsourcing', 'data processing services', 'customer support outsourcing', 'back office operations India', "India's best BPO"],
    path: '/bpo-kpo',
  },
  vaulthost: {
    name: 'VaultHost - Managed Hosting',
    title: "India's Best Managed Hosting & Cloud Infrastructure | VaultHost",
    description: "India's best managed hosting and cloud infrastructure. Dedicated servers, VPS, cloud hosting, and managed WordPress hosting. Enterprise-grade hosting from Rs 99/mo.",
    keywords: ['managed hosting India', 'cloud hosting Mumbai', 'dedicated server hosting', 'VPS hosting India', 'managed WordPress hosting', 'enterprise hosting solutions', "India's best hosting"],
    path: '/vaulthost',
  },
};

// Industry definitions
export const industries = {
  manufacturing: {
    name: 'Manufacturing',
    description: 'Digital transformation solutions for manufacturing companies. Smart factory, Industry 4.0, ERP integration, and supply chain optimization.',
    keywords: ['manufacturing ERP India', 'smart factory solutions', 'Industry 4.0 India', 'manufacturing software', 'supply chain optimization', 'MRP software India'],
    path: '/industries/manufacturing',
  },
  healthcare: {
    name: 'Healthcare',
    description: 'Healthcare technology solutions for hospitals, clinics, and pharmaceutical companies. EMR, practice management, and telemedicine platforms.',
    keywords: ['healthcare software India', 'EMR software Mumbai', 'hospital management system', 'telemedicine platform India', 'pharmaceutical software', 'healthcare IT solutions'],
    path: '/industries/healthcare',
  },
  finance: {
    name: 'Financial Services',
    description: 'Fintech and banking technology solutions. Core banking, payment processing, risk management, and regulatory compliance software.',
    keywords: ['fintech software India', 'banking software solutions', 'payment processing', 'risk management software', 'financial services technology', 'regulatory compliance software'],
    path: '/industries/financial-services',
  },
  retail: {
    name: 'Retail & E-commerce',
    description: 'Retail technology solutions. Omnichannel commerce, POS systems, inventory management, and customer engagement platforms.',
    keywords: ['retail software India', 'e-commerce platform development', 'POS system India', 'inventory management software', 'omnichannel commerce', 'retail technology solutions'],
    path: '/industries/retail',
  },
  logistics: {
    name: 'Logistics & Transportation',
    description: 'Logistics and supply chain technology. Fleet management, route optimization, warehouse management, and freight tracking systems.',
    keywords: ['logistics software India', 'fleet management system', 'warehouse management software', 'route optimization', 'freight tracking', 'supply chain technology'],
    path: '/industries/logistics',
  },
  realEstate: {
    name: 'Real Estate',
    description: 'Real estate technology solutions. Property management, CRM for builders, lead management, and real estate marketing platforms.',
    keywords: ['real estate software India', 'property management system', 'real estate CRM', 'lead management real estate', 'builder software India', 'real estate marketing'],
    path: '/industries/real-estate',
  },
  education: {
    name: 'Education',
    description: 'EdTech solutions for schools, colleges, and training institutes. Learning management systems, student portals, and assessment platforms.',
    keywords: ['EdTech solutions India', 'LMS software', 'school management system', 'student portal development', 'online learning platform', 'education technology India'],
    path: '/industries/education',
  },
};

// Location definitions
export const locations = {
  mumbai: {
    name: 'Mumbai',
    state: 'Maharashtra',
    description: 'Software development and technology solutions company in Mumbai, Maharashtra. Custom software, ERP, cloud, and AI services for Mumbai enterprises.',
    keywords: ['software development company Mumbai', 'IT company Mumbai', 'software company Maharashtra', 'Mumbai tech solutions', 'Mumbai IT services', 'Mumbai software development'],
    path: '/locations/mumbai',
  },
  delhi: {
    name: 'Delhi',
    state: 'Delhi',
    description: 'Enterprise technology solutions in Delhi NCR. Custom software, ERP, cloud, and AI services for Delhi-based enterprises.',
    keywords: ['software development company Delhi', 'IT company Delhi NCR', 'software company Delhi', 'Delhi tech solutions', 'Delhi IT services', 'Noida software development'],
    path: '/locations/delhi',
  },
  bangalore: {
    name: 'Bangalore',
    state: 'Karnataka',
    description: 'AI and software development company in Bangalore, Karnataka. Machine learning, cloud, and enterprise software solutions for Bangalore tech companies.',
    keywords: ['software development company Bangalore', 'AI company Bangalore', 'IT company Bangalore', 'Bangalore tech solutions', 'Karnataka software development', 'Bangalore cloud services'],
    path: '/locations/bangalore',
  },
  chennai: {
    name: 'Chennai',
    state: 'Tamil Nadu',
    description: 'Enterprise technology solutions in Chennai, Tamil Nadu. Custom software, ERP, and cloud services for Chennai manufacturing and IT companies.',
    keywords: ['software development company Chennai', 'IT company Chennai', 'software company Tamil Nadu', 'Chennai tech solutions', 'Chennai IT services', 'Chennai ERP solutions'],
    path: '/locations/chennai',
  },
  hyderabad: {
    name: 'Hyderabad',
    state: 'Telangana',
    description: 'Software development and AI solutions company in Hyderabad, Telangana. Enterprise technology solutions for Hyderabad IT and pharmaceutical companies.',
    keywords: ['software development company Hyderabad', 'IT company Hyderabad', 'software company Telangana', 'Hyderabad tech solutions', 'Hyderabad IT services', 'Hyderabad AI solutions'],
    path: '/locations/hyderabad',
  },
  pune: {
    name: 'Pune',
    state: 'Maharashtra',
    description: 'Enterprise technology solutions in Pune, Maharashtra. Custom software, ERP, and manufacturing solutions for Pune automotive and IT companies.',
    keywords: ['software development company Pune', 'IT company Pune', 'software company Pune', 'Pune tech solutions', 'Pune IT services', 'Pune manufacturing software'],
    path: '/locations/pune',
  },
  ahmedabad: {
    name: 'Ahmedabad',
    state: 'Gujarat',
    description: 'Software development and IT solutions company in Ahmedabad, Gujarat. Enterprise technology solutions for Ahmedabad manufacturing and trading companies.',
    keywords: ['software development company Ahmedabad', 'IT company Ahmedabad', 'software company Gujarat', 'Ahmedabad tech solutions', 'Ahmedabad IT services', 'Gujarat software development'],
    path: '/locations/ahmedabad',
  },
  kolkata: {
    name: 'Kolkata',
    state: 'West Bengal',
    description: 'Enterprise technology solutions in Kolkata, West Bengal. Custom software, ERP, and IT services for Kolkata enterprises and government organizations.',
    keywords: ['software development company Kolkata', 'IT company Kolkata', 'software company West Bengal', 'Kolkata tech solutions', 'Kolkata IT services', 'Kolkata ERP solutions'],
    path: '/locations/kolkata',
  },
  dubai: {
    name: 'Dubai',
    state: 'UAE',
    description: 'Enterprise technology solutions in Dubai, UAE. Custom software, ERP, and cloud services for Dubai-based enterprises and free zone companies.',
    keywords: ['software development company Dubai', 'IT company Dubai', 'ERP solutions UAE', 'Dubai tech solutions', 'UAE IT services', 'Dubai cloud services'],
    path: '/locations/dubai',
  },
  singapore: {
    name: 'Singapore',
    state: 'Singapore',
    description: 'Enterprise technology solutions in Singapore. Custom software, fintech, and cloud solutions for Singapore financial and technology companies.',
    keywords: ['software development company Singapore', 'IT company Singapore', 'fintech solutions Singapore', 'Singapore tech solutions', 'Singapore IT services', 'Singapore cloud services'],
    path: '/locations/singapore',
  },
  london: {
    name: 'London',
    state: 'UK',
    description: 'Enterprise technology solutions in London, UK. Custom software, fintech, and compliance solutions for UK financial and technology companies.',
    keywords: ['software development company London', 'IT company London', 'fintech solutions UK', 'London tech solutions', 'UK IT services', 'London cloud services'],
    path: '/locations/london',
  },
  newyork: {
    name: 'New York',
    state: 'USA',
    description: 'Enterprise technology solutions in New York, USA. Custom software, fintech, and AI solutions for NYC enterprises and startups.',
    keywords: ['software development company New York', 'IT company NYC', 'fintech solutions USA', 'New York tech solutions', 'USA IT services', 'NYC cloud services'],
    path: '/locations/new-york',
  },
  sydney: {
    name: 'Sydney',
    state: 'Australia',
    description: 'Enterprise technology solutions in Sydney, Australia. Custom software, cloud, and digital transformation for Australian enterprises.',
    keywords: ['software development company Sydney', 'IT company Sydney', 'cloud solutions Australia', 'Sydney tech solutions', 'Australia IT services', 'Sydney digital transformation'],
    path: '/locations/sydney',
  },
  toronto: {
    name: 'Toronto',
    state: 'Canada',
    description: 'Enterprise technology solutions in Toronto, Canada. Custom software, AI, and fintech solutions for Canadian enterprises.',
    keywords: ['software development company Toronto', 'IT company Toronto', 'fintech solutions Canada', 'Toronto tech solutions', 'Canada IT services', 'Toronto AI solutions'],
    path: '/locations/toronto',
  },
};

// EvolucentSphere ecosystem divisions
export const ecosystemDivisions = [
  {
    name: 'ELSxGlobal',
    url: 'https://elsxglobal.com',
    description: 'Flagship division — enterprise software, AI, cloud, cybersecurity, and digital transformation.',
    role: 'Flagship Division',
  },
  {
    name: 'ELSxSoftwareoverload',
    url: 'https://evolucentsphere.com/elsxsoftwareoverload',
    description: 'Custom software development, SaaS platforms, and cloud-native solutions.',
    role: 'Software Division',
  },
  {
    name: 'ELSxTech',
    url: 'https://elsxtech.blogspot.com',
    description: 'Technology consulting, IT infrastructure, and managed services.',
    role: 'Technology Consulting',
  },
  {
    name: 'VaultHost',
    url: 'https://elsxglobal.com/vaulthost',
    description: 'Enterprise hosting, cloud infrastructure, and managed WordPress hosting.',
    role: 'Hosting Infrastructure',
  },
];

export const parentCompanyInfo = {
  name: 'EvolucentSphere Pvt. Ltd.',
  url: 'https://evolucentsphere.com',
  founded: '2020',
  headquarters: 'Jabalpur, Madhya Pradesh, India',
  valuation: '₹120Cr',
  targetValuation: '₹500Cr by 2026',
  employees: '201-500',
  email: 'contact@evolucentsphere.com',
  phone1: '+91 72475 58873',
  phone2: '+91 87704 22622',
  description: 'India\'s premier technology conglomerate delivering AI-driven BPO, KPO, IT services, software development, and strategic consultancy to enterprises worldwide. Founded in 2009, EvolucentSphere has grown into a multi-division ecosystem serving clients across India, UAE, USA, UK, Singapore, and beyond.',
  divisions: ecosystemDivisions,
};
