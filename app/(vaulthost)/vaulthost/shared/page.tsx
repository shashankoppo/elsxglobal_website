import { PageHeroV4 } from '@/components/ui/page-hero-v4';
import { Globe, Lock, HardDrive, RefreshCw, ArrowRight, Server, ShieldCheck, Mail } from 'lucide-react';
import Link from 'next/link';
import { HostingTierPage } from '@/components/hosting/tier-page';

const FEATURES = [
  { icon: Globe, title: 'Free Domain & SSL', desc: 'Get a free domain for your first year and a free wildcard SSL certificate forever.' },
  { icon: HardDrive, title: 'Unmetered NVMe Storage', desc: 'Store as much as you need on lightning fast NVMe SSD storage without worrying about limits.' },
  { icon: ShieldCheck, title: 'Imunify360 Security', desc: 'Real-time malware protection and automated cleanup keeps your site secure automatically.' },
  { icon: Mail, title: 'Business Email', desc: 'Create professional @yourdomain.com email addresses included free with all plans.' },
];

export default function SharedHostingPage() {
  return (
    <div className="v4-page pb-32">
      <PageHeroV4
        eyebrow="Shared Web Hosting"
        eyebrowIcon="globe"
        title={<>Fast. Secure.<br/>Incredibly Simple.</>}
        description="The perfect foundation for your next project. Affordable, fully managed web hosting with 1-click WordPress install, free SSL, and daily backups."
      >
        <div className="flex flex-col sm:flex-row gap-3 justify-center mt-8">
          <Link href="#pricing" className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-btn v4-btn-primary text-sm font-medium">
            View Pricing <ArrowRight className="h-4 w-4" />
          </Link>
          <Link href="/vaulthost/compare" className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-btn v4-btn-secondary text-sm font-medium">
            Compare Features
          </Link>
        </div>
      </PageHeroV4>

      {/* Features Grid */}
      <section className="v4-section-sm border-t border-hairline bg-ink-surface/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURES.map((feat) => (
              <div key={feat.title} className="liquid-glass-card rounded-2xl p-6">
                <div className="h-10 w-10 rounded-xl bg-signal-dim/10 flex items-center justify-center mb-4">
                  <feat.icon className="h-5 w-5 text-signal-dim" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feat.title}</h3>
                <p className="text-sm text-text-muted-v4">{feat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="v4-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-12">
          <h2 className="text-3xl font-bold v4-display mb-4">Affordable Hosting Plans</h2>
          <p className="text-text-secondary-v4 max-w-2xl mx-auto">Start small and upgrade anytime seamlessly as your website grows.</p>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <HostingTierPage tier="shared" />
        </div>
      </section>
      

    </div>
  );
}

