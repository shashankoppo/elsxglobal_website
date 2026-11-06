'use client';

import { PageHeroV4 } from '@/components/ui/page-hero-v4';
import { PanelCard } from '@/components/ui/panel-card';
import { ScrollReveal } from '@/components/ui/scroll-reveal';
import Link from 'next/link';
import { Github, Globe, GitBranch, ShieldCheck, Zap, Activity, LayoutTemplate, Rocket, Check } from 'lucide-react';

export default function VaultPagesPage() {
  return (
    <div className="v4-page bg-ink min-h-screen">
      <PageHeroV4 
        eyebrow="VaultPages"
        title={<>Deploy <span className="text-signal">Instantly.</span> Scale Infinitely.</>}
        description="Connect your Git repository and deploy to the global edge in seconds. Every push creates a preview URL. Every merge deploys globally. Built-in CI/CD, analytics, and Edge middleware."
      />

      {/* Stats Bar */}
      <div className="v4-section-sm border-y border-hairline bg-ink-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-medium text-text-primary-v4 mb-1">&lt;30s</div>
              <div className="text-sm text-text-muted-v4">Deploys</div>
            </div>
            <div>
              <div className="text-3xl font-medium text-text-primary-v4 mb-1">Unlimited</div>
              <div className="text-sm text-text-muted-v4">Preview URLs</div>
            </div>
            <div>
              <div className="text-3xl font-medium text-text-primary-v4 mb-1">100GB</div>
              <div className="text-sm text-text-muted-v4">Free BW/mo</div>
            </div>
            <div>
              <div className="text-3xl font-medium text-text-primary-v4 mb-1">300+</div>
              <div className="text-sm text-text-muted-v4">Edge PoPs</div>
            </div>
          </div>
        </div>
      </div>

      {/* Frameworks Grid */}
      <div className="v4-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <p className="text-center text-text-muted-v4 text-sm font-medium uppercase tracking-wider mb-8">Out-of-the-box support for</p>
          </ScrollReveal>
          <div className="flex flex-wrap justify-center gap-4">
            {['Next.js', 'Nuxt', 'SvelteKit', 'Astro', 'Remix', 'Gatsby', 'React', 'Vue'].map((fw, i) => (
              <ScrollReveal key={i} delay={i * 0.05}>
                <div className="px-6 py-3 bg-ink-surface border border-hairline rounded-full flex items-center shadow-sm">
                  <LayoutTemplate className="w-4 h-4 mr-2 text-text-secondary-v4" />
                  <span className="text-text-primary-v4 font-medium">{fw}</span>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </div>

      {/* Deploy Flow */}
      <div className="v4-section bg-ink-surface-2 border-y border-hairline">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <h2 className="v4-display text-text-primary-v4 text-center mb-16">From repo to global edge in seconds</h2>
          </ScrollReveal>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[
              { num: '1', title: 'Connect Repo', desc: 'Link your GitHub, GitLab, or Bitbucket account securely.' },
              { num: '2', title: 'Configure Build', desc: 'We automatically detect your framework and settings.' },
              { num: '3', title: 'Push Code', desc: 'Every git push triggers a fast, cached build process.' },
              { num: '4', title: 'Live Globally', desc: 'Your site is instantly distributed across 300+ locations.' }
            ].map((step, i) => (
              <ScrollReveal key={i} delay={i * 0.1}>
                <div className="p-6 relative">
                  <div className="w-12 h-12 bg-signal/10 rounded-full flex items-center justify-center text-signal font-bold text-xl mb-4">
                    {step.num}
                  </div>
                  <h3 className="text-xl font-medium text-text-primary-v4 mb-2">{step.title}</h3>
                  <p className="text-text-secondary-v4">{step.desc}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="v4-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="text-center mb-16">
              <h2 className="v4-display text-text-primary-v4 mb-4">Powerful hosting features</h2>
            </div>
          </ScrollReveal>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <ScrollReveal>
              <PanelCard className="v4-panel h-full flex flex-col p-6">
                <Github className="w-8 h-8 text-signal mb-4" />
                <h3 className="text-xl font-medium text-text-primary-v4 mb-2">Git-Connected CI/CD</h3>
                <p className="text-text-secondary-v4">Seamless integration with GitHub, GitLab, and Bitbucket for automated deployments on push.</p>
              </PanelCard>
            </ScrollReveal>
            <ScrollReveal delay={0.1}>
              <PanelCard className="v4-panel h-full flex flex-col p-6">
                <GitBranch className="w-8 h-8 text-signal mb-4" />
                <h3 className="text-xl font-medium text-text-primary-v4 mb-2">Preview Deployments</h3>
                <p className="text-text-secondary-v4">Every PR gets a unique preview URL instantly. Perfect for team reviews and testing.</p>
              </PanelCard>
            </ScrollReveal>
            <ScrollReveal delay={0.2}>
              <PanelCard className="v4-panel h-full flex flex-col p-6">
                <Zap className="w-8 h-8 text-signal mb-4" />
                <h3 className="text-xl font-medium text-text-primary-v4 mb-2">Edge Middleware</h3>
                <p className="text-text-secondary-v4">Run logic before a request finishes. Ideal for geofencing, A/B testing, and authentication.</p>
              </PanelCard>
            </ScrollReveal>
            <ScrollReveal delay={0.3}>
              <PanelCard className="v4-panel h-full flex flex-col p-6">
                <ShieldCheck className="w-8 h-8 text-signal mb-4" />
                <h3 className="text-xl font-medium text-text-primary-v4 mb-2">Custom Domains + SSL</h3>
                <p className="text-text-secondary-v4">Bring your own domain and get free, auto-renewing SSL certificates instantly provisioned.</p>
              </PanelCard>
            </ScrollReveal>
            <ScrollReveal delay={0.4}>
              <PanelCard className="v4-panel h-full flex flex-col p-6">
                <Activity className="w-8 h-8 text-signal mb-4" />
                <h3 className="text-xl font-medium text-text-primary-v4 mb-2">Web Analytics</h3>
                <p className="text-text-secondary-v4">Privacy-first, cookieless analytics built right into your dashboard to track performance.</p>
              </PanelCard>
            </ScrollReveal>
            <ScrollReveal delay={0.5}>
              <PanelCard className="v4-panel h-full flex flex-col p-6">
                <Rocket className="w-8 h-8 text-signal mb-4" />
                <h3 className="text-xl font-medium text-text-primary-v4 mb-2">Build Caching</h3>
                <p className="text-text-secondary-v4">Advanced caching strategies ensure subsequent builds take a fraction of the time.</p>
              </PanelCard>
            </ScrollReveal>
          </div>
        </div>
      </div>

      {/* Pricing */}
      <div className="v4-section bg-ink-surface-2 border-y border-hairline">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <h2 className="v4-display text-text-primary-v4 text-center mb-16">Simple Plans</h2>
          </ScrollReveal>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <ScrollReveal>
              <div className="v4-panel p-8 rounded-2xl flex flex-col h-full">
                <h3 className="text-2xl font-medium text-text-primary-v4 mb-2">Free</h3>
                <div className="text-4xl font-bold text-text-primary-v4 mb-6">₹0<span className="text-lg text-text-muted-v4 font-normal">/mo</span></div>
                <ul className="space-y-4 mb-8 flex-1">
                  <li className="flex items-center text-text-secondary-v4"><Check className="w-5 h-5 text-signal mr-3 flex-shrink-0" /> 500 builds / month</li>
                  <li className="flex items-center text-text-secondary-v4"><Check className="w-5 h-5 text-signal mr-3 flex-shrink-0" /> 100GB Bandwidth</li>
                  <li className="flex items-center text-text-secondary-v4"><Check className="w-5 h-5 text-signal mr-3 flex-shrink-0" /> Community support</li>
                </ul>
                <Link href="/portal" className="v4-btn-secondary w-full justify-center rounded-btn py-3">Get Started</Link>
              </div>
            </ScrollReveal>
            
            <ScrollReveal delay={0.1}>
              <div className="v4-panel p-8 rounded-2xl flex flex-col h-full border-signal border relative">
                <div className="absolute top-0 right-8 -translate-y-1/2 bg-signal text-ink text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">Most Popular</div>
                <h3 className="text-2xl font-medium text-text-primary-v4 mb-2">Pro</h3>
                <div className="text-4xl font-bold text-text-primary-v4 mb-6">₹499<span className="text-lg text-text-muted-v4 font-normal">/mo</span></div>
                <ul className="space-y-4 mb-8 flex-1">
                  <li className="flex items-center text-text-secondary-v4"><Check className="w-5 h-5 text-signal mr-3 flex-shrink-0" /> Unlimited builds</li>
                  <li className="flex items-center text-text-secondary-v4"><Check className="w-5 h-5 text-signal mr-3 flex-shrink-0" /> 1TB Bandwidth</li>
                  <li className="flex items-center text-text-secondary-v4"><Check className="w-5 h-5 text-signal mr-3 flex-shrink-0" /> Email support</li>
                </ul>
                <Link href="/portal" className="v4-btn-primary w-full justify-center rounded-btn py-3">Upgrade to Pro</Link>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={0.2}>
              <div className="v4-panel p-8 rounded-2xl flex flex-col h-full">
                <h3 className="text-2xl font-medium text-text-primary-v4 mb-2">Business</h3>
                <div className="text-4xl font-bold text-text-primary-v4 mb-6">₹1,999<span className="text-lg text-text-muted-v4 font-normal">/mo</span></div>
                <ul className="space-y-4 mb-8 flex-1">
                  <li className="flex items-center text-text-secondary-v4"><Check className="w-5 h-5 text-signal mr-3 flex-shrink-0" /> Priority build queue</li>
                  <li className="flex items-center text-text-secondary-v4"><Check className="w-5 h-5 text-signal mr-3 flex-shrink-0" /> 5TB Bandwidth</li>
                  <li className="flex items-center text-text-secondary-v4"><Check className="w-5 h-5 text-signal mr-3 flex-shrink-0" /> Priority support SLA</li>
                </ul>
                <Link href="/contact" className="v4-btn-secondary w-full justify-center rounded-btn py-3">Contact Sales</Link>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </div>

      {/* Premium CTA */}
      <div className="v4-section" style={{ background: 'linear-gradient(135deg, rgba(10,18,36,0.98), rgba(6,12,24,1))' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-16">
          <ScrollReveal>
            <h2 className="v4-display text-white mb-6">Ready to launch?</h2>
            <p className="text-text-secondary-v4 max-w-2xl mx-auto mb-10 text-lg">Connect your GitHub repository and deploy your site in less than a minute.</p>
            <Link href="/portal" className="v4-btn-primary inline-flex items-center rounded-btn px-8 py-4 text-lg">
              Deploy from GitHub <Github className="ml-2 w-5 h-5" />
            </Link>
          </ScrollReveal>
        </div>
      </div>
    </div>
  );
}
