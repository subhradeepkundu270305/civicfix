'use client';

import { useMemo } from 'react';
import { XCircle } from 'lucide-react';
import { Issue, RejectionReason } from '@/types';

// TODO: replace with real rejection reason data once rejectionReason field is populated at scale.
const REJECTION_LABELS: Record<RejectionReason, string> = {
  duplicate:           'Duplicate report',
  invalid:             'Invalid location',
  out_of_jurisdiction: 'Out of jurisdiction',
  other:               'Other reason',
};

const DUMMY_REASONS: [RejectionReason, number][] = [
  ['duplicate', 5],
  ['invalid', 3],
  ['out_of_jurisdiction', 1],
];

interface Props { issues: Issue[] }

export default function RejectionRate({ issues }: Props) {
  const { rate, reasons } = useMemo(() => {
    const total = issues.length;
    const rejected = issues.filter((i) => i.status === 'Rejected');
    const rate = total > 0 ? ((rejected.length / total) * 100).toFixed(1) : '0.0';

    // Tally real rejection reasons, fill with dummy if sparse
    const tallied: Record<string, number> = {};
    rejected.forEach((i) => {
      const key = i.rejectionReason ?? 'duplicate'; // TODO: replace dummy fallback with real data
      tallied[key] = (tallied[key] ?? 0) + 1;
    });

    const reasons: [string, number][] =
      Object.keys(tallied).length >= 2
        ? Object.entries(tallied).sort((a, b) => b[1] - a[1]).slice(0, 4)
        : DUMMY_REASONS.map(([k, v]) => [k, v]); // TODO: replace with real aggregated data once volume grows

    return { rate, reasons };
  }, [issues]);

  const maxCount = Math.max(...reasons.map(([, c]) => c), 1);

  return (
    <div className="h-full flex flex-col rounded-[18px] border border-[rgba(148,163,184,0.12)] bg-[rgba(17,24,39,0.55)] backdrop-blur-[18px] shadow-[0_8px_32px_rgba(0,0,0,0.35),inset_0_1px_0_rgba(255,255,255,0.04)] transition-all duration-200 hover:border-[rgba(99,102,241,0.35)] p-6">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-7 h-7 rounded-lg bg-[rgba(244,63,94,0.15)] border border-[rgba(244,63,94,0.3)] flex items-center justify-center">
          <XCircle className="w-3.5 h-3.5 text-[#F43F5E]" />
        </div>
        <h3 className="font-bold text-slate-200 text-sm">Rejection Rate</h3>
      </div>

      {/* Big stat */}
      <p className="text-4xl font-black text-white tracking-tight">{rate}%</p>
      <p className="text-[10px] text-slate-400 mb-5 mt-0.5">of all submitted reports rejected</p>

      {/* Reason bar-list */}
      <div className="space-y-2.5 flex-1">
        {reasons.map(([key, count]) => (
          <div key={key}>
            <div className="flex items-center justify-between text-[11px] mb-1">
              <span className="text-slate-400">{REJECTION_LABELS[key as RejectionReason] ?? key}</span>
              <span className="font-bold text-rose-400 tabular-nums">{count}</span>
            </div>
            <div className="h-1.5 bg-[#1E293B] rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-rose-600 to-rose-400 transition-all duration-700"
                style={{ width: `${(count / maxCount) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
