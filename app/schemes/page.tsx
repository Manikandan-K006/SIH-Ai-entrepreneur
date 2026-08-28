"use client";

import { useEffect, useState } from "react";
import { api, getLanguage } from "../api";
import { translations, Language } from "../translations";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import {
  Search,
  Award,
  BookOpen,
  Calendar,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Building,
  Loader2
} from "lucide-react";

export default function SchemesPage() {
  const [lang, setLang] = useState<Language>("en");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const [state, setState] = useState("");
  const [loading, setLoading] = useState(false);
  const [schemes, setSchemes] = useState<any[]>([]);
  const [searched, setSearched] = useState(false);
  const [selectedScheme, setSelectedScheme] = useState<any>(null);

  const t = translations[lang];

  useEffect(() => {
    setLang(getLanguage());
    const handleLangChange = () => setLang(getLanguage());
    window.addEventListener("languageChanged", handleLangChange);

    // Initial load
    setLoading(true);
    api.listSchemes()
      .then((data) => {
        setSchemes(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));

    return () => window.removeEventListener("languageChanged", handleLangChange);
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setSearched(true);

    try {
      const data = await api.searchSchemes(query, category, state);
      setSchemes(data.schemes_found || []);
    } catch (err: any) {
      alert("RAG search failed. Falling back to database listing.");
      try {
        const list = await api.listSchemes(category, state);
        setSchemes(list);
      } catch {}
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = async (cat: string, st: string) => {
    setCategory(cat);
    setState(st);
    setLoading(true);
    try {
      const data = await api.listSchemes(cat ? cat : undefined, st ? st : undefined);
      setSchemes(data);
    } catch {}
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <main className="flex-grow max-w-6xl w-full mx-auto px-4 py-8 sm:px-6 lg:px-8 space-y-6">
        
        {/* Header Banner */}
        <div className="bg-white p-6 rounded-2xl border border-border shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
              <Award className="w-6 h-6 text-primary" />
              Government Scheme Intelligence & RAG
            </h1>
            <p className="text-sm text-gray-500">
              Search official Central & State schemes. Ground-truth retrieval citing source publications.
            </p>
          </div>
        </div>

        {/* Search Bar Form */}
        <form onSubmit={handleSearch} className="bg-white p-4 rounded-2xl border border-border shadow-sm flex flex-col sm:flex-row gap-3">
          <div className="flex-grow relative">
            <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g. Subsidy for pickle making or loans for women entrepreneurs"
              className="w-full pl-11 pr-4 py-3 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div className="flex gap-2">
            <select
              value={category}
              onChange={(e) => handleFilterChange(e.target.value, state)}
              className="px-4 py-3 rounded-xl border border-border bg-white text-xs font-semibold cursor-pointer focus:outline-none"
            >
              <option value="">All Sectors</option>
              <option value="Food Processing">Food Processing</option>
              <option value="Dairy">Dairy</option>
              <option value="Textile">Textile</option>
              <option value="Agriculture">Agriculture</option>
            </select>

            <select
              value={state}
              onChange={(e) => handleFilterChange(category, e.target.value)}
              className="px-4 py-3 rounded-xl border border-border bg-white text-xs font-semibold cursor-pointer focus:outline-none"
            >
              <option value="">Central & States</option>
              <option value="Tamil Nadu">Tamil Nadu</option>
              <option value="Uttar Pradesh">Uttar Pradesh</option>
            </select>

            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all shadow-glow"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Search RAG"}
            </button>
          </div>
        </form>

        {/* Results grid */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {schemes.length === 0 ? (
              <div className="col-span-2 p-8 text-center bg-white rounded-2xl border border-border text-gray-500 text-xs">
                Information could not be verified from the available official sources. Try adjusting your search keywords.
              </div>
            ) : (
              schemes.map((s, idx) => (
                <div key={s.id || idx} className="bg-white p-6 rounded-2xl border border-border shadow-sm flex flex-col justify-between space-y-4 hover:shadow-md transition-shadow">
                  <div className="space-y-2">
                    <div className="flex justify-between items-start gap-2">
                      <span className="text-[9px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full uppercase">
                        {s.scheme_type || "Scheme"}
                      </span>
                      {s.last_verified ? (
                        <span className="text-[9px] text-gray-400 font-semibold flex items-center gap-1">
                          <Calendar className="w-3 h-3" /> Verified: {s.last_verified}
                        </span>
                      ) : s.last_verified_at ? (
                        <span className="text-[9px] text-gray-400 font-semibold flex items-center gap-1">
                          <Calendar className="w-3 h-3" /> Verified: {new Date(s.last_verified_at).toLocaleDateString()}
                        </span>
                      ) : null}
                    </div>

                    <h3 className="font-extrabold text-gray-900 text-sm leading-snug">{s.name}</h3>
                    <p className="text-xs text-gray-600 line-clamp-3 leading-relaxed">
                      {s.description || s.relevance}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex justify-between items-center text-xs">
                    {s.source && (
                      <span className="text-[10px] text-gray-500 font-medium truncate max-w-[200px]">
                        Source: {s.source}
                      </span>
                    )}
                    <button
                      onClick={() => setSelectedScheme(s)}
                      className="text-primary hover:underline font-bold flex items-center gap-1 cursor-pointer"
                    >
                      View Details <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Detailed Modal */}
        {selectedScheme && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex justify-center items-center p-4 z-50 animate-fade-in">
            <div className="bg-white max-w-2xl w-full rounded-2xl border border-border p-6 sm:p-8 space-y-4 max-h-[85vh] overflow-y-auto shadow-2xl">
              
              <div className="flex justify-between items-start gap-4">
                <div>
                  <span className="text-[9px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full uppercase">
                    {selectedScheme.scheme_type || "Scheme Details"}
                  </span>
                  <h3 className="font-extrabold text-gray-900 text-lg mt-1">{selectedScheme.name}</h3>
                </div>
                <button
                  onClick={() => setSelectedScheme(null)}
                  className="text-xs font-bold text-gray-500 hover:text-gray-900 cursor-pointer"
                >
                  Close ✕
                </button>
              </div>

              <div className="space-y-3 text-xs leading-relaxed text-gray-700">
                <div className="space-y-1">
                  <h4 className="font-bold text-gray-900">Description</h4>
                  <p className="text-gray-600">{selectedScheme.description || selectedScheme.relevance}</p>
                </div>

                <div className="space-y-1">
                  <h4 className="font-bold text-gray-900">Basic Eligibility</h4>
                  <p className="text-gray-600">{selectedScheme.eligibility || selectedScheme.eligibility_summary}</p>
                </div>

                <div className="space-y-1">
                  <h4 className="font-bold text-gray-900">Required Documents</h4>
                  <ul className="list-disc pl-4 space-y-0.5 text-gray-600">
                    {selectedScheme.required_documents?.map((doc: string, i: number) => (
                      <li key={i}>{doc}</li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-1">
                  <h4 className="font-bold text-gray-900">Application Process</h4>
                  <p className="text-gray-600">{selectedScheme.application_process || selectedScheme.application_pointer}</p>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div className="flex items-center gap-1.5 text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Ground truth verified information</span>
                </div>
                {selectedScheme.official_url || selectedScheme.source ? (
                  <a
                    href={selectedScheme.official_url || "#"}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
                  >
                    <span>Visit Official Portal</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                ) : null}
              </div>

            </div>
          </div>
        )}

      </main>

      <Footer />
    </div>
  );
}
