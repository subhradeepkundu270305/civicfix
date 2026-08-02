'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail, Lock, ShieldCheck, Loader2, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'login', email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Login failed');
      if (data.user.role !== 'admin') {
        toast.error('Access denied. Not an admin account.');
        return;
      }
      localStorage.setItem('civicfix_user', JSON.stringify(data.user));
      toast.success(`Welcome, ${data.user.name}. Authority dashboard loaded.`);
      router.push('/admin/dashboard');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = () => {
    setEmail('admin@demo.com');
    setPassword('admin123');
  };

  return (
    <div className="min-h-screen bg-[#090D16] flex items-center justify-center px-4 py-12 relative overflow-hidden">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-[#3B82F6]/15 blur-[120px] pointer-events-none rounded-full" />

      <div className="w-full max-w-md relative z-10">
        <div className="obs-card overflow-hidden">
          {/* Header */}
          <div className="bg-[#141C2E] border-b border-[#1E293B] px-8 py-8 text-center">
            <div className="w-12 h-12 bg-amber-500/15 border border-amber-500/30 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-[0_0_20px_rgba(245,158,11,0.25)]">
              <ShieldCheck className="w-6 h-6 text-amber-400" />
            </div>
            <h1 className="text-xl font-extrabold text-white">Authority Login</h1>
            <p className="text-slate-400 text-xs mt-1">Municipal Officer Access Only</p>
          </div>

          <form onSubmit={handleLogin} className="p-7 space-y-4">
            <button
              type="button"
              onClick={fillDemo}
              className="w-full flex items-center justify-between px-4 py-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs text-amber-300 hover:bg-amber-500/20 transition-all"
            >
              <span className="font-semibold">🔑 Fill Admin Demo Credentials</span>
              <span className="text-slate-400">admin@demo.com</span>
            </button>

            <div className="space-y-1">
              <label className="obs-label">Admin Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="admin@demo.com"
                  className="obs-input pl-10 has-icon-left"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="obs-label">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="obs-input pl-10 pr-10 has-icon-left has-icon-right"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="obs-btn-primary w-full py-3 text-sm font-semibold disabled:opacity-50"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {loading ? 'Authenticating…' : 'Access Dashboard'}
            </button>

            <p className="text-center text-xs text-slate-400 pt-2">
              Citizen?{' '}
              <Link href="/citizen/login" className="text-[#818CF8] hover:underline font-semibold">
                Go to Citizen Login
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
