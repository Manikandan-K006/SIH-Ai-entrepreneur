"use client";

import { useState } from "react";
import { Phone, Mic, Volume2, MessageSquare, PhoneCall, CheckCircle, Sparkles, AlertCircle } from "lucide-react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import { api } from "../api";

export default function VoiceHelplinePage() {
  const [callerPhone, setCallerPhone] = useState("+919876543210");
  const [ivrSession, setIvrSession] = useState<any>(null);
  const [dtmfSelected, setDtmfSelected] = useState<any>(null);
  const [speechText, setSpeechText] = useState("");
  const [speechResult, setSpeechResult] = useState<any>(null);
  const [missedCallResult, setMissedCallResult] = useState<any>(null);
  const [smsResult, setSmsResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleStartIVR = async () => {
    setLoading(true);
    setSpeechResult(null);
    try {
      const res = await api.startIVR(callerPhone);
      setIvrSession(res);
      setDtmfSelected(null);
    } catch (e: any) {
      alert(e.message || "Failed to start IVR session");
    } finally {
      setLoading(false);
    }
  };

  const handleDTMF = async (keyPressed: string) => {
    if (!ivrSession) return;
    setLoading(true);
    try {
      const res = await api.sendDTMF(ivrSession.session_id, keyPressed);
      setDtmfSelected(res);
    } catch (e: any) {
      alert(e.message || "DTMF processing failed");
    } finally {
      setLoading(false);
    }
  };

  const handleSendSpeech = async () => {
    if (!ivrSession || !speechText.trim()) return;
    setLoading(true);
    try {
      const lang = dtmfSelected?.language || "ta";
      const res = await api.sendSpeechInput(ivrSession.session_id, speechText, lang);
      setSpeechResult(res);

      // Play synthesized audio using Web Speech API if supported
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        const synth = window.speechSynthesis;
        const utterance = new SpeechSynthesisUtterance(res.ai_response);
        utterance.lang = lang === "ta" ? "ta-IN" : lang === "hi" ? "hi-IN" : "en-US";
        synth.speak(utterance);
      }
    } catch (e: any) {
      alert(e.message || "Voice speech processing failed");
    } finally {
      setLoading(false);
    }
  };

  const handleMissedCall = async () => {
    setLoading(true);
    try {
      const res = await api.triggerMissedCall(callerPhone);
      setMissedCallResult(res);
    } catch (e: any) {
      alert(e.message || "Missed call trigger failed");
    } finally {
      setLoading(false);
    }
  };

  const handleSendSMS = async () => {
    setLoading(true);
    try {
      const res = await api.sendSMSFallback(callerPhone, "Your SATYA business plan & scheme recommendation report is ready.");
      setSmsResult(res);
    } catch (e: any) {
      alert(e.message || "SMS fallback failed");
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
          <div className="bg-gradient-to-r from-blue-900/40 via-indigo-900/30 to-slate-800 border border-blue-500/20 rounded-2xl p-6 relative overflow-hidden">
            <div className="relative z-10 space-y-2">
              <div className="flex items-center gap-2 text-blue-400 font-semibold text-sm">
                <PhoneCall className="w-4 h-4" /> SATYA Voice Helpline & Telephony Architecture (Modules 19, 20, 21, 22)
              </div>
              <h1 className="text-3xl font-extrabold tracking-tight text-white">
                Hybrid IVR, Voice AI & Accessibility Helpline
              </h1>
              <p className="text-slate-300 max-w-2xl text-sm">
                Connects non-literate and rural entrepreneurs over phone via IVR language selection (Tamil, Hindi, English), Speech-to-Text, SATYA AI core, Text-to-Speech, Missed Call callbacks, and SMS fallbacks.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Interactive IVR & Voice Simulator */}
            <div className="bg-slate-800/80 border border-slate-700/60 rounded-2xl p-6 space-y-4 shadow-xl">
              <h2 className="text-base font-bold text-white flex items-center gap-2 border-b border-slate-700 pb-3">
                <Volume2 className="w-4 h-4 text-blue-400" /> Interactive IVR & Conversational Voice Bot
              </h2>

              <div className="space-y-3 text-xs">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-300">Simulated Caller Phone Number:</label>
                  <input
                    type="text"
                    value={callerPhone}
                    onChange={(e) => setCallerPhone(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs"
                  />
                </div>

                {!ivrSession ? (
                  <button
                    onClick={handleStartIVR}
                    disabled={loading}
                    className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg"
                  >
                    <Phone className="w-4 h-4" /> Dial SATYA Voice Helpline
                  </button>
                ) : (
                  <div className="p-4 bg-slate-900/80 border border-blue-500/30 rounded-xl space-y-3">
                    <div className="text-xs text-blue-300 font-semibold italic bg-blue-950/60 p-3 rounded-lg border border-blue-500/20">
                      🔊 {ivrSession.prompt}
                    </div>

                    {/* DTMF Keypad */}
                    <div className="space-y-1.5">
                      <span className="font-semibold text-slate-300 block">Select IVR Language (Press Key):</span>
                      <div className="grid grid-cols-3 gap-2">
                        <button
                          onClick={() => handleDTMF("1")}
                          className={`py-2 px-3 rounded-lg font-bold border transition-colors ${
                            dtmfSelected?.language === "ta"
                              ? "bg-emerald-600 text-white border-emerald-400"
                              : "bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700"
                          }`}
                        >
                          1 - தமிழ் (Tamil)
                        </button>
                        <button
                          onClick={() => handleDTMF("2")}
                          className={`py-2 px-3 rounded-lg font-bold border transition-colors ${
                            dtmfSelected?.language === "hi"
                              ? "bg-amber-600 text-white border-amber-400"
                              : "bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700"
                          }`}
                        >
                          2 - हिंदी (Hindi)
                        </button>
                        <button
                          onClick={() => handleDTMF("3")}
                          className={`py-2 px-3 rounded-lg font-bold border transition-colors ${
                            dtmfSelected?.language === "en"
                              ? "bg-blue-600 text-white border-blue-400"
                              : "bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700"
                          }`}
                        >
                          3 - English
                        </button>
                      </div>
                    </div>

                    {dtmfSelected && (
                      <div className="space-y-2 pt-2 border-t border-slate-700">
                        <p className="text-xs text-emerald-300 font-semibold">
                          🔊 {dtmfSelected.prompt}
                        </p>

                        <div className="space-y-1.5">
                          <label className="text-[11px] text-slate-400">Speak / Type Your Voice Query:</label>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={speechText}
                              onChange={(e) => setSpeechText(e.target.value)}
                              placeholder="e.g. Naan veetla oorugai senju virpanai panren..."
                              className="flex-1 px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white text-xs"
                            />
                            <button
                              onClick={handleSendSpeech}
                              disabled={loading || !speechText.trim()}
                              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-xs shrink-0 flex items-center gap-1"
                            >
                              <Mic className="w-3.5 h-3.5" /> Process
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* AI Audio Response Output */}
                {speechResult && (
                  <div className="p-4 bg-emerald-950/60 border border-emerald-500/40 rounded-xl space-y-2">
                    <div className="flex items-center justify-between text-emerald-300 font-bold text-xs">
                      <span className="flex items-center gap-1">
                        <Volume2 className="w-4 h-4 text-emerald-400" /> SATYA Audio Response (TTS Played)
                      </span>
                    </div>
                    <p className="text-xs text-slate-200 leading-relaxed italic bg-slate-900/60 p-3 rounded-lg">
                      "{speechResult.ai_response}"
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Missed Call & SMS Fallback Architecture */}
            <div className="bg-slate-800/80 border border-slate-700/60 rounded-2xl p-6 space-y-5 shadow-xl flex flex-col justify-between">
              <div className="space-y-4">
                <h2 className="text-base font-bold text-white flex items-center gap-2 border-b border-slate-700 pb-3">
                  <PhoneCall className="w-4 h-4 text-indigo-400" /> Missed Call & SMS Fallback Simulators
                </h2>

                {/* Missed Call Box */}
                <div className="p-4 bg-slate-900/60 border border-slate-700/50 rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-white text-xs">Missed Call Automated Callback</h3>
                      <p className="text-[11px] text-slate-400">Zero-cost access mechanism for rural entrepreneurs</p>
                    </div>
                    <button
                      onClick={handleMissedCall}
                      disabled={loading}
                      className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-lg shadow"
                    >
                      Give Missed Call
                    </button>
                  </div>

                  {missedCallResult && (
                    <div className="p-3 bg-indigo-950/60 border border-indigo-500/30 rounded-lg text-xs text-indigo-200">
                      ✓ {missedCallResult.message}
                    </div>
                  )}
                </div>

                {/* SMS Fallback Box */}
                <div className="p-4 bg-slate-900/60 border border-slate-700/50 rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-white text-xs">SMS Notification Fallback</h3>
                      <p className="text-[11px] text-slate-400">Send key business plan highlights via SMS</p>
                    </div>
                    <button
                      onClick={handleSendSMS}
                      disabled={loading}
                      className="px-3.5 py-1.5 bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs rounded-lg shadow"
                    >
                      Trigger SMS
                    </button>
                  </div>

                  {smsResult && (
                    <div className="p-3 bg-teal-950/60 border border-teal-500/30 rounded-lg text-xs text-teal-200">
                      ✓ SMS status: <span className="font-bold uppercase">{smsResult.status}</span> via TelephonyProvider Abstraction Layer.
                    </div>
                  )}
                </div>
              </div>

              {/* Provider Abstraction Badge */}
              <div className="p-3 bg-slate-900/80 border border-slate-700/60 rounded-xl text-xs text-slate-400 flex items-center justify-between">
                <span>Telephony Provider Layer:</span>
                <span className="font-bold text-blue-400">Mock Provider (Exotel/Twilio Compatible)</span>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
