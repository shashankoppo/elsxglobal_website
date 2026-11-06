'use client';

import { PageHeroV4 } from '@/components/ui/page-hero-v4';
import { PanelCard } from '@/components/ui/panel-card';
import { ScrollReveal } from '@/components/ui/scroll-reveal';
import Link from 'next/link';
import { Eye, ScanSearch, FileText, Activity, Video, ArrowRight, Cog } from 'lucide-react';

export default function ComputerVisionPage() {
  return (
    <main className="v4-page">
      <PageHeroV4 
        eyebrow="Computer Vision"
        title={<>Give Your Systems the <span className="text-signal">Power of Sight</span></>}
        description="We build robust computer vision models that extract meaningful information from digital images, videos, and visual inputs to automate tasks and improve decision-making."
      />

      <section className="v4-section bg-ink-surface">
        <div className="container mx-auto px-4 md:px-8">
          <ScrollReveal>
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-text-primary-v4 mb-6">Real-World Applications</h2>
              <p className="text-text-secondary-v4 text-lg">From manufacturing lines to healthcare, our vision systems solve complex automation challenges.</p>
            </div>
          </ScrollReveal>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { title: 'Defect Detection', desc: 'Automated quality control on manufacturing lines with sub-millimeter precision.', icon: ScanSearch },
              { title: 'Facial Recognition', desc: 'Secure identity verification and access control systems.', icon: Eye },
              { title: 'Optical Character Rec. (OCR)', desc: 'Digitizing physical documents, invoices, and IDs instantly.', icon: FileText },
              { title: 'Medical Imaging', desc: 'Assisting radiologists in detecting anomalies in X-rays and MRIs.', icon: Activity },
              { title: 'Video Analytics', desc: 'Real-time tracking, crowd counting, and behavior analysis from CCTV feeds.', icon: Video }
            ].map((app, i) => (
              <ScrollReveal key={i} delay={i * 0.1}>
                <PanelCard className="p-8 h-full flex flex-col justify-between">
                  <div>
                    <app.icon className="w-8 h-8 text-signal mb-4" />
                    <h3 className="text-xl font-bold text-text-primary-v4 mb-3">{app.title}</h3>
                    <p className="text-text-secondary-v4">{app.desc}</p>
                  </div>
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
              <h2 className="text-3xl md:text-4xl font-bold text-text-primary-v4 mb-6">Our Vision Tech Stack</h2>
              <p className="text-text-secondary-v4 text-lg mb-8">We utilize state-of-the-art frameworks to build fast, accurate, and scalable vision pipelines.</p>
              
              <div className="space-y-6">
                {[
                  { title: 'YOLO (You Only Look Once)', desc: 'Industry standard for ultra-fast, real-time object detection.' },
                  { title: 'OpenCV', desc: 'Comprehensive library for core image processing operations.' },
                  { title: 'TensorFlow & PyTorch', desc: 'Training custom deep neural networks for specialized classification.' }
                ].map((tech, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="mt-1">
                      <Cog className="w-6 h-6 text-signal" />
                    </div>
                    <div>
                      <h4 className="text-text-primary-v4 font-semibold text-lg">{tech.title}</h4>
                      <p className="text-text-secondary-v4">{tech.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollReveal>
            
            <ScrollReveal delay={0.2}>
               <div className="v4-panel p-8 md:p-12 border-l-4 border-l-signal">
                <h3 className="text-2xl font-bold text-text-primary-v4 mb-4">Edge vs Cloud Deployment</h3>
                <p className="text-text-secondary-v4 mb-6">We deploy models where they make the most sense for your latency, privacy, and cost requirements.</p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-ink p-4 rounded-xl border border-hairline">
                    <h4 className="font-semibold text-text-primary-v4 mb-2">Edge (On-Device)</h4>
                    <p className="text-sm text-text-secondary-v4">Zero latency, offline capable, high privacy. Best for manufacturing lines.</p>
                  </div>
                  <div className="bg-ink p-4 rounded-xl border border-hairline">
                    <h4 className="font-semibold text-text-primary-v4 mb-2">Cloud Infrastructure</h4>
                    <p className="text-sm text-text-secondary-v4">Infinite scalability, easy updates. Best for batch processing and heavy models.</p>
                  </div>
                </div>
               </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      <section className="v4-section-sm bg-ink-surface text-center">
        <div className="container mx-auto px-4 md:px-8">
          <ScrollReveal>
            <h2 className="text-3xl font-bold text-text-primary-v4 mb-6">Automate your visual workflows</h2>
            <div className="flex justify-center">
              <Link href="/contact" className="v4-btn-primary">
                Discuss Your Vision Project
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </main>
  );
}
