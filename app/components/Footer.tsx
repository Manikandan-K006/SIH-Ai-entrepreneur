"use client";

import { useEffect, useState } from "react";
import { getLanguage } from "../api";
import { translations, Language } from "../translations";

export default function Footer() {
  const [lang, setLang] = useState<Language>("en");

  useEffect(() => {
    setLang(getLanguage());
    const handleLangChange = () => setLang(getLanguage());
    window.addEventListener("languageChanged", handleLangChange);
    return () => window.removeEventListener("languageChanged", handleLangChange);
  }, []);

  const t = translations[lang];

  return (
    <footer className="w-full bg-slate-900 text-white mt-auto border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <span className="font-bold text-lg text-primary tracking-tight">{t.appName}</span>
          <p className="text-xs text-slate-400 mt-1">
            {t.appSubtitle} — SIH26091
          </p>
        </div>
        
        <div className="flex flex-wrap justify-center gap-6 text-xs text-slate-400">
          <span>&copy; {new Date().getFullYear()} SATYA AI. All rights reserved.</span>
          <a href="#" className="hover:underline hover:text-white">Privacy Policy</a>
          <a href="#" className="hover:underline hover:text-white">Terms of Service</a>
          <a href="#" className="hover:underline hover:text-white">Verify Schemes</a>
        </div>
      </div>
    </footer>
  );
}
