"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api, getLanguage, setLanguage } from "../api";
import { translations, Language } from "../translations";
import { Globe, ShieldAlert, ArrowRight, Loader2 } from "lucide-react";

export default function RegisterPage() {
  const [lang, setLang] = useState<Language>("en");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("entrepreneur");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const t = translations[lang];

  useEffect(() => {
    setLang(getLanguage());
    const handleLangChange = () => setLang(getLanguage());
    window.addEventListener("languageChanged", handleLangChange);
    return () => window.removeEventListener("languageChanged", handleLangChange);
  }, []);

  const changeLang = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = e.target.value as Language;
    setLanguage(selected);
    setLang(selected);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await api.register(email, password, name, role, lang);
      if (role === "entrepreneur") {
        router.push("/onboarding");
      } else {
        router.push("/dashboard");
      }
    } catch (err: any) {
      setError(err.message || "Registration failed. Try a different email.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 px-4 py-12 sm:px-6 lg:px-8">
      {/* Lang Selection Overlay */}
      <div className="absolute top-4 right-4 flex items-center gap-1.5 text-gray-600 bg-white border border-border rounded-lg px-2.5 py-1.5 shadow-sm">
        <Globe className="w-4 h-4 text-primary" />
        <select
          value={lang}
          onChange={changeLang}
          className="bg-transparent text-xs font-semibold focus:outline-none cursor-pointer"
        >
          <option value="en">English</option>
          <option value="ta">தமிழ் (Tamil)</option>
          <option value="hi">हिन्दी (Hindi)</option>
        </select>
      </div>

      <div className="w-full max-w-md space-y-8 glass-panel p-8 rounded-2xl border border-border shadow-premium animate-fade-in bg-white/80">
        <div className="text-center">
          <span className="h-12 w-12 mx-auto flex items-center justify-center rounded-2xl bg-primary text-white font-extrabold text-2xl shadow-glow mb-4">
            S
          </span>
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            {t.register}
          </h2>
          <p className="mt-2 text-sm text-gray-500">
            {t.appSubtitle}
          </p>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-4 bg-red-50 text-red-700 text-xs rounded-xl border border-red-100">
            <ShieldAlert className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form className="mt-8 space-y-4" onSubmit={handleRegister}>
          <div>
            <label htmlFor="name" className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
              {t.fullName}
            </label>
            <input
              id="name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Lakshmi Devi"
              className="w-full px-4 py-2.5 rounded-xl border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
              {t.email}
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@example.com"
              className="w-full px-4 py-2.5 rounded-xl border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
              {t.password}
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="•••••••• (Min. 8 characters)"
              className="w-full px-4 py-2.5 rounded-xl border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>

          <div>
            <label htmlFor="role" className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
              {t.role}
            </label>
            <select
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all cursor-pointer"
            >
              <option value="entrepreneur">{t.entrepreneur}</option>
              <option value="mentor">{t.mentor}</option>
              <option value="supplier">{t.supplier}</option>
              <option value="buyer">{t.buyer}</option>
            </select>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="btn-interactive w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary-hover text-white font-bold py-3 px-4 rounded-xl shadow-glow transition-all disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Registering...
                </>
              ) : (
                <>
                  {t.register}
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </div>
        </form>

        <div className="text-center pt-4 border-t border-slate-100 text-xs">
          <p className="text-gray-500">
            Already have an account?{" "}
            <Link href="/login" className="text-primary hover:underline font-bold">
              {t.login}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
