'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import { QRPaymentCanvas } from '@/components/hosting/qr-payment-canvas';
import {
  Check, Loader2, CreditCard, QrCode, Building2, ShieldCheck, ArrowRight,
  AlertCircle, Sparkles, Globe, Lock, Clock, Tag, ChevronRight,
} from 'lucide-react';
import Link from 'next/link';

interface Plan {
  id: string;
  name: string;
  tier: string;
  price_monthly: number;
  price_annual: number;
  features: string[];
  short_description: string;
}

type BillingCycle = 'monthly' | 'semi_annual' | 'annual';

const cycleConfig: Record<BillingCycle, { label: string; multiplier: number; discount: number; suffix: string }> = {
  monthly: { label: 'Monthly', multiplier: 1, discount: 0, suffix: 'mo' },
  semi_annual: { label: 'Semi-Annually', multiplier: 6, discount: 0.05, suffix: '6 mo' },
  annual: { label: 'Annually', multiplier: 12, discount: 0.167, suffix: 'yr' },
};

export function CheckoutClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const planId = searchParams.get('plan') || '';

  const [plan, setPlan] = useState<Plan | null>(null);
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('monthly');
  const [loading, setLoading] = useState(true);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [domain, setDomain] = useState('');
  const [addons, setAddons] = useState<string[]>([]);
  const [os, setOs] = useState('ubuntu-22.04');
  const [panel, setPanel] = useState('none');
  const [location, setLocation] = useState('pune');

  const osOptions = [
    { id: 'ubuntu-22.04', label: 'Ubuntu 22.04 LTS', desc: 'Recommended for most apps' },
    { id: 'ubuntu-24.04', label: 'Ubuntu 24.04 LTS', desc: 'Latest LTS release' },
    { id: 'debian-12', label: 'Debian 12 (Bookworm)', desc: 'Stable and lightweight' },
    { id: 'almalinux-9', label: 'AlmaLinux 9', desc: 'RHEL-compatible, cPanel-ready' },
    { id: 'windows-2022', label: 'Windows Server 2022', desc: 'For .NET and MS-SQL apps' },
  ];

  const panelOptions = [
    { id: 'none', label: 'No Panel (Raw Server)', desc: 'Full root SSH access' },
    { id: 'cpanel', label: 'cPanel + WHM', desc: '+Rs 1,500/mo — industry standard' },
    { id: 'plesk', label: 'Plesk Obsidian', desc: '+Rs 800/mo — multi-platform' },
    { id: 'directadmin', label: 'DirectAdmin', desc: '+Rs 500/mo — lightweight' },
    { id: 'aapanel', label: 'aaPanel (Free)', desc: 'Open-source control panel' },
  ];

  const locationOptions = [
    { id: 'pune', label: 'Pune, India', desc: 'Low latency for India' },
    { id: 'delhi', label: 'Delhi NCR, India', desc: 'North India coverage' },
    { id: 'mumbai', label: 'Mumbai, India', desc: 'West India hub' },
    { id: 'eindhoven', label: 'Eindhoven, EU', desc: 'European edge' },
    { id: 'chicago', label: 'Chicago, USA', desc: 'North America' },
  ];
  const [paymentSettings, setPaymentSettings] = useState<any>(null);
  const [paymentMethod, setPaymentMethod] = useState<'razorpay' | 'upi_manual' | 'bank_transfer' | null>(null);
  const [proofUrl, setProofUrl] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [confirmed, setConfirmed] = useState(false);
  const [razorpayLoading, setRazorpayLoading] = useState(false);
  const [dbAddons, setDbAddons] = useState<any[]>([]);
  const [couponCode, setCouponCode] = useState('');
  const [coupon, setCoupon] = useState<{ code: string; discount_type: string; discount_value: number } | null>(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState<string | null>(null);

  useEffect(() => {
    const init = async () => {
      const supabase = createClient();

      if (planId === 'custom') {
        const vcpu = Number(searchParams.get('vcpu') || 4);
        const ram = Number(searchParams.get('ram') || 8);
        const storage = Number(searchParams.get('storage') || 100);
        
        const vcpuCost = vcpu * 150;
        const ramCost = ram * 100;
        const storageCost = storage * 10;
        const baseCost = 0;
        const customPrice = Math.round(baseCost + vcpuCost + ramCost + storageCost);
        
        setPlan({
          id: 'custom',
          name: `Custom Cloud Compute`,
          tier: 'cloud',
          price_monthly: customPrice,
          price_annual: customPrice * 12 * 0.833, // 16.7% discount on annual
          features: [`${vcpu} vCPUs`, `${ram}GB RAM`, `${storage}GB NVMe Storage`, `Auto-scaling enabled`],
          short_description: 'Custom configured cloud instance',
        });
      } else {
        const { data: planData, error: planError } = await supabase
          .from('hosting_plans')
          .select('*')
          .eq('id', planId)
          .maybeSingle();
        if (planError) console.error(planError);
        setPlan(planData as any);
      }

      const { data: psData, error: psError } = await supabase
        .from('public_payment_settings')
        .select('*')
        .maybeSingle();
      if (psError) console.error(psError);
      setPaymentSettings(psData);

      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);

      const { data: addonsData, error: addonsError } = await supabase
        .from('hosting_addons')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });
      if (addonsError) console.error(addonsError);
      setDbAddons(addonsData || []);

      setLoading(false);
    };
    init();
  }, [planId, searchParams]);

  const basePrice = plan ? Number(plan.price_monthly) : 0;
  const cycle = cycleConfig[billingCycle];
  const addonPrices: Record<string, number> = dbAddons.reduce((acc: any, addon: any) => {
    acc[addon.id] = addon.price_monthly;
    return acc;
  }, {});
  const panelPrice = panel !== 'none' && panel !== 'aapanel' ? (panel === 'cpanel' ? 1500 : panel === 'plesk' ? 800 : 500) : 0;
  const addonTotal = addons.reduce((sum, id) => sum + (addonPrices[id] || 0), 0);
  const subtotal = (basePrice + panelPrice) * cycle.multiplier * (1 - cycle.discount) + addonTotal * cycle.multiplier;
  const couponDiscount = coupon
    ? coupon.discount_type === 'percentage'
      ? Math.round(subtotal * coupon.discount_value / 100)
      : Math.min(Math.round(coupon.discount_value), Math.round(subtotal))
    : 0;
  const amount = Math.max(0, Math.round(subtotal - couponDiscount));
  const savings = billingCycle !== 'monthly' ? Math.round(basePrice * cycle.multiplier - basePrice * cycle.multiplier * (1 - cycle.discount)) : 0;

  const applyCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    setCouponError(null);
    const supabase = createClient();
    const now = new Date().toISOString();
    const { data, error: ce } = await supabase
      .from('hosting_coupons')
      .select('code, discount_type, discount_value, max_uses, current_uses, valid_until, is_active')
      .eq('code', couponCode.trim().toUpperCase())
      .eq('is_active', true)
      .maybeSingle();
    if (ce || !data) { setCouponError('Invalid or expired coupon code.'); setCouponLoading(false); return; }
    if (data.valid_until && data.valid_until < now) { setCouponError('This coupon has expired.'); setCouponLoading(false); return; }
    if (data.max_uses && data.current_uses >= data.max_uses) { setCouponError('This coupon has reached its usage limit.'); setCouponLoading(false); return; }
    setCoupon(data);
    setCouponError(null);
    setCouponLoading(false);
  };

  const handleCreateOrder = async () => {
    if (!user) {
      setError('Please sign in to continue checkout.');
      router.push('/portal/login?redirect=' + encodeURIComponent(typeof window !== 'undefined' ? window.location.pathname + window.location.search : `/vaulthost/checkout?plan=${planId}`));
      return null;
    }
    if (!plan) return null;
    const supabase = createClient();
    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData.session?.access_token;

    const res = await fetch('/api/checkout/create', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          planId: plan.id, planName: plan.name, planTier: plan.tier,
          billingCycle, amount, domain, os, panel, location, user, addons,
          coupon_code: coupon?.code || null,
          coupon_discount: couponDiscount || 0,
          custom_vcpu: plan.id === 'custom' ? Number(searchParams.get('vcpu') || 4) : undefined,
          custom_ram: plan.id === 'custom' ? Number(searchParams.get('ram') || 8) : undefined,
          custom_storage: plan.id === 'custom' ? Number(searchParams.get('storage') || 100) : undefined
        })
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        setError(err.error || 'Failed to create order');
        return null;
      }

      const { id } = await res.json();
      setOrderId(id);
    return id;
  };

  const handlePaymentSubmit = async () => {
    if (!plan) return;
    setSubmitting(true);
    setError(null);
    try {
      const supabase = createClient();
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      let finalOrderId = orderId;
      if (!finalOrderId) {
        finalOrderId = await handleCreateOrder();
        if (!finalOrderId) { setSubmitting(false); return; }
      }

      if (paymentMethod === 'razorpay') {
        setRazorpayLoading(true);
        const { data: sessionData } = await supabase.auth.getSession();
        const token = sessionData.session?.access_token;
        const createRes = await fetch(`/api/razorpay/create-order`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ orderId: finalOrderId, receipt: finalOrderId }),
        });
        if (!createRes.ok) {
          const err = await createRes.json().catch(() => ({}));
          setError(err.error || 'Failed to initiate Razorpay payment');
          setRazorpayLoading(false); setSubmitting(false); return;
        }
        const rzpData = await createRes.json();

        await new Promise<void>((resolve, reject) => {
          if ((window as any).Razorpay) { resolve(); return; }
          const script = document.createElement('script');
          script.src = 'https://checkout.razorpay.com/v1/checkout.js';
          script.onload = () => resolve();
          script.onerror = () => reject(new Error('Failed to load Razorpay'));
          document.body.appendChild(script);
        });

        const rzp = new (window as any).Razorpay({
          key: rzpData.key_id, amount: rzpData.amount, currency: rzpData.currency,
          name: 'ELSxGlobal VaultHost', description: `Order ${finalOrderId}`, order_id: rzpData.id,
          prefill: { email: user?.email || '' }, theme: { color: '#0ea5e9' },
          handler: async (response: any) => {
            const verifyRes = await fetch(`/api/razorpay/verify`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: rzpData.id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                orderId: finalOrderId,
              }),
            });
            if (verifyRes.ok) { setConfirmed(true); }
            else { const err = await verifyRes.json().catch(() => ({})); setError(err.error || 'Payment verification failed'); }
            setRazorpayLoading(false); setSubmitting(false);
          },
          modal: { ondismiss: () => { setError('Payment cancelled'); setRazorpayLoading(false); setSubmitting(false); } },
        });
        rzp.open();
        return;
      }

      // Manual payment (UPI / Bank transfer)
      const { data: sessionData } = await supabase.auth.getSession();
      const manualToken = sessionData.session?.access_token;
      const manualRes = await fetch(`/api/payments/manual`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${manualToken}` },
        body: JSON.stringify({ action: 'mark-manual-payment', orderId: finalOrderId, paymentMethod, proofUrl }),
      });
      if (!manualRes.ok) {
        const err = await manualRes.json().catch(() => ({}));
        setError(err.error || 'Failed to submit payment'); setSubmitting(false); return;
      }

      try {
        await fetch(`${supabaseUrl}/functions/v1/send-email`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${supabaseAnonKey}` },
          body: JSON.stringify({ action: 'order-placed', to: user?.email || '', orderId: finalOrderId, planName: plan.name, template: 'order-placed' }),
        });
      } catch (e) { console.error('Email notification failed:', e); }

      setConfirmed(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="text-center py-24">
        <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
        <p className="text-lg font-semibold mb-2">Plan Not Found</p>
        <p className="text-sm text-muted-foreground mb-6">Select a hosting plan to begin checkout.</p>
        <Link href="/vaulthost/pricing" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground">
          View Plans <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  if (confirmed) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4">
        <div className="liquid-glass-card rounded-3xl p-8 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-good/10 border border-good/20 mx-auto mb-6">
            <Check className="h-8 w-8 text-good" />
          </div>
          <h2 className="text-2xl font-semibold mb-3">Payment Submitted</h2>
          <p className="text-sm text-muted-foreground mb-6">
            Our team will verify your payment within 2-4 hours. You will receive an email confirmation once your hosting is activated.
          </p>
          <div className="liquid-glass rounded-2xl p-4 mb-6 text-left">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Order ID</span>
              <span className="text-sm font-mono font-medium">{orderId?.slice(0, 8).toUpperCase()}</span>
            </div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Plan</span>
              <span className="text-sm font-medium">{plan.name}</span>
            </div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Amount</span>
              <span className="text-sm font-medium">Rs {amount.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Status</span>
              <span className="text-sm px-2 py-0.5 rounded-full bg-warn/10 text-warn border border-warn/20">Pending Verification</span>
            </div>
          </div>
          <div className="flex gap-3">
            <Link href="/portal" className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-primary text-primary-foreground font-medium">
              Track Order <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/vaulthost/pricing" className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl liquid-glass text-sm font-medium">
              Browse Plans
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-12 px-4">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight mb-2">Checkout</h1>
        <p className="text-sm text-muted-foreground">Complete your hosting order securely</p>
      </div>

      {error && (
        <div className="liquid-glass rounded-xl p-3 mb-6 border-destructive/30 bg-destructive/5 flex items-start gap-2.5">
          <AlertCircle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      <div className="grid lg:grid-cols-[1fr_380px] gap-8">
        {/* Left column: Auth + Payment */}
        <div className="space-y-6">
          {/* Account */}
          <div className="liquid-glass-card rounded-2xl p-6">
            <h2 className="text-base font-semibold mb-4 flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs">1</span>
              Account
            </h2>
            {user ? (
              <div className="liquid-glass rounded-xl p-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">{user.email}</p>
                  <p className="text-xs text-good">Authenticated</p>
                </div>
                <Check className="h-4 w-4 text-good" />
              </div>
            ) : (
              <div className="flex gap-3">
                <Link href={`/portal/login?redirect=${encodeURIComponent(typeof window !== 'undefined' ? window.location.pathname + window.location.search : `/vaulthost/checkout?plan=${planId}`)}`} className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium">
                  Sign In
                </Link>
                <Link href={`/portal/signup?redirect=${encodeURIComponent(typeof window !== 'undefined' ? window.location.pathname + window.location.search : `/vaulthost/checkout?plan=${planId}`)}`} className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl liquid-glass text-sm font-medium">
                  Create Account
                </Link>
              </div>
            )}
          </div>

          {/* Domain & Server Config */}
          <div className="liquid-glass-card rounded-2xl p-6">
            <h2 className="text-base font-semibold mb-4 flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs">2</span>
              Domain & Server Configuration
            </h2>
            <div className="space-y-5">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Primary Domain</label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    value={domain}
                    onChange={(e) => setDomain(e.target.value)}
                    placeholder="example.com"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Operating System</label>
                <div className="grid sm:grid-cols-2 gap-2">
                  {osOptions.map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => setOs(opt.id)}
                      className={`p-3 rounded-xl border-2 text-left transition-colors ${os === opt.id ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/30'}`}
                    >
                      <p className="text-sm font-medium">{opt.label}</p>
                      <p className="text-xs text-muted-foreground">{opt.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Control Panel</label>
                <div className="grid sm:grid-cols-2 gap-2">
                  {panelOptions.map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => setPanel(opt.id)}
                      className={`p-3 rounded-xl border-2 text-left transition-colors ${panel === opt.id ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/30'}`}
                    >
                      <p className="text-sm font-medium">{opt.label}</p>
                      <p className="text-xs text-muted-foreground">{opt.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Server Location</label>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
                  {locationOptions.map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => setLocation(opt.id)}
                      className={`p-3 rounded-xl border-2 text-left transition-colors ${location === opt.id ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/30'}`}
                    >
                      <p className="text-sm font-medium">{opt.label}</p>
                      <p className="text-xs text-muted-foreground">{opt.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-4 block text-lg">Optional Add-ons & Licensing</label>
                
                {Object.entries(
                  dbAddons.reduce((acc, addon) => {
                    const cat = addon.category || 'other';
                    if (!acc[cat]) acc[cat] = [];
                    acc[cat].push(addon);
                    return acc;
                  }, {} as Record<string, any[]>)
                ).map(([category, catAddons]: [string, any]) => (
                  <div key={category} className="mb-6">
                    <h4 className="text-sm font-semibold mb-3 capitalize text-muted-foreground tracking-wider">{category.replace('_', ' ')} Options</h4>
                    <div className="space-y-2">
                      {catAddons.map((addon: any) => (
                        <label key={addon.id} className="flex items-center justify-between liquid-glass rounded-xl p-3 cursor-pointer hover:border-signal/30 transition-colors border border-transparent">
                          <div className="flex items-center gap-3">
                            <input
                              type="checkbox"
                              checked={addons.includes(addon.id)}
                              onChange={(e) => {
                                if (e.target.checked) setAddons([...addons, addon.id]);
                                else setAddons(addons.filter((a) => a !== addon.id));
                              }}
                              className="h-4 w-4 rounded text-signal focus:ring-signal bg-background border-border"
                            />
                            <div>
                              <span className="text-sm font-medium block">{addon.name}</span>
                              {addon.description && <span className="text-xs text-muted-foreground block">{addon.description}</span>}
                            </div>
                          </div>
                          <span className="text-sm font-semibold text-signal">+Rs {addon.price_monthly}/mo</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Payment */}
          <div className="liquid-glass-card rounded-2xl p-6">
            <h2 className="text-base font-semibold mb-4 flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs">3</span>
              Payment Method
            </h2>

            <div className="space-y-3 mb-6">
              {paymentSettings?.razorpay_enabled && (
                <button
                  onClick={() => setPaymentMethod('razorpay')}
                  className={`w-full p-4 rounded-xl border-2 flex items-center gap-3 transition-colors text-left ${paymentMethod === 'razorpay' ? 'border-primary bg-primary/5' : 'border-border'}`}
                >
                  <CreditCard className="h-5 w-5 text-signal" />
                  <div>
                    <p className="font-medium text-sm">Razorpay</p>
                    <p className="text-xs text-muted-foreground">Credit/Debit card, Net banking, Wallet (India)</p>
                  </div>
                </button>
              )}

              {paymentSettings?.upi_enabled && (
                <div>
                  <button
                    onClick={() => setPaymentMethod('upi_manual')}
                    className={`w-full p-4 rounded-xl border-2 flex items-center gap-3 transition-colors text-left ${paymentMethod === 'upi_manual' ? 'border-primary bg-primary/5' : 'border-border'}`}
                  >
                    <QrCode className="h-5 w-5 text-good" />
                    <div>
                      <p className="font-medium text-sm">UPI / QR Code</p>
                      <p className="text-xs text-muted-foreground">Scan QR with any UPI app, upload proof</p>
                    </div>
                  </button>

                  {paymentMethod === 'upi_manual' && paymentSettings?.upi_id && (
                    <div className="mt-4 liquid-glass rounded-2xl p-6">
                      <QRPaymentCanvas
                        upiId={paymentSettings.upi_id}
                        payeeName={paymentSettings.upi_display_name || 'ELSxGlobal'}
                        amount={amount}
                        orderId={orderId || 'preview'}
                        customQrUrl={paymentSettings.custom_qr_image_url || undefined}
                        onProofUpload={(url) => setProofUrl(url)}
                      />
                    </div>
                  )}
                </div>
              )}

              {paymentSettings?.bank_transfer_enabled && (
                <button
                  onClick={() => setPaymentMethod('bank_transfer')}
                  className={`w-full p-4 rounded-xl border-2 flex items-center gap-3 transition-colors text-left ${paymentMethod === 'bank_transfer' ? 'border-primary bg-primary/5' : 'border-border'}`}
                >
                  <Building2 className="h-5 w-5 text-warn" />
                  <div>
                    <p className="font-medium text-sm">Bank Transfer</p>
                    <p className="text-xs text-muted-foreground">NEFT/IMPS with proof upload</p>
                  </div>
                </button>
              )}
            </div>

            {/* Bank transfer details + proof upload */}
            {paymentMethod === 'bank_transfer' && paymentSettings?.bank_transfer_enabled && (
              <div className="mt-4 p-4 rounded-xl bg-warn/5 border border-warn/20 space-y-3">
                <p className="text-sm font-medium">Bank Transfer Details</p>
                <div className="text-xs text-muted-foreground space-y-1">
                  <p>Account Name: <span className="font-medium text-foreground">{paymentSettings.bank_account_name || 'N/A'}</span></p>
                  <p>Account Number: <span className="font-medium text-foreground">{paymentSettings.bank_account_number || 'N/A'}</span></p>
                  <p>IFSC Code: <span className="font-medium text-foreground">{paymentSettings.bank_ifsc || 'N/A'}</span></p>
                  <p>Bank: <span className="font-medium text-foreground">{paymentSettings.bank_name || 'N/A'}</span></p>
                </div>
                <div className="pt-2">
                  <label className="text-sm font-medium block mb-2">Upload Payment Proof</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file || !user) return;
                      const supabase = createClient();
                      const ext = file.name.split('.').pop() || 'png';
                      const fileName = `bank-proof-${Date.now()}.${ext}`;
                      const { error: upErr } = await supabase.storage.from('qr-uploads').upload(fileName, file);
                      if (upErr) { setError('Failed to upload proof'); return; }
                      const { data: urlData } = supabase.storage.from('qr-uploads').getPublicUrl(fileName);
                      setProofUrl(urlData.publicUrl);
                    }}
                    className="block w-full text-sm file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-primary file:text-primary-foreground file:font-medium file:cursor-pointer"
                  />
                  {proofUrl && <p className="text-xs text-good mt-1">Proof uploaded successfully</p>}
                </div>
              </div>
            )}

            {/* Pay button with trust badges */}
            <button
              onClick={handlePaymentSubmit}
              disabled={!paymentMethod || submitting || ((paymentMethod === 'upi_manual' || paymentMethod === 'bank_transfer') && !proofUrl)}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-primary text-primary-foreground font-medium disabled:opacity-50"
            >
              {razorpayLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />}
              {razorpayLoading ? 'Opening Razorpay...' : submitting ? 'Processing...' : `Pay Rs ${amount.toLocaleString('en-IN')} Now`}
            </button>

            {/* Trust badges */}
            <div className="mt-4 flex flex-wrap items-center justify-center gap-3 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1.5"><ShieldCheck className="h-3.5 w-3.5 text-good" />256-bit SSL Secure</span>
              <span className="inline-flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-good" />30-Day Money-Back Guarantee</span>
              <span className="inline-flex items-center gap-1.5"><Lock className="h-3.5 w-3.5 text-good" />PCI-DSS Compliant</span>
              <span className="inline-flex items-center gap-1.5"><Clock className="h-3.5 w-3.5 text-good" />24/7 Human Support</span>
            </div>
          </div>
        </div>

        {/* Right column: Sticky Order Summary */}
        <div>
          <div className="sticky top-24">
            <div className="liquid-glass-card rounded-2xl p-6">
              <h2 className="text-base font-semibold mb-4">Order Summary</h2>

              {/* Plan */}
              <div className="liquid-glass rounded-xl p-4 mb-4">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h3 className="font-medium text-sm">{plan.name}</h3>
                    <p className="text-xs text-muted-foreground capitalize">{plan.tier} hosting</p>
                  </div>
                  <Sparkles className="h-4 w-4 text-primary" />
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {(plan.features as string[] || []).slice(0, 3).map((f, i) => (
                    <span key={i} className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">{f}</span>
                  ))}
                </div>
              </div>

              {/* Billing cycle toggle */}
              <div className="mb-4">
                <label className="text-sm font-medium mb-2 block">Billing Cycle</label>
                <div className="grid grid-cols-3 gap-2">
                  {(Object.keys(cycleConfig) as BillingCycle[]).map((c) => (
                    <button
                      key={c}
                      onClick={() => setBillingCycle(c)}
                      className={`p-3 rounded-xl border-2 text-center transition-colors ${billingCycle === c ? 'border-primary bg-primary/5' : 'border-border'}`}
                    >
                      <p className="text-xs font-medium">{cycleConfig[c].label.split('-')[0]}</p>
                      {cycleConfig[c].discount > 0 && (
                        <p className="text-xs text-good mt-0.5">{Math.round(cycleConfig[c].discount * 100)}% off</p>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price breakdown */}
              <div className="space-y-2 mb-4 pb-4 border-b border-border">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Base ({cycle.label})</span>
                  <span>Rs {Math.round(basePrice * cycle.multiplier * (1 - cycle.discount)).toLocaleString('en-IN')}</span>
                </div>
                {panelPrice > 0 && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground capitalize">{panel} panel</span>
                    <span>Rs {(panelPrice * cycle.multiplier).toLocaleString('en-IN')}</span>
                  </div>
                )}
                {addons.map((id) => (
                  <div key={id} className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground capitalize">{id} addon</span>
                    <span>Rs {(addonPrices[id] * cycle.multiplier).toLocaleString('en-IN')}</span>
                  </div>
                ))}
                {savings > 0 && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-good inline-flex items-center gap-1"><Tag className="h-3 w-3" />Billing Discount</span>
                    <span className="text-good">- Rs {savings.toLocaleString('en-IN')}</span>
                  </div>
                )}
                {coupon && couponDiscount > 0 && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-good inline-flex items-center gap-1"><Tag className="h-3 w-3" />Coupon ({coupon.code})</span>
                    <span className="text-good">- Rs {couponDiscount.toLocaleString('en-IN')}</span>
                  </div>
                )}
              </div>

              {/* Coupon Code Input */}
              <div className="mb-4">
                <label className="text-sm font-medium mb-1.5 block">Have a coupon?</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => { setCouponCode(e.target.value.toUpperCase()); if (coupon) setCoupon(null); }}
                    placeholder="COUPON CODE"
                    className="flex-1 px-3 py-2 rounded-xl bg-background border border-border text-sm font-mono uppercase focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                  <button
                    onClick={applyCoupon}
                    disabled={couponLoading || !couponCode.trim() || !!coupon}
                    className="px-3 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-medium disabled:opacity-50 shrink-0"
                  >
                    {coupon ? '✓' : couponLoading ? '...' : 'Apply'}
                  </button>
                </div>
                {couponError && <p className="text-xs text-destructive mt-1">{couponError}</p>}
                {coupon && <p className="text-xs text-good mt-1">✓ Coupon applied — {coupon.discount_type === 'percentage' ? `${coupon.discount_value}% off` : `Rs ${coupon.discount_value} off`}</p>}
              </div>

              {/* Total */}
              <div className="flex items-center justify-between mb-4">
                <span className="font-semibold">Total</span>
                <div className="text-right">
                  <p className="text-2xl font-bold">Rs {amount.toLocaleString('en-IN')}</p>
                  <p className="text-xs text-muted-foreground">per {cycle.suffix}</p>
                </div>
              </div>

              {/* Trust mini-badges */}
              <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                <ShieldCheck className="h-3.5 w-3.5 text-good" />
                <span>Secure checkout · 30-day refund</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
