import React, { useState } from 'react';
import { Calendar, Clock, Sparkles, Edit2, ChevronDown, ChevronUp } from 'lucide-react';
import { motion } from 'motion/react';
import { ScheduleSettings } from '../types';

interface ScheduleSectionProps {
  settings: ScheduleSettings;
  onChange: (settings: ScheduleSettings) => void;
}

export default function ScheduleSection({ settings, onChange }: ScheduleSectionProps) {
  const [showManual, setShowManual] = useState(false);

  // Mock AI recommendation data
  const aiRecommendation = {
    day: 'Tuesday',
    time: '10:30 AM',
    predictedOpenRate: '24%',
    explanation: 'Based on historical engagement patterns of similar campaigns.'
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-slate-900 font-semibold">
          <Calendar className="w-5 h-5 text-[#6366F1]" />
          <h3 className="text-sm font-bold uppercase tracking-wider">Campaign Scheduling</h3>
        </div>
        {!showManual && (
          <button
            onClick={() => setShowManual(true)}
            className="flex items-center gap-1.5 text-xs font-bold text-[#6366F1] hover:text-[#4F46E5] transition-colors"
          >
            <Edit2 className="w-3 h-3" />
            Edit Time
          </button>
        )}
      </div>

      {!showManual ? (
        <div className="bg-slate-50/50 rounded-xl p-4 border border-slate-100 space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm border border-slate-100 shrink-0">
              <Sparkles className="w-4 h-4 text-[#6366F1]" />
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">AI Recommended Send Time</p>
              <div className="flex flex-col gap-1">
                <p className="text-lg font-bold text-slate-900">{aiRecommendation.day} {aiRecommendation.time}</p>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                    {aiRecommendation.predictedOpenRate} Predicted Open Rate
                  </span>
                </div>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed mt-2">
                {aiRecommendation.explanation}
              </p>
            </div>
          </div>
        </div>
      ) : (
        <motion.div 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="space-y-6 pt-2 border-t border-slate-100"
        >
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Send Date</label>
              <input
                type="date"
                value={settings.date}
                onChange={(e) => onChange({ ...settings, date: e.target.value })}
                className="w-full p-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-[#6366F1] focus:border-transparent transition-all text-sm text-slate-700 outline-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Send Time</label>
              <input
                type="time"
                value={settings.time}
                onChange={(e) => onChange({ ...settings, time: e.target.value })}
                className="w-full p-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-[#6366F1] focus:border-transparent transition-all text-sm text-slate-700 outline-none"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Schedule Type</label>
            <div className="flex gap-2">
              {(['one-time', 'recurring'] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => onChange({ ...settings, type })}
                  className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all border ${
                    settings.type === type
                      ? 'bg-[#6366F1] text-white border-[#6366F1] shadow-sm'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <button 
            onClick={() => setShowManual(false)}
            className="w-full py-2 text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors flex items-center justify-center gap-1"
          >
            <ChevronUp className="w-3 h-3" />
            Back to AI Recommendation
          </button>
        </motion.div>
      )}
    </div>
  );
}
