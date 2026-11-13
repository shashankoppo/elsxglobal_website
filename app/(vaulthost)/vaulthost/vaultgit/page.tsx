'use client';

import React from 'react';
import Link from 'next/link';
import { PageHeroV4 } from '@/components/ui/page-hero-v4';
import { PanelCard } from '@/components/ui/panel-card';
import { ScrollReveal } from '@/components/ui/scroll-reveal';
import {
  GitBranch,
  GitPullRequest,
  Check,
  ShieldCheck,
  Boxes,
  Lock,
  ArrowRight,
  Terminal,
  Activity,
  Server,
  FileCode,
  Shield,
  Webhook,
} from 'lucide-react';

export default function VaultGitPage() {
  return (
    <div className="v4-page bg-ink min-h-screen text-text-primary-v4">
      <PageHeroV4
        eyebrow="VaultGit"
        title={
          <>
            Self-Hosted <span className="text-signal">Git</span> — GitHub on Your Terms
          </>
        }
        description="Managed Gitea instance. Your code stays in India. Git hosting with CI/CD, issue tracking, code review, container registry — all self-hosted, fully managed."
      />

      {/* 1. Stats Bar */}
      <div className="v4-section-sm border-y border-hairline bg-ink-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-signal mb-1">Git + LFS</div>
              <div className="text-sm text-text-muted-v4">Large File Storage Built-In</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-signal mb-1">OCI Registry</div>
              <div className="text-sm text-text-muted-v4">Integrated Container Registry</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-signal mb-1">Merge Requests</div>
              <div className="text-sm text-text-muted-v4">Full Code Review &amp; CI Checks</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-signal mb-1">99.99%</div>
              <div className="text-sm text-text-muted-v4">Uptime SLA Guaranteed</div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. GitHub vs VaultGit Comparison */}
      <section className="v4-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="text-center mb-12">
              <h2 className="v4-display text-text-primary-v4 mb-4">GitHub Enterprise vs. VaultGit</h2>
              <p className="text-text-secondary-v4 max-w-2xl mx-auto">
                Keep proprietary software, trading algorithms, and government codebase within India without US surveillance exposure.
              </p>
            </div>
          </ScrollReveal>

          <div className="border border-hairline rounded-2xl overflow-hidden bg-ink shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-ink-surface-2 text-text-secondary-v4 border-b border-hairline">
                  <tr>
                    <th className="py-4 px-6 font-medium">Evaluation Criterion</th>
                    <th className="py-4 px-6 font-bold text-signal">VaultGit</th>
                    <th className="py-4 px-6 font-medium text-text-muted-v4">GitHub Enterprise / Cloud</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-hairline">
                  <tr className="bg-signal/5">
                    <td className="py-4 px-6 font-semibold text-text-primary-v4">Data Sovereignty &amp; Residency</td>
                    <td className="py-4 px-6 text-signal font-medium">100% Indian Data Centers (Mumbai/Pune)</td>
                    <td className="py-4 px-6 text-text-muted-v4">US Microsoft Cloud (Subject to US CLOUD Act)</td>
                  </tr>
                  <tr>
                    <td className="py-4 px-6 font-semibold text-text-primary-v4">Seat Pricing</td>
                    <td className="py-4 px-6 text-text-primary-v4 font-medium">From ₹99/user/month in Indian Rupee</td>
                    <td className="py-4 px-6 text-text-muted-v4">$21/user/mo (~₹1,750/user/mo)</td>
                  </tr>
                  <tr className="bg-signal/5">
                    <td className="py-4 px-6 font-semibold text-text-primary-v4">Code Privacy &amp; AI Training</td>
                    <td className="py-4 px-6 text-signal font-medium">Private VM slice — Never used for LLM training</td>
                    <td className="py-4 px-6 text-text-muted-v4">Telemetry harvested for Copilot ecosystem</td>
                  </tr>
                  <tr>
                    <td className="py-4 px-6 font-semibold text-text-primary-v4">CI/CD Runner Costs</td>
                    <td className="py-4 px-6 text-text-primary-v4 font-medium">Unlimited self-hosted local runners</td>
                    <td className="py-4 px-6 text-text-muted-v4">Expensive per-minute overage billing ($0.008/min)</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Features Grid (6 Panels) */}
      <section className="v4-section bg-ink-surface/40 border-y border-hairline">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="text-center mb-16">
              <h2 className="v4-display text-text-primary-v4 mb-4">Complete DevOps Lifecycle in One Box</h2>
              <p className="text-text-secondary-v4 max-w-2xl mx-auto text-lg">
                Fast, lightweight, and compatible with your existing git client, Git LFS, and SSH keys.
              </p>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <ScrollReveal delay={0.05}>
              <PanelCard className="v4-panel h-full flex flex-col p-6">
                <FileCode className="w-8 h-8 text-signal mb-4" />
                <h3 className="text-xl font-medium text-text-primary-v4 mb-2">Repositories &amp; Branches</h3>
                <p className="text-text-secondary-v4 text-sm leading-relaxed">
                  Fast push and fetch with HTTP/2 and SSH. Branch protection rules, required sign-offs, and automatic squash merging.
                </p>
              </PanelCard>
            </ScrollReveal>

            <ScrollReveal delay={0.1}>
              <PanelCard className="v4-panel h-full flex flex-col p-6">
                <Activity className="w-8 h-8 text-signal mb-4" />
                <h3 className="text-xl font-medium text-text-primary-v4 mb-2">Issue Tracking &amp; Milestones</h3>
                <p className="text-text-secondary-v4 text-sm leading-relaxed">
                  Kanban project boards, custom labels, assignees, due dates, and milestone progress tracking for dev sprints.
                </p>
              </PanelCard>
            </ScrollReveal>

            <ScrollReveal delay={0.15}>
              <PanelCard className="v4-panel h-full flex flex-col p-6">
                <GitPullRequest className="w-8 h-8 text-signal mb-4" />
                <h3 className="text-xl font-medium text-text-primary-v4 mb-2">Merge Requests &amp; Review</h3>
                <p className="text-text-secondary-v4 text-sm leading-relaxed">
                  Side-by-side unified diffs, inline line comments, multi-approver requirements, and automatic build gate checks.
                </p>
              </PanelCard>
            </ScrollReveal>

            <ScrollReveal delay={0.2}>
              <PanelCard className="v4-panel h-full flex flex-col p-6">
                <Terminal className="w-8 h-8 text-signal mb-4" />
                <h3 className="text-xl font-medium text-text-primary-v4 mb-2">CI/CD Pipelines (Actions)</h3>
                <p className="text-text-secondary-v4 text-sm leading-relaxed">
                  Compatible with GitHub Actions syntax. Run test matrices, linting, and automated docker deployments on push.
                </p>
              </PanelCard>
            </ScrollReveal>

            <ScrollReveal delay={0.25}>
              <PanelCard className="v4-panel h-full flex flex-col p-6">
                <Boxes className="w-8 h-8 text-signal mb-4" />
                <h3 className="text-xl font-medium text-text-primary-v4 mb-2">Container Registry</h3>
                <p className="text-text-secondary-v4 text-sm leading-relaxed">
                  Push and pull Docker and OCI images, npm modules, and PyPI wheels directly to your private VaultGit packages.
                </p>
              </PanelCard>
            </ScrollReveal>

            <ScrollReveal delay={0.3}>
              <PanelCard className="v4-panel h-full flex flex-col p-6">
                <Webhook className="w-8 h-8 text-signal mb-4" />
                <h3 className="text-xl font-medium text-text-primary-v4 mb-2">Extensible Webhooks</h3>
                <p className="text-text-secondary-v4 text-sm leading-relaxed">
                  Broadcast repository events to Slack, Mattermost, Discord, VaultAutomation (n8n), or custom serverless webhooks.
                </p>
              </PanelCard>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* 4. DPDP / Compliance Callout */}
      <section className="v4-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="p-8 md:p-12 rounded-3xl border border-signal/40 bg-gradient-to-r from-signal/10 via-ink-surface to-ink-surface-2 flex flex-col md:flex-row items-center gap-8">
            <div className="p-4 rounded-2xl bg-signal/20 text-signal flex-shrink-0">
              <ShieldCheck className="w-12 h-12" />
            </div>
            <div>
              <div className="text-xs uppercase tracking-wider font-bold text-signal mb-2">
                DPDP ACT 2023 &amp; REGULATORY COMPLIANCE
              </div>
              <h3 className="text-2xl md:text-3xl font-bold text-text-primary-v4 mb-3">
                Your code never leaves India.
              </h3>
              <p className="text-text-secondary-v4 text-base leading-relaxed max-w-3xl">
                Every repository, git commit, commit author email, and private access token is stored exclusively in MeitY-empaneled Tier-IV data centers located in Mumbai and Pune. Meet RBI, SEBI, and IRDAI code audit requirements with zero friction.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Pricing (3 tiers) */}
      <section className="v4-section bg-ink-surface/30 border-t border-hairline">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="text-center mb-16">
              <h2 className="v4-display text-text-primary-v4 mb-4">Straightforward Team Pricing</h2>
              <p className="text-text-secondary-v4 max-w-2xl mx-auto">
                Deploy a dedicated Git instance for your entire organization at a fraction of GitHub Enterprise cost.
              </p>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {/* Starter */}
            <div className="v4-panel rounded-2xl p-8 border border-hairline flex flex-col justify-between">
              <div>
                <div className="text-text-muted-v4 text-sm font-semibold mb-2">STARTER</div>
                <div className="text-4xl font-bold text-text-primary-v4 mb-1">
                  ₹499 <span className="text-sm font-normal text-text-muted-v4">/mo</span>
                </div>
                <p className="text-text-secondary-v4 text-sm mb-6">For small boutique development teams and agency shops.</p>
                <ul className="space-y-3 mb-8 text-sm">
                  <li className="flex items-center text-text-secondary-v4">
                    <Check className="w-4 h-4 text-signal mr-2.5 flex-shrink-0" /> Up to 5 team members
                  </li>
                  <li className="flex items-center text-text-secondary-v4">
                    <Check className="w-4 h-4 text-signal mr-2.5 flex-shrink-0" /> 10GB high-speed Git + LFS storage
                  </li>
                  <li className="flex items-center text-text-secondary-v4">
                    <Check className="w-4 h-4 text-signal mr-2.5 flex-shrink-0" /> Unlimited public &amp; private repos
                  </li>
                  <li className="flex items-center text-text-secondary-v4">
                    <Check className="w-4 h-4 text-signal mr-2.5 flex-shrink-0" /> Built-in Gitea Actions CI/CD
                  </li>
                  <li className="flex items-center text-text-secondary-v4">
                    <Check className="w-4 h-4 text-signal mr-2.5 flex-shrink-0" /> Nightly automated snapshots
                  </li>
                </ul>
              </div>
              <Link href="/vaulthost/checkout?plan=git-starter" className="v4-btn-secondary rounded-btn w-full text-center block py-3">
                Deploy Starter
              </Link>
            </div>

            {/* Team Tier (Highlighted) */}
            <div className="v4-panel rounded-2xl p-8 border-2 border-signal relative flex flex-col justify-between bg-ink-surface">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-signal text-ink text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                Most Popular
              </div>
              <div>
                <div className="text-signal text-sm font-semibold mb-2">TEAM</div>
                <div className="text-4xl font-bold text-text-primary-v4 mb-1">
                  ₹1,999 <span className="text-sm font-normal text-text-muted-v4">/mo</span>
                </div>
                <p className="text-text-secondary-v4 text-sm mb-6">Scalable code collaboration for growing software firms.</p>
                <ul className="space-y-3 mb-8 text-sm">
                  <li className="flex items-center text-text-secondary-v4">
                    <Check className="w-4 h-4 text-signal mr-2.5 flex-shrink-0" /> Up to 25 team members
                  </li>
                  <li className="flex items-center text-text-secondary-v4">
                    <Check className="w-4 h-4 text-signal mr-2.5 flex-shrink-0" /> 100GB Git + Container storage
                  </li>
                  <li className="flex items-center text-text-secondary-v4">
                    <Check className="w-4 h-4 text-signal mr-2.5 flex-shrink-0" /> Parallel CI/CD execution runners
                  </li>
                  <li className="flex items-center text-text-secondary-v4">
                    <Check className="w-4 h-4 text-signal mr-2.5 flex-shrink-0" /> Custom domain &amp; SSL included
                  </li>
                  <li className="flex items-center text-text-secondary-v4">
                    <Check className="w-4 h-4 text-signal mr-2.5 flex-shrink-0" /> Priority support &amp; 99.99% uptime
                  </li>
                </ul>
              </div>
              <Link
                href="/vaulthost/checkout?plan=git-team"
                className="v4-btn-primary rounded-btn w-full text-center block py-3"
              >
                Start Team Plan
              </Link>
            </div>

            {/* Business Tier */}
            <div className="v4-panel rounded-2xl p-8 border border-hairline flex flex-col justify-between">
              <div>
                <div className="text-text-muted-v4 text-sm font-semibold mb-2">BUSINESS / ENTERPRISE</div>
                <div className="text-4xl font-bold text-text-primary-v4 mb-1">
                  ₹4,999 <span className="text-sm font-normal text-text-muted-v4">/mo</span>
                </div>
                <p className="text-text-secondary-v4 text-sm mb-6">Full enterprise tenancy with custom SSO and unlimited seats.</p>
                <ul className="space-y-3 mb-8 text-sm">
                  <li className="flex items-center text-text-secondary-v4">
                    <Check className="w-4 h-4 text-signal mr-2.5 flex-shrink-0" /> Unlimited developers &amp; contractors
                  </li>
                  <li className="flex items-center text-text-secondary-v4">
                    <Check className="w-4 h-4 text-signal mr-2.5 flex-shrink-0" /> Unlimited NVMe storage (fair use)
                  </li>
                  <li className="flex items-center text-text-secondary-v4">
                    <Check className="w-4 h-4 text-signal mr-2.5 flex-shrink-0" /> LDAP / SAML / Active Directory SSO
                  </li>
                  <li className="flex items-center text-text-secondary-v4">
                    <Check className="w-4 h-4 text-signal mr-2.5 flex-shrink-0" /> Dedicated private VPC cluster
                  </li>
                  <li className="flex items-center text-text-secondary-v4">
                    <Check className="w-4 h-4 text-signal mr-2.5 flex-shrink-0" /> 24/7 designated DevOps support
                  </li>
                </ul>
              </div>
              <Link
                href="/vaulthost/checkout?plan=git-business"
                className="v4-btn-primary rounded-btn w-full text-center block py-3"
              >
                Deploy Business Git
              </Link>
            </div>
          </div>

          {/* 6. CTA Card */}
          <div className="bg-ink-surface border border-hairline rounded-3xl p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8">
            <div>
              <h3 className="text-2xl md:text-3xl font-bold text-text-primary-v4 mb-2">
                Migrate from GitHub or GitLab in 1 click
              </h3>
              <p className="text-text-secondary-v4 max-w-xl">
                Import your repositories, pull requests, issues, and wiki docs automatically with our seamless migration assistant.
              </p>
            </div>
            <Link
              href="/portal"
              className="v4-btn-primary px-8 py-3.5 rounded-btn flex items-center gap-2 whitespace-nowrap"
            >
              Open VaultGit Portal
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
