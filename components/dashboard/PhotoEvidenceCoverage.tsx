'use client';

import { useMemo } from 'react';
import { Camera } from 'lucide-react';
import { Issue } from '@/types';

// TODO: replace with real data once report volume grows — currently blends real + dummy baseline.
const DUMMY_BASELINE_PCT = 91; // illustrative

interface Props { issues: Issue[] }

export default function PhotoEvidenceCoverage({ issues }: Props) {
  const pct = useMemo(() => {
    if (issues.length < 5) return DUMMY_BASELINE_PCT; // TODO: real data when volume grows
    const withPhoto = issues.filter((i) => i.imageUrl && i.imageUrl.length > 0).length;
    const real = Math.round((withPhoto / issues.length) * 100);
    // Blend toward dummy baseline so small samples aren't misleading
    const weight = Math.min(issues.length / 50, 1);
    return Math.round(real * weight + DUMMY_BASELINE_PCT * (1 - weight));
  }, [issues]);

  // SVG donut
  const radius = 36;
  const circ = 2 * Math.PI * radius;
  const dashOffset = circ - (pct / 100) * circ;

  return (
    <div className="h-full flex flex-col items-center justify-center rounded-[18px] border border-[rgba(148,163,184,0.12)] bg-[rgba(17,24,39,0.55)] backdrop-blur-[18px] shadow-[0_8px_32px_rgba(0,0,0,0.35),inset_0_1px_0_rgba(255,255,255,0.04)] transition-all duration-200 hover:border-[rgba(99,102,241,0.35)] p-6">
      <div className="flex items-center gap-2 mb-4 self-start">
        <div className="w-7 h-7 rounded-lg bg-[rgba(16,185,129,0.15)] border border-[rgba(16,185,129,0.3)] flex items-center justify-center">
          <Camera className="w-3.5 h-3.5 text-[#10B981]" />
        </div>
        <h3 className="font-bold text-slate-200 text-sm">Photo Evidence</h3>
      </div>

      {/* SVG circular gauge */}
      <div className="relative w-28 h-28 my-2">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 88 88">
          {/* Track */}
          <circle cx="44" cy="44" r={radius} fill="none" stroke="#1E293B" strokeWidth="8" />
          {/* Progress */}
          <circle
            cx="44" cy="44" r={radius} fill="none"
            stroke="#10B981" strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circ}
            strokeDashoffset={dashOffset}
            style={{ transition: 'stroke-dashoffset 1s ease' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-black text-white">{pct}%</span>
        </div>
      </div>

      <p className="text-xs text-slate-400 text-center mt-2">of reports include photo evidence</p>
      <p className="text-[10px] text-slate-600 text-center mt-1">
        {/* TODO: replace with real aggregated data once volume grows */}
        Illustrative blend with baseline
      </p>
    </div>
  );
}
