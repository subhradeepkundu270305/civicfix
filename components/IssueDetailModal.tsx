'use client';

import { useState } from 'react';
import { Issue, Status, Priority } from '@/types';
import StatusBadge from './StatusBadge';
import PriorityBadge from './PriorityBadge';
import CategoryBadge from './CategoryBadge';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, MapPin, User, Calendar, Save, Loader2,
  FileText, Image as ImageIcon, Building2, CheckCircle2,
} from 'lucide-react';
import toast from 'react-hot-toast';
import dynamic from 'next/dynamic';

const IssueMap = dynamic(() => import('./IssueMap'), { ssr: false });

const STATUSES: Status[] = ['Submitted', 'Under_Review', 'Assigned', 'In_Progress', 'Resolved', 'Rejected'];
const PRIORITIES: Priority[] = ['Low', 'Medium', 'High', 'Critical'];

interface IssueDetailModalProps {
  issue: Issue;
  onClose: () => void;
  onUpdate: (updated: Issue) => void;
}

export default function IssueDetailModal({ issue, onClose, onUpdate }: IssueDetailModalProps) {
  const [status, setStatus] = useState<Status>(issue.status);
  const [priority, setPriority] = useState<Priority>(issue.priority);
  const [assignedTo, setAssignedTo] = useState(issue.assignedTo);
  const [resolutionNotes, setResolutionNotes] = useState(issue.resolutionNotes);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/issues/${issue.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, priority, assignedTo, resolutionNotes }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      onUpdate(data.issue);
      toast.success('Issue updated successfully');
      onClose();
    } catch {
      toast.error('Failed to update issue');
    } finally {
      setSaving(false);
    }
  };

  const formattedDate = new Date(issue.createdAt).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'long', year: 'numeric',
  });

  return (
    <AnimatePresence>
      <motion.div
        key="backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#090D16]/80 backdrop-blur-md"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          key="modal"
          initial={{ opacity: 0, scale: 0.94, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 12 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="bg-[#111827] rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col border border-[#1E293B] shadow-[0_32px_80px_rgba(0,0,0,0.8)]"
        >
          {/* Header */}
          <div className="flex items-start justify-between px-6 py-5 border-b border-[#1E293B] bg-[#141C2E]">
            <div className="flex-1 min-w-0 pr-4">
              <div className="flex items-center gap-2 flex-wrap mb-2">
                <span className="text-xs text-[#818CF8] font-mono bg-[#4F46E5]/10 border border-[#4F46E5]/20 px-2 py-0.5 rounded-md">
                  {issue.id}
                </span>
                <CategoryBadge category={issue.category} />
              </div>
              <h2 className="text-lg font-bold text-[#F1F5F9] tracking-tight leading-tight">{issue.title}</h2>
            </div>
            <motion.button
              whileHover={{ scale: 1.08, rotate: 90 }}
              whileTap={{ scale: 0.92 }}
              onClick={onClose}
              className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-colors shrink-0 border border-white/10 active:scale-95"
            >
              <X className="w-4 h-4" />
            </motion.button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-6 space-y-6">

              {/* Badges */}
              <div className="flex flex-wrap gap-2">
                <StatusBadge status={issue.status} />
                <PriorityBadge priority={issue.priority} />
              </div>

              {/* Reporter + Date */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2.5 text-sm text-[#94A3B8]">
                  <div className="w-8 h-8 rounded-lg bg-[#4F46E5]/15 border border-[#4F46E5]/30 flex items-center justify-center">
                    <User className="w-4 h-4 text-[#818CF8]" />
                  </div>
                  <span><span className="text-slate-400 font-medium">Reporter:</span> {issue.reporterName}</span>
                </div>
                <div className="flex items-center gap-2.5 text-sm text-[#94A3B8]">
                  <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
                    <Calendar className="w-4 h-4 text-slate-400" />
                  </div>
                  <span>{formattedDate}</span>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
                  <FileText className="w-4 h-4 text-[#6366F1]" />
                  Description
                </div>
                <p className="text-sm text-[#94A3B8] leading-relaxed bg-[#090D16] border border-[#1E293B] rounded-xl px-4 py-3">
                  {issue.description}
                </p>
              </div>

              {/* Location */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
                  <MapPin className="w-4 h-4 text-[#6366F1]" />
                  Location
                </div>
                <p className="text-xs text-[#94A3B8] bg-[#4F46E5]/10 border border-[#4F46E5]/20 px-4 py-2.5 rounded-xl">
                  {issue.address || 'Address not specified'}
                </p>
                <IssueMap latitude={issue.latitude} longitude={issue.longitude} onLocationChange={() => {}} />
              </div>

              {/* Photo */}
              {issue.imageUrl && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
                    <ImageIcon className="w-4 h-4 text-[#6366F1]" />
                    Photo Evidence
                  </div>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={issue.imageUrl} alt="Issue photo" className="w-full max-h-56 object-cover rounded-xl border border-[#1E293B]" />
                </div>
              )}

              {/* Triage Controls */}
              <div className="border-t border-[#1E293B] pt-6 space-y-4">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-4 rounded-full bg-[#6366F1]" />
                  <h3 className="font-bold text-slate-200 text-sm">Update Triage & Assignment</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Status</label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value as Status)}
                      className="obs-input bg-[#090D16]"
                    >
                      {STATUSES.map((s) => (
                        <option key={s} value={s} className="bg-[#111827] text-white">{s.replace('_', ' ')}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Priority</label>
                    <select
                      value={priority}
                      onChange={(e) => setPriority(e.target.value as Priority)}
                      className="obs-input bg-[#090D16]"
                    >
                      {PRIORITIES.map((p) => (<option key={p} value={p} className="bg-[#111827] text-white">{p}</option>))}
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-[#6366F1]" /> Assigned Department / Officer
                  </label>
                  <input
                    type="text"
                    value={assignedTo}
                    onChange={(e) => setAssignedTo(e.target.value)}
                    placeholder="e.g. PWD Zone-3 / Public Works Dept."
                    className="obs-input bg-[#090D16]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Resolution Notes</label>
                  <textarea
                    value={resolutionNotes}
                    onChange={(e) => setResolutionNotes(e.target.value)}
                    rows={3}
                    placeholder="Add official resolution notes for the citizen..."
                    className="obs-input bg-[#090D16] resize-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-[#1E293B] bg-[#141C2E] flex items-center justify-end gap-3">
            <button
              onClick={onClose}
              className="obs-btn-ghost text-sm px-5 py-2.5"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="obs-btn-primary text-sm px-6 py-2.5 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
              {saving ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
