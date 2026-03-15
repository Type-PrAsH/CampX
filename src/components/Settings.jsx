import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import {
  Settings as SettingsIcon,
  Key,
  Save,
  Server,
  Sparkles,
  CheckCircle2,
} from "lucide-react";

export default function Settings() {
  const [formData, setFormData] = useState({
    campaignxUrl: "",
    campaignxKey: "",
    groqKey: "",
  });

  const [isSaved, setIsSaved] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    // Load from localStorage or fallback to env vars (for initial hydration)
    const localUrl = localStorage.getItem("campaignx_api_url");
    const localKey = localStorage.getItem("campaignx_api_key");
    const localGroq = localStorage.getItem("groq_api_key");

    setFormData({
      campaignxUrl:
        localUrl ||
        import.meta.env.VITE_CAMPAIGNX_API_URL ||
        "https://campaignx.inxiteout.ai",
      campaignxKey: localKey || import.meta.env.VITE_CAMPAIGNX_API_KEY || "",
      groqKey: localGroq || import.meta.env.VITE_GROQ_API_KEY || "",
    });
  }, []);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setIsSaved(false);
    setErrorMsg("");
  };

  const handleSave = async () => {
    setIsTesting(true);
    setErrorMsg("");
    setIsSaved(false);

    try {
      const cleanUrl = formData.campaignxUrl.replace(/\/$/, "");
      
      // 1. Validate the format/connection before saving
      const response = await fetch(`${cleanUrl}/api/v1/get_customer_cohort`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "X-API-Key": formData.campaignxKey,
        },
      });

      if (!response.ok && response.status !== 429) {
        throw new Error(`API returned ${response.status}`);
      }

      // 2. Persist the values if validation passed
      localStorage.setItem("campaignx_api_url", cleanUrl);
      localStorage.setItem("campaignx_api_key", formData.campaignxKey);
      localStorage.setItem("groq_api_key", formData.groqKey);
      
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);

      // Force other active components to read the new config immediately
      window.dispatchEvent(new Event("campx:config-updated"));
      
    } catch (err) {
      console.error("Config test failed:", err);
      setErrorMsg("API connection failed. Please verify URL or Authentication Key.");
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="p-8 space-y-8 max-w-4xl"
    >
      <div>
        <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
          <SettingsIcon className="w-8 h-8 text-teal-600 dark:text-teal-400" />
          Platform Settings
        </h2>
        <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">
          Configure your platform integrations, API keys, and environment variables.
        </p>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="p-6 md:p-8 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 flex flex-col gap-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                API Credentials
              </h3>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">
                Manage connections to external services and AI models.
              </p>
            </div>
            <button
              onClick={handleSave}
              disabled={isTesting}
              className="flex items-center gap-2 bg-teal-700 hover:bg-teal-800 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-sm active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isTesting ? (
                <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
              ) : isSaved ? (
                <CheckCircle2 className="w-4 h-4" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {isTesting ? "Testing Connection..." : isSaved ? "Saved Successfully" : "Save Changes"}
            </button>
          </div>
          
          {errorMsg && (
            <div className="bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 text-sm font-bold px-4 py-3 rounded-lg border border-rose-100 dark:border-rose-800/50">
              {errorMsg}
            </div>
          )}
        </div>

        <div className="p-6 md:p-8 space-y-8">
          {/* CampaignX API */}
          <div className="space-y-6">
            <h4 className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <Server className="w-4 h-4 text-teal-600 dark:text-teal-400" />
              CampaignX Engine
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">
                  API URL Target
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Server className="w-4 h-4 text-slate-400" />
                  </div>
                  <input
                    type="text"
                    name="campaignxUrl"
                    value={formData.campaignxUrl}
                    onChange={handleChange}
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-teal-600 dark:focus:ring-teal-500 outline-none transition-all font-mono text-sm dark:text-slate-200"
                    placeholder="https://campaignx.inxiteout.ai"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">
                  Authentication Key
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Key className="w-4 h-4 text-slate-400" />
                  </div>
                  <input
                    type="password"
                    name="campaignxKey"
                    value={formData.campaignxKey}
                    onChange={handleChange}
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-teal-600 dark:focus:ring-teal-500 outline-none transition-all font-mono text-sm dark:text-slate-200"
                    placeholder="Enter your X-API-Key"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="h-px w-full bg-slate-100 dark:bg-slate-800" />

          {/* Groq AI API */}
          <div className="space-y-6">
            <h4 className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-500 dark:text-purple-400" />
              Intelligence Layer (Groq)
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2 lg:col-span-2">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">
                  Groq API Key
                </label>
                <div className="relative max-w-xl">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Key className="w-4 h-4 text-slate-400" />
                  </div>
                  <input
                    type="password"
                    name="groqKey"
                    value={formData.groqKey}
                    onChange={handleChange}
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 outline-none transition-all font-mono text-sm dark:text-slate-200"
                    placeholder="gsk_..."
                  />
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 font-medium">
                  Powers autonomous campaign generation, audience filtering,
                  and intelligent analytics.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
