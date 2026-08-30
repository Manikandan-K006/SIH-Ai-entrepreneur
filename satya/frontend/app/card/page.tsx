"use client";

import { useEffect, useState } from "react";
import { Share2, ShieldCheck, QrCode, Copy, CheckCircle, ExternalLink, Phone, MapPin } from "lucide-react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import { api } from "../api";

export default function DigitalCardHubPage() {
  const [card, setCard] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    loadCard();
  }, []);

  const loadCard = async () => {
    try {
      const data = await api.getMyDigitalCard();
      setCard(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    const fullUrl = `${window.location.origin}${card?.shareable_url}`;
    navigator.clipboard.writeText(fullUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-slate-900 text-slate-100 overflow-hidden font-sans">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <Header />
          <div className="p-8 text-center text-slate-400">Loading digital business card...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-900 text-slate-100 overflow-hidden font-sans">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <Header />

        <main className="p-6 max-w-7xl mx-auto w-full space-y-6">
          <div className="bg-slate-800/80 border border-slate-700/60 p-6 rounded-2xl">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Public Micro-Business Identity</span>
            <h1 className="text-2xl font-extrabold text-white">Digital Business Card & Shareable QR Code</h1>
            <p className="text-xs text-slate-400 mt-1">Share your verified business profile, products, location, and contact information with customers via WhatsApp or QR Code.</p>
          </div>

          {card && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Live Preview Card */}
              <div className="bg-slate-800/80 border border-slate-700/60 rounded-2xl p-6 space-y-5 shadow-xl">
                <div className="flex items-center justify-between border-b border-slate-700 pb-3">
                  <h3 className="font-bold text-white text-base">Card Live Preview</h3>
                  {card.verification_status === "document_verified" && (
                    <span className="px-2.5 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold rounded-full flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" /> Verified Business
                    </span>
                  )}
                </div>

                <div className="p-5 bg-gradient-to-br from-slate-900 via-slate-850 to-slate-900 border border-slate-700 rounded-xl space-y-4">
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider">
                      {card.category || "Food Processing"}
                    </span>
                    <h2 className="text-xl font-extrabold text-white">{card.business_name}</h2>
                    <p className="text-xs text-slate-300">Owner: {card.owner_name}</p>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">{card.description}</p>

                  <div className="space-y-1 text-xs text-slate-400">
                    <div className="flex items-center gap-1.5 text-slate-300">
                      <Phone className="w-3.5 h-3.5 text-emerald-400" /> {card.phone}
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-300">
                      <MapPin className="w-3.5 h-3.5 text-emerald-400" /> {card.village_town}, {card.district}, {card.state}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={handleCopy}
                    className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg"
                  >
                    {copied ? <CheckCircle className="w-4 h-4 text-white" /> : <Copy className="w-4 h-4" />}
                    {copied ? "Link Copied!" : "Copy Shareable Link"}
                  </button>
                  <a
                    href={card.shareable_url}
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2.5 bg-slate-700 hover:bg-slate-600 text-slate-200 font-semibold rounded-xl text-xs flex items-center gap-1.5"
                  >
                    <ExternalLink className="w-4 h-4" /> Open Page
                  </a>
                </div>
              </div>

              {/* QR Code & Share Options */}
              <div className="bg-slate-800/80 border border-slate-700/60 rounded-2xl p-6 space-y-5 flex flex-col justify-between">
                <div className="space-y-4">
                  <h3 className="font-bold text-white text-base flex items-center gap-2">
                    <QrCode className="w-4 h-4 text-emerald-400" /> QR Code for Print & Displays
                  </h3>

                  <div className="p-6 bg-white rounded-2xl w-48 h-48 mx-auto flex items-center justify-center shadow-2xl">
                    {/* SVG QR Code */}
                    <svg className="w-full h-full text-slate-900" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M2 2h8v8H2V2zm2 2v4h4V4H4zm8-2h8v8h-8V2zm2 2v4h4V4h-4zM2 14h8v8H2v-8zm2 2v4h4v-4H4zm11 0h2v2h-2v-2zm-3-2h2v2h-2v-2zm5 4h2v2h-2v-2zm-2 2h2v2h-2v-2zm2-4h2v2h-2v-2zm-5 2h2v2h-2v-2z" />
                    </svg>
                  </div>

                  <p className="text-xs text-slate-400 text-center max-w-xs mx-auto">
                    Customers can scan this QR code using any smartphone camera or WhatsApp to instantly view your products and contact you.
                  </p>
                </div>

                <div className="p-4 bg-slate-900/60 border border-slate-700/50 rounded-xl space-y-2 text-xs">
                  <div className="font-bold text-slate-200">Shareable URL:</div>
                  <code className="block bg-slate-950 p-2 rounded text-emerald-300 overflow-x-auto text-[11px]">
                    {typeof window !== "undefined" ? `${window.location.origin}${card.shareable_url}` : card.shareable_url}
                  </code>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
