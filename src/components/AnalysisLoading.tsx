import React, { useEffect, useState } from 'react';
import { ShieldCheck, HeartPulse, Sparkles } from 'lucide-react';

const LOADING_MESSAGES = [
  'Checking urgent warning signs…',
  'Preparing guidance in your selected language…',
  'Creating a safe next-step summary…',
  'Finalizing safety validation checks…',
];

export const AnalysisLoading: React.FC = () => {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev < LOADING_MESSAGES.length - 1 ? prev + 1 : prev));
    }, 600);

    return () => clearInterval(interval);
  }, []);

  return (
    <div
      aria-live="polite"
      aria-atomic="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-amrit-navy/60 backdrop-blur-md p-4"
    >
      <div className="bg-white rounded-card-lg max-w-md w-full p-8 shadow-card-hover border border-amrit-border text-center space-y-6 animate-scale-up">
        {/* Orbital Animation Container */}
        <div className="relative w-28 h-28 mx-auto flex items-center justify-center">
          {/* Outer ring */}
          <div className="absolute inset-0 rounded-full border-2 border-dashed border-amrit-teal/40 animate-spin" style={{ animationDuration: '10s' }} />
          
          {/* Inner pulsating glow */}
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amrit-teal to-amrit-blue flex items-center justify-center shadow-glow-teal animate-pulse">
            <ShieldCheck className="w-9 h-9 text-white" />
          </div>

          {/* Orbiting Satellite Dot */}
          <div className="absolute w-full h-full flex items-center justify-center">
            <div className="w-5 h-5 rounded-full bg-amrit-cyan border-2 border-white shadow-soft flex items-center justify-center animate-orbit">
              <HeartPulse className="w-3 h-3 text-amrit-teal" />
            </div>
          </div>
        </div>

        {/* Text and Status */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amrit-tealLight text-amrit-teal text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Evaluating Triage Safety</span>
          </div>

          <h3 className="text-xl font-bold text-amrit-navy transition-all duration-300 min-h-[28px]">
            {LOADING_MESSAGES[messageIndex]}
          </h3>

          <p className="text-xs text-amrit-muted">
            Analyzing symptom keywords, duration, and safety indicators...
          </p>
        </div>

        {/* Prototype safety footnote */}
        <div className="pt-4 border-t border-amrit-border">
          <p className="text-[11px] font-semibold text-amrit-muted bg-amrit-bg py-2 px-3 rounded-lg border border-amrit-border">
            Demo mode — backend analysis will be integrated later.
          </p>
        </div>
      </div>
    </div>
  );
};
