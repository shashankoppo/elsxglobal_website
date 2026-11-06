'use client';

import Link from 'next/link';
import { Twitter, Linkedin, Github, Mail, MapPin, Phone, ArrowRight, CheckCircle2 } from 'lucide-react';
import { VaultHostLogo } from '@/components/ui/logo';
import { VAULTHOST_MENU } from '@/lib/nav-config';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

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

export function VaultHostFooter() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) return;
    setSubscribed(true);
    setEmail('');
    setTimeout(() => setSubscribed(false), 4000);
  };

  return (
    <footer className="bg-ink border-t border-hairline">
      {/* CTA band */}
      <div className="border-b border-hairline">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-xl font-semibold mb-1 text-text-primary-v4">Ready to launch your infrastructure?</h3>
              <p className="text-sm text-text-secondary-v4">Get started with VaultHost today. 30-day money-back guarantee.</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 lg:justify-end">
              <Link href="/vaulthost/pricing" className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-btn v4-btn-primary text-sm font-medium">
                View Plans <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/contact" className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-btn v4-btn-secondary text-sm font-medium">
                Contact Sales
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-8">
          {/* Brand + Newsletter */}
          <div className="col-span-2 sm:col-span-3 lg:col-span-2">
            <Link href="/vaulthost" className="inline-flex items-center gap-2.5 mb-3">
              <VaultHostLogo />
            </Link>
            <p className="text-sm text-text-secondary-v4 max-w-sm mb-4 leading-relaxed">
              Enterprise-grade cloud infrastructure with 38 global edge nodes, AI-Ops automation, and zero-trust security.
            </p>

            {/* Newsletter */}
            <form onSubmit={handleSubscribe} className="max-w-sm mb-4">
              <label className="v4-readout text-[10px] uppercase tracking-widest text-text-secondary-v4 mb-2 block">
                Stay updated
              </label>
              {subscribed ? (
                <div className="flex items-center gap-2 text-sm text-good">
                  <CheckCircle2 className="h-4 w-4" />
                  Subscribed!
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
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-xs text-text-muted-v4">
                <MapPin className="h-3.5 w-3.5 shrink-0" />
                <span>Mumbai | Bangalore | Delhi NCR</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-text-muted-v4">
                <Phone className="h-3.5 w-3.5 shrink-0" />
                <a href="tel:+918001234567" className="hover:text-signal transition-colors">+91 800 123 4567</a>
              </div>
              <div className="flex items-center gap-2 text-xs text-text-muted-v4">
                <Mail className="h-3.5 w-3.5 shrink-0" />
                <a href="mailto:support@vaulthost.com" className="hover:text-signal transition-colors">support@vaulthost.com</a>
              </div>
            </div>

            {/* Social */}
            <div className="flex items-center gap-3 mt-4">
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
          </div>

          {VAULTHOST_MENU.columns.slice(0, 3).map((col) => (
            <div key={col.heading}>
              <p className="v4-readout text-[10px] uppercase tracking-widest text-text-secondary-v4 mb-3">{col.heading}</p>
              <ul className="space-y-2">
                {col.items.map((item) => (
                  <li key={item.href}>
                    <FooterLink href={item.href} label={item.label} />
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom */}
        <div className="mt-10 pt-6 v4-hr flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-text-muted-v4">
            &copy; {new Date().getFullYear()} VaultHost, an ELSxGlobal product. Powered by EvolucentSphere.
          </p>
          <div className="flex items-center gap-4 flex-wrap justify-center">
            <div className="flex items-center gap-1.5">
              <span className="v4-live-dot" />
              <span className="v4-readout text-[10px] text-good uppercase tracking-widest">All Systems Operational</span>
            </div>
            <Link href="/privacy" className="text-xs text-text-muted-v4 hover:text-signal transition-colors">Privacy</Link>
            <Link href="/terms" className="text-xs text-text-muted-v4 hover:text-signal transition-colors">Terms</Link>
            <Link href="/vaulthost/legal/sla" className="text-xs text-text-muted-v4 hover:text-signal transition-colors">SLA</Link>
            <Link href="/vaulthost/status" className="text-xs text-text-muted-v4 hover:text-signal transition-colors">Status</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
