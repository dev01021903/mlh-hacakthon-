import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  Info,
  MapPin,
  Sparkles,
  MessageSquareCheck,
  Ban,
  AlertOctagon,
} from 'lucide-react';
import { ReliefCategory, SafetyQuestion, SafetyAnswer } from '../types';
import { getSafetyQuestions, getReliefCategories, hasHighRiskAnswers } from '../services/medicineGuideService';
import { useToast } from '../hooks/useToast';
import { Modal } from './Modal';

export const SafeMedicineGuide: React.FC = () => {
  const [questions, setQuestions] = useState<SafetyQuestion[]>([]);
  const [categories, setCategories] = useState<ReliefCategory[]>([]);
  const [answers, setAnswers] = useState<Record<string, SafetyAnswer>>({});
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('headache');
  const [pharmacyModalOpen, setPharmacyModalOpen] = useState<boolean>(false);
  const { showToast } = useToast();

  useEffect(() => {
    getSafetyQuestions().then(setQuestions);
    getReliefCategories().then(setCategories);
  }, []);

  const handleAnswerChange = (questionId: string, value: SafetyAnswer) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: value,
    }));
  };

  const isHighRisk = hasHighRiskAnswers(answers);
  const selectedCategory =
    categories.find((c) => c.id === selectedCategoryId) || categories[0];

  const handleAskPharmacistToast = () => {
    showToast(
      'Good choice. A qualified pharmacist can check age, allergies, existing medicines, and health conditions.',
      'success'
    );
  };

  return (
    <section
      aria-labelledby="safe-medicine-guide-heading"
      className="mt-12 bg-white rounded-card-lg border border-amrit-border shadow-card overflow-hidden"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-amrit-teal to-amrit-navy text-white p-6 sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-amrit-cyan text-xs font-bold uppercase tracking-wider backdrop-blur-sm">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Pharmacist Consultation Aid</span>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 bg-white/10 rounded-full border border-white/20">
            Adult Self-Care Cases Only
          </span>
        </div>

        <h2 id="safe-medicine-guide-heading" className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
          Safe Medicine Guide
        </h2>
        <p className="text-sm sm:text-base text-amrit-cyan/90 font-medium mt-1">
          For mild symptoms only. Explore general relief options to discuss with a qualified pharmacist.
        </p>
      </div>

      <div className="p-6 sm:p-8 space-y-8">
        {/* Safety Banner */}
        <div className="p-4 sm:p-5 rounded-card bg-amrit-blueLight/60 border border-amrit-blue/30 flex items-start gap-3.5 text-amrit-navy">
          <Info className="w-5 h-5 text-amrit-blue flex-shrink-0 mt-0.5" />
          <div className="text-xs sm:text-sm font-medium leading-relaxed">
            <strong className="text-amrit-navy font-bold block sm:inline mr-1">
              Safety notice:
            </strong>
            Medicine guidance is for mild symptoms only. Amrit does not prescribe medicines. Confirm suitability with a pharmacist or doctor.
          </div>
        </div>

        {/* Safety Questions Checklist */}
        <div className="bg-amrit-bg rounded-card p-5 sm:p-6 border border-amrit-border space-y-4">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-amrit-teal" />
            <h3 className="text-base font-bold text-amrit-navy">
              Pre-Guidance Safety Checklist
            </h3>
          </div>
          <p className="text-xs text-amrit-muted">
            Please answer these quick questions to ensure non-prescription guidance is safe to view.
          </p>

          <div className="space-y-3 pt-2">
            {questions.map((q) => {
              const currentAnswer = answers[q.id];
              return (
                <div
                  key={q.id}
                  className="bg-white p-3.5 rounded-xl border border-amrit-border flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <span className="text-xs sm:text-sm font-medium text-amrit-navy">
                    {q.text}
                  </span>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <button
                      type="button"
                      onClick={() => handleAnswerChange(q.id, 'yes')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        currentAnswer === 'yes'
                          ? 'bg-amber-500 text-white shadow-soft'
                          : 'bg-amrit-bg hover:bg-amrit-border/60 text-amrit-navy border border-amrit-border'
                      }`}
                    >
                      Yes
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAnswerChange(q.id, 'no')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        currentAnswer === 'no'
                          ? 'bg-amrit-safe text-white shadow-soft'
                          : 'bg-amrit-bg hover:bg-amrit-border/60 text-amrit-navy border border-amrit-border'
                      }`}
                    >
                      No
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAnswerChange(q.id, 'speak_pharmacist')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        currentAnswer === 'speak_pharmacist'
                          ? 'bg-amrit-teal text-white shadow-soft'
                          : 'bg-amrit-bg hover:bg-amrit-border/60 text-amrit-navy border border-amrit-border'
                      }`}
                    >
                      Prefer to ask
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Conditional rendering based on High Risk Answer */}
        {isHighRisk ? (
          <div className="p-6 rounded-card bg-amrit-consultLight border-2 border-amrit-consult/60 space-y-4 animate-fade-in">
            <div className="flex items-center gap-3 text-amber-800">
              <AlertTriangle className="w-6 h-6 text-amrit-consult flex-shrink-0" />
              <h3 className="text-lg font-bold">
                Special Medical Precautions Identified
              </h3>
            </div>
            <p className="text-sm font-semibold text-amber-900 leading-relaxed">
              Because of the information provided, please speak with a pharmacist or doctor before using any medicine.
            </p>
            <div className="bg-white p-4 rounded-xl border border-amrit-consult/30 space-y-2">
              <h4 className="text-xs font-bold text-amrit-navy uppercase tracking-wider">
                Safe General Comfort Measures Only:
              </h4>
              <ul className="text-xs text-amrit-navy space-y-1.5 font-medium list-disc list-inside">
                <li>Rest comfortably and keep well-hydrated with water or warm fluids.</li>
                <li>Avoid self-medicating or taking over-the-counter tablets without clinical review.</li>
                <li>Bring a list of any daily medications to your consultation.</li>
              </ul>
            </div>
            <div className="pt-2">
              <button
                type="button"
                onClick={handleAskPharmacistToast}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-amrit-teal hover:bg-amrit-tealDark text-white text-xs sm:text-sm font-bold rounded-xl shadow-soft"
              >
                <MessageSquareCheck className="w-4 h-4" />
                <span>I’ll ask a pharmacist</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Symptom Category Tabs */}
            <div>
              <h3 className="text-sm font-bold text-amrit-navy uppercase tracking-wider mb-3">
                Select a Mild Symptom to Explore Relief Topics:
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {categories.map((cat) => {
                  const isSelected = cat.id === selectedCategoryId;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setSelectedCategoryId(cat.id)}
                      className={`p-3 rounded-xl text-left transition-all border ${
                        isSelected
                          ? 'bg-amrit-tealLight border-amrit-teal text-amrit-teal font-bold shadow-soft'
                          : 'bg-white border-amrit-border text-amrit-text hover:bg-amrit-bg'
                      }`}
                    >
                      <div className="text-xs sm:text-sm font-bold">{cat.title}</div>
                      <div className="text-[11px] text-amrit-muted line-clamp-1 mt-0.5">
                        {cat.description}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Selected Category Details Card */}
            {selectedCategory && (
              <div className="bg-white rounded-card border border-amrit-border p-5 sm:p-7 shadow-soft space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-amrit-border">
                  <div>
                    <h4 className="text-xl font-bold text-amrit-navy">
                      {selectedCategory.title}
                    </h4>
                    <p className="text-xs sm:text-sm text-amrit-muted">
                      {selectedCategory.description}
                    </p>
                  </div>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amrit-safeLight text-amrit-safe text-xs font-bold border border-amrit-safe/30">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Not a prescription</span>
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* General comfort measures */}
                  <div className="space-y-2.5 bg-amrit-bg/70 p-4 rounded-xl border border-amrit-border/70">
                    <h5 className="text-xs font-bold text-amrit-navy uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-amrit-teal" />
                      <span>General Comfort Measures</span>
                    </h5>
                    <ul className="space-y-2 text-xs sm:text-sm text-amrit-navy font-medium">
                      {selectedCategory.comfortMeasures.map((cm, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-amrit-teal mt-2 flex-shrink-0" />
                          <span>{cm}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Discuss with a pharmacist */}
                  <div className="space-y-2.5 bg-amrit-tealLight/40 p-4 rounded-xl border border-amrit-teal/30">
                    <h5 className="text-xs font-bold text-amrit-teal uppercase tracking-wider flex items-center gap-1.5">
                      <MessageSquareCheck className="w-4 h-4 text-amrit-teal" />
                      <span>Discuss with a Pharmacist</span>
                    </h5>
                    <p className="text-xs sm:text-sm text-amrit-navy font-medium leading-relaxed">
                      {selectedCategory.discussWithPharmacist}
                    </p>
                    <div className="text-[11px] text-amrit-muted italic pt-1">
                      A pharmacist will evaluate age, allergies, active ingredients, and current health conditions.
                    </div>
                  </div>

                  {/* What to avoid */}
                  <div className="space-y-2.5 bg-amber-50/50 p-4 rounded-xl border border-amber-200">
                    <h5 className="text-xs font-bold text-amber-800 uppercase tracking-wider flex items-center gap-1.5">
                      <Ban className="w-4 h-4 text-amber-600" />
                      <span>What to Avoid</span>
                    </h5>
                    <ul className="space-y-1.5 text-xs text-amber-900 font-medium">
                      {selectedCategory.avoidNotes.map((avoid, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-600 mt-1.5 flex-shrink-0" />
                          <span>{avoid}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Seek care if */}
                  <div className="space-y-2.5 bg-amrit-emergencyLight/40 p-4 rounded-xl border border-amrit-emergency/30">
                    <h5 className="text-xs font-bold text-amrit-emergency uppercase tracking-wider flex items-center gap-1.5">
                      <AlertOctagon className="w-4 h-4 text-amrit-emergency" />
                      <span>Seek Clinical Care If:</span>
                    </h5>
                    <ul className="space-y-1.5 text-xs text-amrit-navy font-medium">
                      {selectedCategory.seekCareIf.map((sc, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-amrit-emergency mt-1.5 flex-shrink-0" />
                          <span>{sc}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              <button
                type="button"
                onClick={handleAskPharmacistToast}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-amrit-teal hover:bg-amrit-tealDark text-white text-xs sm:text-sm font-bold rounded-xl shadow-soft hover:shadow-card transition-all"
              >
                <MessageSquareCheck className="w-4 h-4" />
                <span>I’ll ask a pharmacist</span>
              </button>

              <button
                type="button"
                onClick={() => setPharmacyModalOpen(true)}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-white hover:bg-amrit-bg text-amrit-navy border border-amrit-border text-xs sm:text-sm font-bold rounded-xl transition-all"
              >
                <MapPin className="w-4 h-4 text-amrit-teal" />
                <span>Find a pharmacist</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Mock Pharmacy Finder Modal */}
      <Modal
        isOpen={pharmacyModalOpen}
        onClose={() => setPharmacyModalOpen(false)}
        title="Find a Nearby Pharmacist"
      >
        <div className="space-y-4 text-sm text-amrit-navy font-medium">
          <div className="p-4 rounded-xl bg-amrit-bg border border-amrit-border flex items-start gap-3">
            <MapPin className="w-5 h-5 text-amrit-teal flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-amrit-navy">Local Map & Directory Notice</p>
              <p className="text-xs text-amrit-muted mt-1">
                Pharmacy finder will be connected in a future version.
              </p>
            </div>
          </div>
          <p className="text-xs text-amrit-muted leading-relaxed">
            In this prototype demo, please visit your local community chemist or hospital pharmacy to discuss over-the-counter options with a licensed pharmacist.
          </p>
          <div className="pt-2 flex justify-end">
            <button
              type="button"
              onClick={() => setPharmacyModalOpen(false)}
              className="px-5 py-2 bg-amrit-teal text-white text-xs font-bold rounded-xl hover:bg-amrit-tealDark"
            >
              Understood
            </button>
          </div>
        </div>
      </Modal>
    </section>
  );
};
