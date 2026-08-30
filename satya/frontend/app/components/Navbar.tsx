"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api, getLanguage, setLanguage, logout, getUserRole, getUserName } from "../api";
import { translations, Language } from "../translations";
import { Globe, Bell, User as UserIcon, LogOut, Menu, X, Shield, MessageSquare, Briefcase } from "lucide-react";

export default function Navbar() {
  const [lang, setLang] = useState<Language>("en");
  const [role, setRole] = useState<string | null>(null);
  const [name, setName] = useState<string | null>(null);
  const [unreadNotifs, setUnreadNotifs] = useState(0);
  const [notifsOpen, setNotifsOpen] = useState(false);
  const [notifs, setNotifs] = useState<any[]>([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const t = translations[lang];

  useEffect(() => {
    setLang(getLanguage());
    setRole(getUserRole());
    setName(getUserName());

    const handleLangChange = () => setLang(getLanguage());
    window.addEventListener("languageChanged", handleLangChange);

    // Fetch unread notifications
    if (localStorage.getItem("satya_token")) {
      api.getNotifications(true)
        .then((data) => {
          setUnreadNotifs(data.length);
          setNotifs(data);
        })
        .catch(() => {});
    }

    return () => window.removeEventListener("languageChanged", handleLangChange);
  }, []);

  const changeLang = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = e.target.value as Language;
    setLanguage(selected);
    setLang(selected);
  };

  const handleMarkAllRead = async () => {
    try {
      await api.markAllNotificationsRead();
      setUnreadNotifs(0);
      setNotifs([]);
    } catch (e) {}
  };

  return (
    <header className="sticky top-0 z-40 w-full glass-panel shadow-premium border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <Link href="/dashboard" className="flex items-center gap-2">
              <span className="h-10 w-10 flex items-center justify-center rounded-xl bg-primary text-white font-bold text-xl shadow-glow">
                S
              </span>
              <div>
                <span className="font-bold text-xl tracking-tight text-primary">
                  {t.appName}
                </span>
                <p className="text-[10px] text-gray-500 hidden sm:block">
                  {t.appSubtitle}
                </p>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-5 overflow-x-auto">
            <Link href="/customer" className="text-emerald-600 hover:text-emerald-700 font-bold text-sm bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
              Customer Portal
            </Link>
            <Link href="/dashboard" className="text-gray-700 hover:text-primary font-medium text-sm">
              {t.dashboard}
            </Link>
            <Link href="/chat" className="text-gray-700 hover:text-primary font-medium text-sm flex items-center gap-1">
              <MessageSquare className="w-4 h-4" />
              {t.askSatya}
            </Link>
            <Link href="/business" className="text-gray-700 hover:text-primary font-medium text-sm flex items-center gap-1">
              <Briefcase className="w-4 h-4" />
              {t.createPlan}
            </Link>
            <Link href="/marketing" className="text-gray-700 hover:text-primary font-medium text-sm">
              Marketing AI
            </Link>
            <Link href="/promotions" className="text-gray-700 hover:text-primary font-medium text-sm">
              Promotions
            </Link>
            <Link href="/card" className="text-gray-700 hover:text-primary font-medium text-sm">
              Digital Card
            </Link>
            <Link href="/voice" className="text-gray-700 hover:text-primary font-medium text-sm">
              Voice Helpline
            </Link>
            <Link href="/financial" className="text-gray-700 hover:text-primary font-medium text-sm">
              {t.financialPlanner}
            </Link>
            <Link href="/schemes" className="text-gray-700 hover:text-primary font-medium text-sm">
              {t.govSchemes}
            </Link>
            <Link href="/network" className="text-gray-700 hover:text-primary font-medium text-sm">
              {t.peopleNetwork}
            </Link>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-4">
            {/* Language Selector */}
            <div className="flex items-center gap-1.5 text-gray-600 bg-white/80 border border-border rounded-lg px-2 py-1.5 shadow-sm">
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

            {/* Notification Bell */}
            {role && (
              <div className="relative">
                <button
                  onClick={() => setNotifsOpen(!notifsOpen)}
                  className="p-2 rounded-lg text-gray-600 hover:text-primary hover:bg-slate-100 transition-colors relative"
                >
                  <Bell className="w-5 h-5" />
                  {unreadNotifs > 0 && (
                    <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"></span>
                  )}
                </button>

                {notifsOpen && (
                  <div className="absolute right-0 mt-2 w-80 rounded-xl bg-white shadow-lg ring-1 ring-black/5 p-4 z-50 animate-fade-in border border-border">
                    <div className="flex justify-between items-center mb-3">
                      <span className="font-semibold text-sm text-gray-900">Notifications</span>
                      {unreadNotifs > 0 && (
                        <button
                          onClick={handleMarkAllRead}
                          className="text-xs text-primary hover:underline font-medium"
                        >
                          Mark all read
                        </button>
                      )}
                    </div>
                    <div className="space-y-3 max-h-60 overflow-y-auto">
                      {notifs.length === 0 ? (
                        <p className="text-xs text-gray-500 text-center py-4">No new notifications</p>
                      ) : (
                        notifs.map((n) => (
                          <div key={n.id} className="text-xs border-b border-slate-100 pb-2">
                            <h4 className="font-semibold text-gray-800">{n.title}</h4>
                            <p className="text-gray-600 mt-0.5">{n.content}</p>
                            <span className="text-[10px] text-gray-400 mt-1 block">
                              {new Date(n.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* User Details & Action */}
            {role ? (
              <div className="hidden sm:flex items-center gap-3">
                <div className="text-right">
                  <p className="text-xs font-semibold text-gray-900">{name || "User"}</p>
                  <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary font-bold uppercase tracking-wider">
                    {role}
                  </span>
                </div>

                {role === "admin" && (
                  <Link
                    href="/admin"
                    className="p-2 rounded-lg text-gray-600 hover:text-primary hover:bg-slate-100 transition-colors"
                    title="Admin Dashboard"
                  >
                    <Shield className="w-5 h-5" />
                  </Link>
                )}

                <button
                  onClick={logout}
                  className="p-2 rounded-lg text-gray-600 hover:text-red-600 hover:bg-red-50 transition-colors"
                  title={t.logout}
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <Link
                  href="/login"
                  className="px-3.5 py-1.5 text-xs font-semibold text-gray-700 hover:text-primary transition-colors"
                >
                  {t.login}
                </Link>
                <Link
                  href="/register"
                  className="px-3.5 py-1.5 text-xs font-semibold bg-primary hover:bg-primary-hover text-white rounded-lg transition-all shadow-glow"
                >
                  {t.register}
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-slate-100 focus:outline-none"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-white px-4 pt-2 pb-4 space-y-2 animate-fade-in shadow-lg">
          <Link
            href="/dashboard"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-semibold text-gray-700 hover:bg-slate-50 hover:text-primary"
          >
            {t.dashboard}
          </Link>
          <Link
            href="/chat"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-semibold text-gray-700 hover:bg-slate-50 hover:text-primary"
          >
            {t.askSatya}
          </Link>
          <Link
            href="/business"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-semibold text-gray-700 hover:bg-slate-50 hover:text-primary"
          >
            {t.createPlan}
          </Link>
          <Link
            href="/financial"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-semibold text-gray-700 hover:bg-slate-50 hover:text-primary"
          >
            {t.financialPlanner}
          </Link>
          <Link
            href="/schemes"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-semibold text-gray-700 hover:bg-slate-50 hover:text-primary"
          >
            {t.govSchemes}
          </Link>
          <Link
            href="/market"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-semibold text-gray-700 hover:bg-slate-50 hover:text-primary"
          >
            {t.localMarket}
          </Link>
          <Link
            href="/network"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-semibold text-gray-700 hover:bg-slate-50 hover:text-primary"
          >
            {t.peopleNetwork}
          </Link>

          {role ? (
            <div className="pt-4 border-t border-slate-100 flex flex-col gap-2">
              <div className="px-3 py-1">
                <p className="text-sm font-semibold text-gray-900">{name}</p>
                <span className="text-[10px] font-bold text-primary uppercase">{role}</span>
              </div>
              {role === "admin" && (
                <Link
                  href="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-700 hover:bg-slate-50"
                >
                  <Shield className="w-5 h-5" /> Admin Panel
                </Link>
              )}
              <button
                onClick={() => {
                  logout();
                  setMobileMenuOpen(false);
                }}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-red-600 hover:bg-red-50 text-left w-full"
              >
                <LogOut className="w-5 h-5" /> {t.logout}
              </button>
            </div>
          ) : (
            <div className="pt-4 border-t border-slate-100 flex flex-col gap-2">
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-center px-4 py-2 border border-border rounded-lg font-semibold text-gray-700"
              >
                {t.login}
              </Link>
              <Link
                href="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-center px-4 py-2 bg-primary text-white rounded-lg font-semibold"
              >
                {t.register}
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
