'use client';

// ─── Shared dashboard utility data & helpers ─────────────────────────────────

export const STATUS_COLORS: Record<string, string> = {
  Submitted:    '#818CF8',
  Under_Review: '#A78BFA',
  Assigned:     '#FCD34D',
  In_Progress:  '#06B6D4',
  Resolved:     '#10B981',
  Rejected:     '#F43F5E',
};

export const PRIORITY_COLORS: Record<string, string> = {
  Low:      '#94A3B8',
  Medium:   '#F59E0B',
  High:     '#FB923C',
  Critical: '#F43F5E',
};

export const CATEGORY_COLORS: Record<string, string> = {
  Pothole:     '#f97316',
  Streetlight: '#eab308',
  Water_Leak:  '#4F46E5',
  Footpath:    '#0D9488',
  Drain:       '#06b6d4',
  Other:       '#8b5cf6',
};

// Seeded deterministic pseudo-random (stable across reloads)
export function seededRand(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

export const glassPanelClass =
  'rounded-[18px] border border-[rgba(148,163,184,0.12)] ' +
  'bg-[rgba(17,24,39,0.55)] backdrop-blur-[18px] ' +
  'shadow-[0_8px_32px_rgba(0,0,0,0.35),inset_0_1px_0_rgba(255,255,255,0.04)] ' +
  'transition-[border-color,transform] duration-200 ease-out ' +
  'hover:border-[rgba(99,102,241,0.35)] hover:[-translate-y-0.5] ' +
  '@media(prefers-reduced-motion:reduce){transform:none!important}';
