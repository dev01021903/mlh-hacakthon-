import React from 'react';
import { TriangleAlert, PhoneCall } from 'lucide-react';
import { useToast } from '../hooks/useToast';

export const EmergencyBanner: React.FC = () => {
  const { showToast } = useToast();

  const handleEmergencyClick = () => {
    showToast('Emergency-call integration will be available in a future version.', 'warning');
  };

  return (
    <section
      aria-label="Emergency alert notice"
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 my-6"
    >
      <div className="bg-gradient-to-r from-red-50 via-rose-50 to-orange-50 border border-amrit-emergency/30 rounded-card p-4 sm:p-5 shadow-soft flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3.5 text-amrit-navy">
          <div className="w-10 h-10 rounded-full bg-amrit-emergency/15 text-amrit-emergency flex items-center justify-center flex-shrink-0">
            <TriangleAlert className="w-5 h-5" />
          </div>
          <div className="text-xs sm:text-sm font-medium leading-snug">
            <span className="font-bold text-amrit-emergency block sm:inline mr-1">
              Urgent Alert:
            </span>
            For severe chest pain, difficulty breathing, heavy bleeding, unconsciousness, seizures, facial or throat swelling, or immediate danger, call <strong className="text-amrit-emergency underline">112 or 108</strong> now.
          </div>
        </div>

        <button
          type="button"
          onClick={handleEmergencyClick}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 bg-amrit-emergency hover:bg-rose-600 text-white text-xs sm:text-sm font-bold rounded-xl shadow-soft hover:shadow-card transition-all flex-shrink-0 active:scale-95"
        >
          <PhoneCall className="w-4 h-4 animate-bounce" />
          <span>Emergency help: 112 / 108</span>
        </button>
      </div>
    </section>
  );
};
