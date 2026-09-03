import { DemoScenario, ReliefCategory, SafetyQuestion } from '../types';

export const COMMON_SYMPTOM_TAGS = [
  'Fever',
  'Pain',
  'Rash',
  'Swelling',
  'Cough',
  'Stomach pain',
  'Headache',
  'Eye redness',
];

export const DEMO_SCENARIOS: DemoScenario[] = [
  {
    id: 'skin-concern',
    title: 'Visible skin concern',
    iconName: 'ImagePlus',
    description: 'Rash, irritation, or swelling',
    language: 'Kannada (ಕನ್ನಡ)',
    languageCode: 'kn',
    input: 'Itchy rash on the arm since yesterday. No fever or breathing difficulty.',
    chips: ['Optional photo attached', 'Adult', '1–3 days'],
    urgency: 'consult',
    urgencyLabel: 'Consult a doctor soon',
    nextSteps: [
      'Keep the area clean and avoid scratching',
      'Avoid unverified creams or steroid combinations',
      'Consult a clinician if symptoms spread, worsen, or fever appears',
    ],
    rationale: 'Visible localized irritation present for over 24 hours warrants a professional clinical look to determine appropriate non-steroid topical care.',
    watchFor: 'Rapid spreading redness, warmth to touch, pus formation, or developing facial swelling/fever.',
    protectionNote: 'Amrit never guesses dermatological diagnoses or suggests strong topical steroids. It prioritizes keeping the skin barrier protected.',
  },
  {
    id: 'mild-seasonal',
    title: 'Mild seasonal symptoms',
    iconName: 'CloudSun',
    description: 'Cold, cough, or mild fever',
    language: 'Hindi (हिंदी)',
    languageCode: 'hi',
    input: 'हल्की खांसी और गले में खराश है। (Mild cough and scratchy throat)',
    chips: ['Text input', 'No photo needed', 'Started today'],
    urgency: 'self-care',
    urgencyLabel: 'Self-care and monitor',
    nextSteps: [
      'Rest and drink plenty of fluids',
      'Monitor symptoms closely for any change',
      'Ask a pharmacist before using any medicine',
    ],
    rationale: 'Recent onset of mild upper respiratory symptoms without red flags is typically managed with hydration, rest, and conservative self-monitoring.',
    watchFor: 'High persistent fever, difficulty catching your breath, inability to swallow liquids, or severe chest tightness.',
    protectionNote: 'Amrit avoids unnecessary clinical escalations for day-one mild discomfort while ensuring you know exactly when to escalate.',
  },
  {
    id: 'red-flag-alert',
    title: 'Red-flag alert',
    iconName: 'TriangleAlert',
    description: 'Symptoms needing urgent care',
    language: 'English',
    languageCode: 'en',
    input: 'Difficulty breathing and swelling of the face.',
    chips: ['Urgent symptom detected', 'Started today'],
    urgency: 'emergency',
    urgencyLabel: 'Emergency care now',
    nextSteps: [
      'Call 112 or 108 now',
      'Do not wait for online guidance',
      'Ask someone nearby for immediate help',
    ],
    rationale: 'Facial swelling paired with respiratory distress is a medical emergency requiring rapid professional intervention and airway assessment.',
    watchFor: 'Worsening air hunger, dizziness, blue tint on lips/fingers, or loss of responsiveness.',
    protectionNote: 'Amrit immediately halts self-care guidance when red flags are recognized, directing users directly to national emergency lines.',
  },
];

export const SAFETY_CHECK_QUESTIONS: SafetyQuestion[] = [
  { id: 'age_under_12', text: 'Is the person under 12 years old?', riskIfYes: true },
  { id: 'pregnant_breastfeeding', text: 'Are you pregnant, planning to become pregnant, or breastfeeding?', riskIfYes: true },
  { id: 'medicine_allergy', text: 'Do you have any known medicine or drug allergies?', riskIfYes: true },
  { id: 'chronic_conditions', text: 'Do you have a known kidney, liver, stomach, or heart condition?', riskIfYes: true },
  { id: 'taking_other_meds', text: 'Are you currently taking any other daily or prescribed medicines?', riskIfYes: true },
  { id: 'duration_over_3_days', text: 'Have these symptoms lasted for more than 3 days?', riskIfYes: true },
  { id: 'symptoms_worsening', text: 'Are your symptoms noticeably getting worse rather than improving?', riskIfYes: true },
];

