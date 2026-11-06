import './globals.css';
import type { Metadata } from 'next';
import { Inter, Sora, Space_Grotesk, IBM_Plex_Mono } from 'next/font/google';
import { ThemeProvider } from '@/components/theme-provider';
import { LeadProvider } from '@/components/site/lead-context';
import { LeadDialog } from '@/components/site/lead-dialog';
import { WhatsAppButton } from '@/components/site/whatsapp-button';
import { EnterpriseAssistant } from '@/components/site/enterprise-assistant';
import { ScrollToTop } from '@/components/ui/scroll-to-top';
import { JsonLd } from '@/components/seo/JsonLd';
import { defaultOrganization, parentOrganization } from '@/lib/seo';
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans', // Update variable name for Inter as primary sans
  display: 'swap',
  preload: true,
  adjustFontFallback: true, // Native CSS font-metric override optimization
});

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
  weight: ['400', '500', '600'],
  preload: true,
});

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
  preload: true,
});

export const metadata: Metadata = {
  metadataBase: new URL('https://elsxglobal.com'),
  title: {
    default: 'ELSxGlobal | Enterprise Business Transformation Ecosystem | AI, BPO, KPO, Cloud',
    template: '%s | ELSxGlobal',
  },
  description:
    'ELSxGlobal by EvolucentSphere — Enterprise technology partner delivering custom software, AI automation, cloud hosting (VaultHost), BPO, and KPO analytics solutions across India and globally.',
  keywords: [
    'ELSxGlobal',
    'EvolucentSphere',
    'enterprise software',
    'VaultHost hosting',
    'AI automation',
    'cloud infrastructure',
    'BPO services',
    'KPO analytics',
    'digital transformation',
    'custom software development',
  ],
  authors: [{ name: 'ELSxGlobal', url: 'https://elsxglobal.com' }],
  creator: 'ELSxGlobal',
  publisher: 'ELSxGlobal',
  other: {
    'organization:name': 'ELSxGlobal',
    'organization:parent': 'EvolucentSphere Pvt. Ltd.',
    'organization:parent_url': 'https://evolucentsphere.com',
  },
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://elsxglobal.com',
    siteName: 'ELSxGlobal',
    title: 'ELSxGlobal | Enterprise Business Transformation Ecosystem',
    description: 'AI-powered software, BPO, KPO analytics, consultancy + VaultHost cloud. 200+ experts, 100+ enterprise clients, ₹120Cr valuation. India HQ with global offices in Eindhoven and Chicago.',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'ELSxGlobal - Enterprise Technology Solutions',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ELSxGlobal | Enterprise Business Transformation Ecosystem',
    description: 'AI-powered software, BPO, KPO analytics, consultancy + VaultHost cloud. 200+ experts, 100+ enterprise clients.',
    images: ['/og-image.jpg'],
    creator: '@elsxglobal',
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: 'https://elsxglobal.com',
  },
  category: 'technology',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} ${ibmPlexMono.variable} ${spaceGrotesk.variable}`}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        <meta name="theme-color" content="#ffffff" media="(prefers-color-scheme: light)" />
        <meta name="theme-color" content="#0a0f1a" media="(prefers-color-scheme: dark)" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://elsxglobal.com" />
        <JsonLd
          data={[
            defaultOrganization,
            parentOrganization,
            {
              '@context': 'https://schema.org',
              '@type': 'WebSite',
              name: 'ELSxGlobal',
              url: 'https://elsxglobal.com',
              potentialAction: {
                '@type': 'SearchAction',
                target: 'https://elsxglobal.com/search?q={search_term_string}',
                'query-input': 'required name=search_term_string',
              },
            },
          ]}
        />
      </head>
      <body className="font-sans antialiased bg-background text-foreground min-h-screen">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} disableTransitionOnChange storageKey="elsxglobal-theme">
          <LeadProvider>
            {children}
            <LeadDialog />
            <EnterpriseAssistant />
            <WhatsAppButton />
            <ScrollToTop />
          </LeadProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
