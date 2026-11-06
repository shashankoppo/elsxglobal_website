'use client';

import { useState } from 'react';
import { Logo } from '@/components/site/logo';
import { ShieldCheck, Loader2, AlertCircle, Trash2, Lock, Mail, User, Eye, EyeOff, Check } from 'lucide-react';
import Link from 'next/link';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export default function AdminResetPage() {
  const [email, setEmail] = useState('admin@elsxglobal.com');
  const [password, setPassword] = useState('Admin@2026!');
  const [name, setName] = useState('Master Admin');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [step, setStep] = useState<'confirm' | 'form'>('confirm');

  const handleReset = async () => {
    if (!email || !password) { setError('Email and password required'); return; }
    if (password.length < 8) { setError('Password must be at least 8 characters'); return; }
    setLoading(true);
    setError('');
    try {
      // Call the local API route which has SERVICE_ROLE_KEY access
      const res = await fetch(`/api/admin-reset/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'reset-admin',
          email: email.trim(),
          password,
          name: name.trim() || 'Administrator',
          confirmReset: 'RESET_ADMIN_CONFIRMED'
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Reset failed');

      // Store the session
      sessionStorage.setItem('admin_token', data.token);
      sessionStorage.setItem('admin_email', data.admin.email);
      sessionStorage.setItem('admin_name', data.admin.name);
      setSuccess(true);
      setTimeout(() => { window.location.href = '/admin/overview'; }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Reset failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center px-4 py-12 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-red-950/20 to-slate-950" />
      <div className="absolute inset-0 opacity-40">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-red-500/20 blur-[140px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-amber-500/10 blur-[140px] animate-pulse" style={{ animationDelay: '1.5s' }} />
      </div>

      <div className="relative w-full max-w-md z-10">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2.5 mb-6">
            <Logo className="h-10 w-10" />
            <div className="text-left">
              <span className="text-xl font-semibold text-white">ELS<span className="text-primary">x</span>Global</span>
              <p className="text-[10px] text-white/40 uppercase tracking-wider">Admin Reset</p>
            </div>
          </Link>
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-500/10 border border-red-500/30 mb-5">
            <Trash2 className="h-3.5 w-3.5 text-red-500" />
            <span className="text-xs font-medium text-red-500">Reset Admin Credentials</span>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-white">Reset Admin Account</h1>
          <p className="text-sm text-white/50 mt-2">This will delete the existing admin and create a new one</p>
        </div>

        {success ? (
          <div className="relative rounded-2xl p-8 text-center bg-white/5 border border-white/10 backdrop-blur-xl">
            <div className="relative inline-flex mb-4">
              <div className="absolute inset-0 bg-green-500/30 blur-xl rounded-full" />
              <Check className="h-14 w-14 text-green-500 relative" />
            </div>
            <h2 className="text-lg font-semibold text-white mb-2">Admin account reset!</h2>
            <div className="text-sm text-white/70 bg-white/5 rounded-xl p-4 mt-4 text-left space-y-2">
              <p><strong className="text-white">Email:</strong> {email}</p>
              <p><strong className="text-white">Password:</strong> {password}</p>
            </div>
            <Link href="/admin" className="mt-6 inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 transition-all">
              Go to Admin Dashboard →
            </Link>
          </div>
        ) : (
          <div className="relative rounded-2xl p-8 bg-white/5 border border-white/10 backdrop-blur-xl shadow-2xl">
            {step === 'confirm' ? (
              <div className="text-center">
                <div className="mb-4 flex items-start gap-2 text-xs text-red-400 bg-red-500/5 border border-red-500/20 rounded-lg p-3">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>This will permanently delete the existing admin account and create a new one. This action cannot be undone.</span>
                </div>
                <button
                  onClick={() => setStep('form')}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-red-500 text-white font-medium text-sm hover:bg-red-600 transition-all"
                >
                  <Trash2 className="h-4 w-4" />
                  I understand, proceed with reset
                </button>
                <Link href="/admin/login" className="block mt-4 text-sm text-white/50 hover:text-white/80 transition-colors">
                  Back to Login
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-white/70 mb-1.5 block">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
                    <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Administrator" className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-primary/30" />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-white/70 mb-1.5 block">Admin Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-primary/30" />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-white/70 mb-1.5 block">New Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
                    <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full pl-11 pr-11 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-primary/30" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60">
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                {error && (
                  <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg p-3 flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" /><span>{error}</span>
                  </div>
                )}
                <button
                  onClick={handleReset}
                  disabled={loading}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 transition-all disabled:opacity-50 shadow-lg shadow-primary/20"
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
                  {loading ? 'Resetting...' : 'Reset & Create Admin'}
                </button>
                <button onClick={() => setStep('confirm')} className="w-full text-sm text-white/50 hover:text-white/80 transition-colors py-2">Back</button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
