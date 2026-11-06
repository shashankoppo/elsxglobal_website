'use client';

/**
 * Portal Store — Global state for the customer portal.
 *
 * Manages userSession, activeServices, liveMetrics (simulated real-time
 * CPU/RAM/Disk/Bandwidth), and billingAlerts. Uses a lightweight event
 * emitter pattern (no external dependency) so it works in any React setup.
 */

import { createClient } from '@/lib/supabase';

export interface UserSession {
  id: string;
  email: string;
  fullName?: string;
  role: 'customer' | 'admin' | 'reseller';
}

export interface ActiveService {
  id: string;
  planName: string;
  tier: string;
  domain: string;
  ipAddress: string;
  status: 'active' | 'provisioning' | 'suspended' | 'pending';
  renewalDate: string;
  controlPanelUrl?: string;
}

export interface LiveMetrics {
  cpu: number;
  ram: number;
  disk: number;
  bandwidth: number;
  uptime: number;
  lastUpdated: string;
}

export interface BillingAlert {
  id: string;
  type: 'invoice_due' | 'payment_failed' | 'low_balance' | 'renewal_soon';
  message: string;
  amount?: number;
  dueDate?: string;
  read: boolean;
}

export interface PortalState {
  user: UserSession | null;
  services: ActiveService[];
  metrics: LiveMetrics | null;
  billingAlerts: BillingAlert[];
  loading: boolean;
  error: string | null;
}

type Listener = (state: PortalState) => void;

class PortalStore {
  private state: PortalState = {
    user: null,
    services: [],
    metrics: null,
    billingAlerts: [],
    loading: false,
    error: null,
  };
  private listeners: Set<Listener> = new Set();
  private metricsInterval: ReturnType<typeof setInterval> | null = null;

  getState(): PortalState {
    return this.state;
  }

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
      if (this.listeners.size === 0) {
        this.stopMetricsSimulation();
      }
    };
  }

  private setState(updates: Partial<PortalState>) {
    this.state = { ...this.state, ...updates };
    this.listeners.forEach((l) => l(this.state));
  }

  async initialize() {
    this.setState({ loading: true, error: null });
    const supabase = createClient();
    const { data: authData } = await supabase.auth.getUser();

    if (!authData.user) {
      this.setState({ loading: false, user: null });
      return;
    }

    const user: UserSession = {
      id: authData.user.id,
      email: authData.user.email || '',
      fullName: authData.user.user_metadata?.full_name,
      role: 'customer',
    };

    const [servicesRes] = await Promise.all([
      supabase.from('hosting_services').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
    ]);

    if (servicesRes.error) {
      console.error('Failed to fetch services:', servicesRes.error);
    }

    const services: ActiveService[] = (servicesRes.data || []).map((s: any) => ({
      id: s.id,
      planName: s.plan_name || s.name || 'Hosting Plan',
      tier: s.tier || 'shared',
      domain: s.domain || '',
      ipAddress: s.ip_address || '',
      status: s.status || 'pending',
      renewalDate: s.renewal_date || '',
      controlPanelUrl: s.control_panel_url,
    }));

    this.setState({
      user,
      services,
      loading: false,
      metrics: null,
      billingAlerts: [],
    });

    this.startMetricsSimulation();
  }

  private async fetchRealMetrics() {
    if (!this.state.services || this.state.services.length === 0) return;
    
    // For this example, we fetch metrics for the primary (first) service
    const primaryServiceId = this.state.services[0].id;
    
    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      
      const res = await fetch('/api/portal/metrics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token || ''}`
        },
        body: JSON.stringify({ serviceId: primaryServiceId })
      });
      if (res.ok) {
        const data = await res.json();
        this.setState({ metrics: { 
          cpu: data.cpu || 0,
          ram: data.ram || 0,
          disk: data.disk || 0,
          bandwidth: (data.network && data.network.out) ? data.network.out : 0,
          uptime: data.uptime || 100,
          lastUpdated: new Date().toISOString() 
        } });
      }
    } catch (err) {
      console.error('Failed to fetch metrics:', err);
    }
  }

  private startMetricsSimulation() {
    if (this.metricsInterval) clearInterval(this.metricsInterval);
    
    // Initial fetch
    this.fetchRealMetrics();
    this.metricsInterval = setInterval(() => {
      this.fetchRealMetrics();
    }, 15000); // 15s refresh
  }

  stopMetricsSimulation() {
    if (this.metricsInterval) {
      clearInterval(this.metricsInterval);
      this.metricsInterval = null;
    }
  }

  setUser(user: UserSession | null) {
    this.setState({ user });
  }

  clear() {
    this.stopMetricsSimulation();
    this.setState({ user: null, services: [], metrics: null, billingAlerts: [] });
  }
}

export const portalStore = new PortalStore();
export default portalStore;
