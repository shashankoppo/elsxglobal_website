'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Logo } from '@/components/site/logo';
import { ShieldCheck, Loader2, Check, AlertCircle, ArrowRight, Zap } from 'lucide-react';
import Link from 'next/link';

export default function AdminResetPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: 'idle' | 'success' | 'error'; message: string }>({
    type: 'idle',
    message: '',
  });

  const handleInitMasterAdmin = async () => {
    setLoading(true);
    setStatus({ type: 'idle', message: '' });

    try {
      const res = await fetch('/api/admin-setup/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'setup',
          email: 'admin@elsxglobal.com',
          password: 'Admin@2026!',
          name: 'Master Admin',
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok && !data.error?.includes('already exists')) {
        throw new Error(data.error || `HTTP ${res.status}`);
      }

      setStatus({
        type: 'success',
        message: 'Master Admin account ready! Use admin@elsxglobal.com / Admin@2026! to sign in.',
      });

      setTimeout(() => {
        router.push('/admin/login');
      }, 2000);
    } catch (err: any) {
      setStatus({
        type: 'error',
        message: err.message || 'Initialization failed',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-background">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2.5 mb-6">
            <Logo className="h-9 w-9" />
            <span className="text-xl font-semibold">ELS<span className="text-primary">x</span>Global</span>
          </Link>
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/30 mb-5">
            <ShieldCheck className="h-3.5 w-3.5 text-primary" />
            <span className="text-xs font-medium text-primary">Master Admin Console</span>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">Initialize Master Admin</h1>
          <p className="text-sm text-muted-foreground mt-2">
            Verify or provision the root administrator account for this instance.
          </p>
        </div>

        <div className="liquid-glass-strong rounded-2xl p-8 border border-border shadow-xl space-y-6">
          <div className="p-4 rounded-xl bg-card border border-border space-y-2 text-xs">
            <div className="flex justify-between items-center text-muted-foreground">
              <span>Admin Email:</span>
              <span className="font-mono text-foreground font-semibold">admin@elsxglobal.com</span>
            </div>
            <div className="flex justify-between items-center text-muted-foreground">
              <span>Default Password:</span>
              <span className="font-mono text-foreground font-semibold">Admin@2026!</span>
            </div>
          </div>

          {status.type === 'error' && (
            <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl p-3 flex items-start gap-2">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{status.message}</span>
            </div>
          )}

          {status.type === 'success' && (
            <div className="text-sm text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 flex items-start gap-2">
              <Check className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{status.message}</span>
            </div>
          )}

          <button
            type="button"
            disabled={loading}
            onClick={handleInitMasterAdmin}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 transition-all disabled:opacity-50 shadow-lg shadow-primary/20"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
            {loading ? 'Initializing Master Admin...' : 'Initialize / Verify Master Admin'}
          </button>

          <div className="text-center pt-2">
            <Link href="/admin/login" className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5">
              Return to Admin Sign In <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
