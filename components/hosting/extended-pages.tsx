import { PageHeroV4 } from '@/components/ui/page-hero-v4';
import { ScrollReveal } from '@/components/ui/scroll-reveal';
import { PanelCard, PanelCardBody } from '@/components/ui/panel-card';
import { CheckCircle2, ArrowRight, ChevronDown, type LucideIcon } from 'lucide-react';
import {
  Accordion, AccordionItem, AccordionTrigger, AccordionContent,
} from '@/components/ui/accordion';
import Link from 'next/link';
import type { HostingSubTierData } from '@/lib/data/hosting-tiers-extended';

function Breadcrumbs({ items }: { items: { label: string; href?: string }[] }) {
  return (
    <section className="relative pt-4 pb-4">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <nav className="flex items-center gap-2 text-sm text-text-secondary-v4 flex-wrap">
          {items.map((item, i) => (
            <span key={i} className="flex items-center gap-2">
              {item.href ? (
                <Link href={item.href} className="hover:text-signal transition-colors">{item.label}</Link>
              ) : (
                <span className="text-text-primary-v4">{item.label}</span>
              )}
              {i < items.length - 1 && <span className="text-hairline">/</span>}
            </span>
          ))}
        </nav>
      </div>
    </section>
  );
}

function FAQSection({ faqs }: { faqs: { question: string; answer: string }[] }) {
  if (!faqs || faqs.length === 0) return null;
  return (
    <section className="relative py-16 bg-ink-surface border-t border-hairline">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <ScrollReveal className="text-center mb-10">
          <h2 className="text-3xl font-semibold tracking-tight mb-3 text-text-primary-v4">Frequently Asked Questions</h2>
          <p className="text-text-secondary-v4">Everything you need to know.</p>
        </ScrollReveal>
        <ScrollReveal delay={100}>
          <Accordion type="single" collapsible className="space-y-3">
            {faqs.map((faq) => (
              <AccordionItem key={faq.question} value={faq.question} className="v4-panel px-5 border-b-0">
                <AccordionTrigger className="text-left text-sm font-medium text-text-primary-v4 hover:text-signal transition-colors py-4">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-sm text-text-secondary-v4 leading-relaxed pb-4">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </ScrollReveal>
      </div>
    </section>
  );
}

function FeatureGrid({ features }: { features: { icon: LucideIcon; title: string; desc: string }[] }) {
  return (
    <section className="relative py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f, i) => (
            <ScrollReveal key={f.title} delay={i * 50} animation="fade-scale" className="h-full">
              <PanelCard className="h-full hover:border-signal/40 transition-all duration-300 hover:-translate-y-1 group">
                <PanelCardBody>
                  <div className="flex h-11 w-11 items-center justify-center rounded-chip bg-ink-surface-2 border border-hairline mb-4 group-hover:bg-signal/10 transition-colors group-hover:scale-110">
                    <f.icon className="h-5 w-5 text-signal" />
                  </div>
                  <h3 className="text-base font-semibold text-text-primary-v4 mb-2">{f.title}</h3>
                  <p className="text-sm text-text-secondary-v4 leading-relaxed">{f.desc}</p>
                </PanelCardBody>
              </PanelCard>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function WhatYouGet({ title, features }: { title: string; features: { icon: LucideIcon; title: string; desc: string }[] }) {
  return (
    <section className="relative py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <PanelCard>
          <PanelCardBody className="p-8">
            <h3 className="text-xl font-semibold mb-5 text-text-primary-v4">What you get with {title}</h3>
            <div className="grid sm:grid-cols-2 gap-3">
              {features.map((f) => (
                <div key={f.title} className="flex items-start gap-2.5 group">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-chip bg-ink-surface-2 border border-hairline group-hover:bg-signal/10 transition-colors mt-0.5">
                    <CheckCircle2 className="h-4 w-4 text-signal" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-text-primary-v4">{f.title}</p>
                    <p className="text-xs text-text-secondary-v4">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </PanelCardBody>
        </PanelCard>
      </div>
    </section>
  );
}

function SiblingLinks({ title, parentTier, links }: { title: string; parentTier: string; links: { label: string; href: string }[] }) {
  if (!links || links.length === 0) return null;
  return (
    <section className="relative py-12 bg-ink-surface border-t border-hairline">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-2xl font-semibold mb-2 text-text-primary-v4">Explore Related Plans</h2>
        <p className="text-text-secondary-v4 mb-8">Compare {title} with other {parentTier} options.</p>
        <div className="flex flex-wrap justify-center gap-4">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="v4-panel px-6 py-3 hover:border-signal/40 transition-all group inline-flex items-center gap-2">
              <span className="font-medium text-sm text-text-primary-v4 group-hover:text-signal transition-colors">{link.label}</span>
              <ArrowRight className="h-4 w-4 text-text-muted-v4 group-hover:text-signal group-hover:translate-x-0.5 transition-all" />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

export function HostingSubTierPage({ data }: { data: HostingSubTierData }) {
  return (
    <>
      <PageHeroV4 eyebrow={data.eyebrow} title={<>{data.heroTitle}</>} description={data.heroDescription} />
      <Breadcrumbs items={[
        { label: 'Home', href: '/' },
        { label: 'VaultHost', href: '/vaulthost' },
        { label: data.parentTier, href: data.parentHref },
        { label: data.title },
      ]} />
      <FeatureGrid features={data.features} />
      {data.specs && (
        <section className="relative py-12 bg-ink-surface border-t border-hairline">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <ScrollReveal className="text-center mb-10">
              <h2 className="text-3xl font-semibold tracking-tight mb-3 text-text-primary-v4">Technical Specifications</h2>
              <p className="text-text-secondary-v4">Everything included in {data.title}.</p>
            </ScrollReveal>
            <div className="v4-panel overflow-hidden">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-hairline">
                {data.specs.map((spec, i) => (
                  <ScrollReveal key={spec.label} delay={i * 30}>
                    <div className="bg-ink p-5 text-center hover:bg-ink-surface-2 transition-colors">
                      <p className="text-xs uppercase tracking-wider text-text-muted-v4 mb-1">{spec.label}</p>
                      <p className="text-lg font-semibold text-text-primary-v4 tabular-nums">{spec.value}</p>
                    </div>
                  </ScrollReveal>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}
      <WhatYouGet title={data.title} features={data.features} />
      <SiblingLinks title={data.title} parentTier={data.parentTier} links={data.siblingLinks} />
      <FAQSection faqs={data.faqs} />
      <section className="relative py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-semibold tracking-tight mb-4 text-text-primary-v4">Ready to Launch with {data.title}?</h2>
          <p className="text-text-secondary-v4 mb-8">Get started in minutes. Free migration, no setup fees, and a 30-day money-back guarantee.</p>
          <a href="/vaulthost/checkout" className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-btn v4-btn-primary text-sm font-medium">
            Order Now <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </section>
    </>
  );
}

export function AddonPage({ data }: { data: { title: string; eyebrow: string; heroTitle: string; heroDescription: string; features: { icon: LucideIcon; title: string; desc: string }[]; faqs: { question: string; answer: string }[]; category: string } }) {
  return (
    <>
      <PageHeroV4 eyebrow={data.eyebrow} title={<>{data.heroTitle}</>} description={data.heroDescription} />
      <Breadcrumbs items={[
        { label: 'Home', href: '/' },
        { label: 'VaultHost', href: '/vaulthost' },
        { label: 'Add-ons', href: '/vaulthost/addons' },
        { label: data.title },
      ]} />
      <FeatureGrid features={data.features} />
      <WhatYouGet title={data.title} features={data.features} />
      <FAQSection faqs={data.faqs} />
      <section className="relative py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-semibold tracking-tight mb-4 text-text-primary-v4">Add {data.title} to Your Plan</h2>
          <p className="text-text-secondary-v4 mb-8">Boost your hosting performance with this powerful add-on. Contact our team to get started.</p>
          <a href="/vaulthost/contact" className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-btn v4-btn-primary text-sm font-medium">
            Contact Sales <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </section>
    </>
  );
}

export function LegalPage({ data }: { data: { title: string; eyebrow: string; heroTitle: string; heroDescription: string; sections: { heading: string; content: string }[] } }) {
  return (
    <>
      <PageHeroV4 eyebrow={data.eyebrow} title={<>{data.heroTitle}</>} description={data.heroDescription} />
      <Breadcrumbs items={[
        { label: 'Home', href: '/' },
        { label: 'VaultHost', href: '/vaulthost' },
        { label: data.title },
      ]} />
      <section className="relative py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="space-y-10">
            {data.sections.map((section, i) => (
              <ScrollReveal key={section.heading} delay={i * 30}>
                <div>
                  <h2 className="text-xl font-semibold mb-3 text-text-primary-v4">{section.heading}</h2>
                  <p className="text-text-secondary-v4 leading-relaxed">{section.content}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>
      <section className="relative py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-semibold tracking-tight mb-4 text-text-primary-v4">Questions About Our Policies?</h2>
          <p className="text-text-secondary-v4 mb-8">Our team is here to help. Contact us for any clarification on our terms, SLA, or privacy practices.</p>
          <a href="/contact" className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-btn v4-btn-primary text-sm font-medium">
            Contact Support <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </section>
    </>
  );
}
