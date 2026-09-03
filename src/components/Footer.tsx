import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, HeartPulse, AlertTriangle } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-amrit-border mt-20 pt-14 pb-10 text-amrit-muted">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-amrit-border">
          {/* Col 1: Brand & Tagline */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amrit-teal to-amrit-navy flex items-center justify-center text-white shadow-soft">
                <div className="relative">
                  <ShieldCheck className="w-5 h-5 text-white" />
                  <HeartPulse className="w-3 h-3 text-amrit-cyan absolute -bottom-0.5 -right-0.5" />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-bold tracking-tight text-amrit-navy">
                  AMRIT
                </span>
                <span className="text-xs font-semibold text-amrit-teal bg-amrit-tealLight px-2 py-0.5 rounded-full">
                  अमृत
                </span>
              </div>
            </div>
            <p className="text-sm text-amrit-text font-medium leading-relaxed max-w-md">
              “Your multilingual guide to the next safe health step.”
            </p>
            <p className="text-xs text-amrit-muted leading-relaxed max-w-md">
              Amrit helps users understand their next safe action when symptoms are confusing. Supporting English, Hindi, Kannada, Telugu, and Tamil.
            </p>
          </div>

          {/* Col 2: Navigation */}
          <div>
            <h4 className="text-xs font-bold text-amrit-navy uppercase tracking-wider mb-3">
              Navigation
            </h4>
            <ul className="space-y-2 text-sm font-medium">
              <li>
                <Link to="/" className="text-amrit-muted hover:text-amrit-teal transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/check" className="text-amrit-muted hover:text-amrit-teal transition-colors">
                  Symptom Check
                </Link>
              </li>
              <li>
                <Link to="/how-it-works" className="text-amrit-muted hover:text-amrit-teal transition-colors">
                  How It Works
                </Link>
              </li>
              <li>
                <Link to="/safety" className="text-amrit-muted hover:text-amrit-teal transition-colors">
                  Safety Principles
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Emergency & Health lines */}
          <div>
            <h4 className="text-xs font-bold text-amrit-navy uppercase tracking-wider mb-3">
              National Emergency Lines
            </h4>
            <div className="space-y-2 text-sm font-medium">
              <div className="p-3 rounded-xl bg-amrit-emergencyLight border border-amrit-emergency/20 text-amrit-navy">
                <div className="font-bold text-amrit-emergency flex items-center gap-1.5 mb-1">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Call 112 or 108</span>
                </div>
                <p className="text-xs text-amrit-muted">
                  For immediate acute distress, chest pain, or breathing difficulty.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Disclaimer Banner */}
        <div className="mt-8 p-4 rounded-card bg-amrit-bg border border-amrit-border space-y-2">
          <p className="text-xs font-medium text-amrit-text text-center">
            <strong>Mandatory Healthcare Disclaimer:</strong> “Amrit provides general triage guidance only. It does not diagnose conditions, prescribe medicines, or replace a qualified healthcare professional.”
          </p>
          <p className="text-[11px] text-amrit-muted text-center flex items-center justify-center gap-1">
            <span>Hackathon frontend prototype — not for clinical use.</span>
            <span>•</span>
            <span>Local demo mode with zero patient data storage.</span>
          </p>
        </div>

        {/* Bottom copyright */}
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-amrit-muted gap-3">
          <p>© {new Date().getFullYear()} AMRIT (अमृत) — Safety-First Health Triage Prototype.</p>
          <div className="flex items-center gap-4">
            <Link to="/safety" className="hover:text-amrit-teal underline">
              Safety Documentation
            </Link>
            <Link to="/how-it-works" className="hover:text-amrit-teal underline">
              Triage Architecture
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
