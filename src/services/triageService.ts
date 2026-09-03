// FRONTEND DEMO ONLY.
// TODO: Replace with a secure Flask/FastAPI + Gemini backend after clinical review.
// Do not expose API keys in the frontend.

// DEMO ONLY. This is not clinical decision-making or diagnosis.

import { SymptomFormData, TriageResult, UrgencyLevel } from '../types';
import { RED_FLAG_SYMPTOMS } from '../data/mockData';

const API_BASE_URL = 'http://localhost:8000';

export async function evaluateSymptoms(data: SymptomFormData): Promise<TriageResult> {
  // Map duration format for backend model
  const durationMap: Record<string, string> = {
    today: 'today',
    '1_to_3_days': '1-3_days',
    more_than_3_days: 'more_than_3_days',
  };

  // Try calling the FastAPI + Gemini backend first
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const response = await fetch(`${API_BASE_URL}/api/v1/triage/evaluate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        language: data.language,
        age_group: data.ageGroup,
        duration: durationMap[data.duration] || 'today',
        symptoms_text: data.symptomsText || 'No symptoms specified',
        selected_chips: data.selectedTags || [],
        photo_url: data.photoPreviewUrl || null,
        agreed_to_disclaimer: data.disclaimerAccepted,
      }),
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

      const headline =
        backendData.vernacular_guidance?.native_heading ||
        backendData.title ||
        (urgency === 'emergency'
          ? 'Emergency care now'
          : urgency === 'consult'
          ? 'Consult a doctor soon'
          : 'Self-care and monitor');

      const summary =
        backendData.vernacular_guidance?.native_text ||
        backendData.subtitle ||
        backendData.why_explanation ||
        'Based on the symptoms provided, follow the recommended next steps.';

      return {
        urgency,
        headline,
        summary,
        medicineGuideEligible: urgency === 'self-care',
        carePathStep,
        rationale:
          backendData.why_explanation ||
          'Amrit uses the information shared in this triage session to show general next-step guidance. It cannot confirm the cause of a symptom.',
        safeNextSteps:
          backendData.safe_next_steps && backendData.safe_next_steps.length > 0
            ? backendData.safe_next_steps
            : [
                'Rest and stay hydrated with clean fluids.',
                'Monitor your symptoms closely over the next 24 to 48 hours.',
                'Speak with a pharmacist or healthcare provider before taking relief medicines.',
              ],
        redFlags: backendData.emergency_red_flags || RED_FLAG_SYMPTOMS,
        evaluatedLanguage: data.language,
        evaluatedAgeGroup: data.ageGroup,
        evaluatedDuration: data.duration,
        hasPhotoContext: Boolean(data.photoFile || data.photoPreviewUrl),
      };
    }
  } catch (error) {
    console.log('[TriageService] Backend connection not available, utilizing local triage logic:', error);
  }

  // Local fallback triage logic
  await new Promise((resolve) => setTimeout(resolve, 1500));

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
