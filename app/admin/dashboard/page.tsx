'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheck, Search, Filter, RefreshCw, Loader2, TrendingUp,
  CheckCircle, Clock, AlertTriangle, BarChart2, ChevronLeft,
  ChevronRight, Eye, X, AlertOctagon,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts';
import { Issue, AuthPayload, Category, Status, Priority } from '@/types';
import StatusBadge from '@/components/StatusBadge';
import PriorityBadge from '@/components/PriorityBadge';
import CategoryBadge from '@/components/CategoryBadge';
import IssueDetailModal from '@/components/IssueDetailModal';
import CountUpNumber from '@/components/CountUpNumber';
import toast from 'react-hot-toast';

// ── New dashboard sub-components ────────────────────────────────────────────
import KpiCardGlass from '@/components/dashboard/KpiCardGlass';
import PriorityDistribution from '@/components/dashboard/PriorityDistribution';
import CategoryStatusStacked from '@/components/dashboard/CategoryStatusStacked';
import ReportedVsResolvedTrend from '@/components/dashboard/ReportedVsResolvedTrend';
import ResolutionTimeBreakdown from '@/components/dashboard/ResolutionTimeBreakdown';
import FirstResponseTime from '@/components/dashboard/FirstResponseTime';
import RejectionRate from '@/components/dashboard/RejectionRate';
import DepartmentWorkload from '@/components/dashboard/DepartmentWorkload';
import PhotoEvidenceCoverage from '@/components/dashboard/PhotoEvidenceCoverage';
import TopHotspots from '@/components/dashboard/TopHotspots';
import PeakReportingHeatmap from '@/components/dashboard/PeakReportingHeatmap';
import { seededRand } from '@/components/dashboard/shared';

// Dynamically import the heavy map component (no SSR)
const IndiaHeatmap = dynamic(() => import('@/components/dashboard/IndiaHeatmap'), { ssr: false });

const ITEMS_PER_PAGE = 8;

const CATEGORY_COLORS: Record<string, string> = {
  Pothole: '#f97316', Streetlight: '#eab308', Water_Leak: '#4F46E5',
  Footpath: '#0D9488', Drain: '#06b6d4', Other: '#8b5cf6',
};

// Seeded % changes so they're stable across reloads
const pctRand = seededRand(13);
function stablePct() { return parseFloat(((pctRand() - 0.45) * 30).toFixed(1)); }
const PCT_CHANGES = [stablePct(), stablePct(), stablePct(), stablePct(), stablePct()];

// SLA thresholds in days per priority
const SLA_DAYS: Record<Priority, number> = { Critical: 2, High: 5, Medium: 10, Low: 20 };

function computeOverdue(issues: Issue[]) {
  const open: Status[] = ['Submitted', 'Under_Review', 'Assigned', 'In_Progress'];
  const now = Date.now();
  const overdue = issues.filter((i) => {
    if (!open.includes(i.status)) return false;
    const ageDays = (now - new Date(i.createdAt).getTime()) / 86400000;
    return ageDays > SLA_DAYS[i.priority];
  });
  const byPriority = (['Critical', 'High', 'Medium', 'Low'] as Priority[])
    .map((p) => ({ p, n: overdue.filter((i) => i.priority === p).length }))
    .filter((x) => x.n > 0)
    .map((x) => `${x.n} ${x.p}`)
    .join(' · ');
  return { count: overdue.length, byPriority };
}

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: string }) => {
  if (active && payload?.length) {
    return (
      <div className="bg-[#111827] border border-[#1E293B] rounded-xl px-4 py-2.5 shadow-2xl text-xs text-white">
        <p className="font-bold text-slate-300 mb-0.5">{label}</p>
        <p className="text-[#818CF8] font-black">{payload[0].value} issues</p>
      </div>
    );
  }
  return null;
};

