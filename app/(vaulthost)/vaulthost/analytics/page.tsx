'use client';

import React from 'react';
import Link from 'next/link';
import { PageHeroV4 } from '@/components/ui/page-hero-v4';
import { PanelCard } from '@/components/ui/panel-card';
import { ScrollReveal } from '@/components/ui/scroll-reveal';
import { ShieldCheck, Activity, Gauge, Target, Route, Map, Check, X, AlertTriangle } from 'lucide-react';

export default function AnalyticsPage() {
  return (
    <div className="min-h-screen bg-[#060C18] text-slate-300 pb-24">
      <PageHeroV4 
        eyebrow="VaultAnalytics"
        title={<>Know Your Users. <span className="text-signal">Respect Their Privacy.</span></>}
        description="Cookieless, GDPR-compliant web analytics that gives you actionable insights without tracking individuals. No consent banners needed. Powered by edge computing for real-time data."
      />

      {/* Stats */}
      <section className="py-12 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { label: 'Tracking Strategy', value: 'Cookieless' },
              { label: 'Compliance', value: 'GDPR/CCPA' },
              { label: 'Data Processing', value: 'Real-time' },
              { label: 'Performance', value: 'Core Web Vitals' },
            ].map((stat, i) => (
              <ScrollReveal key={i} delay={i * 0.1}>
                <div className="text-3xl font-light text-white mb-2">{stat.value}</div>
                <div className="text-sm text-slate-400">{stat.label}</div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-light text-white mb-4 v4-display">Actionable Insights</h2>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto">Everything you need to understand your audience, without compromising their privacy.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <PanelCard
              title="Cookieless Tracking"
              description="Privacy-first approach means no cookies are stored on user devices. Say goodbye to annoying consent banners."
              icon={<ShieldCheck className="w-5 h-5 text-signal" />}
            />
            <PanelCard
              title="Real-Time Dashboard"
              description="Watch your traffic live as it happens. Insights are processed at the edge and updated instantly."
              icon={<Activity className="w-5 h-5 text-signal" />}
            />
            <PanelCard
              title="Core Web Vitals"
              description="Track real user performance metrics including LCP, FID, CLS, FCP, and TTFB directly in your analytics."
              icon={<Gauge className="w-5 h-5 text-signal" />}
            />
            <PanelCard
              title="Custom Events"
              description="Track button clicks, form submissions, purchases, and any other important user actions with simple API calls."
              icon={<Target className="w-5 h-5 text-signal" />}
            />
            <PanelCard
              title="Funnels & Journeys"
              description="Understand how users navigate your site, identify drop-off points, and optimize conversion rates."
              icon={<Route className="w-5 h-5 text-signal" />}
            />
            <PanelCard
              title="Geographic Breakdown"
              description="See where your visitors are coming from, what devices they use, and how they found your website."
              icon={<Map className="w-5 h-5 text-signal" />}
            />
          </div>
        </div>
      </section>

      {/* Dashboard Preview & Comparison */}
      <section className="py-24 bg-white/[0.02]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            
            {/* Dashboard Mock */}
            <div>
              <h2 className="text-3xl md:text-4xl font-light text-white mb-8 v4-display">Beautiful, Simple Dashboard</h2>
              <div className="bg-[#0A1224] border border-white/10 rounded-2xl p-6 text-sm">
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-white/5 rounded-lg p-4">
                    <div className="text-slate-400 mb-1">Pageviews</div>
                    <div className="text-2xl text-white">124,592</div>
                  </div>
                  <div className="bg-white/5 rounded-lg p-4">
                    <div className="text-slate-400 mb-1">Unique Visitors</div>
                    <div className="text-2xl text-white">45,102</div>
                  </div>
                  <div className="bg-white/5 rounded-lg p-4">
                    <div className="text-slate-400 mb-1">Bounce Rate</div>
                    <div className="text-2xl text-white">42.8%</div>
                  </div>
                  <div className="bg-white/5 rounded-lg p-4">
                    <div className="text-slate-400 mb-1">Avg Session</div>
                    <div className="text-2xl text-white">2m 14s</div>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-1 bg-white/5 rounded-lg p-4">
                    <div className="text-slate-400 mb-3 border-b border-white/10 pb-2">Top Pages</div>
                    <div className="space-y-2">
                      <div className="flex justify-between"><span>/</span> <span>45k</span></div>
                      <div className="flex justify-between"><span>/pricing</span> <span>12k</span></div>
                      <div className="flex justify-between"><span>/blog</span> <span>8k</span></div>
                    </div>
                  </div>
                  <div className="flex-1 bg-white/5 rounded-lg p-4">
                    <div className="text-slate-400 mb-3 border-b border-white/10 pb-2">Traffic Sources</div>
                    <div className="space-y-2">
                      <div className="flex justify-between"><span>Google</span> <span>52%</span></div>
                      <div className="flex justify-between"><span>Direct</span> <span>28%</span></div>
                      <div className="flex justify-between"><span>Twitter</span> <span>12%</span></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Comparison */}
            <div>
              <h2 className="text-3xl md:text-4xl font-light text-white mb-8 v4-display">VaultAnalytics vs Google Analytics</h2>
              <div className="bg-[#0A1224] border border-white/10 rounded-2xl overflow-hidden">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-white/10 bg-black/20">
                      <th className="px-6 py-4 font-medium text-white">Feature</th>
                      <th className="px-6 py-4 font-medium text-white">VaultAnalytics</th>
                      <th className="px-6 py-4 font-medium text-slate-400">Google Analytics</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-slate-300">
                    <tr>
                      <td className="px-6 py-4">Privacy-First</td>
                      <td className="px-6 py-4"><Check className="w-5 h-5 text-emerald-400" /></td>
                      <td className="px-6 py-4"><X className="w-5 h-5 text-rose-400" /></td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4">No Cookies Used</td>
                      <td className="px-6 py-4"><Check className="w-5 h-5 text-emerald-400" /></td>
                      <td className="px-6 py-4"><X className="w-5 h-5 text-rose-400" /></td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4">GDPR Compliant By Default</td>
                      <td className="px-6 py-4"><Check className="w-5 h-5 text-emerald-400" /></td>
                      <td className="px-6 py-4"><AlertTriangle className="w-5 h-5 text-amber-400" /></td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4">Real-Time Data</td>
                      <td className="px-6 py-4"><Check className="w-5 h-5 text-emerald-400" /></td>
                      <td className="px-6 py-4 text-sm">Delayed</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4">You Own Your Data</td>
                      <td className="px-6 py-4"><Check className="w-5 h-5 text-emerald-400" /></td>
                      <td className="px-6 py-4"><X className="w-5 h-5 text-rose-400" /></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-light text-white mb-4 v4-display">Simple, Fair Pricing</h2>
            <p className="text-lg text-slate-400">Priced based on traffic, not features.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 rounded-2xl bg-white/5 border border-white/10">
              <h3 className="text-xl text-white mb-2">Free</h3>
              <div className="text-3xl font-light text-white mb-6">₹0<span className="text-lg text-slate-400">/mo</span></div>
              <ul className="space-y-3 text-slate-300">
                <li>100K Pageviews/mo</li>
                <li>Standard Dashboards</li>
                <li>Community Support</li>
              </ul>
            </div>
            
            <div className="p-8 rounded-2xl bg-[#0A1224] border border-signal/30 relative">
              <div className="absolute top-0 right-8 -translate-y-1/2 px-3 py-1 bg-signal text-[#060C18] text-xs font-medium rounded-full">Most Popular</div>
              <h3 className="text-xl text-white mb-2">Pro</h3>
              <div className="text-3xl font-light text-white mb-6">₹299<span className="text-lg text-slate-400">/mo</span></div>
              <ul className="space-y-3 text-slate-300">
                <li>5M Pageviews/mo</li>
                <li>Custom Events & Funnels</li>
                <li>Priority Support</li>
              </ul>
            </div>
            
            <div className="p-8 rounded-2xl bg-white/5 border border-white/10">
              <h3 className="text-xl text-white mb-2">Business</h3>
              <div className="text-3xl font-light text-white mb-6">₹999<span className="text-lg text-slate-400">/mo</span></div>
              <ul className="space-y-3 text-slate-300">
                <li>Unlimited Pageviews</li>
                <li>Data Export & API Access</li>
                <li>Dedicated Account Manager</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-white/[0.02]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div 
            className="rounded-3xl p-12 text-center border border-white/10"
            style={{ background: 'linear-gradient(135deg, rgba(10,18,36,0.98), rgba(6,12,24,1))' }}
          >
            <h2 className="text-3xl md:text-4xl font-light text-white mb-6 v4-display">Get started in minutes.</h2>
            <p className="text-lg text-slate-400 mb-8 max-w-2xl mx-auto">Add a single, lightweight script to your website and start getting insights instantly.</p>
            <Link 
              href="/portal" 
              className="inline-flex items-center justify-center h-12 px-8 rounded-lg bg-white text-[#060C18] font-medium hover:bg-slate-200 transition-colors"
            >
              Add analytics to your site →
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
