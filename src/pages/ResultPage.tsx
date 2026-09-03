import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  AlertOctagon,
  ArrowLeft,
  RotateCcw,
  Download,
  Share2,
  PhoneCall,
  AlertTriangle,
  Sparkles,
  ImageIcon,
  FileText,
  AlertCircle as AlertIcon,
} from 'lucide-react';
import { SymptomFormData, TriageResult } from '../types';
import { SafeMedicineGuide } from '../components/SafeMedicineGuide';
import { useToast } from '../hooks/useToast';

interface ResultPageProps {
  result: TriageResult | null;
  formData: SymptomFormData | null;
}

export const ResultPage: React.FC<ResultPageProps> = ({ result, formData }) => {
  const { showToast } = useToast();
  const [feedbackAnswered, setFeedbackAnswered] = useState<boolean>(false);

  // Fallback if accessed directly
  const activeResult: TriageResult = result || {
    urgency: 'self-care',
    headline: 'Self-care and monitor',
    summary:
      'Your symptoms may be suitable for gentle self-care and monitoring. Seek care if symptoms worsen or new warning signs appear.',
    possibleConcerns: [
      {
        category: 'Mild seasonal discomfort concern',
        uncertainty_note: 'Cannot be confirmed from this information alone.',
      },
    ],
    imageContext: {
      provided: false,
      quality: 'not_provided',
      observation: 'No image provided for visual review.',
      limitation: 'Image context cannot replace physical clinical examination or provide a definitive diagnosis.',
    },
    documentContext: {
      provided: false,
      summary: 'No document provided.',
      limitation: 'Document content is user-provided context only and is not clinically interpreted as a diagnosis.',
    },
    medicineGuideEligible: true,
    carePathStep: 1,
    rationale:
      'Amrit uses the information shared in this triage session, such as symptoms, duration, selected language, and optional image/PDF context, to show general next-step guidance. It cannot confirm the cause of a symptom.',
    safeNextSteps: [
      'Get plenty of rest and stay hydrated with clean fluids.',
      'Keep track of your symptoms over the next 24 to 48 hours.',
      'Speak with a pharmacist or healthcare provider before using non-prescription relief.',
      'Seek prompt medical care if your condition changes or you feel uncertain.',
    ],
    redFlags: [
      'Difficulty breathing or rapid gasping for breath',
      'Facial, lip, tongue, or throat swelling',
      'Severe, crushing chest pain or pressure',
      'Heavy, unstoppable bleeding from any site',
      'Active seizures or convulsions',
      'Fainting, unresponsiveness, confusion, or unusual drowsiness',
    ],
    disclaimer:
      'Amrit provides general triage guidance only. It does not diagnose conditions, prescribe medicines, or replace a qualified healthcare professional.',
    evaluatedLanguage: 'English',
    evaluatedAgeGroup: 'Adult',
    evaluatedDuration: 'Started today',
    hasPhotoContext: false,
    hasDocumentContext: false,
  };

  const isEmergency = activeResult.urgency === 'emergency';
  const isConsult = activeResult.urgency === 'consult';
  const isSelfCare = activeResult.urgency === 'self-care';

  // Determine styling based on urgency
  let cardTheme = {
    bg: 'bg-amrit-safeLight/70 border-amrit-safe/40',
    icon: CheckCircle2,
    iconColor: 'text-amrit-safe',
    badgeClass: 'bg-amrit-safe text-white',
  };

  if (isConsult) {
    cardTheme = {
      bg: 'bg-amrit-consultLight/80 border-amrit-consult/50',
      icon: AlertCircle,
      iconColor: 'text-amber-600',
      badgeClass: 'bg-amrit-consult text-white',
    };
  } else if (isEmergency) {
    cardTheme = {
      bg: 'bg-amrit-emergencyLight border-amrit-emergency/60',
      icon: AlertOctagon,
      iconColor: 'text-amrit-emergency',
      badgeClass: 'bg-amrit-emergency text-white',
    };
  }

  const ResultIcon = cardTheme.icon;

  const handleFeedback = (response: string) => {
    setFeedbackAnswered(true);
    showToast(`Thank you for your feedback ("${response}")! We appreciate your help in improving Amrit.`, 'success');
  };

  const handleDownload = () => {
    showToast('Triage guidance summary downloaded (simulated PDF export).', 'info');
  };

  const handleShare = () => {
    showToast('Summary link copied for sharing with your healthcare provider.', 'info');
  };

  const handleEmergencyCall = () => {
    showToast('Emergency-call integration will be available in a future version.', 'warning');
  };

  // Safe Medicine Guide visibility rule:
  // Must be self-care AND medicineGuideEligible AND Adult age group
  const showMedicineGuide =
    isSelfCare &&
    activeResult.medicineGuideEligible &&
    activeResult.evaluatedAgeGroup.toLowerCase() === 'adult';

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-10">
      {/* Top Bar Navigation */}
      <div className="flex items-center justify-between">
        <Link
          to="/check"
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-amrit-navy hover:text-amrit-teal transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to symptom check</span>
        </Link>
        <span className="text-xs font-semibold text-amrit-muted">
          Session ID: #DEMO-{Math.floor(1000 + Math.random() * 9000)}
        </span>
      </div>

      {/* Header */}
      <div className="space-y-2 text-center sm:text-left">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amrit-tealLight text-amrit-teal text-xs font-bold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Triage Complete</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-amrit-navy">
          Your Amrit guidance
        </h1>
        <p className="text-sm sm:text-base text-amrit-muted font-medium">
          A clear next-step summary based on the information shared.
        </p>
      </div>

      {/* Main Urgency Result Card */}
      <div
        className={`rounded-card-lg border-2 p-6 sm:p-10 shadow-card space-y-8 transition-all ${cardTheme.bg}`}
      >
        {/* Top Header Badge */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-current/15">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white text-amrit-navy text-xs font-bold shadow-soft border border-amrit-border">
            <ShieldCheck className="w-4 h-4 text-amrit-teal" />
            <span>Triage guidance — not a diagnosis</span>
          </span>

          <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${cardTheme.badgeClass}`}>
            Priority Tier {activeResult.carePathStep} of 3
          </span>
        </div>

        {/* Big Outcome Display */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white shadow-soft flex items-center justify-center flex-shrink-0">
            <ResultIcon className={`w-10 h-10 sm:w-12 sm:h-12 ${cardTheme.iconColor}`} />
          </div>
          <div className="space-y-1.5">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-amrit-navy">
              {activeResult.headline}
            </h2>
            <p className="text-sm sm:text-base text-amrit-navy/90 font-medium leading-relaxed">
              {activeResult.summary}
            </p>
          </div>
        </div>

        {/* 3-Tier Care-Path Visualizer */}
        <div className="bg-white/90 rounded-card p-5 sm:p-6 border border-current/20 space-y-3 shadow-soft">
          <div className="flex items-center justify-between text-xs font-bold text-amrit-muted uppercase tracking-wider">
            <span>Care Pathway Tracker</span>
            <span>Outcome: {activeResult.headline}</span>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-1">
            {/* Step 1: Self-care */}
            <div
              className={`p-3 rounded-xl border text-center transition-all ${
                activeResult.carePathStep === 1
                  ? 'bg-amrit-safeLight border-amrit-safe text-amrit-safe font-bold ring-2 ring-amrit-safe/30'
                  : 'bg-white border-amrit-border/70 text-amrit-muted opacity-70'
              }`}
            >
              <div className="text-xs font-bold">1. Self-care</div>
              <div className="text-[10px] hidden sm:block">Monitor at home</div>
            </div>

            {/* Step 2: Consult */}
            <div
              className={`p-3 rounded-xl border text-center transition-all ${
                activeResult.carePathStep === 2
                  ? 'bg-amber-100 border-amrit-consult text-amber-800 font-bold ring-2 ring-amrit-consult/30'
                  : 'bg-white border-amrit-border/70 text-amrit-muted opacity-70'
              }`}
            >
              <div className="text-xs font-bold">2. Consult Soon</div>
              <div className="text-[10px] hidden sm:block">Healthcare clinic</div>
            </div>

            {/* Step 3: Emergency */}
            <div
              className={`p-3 rounded-xl border text-center transition-all ${
                activeResult.carePathStep === 3
                  ? 'bg-rose-100 border-amrit-emergency text-rose-800 font-bold ring-2 ring-amrit-emergency/30'
                  : 'bg-white border-amrit-border/70 text-amrit-muted opacity-70'
              }`}
            >
              <div className="text-xs font-bold">3. Emergency</div>
              <div className="text-[10px] hidden sm:block">Call 112 / 108</div>
            </div>
          </div>
        </div>

        {/* User Input Context */}
        {formData && (
          <div className="bg-white/80 p-4 rounded-xl border border-current/20 text-xs space-y-1.5">
            <span className="font-bold text-amrit-navy uppercase text-[11px]">
              Assessed Input Context:
            </span>
            <p className="text-amrit-navy font-medium italic">
              "{formData.symptomsText}"
            </p>
            <div className="flex flex-wrap gap-2 text-[11px] text-amrit-muted pt-1">
              <span>Age: <strong className="text-amrit-navy">{formData.ageGroup.replace('_', ' ')}</strong></span>
              <span>•</span>
              <span>Duration: <strong className="text-amrit-navy">{formData.duration.replace(/_/g, ' ')}</strong></span>
              {formData.photoPreviewUrl && (
                <>
                  <span>•</span>
                  <span className="text-amrit-teal font-bold">Photo attached</span>
                </>
              )}
              {formData.documentFileName && (
                <>
                  <span>•</span>
                  <span className="text-amrit-blue font-bold">PDF attached</span>
                </>
              )}
            </div>
          </div>
        )}

        {/* Reassurance Disclaimer */}
        <div className="text-center pt-2">
          <p className="text-xs text-amrit-muted font-semibold">
            “{activeResult.disclaimer}”
          </p>
        </div>
      </div>

      {/* Section 1: Possible concerns to discuss with a clinician */}
      {!isEmergency && activeResult.possibleConcerns.length > 0 && (
        <div className="bg-white rounded-card-lg border border-amrit-border p-6 sm:p-8 shadow-soft space-y-4">
          <div className="flex items-center gap-2">
            <AlertIcon className="w-5 h-5 text-amrit-teal" />
            <h3 className="text-lg font-bold text-amrit-navy">
              Possible concerns to discuss with a clinician
            </h3>
          </div>
          <p className="text-xs text-amrit-muted font-medium">
            Broad topics to mention during a clinical appointment (not confirmed diagnoses):
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
            {activeResult.possibleConcerns.map((concern, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl bg-amrit-bg border border-amrit-border space-y-2 hover:border-amrit-teal/40 transition-colors"
              >
                <div className="text-xs sm:text-sm font-bold text-amrit-navy">
                  {concern.category}
                </div>
                <div className="text-[11px] text-amrit-muted italic font-medium">
                  {concern.uncertainty_note}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Section 2: Multimodal Contexts (Image & Document) */}
      {(activeResult.imageContext.provided || activeResult.documentContext.provided) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Image Context */}
          {activeResult.imageContext.provided && (
            <div className="bg-white rounded-card p-5 border border-amrit-border shadow-soft space-y-2">
              <div className="flex items-center gap-2 text-amrit-teal font-bold text-sm">
                <ImageIcon className="w-4 h-4" />
                <span>Image context</span>
              </div>
              <p className="text-xs text-amrit-navy font-medium leading-relaxed">
                {activeResult.imageContext.observation}
              </p>
              <div className="text-[11px] text-amrit-muted italic pt-1 border-t border-amrit-border/60">
                <strong>Limitation:</strong> {activeResult.imageContext.limitation}
              </div>
            </div>
          )}

          {/* Document Context */}
          {activeResult.documentContext.provided && (
            <div className="bg-white rounded-card p-5 border border-amrit-border shadow-soft space-y-2">
              <div className="flex items-center gap-2 text-amrit-blue font-bold text-sm">
                <FileText className="w-4 h-4" />
                <span>Document context</span>
              </div>
              <p className="text-xs text-amrit-navy font-medium leading-relaxed">
                {activeResult.documentContext.summary}
              </p>
              <div className="text-[11px] text-amrit-muted italic pt-1 border-t border-amrit-border/60">
                <strong>Limitation:</strong> {activeResult.documentContext.limitation}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Section 3: Safe Next Steps */}
      <div className="bg-white rounded-card-lg border border-amrit-border p-6 sm:p-8 shadow-soft space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-amrit-teal" />
          <h3 className="text-lg font-bold text-amrit-navy">Safe Next Steps</h3>
        </div>
        <ul className="space-y-3 text-xs sm:text-sm text-amrit-navy font-medium">
          {activeResult.safeNextSteps.map((step, idx) => (
            <li key={idx} className="flex items-start gap-3 p-3 rounded-xl bg-amrit-bg border border-amrit-border">
              <span className="w-6 h-6 rounded-full bg-amrit-tealLight text-amrit-teal text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                {idx + 1}
              </span>
              <span className="leading-relaxed">{step}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Section 4: Red Flags (Emergency Alert Card) */}
      <div className="bg-rose-50 border-2 border-amrit-emergency/40 rounded-card-lg p-6 sm:p-8 space-y-4">
        <div className="flex items-center gap-2.5 text-amrit-emergency">
          <AlertTriangle className="w-6 h-6 flex-shrink-0" />
          <h3 className="text-lg font-bold">
            Seek emergency help now if you notice:
          </h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {activeResult.redFlags.map((flag, idx) => (
            <div
              key={idx}
              className="flex items-center gap-2 p-2.5 rounded-xl bg-white/80 border border-rose-200 text-xs sm:text-sm font-semibold text-rose-950"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-amrit-emergency flex-shrink-0" />
              <span>{flag}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Section 5: Safe Medicine Guide (Conditional: ONLY for Adult Self-Care) */}
      {showMedicineGuide && <SafeMedicineGuide />}

      {/* Section 6: Feedback */}
      <div className="bg-white rounded-card p-6 border border-amrit-border shadow-soft flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h4 className="text-sm font-bold text-amrit-navy">
            Was this guidance easy to understand?
          </h4>
          <p className="text-xs text-amrit-muted">
            Help us improve language clarity and clinical safety.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {['Yes', 'Somewhat', 'No'].map((ans) => (
            <button
              key={ans}
              type="button"
              onClick={() => handleFeedback(ans)}
              disabled={feedbackAnswered}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                feedbackAnswered
                  ? 'bg-amrit-bg text-amrit-muted border-amrit-border cursor-default'
                  : 'bg-white hover:bg-amrit-tealLight text-amrit-navy border-amrit-border hover:border-amrit-teal shadow-soft'
              }`}
            >
              {ans}
            </button>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-amrit-border">
        <Link
          to="/check"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-amrit-navy hover:bg-amrit-navyLight text-white text-xs sm:text-sm font-bold shadow-soft transition-all"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Start a new symptom check</span>
        </Link>

        {isEmergency ? (
          <button
            type="button"
            onClick={handleEmergencyCall}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-amrit-emergency hover:bg-rose-600 text-white text-xs sm:text-sm font-bold shadow-soft transition-all"
          >
            <PhoneCall className="w-4 h-4" />
            <span>Emergency help: 112 / 108</span>
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDownload}
              className="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-white hover:bg-amrit-bg text-amrit-navy border border-amrit-border text-xs sm:text-sm font-bold shadow-soft transition-all"
            >
              <Download className="w-4 h-4 text-amrit-teal" />
              <span>Download summary</span>
            </button>

            <button
              type="button"
              onClick={handleShare}
              className="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-white hover:bg-amrit-bg text-amrit-navy border border-amrit-border text-xs sm:text-sm font-bold shadow-soft transition-all"
            >
              <Share2 className="w-4 h-4 text-amrit-teal" />
              <span>Share with doctor</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
