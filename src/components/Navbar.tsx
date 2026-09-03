import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShieldCheck, HeartPulse, Globe, ArrowRight, Menu, X } from 'lucide-react';
import { SUPPORTED_LANGUAGES } from '../data/languages';
import { LanguageCode } from '../types';

interface NavbarProps {
  currentLanguage?: LanguageCode;
  onLanguageChange?: (lang: LanguageCode) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentLanguage = 'en',
  onLanguageChange,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const location = useLocation();

  const selectedLangObj =
    SUPPORTED_LANGUAGES.find((l) => l.code === currentLanguage) || SUPPORTED_LANGUAGES[0];

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-amrit-border transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Left: Logo */}
          <Link
            to="/"
            className="flex items-center gap-3 group focus:outline-none"
            aria-label="Amrit Home"
          >
            <img src="/logo.jpg" alt="Amrit Logo" className="w-11 h-11 rounded-xl shadow-soft group-hover:scale-105 transition-transform object-cover" />
            <div className="flex flex-col">
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-bold tracking-tight text-amrit-navy">
                  Amrit
                </span>
                <span className="text-sm font-semibold text-amrit-teal bg-amrit-tealLight px-2 py-0.5 rounded-full">
                  अमृत
                </span>
              </div>
              <span className="text-[11px] font-medium text-amrit-muted hidden sm:block">
                Health Compass
              </span>
            </div>
          </Link>

          {/* Center: Navigation Links */}
          <nav className="hidden md:flex items-center gap-8">
            <Link
              to="/"
              className={`text-sm font-semibold transition-colors ${
                isActive('/') ? 'text-amrit-teal font-bold' : 'text-amrit-text hover:text-amrit-teal'
              }`}
            >
              Home
            </Link>
            <Link
              to="/how-it-works"
              className={`text-sm font-semibold transition-colors ${
                isActive('/how-it-works') ? 'text-amrit-teal font-bold' : 'text-amrit-text hover:text-amrit-teal'
              }`}
            >
              How It Works
            </Link>
            <Link
              to="/safety"
              className={`text-sm font-semibold transition-colors ${
                isActive('/safety') ? 'text-amrit-teal font-bold' : 'text-amrit-text hover:text-amrit-teal'
              }`}
            >
              Safety
            </Link>
          </nav>

          {/* Right: Language Selector & CTA */}
          <div className="hidden md:flex items-center gap-4">
            {/* Language Selector */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-amrit-navy bg-amrit-bg hover:bg-amrit-border/50 border border-amrit-border rounded-xl transition-all"
                aria-expanded={langDropdownOpen}
                aria-haspopup="true"
              >
                <Globe className="w-4 h-4 text-amrit-teal" />
                <span>{selectedLangObj.nativeName}</span>
                <span className="text-xs text-amrit-muted">({selectedLangObj.name})</span>
              </button>

              {langDropdownOpen && (
                <div
                  className="absolute right-0 mt-2 w-52 bg-white rounded-card shadow-card-hover border border-amrit-border py-2 z-50"
                  role="menu"
                >
                  <div className="px-3 py-1.5 text-xs font-semibold text-amrit-muted uppercase tracking-wider border-b border-amrit-border/60">
                    Select Language
                  </div>
                  {SUPPORTED_LANGUAGES.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        onLanguageChange?.(lang.code);
                        setLangDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3.5 py-2.5 text-sm flex items-center justify-between hover:bg-amrit-bg transition-colors ${
                        currentLanguage === lang.code
                          ? 'bg-amrit-tealLight font-bold text-amrit-teal'
                          : 'text-amrit-text'
                      }`}
                      role="menuitem"
                    >
                      <span className="font-medium">{lang.nativeName}</span>
                      <span className="text-xs text-amrit-muted">{lang.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* CTA Button */}
            <Link
              to="/check"
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-amrit-teal hover:bg-amrit-tealDark rounded-xl shadow-soft hover:shadow-card transition-all transform active:scale-95"
            >
              <span>Start Symptom Check</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Mobile Menu Toggle */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-amrit-navy hover:text-amrit-teal focus:outline-none"
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile dropdown menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-amrit-border px-4 pt-3 pb-6 space-y-4 shadow-card">
          <nav className="flex flex-col space-y-3">
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className={`px-3 py-2 rounded-lg text-base font-semibold ${
                isActive('/') ? 'bg-amrit-tealLight text-amrit-teal' : 'text-amrit-navy'
              }`}
            >
              Home
            </Link>
            <Link
              to="/how-it-works"
              onClick={() => setMobileMenuOpen(false)}
              className={`px-3 py-2 rounded-lg text-base font-semibold ${
                isActive('/how-it-works') ? 'bg-amrit-tealLight text-amrit-teal' : 'text-amrit-navy'
              }`}
            >
              How It Works
            </Link>
            <Link
              to="/safety"
              onClick={() => setMobileMenuOpen(false)}
              className={`px-3 py-2 rounded-lg text-base font-semibold ${
                isActive('/safety') ? 'bg-amrit-tealLight text-amrit-teal' : 'text-amrit-navy'
              }`}
            >
              Safety
            </Link>
          </nav>

          <div className="pt-2 border-t border-amrit-border">
            <p className="text-xs font-bold text-amrit-muted uppercase mb-2">Language</p>
            <div className="grid grid-cols-2 gap-2">
              {SUPPORTED_LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => {
                    onLanguageChange?.(lang.code);
                    setMobileMenuOpen(false);
                  }}
                  className={`p-2 text-left rounded-lg text-sm flex items-center justify-between border ${
                    currentLanguage === lang.code
                      ? 'border-amrit-teal bg-amrit-tealLight text-amrit-teal font-bold'
                      : 'border-amrit-border bg-amrit-bg text-amrit-navy'
                  }`}
                >
                  <span>{lang.nativeName}</span>
                  <span className="text-xs text-amrit-muted">{lang.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="pt-2">
            <Link
              to="/check"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 text-base font-semibold text-white bg-amrit-teal hover:bg-amrit-tealDark rounded-xl shadow-soft"
            >
              <span>Start Symptom Check</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
