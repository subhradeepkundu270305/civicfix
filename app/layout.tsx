import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from 'react-hot-toast';
import Navbar from '@/components/Navbar';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });

export const metadata: Metadata = {
  title: 'CivicFix – Public Infrastructure Damage Reporting',
  description: 'Report civic infrastructure issues like potholes, broken streetlights, water leaks and more. Municipal authorities track and resolve issues efficiently.',
  keywords: 'pothole, streetlight, civic report, infrastructure, municipal, public works',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body
        className="min-h-screen font-inter antialiased"
        style={{ backgroundColor: '#090D16', color: '#F1F5F9' }}
      >
        <Navbar />
        <main className="pt-[60px]">{children}</main>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#111827',
              color: '#F1F5F9',
              border: '1px solid #1E293B',
              borderRadius: '12px',
              padding: '12px 16px',
              fontSize: '14px',
              fontFamily: 'Inter, sans-serif',
              boxShadow: '0 8px 32px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.04)',
            },
            success: { iconTheme: { primary: '#10B981', secondary: '#111827' } },
            error:   { iconTheme: { primary: '#F43F5E', secondary: '#111827' } },
          }}
        />
      </body>
    </html>
  );
}
