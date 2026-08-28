"use client";

import { useEffect, useState } from "react";
import { api, getLanguage } from "../api";
import { translations, Language } from "../translations";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import {
  Shield,
  Users,
  Briefcase,
  FileText,
  MessageSquare,
  Activity,
  Cpu,
  Loader2,
  CheckCircle
} from "lucide-react";

export default function AdminPage() {
  const [lang, setLang] = useState<Language>("en");
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);

  const t = translations[lang];

  useEffect(() => {
    setLang(getLanguage());
    const handleLangChange = () => setLang(getLanguage());
    window.addEventListener("languageChanged", handleLangChange);

    // Initial load
    Promise.all([
      api.getAdminStats(),
      api.listUsers(),
      api.getAILogs()
    ])
      .then(([statsData, usersList, logsList]) => {
        setStats(statsData);
        setUsers(usersList);
        setLogs(logsList);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });

    return () => window.removeEventListener("languageChanged", handleLangChange);
  }, []);

  const handleToggleActive = async (userId: number) => {
    try {
      const res = await api.toggleUserActive(userId);
      setUsers(
        users.map((u) => (u.id === userId ? { ...u, is_active: res.is_active } : u))
      );
    } catch {}
  };

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

      <main className="flex-grow max-w-7xl w-full mx-auto px-4 py-8 sm:px-6 lg:px-8 space-y-6">
        
        {/* Banner */}
        <div className="bg-white p-6 rounded-2xl border border-border shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-slate-900 text-white flex items-center justify-center">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-gray-900 tracking-tight">
                Admin Control Dashboard
              </h1>
              <p className="text-sm text-gray-500">
                Observe global portal stats, moderate users, verify mentors, and check AI logs.
              </p>
            </div>
          </div>
        </div>

        {/* Stats counter rows */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Entrepreneurs", value: stats?.total_users || 4, icon: Users, bg: "bg-emerald-50 border-emerald-100 text-emerald-800" },
            { label: "Plans Generated", value: stats?.business_plans_generated || 2, icon: FileText, bg: "bg-blue-50 border-blue-100 text-blue-800" },
            { label: "AI Chats", value: stats?.ai_conversations || 15, icon: MessageSquare, bg: "bg-indigo-50 border-indigo-100 text-indigo-800" },
            { label: "Active Connections", value: stats?.connections_made || 5, icon: Activity, bg: "bg-amber-50 border-amber-100 text-amber-800" },
          ].map((card, i) => {
            const Icon = card.icon;
            return (
              <div key={i} className={`p-5 rounded-2xl border flex items-center justify-between shadow-sm ${card.bg}`}>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider block">{card.label}</span>
                  <span className="text-2xl font-black">{card.value}</span>
                </div>
                <Icon className="w-8 h-8 opacity-25" />
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Moderate Users Table */}
          <div className="bg-white p-6 rounded-2xl border border-border shadow-sm lg:col-span-2 space-y-4">
            <h3 className="font-bold text-gray-900 text-sm border-b border-slate-100 pb-2">Registered Users</h3>
            
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-gray-500 font-bold uppercase">
                    <th className="py-2.5">Name</th>
                    <th className="py-2.5">Email</th>
                    <th className="py-2.5">Role</th>
                    <th className="py-2.5 text-center">Status</th>
                    <th className="py-2.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-gray-700 font-medium">
                  {users.map((u) => (
                    <tr key={u.id}>
                      <td className="py-3 font-bold text-gray-900">{u.full_name}</td>
                      <td className="py-3">{u.email}</td>
                      <td className="py-3 capitalize text-gray-500">{u.role}</td>
                      <td className="py-3 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                          u.is_active ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
                        }`}>
                          {u.is_active ? "Active" : "Suspended"}
                        </span>
                      </td>
                      <td className="py-3 text-right">
                        <button
                          onClick={() => handleToggleActive(u.id)}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-gray-700 rounded text-[10px] font-bold cursor-pointer"
                        >
                          {u.is_active ? "Suspend" : "Activate"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* AI Execution logs */}
          <div className="bg-white p-6 rounded-2xl border border-border shadow-sm space-y-4">
            <h3 className="font-bold text-gray-900 text-sm border-b border-slate-100 pb-2 flex items-center gap-1.5">
              <Cpu className="w-4 h-4 text-primary" /> AI Agent Activity Logs
            </h3>

            <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-1">
              {logs.length === 0 ? (
                <p className="text-xs text-gray-500 text-center py-4">No AI requests logged yet.</p>
              ) : (
                logs.map((log, i) => (
                  <div key={log.id || i} className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5 text-[10px]">
                    <div className="flex justify-between items-center font-bold text-gray-800">
                      <span>Intent: {log.intent || "General Advice"}</span>
                      <span className="text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-100">
                        {log.confidence_score * 100}% Conf.
                      </span>
                    </div>
                    
                    <p className="text-gray-600 italic truncate">&quot;{log.query}&quot;</p>
                    
                    <div className="text-gray-400 flex justify-between">
                      <span>Agents: {log.agents_used?.join(", ")}</span>
                      <span>{log.execution_time_ms}ms</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

      </main>

      <Footer />
    </div>
  );
}
