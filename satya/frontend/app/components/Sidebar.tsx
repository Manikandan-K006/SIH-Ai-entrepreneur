"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  ShoppingBag, 
  Sparkles, 
  Briefcase, 
  TrendingUp, 
  QrCode, 
  PhoneCall, 
  Home, 
  MessageSquare, 
  Search, 
  DollarSign, 
  BookOpen, 
  Users, 
  PackageCheck,
  Tag,
  Sprout,
  Calculator,
  Smile
} from "lucide-react";

export default function Sidebar() {
  const pathname = usePathname();

  const navItems = [
    { label: "Customer Portal", href: "/customer", icon: Search, highlight: true },
    { label: "Farmer / Agri Hub", href: "/farmer", icon: Sprout, highlight: true },
    { label: "Funding Gap & Loans", href: "/funding-gap", icon: Calculator, highlight: true },
    { label: "Easy / Simplified Mode", href: "/simplified", icon: Smile, highlight: true },
    { label: "Dashboard", href: "/dashboard", icon: Home },
    { label: "SATYA AI Chat", href: "/chat", icon: MessageSquare },
    { label: "Business Plan", href: "/business", icon: Briefcase },
    { label: "Products Catalog", href: "/products", icon: Tag },
    { label: "Customer Orders", href: "/orders", icon: PackageCheck },
    { label: "AI Marketing", href: "/marketing", icon: Sparkles },
    { label: "Paid Promotions", href: "/promotions", icon: TrendingUp },
    { label: "Digital Card", href: "/card", icon: QrCode },
    { label: "Voice Helpline", href: "/voice", icon: PhoneCall },
    { label: "Financial AI", href: "/financial", icon: DollarSign },
    { label: "Govt Schemes", href: "/schemes", icon: BookOpen },
    { label: "People Network", href: "/network", icon: Users },
  ];

  return (
    <aside className="w-64 bg-slate-950 border-r border-slate-800 hidden lg:flex flex-col justify-between p-4 space-y-4 shrink-0">
      <div className="space-y-4">
        {/* Brand */}
        <div className="flex items-center gap-2.5 px-3 py-2">
          <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white font-extrabold flex items-center justify-center text-lg shadow-lg">
            S
          </div>
          <div>
            <span className="font-extrabold text-lg tracking-tight text-white block leading-none">SATYA</span>
            <span className="text-[10px] text-emerald-400 font-semibold uppercase tracking-wider">AI Rural Ecosystem</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="space-y-1 text-xs">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium transition-all ${
                  isActive
                    ? "bg-emerald-600 text-white font-bold shadow-md"
                    : item.highlight
                    ? "bg-emerald-950/60 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-900/60 font-semibold"
                    : "text-slate-300 hover:bg-slate-900 hover:text-white"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-white" : item.highlight ? "text-emerald-400" : "text-slate-400"}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer info */}
      <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl text-[10px] text-slate-400 space-y-1">
        <div className="font-bold text-slate-300">SIH26091 AI Assistant</div>
        <div className="text-emerald-400">Ver 1.0.0 • Connected</div>
      </div>
    </aside>
  );
}
