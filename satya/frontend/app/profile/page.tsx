"use client";

import { useEffect, useState } from "react";
import { api, getLanguage } from "../api";
import { translations, Language } from "../translations";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { User, Mail, Shield, ShieldCheck, MapPin, Calendar, Loader2 } from "lucide-react";

export default function ProfilePage() {
  const [lang, setLang] = useState<Language>("en");
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const t = translations[lang];

  useEffect(() => {
    setLang(getLanguage());
    const handleLangChange = () => setLang(getLanguage());
    window.addEventListener("languageChanged", handleLangChange);

    Promise.all([api.getMe(), api.getProfile().catch(() => null)])
      .then(([userData, profileData]) => {
        setUser(userData);
        setProfile(profileData);
        setLoading(false);
      })
      .catch(() => setLoading(false));

    return () => window.removeEventListener("languageChanged", handleLangChange);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50 justify-center items-center">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <main className="flex-grow max-w-3xl w-full mx-auto px-4 py-8 sm:px-6 lg:px-8 space-y-6">
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-border shadow-sm space-y-6">
          
          <div className="flex flex-col sm:flex-row items-center gap-4 pb-6 border-b border-slate-100">
            <div className="h-16 w-16 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-2xl">
              {user?.full_name[0]}
            </div>
            <div className="text-center sm:text-left space-y-1">
              <h2 className="text-xl font-black text-gray-900 tracking-tight">{user?.full_name}</h2>
              <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">{user?.role} Account</p>
            </div>
          </div>

          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl border border-slate-200 space-y-1 bg-slate-50/50">
                <span className="text-[10px] font-bold text-gray-400 uppercase block">Email Address</span>
                <p className="font-semibold text-gray-900 flex items-center gap-1.5">
                  <Mail className="w-4 h-4 text-gray-400" /> {user?.email}
                </p>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 space-y-1 bg-slate-50/50">
                <span className="text-[10px] font-bold text-gray-400 uppercase block">State & District</span>
                <p className="font-semibold text-gray-900 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-gray-400" /> {profile?.state || "Tamil Nadu"}, {profile?.district || "Salem"}
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 space-y-1 bg-slate-50/50">
              <span className="text-[10px] font-bold text-gray-400 uppercase block">Registered Since</span>
              <p className="font-semibold text-gray-900 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-gray-400" /> {new Date(user?.created_at).toLocaleDateString()}
              </p>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 space-y-1 bg-slate-50/50">
              <span className="text-[10px] font-bold text-gray-400 uppercase block">Account Verification Status</span>
              <p className="font-semibold text-gray-900 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" /> Verified Demo Profile
              </p>
            </div>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
