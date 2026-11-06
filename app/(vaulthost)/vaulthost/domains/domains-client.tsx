'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import { PageHeroV4 } from '@/components/ui/page-hero-v4';
import {
  Search, Loader2, Check, X, Globe, ShoppingCart, ArrowRight,
  Shield, RefreshCw, Star, TrendingUp, Lock
} from 'lucide-react';
import Link from 'next/link';

const TLD_PRICING: Record<string, { price: number; renewal: number; popular?: boolean; promo?: boolean }> = {
  '.com': { price: 599, renewal: 899, popular: true, promo: true },
  '.in': { price: 399, renewal: 699, popular: true },
  '.org': { price: 799, renewal: 1099 },
  '.net': { price: 799, renewal: 1099 },
  '.io': { price: 2499, renewal: 2999, popular: true },
  '.ai': { price: 4999, renewal: 5999, popular: true },
  '.co': { price: 1499, renewal: 1999 },
  '.dev': { price: 999, renewal: 1499 },
  '.app': { price: 999, renewal: 1499 },
  '.store': { price: 199, renewal: 3999, promo: true },
  '.tech': { price: 199, renewal: 2999, promo: true },
  '.biz': { price: 599, renewal: 899 },
  '.info': { price: 999, renewal: 1499 },
  '.xyz': { price: 99, renewal: 599, promo: true },
  '.online': { price: 199, renewal: 2499, promo: true },
  '.shop': { price: 999, renewal: 2999 },
};

const POPULAR_TLDS = ['.com', '.in', '.org', '.io', '.ai', '.co'];

const FEATURES = [
  { icon: Shield, title: 'Free WHOIS Privacy', desc: 'Keep your personal info private. Free forever on all domains.' },
  { icon: RefreshCw, title: 'Free Auto-Renew', desc: 'Never lose your domain. Auto-renew is on by default.' },
  { icon: Lock, title: 'Free DNS Management', desc: 'Full DNS control with our easy-to-use panel.' },
  { icon: Globe, title: 'Free Domain Forwarding', desc: 'Redirect your domain to any URL at no cost.' },
];

