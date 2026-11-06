'use client';

import { PageHeroV4 } from '@/components/ui/page-hero-v4';
import { PanelCard } from '@/components/ui/panel-card';
import { ScrollReveal } from '@/components/ui/scroll-reveal';
import Link from 'next/link';
import { Smartphone, Layers, Code2, Users, ArrowRight, Zap, Target, ShieldCheck } from 'lucide-react';

export default function MobileAppsPage() {
  return (
    <main className="v4-page">
      <PageHeroV4 
        eyebrow="Mobile App Development"
        title={<>Native & Cross-Platform Apps <span className="text-signal">for Enterprise</span></>}
        description="We build high-performance, secure, and scalable mobile applications for iOS and Android. From consumer-facing apps to internal enterprise tools, we deliver mobile experiences that drive engagement and business value."
      />

      <section className="v4-section bg-ink-surface">
        <div className="container mx-auto px-4 md:px-8">
          <ScrollReveal>
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-text-primary-v4 mb-6">Supported Platforms</h2>
              <p className="text-text-secondary-v4 text-lg">We use the right technology stack for your specific requirements, whether you need native performance or cross-platform efficiency.</p>
            </div>
          </ScrollReveal>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: 'iOS Native', desc: 'Swift & Objective-C for maximum performance and deep Apple ecosystem integration.', icon: Smartphone },
              { title: 'Android Native', desc: 'Kotlin & Java for robust applications across the diverse Android device landscape.', icon: Layers },
              { title: 'React Native', desc: 'Efficient cross-platform development sharing a single codebase for both platforms.', icon: Code2 },
              { title: 'Flutter', desc: 'Beautiful, natively compiled applications from a single codebase by Google.', icon: Zap }
            ].map((platform, i) => (
              <ScrollReveal key={i} delay={i * 0.1}>
                <PanelCard className="h-full flex flex-col items-start p-8">
                  <div className="p-3 rounded-full bg-signal/10 text-signal mb-6">
                    <platform.icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-semibold text-text-primary-v4 mb-3">{platform.title}</h3>
                  <p className="text-text-secondary-v4">{platform.desc}</p>
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
              <h2 className="text-3xl md:text-4xl font-bold text-text-primary-v4 mb-6">Our Process</h2>
              <p className="text-text-secondary-v4 text-lg mb-8">We don't just write code. We partner with you through the entire mobile app lifecycle, from initial concept to launch and ongoing maintenance.</p>
              
              <div className="space-y-6">
                {[
                  { step: '01', title: 'Discovery & UX/UI Design', desc: 'Understanding your users and designing intuitive interfaces.' },
                  { step: '02', title: 'Architecture & Development', desc: 'Building scalable backends and fluid frontends.' },
                  { step: '03', title: 'QA & Security Testing', desc: 'Rigorous testing on real devices for performance and security.' },
                  { step: '04', title: 'App Store Launch & Support', desc: 'Navigating submission processes and post-launch maintenance.' }
                ].map((item, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="text-signal font-mono font-bold text-xl">{item.step}</div>
                    <div>
                      <h4 className="text-text-primary-v4 font-semibold text-lg mb-1">{item.title}</h4>
                      <p className="text-text-secondary-v4">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollReveal>
            
            <ScrollReveal delay={0.2}>
              <div className="v4-panel p-8 md:p-12 border-l-4 border-l-signal">
                <h3 className="text-4xl md:text-6xl font-bold text-text-primary-v4 mb-4">180+</h3>
                <div className="text-xl text-text-primary-v4 font-semibold mb-2">Apps Shipped Successfully</div>
                <p className="text-text-secondary-v4 mb-8">Across fintech, healthcare, retail, and enterprise sectors globally.</p>
                
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <div className="flex items-center gap-2 text-signal mb-2">
                      <Target className="w-5 h-5" />
                      <span className="font-semibold">99.9%</span>
                    </div>
                    <div className="text-sm text-text-secondary-v4">Crash-free Sessions</div>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 text-signal mb-2">
                      <ShieldCheck className="w-5 h-5" />
                      <span className="font-semibold">Enterprise</span>
                    </div>
                    <div className="text-sm text-text-secondary-v4">Grade Security</div>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      <section className="v4-section-sm bg-ink-surface border-t border-hairline">
        <div className="container mx-auto px-4 md:px-8 text-center">
          <ScrollReveal>
            <h2 className="text-3xl font-bold text-text-primary-v4 mb-6">Ready to build your next mobile app?</h2>
            <p className="text-text-secondary-v4 text-lg max-w-2xl mx-auto mb-8">Let's discuss your mobile strategy and see how we can bring your vision to life.</p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link href="/contact" className="v4-btn-primary">
                Schedule a Consultation
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
              <Link href="/portfolio" className="v4-btn-secondary">
                View Case Studies
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </main>
  );
}
