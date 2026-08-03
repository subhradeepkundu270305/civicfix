'use client';

import { Issue } from '@/types';
import StatusBadge from './StatusBadge';
import PriorityBadge from './PriorityBadge';
import CategoryBadge from './CategoryBadge';
import AnimatedCard from './AnimatedCard';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Clock, MapPin, FileText, ChevronDown, ChevronUp,
  CheckCircle, Building2, Pencil, Trash2, Lock,
} from 'lucide-react';
import { useState } from 'react';

interface ReportCardProps {
  issue: Issue;
  index?: number;
  /** If provided, Edit / Delete buttons are shown (citizen view only) */
  onEdit?: (issue: Issue) => void;
  onDelete?: (issue: Issue) => void;
}

export default function ReportCard({ issue, index = 0, onEdit, onDelete }: ReportCardProps) {
  const [expanded, setExpanded] = useState(false);

  const formattedDate = new Date(issue.createdAt).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
  });

  const isResolved = issue.status === 'Resolved';
  const isEditable = ['Submitted', 'Under_Review'].includes(issue.status);

  return (
    <AnimatedCard
      delay={index * 0.06}
      tilt
      lift
      className="obs-card cursor-default overflow-hidden hover:shadow-[0_0_20px_rgba(99,102,241,0.15)] transition-all duration-300"
    >
      {/* Resolved accent glow line */}
      {isResolved && (
        <div className="h-1 w-full bg-gradient-to-r from-emerald-500 to-teal-400 shadow-[0_0_12px_rgba(16,185,129,0.6)]" />
      )}

      {/* Photo header if available */}
      {issue.imageUrl && issue.imageUrl.startsWith('data:') && (
        <div className="relative overflow-hidden h-40">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={issue.imageUrl} alt="Issue photo" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#111827] via-transparent to-transparent" />
        </div>
      )}

      <div className="p-5 space-y-3.5">
        {/* ID + Title + Status */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-mono text-[#818CF8] bg-[#4F46E5]/10 border border-[#4F46E5]/20 inline-block px-1.5 py-0.5 rounded mb-1.5">
              {issue.id}
            </p>
            <h3 className="font-bold text-[#F1F5F9] text-sm leading-snug tracking-tight line-clamp-2">
              {issue.title}
            </h3>
          </div>
          <StatusBadge status={issue.status} />
        </div>

        {/* Badges */}
        <div className="flex flex-wrap gap-1.5">
          <CategoryBadge category={issue.category} />
          <PriorityBadge priority={issue.priority} />
        </div>

        {/* Location */}
        <div className="flex items-start gap-1.5 text-xs text-[#94A3B8]">
          <MapPin className="w-3.5 h-3.5 text-[#6366F1] mt-0.5 shrink-0" />
          <span className="line-clamp-2 leading-relaxed">{issue.address || 'Location not specified'}</span>
        </div>

        {/* Footer info */}
        <div className="flex items-center justify-between text-xs text-slate-500 border-t border-[#1E293B] pt-3">
          <div className="flex items-center gap-1 text-[#94A3B8]">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            {formattedDate}
          </div>
          {issue.assignedTo && (
            <div className="flex items-center gap-1 text-amber-400 font-medium">
              <Building2 className="w-3 h-3" />
              <span className="truncate max-w-[110px]">{issue.assignedTo}</span>
            </div>
          )}
        </div>

        {/* ── Citizen action buttons ─────────────────────────────────────── */}
        {(onEdit || onDelete) && (
          <div className="flex gap-2 pt-0.5">
            {/* Edit button */}
            {onEdit && (
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onEdit(issue)}
                disabled={!isEditable}
                title={isEditable ? 'Edit report' : 'Cannot edit — report is already being processed'}
                className={`flex-1 flex items-center justify-center gap-1.5 text-xs font-semibold py-2 rounded-xl border transition-all
                  ${isEditable
                    ? 'bg-[#4F46E5]/10 border-[#4F46E5]/30 text-[#818CF8] hover:bg-[#4F46E5]/25 hover:text-white hover:border-[#6366F1]/60 shadow-sm'
                    : 'bg-white/3 border-white/5 text-slate-600 cursor-not-allowed opacity-50'
                  }`}
              >
                {isEditable ? <Pencil className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                Edit
              </motion.button>
            )}

            {/* Delete button */}
            {onDelete && (
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onDelete(issue)}
                disabled={!isEditable}
                title={isEditable ? 'Delete report' : 'Cannot delete — report is already being processed'}
                className={`flex-1 flex items-center justify-center gap-1.5 text-xs font-semibold py-2 rounded-xl border transition-all
                  ${isEditable
                    ? 'bg-rose-950/20 border-rose-500/25 text-rose-400 hover:bg-rose-600/20 hover:text-rose-300 hover:border-rose-500/50 shadow-sm'
                    : 'bg-white/3 border-white/5 text-slate-600 cursor-not-allowed opacity-50'
                  }`}
              >
                <Trash2 className="w-3.5 h-3.5" />
                Delete
              </motion.button>
            )}
          </div>
        )}

        {/* Expand button with micro-interactions */}
        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setExpanded(!expanded)}
          className="w-full flex items-center justify-center gap-1.5 text-xs text-[#818CF8] hover:text-white font-semibold py-2 rounded-xl bg-white/4 hover:bg-[#4F46E5]/20 active:scale-95 transition-all border border-white/5 hover:border-[#4F46E5]/30 shadow-sm"
        >
          {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          {expanded ? 'Hide Details' : 'View Details'}
        </motion.button>

        {/* Expanded details */}
        <AnimatePresence>
          {expanded && (
            <motion.div
              key="expanded"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="overflow-hidden"
            >
              <div className="mt-3 space-y-3 border-t border-[#1E293B] pt-3">
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    <FileText className="w-3.5 h-3.5 text-[#6366F1]" />
                    Description
                  </div>
                  <p className="text-sm text-[#94A3B8] leading-relaxed bg-[#090D16] border border-[#1E293B] rounded-xl px-3 py-2.5">
                    {issue.description}
                  </p>
                </div>

                {issue.resolutionNotes && (
                  <div className="bg-emerald-950/20 border border-emerald-500/30 rounded-xl p-3.5">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 mb-1.5">
                      <CheckCircle className="w-3.5 h-3.5" />
                      Resolution Note
                    </div>
                    <p className="text-sm text-emerald-200 leading-relaxed">{issue.resolutionNotes}</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AnimatedCard>
  );
}
