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
import { useRealData } from "../hooks/useRealData";
import { Loader2 } from "lucide-react";

const COLORS = ["#6366F1", "#818cf8", "#c7d2fe", "#e0e7ff"];

export default function Trends() {
  const { metrics, chartData, isLoading } = useRealData();

  if (isLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center p-8 text-indigo-600">
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
      <div>
        <h2 className="text-3xl font-bold text-slate-900 tracking-tight">
          Trends
        </h2>
        <p className="text-slate-500 mt-1 font-medium">
          Deep dive into audience engagement and behavioral trends.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Time of Day Engagement */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200">
          <h4 className="text-lg font-bold text-slate-900 mb-6">
            Morning vs Evening Open Rate
          </h4>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={chartData.timeOfDayData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#f0f0f0"
                />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: "#888" }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: "#888" }}
                />
                <Tooltip
                  cursor={{ fill: "#f9fafb" }}
                  contentStyle={{
                    backgroundColor: "#fff",
                    borderRadius: "12px",
                    border: "1px solid #e5e7eb",
                  }}
                />

                <Bar
                  dataKey="value"
                  fill="#6366F1"
                  radius={[4, 4, 0, 0]}
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
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200">
          <h4 className="text-lg font-bold text-slate-900 mb-6">
            Male vs Female Engagement
          </h4>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height={320}>
              <PieChart>
                <Pie
                  data={chartData.genderEngagement}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={120}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {chartData.genderEngagement.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Age Group Engagement (Simulated) */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200 lg:col-span-2">
          <h4 className="text-lg font-bold text-slate-900 mb-6">
            Age Group Engagement
          </h4>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={chartData.ageGroupEngagement}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#f0f0f0"
                />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: "#888" }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: "#888" }}
                />
                <Tooltip
                  cursor={{ fill: "#f9fafb" }}
                  contentStyle={{
                    backgroundColor: "#fff",
                    borderRadius: "12px",
                    border: "1px solid #e5e7eb",
                  }}
                />

                <Bar
                  dataKey="value"
                  fill="#6366F1"
                  radius={[4, 4, 0, 0]}
                  barSize={60}
                >
                  <Cell fill="#c7d2fe" />
                  <Cell fill="#818cf8" />
                  <Cell fill="#6366f1" />
                  <Cell fill="#4f46e5" />
                  <Cell fill="#4338ca" />
                  <Cell fill="#3730a3" />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
