import React, { useState } from "react";
import { motion } from "motion/react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  Sparkles,
  ArrowUpRight,
  Loader2,
  Activity,
  CheckCircle2,
  Clock,
  Target,
  Zap,
} from "lucide-react";
import AIInsightModal from "./AIInsightModal";
import { useRealData } from "../hooks/useRealData";

export default function Dashboard() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { metrics, chartData, isLoading } = useRealData();

  if (isLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center p-8 text-teal-600 dark:text-teal-400">
        <Loader2 className="w-12 h-12 animate-spin" />
      </div>
    );
  }

  // Remap real calculated metrics to match the Enterprise SaaS prompt requirements
  const realDashboardMetrics = [
    { 
      label: "Total Campaigns Sent", 
      value: metrics.totalSent, 
      change: "+12.5%", 
      trend: "up" 
    },
    {
      label: "AI Generated Leads",
      value: "2,845", // Simulated for prompt requirement
      change: "+18.2%",
      trend: "up",
    },
    {
      label: "Engagement Rate",
      value: metrics.clickRate,
      change: "+2.4%",
      trend: metrics.clickRateTrend,
    },
    {
      label: "AI Accuracy",
      value: "94.8%", // Simulated
      change: "+1.2%",
      trend: "up",
    },
  ];

  /* AI Insights Panel Data */
  const aiInsights = [
    { icon: Target, text: "Audience segment 'SaaS Founders' shows a 25% higher open rate on Tuesday mornings. Consider rescheduling." },
    { icon: Zap, text: "Campaign 'Q3 Product Update' is underperforming. Recommend regenerating the subject line using AI." },
    { icon: TrendingUp, text: "Overall engagement is up 12% across your top 3 automated flows." }
  ];

  /* Active Campaigns Data */
  const activeCampaigns = [
    { name: "Enterprise Q3 Upsell", status: "Running", progress: 75, audience: "12,450" },
    { name: "Churn Prevention Flow", status: "Optimization", progress: 45, audience: "3,200" },
    { name: "Welcome Series v2.1", status: "Running", progress: 90, audience: "8,900" }
  ];

  /* Recent Activity Data */
  const recentActivity = [
    { action: "Campaign brief received", time: "10 mins ago", type: "input" },
    { action: "Strategy generated", time: "25 mins ago", type: "ai" },
    { action: "Audience filtered dynamically", time: "1 hour ago", type: "ai" },
    { action: "Campaign 'Webinar Invite' sent", time: "3 hours ago", type: "execution" },
    { action: "Analytics tracking started", time: "3.5 hours ago", type: "system" }
  ];

  // Custom Tooltip for dark mode support
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700 shadow-lg">
          <p className="font-semibold text-slate-800 dark:text-slate-200 mb-1">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm font-medium" style={{ color: entry.color || '#0d9488' }}>
              {entry.name || 'Value'}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="p-4 md:p-8 space-y-6 md:space-y-8"
    >
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            AI Marketing Command Center
          </h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium">
            Real-time performance overview and autonomous agent monitoring.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-2 bg-teal-700 hover:bg-teal-800 dark:bg-teal-600 dark:hover:bg-teal-700 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-sm hover:shadow-md active:scale-95 flex-shrink-0"
        >
          <Sparkles className="w-4 h-4" />
          Generate System Report
        </button>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {realDashboardMetrics.map((metric, idx) => (
          <motion.div
            key={metric.label}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:-translate-y-1 hover:shadow-lg transition-all duration-300 group"
          >
            <p className="text-sm font-bold text-slate-500 dark:text-slate-400 group-hover:text-teal-700 dark:group-hover:text-teal-400 transition-colors">{metric.label}</p>
            <div className="flex items-baseline justify-between mt-3">
              <h3 className="text-3xl font-black text-slate-900 dark:text-white">
                {metric.value}
              </h3>
              {metric.change && (
                <span
                  className={`text-xs font-black flex items-center gap-0.5 px-2.5 py-1 rounded-lg ${metric.trend === "up" ? "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800" : "bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-800"}`}
                >
                  {metric.trend === "up" ? (
                    <TrendingUp className="w-3 h-3" />
                  ) : (
                    <TrendingDown className="w-3 h-3" />
                  )}
                  {metric.change}
                </span>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Engagement Trend */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col">
          <div className="flex items-center justify-between mb-6 flex-shrink-0">
            <h4 className="text-lg font-black text-slate-900 dark:text-white">
              Campaign Engagement Trend
            </h4>
            <span className="flex items-center gap-1 text-[10px] font-black text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-900/40 px-2.5 py-1 rounded-full border border-teal-100 dark:border-teal-800 uppercase tracking-widest">
              <Activity className="w-3 h-3" />
              Live API
            </span>
          </div>
          <div className="flex-1 w-full min-h-[256px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData.engagementTrend}>
                <defs>
                  <linearGradient id="colorTrend" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0D9488" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#0D9488" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" strokeOpacity={0.15} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#64748b", fontWeight: 600 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#64748b", fontWeight: 600 }} dx={-10} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="value" stroke="#0D9488" strokeWidth={3} fillOpacity={1} fill="url(#colorTrend)" activeDot={{ r: 6, fill: "#0D9488", stroke: "#fff", strokeWidth: 2 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Open Rate Trend */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col">
          <div className="flex items-center justify-between mb-6 flex-shrink-0">
            <h4 className="text-lg font-black text-slate-900 dark:text-white">
              Open Rate Trend
            </h4>
          </div>
          <div className="flex-1 w-full min-h-[256px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData.openRateData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" strokeOpacity={0.15} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#64748b", fontWeight: 600 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#64748b", fontWeight: 600 }} dx={-10} />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="value" stroke="#0F766E" strokeWidth={3} dot={{ r: 4, fill: "#0F766E", strokeWidth: 2, stroke: "#fff" }} activeDot={{ r: 6, strokeWidth: 0 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Three Column Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Insights Panel */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col hover:shadow-lg transition-all duration-300">
          <div className="flex items-center justify-between mb-6">
            <h4 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-teal-600 dark:text-teal-400" />
              AI Insights
            </h4>
          </div>
          <div className="flex-1 space-y-4 text-sm">
            {aiInsights.map((insight, idx) => (
              <div key={idx} className="flex gap-3 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-700/50">
                <div className="mt-0.5 flex-shrink-0">
                  <div className="w-8 h-8 rounded-full bg-teal-100 dark:bg-teal-900/50 flex items-center justify-center">
                    <insight.icon className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                  </div>
                </div>
                <p className="font-medium text-slate-700 dark:text-slate-300 leading-relaxed">
                  {insight.text}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Active Campaigns Panel */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col hover:shadow-lg transition-all duration-300">
          <div className="flex items-center justify-between mb-6">
            <h4 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Target className="w-5 h-5 text-teal-600 dark:text-teal-400" />
              Active Campaigns
            </h4>
          </div>
          <div className="flex-1 flex flex-col justify-center space-y-7">
            {activeCampaigns.map((camp, idx) => (
              <div key={idx} className="space-y-2.5">
                <div className="flex justify-between items-center">
                  <p className="font-bold text-sm text-slate-900 dark:text-white">{camp.name}</p>
                  <span className="text-[10px] uppercase font-black tracking-widest px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                    {camp.status}
                  </span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden border border-slate-200 dark:border-slate-700">
                  <div className="bg-gradient-to-r from-teal-600 to-teal-400 dark:from-teal-500 dark:to-teal-300 h-2 rounded-full transition-all" style={{ width: `${camp.progress}%` }}></div>
                </div>
                <div className="flex justify-between text-[11px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
                  <span>{camp.progress}% Complete</span>
                  <span>{camp.audience} Audience</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity Panel */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col hover:shadow-lg transition-all duration-300">
          <div className="flex items-center justify-between mb-6">
            <h4 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-teal-600 dark:text-teal-400" />
              Recent Activity
            </h4>
          </div>
          <div className="flex-1 space-y-4 pt-2">
             {recentActivity.map((activity, idx) => (
               <div key={idx} className="flex gap-4 items-start relative pb-4 last:pb-0">
                 {idx !== recentActivity.length - 1 && (
                   <div className="absolute left-3.5 top-8 bottom-0 w-px bg-slate-200 dark:bg-slate-800" />
                 )}
                 <div className={`relative z-10 w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ring-4 ring-white dark:ring-slate-900 ${activity.type === 'ai' ? 'bg-teal-100 dark:bg-teal-900/50 border border-teal-200 dark:border-teal-700/50 text-teal-600 dark:text-teal-400' : 'bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400'}`}>
                   {activity.type === 'ai' ? <Sparkles className="w-3.5 h-3.5" /> : activity.type === 'execution' ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                 </div>
                 <div className="mt-1 flex-1">
                   <p className="text-sm font-bold text-slate-900 dark:text-slate-200 leading-none">{activity.action}</p>
                   <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-1.5">{activity.time}</p>
                 </div>
               </div>
             ))}
          </div>
        </div>

      </div>

      <AIInsightModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        metrics={metrics}
        chartData={chartData}
      />
    </motion.div>
  );
}