export const RELIEF_CATEGORIES: ReliefCategory[] = [
  {
    id: 'headache',
    title: 'Mild headache',
    description: 'General relief measures for tension or fatigue headaches.',
    comfortMeasures: [
      'Rest in a quiet, dimly lit room.',
      'Drink 1–2 glasses of water to stay well-hydrated.',
      'Reduce screen brightness or take a 30-minute digital break.',
      'Apply a cool or gentle warm compress to the forehead or back of the neck.',
    ],
    discussWithPharmacist:
      'Ask a qualified pharmacist whether an appropriate non-prescription pain-relief option is suitable for your age, allergies, and current health status.',
    avoidNotes: [
      'Do not take another person’s medicine.',
      'Do not combine products containing duplicate active ingredients.',
      'Do not exceed the manufacturer’s label directions.',
    ],
    seekCareIf: [
      'Severe, sudden "thunderclap" headache.',
      'Headache accompanied by weakness, confusion, or slurred speech.',
      'Fainting, stiff neck, repeated vomiting, or visual disturbances.',
    ],
  },
  {
    id: 'fever',
    title: 'Mild fever',
    description: 'Comfort care for low-grade temperatures without acute distress.',
    comfortMeasures: [
      'Rest adequately in a well-ventilated room with lightweight clothing.',
      'Sip water, clear broths, or oral rehydration fluids frequently.',
      'Use lukewarm water sponging on the forehead if feeling uncomfortable.',
    ],
    discussWithPharmacist:
      'Consult a pharmacist to discuss appropriate age-adjusted antipyretic relief and check for contraindications with your health profile.',
    avoidNotes: [
      'Avoid ice baths or cold-water immersion.',
      'Do not take multiple fever medicines simultaneously without professional advice.',
      'Avoid heavy blankets that trap body heat.',
    ],
    seekCareIf: [
      'Fever exceeding 102°F (38.9°C) or lasting longer than 3 days.',
      'Fever accompanied by a rash, stiff neck, or extreme lethargy.',
      'Difficulty staying hydrated or shortness of breath.',
    ],
  },
  {
    id: 'cold',
    title: 'Common cold symptoms',
    description: 'Supportive self-care for nasal congestion and sneezing.',
    comfortMeasures: [
      'Inhale gentle steam or use a saline nasal spray for nasal passage moisture.',
      'Elevate your head with an extra pillow while resting.',
      'Drink warm liquids such as herbal tea or warm water with honey.',
    ],
    discussWithPharmacist:
      'Ask a pharmacist regarding suitable decongestant or saline options, particularly if you have elevated blood pressure.',
    avoidNotes: [
      'Do not request or use leftover antibiotics—antibiotics have no effect on viral colds.',
      'Do not use medicated nasal decongestant sprays for more than 3 consecutive days.',
    ],
    seekCareIf: [
      'Wheezing, pain on breathing, or severe earache.',
      'Symptoms lasting beyond 10 days without gradual improvement.',
    ],
  },
  {
    id: 'cough',
    title: 'Mild cough',
    description: 'Soothing throat measures for uncomplicated occasional dry cough.',
    comfortMeasures: [
      'Sip warm water regularly throughout the day.',
      'Consume a spoonful of pure honey (for individuals over 1 year of age).',
      'Use a room humidifier or vapor inhaler to keep airways moist.',
    ],
    discussWithPharmacist:
      'Check with a pharmacist to differentiate between dry and productive cough relief options.',
    avoidNotes: [
      'Do not give honey to infants under 1 year old.',
      'Do not suppress a productive (phlegm-clearing) cough without pharmacist advice.',
    ],
    seekCareIf: [
      'Coughing up blood or rust-colored phlegm.',
      'Shortness of breath, chest tightness, or persistent night sweats.',
    ],
  },
  {
    id: 'sore_throat',
    title: 'Mild sore throat',
    description: 'Throat soothing strategies for scratchy, mild irritation.',
    comfortMeasures: [
      'Gargle with warm salt water (1/2 teaspoon salt in 1 cup warm water) 3–4 times daily.',
      'Sip warm non-caffeinated soothing teas or broths.',
      'Suck on plain hard lozenges or fruit popsicles to lubricate the throat.',
    ],
    discussWithPharmacist:
      'Inquire about soothing throat lozenges or antiseptic mouth gargles appropriate for your age.',
    avoidNotes: [
      'Avoid smoking, second-hand smoke, and spicy or overly acidic foods.',
      'Do not use leftover prescription antibiotics.',
    ],
    seekCareIf: [
      'Difficulty swallowing saliva or inability to open mouth fully.',
      'Visible white spots/pus on tonsils accompanied by high fever.',
    ],
  },
  {
    id: 'acidity',
    title: 'Mild acidity / heartburn',
    description: 'Dietary and lifestyle comfort for occasional mild gastric discomfort.',
    comfortMeasures: [
      'Remain upright for at least 2 hours after meals; avoid lying flat.',
      'Eat smaller, frequent meals rather than large heavy dinners.',
      'Wear loose-fitting clothing around the abdomen.',
    ],
    discussWithPharmacist:
      'Consult a pharmacist regarding antacid suspension or chewable relief suitable for occasional distress.',
    avoidNotes: [
      'Avoid trigger items: heavy oils, deep fried foods, spicy condiments, caffeine, and carbonated beverages.',
      'Avoid smoking and alcohol.',
    ],
    seekCareIf: [
      'Pain that radiates to your arm, neck, back, or jaw (call 112/108 immediately).',
      'Difficulty swallowing food, recurrent vomiting, or black/tarry stools.',
    ],
  },
  {
    id: 'muscle_discomfort',
    title: 'Minor muscle discomfort',
    description: 'Supportive care for routine muscle soreness after activity.',
    comfortMeasures: [
      'Rest the affected muscle and avoid heavy strain.',
      'Apply an ice pack wrapped in a cloth for 15 minutes at a time during the first 24 hours.',
      'Perform gentle stretching once acute tenderness subsides.',
    ],
    discussWithPharmacist:
      'Discuss topical herbal or non-steroidal rub-on gels with a pharmacist.',
    avoidNotes: [
      'Never apply ice directly to bare skin.',
      'Do not force movement through sharp, sudden pain.',
    ],
    seekCareIf: [
      'Inability to bear any weight on the limb or visible joint deformity.',
      'Severe numbness, tingling, or skin color changes.',
    ],
  },
  {
    id: 'skin_irritation',
    title: 'Mild skin irritation',
    description: 'Soothing barrier care for minor dry patches or friction irritation.',
    comfortMeasures: [
      'Wash gently with mild fragrance-free soap and lukewarm water; pat dry.',
      'Apply a plain, fragrance-free moisturizer or petroleum jelly to protect the skin barrier.',
      'Wear loose, breathable cotton clothing.',
    ],
    discussWithPharmacist:
      'Ask a pharmacist for soothing calamine or gentle barrier lotions suitable for your skin type.',
    avoidNotes: [
      'Do not scratch or pick at irritated skin.',
      'Avoid unverified combination steroid/antibacterial creams from unregulated sources.',
    ],
    seekCareIf: [
      'Rapidly spreading redness, swelling, warmth, or blisters.',
      'Signs of infection such as yellow crusting, pus, or fever.',
    ],
  },
];

export const RED_FLAG_SYMPTOMS = [
  'Difficulty breathing or rapid gasping for breath',
  'Facial, lip, tongue, or throat swelling',
  'Severe, crushing chest pain or pressure',
  'Heavy, unstoppable bleeding from any site',
  'Active seizures or convulsions',
  'Fainting, unresponsiveness, confusion, or unusual drowsiness',
  'Sudden weakness or numbness on one side of face or body',
  'Bluish lips, fingernails, or skin',
  'Rapidly spreading rash with high fever or skin peeling',
];
