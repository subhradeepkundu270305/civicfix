'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import {
  MapPin, Camera, AlertTriangle, Send, Loader2, X, CheckCircle2, User, Lock,
} from 'lucide-react';
import { Category, Priority, AuthPayload } from '@/types';
import toast from 'react-hot-toast';

const IssueMap = dynamic(() => import('./IssueMap'), { ssr: false });

const CATEGORIES: { value: Category; label: string; icon: string }[] = [
  { value: 'Pothole',    label: 'Pothole',    icon: '🕳️' },
  { value: 'Streetlight',label: 'Streetlight',icon: '💡' },
  { value: 'Water_Leak', label: 'Water Leak', icon: '💧' },
  { value: 'Footpath',   label: 'Footpath',   icon: '🚶' },
  { value: 'Drain',      label: 'Open Drain', icon: '🌊' },
  { value: 'Other',      label: 'Other',      icon: '⚠️' },
];

const PRIORITIES: { value: Priority; label: string; desc: string }[] = [
  { value: 'Low',     label: 'Low',     desc: 'Minor issue, non-urgent' },
  { value: 'Medium',  label: 'Medium',  desc: 'Requires attention soon' },
  { value: 'High',    label: 'High',    desc: 'Impacts safety / movement' },
  { value: 'Critical',label: 'Critical',desc: 'Immediate hazard / emergency' },
];

