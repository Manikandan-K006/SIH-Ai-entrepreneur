"use client";

import { useEffect, useState } from "react";
import { Sparkles, ShieldCheck, Tag, TrendingUp, CheckCircle, Zap, DollarSign, Lock } from "lucide-react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import { api } from "../api";

export default function PromotionsPage() {
  const [promotions, setPromotions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [headline, setHeadline] = useState("Special Local Offer on Salem Homemade Pickles!");
  const [description, setDescription] = useState("Buy 2 jars get 10% discount. FSSAI verified homemade quality.");
  const [tier, setTier] = useState("sponsored_listing");
  const [budget, setBudget] = useState(500);
  const [durationDays, setDurationDays] = useState(7);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    loadPromotions();
  }, []);

  const loadPromotions = async () => {
    try {
      const data = await api.getMyPromotions();
      setPromotions(data);
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateCampaign = async () => {
    if (!headline.trim()) return;
    setLoading(true);
    setSuccessMsg(null);
    try {
      const res = await api.createPromotion({
        tier,
        headline,
        description,
        budget,
        duration_days: durationDays
      });
      setSuccessMsg(res.message);
      setShowModal(false);
      loadPromotions();
    } catch (err: any) {
      alert(err.message || "Failed to launch promotion");
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
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-amber-900/40 via-orange-900/30 to-slate-800 border border-amber-500/20 rounded-2xl p-6 relative overflow-hidden">
            <div className="relative z-10 space-y-2">
              <div className="flex items-center gap-2 text-amber-400 font-semibold text-sm">
                <Sparkles className="w-4 h-4" /> Paid Promotion & Local Visibility System (Module 10)
              </div>
              <h1 className="text-3xl font-extrabold tracking-tight text-white">
                Promote Your Business & Reach Local Customers
              </h1>
              <p className="text-slate-300 max-w-2xl text-sm">
                Feature your products with transparent <span className="text-amber-300 font-bold">"Sponsored"</span> badges on SATYA customer search.
              </p>
            </div>
          </div>

          {/* Tier Comparison Cards: FREE vs PAID */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* FREE Tier Card */}
            <div className="bg-slate-800/80 border border-slate-700/60 rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Basic Tier</span>
                  <h3 className="text-xl font-bold text-white">FREE Listing</h3>
                </div>
                <span className="text-2xl font-extrabold text-slate-300">₹0</span>
              </div>

              <ul className="space-y-2 text-xs text-slate-300">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" /> Basic business profile directory listing
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" /> Up to 5 product/service catalog listings
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" /> Direct customer call & messaging contact
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" /> Public Shareable Digital Business Card URL
                </li>
              </ul>
            </div>

            {/* PAID Tier Card */}
            <div className="bg-gradient-to-br from-amber-950/30 via-slate-800 to-slate-800 border-2 border-amber-500/50 rounded-2xl p-6 space-y-4 shadow-xl relative">
              <span className="absolute -top-3 right-6 px-3 py-1 bg-amber-500 text-slate-950 font-extrabold text-[10px] uppercase tracking-wider rounded-full shadow-md">
                Recommended for Growth
              </span>

              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">Promoted Tier</span>
                  <h3 className="text-xl font-bold text-white">Sponsored Campaign</h3>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-extrabold text-amber-300">₹500</span>
                  <span className="text-[10px] text-slate-400 block">/ 7 days campaign</span>
                </div>
              </div>

              <ul className="space-y-2 text-xs text-slate-300">
                <li className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-400 shrink-0" /> Prominent top position on Customer Search
                </li>
                <li className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-400 shrink-0" /> Visibly labelled <span className="text-amber-300 font-bold">"Sponsored"</span> badge for buyer trust
                </li>
                <li className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-400 shrink-0" /> Target specific districts & business categories
                </li>
                <li className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-400 shrink-0" /> Impression and click-through performance metrics
                </li>
              </ul>

              <button
                onClick={() => setShowModal(true)}
                className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold rounded-xl text-sm transition-colors shadow-lg flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4" /> Launch Sponsored Campaign
              </button>
            </div>
          </div>

          {/* Success Banner */}
          {successMsg && (
            <div className="p-4 bg-emerald-950/70 border border-emerald-500/50 rounded-xl text-emerald-300 flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-emerald-400" />
                <span>{successMsg}</span>
              </div>
              <button onClick={() => setSuccessMsg(null)} className="text-xs text-slate-400 hover:text-white">
                Dismiss
              </button>
            </div>
          )}

          {/* Campaign List & Analytics */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-amber-400" /> Your Active Promotion Campaigns ({promotions.length})
            </h2>

            {promotions.length === 0 ? (
              <div className="p-8 bg-slate-800/40 border border-slate-700/50 rounded-xl text-center space-y-2">
                <p className="text-slate-400 text-sm">No promotion campaigns active yet.</p>
                <button
                  onClick={() => setShowModal(true)}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-lg"
                >
                  Create Your First Campaign
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {promotions.map((p) => (
                  <div key={p.id} className="p-5 bg-slate-800/80 border border-slate-700/60 rounded-xl space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="px-2 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-bold rounded-full uppercase">
                          Sponsored
                        </span>
                        <h3 className="font-bold text-white text-base mt-1">{p.headline}</h3>
                      </div>
                      <span className="text-xs font-bold text-emerald-400 uppercase bg-emerald-950/60 px-2.5 py-1 rounded-lg border border-emerald-500/30">
                        {p.status}
                      </span>
                    </div>

                    <p className="text-xs text-slate-300">{p.description}</p>

                    <div className="grid grid-cols-3 gap-2 p-3 bg-slate-900/60 rounded-lg border border-slate-700/50 text-center text-xs">
                      <div>
                        <span className="text-slate-400 block text-[10px]">Budget</span>
                        <span className="font-bold text-white">₹{p.budget}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Impressions</span>
                        <span className="font-bold text-amber-300">{p.impressions || 0}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Clicks</span>
                        <span className="font-bold text-teal-300">{p.clicks || 0}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Modal for Creating Promotion */}
          {showModal && (
            <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-slate-800 border border-slate-700 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
                <div className="flex items-center justify-between border-b border-slate-700 pb-3">
                  <h3 className="font-bold text-white text-lg">Create Sponsored Campaign</h3>
                  <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white">
                    &times;
                  </button>
                </div>

                <div className="space-y-3 text-sm">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-300">Campaign Headline:</label>
                    <input
                      type="text"
                      value={headline}
                      onChange={(e) => setHeadline(e.target.value)}
                      className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-300">Ad Offer Description:</label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={2}
                      className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-300">Budget (₹):</label>
                      <input
                        type="number"
                        value={budget}
                        onChange={(e) => setBudget(Number(e.target.value))}
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-300">Duration (Days):</label>
                      <input
                        type="number"
                        value={durationDays}
                        onChange={(e) => setDurationDays(Number(e.target.value))}
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs"
                      />
                    </div>
                  </div>

                  <div className="p-3 bg-slate-900/80 border border-slate-700/60 rounded-xl space-y-1.5 text-xs">
                    <div className="flex items-center justify-between font-semibold text-slate-200">
                      <span>Payment Provider Abstraction:</span>
                      <span className="text-emerald-400 font-bold flex items-center gap-1">
                        <Lock className="w-3 h-3" /> UPI Mock Layer
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Payment gateway integrated via abstraction layer. Test mode activated.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-3">
                  <button
                    onClick={() => setShowModal(false)}
                    className="flex-1 py-2.5 bg-slate-700 hover:bg-slate-600 text-slate-200 font-medium rounded-xl text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateCampaign}
                    disabled={loading}
                    className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-sm shadow-lg"
                  >
                    {loading ? "Processing..." : "Confirm & Pay (Mock)"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
