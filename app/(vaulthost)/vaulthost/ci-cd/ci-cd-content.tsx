'use client';

import { GitBranch, Zap, CheckCircle2, RefreshCw, Settings, Shield, Eye, Github, Gitlab, Boxes, Terminal, ArrowRight, Clock, Cpu } from 'lucide-react';
import { ProductPageV4 } from '@/components/shared/v4-page-templates';
import { motion } from 'framer-motion';
import { useScrollReveal, fadeUp, stagger } from '@/lib/animations';
import Link from 'next/link';

const PIPELINE = [
  { icon: GitBranch, label: 'Git Push', time: '0s', desc: 'Trigger detected' },
  { icon: Zap, label: 'Build', time: '8.2s', desc: 'Docker + bundlers' },
  { icon: CheckCircle2, label: 'Test', time: '14s', desc: 'Parallel runners' },
  { icon: Eye, label: 'Preview URL', time: '2s', desc: 'Unique per PR' },
  { icon: CheckCircle2, label: 'Approve', time: 'manual', desc: 'Deploy gate' },
  { icon: Zap, label: 'Deploy', time: '12s', desc: 'Rolling update' },
  { icon: Shield, label: 'Edge Cache', time: '1s', desc: 'Global purge' },
];

const GIT_PROVIDERS = [
  { icon: Github, name: 'GitHub', desc: 'GitHub Apps, Actions, Checks API, PR previews' },
  { icon: Gitlab, name: 'GitLab', desc: 'GitLab CI, merge requests, pipeline triggers' },
  { icon: GitBranch, name: 'Bitbucket', desc: 'Bitbucket Pipelines, PR checks, deployments' },
];

const COMPARISON = [
  ['Full Pipeline Time', '<60s', '5-10 min', '3-8 min'],
  ['Build Cache', '10x faster', '2x', '3x'],
  ['Preview Deployments', 'Every PR', 'Manual', 'Add-on'],
  ['Rollback', '1-click', 'Redeploy', 'Redeploy'],
  ['Parallel Tests', 'Included', 'Self-hosted runners', 'Paid add-on'],
  ['Edge Cache Purge', 'Automatic', 'Manual', 'Manual'],
];

