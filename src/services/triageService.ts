// FRONTEND DEMO ONLY.
// TODO: Replace with a secure Flask/FastAPI + Gemini backend after clinical review.
// Do not expose API keys in the frontend.

// DEMO ONLY. This is not clinical decision-making or diagnosis.

import { SymptomFormData, TriageResult, UrgencyLevel } from '../types';
import { RED_FLAG_SYMPTOMS } from '../data/mockData';

export async function evaluateSymptoms(data: SymptomFormData): Promise<TriageResult> {
  // Simulate network/AI processing delay for realistic UX
  await new Promise((resolve) => setTimeout(resolve, 2200));

  const textLower = data.symptomsText.toLowerCase();
  const selectedTagsLower = data.selectedTags.map((t) => t.toLowerCase());

  // Emergency keywords
  const emergencyKeywords = [
    'difficulty breathing',
    'breathing difficulty',
    'severe chest pain',
    'chest pain',
    'unconscious',
    'heavy bleeding',
    'bleeding heavily',
    'seizure',
    'face swelling',
    'facial swelling',
    'throat swelling',
    'suicidal thoughts',
    'sudden weakness',
    'blue lips',
    'bluish lips',
  ];

  // Consult keywords
  const consultKeywords = [
    'rash',
    'swelling',
    'pain',
    'fever',
    'eye redness',
    'wound',
  ];

  const hasEmergencyWord = emergencyKeywords.some((kw) => textLower.includes(kw));
  const hasConsultWord =
    consultKeywords.some((kw) => textLower.includes(kw)) ||
    selectedTagsLower.some((tag) => consultKeywords.some((kw) => tag.includes(kw)));
  const hasExtendedDuration =
    data.duration === '1_to_3_days' || data.duration === 'more_than_3_days';

  let urgency: UrgencyLevel = 'self-care';
  let headline = 'Self-care and monitor';
  let summary =
    'Your symptoms may be suitable for gentle self-care and monitoring. Seek care if symptoms worsen or new warning signs appear.';
  let medicineGuideEligible = true;
  let carePathStep = 1;
  let safeNextSteps: string[] = [
    'Get plenty of rest and stay hydrated with clean fluids.',
    'Keep track of your symptoms over the next 24 to 48 hours.',
    'Speak with a pharmacist or healthcare provider before using non-prescription relief.',
    'Seek prompt medical care if your condition changes or you feel uncertain.',
  ];

  if (hasEmergencyWord) {
    urgency = 'emergency';
    headline = 'Emergency care now';
    summary =
      'Your symptoms may need urgent medical attention. Call 112 or 108, or go to the nearest emergency department.';
    medicineGuideEligible = false;
    carePathStep = 3;
    safeNextSteps = [
      'Call emergency numbers 112 or 108 immediately.',
      'Do not attempt to drive yourself; ask someone nearby or emergency services for transport.',
      'Sit or lie in a comfortable, safe position while waiting for help.',
      'Do not take unprescribed medicines while experiencing red-flag symptoms.',
    ];
  } else if (hasConsultWord || hasExtendedDuration) {
    urgency = 'consult';
    headline = 'Consult a doctor soon';
    summary =
      'A healthcare professional should review these symptoms, especially if they persist or worsen.';
    medicineGuideEligible = false;
    carePathStep = 2;
    safeNextSteps = [
      'Schedule a clinical visit with a doctor or primary healthcare center.',
      'Note down when symptoms began and any noticeable triggers.',
      'Avoid unverified home remedies, steroid creams, or leftover antibiotics.',
      'Go to urgent care immediately if red flags like breathing difficulty appear.',
    ];
  }

  const rationale =
    'Amrit uses the information shared in this frontend demo, such as symptoms, duration, selected language, and optional image context, to show general next-step guidance. It cannot confirm the cause of a symptom.';

  return {
    urgency,
    headline,
    summary,
    medicineGuideEligible,
    carePathStep,
    rationale,
    safeNextSteps,
    redFlags: RED_FLAG_SYMPTOMS,
    evaluatedLanguage: data.language,
    evaluatedAgeGroup: data.ageGroup,
    evaluatedDuration: data.duration,
    hasPhotoContext: Boolean(data.photoFile || data.photoPreviewUrl),
  };
}
