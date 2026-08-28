"use client";

import { useEffect, useState } from "react";
import { api, getLanguage, setLanguage } from "../api";
import { translations, Language } from "../translations";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Settings, Globe, Shield, ToggleLeft, Loader2 } from "lucide-react";

export default function SettingsPage() {
  const [lang, setLang] = useState<Language>("en");
  const [loading, setLoading] = useState(false);

  const t = translations[lang];

  useEffect(() => {
    setLang(getLanguage());
    const handleLangChange = () => setLang(getLanguage());
    window.addEventListener("languageChanged", handleLangChange);
    return () => window.removeEventListener("languageChanged", handleLangChange);
  }, []);

  const changeLang = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = e.target.value as Language;
    setLanguage(selected);
    setLang(selected);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <main className="flex-grow max-w-2xl w-full mx-auto px-4 py-8 sm:px-6 lg:px-8 space-y-6">
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-border shadow-sm space-y-6">
          
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
            <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Portal Settings</h2>
              <p className="text-xs text-gray-500">Manage account properties and visual settings</p>
            </div>
          </div>

          <div className="space-y-4 text-xs">
            {/* Preferred Language selector */}
            <div className="p-4 rounded-xl border border-slate-200 flex items-center justify-between gap-4 bg-slate-50/50">
              <div className="space-y-0.5">
                <span className="font-bold text-gray-900 block flex items-center gap-1.5">
                  <Globe className="w-4 h-4 text-primary" /> Preferred Language (இடைமுக மொழி)
                </span>
                <span className="text-[10px] text-gray-500">Select default language for AI assistant and dashboards</span>
              </div>
              <select
                value={lang}
                onChange={changeLang}
                className="px-3 py-2 rounded-lg border border-border bg-white text-xs font-semibold cursor-pointer"
              >
                <option value="en">English</option>
                <option value="ta">தமிழ் (Tamil)</option>
                <option value="hi">हिन्दी (Hindi)</option>
              </select>
            </div>

            {/* Privacy controls */}
            <div className="p-4 rounded-xl border border-slate-200 flex items-center justify-between gap-4 bg-slate-50/50">
              <div className="space-y-0.5">
                <span className="font-bold text-gray-900 block flex items-center gap-1.5">
                  <Shield className="w-4 h-4 text-primary" /> Location GPS Privacy Guard
                </span>
                <span className="text-[10px] text-gray-500">Only request village markers when mapping competitor clusters</span>
              </div>
              <button className="px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold rounded-lg">
                Enabled ✓
              </button>
            </div>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
