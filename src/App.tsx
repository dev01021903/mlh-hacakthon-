import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { DevDiagnosticsPanel } from './components/DevDiagnosticsPanel';
import { LandingPage } from './pages/LandingPage';
import { SymptomCheckPage } from './pages/SymptomCheckPage';
import { ResultPage } from './pages/ResultPage';
import { SafetyPage } from './pages/SafetyPage';
import { HowItWorksPage } from './pages/HowItWorksPage';
import { ToastProvider } from './hooks/useToast';
import { LanguageCode, SymptomFormData, TriageResult } from './types';

// Scroll to top helper component on route navigation
const ScrollToTop: React.FC = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [pathname]);

  return null;
};

export const App: React.FC = () => {
  const [currentLanguage, setCurrentLanguage] = useState<LanguageCode>('en');
  const [latestResult, setLatestResult] = useState<TriageResult | null>(null);
  const [latestFormData, setLatestFormData] = useState<SymptomFormData | null>(null);

  const handleEvaluationComplete = (result: TriageResult, formData: SymptomFormData) => {
    setLatestResult(result);
    setLatestFormData(formData);
  };

  return (
    <ToastProvider>
      <Router>
        <ScrollToTop />
        <div className="flex flex-col min-h-screen bg-amrit-bg text-amrit-text relative">
          {/* Sticky Navbar */}
          <Navbar
            currentLanguage={currentLanguage}
            onLanguageChange={setCurrentLanguage}
          />

          {/* Main Content Router */}
          <main className="flex-grow">
            <Routes>
              <Route
                path="/"
                element={
                  <LandingPage
                    currentLanguage={currentLanguage}
                    onLanguageChange={setCurrentLanguage}
                  />
                }
              />
              <Route
                path="/check"
                element={
                  <SymptomCheckPage
                    defaultLanguage={currentLanguage}
                    onEvaluationComplete={handleEvaluationComplete}
                  />
                }
              />
              <Route
                path="/result"
                element={
                  <ResultPage
                    result={latestResult}
                    formData={latestFormData}
                  />
                }
              />
              <Route path="/safety" element={<SafetyPage />} />
              <Route path="/how-it-works" element={<HowItWorksPage />} />
            </Routes>
          </main>

          {/* Developer Diagnostics Panel (Hidden in production) */}
          <DevDiagnosticsPanel />

          {/* Footer */}
          <Footer />
        </div>
      </Router>
    </ToastProvider>
  );
};

export default App;
