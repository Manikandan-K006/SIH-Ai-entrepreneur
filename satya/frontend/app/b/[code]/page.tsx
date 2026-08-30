"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Phone, MapPin, ShieldCheck, Share2, ShoppingBag, CheckCircle, MessageSquare, QrCode } from "lucide-react";
import { api } from "../../api";

export default function PublicBusinessCardPage() {
  const params = useParams();
  const code = params?.code as string;
  const [card, setCard] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (code) {
      loadCard(code);
    }
  }, [code]);

  const loadCard = async (shareCode: string) => {
    try {
      const data = await api.getPublicDigitalCard(shareCode);
      setCard(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: card?.business_name || "SATYA Digital Business Card",
        url: window.location.href
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400 font-sans">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  if (!card) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center font-sans">
        <h2 className="text-xl font-bold text-white mb-2">Digital Business Card Not Found</h2>
        <p className="text-slate-400 text-sm max-w-sm mb-4">
          The requested share code may be invalid or expired.
        </p>
        <a href="/" className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-lg text-sm">
          Return to SATYA Portal
        </a>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col items-center p-4 sm:p-6">
      <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl space-y-6 pb-6 my-auto">
        {/* Card Header & Banner */}
        <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 p-6 pt-8 relative border-b border-emerald-500/20 text-center">
          <button
            onClick={handleShare}
            className="absolute top-4 right-4 p-2 bg-slate-800/80 hover:bg-slate-700 text-slate-200 rounded-full border border-slate-700 shadow-md"
            title="Share Business Card"
          >
            <Share2 className="w-4 h-4" />
          </button>

          <div className="w-20 h-20 mx-auto rounded-full bg-slate-800 border-2 border-emerald-500 flex items-center justify-center text-2xl font-bold text-emerald-400 shadow-xl mb-3">
            {card.business_name ? card.business_name.charAt(0) : "B"}
          </div>

          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2.5 py-0.5 rounded-full">
              {card.category || "Rural Enterprise"}
            </span>
            <h1 className="text-2xl font-extrabold text-white">{card.business_name}</h1>
            <p className="text-xs text-slate-300">By {card.owner_name}</p>
          </div>

          {card.verification_status === "document_verified" && (
            <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-semibold rounded-full">
              <ShieldCheck className="w-3.5 h-3.5" /> SATYA Verified Micro-Enterprise
            </div>
          )}
        </div>

        {/* Contact Quick Buttons */}
        <div className="px-6 grid grid-cols-2 gap-3">
          {card.phone && (
            <a
              href={`tel:${card.phone}`}
              className="py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg transition-colors"
            >
              <Phone className="w-4 h-4" /> Call Owner
            </a>
          )}
          {card.phone && (
            <a
              href={`https://wa.me/${card.phone.replace(/[^0-9]/g, "")}?text=Hello%20${encodeURIComponent(card.owner_name)},%20I%20saw%20your%20SATYA%20digital%20business%20card!`}
              target="_blank"
              rel="noreferrer"
              className="py-3 px-4 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg transition-colors"
            >
              <MessageSquare className="w-4 h-4" /> WhatsApp
            </a>
          )}
        </div>

        {/* Business Description & Location */}
        <div className="px-6 space-y-3 text-xs">
          <div className="bg-slate-800/60 border border-slate-700/50 p-4 rounded-xl space-y-2">
            <h3 className="font-bold text-slate-200 uppercase tracking-wider text-[11px]">About Business</h3>
            <p className="text-slate-300 leading-relaxed">{card.description || "No description provided."}</p>
            <div className="flex items-center gap-1 text-slate-400 pt-1">
              <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>{card.location || "Rural India"}</span>
            </div>
          </div>
        </div>

        {/* Products Showcase */}
        {card.products && card.products.length > 0 && (
          <div className="px-6 space-y-3">
            <h3 className="font-bold text-white text-sm flex items-center justify-between">
              <span>Products & Items ({card.products.length})</span>
              <ShoppingBag className="w-4 h-4 text-emerald-400" />
            </h3>
            <div className="space-y-2">
              {card.products.map((p: any) => (
                <div key={p.id} className="p-3 bg-slate-800/80 border border-slate-700/60 rounded-xl flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-white text-xs">{p.name}</h4>
                    <p className="text-[11px] text-slate-400 leading-tight">{p.description}</p>
                  </div>
                  <div className="text-right shrink-0 ml-3">
                    <span className="font-extrabold text-emerald-300 text-xs">₹{p.price}</span>
                    <span className="block text-[10px] text-slate-400">/{p.unit}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Dynamic QR Code Simulation */}
        <div className="px-6 pt-2">
          <div className="p-4 bg-slate-800/40 border border-slate-700/50 rounded-xl text-center space-y-2">
            <div className="flex items-center justify-center gap-2 text-slate-300 font-semibold text-xs">
              <QrCode className="w-4 h-4 text-emerald-400" /> Digital Card QR Code
            </div>
            <div className="w-32 h-32 mx-auto bg-white p-2 rounded-xl flex items-center justify-center shadow-md">
              {/* SVG QR Code Simulation */}
              <svg className="w-full h-full text-slate-900" viewBox="0 0 24 24" fill="currentColor">
                <path d="M2 2h8v8H2V2zm2 2v4h4V4H4zm8-2h8v8h-8V2zm2 2v4h4V4h-4zM2 14h8v8H2v-8zm2 2v4h4v-4H4zm11 0h2v2h-2v-2zm-3-2h2v2h-2v-2zm5 4h2v2h-2v-2zm-2 2h2v2h-2v-2zm2-4h2v2h-2v-2zm-5 2h2v2h-2v-2z" />
              </svg>
            </div>
            <p className="text-[10px] text-slate-400">Scan to share via WhatsApp or Save Contact</p>
          </div>
        </div>

        {copied && (
          <div className="mx-6 p-2 bg-emerald-900/80 border border-emerald-500 text-emerald-200 text-center text-xs rounded-lg flex items-center justify-center gap-1">
            <CheckCircle className="w-3.5 h-3.5" /> Link copied to clipboard!
          </div>
        )}

        {/* Footer */}
        <div className="text-center pt-2 text-[10px] text-slate-500">
          Powered by <span className="font-bold text-emerald-400">SATYA AI</span> Rural Entrepreneurship Platform
        </div>
      </div>
    </div>
  );
}
