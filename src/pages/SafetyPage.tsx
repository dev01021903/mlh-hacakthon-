import React from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  AlertTriangle,
  Lock,
  PhoneCall,
  Pill,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Info,
} from 'lucide-react';
import { useToast } from '../hooks/useToast';

export const SafetyPage: React.FC = () => {
  const { showToast } = useToast();

  const handleEmergencyClick = () => {
    showToast('Emergency-call integration will be available in a future version.', 'warning');
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-16 space-y-16">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amrit-tealLight text-amrit-teal text-xs sm:text-sm font-bold shadow-soft">
          <ShieldCheck className="w-4 h-4" />
          <span>Safety-First Healthcare Design</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-amrit-navy tracking-tight">
          Our Safety Principles & Clinical Philosophy
        </h1>
        <p className="text-base sm:text-lg text-amrit-muted font-medium leading-relaxed">
          Amrit was built to guide—not replace—human healthcare professionals. Here is how our system ensures user safety at every step.
        </p>
      </div>

      {/* Hero Banner Quote */}
      <div className="bg-gradient-to-r from-amrit-navy to-amrit-navyLight text-white rounded-card-lg p-6 sm:p-10 shadow-card space-y-4">
        <div className="flex items-center gap-3 text-amrit-cyan">
          <Info className="w-6 h-6 flex-shrink-0" />
          <h2 className="text-lg sm:text-xl font-bold">Mandatory Clinical Disclaimer</h2>
        </div>
        <p className="text-sm sm:text-base text-slate-200 leading-relaxed font-medium">
          “Amrit provides general triage guidance only. It does not diagnose conditions, prescribe medicines, or replace a qualified healthcare professional.”
        </p>
      </div>

      {/* Grid: What Amrit Does vs What Amrit Does NOT Do */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* What Amrit Does */}
        <div className="bg-white rounded-card-lg border border-amrit-safe/40 shadow-soft p-6 sm:p-8 space-y-6">
          <div className="flex items-center gap-3 text-amrit-safe">
            <div className="w-10 h-10 rounded-xl bg-amrit-safeLight flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-amrit-navy">What Amrit Does</h3>
          </div>

          <ul className="space-y-3.5 text-xs sm:text-sm text-amrit-navy font-medium">
            <li className="flex items-start gap-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amrit-safe mt-2 flex-shrink-0" />
              <span>Helps users articulate confusing symptoms in 5 regional Indian languages.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amrit-safe mt-2 flex-shrink-0" />
              <span>Triage symptoms into 3 actionable urgency levels (Self-care, Consult doctor, Emergency).</span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amrit-safe mt-2 flex-shrink-0" />
              <span>Highlights red-flag emergency symptoms that require urgent attention.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amrit-safe mt-2 flex-shrink-0" />
              <span>Provides category-level pharmacist discussion points for mild self-care scenarios.</span>
            </li>
          </ul>
        </div>

        {/* What Amrit Does NOT Do */}
        <div className="bg-white rounded-card-lg border border-amrit-emergency/40 shadow-soft p-6 sm:p-8 space-y-6">
          <div className="flex items-center gap-3 text-amrit-emergency">
            <div className="w-10 h-10 rounded-xl bg-amrit-emergencyLight flex items-center justify-center">
              <XCircle className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-amrit-navy">What Amrit Does NOT Do</h3>
          </div>

          <ul className="space-y-3.5 text-xs sm:text-sm text-amrit-navy font-medium">
            <li className="flex items-start gap-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amrit-emergency mt-2 flex-shrink-0" />
              <span>Does NOT diagnose medical conditions or predict specific diseases.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amrit-emergency mt-2 flex-shrink-0" />
              <span>Does NOT prescribe medications, specify brand names, or calculate dosages.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amrit-emergency mt-2 flex-shrink-0" />
              <span>Does NOT sell medicines, provide shopping carts, or handle pharmaceutical deliveries.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amrit-emergency mt-2 flex-shrink-0" />
              <span>Does NOT replace hands-on clinical examination by a qualified doctor.</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Emergency Situations & 112 / 108 */}
      <div className="bg-rose-50 border-2 border-amrit-emergency/40 rounded-card-lg p-6 sm:p-10 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amrit-emergency text-white flex items-center justify-center shadow-soft">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl sm:text-2xl font-extrabold text-amrit-navy">
                Emergency Protocol (112 / 108)
              </h3>
              <p className="text-xs sm:text-sm text-rose-900 font-medium">
                When seconds count, do not wait for digital apps.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleEmergencyClick}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-amrit-emergency hover:bg-rose-600 text-white text-xs sm:text-sm font-bold rounded-xl shadow-soft transition-all active:scale-95"
          >
            <PhoneCall className="w-4 h-4" />
            <span>Emergency Help: 112 / 108</span>
          </button>
        </div>

        <p className="text-xs sm:text-sm text-amrit-navy font-medium leading-relaxed">
          If you or someone around you experiences severe chest pain, sudden difficulty breathing, heavy uncontrolled bleeding, loss of consciousness, facial or throat swelling, or sudden paralysis/slurred speech, immediately contact national emergency services (112 or 108) or proceed to the nearest emergency room.
        </p>
      </div>

      {/* Medicine Safety Protocol */}
      <div className="bg-white rounded-card-lg border border-amrit-border p-6 sm:p-10 shadow-soft space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amrit-tealLight text-amrit-teal flex items-center justify-center">
            <Pill className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-amrit-navy">Medicine Safety Philosophy</h3>
            <p className="text-xs text-amrit-muted">Category-level educational discussions only</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs sm:text-sm">
          <div className="p-4 rounded-xl bg-amrit-bg border border-amrit-border space-y-2">
            <h4 className="font-bold text-amrit-navy">Zero Brand Endorsement</h4>
            <p className="text-amrit-muted font-medium">
              We never promote pharmaceutical brands, manufacturers, or commercial products.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-amrit-bg border border-amrit-border space-y-2">
            <h4 className="font-bold text-amrit-navy">Zero Dosage Calculations</h4>
            <p className="text-amrit-muted font-medium">
              Dosages vary by organ function, pediatric weight, and clinical status. We strictly defer all dosing to pharmacists.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-amrit-bg border border-amrit-border space-y-2">
            <h4 className="font-bold text-amrit-navy">Contraindication Screening</h4>
            <p className="text-amrit-muted font-medium">
              If pregnancy, chronic liver/kidney disease, or pediatric age are reported, all medicine categories are immediately suppressed.
            </p>
          </div>
        </div>
      </div>

      {/* Privacy by Design */}
      <div className="bg-white rounded-card-lg border border-amrit-border p-6 sm:p-10 shadow-soft space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-amrit-blue flex items-center justify-center">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-amrit-navy">Privacy by Design</h3>
            <p className="text-xs text-amrit-muted">Local-first browser session security</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
          <div className="p-4 rounded-xl bg-amrit-bg border border-amrit-border space-y-1.5">
            <span className="font-bold text-amrit-navy">No User Accounts Required</span>
            <p className="text-amrit-muted font-medium">
              You can perform triage without entering your name, phone number, or email.
            </p>
          </div>
          <div className="p-4 rounded-xl bg-amrit-bg border border-amrit-border space-y-1.5">
            <span className="font-bold text-amrit-navy">Ephemeral Image Processing</span>
            <p className="text-amrit-muted font-medium">
              Uploaded photos remain in local browser memory via object URLs and are never uploaded to persistent cloud storage.
            </p>
          </div>
        </div>
      </div>

      {/* Hackathon Disclaimer Banner */}
      <div className="p-6 rounded-card bg-amrit-bg border border-amrit-border text-center space-y-2">
        <p className="text-xs sm:text-sm font-bold text-amrit-navy">
          Hackathon Frontend Prototype Notice
        </p>
        <p className="text-xs text-amrit-muted max-w-2xl mx-auto font-medium">
          This web application is a concept prototype built for demonstrative purposes. It is not approved by any medical regulatory body for diagnostic or treatment decisions.
        </p>
      </div>

      {/* CTA */}
      <div className="text-center pt-4">
        <Link
          to="/check"
          className="inline-flex items-center gap-2 px-8 py-4 bg-amrit-teal hover:bg-amrit-tealDark text-white text-base font-bold rounded-2xl shadow-card hover:shadow-card-hover transition-all"
        >
          <span>Try the Symptom Checker</span>
          <ArrowRight className="w-5 h-5" />
        </Link>
      </div>
    </div>
  );
};
