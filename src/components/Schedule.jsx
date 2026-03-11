import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Calendar as CalendarIcon, Clock, ArrowRight, Zap, Target } from 'lucide-react';
import ScheduleSection from './ScheduleSection';

export default function Schedule() {
  const [schedule, setSchedule] = useState({ date: new Date().toISOString().split("T")[0], time: "10:00", type: "smart" });

  const upcomingEvents = [
    { name: "Enterprise Q3 Upsell", date: "Today", time: "2:00 PM", type: "Automated Flow", status: "Queued" },
    { name: "Welcome Series v2.1", date: "Tomorrow", time: "9:00 AM", type: "Drip Campaign", status: "Scheduled" },
    { name: "Churn Prevention Alert", date: "Mar 15", time: "Dynamic", type: "Triggered", status: "Active" },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="p-4 md:p-8 max-w-[1200px] mx-auto space-y-8 pb-24">
      
      <div>
        <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
          <CalendarIcon className="w-8 h-8 text-teal-600 dark:text-teal-400" />
          Campaign Dispatch Schedule
        </h2>
        <p className="text-slate-500 dark:text-slate-400 font-medium mt-1">
          Coordinate automated deliveries and let AI optimize your send times.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7 space-y-8">
           {/* Interactive Schedule Component Wrapper */}
           <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
             <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <h3 className="font-bold text-slate-900 dark:text-white text-xl">Quick Dispatch Configuration</h3>
                <span className="text-[10px] font-black uppercase tracking-widest text-teal-700 md:self-end bg-teal-50 dark:bg-teal-900/30 dark:text-teal-400 px-3 py-1.5 rounded-lg border border-teal-100 dark:border-teal-800 text-center">Connected to Campaign API</span>
             </div>
             
             {/* Using the actual working ScheduleSection logic component */}
             <div className="-mx-4 md:mx-0">
               <ScheduleSection settings={schedule} onChange={setSchedule} />
             </div>
             
             <div className="mt-8 pt-8 border-t border-slate-100 dark:border-slate-800 flex justify-end">
               <button className="flex items-center gap-2 bg-teal-700 hover:bg-teal-800 dark:bg-teal-600 dark:hover:bg-teal-700 text-white px-8 py-3.5 rounded-xl font-bold transition-all shadow-md hover:shadow-lg active:scale-95 text-lg w-full sm:w-auto justify-center">
                 <Zap className="w-5 h-5" />
                 Apply to Active Draft
               </button>
             </div>
           </div>
        </div>
        
        <div className="lg:col-span-5 space-y-6">
           {/* AI Optimization Notice */}
           <div className="bg-gradient-to-br from-slate-900 border border-slate-800 to-slate-800 dark:from-slate-950 dark:to-slate-900 p-8 rounded-3xl shadow-xl text-white">
             <div className="w-12 h-12 bg-teal-500/20 text-teal-400 rounded-xl flex items-center justify-center mb-6">
                <Clock className="w-6 h-6" />
             </div>
             <h3 className="text-xl font-black mb-3 text-white">Smart Delivery Active</h3>
             <p className="text-slate-400 font-medium leading-relaxed mb-6">
               When "Smart Optimize" is selected in the configuration panel, CampX AI analyzes 
               historical open rates and recipient timezones to send emails at the precise moment 
               each user is most likely to engage.
             </p>
             <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-1">Avg Lift in Open Rate</p>
                  <p className="text-2xl font-black text-emerald-400">+14.2%</p>
                </div>
                <ArrowRight className="w-6 h-6 text-slate-600" />
             </div>
           </div>

           {/* Upcoming Queue */}
           <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
             <h3 className="font-bold text-slate-900 dark:text-white text-lg mb-6 flex items-center gap-2">
               <Target className="w-5 h-5 text-teal-600 dark:text-teal-400" />
               Upcoming Queue
             </h3>
             <div className="space-y-4">
               {upcomingEvents.map((evt, idx) => (
                 <div key={idx} className="flex gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50 hover:border-teal-200 dark:hover:border-teal-800 transition-colors cursor-pointer group">
                    <div className="flex-shrink-0 text-center w-14 h-14 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center">
                       <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider leading-none">{evt.date.substring(0,3)}</span>
                       <span className="text-lg font-black text-slate-900 dark:text-white leading-tight">{evt.date === 'Today' || evt.date === 'Tomorrow' ? evt.date.substring(0,1) : evt.date.split(' ')[1]}</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-1">
                        <h4 className="font-bold text-slate-900 dark:text-white text-sm group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">{evt.name}</h4>
                        <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md ${evt.status === 'Queued' ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800' : evt.status === 'Active' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}>{evt.status}</span>
                      </div>
                      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1.5"><Clock className="w-3.5 h-3.5"/> {evt.time} • {evt.type}</p>
                    </div>
                 </div>
               ))}
             </div>
           </div>
        </div>
      </div>

    </motion.div>
  );
}
