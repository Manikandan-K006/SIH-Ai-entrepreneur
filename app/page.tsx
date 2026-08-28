"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import { getLanguage } from "./api";
import { translations, Language } from "./translations";
import { ArrowRight, Compass, Shield, Users, LineChart, Award, HelpCircle } from "lucide-react";

export default function Home() {
  const [lang, setLang] = useState<Language>("en");

  useEffect(() => {
    setLang(getLanguage());
    const handleLangChange = () => setLang(getLanguage());
    window.addEventListener("languageChanged", handleLangChange);
    return () => window.removeEventListener("languageChanged", handleLangChange);
  }, []);

  const t = translations[lang];

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc]">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 lg:py-32 gradient-hero text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl animate-fade-in">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-xs font-semibold uppercase tracking-wider mb-6">
              SIH26091 AI-DRIVEN PLATFORM
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
              {t.heroTitle}
            </h1>
            <p className="text-lg sm:text-xl text-slate-100 mb-8 max-w-2xl leading-relaxed">
              {t.heroSubtitle}
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/register"
                className="btn-interactive inline-flex items-center justify-center gap-2 bg-white text-primary hover:bg-slate-50 font-bold px-6 py-3 rounded-xl shadow-glow transition-all"
              >
                {t.startJourney}
                <ArrowRight className="w-5 h-5 text-primary" />
              </Link>
              <a
                href="#how-it-works"
                className="btn-interactive inline-flex items-center justify-center bg-white/10 hover:bg-white/20 font-semibold px-6 py-3 rounded-xl transition-all"
              >
                {t.exploreWorks}
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Trust & Transparency Banner */}
      <section className="bg-amber-50 border-y border-amber-200 py-4">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-xs sm:text-sm text-amber-800 font-medium flex items-center justify-center gap-2">
            <Shield className="w-4 h-4 text-amber-600 flex-shrink-0" />
            <span>
              <strong>Transparency first:</strong> SATYA provides AI recommendations and estimates. Always verify with official government sources or bank professionals.
            </span>
          </p>
        </div>
      </section>

      {/* Core Features / How It Works */}
      <section id="how-it-works" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              An Integrated Ecosystem for Your Success
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Unlike generic chatbots, SATYA links AI analysis directly to local market parameters, verified state databases, and active people networks.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="p-6 rounded-2xl border border-slate-100 gradient-card-green shadow-premium">
              <div className="h-12 w-12 rounded-xl bg-primary text-white flex items-center justify-center mb-6">
                <Compass className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">AI Business Advisor</h3>
              <p className="text-sm text-gray-700">
                Type or speak your idea in Tamil, Hindi, or English. SATYA validates feasibility, maps strengths and weaknesses, and designs a 90-day execution roadmap.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-6 rounded-2xl border border-slate-100 gradient-card-blue shadow-premium">
              <div className="h-12 w-12 rounded-xl bg-secondary text-white flex items-center justify-center mb-6">
                <LineChart className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Financial Structuring AI</h3>
              <p className="text-sm text-gray-700">
                Deterministic calculation tools for total project cost, required loans, monthly EMIs, and a transparent 12-month cash-flow forecast.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-6 rounded-2xl border border-slate-100 gradient-card-earth shadow-premium">
              <div className="h-12 w-12 rounded-xl bg-accent text-white flex items-center justify-center mb-6">
                <Award className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Government Scheme Intelligence</h3>
              <p className="text-sm text-gray-700">
                Ground-truth retrieval (RAG) of official Central & State schemes. Shows eligibility, mandatory documents, and official source links without hallucination.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="p-6 rounded-2xl border border-slate-100 bg-slate-50 shadow-premium">
              <div className="h-12 w-12 rounded-xl bg-slate-800 text-white flex items-center justify-center mb-6">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Hyper-Local Market Insight</h3>
              <p className="text-sm text-gray-700">
                Analyzes demand levels, nearby market hubs, price ranges, and competitor clusters based on Tamil Nadu district/village records.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="p-6 rounded-2xl border border-slate-100 bg-slate-50 shadow-premium">
              <div className="h-12 w-12 rounded-xl bg-slate-800 text-white flex items-center justify-center mb-6">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">People Connection Layer</h3>
              <p className="text-sm text-gray-700">
                Direct connections to registered mentors, local raw material suppliers, potential wholesale buyers, and local SHGs/NGOs.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="p-6 rounded-2xl border border-slate-100 bg-slate-50 shadow-premium">
              <div className="h-12 w-12 rounded-xl bg-slate-800 text-white flex items-center justify-center mb-6">
                <HelpCircle className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Interactive Walkthrough</h3>
              <p className="text-sm text-gray-700">
                Interactive onboarding collecting demographics, skills, and capital, leading to a personal, explainable matching score score dashboard.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Success Workflow */}
      <section className="py-20 bg-slate-50 border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 mb-12">
            Your Path to Business Growth
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 max-w-5xl mx-auto">
            {[
              { step: "1", title: "Create Profile", desc: "Enter details & goals" },
              { step: "2", title: "AI Analysis", desc: "Get opportunity score" },
              { step: "3", title: "Plan & Structure", desc: "Generate 90-day plan & budget" },
              { step: "4", title: "Access Schemes", desc: "Find government grants/loans" },
              { step: "5", title: "Connect", desc: "Start messaging mentors/suppliers" },
            ].map((s) => (
              <div key={s.step} className="p-4 bg-white rounded-xl shadow-sm border border-slate-100 relative">
                <span className="absolute top-2 left-2 text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                  Step {s.step}
                </span>
                <h3 className="font-bold text-gray-900 mt-6 mb-1 text-sm">{s.title}</h3>
                <p className="text-xs text-gray-500">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
