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
  Sparkles,
  ImageIcon,
  FileText,
  Globe,
  Loader2,
} from 'lucide-react';
import { SymptomFormData, TriageResult, LanguageCode } from '../types';
import { SafeMedicineGuide } from '../components/SafeMedicineGuide';
import { useToast } from '../hooks/useToast';
import { translateTriageResult } from '../services/triageService';

interface ResultPageProps {
  result: TriageResult | null;
  formData: SymptomFormData | null;
}

const LANGUAGES: Array<{ code: LanguageCode; name: string; nativeName: string }> = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்' },
];

export const ResultPage: React.FC<ResultPageProps> = ({ result, formData }) => {
  const { showToast } = useToast();
  const [currentResult, setCurrentResult] = useState<TriageResult | null>(result);
  const [isTranslating, setIsTranslating] = useState<boolean>(false);
  const [selectedLang, setSelectedLang] = useState<LanguageCode>(
    formData?.language || (result?.language?.code ? (result.language.code.split('-')[0] as LanguageCode) : 'en')
  );
  const [feedbackAnswered, setFeedbackAnswered] = useState<boolean>(false);

  // Fallback if accessed directly
  const activeResult: TriageResult = currentResult || result || {
    urgency: 'self-care',
    language: {
      requested: 'English',
      code: 'en-IN',
      translation_status: 'original_english',
    },
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
    emergencyAction: 'In an emergency, immediately call 112 or 108, or go to the nearest emergency department.',
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

  // Handle in-place language translation switch
  const handleLanguageChange = async (newLang: LanguageCode) => {
    if (newLang === selectedLang || isTranslating) return;
    setSelectedLang(newLang);
    setIsTranslating(true);

    try {
      const translated = await translateTriageResult(activeResult, newLang);
      setCurrentResult(translated);
      showToast(`Guidance updated to ${LANGUAGES.find((l) => l.code === newLang)?.name || newLang}.`, 'info');
    } catch (err) {
      console.error('Translation error:', err);
      showToast('Could not translate results. Showing English guidance.', 'warning');
    } finally {
      setIsTranslating(false);
    }
  };

  // Determine styling based on urgency
  let cardTheme = {
    bg: 'bg-amrit-safeLight/70 border-amrit-safe/40',
    icon: CheckCircle2,
    iconColor: 'text-amrit-safe',
    badgeClass: 'bg-amrit-safe text-white',
    urgencyText: 'Self-Care & Monitor',
  };

  if (isConsult) {
    cardTheme = {
      bg: 'bg-amrit-consultLight/80 border-amrit-consult/50',
      icon: AlertCircle,
      iconColor: 'text-amber-600',
      badgeClass: 'bg-amrit-consult text-white',
      urgencyText: 'Consult a Doctor Soon',
    };
  } else if (isEmergency) {
    cardTheme = {
      bg: 'bg-amrit-emergencyLight border-amrit-emergency/60',
      icon: AlertOctagon,
      iconColor: 'text-amrit-emergency',
      badgeClass: 'bg-amrit-emergency text-white',
      urgencyText: 'Emergency Care Now',
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
    showToast('Emergency-call integration will be available in a future version. Dial 112 / 108.', 'warning');
  };

  const showMedicineGuide =
    isSelfCare &&
    activeResult.medicineGuideEligible &&
    activeResult.evaluatedAgeGroup.toLowerCase() === 'adult';

  const isFallbackEnglish = activeResult.language?.translation_status === 'fallback_english';

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Top Bar Navigation & Language Switcher */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-amrit-border">
        <Link
          to="/check"
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-amrit-navy hover:text-amrit-teal transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to symptom check</span>
        </Link>

        {/* Compact Result-Page Language Switcher */}
        <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-amrit-border shadow-soft">
          <Globe className="w-4 h-4 text-amrit-teal" />
          <span className="text-xs font-bold text-amrit-navy mr-1">Language:</span>
          <div className="flex items-center gap-1">
            {LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                onClick={() => handleLanguageChange(lang.code)}
                disabled={isTranslating}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                  selectedLang === lang.code
                    ? 'bg-amrit-teal text-white shadow-soft'
                    : 'text-amrit-navy hover:bg-amrit-bg'
                }`}
                title={lang.name}
              >
                {lang.nativeName}
              </button>
            ))}
          </div>
          {isTranslating && <Loader2 className="w-3.5 h-3.5 text-amrit-teal animate-spin ml-1" />}
        </div>
      </div>

      {/* Fallback English Notice Banner (if translation unavailable) */}
      {isFallbackEnglish && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-xs sm:text-sm font-semibold flex items-center gap-3 animate-fade-in shadow-soft">
          <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
          <div>
            <p className="font-bold">Translation is temporarily unavailable. Showing English guidance.</p>
            <p className="text-xs text-amber-700 font-normal">
              All safety rules, emergency guidance, and non-diagnostic recommendations remain intact.
            </p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="space-y-2 text-center sm:text-left">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amrit-tealLight text-amrit-teal text-xs font-bold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Triage Guidance Complete</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-amrit-navy">
          Your Amrit guidance
        </h1>
        <p className="text-sm sm:text-base text-amrit-muted font-medium">
          A clear next-step summary based on the information shared.
        </p>
      </div>

      {/* Main Urgency Result Card */}
      <div className={`rounded-card-lg border-2 p-6 sm:p-10 shadow-card space-y-8 transition-all ${cardTheme.bg}`}>
        {/* Top Header Badge */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-current/15">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white text-amrit-navy text-xs font-bold shadow-soft border border-amrit-border">
            <ShieldCheck className="w-4 h-4 text-amrit-teal" />
            <span>Triage guidance — not a diagnosis</span>
          </span>

          <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${cardTheme.badgeClass}`}>
            Priority Tier {activeResult.carePathStep} of 3 • {cardTheme.urgencyText}
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

        {/* Emergency Action Callout (if emergency) */}
        {isEmergency && (
          <div className="p-5 rounded-2xl bg-white border-2 border-amrit-emergency shadow-glow-emergency space-y-4">
            <div className="flex items-center gap-3 text-amrit-emergency">
              <PhoneCall className="w-6 h-6 animate-bounce" />
              <h3 className="text-lg font-extrabold">Immediate Action Required</h3>
            </div>
            <p className="text-sm font-semibold text-amrit-navy">
              {activeResult.emergencyAction || 'Call emergency numbers 112 or 108 immediately, or go to the nearest emergency room.'}
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <a
                href="tel:112"
                onClick={handleEmergencyCall}
                className="flex-1 min-w-[140px] px-4 py-3 bg-amrit-emergency hover:bg-amrit-emergency/90 text-white font-bold rounded-xl text-center shadow-soft transition-all flex items-center justify-center gap-2 text-sm"
              >
                <PhoneCall className="w-4 h-4" />
                <span>Call 112 (National)</span>
              </a>
              <a
                href="tel:108"
                onClick={handleEmergencyCall}
                className="flex-1 min-w-[140px] px-4 py-3 bg-amrit-emergency hover:bg-amrit-emergency/90 text-white font-bold rounded-xl text-center shadow-soft transition-all flex items-center justify-center gap-2 text-sm"
              >
                <PhoneCall className="w-4 h-4" />
                <span>Call 108 (Ambulance)</span>
              </a>
            </div>
          </div>
        )}

        {/* 3-Tier Care-Path Visualizer */}
        <div className="bg-white/90 rounded-card p-5 sm:p-6 border border-current/20 space-y-3 shadow-soft">
          <div className="flex items-center justify-between text-xs font-bold text-amrit-muted uppercase tracking-wider">
            <span>Care Pathway Tracker</span>
            <span>Step {activeResult.carePathStep} of 3</span>
          </div>
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            <div
              className={`p-3 rounded-xl border text-center transition-all ${
                activeResult.carePathStep === 1
                  ? 'bg-amrit-safeLight border-amrit-safe text-amrit-navy ring-2 ring-amrit-safe/30'
                  : 'bg-amrit-bg/50 border-amrit-border text-amrit-muted'
              }`}
            >
              <p className="text-xs font-bold">1. Self-care</p>
              <p className="text-[11px] text-amrit-muted hidden sm:block">Monitor & Rest</p>
            </div>
            <div
              className={`p-3 rounded-xl border text-center transition-all ${
                activeResult.carePathStep === 2
                  ? 'bg-amrit-consultLight border-amrit-consult text-amrit-navy ring-2 ring-amrit-consult/30'
                  : 'bg-amrit-bg/50 border-amrit-border text-amrit-muted'
              }`}
            >
              <p className="text-xs font-bold">2. Consult</p>
              <p className="text-[11px] text-amrit-muted hidden sm:block">Doctor or Clinic</p>
            </div>
            <div
              className={`p-3 rounded-xl border text-center transition-all ${
                activeResult.carePathStep === 3
                  ? 'bg-amrit-emergencyLight border-amrit-emergency text-amrit-navy ring-2 ring-amrit-emergency/30'
                  : 'bg-amrit-bg/50 border-amrit-border text-amrit-muted'
              }`}
            >
              <p className="text-xs font-bold">3. Emergency</p>
              <p className="text-[11px] text-amrit-muted hidden sm:block">112 / 108 Urgent</p>
            </div>
          </div>
        </div>
      </div>

      {/* Possible Concerns to Discuss with a Clinician */}
      {activeResult.possibleConcerns && activeResult.possibleConcerns.length > 0 && !isEmergency && (
        <div className="bg-white rounded-card-lg border border-amrit-border p-6 sm:p-8 shadow-card space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amrit-tealLight flex items-center justify-center text-amrit-teal font-bold text-sm">
              🩺
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-amrit-navy">
              Possible concerns to discuss with a clinician
            </h3>
          </div>
          <p className="text-xs text-amrit-muted">
            These are broad, non-diagnostic symptom categories to mention when speaking to a doctor.
          </p>
          <div className="space-y-3 pt-2">
            {activeResult.possibleConcerns.map((concern, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-amrit-bg border border-amrit-border space-y-1">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amrit-teal flex-shrink-0" />
                  <h4 className="text-sm font-bold text-amrit-navy">{concern.category}</h4>
                </div>
                <p className="text-xs text-amber-700 italic pl-4">
                  {concern.uncertainty_note || 'Cannot be confirmed from this information alone.'}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Multimodal Context Cards: Photo and Document Review */}
      {(activeResult.imageContext.provided || activeResult.documentContext.provided) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Image Context */}
          {activeResult.imageContext.provided && (
            <div className="bg-white rounded-card-lg border border-amrit-border p-5 shadow-card space-y-3">
              <div className="flex items-center gap-2 text-amrit-teal font-bold text-sm">
                <ImageIcon className="w-4 h-4" />
                <h4>Visual Context Observation</h4>
              </div>
              <p className="text-xs text-amrit-navy font-medium leading-relaxed">
                {activeResult.imageContext.observation}
              </p>
              <p className="text-[11px] text-amrit-muted italic border-t border-amrit-border/60 pt-2">
                <strong>Limitation:</strong> {activeResult.imageContext.limitation}
              </p>
            </div>
          )}

          {/* Document Context */}
          {activeResult.documentContext.provided && (
            <div className="bg-white rounded-card-lg border border-amrit-border p-5 shadow-card space-y-3">
              <div className="flex items-center gap-2 text-amrit-blue font-bold text-sm">
                <FileText className="w-4 h-4" />
                <h4>Reference Document Context</h4>
              </div>
              <p className="text-xs text-amrit-navy font-medium leading-relaxed">
                {activeResult.documentContext.summary}
              </p>
              <p className="text-[11px] text-amrit-muted italic border-t border-amrit-border/60 pt-2">
                <strong>Limitation:</strong> {activeResult.documentContext.limitation}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Safe Next Steps & Red Flags */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        {/* Safe Next Steps */}
        <div className="bg-white rounded-card-lg border border-amrit-border p-6 sm:p-8 shadow-card space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amrit-safeLight flex items-center justify-center text-amrit-safe font-bold text-sm">
              ✓
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-amrit-navy">Safe Next Steps</h3>
          </div>
          <ul className="space-y-3">
            {activeResult.safeNextSteps.map((step, idx) => (
              <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-amrit-navy">
                <span className="w-1.5 h-1.5 rounded-full bg-amrit-teal mt-1.5 flex-shrink-0" />
                <span className="font-medium">{step}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Urgent Warning Signs (Red Flags) */}
        <div className="bg-white rounded-card-lg border border-amrit-border p-6 sm:p-8 shadow-card space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amrit-emergencyLight flex items-center justify-center text-amrit-emergency font-bold text-sm">
              ⚠
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-amrit-navy">Watch for Warning Signs</h3>
          </div>
          <p className="text-xs text-amrit-muted font-medium">
            Seek immediate medical attention (112 / 108) if any of the following occur:
          </p>
          <ul className="space-y-2.5">
            {activeResult.redFlags.map((flag, idx) => (
              <li key={idx} className="flex items-start gap-2 text-xs text-amrit-emergency font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-amrit-emergency mt-1.5 flex-shrink-0" />
                <span>{flag}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Safe Medicine Guide (Self-Care & Adult Only) */}
      {showMedicineGuide && <SafeMedicineGuide />}

      {/* Feedback & Actions */}
      <div className="bg-white rounded-card-lg border border-amrit-border p-6 sm:p-8 shadow-card space-y-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center sm:text-left">
            <h4 className="text-sm font-bold text-amrit-navy">Was this guidance helpful?</h4>
            <p className="text-xs text-amrit-muted">Help us improve the Amrit triage demo.</p>
          </div>

          {!feedbackAnswered ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleFeedback('Yes, clear')}
                className="px-4 py-2 rounded-xl bg-amrit-bg hover:bg-amrit-tealLight text-amrit-navy text-xs font-bold border border-amrit-border transition-all"
              >
                👍 Yes, clear
              </button>
              <button
                onClick={() => handleFeedback('Somewhat')}
                className="px-4 py-2 rounded-xl bg-amrit-bg hover:bg-amrit-tealLight text-amrit-navy text-xs font-bold border border-amrit-border transition-all"
              >
                😐 Somewhat
              </button>
              <button
                onClick={() => handleFeedback('Needs detail')}
                className="px-4 py-2 rounded-xl bg-amrit-bg hover:bg-amrit-tealLight text-amrit-navy text-xs font-bold border border-amrit-border transition-all"
              >
                👎 Needs detail
              </button>
            </div>
          ) : (
            <span className="text-xs font-bold text-amrit-safe flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              <span>Feedback recorded. Thank you!</span>
            </span>
          )}
        </div>

        <div className="pt-4 border-t border-amrit-border flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownload}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amrit-bg hover:bg-amrit-tealLight text-amrit-navy text-xs font-bold border border-amrit-border transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Summary</span>
            </button>
            <button
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amrit-bg hover:bg-amrit-tealLight text-amrit-navy text-xs font-bold border border-amrit-border transition-all"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Share Link</span>
            </button>
          </div>

          <Link
            to="/check"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amrit-teal text-white text-xs font-bold shadow-soft hover:bg-amrit-teal/90 transition-all"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Start New Check</span>
          </Link>
        </div>
      </div>

      {/* Non-Diagnostic Disclaimer Footer */}
      <div className="p-4 rounded-xl bg-amrit-bg border border-amrit-border text-center space-y-1">
        <p className="text-xs font-bold text-amrit-navy">
          Demo guidance — not a diagnosis.
        </p>
        <p className="text-[11px] text-amrit-muted leading-relaxed max-w-2xl mx-auto">
          {activeResult.disclaimer}
        </p>
      </div>
    </div>
  );
};
