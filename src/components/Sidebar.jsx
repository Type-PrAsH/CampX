import React from "react";
import {
  LayoutDashboard,
  Calendar,
  BarChart3,
  Users,
  Activity,
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
    { id: "campaign", label: "Campaign Workspace", icon: PlusCircle },
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "schedule", label: "Schedule", icon: Calendar },
    { id: "analytics", label: "Analytics", icon: BarChart3 },
    { id: "audience", label: "Audience", icon: Users },
    { id: "activity-logs", label: "Activity Logs", icon: Activity },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  return (
    <div className="w-64 bg-slate-100 dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 h-screen flex flex-col sticky top-0 transition-colors duration-300">
      <div className="p-6">
        <div className="flex items-center gap-3 mb-8 group cursor-pointer">
          <div className="relative w-10 h-10 rounded-2xl bg-gradient-to-br from-teal-600 to-teal-500 flex items-center justify-center shadow-lg shadow-teal-100 dark:shadow-teal-900/50 overflow-hidden">
            <div className="absolute inset-0 bg-white/10 group-hover:bg-white/0 transition-colors" />
            <Flame className="w-5 h-5 text-white transform group-hover:scale-110 group-hover:-rotate-12 transition-all duration-300" />
          </div>
          <h1 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-teal-800 to-teal-600 dark:from-teal-400 dark:to-teal-300 tracking-tight">
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
                  ? "bg-teal-700 dark:bg-teal-600 text-white shadow-sm"
                  : "text-slate-500 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white",
              )}
            >
              <item.icon
                className={cn(
                  "w-4 h-4",
                  currentView === item.id ? "text-white" : "text-slate-400 dark:text-slate-500",
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
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-all bg-gradient-to-r from-teal-50 to-teal-100/50 dark:from-teal-900/40 dark:to-teal-800/20 text-teal-700 dark:text-teal-400 hover:from-teal-100 hover:to-teal-100 dark:hover:from-teal-900/60 dark:hover:to-teal-800/40 border border-teal-100 dark:border-teal-800/50 hover:border-teal-200 group"
          >
            <Bot className="w-4 h-4 text-teal-600 dark:text-teal-400 group-hover:scale-110 transition-transform" />
            AI Copilot
            <span className="ml-auto text-[9px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800/50 px-1.5 py-0.5 rounded-md">
              NEW
            </span>
          </button>
        </div>
      </div>

      <div className="mt-auto p-6 border-t border-slate-200 dark:border-slate-800 space-y-1">
        <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-bold text-slate-500 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-all">
          <HelpCircle className="w-4 h-4 text-slate-400 dark:text-slate-500" />
          Help Center
        </button>
      </div>
    </div>
  );
}
