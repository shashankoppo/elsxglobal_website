'use client';

import { Zap, Database, Shield, Activity, Network, Globe } from 'lucide-react';
import { ProductPageV4 } from '@/components/shared/v4-page-templates';
import { TerminalV4 } from '@/components/ui/terminal-v4';
import { motion } from 'framer-motion';
import { useScrollReveal } from '@/lib/animations';

const CODE_LINES = [
  '> vh deploy --function=user-api',
  '✓ Building TypeScript...',
  '✓ Bundling (847KB → 23KB gzipped)',
  '✓ Deploying to 38 edge locations...',
  '✓ Live in 8.3 seconds',
  '',
  '> Request: GET /api/users',
  '✓ Cold Start: 4.2ms',
  '✓ Execution: 1.8ms',
  '✓ Response: 200 OK',
];

export default function ServerlessContent() {
  return (
    <ProductPageV4 data={{
      eyebrow: 'VaultHost Serverless', eyebrowIcon: Zap,
      title: <>Zero Ops. Infinite Scale.</>,
      description: 'Write functions. Push code. We handle the rest — forever, at any scale.',
      ctaTitle: 'Deploy Your First Function', ctaHref: '/vaulthost',
      features: [
        { icon: Zap, title: '~4ms Cold Start', desc: 'V8 isolates pre-warmed. Your users never wait.' },
        { icon: Globe, title: 'Edge Runtime', desc: 'Functions execute at the nearest PoP. No central origin.' },
        { icon: Database, title: 'Built-in KV Store', desc: 'Eventually-consistent key-value storage at every edge.' },
        { icon: Shield, title: 'Zero-Trust Security', desc: 'Every invocation authenticated, authorized, and isolated.' },
        { icon: Activity, title: 'Real-Time Logs', desc: 'Stream execution logs live. Debug in seconds, not minutes.' },
        { icon: Network, title: '2M Free Requests/mo', desc: 'Generous free tier. Pay only when you scale.' },
      ],
      stats: [
        { value: 4.2, suffix: 'ms', label: 'Cold Start', decimals: 1 },
        { value: 120, suffix: 's', label: 'Max Duration' },
        { value: 8, suffix: 'GB', label: 'Max Memory' },
        { value: 2, suffix: 'M', label: 'Free Req/mo' },
      ],
      children: (
        <>
          <section className="v4-section-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid lg:grid-cols-2 gap-8 items-center">
                <div>
                  <h3 className="text-xl font-semibold text-text-primary-v4 mb-4">Deploy in seconds</h3>
                  <div className="v4-panel p-4 v4-readout text-xs overflow-x-auto">
                    <pre className="text-text-secondary-v4">{`// VaultHost Serverless Function
export default async function handler(req: Request) {
  const data = await db.query(
    'SELECT * FROM users WHERE active = true'
  );
  return Response.json({
    users: data,
    cached: true
  });
}`}</pre>
                  </div>
                </div>
                <TerminalV4 lines={CODE_LINES} title="elsx@vaulthost: ~/api" />
              </div>
            </div>
          </section>

          <section className="v4-section-sm bg-ink-surface">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
              <motion.div {...useScrollReveal()} className="text-center mb-8">
                <h2 className="text-2xl v4-display text-text-primary-v4">Comparison</h2>
              </motion.div>
              <div className="v4-panel overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-hairline">
                      <th className="text-left p-4 text-text-secondary-v4">Feature</th>
                      <th className="text-center p-4 text-signal font-semibold">VaultHost</th>
                      <th className="text-center p-4 text-text-muted-v4">AWS Lambda</th>
                      <th className="text-center p-4 text-text-muted-v4">Vercel</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      ['Cold Start', '~4ms', '100-500ms', '~50ms'],
                      ['Max Duration', '120s', '900s', '300s'],
                      ['Memory', 'Up to 8GB', 'Up to 10GB', 'Up to 1GB'],
                      ['Edge Runtime', '✓', '—', '✓'],
                      ['ELSx AI Layer', '✓', '—', '—'],
                      ['Free Tier', '2M reqs/mo', '1M reqs/mo', '100GB-hrs'],
                    ].map(([f, vh, a, v]) => (
                      <tr key={f} className="border-b border-hairline last:border-0">
                        <td className="p-4 text-text-secondary-v4">{f}</td>
                        <td className="p-4 text-center v4-readout-signal">{vh}</td>
                        <td className="p-4 text-center v4-readout text-text-muted-v4">{a}</td>
                        <td className="p-4 text-center v4-readout text-text-muted-v4">{v}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        </>
      ),
    }} />
  );
}
