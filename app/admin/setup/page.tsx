'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Logo } from '@/components/site/logo';
import {
  ShieldCheck, Loader2, Check, AlertCircle, Lock, Mail, User,
  Eye, EyeOff, ArrowRight, Building2,
} from 'lucide-react';
import Link from 'next/link';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

type Step = 'check' | 'form' | 'creating' | 'success' | 'exists' | 'error';

export default function AdminSetupPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('check');
  const [form, setForm] = useState({ email: '', password: '', fullName: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const checkExisting = async () => {
      const supabase = createClient();
      const { count } = await supabase
        .from('admin_users')
        .select('*', { count: 'exact', head: true });
      if (count && count > 0) {
        setStep('exists');
      } else {
        setStep('form');
      }
    };
    checkExisting();
  }, []);

  const handleCreate = async () => {
    if (!form.email.trim() || !form.password.trim()) {
      setErrorMsg('Email and password are required');
      return;
    }
    if (form.password.length < 8) {
      setErrorMsg('Password must be at least 8 characters');
      return;
    }

    setStep('creating');
    setErrorMsg('');

    try {
      const res = await fetch(`/api/admin-setup/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'setup',
          email: form.email.trim(),
          password: form.password,
          name: form.fullName.trim() || 'Master Admin',
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Setup failed' }));
        throw new Error(err.error || `HTTP ${res.status}`);
      }

      setStep('success');
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Setup failed');
      setStep('error');
    }
  };

  if (step === 'check') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (step === 'exists') {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-24">
        <div className="max-w-md w-full">
          <div className="liquid-glass-strong rounded-3xl p-8 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/10 border border-amber-500/20 mx-auto mb-6">
              <ShieldCheck className="h-8 w-8 text-amber-500" />
            </div>
            <h1 className="text-2xl font-semibold mb-3">Admin Already Initialized</h1>
            <p className="text-muted-foreground mb-6">
              The master admin account has already been created. For security reasons, only one setup is allowed.
            </p>
            <Link href="/admin/login" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-medium">
              Go to Login <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-24">
        <div className="max-w-md w-full">
          <div className="liquid-glass-strong rounded-3xl p-8 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-green-500/10 border border-green-500/20 mx-auto mb-6">
              <Check className="h-8 w-8 text-green-500" />
            </div>
            <h1 className="text-2xl font-semibold mb-3">Admin Created Successfully</h1>
            <p className="text-muted-foreground mb-6">
              The master admin account has been initialized. You can now sign in to the admin dashboard.
            </p>
            <Link href="/admin/login" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-medium">
              Sign In to Admin <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-24">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2.5 mb-6">
            <Logo className="h-10 w-10" />
            <span className="text-xl font-semibold">
              ELS<span className="text-primary">x</span>Global
            </span>
          </Link>
        </div>

        <div className="liquid-glass-strong rounded-3xl p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 border border-primary/20">
              <ShieldCheck className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-lg font-semibold">Admin Initialization</h1>
              <p className="text-xs text-muted-foreground">Create the master admin account</p>
            </div>
          </div>

          <div className="liquid-glass rounded-xl p-3 mb-6 flex items-start gap-2.5">
            <AlertCircle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
            <p className="text-xs text-muted-foreground">
              This is a one-time setup. After the master admin is created, this page will be locked. Choose a strong password (min 8 characters).
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1.5 block">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  value={form.fullName}
                  onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                  placeholder="Master Admin"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-1.5 block">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="admin@elsxglobal.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-1.5 block">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="Minimum 8 characters"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
                <button
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {errorMsg && (
              <div className="liquid-glass rounded-xl p-3 border-red-500/30 bg-red-500/5 flex items-start gap-2.5">
                <AlertCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                <p className="text-sm text-red-500">{errorMsg}</p>
              </div>
            )}

            <button
              onClick={handleCreate}
              disabled={step === 'creating'}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 disabled:opacity-50"
            >
              {step === 'creating' ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Creating Admin...</>
              ) : (
                <><ShieldCheck className="h-4 w-4" /> Initialize Master Admin</>
              )}
            </button>
          </div>

          <div className="mt-6 pt-6 border-t border-border flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <Building2 className="h-3.5 w-3.5" />
            <span>An EvolucentSphere Company</span>
          </div>
        </div>
      </div>
    </div>
  );
}
