'use client';

import { MapPin, TrendingUp } from 'lucide-react';
import { topHotspots } from '@/data/heatmapDummyData';

export default function TopHotspots() {
  const max = topHotspots[0]?.count ?? 1;

  return (
    <div className="h-full flex flex-col rounded-[18px] border border-[rgba(148,163,184,0.12)] bg-[rgba(17,24,39,0.55)] backdrop-blur-[18px] shadow-[0_8px_32px_rgba(0,0,0,0.35),inset_0_1px_0_rgba(255,255,255,0.04)] transition-all duration-200 hover:border-[rgba(99,102,241,0.35)] p-6">
      <div className="flex items-center gap-2 mb-5">
        <div className="w-7 h-7 rounded-lg bg-[rgba(244,63,94,0.15)] border border-[rgba(244,63,94,0.3)] flex items-center justify-center">
          <TrendingUp className="w-3.5 h-3.5 text-[#F43F5E]" />
        </div>
        <div>
          <h3 className="font-bold text-slate-200 text-sm">Top 5 Hotspots</h3>
          <p className="text-[10px] text-slate-500">
            {/* TODO: replace with real aggregated data once volume grows */}
            Illustrative data
          </p>
        </div>
      </div>

      <div className="space-y-3 flex-1">
        {topHotspots.map((spot) => (
          <div key={spot.rank} className="flex items-center gap-3">
            {/* Rank badge */}
            <div
              className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black shrink-0 ${
                spot.rank === 1 ? 'bg-[rgba(244,63,94,0.2)] text-rose-400 border border-[rgba(244,63,94,0.35)]' :
                spot.rank === 2 ? 'bg-[rgba(251,146,60,0.15)] text-orange-400 border border-[rgba(251,146,60,0.3)]' :
                                  'bg-[rgba(99,102,241,0.12)] text-indigo-400 border border-[rgba(99,102,241,0.25)]'
              }`}
            >
              {spot.rank}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-start gap-1 mb-1">
                <MapPin className="w-3 h-3 text-slate-500 mt-0.5 shrink-0" />
                <p className="text-xs text-slate-300 font-medium leading-tight truncate">{spot.label}</p>
              </div>
              {/* Mini bar */}
              <div className="h-1 bg-[#1E293B] rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-rose-500 to-orange-400 transition-all duration-700"
                  style={{ width: `${(spot.count / max) * 100}%` }}
                />
              </div>
            </div>

            <span className="text-xs font-black text-rose-400 tabular-nums shrink-0">{spot.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
