"use client";

import { useState, useEffect, useRef } from "react";
import {
  Phone,
  Mic,
  MicOff,
  Volume2,
  PhoneCall,
  PhoneOff,
  CheckCircle,
  Sparkles,
  Smartphone,
  Radio,
  Send,
  MessageSquare,
  AlertCircle,
  HelpCircle,
  RefreshCw,
  Terminal,
  Copy,
  Check,
  FileText,
  Clock,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import { api } from "../api";

export default function VoiceHelplinePage() {
  const [activeTab, setActiveTab] = useState<"webcall" | "android" | "telephony">("android");

  // --- Option 2: Web Call State ---
  const [isCalling, setIsCalling] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [callLang, setCallLang] = useState<"ta" | "hi" | "en">("ta");
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [callTranscript, setCallTranscript] = useState<Array<{ sender: "user" | "satya"; text: string }>>([]);
  const [currentInput, setCurrentInput] = useState("");
  const [micSupported, setMicSupported] = useState(true);

  // --- Option 3: Android Gateway State ---
  const [gatewayPhone, setGatewayPhone] = useState("");
  const [gatewayLang, setGatewayLang] = useState<"ta" | "hi" | "en">("ta");
  const [gatewayResult, setGatewayResult] = useState<any>(null);
  const [gatewayLoading, setGatewayLoading] = useState(false);
  const [gatewaySmsText, setGatewaySmsText] = useState("");
  const [gatewaySmsResult, setGatewaySmsResult] = useState<any>(null);
  const [gatewaySmsLoading, setGatewaySmsLoading] = useState(false);
  const [gatewayLogs, setGatewayLogs] = useState<any[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [guideMode, setGuideMode] = useState<"macrodroid" | "termux">("macrodroid");

  // --- Cloud Telephony State ---
  const [callerPhone, setCallerPhone] = useState("");
  const [ivrSession, setIvrSession] = useState<any>(null);
  const [dtmfSelected, setDtmfSelected] = useState<any>(null);
  const [speechText, setSpeechText] = useState("");
  const [speechResult, setSpeechResult] = useState<any>(null);
  const [missedCallResult, setMissedCallResult] = useState<any>(null);
  const [smsResult, setSmsResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const recognitionRef = useRef<any>(null);
  const timerRef = useRef<any>(null);

  // Call duration timer
  useEffect(() => {
    if (isCalling) {
      timerRef.current = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    } else {
      clearInterval(timerRef.current);
      setCallDuration(0);
    }
    return () => clearInterval(timerRef.current);
  }, [isCalling]);

  // Format call duration
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${mins.toString().padStart(2, "0")}:${remainder.toString().padStart(2, "0")}`;
  };

  // Text-To-Speech audio helper
  const speakVoice = (text: string, lang: "ta" | "hi" | "en") => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang === "ta" ? "ta-IN" : lang === "hi" ? "hi-IN" : "en-US";
      utterance.rate = 0.95;
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    }
  };

  // Start Option 2 Web Call
  const startWebCall = () => {
    setIsCalling(true);
    setCallTranscript([]);
    setCurrentInput("");

    let welcome = "";
    if (callLang === "ta") {
      welcome = "வணக்கம்! சாத்யா AI உதவி மையத்திற்கு நல்வரவு. உங்கள் தொழில் அல்லது கடன் சார்ந்த கேள்விகளைக் கேளுங்கள்.";
    } else if (callLang === "hi") {
      welcome = "नमस्ते! सत्या AI हेल्पलाइन में आपका स्वागत है। अपने व्यवसाय या ऋण संबंधी प्रश्न पूछें।";
    } else {
      welcome = "Welcome to SATYA AI Voice Helpline. Please ask any question about your micro-enterprise or schemes.";
    }

    setCallTranscript([{ sender: "satya", text: welcome }]);
    speakVoice(welcome, callLang);
  };

  // End Option 2 Web Call
  const endWebCall = () => {
    setIsCalling(false);
    setIsListening(false);
    setIsSpeaking(false);
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
  };

  // Toggle live microphone recording
  const toggleListening = () => {
    if (isListening) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {}
      }
      setIsListening(false);
      return;
    }

    if (typeof window === "undefined") return;

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setMicSupported(false);
      alert("Browser speech recognition is not supported in this browser. You can type your query in the box below.");
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = callLang === "ta" ? "ta-IN" : callLang === "hi" ? "hi-IN" : "en-IN";

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const text = Array.from(event.results)
          .map((r: any) => r[0].transcript)
          .join("");
        setCurrentInput(text);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.onerror = (event: any) => {
        console.warn("Speech recognition error:", event.error);
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (e) {
      console.error(e);
      setIsListening(false);
    }
  };

  // Process user message in Web Call
  const handleSendWebCallSpeech = async (overrideText?: string) => {
    const textToSend = overrideText || currentInput;
    if (!textToSend.trim()) return;

    const userMsg = textToSend.trim();
    setCurrentInput("");
    setCallTranscript((prev) => [...prev, { sender: "user", text: userMsg }]);
    setLoading(true);

    try {
      const res = await api.sendSpeechInput("webcall-" + Date.now(), userMsg, callLang);
      const answer = res.ai_response;
      setCallTranscript((prev) => [...prev, { sender: "satya", text: answer }]);
      speakVoice(answer, callLang);
    } catch (e: any) {
      const errMsg = e.message || "Failed to process voice query.";
      setCallTranscript((prev) => [...prev, { sender: "satya", text: errMsg }]);
    } finally {
      setLoading(false);
    }
  };

  // --- Option 3: Test Android Gateway Call ---
  const handleTestAndroidGateway = async () => {
    if (!gatewayPhone.trim()) {
      alert("Please enter a simulated mobile phone number.");
      return;
    }
    setGatewayLoading(true);
    setGatewayResult(null);
    try {
      const res = await api.triggerAndroidGatewayCall(gatewayPhone.trim(), gatewayLang, "missed_call");
      setGatewayResult(res);
    } catch (e: any) {
      alert(e.message || "Android Gateway test failed");
    } finally {
      setGatewayLoading(false);
    }
  };

  // --- Cloud Telephony Handlers ---
  const handleStartIVR = async () => {
    if (!callerPhone.trim()) {
      alert("Please enter a phone number to dial the SATYA Voice Helpline.");
      return;
    }
    setLoading(true);
    setSpeechResult(null);
    try {
      const res = await api.startIVR(callerPhone.trim());
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
      speakVoice(res.ai_response, lang);
    } catch (e: any) {
      alert(e.message || "Voice speech processing failed");
    } finally {
      setLoading(false);
    }
  };

  const handleMissedCall = async () => {
    if (!callerPhone.trim()) {
      alert("Please enter a phone number to simulate a missed call.");
      return;
    }
    setLoading(true);
    try {
      const res = await api.triggerMissedCall(callerPhone.trim());
      setMissedCallResult(res);
    } catch (e: any) {
      alert(e.message || "Missed call trigger failed");
    } finally {
      setLoading(false);
    }
  };

  const handleSendSMS = async () => {
    if (!callerPhone.trim()) {
      alert("Please enter a phone number to trigger SMS notification.");
      return;
    }
    setLoading(true);
    try {
      const res = await api.sendSMSFallback(callerPhone.trim(), "Your SATYA business plan & scheme recommendation report is ready.");
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
          <div className="bg-gradient-to-r from-emerald-900/40 via-blue-900/30 to-slate-800 border border-emerald-500/30 rounded-2xl p-6 relative overflow-hidden shadow-xl">
            <div className="relative z-10 space-y-2">
              <div className="flex items-center gap-2 text-emerald-400 font-semibold text-xs uppercase tracking-wider">
                <Sparkles className="w-4 h-4" /> 100% Free Rural Voice Assistant Architectures
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                SATYA Voice Helpline & Mobile Integration
              </h1>
              <p className="text-slate-300 max-w-3xl text-sm leading-relaxed">
                Connect rural entrepreneurs in their native language (Tamil, Hindi, English). Choose between zero-cost mobile browser voice calls or an Android SIM-card telecom gateway without expensive carrier subscriptions.
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex border-b border-slate-800 gap-3 pb-2">
            <button
              onClick={() => setActiveTab("webcall")}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all ${
                activeTab === "webcall"
                  ? "bg-emerald-600 text-white shadow-lg shadow-emerald-900/40"
                  : "bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-800"
              }`}
            >
              <Smartphone className="w-4 h-4" /> Option 2: Free Mobile Web Call (₹0)
            </button>
            <button
              onClick={() => setActiveTab("android")}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all ${
                activeTab === "android"
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-900/40"
                  : "bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-800"
              }`}
            >
              <Radio className="w-4 h-4" /> Option 3: Android Phone SIM Gateway (₹0 Extra)
            </button>
            <button
              onClick={() => setActiveTab("telephony")}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all ${
                activeTab === "telephony"
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-900/40"
                  : "bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-800"
              }`}
            >
              <PhoneCall className="w-4 h-4" /> Cloud Telephony / Twilio IVR
            </button>
          </div>

          {/* ========================================================================= */}
          {/* OPTION 2: FREE MOBILE WEB VOICE CALL                                      */}
          {/* ========================================================================= */}
          {activeTab === "webcall" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Call Controls & Visualizer */}
              <div className="lg:col-span-5 bg-slate-800/90 border border-slate-700/80 rounded-2xl p-6 flex flex-col justify-between shadow-2xl relative overflow-hidden">
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-700 pb-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                      <Radio className="w-3.5 h-3.5 animate-pulse" /> Live Web Calling
                    </span>
                    <span className="text-xs font-mono text-slate-400 bg-slate-900 px-2 py-0.5 rounded">
                      {isCalling ? `Connected: ${formatTime(callDuration)}` : "Ready"}
                    </span>
                  </div>

                  {/* Language Selector */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300">Helpline Language (மொழி):</label>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        onClick={() => setCallLang("ta")}
                        className={`py-2 px-3 rounded-xl font-bold text-xs border transition-all ${
                          callLang === "ta"
                            ? "bg-emerald-600 text-white border-emerald-400 shadow-md"
                            : "bg-slate-900 text-slate-300 border-slate-700 hover:bg-slate-800"
                        }`}
                      >
                        தமிழ் (Tamil)
                      </button>
                      <button
                        onClick={() => setCallLang("hi")}
                        className={`py-2 px-3 rounded-xl font-bold text-xs border transition-all ${
                          callLang === "hi"
                            ? "bg-amber-600 text-white border-amber-400 shadow-md"
                            : "bg-slate-900 text-slate-300 border-slate-700 hover:bg-slate-800"
                        }`}
                      >
                        हिंदी (Hindi)
                      </button>
                      <button
                        onClick={() => setCallLang("en")}
                        className={`py-2 px-3 rounded-xl font-bold text-xs border transition-all ${
                          callLang === "en"
                            ? "bg-blue-600 text-white border-blue-400 shadow-md"
                            : "bg-slate-900 text-slate-300 border-slate-700 hover:bg-slate-800"
                        }`}
                      >
                        English
                      </button>
                    </div>
                  </div>

                  {/* Active In-Call Screen */}
                  <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-6 text-center space-y-4 my-4">
                    <div className="relative mx-auto w-24 h-24 flex items-center justify-center">
                      {isCalling && (
                        <div className="absolute inset-0 rounded-full bg-emerald-500/20 animate-ping" />
                      )}
                      <div
                        className={`w-20 h-20 rounded-full flex items-center justify-center text-white shadow-xl transition-all ${
                          isCalling
                            ? isSpeaking
                              ? "bg-gradient-to-br from-indigo-500 to-purple-600 scale-105"
                              : isListening
                              ? "bg-gradient-to-br from-emerald-500 to-teal-600 scale-105 animate-pulse"
                              : "bg-emerald-600"
                            : "bg-slate-800 text-slate-400"
                        }`}
                      >
                        {isSpeaking ? (
                          <Volume2 className="w-9 h-9 animate-bounce" />
                        ) : isListening ? (
                          <Mic className="w-9 h-9 animate-pulse" />
                        ) : (
                          <Phone className="w-9 h-9" />
                        )}
                      </div>
                    </div>

                    <div>
                      <h3 className="font-extrabold text-base text-white">
                        {isCalling ? "SATYA AI Voice Advisor" : "Voice Helpline Offline"}
                      </h3>
                      <p className="text-xs text-slate-400">
                        {isCalling
                          ? isSpeaking
                            ? "Speaking to you... பதில் அளிக்கிறது..."
                            : isListening
                            ? "Listening to your voice... பேசுங்கள்..."
                            : "Line open • Speak or tap mic"
                          : "Tap Call button below to connect instantly"}
                      </p>
                    </div>

                    {/* Animated Sound Waves */}
                    {isCalling && (
                      <div className="flex items-center justify-center gap-1.5 h-6">
                        <span className={`w-1 rounded-full bg-emerald-400 transition-all ${isSpeaking || isListening ? "h-6 animate-pulse" : "h-2"}`} />
                        <span className={`w-1 rounded-full bg-emerald-400 transition-all ${isSpeaking || isListening ? "h-4 animate-pulse delay-75" : "h-2"}`} />
                        <span className={`w-1 rounded-full bg-emerald-400 transition-all ${isSpeaking || isListening ? "h-7 animate-pulse delay-100" : "h-2"}`} />
                        <span className={`w-1 rounded-full bg-emerald-400 transition-all ${isSpeaking || isListening ? "h-3 animate-pulse delay-150" : "h-2"}`} />
                        <span className={`w-1 rounded-full bg-emerald-400 transition-all ${isSpeaking || isListening ? "h-5 animate-pulse delay-200" : "h-2"}`} />
                      </div>
                    )}
                  </div>
                </div>

                {/* Main Action Buttons */}
                <div className="space-y-3 pt-2">
                  {!isCalling ? (
                    <button
                      onClick={startWebCall}
                      className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold rounded-2xl text-sm flex items-center justify-center gap-2.5 shadow-xl shadow-emerald-950/60 transition-transform active:scale-95"
                    >
                      <PhoneCall className="w-5 h-5" /> Start Free Voice Helpline Call
                    </button>
                  ) : (
                    <div className="flex gap-2">
                      <button
                        onClick={toggleListening}
                        className={`flex-1 py-3.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                          isListening
                            ? "bg-amber-600 hover:bg-amber-500 text-white animate-pulse"
                            : "bg-slate-700 hover:bg-slate-600 text-white"
                        }`}
                      >
                        {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                        {isListening ? "Stop Listening" : "Tap to Speak (பேசுங்கள்)"}
                      </button>
                      <button
                        onClick={endWebCall}
                        className="px-6 py-3.5 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-lg active:scale-95"
                      >
                        <PhoneOff className="w-4 h-4" /> End Call
                      </button>
                    </div>
                  )}

                  <p className="text-[11px] text-slate-400 text-center">
                    💡 100% Free: Works on any phone browser via microphone & audio. Zero cellular bills.
                  </p>
                </div>
              </div>

              {/* Live Transcript & Manual Query Box */}
              <div className="lg:col-span-7 bg-slate-800/90 border border-slate-700/80 rounded-2xl p-6 flex flex-col justify-between shadow-2xl h-[520px]">
                <div className="flex items-center justify-between border-b border-slate-700 pb-3">
                  <h3 className="font-bold text-white text-sm flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-emerald-400" /> Live In-Call Voice Transcript
                  </h3>
                  <span className="text-[11px] text-slate-400">
                    Bilingual Speech-to-Text & Synthesizer
                  </span>
                </div>

                {/* Transcript Scroll Area */}
                <div className="flex-1 overflow-y-auto space-y-3 p-3 my-3 bg-slate-950/60 rounded-xl border border-slate-800/80 text-xs">
                  {callTranscript.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-slate-500 space-y-2">
                      <Volume2 className="w-8 h-8 opacity-40" />
                      <p>Start a call to see live voice transcription and SATYA replies.</p>
                    </div>
                  ) : (
                    callTranscript.map((msg, i) => (
                      <div
                        key={i}
                        className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}
                      >
                        <span className="text-[10px] text-slate-400 mb-0.5 px-1 font-semibold">
                          {msg.sender === "user" ? "👤 You (Caller)" : "🤖 SATYA AI Advisor"}
                        </span>
                        <div
                          className={`max-w-[85%] p-3 rounded-2xl leading-relaxed ${
                            msg.sender === "user"
                              ? "bg-emerald-700 text-white rounded-tr-none"
                              : "bg-slate-800 text-slate-100 border border-slate-700/80 rounded-tl-none shadow"
                          }`}
                        >
                          {msg.text}
                        </div>
                      </div>
                    ))
                  )}
                  {loading && (
                    <div className="flex items-center gap-2 text-emerald-400 text-xs p-2">
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" /> SATYA is analyzing your question...
                    </div>
                  )}
                </div>

                {/* Text Input / Quick Prompts */}
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={currentInput}
                      onChange={(e) => setCurrentInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSendWebCallSpeech()}
                      placeholder={
                        callLang === "ta"
                          ? "கேள்வியைத் தட்டச்சு செய்யவும் அல்லது மைக் மூலம் பேசவும்..."
                          : callLang === "hi"
                          ? "अपना प्रश्न लिखें या माइक द्वारा बोलें..."
                          : "Type your query or speak into microphone..."
                      }
                      className="flex-1 px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                    />
                    <button
                      onClick={() => handleSendWebCallSpeech()}
                      disabled={loading || !currentInput.trim()}
                      className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow"
                    >
                      <Send className="w-3.5 h-3.5" /> Send
                    </button>
                  </div>

                  {/* One-Tap Sample Voice Queries */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    <span className="text-[11px] text-slate-500 self-center">Try asking:</span>
                    <button
                      onClick={() => {
                        const q = callLang === "ta" ? "ஆட்டுப்பண்ணை ஆரம்பிக்க என்ன அரசு கடன் கிடைக்கும்?" : "मुद्रा लोन कैसे प्राप्त करें?";
                        handleSendWebCallSpeech(q);
                      }}
                      className="text-[11px] bg-slate-800 hover:bg-slate-700 text-slate-300 px-2.5 py-1 rounded-lg border border-slate-700"
                    >
                      {callLang === "ta" ? "🐐 ஆட்டுப்பண்ணை கடன்" : "💰 MUDRA Loan"}
                    </button>
                    <button
                      onClick={() => {
                        const q = callLang === "ta" ? "உணவு பதப்படுத்துதல் தொழிலுக்கு PM-FME மானியம் உள்ளதா?" : "खाद्य प्रसंस्करण पीएम-एफएमई योजना";
                        handleSendWebCallSpeech(q);
                      }}
                      className="text-[11px] bg-slate-800 hover:bg-slate-700 text-slate-300 px-2.5 py-1 rounded-lg border border-slate-700"
                    >
                      {callLang === "ta" ? "🌾 PM-FME 35% மானியம்" : "🌾 PM-FME Scheme"}
                    </button>
                    <button
                      onClick={() => {
                        const q = "How to generate a business plan for rural poultry?";
                        handleSendWebCallSpeech(q);
                      }}
                      className="text-[11px] bg-slate-800 hover:bg-slate-700 text-slate-300 px-2.5 py-1 rounded-lg border border-slate-700"
                    >
                      📑 Business Plan Roadmap
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* OPTION 3: FREE ANDROID PHONE SIM GATEWAY                                  */}
          {/* ========================================================================= */}
          {activeTab === "android" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Architecture & Step-by-Step Guide */}
              <div className="lg:col-span-7 bg-slate-800/90 border border-slate-700/80 rounded-2xl p-6 space-y-5 shadow-2xl">
                <div className="border-b border-slate-700 pb-3 flex items-center justify-between">
                  <div>
                    <h2 className="text-base font-bold text-white flex items-center gap-2">
                      <Radio className="w-4 h-4 text-indigo-400" /> Turn Any Android Phone into a Free Helpline Gateway
                    </h2>
                    <p className="text-xs text-slate-400">
                      Use a spare phone + normal SIM card (Airtel, Jio, Vi) with an existing unlimited plan.
                    </p>
                  </div>
                  <span className="bg-indigo-950 text-indigo-300 border border-indigo-500/30 text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase">
                    Zero Telecom Fees
                  </span>
                </div>

                {/* Workflow Diagram */}
                <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-xl space-y-2 text-xs">
                  <div className="font-bold text-indigo-300">How It Operates with Zero Cost:</div>
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-[11px] text-center pt-1">
                    <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                      <span className="block font-bold text-white">1. Farmer Dials</span>
                      <span className="text-slate-400">Calls your normal 10-digit SIM number from any phone</span>
                    </div>
                    <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                      <span className="block font-bold text-white">2. Auto-Reject</span>
                      <span className="text-slate-400">Android phone drops after 1 ring (Costs ₹0 to caller)</span>
                    </div>
                    <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                      <span className="block font-bold text-white">3. SATYA AI</span>
                      <span className="text-slate-400">Webhook triggers SATYA to craft custom business advice</span>
                    </div>
                    <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                      <span className="block font-bold text-white">4. Free SMS</span>
                      <span className="text-slate-400">Phone dispatches advice SMS back using SIM plan</span>
                    </div>
                  </div>
                </div>

                {/* Setup Steps */}
                <div className="space-y-3 text-xs">
                  <h3 className="font-bold text-white text-sm">Quick 3-Step Setup on Your Android Phone:</h3>

                  <div className="space-y-2.5">
                    <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl space-y-1">
                      <span className="font-bold text-emerald-400">Step 1: Install MacroDroid (Free on Play Store)</span>
                      <p className="text-slate-300 text-[11px]">
                        Install the free automation app <strong>MacroDroid</strong> or <strong>Automate</strong> from Google Play Store on your spare Android device.
                      </p>
                    </div>

                    <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl space-y-1">
                      <span className="font-bold text-emerald-400">Step 2: Create a Call Trigger</span>
                      <p className="text-slate-300 text-[11px]">
                        Set Trigger: <em>Call Incoming / Missed Call</em> ➔ Action 1: <em>Reject Call</em> ➔ Action 2: <em>HTTP Request (POST)</em>.
                      </p>
                      <div className="bg-slate-950 p-2 rounded text-[11px] font-mono text-indigo-300 overflow-x-auto">
                        URL: http://your-server-or-ngrok/api/v1/voice/android-gateway/call
                      </div>
                    </div>

                    <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl space-y-1">
                      <span className="font-bold text-emerald-400">Step 3: Auto-Send SMS Reply</span>
                      <p className="text-slate-300 text-[11px]">
                        Action 3: <em>Send SMS</em> to [caller_number] containing the personalized scheme & guidance message returned by SATYA!
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Interactive Live Tester */}
              <div className="lg:col-span-5 bg-slate-800/90 border border-slate-700/80 rounded-2xl p-6 space-y-4 shadow-2xl flex flex-col justify-between">
                <div className="space-y-3 text-xs">
                  <div className="border-b border-slate-700 pb-3">
                    <h3 className="font-bold text-white text-sm flex items-center gap-1.5">
                      <Smartphone className="w-4 h-4 text-indigo-400" /> Test Android Gateway Webhook
                    </h3>
                    <p className="text-slate-400 text-[11px]">
                      Simulate a call reaching your Android phone and inspect the generated SMS payload.
                    </p>
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-slate-300">Simulate Caller Phone Number:</label>
                    <input
                      type="tel"
                      value={gatewayPhone}
                      onChange={(e) => setGatewayPhone(e.target.value)}
                      placeholder="Enter mobile number (e.g. +91 98421 00000)"
                      className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs placeholder-slate-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-slate-300">Preferred Language for SMS Response:</label>
                    <select
                      value={gatewayLang}
                      onChange={(e: any) => setGatewayLang(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs"
                    >
                      <option value="ta">தமிழ் (Tamil)</option>
                      <option value="hi">हिंदी (Hindi)</option>
                      <option value="en">English</option>
                    </select>
                  </div>

                  <button
                    onClick={handleTestAndroidGateway}
                    disabled={gatewayLoading}
                    className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow"
                  >
                    {gatewayLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <PhoneCall className="w-4 h-4" />}
                    Simulate Inbound Call to Android Gateway
                  </button>

                  {gatewayResult && (
                    <div className="p-4 bg-slate-950 border border-indigo-500/30 rounded-xl space-y-2 mt-3">
                      <div className="text-xs text-emerald-400 font-bold flex items-center gap-1">
                        <CheckCircle className="w-3.5 h-3.5" /> Webhook Executed Successfully
                      </div>
                      <div className="text-[11px] text-slate-300">
                        <span className="font-bold text-slate-400 block mb-1">Generated SMS to send via SIM card:</span>
                        <p className="p-2.5 bg-slate-900 border border-slate-800 rounded-lg font-mono text-indigo-200 leading-relaxed">
                          "{gatewayResult.sms_text}"
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-xl text-[11px] text-slate-400">
                  ✅ <strong>Cost:</strong> Zero cloud telephony bills. Uses the SIM card's existing daily 100 free SMS allowance.
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 3: CLOUD TELEPHONY / TWILIO / EXOTEL SIMULATOR                        */}
          {/* ========================================================================= */}
          {activeTab === "telephony" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Interactive IVR Simulator */}
              <div className="bg-slate-800/80 border border-slate-700/60 rounded-2xl p-6 space-y-4 shadow-xl">
                <h2 className="text-base font-bold text-white flex items-center gap-2 border-b border-slate-700 pb-3">
                  <Volume2 className="w-4 h-4 text-blue-400" /> Interactive IVR & DTMF Keypad Simulator
                </h2>

                <div className="space-y-3 text-xs">
                  <div className="space-y-1">
                    <label className="font-semibold text-slate-300">Simulated Caller Phone Number:</label>
                    <input
                      type="tel"
                      value={callerPhone}
                      onChange={(e) => setCallerPhone(e.target.value)}
                      placeholder="Enter phone number (e.g. +91 98765 43210)"
                      className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs placeholder-slate-500 focus:outline-none focus:border-blue-500"
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

                  {speechResult && (
                    <div className="p-4 bg-emerald-950/40 border border-emerald-500/30 rounded-xl space-y-2 mt-3">
                      <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-bold">
                        <CheckCircle className="w-3.5 h-3.5" /> SATYA NLP AI Synthesis & Spoken Output:
                      </div>
                      <p className="text-xs text-slate-200 leading-relaxed italic bg-slate-900/60 p-3 rounded-lg">
                        "{speechResult.ai_response}"
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Missed Call & Webhook Info */}
              <div className="bg-slate-800/80 border border-slate-700/60 rounded-2xl p-6 space-y-5 shadow-xl flex flex-col justify-between">
                <div className="space-y-4">
                  <h2 className="text-base font-bold text-white flex items-center gap-2 border-b border-slate-700 pb-3">
                    <PhoneCall className="w-4 h-4 text-indigo-400" /> Missed Call & Twilio Webhook Endpoints
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

                  {/* Live Webhook Endpoints */}
                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1.5 text-[11px] text-slate-300 font-mono">
                    <div className="font-sans font-bold text-slate-400 text-xs">Registered Telephony Webhooks:</div>
                    <div className="text-emerald-400">POST /api/v1/voice/twilio/incoming</div>
                    <div className="text-blue-400">POST /api/v1/voice/twilio/dtmf</div>
                    <div className="text-indigo-400">POST /api/v1/voice/twilio/speech</div>
                    <div className="text-teal-400">POST /api/v1/voice/android-gateway/call</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
