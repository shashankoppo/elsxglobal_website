'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase';
import {
  Check, ArrowRight, Clock, Shield, Zap, Users, FileCheck,
  Rocket, RefreshCw, Mail, Database, Globe, Loader2, Sparkles,
} from 'lucide-react';

const timeline = [
  { step: 1, title: 'Discovery Call', description: 'We assess your current setup, identify dependencies, and create a migration plan tailored to your infrastructure.', icon: Users, duration: '30 min' },
  { step: 2, title: 'Environment Setup', description: 'We provision your new VaultHost environment and configure all server settings, databases, and security policies.', icon: Shield, duration: '2-4 hours' },
  { step: 3, title: 'Data Replication', description: 'We replicate your website files, databases, and email accounts to the new server with checksums for data integrity.', icon: Database, duration: '1-12 hours' },
  { step: 4, title: 'Testing & Validation', description: 'We test every page, form, database connection, and email route on the new server using a staging URL.', icon: FileCheck, duration: '1-2 hours' },
  { step: 5, title: 'DNS Switch', description: 'We update DNS records to point to the new server. Your old site stays live as a fallback during DNS propagation.', icon: Globe, duration: '15 min' },
  { step: 6, title: 'Go Live & Monitoring', description: 'Your site is now live on VaultHost. We monitor for 72 hours to ensure everything runs perfectly.', icon: Rocket, duration: '72 hours' },
];

const faqs = [
  { question: 'Is the migration really free?', answer: 'Yes. Free white-glove migration is included with all annual hosting plans. Our team handles the entire transfer at no additional cost.' },
  { question: 'Will there be any downtime during migration?', answer: 'No. We use a dual-DNS strategy that keeps your current site live while we set up the new one. We sync data, test everything, then flip the DNS switch for a seamless transition.' },
  { question: 'How long does migration take?', answer: 'Most migrations complete within 24-48 hours. Complex setups with multiple databases or custom applications may take up to 72 hours.' },
  { question: 'What can you migrate?', answer: 'We migrate websites (HTML, WordPress, Joomla, Drupal, custom PHP), databases (MySQL, PostgreSQL), email accounts, DNS records, and SSL certificates.' },
  { question: 'Do I need technical knowledge?', answer: 'No. That is the point of white-glove service. You provide access to your current hosting, and we handle everything else.' },
  { question: 'What if something goes wrong?', answer: 'We take full responsibility. If any issue arises during or after migration, our team fixes it at no cost. Your original hosting stays live until you confirm everything works.' },
];

