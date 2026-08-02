'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, RefreshCw, FileX, Loader2, ClipboardList,
  CheckCircle, Clock, AlertTriangle, Sparkles,
} from 'lucide-react';
import ReportCard from '@/components/ReportCard';
import CountUpNumber from '@/components/CountUpNumber';
import EmergencyConnect from '@/components/EmergencyConnect';
import { Issue, AuthPayload } from '@/types';
import toast from 'react-hot-toast';

export default function MyReportsPage() {
  const router = useRouter();
  const [user, setUser] = useState<AuthPayload | null>(null);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('civicfix_user');
    if (!stored) { router.push('/citizen/login'); return; }
    const parsedUser: AuthPayload = JSON.parse(stored);
    setUser(parsedUser);
    fetchIssues(parsedUser.id);
  }, [router]);

  const fetchIssues = async (reporterId: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/issues?reporterId=${reporterId}`);
      const data = await res.json();
      setIssues(data.issues || []);
    } catch {
      toast.error('Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  const counts = {
    total:      issues.length,
    resolved:   issues.filter((i) => i.status === 'Resolved').length,
    inProgress: issues.filter((i) => ['In_Progress', 'Assigned'].includes(i.status)).length,
    pending:    issues.filter((i) => ['Submitted', 'Under_Review'].includes(i.status)).length,
  };

  if (!user) return null;

  const statCards = [
    { label: 'Total Reported', value: counts.total, icon: ClipboardList, color: '#6366F1' },
    { label: 'Resolved',       value: counts.resolved, icon: CheckCircle, color: '#10B981' },
    { label: 'In Progress',    value: counts.inProgress, icon: Clock, color: '#06B6D4' },
    { label: 'Pending Review', value: counts.pending, icon: AlertTriangle, color: '#8B5CF6' },
  ];

  return (
    <div className="min-h-screen bg-[#090D16] text-[#F1F5F9]">
      {/* Header */}
      <div className="border-b border-[#1E293B] bg-[#111827]/70 backdrop-blur-xl pt-6 pb-5">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-start justify-between flex-wrap gap-3 mb-5">
            <div className="min-w-0">
              <p className="text-[#818CF8] text-[10px] sm:text-xs font-bold uppercase tracking-widest mb-0.5">Citizen Portal</p>
              <h1 className="text-xl sm:text-3xl font-extrabold text-[#F1F5F9] tracking-tight leading-tight">My Infrastructure Reports</h1>
              <p className="text-[#94A3B8] text-xs sm:text-sm mt-1">Logged in as <span className="text-slate-200 font-semibold">{user.name}</span></p>
            </div>

            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              <button
                onClick={() => fetchIssues(user.id)}
                className="obs-btn-ghost text-xs px-3 py-2"
              >
                <RefreshCw className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Refresh</span>
              </button>
              <Link href="/citizen/report" className="obs-btn-primary text-xs px-3 sm:px-4 py-2">
                <Plus className="w-4 h-4" /> <span className="hidden sm:inline">New Report</span><span className="sm:hidden">Report</span>
              </Link>
            </div>
          </div>

          {/* Stat Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {statCards.map((stat, idx) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: idx * 0.06 }}
                className="obs-card p-4 flex items-center gap-3"
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: `${stat.color}15`, border: `1px solid ${stat.color}30` }}
                >
                  <stat.icon className="w-5 h-5" style={{ color: stat.color }} />
                </div>
                <div>
                  <p className="text-2xl font-black text-white">
                    <CountUpNumber end={stat.value} duration={1200} />
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">{stat.label}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-28 gap-3">
            <Loader2 className="w-7 h-7 text-[#6366F1] animate-spin" />
            <p className="text-slate-400 text-sm">Loading your reports…</p>
          </div>
        ) : issues.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-28 text-center">
            <div className="w-16 h-16 bg-[#111827] border border-[#1E293B] rounded-2xl flex items-center justify-center mb-4">
              <FileX className="w-8 h-8 text-slate-500" />
            </div>
            <h3 className="text-lg font-bold text-white mb-1">No Reports Submitted</h3>
            <p className="text-slate-400 text-sm max-w-sm mb-6">
              You haven&apos;t filed any infrastructure damage reports yet.
            </p>
            <Link href="/citizen/report" className="obs-btn-primary">
              <Sparkles className="w-4 h-4" />
              File a Report
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <AnimatePresence mode="popLayout">
              {issues.map((issue, idx) => (
                <motion.div
                  key={issue.id}
                  layout
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.92 }}
                  transition={{ duration: 0.3, delay: idx * 0.04 }}
                >
                  <ReportCard issue={issue} index={idx} />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Emergency SOS Floating Button */}
      <EmergencyConnect />
    </div>
  );
}
