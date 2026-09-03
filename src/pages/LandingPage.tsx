import React from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  ArrowRight,
  MessageSquare,
  Image as ImageIcon,
  Compass,
  Globe2,
  AlertTriangle,
  Lock,
  Stethoscope,
  Sparkles,
} from 'lucide-react';
import { HealthCompassDemo } from '../components/HealthCompassDemo';
import { EmergencyBanner } from '../components/EmergencyBanner';
import { SUPPORTED_LANGUAGES } from '../data/languages';
import { LanguageCode } from '../types';

interface LandingPageProps {
  currentLanguage: LanguageCode;
  onLanguageChange: (lang: LanguageCode) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  currentLanguage,
  onLanguageChange,
}) => {
  return (
    <div className="space-y-16 sm:space-y-24">
      {/* Hero Section */}
      <section className="relative pt-6 sm:pt-12 pb-8 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Col: Hero Content */}
            <div className="lg:col-span-6 space-y-6 sm:space-y-8">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amrit-tealLight border border-amrit-teal/30 text-amrit-teal text-xs sm:text-sm font-bold shadow-soft">
                <Sparkles className="w-4 h-4 text-amrit-teal" />
                <span>Multilingual • AI-assisted • Safety-first</span>
              </div>

              {/* Heading & Tagline */}
              <div className="space-y-3">
                <h1 className="text-3xl sm:text-5xl lg:text-5xl font-extrabold tracking-tight text-amrit-navy leading-[1.15]">
                  Understand your next safe health step.
                </h1>
                <p className="text-base sm:text-lg text-amrit-muted font-medium leading-relaxed max-w-xl">
                  Describe symptoms in your language, add an optional photo for visible concerns, and receive simple guidance on what to do next.
                </p>
              </div>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
                <Link
                  to="/check"
                  className="flex items-center justify-center gap-2 px-7 py-3.5 text-base font-bold text-white bg-amrit-teal hover:bg-amrit-tealDark rounded-2xl shadow-card hover:shadow-card-hover transition-all transform active:scale-95"
                >
                  <span>Start Symptom Check</span>
                  <ArrowRight className="w-5 h-5" />
                </Link>

                <Link
                  to="/how-it-works"
                  className="flex items-center justify-center gap-2 px-6 py-3.5 text-base font-bold text-amrit-navy bg-white hover:bg-amrit-bg border border-amrit-border rounded-2xl shadow-soft hover:shadow-card transition-all"
                >
                  <span>See how Amrit works</span>
                </Link>
              </div>

              {/* Shield Disclaimer Text */}
              <div className="flex items-start gap-3 p-3.5 rounded-card-sm bg-white border border-amrit-border/80 shadow-soft max-w-lg">
                <ShieldCheck className="w-5 h-5 text-amrit-teal flex-shrink-0 mt-0.5" />
                <p className="text-xs text-amrit-muted font-medium leading-snug">
                  <strong className="text-amrit-navy font-semibold">Not a diagnosis.</strong> Built to guide—not replace—medical professionals.
                </p>
              </div>

              {/* Language Row */}
              <div className="pt-2">
                <p className="text-xs font-bold text-amrit-navy uppercase tracking-wider mb-2">
                  Available in 5 Indian languages:
                </p>
                <div className="flex flex-wrap items-center gap-2">
                  {SUPPORTED_LANGUAGES.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => onLanguageChange(lang.code)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
                        currentLanguage === lang.code
                          ? 'bg-amrit-teal text-white border-amrit-teal shadow-soft'
                          : 'bg-white hover:bg-amrit-bg text-amrit-navy border-amrit-border'
                      }`}
                    >
                      {lang.nativeName} ({lang.name})
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Col: Interactive Health Compass Demo */}
            <div className="lg:col-span-6">
              <HealthCompassDemo />
            </div>
          </div>
        </div>
      </section>

      {/* Emergency Alert Banner */}
      <EmergencyBanner />

      {/* Section 1: How It Works */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-12">
          <span className="text-xs font-bold text-amrit-teal uppercase tracking-widest bg-amrit-tealLight px-3 py-1 rounded-full">
            Simple 3-Step Journey
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-amrit-navy">
            How Amrit guides you safely
          </h2>
          <p className="text-sm sm:text-base text-amrit-muted">
            A calm, step-by-step assistant designed to remove fear and bring clarity when symptoms are confusing.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {/* Step 1 */}
          <div className="bg-white rounded-card-lg p-6 sm:p-8 border border-amrit-border shadow-soft hover:shadow-card transition-all space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-amrit-tealLight text-amrit-teal flex items-center justify-center font-bold text-lg">
              <MessageSquare className="w-6 h-6" />
            </div>
            <div className="space-y-2">
              <div className="text-xs font-bold text-amrit-teal uppercase tracking-wider">
                Step 1
              </div>
              <h3 className="text-xl font-bold text-amrit-navy">
                Share your symptoms
              </h3>
              <p className="text-xs sm:text-sm text-amrit-muted leading-relaxed font-medium">
                Type or speak symptoms in your native language. Mention when they started and choose from common symptom tags.
              </p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="bg-white rounded-card-lg p-6 sm:p-8 border border-amrit-border shadow-soft hover:shadow-card transition-all space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-amrit-blueLight text-amrit-blue flex items-center justify-center font-bold text-lg">
              <ImageIcon className="w-6 h-6" />
            </div>
            <div className="space-y-2">
              <div className="text-xs font-bold text-amrit-blue uppercase tracking-wider">
                Step 2
              </div>
              <h3 className="text-xl font-bold text-amrit-navy">
                Add an optional photo
              </h3>
              <p className="text-xs sm:text-sm text-amrit-muted leading-relaxed font-medium">
                Upload a local picture for visible skin irritations or swelling to help add visual context to your triage assessment.
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="bg-white rounded-card-lg p-6 sm:p-8 border border-amrit-border shadow-soft hover:shadow-card transition-all space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-amrit-safeLight text-amrit-safe flex items-center justify-center font-bold text-lg">
              <Compass className="w-6 h-6" />
            </div>
            <div className="space-y-2">
              <div className="text-xs font-bold text-amrit-safe uppercase tracking-wider">
                Step 3
              </div>
              <h3 className="text-xl font-bold text-amrit-navy">
                Get safe next-step guidance
              </h3>
              <p className="text-xs sm:text-sm text-amrit-muted leading-relaxed font-medium">
                Receive clear direction on whether to monitor at home, consult a doctor soon, or call emergency services immediately.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 2: Multilingual Support */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-gradient-to-br from-amrit-navy via-amrit-navyLight to-slate-900 rounded-card-lg p-8 sm:p-12 text-white shadow-card-hover relative overflow-hidden">
          <div className="relative z-10 max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-amrit-cyan text-xs font-bold uppercase tracking-wider">
              <Globe2 className="w-4 h-4" />
              <span>Language Inclusivity</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white">
              Healthcare guidance in your mother tongue
            </h2>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-medium">
              Medical jargon creates barriers. Amrit bridges the gap with conversational triage available across prominent Indian languages.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5 pt-4">
              {SUPPORTED_LANGUAGES.map((lang) => (
                <div
                  key={lang.code}
                  className="p-3.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/15 space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-base text-white">{lang.nativeName}</span>
                    <span className="text-xs font-semibold text-amrit-cyan">{lang.name}</span>
                  </div>
                  <p className="text-xs text-slate-300 line-clamp-1 italic font-normal">
                    {lang.scriptSnippet}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Section 3: Safety-First Principles */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-12">
          <span className="text-xs font-bold text-amrit-teal uppercase tracking-widest bg-amrit-tealLight px-3 py-1 rounded-full">
            Clinical Guardrails
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-amrit-navy">
            Built with uncompromising safety
          </h2>
          <p className="text-sm sm:text-base text-amrit-muted">
            Engineered to guide you safely to real medical care while preventing risky self-diagnosis.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Pillar 1 */}
          <div className="bg-white rounded-card p-6 border border-amrit-border shadow-soft space-y-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amrit-consult flex items-center justify-center">
              <Stethoscope className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-amrit-navy">Not a diagnosis</h3>
            <p className="text-xs sm:text-sm text-amrit-muted leading-relaxed font-medium">
              Amrit never predicts specific disease names or provides prescriptions. It strictly indicates urgency and safe next steps.
            </p>
          </div>

          {/* Pillar 2 */}
          <div className="bg-white rounded-card p-6 border border-amrit-border shadow-soft space-y-3">
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-amrit-emergency flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-amrit-navy">Red-flag escalation</h3>
            <p className="text-xs sm:text-sm text-amrit-muted leading-relaxed font-medium">
              Any hint of critical distress (such as chest pain or airway swelling) immediately halts self-care and triggers national emergency alerts.
            </p>
          </div>

          {/* Pillar 3 */}
          <div className="bg-white rounded-card p-6 border border-amrit-border shadow-soft space-y-3">
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-amrit-teal flex items-center justify-center">
              <Lock className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-amrit-navy">Privacy-first design</h3>
            <p className="text-xs sm:text-sm text-amrit-muted leading-relaxed font-medium">
              No account creation, no medical record databases, and no cloud photo storage. Everything stays local in your browser session.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Strip */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="bg-amrit-tealLight border border-amrit-teal/30 rounded-card-lg p-8 sm:p-10 text-center space-y-5">
          <h2 className="text-2xl sm:text-3xl font-bold text-amrit-navy">
            Ready to check your symptoms?
          </h2>
          <p className="text-sm sm:text-base text-amrit-muted max-w-xl mx-auto font-medium">
            Takes less than 2 minutes. Free, private, and localized for your peace of mind.
          </p>
          <div>
            <Link
              to="/check"
              className="inline-flex items-center gap-2 px-8 py-4 text-base font-bold text-white bg-amrit-teal hover:bg-amrit-tealDark rounded-2xl shadow-card hover:shadow-card-hover transition-all"
            >
              <span>Begin Guided Check</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
