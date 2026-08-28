"use client";

import { useEffect, useState, useRef } from "react";
import { api, getLanguage } from "../api";
import { translations, Language } from "../translations";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Send, User, MessageSquare, ShieldAlert, Loader2 } from "lucide-react";

export default function MessagesPage() {
  const [lang, setLang] = useState<Language>("en");
  const [connections, setConnections] = useState<any[]>([]);
  const [activeThread, setActiveThread] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const t = translations[lang];

  useEffect(() => {
    setLang(getLanguage());
    const handleLangChange = () => setLang(getLanguage());
    window.addEventListener("languageChanged", handleLangChange);

    // Load active connections
    api.getConnections()
      .then((data) => {
        // Collect accepted connection requests
        const accepted = [
          ...(data.sent || []).filter((c: any) => c.status === "accepted"),
          ...(data.received || []).filter((c: any) => c.status === "accepted"),
        ];

        // Seed some demo messaging contacts if empty
        if (accepted.length === 0) {
          setConnections([
            { id: 1, name: "Meenakshi Krishnan", type: "mentor", user_id: 101 },
            { id: 2, name: "Salem Spice Hub", type: "supplier", user_id: 102 },
            { id: 3, name: "Big Basket Rural", type: "buyer", user_id: 103 },
          ]);
        } else {
          setConnections(
            accepted.map((c: any) => ({
              id: c.id,
              name: c.to_mentor_id ? "Mentor" : c.to_supplier_id ? "Supplier" : "Buyer",
              user_id: c.to_user_id || c.from_user_id,
            }))
          );
        }
      })
      .catch(() => {});

    return () => window.removeEventListener("languageChanged", handleLangChange);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSelectThread = async (conn: any) => {
    setActiveThread(conn);
    setLoading(true);
    try {
      const data = await api.getMessagesWithUser(conn.user_id);
      setMessages(data);
    } catch {
      // Mock some messaging history for demo
      setMessages([
        { id: 1, sender_id: conn.user_id, content: `Hello, thanks for connecting with me! How is your spice business idea shaping up?` },
        { id: 2, sender_id: 0, content: `Hi, I am finalizing my available capital structured at ₹2 lakh.` },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !activeThread) return;

    const newMsg = { id: Date.now(), sender_id: 0, content: input };
    setMessages((prev) => [...prev, newMsg]);
    const text = input;
    setInput("");

    try {
      await api.sendMessageToUser(activeThread.user_id, text);
    } catch {
      // Mock response after 1s
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now() + 1,
            sender_id: activeThread.user_id,
            content: `Great, I will review your structure and let you know. Let's schedule a call!`,
          },
        ]);
      }, 1000);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <div className="flex-grow flex max-w-6xl w-full mx-auto px-4 py-6 sm:px-6 lg:px-8 gap-6 h-[calc(100vh-140px)]">
        {/* Sidebar */}
        <aside className="w-64 bg-white rounded-2xl border border-border p-4 flex flex-col gap-4 shadow-sm">
          <h3 className="font-bold text-gray-900 text-sm border-b border-slate-100 pb-2">Active Chats</h3>
          
          <div className="space-y-1.5 overflow-y-auto">
            {connections.map((c) => (
              <button
                key={c.id}
                onClick={() => handleSelectThread(c)}
                className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition-colors ${
                  activeThread?.id === c.id ? "bg-primary/10 text-primary" : "text-gray-600 hover:bg-slate-50"
                }`}
              >
                <div className="h-7 w-7 rounded-full bg-slate-100 flex items-center justify-center text-gray-500">
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-bold">{c.name}</p>
                  <span className="text-[9px] uppercase text-gray-400 font-bold">{c.type || "connection"}</span>
                </div>
              </button>
            ))}
          </div>
        </aside>

        {/* Messaging Area */}
        <section className="flex-grow flex flex-col bg-white rounded-2xl border border-border shadow-sm overflow-hidden relative">
          {activeThread ? (
            <>
              {/* Header */}
              <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2.5 bg-slate-50/50">
                <div className="h-8 w-8 rounded-full bg-primary/15 text-primary flex items-center justify-center text-sm font-bold">
                  {activeThread.name[0]}
                </div>
                <div>
                  <h2 className="font-bold text-sm text-gray-900">{activeThread.name}</h2>
                  <p className="text-[9px] text-gray-400 font-bold uppercase">{activeThread.type || "active"}</p>
                </div>
              </div>

              {/* Messages Body */}
              <div className="flex-grow overflow-y-auto p-6 space-y-4">
                {messages.map((m) => (
                  <div
                    key={m.id}
                    className={`flex flex-col max-w-[70%] ${
                      m.sender_id === 0 ? "ml-auto items-end" : "mr-auto items-start"
                    }`}
                  >
                    <div
                      className={`px-4 py-2.5 rounded-2xl text-xs leading-relaxed ${
                        m.sender_id === 0
                          ? "bg-primary text-white rounded-br-none"
                          : "bg-slate-100 text-gray-950 rounded-bl-none border border-slate-200"
                      }`}
                    >
                      <p>{m.content}</p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Form */}
              <form onSubmit={handleSend} className="p-4 border-t border-slate-100 bg-slate-50/30 flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={`Send message to ${activeThread.name}...`}
                  className="flex-grow px-4 py-2.5 rounded-xl border border-border bg-white text-xs focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
                <button
                  type="submit"
                  disabled={!input.trim()}
                  className="p-3 bg-primary hover:bg-primary-hover text-white rounded-xl shadow-glow disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </>
          ) : (
            <div className="h-full flex flex-col justify-center items-center text-center space-y-4 max-w-sm mx-auto">
              <MessageSquare className="w-12 h-12 text-slate-300" />
              <h3 className="font-bold text-gray-950">Select a Thread</h3>
              <p className="text-xs text-gray-500">Pick an accepted mentor, supplier or buyer from the sidebar to start chat communication.</p>
            </div>
          )}
        </section>
      </div>

      <Footer />
    </div>
  );
}
