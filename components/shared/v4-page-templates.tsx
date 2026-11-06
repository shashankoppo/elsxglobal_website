'use client';

import { ArrowRight, type LucideIcon } from 'lucide-react';
import Link from 'next/link';
import { PageHeroV4 } from '@/components/ui/page-hero-v4';
import { PanelCard } from '@/components/ui/panel-card';
import { StatCardV4 } from '@/components/ui/stat-card-v4';
import { ScrollReveal } from '@/components/ui/scroll-reveal';

export interface ProductPageDataV4 {
  eyebrow: string;
  eyebrowIcon: LucideIcon;
  title: React.ReactNode;
  description: string;
  features: { icon: LucideIcon; title: string; desc: string }[];
  stats: { value: number; suffix?: string; prefix?: string; label: string; decimals?: number }[];
  ctaTitle: string;
  ctaHref: string;
  children?: React.ReactNode;
}

export function ProductPageV4({ data }: { data: ProductPageDataV4 }) {
  return (
    <div className="v4-page">
      <PageHeroV4 eyebrow={data.eyebrow} eyebrowIcon={data.eyebrowIcon} title={data.title} description={data.description}>
        <Link href={data.ctaHref} className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-btn v4-btn-primary text-sm">
          {data.ctaTitle} <ArrowRight className="h-4 w-4" />
        </Link>
      </PageHeroV4>

      <section className="v4-section-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {data.stats.map((s, i) => (
              <ScrollReveal key={s.label} animation="fade-up" delay={i * 60}>
                <StatCardV4 value={s.value} suffix={s.suffix} prefix={s.prefix} label={s.label} decimals={s.decimals} />
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      <section className="v4-section-sm bg-ink-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal className="text-center mb-10">
            <h2 className="text-3xl v4-display text-text-primary-v4">Capabilities</h2>
          </ScrollReveal>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.features.map((f, i) => (
              <ScrollReveal key={f.title} animation="fade-up" delay={i * 80}>
                <PanelCard className="p-6 h-full">
                  <div className="flex h-10 w-10 items-center justify-center rounded-panel border border-hairline bg-ink-surface-2 mb-4">
                    <f.icon className="h-5 w-5 text-signal" />
                  </div>
                  <h3 className="text-base font-semibold text-text-primary-v4 mb-2">{f.title}</h3>
                  <p className="text-sm text-text-secondary-v4 leading-relaxed">{f.desc}</p>
                </PanelCard>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {data.children}

      <section className="v4-section-sm">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <ScrollReveal>
            <h2 className="text-3xl v4-display text-text-primary-v4">{data.ctaTitle}</h2>
            <p className="mt-4 text-text-secondary-v4">Start free. No credit card required. Deploy in under 60 seconds.</p>
            <Link href={data.ctaHref} className="mt-8 inline-flex items-center gap-2 px-7 py-3.5 rounded-btn v4-btn-primary text-sm">
              Get Started <ArrowRight className="h-4 w-4" />
            </Link>
          </ScrollReveal>
        </div>
      </section>
    </div>
  );
}

export interface DivisionPageDataV4 {
  eyebrow: string;
  eyebrowIcon: LucideIcon;
  title: React.ReactNode;
  description: string;
  services: { icon: LucideIcon; title: string; desc: string }[];
  stats: { value: number; suffix?: string; prefix?: string; label: string; decimals?: number }[];
  tags: string[];
  techStack?: string[];
  children?: React.ReactNode;
}

export function DivisionPageV4({ data }: { data: DivisionPageDataV4 }) {
  return (
    <div className="v4-page">
      <PageHeroV4 eyebrow={data.eyebrow} eyebrowIcon={data.eyebrowIcon} title={data.title} description={data.description} />

      <section className="v4-section-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal className="text-center mb-10">
            <h2 className="text-3xl v4-display text-text-primary-v4">Services</h2>
          </ScrollReveal>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.services.map((s, i) => (
              <ScrollReveal key={s.title} animation="fade-up" delay={i * 80}>
                <PanelCard className="p-6 h-full">
                  <div className="flex h-10 w-10 items-center justify-center rounded-panel border border-hairline bg-ink-surface-2 mb-4">
                    <s.icon className="h-5 w-5 text-signal" />
                  </div>
                  <h3 className="text-base font-semibold text-text-primary-v4 mb-2">{s.title}</h3>
                  <p className="text-sm text-text-secondary-v4 leading-relaxed">{s.desc}</p>
                </PanelCard>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      <section className="v4-section-sm bg-ink-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {data.stats.map((s, i) => (
              <ScrollReveal key={s.label} animation="fade-up" delay={i * 60}>
                <StatCardV4 value={s.value} suffix={s.suffix} prefix={s.prefix} label={s.label} decimals={s.decimals} />
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap justify-center gap-2">
            {data.tags.map((t) => (
              <span key={t} className="v4-badge v4-badge-signal">{t}</span>
            ))}
          </div>
        </div>
      </section>

      {data.techStack && (
        <section className="py-12 bg-ink-surface">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <p className="text-center v4-readout text-[10px] uppercase tracking-widest text-text-muted-v4 mb-4">Technology Stack</p>
            <div className="flex flex-wrap justify-center gap-2">
              {data.techStack.map((tech) => (
                <span key={tech} className="v4-readout text-xs px-3 py-2 rounded-chip border border-hairline bg-ink-surface-2 text-text-secondary-v4">{tech}</span>
              ))}
            </div>
          </div>
        </section>
      )}

      {data.children}

      <section className="v4-section-sm">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <ScrollReveal>
            <h2 className="text-3xl v4-display text-text-primary-v4">Ready to Transform?</h2>
            <p className="mt-4 text-text-secondary-v4">Book a free consultation with our team.</p>
            <Link href="/contact" className="mt-8 inline-flex items-center gap-2 px-7 py-3.5 rounded-btn v4-btn-primary text-sm">
              Schedule a Demo <ArrowRight className="h-4 w-4" />
            </Link>
          </ScrollReveal>
        </div>
      </section>
    </div>
  );
}
