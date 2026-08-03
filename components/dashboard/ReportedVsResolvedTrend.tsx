'use client';

import { useState, useMemo } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from 'recharts';
import { TrendingUp } from 'lucide-react';
import { seededRand } from './shared';

// TODO: replace with real aggregated daily report/resolution data once volume grows.
function generateTrendData(days: number): { date: string; Reported: number; Resolved: number }[] {
  const rand = seededRand(77);
  const now = new Date();
  return Array.from({ length: days }, (_, i) => {
    const d = new Date(now);
    d.setDate(now.getDate() - (days - 1 - i));
    const reported = Math.round(rand() * 4);
    const resolved = Math.max(0, Math.round(rand() * 3 - 0.5));
    return {
      date: d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
      Reported: reported,
      Resolved: resolved,
    };
  });
}

const RANGES = [7, 30, 90] as const;
type Range = typeof RANGES[number];

export default function ReportedVsResolvedTrend() {
  const [range, setRange] = useState<Range>(30);
  const data = useMemo(() => generateTrendData(range), [range]);

  const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: {name: string; value: number; color: string}[]; label?: string }) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="bg-[#111827] border border-[#1E293B] rounded-xl px-4 py-2.5 shadow-2xl text-xs">
        <p className="font-bold text-slate-300 mb-1.5">{label}</p>
        {payload.map((p) => (
          <div key={p.name} className="flex items-center gap-2 mb-0.5">
            <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
            <span className="text-slate-400">{p.name}</span>
            <span className="font-bold ml-auto pl-4 tabular-nums" style={{ color: p.color }}>{p.value}</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="rounded-[18px] border border-[rgba(148,163,184,0.12)] bg-[rgba(17,24,39,0.55)] backdrop-blur-[18px] shadow-[0_8px_32px_rgba(0,0,0,0.35),inset_0_1px_0_rgba(255,255,255,0.04)] transition-all duration-200 hover:border-[rgba(99,102,241,0.35)] p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[rgba(16,185,129,0.15)] border border-[rgba(16,185,129,0.3)] flex items-center justify-center">
            <TrendingUp className="w-3.5 h-3.5 text-[#10B981]" />
          </div>
          <div>
            <h3 className="font-bold text-slate-200 text-sm">Reported vs Resolved Trend</h3>
            <p className="text-[10px] text-slate-500 mt-0.5">
              {/* TODO: replace with real aggregated daily data once volume grows */}
              Illustrative daily trend data
            </p>
          </div>
        </div>

        {/* Range toggle pills — min-h for touch target */}
        <div className="flex items-center gap-1.5 bg-[rgba(255,255,255,0.04)] border border-[#1E293B] rounded-xl p-1 self-start sm:self-auto">
          {RANGES.map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`px-3 py-1.5 min-h-[36px] min-w-[44px] rounded-lg text-xs font-bold transition-all ${
                range === r
                  ? 'bg-[#4F46E5] text-white shadow-[0_0_12px_rgba(99,102,241,0.4)]'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {r}D
            </button>
          ))}
        </div>
      </div>

      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={data} margin={{ top: 4, right: 0, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="colorReported" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#6366F1" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#6366F1" stopOpacity={0.03} />
            </linearGradient>
            <linearGradient id="colorResolved" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#10B981" stopOpacity={0.03} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 10, fill: '#64748B' }}
            axisLine={false} tickLine={false}
            interval={range === 7 ? 0 : range === 30 ? 4 : 13}
          />
          <YAxis tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} allowDecimals={false} />
          <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#1E293B', strokeWidth: 1 }} />
          <Legend
            iconType="circle" iconSize={8}
            formatter={(v) => <span className="text-slate-400 text-[11px]">{v}</span>}
          />
          <Area type="monotone" dataKey="Reported" stroke="#6366F1" strokeWidth={2} fill="url(#colorReported)" dot={false} activeDot={{ r: 4, fill: '#6366F1' }} />
          <Area type="monotone" dataKey="Resolved" stroke="#10B981" strokeWidth={2} fill="url(#colorResolved)" dot={false} activeDot={{ r: 4, fill: '#10B981' }} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
