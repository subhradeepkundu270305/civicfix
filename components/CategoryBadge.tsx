import { Category } from '@/types';

const cfg: Record<Category, { label: string; emoji: string; txt: string; bdr: string; bg: string }> = {
  Pothole:    { label: 'Pothole',    emoji: '🕳️', bg: 'rgba(120,113,108,0.12)', txt: '#A8A29E', bdr: 'rgba(120,113,108,0.25)' },
  Streetlight:{ label: 'Streetlight',emoji: '💡', bg: 'rgba(234,179,8,0.10)',   txt: '#FACC15', bdr: 'rgba(234,179,8,0.25)'   },
  Water_Leak: { label: 'Water Leak', emoji: '💧', bg: 'rgba(59,130,246,0.10)',  txt: '#60A5FA', bdr: 'rgba(59,130,246,0.25)'  },
  Footpath:   { label: 'Footpath',   emoji: '🚶', bg: 'rgba(20,184,166,0.10)',  txt: '#2DD4BF', bdr: 'rgba(20,184,166,0.25)'  },
  Drain:      { label: 'Open Drain', emoji: '🌊', bg: 'rgba(6,182,212,0.10)',   txt: '#22D3EE', bdr: 'rgba(6,182,212,0.25)'   },
  Other:      { label: 'Other',      emoji: '⚠️', bg: 'rgba(99,102,241,0.10)',  txt: '#818CF8', bdr: 'rgba(99,102,241,0.25)'  },
};

export default function CategoryBadge({ category }: { category: Category }) {
  const c = cfg[category];
  return (
    <span
      className="pill-glow"
      style={{ background: c.bg, color: c.txt, borderColor: c.bdr }}
    >
      <span className="text-sm leading-none">{c.emoji}</span>
      {c.label}
    </span>
  );
}
