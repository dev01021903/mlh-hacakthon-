import React, { useEffect, useState } from 'react';
import { ShieldCheck, HeartPulse, Sparkles, Globe } from 'lucide-react';

interface AnalysisLoadingProps {
  languageName?: string;
}

const LOADING_MESSAGES_BASE = [
  'Checking urgent warning signs…',
  'Preparing safe guidance…',
  'Analyzing symptom context with clinical safety guardrails…',
];

export const AnalysisLoading: React.FC<AnalysisLoadingProps> = ({ languageName = 'your selected language' }) => {
  const loadingMessages = [
    ...LOADING_MESSAGES_BASE,
    `Translating guidance into ${languageName}…`,
  ];

  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev < loadingMessages.length - 1 ? prev + 1 : prev));
    }, 700);

    return () => clearInterval(interval);
  }, [loadingMessages.length]);

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
          <div
            className="absolute inset-0 rounded-full border-2 border-dashed border-amrit-teal/40 animate-spin"
            style={{ animationDuration: '10s' }}
          />

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
            <span>Non-Diagnostic Triage Assessment</span>
          </div>

          <h3 className="text-lg sm:text-xl font-bold text-amrit-navy transition-all duration-300 min-h-[32px]">
            {loadingMessages[messageIndex]}
          </h3>

          <p className="text-xs text-amrit-muted font-medium flex items-center justify-center gap-1.5">
            <Globe className="w-3.5 h-3.5 text-amrit-teal" />
            <span>Multilingual triage & translation in progress...</span>
          </p>
        </div>

        {/* Non-diagnostic safety footnote */}
        <div className="pt-4 border-t border-amrit-border space-y-1.5">
          <p className="text-xs font-bold text-amrit-navy">
            Demo guidance — not a diagnosis.
          </p>
          <p className="text-[11px] text-amrit-muted">
            All analysis and translations are performed securely on the backend server.
          </p>
        </div>
      </div>
    </div>
  );
};
