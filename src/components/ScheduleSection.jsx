import React from "react";
import { Calendar, Edit2 } from "lucide-react";
import { motion } from "motion/react";

export default function ScheduleSection({ settings, onChange }) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200 space-y-6">
      <div className="flex items-center gap-2 text-slate-900 font-semibold">
        <Calendar className="w-5 h-5 text-teal-600" />
        <h3 className="text-sm font-bold uppercase tracking-wider">
          Campaign Scheduling
        </h3>
      </div>

      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: "auto" }}
        className="space-y-6 pt-2 border-t border-slate-100"
      >
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Send Date
            </label>
            <input
              type="date"
              value={settings.date}
              onChange={(e) =>
                onChange({ ...settings, date: e.target.value })
              }
              className="w-full p-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-teal-600 focus:border-transparent transition-all text-sm text-slate-700 outline-none"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Send Time
            </label>
            <input
              type="time"
              value={settings.time}
              onChange={(e) =>
                onChange({ ...settings, time: e.target.value })
              }
              className="w-full p-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-teal-600 focus:border-transparent transition-all text-sm text-slate-700 outline-none"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            Schedule Type
          </label>
          <div className="flex gap-2">
            {["one-time", "recurring"].map((type) => (
              <button
                key={type}
                onClick={() => onChange({ ...settings, type })}
                className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all border ${
                  settings.type === type
                    ? "bg-teal-700 text-white border-teal-700 shadow-sm"
                    : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                }`}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
