import { Status } from '@/types';

interface Cfg {
  label: string;
  bg: string; txt: string; bdr: string;
  dot: string; pulse?: boolean;
}

const cfg: Record<Status, Cfg> = {
  Submitted:   { label: 'Submitted',   bg: 'rgba(99,102,241,0.10)',  txt: '#818CF8', bdr: 'rgba(99,102,241,0.25)',  dot: '#6366F1' },
  Under_Review:{ label: 'Under Review',bg: 'rgba(139,92,246,0.10)',  txt: '#A78BFA', bdr: 'rgba(139,92,246,0.25)',  dot: '#8B5CF6' },
  Assigned:    { label: 'Assigned',    bg: 'rgba(245,158,11,0.10)',  txt: '#FCD34D', bdr: 'rgba(245,158,11,0.25)',  dot: '#F59E0B' },
  In_Progress: { label: 'In Progress', bg: 'rgba(6,182,212,0.10)',   txt: '#22D3EE', bdr: 'rgba(6,182,212,0.25)',   dot: '#06B6D4', pulse: true },
  Resolved:    { label: 'Resolved',    bg: 'rgba(16,185,129,0.10)',  txt: '#34D399', bdr: 'rgba(16,185,129,0.25)',  dot: '#10B981' },
  Rejected:    { label: 'Rejected',    bg: 'rgba(244,63,94,0.10)',   txt: '#FB7185', bdr: 'rgba(244,63,94,0.25)',   dot: '#F43F5E' },
};

export default function StatusBadge({ status }: { status: Status }) {
  const c = cfg[status] || cfg.Submitted;
  return (
    <span
      className="pill-glow shadow-[0_0_12px_rgba(0,0,0,0.3)]"
      style={{ background: c.bg, color: c.txt, borderColor: c.bdr }}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${c.pulse ? 'animate-pulse' : ''}`}
        style={{ background: c.dot, boxShadow: `0 0 8px ${c.dot}` }}
      />
      {c.label}
    </span>
  );
}

