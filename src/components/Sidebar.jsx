import React from "react";
import {
  LayoutDashboard,
  TrendingUp,
  Mail,
  PlusCircle,
  Settings,
  HelpCircle,
  Flame,
  Bot,
} from "lucide-react";

import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export default function Sidebar({ currentView, onViewChange }) {
  const navItems = [
    { id: "campaign", label: "New Campaign", icon: PlusCircle },
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "trends", label: "Trends", icon: TrendingUp },
    { id: "activity", label: "Email Activity", icon: Mail },
  ];

  return (
    <div className="w-64 bg-white border-r border-slate-200 h-screen flex flex-col sticky top-0">
      <div className="p-6">
        <div className="flex items-center gap-3 mb-8 group cursor-pointer">
          <div className="relative w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-200 overflow-hidden">
            <div className="absolute inset-0 bg-white/10 group-hover:bg-white/0 transition-colors" />
            <Flame className="w-5 h-5 text-white transform group-hover:scale-110 group-hover:-rotate-12 transition-all duration-300" />
          </div>
          <h1 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-700 to-purple-600 tracking-tight">
            CampX
          </h1>
        </div>

        <nav className="space-y-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-all",
                currentView === item.id
                  ? "bg-indigo-50 text-[#6366F1] shadow-sm"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-900",
              )}
            >
              <item.icon
                className={cn(
                  "w-4 h-4",
                  currentView === item.id ? "text-[#6366F1]" : "text-slate-400",
                )}
              />
              {item.label}
            </button>
          ))}
        </nav>

        {/* AI Copilot Banner */}
        <div className="mt-4">
          <button
            onClick={() =>
              window.dispatchEvent(new CustomEvent("campx:open-copilot"))
            }
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-all bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-700 hover:from-indigo-100 hover:to-purple-100 border border-indigo-100 hover:border-indigo-200 group"
          >
            <Bot className="w-4 h-4 text-indigo-500 group-hover:scale-110 transition-transform" />
            AI Copilot
            <span className="ml-auto text-[9px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded-md">
              NEW
            </span>
          </button>
        </div>
      </div>

      <div className="mt-auto p-6 border-t border-slate-200 space-y-1">
        <button
          onClick={() => onViewChange("settings")}
          className={cn(
            "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-bold transition-all",
            currentView === "settings"
              ? "bg-slate-100 text-slate-900 shadow-sm"
              : "text-slate-500 hover:bg-slate-100 hover:text-slate-900",
          )}
        >
          <Settings className="w-4 h-4 text-slate-400" />
          Settings
        </button>
        <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-bold text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-all">
          <HelpCircle className="w-4 h-4 text-slate-400" />
          Help Center
        </button>
      </div>
    </div>
  );
}
