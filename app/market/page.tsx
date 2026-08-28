"use client";

import { useEffect, useState } from "react";
import { api, getLanguage } from "../api";
import { translations, Language } from "../translations";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import {
  TrendingUp,
  MapPin,
  Building,
  CheckCircle,
  AlertTriangle,
  Info,
  Compass,
  ArrowRight,
  Loader2
} from "lucide-react";

export default function MarketPage() {
  const [lang, setLang] = useState<Language>("en");
  const [state, setState] = useState("Tamil Nadu");
  const [district, setDistrict] = useState("Salem");
  const [category, setCategory] = useState("Food Processing");
  const [loading, setLoading] = useState(false);
  const [analyzed, setAnalyzed] = useState(false);
  const [market, setMarket] = useState<any>(null);

  const t = translations[lang];

  useEffect(() => {
    setLang(getLanguage());
    const handleLangChange = () => setLang(getLanguage());
    window.addEventListener("languageChanged", handleLangChange);
    return () => window.removeEventListener("languageChanged", handleLangChange);
  }, []);

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = await api.getMarketAnalysis(state, district, category);
      setMarket(data);
      setAnalyzed(true);
    } catch (err: any) {
      alert("Failed to fetch market analysis.");
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 75) return "text-emerald-600 border-emerald-200 bg-emerald-50";
    if (score >= 50) return "text-amber-600 border-amber-200 bg-amber-50";
    return "text-rose-600 border-rose-200 bg-rose-50";
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <main className="flex-grow max-w-6xl w-full mx-auto px-4 py-8 sm:px-6 lg:px-8 space-y-6">
        
        {/* Banner */}
        <div className="bg-white p-6 rounded-2xl border border-border shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
              <Compass className="w-6 h-6 text-primary" />
              Hyper-Local Market Intelligence
            </h1>
            <p className="text-sm text-gray-500">
              Analyze demand indicators, seasonal variations, competitor clusters, and nearby markets.
            </p>
          </div>
        </div>

        {/* Form parameters */}
        <form onSubmit={handleAnalyze} className="bg-white p-6 rounded-2xl border border-border shadow-sm flex flex-wrap gap-4 items-end">
          <div className="flex-grow min-w-[200px]">
            <label className="block text-[10px] font-bold text-gray-700 uppercase tracking-wider mb-1">State</label>
            <select
              value={state}
              onChange={(e) => setState(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-border bg-white text-xs cursor-pointer focus:outline-none"
            >
              <option value="Tamil Nadu">Tamil Nadu</option>
              <option value="Uttar Pradesh">Uttar Pradesh</option>
            </select>
          </div>

          <div className="flex-grow min-w-[200px]">
            <label className="block text-[10px] font-bold text-gray-700 uppercase tracking-wider mb-1">District</label>
            <input
              type="text"
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              placeholder="e.g. Salem"
              className="w-full px-4 py-2.5 rounded-xl border border-border bg-white text-xs focus:outline-none"
            />
          </div>

          <div className="flex-grow min-w-[200px]">
            <label className="block text-[10px] font-bold text-gray-700 uppercase tracking-wider mb-1">Business Sector</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-border bg-white text-xs cursor-pointer focus:outline-none"
            >
              <option value="Food Processing">Food Processing</option>
              <option value="Dairy">Dairy</option>
              <option value="Textile">Textile</option>
              <option value="Agriculture">Agriculture</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl transition-all shadow-glow flex items-center gap-1.5"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Run Market Check"}
          </button>
        </form>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          analyzed && market && (
            <div className="space-y-6 animate-fade-in">
              
              {/* Score card & map row */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Score Circle Card */}
                <div className={`p-6 rounded-2xl border text-center flex flex-col justify-center items-center space-y-3 shadow-sm ${getScoreColor(market.opportunity_score)}`}>
                  <h3 className="text-xs font-bold uppercase tracking-wider">Opportunity Score</h3>
                  <div className="text-6xl font-black">{market.opportunity_score} <span className="text-lg">/100</span></div>
                  <span className="text-xs px-3 py-1 rounded-full bg-white/60 font-bold border border-black/5">
                    {market.data_note}
                  </span>
                </div>

                {/* Factors breakdown progress */}
                <div className="bg-white p-6 rounded-2xl border border-border shadow-sm lg:col-span-2 space-y-4">
                  <h3 className="font-bold text-gray-900 text-sm border-b border-slate-100 pb-2">Opportunity Factor Matrix</h3>
                  
                  <div className="space-y-3">
                    {Object.entries(market.factors).map(([key, f]: [string, any]) => (
                      <div key={key} className="space-y-1">
                        <div className="flex justify-between text-xs font-bold text-gray-700 capitalize">
                          <span>{key.replace(/_/g, " ")}</span>
                          <span>{f.score}% ({f.level})</span>
                        </div>
                        <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                          <div
                            className="bg-primary h-full transition-all"
                            style={{ width: `${f.score}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Local Details: Markets, Competitors, Patterns */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Markets */}
                <div className="bg-white p-5 rounded-2xl border border-border shadow-sm space-y-3">
                  <h4 className="font-bold text-gray-900 text-sm border-b border-slate-100 pb-1.5 flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-primary" /> Nearby Market Hubs
                  </h4>
                  {market.nearby_markets?.length === 0 ? (
                    <p className="text-xs text-gray-500">No market center listed nearby</p>
                  ) : (
                    <ul className="space-y-1.5 text-xs text-gray-700">
                      {market.nearby_markets?.map((m: string, i: number) => (
                        <li key={i} className="flex gap-1.5 items-center">
                          <span className="h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0"></span>
                          <span>{m}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* Competitors */}
                <div className="bg-white p-5 rounded-2xl border border-border shadow-sm space-y-3">
                  <h4 className="font-bold text-gray-900 text-sm border-b border-slate-100 pb-1.5 flex items-center gap-1.5">
                    <Building className="w-4 h-4 text-accent" /> Competitor Clusters
                  </h4>
                  {market.key_competitors?.length === 0 ? (
                    <p className="text-xs text-gray-500">Low competition detected in nearby perimeter</p>
                  ) : (
                    <ul className="space-y-1.5 text-xs text-gray-700">
                      {market.key_competitors?.map((c: string, i: number) => (
                        <li key={i} className="flex gap-1.5 items-center">
                          <span className="h-1.5 w-1.5 rounded-full bg-accent flex-shrink-0"></span>
                          <span>{c}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* Seasonal variations */}
                <div className="bg-white p-5 rounded-2xl border border-border shadow-sm space-y-3">
                  <h4 className="font-bold text-gray-900 text-sm border-b border-slate-100 pb-1.5 flex items-center gap-1.5">
                    <TrendingUp className="w-4 h-4 text-secondary" /> Seasonal Patterns
                  </h4>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    {market.seasonal_patterns || "No specific patterns listed. Business typically shows steady year-round cash flow."}
                  </p>
                </div>
              </div>

              {/* Map container simulation */}
              <div className="bg-white p-6 rounded-2xl border border-border shadow-sm">
                <h3 className="font-bold text-gray-900 text-sm mb-3">Hyper-Local Map Radius Analysis</h3>
                <div className="w-full h-80 rounded-xl bg-slate-100 flex flex-col justify-center items-center text-center p-6 border border-slate-200 relative overflow-hidden">
                  
                  {/* Grid elements to simulate map */}
                  <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:16px_16px]"></div>
                  
                  <div className="relative z-10 space-y-2 max-w-sm">
                    <Compass className="w-10 h-10 text-primary mx-auto animate-spin" style={{ animationDuration: "12s" }} />
                    <h4 className="font-bold text-sm text-gray-900">Map Interface Simulation</h4>
                    <p className="text-xs text-gray-500">
                      Leaflet & OpenStreetMap render. Ready to integrate GPS markers for Salem food units, raw material points and transport hubs.
                    </p>
                  </div>
                </div>
              </div>

            </div>
          )
        )}

      </main>

      <Footer />
    </div>
  );
}