export default function ReportForm() {
  const router = useRouter();
  const [user, setUser] = useState<AuthPayload | null>(null);

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<Category>('Pothole');
  const [priority, setPriority] = useState<Priority>('Medium');
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('');
  const [latitude, setLatitude] = useState(28.6139);
  const [longitude, setLongitude] = useState(77.2090);
  const [imageUrl, setImageUrl] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('civicfix_user');
    if (stored) setUser(JSON.parse(stored));
  }, []);

  const handleLocationChange = (lat: number, lng: number, addr?: string) => {
    setLatitude(lat);
    setLongitude(lng);
    if (addr) setAddress(addr);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be under 5MB');
      return;
    }
    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setImageUrl(data.url);
      toast.success('Photo uploaded!');
    } catch {
      toast.error('Failed to upload image');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please log in to submit a report');
      router.push('/citizen/login');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch('/api/issues', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          category,
          priority,
          description,
          address,
          latitude,
          longitude,
          imageUrl,
          reporterName: user.name,
          reporterEmail: user.email,
          reporterId: user.id,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSubmitted(true);
      toast.success('Report submitted successfully!');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to submit report');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="obs-card p-8 text-center space-y-5"
      >
        <div className="w-16 h-16 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center mx-auto shadow-[0_0_24px_rgba(16,185,129,0.3)]">
          <CheckCircle2 className="w-8 h-8 text-emerald-400" />
        </div>
        <div>
          <h2 className="text-xl font-extrabold text-white">Report Submitted!</h2>
          <p className="text-slate-400 text-sm mt-1 max-w-md mx-auto">
            Thank you, <span className="text-indigo-400 font-semibold">{user?.name}</span>. Your report has been dispatched to municipal authorities.
          </p>
        </div>
        <div className="flex justify-center gap-3 pt-2">
          <button
            onClick={() => router.push('/citizen/my-reports')}
            className="obs-btn-primary"
          >
            View My Reports
          </button>
          <button
            onClick={() => {
              setSubmitted(false);
              setTitle('');
              setDescription('');
              setImageUrl('');
            }}
            className="obs-btn-ghost"
          >
            Submit Another
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="obs-card p-6 sm:p-8 space-y-6">
      {/* User Login Banner */}
      {!user ? (
        <div className="bg-[#4F46E5]/10 border border-[#4F46E5]/30 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-slate-300">
            <Lock className="w-4 h-4 text-[#818CF8]" />
            <span>Login required to submit reports.</span>
          </div>
          <button
            type="button"
            onClick={() => router.push('/citizen/login')}
            className="obs-btn-primary py-1.5 px-3 text-xs"
          >
            Login Now
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-2 text-xs text-slate-400 bg-white/4 border border-white/8 px-4 py-2.5 rounded-xl">
          <User className="w-4 h-4 text-[#818CF8]" />
          <span>Reporting as <strong className="text-slate-200">{user.name}</strong> ({user.email})</span>
        </div>
      )}

      {/* Category selector */}
      <div className="space-y-2">
        <label className="obs-label">Issue Category *</label>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              type="button"
              onClick={() => setCategory(cat.value)}
              className={`p-3 rounded-xl border text-center transition-all ${
                category === cat.value
                  ? 'bg-[#4F46E5]/20 border-[#6366F1] text-white shadow-[0_0_16px_rgba(99,102,241,0.25)]'
                  : 'bg-[#090D16] border-[#1E293B] text-slate-400 hover:border-slate-600 hover:text-slate-200'
              }`}
            >
              <div className="text-lg mb-1">{cat.icon}</div>
              <div className="text-xs font-semibold">{cat.label}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Title */}
      <div className="space-y-1.5">
        <label className="obs-label">Issue Title *</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          placeholder="e.g. Deep pothole causing traffic slowdown near Sunshine School"
          className="obs-input"
        />
      </div>

      {/* Priority */}
      <div className="space-y-2">
        <label className="obs-label">Urgency / Priority *</label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {PRIORITIES.map((p) => (
            <button
              key={p.value}
              type="button"
              onClick={() => setPriority(p.value)}
              className={`p-3 rounded-xl border text-left transition-all ${
                priority === p.value
                  ? 'bg-[#4F46E5]/20 border-[#6366F1] text-white shadow-[0_0_16px_rgba(99,102,241,0.25)]'
                  : 'bg-[#090D16] border-[#1E293B] text-slate-400 hover:border-slate-600 hover:text-slate-200'
              }`}
            >
              <div className="text-xs font-bold mb-0.5">{p.label}</div>
              <div className="text-[10px] text-slate-400 line-clamp-1">{p.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Description */}
      <div className="space-y-1.5">
        <label className="obs-label">Detailed Description *</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
          rows={4}
          placeholder="Describe the issue size, hazard level, exact landmark, duration..."
          className="obs-input resize-none"
        />
      </div>

      {/* Location */}
      <div className="space-y-2">
        <label className="obs-label flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-[#6366F1]" /> Location & Address *
        </label>
        <input
          type="text"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          required
          placeholder="Specific address / landmark..."
          className="obs-input mb-2"
        />
        <IssueMap
          latitude={latitude}
          longitude={longitude}
          onLocationChange={handleLocationChange}
          editable
        />
      </div>

      {/* Photo Upload */}
      <div className="space-y-2">
        <label className="obs-label flex items-center gap-1.5">
          <Camera className="w-3.5 h-3.5 text-[#6366F1]" /> Photo Evidence (Optional)
        </label>
        {imageUrl ? (
          <div className="relative rounded-xl overflow-hidden border border-[#1E293B] max-h-48">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={imageUrl} alt="Uploaded evidence" className="w-full h-48 object-cover" />
            <button
              type="button"
              onClick={() => setImageUrl('')}
              className="absolute top-2 right-2 p-1.5 rounded-full bg-black/70 text-white hover:bg-rose-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-[#1E293B] hover:border-[#6366F1] rounded-xl cursor-pointer bg-[#090D16] transition-all group">
            {uploadingImage ? (
              <Loader2 className="w-6 h-6 text-[#6366F1] animate-spin" />
            ) : (
              <>
                <Camera className="w-7 h-7 text-slate-500 group-hover:text-[#6366F1] transition-colors mb-2" />
                <span className="text-xs font-semibold text-slate-300">Click to upload photo</span>
                <span className="text-[10px] text-slate-500 mt-1">PNG, JPG up to 5MB</span>
              </>
            )}
            <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
          </label>
        )}
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={submitting || !user}
        className="obs-btn-primary w-full py-3.5 text-base font-semibold shadow-[0_0_24px_rgba(99,102,241,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
        {submitting ? 'Submitting Report…' : 'Submit Issue Report'}
      </button>
    </form>
  );
}
