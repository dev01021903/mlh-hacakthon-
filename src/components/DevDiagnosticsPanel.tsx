import React, { useState } from 'react';
import { CheckCircle2, XCircle, RefreshCw, ChevronUp, ChevronDown, Wrench, Info, Languages } from 'lucide-react';

interface DiagnosticResponse {
  configured: boolean;
  model?: string;
  configured_model?: string;
  reachable?: boolean;
  model_check_passed?: boolean;
  model_used?: string;
  fallback_model?: string;
  error_category?: string | null;
  retryable?: boolean;
  response_received?: boolean;
  message?: string;
  safe_message?: string;
}

interface SarvamDiagnosticResponse {
  configured: boolean;
  reachable: boolean;
  model: string;
  message: string;
}

export const DevDiagnosticsPanel: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [diagnosticResult, setDiagnosticResult] = useState<DiagnosticResponse | null>(null);
  const [sarvamResult, setSarvamResult] = useState<SarvamDiagnosticResponse | null>(null);
  const [activeTab, setActiveTab] = useState<'gemini' | 'sarvam'>('gemini');

  // Only show in development mode
  if (typeof import.meta !== 'undefined' && import.meta.env && !import.meta.env.DEV) {
    return null;
  }

  const handleTestGemini = async (detailed: boolean = false) => {
    setIsLoading(true);
    setActiveTab('gemini');
    try {
      const endpoint = detailed
        ? 'http://127.0.0.1:8000/api/diagnostics/gemini-details'
        : 'http://127.0.0.1:8000/api/diagnostics/gemini';
      const res = await fetch(endpoint);
      const data: DiagnosticResponse = await res.json();
      setDiagnosticResult(data);
    } catch (err) {
      setDiagnosticResult({
        configured: false,
        reachable: false,
        message: 'Could not connect to local FastAPI backend (is it running on port 8000?).',
        safe_message: 'Could not connect to local FastAPI backend (is it running on port 8000?).',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestSarvam = async () => {
    setIsLoading(true);
    setActiveTab('sarvam');
    try {
      const res = await fetch('http://127.0.0.1:8000/api/diagnostics/sarvam');
      const data: SarvamDiagnosticResponse = await res.json();
      setSarvamResult(data);
    } catch (err) {
      setSarvamResult({
        configured: false,
        reachable: false,
        model: 'sarvam-translate:v1',
        message: 'Could not connect to backend translation endpoint.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const isGeminiConnected = Boolean(
    diagnosticResult?.reachable || diagnosticResult?.model_check_passed
  );

  const isSarvamConnected = Boolean(sarvamResult?.reachable);

  return (
    <div className="fixed bottom-4 left-4 z-50">
      {/* Minimized Toggle Bar */}
      <div className="bg-amrit-navy text-white rounded-2xl shadow-card border border-white/20 p-2 text-xs flex items-center gap-2">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 font-bold transition-all text-amrit-cyan"
        >
          <Wrench className="w-3.5 h-3.5" />
          <span>Dev Diagnostics: AI & Translation</span>
          {isOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Expanded Dev Diagnostics Drawer */}
      {isOpen && (
        <div className="mt-2 bg-white rounded-card-lg border border-amrit-border shadow-card-hover p-5 max-w-sm w-full text-amrit-navy space-y-4 animate-scale-up">
          <div className="flex items-center justify-between pb-2 border-b border-amrit-border">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 text-[10px] font-extrabold uppercase tracking-wider">
                Developer Only
              </span>
              <h4 className="text-xs font-bold text-amrit-navy">AI System Diagnostics</h4>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-xs text-amrit-muted hover:text-amrit-navy font-semibold"
            >
              Close
            </button>
          </div>

          {/* Test Buttons */}
          <div className="space-y-2">
            <p className="text-[11px] font-bold text-amrit-muted uppercase tracking-wider">1. Gemini Triage Reasoning</p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleTestGemini(false)}
                disabled={isLoading}
                className="flex items-center justify-center gap-1.5 py-2 px-2.5 bg-amrit-teal hover:bg-amrit-tealDark text-white text-xs font-bold rounded-xl shadow-soft transition-all disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoading && activeTab === 'gemini' ? 'animate-spin' : ''}`} />
                <span>Test Gemini</span>
              </button>

              <button
                type="button"
                onClick={() => handleTestGemini(true)}
                disabled={isLoading}
                className="flex items-center justify-center gap-1.5 py-2 px-2.5 bg-white hover:bg-amrit-bg text-amrit-navy border border-amrit-border text-xs font-bold rounded-xl shadow-soft transition-all disabled:opacity-50"
              >
                <Info className="w-3.5 h-3.5 text-amrit-teal" />
                <span>Deep Verify</span>
              </button>
            </div>

            <p className="text-[11px] font-bold text-amrit-muted uppercase tracking-wider pt-2">2. Sarvam AI Translation</p>
            <button
              type="button"
              onClick={handleTestSarvam}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-1.5 py-2 px-3 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl shadow-soft transition-all disabled:opacity-50"
            >
              <Languages className={`w-3.5 h-3.5 ${isLoading && activeTab === 'sarvam' ? 'animate-spin' : ''}`} />
              <span>Test Sarvam Translation</span>
            </button>
          </div>

          {/* Gemini Diagnostics Result */}
          {activeTab === 'gemini' && diagnosticResult && (
            <div
              className={`p-3.5 rounded-xl border space-y-2 text-xs transition-all ${
                isGeminiConnected
                  ? 'bg-amrit-safeLight/70 border-amrit-safe/40 text-amrit-navy'
                  : 'bg-amrit-emergencyLight/70 border-amrit-emergency/40 text-amrit-navy'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold flex items-center gap-1.5">
                  {isGeminiConnected ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-amrit-safe" />
                      <span className="text-amrit-safe font-extrabold">Gemini connected</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-4 h-4 text-amrit-emergency" />
                      <span className="text-amrit-emergency font-extrabold">Gemini not connected</span>
                    </>
                  )}
                </span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white/80 border border-current/20">
                  {diagnosticResult.configured_model || diagnosticResult.model || 'gemini-2.0-flash'}
                </span>
              </div>

              <p className="text-xs font-medium leading-snug">
                {diagnosticResult.safe_message || diagnosticResult.message}
              </p>

              {diagnosticResult.error_category && (
                <div className="p-2 rounded-lg bg-white/80 border border-rose-200 text-[11px] font-semibold text-rose-900">
                  <span>Category: </span>
                  <code className="font-mono bg-rose-100 px-1 py-0.5 rounded">{diagnosticResult.error_category}</code>
                </div>
              )}
            </div>
          )}

          {/* Sarvam Diagnostics Result */}
          {activeTab === 'sarvam' && sarvamResult && (
            <div
              className={`p-3.5 rounded-xl border space-y-2 text-xs transition-all ${
                isSarvamConnected
                  ? 'bg-amrit-safeLight/70 border-amrit-safe/40 text-amrit-navy'
                  : 'bg-amber-50 border-amber-300 text-amber-900'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold flex items-center gap-1.5">
                  {isSarvamConnected ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-amrit-safe" />
                      <span className="text-amrit-safe font-extrabold">Sarvam connected</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-4 h-4 text-amber-600" />
                      <span className="text-amber-800 font-extrabold">Sarvam not connected</span>
                    </>
                  )}
                </span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white/80 border border-current/20">
                  {sarvamResult.model}
                </span>
              </div>

              <p className="text-xs font-medium leading-snug">
                {sarvamResult.message}
              </p>

              <div className="text-[10px] text-amrit-muted pt-1 border-t border-current/10 flex justify-between">
                <span>Configured in .env: {sarvamResult.configured ? 'Yes' : 'No'}</span>
                <span>Language codes: 5 supported</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
