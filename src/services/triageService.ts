// FRONTEND DEMO ONLY.
// TODO: Replace with a secure Flask/FastAPI + Gemini backend after clinical review.
// Do not expose API keys in the frontend.

// DEMO ONLY. This is not clinical decision-making or diagnosis.

import { SymptomFormData, TriageResult, UrgencyLevel, PossibleConcern, ImageContextData, DocumentContextData } from '../types';
import { RED_FLAG_SYMPTOMS } from '../data/mockData';

const API_BASE_URL = 'http://localhost:8001';

export async function evaluateSymptoms(data: SymptomFormData): Promise<TriageResult> {
  const languageNames: Record<string, string> = {
    en: 'English',
    hi: 'Hindi',
    kn: 'Kannada',
    te: 'Telugu',
    ta: 'Tamil',
  };

  const ageGroupNames: Record<string, string> = {
    child: 'Child',
    adult: 'Adult',
    older_adult: 'Older adult',
  };

  const durationNames: Record<string, string> = {
    today: 'Started today',
    '1_to_3_days': '1–3 days',
    more_than_3_days: 'More than 3 days',
  };

  const langStr = languageNames[data.language] || 'English';
  const ageStr = ageGroupNames[data.ageGroup] || 'Adult';
  const durStr = durationNames[data.duration] || 'Started today';

  // Try calling the FastAPI + Gemini backend endpoint
  try {
    const formData = new FormData();
    formData.append('symptom_text', data.symptomsText || 'No detailed symptoms specified');
    formData.append('language', langStr);
    formData.append('age_group', ageStr);
    formData.append('duration', durStr);
    formData.append('symptom_tags', JSON.stringify(data.selectedTags || []));

    if (data.photoFile) {
      formData.append('image', data.photoFile);
    }

    if (data.documentFile) {
      formData.append('document', data.documentFile);
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000);

    const response = await fetch(`${API_BASE_URL}/api/analyze-symptoms`, {
      method: 'POST',
      body: formData,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (response.ok) {
      const backendData = await response.json();

      let urgency: UrgencyLevel = 'self-care';
      let carePathStep = 1;

      if (backendData.urgency === 'EMERGENCY_NOW') {
        urgency = 'emergency';
        carePathStep = 3;
      } else if (backendData.urgency === 'CONSULT_SOON') {
        urgency = 'consult';
        carePathStep = 2;
      }

      const possibleConcerns: PossibleConcern[] = Array.isArray(backendData.possible_concerns)
        ? backendData.possible_concerns.map((item: any) => ({
            category: item.category || 'General symptom concern',
            uncertainty_note: item.uncertainty_note || 'Cannot be confirmed from this information alone.',
          }))
        : [];

      const imageContext: ImageContextData = backendData.image_context || {
        provided: Boolean(data.photoFile || data.photoPreviewUrl),
        quality: data.photoFile ? 'usable' : 'not_provided',
        observation: 'Visual context reviewed.',
        limitation: 'Image quality, lighting, and lack of physical examination limit assessment.',
      };

      const documentContext: DocumentContextData = backendData.document_context || {
        provided: Boolean(data.documentFile),
        summary: data.documentFileName ? `Attached document: ${data.documentFileName}` : 'No document provided.',
        limitation: 'Medical documents cannot be clinically interpreted online.',
      };

      return {
        urgency,
        headline: backendData.headline || (urgency === 'emergency' ? 'Emergency care now' : urgency === 'consult' ? 'Consult a doctor soon' : 'Self-care and monitor'),
        summary: backendData.summary || 'A clear next-step summary based on the information shared.',
        possibleConcerns,
        imageContext,
        documentContext,
        safeNextSteps: Array.isArray(backendData.safe_next_steps) && backendData.safe_next_steps.length > 0
          ? backendData.safe_next_steps
          : ['Rest and monitor symptoms.', 'Consult a doctor if symptoms persist.'],
        redFlags: Array.isArray(backendData.red_flags) && backendData.red_flags.length > 0
          ? backendData.red_flags
          : RED_FLAG_SYMPTOMS,
        medicineGuideEligible: Boolean(backendData.medicine_guide_eligible),
        carePathStep,
        rationale: backendData.summary || 'Amrit uses the information shared in this triage session to show general next-step guidance.',
        disclaimer: backendData.disclaimer || 'Amrit provides general triage guidance only. It does not diagnose conditions, prescribe medicines, or replace a qualified healthcare professional.',
        evaluatedLanguage: langStr,
        evaluatedAgeGroup: ageStr,
        evaluatedDuration: durStr,
        hasPhotoContext: Boolean(data.photoFile || data.photoPreviewUrl),
        hasDocumentContext: Boolean(data.documentFile),
      };
    }
  } catch (error) {
    console.log('[TriageService] Backend connection not available, utilizing local triage logic:', error);
  }

  // Local fallback triage logic
  await new Promise((resolve) => setTimeout(resolve, 1500));

  const textLower = data.symptomsText.toLowerCase();
  const selectedTagsLower = data.selectedTags.map((t) => t.toLowerCase());

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
  ];

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
  let possibleConcerns: PossibleConcern[] = [];
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
    possibleConcerns = [];
    safeNextSteps = [
      'Call emergency numbers 112 or 108 immediately.',
      'Do not delay emergency care while waiting for online guidance.',
      'Ask someone nearby for help and do not drive yourself.',
      'Do not take unprescribed medicines while experiencing red-flag symptoms.',
    ];
  } else if (hasConsultWord || hasExtendedDuration) {
    urgency = 'consult';
    headline = 'Consult a doctor soon';
    summary =
      'A healthcare professional should review these symptoms, especially if they persist or worsen.';
    medicineGuideEligible = false;
    carePathStep = 2;
    possibleConcerns = [
      {
        category: 'Localized symptom or physical irritation concern',
        uncertainty_note: 'Cannot be confirmed from this information alone.',
      },
    ];
    safeNextSteps = [
      'Schedule a clinical visit with a doctor or primary healthcare center.',
      'Note down when symptoms began and any noticeable triggers.',
      'Avoid unverified home remedies, steroid creams, or leftover antibiotics.',
      'Go to urgent care immediately if red flags like breathing difficulty appear.',
    ];
  } else {
    possibleConcerns = [
      {
        category: 'Mild transient discomfort concern',
        uncertainty_note: 'Cannot be confirmed from this information alone.',
      },
    ];
  }

  return {
    urgency,
    headline,
    summary,
    possibleConcerns,
    imageContext: {
      provided: Boolean(data.photoFile || data.photoPreviewUrl),
      quality: data.photoFile ? 'usable' : 'not_provided',
      observation: data.photoFile ? 'Visual context attached for local preview.' : 'No image provided for visual review.',
      limitation: 'Image quality, lighting, and lack of physical examination limit assessment. Never a diagnosis.',
    },
    documentContext: {
      provided: Boolean(data.documentFile),
      summary: data.documentFileName ? `Attached document: ${data.documentFileName}` : 'No document provided.',
      limitation: 'Medical documents cannot be clinically interpreted online. A clinician must review all reports directly.',
    },
    safeNextSteps,
    redFlags: RED_FLAG_SYMPTOMS,
    medicineGuideEligible,
    carePathStep,
    rationale:
      'Amrit uses the information shared in this frontend session, such as symptoms, duration, selected language, and optional image/PDF context, to show general next-step guidance. It cannot confirm the cause of a symptom.',
    disclaimer:
      'Amrit provides general triage guidance only. It does not diagnose conditions, prescribe medicines, or replace a qualified healthcare professional.',
    evaluatedLanguage: langStr,
    evaluatedAgeGroup: ageStr,
    evaluatedDuration: durStr,
    hasPhotoContext: Boolean(data.photoFile || data.photoPreviewUrl),
    hasDocumentContext: Boolean(data.documentFile),
  };
}
