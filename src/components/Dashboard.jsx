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
  Loader2,
  Activity,
  Target,
  Zap,
  Mail,
  MousePointerClick,
  UserMinus,
  Send,
} from "lucide-react";
import AIInsightModal from "./AIInsightModal";

export default function Dashboard({ reports = [], metrics = {}, chartData = {}, isLoading = false }) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center p-8 text-teal-600 dark:text-teal-400">
        <Loader2 className="w-12 h-12 animate-spin" />
      </div>
    );
  }

  // All metrics sourced directly from live API data
  const realDashboardMetrics = [
    {
      label: "Total Emails Sent",
      value: metrics.totalSent,
      icon: Send,
      trend: metrics.openRateTrend,
    },
    {
      label: "Open Rate",
      value: metrics.openRate,
      icon: Mail,
      trend: metrics.openRateTrend,
    },
    {
      label: "Click Rate",
      value: metrics.clickRate,
      icon: MousePointerClick,
      trend: metrics.clickRateTrend,
    },
    {
      label: "Unsubscribe Rate",
      value: metrics.unsubscribes,
      icon: UserMinus,
      trend: parseFloat(metrics.unsubscribes) < 0.5 ? "up" : "down",
    },
  ];

  // AI Insights derived from real metrics data
  const bestDay = chartData.openRateData?.reduce(
    (best, d) => (d.value > (best?.value ?? -1) ? d : best),
    null
  );
  const topSegment = chartData.clickRateBySegment?.[0];
  const bestTimeOfDay = chartData.timeOfDayData?.reduce(
    (best, d) => (d.value > (best?.value ?? -1) ? d : best),
    null
  );

  const aiInsights = [
    bestDay && bestDay.value > 0
      ? { icon: Target, text: `${bestDay.name} has the highest open rate (${bestDay.value.toFixed(1)}%) based on your sent campaigns. Consider scheduling future sends on this day.` }
      : { icon: Target, text: "No open-rate data yet. Send your first campaign to see day-of-week engagement insights." },
    topSegment && topSegment.value > 0
      ? { icon: Zap, text: `The "${topSegment.name}" occupation segment has the highest click rate (${topSegment.value}%) in your cohort. Prioritize this audience for performance campaigns.` }
      : { icon: Zap, text: "No segment click data yet. Campaign reports will populate this insight automatically." },
    bestTimeOfDay && bestTimeOfDay.value > 0
      ? { icon: TrendingUp, text: `"${bestTimeOfDay.name}" is the peak engagement window across your campaigns. Schedule time-sensitive sends during this period to maximize opens.` }
      : { icon: TrendingUp, text: "No time-of-day engagement data yet. Data will appear here after your campaigns are reported." },
  ];

  // Active Campaigns sourced from real reports
  const activeCampaigns = reports.slice(0, 3).map((r) => ({
    name: r.campaign_id,
    status: "Completed",
    progress: r.total_sent > 0 ? Math.min(100, Math.round((r.opens / r.total_sent) * 100)) : 0,
    audience: r.total_sent.toLocaleString(),
  }));

  // Recent Activity from real campaign history
  const recentActivity = reports.slice(0, 5).map((r, idx) => ({
    action: `Campaign dispatched — ID: ${r.campaign_id}`,
    time: idx === 0 ? "Most recent" : `Campaign #${reports.length - idx}`,
    type: "execution",
  }));

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

  const hasAnyCampaigns = reports.length > 0;

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
            Real-time performance overview from live CampaignX API data.
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
            <div className="flex items-center gap-2 mb-3">
              <metric.icon className="w-4 h-4 text-teal-600 dark:text-teal-400" />
              <p className="text-sm font-bold text-slate-500 dark:text-slate-400 group-hover:text-teal-700 dark:group-hover:text-teal-400 transition-colors">{metric.label}</p>
            </div>
            <div className="flex items-baseline justify-between">
              <h3 className="text-3xl font-black text-slate-900 dark:text-white">
                {metric.value}
              </h3>
              <span className={`text-xs font-black flex items-center gap-0.5 px-2.5 py-1 rounded-lg ${metric.trend === "up" ? "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800" : "bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-800"}`}>
                {metric.trend === "up" ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                Live
              </span>
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
            {chartData.engagementTrend.length > 0 ? (
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
            ) : (
              <div className="flex h-full items-center justify-center text-slate-400 dark:text-slate-500 text-sm font-medium">
                No engagement data yet. Send campaigns to see trends here.
              </div>
            )}
          </div>
        </div>

        {/* Open Rate Trend */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col">
          <div className="flex items-center justify-between mb-6 flex-shrink-0">
            <h4 className="text-lg font-black text-slate-900 dark:text-white">
              Open Rate by Day of Week
            </h4>
          </div>
          <div className="flex-1 w-full min-h-[256px]">
            {chartData.openRateData.some(d => d.value > 0) ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData.openRateData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" strokeOpacity={0.15} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#64748b", fontWeight: 600 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#64748b", fontWeight: 600 }} dx={-10} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line type="monotone" dataKey="value" stroke="#0F766E" strokeWidth={3} dot={{ r: 4, fill: "#0F766E", strokeWidth: 2, stroke: "#fff" }} activeDot={{ r: 6, strokeWidth: 0 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-slate-400 dark:text-slate-500 text-sm font-medium">
                No open-rate data yet. Campaign reports will populate this chart.
              </div>
            )}
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
              Past Campaigns
            </h4>
          </div>
          <div className="flex-1 flex flex-col justify-center space-y-7">
            {hasAnyCampaigns ? activeCampaigns.map((camp, idx) => (
              <div key={idx} className="space-y-2.5">
                <div className="flex justify-between items-center">
                  <p className="font-bold text-sm text-slate-900 dark:text-white truncate max-w-[160px]" title={camp.name}>{camp.name}</p>
                  <span className="text-[10px] uppercase font-black tracking-widest px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                    {camp.status}
                  </span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden border border-slate-200 dark:border-slate-700">
                  <div className="bg-gradient-to-r from-teal-600 to-teal-400 dark:from-teal-500 dark:to-teal-300 h-2 rounded-full transition-all" style={{ width: `${camp.progress}%` }}></div>
                </div>
                <div className="flex justify-between text-[11px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
                  <span>{camp.progress}% Open Rate</span>
                  <span>{camp.audience} Sent</span>
                </div>
              </div>
            )) : (
              <div className="text-center text-slate-400 dark:text-slate-500 text-sm font-medium py-4">
                No campaigns sent yet. Use the Campaign Workspace to dispatch your first campaign.
              </div>
            )}
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
            {recentActivity.length > 0 ? recentActivity.map((activity, idx) => (
              <div key={idx} className="flex gap-4 items-start relative pb-4 last:pb-0">
                {idx !== recentActivity.length - 1 && (
                  <div className="absolute left-3.5 top-8 bottom-0 w-px bg-slate-200 dark:bg-slate-800" />
                )}
                <div className="relative z-10 w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ring-4 ring-white dark:ring-slate-900 bg-teal-100 dark:bg-teal-900/50 border border-teal-200 dark:border-teal-700/50 text-teal-600 dark:text-teal-400">
                  <Send className="w-3.5 h-3.5" />
                </div>
                <div className="mt-1 flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-900 dark:text-slate-200 leading-none truncate">{activity.action}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-1.5">{activity.time}</p>
                </div>
              </div>
            )) : (
              <div className="text-center text-slate-400 dark:text-slate-500 text-sm font-medium py-4">
                No activity recorded yet. Campaign dispatches will appear here.
              </div>
            )}
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
