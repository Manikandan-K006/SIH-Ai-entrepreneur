"use client";

import { useState } from "react";
import { Volume2, PhoneCall, CheckCircle, Sparkles, Sprout, DollarSign, BookOpen, Briefcase, ArrowLeft, HeartHandshake } from "lucide-react";
import Link from "next/link";
import { api } from "../api";

export default function SimplifiedModePage() {
  const [selectedCapital, setSelectedCapital] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [voicePrompt, setVoicePrompt] = useState<string>("வணக்கம்! உங்கள் தொழிலை தேர்வு செய்யவும்.");
  const [guidanceResult, setGuidanceResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const speakText = (text: string) => {
    setVoicePrompt(text);
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      const synth = window.speechSynthesis;
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "ta-IN";
      synth.speak(utterance);
    }
  };

  const handleSelectCategory = (cat: string, labelTa: string) => {
    setSelectedCategory(cat);
    speakText(`${labelTa} தேர்வு செய்யப்பட்டது. உங்களிடம் எவ்வளவு முதலீடு தொகை உள்ளது?`);
  };

  const handleSelectCapital = async (capText: string, amount: number) => {
    setSelectedCapital(capText);
    speakText(`உங்கள் முதலீடு ${capText}. SATYA AI உங்களுக்கான திட்டத்தை தயாரிக்கிறது.`);
    setLoading(true);

    try {
      const res = await api.analyzeAgriEnterprise({
        business_idea: selectedCategory || "Rural Enterprise",
        capital: amount,
        required_investment: amount * 2.5,
      });
      setGuidanceResult(res);
      speakText(`உங்களுக்கான தொழில்துறை ஆலோசனை தயாராக உள்ளது.`);
    } catch (e) {
      setGuidanceResult({
        enterprise_category: selectedCategory || "கிராமப்புற தொழில்",
        feasibility_assessment: "நல்ல வாய்ப்பு",
        opportunity_score: 80,
        analysis_summary: "உங்கள் முதலீட்டு அளவிற்கு ஏற்ற அரசு கடனுதவி மற்றும் திட்டங்கள் உள்ளன.",
        recommended_next_steps: ["அரசு முத்ரா கடனுதவி விண்ணப்பிக்கவும்", "உள்ளூர் சந்தையில் விற்பனை செய்யவும்"]
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-8 font-sans flex flex-col justify-between max-w-4xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <Link href="/dashboard" className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl text-sm flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" /> Normal Mode
        </Link>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-600 font-black text-white flex items-center justify-center">S</div>
          <span className="font-extrabold text-lg tracking-tight text-white">SATYA Simple</span>
        </div>
        <span className="px-3 py-1 bg-emerald-950 text-emerald-300 font-bold text-xs rounded-full border border-emerald-500/30">
          Simplified / Easy Mode
        </span>
      </div>

      {/* Voice Prompt Box */}
      <div className="p-5 bg-gradient-to-r from-emerald-900/50 via-teal-900/40 to-slate-900 border-2 border-emerald-500/40 rounded-2xl flex items-center gap-4 shadow-2xl">
        <button
          onClick={() => speakText(voicePrompt)}
          className="p-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-full shrink-0 shadow-lg animate-pulse"
        >
          <Volume2 className="w-8 h-8" />
        </button>
        <div>
          <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider block">Voice Instructions (ஒலி வழிகாட்டி)</span>
          <p className="text-lg font-extrabold text-white mt-0.5">"{voicePrompt}"</p>
        </div>
      </div>

      {/* Step 1: Category Selection */}
      {!selectedCategory && (
        <div className="space-y-4">
          <h2 className="text-xl font-extrabold text-slate-200 text-center">1. உங்கள் தொழிலை தேர்வு செய்யவும் (Choose Business)</h2>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => handleSelectCategory("Dairy & Livestock", "பால் மற்றும் கால்நடை தொழில்")}
              className="p-6 bg-slate-800 hover:bg-emerald-900/60 border-2 border-slate-700 hover:border-emerald-500 rounded-2xl flex flex-col items-center justify-center space-y-3 transition-all transform hover:scale-105"
            >
              <Sprout className="w-12 h-12 text-emerald-400" />
              <span className="text-lg font-bold text-white">பால் / பண்ணை (Dairy)</span>
            </button>

            <button
              onClick={() => handleSelectCategory("Food Processing & Pickles", "உணவுப் பொருள் மற்றும் ஊறுகாய்")}
              className="p-6 bg-slate-800 hover:bg-emerald-900/60 border-2 border-slate-700 hover:border-emerald-500 rounded-2xl flex flex-col items-center justify-center space-y-3 transition-all transform hover:scale-105"
            >
              <Briefcase className="w-12 h-12 text-teal-400" />
              <span className="text-lg font-bold text-white">உணவு தயாரிப்பு (Food)</span>
            </button>

            <button
              onClick={() => handleSelectCategory("Handicrafts & Tailoring", "கைவினை மற்றும் தையல்")}
              className="p-6 bg-slate-800 hover:bg-emerald-900/60 border-2 border-slate-700 hover:border-emerald-500 rounded-2xl flex flex-col items-center justify-center space-y-3 transition-all transform hover:scale-105"
            >
              <HeartHandshake className="w-12 h-12 text-amber-400" />
              <span className="text-lg font-bold text-white">கைவினை / தையல் (Crafts)</span>
            </button>

            <button
              onClick={() => handleSelectCategory("Local Shop & Services", "கடை மற்றும் சேவை")}
              className="p-6 bg-slate-800 hover:bg-emerald-900/60 border-2 border-slate-700 hover:border-emerald-500 rounded-2xl flex flex-col items-center justify-center space-y-3 transition-all transform hover:scale-105"
            >
              <BookOpen className="w-12 h-12 text-blue-400" />
              <span className="text-lg font-bold text-white">உள்ளூர் கடை (Local Shop)</span>
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Capital Selection */}
      {selectedCategory && !selectedCapital && (
        <div className="space-y-4">
          <h2 className="text-xl font-extrabold text-slate-200 text-center">2. உங்களிடம் எவ்வளவு முதலீடு உள்ளது? (Investment Amount)</h2>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => handleSelectCapital("₹10,000", 10000)}
              className="p-6 bg-slate-800 hover:bg-blue-900/60 border-2 border-slate-700 hover:border-blue-500 rounded-2xl text-center space-y-2 transition-all transform hover:scale-105"
            >
              <DollarSign className="w-10 h-10 text-emerald-400 mx-auto" />
              <span className="text-2xl font-black text-white block">₹10,000</span>
              <span className="text-xs text-slate-400 font-semibold">சிறு முதலீடு</span>
            </button>

            <button
              onClick={() => handleSelectCapital("₹50,000", 50000)}
              className="p-6 bg-slate-800 hover:bg-blue-900/60 border-2 border-slate-700 hover:border-blue-500 rounded-2xl text-center space-y-2 transition-all transform hover:scale-105"
            >
              <DollarSign className="w-10 h-10 text-teal-400 mx-auto" />
              <span className="text-2xl font-black text-white block">₹50,000</span>
              <span className="text-xs text-slate-400 font-semibold">நடுத்தர முதலீடு</span>
            </button>

            <button
              onClick={() => handleSelectCapital("₹1,00,000", 100000)}
              className="p-6 bg-slate-800 hover:bg-blue-900/60 border-2 border-slate-700 hover:border-blue-500 rounded-2xl text-center space-y-2 transition-all transform hover:scale-105"
            >
              <DollarSign className="w-10 h-10 text-amber-400 mx-auto" />
              <span className="text-2xl font-black text-white block">₹1,00,000</span>
              <span className="text-xs text-slate-400 font-semibold">பெரிய முதலீடு</span>
            </button>

            <button
              onClick={() => handleSelectCapital("More / மற்றவை", 200000)}
              className="p-6 bg-slate-800 hover:bg-blue-900/60 border-2 border-slate-700 hover:border-blue-500 rounded-2xl text-center space-y-2 transition-all transform hover:scale-105"
            >
              <DollarSign className="w-10 h-10 text-indigo-400 mx-auto" />
              <span className="text-2xl font-black text-white block">அதிகம் (More)</span>
              <span className="text-xs text-slate-400 font-semibold">₹2,00,000+</span>
            </button>
          </div>
        </div>
      )}

      {/* Result Display */}
      {guidanceResult && (
        <div className="p-6 bg-slate-900 border-2 border-emerald-500/50 rounded-2xl space-y-4 shadow-2xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <span className="font-extrabold text-lg text-emerald-400">
              ✓ SATYA AI எளிய வழிகாட்டி (Simple Guidance)
            </span>
            <span className="px-3 py-1 bg-emerald-950 text-white font-bold text-xs rounded-full">
              மதிப்பெண்: {guidanceResult.opportunity_score}/100
            </span>
          </div>

          <p className="text-base text-slate-200 font-semibold italic bg-slate-800/80 p-4 rounded-xl border border-slate-700">
            "{guidanceResult.analysis_summary}"
          </p>

          <div className="space-y-2">
            <span className="font-bold text-slate-300 text-sm block">அடுத்த கட்ட நடவடிக்கைகள் (Next Steps):</span>
            <div className="space-y-2">
              {guidanceResult.recommended_next_steps?.map((step: string, idx: number) => (
                <div key={idx} className="p-3 bg-slate-800 rounded-xl flex items-center gap-3 text-sm font-semibold text-white border border-slate-700">
                  <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
                  <span>{step}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-2 flex gap-3">
            <Link href="/voice" className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-center text-sm flex items-center justify-center gap-2">
              <PhoneCall className="w-4 h-4" /> Phone Helpline Dial
            </Link>
            <button
              onClick={() => {
                setSelectedCategory(null);
                setSelectedCapital(null);
                setGuidanceResult(null);
                speakText("வணக்கம்! உங்கள் தொழிலை தேர்வு செய்யவும்.");
              }}
              className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-sm"
            >
              Start Over (மீண்டும்)
            </button>
          </div>
        </div>
      )}

      {/* Bottom Helpline Bar */}
      <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-between text-xs text-slate-400">
        <span>Need Voice Help? Call Free Helpline:</span>
        <Link href="/voice" className="text-emerald-400 font-extrabold flex items-center gap-1">
          <PhoneCall className="w-3.5 h-3.5" /> Dial IVR Helpline
        </Link>
      </div>
    </div>
  );
}
