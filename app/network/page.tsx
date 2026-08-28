"use client";

import { useEffect, useState } from "react";
import { api, getLanguage } from "../api";
import { translations, Language } from "../translations";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import {
  Users,
  Award,
  Sparkles,
  MapPin,
  MessageSquare,
  Building,
  DollarSign,
  ShieldCheck,
  CheckCircle,
  HelpCircle,
  Loader2
} from "lucide-react";

export default function NetworkPage() {
  const [lang, setLang] = useState<Language>("en");
  const [activeTab, setActiveTab] = useState<"matches" | "mentors" | "suppliers" | "buyers" | "orgs">("matches");
  const [loading, setLoading] = useState(false);
  const [matches, setMatches] = useState<any>({ mentors: [], suppliers: [], buyers: [] });
  const [mentors, setMentors] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [buyers, setBuyers] = useState<any[]>([]);
  const [orgs, setOrgs] = useState<any[]>([]);

  const t = translations[lang];

  useEffect(() => {
    setLang(getLanguage());
    const handleLangChange = () => setLang(getLanguage());
    window.addEventListener("languageChanged", handleLangChange);

    // Initial load matches
    setLoading(true);
    api.getMatches()
      .then((data) => {
        setMatches(data);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });

    return () => window.removeEventListener("languageChanged", handleLangChange);
  }, []);

  const handleTabChange = async (tab: typeof activeTab) => {
    setActiveTab(tab);
    setLoading(true);
    try {
      if (tab === "mentors") {
        const data = await api.listMentors();
        setMentors(data);
      } else if (tab === "suppliers") {
        const data = await api.listSuppliers();
        setSuppliers(data);
      } else if (tab === "buyers") {
        const data = await api.listBuyers();
        setBuyers(data);
      } else if (tab === "orgs") {
        const data = await api.listOrganizations();
        setOrgs(data);
      }
    } catch {}
    setLoading(false);
  };

  const handleConnect = async (entityType: string, id: number, name: string) => {
    const payload = {
      connection_type: entityType,
      message: `Hello ${name}, I found you on SATYA and would love to connect to discuss my micro-enterprise food business.`,
      to_mentor_id: entityType === "mentor" ? id : undefined,
      to_supplier_id: entityType === "supplier" ? id : undefined,
      to_buyer_id: entityType === "buyer" ? id : undefined,
    };

    try {
      await api.sendConnectionRequest(payload);
      alert(`Connection request sent to ${name} successfully!`);
    } catch {
      alert("Failed to send connection request. Check your session status.");
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 85) return "text-emerald-600 bg-emerald-50 border-emerald-200";
    if (score >= 60) return "text-amber-600 bg-amber-50 border-amber-200";
    return "text-rose-600 bg-rose-50 border-rose-200";
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <main className="flex-grow max-w-6xl w-full mx-auto px-4 py-8 sm:px-6 lg:px-8 space-y-6">
        
        {/* Banner */}
        <div className="bg-white p-6 rounded-2xl border border-border shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
              <Users className="w-6 h-6 text-primary" />
              People Network Directory
            </h1>
            <p className="text-sm text-gray-500">
              Discover verified mentors, local input suppliers, wholesale product buyers, and community SHGs.
            </p>
          </div>
        </div>

        {/* Tabs Bar */}
        <div className="flex border-b border-slate-200 overflow-x-auto gap-2">
          {[
            { id: "matches", label: "AI Matching Matches" },
            { id: "mentors", label: "Mentors Directory" },
            { id: "suppliers", label: "Raw Suppliers" },
            { id: "buyers", label: "Wholesale Buyers" },
            { id: "orgs", label: "SHGs & NGOs" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id as any)}
              className={`px-4 py-2 border-b-2 text-xs font-bold whitespace-nowrap cursor-pointer transition-all ${
                activeTab === tab.id
                  ? "border-primary text-primary"
                  : "border-transparent text-gray-500 hover:text-gray-900"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content render */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-6 animate-fade-in">
            
            {/* AI MATCHES TAB */}
            {activeTab === "matches" && (
              <div className="space-y-6">
                
                {/* Intro block */}
                <div className="bg-white p-6 rounded-2xl border border-border shadow-sm flex gap-3 items-start">
                  <Sparkles className="w-6 h-6 text-amber-500 flex-shrink-0 mt-0.5 animate-pulse" />
                  <div>
                    <h3 className="font-bold text-gray-900 text-sm">How SATYA Matches People</h3>
                    <p className="text-xs text-gray-600 leading-relaxed">
                      Our matching engine compares your business category (Food Processing), location (Salem, TN), and capital parameters against mentor expertise and supplier catalog lists.
                    </p>
                  </div>
                </div>

                {/* Match category rows */}
                <div className="space-y-6">
                  {/* Mentors */}
                  <div className="space-y-3">
                    <h4 className="font-bold text-gray-900 text-sm">Top Mentors for You</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {matches.mentors?.map((m: any) => (
                        <div key={m.id} className="bg-white p-5 rounded-xl border border-border shadow-sm flex justify-between gap-4">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <h5 className="font-bold text-gray-900 text-sm">{m.name}</h5>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getScoreColor(m.match_score)}`}>
                                {m.match_score}% Match
                              </span>
                            </div>
                            <p className="text-xs text-primary font-semibold">{m.explanation}</p>
                            <p className="text-xs text-gray-500 flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5" /> {m.location}
                            </p>
                          </div>
                          <button
                            onClick={() => handleConnect("mentor", m.id, m.name)}
                            className="h-10 self-center px-4 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-lg shadow-sm"
                          >
                            Connect
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Suppliers */}
                  <div className="space-y-3">
                    <h4 className="font-bold text-gray-900 text-sm">Top Suppliers for You</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {matches.suppliers?.map((s: any) => (
                        <div key={s.id} className="bg-white p-5 rounded-xl border border-border shadow-sm flex justify-between gap-4">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <h5 className="font-bold text-gray-900 text-sm">{s.name}</h5>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getScoreColor(s.match_score)}`}>
                                {s.match_score}% Match
                              </span>
                            </div>
                            <p className="text-xs text-primary font-semibold">{s.explanation}</p>
                            <p className="text-xs text-gray-500 flex items-center gap-1">
                              <Building className="w-3.5 h-3.5" /> {s.category} • {s.location}
                            </p>
                          </div>
                          <button
                            onClick={() => handleConnect("supplier", s.id, s.name)}
                            className="h-10 self-center px-4 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-lg shadow-sm"
                          >
                            Connect
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Buyers */}
                  <div className="space-y-3">
                    <h4 className="font-bold text-gray-900 text-sm">Top Buyers for You</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {matches.buyers?.map((b: any) => (
                        <div key={b.id} className="bg-white p-5 rounded-xl border border-border shadow-sm flex justify-between gap-4">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <h5 className="font-bold text-gray-900 text-sm">{b.name}</h5>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getScoreColor(b.match_score)}`}>
                                {b.match_score}% Match
                              </span>
                            </div>
                            <p className="text-xs text-primary font-semibold">{b.explanation}</p>
                            <p className="text-xs text-gray-500 flex items-center gap-1">
                              <Users className="w-3.5 h-3.5" /> {b.buyer_type} • {b.location}
                            </p>
                          </div>
                          <button
                            onClick={() => handleConnect("buyer", b.id, b.name)}
                            className="h-10 self-center px-4 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-lg shadow-sm"
                          >
                            Connect
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* DIRECTORIES TABS */}
            {activeTab === "mentors" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {mentors.map((m) => (
                  <div key={m.id} className="bg-white p-5 rounded-xl border border-border shadow-sm flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between items-start">
                        <h4 className="font-bold text-gray-900 text-sm">{m.name}</h4>
                        {m.is_verified && (
                          <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                            <ShieldCheck className="w-3 h-3" /> Verified Mentor
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-600 leading-relaxed">{m.bio}</p>
                      
                      <div className="text-[10px] text-gray-500 space-y-1">
                        <p><strong>Expertise:</strong> {m.expertise?.join(", ")}</p>
                        <p><strong>Languages:</strong> {m.languages?.join(", ")}</p>
                        <p><strong>Location:</strong> {m.district}, {m.state}</p>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => handleConnect("mentor", m.id, m.name)}
                      className="w-full py-2 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-lg shadow-sm"
                    >
                      Request Mentorship Link
                    </button>
                  </div>
                ))}
              </div>
            )}

            {activeTab === "suppliers" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {suppliers.map((s) => (
                  <div key={s.id} className="bg-white p-5 rounded-xl border border-border shadow-sm flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between items-start">
                        <h4 className="font-bold text-gray-900 text-sm">{s.name}</h4>
                        {s.is_verified && (
                          <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                            <ShieldCheck className="w-3 h-3" /> Verified Supplier
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-600 leading-relaxed">{s.description}</p>
                      
                      <div className="text-[10px] text-gray-500 space-y-1">
                        <p><strong>Products:</strong> {s.products?.join(", ")}</p>
                        <p><strong>Price Range:</strong> {s.price_range}</p>
                        <p><strong>Min Order:</strong> {s.minimum_order}</p>
                        <p><strong>Location:</strong> {s.district}, {s.state}</p>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => handleConnect("supplier", s.id, s.name)}
                      className="w-full py-2 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-lg shadow-sm"
                    >
                      Connect & Request Catalog
                    </button>
                  </div>
                ))}
              </div>
            )}

            {activeTab === "buyers" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {buyers.map((b) => (
                  <div key={b.id} className="bg-white p-5 rounded-xl border border-border shadow-sm flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between items-start">
                        <h4 className="font-bold text-gray-900 text-sm">{b.name}</h4>
                        <span className="text-[9px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full">
                          {b.buyer_type}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600">{b.description}</p>
                      
                      <div className="text-[10px] text-gray-500 space-y-1">
                        <p><strong>Products required:</strong> {b.products_required?.join(", ")}</p>
                        <p><strong>Quantity:</strong> {b.quantity_required} ({b.frequency})</p>
                        <p><strong>Expectation:</strong> {b.price_expectation}</p>
                        <p><strong>Location:</strong> {b.district}, {b.state}</p>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => handleConnect("buyer", b.id, b.name)}
                      className="w-full py-2 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-lg shadow-sm"
                    >
                      Connect & Pitch Products
                    </button>
                  </div>
                ))}
              </div>
            )}

            {activeTab === "orgs" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {orgs.map((o) => (
                  <div key={o.id} className="bg-white p-5 rounded-xl border border-border shadow-sm flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between items-start">
                        <h4 className="font-bold text-gray-900 text-sm">{o.name}</h4>
                        <span className="text-[9px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                          {o.org_type}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600">{o.description}</p>
                      
                      <div className="text-[10px] text-gray-500 space-y-1">
                        <p><strong>Sectors support:</strong> {o.sectors?.join(", ")}</p>
                        <p><strong>Support types:</strong> {o.support_types?.join(", ")}</p>
                        <p><strong>Members involved:</strong> {o.members_count}</p>
                        <p><strong>Location:</strong> {o.district}, {o.state}</p>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => handleConnect("org", o.id, o.name)}
                      className="w-full py-2 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-lg shadow-sm"
                    >
                      Request Group Link
                    </button>
                  </div>
                ))}
              </div>
            )}

          </div>
        )}

      </main>

      <Footer />
    </div>
  );
}
