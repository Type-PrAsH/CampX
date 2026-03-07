import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Sparkles, TrendingUp, Target, Zap, ChevronRight, MessageSquare } from 'lucide-react';

interface AIInsightModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AIInsightModal({ isOpen, onClose }: AIInsightModalProps) {
  if (!isOpen) return null;

  const insights = [
    {
      title: "Optimal Send Time",
      description: "Based on historical data, your audience is most active between 9:00 AM and 11:00 AM EST on Tuesdays.",
      icon: <Zap className="w-5 h-5 text-amber-500" />,
      impact: "High Impact"
    },
    {
      title: "Subject Line Optimization",
      description: "Using 'How to' or 'Discover' in your subject lines has increased open rates by 24% in the last 30 days.",
      icon: <Target className="w-5 h-5 text-[#6366F1]" />,
      impact: "Medium Impact"
    },
    {
      title: "Audience Segmentation",
      description: "Your 'Retail' segment is showing signs of fatigue. We recommend reducing frequency to once per week.",
      icon: <TrendingUp className="w-5 h-5 text-emerald-500" />,
      impact: "Critical"
    }
  ];

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
              <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-100">AI Intelligence Report</span>
            </div>
            <h3 className="text-3xl font-bold tracking-tight">Campaign Insights</h3>
            <p className="text-indigo-100 mt-2 text-sm max-w-md leading-relaxed font-medium">
              Our AI has analyzed over 1.2M data points to provide these actionable recommendations for your campaigns.
            </p>
          </div>

          {/* Content */}
          <div className="p-8 space-y-6">
            <div className="grid gap-4">
              {insights.map((insight, index) => (
                <motion.div 
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-5 bg-slate-50 rounded-2xl border border-slate-100 flex items-start gap-4 hover:border-indigo-200 transition-all group cursor-pointer"
                >
                  <div className="p-3 bg-white rounded-xl shadow-sm group-hover:scale-110 transition-transform border border-slate-100">
                    {insight.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-1">
                      <h4 className="font-bold text-slate-900">{insight.title}</h4>
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md ${
                        insight.impact === 'Critical' ? 'bg-rose-100 text-rose-600' : 
                        insight.impact === 'High Impact' ? 'bg-amber-100 text-amber-600' : 'bg-indigo-100 text-indigo-600'
                      }`}>
                        {insight.impact}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed font-medium">{insight.description}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-[#6366F1] transition-colors self-center" />
                </motion.div>
              ))}
            </div>

            <div className="pt-4 flex gap-3">
              <button className="flex-1 py-4 bg-[#6366F1] text-white rounded-2xl text-sm font-bold hover:bg-[#4F46E5] transition-all shadow-lg shadow-indigo-100 flex items-center justify-center gap-2">
                <Zap className="w-4 h-4" />
                Apply All Recommendations
              </button>
              <button className="px-6 py-4 bg-slate-100 text-slate-600 rounded-2xl text-sm font-bold hover:bg-slate-200 transition-all flex items-center justify-center gap-2">
                <MessageSquare className="w-4 h-4" />
                Ask AI
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
