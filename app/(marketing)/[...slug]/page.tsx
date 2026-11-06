'use client';

import Link from 'next/link';
import { ArrowRight, Sparkles, ChevronRight, Building2, Cpu, Cloud, BarChart3, Globe, Phone } from 'lucide-react';
import { PageHeroV4 } from '@/components/ui/page-hero-v4';
import { PanelCard } from '@/components/ui/panel-card';
import { ScrollReveal } from '@/components/ui/scroll-reveal';
import { usePathname } from 'next/navigation';

function formatSlug(slugPart: string) {
  return slugPart
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

const PILLARS = [
  { name: 'ELSxTech', desc: 'Custom Software, AI & Cloud', href: '/elsxtech', icon: Cpu, color: 'text-blue-400' },
  { name: 'ELSxBPO', desc: 'Business Process Outsourcing', href: '/elsxbpo', icon: Building2, color: 'text-purple-400' },
  { name: 'ELSxKPO', desc: 'Data & Knowledge Analytics', href: '/elsxkpo', icon: BarChart3, color: 'text-emerald-400' },
  { name: 'ELSxConsultancy', desc: 'Digital Transformation', href: '/elsxconsultancy', icon: Globe, color: 'text-amber-400' },
];

export default function GenericCatchAllPage({ params }: { params: { slug: string[] } }) {
  const isIndustry = params.slug[0] === 'industries';
  const isLocation = params.slug[0] === 'locations';
  const isService = params.slug[0] === 'services';

  const title = formatSlug(params.slug[params.slug.length - 1]);
  const category = params.slug.length > 1 ? formatSlug(params.slug[0]) : 'Solutions';

  const displayTitle = isIndustry
    ? `${title} Solutions`
    : isLocation
    ? `ELSxGlobal ${title}`
    : title;

  const description = isIndustry
    ? `ELSxGlobal delivers enterprise-grade technology solutions tailored specifically for the ${title.toLowerCase()} sector — from digital transformation to AI automation.`
    : isLocation
    ? `ELSxGlobal serves enterprise clients across ${title}, providing on-ground support and delivery capability.`
    : `ELSxGlobal delivers ${title.toLowerCase()} solutions that drive measurable business outcomes for enterprise clients across India and globally.`;

  return (
    <div className="v4-page">
      <PageHeroV4
        eyebrow={`${category} › ${title}`}
        eyebrowIcon={Sparkles}
        title={<>{displayTitle}</>}
        description={description}
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
              Our {title.toLowerCase()} expertise is delivered across all four transformation pillars.
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
