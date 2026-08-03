'use client';

import { useMemo } from 'react';
import { seededRand } from './shared';

// TODO: replace with real timestamp-derived hour-of-day/day-of-week report data once volume grows.
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const HOURS = Array.from({ length: 24 }, (_, i) => i);

function generatePeakData(): number[][] {
  const rand = seededRand(99);
  return DAYS.map((_, d) => {
    return HOURS.map((h) => {
      // Peak: 8–11am, 6–9pm; low: midnight–5am
      let base =
        (h >= 8 && h <= 11)  ? 0.7 :
        (h >= 18 && h <= 21) ? 0.65 :
        (h >= 12 && h <= 17) ? 0.45 :
        (h >= 6 && h <= 7)   ? 0.3  :
        0.05;
      // Weekend slightly lower on weekday peaks, higher Saturday evening
      if (d >= 5) base *= (h >= 18 && h <= 21) ? 1.2 : 0.75;
      const noise = (rand() - 0.5) * 0.25;
      return Math.max(0, Math.min(1, base + noise));
    });
  });
}

const DATA = generatePeakData();

function intensityColor(v: number): string {
  // 0 → #141C2E (bg-elevated), 1 → #6366F1 (accent)
  const r = Math.round(20 + v * (99  - 20));
  const g = Math.round(28 + v * (102 - 28));
  const b = Math.round(46 + v * (241 - 46));
  return `rgb(${r},${g},${b})`;
}

export default function PeakReportingHeatmap() {
  const cells = useMemo(() => DATA, []);

  return (
    <div className="rounded-[18px] border border-[rgba(148,163,184,0.12)] bg-[rgba(17,24,39,0.55)] backdrop-blur-[18px] shadow-[0_8px_32px_rgba(0,0,0,0.35),inset_0_1px_0_rgba(255,255,255,0.04)] transition-all duration-200 hover:border-[rgba(99,102,241,0.35)] p-6">
      <div className="mb-4">
        <h3 className="font-bold text-slate-200 text-sm mb-0.5">Peak Reporting Hours</h3>
        <p className="text-[10px] text-slate-500">
          When citizens report issues — helps plan shift coverage.{' '}
          {/* TODO: replace with real aggregated data once volume grows */}
          Illustrative data.
        </p>
      </div>

      {/* Scroll hint on mobile */}
      <p className="text-[10px] text-slate-600 mb-2 sm:hidden">← scroll to see all hours →</p>

      {/* overflow-x-auto: 24-column grid won't fit mobile — make it scrollable */}
      <div className="overflow-x-auto -mx-6 px-6">
        <div className="min-w-[560px]">
          {/* Hour labels */}
          <div className="flex ml-8 mb-1">
            {HOURS.filter((h) => h % 3 === 0).map((h) => (
              <div
                key={h}
                className="text-[9px] text-slate-600 tabular-nums"
                style={{ width: `${(3 / 24) * 100}%`, textAlign: 'center' }}
              >
                {h === 0 ? '12am' : h < 12 ? `${h}am` : h === 12 ? '12pm' : `${h - 12}pm`}
              </div>
            ))}
          </div>

          {/* Grid */}
          {cells.map((row, d) => (
            <div key={d} className="flex items-center mb-0.5">
              <div className="text-[10px] text-slate-500 w-8 shrink-0">{DAYS[d]}</div>
              <div className="flex flex-1 gap-0.5">
                {row.map((val, h) => (
                  <div
                    key={h}
                    className="flex-1 h-5 rounded-[3px] cursor-default"
                    style={{ background: intensityColor(val) }}
                    title={`${DAYS[d]} ${h}:00 — intensity ${(val * 100).toFixed(0)}%`}
                  />
                ))}
              </div>
            </div>
          ))}

          {/* Legend */}
          <div className="flex items-center gap-2 mt-3 ml-8">
            <span className="text-[10px] text-slate-600">Low</span>
            <div className="flex gap-0.5">
              {[0, 0.2, 0.4, 0.6, 0.8, 1].map((v) => (
                <div key={v} className="w-6 h-2 rounded-sm" style={{ background: intensityColor(v) }} />
              ))}
            </div>
            <span className="text-[10px] text-slate-600">High</span>
          </div>
        </div>
      </div>
    </div>
  );
}
