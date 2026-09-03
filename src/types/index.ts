export type UrgencyLevel = 'self-care' | 'consult' | 'emergency';

export type LanguageCode = 'en' | 'hi' | 'kn' | 'te' | 'ta';

export interface Language {
  code: LanguageCode;
  name: string;
  nativeName: string;
  scriptSnippet: string;
}

export type AgeGroup = 'child' | 'adult' | 'older_adult';

export type SymptomDuration = 'today' | '1_to_3_days' | 'more_than_3_days';

export interface SymptomFormData {
  language: LanguageCode;
  ageGroup: AgeGroup;
  duration: SymptomDuration;
  symptomsText: string;
  selectedTags: string[];
  photoFile?: File | null;
  photoPreviewUrl?: string | null;
  disclaimerAccepted: boolean;
}

export interface TriageResult {
  urgency: UrgencyLevel;
  headline: string;
  summary: string;
  medicineGuideEligible: boolean;
  carePathStep: number; // 1: Self-care, 2: Consult, 3: Emergency
  rationale: string;
  safeNextSteps: string[];
  redFlags: string[];
  evaluatedLanguage: LanguageCode;
  evaluatedAgeGroup: AgeGroup;
  evaluatedDuration: SymptomDuration;
  hasPhotoContext: boolean;
}

export interface DemoScenario {
  id: string;
  title: string;
  iconName: 'ImagePlus' | 'CloudSun' | 'TriangleAlert';
  description: string;
  language: string;
  languageCode: LanguageCode;
  input: string;
  chips: string[];
  urgency: UrgencyLevel;
  urgencyLabel: string;
  nextSteps: string[];
  rationale: string;
  watchFor: string;
  protectionNote: string;
}

export type SafetyAnswer = 'yes' | 'no' | 'speak_pharmacist';

export interface SafetyQuestion {
  id: string;
  text: string;
  riskIfYes: boolean;
}

export interface ReliefCategory {
  id: string;
  title: string;
  description: string;
  comfortMeasures: string[];
  discussWithPharmacist: string;
  avoidNotes: string[];
  seekCareIf: string[];
}

export interface ToastMessage {
  id: string;
  message: string;
  type?: 'info' | 'success' | 'warning' | 'alert';
}
