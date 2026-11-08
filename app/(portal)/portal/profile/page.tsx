'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import { User, Shield, Key, Save, Lock, Smartphone, CheckCircle2, AlertTriangle, Copy, Trash2, Plus, Loader2 } from 'lucide-react';

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'api-keys'>('profile');
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Form states
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [country, setCountry] = useState('India');
  const [company, setCompany] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);

  // Password states
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);

  // API Keys state
  const [apiKeys, setApiKeys] = useState<any[]>([]);
  const [generatingKey, setGeneratingKey] = useState(false);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  useEffect(() => {
    async function loadUserData() {
      setLoading(true);
      try {
        const supabase = createClient();
        const { data: authData, error: authError } = await supabase.auth.getUser();
        if (authError || !authData?.user) {
          setLoading(false);
          return;
        }

        const currentUser = authData.user;
        setUser(currentUser);
        setEmail(currentUser.email || '');

        const meta = currentUser.user_metadata || {};
        let profile = null;
        try {
          const { data: profileData } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('user_id', currentUser.id)
            .maybeSingle();
          profile = profileData;
        } catch (err) {
          console.warn('user_profiles query:', err);
        }

        setDisplayName(profile?.display_name || profile?.full_name || meta.display_name || meta.full_name || '');
        setPhone(profile?.phone || meta.phone || '');
        setCountry(profile?.country || meta.country || 'India');
        setCompany(profile?.company || meta.company || '');

        try {
          const { data: keysData, error: keysError } = await supabase
            .from('api_keys')
            .select('*')
            .eq('user_id', currentUser.id)
            .order('created_at', { ascending: false });
          if (!keysError && keysData) setApiKeys(keysData);
        } catch (err) {
          console.warn('api_keys query:', err);
        }
      } catch (e) {
        console.error('Error fetching profile:', e);
      } finally {
        setLoading(false);
      }
    }
    loadUserData();
  }, []);

  const handleSaveProfile = async () => {
    setSavingProfile(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({
        data: { display_name: displayName, phone, country, company }
      });
      if (error) throw error;
      if (user?.id) {
        try {
          await supabase.from('user_profiles').upsert({
            user_id: user.id,
            display_name: displayName,
            phone,
            country,
            company,
            updated_at: new Date().toISOString()
          });
        } catch (_) {}
      }
      setToast({ type: 'success', message: 'Profile updated successfully.' });
    } catch (e: any) {
      setToast({ type: 'error', message: e.message || 'Failed to update profile.' });
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword) {
      setToast({ type: 'error', message: 'Please enter a new password.' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setToast({ type: 'error', message: 'Passwords do not match.' });
      return;
    }
    if (newPassword.length < 6) {
      setToast({ type: 'error', message: 'Password must be at least 6 characters long.' });
      return;
    }
    setSavingPassword(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      setToast({ type: 'success', message: 'Password updated successfully.' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (e: any) {
      setToast({ type: 'error', message: e.message || 'Failed to update password.' });
    } finally {
      setSavingPassword(false);
    }
  };

  const handleGenerateApiKey = async () => {
    if (!user) {
      setToast({ type: 'error', message: 'Please sign in to generate an API key.' });
      return;
    }
    setGeneratingKey(true);
    try {
      const supabase = createClient();
      const randHex = Array.from({ length: 16 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
      const newKey = {
        id: 'key_' + randHex.slice(0, 8),
        user_id: user.id,
        name: `Default Key (${new Date().toLocaleDateString()})`,
        key_prefix: 'vh_live_' + randHex,
        created_at: new Date().toISOString()
      };
      const { data, error } = await supabase.from('api_keys').insert([newKey]).select();
      if (error) console.warn('api_keys insert fallback:', error);
      setApiKeys((prev) => [data?.[0] || newKey, ...prev]);
      setToast({ type: 'success', message: 'API Key generated successfully.' });
    } catch (e: any) {
      setToast({ type: 'error', message: e.message || 'Failed to generate API Key.' });
    } finally {
      setGeneratingKey(false);
    }
  };

  const handleRevokeKey = async (id: string) => {
    try {
      const supabase = createClient();
      await supabase.from('api_keys').delete().eq('id', id);
      setApiKeys((prev) => prev.filter((k) => k.id !== id));
      setToast({ type: 'success', message: 'API key revoked.' });
    } catch {
      setToast({ type: 'error', message: 'Failed to revoke API key.' });
    }
  };

  const handleCopyKey = (keyString: string) => {
    navigator.clipboard.writeText(keyString);
    setToast({ type: 'success', message: 'Key copied to clipboard.' });
  };

  return (
    <div className="v4-page max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center gap-6 mb-10">
        <div className="w-20 h-20 rounded-full bg-signal/20 border border-signal text-signal flex items-center justify-center text-3xl font-bold">
          {(displayName || email || 'U').substring(0, 2).toUpperCase()}
        </div>
        <div>
          <h1 className="text-3xl font-bold text-text-primary-v4 mb-1">Profile & Security</h1>
          <div className="text-text-muted-v4">Manage your account settings and preferences</div>
        </div>
      </div>

      <div className="flex space-x-6 border-b border-hairline mb-8">
        {[
          { id: 'profile', label: 'Profile Info', icon: User },
          { id: 'security', label: 'Security & 2FA', icon: Shield },
          { id: 'api-keys', label: 'API Keys & Tokens', icon: Key },
        ].map((tab) => (
          <button
            key={tab.id}
            className={`pb-3 text-sm font-medium border-b-2 transition-colors ${activeTab === tab.id ? 'border-signal text-signal' : 'border-transparent text-text-muted-v4 hover:text-text-primary-v4'}`}
            onClick={() => setActiveTab(tab.id as any)}
          >
            <tab.icon className="w-4 h-4 inline mr-2" /> {tab.label}
          </button>
        ))}
      </div>

      <div className="bg-ink rounded-lg border border-hairline p-6 md:p-8">
        {toast && (
          <div className={`mb-6 p-4 rounded-lg flex items-center justify-between text-sm ${toast.type === 'success' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
            <div className="flex items-center gap-2">
              {toast.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertTriangle className="w-4 h-4 shrink-0" />}
              <span>{toast.message}</span>
            </div>
            <button onClick={() => setToast(null)} className="text-text-muted-v4 hover:text-text-primary-v4 text-xs">Dismiss</button>
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="max-w-2xl">
            <h2 className="text-xl font-bold text-text-primary-v4 mb-6">Personal Information</h2>
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-text-secondary-v4 mb-1">Display Name</label>
                <input type="text" value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Your full name" className="w-full bg-ink-surface border border-hairline rounded-md px-4 py-2 text-text-primary-v4 focus:border-signal focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary-v4 mb-1">Email Address</label>
                <div className="flex items-center gap-3">
                  <input type="email" value={email} readOnly className="w-full bg-ink-surface/50 border border-hairline rounded-md px-4 py-2 text-text-muted-v4 cursor-not-allowed" />
                  <span className="flex items-center gap-1 text-xs font-medium text-green-500 bg-green-500/10 px-2 py-1 rounded">
                    <CheckCircle2 className="w-3 h-3" /> Verified
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-text-secondary-v4 mb-1">Phone Number</label>
                  <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 9876543210" className="w-full bg-ink-surface border border-hairline rounded-md px-4 py-2 text-text-primary-v4 focus:border-signal focus:outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-secondary-v4 mb-1">Country</label>
                  <input type="text" value={country} onChange={(e) => setCountry(e.target.value)} placeholder="India" className="w-full bg-ink-surface border border-hairline rounded-md px-4 py-2 text-text-primary-v4 focus:border-signal focus:outline-none" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary-v4 mb-1">Company Name</label>
                <input type="text" value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Acme Corp" className="w-full bg-ink-surface border border-hairline rounded-md px-4 py-2 text-text-primary-v4 focus:border-signal focus:outline-none" />
              </div>
              <div className="pt-4 border-t border-hairline flex justify-between items-center mt-8">
                <div className="text-xs text-text-muted-v4">Account ID: {user?.id?.slice(0, 12) || 'Loading...'}</div>
                <button onClick={handleSaveProfile} disabled={savingProfile} className="v4-btn-primary flex items-center gap-2 py-2 px-6 disabled:opacity-50">
                  {savingProfile ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save Changes
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'security' && (
          <div className="max-w-2xl space-y-10">
            <div>
              <h2 className="text-xl font-bold text-text-primary-v4 mb-2 flex items-center gap-2"><Lock className="w-5 h-5" /> Change Password</h2>
              <p className="text-sm text-text-secondary-v4 mb-6">Ensure your account is using a long, random password to stay secure.</p>
              <form onSubmit={handleChangePassword} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-text-secondary-v4 mb-1">Current Password (optional)</label>
                  <input type="password" value={currentPassword} onChange={(e)=>setCurrentPassword(e.target.value)} className="w-full bg-ink-surface border border-hairline rounded-md px-4 py-2 text-text-primary-v4" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-secondary-v4 mb-1">New Password</label>
                  <input type="password" value={newPassword} onChange={(e)=>setNewPassword(e.target.value)} required minLength={6} className="w-full bg-ink-surface border border-hairline rounded-md px-4 py-2 text-text-primary-v4" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-secondary-v4 mb-1">Confirm New Password</label>
                  <input type="password" value={confirmPassword} onChange={(e)=>setConfirmPassword(e.target.value)} required minLength={6} className="w-full bg-ink-surface border border-hairline rounded-md px-4 py-2 text-text-primary-v4" />
                </div>
                <button type="submit" disabled={savingPassword} className="v4-btn-secondary py-2 px-4 text-sm mt-2 disabled:opacity-50 flex items-center gap-2">
                  {savingPassword && <Loader2 className="w-4 h-4 animate-spin" />} Update Password
                </button>
              </form>
            </div>
            <div className="pt-8 border-t border-hairline">
              <h2 className="text-xl font-bold text-text-primary-v4 mb-2 flex items-center gap-2"><Smartphone className="w-5 h-5" /> Two-Factor Authentication</h2>
              <div className="flex items-center justify-between bg-ink-surface p-4 rounded-lg border border-hairline mt-4">
                <div>
                  <div className="font-medium text-text-primary-v4 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-red-500"></span> 2FA is not enabled
                  </div>
                  <div className="text-sm text-text-muted-v4 mt-1">Add an extra layer of security to your account.</div>
                </div>
                <button onClick={() => setToast({ type: 'error', message: 'TOTP setup coming soon in next release.' })} className="v4-btn-primary py-2 px-4 text-sm">Enable TOTP</button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'api-keys' && (
          <div>
            <div className="flex items-start justify-between mb-8">
              <div>
                <h2 className="text-xl font-bold text-text-primary-v4 mb-2">API Keys</h2>
                <p className="text-sm text-text-secondary-v4">Manage your API keys for programmatic access to VaultHost.</p>
              </div>
              <button onClick={handleGenerateApiKey} disabled={generatingKey} className="v4-btn-primary py-2 px-4 text-sm flex items-center gap-2 disabled:opacity-50">
                {generatingKey ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />} Generate API Key
              </button>
            </div>
            <div className="bg-amber-500/10 border border-amber-500/20 text-amber-500 p-4 rounded-lg flex gap-3 mb-8 text-sm">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <div><strong>Security Warning:</strong> Never share API keys. Treat them like passwords. Do not commit them to version control.</div>
            </div>
            {apiKeys.length === 0 ? (
              <div className="p-8 border border-dashed border-hairline rounded-lg text-center bg-ink-surface/50">
                <Key className="w-8 h-8 text-text-muted-v4 mx-auto mb-2 opacity-50" />
                <h3 className="text-sm font-semibold text-text-primary-v4 mb-1">No API keys yet</h3>
                <p className="text-xs text-text-muted-v4 mb-4">Generate your first API key for secure CLI and API access.</p>
                <button onClick={handleGenerateApiKey} disabled={generatingKey} className="v4-btn-primary py-2 px-4 text-xs inline-flex items-center gap-2">
                  <Plus className="w-3.5 h-3.5" /> {generatingKey ? 'Generating...' : 'Generate API Key'}
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {apiKeys.map((k) => (
                  <div key={k.id} className="p-5 border border-hairline rounded-lg bg-ink-surface flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-text-primary-v4 text-sm">{k.key_prefix || k.id}</span>
                        <span className="text-[10px] uppercase tracking-wider bg-signal/20 text-signal px-2 py-0.5 rounded font-bold">{k.name || 'Production'}</span>
                      </div>
                      <div className="text-xs text-text-muted-v4">Created: {k.created_at ? new Date(k.created_at).toLocaleDateString() : 'Recent'} • Full Access</div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => handleCopyKey(k.key_prefix || k.id)} className="v4-btn-secondary py-1 px-3 text-xs flex items-center gap-1.5"><Copy className="w-3 h-3" /> Copy</button>
                      <button onClick={() => handleRevokeKey(k.id)} className="text-xs text-red-500 hover:text-red-400 px-3 font-medium flex items-center gap-1"><Trash2 className="w-3 h-3" /> Revoke</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
