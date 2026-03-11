import React from "react";
import { motion } from "motion/react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { Loader2, Sparkles, TrendingUp, Target, Users } from "lucide-react";

// Enterprise Color Palette
const COLORS = ["#0F766E", "#14B8A6", "#2DD4BF", "#5EEAD4", "#99F6E4"];
const CHART_TEXT = "#94a3b8"; // slate-400
const CHART_GRID = "#334155"; // slate-700 (dark mode safe)

export default function Trends({ metrics = {}, chartData = {}, isLoading = false }) {

  if (isLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center p-8 text-teal-600">
        <Loader2 className="w-12 h-12 animate-spin" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
      className="p-8 space-y-8"
    >
      <div className="mb-8">
        <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
          <TrendingUp className="w-8 h-8 text-teal-600 dark:text-teal-400" />
          Analytics & Trends
        </h2>
        <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium">
          Deep dive into audience engagement and behavioral trends across campaigns.
        </p>
      </div>

      {/* AI Insights Panel */}
      <div className="mb-8 bg-gradient-to-br from-teal-900 to-slate-900 rounded-3xl p-8 border border-teal-800 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <Sparkles className="w-32 h-32 text-teal-400" />
        </div>
        <div className="relative z-10">
          <h3 className="text-xl font-black text-white flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-teal-400" />
            AI Performance Insights
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/10">
              <p className="text-xs font-black uppercase tracking-widest text-teal-300 mb-2">Top Segment</p>
              <p className="text-white font-medium text-sm leading-relaxed">
                "SaaS Founders" show a 24% higher engagement rate when campaigns are sent between 9:00 AM and 10:30 AM EST.
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/10">
              <p className="text-xs font-black uppercase tracking-widest text-teal-300 mb-2">Fatigue Warning</p>
              <p className="text-white font-medium text-sm leading-relaxed">
                The "Enterprise Accounts" segment is approaching email fatigue. Recommend pausing non-critical broadcasts for 7 days.
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/10">
              <p className="text-xs font-black uppercase tracking-widest text-teal-300 mb-2">Subject Line Trend</p>
              <p className="text-white font-medium text-sm leading-relaxed">
                Subject lines explicitly mentioning "ROI" or "Metrics" have driven a 14.5% lift in open rates this quarter.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Time of Day Engagement */}
        <div className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all duration-200">
          <div className="flex items-center gap-2 mb-8 text-slate-900 dark:text-white">
            <TrendingUp className="w-5 h-5 text-teal-600 dark:text-teal-400" />
            <h4 className="text-lg font-bold">Time of Day Engagement</h4>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData.timeOfDayData}>
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
                  barSize={40}
                >
                  {chartData.timeOfDayData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gender Engagement */}
        <div className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all duration-200">
          <div className="flex items-center gap-2 mb-8 text-slate-900 dark:text-white">
            <Users className="w-5 h-5 text-teal-600 dark:text-teal-400" />
            <h4 className="text-lg font-bold">Demographic Split</h4>
          </div>
          <div className="h-80 w-full flex justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData.genderEngagement}
                  cx="50%"
                  cy="45%"
                  innerRadius={80}
                  outerRadius={120}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {chartData.genderEngagement.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1e293b",
                    borderRadius: "16px",
                    border: "1px solid #334155",
                    color: "#f8fafc",
                    fontWeight: 600
                  }}
                />
                <Legend 
                  verticalAlign="bottom" 
                  height={36} 
                  iconType="circle"
                  wrapperStyle={{ fontSize: '13px', fontWeight: 600, color: CHART_TEXT }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Age Group Engagement */}
        <div className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all duration-200 lg:col-span-2">
          <div className="flex items-center gap-2 mb-8 text-slate-900 dark:text-white">
            <Target className="w-5 h-5 text-teal-600 dark:text-teal-400" />
            <h4 className="text-lg font-bold">Age Group Distribution</h4>
          </div>
          <div className="h-96 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData.ageGroupEngagement}>
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
                  {chartData.ageGroupEngagement.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length] || "#0F766E"}
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
