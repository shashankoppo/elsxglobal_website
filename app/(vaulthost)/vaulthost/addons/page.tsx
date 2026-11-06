import { Metadata } from 'next';
import { createClient } from '@/lib/supabase-server';
import { createMetadata } from '@/lib/seo';
import { HostingAddon } from '@/lib/hosting-types';
import { PageHeroV4 } from '@/components/ui/page-hero-v4';
import { PanelCard, PanelCardBody } from '@/components/ui/panel-card';
import {
  Shield, Lock, Globe, Server, Headphones, RefreshCw, Database,
  Check, ArrowRight, Zap, Star
} from 'lucide-react';

export const metadata: Metadata = createMetadata({
  title: 'Hosting Add-ons India — Security, Performance, Support | VaultHost',
  description: 'Enhance your hosting with add-ons: daily backups, SSL, CDN, DDoS protection, priority support, and more. Competitive pricing with monthly and annual options.',
  keywords: ['hosting addons India', 'website security add-ons', 'CDN add-on', 'DDoS protection add-on', 'daily backup service', 'priority support hosting', 'SSL add-on', 'hosting performance optimization'],
  canonical: 'https://elsxglobal.com/vaulthost/addons/',
  breadcrumb: [
    { name: 'Home', url: 'https://elsxglobal.com/' },
    { name: 'VaultHost', url: 'https://elsxglobal.com/vaulthost/' },
    { name: 'Add-ons', url: 'https://elsxglobal.com/vaulthost/addons/' },
  ],
  serviceSchema: {
    name: 'Hosting Add-ons Marketplace',
    description: 'Security, performance, and support add-ons for hosting plans including backups, CDN, DDoS protection, and priority support.',
    provider: 'VaultHost by ELSxGlobal',
    areaServed: 'India',
    category: 'Hosting Add-ons',
  },
});

const CATEGORY_LABELS: Record<string, string> = {
  security: 'Security',
  performance: 'Performance',
  support: 'Support',
};

const ICON_MAP: Record<string, typeof Shield> = {
  shield: Shield,
  lock: Lock,
  globe: Globe,
  server: Server,
  headphones: Headphones,
  refresh: RefreshCw,
  database: Database,
};

export default async function AddonsPage() {
  const supabase = createClient();
  const { data: addons } = await supabase
    .from('hosting_addons')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true });

  const allAddons = (addons || []) as unknown as HostingAddon[];
  const categories = Object.keys(CATEGORY_LABELS);

  return (
    <>
      <PageHeroV4
        eyebrow="VaultHost Add-ons"
        eyebrowIcon="server"
        title={
          <>
            Supercharge your hosting
          </>
        }
        description="Add security, performance, and support upgrades to any hosting plan. Cancel anytime."
      />

      <section className="relative py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {categories.map((cat) => {
            const catAddons = allAddons.filter((a) => a.category === cat);
            if (catAddons.length === 0) return null;
            return (
              <div key={cat} className="mb-16 last:mb-0">
                <div className="flex items-center gap-3 mb-6">
                  <div className="flex h-10 w-10 items-center justify-center rounded-chip bg-ink-surface-2 border border-hairline">
                    {cat === 'security' && <Shield className="h-5 w-5 text-signal" />}
                    {cat === 'performance' && <Zap className="h-5 w-5 text-signal" />}
                    {cat === 'support' && <Headphones className="h-5 w-5 text-signal" />}
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-text-primary-v4">{CATEGORY_LABELS[cat]}</h2>
                    <p className="text-sm text-text-muted-v4">{catAddons.length} add-ons available</p>
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {catAddons.map((addon) => {
                    const Icon = ICON_MAP[addon.icon || ''] || Shield;
                    const isFree = addon.price_monthly === 0;
                    return (
                      <PanelCard key={addon.id} className="flex flex-col">
                        <PanelCardBody className="flex flex-col h-full">
                          <div className="flex items-start gap-3 mb-4">
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-chip bg-ink-surface-2 border border-hairline">
                              <Icon className="h-5 w-5 text-signal" />
                            </div>
                            <div className="flex-1">
                              <h3 className="text-sm font-semibold text-text-primary-v4">{addon.name}</h3>
                              {isFree && (
                                <span className="inline-flex items-center gap-1 mt-1 text-xs px-2 py-0.5 rounded-chip bg-good/10 text-good font-medium">
                                  <Star className="h-3 w-3 fill-good" /> Free
                                </span>
                              )}
                            </div>
                          </div>
                          <p className="text-sm text-text-secondary-v4 leading-relaxed mb-5 flex-1">{addon.description}</p>
                          <div className="flex items-baseline gap-1 mb-4">
                            {isFree ? (
                              <span className="text-2xl font-bold text-good tabular-nums">Free</span>
                            ) : (
                              <>
                                <span className="text-2xl font-bold text-text-primary-v4 tabular-nums">&#8377;{addon.price_monthly.toLocaleString('en-IN')}</span>
                                <span className="text-sm text-text-muted-v4">/mo</span>
                              </>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-text-muted-v4">
                            <Check className="h-3.5 w-3.5 text-good" />
                            {isFree ? 'Included with all plans' : `or ₹${addon.price_annual.toLocaleString('en-IN')}/yr`}
                          </div>
                        </PanelCardBody>
                      </PanelCard>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="relative py-16 bg-ink-surface border-t border-hairline">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-semibold tracking-tight mb-4 text-text-primary-v4">Add-ons are applied at checkout</h2>
          <p className="text-text-secondary-v4 mb-8">Select your hosting plan, then add any add-ons during checkout. You can also add them later from your portal.</p>
          <a href="/vaulthost" className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-btn v4-btn-primary text-sm font-medium">
            Browse Hosting Plans <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </section>
    </>
  );
}
