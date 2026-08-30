"use client";

import { useState } from "react";
import { Sparkles, MessageSquare, Share2, Printer, Volume2, Copy, CheckCircle, Target, Globe } from "lucide-react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import { api } from "../api";

export default function AIMarketingPage() {
  const [productOrBusiness, setProductOrBusiness] = useState("Homemade Raw Mango & Lemon Pickle");
  const [location, setLocation] = useState("Salem, Tamil Nadu");
  const [budget, setBudget] = useState(500);
  const [targetAudience, setTargetAudience] = useState("Local villagers, town residents, and hill station tourists");
  const [loading, setLoading] = useState(false);
  const [campaign, setCampaign] = useState<any>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!productOrBusiness.trim()) return;
    setLoading(true);
    try {
      const res = await api.generateMarketing({
        product_or_business: productOrBusiness,
        location,
        budget,
        target_audience: targetAudience
      });
      setCampaign(res);
    } catch (e: any) {
      alert(e.message || "Failed to generate marketing campaign");
    } finally {
      setLoading(false);
    }
  };

  const copyText = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="flex h-screen bg-slate-900 text-slate-100 overflow-hidden font-sans">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <Header />

        <main className="p-6 max-w-7xl mx-auto w-full space-y-6">
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-teal-900/40 via-emerald-900/30 to-slate-800 border border-teal-500/20 rounded-2xl p-6 relative overflow-hidden">
            <div className="relative z-10 space-y-2">
              <div className="flex items-center gap-2 text-teal-400 font-semibold text-sm">
                <Sparkles className="w-4 h-4" /> SATYA AI Marketing Assistant (Module 9)
              </div>
              <h1 className="text-3xl font-extrabold tracking-tight text-white">
                Multilingual Marketing & Ad Campaign Generator
              </h1>
              <p className="text-slate-300 max-w-2xl text-sm">
                Instantly generate Tamil, Hindi, and English advertisements, WhatsApp posts, social media captions, printable poster content, and voice ad scripts for your micro-business.
              </p>
            </div>
          </div>

          {/* Generator Input Form */}
          <div className="bg-slate-800/80 border border-slate-700/60 rounded-xl p-6 space-y-4 shadow-lg">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Target className="w-4 h-4 text-teal-400" /> Enter Business & Campaign Details
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Product / Service Name:</label>
                <input
                  type="text"
                  value={productOrBusiness}
                  onChange={(e) => setProductOrBusiness(e.target.value)}
                  placeholder="e.g. Handmade Pottery / Homemade Mango Pickle"
                  className="w-full px-3.5 py-2.5 bg-slate-900/90 border border-slate-700 rounded-lg text-white text-xs focus:outline-none focus:border-teal-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Target Location:</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Salem, Tamil Nadu"
                  className="w-full px-3.5 py-2.5 bg-slate-900/90 border border-slate-700 rounded-lg text-white text-xs focus:outline-none focus:border-teal-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Campaign Budget (₹):</label>
                <input
                  type="number"
                  value={budget}
                  onChange={(e) => setBudget(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 bg-slate-900/90 border border-slate-700 rounded-lg text-white text-xs focus:outline-none focus:border-teal-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Target Audience:</label>
                <input
                  type="text"
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value)}
                  placeholder="e.g. Local villagers, SHG members, tourists"
                  className="w-full px-3.5 py-2.5 bg-slate-900/90 border border-slate-700 rounded-lg text-white text-xs focus:outline-none focus:border-teal-500"
                />
              </div>
            </div>

            <button
              onClick={handleGenerate}
              disabled={loading}
              className="w-full sm:w-auto px-8 py-3 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2 text-sm shadow-lg"
            >
              <Sparkles className="w-4 h-4" /> {loading ? "Generating Multilingual Ads..." : "Generate AI Campaign"}
            </button>
          </div>

          {/* Generated Campaign Output */}
          {campaign && (
            <div className="space-y-6 pt-2">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Globe className="w-5 h-5 text-teal-400" /> {campaign.campaign_title || "Generated Marketing Materials"}
                </h2>
              </div>

              {/* Multilingual Text Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* English Ad */}
                <div className="p-4 bg-slate-800/80 border border-slate-700/60 rounded-xl space-y-3 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-teal-400 uppercase tracking-wider">English Advert</span>
                      <button
                        onClick={() => copyText(campaign.english_ad, "en")}
                        className="text-slate-400 hover:text-white p-1"
                      >
                        {copiedKey === "en" ? <CheckCircle className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                    <p className="text-xs text-slate-200 leading-relaxed">{campaign.english_ad}</p>
                  </div>
                </div>

                {/* Tamil Ad */}
                <div className="p-4 bg-slate-800/80 border border-slate-700/60 rounded-xl space-y-3 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">தமிழ் விளம்பரம் (Tamil)</span>
                      <button
                        onClick={() => copyText(campaign.tamil_ad, "ta")}
                        className="text-slate-400 hover:text-white p-1"
                      >
                        {copiedKey === "ta" ? <CheckCircle className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                    <p className="text-xs text-slate-200 leading-relaxed font-sans">{campaign.tamil_ad}</p>
                  </div>
                </div>

                {/* Hindi Ad */}
                <div className="p-4 bg-slate-800/80 border border-slate-700/60 rounded-xl space-y-3 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">हिंदी विज्ञापन (Hindi)</span>
                      <button
                        onClick={() => copyText(campaign.hindi_ad, "hi")}
                        className="text-slate-400 hover:text-white p-1"
                      >
                        {copiedKey === "hi" ? <CheckCircle className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                    <p className="text-xs text-slate-200 leading-relaxed">{campaign.hindi_ad}</p>
                  </div>
                </div>
              </div>

              {/* WhatsApp & Social Media & Voice Script */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* WhatsApp Broadcast Format */}
                <div className="p-5 bg-slate-800/80 border border-slate-700/60 rounded-xl space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-700/60 pb-2">
                    <h3 className="font-bold text-white text-sm flex items-center gap-2">
                      <MessageSquare className="w-4 h-4 text-emerald-400" /> WhatsApp Broadcast Copy
                    </h3>
                    <button
                      onClick={() => copyText(campaign.whatsapp_message, "wa")}
                      className="px-2.5 py-1 bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-300 border border-emerald-500/30 rounded-lg text-xs flex items-center gap-1"
                    >
                      {copiedKey === "wa" ? <CheckCircle className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />} Copy WhatsApp
                    </button>
                  </div>
                  <pre className="text-xs text-slate-200 whitespace-pre-wrap font-sans bg-slate-900/60 p-3 rounded-lg border border-slate-700/50">
                    {campaign.whatsapp_message}
                  </pre>
                </div>

                {/* Voice Advertisement Script (15s) */}
                <div className="p-5 bg-slate-800/80 border border-slate-700/60 rounded-xl space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-700/60 pb-2">
                    <h3 className="font-bold text-white text-sm flex items-center gap-2">
                      <Volume2 className="w-4 h-4 text-amber-400" /> Voice Ad Script (15 Sec)
                    </h3>
                    <button
                      onClick={() => copyText(campaign.voice_script, "voice")}
                      className="px-2.5 py-1 bg-amber-600/20 hover:bg-amber-600/40 text-amber-300 border border-amber-500/30 rounded-lg text-xs flex items-center gap-1"
                    >
                      {copiedKey === "voice" ? <CheckCircle className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />} Copy Voice Script
                    </button>
                  </div>
                  <p className="text-xs text-slate-200 italic bg-slate-900/60 p-3 rounded-lg border border-slate-700/50 leading-relaxed">
                    "{campaign.voice_script}"
                  </p>
                </div>
              </div>

              {/* Poster Format Printable Box */}
              {campaign.poster_content && (
                <div className="p-6 bg-gradient-to-b from-slate-800 to-slate-850 border border-slate-700/60 rounded-xl space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-700 pb-3">
                    <h3 className="font-bold text-white text-base flex items-center gap-2">
                      <Printer className="w-4 h-4 text-teal-400" /> Printable Local Poster Content
                    </h3>
                    <button
                      onClick={() => window.print()}
                      className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg text-xs flex items-center gap-1.5"
                    >
                      <Printer className="w-3.5 h-3.5" /> Print Poster Layout
                    </button>
                  </div>

                  <div className="max-w-lg mx-auto p-6 bg-white text-slate-900 rounded-2xl shadow-xl space-y-3 text-center border-4 border-teal-600">
                    <h1 className="text-2xl font-black text-teal-900 tracking-tight uppercase">
                      {campaign.poster_content.headline}
                    </h1>
                    <p className="text-sm font-semibold text-slate-700">
                      {campaign.poster_content.subheadline}
                    </p>
                    <div className="py-2 border-y border-slate-200 space-y-1">
                      {campaign.poster_content.key_benefits?.map((b: string, i: number) => (
                        <div key={i} className="text-xs font-bold text-slate-800">
                          ✓ {b}
                        </div>
                      ))}
                    </div>
                    <div className="pt-2 text-sm font-extrabold text-teal-800">
                      {campaign.poster_content.call_to_action}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
