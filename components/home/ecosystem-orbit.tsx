'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { Cpu, GitBranch, BarChart3, Briefcase } from 'lucide-react';

const ORBIT_NODES = [
  { label: 'ELSxTech', icon: Cpu, angle: -90, color: '#3B82F6' },
  { label: 'ELSxBPO', icon: GitBranch, angle: 0, color: '#6366F1' },
  { label: 'ELSxKPO', icon: BarChart3, angle: 90, color: '#8B5CF6' },
  { label: 'ELSxConsultancy', icon: Briefcase, angle: 180, color: '#06B6D4' },
];

const RADIUS = 160;

export function EcosystemOrbit() {
  const reduced = useReducedMotion();

  return (
    <div className="relative w-full aspect-square max-w-[420px] mx-auto">
      {/* Outer rotation container */}
      <motion.div
        className="absolute inset-0"
        animate={reduced ? {} : { rotate: 360 }}
        transition={{ duration: 120, repeat: Infinity, ease: 'linear' }}
      >
        {/* Connection lines */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 400">
          {ORBIT_NODES.map((node) => {
            const rad = (node.angle * Math.PI) / 180;
            const x = 200 + RADIUS * Math.cos(rad);
            const y = 200 + RADIUS * Math.sin(rad);
            return (
              <g key={node.label}>
                <line
                  x1="200"
                  y1="200"
                  x2={x}
                  y2={y}
                  stroke={node.color}
                  strokeWidth="1"
                  strokeOpacity="0.2"
                  strokeDasharray="4 4"
                />
                <motion.circle
                  r="3"
                  fill={node.color}
                  initial={{ cx: 200, cy: 200 }}
                  animate={reduced ? {} : { cx: [200, x, 200], cy: [200, y, 200] }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: 'easeInOut',
                    delay: ORBIT_NODES.indexOf(node) * 0.5,
                  }}
                />
              </g>
            );
          })}
        </svg>

        {/* Orbital nodes */}
        {ORBIT_NODES.map((node) => {
          const rad = (node.angle * Math.PI) / 180;
          const x = 50 + (RADIUS / 4) * Math.cos(rad);
          const y = 50 + (RADIUS / 4) * Math.sin(rad);
          return (
            <motion.div
              key={node.label}
              className="absolute -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${x}%`, top: `${y}%` }}
              animate={reduced ? {} : { rotate: -360 }}
              transition={{ duration: 120, repeat: Infinity, ease: 'linear' }}
            >
              <div
                className="flex flex-col items-center gap-1"
                style={{ filter: `drop-shadow(0 0 12px ${node.color}40)` }}
              >
                <div
                  className="flex h-12 w-12 items-center justify-center rounded-xl border"
                  style={{
                    backgroundColor: `${node.color}15`,
                    borderColor: `${node.color}40`,
                  }}
                >
                  <node.icon className="h-5 w-5" style={{ color: node.color }} />
                </div>
                <span className="text-[10px] font-medium text-muted-foreground whitespace-nowrap">
                  {node.label}
                </span>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Center node — counter-rotates to stay upright */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center"
        animate={reduced ? {} : { rotate: -360 }}
        transition={{ duration: 120, repeat: Infinity, ease: 'linear' }}
      >
        <div className="relative">
          <motion.div
            className="absolute inset-0 rounded-full border border-blue-500/40"
            animate={reduced ? {} : { scale: [1, 2.4], opacity: [1, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeOut' }}
          />
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-500/10 border border-blue-500/30 shadow-glow-blue">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <path d="M14 2L26 14L14 26L2 14L14 2Z" stroke="#3B82F6" strokeWidth="1.5" />
              <path d="M14 8L20 14L14 20L8 14L14 8Z" fill="#3B82F6" fillOpacity="0.3" stroke="#6366F1" strokeWidth="1" />
            </svg>
          </div>
        </div>
      </motion.div>

      {/* VaultHost label */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2">
        <span className="text-[10px] font-mono text-muted-foreground/70 uppercase tracking-wider">
          Powered by VaultHost
        </span>
      </div>
    </div>
  );
}
