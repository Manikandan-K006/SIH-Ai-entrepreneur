"use client";

import { useState } from "react";
import { Calculator, ShieldCheck, FileCheck, CheckCircle2, AlertCircle, Sparkles, ArrowRight, Download, Scale } from "lucide-react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import { api } from "../api";

export default function FundingGapPage() {
  const [projectCost, setProjectCost] = useState(200000);
  const [availableCapital, setAvailableCapital] = useState(50000);
  const [monthlyExpenses, setMonthlyExpenses] = useState(15000);
  const [expectedRevenue, setExpectedRevenue] = useState(35000);
  const [businessIdea, setBusinessIdea] = useState("Small Food Processing & Dairy Expansion Unit");

  const [gapResult, setGapResult] = useState<any>(null);
  const [readinessResult, setReadinessResult] = useState<any>(null);
  const [loanComparisons, setLoanComparisons] = useState<any[]>([]);
  const [appPackage, setAppPackage] = useState<any>(null);

  const [loading, setLoading] = useState(false);

  const handleCalculate = async () => {
    setLoading(true);
    try {
      const gap = await api.calculateFundingGap(Number(projectCost), Number(availableCapital));
      setGapResult(gap);

      const readiness = await api.assessLoanReadiness({
        business_idea: businessIdea,
        project_cost: Number(projectCost),
        available_capital: Number(availableCapital),
        monthly_expenses: Number(monthlyExpenses),
        expected_revenue: Number(expectedRevenue),
        has_identity_doc: true,
        has_address_proof: true,
        experience_years: 3,
      });
      setReadinessResult(readiness);

      const loans = await api.compareVerifiedLoans();
      setLoanComparisons(loans || []);
    } catch (e: any) {
      alert(e.message || "Calculation failed");
    } finally {
      setLoading(false);
    }
  };

  const handlePreparePackage = async () => {
    setLoading(true);
    try {
      const pkg = await api.prepareApplicationPackage({
        business_name: businessIdea,
        business_type: "Micro Agri-Enterprise",
        project_cost: Number(projectCost),
        available_capital: Number(availableCapital),
        monthly_revenue: Number(expectedRevenue),
        monthly_expenses: Number(monthlyExpenses),
      });
      setAppPackage(pkg);
    } catch (e: any) {
      alert(e.message || "Preparation failed");
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
          {/* Banner */}
          <div className="bg-gradient-to-r from-blue-900/40 via-indigo-900/30 to-slate-800 border border-blue-500/20 rounded-2xl p-6 relative overflow-hidden">
            <div className="relative z-10 space-y-2">
              <div className="flex items-center gap-2 text-blue-400 font-semibold text-sm">
                <Calculator className="w-4 h-4 text-blue-400" /> SATYA Financial & Funding Gap Analyzer
              </div>
              <h1 className="text-3xl font-extrabold tracking-tight text-white">
                Funding Gap & SATYA AI Loan Readiness Assessment
              </h1>
              <p className="text-slate-300 max-w-3xl text-sm">
                Calculate your exact funding gap (Project Cost - Own Capital), assess your loan readiness score (0-100), compare verified government & institutional loans, and generate a downloadable application document checklist.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Input Form */}
            <div className="bg-slate-800/80 border border-slate-700/60 rounded-2xl p-5 space-y-4 shadow-xl">
              <h2 className="text-base font-bold text-white flex items-center gap-2 border-b border-slate-700 pb-3">
                <Calculator className="w-4 h-4 text-blue-400" /> Enter Enterprise Financials
              </h2>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="text-slate-300 font-semibold">Business Idea / Activity:</label>
                  <input
                    type="text"
                    value={businessIdea}
                    onChange={(e) => setBusinessIdea(e.target.value)}
                    className="w-full mt-1 px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-slate-300 font-semibold">Estimated Cost (₹):</label>
                    <input
                      type="number"
                      value={projectCost}
                      onChange={(e) => setProjectCost(parseFloat(e.target.value))}
                      className="w-full mt-1 px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                    />
                  </div>
                  <div>
                    <label className="text-slate-300 font-semibold">Own Capital (₹):</label>
                    <input
                      type="number"
                      value={availableCapital}
                      onChange={(e) => setAvailableCapital(parseFloat(e.target.value))}
                      className="w-full mt-1 px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-slate-300 font-semibold">Monthly Expenses (₹):</label>
                    <input
                      type="number"
                      value={monthlyExpenses}
                      onChange={(e) => setMonthlyExpenses(parseFloat(e.target.value))}
                      className="w-full mt-1 px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                    />
                  </div>
                  <div>
                    <label className="text-slate-300 font-semibold">Monthly Revenue (₹):</label>
                    <input
                      type="number"
                      value={expectedRevenue}
                      onChange={(e) => setExpectedRevenue(parseFloat(e.target.value))}
                      className="w-full mt-1 px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                    />
                  </div>
                </div>

                <button
                  onClick={handleCalculate}
                  disabled={loading}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg"
                >
                  <Sparkles className="w-4 h-4" /> Compute Funding Gap & Loan Readiness
                </button>
              </div>
            </div>

            {/* Results Column */}
            <div className="lg:col-span-2 space-y-6">
              {/* Funding Gap & Loan Readiness Score Header */}
              {gapResult && readinessResult && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Funding Gap Box */}
                  <div className="p-4 bg-slate-800/90 border border-blue-500/30 rounded-2xl space-y-2 shadow-lg">
                    <span className="text-xs text-blue-300 font-bold uppercase tracking-wide block">Funding Gap Breakdown</span>
                    <div className="flex items-baseline justify-between">
                      <span className="text-2xl font-black text-white">₹{gapResult.funding_gap?.toLocaleString()}</span>
                      <span className="text-xs font-bold text-amber-400">({gapResult.funding_gap_percent}% Gap)</span>
                    </div>
                    <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden flex">
                      <div style={{ width: `${gapResult.own_contribution_percent}%` }} className="bg-emerald-500 h-full" />
                      <div style={{ width: `${gapResult.funding_gap_percent}%` }} className="bg-amber-500 h-full" />
                    </div>
                    <div className="flex justify-between text-[11px] text-slate-400 pt-1">
                      <span>Own Contribution: <strong className="text-emerald-400">₹{gapResult.own_contribution?.toLocaleString()}</strong></span>
                      <span>Project Cost: <strong className="text-white">₹{gapResult.project_cost?.toLocaleString()}</strong></span>
                    </div>
                  </div>

                  {/* Loan Readiness Box */}
                  <div className="p-4 bg-slate-800/90 border border-indigo-500/30 rounded-2xl space-y-2 shadow-lg">
                    <span className="text-xs text-indigo-300 font-bold uppercase tracking-wide block">
                      SATYA AI Loan Readiness Assessment
                    </span>
                    <div className="flex items-center justify-between">
                      <div className="text-3xl font-black text-emerald-400">{readinessResult.overall_score}/100</div>
                      <div className="text-[10px] text-slate-400 bg-slate-900 p-2 rounded-lg max-w-[180px] leading-tight border border-slate-700">
                        ⚠ Not a bank credit score. Assesses application completeness.
                      </div>
                    </div>
                    <div className="text-[11px] text-slate-300">
                      <strong>Missing Info:</strong> {readinessResult.missing_information?.length || 0} item(s) to improve
                    </div>
                  </div>
                </div>
              )}

              {/* Loan Comparison Table */}
              {loanComparisons.length > 0 && (
                <div className="bg-slate-800/80 border border-slate-700/60 rounded-2xl p-5 space-y-4 shadow-xl">
                  <div className="flex items-center justify-between border-b border-slate-700 pb-3">
                    <h2 className="text-base font-bold text-white flex items-center gap-2">
                      <Scale className="w-4 h-4 text-indigo-400" /> Verified Loan & Financing Comparison Table
                    </h2>
                    <button
                      onClick={handlePreparePackage}
                      disabled={loading}
                      className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg flex items-center gap-1 shadow"
                    >
                      <Download className="w-3.5 h-3.5" /> Prepare Application Package
                    </button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-slate-300">
                      <thead className="bg-slate-900/80 text-slate-400 uppercase text-[10px] font-bold border-b border-slate-700">
                        <tr>
                          <th className="p-3">Financing Option</th>
                          <th className="p-3">Funding Range</th>
                          <th className="p-3">Status</th>
                          <th className="p-3">Official Source</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-700/50">
                        {loanComparisons.map((c, idx) => (
                          <tr key={idx} className="hover:bg-slate-700/30 transition-colors">
                            <td className="p-3">
                              <span className="font-bold text-white block">{c.scheme_name}</span>
                              <span className="text-[10px] text-slate-400">{c.authority}</span>
                            </td>
                            <td className="p-3 font-semibold text-emerald-400">{c.funding_range}</td>
                            <td className="p-3">
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-950 text-amber-300 border border-amber-500/30">
                                {c.eligibility_status}
                              </span>
                            </td>
                            <td className="p-3 text-[11px]">
                              <a href={c.official_source} target="_blank" rel="noreferrer" className="text-blue-400 underline font-semibold">
                                View Source
                              </a>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <p className="text-[10px] text-slate-400 italic">
                    Disclaimer: Potentially relevant options identified based on user inputs. Verify current eligibility requirements directly with official lending institutions.
                  </p>
                </div>
              )}

              {/* Prepared Application Package Output */}
              {appPackage && (
                <div className="p-5 bg-emerald-950/70 border border-emerald-500/40 rounded-2xl space-y-4 shadow-xl">
                  <div className="flex items-center justify-between border-b border-emerald-500/30 pb-3">
                    <h3 className="font-bold text-emerald-300 text-sm flex items-center gap-2">
                      <FileCheck className="w-4 h-4 text-emerald-400" /> {appPackage.title}
                    </h3>
                    <span className="text-[10px] font-bold bg-emerald-900 text-white px-2.5 py-1 rounded-full border border-emerald-400/30">
                      Ready for Review
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div className="space-y-1">
                      <span className="font-semibold text-slate-300 block">Application Summary:</span>
                      <p>Business: <strong className="text-white">{appPackage.business_summary?.business_name}</strong></p>
                      <p>Project Cost: <strong className="text-white">{appPackage.business_summary?.total_project_cost}</strong></p>
                      <p>Funding Gap Needed: <strong className="text-emerald-300">{appPackage.business_summary?.funding_gap_required}</strong></p>
                    </div>

                    <div className="space-y-1">
                      <span className="font-semibold text-slate-300 block">Verified Document Checklist:</span>
                      <ul className="list-disc pl-4 space-y-0.5 text-[11px] text-slate-200">
                        {appPackage.document_checklist?.map((doc: string, idx: number) => (
                          <li key={idx}>☐ {doc}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
