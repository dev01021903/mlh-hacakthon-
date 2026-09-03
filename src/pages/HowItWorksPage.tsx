import React from 'react';
import { Link } from 'react-router-dom';
import {
  Globe2,
  MessageSquare,
  Image as ImageIcon,
  ShieldAlert,
  Compass,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  PhoneCall,
  Activity,
} from 'lucide-react';

export const HowItWorksPage: React.FC = () => {
  const steps = [
    {
      num: 1,
      title: 'Choose language',
      icon: Globe2,
      color: 'text-amrit-teal bg-amrit-tealLight',
      desc: 'Select from English, Hindi (हिंदी), Kannada (ಕನ್ನಡ), Telugu (తెలుగు), or Tamil (தமிழ்) to describe what you are feeling in comfort.',
    },
    {
      num: 2,
      title: 'Describe symptoms',
      icon: MessageSquare,
      color: 'text-amrit-blue bg-amrit-blueLight',
      desc: 'Type or use simulated voice input to share symptoms, indicate when they started, and tag quick symptoms like fever or cough.',
    },
    {
      num: 3,
      title: 'Add optional image',
      icon: ImageIcon,
      color: 'text-purple-600 bg-purple-50',
      desc: 'Attach an optional local photo for visible skin irritation, swelling, or minor abrasions. Evaluated locally in browser memory.',
    },
    {
      num: 4,
      title: 'Safety red-flag check',
      icon: ShieldAlert,
      color: 'text-amrit-emergency bg-rose-50',
      desc: 'The triage engine scans for critical emergency indicators such as breathing distress, facial swelling, or chest pressure.',
    },
    {
      num: 5,
      title: 'Receive guidance',
      icon: Compass,
      color: 'text-amber-600 bg-amber-50',
      desc: 'Get categorized into 1 of 3 safe tiers: Self-care and monitor, Consult a doctor soon, or Emergency care now.',
    },
    {
      num: 6,
      title: 'Take the next safe step',
      icon: CheckCircle2,
      color: 'text-amrit-safe bg-amrit-safeLight',
      desc: 'Follow clear action steps: rest and monitor at home, schedule a clinical appointment, or discuss mild relief with a licensed pharmacist.',
    },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-16 space-y-16">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amrit-tealLight text-amrit-teal text-xs sm:text-sm font-bold shadow-soft">
          <Sparkles className="w-4 h-4" />
          <span>Transparent Triage Flow</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-amrit-navy tracking-tight">
          How Amrit Works
        </h1>
        <p className="text-base sm:text-lg text-amrit-muted font-medium leading-relaxed">
          From symptom entry to actionable guidance—designed without jargon, fear, or false certainty.
        </p>
      </div>

      {/* 6 Visual Steps Flow */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
        {steps.map((step) => {
          const Icon = step.icon;
          return (
            <div
              key={step.num}
              className="bg-white rounded-card-lg border border-amrit-border p-6 sm:p-8 shadow-soft hover:shadow-card transition-all space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${step.color} shadow-soft`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-2xl font-black text-amrit-border/80">
                    0{step.num}
                  </span>
                </div>

                <div className="space-y-2">
                  <h3 className="text-lg font-bold text-amrit-navy">
                    {step.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-amrit-muted font-medium leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              </div>

              <div className="pt-2 border-t border-amrit-border/60 flex items-center gap-1.5 text-xs font-bold text-amrit-teal">
                <span>Phase {step.num} of 6</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Triage Decision Framework */}
      <div className="bg-white rounded-card-lg border border-amrit-border p-8 sm:p-12 shadow-card space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-bold text-amrit-teal uppercase tracking-wider">
            Decision Framework
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-amrit-navy">
            How Amrit Categorizes Urgency
          </h2>
          <p className="text-xs sm:text-sm text-amrit-muted">
            Clear triage boundaries ensure high-risk cases are escalated and mild cases are given calm comfort guidance.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Tier 1 */}
          <div className="p-6 rounded-card bg-amrit-safeLight/50 border border-amrit-safe/40 space-y-3">
            <div className="flex items-center gap-2 text-amrit-safe font-bold text-sm uppercase tracking-wider">
              <CheckCircle2 className="w-5 h-5" />
              <span>Self-Care & Monitor</span>
            </div>
            <p className="text-xs text-amrit-navy font-medium leading-relaxed">
              For new, mild symptoms without red flags. Unlocks category-level pharmacist discussion points for adult cases.
            </p>
          </div>

          {/* Tier 2 */}
          <div className="p-6 rounded-card bg-amrit-consultLight/50 border border-amrit-consult/40 space-y-3">
            <div className="flex items-center gap-2 text-amber-700 font-bold text-sm uppercase tracking-wider">
              <Activity className="w-5 h-5" />
              <span>Consult Soon</span>
            </div>
            <p className="text-xs text-amrit-navy font-medium leading-relaxed">
              For symptoms present for 1–3+ days, localized pain, spreading rashes, or persistent mild fevers.
            </p>
          </div>

          {/* Tier 3 */}
          <div className="p-6 rounded-card bg-amrit-emergencyLight/50 border border-amrit-emergency/40 space-y-3">
            <div className="flex items-center gap-2 text-amrit-emergency font-bold text-sm uppercase tracking-wider">
              <PhoneCall className="w-5 h-5" />
              <span>Emergency Now</span>
            </div>
            <p className="text-xs text-amrit-navy font-medium leading-relaxed">
              Immediate escalation for chest pain, airway distress, facial swelling, heavy bleeding, or altered consciousness.
            </p>
          </div>
        </div>
      </div>

      {/* Safety notice */}
      <div className="p-5 rounded-card bg-amrit-bg border border-amrit-border text-center space-y-2">
        <p className="text-xs text-amrit-muted font-semibold">
          “Amrit provides general triage guidance only. It does not diagnose conditions, prescribe medicines, or replace a qualified healthcare professional.”
        </p>
      </div>

      {/* CTA */}
      <div className="text-center pt-2">
        <Link
          to="/check"
          className="inline-flex items-center gap-2 px-8 py-4 bg-amrit-teal hover:bg-amrit-tealDark text-white text-base font-bold rounded-2xl shadow-card hover:shadow-card-hover transition-all"
        >
          <span>Try Triage Demo</span>
          <ArrowRight className="w-5 h-5" />
        </Link>
      </div>
    </div>
  );
};
