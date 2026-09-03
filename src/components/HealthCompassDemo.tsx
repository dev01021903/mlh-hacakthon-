import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ImagePlus,
  CloudSun,
  TriangleAlert,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  AlertOctagon,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Sparkles,
  HeartPulse,
} from 'lucide-react';
import { DEMO_SCENARIOS } from '../data/mockData';
import { useToast } from '../hooks/useToast';

export const HealthCompassDemo: React.FC = () => {
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>('skin-concern');
  const [demoStep, setDemoStep] = useState<number>(3); // 1: Input, 2: Safety checks, 3: Guidance ready
  const [openAccordion, setOpenAccordion] = useState<string | null>(null);
  const [feedbackGiven, setFeedbackGiven] = useState<boolean>(false);
  const { showToast } = useToast();

  const currentScenario =
    DEMO_SCENARIOS.find((s) => s.id === selectedScenarioId) || DEMO_SCENARIOS[0];

  const handleScenarioChange = (id: string) => {
    setSelectedScenarioId(id);
    setDemoStep(1); // restart demo steps for new scenario
  };

  const handleNextStep = () => {
    if (demoStep < 3) {
      setDemoStep(demoStep + 1);
    } else {
      setDemoStep(1);
    }
  };

  const handleFeedback = (isHelpful: boolean) => {
    setFeedbackGiven(true);
    showToast(
      isHelpful
        ? 'Thank you for your feedback! Glad this demo preview was helpful.'
        : 'Thank you for your feedback! We are constantly refining Amrit triage clarity.',
      'success'
    );
  };

  const toggleAccordion = (key: string) => {
    setOpenAccordion(openAccordion === key ? null : key);
  };

  // Urgency badge styles
  const getUrgencyBadge = () => {
    switch (currentScenario.urgency) {
      case 'emergency':
        return {
          bg: 'bg-amrit-emergencyLight text-amrit-emergency border-amrit-emergency/40',
          icon: AlertOctagon,
          dotColor: 'bg-amrit-emergency',
          textColor: 'text-amrit-emergency',
        };
      case 'consult':
        return {
          bg: 'bg-amrit-consultLight text-amber-700 border-amrit-consult/40',
          icon: AlertCircle,
          dotColor: 'bg-amrit-consult',
          textColor: 'text-amber-700',
        };
      case 'self-care':
      default:
        return {
          bg: 'bg-amrit-safeLight text-amrit-safe border-amrit-safe/40',
          icon: CheckCircle2,
          dotColor: 'bg-amrit-safe',
          textColor: 'text-amrit-safe',
        };
    }
  };

  const badgeConfig = getUrgencyBadge();
  const UrgencyIcon = badgeConfig.icon;

  return (
    <div className="bg-white rounded-card-lg border border-amrit-border shadow-card-hover overflow-hidden transition-all duration-300">
      {/* Header */}
      <div className="bg-gradient-to-r from-amrit-navy to-amrit-navyLight text-white p-5 sm:p-6 relative">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amrit-teal animate-pulse" />
            <span className="text-xs font-bold tracking-widest text-amrit-cyan uppercase">
              AMRIT
            </span>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white/15 text-amrit-cyan backdrop-blur-sm border border-white/10">
            Interactive demo
          </span>
        </div>

        <div className="mt-3">
          <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            Health Compass
            <Sparkles className="w-4 h-4 text-amrit-cyan" />
          </h3>
          <p className="text-xs sm:text-sm text-amrit-cyan/90 font-medium">
            Non-diagnostic triage guidance
          </p>
        </div>
      </div>

      {/* Scenario Tabs */}
      <div className="p-4 bg-amrit-bg border-b border-amrit-border">
        <p className="text-xs font-bold text-amrit-muted uppercase mb-2.5 tracking-wider">
          Choose a scenario to test:
        </p>
        <div className="grid grid-cols-3 gap-2">
          {DEMO_SCENARIOS.map((sc) => {
            const isSelected = sc.id === selectedScenarioId;
            return (
              <button
                key={sc.id}
                type="button"
                onClick={() => handleScenarioChange(sc.id)}
                className={`p-2.5 sm:p-3 rounded-card-sm text-left transition-all flex flex-col justify-between border ${
                  isSelected
                    ? 'bg-white border-amrit-teal shadow-soft ring-2 ring-amrit-teal/20'
                    : 'bg-white/60 border-amrit-border/70 hover:bg-white text-amrit-muted hover:border-amrit-border'
                }`}
              >
                <div className="flex items-center gap-1.5 mb-1.5">
                  {sc.iconName === 'ImagePlus' && (
                    <ImagePlus
                      className={`w-4 h-4 ${isSelected ? 'text-amrit-teal' : 'text-amrit-muted'}`}
                    />
                  )}
                  {sc.iconName === 'CloudSun' && (
                    <CloudSun
                      className={`w-4 h-4 ${isSelected ? 'text-amrit-safe' : 'text-amrit-muted'}`}
                    />
                  )}
                  {sc.iconName === 'TriangleAlert' && (
                    <TriangleAlert
                      className={`w-4 h-4 ${isSelected ? 'text-amrit-emergency' : 'text-amrit-muted'}`}
                    />
                  )}
                </div>
                <div>
                  <div
                    className={`text-xs font-bold truncate ${
                      isSelected ? 'text-amrit-navy' : 'text-amrit-text'
                    }`}
                  >
                    {sc.title}
                  </div>
                  <div className="text-[10px] text-amrit-muted line-clamp-1">
                    {sc.description}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Mini Progress Steps */}
      <div className="px-5 pt-4">
        <div className="flex items-center justify-between mb-3 text-xs font-semibold text-amrit-muted">
          <span className="flex items-center gap-1">
            <span
              className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                demoStep >= 1 ? 'bg-amrit-teal text-white' : 'bg-amrit-border text-amrit-muted'
              }`}
            >
              1
            </span>
            <span>Input received</span>
          </span>
          <span className="h-0.5 flex-1 mx-2 bg-amrit-border" />
          <span className="flex items-center gap-1">
            <span
              className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                demoStep >= 2 ? 'bg-amrit-teal text-white' : 'bg-amrit-border text-amrit-muted'
              }`}
            >
              2
            </span>
            <span>Safety checks</span>
          </span>
          <span className="h-0.5 flex-1 mx-2 bg-amrit-border" />
          <span className="flex items-center gap-1">
            <span
              className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                demoStep === 3 ? 'bg-amrit-teal text-white' : 'bg-amrit-border text-amrit-muted'
              }`}
            >
              3
            </span>
            <span>Guidance ready</span>
          </span>
        </div>
      </div>

      {/* Dynamic Content Body based on step */}
      <div className="p-5 space-y-4">
        {/* Step 1: Input Received Box */}
        <div className="p-3.5 rounded-xl bg-amrit-bg border border-amrit-border text-xs space-y-2">
          <div className="flex items-center justify-between text-[11px] font-semibold text-amrit-muted">
            <span className="flex items-center gap-1 text-amrit-navy">
              <span className="font-bold">Input Language:</span> {currentScenario.language}
            </span>
            <span className="text-amrit-teal font-medium">Stage {demoStep}/3</span>
          </div>

          <div className="p-2.5 rounded-lg bg-white border border-amrit-border/80 text-amrit-navy font-medium text-xs sm:text-sm italic">
            "{currentScenario.input}"
          </div>

          <div className="flex flex-wrap gap-1.5 pt-1">
            {currentScenario.chips.map((chip, idx) => (
              <span
                key={idx}
                className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-amrit-border/50 text-amrit-navy"
              >
                {chip}
              </span>
            ))}
          </div>
        </div>

        {/* Step 2 & 3: Triage Result Card */}
        {demoStep >= 2 && (
          <div
            className={`p-4 rounded-card border transition-all duration-300 ${badgeConfig.bg}`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <UrgencyIcon className={`w-5 h-5 ${badgeConfig.textColor}`} />
                <span className="text-xs font-bold uppercase tracking-wider">
                  Mock Urgency Outcome
                </span>
              </div>
              <span
                className={`text-xs font-extrabold px-2.5 py-1 rounded-full bg-white/80 ${badgeConfig.textColor} shadow-soft`}
              >
                {currentScenario.urgencyLabel}
              </span>
            </div>

            {demoStep === 2 && (
              <div className="py-2 text-xs font-medium text-amrit-navy space-y-1">
                <div className="flex items-center gap-2 text-amrit-teal">
                  <HeartPulse className="w-4 h-4 animate-spin" />
                  <span>Evaluating safety red flags & localized next step rules...</span>
                </div>
              </div>
            )}

            {demoStep === 3 && (
              <div className="space-y-2.5 mt-3 pt-3 border-t border-current/20">
                <p className="text-xs font-bold text-amrit-navy uppercase tracking-wider">
                  Recommended Safe Next Steps:
                </p>
                <ul className="space-y-1.5 text-xs font-medium text-amrit-navy">
                  {currentScenario.nextSteps.map((step, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-current mt-1.5 flex-shrink-0" />
                      <span>{step}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Step Controller Button */}
        <div className="flex items-center justify-between gap-3 pt-1">
          <button
            type="button"
            onClick={handleNextStep}
            className="flex-1 inline-flex items-center justify-center gap-2 py-2 px-3 text-xs sm:text-sm font-semibold text-amrit-navy bg-amrit-bg hover:bg-amrit-border/60 border border-amrit-border rounded-xl transition-all"
          >
            {demoStep < 3 ? (
              <>
                <span>Next demo step</span>
                <ArrowRight className="w-4 h-4" />
              </>
            ) : (
              <>
                <RotateCcw className="w-4 h-4" />
                <span>Replay demo</span>
              </>
            )}
          </button>

          <Link
            to="/check"
            className="flex-1 inline-flex items-center justify-center gap-2 py-2 px-3 text-xs sm:text-sm font-semibold text-white bg-amrit-teal hover:bg-amrit-tealDark rounded-xl shadow-soft transition-all"
          >
            <span>Start your check</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Mandatory Demo Label */}
        <div className="text-center py-1">
          <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-amrit-muted bg-amrit-bg px-3 py-1 rounded-full border border-amrit-border">
            <ShieldCheck className="w-3.5 h-3.5 text-amrit-teal" />
            <span>Demo guidance — not a diagnosis.</span>
          </span>
        </div>

        {/* Expandable Accordion */}
        <div className="border-t border-amrit-border pt-3 space-y-2">
          {/* Accordion 1: Why this guidance? */}
          <div className="border border-amrit-border/70 rounded-xl overflow-hidden text-xs">
            <button
              type="button"
              onClick={() => toggleAccordion('why')}
              className="w-full p-2.5 text-left font-semibold text-amrit-navy flex items-center justify-between bg-amrit-bg/50 hover:bg-amrit-bg"
            >
              <span>Why this guidance?</span>
              {openAccordion === 'why' ? (
                <ChevronUp className="w-4 h-4 text-amrit-muted" />
              ) : (
                <ChevronDown className="w-4 h-4 text-amrit-muted" />
              )}
            </button>
            {openAccordion === 'why' && (
              <div className="p-3 text-amrit-muted bg-white border-t border-amrit-border/70 leading-relaxed">
                {currentScenario.rationale}
              </div>
            )}
          </div>

          {/* Accordion 2: What should I watch for? */}
          <div className="border border-amrit-border/70 rounded-xl overflow-hidden text-xs">
            <button
              type="button"
              onClick={() => toggleAccordion('watch')}
              className="w-full p-2.5 text-left font-semibold text-amrit-navy flex items-center justify-between bg-amrit-bg/50 hover:bg-amrit-bg"
            >
              <span>What should I watch for?</span>
              {openAccordion === 'watch' ? (
                <ChevronUp className="w-4 h-4 text-amrit-muted" />
              ) : (
                <ChevronDown className="w-4 h-4 text-amrit-muted" />
              )}
            </button>
            {openAccordion === 'watch' && (
              <div className="p-3 text-amrit-muted bg-white border-t border-amrit-border/70 leading-relaxed">
                {currentScenario.watchFor}
              </div>
            )}
          </div>

          {/* Accordion 3: How does Amrit protect users? */}
          <div className="border border-amrit-border/70 rounded-xl overflow-hidden text-xs">
            <button
              type="button"
              onClick={() => toggleAccordion('protect')}
              className="w-full p-2.5 text-left font-semibold text-amrit-navy flex items-center justify-between bg-amrit-bg/50 hover:bg-amrit-bg"
            >
              <span>How does Amrit protect users?</span>
              {openAccordion === 'protect' ? (
                <ChevronUp className="w-4 h-4 text-amrit-muted" />
              ) : (
                <ChevronDown className="w-4 h-4 text-amrit-muted" />
              )}
            </button>
            {openAccordion === 'protect' && (
              <div className="p-3 text-amrit-muted bg-white border-t border-amrit-border/70 leading-relaxed">
                {currentScenario.protectionNote}
              </div>
            )}
          </div>
        </div>

        {/* Feedback Section */}
        <div className="pt-2 border-t border-amrit-border flex items-center justify-between text-xs text-amrit-muted">
          <span>Was this preview helpful?</span>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => handleFeedback(true)}
              disabled={feedbackGiven}
              className={`px-2.5 py-1 rounded-lg border transition-all text-xs font-semibold ${
                feedbackGiven
                  ? 'bg-amrit-bg text-amrit-muted border-amrit-border cursor-default'
                  : 'bg-white hover:bg-amrit-tealLight text-amrit-navy border-amrit-border hover:border-amrit-teal'
              }`}
            >
              Yes
            </button>
            <button
              type="button"
              onClick={() => handleFeedback(false)}
              disabled={feedbackGiven}
              className={`px-2.5 py-1 rounded-lg border transition-all text-xs font-semibold ${
                feedbackGiven
                  ? 'bg-amrit-bg text-amrit-muted border-amrit-border cursor-default'
                  : 'bg-white hover:bg-amrit-bg text-amrit-navy border-amrit-border'
              }`}
            >
              Not yet
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
