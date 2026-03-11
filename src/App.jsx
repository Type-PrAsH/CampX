import React, { useState, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import TopBar from "./components/TopBar";
import Dashboard from "./components/Dashboard";
import Trends from "./components/Trends";
import EmailActivity from "./components/EmailActivity";
import CampaignWorkspace from "./components/CampaignWorkspace";
import Settings from "./components/Settings";
import MarketingCopilot from "./components/MarketingCopilot";
import ActivityLogs from "./components/ActivityLogs";
import Audience from "./components/Audience";
import Schedule from "./components/Schedule";
import Profile from "./components/Profile";

import { AnimatePresence, motion } from "motion/react";

export default function App() {
  const [currentView, setCurrentView] = useState("campaign");
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Initialize dark mode from localStorage or system preference
  useEffect(() => {
    const isDark = 
      localStorage.theme === 'dark' || 
      (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
    
    setIsDarkMode(isDark);
    if (isDark) {
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleTheme = () => {
    setIsDarkMode(prev => {
      const nextTheme = !prev;
      if (nextTheme) {
        document.documentElement.classList.add('dark');
        localStorage.theme = 'dark';
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.theme = 'light';
      }
      return nextTheme;
    });
  };

  const renderView = () => {
    switch (currentView) {
      case "dashboard":
        return <Dashboard />;
      case "trends":
        return <Trends />;
      case "activity":
        return <EmailActivity />;
      case "campaign":
        return <CampaignWorkspace />;
      case "schedule":
        return <Schedule />;
      case "analytics":
        return <Trends />; // Rename Trends to Analytics eventually, mapping both for now
      case "audience":
        return <Audience />;
      case "activity-logs":
        return <ActivityLogs />;
      case "settings":
        return <Settings />;
      case "profile":
        return <Profile />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 font-sans text-zinc-900 dark:text-slate-100 transition-colors duration-300">
      <Sidebar
        currentView={currentView}
        onViewChange={setCurrentView}
      />

      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <TopBar isDarkMode={isDarkMode} toggleTheme={toggleTheme} onNavigate={setCurrentView} />
        
        <main className="flex-1 overflow-y-auto w-full relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentView}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="h-full w-full"
            >
              {renderView()}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* AI Marketing Copilot — floating overlay across all views */}
      <MarketingCopilot />
    </div>
  );
}
