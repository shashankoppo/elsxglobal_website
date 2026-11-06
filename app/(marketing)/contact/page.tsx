'use client';

import { useState } from 'react';
import { Mail, Phone, MapPin, MessageSquare, ArrowRight, Send, Building2 } from 'lucide-react';
import { PageHeroV4 } from '@/components/ui/page-hero-v4';
import { PanelCard } from '@/components/ui/panel-card';
import { SectionLabelV4 } from '@/components/ui/section-label-v4';
import { motion } from 'framer-motion';
import { useScrollReveal, fadeUp, stagger } from '@/lib/animations';

const CONTACT_INFO = [
  { icon: Mail, label: 'Email', value: 'contact@elsxglobal.cloud', href: 'mailto:contact@elsxglobal.cloud' },
  { icon: MessageSquare, label: 'Response Time', value: 'Within 4 business hours', href: '#' },
  { icon: MapPin, label: 'HQ', value: 'Jabalpur, Madhya Pradesh, India', href: '#' },
  { icon: MessageSquare, label: 'Live Chat', value: 'Available 24/7', href: '#' },
];

const OFFICES = [
  { city: 'Jabalpur', country: 'India', desc: 'Global Headquarters', status: 'Operational' },
  { city: 'Indore', country: 'India', desc: 'Development Center', status: 'Operational' },
  { city: 'Pune', country: 'India', desc: 'BPO & KPO Operations', status: 'Operational' },
  { city: 'Eindhoven', country: 'Netherlands', desc: 'European Operations', status: 'Operational' },
  { city: 'Chicago', country: 'USA', desc: 'North American Operations', status: 'Operational' },
];

const SERVICES = [
  'VaultHost Infrastructure',
  'ELSxTech Software',
  'ELSxBPO Automation',
  'ELSxKPO Analytics',
  'ELSxConsultancy Strategy',
  'General Inquiry',
];

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', company: '', service: SERVICES[0], message: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="v4-page">
      <PageHeroV4
        eyebrow="Contact"
        eyebrowIcon={Mail}
        title={<>Let&apos;s Talk About Your Infrastructure</>}
        description="Whether you need a cloud migration, a custom AI model, or a 24/7 support team — we respond within one business day."
      />

      <section className="v4-section-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div variants={stagger} {...useScrollReveal()} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {CONTACT_INFO.map((c) => (
              <motion.div key={c.label} variants={fadeUp}>
                <a href={c.href} className="block">
                  <PanelCard hover className="p-5 h-full">
                    <div className="flex h-9 w-9 items-center justify-center rounded-chip border border-hairline bg-ink-surface-2 mb-3">
                      <c.icon className="h-4 w-4 text-signal" />
                    </div>
                    <p className="v4-readout text-[10px] uppercase tracking-widest text-text-muted-v4">{c.label}</p>
                    <p className="mt-1 text-sm text-text-primary-v4">{c.value}</p>
                  </PanelCard>
                </a>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <section className="v4-section-sm bg-ink-surface">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-5 gap-6">
            <motion.div initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="lg:col-span-2">
              <SectionLabelV4 icon={Building2}>Our Offices</SectionLabelV4>
              <h2 className="mt-4 text-2xl v4-display text-text-primary-v4 mb-6">Three Locations. One Team.</h2>
              <div className="space-y-3">
                {OFFICES.map((o) => (
                  <PanelCard key={o.city} className="p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm font-semibold text-text-primary-v4">{o.city}, {o.country}</p>
                        <p className="mt-1 text-xs text-text-secondary-v4">{o.desc}</p>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="v4-live-dot" />
                        <span className="v4-readout text-[10px] text-good">{o.status.toUpperCase()}</span>
                      </div>
                    </div>
                  </PanelCard>
                ))}
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }} className="lg:col-span-3">
              <PanelCard className="p-6 lg:p-8">
                {submitted ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="flex h-14 w-14 items-center justify-center rounded-panel border border-good/30 bg-good/10 mb-4">
                      <Send className="h-6 w-6 text-good" />
                    </div>
                    <h3 className="text-xl font-semibold text-text-primary-v4">Message Sent</h3>
                    <p className="mt-2 text-sm text-text-secondary-v4 max-w-sm">Thank you for reaching out. Our team will respond within one business day.</p>
                    <button
                      onClick={() => { setSubmitted(false); setForm({ name: '', email: '', company: '', service: SERVICES[0], message: '' }); }}
                      className="mt-6 px-5 py-2.5 rounded-btn v4-btn-ghost text-sm"
                    >
                      Send Another
                    </button>
                  </div>
                ) : (
                  <>
                    <h3 className="text-lg font-semibold text-text-primary-v4 mb-1">Send us a message</h3>
                    <p className="text-sm text-text-muted-v4 mb-6">All fields required. We respond within 1 business day.</p>
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                          <label className="v4-readout text-[10px] uppercase tracking-widest text-text-muted-v4">Name</label>
                          <input
                            required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                            className="mt-1.5 w-full px-4 py-2.5 rounded-btn border border-hairline bg-ink-surface-2 text-sm text-text-primary-v4 placeholder:text-text-muted-v4 focus:border-signal focus:outline-none transition-colors"
                            placeholder="Jane Doe"
                          />
                        </div>
                        <div>
                          <label className="v4-readout text-[10px] uppercase tracking-widest text-text-muted-v4">Email</label>
                          <input
                            required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                            className="mt-1.5 w-full px-4 py-2.5 rounded-btn border border-hairline bg-ink-surface-2 text-sm text-text-primary-v4 placeholder:text-text-muted-v4 focus:border-signal focus:outline-none transition-colors"
                            placeholder="jane@company.com"
                          />
                        </div>
                      </div>
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                          <label className="v4-readout text-[10px] uppercase tracking-widest text-text-muted-v4">Company</label>
                          <input
                            required value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })}
                            className="mt-1.5 w-full px-4 py-2.5 rounded-btn border border-hairline bg-ink-surface-2 text-sm text-text-primary-v4 placeholder:text-text-muted-v4 focus:border-signal focus:outline-none transition-colors"
                            placeholder="Acme Inc."
                          />
                        </div>
                        <div>
                          <label className="v4-readout text-[10px] uppercase tracking-widest text-text-muted-v4">Service</label>
                          <select
                            required value={form.service} onChange={(e) => setForm({ ...form, service: e.target.value })}
                            className="mt-1.5 w-full px-4 py-2.5 rounded-btn border border-hairline bg-ink-surface-2 text-sm text-text-primary-v4 focus:border-signal focus:outline-none transition-colors"
                          >
                            {SERVICES.map((s) => (
                              <option key={s} value={s}>{s}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <div>
                        <label className="v4-readout text-[10px] uppercase tracking-widest text-text-muted-v4">Message</label>
                        <textarea
                          required rows={4} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })}
                          className="mt-1.5 w-full px-4 py-2.5 rounded-btn border border-hairline bg-ink-surface-2 text-sm text-text-primary-v4 placeholder:text-text-muted-v4 focus:border-signal focus:outline-none transition-colors resize-none"
                          placeholder="Tell us about your project..."
                        />
                      </div>
                      <button type="submit" className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-btn v4-btn-primary text-sm w-full sm:w-auto">
                        Send Message <ArrowRight className="h-4 w-4" />
                      </button>
                    </form>
                  </>
                )}
              </PanelCard>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}
