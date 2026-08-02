'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import {
  MapPin, ShieldCheck, CheckCircle2, Clock, Users, Zap,
  ArrowRight, Activity, AlertTriangle, Layers, ChevronDown,
} from 'lucide-react';
import CountUpNumber from '@/components/CountUpNumber';
import AnimatedCard from '@/components/AnimatedCard';

export default function HomePage() {
  const stats = [
    { label: 'Issues Reported',   value: 1240, suffix: '+', icon: AlertTriangle, color: '#6366F1' },
    { label: 'Resolved Cases',    value: 980,  suffix: '+', icon: CheckCircle2,  color: '#10B981' },
    { label: 'Avg. Resolution',   value: 2,    suffix: ' Days', icon: Clock,     color: '#06B6D4' },
    { label: 'Active Citizens',   value: 4500, suffix: '+', icon: Users,        color: '#8B5CF6' },
  ];

  const features = [
    {
      icon: MapPin,
      title: 'Geo-Tagged Reporting',
      description: 'Pinpoint precise infrastructure damage locations on interactive Leaflet maps with photo upload capability.',
      badge: 'Location Accuracy',
    },
    {
      icon: Activity,
      title: 'Real-Time Status Tracking',
      description: 'Track your report progress live as municipal officers review, assign, and resolve civic complaints.',
      badge: 'Live Status',
    },
    {
      icon: ShieldCheck,
      title: 'Authority Triage Dashboard',
      description: 'Dedicated administrative portal with analytical charts, category filtering, and status management.',
      badge: 'Municipal Control',
    },
    {
      icon: Layers,
      title: 'Categorized Damage Matrix',
      description: 'Specialized tags for potholes, broken streetlights, water leaks, footpaths, and open storm drains.',
      badge: 'Multi-Category',
    },
  ];

  return (
    <div className="min-h-screen bg-[#090D16] text-[#F1F5F9] overflow-hidden">

      {/* ── HERO SECTION ── */}
      <section className="relative min-h-[92vh] flex items-center justify-center pt-8 pb-16 px-4 sm:px-6 lg:px-8">
        
        {/* Flag background image with obsidian dark overlay */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/india_flag.jpg"
            alt="Indian Flag Background"
            fill
            className="object-cover object-center scale-105 filter brightness-[0.35] contrast-[1.1] saturate-[0.8]"
            priority
          />
          {/* Multi-layered dark gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#090D16]/80 via-[#090D16]/65 to-[#090D16]" />
          <div className="absolute inset-0 bg-radial from-transparent via-[#090D16]/40 to-[#090D16]" />
          {/* Cyber glowing accents */}
          <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-[#4F46E5]/20 blur-[120px] pointer-events-none rounded-full" />
          <div className="absolute top-1/3 left-10 w-72 h-72 bg-[#06B6D4]/15 blur-[100px] pointer-events-none rounded-full" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto text-center space-y-8">
          {/* Pill Badge */}
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold"
            style={{
              background: 'rgba(99,102,241,0.12)',
              color: '#818CF8',
              border: '1px solid rgba(99,102,241,0.28)',
              boxShadow: '0 0 20px rgba(99,102,241,0.20)',
            }}
          >
            <span className="w-2 h-2 rounded-full bg-[#6366F1] animate-pulse" />
            <span>Civic Tech for Smart Cities</span>
          </motion.div>

          {/* Heading */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="space-y-4"
          >
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.1]">
              Report. Track.{' '}
              <span className="bg-gradient-to-r from-[#6366F1] via-[#818CF8] to-[#3B82F6] bg-clip-text text-transparent">
                Resolve.
              </span>
            </h1>
            <p className="text-slate-400 text-base sm:text-xl max-w-3xl mx-auto font-normal leading-relaxed">
              CivicFix connects citizens directly with municipal authorities to report and resolve public infrastructure issues—potholes, broken streetlights, water leaks—faster than ever.
            </p>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2"
          >
            <Link
              href="/citizen/report"
              className="obs-btn-primary px-8 py-4 text-base font-bold w-full sm:w-auto shadow-[0_0_30px_rgba(99,102,241,0.35)]"
            >
              <Zap className="w-5 h-5" />
              Report an Issue
              <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
            <Link
              href="/admin/login"
              className="obs-btn-ghost px-8 py-4 text-base font-semibold w-full sm:w-auto border-[#1E293B] hover:border-slate-600"
            >
              <ShieldCheck className="w-5 h-5 text-[#818CF8]" />
              Authority Login
            </Link>
          </motion.div>

          {/* Scroll Indicator */}
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="pt-12 text-slate-500 text-xs flex flex-col items-center gap-1.5"
          >
            <span>SCROLL TO EXPLORE</span>
            <ChevronDown className="w-4 h-4 text-[#818CF8]" />
          </motion.div>
        </div>
      </section>

      {/* ── STATS SECTION ── */}
      <section className="relative py-12 sm:py-16 border-y border-[#1E293B] bg-[#111827]/60 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
            {stats.map((stat, idx) => (
              <AnimatedCard key={stat.label} delay={idx * 0.08} tilt lift className="obs-card p-3.5 sm:p-6">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
                  <div
                    className="w-9 h-9 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl flex items-center justify-center shrink-0"
                    style={{ background: `${stat.color}15`, border: `1px solid ${stat.color}30` }}
                  >
                    <stat.icon className="w-4 h-4 sm:w-6 sm:h-6" style={{ color: stat.color }} />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xl sm:text-3xl font-black text-white tracking-tight leading-tight">
                      <CountUpNumber end={stat.value} suffix={stat.suffix} duration={1400} />
                    </div>
                    <div className="text-[10px] sm:text-xs font-medium text-slate-400 mt-0.5 leading-snug">{stat.label}</div>
                  </div>
                </div>
              </AnimatedCard>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES SECTION ── */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative">
        <div className="text-center space-y-4 mb-16">
          <span className="text-xs font-bold text-[#818CF8] uppercase tracking-widest bg-[#4F46E5]/10 border border-[#4F46E5]/20 px-3 py-1 rounded-full">
            Key Capabilities
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            Built for Modern Civic Administration
          </h2>
          <p className="text-slate-400 text-sm sm:text-base max-w-2xl mx-auto">
            Streamlining the workflow between citizens and municipal authorities with high-tech tracking.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feat, idx) => (
            <AnimatedCard key={feat.title} delay={idx * 0.1} tilt lift className="obs-card p-6 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-[#4F46E5]/15 border border-[#4F46E5]/30 flex items-center justify-center mb-5">
                  <feat.icon className="w-5 h-5 text-[#818CF8]" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{feat.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{feat.description}</p>
              </div>
              <div className="mt-6 pt-4 border-t border-[#1E293B]">
                <span className="text-[11px] font-semibold text-[#818CF8] bg-[#4F46E5]/10 px-2.5 py-1 rounded-md">
                  {feat.badge}
                </span>
              </div>
            </AnimatedCard>
          ))}
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-[#1E293B] py-8 text-center text-xs text-slate-500 bg-[#090D16]">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 font-bold text-slate-300">
            <Zap className="w-4 h-4 text-[#6366F1]" />
            CivicFix Platform
          </div>
          <p>© 2026 CivicFix. Public Infrastructure Management System.</p>
          <div className="flex gap-4 text-slate-400">
            <Link href="/citizen/my-reports" className="hover:text-white transition-colors">Citizen Portal</Link>
            <Link href="/admin/dashboard" className="hover:text-white transition-colors">Authority Dashboard</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
