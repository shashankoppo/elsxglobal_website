'use client';

import Link from 'next/link';
import { Twitter, Linkedin, Github, Mail, MapPin, Phone, ExternalLink, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Logo } from '@/components/ui/logo';
import { Button } from '@/components/ui/button';
import { useLead } from '@/components/site/lead-context';
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import {
  ENTERPRISE_MENU, VAULTHOST_MENU, INDUSTRIES_MENU, COMPANY_MENU,
} from '@/lib/nav-config';

function FooterLink({ href, label }: { href: string; label: string }) {
  const isExternal = href.startsWith('http');
  return (
    <Link
      href={href}
      {...(isExternal ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      className="text-sm text-text-muted-v4 hover:text-signal transition-colors duration-200"
    >
      {label}
    </Link>
  );
}

function FooterColumn({ title, links }: { title: string; links: { label: string; href: string }[] }) {
  return (
    <div>
      <h4 className="v4-readout text-[10px] uppercase tracking-widest text-text-secondary-v4 mb-3">{title}</h4>
      <ul className="space-y-2">
        {links.map((l) => (
          <li key={l.href + l.label}>
            <FooterLink href={l.href} label={l.label} />
          </li>
        ))}
      </ul>
    </div>
  );
}

export function EnterpriseFooterV4() {
  const { openLead } = useLead();
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) return;
    try {
      await supabase.from('leads').insert({
        full_name: 'Newsletter Subscriber',
        work_email: email.trim(),
        intent: 'newsletter',
        source: 'footer',
        message: 'Footer newsletter subscription',
      });
    } catch (_) {
      // silently fail – UI always shows success
    }
    setSubscribed(true);
    setEmail('');
    setTimeout(() => setSubscribed(false), 4000);
  };

  const engineLinks = [
    { label: 'ELSxTech (Engineering)', href: '/elsxtech' },
    { label: 'ELSxBPO (Automation)', href: '/elsxbpo' },
    { label: 'ELSxKPO (Intelligence)', href: '/elsxkpo' },
    { label: 'ELSxConsultancy (Strategy)', href: '/elsxconsultancy' },
    { label: 'VaultHost Cloud', href: '/vaulthost' },
  ];
  const serviceLinks = ENTERPRISE_MENU.columns[0].items
    .concat(ENTERPRISE_MENU.columns[1].items.slice(0, 3))
    .map((i) => ({ label: i.label, href: i.href }));
  const cloudLinks = ENTERPRISE_MENU.columns[2].items
    .concat(ENTERPRISE_MENU.columns[3].items.slice(0, 3))
    .map((i) => ({ label: i.label, href: i.href }));
  const resourceLinks = COMPANY_MENU.columns[1].items
    .map((i) => ({ label: i.label, href: i.href }));
  const industryLinks = INDUSTRIES_MENU.columns[0].items
    .concat(INDUSTRIES_MENU.columns[2].items.slice(0, 3))
    .map((i) => ({ label: i.label, href: i.href }));
  const vaultHostLinks = [
    { label: 'Edge Workers', href: '/vaulthost/workers' },
    { label: 'Object Storage (R2)', href: '/vaulthost/storage' },
    { label: 'Edge SQL (D1)', href: '/vaulthost/database' },
    { label: 'Fastest DNS', href: '/vaulthost/dns' },
    { label: 'AI Gateway', href: '/vaulthost/ai-gateway' },
    { label: 'Zero Trust & WAF', href: '/vaulthost/zero-trust' },
    { label: 'All Cloud Products', href: '/vaulthost' },
  ];
  const companyLinks = COMPANY_MENU.columns[0].items
    .map((i) => ({ label: i.label, href: i.href }));

  return (
    <footer className="bg-ink border-t border-hairline">
      {/* CTA + Newsletter band */}
      <div className="border-b border-hairline">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-xl font-semibold mb-1 text-text-primary-v4">Ready to build something great?</h3>
              <p className="text-sm text-text-secondary-v4">Book a free strategy consultation or request a proposal.</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 lg:justify-end">
              <Button onClick={() => openLead('consultation')} className="v4-btn-primary">
                Book Consultation
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button variant="outline" onClick={() => openLead('proposal')} className="v4-btn-secondary">
                Request Proposal
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-8">
          {/* Brand + Newsletter */}
          <div className="col-span-2 sm:col-span-3 lg:col-span-2">
            <Link href="/" className="inline-flex items-center gap-2.5 mb-3">
              <Logo />
            </Link>
            <p className="text-sm text-text-secondary-v4 max-w-sm mb-4 leading-relaxed">
              Enterprise technology partner delivering custom software, cloud, AI,
              and digital solutions across India and globally.
            </p>

            {/* Newsletter */}
            <form onSubmit={handleSubscribe} className="max-w-sm">
              <label className="v4-readout text-[10px] uppercase tracking-widest text-text-secondary-v4 mb-2 block">
                Stay updated
              </label>
              {subscribed ? (
                <div className="flex items-center gap-2 text-sm text-good">
                  <CheckCircle2 className="h-4 w-4" />
                  Subscribed! We&apos;ll be in touch.
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-2 flex-1 px-3 py-2 rounded-btn border border-hairline bg-ink-surface-2 focus-within:border-signal/40 transition-colors">
                    <Mail className="h-3.5 w-3.5 text-text-muted-v4 shrink-0" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@company.com"
                      className="flex-1 bg-transparent text-sm outline-none placeholder:text-text-muted-v4 text-text-primary-v4 min-w-0"
                    />
                  </div>
                  <Button type="submit" size="sm" className="v4-btn-primary shrink-0">
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </form>

            {/* Contact info */}
            <div className="mt-4 space-y-1.5">
              <div className="flex items-center gap-2 text-xs text-text-muted-v4">
                <MapPin className="h-3.5 w-3.5 shrink-0" />
                <span>Jabalpur (HQ) | Indore | Pune | Eindhoven | Chicago</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-text-muted-v4">
                <Phone className="h-3.5 w-3.5 shrink-0" />
                <span>+91 72475 58873</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-text-muted-v4">
                <Mail className="h-3.5 w-3.5 shrink-0" />
                <a href="mailto:contact@elsxglobal.cloud" className="hover:text-signal transition-colors">contact@elsxglobal.cloud</a>
              </div>
            </div>
          </div>

          <FooterColumn title="Core Engines" links={engineLinks} />
          <FooterColumn title="Development" links={serviceLinks} />
          <FooterColumn title="Cloud & Systems" links={cloudLinks} />
          <FooterColumn title="Industries" links={industryLinks} />
        </div>

        {/* Second row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-8 mt-8 pt-8 v4-hr">
          <FooterColumn title="VaultHost Cloud" links={vaultHostLinks} />
          <FooterColumn title="Company" links={companyLinks} />
          <FooterColumn title="Resources" links={resourceLinks} />
        </div>

        {/* Ecosystem Bar */}
        <div className="mt-8 pt-6 v4-hr">
          <h4 className="v4-readout text-[10px] uppercase tracking-widest text-text-muted-v4 mb-2">
            EvolucentSphere Ecosystem
          </h4>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            {[
              { label: 'EvolucentSphere Pvt. Ltd.', href: 'https://evolucentsphere.com', external: true, desc: 'Parent Company' },
              { label: 'ELSxSoftwareoverload', href: 'https://evolucentsphere.com/elsxsoftwareoverload', external: true, desc: 'Software Division' },
              { label: 'ELSxTech', href: 'https://elsxtech.blogspot.com', external: true, desc: 'Tech Consulting' },
              { label: 'VaultHost', href: '/vaulthost', external: false, desc: 'Hosting Infrastructure' },
            ].map((e) => (
              <a
                key={e.label}
                href={e.href}
                {...(e.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                className="group inline-flex items-center gap-1.5 text-sm text-text-muted-v4 hover:text-signal transition-colors"
              >
                {e.label}
                <span className="text-xs text-text-muted-v4/60">({e.desc})</span>
                {e.external && (
                  <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                )}
              </a>
            ))}
          </div>
        </div>

        {/* Social + Bottom */}
        <div className="mt-8 pt-6 v4-hr flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <a href="https://twitter.com/elsxglobal" target="_blank" rel="noopener noreferrer" className="flex h-8 w-8 items-center justify-center rounded-chip border border-hairline bg-ink-surface-2 text-text-muted-v4 hover:text-signal hover:border-hairline-2 transition-colors">
              <Twitter className="h-4 w-4" />
            </a>
            <a href="https://linkedin.com/company/elsxglobal" target="_blank" rel="noopener noreferrer" className="flex h-8 w-8 items-center justify-center rounded-chip border border-hairline bg-ink-surface-2 text-text-muted-v4 hover:text-signal hover:border-hairline-2 transition-colors">
              <Linkedin className="h-4 w-4" />
            </a>
            <a href="https://github.com/elsxglobal" target="_blank" rel="noopener noreferrer" className="flex h-8 w-8 items-center justify-center rounded-chip border border-hairline bg-ink-surface-2 text-text-muted-v4 hover:text-signal hover:border-hairline-2 transition-colors">
              <Github className="h-4 w-4" />
            </a>
          </div>
          <p className="text-xs text-text-muted-v4">
            &copy; {new Date().getFullYear()} ELSxGlobal, a division of EvolucentSphere Pvt. Ltd. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-xs text-text-muted-v4">
            <Link href="/portal" className="hover:text-signal transition-colors">Client Portal</Link>
            <Link href="/privacy" className="hover:text-signal transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-signal transition-colors">Terms of Service</Link>
            <Link href="/vaulthost/status" className="hover:text-signal transition-colors">Status</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
