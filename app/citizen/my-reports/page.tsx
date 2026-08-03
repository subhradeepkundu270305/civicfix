'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, RefreshCw, FileX, Loader2, ClipboardList,
  CheckCircle, Clock, AlertTriangle, Sparkles,
  Pencil, Trash2, X, Save, AlertCircle, MapPin, Camera,
} from 'lucide-react';
import ReportCard from '@/components/ReportCard';
import CountUpNumber from '@/components/CountUpNumber';
import EmergencyConnect from '@/components/EmergencyConnect';
import { Issue, AuthPayload, Category } from '@/types';
import toast from 'react-hot-toast';

// ─── constants ────────────────────────────────────────────────────────────────
const CATEGORIES: { value: Category; label: string; icon: string }[] = [
  { value: 'Pothole',     label: 'Pothole',     icon: '🕳️' },
  { value: 'Streetlight', label: 'Streetlight', icon: '💡' },
  { value: 'Water_Leak',  label: 'Water Leak',  icon: '💧' },
  { value: 'Footpath',    label: 'Footpath',    icon: '🚶' },
  { value: 'Drain',       label: 'Open Drain',  icon: '🌊' },
  { value: 'Other',       label: 'Other',       icon: '⚠️' },
];

export default function MyReportsPage() {
  const router = useRouter();
  const [user, setUser] = useState<AuthPayload | null>(null);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);

  // ── Edit state ──────────────────────────────────────────────────────────────
  const [editTarget, setEditTarget] = useState<Issue | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editCategory, setEditCategory] = useState<Category>('Pothole');
  const [editDescription, setEditDescription] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [editSaving, setEditSaving] = useState(false);

  // ── Delete state ────────────────────────────────────────────────────────────
  const [deleteTarget, setDeleteTarget] = useState<Issue | null>(null);
  const [deleteConfirming, setDeleteConfirming] = useState(false);

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

  // ── Open edit modal ─────────────────────────────────────────────────────────
  const openEdit = (issue: Issue) => {
    setEditTarget(issue);
    setEditTitle(issue.title);
    setEditCategory(issue.category);
    setEditDescription(issue.description);
    setEditAddress(issue.address);
  };

  const closeEdit = () => {
    setEditTarget(null);
  };

  const handleEditSave = async () => {
    if (!editTarget || !user) return;
    if (!editTitle.trim() || !editDescription.trim() || !editAddress.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }
    setEditSaving(true);
    try {
      const res = await fetch(`/api/issues/${editTarget.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reporterId: user.id,
          title: editTitle.trim(),
          category: editCategory,
          description: editDescription.trim(),
          address: editAddress.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update report');
      // Update local state
      setIssues((prev) =>
        prev.map((i) => (i.id === editTarget.id ? data.issue : i))
      );
      toast.success('Report updated successfully!');
      closeEdit();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Update failed');
    } finally {
      setEditSaving(false);
    }
  };

  // ── Delete flow ─────────────────────────────────────────────────────────────
  const openDelete = (issue: Issue) => {
    setDeleteTarget(issue);
  };

  const closeDelete = () => {
    setDeleteTarget(null);
    setDeleteConfirming(false);
  };

  const handleDelete = async () => {
    if (!deleteTarget || !user) return;
    setDeleteConfirming(true);
    try {
      const res = await fetch(
        `/api/issues/${deleteTarget.id}?reporterId=${user.id}`,
        { method: 'DELETE' }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete report');
      setIssues((prev) => prev.filter((i) => i.id !== deleteTarget.id));
      toast.success('Report deleted.');
      closeDelete();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Delete failed');
    } finally {
      setDeleteConfirming(false);
    }
  };

  // ── Stats ───────────────────────────────────────────────────────────────────
  const counts = {
    total:      issues.length,
    resolved:   issues.filter((i) => i.status === 'Resolved').length,
    inProgress: issues.filter((i) => ['In_Progress', 'Assigned'].includes(i.status)).length,
    pending:    issues.filter((i) => ['Submitted', 'Under_Review'].includes(i.status)).length,
  };

  if (!user) return null;

  const statCards = [
    { label: 'Total Reported', value: counts.total,      icon: ClipboardList, color: '#6366F1' },
    { label: 'Resolved',       value: counts.resolved,   icon: CheckCircle,   color: '#10B981' },
    { label: 'In Progress',    value: counts.inProgress,  icon: Clock,         color: '#06B6D4' },
    { label: 'Pending Review', value: counts.pending,    icon: AlertTriangle, color: '#8B5CF6' },
  ];

  return (
    <div className="min-h-screen bg-[#090D16] text-[#F1F5F9]">
      {/* ── Header ──────────────────────────────────────────────────────── */}
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

      {/* ── Grid ────────────────────────────────────────────────────────── */}
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
                  <ReportCard
                    issue={issue}
                    index={idx}
                    onEdit={openEdit}
                    onDelete={openDelete}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* ── Edit Modal ──────────────────────────────────────────────────── */}
      <AnimatePresence>
        {editTarget && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Backdrop */}
            <motion.div
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
              onClick={closeEdit}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />

            {/* Panel */}
            <motion.div
              className="relative w-full max-w-lg bg-[#111827] border border-[#1E293B] rounded-2xl shadow-2xl overflow-hidden"
              initial={{ opacity: 0, scale: 0.93, y: 24 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.93, y: 24 }}
              transition={{ type: 'spring', stiffness: 340, damping: 30 }}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-[#1E293B] bg-[#0D1420]">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#4F46E5]/15 border border-[#4F46E5]/30 flex items-center justify-center">
                    <Pencil className="w-4 h-4 text-[#818CF8]" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-white">Edit Report</h2>
                    <p className="text-[10px] text-slate-500 font-mono">{editTarget.id}</p>
                  </div>
                </div>
                <button
                  onClick={closeEdit}
                  className="p-1.5 rounded-lg hover:bg-white/8 text-slate-400 hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Body */}
              <div className="px-6 py-5 space-y-5 max-h-[70vh] overflow-y-auto">
                {/* Info note */}
                <div className="flex items-start gap-2.5 bg-[#4F46E5]/8 border border-[#4F46E5]/20 rounded-xl px-4 py-3">
                  <AlertCircle className="w-4 h-4 text-[#818CF8] mt-0.5 shrink-0" />
                  <p className="text-xs text-slate-400 leading-relaxed">
                    You can only edit reports with <strong className="text-slate-300">Submitted</strong> or <strong className="text-slate-300">Under Review</strong> status. Once processing begins, changes are locked.
                  </p>
                </div>

                {/* Category */}
                <div className="space-y-2">
                  <label className="obs-label flex items-center gap-1.5">
                    <Camera className="w-3.5 h-3.5 text-[#6366F1]" /> Category
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {CATEGORIES.map((cat) => (
                      <button
                        key={cat.value}
                        type="button"
                        onClick={() => setEditCategory(cat.value)}
                        className={`p-2.5 rounded-xl border text-center transition-all ${
                          editCategory === cat.value
                            ? 'bg-[#4F46E5]/20 border-[#6366F1] text-white shadow-[0_0_12px_rgba(99,102,241,0.2)]'
                            : 'bg-[#090D16] border-[#1E293B] text-slate-400 hover:border-slate-600 hover:text-slate-200'
                        }`}
                      >
                        <div className="text-base mb-0.5">{cat.icon}</div>
                        <div className="text-[10px] font-semibold">{cat.label}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Title */}
                <div className="space-y-1.5">
                  <label className="obs-label">Issue Title *</label>
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    required
                    className="obs-input"
                    placeholder="Brief description of the issue"
                  />
                </div>

                {/* Description */}
                <div className="space-y-1.5">
                  <label className="obs-label">Detailed Description *</label>
                  <textarea
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    required
                    rows={4}
                    className="obs-input resize-none"
                    placeholder="Describe the issue in detail..."
                  />
                </div>

                {/* Address */}
                <div className="space-y-1.5">
                  <label className="obs-label flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#6366F1]" /> Address / Location *
                  </label>
                  <input
                    type="text"
                    value={editAddress}
                    onChange={(e) => setEditAddress(e.target.value)}
                    required
                    className="obs-input"
                    placeholder="Specific address or landmark"
                  />
                </div>
              </div>

              {/* Footer */}
              <div className="px-6 py-4 border-t border-[#1E293B] bg-[#0D1420] flex gap-3 justify-end">
                <button onClick={closeEdit} className="obs-btn-ghost text-sm px-4 py-2">
                  Cancel
                </button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleEditSave}
                  disabled={editSaving}
                  className="obs-btn-primary text-sm px-5 py-2 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {editSaving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  {editSaving ? 'Saving…' : 'Save Changes'}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Delete Confirm Modal ─────────────────────────────────────────── */}
      <AnimatePresence>
        {deleteTarget && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Backdrop */}
            <motion.div
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
              onClick={closeDelete}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />

            {/* Panel */}
            <motion.div
              className="relative w-full max-w-sm bg-[#111827] border border-rose-500/20 rounded-2xl shadow-[0_0_40px_rgba(239,68,68,0.15)] overflow-hidden"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', stiffness: 380, damping: 30 }}
            >
              <div className="p-6 text-center space-y-4">
                {/* Icon */}
                <div className="w-14 h-14 rounded-full bg-rose-950/40 border border-rose-500/30 flex items-center justify-center mx-auto shadow-[0_0_20px_rgba(239,68,68,0.2)]">
                  <Trash2 className="w-7 h-7 text-rose-400" />
                </div>

                <div>
                  <h3 className="text-lg font-bold text-white mb-1">Delete Report?</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">
                    Are you sure you want to delete{' '}
                    <span className="text-rose-300 font-semibold">&ldquo;{deleteTarget.title}&rdquo;</span>?
                    This action cannot be undone.
                  </p>
                </div>

                <div className="bg-rose-950/20 border border-rose-500/20 rounded-xl px-4 py-2.5 text-left">
                  <p className="text-[11px] text-rose-300 font-mono">{deleteTarget.id}</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">{deleteTarget.address}</p>
                </div>

                <div className="flex gap-3 pt-1">
                  <button
                    onClick={closeDelete}
                    className="flex-1 obs-btn-ghost text-sm py-2.5"
                  >
                    Cancel
                  </button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={handleDelete}
                    disabled={deleteConfirming}
                    className="flex-1 flex items-center justify-center gap-2 text-sm font-semibold py-2.5 px-4 rounded-xl
                      bg-rose-600/80 hover:bg-rose-500 border border-rose-500/50 text-white shadow-[0_0_16px_rgba(239,68,68,0.3)]
                      disabled:opacity-60 disabled:cursor-not-allowed transition-all"
                  >
                    {deleteConfirming ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                    {deleteConfirming ? 'Deleting…' : 'Yes, Delete'}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Emergency SOS Floating Button */}
      <EmergencyConnect />
    </div>
  );
}
