import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowRight, Sparkles, ChevronRight, Building2, Cpu, BarChart3, Globe, Phone } from 'lucide-react';
import { PageHeroV4 } from '@/components/ui/page-hero-v4';
import { PanelCard } from '@/components/ui/panel-card';
import { ScrollReveal } from '@/components/ui/scroll-reveal';
import { buildMetadata } from '@/lib/metadata';
import {
  services as seoServices,
  industries as seoIndustries,
  locations as seoLocations,
} from '@/lib/seo';

interface CatchAllEntry {
  category: string;
  eyebrowTitle: string;
  displayTitle: string;
  metaTitle: string;
  description: string;
  topicLabel: string;
  keywords?: string[];
}

const VALID_SLUGS: Record<string, CatchAllEntry> = {
  // Division & service overview slugs linked from /services and /compare
  'services/tech': {
    category: 'Services',
    eyebrowTitle: 'ELSxTech',
    displayTitle: 'ELSxTech Solutions',
    metaTitle: 'ELSxTech — Custom Software, AI & Cloud Engineering',
    description:
      'Full-cycle custom software development, enterprise AI/ML integration, cloud migration, and zero-trust cybersecurity delivered by ELSxTech.',
    topicLabel: 'ELSxTech engineering',
    keywords: ['ELSxTech', 'custom software development', 'enterprise AI', 'cloud migration', 'cybersecurity'],
  },
  'services/bpo': {
    category: 'Services',
    eyebrowTitle: 'ELSxBPO',
    displayTitle: 'ELSxBPO Solutions',
    metaTitle: 'ELSxBPO — AI-Augmented Business Process Outsourcing',
    description:
      '24/7 omnichannel customer support, technical helpdesk, RPA workflows, and back-office operations built to scale enterprise efficiency.',
    topicLabel: 'ELSxBPO operations',
    keywords: ['ELSxBPO', 'business process outsourcing', 'RPA automation', '24/7 contact center'],
  },
  'services/kpo': {
    category: 'Services',
    eyebrowTitle: 'ELSxKPO',
    displayTitle: 'ELSxKPO Solutions',
    metaTitle: 'ELSxKPO — Knowledge Process & Predictive Analytics',
    description:
      'Market and financial research, predictive analytics, risk management, and decision intelligence turning enterprise data into action.',
    topicLabel: 'ELSxKPO analytics',
    keywords: ['ELSxKPO', 'knowledge process outsourcing', 'predictive analytics', 'financial modeling'],
  },
  'services/consultancy': {
    category: 'Services',
    eyebrowTitle: 'ELSxConsultancy',
    displayTitle: 'ELSxConsultancy Solutions',
    metaTitle: 'ELSxConsultancy — Enterprise Digital Transformation Advisory',
    description:
      'Digital transformation strategy, IT architecture consulting, process automation, and change management for enterprise modernization.',
    topicLabel: 'digital transformation consultancy',
    keywords: ['ELSxConsultancy', 'digital transformation consulting', 'IT architecture strategy'],
  },
  'services/custom-software': {
    category: 'Services',
    eyebrowTitle: 'Custom Software',
    displayTitle: 'Custom Software Development',
    metaTitle: seoServices.software.title,
    description: seoServices.software.description,
    topicLabel: 'custom software',
    keywords: seoServices.software.keywords,
  },

  // Top-level service slugs defined in sitemap & SEO catalog
  'cybersecurity': {
    category: 'Solutions',
    eyebrowTitle: 'Cybersecurity',
    displayTitle: 'Cybersecurity Solutions',
    metaTitle: seoServices.cybersecurity.title,
    description: seoServices.cybersecurity.description,
    topicLabel: 'enterprise cybersecurity',
    keywords: seoServices.cybersecurity.keywords,
  },
  'digital-marketing': {
    category: 'Solutions',
    eyebrowTitle: 'Digital Marketing',
    displayTitle: 'Digital Marketing Services',
    metaTitle: seoServices.digitalMarketing.title,
    description: seoServices.digitalMarketing.description,
    topicLabel: 'digital marketing',
    keywords: seoServices.digitalMarketing.keywords,
  },
  'bpo-kpo': {
    category: 'Solutions',
    eyebrowTitle: 'BPO & KPO',
    displayTitle: 'BPO & KPO Services',
    metaTitle: seoServices.bpo.title,
    description: seoServices.bpo.description,
    topicLabel: 'BPO & KPO',
    keywords: seoServices.bpo.keywords,
  },

  // Industry slugs linked from /industries, nav config, and sitemap
  'industries/healthcare': {
    category: 'Industries',
    eyebrowTitle: 'Healthcare',
    displayTitle: 'Healthcare Solutions',
    metaTitle: 'Healthcare & Life Sciences Technology Solutions',
    description: seoIndustries.healthcare.description,
    topicLabel: 'healthcare',
    keywords: seoIndustries.healthcare.keywords,
  },
  'industries/finance': {
    category: 'Industries',
    eyebrowTitle: 'Financial Services',
    displayTitle: 'Finance Solutions',
    metaTitle: 'Financial Services & Fintech Technology Solutions',
    description: seoIndustries.finance.description,
    topicLabel: 'financial services',
    keywords: seoIndustries.finance.keywords,
  },
  'industries/financial-services': {
    category: 'Industries',
    eyebrowTitle: 'Financial Services',
    displayTitle: 'Financial Services Solutions',
    metaTitle: 'Financial Services & Fintech Technology Solutions',
    description: seoIndustries.finance.description,
    topicLabel: 'financial services',
    keywords: seoIndustries.finance.keywords,
  },
  'industries/ecommerce': {
    category: 'Industries',
    eyebrowTitle: 'Ecommerce',
    displayTitle: 'Ecommerce Solutions',
    metaTitle: 'E-Commerce & Retail Digital Transformation Solutions',
    description: seoIndustries.retail.description,
    topicLabel: 'e-commerce and retail',
    keywords: seoIndustries.retail.keywords,
  },
  'industries/retail': {
    category: 'Industries',
    eyebrowTitle: 'Retail',
    displayTitle: 'Retail Solutions',
    metaTitle: 'Retail & Omnichannel Commerce Solutions',
    description: seoIndustries.retail.description,
    topicLabel: 'retail',
    keywords: seoIndustries.retail.keywords,
  },
  'industries/logistics': {
    category: 'Industries',
    eyebrowTitle: 'Logistics',
    displayTitle: 'Logistics Solutions',
    metaTitle: 'Logistics & Supply Chain Technology Solutions',
    description: seoIndustries.logistics.description,
    topicLabel: 'logistics and supply chain',
    keywords: seoIndustries.logistics.keywords,
  },
  'industries/manufacturing': {
    category: 'Industries',
    eyebrowTitle: 'Manufacturing',
    displayTitle: 'Manufacturing Solutions',
    metaTitle: 'Manufacturing & Industry 4.0 Technology Solutions',
    description: seoIndustries.manufacturing.description,
    topicLabel: 'manufacturing',
    keywords: seoIndustries.manufacturing.keywords,
  },
  'industries/real-estate': {
    category: 'Industries',
    eyebrowTitle: 'Real Estate',
    displayTitle: 'Real Estate Solutions',
    metaTitle: 'Real Estate & PropTech Software Solutions',
    description: seoIndustries.realEstate.description,
    topicLabel: 'real estate',
    keywords: seoIndustries.realEstate.keywords,
  },
  'industries/education': {
    category: 'Industries',
    eyebrowTitle: 'Education',
    displayTitle: 'Education Solutions',
    metaTitle: 'Education & EdTech Digital Solutions',
    description: seoIndustries.education.description,
    topicLabel: 'education',
    keywords: seoIndustries.education.keywords,
  },
  'industries/startups': {
    category: 'Industries',
    eyebrowTitle: 'Startups',
    displayTitle: 'Startups & Scale-ups Solutions',
    metaTitle: 'Technology & Operations Solutions for Startups & Scale-ups',
    description:
      'Agile engineering teams, cloud infrastructure, scalable customer success BPO, and fractional technology leadership built for high-growth startups.',
    topicLabel: 'startups and scale-ups',
    keywords: ['startup software development', 'MVP engineering', 'startup BPO support', 'scale-up cloud'],
  },

  // Location slugs linked from nav config and sitemap
  'locations/delhi': {
    category: 'Locations',
    eyebrowTitle: 'Delhi',
    displayTitle: 'ELSxGlobal Delhi NCR',
    metaTitle: 'Enterprise IT, AI & BPO Services in Delhi NCR',
    description: seoLocations.delhi.description,
    topicLabel: 'Delhi NCR',
    keywords: seoLocations.delhi.keywords,
  },
  'locations/noida': {
    category: 'Locations',
    eyebrowTitle: 'Noida',
    displayTitle: 'ELSxGlobal Noida',
    metaTitle: 'Enterprise Software, Cloud & KPO Delivery Center in Noida',
    description:
      'ELSxGlobal serves enterprise clients from our Sector 62 Noida delivery center with technical support, cloud engineering, and analytics KPO.',
    topicLabel: 'Noida',
    keywords: ['IT services Noida', 'software development Noida', 'KPO delivery center Noida', 'ELSxGlobal Noida'],
  },
  'locations/chennai': {
    category: 'Locations',
    eyebrowTitle: 'Chennai',
    displayTitle: 'ELSxGlobal Chennai',
    metaTitle: 'Enterprise Technology & ERP Services in Chennai',
    description: seoLocations.chennai.description,
    topicLabel: 'Chennai',
    keywords: seoLocations.chennai.keywords,
  },
  'locations/hyderabad': {
    category: 'Locations',
    eyebrowTitle: 'Hyderabad',
    displayTitle: 'ELSxGlobal Hyderabad',
    metaTitle: 'Enterprise Software & AI Solutions in Hyderabad',
    description: seoLocations.hyderabad.description,
    topicLabel: 'Hyderabad',
    keywords: seoLocations.hyderabad.keywords,
  },
  'locations/ahmedabad': {
    category: 'Locations',
    eyebrowTitle: 'Ahmedabad',
    displayTitle: 'ELSxGlobal Ahmedabad',
    metaTitle: 'Enterprise Software & IT Solutions in Ahmedabad',
    description: seoLocations.ahmedabad.description,
    topicLabel: 'Ahmedabad',
    keywords: seoLocations.ahmedabad.keywords,
  },
  'locations/kolkata': {
    category: 'Locations',
    eyebrowTitle: 'Kolkata',
    displayTitle: 'ELSxGlobal Kolkata',
    metaTitle: 'Enterprise Technology & ERP Solutions in Kolkata',
    description: seoLocations.kolkata.description,
    topicLabel: 'Kolkata',
    keywords: seoLocations.kolkata.keywords,
  },
  'locations/singapore': {
    category: 'Locations',
    eyebrowTitle: 'Singapore',
    displayTitle: 'ELSxGlobal Singapore',
    metaTitle: 'Enterprise Cloud, Fintech & AI Consulting in Singapore',
    description: seoLocations.singapore.description,
    topicLabel: 'Singapore',
    keywords: seoLocations.singapore.keywords,
  },
  'locations/london': {
    category: 'Locations',
    eyebrowTitle: 'London',
    displayTitle: 'ELSxGlobal London',
    metaTitle: 'Enterprise Software, Fintech & Compliance Solutions in London',
    description: seoLocations.london.description,
    topicLabel: 'London',
    keywords: seoLocations.london.keywords,
  },
  'locations/new-york': {
    category: 'Locations',
    eyebrowTitle: 'New York',
    displayTitle: 'ELSxGlobal New York',
    metaTitle: 'Enterprise Software, AI & Fintech Solutions in New York',
    description: seoLocations.newyork.description,
    topicLabel: 'New York',
    keywords: seoLocations.newyork.keywords,
  },
  'locations/sydney': {
    category: 'Locations',
    eyebrowTitle: 'Sydney',
    displayTitle: 'ELSxGlobal Sydney',
    metaTitle: 'Enterprise Cloud & Digital Transformation in Sydney',
    description: seoLocations.sydney.description,
    topicLabel: 'Sydney',
    keywords: seoLocations.sydney.keywords,
  },
  'locations/toronto': {
    category: 'Locations',
    eyebrowTitle: 'Toronto',
    displayTitle: 'ELSxGlobal Toronto',
    metaTitle: 'Enterprise AI, Software & Fintech Solutions in Toronto',
    description: seoLocations.toronto.description,
    topicLabel: 'Toronto',
    keywords: seoLocations.toronto.keywords,
  },
};

