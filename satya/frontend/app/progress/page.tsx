"use client";

import { useEffect, useState } from "react";
import { api, getLanguage } from "../api";
import { translations, Language } from "../translations";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { CheckCircle2, Circle, TrendingUp, Sparkles, Award } from "lucide-react";

export default function ProgressPage() {
  const [lang, setLang] = useState<Language>("en");
  const [milestones, setMilestones] = useState<any[]>([
    { id: 1, text: "Verify raw material price indices with Salem Spice Hub", completed: true, days: 30 },
    { id: 2, text: "Complete financial structuring inputs & EMI simulation", completed: true, days: 30 },
    { id: 3, text: "Verify PM-FME credit-linked subsidy eligibility criteria", completed: false, days: 30 },
    { id: 4, text: "Procure mixer grinders & dehydrator assets", completed: false, days: 60 },
    { id: 5, text: "Apply for FSSAI registration & municipal trade license", completed: false, days: 60 },
    { id: 6, text: "Sign procurement supply contract with regional mango growers", completed: false, days: 90 },
    { id: 7, text: "List packaged spice powders on Amazon Karigar portal", completed: false, days: 90 },
  ]);

  const t = translations[lang];

  useEffect(() => {
    setLang(getLanguage());
    const handleLangChange = () => setLang(getLanguage());
    window.addEventListener("languageChanged", handleLangChange);
    return () => window.removeEventListener("languageChanged", handleLangChange);
  }, []);

  const handleToggle = (id: number) => {
    setMilestones(
      milestones.map((m) => (m.id === id ? { ...m, completed: !m.completed } : m))
    );
  };

  const getCompletedCount = () => milestones.filter((m) => m.completed).length;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <main className="flex-grow max-w-4xl w-full mx-auto px-4 py-8 sm:px-6 lg:px-8 space-y-6">
        
        {/* Banner */}
        <div className="bg-white p-6 rounded-2xl border border-border shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-primary" />
              Business Milestones & Progress
            </h1>
            <p className="text-sm text-gray-500">
              Track setup execution, verify progress rates, and log target timelines.
            </p>
          </div>
        </div>

        {/* Progress Bar Header */}
        <div className="bg-white p-6 rounded-2xl border border-border shadow-sm space-y-3">
          <div className="flex justify-between items-center text-xs font-bold uppercase tracking-wider text-gray-700">
            <span>Overall Roadmap Goals</span>
            <span>{getCompletedCount()} of {milestones.length} Completed</span>
          </div>
          <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
            <div
              className="bg-primary h-full transition-all duration-300"
              style={{ width: `${(getCompletedCount() / milestones.length) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Timeline checklist */}
        <div className="space-y-6">
          {[30, 60, 90].map((days) => (
            <div key={days} className="bg-white p-6 rounded-2xl border border-border shadow-sm space-y-4">
              <h3 className="font-extrabold text-sm text-gray-900 border-b border-slate-100 pb-2 flex items-center gap-2">
                <Award className="w-4 h-4 text-primary" />
                {days}-Day Execution Checklist (Setup phase)
              </h3>
              
              <div className="space-y-3">
                {milestones
                  .filter((m) => m.days === days)
                  .map((m) => (
                    <button
                      key={m.id}
                      onClick={() => handleToggle(m.id)}
                      className="w-full text-left p-3.5 rounded-xl border border-slate-100 hover:border-primary/20 hover:bg-slate-50/50 flex items-start gap-3 transition-colors text-xs text-gray-700 font-medium cursor-pointer"
                    >
                      {m.completed ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                      ) : (
                        <Circle className="w-5 h-5 text-slate-300 flex-shrink-0 mt-0.5" />
                      )}
                      <span className={m.completed ? "line-through text-slate-400" : ""}>{m.text}</span>
                    </button>
                  ))}
              </div>
            </div>
          ))}
        </div>

      </main>

      <Footer />
    </div>
  );
}
