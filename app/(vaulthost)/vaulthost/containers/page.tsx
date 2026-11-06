'use client';

import { PageHeroV4 } from '@/components/ui/page-hero-v4';
import { PanelCard } from '@/components/ui/panel-card';
import { ScrollReveal } from '@/components/ui/scroll-reveal';
import Link from 'next/link';
import { Container, Cpu, Settings, Lock, Network, Maximize, Terminal, Server, Check } from 'lucide-react';

export default function VaultContainersPage() {
  return (
    <div className="v4-page bg-ink min-h-screen">
      <PageHeroV4 
        eyebrow="VaultContainers"
        title={<>Managed <span className="text-signal">Kubernetes</span> — Without the Complexity</>}
        description="Fully managed Kubernetes clusters with auto-scaling, GPU node pools, private container registry, and GitOps-ready deployment pipelines. Zero Kubernetes expertise required."
      />

      {/* Stats Bar */}
      <div className="v4-section-sm border-y border-hairline bg-ink-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-medium text-text-primary-v4 mb-1">Managed</div>
              <div className="text-sm text-text-muted-v4">Control Plane</div>
            </div>
            <div>
              <div className="text-3xl font-medium text-text-primary-v4 mb-1">GPU</div>
              <div className="text-sm text-text-muted-v4">A100 / H100 Nodes</div>
            </div>
            <div>
              <div className="text-3xl font-medium text-text-primary-v4 mb-1">0→1000</div>
              <div className="text-sm text-text-muted-v4">Auto-scaling Pods</div>
            </div>
            <div>
              <div className="text-3xl font-medium text-text-primary-v4 mb-1">99.99%</div>
              <div className="text-sm text-text-muted-v4">Uptime SLA</div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="v4-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="text-center mb-16">
              <h2 className="v4-display text-text-primary-v4 mb-4">Enterprise-grade Kubernetes, simplified</h2>
              <p className="text-text-secondary-v4 max-w-2xl mx-auto text-lg">We manage the control plane, upgrades, and networking so you can focus on shipping containers.</p>
            </div>
          </ScrollReveal>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <ScrollReveal>
              <PanelCard className="v4-panel h-full flex flex-col p-6">
                <Settings className="w-8 h-8 text-signal mb-4" />
                <h3 className="text-xl font-medium text-text-primary-v4 mb-2">Managed Control Plane</h3>
                <p className="text-text-secondary-v4">Free, highly available control plane. We handle patching, upgrades, and etcd backups automatically.</p>
              </PanelCard>
            </ScrollReveal>
            <ScrollReveal delay={0.1}>
              <PanelCard className="v4-panel h-full flex flex-col p-6">
                <Cpu className="w-8 h-8 text-signal mb-4" />
                <h3 className="text-xl font-medium text-text-primary-v4 mb-2">GPU Node Pools</h3>
                <p className="text-text-secondary-v4">Spin up NVIDIA A100 and H100 nodes instantly for AI/ML inference and training workloads.</p>
              </PanelCard>
            </ScrollReveal>
            <ScrollReveal delay={0.2}>
              <PanelCard className="v4-panel h-full flex flex-col p-6">
                <Maximize className="w-8 h-8 text-signal mb-4" />
                <h3 className="text-xl font-medium text-text-primary-v4 mb-2">Auto-scaling</h3>
                <p className="text-text-secondary-v4">Built-in HPA, VPA, and KEDA support. Your cluster scales resources up and down based on real-time traffic.</p>
              </PanelCard>
            </ScrollReveal>
            <ScrollReveal delay={0.3}>
              <PanelCard className="v4-panel h-full flex flex-col p-6">
                <Lock className="w-8 h-8 text-signal mb-4" />
                <h3 className="text-xl font-medium text-text-primary-v4 mb-2">Private Registry</h3>
                <p className="text-text-secondary-v4">Integrated ECR-compatible container registry with vulnerability scanning and fast image pulls.</p>
              </PanelCard>
            </ScrollReveal>
            <ScrollReveal delay={0.4}>
              <PanelCard className="v4-panel h-full flex flex-col p-6">
                <Network className="w-8 h-8 text-signal mb-4" />
                <h3 className="text-xl font-medium text-text-primary-v4 mb-2">GitOps Ready</h3>
                <p className="text-text-secondary-v4">ArgoCD and Flux come pre-installed. Deploy by pushing to your Git repositories seamlessly.</p>
              </PanelCard>
            </ScrollReveal>
            <ScrollReveal delay={0.5}>
              <PanelCard className="v4-panel h-full flex flex-col p-6">
                <Container className="w-8 h-8 text-signal mb-4" />
                <h3 className="text-xl font-medium text-text-primary-v4 mb-2">Multi-Region Clusters</h3>
                <p className="text-text-secondary-v4">Deploy clusters across different geographical regions to reduce latency and improve fault tolerance.</p>
              </PanelCard>
            </ScrollReveal>
          </div>
        </div>
      </div>

      {/* Node Types Table */}
      <div className="v4-section bg-ink-surface-2 border-y border-hairline">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="text-center mb-16">
              <h2 className="v4-display text-text-primary-v4 mb-4">Compute for every workload</h2>
              <p className="text-text-secondary-v4 max-w-2xl mx-auto text-lg">Mix and match node pools to optimize performance and costs.</p>
            </div>
          </ScrollReveal>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse bg-ink rounded-lg overflow-hidden border border-hairline">
              <thead>
                <tr className="border-b border-hairline bg-ink-surface/50">
                  <th className="p-4 text-text-muted-v4 font-medium">Node Type</th>
                  <th className="p-4 text-text-muted-v4 font-medium">vCPU Range</th>
                  <th className="p-4 text-text-muted-v4 font-medium">RAM Range</th>
                  <th className="p-4 text-text-muted-v4 font-medium">Best For</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-hairline">
                  <td className="p-4 text-text-primary-v4 font-medium">General Purpose</td>
                  <td className="p-4 text-text-secondary-v4">2 - 96 Core</td>
                  <td className="p-4 text-text-secondary-v4">4GB - 384GB</td>
                  <td className="p-4 text-text-secondary-v4">Web servers, microservices, standard DBs</td>
                </tr>
                <tr className="border-b border-hairline">
                  <td className="p-4 text-text-primary-v4 font-medium">CPU Optimized</td>
                  <td className="p-4 text-text-secondary-v4">4 - 128 Core</td>
                  <td className="p-4 text-text-secondary-v4">8GB - 256GB</td>
                  <td className="p-4 text-text-secondary-v4">CI/CD, video encoding, batch processing</td>
                </tr>
                <tr className="border-b border-hairline">
                  <td className="p-4 text-text-primary-v4 font-medium">Memory Optimized</td>
                  <td className="p-4 text-text-secondary-v4">4 - 64 Core</td>
                  <td className="p-4 text-text-secondary-v4">32GB - 1024GB</td>
                  <td className="p-4 text-text-secondary-v4">In-memory databases, Redis caches, Big Data</td>
                </tr>
                <tr className="border-b border-hairline bg-signal/5">
                  <td className="p-4 text-signal font-medium flex items-center"><Cpu className="w-4 h-4 mr-2" /> GPU (NVIDIA)</td>
                  <td className="p-4 text-text-secondary-v4">16 - 96 Core</td>
                  <td className="p-4 text-text-secondary-v4">120GB - 1152GB</td>
                  <td className="p-4 text-text-secondary-v4">LLM inference, ML training, 3D rendering (A100/H100)</td>
                </tr>
                <tr>
                  <td className="p-4 text-text-primary-v4 font-medium">Storage Optimized</td>
                  <td className="p-4 text-text-secondary-v4">4 - 64 Core</td>
                  <td className="p-4 text-text-secondary-v4">32GB - 512GB</td>
                  <td className="p-4 text-text-secondary-v4">High IOPS databases, Elasticsearch, Kafka</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Code Sample Block */}
      <div className="v4-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <ScrollReveal>
              <div className="bg-ink-surface-2 rounded-2xl p-6 border border-hairline font-mono text-sm text-green-400 overflow-x-auto shadow-2xl">
                <pre>
                  <code>
{`$ vaulthost k8s create my-cluster \\
  --region=mumbai \\
  --nodes=3 \\
  --type=general

Cluster "my-cluster" created successfully.
Control plane is ready.

$ vaulthost k8s get-credentials my-cluster

$ kubectl get nodes
NAME              STATUS   ROLES    AGE   VERSION
node-pool-abc-1   Ready    <none>   2m    v1.28.0
node-pool-abc-2   Ready    <none>   2m    v1.28.0
node-pool-abc-3   Ready    <none>   2m    v1.28.0`}
                  </code>
                </pre>
              </div>
            </ScrollReveal>
            <ScrollReveal delay={0.2}>
              <div>
                <h2 className="v4-display text-text-primary-v4 mb-6">Launch via CLI or Dashboard</h2>
                <p className="text-text-secondary-v4 text-lg mb-8">Provisioning a cluster takes minutes, not hours. Use our intuitive web dashboard, the powerful CLI, or our Terraform provider to manage your infrastructure as code.</p>
                <Link href="/portal" className="v4-btn-secondary inline-flex items-center rounded-btn px-6 py-3">
                  Read API Docs <Terminal className="ml-2 w-4 h-4" />
                </Link>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </div>

      {/* Pricing */}
      <div className="v4-section bg-ink-surface-2 border-y border-hairline">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <h2 className="v4-display text-text-primary-v4 text-center mb-16">Transparent Pricing</h2>
          </ScrollReveal>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <ScrollReveal>
              <div className="v4-panel p-8 rounded-2xl flex flex-col h-full">
                <h3 className="text-2xl font-medium text-text-primary-v4 mb-2">Starter</h3>
                <div className="text-4xl font-bold text-text-primary-v4 mb-6">₹999<span className="text-lg text-text-muted-v4 font-normal">/mo</span></div>
                <ul className="space-y-4 mb-8 flex-1">
                  <li className="flex items-center text-text-secondary-v4"><Check className="w-5 h-5 text-signal mr-3 flex-shrink-0" /> 3 Nodes</li>
                  <li className="flex items-center text-text-secondary-v4"><Check className="w-5 h-5 text-signal mr-3 flex-shrink-0" /> 6 vCPU total</li>
                  <li className="flex items-center text-text-secondary-v4"><Check className="w-5 h-5 text-signal mr-3 flex-shrink-0" /> 12GB RAM total</li>
                </ul>
                <Link href="/portal" className="v4-btn-secondary w-full justify-center rounded-btn py-3">Deploy Starter</Link>
              </div>
            </ScrollReveal>
            
            <ScrollReveal delay={0.1}>
              <div className="v4-panel p-8 rounded-2xl flex flex-col h-full border-signal border relative">
                <div className="absolute top-0 right-8 -translate-y-1/2 bg-signal text-ink text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">Production</div>
                <h3 className="text-2xl font-medium text-text-primary-v4 mb-2">Pro</h3>
                <div className="text-4xl font-bold text-text-primary-v4 mb-6">₹4,999<span className="text-lg text-text-muted-v4 font-normal">/mo</span></div>
                <ul className="space-y-4 mb-8 flex-1">
                  <li className="flex items-center text-text-secondary-v4"><Check className="w-5 h-5 text-signal mr-3 flex-shrink-0" /> 10 Nodes</li>
                  <li className="flex items-center text-text-secondary-v4"><Check className="w-5 h-5 text-signal mr-3 flex-shrink-0" /> Dedicated Load Balancer</li>
                  <li className="flex items-center text-text-secondary-v4"><Check className="w-5 h-5 text-signal mr-3 flex-shrink-0" /> Standard Support</li>
                </ul>
                <Link href="/portal" className="v4-btn-primary w-full justify-center rounded-btn py-3">Deploy Pro</Link>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={0.2}>
              <div className="v4-panel p-8 rounded-2xl flex flex-col h-full">
                <h3 className="text-2xl font-medium text-text-primary-v4 mb-2">Enterprise</h3>
                <div className="text-4xl font-bold text-text-primary-v4 mb-6">Custom</div>
                <ul className="space-y-4 mb-8 flex-1">
                  <li className="flex items-center text-text-secondary-v4"><Check className="w-5 h-5 text-signal mr-3 flex-shrink-0" /> Unlimited Nodes</li>
                  <li className="flex items-center text-text-secondary-v4"><Check className="w-5 h-5 text-signal mr-3 flex-shrink-0" /> GPU Access & Multi-Region</li>
                  <li className="flex items-center text-text-secondary-v4"><Check className="w-5 h-5 text-signal mr-3 flex-shrink-0" /> 24/7 Dedicated Support</li>
                </ul>
                <Link href="/contact" className="v4-btn-secondary w-full justify-center rounded-btn py-3">Contact Sales</Link>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </div>

      {/* Premium CTA */}
      <div className="v4-section" style={{ background: 'linear-gradient(135deg, rgba(10,18,36,0.98), rgba(6,12,24,1))' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-16">
          <ScrollReveal>
            <h2 className="v4-display text-white mb-6">Run your containers with confidence</h2>
            <p className="text-text-secondary-v4 max-w-2xl mx-auto mb-10 text-lg">Join teams that are scaling massive workloads on VaultHost Kubernetes.</p>
            <Link href="/portal" className="v4-btn-primary inline-flex items-center rounded-btn px-8 py-4 text-lg">
              Launch a Cluster <Server className="ml-2 w-5 h-5" />
            </Link>
          </ScrollReveal>
        </div>
      </div>
    </div>
  );
}