export const dynamicParams = false;

export function generateStaticParams() {
  return Object.keys(VALID_SLUGS).map((key) => ({
    slug: key.split('/'),
  }));
}

function resolveSlugEntry(slug: string[] | undefined) {
  const key = (slug || []).filter(Boolean).join('/');
  return { key, entry: VALID_SLUGS[key] };
}

export function generateMetadata({ params }: { params: { slug: string[] } }): Metadata {
  const { key, entry } = resolveSlugEntry(params.slug);
  if (!entry) {
    notFound();
  }

  return buildMetadata({
    title: entry.metaTitle,
    description: entry.description,
    path: `/${key}`,
    keywords: entry.keywords,
  });
}

const PILLARS = [
  { name: 'ELSxTech', desc: 'Custom Software, AI & Cloud', href: '/elsxtech', icon: Cpu, color: 'text-blue-400' },
  { name: 'ELSxBPO', desc: 'Business Process Outsourcing', href: '/elsxbpo', icon: Building2, color: 'text-purple-400' },
  { name: 'ELSxKPO', desc: 'Data & Knowledge Analytics', href: '/elsxkpo', icon: BarChart3, color: 'text-emerald-400' },
  { name: 'ELSxConsultancy', desc: 'Digital Transformation', href: '/elsxconsultancy', icon: Globe, color: 'text-amber-400' },
];

