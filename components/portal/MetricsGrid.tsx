'use client';

import { useEffect, useState, useRef } from 'react';
import { portalStore, LiveMetrics } from '@/store/portalStore';
import { Cpu, MemoryStick, HardDrive, Activity, TrendingUp, ArrowUpRight } from 'lucide-react';

interface MetricRingProps {
  label: string;
  value: number;
  icon: typeof Cpu;
  color: 'green' | 'orange' | 'red';
}

function MetricRing({ label, value, icon: Icon, color }: MetricRingProps) {
  const [displayValue, setDisplayValue] = useState(0);
  const displayRef = useRef(0);
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (displayValue / 100) * circumference;

  useEffect(() => {
    const start = displayRef.current;
    const end = value;
    const duration = 800;
    const startTime = performance.now();
    let frame: number;
    const animate = (now: number) => {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const nextValue = start + (end - start) * eased;
      setDisplayValue(nextValue);
      displayRef.current = nextValue;
      if (progress < 1) frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [value]);

  const colorMap = {
    green: { stroke: '#10B981', text: 'text-green-500', bg: 'bg-green-500/10', border: 'border-green-500/20' },
    orange: { stroke: '#F59E0B', text: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
    red: { stroke: '#EF4444', text: 'text-red-500', bg: 'bg-red-500/10', border: 'border-red-500/20' },
  };
  const c = colorMap[color];

  return (
    <div className={`liquid-glass-card rounded-2xl p-5 border ${c.border}`}>
      <div className="flex items-center justify-between mb-3">
        <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${c.bg}`}>
          <Icon className={`h-4.5 w-4.5 ${c.text}`} />
        </div>
        {color === 'red' && (
          <button className="text-xs px-2 py-1 rounded-lg bg-primary/10 text-primary inline-flex items-center gap-1 hover:bg-primary/20 transition-colors">
            Upgrade <ArrowUpRight className="h-3 w-3" />
          </button>
        )}
      </div>
      <div className="relative w-[120px] h-[120px] mx-auto">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r={radius} fill="none" stroke="currentColor" strokeWidth="8" className="text-muted/20" />
          <circle
            cx="60" cy="60" r={radius} fill="none" stroke={c.stroke} strokeWidth="8"
            strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={offset}
            style={{ transition: 'stroke-dashoffset 0.3s ease' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-2xl font-bold ${c.text}`}>{Math.round(displayValue)}%</span>
        </div>
      </div>
      <p className="text-sm text-center text-muted-foreground mt-2">{label}</p>
    </div>
  );
}

export function MetricsGrid() {
  const [metrics, setMetrics] = useState<LiveMetrics | null>(null);

  useEffect(() => {
    const unsub = portalStore.subscribe((state) => setMetrics(state.metrics));
    setMetrics(portalStore.getState().metrics);
    return unsub;
  }, []);

  if (!metrics) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="liquid-glass-card rounded-2xl p-5 h-[200px] animate-pulse" />
        ))}
      </div>
    );
  }

  const getThreshold = (v: number): 'green' | 'orange' | 'red' =>
    v > 90 ? 'red' : v > 70 ? 'orange' : 'green';

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-semibold">Live Server Metrics</h3>
          <p className="text-xs text-muted-foreground">Updated every 15 seconds · Uptime {metrics.uptime}%</p>
        </div>
        <Activity className="h-5 w-5 text-green-500" />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricRing label="CPU Usage" value={metrics.cpu} icon={Cpu} color={getThreshold(metrics.cpu)} />
        <MetricRing label="Memory" value={metrics.ram} icon={MemoryStick} color={getThreshold(metrics.ram)} />
        <MetricRing label="Disk Space" value={metrics.disk} icon={HardDrive} color={getThreshold(metrics.disk)} />
        <MetricRing label="Bandwidth" value={metrics.bandwidth} icon={Activity} color={getThreshold(metrics.bandwidth)} />
      </div>
      {metrics.cpu > 90 || metrics.ram > 90 || metrics.disk > 90 ? (
        <div className="mt-4 liquid-glass rounded-xl p-4 border-amber-500/30 bg-amber-500/5 flex items-start gap-3">
          <TrendingUp className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-amber-500">Resource threshold exceeded</p>
            <p className="text-xs text-muted-foreground mt-1">Your server is running near capacity. Consider upgrading to a higher tier for better performance.</p>
          </div>
        </div>
      ) : null}
    </div>
  );
}
