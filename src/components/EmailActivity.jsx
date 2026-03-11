import React from "react";
import { motion } from "motion/react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
} from "recharts";
import { useRealData } from "../hooks/useRealData";
import { Loader2, Mail, Activity, BarChart2 } from "lucide-react";

const CHART_TEXT = "#94a3b8"; // slate-400
const CHART_GRID = "#334155"; // slate-700 (dark mode safe)

export default function EmailActivity() {
  const { metrics, chartData, isLoading } = useRealData();

  if (isLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center p-8 text-teal-600">
        <Loader2 className="w-12 h-12 animate-spin" />
      </div>
    );
  }

  const realActivityStats = [
    { label: "Total Volume", value: metrics.totalSent },
    { label: "Total Opens", value: metrics.openRate },
    { label: "Total Clicks", value: metrics.clickRate },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="p-8 space-y-8"
    >
      <div className="mb-8">
        <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
          <Mail className="w-8 h-8 text-teal-600 dark:text-teal-400" />
          Email Activity
        </h2>
        <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium">
          Monitor your daily, weekly, and monthly email volume and engagement.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {realActivityStats.map((stat, idx) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all duration-200"
          >
            <div className="flex items-center gap-2 mb-3">
               <Activity className="w-4 h-4 text-teal-600 dark:text-teal-400" />
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                 {stat.label}
               </p>
            </div>
            <h3 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white">
              {stat.value}
            </h3>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Daily Email Volume */}
        <div className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all duration-200">
          <div className="flex items-center gap-2 mb-8 text-slate-900 dark:text-white">
            <BarChart2 className="w-5 h-5 text-teal-600 dark:text-teal-400" />
            <h4 className="text-lg font-bold">Daily Email Volume</h4>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData.dailyVolume}>
                <defs>
                  <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2DD4BF" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#2DD4BF" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke={CHART_GRID}
                  opacity={0.2}
                />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: CHART_TEXT, fontSize: 12, fontWeight: 600 }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: CHART_TEXT, fontSize: 12, fontWeight: 600 }}
                  dx={-10}
                />
                <Tooltip
                  cursor={{ stroke: "rgba(148, 163, 184, 0.2)" }}
                  contentStyle={{
                    backgroundColor: "#1e293b",
                    borderRadius: "16px",
                    border: "1px solid #334155",
                    color: "#f8fafc",
                    fontWeight: 600
                  }}
                  itemStyle={{ color: "#2DD4BF" }}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#2DD4BF"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorVolume)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Weekly Campaign Activity */}
        <div className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all duration-200">
          <div className="flex items-center gap-2 mb-8 text-slate-900 dark:text-white">
            <BarChart2 className="w-5 h-5 text-teal-600 dark:text-teal-400" />
            <h4 className="text-lg font-bold">Weekly Campaign Operations</h4>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData.weeklyCampaigns}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke={CHART_GRID}
                  opacity={0.2}
                />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: CHART_TEXT, fontSize: 13, fontWeight: 600 }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: CHART_TEXT, fontSize: 13, fontWeight: 600 }}
                  dx={-10}
                />
                <Tooltip
                  cursor={{ fill: "rgba(148, 163, 184, 0.1)" }}
                  contentStyle={{
                    backgroundColor: "#1e293b",
                    borderRadius: "16px",
                    border: "1px solid #334155",
                    color: "#f8fafc",
                    fontWeight: 600
                  }}
                  itemStyle={{ color: "#2DD4BF" }}
                />

                <Bar
                  dataKey="value"
                  radius={[6, 6, 0, 0]}
                  barSize={60}
                >
                  {chartData.weeklyCampaigns.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={index === 3 ? "#0F766E" : "#ccfbf1"}
                      className="dark:fill-teal-700 dark:even:fill-teal-900/50"
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
