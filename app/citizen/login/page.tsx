'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail, Lock, ShieldCheck, Loader2, Eye, EyeOff, Zap } from 'lucide-react';
import toast from 'react-hot-toast';

export default function CitizenLoginPage() {
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
      if (data.user.role !== 'citizen') {
        toast.error('Please use the Authority login for admin accounts.');
        return;
      }
      localStorage.setItem('civicfix_user', JSON.stringify(data.user));
      toast.success(`Welcome back, ${data.user.name}!`);
      router.push('/citizen/my-reports');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = () => {
    setEmail('citizen@demo.com');
    setPassword('citizen123');
  };

  return (
    <div className="min-h-screen bg-[#090D16] flex items-center justify-center px-4 py-12 relative overflow-hidden">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-[#4F46E5]/15 blur-[120px] pointer-events-none rounded-full" />

      <div className="w-full max-w-md relative z-10">
        <div className="obs-card overflow-hidden">
          {/* Header */}
          <div className="bg-[#141C2E] border-b border-[#1E293B] px-8 py-8 text-center">
            <div className="w-12 h-12 bg-[#4F46E5]/15 border border-[#4F46E5]/30 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-[0_0_20px_rgba(99,102,241,0.25)]">
              <Zap className="w-6 h-6 text-[#818CF8]" />
            </div>
            <h1 className="text-xl font-extrabold text-white">Citizen Login</h1>
            <p className="text-slate-400 text-xs mt-1">Sign in to report and track infrastructure issues</p>
          </div>

          <form onSubmit={handleLogin} className="p-7 space-y-4">
            {/* Demo Button */}
            <button
              type="button"
              onClick={fillDemo}
              className="w-full flex items-center justify-between px-4 py-3 bg-[#4F46E5]/10 border border-[#4F46E5]/30 rounded-xl text-xs text-[#818CF8] hover:bg-[#4F46E5]/20 transition-all"
            >
              <span className="font-semibold">🧪 Fill Demo Credentials</span>
              <span className="text-slate-400">citizen@demo.com</span>
            </button>

            <div className="space-y-1">
              <label className="obs-label">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="citizen@demo.com"
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
              {loading ? 'Signing In…' : 'Sign In'}
            </button>

            <p className="text-center text-xs text-slate-400 pt-2">
              New to CivicFix?{' '}
              <Link href="/citizen/register" className="text-[#818CF8] hover:underline font-semibold">
                Create an account
              </Link>
            </p>
          </form>
        </div>

        <p className="text-center mt-4 text-xs text-slate-500">
          Are you a municipal authority?{' '}
          <Link href="/admin/login" className="text-[#818CF8] hover:text-white font-semibold">
            <ShieldCheck className="inline w-3.5 h-3.5 mr-0.5" />
            Admin Portal
          </Link>
        </p>
      </div>
    </div>
  );
}
