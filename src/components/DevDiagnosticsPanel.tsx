import React, { useState } from 'react';
import { CheckCircle2, XCircle, RefreshCw, ChevronUp, ChevronDown, Wrench } from 'lucide-react';

interface DiagnosticResponse {
  configured: boolean;
  model?: string;
  reachable: boolean;
  response_received?: boolean;
  message: string;
}

export const DevDiagnosticsPanel: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [diagnosticResult, setDiagnosticResult] = useState<DiagnosticResponse | null>(null);

  // Only show in development mode
  if (typeof import.meta !== 'undefined' && import.meta.env && !import.meta.env.DEV) {
    return null;
  }

  const handleTestConnection = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('http://127.0.0.1:8000/api/diagnostics/gemini');
      const data: DiagnosticResponse = await res.json();
      setDiagnosticResult(data);
    } catch (err) {
      setDiagnosticResult({
        configured: false,
        reachable: false,
        message: 'Could not connect to the local FastAPI backend (is it running on port 8000?).',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-4 left-4 z-50">
      {/* Minimized / Toggle Bar */}
      <div className="bg-amrit-navy text-white rounded-2xl shadow-card border border-white/20 p-2 text-xs flex items-center gap-2">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 font-bold transition-all text-amrit-cyan"
        >
          <Wrench className="w-3.5 h-3.5" />
          <span>Developer test: Gemini Diagnostics</span>
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
              <h4 className="text-xs font-bold text-amrit-navy">Gemini Test Tool</h4>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-xs text-amrit-muted hover:text-amrit-navy font-semibold"
            >
              Close
            </button>
          </div>

          <p className="text-xs text-amrit-muted leading-relaxed font-medium">
            Test the live backend Gemini connection without exposing secrets to the browser.
          </p>

          <button
            type="button"
            onClick={handleTestConnection}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-amrit-teal hover:bg-amrit-tealDark text-white text-xs font-bold rounded-xl shadow-soft transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>{isLoading ? 'Testing connection...' : 'Test Gemini connection'}</span>
          </button>

          {/* Results Display */}
          {diagnosticResult && (
            <div
              className={`p-3.5 rounded-xl border space-y-2 text-xs transition-all ${
                diagnosticResult.reachable
                  ? 'bg-amrit-safeLight/70 border-amrit-safe/40 text-amrit-navy'
                  : 'bg-amrit-emergencyLight/70 border-amrit-emergency/40 text-amrit-navy'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold flex items-center gap-1.5">
                  {diagnosticResult.reachable ? (
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
                {diagnosticResult.model && (
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white/80 border border-current/20">
                    Model: {diagnosticResult.model}
                  </span>
                )}
              </div>

              <p className="text-xs font-medium leading-snug">
                {diagnosticResult.message}
              </p>

              <div className="text-[10px] text-amrit-muted pt-1 border-t border-current/10 flex justify-between">
                <span>Configured: {diagnosticResult.configured ? 'Yes' : 'No'}</span>
                <span>Reachable: {diagnosticResult.reachable ? 'Yes' : 'No'}</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
