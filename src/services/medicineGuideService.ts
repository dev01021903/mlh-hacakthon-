// FRONTEND DEMO ONLY.
// TODO: Replace with a secure Flask/FastAPI + Gemini backend after clinical review.
// Do not expose API keys in the frontend.

import { ReliefCategory, SafetyQuestion } from '../types';
import { RELIEF_CATEGORIES, SAFETY_CHECK_QUESTIONS } from '../data/mockData';

/**
 * Returns the safety questionnaire for the Safe Medicine Guide
 */
export async function getSafetyQuestions(): Promise<SafetyQuestion[]> {
  await new Promise((resolve) => setTimeout(resolve, 150));
  return SAFETY_CHECK_QUESTIONS;
}

/**
 * Returns non-prescription, category-level relief categories
 * NOTE: Contains zero brand names, zero dosages, and zero prescriptions.
 */
export async function getReliefCategories(): Promise<ReliefCategory[]> {
  await new Promise((resolve) => setTimeout(resolve, 200));
  return RELIEF_CATEGORIES;
}

/**
 * Evaluates whether any high-risk safety answers exist
 */
export function hasHighRiskAnswers(answers: Record<string, string>): boolean {
  return Object.entries(answers).some(([_, value]) => value === 'yes');
}
