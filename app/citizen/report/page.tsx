import ReportForm from '@/components/ReportForm';
import { MapPin } from 'lucide-react';

export const metadata = {
  title: 'Report an Issue – CivicFix',
  description: 'Submit a new civic infrastructure issue report with photo and location details.',
};

export default function ReportPage() {
  return (
    <div className="min-h-screen bg-[#090D16] text-[#F1F5F9]">
      {/* Page Header */}
      <div className="border-b border-[#1E293B] bg-[#111827]/70 backdrop-blur-xl py-10 px-4">
        <div className="max-w-2xl mx-auto text-center space-y-3">
          <div className="w-12 h-12 bg-[#4F46E5]/15 border border-[#4F46E5]/30 rounded-2xl flex items-center justify-center mx-auto shadow-[0_0_20px_rgba(99,102,241,0.25)]">
            <MapPin className="w-6 h-6 text-[#818CF8]" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Report a Civic Infrastructure Issue
          </h1>
          <p className="text-slate-400 text-sm max-w-md mx-auto">
            Your geo-tagged report will be logged directly into the municipal authority dashboard.
          </p>
        </div>
      </div>

      {/* Form Container */}
      <div className="max-w-2xl mx-auto px-4 py-8">
        <ReportForm />
      </div>
    </div>
  );
}