export default function MigrationClient() {
  const [form, setForm] = useState({ name: '', email: '', company: '', currentHost: '', website: '', message: '' });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const supabase = createClient();
    await supabase.from('leads').insert({
      full_name: form.name,
      work_email: form.email,
      company: form.company,
      phone: '',
      intent: 'migration',
      message: `Current host: ${form.currentHost}\nWebsite: ${form.website}\n${form.message}`,
      status: 'new',
      source: 'migration-page',
    });
    setSubmitting(false);
    setSubmitted(true);
  };

  return (
    <div className="pt-8">
      <div className="container-wide px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero */}
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 mb-4">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            <span className="text-xs font-medium text-primary">Free with all annual plans</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
            Free White-Glove <span className="text-primary">Migration</span>
          </h1>
          <p className="text-lg text-muted-foreground mb-8">
            Our experts handle your entire migration — websites, databases, DNS, email — with zero downtime. You relax. We do the heavy lifting.
          </p>
          <div className="flex flex-wrap justify-center gap-6">
            {[
              { icon: Shield, label: 'Zero Downtime' },
              { icon: Clock, label: '24-48 Hour Turnaround' },
              { icon: Users, label: '500+ Sites Migrated' },
              { icon: Check, label: '100% Success Rate' },
            ].map((s) => (
              <div key={s.label} className="flex items-center gap-2 text-sm">
                <s.icon className="h-4 w-4 text-good" />
                <span>{s.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Timeline */}
        <div className="mb-16">
          <h2 className="text-2xl font-semibold text-center mb-8">How Migration Works</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {timeline.map((t, idx) => (
              <div key={t.step} className="liquid-glass-card rounded-2xl p-6 relative">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 border border-primary/20">
                    <t.icon className="h-5 w-5 text-primary" />
                  </div>
                  <span className="text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground">{t.duration}</span>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-bold text-primary">STEP {t.step}</span>
                </div>
                <h3 className="font-semibold mb-2">{t.title}</h3>
                <p className="text-sm text-muted-foreground">{t.description}</p>
                {idx < timeline.length - 1 && (
                  <ArrowRight className="hidden lg:block absolute -right-3 top-1/2 h-5 w-5 text-muted-foreground/30" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* What We Migrate */}
        <div className="liquid-glass-card rounded-3xl p-8 mb-16">
          <h2 className="text-2xl font-semibold text-center mb-8">What We Migrate</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: Globe, label: 'Websites', items: ['WordPress', 'Custom PHP', 'Static HTML', 'Joomla'] },
              { icon: Database, label: 'Databases', items: ['MySQL', 'PostgreSQL', 'Redis', 'MongoDB'] },
              { icon: Mail, label: 'Email', items: ['Mailboxes', 'Forwarders', 'Filters', 'Contacts'] },
              { icon: Shield, label: 'Security', items: ['SSL Certs', 'DNS Records', 'Cron Jobs', 'Firewall Rules'] },
            ].map((cat) => (
              <div key={cat.label}>
                <div className="flex items-center gap-2 mb-3">
                  <cat.icon className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold text-sm">{cat.label}</h3>
                </div>
                <ul className="space-y-1.5">
                  {cat.items.map((item) => (
                    <li key={item} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Check className="h-3.5 w-3.5 text-good" />{item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Lead Form + FAQ */}
        <div className="grid lg:grid-cols-2 gap-8">
          <div className="liquid-glass-card rounded-3xl p-8">
            <h2 className="text-xl font-semibold mb-2">Start Your Free Migration</h2>
            <p className="text-sm text-muted-foreground mb-6">Fill out the form and our migration team will reach out within 2 hours.</p>
            {submitted ? (
              <div className="text-center py-12">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-good/10 border border-good/20 mx-auto mb-4">
                  <Check className="h-8 w-8 text-good" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Request Received</h3>
                <p className="text-sm text-muted-foreground">Our migration team will contact you within 2 hours to schedule your free migration.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="text-sm font-medium mb-1.5 block">Full Name</label><input type="text" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-4 py-2.5 rounded-xl bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" /></div>
                  <div><label className="text-sm font-medium mb-1.5 block">Work Email</label><input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full px-4 py-2.5 rounded-xl bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" /></div>
                  <div><label className="text-sm font-medium mb-1.5 block">Company</label><input type="text" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} className="w-full px-4 py-2.5 rounded-xl bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" /></div>
                  <div><label className="text-sm font-medium mb-1.5 block">Current Host</label><input type="text" placeholder="e.g. Hostinger, AWS" value={form.currentHost} onChange={(e) => setForm({ ...form, currentHost: e.target.value })} className="w-full px-4 py-2.5 rounded-xl bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" /></div>
                </div>
                <div><label className="text-sm font-medium mb-1.5 block">Website URL</label><input type="text" placeholder="https://yourwebsite.com" value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} className="w-full px-4 py-2.5 rounded-xl bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" /></div>
                <div><label className="text-sm font-medium mb-1.5 block">Additional Details</label><textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} rows={3} placeholder="Tell us about your setup..." className="w-full px-4 py-2.5 rounded-xl bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none" /></div>
                <button type="submit" disabled={submitting} className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-medium text-sm disabled:opacity-50">
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}Request Free Migration
                </button>
              </form>
            )}
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-6">Frequently Asked Questions</h2>
            <div className="space-y-3">
              {faqs.map((faq, idx) => (
                <details key={idx} className="liquid-glass-card rounded-2xl p-5 group">
                  <summary className="font-medium text-sm cursor-pointer flex items-center justify-between">
                    {faq.question}
                    <span className="text-muted-foreground group-open:rotate-180 transition-transform"><RefreshCw className="h-4 w-4" /></span>
                  </summary>
                  <p className="text-sm text-muted-foreground mt-3 leading-relaxed">{faq.answer}</p>
                </details>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
