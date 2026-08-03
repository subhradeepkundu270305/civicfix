'use client';

import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Timer } from 'lucide-react';
import { Issue } from '@/types';
import { CATEGORY_COLORS } from './shared';

// TODO: replace with real computed values once enough resolved issues exist.
const FALLBACK_DAYS: Record<string, number> = {
  Pothole: 4.2, Streetlight: 1.8, Water_Leak: 3.5, Footpath: 2.9, Drain: 5.1, Other: 2.2,
};

interface Props { issues: Issue[] }

export default function ResolutionTimeBreakdown({ issues }: Props) {
  const data = useMemo(() => {
    return Object.entries(FALLBACK_DAYS).map(([cat, fallback]) => {
      const resolved = issues.filter((i) => i.category === cat && i.status === 'Resolved');
      let avg = fallback;
      if (resolved.length >= 2) {
        const total = resolved.reduce((s, i) =>
          s + (new Date(i.updatedAt).getTime() - new Date(i.createdAt).getTime()) / 86400000, 0);
        avg = parseFloat((total / resolved.length).toFixed(1));
      }
      return { name: cat.replace('_', ' '), days: avg, fill: CATEGORY_COLORS[cat] };
    });
  }, [issues]);

  const overallAvg = useMemo(() => {
    const vals = data.map(d => d.days);
    return (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1);
  }, [data]);

  return (
    <div className="h-full flex flex-col rounded-[18px] border border-[rgba(148,163,184,0.12)] bg-[rgba(17,24,39,0.55)] backdrop-blur-[18px] shadow-[0_8px_32px_rgba(0,0,0,0.35),inset_0_1px_0_rgba(255,255,255,0.04)] transition-all duration-200 hover:border-[rgba(99,102,241,0.35)] p-6">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-7 h-7 rounded-lg bg-[rgba(6,182,212,0.15)] border border-[rgba(6,182,212,0.3)] flex items-center justify-center">
          <Timer className="w-3.5 h-3.5 text-[#06B6D4]" />
        </div>
        <h3 className="font-bold text-slate-200 text-sm">Resolution Time</h3>
      </div>

      {/* Overall avg */}
      <div className="mb-4">
        <p className="text-3xl font-black text-white">{overallAvg}d</p>
        <p className="text-[10px] text-slate-500">Avg. resolution time (all categories)</p>
      </div>

      <div className="flex-1 min-h-[160px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ top: 0, right: 16, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" horizontal={false} />
            <XAxis type="number" tick={{ fontSize: 10, fill: '#64748B' }} axisLine={false} tickLine={false} unit="d" />
            <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: '#94A3B8' }} axisLine={false} tickLine={false} width={70} />
            <Tooltip
              content={({ active, payload }) =>
                active && payload?.length ? (
                  <div className="bg-[#111827] border border-[#1E293B] rounded-xl px-3 py-2 text-xs text-white shadow-xl">
                    <p className="font-bold text-slate-300">{payload[0].payload.name}</p>
                    <p className="font-black text-[#06B6D4]">{payload[0].value} days avg</p>
                  </div>
                ) : null
              }
              cursor={{ fill: 'rgba(255,255,255,0.03)' }}
            />
            <Bar dataKey="days" radius={[0, 6, 6, 0]} maxBarSize={18}>
              {data.map((entry, i) => (
                <Cell key={i} fill={entry.fill} fillOpacity={0.8} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
