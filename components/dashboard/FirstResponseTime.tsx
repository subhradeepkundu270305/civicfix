'use client';

import { useMemo } from 'react';
import { Hourglass } from 'lucide-react';
import { Issue } from '@/types';

// TODO: replace with real triage timestamp data once reviewedAt is populated.
// Using dummy data: avg triage time = 6.4 hrs with slight per-issue variation.
const DUMMY_AVG_HRS = 6.4;

interface Props { issues: Issue[] }

export default function FirstResponseTime({ issues }: Props) {
  const avgHrs = useMemo(() => {
    const triaged = issues.filter((i) => i.reviewedAt);
    if (triaged.length >= 3) {
      const total = triaged.reduce((s, i) =>
        s + (new Date(i.reviewedAt!).getTime() - new Date(i.createdAt).getTime()) / 3600000, 0);
      return parseFloat((total / triaged.length).toFixed(1));
    }
    return DUMMY_AVG_HRS; // TODO: replace with real aggregated data once volume grows
  }, [issues]);

  const label = avgHrs >= 24
    ? `${(avgHrs / 24).toFixed(1)} days`
    : `${avgHrs} hrs`;

  const quality =
    avgHrs <= 4  ? { text: 'Excellent', color: '#10B981' } :
    avgHrs <= 12 ? { text: 'Good',      color: '#06B6D4' } :
    avgHrs <= 24 ? { text: 'Fair',      color: '#F59E0B' } :
                   { text: 'Slow',      color: '#F43F5E' };

  return (
    <div className="h-full flex flex-col justify-between rounded-[18px] border border-[rgba(148,163,184,0.12)] bg-[rgba(17,24,39,0.55)] backdrop-blur-[18px] shadow-[0_8px_32px_rgba(0,0,0,0.35),inset_0_1px_0_rgba(255,255,255,0.04)] transition-all duration-200 hover:border-[rgba(99,102,241,0.35)] p-6">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-7 h-7 rounded-lg bg-[rgba(167,139,250,0.15)] border border-[rgba(167,139,250,0.3)] flex items-center justify-center">
          <Hourglass className="w-3.5 h-3.5 text-[#A78BFA]" />
        </div>
        <h3 className="font-bold text-slate-200 text-sm">First-Response Time</h3>
      </div>

      {/* Big stat */}
      <div className="flex-1 flex flex-col justify-center">
        <p className="text-4xl font-black text-white tracking-tight">{label}</p>
        <p className="text-xs text-slate-400 mt-1 mb-4">Avg. time to first triage review</p>

        {/* Quality indicator */}
        <div
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold w-fit"
          style={{
            background: `${quality.color}18`,
            border: `1px solid ${quality.color}35`,
            color: quality.color,
          }}
        >
          <span className="w-2 h-2 rounded-full" style={{ background: quality.color }} />
          {quality.text} response rate
        </div>
      </div>

      <p className="text-[10px] text-slate-600 mt-4">
        {/* TODO: replace with real aggregated data once volume grows */}
        Based on time from &ldquo;Submitted&rdquo; → &ldquo;Under Review&rdquo;/&ldquo;Assigned&rdquo;
      </p>
    </div>
  );
}
