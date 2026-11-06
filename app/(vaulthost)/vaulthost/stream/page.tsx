'use client';

import React from 'react';
import Link from 'next/link';
import { PageHeroV4 } from '@/components/ui/page-hero-v4';
import { PanelCard } from '@/components/ui/panel-card';
import { ScrollReveal } from '@/components/ui/scroll-reveal';
import { Video, Globe, Zap, Shield, Play, BarChart3, Code } from 'lucide-react';

export default function StreamPage() {
  return (
    <div className="min-h-screen bg-[#060C18] text-slate-300 pb-24">
      <PageHeroV4 
        eyebrow="VaultStream"
        title={<>Video Infrastructure for <span className="text-signal">Developers.</span></>}
        description="Upload, transcode, and stream video globally with adaptive bitrate, DRM protection, and a customizable player. No video expertise required. Pay only for what you stream."
      />

      {/* Stats */}
      <section className="py-12 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { label: 'Formats Supported', value: '30+' },
              { label: 'Adaptive Streaming', value: 'HLS/DASH' },
              { label: 'Global PoP Delivery', value: '300+' },
              { label: 'Processing Start', value: '<5s' },
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
            <h2 className="text-3xl md:text-4xl font-light text-white mb-4 v4-display">Complete Video Infrastructure</h2>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto">Everything you need to build next-generation video experiences.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <PanelCard
              title="Auto Transcoding"
              description="MP4, MOV, AVI, and 30+ other formats automatically transcoded to HLS/DASH for optimal delivery."
              icon={<Zap className="w-5 h-5 text-signal" />}
            />
            <PanelCard
              title="Adaptive Bitrate"
              description="Video quality adjusts automatically in real-time based on your viewer's network connection and device."
              icon={<Globe className="w-5 h-5 text-signal" />}
            />
            <PanelCard
              title="DRM Protection"
              description="Studio-grade content protection with Widevine and FairPlay integration to prevent unauthorized downloads."
              icon={<Shield className="w-5 h-5 text-signal" />}
            />
            <PanelCard
              title="Custom Player"
              description="Embed a fully customizable, lightweight player with one line of code. Full CSS control over the UI."
              icon={<Play className="w-5 h-5 text-signal" />}
            />
            <PanelCard
              title="Live Streaming"
              description="Ingest via RTMP and deliver low-latency live streams globally to millions of concurrent viewers."
              icon={<Video className="w-5 h-5 text-signal" />}
            />
            <PanelCard
              title="Video Analytics"
              description="Detailed insights into views, watch time, completion rates, and playback quality metrics."
              icon={<BarChart3 className="w-5 h-5 text-signal" />}
            />
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="py-24 bg-white/[0.02]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-light text-white mb-12 text-center v4-display">Built for Any Application</h2>
          <div className="flex flex-wrap justify-center gap-4">
            {['E-learning platforms', 'Video-on-demand', 'Corporate communications', 'Sports streaming', 'Podcast video'].map((useCase, i) => (
              <div key={i} className="px-6 py-3 rounded-full bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-colors">
                {useCase}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Code Sample */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-[#0A1224] border border-white/10 rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-black/20">
              <div className="flex items-center gap-2">
                <Code className="w-5 h-5 text-slate-400" />
                <span className="text-sm font-mono text-slate-300">upload.ts</span>
              </div>
            </div>
            <div className="p-6 overflow-x-auto">
              <pre className="text-sm font-mono text-emerald-400">
                <code>{`// Upload a video to VaultStream with one simple API call
const uploadVideo = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await fetch('https://stream.vaulthost.cloud/upload', {
    method: 'POST',
    headers: { 'Authorization': 'Bearer YOUR_API_KEY' },
    body: formData
  });
  
  const { playbackUrl, videoId } = await response.json();
  return playbackUrl;
};`}</code>
              </pre>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-24 bg-white/[0.02]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-light text-white mb-4 v4-display">Simple, Transparent Pricing</h2>
            <p className="text-lg text-slate-400">Pay only for what you stream. No hidden fees.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 rounded-2xl bg-white/5 border border-white/10">
              <h3 className="text-xl text-white mb-2">Free</h3>
              <div className="text-3xl font-light text-white mb-6">₹0<span className="text-lg text-slate-400">/mo</span></div>
              <ul className="space-y-3 text-slate-300">
                <li>1GB Storage</li>
                <li>5GB Delivery/mo</li>
                <li>Standard Support</li>
              </ul>
            </div>
            
            <div className="p-8 rounded-2xl bg-[#0A1224] border border-signal/30 relative">
              <div className="absolute top-0 right-8 -translate-y-1/2 px-3 py-1 bg-signal text-[#060C18] text-xs font-medium rounded-full">Most Popular</div>
              <h3 className="text-xl text-white mb-2">Pro</h3>
              <div className="text-3xl font-light text-white mb-6">₹1,499<span className="text-lg text-slate-400">/mo</span></div>
              <ul className="space-y-3 text-slate-300">
                <li>100GB Storage</li>
                <li>500GB Delivery/mo</li>
                <li>Priority Support</li>
              </ul>
            </div>
            
            <div className="p-8 rounded-2xl bg-white/5 border border-white/10">
              <h3 className="text-xl text-white mb-2">Business</h3>
              <div className="text-3xl font-light text-white mb-6">₹4,999<span className="text-lg text-slate-400">/mo</span></div>
              <ul className="space-y-3 text-slate-300">
                <li>1TB Storage</li>
                <li>2TB Delivery/mo</li>
                <li>24/7 Phone Support</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div 
            className="rounded-3xl p-12 text-center border border-white/10"
            style={{ background: 'linear-gradient(135deg, rgba(10,18,36,0.98), rgba(6,12,24,1))' }}
          >
            <h2 className="text-3xl md:text-4xl font-light text-white mb-6 v4-display">Ready to stream?</h2>
            <p className="text-lg text-slate-400 mb-8 max-w-2xl mx-auto">Join thousands of developers building fast, reliable video experiences on VaultHost.</p>
            <Link 
              href="/portal" 
              className="inline-flex items-center justify-center h-12 px-8 rounded-lg bg-white text-[#060C18] font-medium hover:bg-slate-200 transition-colors"
            >
              Upload your first video →
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
