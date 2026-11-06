'use client';

import { Globe, Zap, Shield, Network, Activity } from 'lucide-react';
import { ProductPageV4 } from '@/components/shared/v4-page-templates';
import { motion } from 'framer-motion';
import { useScrollReveal } from '@/lib/animations';

export default function EdgeContent() {
  return (
    <ProductPageV4 data={{
      eyebrow: 'VaultHost Edge', eyebrowIcon: Globe,
      title: <>Your Code, Everywhere, Instantly</>,
      description: 'Deploy to 38+ points of presence. Assets cached at the edge. Sub-50ms response time globally.',
      ctaTitle: 'Enable Edge for Your Project', ctaHref: '/vaulthost',
      features: [
        { icon: Globe, title: 'Smart CDN', desc: 'AI-powered cache invalidation keeps content fresh without manual purges.' },
        { icon: Zap, title: 'Edge Functions', desc: 'JS/TS runtime at the edge. Execute logic 50ms from your users.' },
        { icon: Network, title: 'Anycast Routing', desc: 'Requests auto-route to the nearest healthy PoP automatically.' },
        { icon: Activity, title: 'Real-Time Analytics', desc: 'Edge-level metrics visible in your dashboard with 1-second granularity.' },
        { icon: Shield, title: 'Asset Optimization', desc: 'WebP conversion, Brotli compression, image resizing — all automatic.' },
        { icon: Globe, title: 'Global Coverage', desc: '38+ PoPs across NA, EU, APAC, MEA. Expanding rapidly.' },
      ],
      stats: [
        { value: 38, suffix: '+', label: 'Edge PoPs' },
        { value: 50, suffix: 'ms', label: 'Avg Response' },
        { value: 99.99, suffix: '%', label: 'Uptime SLA', decimals: 2 },
        { value: 160, suffix: 'ms', label: 'Global Latency' },
      ],
      children: (
        <section className="v4-section-sm">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div {...useScrollReveal()} className="text-center mb-10">
              <h2 className="text-2xl v4-display text-text-primary-v4">How We Compare</h2>
            </motion.div>
            <div className="v4-panel overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-hairline">
                    <th className="text-left p-4 text-text-secondary-v4 font-medium">Feature</th>
                    <th className="text-center p-4 text-signal font-semibold">VaultHost</th>
                    <th className="text-center p-4 text-text-muted-v4">Vercel</th>
                    <th className="text-center p-4 text-text-muted-v4">Cloudflare</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['Edge PoPs', '38+', '96', '310+'],
                    ['Edge Functions', '✓', '✓', '✓'],
                    ['AI Cache', '✓', '—', '—'],
                    ['ELSx Integration', '✓', '—', '—'],
                    ['Included in Platform', '✓', 'Add-on', 'Add-on'],
                  ].map(([f, vh, v, c]) => (
                    <tr key={f} className="border-b border-hairline last:border-0">
                      <td className="p-4 text-text-secondary-v4">{f}</td>
                      <td className="p-4 text-center v4-readout-signal">{vh}</td>
                      <td className="p-4 text-center v4-readout text-text-muted-v4">{v}</td>
                      <td className="p-4 text-center v4-readout text-text-muted-v4">{c}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-4 text-xs text-text-muted-v4 text-center">PoP count is rapidly expanding. VaultHost wins on AI integration and platform inclusion.</p>
          </div>
        </section>
      ),
    }} />
  );
}