export default function AdminDashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<AuthPayload | null>(null);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [filtered, setFiltered] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<Status | ''>('');
  const [filterCategory, setFilterCategory] = useState<Category | ''>('');
  const [filterPriority, setFilterPriority] = useState<Priority | ''>('');

  useEffect(() => {
    const stored = localStorage.getItem('civicfix_user');
    if (!stored) { router.push('/admin/login'); return; }
    const parsed: AuthPayload = JSON.parse(stored);
    if (parsed.role !== 'admin') { router.push('/admin/login'); return; }
    setUser(parsed);
    fetchIssues();
  }, [router]);

  const fetchIssues = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/issues');
      const data = await res.json();
      setIssues(data.issues || []);
    } catch { toast.error('Failed to load issues'); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    let result = [...issues];
    if (filterStatus) result = result.filter((i) => i.status === filterStatus);
    if (filterCategory) result = result.filter((i) => i.category === filterCategory);
    if (filterPriority) result = result.filter((i) => i.priority === filterPriority);
    if (search) {
      const q = search.toLowerCase();
      result = result.filter((i) =>
        i.title.toLowerCase().includes(q) || i.id.toLowerCase().includes(q) ||
        i.address.toLowerCase().includes(q) || i.reporterName.toLowerCase().includes(q)
      );
    }
    setFiltered(result);
    setCurrentPage(1);
  }, [issues, search, filterStatus, filterCategory, filterPriority]);

  const handleIssueUpdate = useCallback((updated: Issue) => {
    setIssues((prev) => prev.map((i) => (i.id === updated.id ? updated : i)));
  }, []);

  const kpi = {
    total:      issues.length,
    resolved:   issues.filter((i) => i.status === 'Resolved').length,
    inProgress: issues.filter((i) => i.status === 'In_Progress').length,
    critical:   issues.filter((i) => i.priority === 'Critical').length,
    avgDays: (() => {
      const r = issues.filter((i) => i.status === 'Resolved');
      if (!r.length) return 0;
      return parseFloat((r.reduce((s, i) =>
        s + (new Date(i.updatedAt).getTime() - new Date(i.createdAt).getTime()) / 86400000, 0) / r.length).toFixed(1));
    })(),
  };

  const overdue = computeOverdue(issues);

  const categoryChartData = Object.keys(CATEGORY_COLORS).map((cat) => ({
    name: cat.replace('_', ' '), count: issues.filter((i) => i.category === cat).length,
    fill: CATEGORY_COLORS[cat],
  }));

  const statusChartData = [
    { name: 'Submitted',    count: issues.filter((i) => i.status === 'Submitted').length,    fill: '#818CF8' },
    { name: 'Under Review', count: issues.filter((i) => i.status === 'Under_Review').length,  fill: '#A78BFA' },
    { name: 'Assigned',     count: issues.filter((i) => i.status === 'Assigned').length,      fill: '#FCD34D' },
    { name: 'In Progress',  count: issues.filter((i) => i.status === 'In_Progress').length,   fill: '#06B6D4' },
    { name: 'Resolved',     count: issues.filter((i) => i.status === 'Resolved').length,      fill: '#10B981' },
    { name: 'Rejected',     count: issues.filter((i) => i.status === 'Rejected').length,      fill: '#F43F5E' },
  ].filter((d) => d.count > 0);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
  const clearFilters = () => { setSearch(''); setFilterStatus(''); setFilterCategory(''); setFilterPriority(''); };
  const hasFilters = !!(search || filterStatus || filterCategory || filterPriority);

  if (!user) return null;

  // Glass panel base classes
  const glass = 'rounded-[18px] border border-[rgba(148,163,184,0.12)] bg-[rgba(17,24,39,0.55)] backdrop-blur-[18px] shadow-[0_8px_32px_rgba(0,0,0,0.35),inset_0_1px_0_rgba(255,255,255,0.04)] transition-all duration-200 hover:border-[rgba(99,102,241,0.35)]';

  return (
    <div className="min-h-screen bg-[#090D16] text-[#F1F5F9] relative overflow-x-hidden">
      {/* ── Ambient glow backdrop ── */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute top-[-20%] left-[20%] w-[600px] h-[600px] rounded-full bg-[rgba(99,102,241,0.08)] blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[10%] w-[500px] h-[500px] rounded-full bg-[rgba(6,182,212,0.06)] blur-[120px]" />
      </div>

      {/* ── Header ── */}
      <div className="relative border-b border-[#1E293B] bg-[rgba(17,24,39,0.70)] backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-5 pb-4 sm:py-8">
          <div className="flex items-center justify-between flex-wrap gap-3 mb-6 sm:mb-8">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 sm:w-10 sm:h-10 shrink-0 rounded-xl bg-[#4F46E5]/15 border border-[#4F46E5]/30 flex items-center justify-center shadow-[0_0_16px_rgba(99,102,241,0.25)]">
                <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5 text-[#818CF8]" />
              </div>
              <div className="min-w-0">
                <h1 className="text-lg sm:text-2xl font-extrabold text-white tracking-tight leading-tight">Authority Dashboard</h1>
                <p className="text-slate-400 text-[11px] sm:text-xs truncate">{user.name} · Municipal Officer</p>
              </div>
            </div>
            <button onClick={fetchIssues} className="obs-btn-ghost text-xs px-3 py-2 shrink-0">
              <RefreshCw className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>

          {/* ── KPI Row (5 cards) — 2-col on mobile, 3-col on sm, 5-col on lg ── */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3">
            <KpiCardGlass label="Total Issues"  value={kpi.total}      sub="All time reported"       icon={TrendingUp}    color="#6366F1" pctChange={PCT_CHANGES[0]} delay={0}    />
            <KpiCardGlass label="Resolved"      value={kpi.resolved}   sub={`${kpi.total ? Math.round((kpi.resolved/kpi.total)*100) : 0}% completion`} icon={CheckCircle}   color="#10B981" pctChange={PCT_CHANGES[1]} delay={0.06} />
            <KpiCardGlass label="In Progress"   value={kpi.inProgress} sub="Active repair work"      icon={Clock}         color="#06B6D4" pctChange={PCT_CHANGES[2]} delay={0.12} />
            <KpiCardGlass label="Critical"      value={kpi.critical}   sub={`Avg ${kpi.avgDays}d resolve`} icon={AlertTriangle}  color="#F43F5E" pctChange={PCT_CHANGES[3]} delay={0.18} />
            <KpiCardGlass
              label="Overdue / SLA" value={overdue.count}
              sub={overdue.byPriority || 'All within SLA'}
              icon={AlertOctagon} color="#F43F5E"
              pctChange={PCT_CHANGES[4]} delay={0.24}
              accentBorder
            />
          </div>
        </div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

        {/* ── 3-Chart Row ── */}
        {!loading && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Issues by Category */}
            <div className={`${glass} p-6`}>
              <div className="flex items-center gap-2 mb-5">
                <div className="w-7 h-7 rounded-lg bg-[#4F46E5]/15 border border-[#4F46E5]/30 flex items-center justify-center backdrop-blur-[8px]">
                  <BarChart2 className="w-3.5 h-3.5 text-[#818CF8]" />
                </div>
                <h3 className="font-bold text-slate-200 text-sm">Issues by Category</h3>
              </div>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={categoryChartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                  <Bar dataKey="count" radius={[6, 6, 0, 0]} maxBarSize={40}>
                    {categoryChartData.map((entry, i) => <Cell key={i} fill={entry.fill} fillOpacity={0.88} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Status Distribution */}
            <div className={`${glass} p-6`}>
              <div className="flex items-center gap-2 mb-5">
                <div className="w-7 h-7 rounded-lg bg-[#06B6D4]/15 border border-[#06B6D4]/30 flex items-center justify-center backdrop-blur-[8px]">
                  <TrendingUp className="w-3.5 h-3.5 text-[#22D3EE]" />
                </div>
                <h3 className="font-bold text-slate-200 text-sm">Status Distribution</h3>
              </div>
              <div className="flex items-center gap-4">
                <ResponsiveContainer width="45%" height={180}>
                  <PieChart>
                    <Pie data={statusChartData} cx="50%" cy="50%" innerRadius={46} outerRadius={74} paddingAngle={3} dataKey="count" strokeWidth={0}>
                      {statusChartData.map((entry, i) => <Cell key={i} fill={entry.fill} fillOpacity={0.9} />)}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex-1 space-y-2">
                  {statusChartData.map((item) => (
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

            {/* Priority Distribution */}
            <PriorityDistribution issues={issues} />
          </div>
        )}

        {/* ── Category × Status Stacked ── */}
        {!loading && <CategoryStatusStacked issues={issues} />}

        {/* ── Reported vs Resolved Trend ── */}
        <ReportedVsResolvedTrend />

        {/* ── 3-small-card Row ── */}
        {!loading && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <ResolutionTimeBreakdown issues={issues} />
            <FirstResponseTime issues={issues} />
            <RejectionRate issues={issues} />
          </div>
        )}

        {/* ── Department + Photo Evidence ── */}
        {!loading && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2"><DepartmentWorkload issues={issues} /></div>
            <PhotoEvidenceCoverage issues={issues} />
          </div>
        )}

        {/* ── India Heatmap + Top Hotspots — stacks on mobile ── */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-4 lg:gap-6">
          <div className="min-w-0 overflow-hidden"><IndiaHeatmap /></div>
          <TopHotspots />
        </div>

        {/* ── Peak Reporting Heatmap ── */}
        <PeakReportingHeatmap />

        {/* ── Filter & Search (unchanged) ── */}
        <div className="obs-glass-card p-5 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.4)]">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-4 h-4 text-[#818CF8]" />
            <h3 className="font-semibold text-[#F1F5F9] text-sm tracking-tight">Filter &amp; Search</h3>
            {hasFilters && (
              <button onClick={clearFilters} className="ml-auto flex items-center gap-1 text-xs text-[#FB7185] hover:text-rose-400 font-semibold px-2.5 py-1 rounded-lg bg-rose-500/10 border border-rose-500/20 active:scale-95 transition-all">
                <X className="w-3 h-3" /> Clear all
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="relative sm:col-span-2 lg:col-span-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search ID, title, location…" className="obs-input pl-9" />
            </div>
            {([
              { value: filterStatus,   set: setFilterStatus,   options: ['Submitted','Under_Review','Assigned','In_Progress','Resolved','Rejected'], placeholder: 'All Statuses' },
              { value: filterCategory, set: setFilterCategory, options: ['Pothole','Streetlight','Water_Leak','Footpath','Drain','Other'],            placeholder: 'All Categories' },
              { value: filterPriority, set: setFilterPriority, options: ['Low','Medium','High','Critical'],                                           placeholder: 'All Priorities' },
            ] as { value: string; set: (v: string) => void; options: string[]; placeholder: string }[]).map(({ value, set, options, placeholder }) => (
              <select key={placeholder} value={value} onChange={(e) => set(e.target.value)} className="obs-input text-[#94A3B8]">
                <option value="" className="bg-[#111827]">{placeholder}</option>
                {options.map((o) => <option key={o} value={o} className="bg-[#111827]">{o.replace('_', ' ')}</option>)}
              </select>
            ))}
          </div>
          <p className="text-xs text-[#94A3B8] mt-3">
            Showing <span className="font-semibold text-slate-200">{filtered.length}</span> of{' '}
            <span className="font-semibold text-slate-200">{issues.length}</span> issues
          </p>
        </div>

        {/* ── Issues Table (unchanged) ── */}
        <div className="obs-card overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-24"><Loader2 className="w-7 h-7 text-[#6366F1] animate-spin" /></div>
          ) : paginated.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <Search className="w-8 h-8 text-slate-600 mb-3" />
              <p className="text-slate-400 font-semibold mb-2">No issues match filters</p>
              <button onClick={clearFilters} className="text-xs text-[#818CF8] underline">Clear filters</button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#1E293B] bg-[#141C2E]">
                    {['ID / Title', 'Category', 'Status', 'Priority', 'Reporter', 'Date', 'Action'].map((h) => (
                      <th key={h} className="text-left px-5 py-3.5 text-xs font-bold text-slate-400 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1E293B]">
                  <AnimatePresence mode="popLayout">
                    {paginated.map((issue, idx) => (
                      <motion.tr key={issue.id} layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25, delay: idx * 0.03 }} className="hover:bg-[#162032] transition-colors cursor-pointer group" onClick={() => setSelectedIssue(issue)}>
                        <td className="px-5 py-4">
                          <p className="text-[10px] font-mono text-[#818CF8] bg-[#4F46E5]/10 border border-[#4F46E5]/20 inline-block px-1.5 py-0.5 rounded mb-1">{issue.id}</p>
                          <p className="font-semibold text-[#F1F5F9] truncate max-w-[220px] group-hover:text-[#818CF8] transition-colors tracking-tight">{issue.title}</p>
                        </td>
                        <td className="px-4 py-4"><CategoryBadge category={issue.category} /></td>
                        <td className="px-4 py-4"><StatusBadge status={issue.status} /></td>
                        <td className="px-4 py-4"><PriorityBadge priority={issue.priority} /></td>
                        <td className="px-4 py-4 text-xs text-[#94A3B8]">{issue.reporterName}</td>
                        <td className="px-4 py-4 text-xs text-slate-500 tabular-nums">
                          {new Date(issue.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                        </td>
                        <td className="px-4 py-4">
                          <button onClick={(e) => { e.stopPropagation(); setSelectedIssue(issue); }} className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#4F46E5]/15 hover:bg-[#4F46E5]/30 text-[#818CF8] hover:text-white text-xs font-semibold rounded-lg transition-all border border-[#4F46E5]/30 hover:border-[#6366F1]/50 active:scale-95 shadow-[0_0_12px_rgba(99,102,241,0.15)]">
                            <Eye className="w-3.5 h-3.5" /> Review
                          </button>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2">
            <button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1} className="w-9 h-9 flex items-center justify-center rounded-xl border border-[#1E293B] text-slate-400 hover:bg-[#111827] disabled:opacity-40 transition-all">
              <ChevronLeft className="w-4 h-4" />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button key={page} onClick={() => setCurrentPage(page)} className={`w-9 h-9 flex items-center justify-center rounded-xl text-sm font-bold transition-all ${currentPage === page ? 'bg-gradient-to-r from-[#4F46E5] to-[#3B82F6] text-white shadow-[0_0_16px_rgba(99,102,241,0.35)]' : 'border border-[#1E293B] text-slate-400 hover:bg-[#111827]'}`}>{page}</button>
            ))}
            <button onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="w-9 h-9 flex items-center justify-center rounded-xl border border-[#1E293B] text-slate-400 hover:bg-[#111827] disabled:opacity-40 transition-all">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {selectedIssue && (
        <IssueDetailModal issue={selectedIssue} onClose={() => setSelectedIssue(null)} onUpdate={handleIssueUpdate} />
      )}
    </div>
  );
}
