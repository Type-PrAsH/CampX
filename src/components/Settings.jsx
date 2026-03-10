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
  };

  const handleSave = () => {
    localStorage.setItem("campaignx_api_url", formData.campaignxUrl);
    localStorage.setItem("campaignx_api_key", formData.campaignxKey);
    localStorage.setItem("groq_api_key", formData.groqKey);
    setIsSaved(true);

    // Auto-hide success message after 3 seconds
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="p-8 space-y-8 max-w-4xl"
    >
      <div>
        <h2 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
          <SettingsIcon className="w-8 h-8 text-indigo-600" />
          Settings
        </h2>
        <p className="text-slate-500 mt-2 font-medium">
          Configure your platform integrations, API keys, and environment
          variables.
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-200 bg-slate-50/50 flex justify-between items-center">
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              API Credentials
            </h3>
            <p className="text-sm text-slate-500">
              Manage connections to external services.
            </p>
          </div>
          <button
            onClick={handleSave}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-sm active:scale-95"
          >
            {isSaved ? (
              <CheckCircle2 className="w-4 h-4" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {isSaved ? "Saved Successfully" : "Save Changes"}
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* CampaignX API */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Server className="w-4 h-4 text-indigo-500" />
              CampaignX Engine
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">
                  API URL Target
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Server className="w-4 h-4 text-slate-400" />
                  </div>
                  <input
                    type="text"
                    name="campaignxUrl"
                    value={formData.campaignxUrl}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all font-mono text-sm"
                    placeholder="https://campaignx.inxiteout.ai"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">
                  Authentication Key
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Key className="w-4 h-4 text-slate-400" />
                  </div>
                  <input
                    type="password"
                    name="campaignxKey"
                    value={formData.campaignxKey}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all font-mono text-sm"
                    placeholder="Enter your X-API-Key"
                  />
                </div>
              </div>
            </div>
          </div>

          <hr className="border-slate-100" />

          {/* Groq AI API */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-500" />
              Groq Intelligence
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2 lg:col-span-2">
                <label className="text-sm font-semibold text-slate-700">
                  Groq API Key
                </label>
                <div className="relative max-w-xl">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Key className="w-4 h-4 text-slate-400" />
                  </div>
                  <input
                    type="password"
                    name="groqKey"
                    value={formData.groqKey}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all font-mono text-sm"
                    placeholder="gsk_..."
                  />
                </div>
                <p className="text-xs text-slate-500 mt-2 font-medium">
                  Used for autonomous campaign generation, audience filtering,
                  and intelligent analytics generation.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
