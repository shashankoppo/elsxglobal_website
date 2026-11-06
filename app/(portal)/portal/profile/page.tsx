'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import { User, Shield, Key, Mail, Phone, Globe, Save, Lock, Smartphone, CheckCircle2, AlertTriangle } from 'lucide-react';
import { PanelCard } from '@/components/ui/panel-card';

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'api-keys'>('profile');
  
  // Form states
  const [displayName, setDisplayName] = useState('Demo User');
  const [email, setEmail] = useState('demo@example.com');
  const [phone, setPhone] = useState('+91 9876543210');
  const [country, setCountry] = useState('India');
  const [company, setCompany] = useState('Acme Corp');
  
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    async function fetchUser() {
      setLoading(true);
      try {
        const supabase = createClient();
        const { data } = await supabase.auth.getUser();
        if (data.user) {
          setUser(data.user);
          setEmail(data.user.email || 'demo@example.com');
        }
      } catch (e) {
        console.error('Error fetching user', e);
      } finally {
        setLoading(false);
      }
    }
    fetchUser();
  }, []);

  const handleSaveProfile = async () => {
    try {
      const supabase = createClient();
      await supabase.auth.updateUser({
        data: { full_name: displayName, phone, country, company }
      });
      alert('Profile updated successfully');
    } catch (e) {
      alert('Failed to update profile');
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    try {
      const supabase = createClient();
      await supabase.auth.updateUser({ password: newPassword });
      alert('Password updated successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (e) {
      alert('Failed to update password');
    }
  };

  const getInitials = (email: string) => {
    return email ? email.substring(0, 2).toUpperCase() : 'U';
  };

  return (
    <div className="v4-page max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="flex items-center gap-6 mb-10">
        <div className="w-20 h-20 rounded-full bg-signal/20 border border-signal text-signal flex items-center justify-center text-3xl font-bold">
          {getInitials(email)}
        </div>
        <div>
          <h1 className="text-3xl font-bold text-text-primary-v4 mb-1">Profile & Security</h1>
          <div className="text-text-muted-v4">Manage your account settings and preferences</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-6 border-b border-hairline mb-8">
        <button 
          className={`pb-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'profile' ? 'border-signal text-signal' : 'border-transparent text-text-muted-v4 hover:text-text-primary-v4'}`}
          onClick={() => setActiveTab('profile')}
        >
          <User className="w-4 h-4 inline mr-2" /> Profile Info
        </button>
        <button 
          className={`pb-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'security' ? 'border-signal text-signal' : 'border-transparent text-text-muted-v4 hover:text-text-primary-v4'}`}
          onClick={() => setActiveTab('security')}
        >
          <Shield className="w-4 h-4 inline mr-2" /> Security & 2FA
        </button>
        <button 
          className={`pb-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'api-keys' ? 'border-signal text-signal' : 'border-transparent text-text-muted-v4 hover:text-text-primary-v4'}`}
          onClick={() => setActiveTab('api-keys')}
        >
          <Key className="w-4 h-4 inline mr-2" /> API Keys & Tokens
        </button>
      </div>

      {/* Content */}
      <div className="bg-ink rounded-lg border border-hairline p-6 md:p-8">
        {activeTab === 'profile' && (
          <div className="max-w-2xl">
            <h2 className="text-xl font-bold text-text-primary-v4 mb-6">Personal Information</h2>
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-text-secondary-v4 mb-1">Display Name</label>
                <input 
                  type="text" 
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full bg-ink-surface border border-hairline rounded-md px-4 py-2 text-text-primary-v4 focus:border-signal focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary-v4 mb-1">Email Address</label>
                <div className="flex items-center gap-3">
                  <input 
                    type="email" 
                    value={email}
                    readOnly
                    className="w-full bg-ink-surface/50 border border-hairline rounded-md px-4 py-2 text-text-muted-v4 cursor-not-allowed"
                  />
                  <span className="flex items-center gap-1 text-xs font-medium text-green-500 bg-green-500/10 px-2 py-1 rounded">
                    <CheckCircle2 className="w-3 h-3" /> Verified
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-text-secondary-v4 mb-1">Phone Number</label>
                  <input 
                    type="tel" 
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-ink-surface border border-hairline rounded-md px-4 py-2 text-text-primary-v4 focus:border-signal focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-secondary-v4 mb-1">Country</label>
                  <input 
                    type="text" 
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full bg-ink-surface border border-hairline rounded-md px-4 py-2 text-text-primary-v4 focus:border-signal focus:outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary-v4 mb-1">Company Name</label>
                <input 
                  type="text" 
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  className="w-full bg-ink-surface border border-hairline rounded-md px-4 py-2 text-text-primary-v4 focus:border-signal focus:outline-none"
                />
              </div>
              
              <div className="pt-4 border-t border-hairline flex justify-between items-center mt-8">
                <div className="text-xs text-text-muted-v4">
                  Account created: Sep 1, 2026<br />
                  Last login: Today, 10:45 AM
                </div>
                <button onClick={handleSaveProfile} className="v4-btn-primary flex items-center gap-2 py-2 px-6">
                  <Save className="w-4 h-4" /> Save Changes
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'security' && (
          <div className="max-w-2xl space-y-10">
            {/* Change Password */}
            <div>
              <h2 className="text-xl font-bold text-text-primary-v4 mb-2 flex items-center gap-2"><Lock className="w-5 h-5" /> Change Password</h2>
              <p className="text-sm text-text-secondary-v4 mb-6">Ensure your account is using a long, random password to stay secure.</p>
              <form onSubmit={handleChangePassword} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-text-secondary-v4 mb-1">Current Password</label>
                  <input type="password" value={currentPassword} onChange={(e)=>setCurrentPassword(e.target.value)} className="w-full bg-ink-surface border border-hairline rounded-md px-4 py-2 text-text-primary-v4" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-secondary-v4 mb-1">New Password</label>
                  <input type="password" value={newPassword} onChange={(e)=>setNewPassword(e.target.value)} className="w-full bg-ink-surface border border-hairline rounded-md px-4 py-2 text-text-primary-v4" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-secondary-v4 mb-1">Confirm New Password</label>
                  <input type="password" value={confirmPassword} onChange={(e)=>setConfirmPassword(e.target.value)} className="w-full bg-ink-surface border border-hairline rounded-md px-4 py-2 text-text-primary-v4" />
                </div>
                <button type="submit" className="v4-btn-secondary py-2 px-4 text-sm mt-2">Update Password</button>
              </form>
            </div>

            {/* 2FA */}
            <div className="pt-8 border-t border-hairline">
              <h2 className="text-xl font-bold text-text-primary-v4 mb-2 flex items-center gap-2"><Smartphone className="w-5 h-5" /> Two-Factor Authentication</h2>
              <div className="flex items-center justify-between bg-ink-surface p-4 rounded-lg border border-hairline mt-4">
                <div>
                  <div className="font-medium text-text-primary-v4 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-red-500"></span> 2FA is not enabled
                  </div>
                  <div className="text-sm text-text-muted-v4 mt-1">Add an extra layer of security to your account.</div>
                </div>
                <button onClick={() => alert('TOTP setup coming with v4.2')} className="v4-btn-primary py-2 px-4 text-sm">
                  Enable TOTP
                </button>
              </div>
            </div>

            {/* Active Sessions */}
            <div className="pt-8 border-t border-hairline">
              <h2 className="text-xl font-bold text-text-primary-v4 mb-4">Active Sessions</h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 border border-hairline rounded-lg bg-ink-surface">
                  <div>
                    <div className="text-text-primary-v4 font-medium">Windows • Chrome</div>
                    <div className="text-xs text-text-muted-v4 mt-1">192.168.1.1 • Last active: Just now (Current session)</div>
                  </div>
                </div>
                <div className="flex items-center justify-between p-4 border border-hairline rounded-lg bg-ink">
                  <div>
                    <div className="text-text-primary-v4 font-medium">Android • Chrome</div>
                    <div className="text-xs text-text-muted-v4 mt-1">10.0.0.5 • Last active: 2 hours ago</div>
                  </div>
                  <button className="text-sm text-red-500 hover:text-red-400 font-medium">Revoke</button>
                </div>
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
              <button onClick={() => alert('Create API Key modal coming soon')} className="v4-btn-primary py-2 px-4 text-sm">
                Create New API Key
              </button>
            </div>

            <div className="bg-amber-500/10 border border-amber-500/20 text-amber-500 p-4 rounded-lg flex gap-3 mb-8 text-sm">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <div>
                <strong>Security Warning:</strong> Never share API keys. Treat them like passwords. Do not commit them to version control.
              </div>
            </div>

            <div className="space-y-4">
              <div className="p-5 border border-hairline rounded-lg bg-ink-surface flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-text-primary-v4">vh_live_9f83a8b27c1094ea</span>
                    <span className="text-[10px] uppercase tracking-wider bg-signal/20 text-signal px-2 py-0.5 rounded font-bold">Production</span>
                  </div>
                  <div className="text-xs text-text-muted-v4">Created: Sep 15, 2026 • Full Access</div>
                </div>
                <div className="flex gap-2">
                  <button className="v4-btn-secondary py-1 px-3 text-xs">Copy</button>
                  <button className="text-xs text-red-500 hover:text-red-400 px-3 font-medium">Revoke</button>
                </div>
              </div>

              <div className="p-5 border border-hairline rounded-lg bg-ink-surface flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-text-primary-v4">vh_test_d4e5f6a7b89c0d1e</span>
                    <span className="text-[10px] uppercase tracking-wider bg-slate-700 text-slate-300 px-2 py-0.5 rounded font-bold">Sandbox</span>
                  </div>
                  <div className="text-xs text-text-muted-v4">Created: Aug 10, 2026 • Read-only</div>
                </div>
                <div className="flex gap-2">
                  <button className="v4-btn-secondary py-1 px-3 text-xs">Copy</button>
                  <button className="text-xs text-red-500 hover:text-red-400 px-3 font-medium">Revoke</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
