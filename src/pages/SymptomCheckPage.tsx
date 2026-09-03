import React, { useState, useRef, ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Globe,
  MessageSquare,
  Image as ImageIcon,
  CheckSquare,
  Mic,
  MicOff,
  UploadCloud,
  Camera,
  Trash2,
  AlertTriangle,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Info,
  CheckCircle2,
} from 'lucide-react';
import { SUPPORTED_LANGUAGES } from '../data/languages';
import { COMMON_SYMPTOM_TAGS } from '../data/mockData';
import { AgeGroup, LanguageCode, SymptomDuration, SymptomFormData, TriageResult } from '../types';
import { evaluateSymptoms } from '../services/triageService';
import { AnalysisLoading } from '../components/AnalysisLoading';
import { useToast } from '../hooks/useToast';

interface SymptomCheckPageProps {
  onEvaluationComplete: (result: TriageResult, formData: SymptomFormData) => void;
  defaultLanguage?: LanguageCode;
}

export const SymptomCheckPage: React.FC<SymptomCheckPageProps> = ({
  onEvaluationComplete,
  defaultLanguage = 'en',
}) => {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [isListening, setIsListening] = useState<boolean>(false);

  // Form State
  const [language, setLanguage] = useState<LanguageCode>(defaultLanguage);
  const [ageGroup, setAgeGroup] = useState<AgeGroup>('adult');
  const [duration, setDuration] = useState<SymptomDuration>('today');
  const [symptomsText, setSymptomsText] = useState<string>('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState<string | null>(null);
  const [disclaimerAccepted, setDisclaimerAccepted] = useState<boolean>(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Toggle common symptom tags
  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  // Mock voice input simulation
  const handleVoiceInput = () => {
    if (isListening) return;

    setIsListening(true);
    showToast('Listening... Speak your symptoms now.', 'info');

    // Simulate 2 seconds of listening waveform
    setTimeout(() => {
      setIsListening(false);
      setSymptomsText((prev) =>
        prev
          ? `${prev} I have itching and redness on my arm since yesterday.`
          : 'I have itching and redness on my arm since yesterday.'
      );
      showToast('Demo mode — voice transcription will be connected later.', 'success');
    }, 2000);
  };

  // Handle Image Upload & URL.createObjectURL preview
  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPhotoFile(file);
      const preview = URL.createObjectURL(file);
      setPhotoPreviewUrl(preview);
      showToast('Local photo preview generated successfully.', 'info');
    }
  };

  const handleCameraMock = () => {
    showToast('Camera capture will be connected in a future version.', 'info');
  };

  const removePhoto = () => {
    if (photoPreviewUrl) {
      URL.revokeObjectURL(photoPreviewUrl);
    }
    setPhotoFile(null);
    setPhotoPreviewUrl(null);
  };

  // Step navigation validations
  const handleNextStep = () => {
    setValidationError(null);

    if (currentStep === 1) {
      if (!language) {
        setValidationError('Please select a preferred language.');
        return;
      }
      setCurrentStep(2);
    } else if (currentStep === 2) {
      if (!symptomsText.trim() && selectedTags.length === 0) {
        setValidationError('Please enter a description of your symptoms or pick a symptom chip.');
        return;
      }
      setCurrentStep(3);
    } else if (currentStep === 3) {
      setCurrentStep(4);
    }
  };

  const handlePrevStep = () => {
    setValidationError(null);
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Final Submit
  const handleAnalyze = async () => {
    if (!disclaimerAccepted) {
      setValidationError('Please accept the non-diagnostic triage agreement to continue.');
      return;
    }

    const formData: SymptomFormData = {
      language,
      ageGroup,
      duration,
      symptomsText: symptomsText || selectedTags.join(', '),
      selectedTags,
      photoFile,
      photoPreviewUrl,
      disclaimerAccepted,
    };

    setIsAnalyzing(true);
    try {
      const result = await evaluateSymptoms(formData);
      setIsAnalyzing(false);
      onEvaluationComplete(result, formData);
      navigate('/result');
    } catch (err) {
      setIsAnalyzing(false);
      showToast('An unexpected error occurred during demo analysis.', 'alert');
    }
  };

  const stepLabels = [
    { num: 1, label: 'Language', icon: Globe },
    { num: 2, label: 'Symptoms', icon: MessageSquare },
    { num: 3, label: 'Optional Photo', icon: ImageIcon },
    { num: 4, label: 'Review & Submit', icon: CheckSquare },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Loading Overlay */}
      {isAnalyzing && <AnalysisLoading />}

      {/* Progress Stepper */}
      <div className="mb-10">
        <div className="flex items-center justify-between max-w-2xl mx-auto">
          {stepLabels.map((step, idx) => {
            const Icon = step.icon;
            const isCompleted = currentStep > step.num;
            const isCurrent = currentStep === step.num;

            return (
              <React.Fragment key={step.num}>
                <div className="flex flex-col items-center">
                  <div
                    className={`w-10 h-10 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center font-bold transition-all shadow-soft ${
                      isCompleted
                        ? 'bg-amrit-safe text-white'
                        : isCurrent
                        ? 'bg-amrit-teal text-white ring-4 ring-amrit-teal/20'
                        : 'bg-white border border-amrit-border text-amrit-muted'
                    }`}
                  >
                    {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                  </div>
                  <span
                    className={`text-xs font-semibold mt-2 hidden sm:block ${
                      isCurrent ? 'text-amrit-navy font-bold' : 'text-amrit-muted'
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
                {idx < stepLabels.length - 1 && (
                  <div
                    className={`flex-1 h-1 mx-2 sm:mx-4 rounded-full transition-all ${
                      currentStep > step.num ? 'bg-amrit-safe' : 'bg-amrit-border'
                    }`}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Main Grid: Form Left, Amrit Assist Panel Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Form Container (Left) */}
        <div className="lg:col-span-8 bg-white rounded-card-lg border border-amrit-border shadow-card p-6 sm:p-10 space-y-8">
          {/* Validation Error Alert */}
          {validationError && (
            <div
              role="alert"
              className="p-4 rounded-xl bg-amrit-emergencyLight border border-amrit-emergency/40 text-amrit-emergency text-xs sm:text-sm font-semibold flex items-center gap-2.5 animate-shake"
            >
              <AlertTriangle className="w-5 h-5 flex-shrink-0" />
              <span>{validationError}</span>
            </div>
          )}

          {/* ================= STEP 1: LANGUAGE ================= */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <span className="text-xs font-bold text-amrit-teal uppercase tracking-wider">
                  Step 1 of 4
                </span>
                <h2 className="text-2xl sm:text-3xl font-bold text-amrit-navy mt-1">
                  Choose your preferred language
                </h2>
                <p className="text-xs sm:text-sm text-amrit-muted mt-1">
                  Select the language in which you would like to describe symptoms and receive guidance.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
                {SUPPORTED_LANGUAGES.map((lang) => {
                  const isSelected = language === lang.code;
                  return (
                    <button
                      key={lang.code}
                      type="button"
                      onClick={() => {
                        setLanguage(lang.code);
                        setValidationError(null);
                      }}
                      className={`p-5 rounded-card text-left transition-all border flex flex-col justify-between ${
                        isSelected
                          ? 'border-amrit-teal bg-amrit-tealLight/50 ring-2 ring-amrit-teal shadow-soft'
                          : 'border-amrit-border bg-amrit-bg/50 hover:bg-white hover:border-amrit-teal/40'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-lg font-bold text-amrit-navy">
                          {lang.nativeName}
                        </span>
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-white border border-amrit-border text-amrit-muted">
                          {lang.name}
                        </span>
                      </div>
                      <p className="text-xs text-amrit-muted font-normal italic line-clamp-2">
                        {lang.scriptSnippet}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* ================= STEP 2: SYMPTOMS ================= */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <span className="text-xs font-bold text-amrit-teal uppercase tracking-wider">
                  Step 2 of 4
                </span>
                <h2 className="text-2xl sm:text-3xl font-bold text-amrit-navy mt-1">
                  Describe what you are experiencing
                </h2>
                <p className="text-xs sm:text-sm text-amrit-muted mt-1">
                  Share your main concerns in simple words. You can also tap voice input or quick symptom chips.
                </p>
              </div>

              {/* Age Group Selector */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-amrit-navy uppercase tracking-wider block">
                  Who is experiencing symptoms?
                </label>
                <div className="grid grid-cols-3 gap-2 sm:gap-3">
                  {(['child', 'adult', 'older_adult'] as AgeGroup[]).map((grp) => {
                    const isSelected = ageGroup === grp;
                    const labels: Record<AgeGroup, { title: string; desc: string }> = {
                      child: { title: 'Child', desc: 'Under 18 yrs' },
                      adult: { title: 'Adult', desc: '18–64 yrs' },
                      older_adult: { title: 'Older Adult', desc: '65+ yrs' },
                    };
                    return (
                      <button
                        key={grp}
                        type="button"
                        onClick={() => setAgeGroup(grp)}
                        className={`p-3 rounded-xl border text-center transition-all ${
                          isSelected
                            ? 'border-amrit-teal bg-amrit-tealLight text-amrit-teal font-bold shadow-soft'
                            : 'border-amrit-border bg-white text-amrit-text hover:bg-amrit-bg'
                        }`}
                      >
                        <div className="text-xs sm:text-sm font-bold">{labels[grp].title}</div>
                        <div className="text-[10px] text-amrit-muted">{labels[grp].desc}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Duration Chips */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-amrit-navy uppercase tracking-wider block">
                  When did symptoms start?
                </label>
                <div className="grid grid-cols-3 gap-2 sm:gap-3">
                  {(['today', '1_to_3_days', 'more_than_3_days'] as SymptomDuration[]).map((d) => {
                    const isSelected = duration === d;
                    const labels: Record<SymptomDuration, string> = {
                      today: 'Started today',
                      '1_to_3_days': '1–3 days ago',
                      more_than_3_days: 'More than 3 days',
                    };
                    return (
                      <button
                        key={d}
                        type="button"
                        onClick={() => setDuration(d)}
                        className={`p-3 rounded-xl border text-xs sm:text-sm font-semibold transition-all ${
                          isSelected
                            ? 'border-amrit-teal bg-amrit-tealLight text-amrit-teal font-bold shadow-soft'
                            : 'border-amrit-border bg-white text-amrit-text hover:bg-amrit-bg'
                        }`}
                      >
                        {labels[d]}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Common Symptom Chips */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-amrit-navy uppercase tracking-wider block">
                  Quick symptom tags (tap to add):
                </label>
                <div className="flex flex-wrap gap-2">
                  {COMMON_SYMPTOM_TAGS.map((tag) => {
                    const isSelected = selectedTags.includes(tag);
                    return (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => toggleTag(tag)}
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all border ${
                          isSelected
                            ? 'bg-amrit-teal text-white border-amrit-teal shadow-soft'
                            : 'bg-amrit-bg text-amrit-navy border-amrit-border hover:bg-white'
                        }`}
                      >
                        {isSelected ? `✓ ${tag}` : `+ ${tag}`}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Textarea + Mock Voice Button */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label htmlFor="symptoms-input" className="text-xs font-bold text-amrit-navy uppercase tracking-wider">
                    Detailed Symptoms Description:
                  </label>
                  <span className="text-xs text-amrit-muted">Local & private</span>
                </div>

                <div className="relative">
                  <textarea
                    id="symptoms-input"
                    rows={4}
                    value={symptomsText}
                    onChange={(e) => setSymptomsText(e.target.value)}
                    placeholder="For example: I have had itching and redness on my arm since yesterday…"
                    className="w-full p-4 rounded-2xl bg-amrit-bg/50 border border-amrit-border focus:border-amrit-teal focus:bg-white text-sm text-amrit-navy transition-all resize-y"
                  />

                  {/* Mock Voice Input Trigger */}
                  <div className="absolute right-3 bottom-3 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleVoiceInput}
                      disabled={isListening}
                      className={`p-2.5 rounded-full shadow-soft transition-all flex items-center justify-center ${
                        isListening
                          ? 'bg-amrit-emergency text-white animate-pulse-wave'
                          : 'bg-white hover:bg-amrit-tealLight text-amrit-teal border border-amrit-border'
                      }`}
                      aria-label="Mock voice input"
                      title="Simulate Voice Input"
                    >
                      {isListening ? (
                        <MicOff className="w-4 h-4 animate-spin" />
                      ) : (
                        <Mic className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {isListening && (
                  <div className="flex items-center gap-2 p-2.5 rounded-xl bg-amrit-tealLight/60 text-amrit-teal text-xs font-semibold animate-pulse">
                    <span className="w-2 h-2 rounded-full bg-amrit-teal" />
                    <span>Listening... Speak in your selected language (Transcribing demo snippet in 2s)...</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ================= STEP 3: OPTIONAL PHOTO ================= */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div>
                <span className="text-xs font-bold text-amrit-teal uppercase tracking-wider">
                  Step 3 of 4
                </span>
                <h2 className="text-2xl sm:text-3xl font-bold text-amrit-navy mt-1">
                  Add an optional photo (Visible concerns)
                </h2>
                <p className="text-xs sm:text-sm text-amrit-muted mt-1">
                  Useful for skin rashes, swelling, or minor abrasions. This step is entirely optional.
                </p>
              </div>

              {/* Upload Dropzone / Preview */}
              {!photoPreviewUrl ? (
                <div className="border-2 border-dashed border-amrit-border hover:border-amrit-teal rounded-card p-8 text-center space-y-4 bg-amrit-bg/40 transition-colors">
                  <div className="w-14 h-14 rounded-2xl bg-amrit-tealLight text-amrit-teal mx-auto flex items-center justify-center">
                    <UploadCloud className="w-7 h-7" />
                  </div>

                  <div className="space-y-1">
                    <p className="text-sm font-bold text-amrit-navy">
                      Drag and drop an image, or browse
                    </p>
                    <p className="text-xs text-amrit-muted">
                      PNG, JPG, or WEBP up to 5MB. Rendered locally in browser memory.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileSelect}
                      accept="image/*"
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-5 py-2.5 bg-amrit-teal hover:bg-amrit-tealDark text-white text-xs sm:text-sm font-bold rounded-xl shadow-soft"
                    >
                      Choose photo
                    </button>
                    <button
                      type="button"
                      onClick={handleCameraMock}
                      className="px-5 py-2.5 bg-white hover:bg-amrit-bg text-amrit-navy border border-amrit-border text-xs sm:text-sm font-bold rounded-xl flex items-center gap-1.5"
                    >
                      <Camera className="w-4 h-4 text-amrit-teal" />
                      <span>Use camera</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-card bg-amrit-bg border border-amrit-border space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-amrit-navy uppercase tracking-wider">
                        Local Photo Preview
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full bg-amrit-safeLight text-amrit-safe text-[11px] font-bold">
                        Good lighting • Clear focus
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={removePhoto}
                      className="p-1.5 rounded-lg text-amrit-emergency hover:bg-amrit-emergencyLight transition-colors flex items-center gap-1 text-xs font-semibold"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Remove</span>
                    </button>
                  </div>

                  <div className="relative rounded-xl overflow-hidden max-h-64 flex items-center justify-center bg-black/5 border border-amrit-border">
                    <img
                      src={photoPreviewUrl}
                      alt="Uploaded symptom preview"
                      className="object-contain max-h-60 rounded-lg"
                    />
                  </div>
                </div>
              )}

              {/* Safety Note */}
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200/80 flex items-start gap-3 text-amber-900">
                <Info className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <p className="text-xs leading-relaxed font-medium">
                  <strong>Safety note:</strong> “A photo alone cannot confirm a medical condition. Do not upload graphic images or intimate images.”
                </p>
              </div>
            </div>
          )}

          {/* ================= STEP 4: REVIEW ================= */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div>
                <span className="text-xs font-bold text-amrit-teal uppercase tracking-wider">
                  Step 4 of 4
                </span>
                <h2 className="text-2xl sm:text-3xl font-bold text-amrit-navy mt-1">
                  Review & Confirm Triage Request
                </h2>
                <p className="text-xs sm:text-sm text-amrit-muted mt-1">
                  Please review your input before running the simulated triage evaluation.
                </p>
              </div>

              {/* Review Summary Card */}
              <div className="bg-amrit-bg rounded-card p-5 sm:p-6 border border-amrit-border space-y-4 text-xs sm:text-sm">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pb-4 border-b border-amrit-border">
                  <div>
                    <span className="text-[11px] font-bold text-amrit-muted uppercase">
                      Language
                    </span>
                    <p className="font-bold text-amrit-navy capitalize">
                      {SUPPORTED_LANGUAGES.find((l) => l.code === language)?.nativeName} ({language})
                    </p>
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-amrit-muted uppercase">
                      Age Group
                    </span>
                    <p className="font-bold text-amrit-navy capitalize">
                      {ageGroup.replace('_', ' ')}
                    </p>
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-amrit-muted uppercase">
                      Duration
                    </span>
                    <p className="font-bold text-amrit-navy capitalize">
                      {duration.replace(/_/g, ' ')}
                    </p>
                  </div>
                </div>

                <div>
                  <span className="text-[11px] font-bold text-amrit-muted uppercase block mb-1">
                    Symptom Description
                  </span>
                  <div className="p-3 rounded-xl bg-white border border-amrit-border text-amrit-navy font-medium italic">
                    "{symptomsText || selectedTags.join(', ') || 'No detailed text entered.'}"
                  </div>
                </div>

                {selectedTags.length > 0 && (
                  <div>
                    <span className="text-[11px] font-bold text-amrit-muted uppercase block mb-1">
                      Selected Tags
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedTags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2.5 py-0.5 rounded-full bg-white border border-amrit-border text-amrit-navy text-xs font-semibold"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {photoPreviewUrl && (
                  <div>
                    <span className="text-[11px] font-bold text-amrit-muted uppercase block mb-1">
                      Attached Image
                    </span>
                    <div className="flex items-center gap-3">
                      <img
                        src={photoPreviewUrl}
                        alt="Thumbnail"
                        className="w-14 h-14 object-cover rounded-lg border border-amrit-border"
                      />
                      <span className="text-xs text-amrit-safe font-bold">
                        Image context attached
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Mandatory Non-Diagnostic Disclaimer Checkbox */}
              <div className="p-4 rounded-xl bg-amrit-tealLight/50 border border-amrit-teal/30">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={disclaimerAccepted}
                    onChange={(e) => {
                      setDisclaimerAccepted(e.target.checked);
                      setValidationError(null);
                    }}
                    className="w-5 h-5 rounded text-amrit-teal focus:ring-amrit-teal border-amrit-border mt-0.5 cursor-pointer"
                  />
                  <span className="text-xs sm:text-sm font-semibold text-amrit-navy leading-relaxed">
                    “I understand that Amrit is not a medical diagnosis tool and does not provide prescriptions.”
                  </span>
                </label>
              </div>
            </div>
          )}

          {/* Form Action Controls */}
          <div className="flex items-center justify-between pt-4 border-t border-amrit-border">
            {currentStep > 1 ? (
              <button
                type="button"
                onClick={handlePrevStep}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-amrit-border bg-white hover:bg-amrit-bg text-amrit-navy text-xs sm:text-sm font-bold transition-all"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
            ) : (
              <div />
            )}

            {currentStep < 4 ? (
              <button
                type="button"
                onClick={handleNextStep}
                className="flex items-center gap-2 px-7 py-3 rounded-xl bg-amrit-teal hover:bg-amrit-tealDark text-white text-xs sm:text-sm font-bold shadow-soft transition-all"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleAnalyze}
                className="flex items-center gap-2 px-8 py-3.5 rounded-xl bg-amrit-teal hover:bg-amrit-tealDark text-white text-sm sm:text-base font-bold shadow-card hover:shadow-card-hover transition-all transform active:scale-95"
              >
                <Sparkles className="w-4 h-4" />
                <span>Analyze symptoms</span>
              </button>
            )}
          </div>
        </div>

        {/* Amrit Assist Panel (Right on Desktop, Stacked on Mobile) */}
        <aside className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-card-lg border border-amrit-border p-6 shadow-soft space-y-5">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-amrit-tealLight text-amrit-teal flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-amrit-navy">Amrit Assist</h3>
                <p className="text-[11px] text-amrit-muted">Triage Guidance System</p>
              </div>
            </div>

            <div className="space-y-3 text-xs text-amrit-muted leading-relaxed font-medium">
              <p>
                Amrit helps categorize symptoms into 3 actionable tiers without jumping to alarming disease labels:
              </p>
              <div className="space-y-2 pt-1">
                <div className="flex items-start gap-2 p-2 rounded-lg bg-amrit-safeLight/50 text-amrit-navy">
                  <span className="w-2 h-2 rounded-full bg-amrit-safe mt-1.5 flex-shrink-0" />
                  <span><strong>1. Self-care & monitor:</strong> Rest, hydration, and safe general comfort measures.</span>
                </div>
                <div className="flex items-start gap-2 p-2 rounded-lg bg-amrit-consultLight/50 text-amrit-navy">
                  <span className="w-2 h-2 rounded-full bg-amrit-consult mt-1.5 flex-shrink-0" />
                  <span><strong>2. Consult a doctor:</strong> Symptoms lasting &gt;24h or requiring clinical physical inspection.</span>
                </div>
                <div className="flex items-start gap-2 p-2 rounded-lg bg-amrit-emergencyLight/50 text-amrit-navy">
                  <span className="w-2 h-2 rounded-full bg-amrit-emergency mt-1.5 flex-shrink-0" />
                  <span><strong>3. Emergency care:</strong> Urgent red flags warranting immediate 112/108 response.</span>
                </div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-amrit-bg border border-amrit-border text-[11px] text-amrit-muted font-medium">
              🔒 <strong>Session Privacy:</strong> Your data remains strictly in your browser session. No cloud database or account required.
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};
