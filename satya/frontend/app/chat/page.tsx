"use client";

import { useEffect, useState, useRef } from "react";
import { api, getLanguage } from "../api";
import { translations, Language } from "../translations";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Send, Mic, MicOff, Sparkles, CheckCircle, ShieldAlert, Cpu, Database, Award, Loader2 } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
  metadata?: {
    execution_trace?: {
      intent: string;
      agents_used: string[];
      tools_used: string[];
      data_sources: string[];
      key_inputs: Record<string, any>;
      result_summary: string;
      confidence: number;
    };
  };
}

export default function ChatPage() {
  const [lang, setLang] = useState<Language>("en");
  const [sessions, setSessions] = useState<any[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [recording, setRecording] = useState(false);
  const [traceOpen, setTraceOpen] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const recognitionRef = useRef<any>(null);
  const t = translations[lang];

  useEffect(() => {
    setLang(getLanguage());
    const handleLangChange = () => setLang(getLanguage());
    window.addEventListener("languageChanged", handleLangChange);

    // Load sessions
    api.getConversations()
      .then((data) => {
        setSessions(data);
        if (data.length > 0) {
          loadSession(data[0].session_id);
        } else {
          // Initialize fresh chat session
          setCurrentSessionId(Math.random().toString(36).substring(7));
        }
      })
      .catch(() => {});

    // Speech Recognition Setup
    if (typeof window !== "undefined" && ("WebKitSpeechRecognition" in window || "SpeechRecognition" in window)) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        setRecording(false);
      };

      recognitionRef.current.onerror = () => {
        setRecording(false);
      };

      recognitionRef.current.onend = () => {
        setRecording(false);
      };
    }

    return () => window.removeEventListener("languageChanged", handleLangChange);
  }, []);

  useEffect(() => {
    // Scroll to bottom
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const loadSession = async (sessionId: string) => {
    setCurrentSessionId(sessionId);
    setLoading(true);
    try {
      const history = await api.getConversationMessages(sessionId);
      const formatted: Message[] = history.map((h) => ({
        role: h.role,
        content: h.content,
        metadata: h.metadata,
      }));
      setMessages(formatted);
    } catch {
      setMessages([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMsg]);
    const originalInput = input;
    setInput("");
    setLoading(true);

    try {
      const data = await api.sendMessage(originalInput, currentSessionId, lang);
      // Reload sessions list
      api.getConversations().then(setSessions).catch(() => {});
      
      const assistantMsg: Message = {
        role: "assistant",
        content: data.response,
        metadata: {
          execution_trace: data.execution_trace,
        },
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      const assistantMsg: Message = {
        role: "assistant",
        content: `Error: ${err.message || "Failed to contact SATYA AI service"}`,
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } finally {
      setLoading(false);
    }
  };

  const toggleRecording = () => {
    if (!recognitionRef.current) {
      alert("Voice input is not supported in this browser. Please use Chrome or Safari.");
      return;
    }

    if (recording) {
      recognitionRef.current.stop();
    } else {
      // Map lang parameter to Web Speech recognition locale
      const localeMap = { en: "en-US", ta: "ta-IN", hi: "hi-IN" };
      recognitionRef.current.lang = localeMap[lang] || "en-US";
      recognitionRef.current.start();
      setRecording(true);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <div className="flex-grow flex max-w-7xl w-full mx-auto px-4 py-6 sm:px-6 lg:px-8 gap-6 h-[calc(100vh-140px)]">
        {/* Sidebar: Conversation Sessions */}
        <aside className="w-64 bg-white rounded-2xl border border-border p-4 flex flex-col justify-between hidden md:flex shadow-sm">
          <div className="space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <span className="font-bold text-sm text-gray-900">Conversations</span>
              <button
                onClick={() => {
                  setMessages([]);
                  setCurrentSessionId(Math.random().toString(36).substring(7));
                }}
                className="text-xs font-bold text-primary hover:underline"
              >
                + New Chat
              </button>
            </div>
            
            <div className="space-y-1.5 overflow-y-auto max-h-[50vh]">
              {sessions.map((s) => (
                <button
                  key={s.id}
                  onClick={() => loadSession(s.session_id)}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold truncate transition-colors ${
                    currentSessionId === s.session_id
                      ? "bg-primary/10 text-primary"
                      : "text-gray-600 hover:bg-slate-50"
                  }`}
                >
                  {s.title}
                </button>
              ))}
            </div>
          </div>
          
          <div className="text-[10px] text-gray-400 bg-slate-50 p-3 rounded-xl border border-slate-200">
            Voice translation matches language selector (English, Tamil, Hindi).
          </div>
        </aside>

        {/* Chat Area */}
        <section className="flex-grow flex flex-col bg-white rounded-2xl border border-border shadow-sm overflow-hidden relative">
          
          {/* Header */}
          <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <div className="flex items-center gap-2">
              <span className="h-8 w-8 flex items-center justify-center rounded-lg bg-primary text-white font-extrabold text-sm shadow-glow">
                S
              </span>
              <div>
                <h2 className="font-bold text-sm text-gray-900">SATYA AI Business Advisor</h2>
                <p className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  Ready to translate voice/text
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Ask for feasibility or funding</span>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-grow overflow-y-auto p-6 space-y-6">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col justify-center items-center text-center space-y-4 max-w-md mx-auto">
                <span className="h-16 w-16 flex items-center justify-center rounded-2xl bg-primary/10 text-primary font-black text-2xl animate-bounce">
                  S
                </span>
                <h3 className="font-black text-lg text-gray-900">Start Your AI Business Dialogue</h3>
                <p className="text-xs text-gray-500">
                  Example: &quot;I have ₹2 lakh and want to start a small food-processing business in Salem. What government support can I get?&quot;
                </p>
              </div>
            ) : (
              messages.map((m, idx) => (
                <div
                  key={idx}
                  className={`flex flex-col gap-2 max-w-[85%] ${
                    m.role === "user" ? "ml-auto items-end" : "mr-auto items-start"
                  }`}
                >
                  {/* Bubble */}
                  <div
                    className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                      m.role === "user"
                        ? "bg-primary text-white rounded-br-none shadow-glow font-medium"
                        : "bg-slate-100 text-gray-950 rounded-bl-none border border-slate-200"
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{m.content}</p>
                  </div>

                  {/* AI execution trace banner */}
                  {m.role === "assistant" && m.metadata?.execution_trace && (
                    <div className="w-full">
                      <button
                        onClick={() => setTraceOpen(traceOpen === idx ? null : idx)}
                        className="text-[10px] text-gray-500 hover:text-primary font-bold flex items-center gap-1.5 cursor-pointer mt-1"
                      >
                        <Cpu className="w-3.5 h-3.5" />
                        <span>How SATYA analyzed this query</span>
                      </button>

                      {traceOpen === idx && (
                        <div className="mt-2 p-4 rounded-xl border border-slate-200 bg-slate-50 text-[11px] space-y-2 animate-fade-in max-w-lg">
                          <div className="flex justify-between border-b border-slate-200 pb-1.5 mb-1.5 font-bold text-gray-700">
                            <span>Intent: {m.metadata.execution_trace.intent}</span>
                            <span>Confidence: {m.metadata.execution_trace.confidence * 100}%</span>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-2 text-gray-600">
                            <div>
                              <span className="font-semibold text-gray-800">Agents Activated:</span>
                              <ul className="list-disc pl-4 mt-0.5 space-y-0.5">
                                {m.metadata.execution_trace.agents_used.map((a, i) => (
                                  <li key={i}>{a}</li>
                                ))}
                              </ul>
                            </div>
                            <div>
                              <span className="font-semibold text-gray-800">Data Sources consulted:</span>
                              <ul className="list-disc pl-4 mt-0.5 space-y-0.5">
                                {m.metadata.execution_trace.data_sources.map((s, i) => (
                                  <li key={i}>{s}</li>
                                ))}
                              </ul>
                            </div>
                          </div>

                          <div className="text-[10px] text-gray-500 bg-amber-50/50 border border-amber-100 p-2 rounded-lg flex items-center gap-1.5 mt-2">
                            <Database className="w-3.5 h-3.5 text-amber-600" />
                            <span>RAG Vector pipeline successfully matched verified scheme documents.</span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))
            )}

            {loading && (
              <div className="flex gap-2 items-center text-xs text-gray-500">
                <Loader2 className="w-4 h-4 animate-spin text-primary" />
                <span>SATYA is structuring your response...</span>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Form */}
          <form onSubmit={handleSend} className="p-4 border-t border-slate-100 bg-slate-50/30 flex gap-2">
            <button
              type="button"
              onClick={toggleRecording}
              className={`p-3 rounded-xl border transition-all ${
                recording
                  ? "bg-red-500 border-red-600 text-white animate-pulse"
                  : "bg-white border-border text-gray-600 hover:text-primary hover:bg-slate-50"
              }`}
              title="Voice Input"
            >
              {recording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>

            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything or use voice input..."
              className="flex-grow px-4 py-2.5 rounded-xl border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />

            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="p-3 bg-primary hover:bg-primary-hover text-white rounded-xl shadow-glow transition-all disabled:opacity-50 disabled:shadow-none"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>

        </section>
      </div>

      <Footer />
    </div>
  );
}
