import { Metadata } from 'next';
import { Suspense } from 'react';
import { createMetadata } from '@/lib/seo';
import { CheckoutClient } from './checkout-client';

export const metadata: Metadata = createMetadata({
  title: 'Checkout — Secure Hosting Order | VaultHost',
  description: 'Securely complete your hosting order with UPI, bank transfer, or card payment. GST invoice included.',
  keywords: ['hosting checkout India', 'buy hosting plan', 'secure hosting payment', 'UPI hosting payment', 'hosting order India'],
  canonical: 'https://elsxglobal.com/vaulthost/checkout/',
  breadcrumb: [
    { name: 'Home', url: 'https://elsxglobal.com/' },
    { name: 'VaultHost', url: 'https://elsxglobal.com/vaulthost/' },
    { name: 'Checkout', url: 'https://elsxglobal.com/vaulthost/checkout/' },
  ],
  robots: { index: false, follow: true },
});

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-[60vh]"><div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" /></div>}>
      <CheckoutClient />
    </Suspense>
  );
}