export default function CiCdContent() {
  return (
    <ProductPageV4 data={{
      eyebrow: 'VaultHost CI/CD', eyebrowIcon: GitBranch,
      title: <>From Git Push to Global in 60 Seconds</>,
      description: 'Git push triggers build → test → preview → deploy. Full pipeline in under 60 seconds. Rollback in one click.',
      ctaTitle: 'Connect Your Repo', ctaHref: '/vaulthost',
      features: [
        { icon: Eye, title: 'Preview Deployments', desc: 'Every PR gets a unique preview URL. Test before merging.' },
        { icon: Settings, title: 'Environment Variables', desc: 'Encrypted secrets management. Different values per environment.' },
        { icon: RefreshCw, title: '1-Click Rollback', desc: 'Revert to any previous deployment instantly. No rebuild needed.' },
        { icon: Zap, title: 'Build Cache', desc: '10x faster incremental builds. Layer caching across deploys.' },
        { icon: CheckCircle2, title: 'Parallel Test Runners', desc: 'Split tests across workers. 10x faster CI feedback.' },
        { icon: Shield, title: 'Deploy Gates', desc: 'Require approvals, status checks, and manual gates before production.' },
      ],
      stats: [
        { value: 60, suffix: 's', label: 'Full Pipeline' },
        { value: 8.2, suffix: 's', label: 'Avg Build', decimals: 1 },
        { value: 10, suffix: 'x', label: 'Faster Rebuilds' },
        { value: 1, suffix: '-click', label: 'Rollback' },
      ],
      children: (
        <>
          {/* Pipeline visualization */}
          <section className="v4-section-sm bg-ink-surface">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <motion.div {...useScrollReveal()} className="text-center mb-10">
                <h2 className="text-2xl v4-display text-text-primary-v4">The Pipeline</h2>
                <p className="mt-3 text-text-secondary-v4">Every step, automated. Every second, optimized.</p>
              </motion.div>
              <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-2 overflow-x-auto pb-4">
                {PIPELINE.map((step, i) => (
                  <div key={step.label} className="flex items-center gap-2 shrink-0">
                    <motion.div
                      initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.06 }}
                      className="flex flex-col items-center gap-2 p-4 v4-panel min-w-[130px] hover:border-hairline-2 transition-colors"
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-chip border border-hairline bg-ink-surface-2">
                        <step.icon className="h-5 w-5 text-signal" />
                      </div>
                      <p className="text-xs font-medium text-text-primary-v4 whitespace-nowrap">{step.label}</p>
                      <span className="v4-readout text-[10px] text-signal">{step.time}</span>
                      <span className="v4-readout text-[9px] text-text-muted-v4 text-center">{step.desc}</span>
                    </motion.div>
                    {i < PIPELINE.length - 1 && <div className="hidden lg:block h-px w-6 bg-hairline-2" />}
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Git provider integrations */}
          <section className="v4-section-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <motion.div {...useScrollReveal()} className="text-center mb-10">
                <h2 className="text-2xl v4-display text-text-primary-v4">Connect Your Git Provider</h2>
                <p className="mt-3 text-text-secondary-v4">One-click integration with your existing workflow.</p>
              </motion.div>
              <motion.div variants={stagger} {...useScrollReveal()} className="grid md:grid-cols-3 gap-5">
                {GIT_PROVIDERS.map((provider) => (
                  <motion.div key={provider.name} variants={fadeUp}>
                    <div className="v4-panel p-6 h-full flex items-start gap-4 hover:border-hairline-2 transition-colors">
                      <div className="flex h-12 w-12 items-center justify-center rounded-panel border border-hairline bg-ink-surface-2 shrink-0">
                        <provider.icon className="h-6 w-6 text-signal" />
                      </div>
                      <div>
                        <h3 className="text-base font-semibold text-text-primary-v4 mb-1">{provider.name}</h3>
                        <p className="text-sm text-text-secondary-v4 leading-relaxed">{provider.desc}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </section>

          {/* Terminal example */}
          <section className="v4-section-sm bg-ink-surface">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
              <motion.div {...useScrollReveal()} className="text-center mb-8">
                <h2 className="text-2xl v4-display text-text-primary-v4">CLI-Powered Deploys</h2>
                <p className="mt-3 text-text-secondary-v4">Or trigger deploys from your terminal.</p>
              </motion.div>
              <div className="v4-panel p-5 v4-readout text-xs overflow-x-auto">
                <div className="flex items-center gap-2 mb-3 pb-3 border-b border-hairline">
                  <Terminal className="h-4 w-4 text-signal" />
                  <span className="text-text-muted-v4">elsx@vaulthost: ~/my-app</span>
                </div>
                <pre className="text-text-secondary-v4 leading-relaxed">{`# Install the CLI
$ npm i -g @vaulthost/cli

# Deploy from any directory
$ vh deploy

✓ Detecting framework... Next.js
✓ Building (8.2s)...
✓ Running tests (14s)...
✓ Uploading to 38 edge locations...
✓ Live at https://my-app.vaulthost.app

# Rollback if needed
$ vh rollback --to v142
✓ Rolled back to v142 (2.1s)`}</pre>
              </div>
            </div>
          </section>

          {/* Comparison table */}
          <section className="v4-section-sm">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
              <motion.div {...useScrollReveal()} className="text-center mb-8">
                <h2 className="text-2xl v4-display text-text-primary-v4">How We Compare</h2>
              </motion.div>
              <div className="v4-panel overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-hairline">
                      <th className="text-left p-4 text-text-secondary-v4 font-medium">Feature</th>
                      <th className="text-center p-4 text-signal font-semibold">VaultHost</th>
                      <th className="text-center p-4 text-text-muted-v4">GitHub Actions</th>
                      <th className="text-center p-4 text-text-muted-v4">GitLab CI</th>
                    </tr>
                  </thead>
                  <tbody>
                    {COMPARISON.map(([f, vh, gh, gl]) => (
                      <tr key={f} className="border-b border-hairline last:border-0">
                        <td className="p-4 text-text-secondary-v4">{f}</td>
                        <td className="p-4 text-center v4-readout-signal">{vh}</td>
                        <td className="p-4 text-center v4-readout text-text-muted-v4">{gh}</td>
                        <td className="p-4 text-center v4-readout text-text-muted-v4">{gl}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          {/* Performance indicators */}
          <section className="py-10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { icon: Clock, label: '<60s Pipeline', desc: 'Push to production' },
                  { icon: Cpu, label: '10x Build Cache', desc: 'Incremental builds' },
                  { icon: Boxes, label: 'Parallel Tests', desc: 'Split across workers' },
                  { icon: RefreshCw, label: '1-Click Rollback', desc: 'Instant revert' },
                ].map((item, i) => (
                  <motion.div
                    key={item.label}
                    initial={{ opacity: 0, y: 8 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.08 }}
                    className="flex items-center gap-3 p-4 rounded-panel border border-hairline bg-ink-surface-2"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-chip border border-hairline shrink-0">
                      <item.icon className="h-5 w-5 text-signal" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-text-primary-v4">{item.label}</p>
                      <p className="text-xs text-text-muted-v4">{item.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="v4-section-sm bg-ink-surface">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <motion.div {...useScrollReveal()} className="v4-panel p-8">
                <GitBranch className="h-10 w-10 text-signal mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-text-primary-v4 mb-2">Ship faster. Rollback instantly.</h2>
                <p className="text-sm text-text-secondary-v4 mb-6">Connect your repo and get your first deploy live in under 60 seconds.</p>
                <Link href="/vaulthost/pricing" className="inline-flex items-center gap-2 px-6 py-3 rounded-btn v4-btn-primary text-sm">
                  Get Started <ArrowRight className="h-4 w-4" />
                </Link>
              </motion.div>
            </div>
          </section>
        </>
      ),
    }} />
  );
}
