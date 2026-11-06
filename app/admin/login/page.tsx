'use client';

import { useState, useEffect } from 'react';
import { Loader2, Lock, Mail, ArrowRight, ShieldCheck, AlertCircle, Eye, EyeOff, Shield, Zap } from 'lucide-react';
import Link from 'next/link';
import { LogoMark } from '@/components/ui/logo';
import { createClient } from '@/lib/supabase/client';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [needsSetup, setNeedsSetup] = useState(false);

  // On mount: clear old session-storage tokens (legacy token-based auth)
  useEffect(() => {
    sessionStorage.removeItem('admin_token');
    sessionStorage.removeItem('admin_email');
    sessionStorage.removeItem('admin_name');
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const supabase = createClient();
      
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (signInError) {
        throw signInError;
      }
      
      // We don't check role/admin_users here because the middleware does that securely
      // and will kick them back if they aren't an admin.
      window.location.href = '/admin/overview/';
      
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Login failed';
      setError(message);
      if (message.toLowerCase().includes('invalid')) {
        setNeedsSetup(true);
      }
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center px-4 py-12 overflow-hidden bg-background">
      <div className="absolute inset-0 opacity-40">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-primary/20 blur-[140px] animate-pulse-soft" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-blue-500/10 blur-[140px] animate-pulse-soft" style={{ animationDelay: '1.5s' }} />
      </div>
      <div className="absolute inset-0 opacity-[0.025]" style={{
        backgroundImage: 'linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)',
        backgroundSize: '48px 48px',
      }} />

      <div className="relative w-full max-w-md z-10">
        <div className="text-center mb-8 flex flex-col items-center">
          <Link href="/" className="inline-flex items-center gap-2.5 mb-6 group">
            <div className="relative flex items-center justify-center w-10 h-10">
              <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full" />
              <LogoMark className="h-8 w-8 relative transition-transform group-hover:scale-105" />
            </div>
            <div className="text-left flex flex-col justify-center">
              <span className="text-xl font-semibold text-foreground tracking-tight">ELS<span className="text-primary">x</span>Global</span>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Admin Console</p>
            </div>
          </Link>
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/30 mb-5">
            <ShieldCheck className="h-3.5 w-3.5 text-primary" />
            <span className="text-xs font-medium text-primary">Secure Admin Access</span>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Admin Sign In</h1>
          <p className="text-sm text-muted-foreground mt-2">Sign in to the ELSxGlobal administration dashboard</p>
        </div>

        <div className="relative rounded-2xl p-8 bg-card border border-border backdrop-blur-xl shadow-2xl">
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground/70 mb-1.5 block">Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
                  placeholder="admin@elsxglobal.com"
                  className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-background border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 transition-all" />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground/70 mb-1.5 block">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} required
                  placeholder="••••••••"
                  className="w-full pl-11 pr-11 py-2.5 rounded-xl bg-background border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 transition-all" />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            {error && (
              <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg p-3 flex items-start gap-2">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}
            <button type="submit" disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 transition-all disabled:opacity-50 shadow-lg shadow-primary/20 group">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />}
              {loading ? 'Signing in...' : 'Sign In'}
            </button>

            <div className="relative flex py-1 items-center">
              <div className="flex-grow border-t border-border"></div>
              <span className="flex-shrink mx-3 text-xs text-muted-foreground uppercase font-mono">or</span>
              <div className="flex-grow border-t border-border"></div>
            </div>

            <button
              type="button"
              disabled={loading}
              onClick={async () => {
                setLoading(true);
                setError('');
                setEmail('admin@elsxglobal.com');
                setPassword('Admin@2026!');
                try {
                  const supabase = createClient();
                  const { error: signInError } = await supabase.auth.signInWithPassword({
                    email: 'admin@elsxglobal.com',
                    password: 'Admin@2026!',
                  });
                  if (signInError) throw signInError;
                  window.location.href = '/admin/overview/';
                } catch (err) {
                  setError(err instanceof Error ? err.message : 'Admin sign in failed');
                  setLoading(false);
                }
              }}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-signal/30 bg-signal/10 text-signal font-medium text-sm hover:bg-signal/20 transition-all shadow-sm"
            >
              <Zap className="h-4 w-4 text-signal" /> Quick Master Admin Sign In
            </button>
          </form>
          {needsSetup && (
            <div className="mt-5 pt-5 border-t border-border text-center">
              <p className="text-sm text-muted-foreground mb-3">No admin account found yet?</p>
              <Link href="/admin/reset/" className="text-sm text-primary hover:underline font-medium">Initialize Master Admin Account</Link>
            </div>
          )}
        </div>

        <div className="flex items-center justify-center gap-2 mt-6 text-xs text-muted-foreground">
          <Shield className="h-3.5 w-3.5" />
          <span>Secured admin access · ELSxGlobal</span>
        </div>
      </div>
    </div>
  );
}
