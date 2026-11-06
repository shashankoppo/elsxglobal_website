'use client';

import { PageHeroV4 } from '@/components/ui/page-hero-v4';
import { PanelCard } from '@/components/ui/panel-card';
import { ScrollReveal } from '@/components/ui/scroll-reveal';
import Link from 'next/link';
import { Container, Network, Activity, ArrowRight, Shield, Layers, Cloud } from 'lucide-react';

export default function KubernetesPage() {
  return (
    <main className="v4-page">
      <PageHeroV4 
        eyebrow="Kubernetes & Containers"
        title={<>Container Orchestration <span className="text-signal">at Enterprise Scale</span></>}
        description="We design, deploy, and manage Kubernetes architectures that provide massive scalability, high availability, and streamlined deployments for modern microservices."
      />

      <section className="v4-section bg-ink-surface">
        <div className="container mx-auto px-4 md:px-8">
          <ScrollReveal>
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-text-primary-v4 mb-6">Our Kubernetes Services</h2>
              <p className="text-text-secondary-v4 text-lg">End-to-end container solutions, from initial cluster setup to advanced service mesh architectures.</p>
            </div>
          </ScrollReveal>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { title: 'Cluster Setup & Config', desc: 'Production-ready clusters engineered for security, high availability, and disaster recovery.', icon: Layers },
              { title: 'Helm Charts & Operators', desc: 'Standardized application packaging for repeatable and automated deployments.', icon: Container },
              { title: 'Service Mesh (Istio)', desc: 'Advanced traffic routing, observability, and mTLS security between microservices.', icon: Network },
              { title: 'Auto-Scaling (HPA/VPA)', desc: 'Dynamic resource allocation to handle traffic spikes while minimizing cloud costs.', icon: Activity },
              { title: 'GitOps (ArgoCD)', desc: 'Declarative continuous delivery operating directly from your Git repositories.', icon: Cloud }
            ].map((service, i) => (
              <ScrollReveal key={i} delay={i * 0.1}>
                <PanelCard className="p-8 h-full">
                  <div className="p-3 bg-signal/10 text-signal inline-flex rounded-lg mb-4">
                     <service.icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold text-text-primary-v4 mb-3">{service.title}</h3>
                  <p className="text-text-secondary-v4">{service.desc}</p>
                </PanelCard>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      <section className="v4-section">
        <div className="container mx-auto px-4 md:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <ScrollReveal>
              <h2 className="text-3xl md:text-4xl font-bold text-text-primary-v4 mb-6">Managed Kubernetes Expertise</h2>
              <p className="text-text-secondary-v4 text-lg mb-8">We work across all major cloud providers, leveraging their managed Kubernetes offerings for optimal stability and reduced operational overhead.</p>
              
              <div className="space-y-4">
                <div className="v4-panel p-6 border-l-4 border-l-blue-500">
                  <h4 className="font-bold text-text-primary-v4 text-lg mb-1">Amazon EKS (Elastic Kubernetes Service)</h4>
                  <p className="text-text-secondary-v4 text-sm">Deep integration with AWS IAM, VPC, and AWS Load Balancers.</p>
                </div>
                <div className="v4-panel p-6 border-l-4 border-l-green-500">
                  <h4 className="font-bold text-text-primary-v4 text-lg mb-1">Google GKE (Kubernetes Engine)</h4>
                  <p className="text-text-secondary-v4 text-sm">Industry-leading managed K8s with Autopilot and advanced networking.</p>
                </div>
                <div className="v4-panel p-6 border-l-4 border-l-blue-400">
                  <h4 className="font-bold text-text-primary-v4 text-lg mb-1">Azure AKS (Kubernetes Service)</h4>
                  <p className="text-text-secondary-v4 text-sm">Seamless Active Directory integration and Azure Monitor capabilities.</p>
                </div>
              </div>
            </ScrollReveal>
            
            <ScrollReveal delay={0.2}>
              <div className="v4-panel p-8 md:p-12 bg-ink border border-signal/20">
                <Shield className="w-12 h-12 text-signal mb-6" />
                <h3 className="text-2xl font-bold text-text-primary-v4 mb-4">Security at the Core</h3>
                <p className="text-text-secondary-v4 mb-6">Our clusters are hardened out-of-the-box.</p>
                <ul className="space-y-3">
                  {[
                    'Network Policies for pod isolation',
                    'RBAC and least-privilege access',
                    'Container image scanning in CI/CD',
                    'Secrets management (HashiCorp Vault)'
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-3 text-text-primary-v4">
                      <div className="w-2 h-2 rounded-full bg-signal" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      <section className="v4-section-sm border-t border-hairline text-center">
        <div className="container mx-auto px-4 md:px-8">
          <ScrollReveal>
            <h2 className="text-3xl font-bold text-text-primary-v4 mb-6">Ready to scale with Kubernetes?</h2>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link href="/contact" className="v4-btn-primary">
                Talk to a Cloud Architect
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </main>
  );
}
