'use client';

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, Cell,
} from 'recharts';
import { GitMerge } from 'lucide-react';
import { STATUS_COLORS, CATEGORY_COLORS } from './shared';
import { Issue, Status } from '@/types';

interface Props { issues: Issue[] }

const CATEGORIES = ['Pothole', 'Streetlight', 'Water_Leak', 'Footpath', 'Drain', 'Other'];
const STATUSES: Status[] = ['Submitted', 'Under_Review', 'Assigned', 'In_Progress', 'Resolved', 'Rejected'];
const STATUS_LABELS: Record<Status, string> = {
  Submitted:    'Submitted',
  Under_Review: 'Under Review',
  Assigned:     'Assigned',
  In_Progress:  'In Progress',
  Resolved:     'Resolved',
  Rejected:     'Rejected',
};

export default function CategoryStatusStacked({ issues }: Props) {
  const data = CATEGORIES.map((cat) => {
    const catIssues = issues.filter((i) => i.category === cat);
    const row: Record<string, string | number> = {
      name: cat.replace('_', ' '),
      fill: CATEGORY_COLORS[cat],
    };
    STATUSES.forEach((s) => {
      row[s] = catIssues.filter((i) => i.status === s).length;
    });
    return row;
  });

  const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: {name: string; value: number; fill: string}[]; label?: string }) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="bg-[#111827] border border-[#1E293B] rounded-xl px-4 py-3 shadow-2xl text-xs">
        <p className="font-bold text-slate-300 mb-2">{label}</p>
        {payload.filter(p => p.value > 0).map((p) => (
          <div key={p.name} className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full" style={{ background: p.fill }} />
            <span className="text-slate-400">{STATUS_LABELS[p.name as Status]}</span>
            <span className="font-bold text-white ml-auto pl-4 tabular-nums">{p.value}</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="rounded-[18px] border border-[rgba(148,163,184,0.12)] bg-[rgba(17,24,39,0.55)] backdrop-blur-[18px] shadow-[0_8px_32px_rgba(0,0,0,0.35),inset_0_1px_0_rgba(255,255,255,0.04)] transition-all duration-200 hover:border-[rgba(99,102,241,0.35)] p-6">
      <div className="flex items-center gap-2 mb-5">
        <div className="w-7 h-7 rounded-lg bg-[rgba(99,102,241,0.15)] border border-[rgba(99,102,241,0.3)] flex items-center justify-center">
          <GitMerge className="w-3.5 h-3.5 text-[#818CF8]" />
        </div>
        <h3 className="font-bold text-slate-200 text-sm">Category × Status Breakdown</h3>
      </div>

      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={data} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
          <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} allowDecimals={false} />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
          <Legend
            iconType="circle"
            iconSize={8}
            formatter={(v) => <span className="text-slate-400 text-[11px]">{STATUS_LABELS[v as Status]}</span>}
          />
          {STATUSES.map((s) => (
            <Bar key={s} dataKey={s} stackId="a" fill={STATUS_COLORS[s]} fillOpacity={0.85} maxBarSize={50} />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
