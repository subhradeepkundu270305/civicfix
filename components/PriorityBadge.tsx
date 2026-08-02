import { Priority } from '@/types';

interface Cfg { label: string; icon: string; bg: string; txt: string; bdr: string; }

const cfg: Record<Priority, Cfg> = {
  Low:      { label: 'Low',      icon: '▼', bg: 'rgba(16,185,129,0.10)',  txt: '#34D399', bdr: 'rgba(16,185,129,0.28)' },
  Medium:   { label: 'Medium',   icon: '●', bg: 'rgba(245,158,11,0.10)',  txt: '#FCD34D', bdr: 'rgba(245,158,11,0.28)' },
  High:     { label: 'High',     icon: '▲', bg: 'rgba(249,115,22,0.10)',  txt: '#FB923C', bdr: 'rgba(249,115,22,0.28)' },
  Critical: { label: 'Critical', icon: '⚡', bg: 'rgba(244,63,94,0.10)',  txt: '#FB7185', bdr: 'rgba(244,63,94,0.28)' },
};

export default function PriorityBadge({ priority }: { priority: Priority }) {
  const c = cfg[priority];
  return (
    <span
      className="pill-glow"
      style={{ background: c.bg, color: c.txt, borderColor: c.bdr }}
    >
      <span className="text-[9px] leading-none">{c.icon}</span>
      {c.label}
    </span>
  );
}
