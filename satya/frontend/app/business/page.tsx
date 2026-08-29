"use client";

import { useEffect, useState } from "react";
import { api, getLanguage } from "../api";
import { translations, Language } from "../translations";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import {
  Sparkles,
  Award,
  CheckCircle,
  AlertTriangle,
  Info,
  ChevronRight,
  Printer,
  Loader2,
  ListTodo,
  TrendingUp,
  Cpu
} from "lucide-react";

export default function BusinessAIPage() {
  const [lang, setLang] = useState<Language>("en");
  const [idea, setIdea] = useState("");
  const [location, setLocation] = useState("Salem, Tamil Nadu");
  const [capital, setCapital] = useState(200000);
  const [skills, setSkills] = useState("");
  const [resources, setResources] = useState("");
  const [loading, setLoading] = useState(false);
  const [analyzed, setAnalyzed] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);

  // Business plan generator state
  const [generatingPlan, setGeneratingPlan] = useState(false);
  const [planGenerated, setPlanGenerated] = useState(false);
  const [businessPlan, setBusinessPlan] = useState<any>(null);

  const t = translations[lang];

  useEffect(() => {
    setLang(getLanguage());
    const handleLangChange = () => setLang(getLanguage());
    window.addEventListener("languageChanged", handleLangChange);
    return () => window.removeEventListener("languageChanged", handleLangChange);
  }, []);

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!idea.trim()) return;
    setLoading(true);
    setPlanGenerated(false);

    const skillsArray = skills.split(",").map((s) => s.trim()).filter((s) => s.length > 0);

    try {
      const data = await api.analyzeBusiness(idea, location, capital, skillsArray, resources);
      setAnalysis(data);
      setAnalyzed(true);
    } catch (err: any) {
      alert(err.message || "Failed to analyze business idea.");
    } finally {
      setLoading(false);
    }
  };

  const handleGeneratePlan = async () => {
    setGeneratingPlan(true);
    const skillsArray = skills.split(",").map((s) => s.trim()).filter((s) => s.length > 0);

    try {
      const plan = await api.generateBusinessPlan(idea, location, capital, skillsArray, resources, 1);
      setBusinessPlan(plan);
      setPlanGenerated(true);
    } catch (err: any) {
      alert(err.message || "Failed to generate business plan.");
    } finally {
      setGeneratingPlan(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const getScoreColor = (score: number) => {
    if (score >= 75) return "text-emerald-600 bg-emerald-50 border-emerald-200";
    if (score >= 50) return "text-amber-600 bg-amber-50 border-amber-200";
    return "text-rose-600 bg-rose-50 border-rose-200";
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <main className="flex-grow max-w-5xl w-full mx-auto px-4 py-8 sm:px-6 lg:px-8 space-y-8 print:p-0">
        
        {/* Header (Hidden on print) */}
        <div className="bg-white p-6 rounded-2xl border border-border shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 print:hidden">
          <div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-primary" />
              AI Business Advisor & Plan Generator
            </h1>
            <p className="text-sm text-gray-500">
              Validate your micro-enterprise idea and automatically generate a 90-day actionable business plan.
            </p>
          </div>
        </div>

        {/* Input Form (Hidden on print) */}
        {!analyzed && (
          <form onSubmit={handleAnalyze} className="bg-white p-6 sm:p-8 rounded-2xl border border-border shadow-sm space-y-6 print:hidden">
            <h2 className="font-bold text-gray-900 text-lg">Tell us about your Business Idea</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Describe your Business Idea</label>
                <textarea
                  rows={3}
                  required
                  value={idea}
                  onChange={(e) => setIdea(e.target.value)}
                  placeholder="e.g. Starting a small food-processing unit for organic mango pickles and banana chips in Salem."
                  className="w-full px-4 py-2.5 rounded-xl border border-border bg-white text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary"
                ></textarea>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Target Location</label>
                  <input
                    type="text"
                    required
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-border bg-white text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Available Capital (₹)</label>
                  <input
                    type="number"
                    required
                    value={capital}
                    onChange={(e) => setCapital(Number(e.target.value))}
                    className="w-full px-4 py-2.5 rounded-xl border border-border bg-white text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Your Skills (Comma-separated)</label>
                  <input
                    type="text"
                    value={skills}
                    onChange={(e) => setSkills(e.target.value)}
                    placeholder="food processing, sales, cooking"
                    className="w-full px-4 py-2.5 rounded-xl border border-border bg-white text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Available Tools/Resources</label>
                  <input
                    type="text"
                    value={resources}
                    onChange={(e) => setResources(e.target.value)}
                    placeholder="e.g. Small shed, dry tables"
                    className="w-full px-4 py-2.5 rounded-xl border border-border bg-white text-sm"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="btn-interactive inline-flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-8 py-2.5 rounded-xl font-bold shadow-glow disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Analyzing Idea...
                  </>
                ) : (
                  <>
                    Validate & Analyze
                    <ChevronRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* ANALYSIS RESULTS */}
        {analyzed && !planGenerated && (
          <div className="space-y-6 print:hidden">
            {/* Score & Feasibility Header */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Feasibility score */}
              <div className={`p-6 rounded-2xl border text-center space-y-2 shadow-sm ${getScoreColor(analysis.opportunity_score)}`}>
                <h3 className="text-xs font-bold uppercase tracking-wider">Opportunity Score</h3>
                <div className="text-5xl font-black">{analysis.opportunity_score} <span className="text-lg">/100</span></div>
                <p className="text-xs font-semibold">Feasibility: {analysis.feasibility}</p>
              </div>

              {/* Analysis summary statement */}
              <div className="bg-white p-6 rounded-2xl border border-border shadow-sm md:col-span-2 flex flex-col justify-center space-y-2">
                <h3 className="font-bold text-gray-900 text-sm">SATYA Feasibility Summary</h3>
                <p className="text-xs text-gray-600 leading-relaxed">{analysis.analysis_summary}</p>
              </div>
            </div>

            {/* SWOT & Factors */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Strengths & Opportunities */}
              <div className="bg-white p-6 rounded-2xl border border-border shadow-sm space-y-4">
                <h3 className="font-bold text-gray-900 text-sm border-b border-slate-100 pb-2 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  Strengths & Opportunities
                </h3>
                <ul className="space-y-2">
                  {analysis.strengths?.map((s: string, i: number) => (
                    <li key={i} className="text-xs text-gray-700 flex items-start gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0"></span>
                      <span>{s}</span>
                    </li>
                  ))}
                  {analysis.opportunities?.map((o: string, i: number) => (
                    <li key={i} className="text-xs text-gray-700 flex items-start gap-1.5 font-medium">
                      <span className="h-1.5 w-1.5 rounded-full bg-blue-500 mt-1.5 flex-shrink-0"></span>
                      <span>{o}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Weaknesses & Risks */}
              <div className="bg-white p-6 rounded-2xl border border-border shadow-sm space-y-4">
                <h3 className="font-bold text-gray-900 text-sm border-b border-slate-100 pb-2 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  Weaknesses & Risks
                </h3>
                <ul className="space-y-2">
                  {analysis.weaknesses?.map((w: string, i: number) => (
                    <li key={i} className="text-xs text-gray-700 flex items-start gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-amber-500 mt-1.5 flex-shrink-0"></span>
                      <span>{w}</span>
                    </li>
                  ))}
                  {analysis.risks?.map((r: string, i: number) => (
                    <li key={i} className="text-xs text-gray-700 flex items-start gap-1.5 font-medium text-rose-700">
                      <span className="h-1.5 w-1.5 rounded-full bg-rose-500 mt-1.5 flex-shrink-0"></span>
                      <span>{r}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Target Customers & Next Steps */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Target Customers */}
              <div className="bg-white p-6 rounded-2xl border border-border shadow-sm space-y-4">
                <h3 className="font-bold text-gray-900 text-sm border-b border-slate-100 pb-2">Target Customers</h3>
                <ul className="space-y-2">
                  {analysis.target_customers?.map((tc: string, i: number) => (
                    <li key={i} className="text-xs text-gray-700 flex items-start gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0"></span>
                      <span>{tc}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Action plan steps */}
              <div className="bg-white p-6 rounded-2xl border border-border shadow-sm space-y-4">
                <h3 className="font-bold text-gray-900 text-sm border-b border-slate-100 pb-2 flex items-center gap-2">
                  <ListTodo className="w-4 h-4 text-primary" />
                  Suggested Next Steps
                </h3>
                <ul className="space-y-2">
                  {analysis.suggested_next_steps?.map((step: string, i: number) => (
                    <li key={i} className="text-xs text-gray-700 flex items-start gap-1.5">
                      <span className="font-bold text-primary mr-1">{i + 1}.</span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Execution Trace */}
            {analysis.execution_trace && (
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 text-[11px] space-y-2">
                <div className="flex items-center gap-1.5 font-bold text-gray-700">
                  <Cpu className="w-4 h-4" />
                  <span>How SATYA Validated this Business Idea</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-gray-500">
                  <div>
                    <strong>Data Model:</strong> SATYA Feasibility & Risk Engine
                  </div>
                  <div>
                    <strong>Confidence Indicators:</strong> {analysis.confidence * 100}%
                  </div>
                </div>
              </div>
            )}

            {/* Generate Full Plan CTA */}
            <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-border shadow-sm">
              <button
                type="button"
                onClick={() => setAnalyzed(false)}
                className="text-xs font-bold text-gray-600 hover:underline"
              >
                ← Edit Parameters
              </button>
              <button
                type="button"
                onClick={handleGeneratePlan}
                disabled={generatingPlan}
                className="btn-interactive inline-flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-8 py-2.5 rounded-xl font-bold shadow-glow disabled:opacity-50"
              >
                {generatingPlan ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Generating Plan...
                  </>
                ) : (
                  <>
                    Generate Complete 90-Day Plan
                    <ChevronRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* FULL BUSINESS PLAN REPORT */}
        {planGenerated && (
          <div className="space-y-8 animate-fade-in bg-white p-8 rounded-3xl border border-border shadow-sm print:shadow-none print:border-none print:p-0">
            {/* Report Header */}
            <div className="border-b-2 border-primary pb-6 flex justify-between items-start gap-4">
              <div>
                <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full uppercase tracking-wider mb-2 inline-block print:hidden">
                  SATYA AI Business Plan
                </span>
                <h2 className="text-3xl font-black text-gray-900 tracking-tight">
                  {businessPlan.title || "Business Plan"}
                </h2>
                <p className="text-xs text-gray-500 mt-1">
                  Prepared for local setup in {location} • Date: {new Date().toLocaleDateString()}
                </p>
              </div>
              <button
                onClick={handlePrint}
                className="btn-interactive print:hidden p-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-gray-700 flex items-center justify-center gap-1.5 font-bold text-xs"
              >
                <Printer className="w-4 h-4" />
                <span>Export PDF / Print</span>
              </button>
            </div>

            {/* Sections */}
            <div className="space-y-6 text-sm text-gray-800 leading-relaxed">
              <div className="space-y-2">
                <h3 className="font-bold text-gray-900 text-base border-l-4 border-primary pl-2 uppercase">1. Executive Summary</h3>
                <p className="text-xs text-gray-600">{businessPlan.executive_summary}</p>
              </div>

              <div className="space-y-2">
                <h3 className="font-bold text-gray-900 text-base border-l-4 border-primary pl-2 uppercase">2. Business Objective</h3>
                <p className="text-xs text-gray-600">{businessPlan.business_objective}</p>
              </div>

              <div className="space-y-2">
                <h3 className="font-bold text-gray-900 text-base border-l-4 border-primary pl-2 uppercase">3. Product or Service description</h3>
                <p className="text-xs text-gray-600">{businessPlan.products_services}</p>
              </div>

              <div className="space-y-2">
                <h3 className="font-bold text-gray-900 text-base border-l-4 border-primary pl-2 uppercase">4. Target Market & Customer segments</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-bold text-gray-800 text-xs mb-1">Target Market</h4>
                    <p className="text-xs text-gray-600">{businessPlan.target_market}</p>
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-800 text-xs mb-1">Customer Segments</h4>
                    <p className="text-xs text-gray-600">{businessPlan.customer_segments}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="font-bold text-gray-900 text-base border-l-4 border-primary pl-2 uppercase">5. Resource Requirements</h3>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <h4 className="font-bold text-gray-800 mb-1">Infrastructure & Staffing</h4>
                    <p className="text-gray-600">{businessPlan.resource_requirements?.infrastructure || "Needs a small processing space"}</p>
                    <p className="text-gray-600 mt-1">{businessPlan.resource_requirements?.human_resources || "Family operated"}</p>
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-800 mb-1">Required Equipment</h4>
                    <ul className="list-disc pl-4 space-y-0.5">
                      {businessPlan.resource_requirements?.equipment?.map((eq: string, i: number) => (
                        <li key={i}>{eq}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="font-bold text-gray-900 text-base border-l-4 border-primary pl-2 uppercase">6. Operations & Marketing plan</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-bold text-gray-800 text-xs mb-1">Daily Operations</h4>
                    <p className="text-xs text-gray-600">{businessPlan.operations_plan}</p>
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-800 text-xs mb-1">Marketing Strategy</h4>
                    <p className="text-xs text-gray-600">{businessPlan.marketing_plan}</p>
                  </div>
                </div>
              </div>

              {/* 30/60/90 Action Plan */}
              <div className="space-y-4">
                <h3 className="font-bold text-gray-900 text-base border-l-4 border-primary pl-2 uppercase">7. 90-Day Execution Roadmap</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* 30 day */}
                  <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl">
                    <h4 className="font-bold text-emerald-800 text-xs mb-2">Days 1 - 30 (Setup)</h4>
                    <ul className="space-y-1.5 text-xs text-slate-700">
                      {businessPlan.action_plan_30?.map((a: string, i: number) => (
                        <li key={i} className="flex gap-1 items-start">
                          <span className="text-primary font-bold">✓</span>
                          <span>{a}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* 60 day */}
                  <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl">
                    <h4 className="font-bold text-blue-800 text-xs mb-2">Days 31 - 60 (Launch)</h4>
                    <ul className="space-y-1.5 text-xs text-slate-700">
                      {businessPlan.action_plan_60?.map((a: string, i: number) => (
                        <li key={i} className="flex gap-1 items-start">
                          <span className="text-secondary font-bold">✓</span>
                          <span>{a}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* 90 day */}
                  <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl">
                    <h4 className="font-bold text-amber-800 text-xs mb-2">Days 61 - 90 (Scale)</h4>
                    <ul className="space-y-1.5 text-xs text-slate-700">
                      {businessPlan.action_plan_90?.map((a: string, i: number) => (
                        <li key={i} className="flex gap-1 items-start">
                          <span className="text-accent font-bold">✓</span>
                          <span>{a}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Warning/Disclaimer */}
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800 flex gap-2 items-start print:mt-12">
                <Info className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <strong>Disclaimer:</strong> This business plan was automatically generated by SATYA Business AI. It represents estimates and suggested approaches based on local variables. Please verify all funding and licensing requirements locally before executing.
                </div>
              </div>

              {/* Edit parameters / restart */}
              <div className="flex justify-start print:hidden pt-4">
                <button
                  onClick={() => setPlanGenerated(false)}
                  className="text-xs font-bold text-primary hover:underline"
                >
                  ← Back to Feasibility Assessment
                </button>
              </div>
            </div>
          </div>
        )}

      </main>

      <Footer />
    </div>
  );
}
