'use client';

import { PageHeroV4 } from '@/components/ui/page-hero-v4';
import { PanelCard } from '@/components/ui/panel-card';
import { ScrollReveal } from '@/components/ui/scroll-reveal';
import Link from 'next/link';
import {
  Sparkles,
  Layers,
  Layout,
  Search,
  ShoppingCart,
  Smartphone,
  Check,
  ArrowRight,
  Globe,
  Clock,
  Wand2,
  MousePointerClick,
  Rocket,
  Shield,
  Palette,
} from 'lucide-react';

export default function WebsiteBuilderPage() {
  const plans = [
    {
      name: 'Starter',
      price: '₹99',
      unit: '/month',
      popular: false,
      specs: {
        pages: 'Up to 5 Pages',
        storage: '10 GB NVMe Storage',
        ecommerce: 'No Ecommerce',
      },
      features: [
        'AI Copywriting & Layout Assistant',
        '100+ Designer Templates',
        'Free Automated Let’s Encrypt SSL',
        'Mobile-Responsive Viewport Editor',
        'Custom Domain Connection',
        'Weekly Automated Cloud Backups',
        'Standard Community & Ticket Support',
      ],
      ctaText: 'Start Building',
    },
    {
      name: 'Business',
      price: '₹299',
      unit: '/month',
      popular: true,
      specs: {
        pages: 'Unlimited Pages',
        storage: '50 GB NVMe Storage',
        ecommerce: 'Up to 100 Products',
      },
      features: [
        'Free Custom Domain (1st Year)',
        'Full AI Text & Image Generation Engine',
        'Integrated Ecommerce & Order Dashboard',
        'Razorpay, Stripe & UPI Payment Gateways',
        '0% Transaction Commission Fees',
        'Built-in Technical SEO & Schema Markup',
        'Custom Business Email (1 Mailbox)',
        'Priority 24/7 Support',
      ],
      ctaText: 'Start Business Plan',
    },
    {
      name: 'Pro',
      price: '₹699',
      unit: '/month',
      popular: false,
      specs: {
        pages: 'Unlimited Pages',
        storage: '100 GB NVMe Storage',
        ecommerce: 'Unlimited Products',
      },
      features: [
        'Unlimited Ecommerce Catalog & SKUs',
        'Custom Code, CSS & Webhook Injection',
        'Automated Abandoned Cart Recovery',
        'Multi-Currency & International Tax Engine',
        'Daily Automated Snapshots & 1-Click Restore',
        'Ultra-Fast Global CDN Acceleration',
        'Dedicated VIP Account Specialist',
      ],
      ctaText: 'Start Pro Plan',
    },
  ];

  const features = [
    {
      title: 'AI Content Generator',
      description: 'Generate high-converting headlines, value propositions, product descriptions, and SEO-tuned articles tailored specifically to your target niche.',
      icon: <Sparkles className="h-5 w-5" />,
    },
    {
      title: 'Drag & Drop Visual Editor',
      description: 'Effortlessly position containers, customize color palettes, refine typography, and arrange page elements without writing a single line of CSS.',
      icon: <Layout className="h-5 w-5" />,
    },
    {
      title: '100+ Designer Templates',
      description: 'Engineered by elite web designers across dozens of sectors including ecommerce, consultancies, SaaS, dining, and portfolio showcases.',
      icon: <Layers className="h-5 w-5" />,
    },
    {
      title: 'Built-in SEO Tools',
      description: 'Automated XML sitemaps, OpenGraph metadata previews, canonical tags, and structured JSON-LD schema ensure peak ranking performance on Google.',
      icon: <Search className="h-5 w-5" />,
    },
    {
      title: 'Ecommerce & Payments',
      description: 'Accept credit cards, debit cards, UPI, and net banking with native checkout integration. Manage inventories, orders, and taxes seamlessly.',
      icon: <ShoppingCart className="h-5 w-5" />,
    },
    {
      title: 'Mobile-Optimized by Default',
      description: 'Every layout dynamically responds to mobile screens, tablets, and desktop resolutions, with instant live previews for all device viewports.',
      icon: <Smartphone className="h-5 w-5" />,
    },
  ];

  const steps = [
    {
      step: '01',
      title: 'Describe Your Business',
      desc: 'Type a short prompt detailing what your business offers, your primary goals, and preferred aesthetic style.',
      icon: <Wand2 className="h-6 w-6 text-signal" />,
    },
    {
      step: '02',
      title: 'AI Generates Everything in 60s',
      desc: 'Our proprietary model builds custom layouts, writes engaging marketing copy, sources graphics, and structures navigation.',
      icon: <Rocket className="h-6 w-6 text-signal" />,
    },
    {
      step: '03',
      title: 'Fine-Tune & Launch',
      desc: 'Tweak details with intuitive drag-and-drop tools, connect your custom domain name, and publish live to our global edge network.',
      icon: <MousePointerClick className="h-6 w-6 text-signal" />,
    },
  ];

  const categories = [
    'E-Commerce & Retail',
    'SaaS & Tech Startups',
    'Creative & Design Agencies',
    'Restaurants & Food Cafes',
    'Portfolios & Freelancers',
    'Real Estate & Architecture',
    'Health & Wellness Studios',
    'Consulting & Professional Services',
  ];

  return (
    <div className="v4-page bg-ink min-h-screen">
      <PageHeroV4
        eyebrow="AI Website Builder"
        title={<>Build a Website in <span className="text-signal">60 Seconds.</span></>}
        description="Describe your business and AI generates a complete website. No coding. No design skills. Plans from ₹99/mo."
      />

      {/* Stats Bar */}
      <div className="v4-section-sm border-y border-hairline bg-ink-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-medium text-text-primary-v4 mb-1">100+</div>
              <div className="text-sm text-text-muted-v4">Designer Templates</div>
            </div>
            <div>
              <div className="text-3xl font-medium text-text-primary-v4 mb-1">60s</div>
              <div className="text-sm text-text-muted-v4">AI Generation Speed</div>
            </div>
            <div>
              <div className="text-3xl font-medium text-text-primary-v4 mb-1">Free</div>
              <div className="text-sm text-text-muted-v4">Custom Domain Included</div>
            </div>
            <div>
              <div className="text-3xl font-medium text-text-primary-v4 mb-1">99.9%</div>
              <div className="text-sm text-text-muted-v4">Uptime SLA</div>
            </div>
          </div>
        </div>
      </div>

      {/* Pricing Section */}
      <div className="v4-section bg-ink">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="text-center mb-16">
              <span className="v4-readout text-[11px] font-semibold uppercase tracking-widest text-signal px-3 py-1 rounded-full border border-signal/30 bg-signal/5">
                Simple Transparent Pricing
              </span>
              <h2 className="mt-4 text-3xl sm:text-4xl v4-display text-text-primary-v4">
                Choose the Ideal Plan for Your Online Journey
              </h2>
              <p className="mt-3 text-text-secondary-v4 max-w-2xl mx-auto text-base">
                Everything you need to launch, market, and monetize your website with zero hidden fees.
              </p>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {plans.map((plan, idx) => (
              <ScrollReveal key={plan.name} delay={idx * 0.1}>
                <div
                  className={`v4-panel p-8 rounded-2xl flex flex-col h-full relative transition-all ${
                    plan.popular
                      ? 'border-signal ring-1 ring-signal/50 bg-ink-surface'
                      : 'border-hairline bg-ink-surface/60 hover:border-hairline-2'
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute top-0 right-8 -translate-y-1/2 bg-signal text-ink text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                      Most Popular
                    </div>
                  )}
                  <div className="mb-6">
                    <h3 className="text-2xl font-medium text-text-primary-v4">{plan.name}</h3>
                    <div className="mt-4 flex items-baseline gap-1">
                      <span className="text-4xl font-bold text-text-primary-v4">{plan.price}</span>
                      <span className="text-sm text-text-muted-v4 font-mono">{plan.unit}</span>
                    </div>
                    <div className="mt-4 grid grid-cols-3 gap-2 border-y border-hairline py-3 text-center">
                      <div>
                        <div className="text-[11px] text-text-muted-v4 uppercase">Pages</div>
                        <div className="text-xs font-semibold text-text-primary-v4 mt-0.5">{plan.specs.pages}</div>
                      </div>
                      <div>
                        <div className="text-[11px] text-text-muted-v4 uppercase">Storage</div>
                        <div className="text-xs font-semibold text-text-primary-v4 mt-0.5">{plan.specs.storage}</div>
                      </div>
                      <div>
                        <div className="text-[11px] text-text-muted-v4 uppercase">Store</div>
                        <div className="text-xs font-semibold text-text-primary-v4 mt-0.5">{plan.specs.ecommerce}</div>
                      </div>
                    </div>
                  </div>

                  <ul className="space-y-3 mb-8 flex-1">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start text-sm text-text-secondary-v4">
                        <Check className="w-4 h-4 text-signal mr-3 flex-shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Link
                    href="/portal/signup"
                    className={`w-full justify-center rounded-btn py-3 text-sm font-semibold transition-all ${
                      plan.popular ? 'v4-btn-primary' : 'v4-btn-secondary'
                    }`}
                  >
                    {plan.ctaText}
                  </Link>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </div>

      {/* Feature Cards Grid */}
      <div className="v4-section bg-ink-surface-2 border-y border-hairline">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="text-center mb-16">
              <h2 className="v4-display text-text-primary-v4 text-3xl sm:text-4xl mb-4">
                Packed with Next-Gen Website Creation Tools
              </h2>
              <p className="text-text-secondary-v4 max-w-2xl mx-auto text-base">
                Everything required to transform a simple prompt into an enterprise-grade web presence.
              </p>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feat, i) => (
              <ScrollReveal key={feat.title} delay={i * 0.1}>
                <PanelCard
                  title={feat.title}
                  description={feat.description}
                  icon={feat.icon}
                  className="h-full"
                />
              </ScrollReveal>
            ))}
          </div>
        </div>
      </div>

      {/* How It Works (3 Steps) */}
      <div className="v4-section bg-ink">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="text-center mb-16">
              <span className="v4-readout text-[11px] font-semibold uppercase tracking-widest text-signal px-3 py-1 rounded-full border border-signal/30 bg-signal/5">
                Simple 3-Step Process
              </span>
              <h2 className="mt-4 text-3xl sm:text-4xl v4-display text-text-primary-v4">
                How VaultHost AI Builder Works
              </h2>
              <p className="mt-3 text-text-secondary-v4 max-w-xl mx-auto text-base">
                From concept to a live responsive website in three painless steps.
              </p>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((item, i) => (
              <ScrollReveal key={item.step} delay={i * 0.15}>
                <div className="v4-panel p-8 rounded-2xl border border-hairline bg-ink-surface/50 relative flex flex-col h-full hover:border-signal/50 transition-all">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-hairline bg-ink-surface-2">
                      {item.icon}
                    </div>
                    <span className="v4-readout text-xl font-mono text-signal font-bold">{item.step}</span>
                  </div>
                  <h3 className="text-xl font-medium text-text-primary-v4 mb-3">{item.title}</h3>
                  <p className="text-text-secondary-v4 text-sm leading-relaxed flex-1">{item.desc}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </div>

      {/* Template Categories Chips */}
      <div className="v4-section-sm bg-ink-surface border-y border-hairline">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="text-center mb-8">
              <h2 className="v4-display text-2xl sm:text-3xl text-text-primary-v4 mb-2">
                Templates Curated for Every Industry
              </h2>
              <p className="text-text-secondary-v4 text-sm max-w-xl mx-auto">
                Select from our library of 100+ modern themes, fully responsive and customizable.
              </p>
            </div>
          </ScrollReveal>

          <div className="flex flex-wrap justify-center gap-3">
            {categories.map((cat, i) => (
              <ScrollReveal key={cat} delay={i * 0.05}>
                <div className="v4-panel px-4 py-2.5 rounded-full border border-hairline bg-ink-surface-2 text-text-primary-v4 text-xs font-medium flex items-center gap-2 hover:border-signal/40 transition-colors">
                  <Palette className="h-3.5 w-3.5 text-signal" />
                  <span>{cat}</span>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="v4-section" style={{ background: 'linear-gradient(135deg, rgba(10,18,36,0.98), rgba(6,12,24,1))' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-16">
          <ScrollReveal>
            <h2 className="v4-display text-white text-3xl sm:text-4xl mb-6">
              Create Your New Website Right Now
            </h2>
            <p className="text-text-secondary-v4 max-w-2xl mx-auto mb-10 text-base sm:text-lg">
              No technical experience required. Describe what you do and let AI generate a stunning, mobile-ready website in under 60 seconds.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link href="/portal/signup" className="v4-btn-primary inline-flex items-center justify-center rounded-btn px-8 py-3.5 text-base font-semibold">
                Start Building Free <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
              <Link href="/vaulthost/compare" className="v4-btn-secondary inline-flex items-center justify-center rounded-btn px-8 py-3.5 text-base font-semibold">
                Compare All Hosting Options
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </div>
  );
}
