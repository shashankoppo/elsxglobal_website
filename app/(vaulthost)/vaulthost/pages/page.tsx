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
      <section className="v4-section border-t border-hairline">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="v4-display text-text-primary-v4 mb-4">Simple, Transparent Pricing</h2>
            <p className="text-text-secondary-v4">Higher than GoDaddy. Way below AWS.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {/* Free tier */}
            <div className="v4-panel rounded-2xl p-6 border border-hairline flex flex-col justify-between">
              <div>
                <div className="text-text-muted-v4 text-sm font-medium mb-2">FREE</div>
                <div className="text-3xl font-bold text-text-primary-v4 mb-1">₹0 <span className="text-sm font-normal text-text-muted-v4">/mo</span></div>
                <p className="text-text-secondary-v4 text-sm mb-6">Fast git-connected deployments for personal sites and portfolios.</p>
                <ul className="space-y-3 mb-8 text-sm">
                  <li className="flex items-center text-text-secondary-v4"><Check className="w-4 h-4 text-signal mr-2.5 flex-shrink-0" /> 500 builds / month</li>
                  <li className="flex items-center text-text-secondary-v4"><Check className="w-4 h-4 text-signal mr-2.5 flex-shrink-0" /> 100GB edge bandwidth / month</li>
                  <li className="flex items-center text-text-secondary-v4"><Check className="w-4 h-4 text-signal mr-2.5 flex-shrink-0" /> Unlimited preview environments</li>
                  <li className="flex items-center text-text-secondary-v4"><Check className="w-4 h-4 text-signal mr-2.5 flex-shrink-0" /> Automatic SSL &amp; custom domains</li>
                  <li className="flex items-center text-text-secondary-v4"><Check className="w-4 h-4 text-signal mr-2.5 flex-shrink-0" /> Community support</li>
                </ul>
              </div>
              <Link href="/vaulthost/signup" className="v4-btn-secondary rounded-btn w-full text-center block py-2.5">Start Free</Link>
            </div>
            {/* Pro tier — highlighted */}
            <div className="v4-panel rounded-2xl p-6 border-2 border-signal relative flex flex-col justify-between">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-signal text-ink text-xs font-semibold px-3 py-1 rounded-full">MOST POPULAR</div>
              <div>
                <div className="text-signal text-sm font-medium mb-2">PRO</div>
                <div className="text-3xl font-bold text-text-primary-v4 mb-1">₹499 <span className="text-sm font-normal text-text-muted-v4">/mo</span></div>
                <p className="text-text-secondary-v4 text-sm mb-6">Unlimited builds with edge SSR rendering for commercial web apps.</p>
                <ul className="space-y-3 mb-8 text-sm">
                  <li className="flex items-center text-text-secondary-v4"><Check className="w-4 h-4 text-signal mr-2.5 flex-shrink-0" /> Unlimited builds / month</li>
                  <li className="flex items-center text-text-secondary-v4"><Check className="w-4 h-4 text-signal mr-2.5 flex-shrink-0" /> 1TB edge bandwidth / month</li>
                  <li className="flex items-center text-text-secondary-v4"><Check className="w-4 h-4 text-signal mr-2.5 flex-shrink-0" /> Next.js 14/15 App Router &amp; SSR support</li>
                  <li className="flex items-center text-text-secondary-v4"><Check className="w-4 h-4 text-signal mr-2.5 flex-shrink-0" /> Edge caching with stale-while-revalidate</li>
                  <li className="flex items-center text-text-secondary-v4"><Check className="w-4 h-4 text-signal mr-2.5 flex-shrink-0" /> Priority email &amp; ticket support</li>
                </ul>
              </div>
              <Link href="/vaulthost/checkout?plan=pages-pro" className="v4-btn-primary rounded-btn w-full text-center block py-2.5">Get Started</Link>
            </div>
            {/* Business tier */}
            <div className="v4-panel rounded-2xl p-6 border border-hairline flex flex-col justify-between">
              <div>
                <div className="text-text-muted-v4 text-sm font-medium mb-2">BUSINESS</div>
                <div className="text-3xl font-bold text-text-primary-v4 mb-1">₹1,999 <span className="text-sm font-normal text-text-muted-v4">/mo</span></div>
                <p className="text-text-secondary-v4 text-sm mb-6">High-traffic enterprise frontends with priority build queues.</p>
                <ul className="space-y-3 mb-8 text-sm">
                  <li className="flex items-center text-text-secondary-v4"><Check className="w-4 h-4 text-signal mr-2.5 flex-shrink-0" /> Unlimited concurrent builds</li>
                  <li className="flex items-center text-text-secondary-v4"><Check className="w-4 h-4 text-signal mr-2.5 flex-shrink-0" /> 5TB edge bandwidth / month</li>
                  <li className="flex items-center text-text-secondary-v4"><Check className="w-4 h-4 text-signal mr-2.5 flex-shrink-0" /> Custom edge caching headers &amp; WAF rules</li>
                  <li className="flex items-center text-text-secondary-v4"><Check className="w-4 h-4 text-signal mr-2.5 flex-shrink-0" /> Dedicated build runners (instant starts)</li>
                  <li className="flex items-center text-text-secondary-v4"><Check className="w-4 h-4 text-signal mr-2.5 flex-shrink-0" /> 99.99% uptime SLA &amp; dedicated engineer</li>
                </ul>
              </div>
              <Link href="/vaulthost/checkout?plan=pages-business" className="v4-btn-primary rounded-btn w-full text-center block py-2.5">Get Started</Link>
            </div>
          </div>
          {/* Competitor comparison */}
          <div className="border border-hairline rounded-2xl overflow-hidden mb-12">
            <table className="w-full text-sm">
              <thead className="bg-ink-surface-2 text-text-secondary-v4">
                <tr>
                  <th className="py-3 px-4 text-left font-medium">Provider</th>
                  <th className="py-3 px-4 text-left font-medium">Pricing</th>
                  <th className="py-3 px-4 text-left font-medium">Comparison / Advantage</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-hairline">
                <tr className="bg-signal/5">
                  <td className="py-3 px-4 font-semibold text-signal">VaultHost Pages</td>
                  <td className="py-3 px-4 font-medium text-text-primary-v4">₹0 Free / ₹499 Pro / ₹1,999 Business</td>
                  <td className="py-3 px-4 text-text-secondary-v4">Flat team pricing (no per-seat fee), Next.js SSR supported, 300+ edge locations</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 text-text-primary-v4">Vercel Pro</td>
                  <td className="py-3 px-4 text-text-secondary-v4">₹1,650/mo ($20) per seat</td>
                  <td className="py-3 px-4 text-text-secondary-v4">Charges escalate per team member + steep bandwidth overage rates</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 text-text-primary-v4">Netlify Pro</td>
                  <td className="py-3 px-4 text-text-secondary-v4">₹1,580/mo ($19) per seat</td>
                  <td className="py-3 px-4 text-text-secondary-v4">Caps concurrent build minutes and requires enterprise tier for SSO</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 text-text-primary-v4">AWS Amplify</td>
                  <td className="py-3 px-4 text-text-secondary-v4">₹1,800 - ₹4,500/mo</td>
                  <td className="py-3 px-4 text-text-secondary-v4">Complex backend CloudFormation stacks with unpredictable hosting charges</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}
