import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  X,
  Sparkles,
  TrendingUp,
  Target,
  Zap,
  ChevronRight,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { GoogleGenAI } from "@google/genai";

export default function AIInsightModal({
  isOpen,
  onClose,
  metrics,
  chartData,
}) {
  const [insights, setInsights] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen && insights.length === 0 && !isGenerating && metrics) {
      generateInsights();
    }
  }, [isOpen, metrics]);

  const generateInsights = async () => {
    setIsGenerating(true);
    setError(null);

    try {
      const settingsKey = localStorage.getItem("gemini_api_key");
      const envKey = import.meta.env.VITE_GEMINI_API_KEY;
      const apiKey = settingsKey || envKey;

      if (!apiKey) {
        throw new Error("Gemini API Key missing. Please set it in Settings.");
      }

      const prompt = `You are a world-class Email Marketing AI analyst. Analyze the following live platform data from a user's recent campaigns and provide EXACTLY 3 actionable, highly specific insights.

CURRENT TOTAL PLATFORM METRICS:
Total Emails Sent: ${metrics?.totalSent || "0"}
Average Open Rate: ${metrics?.openRate || "0%"}
Average Click Rate: ${metrics?.clickRate || "0%"}
Unsubscribe Rate: ${metrics?.unsubscribes || "0%"}
Open Rate Trend: ${metrics?.openRateTrend || "neutral"}

Return the response as a JSON array of exactly 3 objects:
[
  {
    "title": "Short punchy title (max 5 words)",
    "description": "Specific, data-driven actionable advice based on the metrics provided (max 2 sentences).",
    "impact": "High Impact",
    "iconType": "zap"
  }
]
The only valid values for impact are: "High Impact", "Medium Impact", "Critical".
The only valid values for iconType are: "zap", "target", "trending".`;

      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          temperature: 0.4,
        },
      });

      const textResponse = response.text || "";

      // Clean potential markdown blocks
      const cleanJson = textResponse
        .replace(/```json/gi, "")
        .replace(/```/g, "")
        .trim();

      try {
        let parsedInsights = JSON.parse(cleanJson);
        // Handle models wrapping in an object
        if (!Array.isArray(parsedInsights)) {
          const arrVal = Object.values(parsedInsights).find(val => Array.isArray(val));
          parsedInsights = arrVal || [parsedInsights];
        }
        setInsights(parsedInsights.slice(0, 3));
      } catch (parseError) {
        console.error("Failed to parse AI response:", textResponse);
        throw new Error("AI returned malformed data. Please try again.");
      }
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to generate AI insights.");
    } finally {
      setIsGenerating(false);
    }
  };

  const renderIcon = (type) => {
    switch (type) {
      case "target":
        return <Target className="w-5 h-5 text-[#6366F1]" />;
      case "trending":
        return <TrendingUp className="w-5 h-5 text-emerald-500" />;
      case "zap":
      default:
        return <Zap className="w-5 h-5 text-amber-500" />;
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="bg-[#6366F1] p-8 text-white relative">
            <div className="absolute top-0 right-0 p-12 opacity-10">
              <Sparkles className="w-32 h-32" />
            </div>
            <button
              onClick={onClose}
              className="absolute top-6 right-6 p-2 hover:bg-white/10 rounded-xl transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-white/10 rounded-lg backdrop-blur-md">
                <Sparkles className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-100">
                Live AI Analysis
              </span>
            </div>
            <h3 className="text-3xl font-bold tracking-tight">
              Campaign Insights
            </h3>
            <p className="text-indigo-100 mt-2 text-sm max-w-md leading-relaxed font-medium">
              Gemini AI is analyzing your real-time performance data to generate
              custom optimization strategies.
            </p>
          </div>

          {/* Content */}
          <div className="p-8 space-y-6 bg-slate-50 min-h-[300px]">
            {isGenerating ? (
              <div className="flex flex-col items-center justify-center h-full py-12 text-indigo-600 space-y-4">
                <Loader2 className="w-12 h-12 animate-spin" />
                <p className="text-sm font-bold text-slate-600 animate-pulse">
                  Running data through Intelligence Engine...
                </p>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center h-full py-12 text-rose-500 space-y-4">
                <AlertCircle className="w-12 h-12" />
                <p className="text-sm font-bold">{error}</p>
                <button
                  onClick={generateInsights}
                  className="text-indigo-600 underline text-sm font-medium"
                >
                  Try Again
                </button>
              </div>
            ) : (
              <div className="grid gap-4">
                {insights.map((insight, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="p-5 bg-white rounded-2xl border border-slate-200 flex items-start gap-4 hover:border-indigo-300 transition-all group cursor-pointer shadow-sm hover:shadow-md"
                  >
                    <div className="p-3 bg-slate-50 rounded-xl shadow-sm group-hover:scale-110 transition-transform border border-slate-100">
                      {renderIcon(insight.iconType)}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-bold text-slate-900 leading-tight">
                          {insight.title}
                        </h4>
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md whitespace-nowrap ml-4 ${
                            insight.impact === "Critical"
                              ? "bg-rose-100 text-rose-700"
                              : insight.impact === "High Impact"
                                ? "bg-amber-100 text-amber-700"
                                : "bg-indigo-100 text-indigo-700"
                          }`}
                        >
                          {insight.impact}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed font-medium">
                        {insight.description}
                      </p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-[#6366F1] transition-colors self-center ml-2" />
                  </motion.div>
                ))}
              </div>
            )}

            {!isGenerating && !error && (
              <div className="pt-4 flex gap-3">
                <button className="flex-1 py-4 bg-[#6366F1] text-white rounded-2xl text-sm font-bold hover:bg-[#4F46E5] transition-all shadow-lg shadow-indigo-100 flex items-center justify-center gap-2">
                  <Zap className="w-4 h-4" />
                  Apply Recommended Fixes
                </button>
                <button
                  onClick={generateInsights}
                  className="px-6 py-4 bg-slate-200 text-slate-700 rounded-2xl text-sm font-bold hover:bg-slate-300 transition-all flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  Reroll Analysis
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
