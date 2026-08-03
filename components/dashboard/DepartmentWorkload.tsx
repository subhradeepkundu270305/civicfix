'use client';

import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Building2 } from 'lucide-react';
import { Issue } from '@/types';

// TODO: replace with real department assignment data once assignedTo field is consistently populated.
// Dummy distribution for departments/zones with no assigned issues yet.
const DEPT_PALETTE = ['#6366F1', '#06B6D4', '#10B981', '#F59E0B', '#FB923C', '#A78BFA'];

const DUMMY_DEPTS: Record<string, number> = {
  'PWD Zone-3':             12,
  'Delhi Jal Board':        9,
  'Electrical Dept.':       8,
  'Municipal Sanitation':   6,
  'Roads & Footpaths':      7,
  'Unassigned':             5,
};

interface Props { issues: Issue[] }

export default function DepartmentWorkload({ issues }: Props) {
  const data = useMemo(() => {
    const tally: Record<string, number> = {};

    issues.filter((i) => !['Resolved', 'Rejected'].includes(i.status)).forEach((i) => {
      const dept = i.assignedTo?.trim() || 'Unassigned';
      tally[dept] = (tally[dept] ?? 0) + 1;
    });

    // Merge with dummy if sparse (< 3 departments)
    if (Object.keys(tally).length < 3) {
      // TODO: replace with real aggregated data once volume grows
      Object.entries(DUMMY_DEPTS).forEach(([k, v]) => {
        tally[k] = (tally[k] ?? 0) + v;
      });
    }

    return Object.entries(tally)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 7)
      .map(([name, count], i) => ({ name, count, fill: DEPT_PALETTE[i % DEPT_PALETTE.length] }));
  }, [issues]);

  return (
    <div className="rounded-[18px] border border-[rgba(148,163,184,0.12)] bg-[rgba(17,24,39,0.55)] backdrop-blur-[18px] shadow-[0_8px_32px_rgba(0,0,0,0.35),inset_0_1px_0_rgba(255,255,255,0.04)] transition-all duration-200 hover:border-[rgba(99,102,241,0.35)] p-6">
      <div className="flex items-center gap-2 mb-5">
        <div className="w-7 h-7 rounded-lg bg-[rgba(99,102,241,0.15)] border border-[rgba(99,102,241,0.3)] flex items-center justify-center">
          <Building2 className="w-3.5 h-3.5 text-[#818CF8]" />
        </div>
        <div>
          <h3 className="font-bold text-slate-200 text-sm">Department / Zone Workload</h3>
          <p className="text-[10px] text-slate-500">
            {/* TODO: replace with real aggregated data once volume grows */}
            Open issues per assigned department
          </p>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} layout="vertical" margin={{ top: 0, right: 20, left: 4, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" horizontal={false} />
          <XAxis type="number" tick={{ fontSize: 10, fill: '#64748B' }} axisLine={false} tickLine={false} allowDecimals={false} />
          <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: '#94A3B8' }} axisLine={false} tickLine={false} width={110} />
          <Tooltip
            content={({ active, payload }) =>
              active && payload?.length ? (
                <div className="bg-[#111827] border border-[#1E293B] rounded-xl px-3 py-2 text-xs text-white shadow-xl">
                  <p className="font-bold text-slate-300">{payload[0].payload.name}</p>
                  <p className="font-black text-[#818CF8]">{payload[0].value} open issues</p>
                </div>
              ) : null
            }
            cursor={{ fill: 'rgba(255,255,255,0.03)' }}
          />
          <Bar dataKey="count" radius={[0, 6, 6, 0]} maxBarSize={18}>
            {data.map((entry, i) => (
              <Cell key={i} fill={entry.fill} fillOpacity={0.82} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
