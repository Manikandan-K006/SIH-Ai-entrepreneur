"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api, getLanguage, getUserName } from "../api";
import { translations, Language } from "../translations";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import {
  Compass,
  FileText,
  DollarSign,
  Award,
  TrendingUp,
  Users,
  MapPin,
  Settings,
  Sparkles,
  ArrowRight,
  TrendingDown,
  Building,
  Target,
  ArrowRightCircle
} from "lucide-react";

export default function Dashboard() {
  const [lang, setLang] = useState<Language>("en");
  const [name, setName] = useState("");
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const t = translations[lang];

  useEffect(() => {
    setLang(getLanguage());
    setName(getUserName() || "");
    const handleLangChange = () => setLang(getLanguage());
    window.addEventListener("languageChanged", handleLangChange);

    // Fetch profile
    api.getProfile()
      .then((data) => {
        setProfile(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || "Failed to load dashboard data.");
        setLoading(false);
      });

    return () => window.removeEventListener("languageChanged", handleLangChange);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50 justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Opportunity score color mapping
  const getScoreColor = (score: number) => {
    if (score >= 75) return "text-emerald-600 bg-emerald-50 border-emerald-200";
    if (score >= 50) return "text-amber-600 bg-amber-50 border-amber-200";
    return "text-rose-600 bg-rose-50 border-rose-200";
  };

  const score = profile?.opportunity_score || 78;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <main className="flex-grow max-w-7xl w-full mx-auto px-4 py-8 sm:px-6 lg:px-8 space-y-6">
        {/* Welcome Banner */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl border border-border shadow-sm">
          <div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">
              Vanakkam, {name || "Entrepreneur"}!
            </h1>
            <p className="text-sm text-gray-500">
              Welcome back to your business control center. Here is your local insight.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-full">
            <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" />
            <span>{t.demoWarning}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT COLUMN: Profile summary & Score */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Opportunity score widget */}
            <div className={`p-6 rounded-2xl border text-center space-y-3 ${getScoreColor(score)} shadow-sm`}>
              <h3 className="font-bold text-xs uppercase tracking-wider">{t.opportunityScore}</h3>
              <div className="text-5xl font-black">{score} <span className="text-lg">/100</span></div>
              <p className="text-xs max-w-xs mx-auto">
                Based on your available capital, Salem micro-food processing demand parameters, and skills.
              </p>
            </div>

            {/* Profile summary card */}
            <div className="bg-white p-6 rounded-2xl border border-border shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-gray-900 border-b border-slate-100 pb-2">Business Profile</h3>
              
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 flex items-center gap-1.5">
                    <Building className="w-4 h-4" /> Category
                  </span>
                  <span className="font-semibold text-gray-900">{profile?.business_category || "Food Processing"}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 flex items-center gap-1.5">
                    <MapPin className="w-4 h-4" /> {t.location}
                  </span>
                  <span className="font-semibold text-gray-900">
                    {profile?.village_town ? `${profile.village_town}, ${profile.district}` : "Salem, Tamil Nadu"}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 flex items-center gap-1.5">
                    <DollarSign className="w-4 h-4" /> {t.capital}
                  </span>
                  <span className="font-semibold text-gray-900">₹{profile?.available_capital?.toLocaleString() || "2,00,000"}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 flex items-center gap-1.5">
                    <Target className="w-4 h-4" /> Stage
                  </span>
                  <span className="font-semibold text-primary uppercase text-xs bg-primary/10 px-2 py-0.5 rounded-full font-bold">
                    {profile?.business_stage || "Idea"}
                  </span>
                </div>
              </div>

              <Link
                href="/onboarding"
                className="w-full btn-interactive flex items-center justify-center bg-slate-100 hover:bg-slate-200 text-gray-700 font-bold py-2 rounded-xl text-xs"
              >
                Update Profile & Demographic Info
              </Link>
            </div>
          </div>

          {/* RIGHT COLUMN: AI recommendations & Quick Actions */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Quick Actions Grid */}
            <div className="bg-white p-6 rounded-2xl border border-border shadow-sm">
              <h3 className="text-sm font-bold text-gray-900 mb-4">Quick Business Actions</h3>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <Link
                  href="/chat"
                  className="p-4 rounded-xl border border-border hover:border-primary hover:bg-emerald-50/30 transition-all flex flex-col items-center text-center gap-2"
                >
                  <Compass className="w-6 h-6 text-primary" />
                  <span className="text-xs font-bold text-gray-800">{t.askSatya}</span>
                </Link>

                <Link
                  href="/business"
                  className="p-4 rounded-xl border border-border hover:border-primary hover:bg-emerald-50/30 transition-all flex flex-col items-center text-center gap-2"
                >
                  <FileText className="w-6 h-6 text-primary" />
                  <span className="text-xs font-bold text-gray-800">{t.createPlan}</span>
                </Link>

                <Link
                  href="/financial"
                  className="p-4 rounded-xl border border-border hover:border-primary hover:bg-emerald-50/30 transition-all flex flex-col items-center text-center gap-2"
                >
                  <DollarSign className="w-6 h-6 text-primary" />
                  <span className="text-xs font-bold text-gray-800">{t.financialPlanner}</span>
                </Link>

                <Link
                  href="/schemes"
                  className="p-4 rounded-xl border border-border hover:border-primary hover:bg-emerald-50/30 transition-all flex flex-col items-center text-center gap-2"
                >
                  <Award className="w-6 h-6 text-primary" />
                  <span className="text-xs font-bold text-gray-800">{t.govSchemes}</span>
                </Link>

                <Link
                  href="/market"
                  className="p-4 rounded-xl border border-border hover:border-primary hover:bg-emerald-50/30 transition-all flex flex-col items-center text-center gap-2"
                >
                  <TrendingUp className="w-6 h-6 text-primary" />
                  <span className="text-xs font-bold text-gray-800">{t.localMarket}</span>
                </Link>

                <Link
                  href="/network"
                  className="p-4 rounded-xl border border-border hover:border-primary hover:bg-emerald-50/30 transition-all flex flex-col items-center text-center gap-2"
                >
                  <Users className="w-6 h-6 text-primary" />
                  <span className="text-xs font-bold text-gray-800">{t.peopleNetwork}</span>
                </Link>
              </div>
            </div>

            {/* AI recommendations feed */}
            <div className="bg-white p-6 rounded-2xl border border-border shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-gray-900 border-b border-slate-100 pb-2">AI-Driven Recommendations</h3>
              
              <div className="space-y-3">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex justify-between items-start gap-4">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                      Recommended Next Step
                    </span>
                    <h4 className="text-sm font-bold text-gray-900">Conduct Business Idea Validation</h4>
                    <p className="text-xs text-gray-600">
                      Use our validator to check feasibility of &quot;{profile?.business_idea || "Small food-processing unit"}&quot;.
                    </p>
                  </div>
                  <Link href="/business" className="text-primary hover:text-primary-hover flex-shrink-0">
                    <ArrowRightCircle className="w-5 h-5" />
                  </Link>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex justify-between items-start gap-4">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full">
                      Financial Insights
                    </span>
                    <h4 className="text-sm font-bold text-gray-900">Setup Project Cost Projection</h4>
                    <p className="text-xs text-gray-600">
                      Map your equipment costs (₹2L capital) to calculate own vs loan ratio.
                    </p>
                  </div>
                  <Link href="/financial" className="text-primary hover:text-primary-hover flex-shrink-0">
                    <ArrowRightCircle className="w-5 h-5" />
                  </Link>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex justify-between items-start gap-4">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                      Government Scheme Match
                    </span>
                    <h4 className="text-sm font-bold text-gray-900">PM Formalisation of Micro Food Processing (PM-FME)</h4>
                    <p className="text-xs text-gray-600">
                      You may be eligible for a 35% capital subsidy for food processing.
                    </p>
                  </div>
                  <Link href="/schemes" className="text-primary hover:text-primary-hover flex-shrink-0">
                    <ArrowRightCircle className="w-5 h-5" />
                  </Link>
                </div>
              </div>
            </div>

          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
