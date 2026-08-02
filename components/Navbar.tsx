'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, ShieldCheck, LogOut, Menu, X, User } from 'lucide-react';
import { AuthPayload } from '@/types';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<AuthPayload | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('civicfix_user');
    if (stored) setUser(JSON.parse(stored));
  }, [pathname]);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('civicfix_user');
    setUser(null);
    router.push('/');
    setMenuOpen(false);
  };

  const isAdmin = user?.role === 'admin';
  const isCitizen = user?.role === 'citizen';

  const navLinks = [
    { href: isCitizen ? '/citizen/my-reports' : '/citizen/login', label: 'Citizen Portal', icon: MapPin, active: pathname.startsWith('/citizen') },
    { href: isAdmin ? '/admin/dashboard' : '/admin/login', label: 'Authority Dashboard', icon: ShieldCheck, active: pathname.startsWith('/admin') },
  ];

  return (
    <motion.nav
      initial={{ y: -56, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-[#090D16]/80 backdrop-blur-md border-b border-[#1E293B] shadow-[0_4px_20px_rgba(0,0,0,0.5)]'
          : 'bg-[#090D16]/90 backdrop-blur-md border-b border-[#1E293B]/70'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-15 py-3">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group min-w-0">
            <motion.div
              whileHover={{ scale: 1.05 }}
              transition={{ type: 'spring', stiffness: 400, damping: 18 }}
              className="shrink-0"
            >
              <Image
                src="/logo-ind.png"
                alt="Government of India"
                width={44}
                height={44}
                className="w-8 h-8 sm:w-10 sm:h-10 object-contain drop-shadow-md"
                priority
              />
            </motion.div>
            <div className="min-w-0">
              <p className="text-white font-extrabold text-sm sm:text-base tracking-tight leading-tight whitespace-nowrap">
                Civic<span style={{ color: '#818CF8' }}>Fix</span>
              </p>
              <p className="text-[8px] sm:text-[9px] font-semibold uppercase tracking-widest leading-none" style={{ color: '#64748B' }}>
                Govt. of India Portal
              </p>
            </div>
          </Link>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="relative flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200"
                style={{ color: link.active ? '#F1F5F9' : '#94A3B8' }}
                onMouseEnter={(e) => { if (!link.active) (e.currentTarget as HTMLElement).style.color = '#F1F5F9'; }}
                onMouseLeave={(e) => { if (!link.active) (e.currentTarget as HTMLElement).style.color = '#94A3B8'; }}
              >
                {link.active && (
                  <motion.div
                    layoutId="nav-active"
                    className="absolute inset-0 rounded-xl"
                    style={{ background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.25)' }}
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
                <link.icon className="w-4 h-4 relative z-10" />
                <span className="relative z-10">{link.label}</span>
              </Link>
            ))}

            {/* User area */}
            {user ? (
              <div className="flex items-center gap-2 ml-3 pl-3" style={{ borderLeft: '1px solid #1E293B' }}>
                <div className="flex items-center gap-2">
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold"
                    style={{ background: 'linear-gradient(135deg,#4F46E5,#3B82F6)', boxShadow: '0 0 10px rgba(99,102,241,0.30)' }}
                  >
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="hidden lg:block text-xs truncate max-w-[110px]" style={{ color: '#94A3B8' }}>
                    {user.name}
                  </span>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                  style={{ color: '#64748B' }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = '#FB7185'; (e.currentTarget as HTMLElement).style.background = 'rgba(244,63,94,0.08)'; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = '#64748B'; (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                >
                  <LogOut className="w-3.5 h-3.5" /> Logout
                </motion.button>
              </div>
            ) : (
              <motion.div className="ml-3" whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
                <Link
                  href="/citizen/login"
                  className="obs-btn-primary px-4 py-2 text-sm"
                >
                  Login
                </Link>
              </motion.div>
            )}
          </div>

          {/* Mobile menu button */}
          <motion.button
            whileTap={{ scale: 0.88 }}
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden p-2 rounded-xl transition-all"
            style={{ color: '#94A3B8' }}
          >
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </motion.button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.22, ease: 'easeInOut' }}
            className="md:hidden overflow-hidden obs-glass border-t"
            style={{ borderTopColor: '#1E293B' }}
          >
            <div className="px-4 py-3 space-y-1.5">
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2 w-full px-4 py-3 rounded-xl text-sm font-medium transition-all"
                  style={{
                    color: link.active ? '#F1F5F9' : '#94A3B8',
                    background: link.active ? 'rgba(99,102,241,0.12)' : 'transparent',
                    border: link.active ? '1px solid rgba(99,102,241,0.25)' : '1px solid transparent',
                  }}
                >
                  <link.icon className="w-4 h-4" /> {link.label}
                </Link>
              ))}
              {user ? (
                <>
                  <div className="flex items-center gap-2 px-4 py-2 text-sm" style={{ color: '#475569' }}>
                    <User className="w-4 h-4" />
                    <span className="truncate">{user.name}</span>
                    <span className="ml-auto text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(99,102,241,0.12)', color: '#818CF8' }}>
                      {user.role}
                    </span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 w-full px-4 py-3 rounded-xl text-sm transition-all"
                    style={{ color: '#FB7185' }}
                  >
                    <LogOut className="w-4 h-4" /> Logout
                  </button>
                </>
              ) : (
                <Link
                  href="/citizen/login"
                  onClick={() => setMenuOpen(false)}
                  className="obs-btn-primary flex w-full justify-center py-3"
                >
                  Login / Register
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
