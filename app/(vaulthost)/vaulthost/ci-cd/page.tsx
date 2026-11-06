'use client';

import React from 'react';
import Link from 'next/link';
import { PageHeroV4 } from '@/components/ui/page-hero-v4';
import { PanelCard } from '@/components/ui/panel-card';
import { ScrollReveal } from '@/components/ui/scroll-reveal';
import { Github, GitBranch, Terminal, RefreshCw, Zap, Shield, ArrowRight, CheckCircle, Database } from 'lucide-react';

export default function VaultCICDPage() {
  return (
    <div className="v4-page bg-ink min-h-screen">
      <PageHeroV4
        eyebrow="VaultCI/CD"
        title={
          <>
            Ship Faster. <span className="text-signal">Deploy with Confidence.</span>
          </>
        }
        description="Native CI/CD pipelines integrated directly into VaultHost's execution plane. Connect GitHub, GitLab, or Bitbucket — every push runs tests, builds artifacts, and deploys globally with zero downtime."
      />

      {/* Stats Bar */}
      <section className="v4-section-sm border-b border-hairline bg-ink-surface-2">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-text-primary-v4">&lt;30s</div>
              <div className="text-text-muted-v4 text-sm mt-1">Deploy Time</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-text-primary-v4">∞</div >
              <div className="text-text-muted-v4 text-sm mt-1">Preview Environments</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-text-primary-v4">Auto</div>
              <div className="text-text-muted-v4 text-sm mt-1">Rollback on Failure</div>
            </div>
            <div>
              <div className="flex justify-center gap-2 mb-2 text-text-primary-v4">
                <Github className="w-6 h-6" /> 
                <GitBranch className="w-6 h-6" />
              </div>
              <div className="text-text-muted-v4 text-sm">Git Providers</div>
            </div>
          </div>
        </div>
      </section>

      {/* Pipeline Stages */}
      <section className="v4-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <h2 className="v4-display text-text-primary-v4 text-center mb-12">The Pipeline Flow</h2>
            <div className="flex flex-wrap md:flex-nowrap items-center justify-center gap-4 text-sm text-text-secondary-v4 font-medium">
              <div className="bg-ink border border-hairline py-2 px-4 rounded-full">1. Code Push</div>
              <ArrowRight className="w-4 h-4 text-signal hidden md:block" />
              <div className="bg-ink border border-hairline py-2 px-4 rounded-full">2. Trigger</div>
              <ArrowRight className="w-4 h-4 text-signal hidden md:block" />
              <div className="bg-ink border border-hairline py-2 px-4 rounded-full">3. Install</div>
              <ArrowRight className="w-4 h-4 text-signal hidden md:block" />
              <div className="bg-ink border border-hairline py-2 px-4 rounded-full">4. Test</div>
              <ArrowRight className="w-4 h-4 text-signal hidden md:block" />
              <div className="bg-ink border border-hairline py-2 px-4 rounded-full">5. Build</div>
              <ArrowRight className="w-4 h-4 text-signal hidden md:block" />
              <div className="bg-ink border border-hairline py-2 px-4 rounded-full">6. Deploy</div>
              <ArrowRight className="w-4 h-4 text-signal hidden md:block" />
              <div className="bg-ink-surface-2 border border-signal text-signal py-2 px-4 rounded-full">7. Live</div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="v4-section bg-ink-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <ScrollReveal delay={0.1}>
              <PanelCard className="v4-panel h-full p-8 border border-hairline">
                <Github className="w-8 h-8 text-signal mb-4" />
                <h3 className="font-bold text-text-primary-v4 mb-2">Git-Connected</h3>
                <p className="text-text-secondary-v4 text-sm">Auto-deploy on PR merge. Deep integration with repository statuses and checks.</p>
              </PanelCard>
            </ScrollReveal>

            <ScrollReveal delay={0.2}>
              <PanelCard className="v4-panel h-full p-8 border border-hairline">
                <Globe className="w-8 h-8 text-signal mb-4" />
                <h3 className="font-bold text-text-primary-v4 mb-2">Preview Environments</h3>
                <p className="text-text-secondary-v4 text-sm">Every PR gets a unique URL instantly. Review changes in a live production-like setting.</p>
              </PanelCard>
            </ScrollReveal>

            <ScrollReveal delay={0.3}>
              <PanelCard className="v4-panel h-full p-8 border border-hairline">
                <Zap className="w-8 h-8 text-signal mb-4" />
                <h3 className="font-bold text-text-primary-v4 mb-2">Parallel Runners</h3>
                <p className="text-text-secondary-v4 text-sm">Matrix builds for multiple Node/Python versions concurrently to speed up CI.</p>
              </PanelCard>
            </ScrollReveal>

            <ScrollReveal delay={0.4}>
              <PanelCard className="v4-panel h-full p-8 border border-hairline">
                <Database className="w-8 h-8 text-signal mb-4" />
                <h3 className="font-bold text-text-primary-v4 mb-2">Build Caching</h3>
                <p className="text-text-secondary-v4 text-sm">Intelligent npm/yarn/pip cache between builds slices minutes off your deployment times.</p>
              </PanelCard>
            </ScrollReveal>

            <ScrollReveal delay={0.5}>
              <PanelCard className="v4-panel h-full p-8 border border-hairline">
                <RefreshCw className="w-8 h-8 text-signal mb-4" />
                <h3 className="font-bold text-text-primary-v4 mb-2">Zero-Downtime</h3>
                <p className="text-text-secondary-v4 text-sm">Blue-green deployments managed automatically by the Edge Action Gateway.</p>
              </PanelCard>
            </ScrollReveal>

            <ScrollReveal delay={0.6}>
              <PanelCard className="v4-panel h-full p-8 border border-hairline">
                <Shield className="w-8 h-8 text-signal mb-4" />
                <h3 className="font-bold text-text-primary-v4 mb-2">Automatic Rollback</h3>
                <p className="text-text-secondary-v4 text-sm">If health checks fail post-deployment, the previous version is restored in under 10 seconds.</p>
              </PanelCard>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* YAML Pipeline Example */}
      <section className="v4-section">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <h2 className="v4-display text-text-primary-v4 text-center mb-8">Infrastructure as Code</h2>
            <div className="bg-[#0d1117] border border-hairline rounded-2xl p-6 overflow-hidden">
              <div className="flex items-center gap-2 mb-4 border-b border-gray-800 pb-4">
                <Terminal className="w-5 h-5 text-gray-400" />
                <span className="text-sm font-mono text-gray-400">.vaulthost.yaml</span>
              </div>
              <pre className="text-sm font-mono text-green-400 overflow-x-auto whitespace-pre">
{`pipeline:
  trigger: [main, develop]
  steps:
    - name: Install
      run: npm ci
    - name: Test
      run: npm test
    - name: Build
      run: npm run build
    - name: Deploy
      use: deploy-edge
      environment: production
      strategy: blue-green`}
              </pre>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* CTA */}
      <section className="v4-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <ScrollReveal>
            <div 
              className="rounded-3xl border border-hairline p-12"
              style={{ background: 'linear-gradient(135deg, rgba(10,18,36,0.98), rgba(6,12,24,1))' }}
            >
              <h2 className="v4-display text-white mb-6">Connect Your Repository</h2>
              <p className="text-text-secondary-v4 mb-8 max-w-2xl mx-auto">
                Push code and let VaultHost handle the rest. Start deploying globally today.
              </p>
              <Link href="/portal" className="v4-btn-primary inline-flex items-center px-8 py-4">
                Connect repo <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </div>
  );
}

// Ensure Globe is imported from lucide-react if not already
import { Globe } from 'lucide-react';
