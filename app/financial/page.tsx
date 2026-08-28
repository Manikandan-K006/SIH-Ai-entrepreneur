"use client";

import { useEffect, useState } from "react";
import { api, getLanguage } from "../api";
import { translations, Language } from "../translations";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import {
  Sparkles,
  DollarSign,
  TrendingUp,
  Percent,
  Calendar,
  AlertCircle,
  FileSpreadsheet,
  HelpCircle,
  Loader2
} from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from "recharts";

export default function FinancialPage() {
  const [lang, setLang] = useState<Language>("en");
  const [loading, setLoading] = useState(false);
  const [calculated, setCalculated] = useState(false);
  const [result, setResult] = useState<any>(null);

  // Inputs
  const [title, setTitle] = useState("My Pickle Unit Budget");
  const [capital, setCapital] = useState(200000);
  const [investment, setInvestment] = useState(350000);
  const [equipment, setEquipment] = useState(150000);
  const [materials, setMaterials] = useState(30000);
  const [labour, setLabour] = useState(15000);
  const [rent, setRent] = useState(5000);
  const [transport, setTransport] = useState(4000);
  const [other, setOther] = useState(3000);
  const [revenue, setRevenue] = useState(90000);

  // Loan/EMI Simulator
  const [loanAmount, setLoanAmount] = useState(150000);
  const [interestRate, setInterestRate] = useState(8.5);
  const [tenure, setTenure] = useState(36);

  const t = translations[lang];

  useEffect(() => {
    setLang(getLanguage());
    const handleLangChange = () => setLang(getLanguage());
    window.addEventListener("languageChanged", handleLangChange);
    return () => window.removeEventListener("languageChanged", handleLangChange);
  }, []);

  const handleCalculate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const inputData = {
      available_capital: capital,
      required_investment: investment,
      equipment_cost: equipment,
      raw_material_cost: materials,
      labour_cost_monthly: labour,
      rent_monthly: rent,
      transport_monthly: transport,
      other_expenses_monthly: other,
      expected_revenue_monthly: revenue,
      loan_amount: loanAmount,
      loan_interest_rate: interestRate,
      loan_tenure_months: tenure,
      title,
    };

    try {
      const data = await api.calculateFinancial(inputData);
      setResult(data);
      setCalculated(true);
    } catch (err: any) {
      alert(err.message || "Failed to calculate financial structuring.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <main className="flex-grow max-w-6xl w-full mx-auto px-4 py-8 sm:px-6 lg:px-8 space-y-6">
        
        {/* Title Banner */}
        <div className="bg-white p-6 rounded-2xl border border-border shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
              <DollarSign className="w-6 h-6 text-primary" />
              Financial AI & Structuring Planner
            </h1>
            <p className="text-sm text-gray-500">
              Calculate start-up capital, loan requirement, monthly EMIs, and verify 12-month projections.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Inputs Column */}
          <div className="lg:col-span-1">
            <form onSubmit={handleCalculate} className="bg-white p-6 rounded-2xl border border-border shadow-sm space-y-4">
              <h2 className="font-bold text-gray-900 text-sm border-b border-slate-100 pb-2">Financial Parameters</h2>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Available Capital (Own contribution)</label>
                  <input
                    type="number"
                    value={capital}
                    onChange={(e) => setCapital(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Total Start-up Investment Required</label>
                  <input
                    type="number"
                    value={investment}
                    onChange={(e) => setInvestment(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Equipment Cost</label>
                    <input
                      type="number"
                      value={equipment}
                      onChange={(e) => setEquipment(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-lg border border-border bg-white"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Raw Materials (Monthly)</label>
                    <input
                      type="number"
                      value={materials}
                      onChange={(e) => setMaterials(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-lg border border-border bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Labour Cost (Monthly)</label>
                    <input
                      type="number"
                      value={labour}
                      onChange={(e) => setLabour(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-lg border border-border bg-white"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Rent Cost (Monthly)</label>
                    <input
                      type="number"
                      value={rent}
                      onChange={(e) => setRent(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-lg border border-border bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Transport Cost</label>
                    <input
                      type="number"
                      value={transport}
                      onChange={(e) => setTransport(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-lg border border-border bg-white"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Other Costs</label>
                    <input
                      type="number"
                      value={other}
                      onChange={(e) => setOther(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-lg border border-border bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Expected Monthly Revenue</label>
                  <input
                    type="number"
                    value={revenue}
                    onChange={(e) => setRevenue(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-white"
                  />
                </div>

                <div className="border-t border-slate-100 pt-3 space-y-2">
                  <h3 className="font-bold text-gray-900 mb-1">Loan Simulator</h3>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block font-bold text-gray-700 mb-1">Loan Amount</label>
                      <input
                        type="number"
                        value={loanAmount}
                        onChange={(e) => setLoanAmount(Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-lg border border-border bg-white"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-gray-700 mb-1">Interest Rate (%)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={interestRate}
                        onChange={(e) => setInterestRate(Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-lg border border-border bg-white"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Tenure (Months)</label>
                    <input
                      type="number"
                      value={tenure}
                      onChange={(e) => setTenure(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-lg border border-border bg-white"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-interactive w-full bg-primary hover:bg-primary-hover text-white rounded-xl font-bold py-2 text-xs flex items-center justify-center gap-2 shadow-glow"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Calculating...
                  </>
                ) : (
                  "Calculate Structuring"
                )}
              </button>
            </form>
          </div>

          {/* Calculations Output */}
          <div className="lg:col-span-2 space-y-6">
            {!calculated ? (
              <div className="h-full bg-white rounded-2xl border border-border p-8 flex flex-col justify-center items-center text-center space-y-4 shadow-sm">
                <FileSpreadsheet className="w-12 h-12 text-slate-300" />
                <h3 className="font-bold text-gray-900">No calculation report generated</h3>
                <p className="text-xs text-gray-500 max-w-sm">
                  Enter your startup assets, monthly operational budgets and expected sales to map feasibility.
                </p>
              </div>
            ) : (
              <div className="space-y-6 animate-fade-in">
                
                {/* Math cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="bg-white p-4 rounded-xl border border-slate-200 text-center shadow-sm">
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Total Cost</span>
                    <span className="text-base font-black text-gray-900">₹{result.total_project_cost?.toLocaleString()}</span>
                  </div>
                  <div className="bg-white p-4 rounded-xl border border-slate-200 text-center shadow-sm">
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Own Capital</span>
                    <span className="text-base font-black text-primary">₹{result.own_contribution?.toLocaleString()}</span>
                  </div>
                  <div className="bg-white p-4 rounded-xl border border-slate-200 text-center shadow-sm">
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Loan Needed</span>
                    <span className="text-base font-black text-amber-700">₹{result.funding_requirement?.toLocaleString()}</span>
                  </div>
                  <div className="bg-white p-4 rounded-xl border border-slate-200 text-center shadow-sm">
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">EMI Estimate</span>
                    <span className="text-base font-black text-secondary">₹{result.emi_amount?.toLocaleString()}/mo</span>
                  </div>
                </div>

                {/* Net margins & break even details */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-white p-5 rounded-xl border border-slate-200 flex items-center justify-between shadow-sm">
                    <div>
                      <h4 className="text-xs font-bold text-gray-500">Gross Margin</h4>
                      <p className="text-lg font-black text-gray-900">{result.gross_margin_percent}%</p>
                    </div>
                    <Percent className="w-8 h-8 text-primary/20" />
                  </div>

                  <div className="bg-white p-5 rounded-xl border border-slate-200 flex items-center justify-between shadow-sm">
                    <div>
                      <h4 className="text-xs font-bold text-gray-500">Break-Even (Time)</h4>
                      <p className="text-lg font-black text-gray-900">
                        {result.break_even_months ? `${result.break_even_months} Months` : "N/A"}
                      </p>
                    </div>
                    <Calendar className="w-8 h-8 text-secondary/20" />
                  </div>

                  <div className="bg-white p-5 rounded-xl border border-slate-200 flex items-center justify-between shadow-sm">
                    <div>
                      <h4 className="text-xs font-bold text-gray-500">Monthly Expenses</h4>
                      <p className="text-lg font-black text-gray-900">₹{result.total_monthly_expenses?.toLocaleString()}</p>
                    </div>
                    <TrendingUp className="w-8 h-8 text-accent/20" />
                  </div>
                </div>

                {/* Cash flow projection chart */}
                <div className="bg-white p-6 rounded-2xl border border-border shadow-sm">
                  <h3 className="font-bold text-gray-900 text-sm mb-4">12-Month Projections (Cumulative Cash Flow)</h3>
                  
                  <div className="h-60 w-full text-xs">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={result.cash_flow_projection}>
                        <defs>
                          <linearGradient id="colorCash" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#15803d" stopOpacity={0.2}/>
                            <stop offset="95%" stopColor="#15803d" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month_label" />
                        <YAxis />
                        <Tooltip />
                        <Area type="monotone" dataKey="cumulative_cash_flow" stroke="#15803d" fillOpacity={1} fill="url(#colorCash)" name="Cumulative Cash" />
                        <Area type="monotone" dataKey="revenue" stroke="#1d4ed8" fillOpacity={0} name="Revenue" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Safety & disclaimer banners */}
                <div className="p-4 rounded-xl bg-slate-100 border border-slate-200 text-xs text-gray-600 flex gap-2">
                  <AlertCircle className="w-5 h-5 text-gray-500 flex-shrink-0" />
                  <div>
                    <strong>Potential financing option:</strong> Always verify eligibility, interest rates, and fees directly with the financial institution. The calculations above are simulated estimations for planning purposes only.
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

      </main>

      <Footer />
    </div>
  );
}