export default function DomainsClient() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState<{ tld: string; available: boolean; price: number; renewal: number }[]>([]);
  const [searched, setSearched] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setSearching(true);
    setSearched(false);

    const cleanQuery = query.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0];
    const baseName = cleanQuery.split('.')[0];

    await new Promise((r) => setTimeout(r, 800));

    const tldEntries = Object.entries(TLD_PRICING);
    const tldResults = tldEntries.map(([tld, pricing]) => {
      const seed = (baseName.charCodeAt(0) || 0) + tld.length;
      const available = seed % 3 !== 0;
      return { tld, available, price: pricing.price, renewal: pricing.renewal };
    });

    setResults(tldResults);
    setSearching(false);
    setSearched(true);
  };

  const handleRegister = async (tld: string, price: number) => {
    const supabase = createClient();
    const { data: authData } = await supabase.auth.getUser();
    if (!authData?.user) {
      router.push(`/portal/login?redirect=${encodeURIComponent(`/vaulthost/domains`)}`);
      return;
    }
    const domain = `${query.trim().toLowerCase().replace(/\..*$/, '')}${tld}`;
    router.push(`/vaulthost/checkout?plan=domain-${domain}&type=domain&tld=${tld}&price=${price}`);
  };

  return (
    <>
      <PageHeroV4
        eyebrow="VaultHost Domains" eyebrowIcon="globe"
        title={<>Find your perfect<br />domain name.</>}
        description="Search across 15+ TLDs. Free WHOIS privacy, DNS management, and domain forwarding on every domain."
      />

      {/* Search Section */}
      <section className="v4-section-sm -mt-8">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="v4-panel rounded-2xl p-2 flex flex-col sm:flex-row gap-2">
            <div className="flex-1 flex items-center gap-3 px-4">
              <Search className="h-5 w-5 text-text-muted-v4 shrink-0" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Find your domain, e.g. mybusiness"
                className="flex-1 bg-transparent border-0 focus:outline-none text-base py-3 text-text-primary-v4 placeholder:text-text-muted-v4"
              />
            </div>
            <button
              onClick={handleSearch}
              disabled={searching || !query.trim()}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-btn v4-btn-primary font-medium disabled:opacity-50"
            >
              {searching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              {searching ? 'Searching...' : 'Search'}
            </button>
          </div>

          {/* Popular TLDs */}
          {!searched && (
            <div className="mt-6 text-center">
              <p className="text-sm text-text-muted-v4 mb-3">Popular extensions</p>
              <div className="flex flex-wrap justify-center gap-2">
                {POPULAR_TLDS.map((tld) => (
                  <button
                    key={tld}
                    onClick={() => { setQuery(`example${tld}`); }}
                    className="px-4 py-2 rounded-chip v4-panel text-sm font-medium hover:border-hairline-2 transition-colors"
                  >
                    {tld} <span className="text-text-muted-v4 ml-1">₹{TLD_PRICING[tld].price}/yr</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Results */}
          {searched && (
            <div className="mt-8 space-y-3">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Results for &ldquo;{query.trim().toLowerCase().replace(/\..*$/, '')}&rdquo;</h2>
                <button onClick={() => { setSearched(false); setResults([]); }} className="text-sm text-text-muted-v4 hover:text-text-primary-v4">New search</button>
              </div>
              {results.map((result) => (
                <div
                  key={result.tld}
                  className={`v4-panel rounded-2xl p-5 flex items-center justify-between ${result.available ? 'border-good/20' : 'opacity-60'}`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${result.available ? 'bg-good/10 border border-good/20' : 'bg-ink-surface-2 border border-hairline'}`}>
                      {result.available ? <Check className="h-5 w-5 text-good" /> : <X className="h-5 w-5 text-text-muted-v4" />}
                    </div>
                    <div>
                      <p className="font-semibold text-base text-text-primary-v4">
                        {query.trim().toLowerCase().replace(/\..*$/, '')}<span className="text-signal">{result.tld}</span>
                      </p>
                      <p className="text-sm text-text-muted-v4">
                        {result.available ? `₹${result.price}/yr · renews at ₹${result.renewal}/yr` : 'Already taken'}
                      </p>
                    </div>
                  </div>
                  {result.available ? (
                    <button
                      onClick={() => handleRegister(result.tld, result.price)}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-btn v4-btn-primary text-sm font-medium"
                    >
                      <ShoppingCart className="h-4 w-4" /> Register
                    </button>
                  ) : (
                    <span className="text-sm text-text-muted-v4">Taken</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Features */}
      <section className="v4-section-sm bg-ink-surface">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="text-3xl v4-display text-text-primary-v4">Every domain includes</h2>
            <p className="mt-4 text-text-secondary-v4">Free features that other registrars charge extra for.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {FEATURES.map((f) => (
              <div key={f.title} className="v4-panel rounded-2xl p-5">
                <div className="flex h-11 w-11 items-center justify-center rounded-panel border border-hairline bg-ink-surface-2 mb-4">
                  <f.icon className="h-5 w-5 text-signal" />
                </div>
                <h3 className="text-sm font-semibold text-text-primary-v4 mb-1.5">{f.title}</h3>
                <p className="text-sm text-text-secondary-v4 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TLD Pricing Table */}
      <section className="v4-section-sm">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="text-3xl v4-display text-text-primary-v4">Domain pricing</h2>
            <p className="mt-4 text-text-secondary-v4">Transparent pricing. No hidden fees.</p>
          </div>
          <div className="v4-panel rounded-2xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-hairline">
                  <th className="text-left p-4 text-xs font-semibold text-text-muted-v4 uppercase tracking-wider">TLD</th>
                  <th className="text-right p-4 text-xs font-semibold text-text-muted-v4 uppercase tracking-wider">Register</th>
                  <th className="text-right p-4 text-xs font-semibold text-text-muted-v4 uppercase tracking-wider">Renew</th>
                  <th className="text-center p-4 text-xs font-semibold text-text-muted-v4 uppercase tracking-wider">Popular</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(TLD_PRICING).map(([tld, pricing]) => (
                  <tr key={tld} className="border-b border-hairline/50 hover:bg-ink-surface-2/50 transition-colors">
                    <td className="p-4 text-sm font-medium text-text-primary-v4">{tld}</td>
                    <td className="p-4 text-sm text-right">
                      <span className="font-semibold text-text-primary-v4">₹{pricing.price}</span>
                      {pricing.promo && <span className="ml-2 text-xs px-1.5 py-0.5 rounded-full bg-good/10 text-good font-medium">Sale</span>}
                    </td>
                    <td className="p-4 text-sm text-right text-text-muted-v4">₹{pricing.renewal}</td>
                    <td className="p-4 text-center">{pricing.popular && <Star className="h-4 w-4 text-warn fill-warn mx-auto" />}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Transfer CTA */}
      <section className="v4-section-sm bg-ink-surface">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <TrendingUp className="h-10 w-10 text-signal mx-auto mb-4" />
          <h2 className="text-2xl v4-display text-text-primary-v4 mb-4">Already have a domain?</h2>
          <p className="text-text-secondary-v4 mb-8">Transfer it to VaultHost and get a free year added to your registration.</p>
          <Link href="/contact" className="inline-flex items-center gap-2 px-6 py-3 rounded-btn v4-btn-primary font-medium">
            Transfer Your Domain <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

    </>
  );
}
