import Link from 'next/link';
import { ArrowRight, Search } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-ink flex flex-col items-center justify-center px-4 text-center">
      <div className="v4-readout text-[10px] uppercase tracking-widest text-signal mb-6">404 — Page Not Found</div>
      <h1 className="text-5xl sm:text-7xl font-bold text-text-primary-v4 mb-4" style={{ letterSpacing: '-0.04em' }}>
        404
      </h1>
      <p className="text-lg text-text-secondary-v4 max-w-md mb-8 leading-relaxed">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-btn v4-btn-primary text-sm"
        >
          Back to Home <ArrowRight className="h-4 w-4" />
        </Link>
        <Link
          href="/vaulthost"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-btn v4-btn-secondary text-sm"
        >
          <Search className="h-4 w-4" />
          Explore VaultHost
        </Link>
      </div>
    </div>
  );
}
