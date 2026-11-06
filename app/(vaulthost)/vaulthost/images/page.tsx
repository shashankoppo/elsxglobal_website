'use client';

import React from 'react';
import Link from 'next/link';
import { PageHeroV4 } from '@/components/ui/page-hero-v4';
import { PanelCard } from '@/components/ui/panel-card';
import { ScrollReveal } from '@/components/ui/scroll-reveal';
import { Image as ImageIcon, Zap, Crop, Layers, Droplet, Globe, FileCode2 } from 'lucide-react';

export default function ImagesPage() {
  return (
    <div className="min-h-screen bg-[#060C18] text-slate-300 pb-24">
      <PageHeroV4 
        eyebrow="VaultImages"
        title={<>Perfect Images. <span className="text-signal">Zero Configuration.</span></>}
        description="Serve perfectly sized, next-gen format images from VaultHost's global CDN. Automatic WebP/AVIF conversion, on-the-fly resizing, and smart cropping — for any device, any resolution."
      />

      {/* Stats */}
      <section className="py-12 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { label: 'Avg Size Reduction', value: '60%' },
              { label: 'Next-Gen Output', value: 'WebP + AVIF' },
              { label: 'Transformation', value: 'Real-time' },
              { label: 'Supported Sources', value: 'S3/R2/URL' },
            ].map((stat, i) => (
              <ScrollReveal key={i} delay={i * 0.1}>
                <div className="text-3xl font-light text-white mb-2">{stat.value}</div>
                <div className="text-sm text-slate-400">{stat.label}</div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-light text-white mb-4 v4-display">Powerful Image Optimization</h2>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto">Transform your images on the fly with our powerful edge computing network.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <PanelCard
              title="Format Conversion"
              description="Automatically serve WebP or AVIF formats to compatible browsers, falling back to JPEG/PNG when needed."
              icon={<ImageIcon className="w-5 h-5 text-signal" />}
            />
            <PanelCard
              title="On-the-fly Resize"
              description="Resize images dynamically by appending query parameters. Perfect for responsive designs and thumbnails."
              icon={<Zap className="w-5 h-5 text-signal" />}
            />
            <PanelCard
              title="Smart Crop"
              description="AI-powered focal point detection ensures the most important part of your image remains visible when cropping."
              icon={<Crop className="w-5 h-5 text-signal" />}
            />
            <PanelCard
              title="Image Variants"
              description="Define reusable transformation presets (e.g., 'avatar', 'hero') for consistent styling across your application."
              icon={<Layers className="w-5 h-5 text-signal" />}
            />
            <PanelCard
              title="Watermarking"
              description="Dynamically apply text or image watermarks to protect your intellectual property with customizable positioning."
              icon={<Droplet className="w-5 h-5 text-signal" />}
            />
            <PanelCard
              title="Global CDN Delivery"
              description="Transformed images are cached at the edge, delivering lightning-fast assets to users worldwide in under 50ms."
              icon={<Globe className="w-5 h-5 text-signal" />}
            />
          </div>
        </div>
      </section>

      {/* Code Sample */}
      <section className="py-24 bg-white/[0.02]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-light text-white mb-12 text-center v4-display">Simple URL Transformations</h2>
          <div className="bg-[#0A1224] border border-white/10 rounded-2xl overflow-hidden max-w-4xl mx-auto">
            <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-black/20">
              <div className="flex items-center gap-2">
                <FileCode2 className="w-5 h-5 text-slate-400" />
                <span className="text-sm font-mono text-slate-300">Transformation Example</span>
              </div>
            </div>
            <div className="p-6 overflow-x-auto text-center">
              <p className="text-sm font-mono text-slate-300 mb-4 break-all">
                https://images.vaulthost.cloud/your-image.jpg<span className="text-emerald-400">?w=800&h=600&fit=cover&format=webp&q=85</span>
              </p>
              <div className="flex flex-col md:flex-row items-center justify-center gap-8 mt-8">
                <div className="text-center">
                  <div className="text-xl text-white mb-2">Original PNG</div>
                  <div className="text-3xl font-light text-rose-400">2.4 MB</div>
                </div>
                <div className="hidden md:block text-slate-500 text-2xl">→</div>
                <div className="text-center">
                  <div className="text-xl text-white mb-2">VaultImages WebP</div>
                  <div className="text-3xl font-light text-emerald-400">180 KB</div>
                  <div className="text-sm text-emerald-500/70 mt-1">93% smaller</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-light text-white mb-4 v4-display">Optimized Pricing</h2>
            <p className="text-lg text-slate-400">Transform and serve images without breaking the bank.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 rounded-2xl bg-white/5 border border-white/10">
              <h3 className="text-xl text-white mb-2">Free</h3>
              <div className="text-3xl font-light text-white mb-6">₹0<span className="text-lg text-slate-400">/mo</span></div>
              <ul className="space-y-3 text-slate-300">
                <li>100K Transformations/mo</li>
                <li>1GB Storage</li>
                <li>Community Support</li>
              </ul>
            </div>
            
            <div className="p-8 rounded-2xl bg-[#0A1224] border border-signal/30 relative">
              <div className="absolute top-0 right-8 -translate-y-1/2 px-3 py-1 bg-signal text-[#060C18] text-xs font-medium rounded-full">Most Popular</div>
              <h3 className="text-xl text-white mb-2">Pro</h3>
              <div className="text-3xl font-light text-white mb-6">₹699<span className="text-lg text-slate-400">/mo</span></div>
              <ul className="space-y-3 text-slate-300">
                <li>5M Transformations/mo</li>
                <li>25GB Storage</li>
                <li>Priority Support</li>
              </ul>
            </div>
            
            <div className="p-8 rounded-2xl bg-white/5 border border-white/10">
              <h3 className="text-xl text-white mb-2">Business</h3>
              <div className="text-3xl font-light text-white mb-6">Custom</div>
              <ul className="space-y-3 text-slate-300">
                <li>Unlimited Transformations</li>
                <li>Custom Storage limits</li>
                <li>SLA & Dedicated Support</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-white/[0.02]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div 
            className="rounded-3xl p-12 text-center border border-white/10"
            style={{ background: 'linear-gradient(135deg, rgba(10,18,36,0.98), rgba(6,12,24,1))' }}
          >
            <h2 className="text-3xl md:text-4xl font-light text-white mb-6 v4-display">Ready to optimize?</h2>
            <p className="text-lg text-slate-400 mb-8 max-w-2xl mx-auto">Start serving lightning-fast images to your users today.</p>
            <Link 
              href="/portal" 
              className="inline-flex items-center justify-center h-12 px-8 rounded-lg bg-white text-[#060C18] font-medium hover:bg-slate-200 transition-colors"
            >
              Start optimizing images →
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
