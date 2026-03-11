import React, { useState } from "react";
import Sidebar from "./components/Sidebar";
import Dashboard from "./components/Dashboard";
import Trends from "./components/Trends";
import EmailActivity from "./components/EmailActivity";
import CampaignWorkspace from "./components/CampaignWorkspace";
import Settings from "./components/Settings";
import MarketingCopilot from "./components/MarketingCopilot";

import { AnimatePresence, motion } from "motion/react";

export default function App() {
  const [currentView, setCurrentView] = useState("campaign");

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
      case "settings":
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="flex min-h-screen bg-[#F8FAFC] font-sans text-zinc-900">
      <Sidebar
        currentView={currentView}
        onViewChange={setCurrentView}
      />

      <main className="flex-1 overflow-y-auto h-screen">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentView}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.2 }}
          >
            {renderView()}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* AI Marketing Copilot — floating overlay across all views */}
      <MarketingCopilot />
    </div>
  );
}
