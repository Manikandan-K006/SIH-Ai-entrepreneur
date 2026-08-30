"use client";

import { useEffect, useState } from "react";
import { Sprout, DollarSign, Calculator, TrendingUp, Sparkles, CheckCircle2, ShieldCheck, ArrowRight, BookOpen, Layers } from "lucide-react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import { api } from "../api";

export default function FarmerHubPage() {
  const [profile, setProfile] = useState<any>({
    agri_activity_type: "Dairy & Millet Processing",
    land_size_acres: 3.5,
    available_capital: 50000,
    required_investment: 200000,
    target_business: "Dairy expansion & organic finger millet processing",
    consent_given: true,
  });

  const [analyzeIdea, setAnalyzeIdea] = useState("I want to expand my dairy business and process organic millet.");
  const [analysisResult, setAnalysisResult] = useState<any>(null);

  // Financial record form
  const [finMonth, setFinMonth] = useState("2026-08");
  const [salesRevenue, setSalesRevenue] = useState(45000);
  const [inputCost, setInputCost] = useState(12000);
  const [transportCost, setTransportCost] = useState(3500);
  const [labourCost, setLabourCost] = useState(5000);
  const [finRecords, setFinRecords] = useState<any[]>([]);

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const p = await api.getFarmerProfile();
      if (p) setProfile(p);
      const records = await api.getAgriFinancialRecords();
      setFinRecords(records || []);
    } catch (e) {}
  };

  const handleSaveProfile = async () => {
    setLoading(true);
    try {
      const res = await api.updateFarmerProfile(profile);
      setProfile(res);
      alert("Farmer profile saved successfully!");
    } catch (e: any) {
      alert(e.message || "Failed to save profile");
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyzeEnterprise = async () => {
    setLoading(true);
    try {
      const res = await api.analyzeAgriEnterprise({
        business_idea: analyzeIdea,
        location: profile.district ? `${profile.district}, ${profile.state}` : "Tamil Nadu",
        capital: Number(profile.available_capital) || 50000,
        required_investment: Number(profile.required_investment) || 200000,
      });
      setAnalysisResult(res);
    } catch (e: any) {
      alert(e.message || "Analysis failed");
    } finally {
      setLoading(false);
    }
  };

  const handleRecordFinancials = async () => {
    setLoading(true);
    try {
      const res = await api.recordAgriFinancials({
        month_year: finMonth,
        sales_revenue: Number(salesRevenue),
        input_cost: Number(inputCost),
        transport_cost: Number(transportCost),
        labour_cost: Number(labourCost),
        equipment_cost: 0,
        other_expense: 0,
      });
      setFinRecords([res, ...finRecords]);
      alert("Monthly financial record saved!");
    } catch (e: any) {
      alert(e.message || "Save failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-slate-900 text-slate-100 overflow-hidden font-sans">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <Header />

        <main className="p-6 max-w-7xl mx-auto w-full space-y-6">
          {/* Top Banner */}
          <div className="bg-gradient-to-r from-emerald-900/40 via-teal-900/30 to-slate-800 border border-emerald-500/20 rounded-2xl p-6 relative overflow-hidden">
            <div className="relative z-10 space-y-2">
              <div className="flex items-center gap-2 text-emerald-400 font-semibold text-sm">
                <Sprout className="w-5 h-5 text-emerald-400" /> Farmers & Agri-Entrepreneurs Hub
              </div>
              <h1 className="text-3xl font-extrabold tracking-tight text-white">
                Agricultural & Allied Business Advisory
              </h1>
              <p className="text-slate-300 max-w-3xl text-sm">
                Dedicated business planning, financial tracking, market matching, and government support for farmers running dairy, poultry, fisheries, beekeeping, food processing, or crop trading enterprises.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Farmer Profile & Enterprise Setup */}
            <div className="bg-slate-800/80 border border-slate-700/60 rounded-2xl p-5 space-y-4 shadow-xl">
              <h2 className="text-base font-bold text-white flex items-center gap-2 border-b border-slate-700 pb-3">
                <Sprout className="w-4 h-4 text-emerald-400" /> Agri-Enterprise Profile
              </h2>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="text-slate-300 font-semibold">Activity Category:</label>
                  <select
                    value={profile.agri_activity_type || "Dairy & Millet Processing"}
                    onChange={(e) => setProfile({ ...profile, agri_activity_type: e.target.value })}
                    className="w-full mt-1 px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                  >
                    <option value="Dairy & Livestock">Dairy & Livestock</option>
                    <option value="Poultry Farming">Poultry Farming</option>
                    <option value="Fisheries / Aquaculture">Fisheries / Aquaculture</option>
                    <option value="Beekeeping & Honey">Beekeeping & Honey</option>
                    <option value="Food & Grain Processing">Food & Grain Processing</option>
                    <option value="Crop Production & Trading">Crop Production & Trading</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-slate-300 font-semibold">Land Size (Acres):</label>
                    <input
                      type="number"
                      value={profile.land_size_acres || 0}
                      onChange={(e) => setProfile({ ...profile, land_size_acres: parseFloat(e.target.value) })}
                      className="w-full mt-1 px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                    />
                  </div>
                  <div>
                    <label className="text-slate-300 font-semibold">Available Capital (₹):</label>
                    <input
                      type="number"
                      value={profile.available_capital || 0}
                      onChange={(e) => setProfile({ ...profile, available_capital: parseFloat(e.target.value) })}
                      className="w-full mt-1 px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-slate-300 font-semibold">Target Enterprise Goal:</label>
                  <input
                    type="text"
                    value={profile.target_business || ""}
                    onChange={(e) => setProfile({ ...profile, target_business: e.target.value })}
                    placeholder="e.g. Dairy expansion & millet flour packing"
                    className="w-full mt-1 px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                  />
                </div>

                <div className="p-3 bg-slate-900/60 border border-slate-700 rounded-lg flex items-start gap-2">
                  <input
                    type="checkbox"
                    checked={profile.consent_given}
                    onChange={(e) => setProfile({ ...profile, consent_given: e.target.checked })}
                    className="mt-0.5"
                  />
                  <span className="text-[11px] text-slate-400 leading-tight">
                    Explicit Consent: Use this info solely for SATYA advisory & scheme matching. Never share financial data publicly.
                  </span>
                </div>

                <button
                  onClick={handleSaveProfile}
                  disabled={loading}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow transition-colors"
                >
                  Save Agri Profile
                </button>
              </div>
            </div>

            {/* AI Agri-Enterprise Analyzer */}
            <div className="lg:col-span-2 bg-slate-800/80 border border-slate-700/60 rounded-2xl p-5 space-y-4 shadow-xl flex flex-col justify-between">
              <div className="space-y-4">
                <h2 className="text-base font-bold text-white flex items-center gap-2 border-b border-slate-700 pb-3">
                  <Sparkles className="w-4 h-4 text-emerald-400" /> Agri-Enterprise AI Analyzer
                </h2>

                <div className="space-y-2 text-xs">
                  <label className="text-slate-300 font-semibold">Describe Your Farm Enterprise Idea:</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={analyzeIdea}
                      onChange={(e) => setAnalyzeIdea(e.target.value)}
                      className="flex-1 px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs"
                      placeholder="e.g. I produce millet and want to start direct packaged flour sales..."
                    />
                    <button
                      onClick={handleAnalyzeEnterprise}
                      disabled={loading}
                      className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shrink-0"
                    >
                      <Sparkles className="w-4 h-4" /> Analyze Idea
                    </button>
                  </div>
                </div>

                {analysisResult && (
                  <div className="p-4 bg-slate-950 border border-emerald-500/30 rounded-xl space-y-3 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-emerald-400 uppercase tracking-wide">
                        {analysisResult.enterprise_category} • {analysisResult.feasibility_assessment}
                      </span>
                      <span className="px-2.5 py-1 bg-emerald-950 text-emerald-300 font-bold border border-emerald-500/30 rounded-full">
                        Score: {analysisResult.opportunity_score}/100
                      </span>
                    </div>

                    <p className="text-slate-300 italic bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
                      "{analysisResult.analysis_summary}"
                    </p>

                    <div className="grid grid-cols-2 gap-3 text-slate-300">
                      <div className="space-y-1">
                        <span className="font-semibold text-emerald-300 block">Recommended Next Steps:</span>
                        <ul className="list-disc pl-4 space-y-0.5 text-[11px]">
                          {analysisResult.recommended_next_steps?.map((s: string, idx: number) => (
                            <li key={idx}>{s}</li>
                          ))}
                        </ul>
                      </div>
                      <div className="space-y-1">
                        <span className="font-semibold text-indigo-300 block">Potential Buyers & Schemes:</span>
                        <div className="text-[11px] space-y-1">
                          <p><strong className="text-slate-400">Buyers:</strong> {analysisResult.potential_buyers_category?.join(", ")}</p>
                          <p><strong className="text-slate-400">Schemes:</strong> {analysisResult.goverment_schemes_to_check?.join(", ")}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Agri Financial Tracker */}
              <div className="pt-4 border-t border-slate-700 space-y-3">
                <h3 className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-emerald-400" /> Monthly Agri Financial Tracker & AI Trend Analysis
                </h3>

                <div className="grid grid-cols-5 gap-2 text-xs">
                  <input
                    type="text"
                    value={finMonth}
                    onChange={(e) => setFinMonth(e.target.value)}
                    placeholder="2026-08"
                    className="px-2 py-1.5 bg-slate-900 border border-slate-700 rounded text-white text-xs"
                  />
                  <input
                    type="number"
                    value={salesRevenue}
                    onChange={(e) => setSalesRevenue(parseFloat(e.target.value))}
                    placeholder="Sales (₹)"
                    className="px-2 py-1.5 bg-slate-900 border border-slate-700 rounded text-white text-xs"
                  />
                  <input
                    type="number"
                    value={inputCost}
                    onChange={(e) => setInputCost(parseFloat(e.target.value))}
                    placeholder="Input Cost (₹)"
                    className="px-2 py-1.5 bg-slate-900 border border-slate-700 rounded text-white text-xs"
                  />
                  <input
                    type="number"
                    value={transportCost}
                    onChange={(e) => setTransportCost(parseFloat(e.target.value))}
                    placeholder="Transport (₹)"
                    className="px-2 py-1.5 bg-slate-900 border border-slate-700 rounded text-white text-xs"
                  />
                  <button
                    onClick={handleRecordFinancials}
                    disabled={loading}
                    className="py-1.5 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded text-xs"
                  >
                    Save Month
                  </button>
                </div>

                {finRecords.length > 0 && (
                  <div className="space-y-1.5 max-h-36 overflow-y-auto">
                    {finRecords.map((r, idx) => (
                      <div key={idx} className="p-2.5 bg-slate-900/80 border border-slate-700 rounded-lg text-[11px] flex justify-between items-center">
                        <div>
                          <span className="font-bold text-white">{r.month_year}</span> — Sales: ₹{r.sales_revenue?.toLocaleString()} | Exp: ₹{r.total_expenses?.toLocaleString()}
                          <p className="text-slate-400 italic text-[10px]">{r.ai_analysis_summary}</p>
                        </div>
                        <span className={`font-bold px-2 py-0.5 rounded text-[10px] ${r.net_profit_loss >= 0 ? "bg-emerald-950 text-emerald-400" : "bg-red-950 text-red-400"}`}>
                          ₹{r.net_profit_loss?.toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