export default function GenericCatchAllPage({ params }: { params: { slug: string[] } }) {
  const { entry } = resolveSlugEntry(params.slug);
  if (!entry) {
    notFound();
  }

  return (
    <div className="v4-page">
      <PageHeroV4
        eyebrow={`${entry.category} › ${entry.eyebrowTitle}`}
        eyebrowIcon={Sparkles}
        title={<>{entry.displayTitle}</>}
        description={entry.description}
      >
        <div className="flex flex-col sm:flex-row gap-3 justify-center mt-8">
          <Link href="/contact" className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-btn v4-btn-primary text-sm">
            <Phone className="h-4 w-4" /> Schedule a Consultation
          </Link>
          <Link href="/services" className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-btn v4-btn-secondary text-sm">
            View All Services
          </Link>
        </div>
      </PageHeroV4>

      <section className="v4-section-sm bg-ink-surface border-t border-hairline">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <ScrollReveal className="text-center mb-10">
            <h2 className="text-2xl font-bold text-text-primary-v4">Explore ELSxGlobal&apos;s Core Divisions</h2>
            <p className="mt-3 text-text-secondary-v4">
              Our {entry.topicLabel} expertise is delivered across all four transformation pillars.
            </p>
          </ScrollReveal>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {PILLARS.map((p, i) => (
              <ScrollReveal key={p.name} animation="fade-up" delay={i * 80}>
                <Link href={p.href} className="block h-full group">
                  <PanelCard className="p-5 h-full flex flex-col gap-4 border border-hairline group-hover:border-signal/30 transition-colors bg-ink-surface-2 min-h-[160px]">
                    <p.icon className={`h-6 w-6 ${p.color}`} />
                    <div>
                      <h3 className="text-base font-semibold text-text-primary-v4 group-hover:text-signal transition-colors">{p.name}</h3>
                      <p className="text-sm text-text-secondary-v4 mt-1">{p.desc}</p>
                    </div>
                    <div className="mt-auto flex items-center text-xs font-medium text-signal opacity-0 group-hover:opacity-100 transition-all -translate-x-1 group-hover:translate-x-0 duration-200">
                      Explore <ChevronRight className="h-3 w-3 ml-1" />
                    </div>
                  </PanelCard>
                </Link>
              </ScrollReveal>
            ))}
          </div>

          <ScrollReveal className="mt-12 text-center">
            <div className="inline-flex flex-col sm:flex-row items-center gap-4 p-6 rounded-2xl border border-hairline bg-ink-surface-2">
              <div className="text-left">
                <p className="text-sm font-semibold text-text-primary-v4">Not sure where to start?</p>
                <p className="text-sm text-text-secondary-v4 mt-1">
                  Talk to a solution advisor — no commitment required.
                </p>
              </div>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-btn v4-btn-primary text-sm shrink-0 whitespace-nowrap"
              >
                Talk to an Advisor <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </div>
  );
}
