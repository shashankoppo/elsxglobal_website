'use client';

import React from 'react';
import Link from 'next/link';
import { PageHeroV4 } from '@/components/ui/page-hero-v4';
import { PanelCard } from '@/components/ui/panel-card';
import { ScrollReveal } from '@/components/ui/scroll-reveal';
import { Mail, Settings, Zap, Users, Shield, Server, FileCode2 } from 'lucide-react';

export default function EmailRoutingPage() {
  return (
    <div className="min-h-screen bg-[#060C18] text-slate-300 pb-24">
      <PageHeroV4 
        eyebrow="Email Routing"
        title={<>Custom Domain Email. <span className="text-signal">Zero Inbox Needed.</span></>}
        description="Forward emails from @yourdomain.com to any inbox — Gmail, Outlook, iCloud, anywhere. Create unlimited custom addresses, set up catch-all rules, and process emails with Workers logic."
      />

      {/* Stats */}
      <section className="py-12 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { label: 'Email Addresses', value: 'Unlimited' },
              { label: 'Forwarding', value: 'Instant' },
              { label: 'Authentication', value: 'SPF/DKIM Auto' },
              { label: 'Advanced Logic', value: 'Workers' },
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
            <h2 className="text-3xl md:text-4xl font-light text-white mb-4 v4-display">Powerful Email Routing</h2>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto">Manage your domain's email with unprecedented control and simplicity.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <PanelCard
              title="Custom Addresses"
              description="Create addresses like hello@yourdomain.com and route them seamlessly to your personal Gmail or company inbox."
              icon={<Mail className="w-5 h-5 text-signal" />}
            />
            <PanelCard
              title="Catch-All Rules"
              description="Never miss an email. Route anything@yourdomain.com to a single inbox for complete coverage."
              icon={<Settings className="w-5 h-5 text-signal" />}
            />
            <PanelCard
              title="Workers Processing"
              description="Run JavaScript/TypeScript code on incoming emails. Auto-reply, parse contents, or store data in a database."
              icon={<Zap className="w-5 h-5 text-signal" />}
            />
            <PanelCard
              title="Multiple Destinations"
              description="Forward a single incoming address to multiple recipients simultaneously. Great for team inboxes."
              icon={<Users className="w-5 h-5 text-signal" />}
            />
            <PanelCard
              title="SPF + DKIM Auto-Setup"
              description="We automatically configure the necessary DNS records to ensure your forwarded emails don't end up in spam."
              icon={<Shield className="w-5 h-5 text-signal" />}
            />
            <PanelCard
              title="No Email Server Needed"
              description="Skip the complex setup and maintenance of mail servers. We handle all the infrastructure for you."
              icon={<Server className="w-5 h-5 text-signal" />}
            />
          </div>
        </div>
      </section>

      {/* Examples & Workers */}
      <section className="py-24 bg-white/[0.02]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            
            {/* Table */}
            <div>
              <h2 className="text-3xl md:text-4xl font-light text-white mb-8 v4-display">Routing Rules</h2>
              <div className="bg-[#0A1224] border border-white/10 rounded-2xl overflow-hidden">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-white/10 bg-black/20">
                      <th className="px-6 py-4 font-medium text-slate-300">Incoming Address</th>
                      <th className="px-6 py-4 font-medium text-slate-300">Destination</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-slate-400">
                    <tr>
                      <td className="px-6 py-4">hi@yourdomain.com</td>
                      <td className="px-6 py-4">personal@gmail.com</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4">support@yourdomain.com</td>
                      <td className="px-6 py-4">team@company.com</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4">*@yourdomain.com</td>
                      <td className="px-6 py-4">catch@gmail.com</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Workers Code */}
            <div>
              <h2 className="text-3xl md:text-4xl font-light text-white mb-8 v4-display">Programmable Email</h2>
              <div className="bg-[#0A1224] border border-white/10 rounded-2xl overflow-hidden">
                <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-black/20">
                  <div className="flex items-center gap-2">
                    <FileCode2 className="w-5 h-5 text-slate-400" />
                    <span className="text-sm font-mono text-slate-300">email-worker.ts</span>
                  </div>
                </div>
                <div className="p-6 overflow-x-auto">
                  <pre className="text-sm font-mono text-emerald-400">
                    <code>{`export default {
  async email(message, env, ctx) {
    // Read the email stream
    const rawEmail = await new Response(message.raw).text();
    
    // Parse the email subject and sender
    const subject = message.headers.get("subject");
    const from = message.from;

    // Store in D1 database
    await env.DB.prepare(
      "INSERT INTO emails (from, subject, body) VALUES (?, ?, ?)"
    ).bind(from, subject, rawEmail).run();

    // Optionally forward it anyway
    await message.forward("archive@mycompany.com");
  }
};`}</code>
                  </pre>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-light text-white mb-4 v4-display">Simple Pricing</h2>
            <p className="text-lg text-slate-400">Start routing emails for free.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 rounded-2xl bg-white/5 border border-white/10">
              <h3 className="text-xl text-white mb-2">Free</h3>
              <div className="text-3xl font-light text-white mb-6">₹0<span className="text-lg text-slate-400">/mo</span></div>
              <ul className="space-y-3 text-slate-300">
                <li>10 Routing Rules</li>
                <li>1 Custom Domain</li>
                <li>Community Support</li>
              </ul>
            </div>
            
            <div className="p-8 rounded-2xl bg-[#0A1224] border border-signal/30 relative">
              <div className="absolute top-0 right-8 -translate-y-1/2 px-3 py-1 bg-signal text-[#060C18] text-xs font-medium rounded-full">Most Popular</div>
              <h3 className="text-xl text-white mb-2">Pro</h3>
              <div className="text-3xl font-light text-white mb-6">₹149<span className="text-lg text-slate-400">/mo</span></div>
              <ul className="space-y-3 text-slate-300">
                <li>Unlimited Routing Rules</li>
                <li>Unlimited Custom Domains</li>
                <li>Workers Processing</li>
              </ul>
            </div>
            
            <div className="p-8 rounded-2xl bg-white/5 border border-white/10">
              <h3 className="text-xl text-white mb-2">Enterprise</h3>
              <div className="text-3xl font-light text-white mb-6">Custom</div>
              <ul className="space-y-3 text-slate-300">
                <li>Dedicated IP Addresses</li>
                <li>Custom SLA</li>
                <li>24/7 Priority Support</li>
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
            <h2 className="text-3xl md:text-4xl font-light text-white mb-6 v4-display">Ready to streamline your inbox?</h2>
            <p className="text-lg text-slate-400 mb-8 max-w-2xl mx-auto">Set up your first routing rule in seconds.</p>
            <Link 
              href="/portal" 
              className="inline-flex items-center justify-center h-12 px-8 rounded-lg bg-white text-[#060C18] font-medium hover:bg-slate-200 transition-colors"
            >
              Set up email routing →
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
