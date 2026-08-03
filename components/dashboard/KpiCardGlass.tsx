'use client';

import React from 'react';
import { motion } from 'framer-motion';
import CountUpNumber from '@/components/CountUpNumber';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface KpiCardGlassProps {
  label: string;
  value: number;
  sub?: string;
  icon: React.ElementType;
  color: string;
  /** Percentage change vs prior period — positive = up, negative = down, null = no change */
  pctChange?: number | null;
  accentBorder?: boolean; // for overdue/alarmed card
  delay?: number;
}

export default function KpiCardGlass({
  label, value, sub, icon: Icon, color, pctChange, accentBorder = false, delay = 0,
}: KpiCardGlassProps) {
  const isUp   = pctChange != null && pctChange > 0;
  const isDown = pctChange != null && pctChange < 0;
  const neutral = pctChange == null || pctChange === 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay, ease: [0.22, 1, 0.36, 1] }}
      className={`
        relative overflow-hidden cursor-default p-4 sm:p-5
        rounded-[18px] border
        bg-[rgba(17,24,39,0.55)] backdrop-blur-[18px]
        shadow-[0_8px_32px_rgba(0,0,0,0.35),inset_0_1px_0_rgba(255,255,255,0.04)]
        transition-all duration-200 ease-out
        hover:-translate-y-0.5 [@media(prefers-reduced-motion:reduce)]:hover:transform-none
        ${accentBorder
          ? 'border-[rgba(244,63,94,0.35)] shadow-[0_8px_32px_rgba(0,0,0,0.35),0_0_0_1px_rgba(244,63,94,0.15),inset_0_1px_0_rgba(255,255,255,0.04)]'
          : 'border-[rgba(148,163,184,0.12)] hover:border-[rgba(99,102,241,0.35)]'
        }
      `}
    >
      {/* Soft glow blob */}
      <div
        className="absolute -top-6 -right-6 w-24 h-24 rounded-full blur-2xl opacity-20 pointer-events-none"
        style={{ background: color }}
      />

      <div className="relative flex items-start justify-between mb-3">
        <p className="text-slate-400 text-[10px] sm:text-xs font-semibold uppercase tracking-wider">{label}</p>
        {/* Glassy icon badge */}
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 backdrop-blur-[8px]"
          style={{
            background: `rgba(${hexToRgb(color)},0.15)`,
            border: `1px solid rgba(${hexToRgb(color)},0.25)`,
          }}
        >
          <Icon className="w-4 h-4" style={{ color }} />
        </div>
      </div>

      <p className="text-2xl sm:text-3xl font-black text-white tracking-tight mb-1">
        <CountUpNumber end={value} duration={1400} />
      </p>

      {sub && <p className="text-slate-500 text-[10px] sm:text-xs leading-snug mb-2">{sub}</p>}

      {/* % change indicator */}
      {pctChange != null && (
        <div className={`flex items-center gap-1 text-[11px] font-semibold flex-wrap ${
          isUp ? 'text-emerald-400' : isDown ? 'text-rose-400' : 'text-slate-500'
        }`}>
          {isUp   && <TrendingUp   className="w-3 h-3" />}
          {isDown && <TrendingDown className="w-3 h-3" />}
          {neutral && <Minus        className="w-3 h-3" />}
          <span>
            {neutral ? '—' : `${isUp ? '▲' : '▼'} ${Math.abs(pctChange).toFixed(1)}% vs last week`}
          </span>
        </div>
      )}
    </motion.div>
  );
}

// Convert 6-char hex to "r,g,b" string for rgba()
function hexToRgb(hex: string): string {
  const clean = hex.replace('#', '');
  const num = parseInt(clean, 16);
  return `${(num >> 16) & 255},${(num >> 8) & 255},${num & 255}`;
}
