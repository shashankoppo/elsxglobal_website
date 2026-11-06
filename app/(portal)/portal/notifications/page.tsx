'use client';

import { useState } from 'react';
import { Bell, Check, Clock, Info, CheckCircle, AlertCircle, X as XIcon, Settings, Filter } from 'lucide-react';
import { PanelCard } from '@/components/ui/panel-card';

interface Notification { id: string; type: string; title: string; message: string; time: string; read: boolean; severity: string; }

const DEMO_NOTIFICATIONS: Notification[] = [
  { id: '1', type: 'security', title: 'New login detected', message: 'Sign-in from Chrome on Windows (IP: 182.72.x.x, Mumbai)', time: '2 minutes ago', read: false, severity: 'warn' },
  { id: '2', type: 'billing', title: 'Invoice #INV-2026-0041 generated', message: 'Your September invoice for ₹4,999 is ready for download.', time: '3 hours ago', read: false, severity: 'info' },
  { id: '3', type: 'system', title: 'VaultAI Gateway — maintenance complete', message: 'Scheduled maintenance completed. All providers operational.', time: '1 day ago', read: true, severity: 'success' },
  { id: '4', type: 'billing', title: 'Auto-renewal in 7 days', message: 'Your VPS Pro 8GB plan renews on Oct 1, 2026 for ₹4,999.', time: '2 days ago', read: true, severity: 'info' },
  { id: '5', type: 'security', title: 'API key used from new region', message: 'API key vh_live_9f83... was used from Singapore for the first time.', time: '3 days ago', read: true, severity: 'warn' },
  { id: '6', type: 'system', title: 'Worker deployment successful', message: 'edge-auth-router deployed successfully to 300+ PoPs in 28 seconds.', time: '5 days ago', read: true, severity: 'success' },
  { id: '7', type: 'billing', title: 'Payment confirmed — ₹4,999', message: 'Payment received via Visa ending 4242. Receipt sent to email.', time: '1 week ago', read: true, severity: 'success' },
];

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>(DEMO_NOTIFICATIONS);
  const [activeFilter, setActiveFilter] = useState('All');
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [smsNotifs, setSmsNotifs] = useState(false);
  const [pushNotifs, setPushNotifs] = useState(true);

  const handleMarkAllRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const handleMarkRead = (id: string) => {
    setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const filteredNotifs = notifications.filter(n => {
    if (activeFilter === 'All') return true;
    if (activeFilter === 'Unread') return !n.read;
    return n.type === activeFilter.toLowerCase();
  });

  const getBorderColor = (severity: string) => {
    switch (severity) {
      case 'warn': return 'border-l-4 border-l-amber-500';
      case 'info': return 'border-l-4 border-l-cyan-500';
      case 'success': return 'border-l-4 border-l-green-500';
      default: return 'border-l-4 border-l-signal';
    }
  };

  const getIcon = (severity: string) => {
    switch (severity) {
      case 'warn': return <AlertCircle className="h-5 w-5 text-amber-500" />;
      case 'info': return <Info className="h-5 w-5 text-cyan-500" />;
      case 'success': return <CheckCircle className="h-5 w-5 text-green-500" />;
      default: return <Bell className="h-5 w-5 text-signal" />;
    }
  };

  return (
    <div className="v4-page">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-hairline">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-signal font-mono">Portal</span>
            <span className="text-text-muted-v4 text-xs">/</span>
            <span className="text-xs text-text-primary-v4 font-medium">Notifications</span>
          </div>
          <h1 className="text-2xl font-bold text-text-primary-v4 mt-1 flex items-center gap-2.5">
            <Bell className="h-6 w-6 text-signal" /> Notifications Center
          </h1>
          <p className="text-xs text-text-secondary-v4 mt-0.5">
            View system alerts, billing updates, and security notices.
          </p>
        </div>
        
        <button 
          onClick={handleMarkAllRead}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-btn v4-btn-secondary text-xs font-semibold"
        >
          <Check className="h-3.5 w-3.5" /> Mark all as read
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 space-y-4">
          {/* Filters */}
          <div className="flex gap-2 overflow-x-auto pb-2 terminal-scrollbar">
            {['All', 'Unread', 'Security', 'Billing', 'System'].map(filter => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-4 py-2 rounded-full text-xs font-medium transition-colors whitespace-nowrap border ${
                  activeFilter === filter 
                    ? 'bg-signal/10 text-signal border-signal/30' 
                    : 'bg-ink-surface text-text-secondary-v4 border-hairline hover:bg-ink-surface-2'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>

          {/* List */}
          <div className="space-y-3">
            {filteredNotifs.length === 0 ? (
              <div className="p-12 rounded-2xl bg-ink-surface border border-hairline text-center">
                <Bell className="h-12 w-12 text-text-muted-v4 mx-auto mb-4 opacity-50" />
                <h3 className="text-sm font-bold text-text-primary-v4 mb-1">All caught up!</h3>
                <p className="text-xs text-text-secondary-v4">There are no notifications matching this filter.</p>
              </div>
            ) : (
              filteredNotifs.map(notif => (
                <div 
                  key={notif.id}
                  onClick={() => !notif.read && handleMarkRead(notif.id)}
                  className={`p-4 rounded-xl bg-ink-surface border-y border-r border-hairline transition-colors cursor-pointer ${
                    getBorderColor(notif.severity)
                  } ${!notif.read ? 'bg-ink-surface-2 hover:bg-ink-surface/80' : 'hover:bg-ink-surface-2/50 opacity-80'}`}
                >
                  <div className="flex items-start gap-4">
                    <div className="mt-0.5">{getIcon(notif.severity)}</div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className={`text-sm font-semibold ${!notif.read ? 'text-text-primary-v4' : 'text-text-secondary-v4'}`}>
                          {notif.title}
                        </h4>
                        <div className="flex items-center gap-2">
                          {!notif.read && <span className="h-2 w-2 rounded-full bg-signal"></span>}
                          <span className="text-[11px] text-text-muted-v4 flex items-center gap-1 font-mono">
                            <Clock className="h-3 w-3" /> {notif.time}
                          </span>
                        </div>
                      </div>
                      <p className="text-xs text-text-secondary-v4 leading-relaxed">{notif.message}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="space-y-4">
          <PanelCard className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <Settings className="h-4 w-4 text-signal" />
              <h3 className="text-sm font-bold text-text-primary-v4">Preferences</h3>
            </div>
            
            <div className="space-y-4">
              <label className="flex items-center justify-between cursor-pointer group">
                <span className="text-xs text-text-secondary-v4 group-hover:text-text-primary-v4 transition-colors">Email Notifications</span>
                <input 
                  type="checkbox" 
                  checked={emailNotifs} 
                  onChange={(e) => setEmailNotifs(e.target.checked)}
                  className="accent-signal"
                />
              </label>
              <label className="flex items-center justify-between cursor-pointer group">
                <span className="text-xs text-text-secondary-v4 group-hover:text-text-primary-v4 transition-colors">SMS Alerts</span>
                <input 
                  type="checkbox" 
                  checked={smsNotifs} 
                  onChange={(e) => setSmsNotifs(e.target.checked)}
                  className="accent-signal"
                />
              </label>
              <label className="flex items-center justify-between cursor-pointer group">
                <span className="text-xs text-text-secondary-v4 group-hover:text-text-primary-v4 transition-colors">Browser Push</span>
                <input 
                  type="checkbox" 
                  checked={pushNotifs} 
                  onChange={(e) => setPushNotifs(e.target.checked)}
                  className="accent-signal"
                />
              </label>
            </div>
            
            <div className="mt-6 pt-4 border-t border-hairline">
              <p className="text-[10px] text-text-muted-v4 leading-relaxed">
                Critical security alerts are always sent via email regardless of preferences.
              </p>
            </div>
          </PanelCard>
        </div>
      </div>
    </div>
  );
}
