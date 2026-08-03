'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Layers } from 'lucide-react';
import { PRIORITY_COLORS } from './shared';
import { Issue } from '@/types';

interface Props { issues: Issue[] }

const PRIORITIES = ['Low', 'Medium', 'High', 'Critical'] as const;

export default function PriorityDistribution({ issues }: Props) {
  const data = PRIORITIES.map((p) => ({
    name: p,
    count: issues.filter((i) => i.priority === p).length,
    fill: PRIORITY_COLORS[p],
  })).filter((d) => d.count > 0);

  return (
    <div className="h-full flex flex-col rounded-[18px] border border-[rgba(148,163,184,0.12)] bg-[rgba(17,24,39,0.55)] backdrop-blur-[18px] shadow-[0_8px_32px_rgba(0,0,0,0.35),inset_0_1px_0_rgba(255,255,255,0.04)] transition-all duration-200 hover:border-[rgba(99,102,241,0.35)] hover:-translate-y-0.5 [@media(prefers-reduced-motion:reduce)]:hover:transform-none p-6">
      <div className="flex items-center gap-2 mb-5">
        <div className="w-7 h-7 rounded-lg bg-[rgba(251,146,60,0.15)] border border-[rgba(251,146,60,0.3)] flex items-center justify-center">
          <Layers className="w-3.5 h-3.5 text-[#FB923C]" />
        </div>
        <h3 className="font-bold text-slate-200 text-sm">Priority Distribution</h3>
      </div>

      <div className="flex items-center gap-4 flex-1">
        <ResponsiveContainer width="45%" height={180}>
          <PieChart>
            <Pie data={data} cx="50%" cy="50%" innerRadius={46} outerRadius={74} paddingAngle={3} dataKey="count" strokeWidth={0}>
              {data.map((entry, i) => (
                <Cell key={i} fill={entry.fill} fillOpacity={0.9} />
              ))}
            </Pie>
            <Tooltip
              content={({ active, payload }) =>
                active && payload?.length ? (
                  <div className="bg-[#111827] border border-[#1E293B] rounded-xl px-4 py-2.5 shadow-2xl text-xs text-white">
                    <p className="font-bold text-slate-300 mb-0.5">{payload[0].name}</p>
                    <p className="font-black" style={{ color: PRIORITY_COLORS[payload[0].name as string] }}>{payload[0].value} issues</p>
                  </div>
                ) : null
              }
            />
          </PieChart>
        </ResponsiveContainer>

        <div className="flex-1 space-y-2">
          {data.map((item) => (
            <div key={item.name} className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full shrink-0" style={{ background: item.fill }} />
                <span className="text-slate-400">{item.name}</span>
              </div>
              <span className="font-bold text-slate-200 tabular-nums">{item.count}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
