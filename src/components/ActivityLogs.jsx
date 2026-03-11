import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Activity, Sparkles, CheckCircle2, Search, Filter, Terminal, ShieldAlert, Cpu, ChevronLeft, ChevronRight } from 'lucide-react';

export default function ActivityLogs() {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const logs = [
    { id: "log-1", time: "10:24 AM", icon: CheckCircle2, color: "text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10", title: "Campaign Dispatched", detail: "'Feature Release' successfully sent to 14,200 users via SES endpoint.", type: "Execution" },
    { id: "log-2", time: "10:23 AM", icon: Cpu, color: "text-teal-600 bg-teal-50 dark:bg-teal-600/10", title: "Dynamic Send Time Optimization", detail: "AI adjusted send schedule based on real-time engagement patterns for 'Tech Professionals' segment.", type: "Optimization" },
    { id: "log-3", time: "10:15 AM", icon: ShieldAlert, color: "text-amber-500 bg-amber-50 dark:bg-amber-500/10", title: "Bounce Rate Warning", detail: "Detected 2.4% hard bounce rate in the 'Legacy Enterprise' cohort. Initiating list cleaning sequence.", type: "System" },
    { id: "log-4", time: "09:45 AM", icon: Sparkles, color: "text-indigo-500 bg-indigo-50 dark:bg-indigo-500/10", title: "A/B Test Concluded", detail: "Subject line variant B ('Maximize Your ROI') outperformed variant A by 18%. Applying winner.", type: "AI Agent" },
    { id: "log-5", time: "09:00 AM", icon: Terminal, color: "text-slate-500 bg-slate-100 dark:bg-slate-800", title: "Daily Sync Complete", detail: "Synchronized 4,500 new customer records from CRM API.", type: "System" },
    { id: "log-6", time: "Yesterday, 4:30 PM", icon: Sparkles, color: "text-teal-600 bg-teal-50 dark:bg-teal-600/10", title: "Strategy Generated", detail: "AI crafted comprehensive 3-step drip campaign for 'Churn Prevention'.", type: "AI Agent" },
    { id: "log-7", time: "Yesterday, 3:15 PM", icon: CheckCircle2, color: "text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10", title: "Campaign Dispatched", detail: "'Webinar Invite' sent to 8,900 users.", type: "Execution" },
    { id: "log-8", time: "Oct 12, 11:00 AM", icon: ShieldAlert, color: "text-amber-500 bg-amber-50 dark:bg-amber-500/10", title: "API Quota Warning", detail: "Approaching 90% of monthly email sending limits.", type: "System" },
    { id: "log-9", time: "Oct 12, 09:30 AM", icon: Terminal, color: "text-slate-500 bg-slate-100 dark:bg-slate-800", title: "CRM Reconnected", detail: "Successfully re-authenticated with Salesforce API token.", type: "System" },
  ];

  const totalPages = Math.ceil(logs.length / itemsPerPage);
  const paginatedLogs = logs.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="p-4 md:p-8 max-w-[1200px] mx-auto space-y-6">
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            <Activity className="w-8 h-8 text-teal-600 dark:text-teal-400" />
            Agent Activity Logs
          </h2>
          <p className="text-slate-500 dark:text-slate-400 font-medium mt-1">
            Real-time audit trail of all autonomous and manual system actions.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
             <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
             <input type="text" placeholder="Search logs..." className="pl-9 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:ring-2 focus:ring-teal-500 outline-none w-64 shadow-sm" />
          </div>
          <button onClick={() => alert("This feature will be available soon.")} className="p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-500 hover:text-teal-600 shadow-sm transition-colors">
             <Filter className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950/50">
           <h3 className="font-bold text-slate-900 dark:text-white">System Events</h3>
           <span className="text-xs font-black uppercase tracking-widest text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-900/30 px-3 py-1 rounded-lg border border-teal-100 dark:border-teal-800">Live Connection</span>
        </div>
        <div className="divide-y divide-slate-100 dark:divide-slate-800/50">
          {paginatedLogs.map((log) => (
            <div key={log.id} className="p-6 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors flex flex-col md:flex-row gap-4 items-start md:items-center justify-between group">
              <div className="flex items-start gap-4 flex-1">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${log.color} ring-4 ring-white dark:ring-slate-900 group-hover:scale-110 transition-transform`}>
                  <log.icon className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-bold text-slate-900 dark:text-white">{log.title}</h4>
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">{log.type}</span>
                  </div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400 leading-relaxed">{log.detail}</p>
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <span className="text-xs font-bold text-slate-400 dark:text-slate-500">{log.time}</span>
              </div>
            </div>
          ))}
        </div>
        
        {/* Pagination Controls */}
        <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 flex items-center justify-between">
           <p className="text-xs font-bold text-slate-500 dark:text-slate-400">
             Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, logs.length)} of {logs.length} logs
           </p>
           <div className="flex items-center gap-2">
             <button 
               onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
               disabled={currentPage === 1}
               className="p-1.5 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
             >
               <ChevronLeft className="w-5 h-5" />
             </button>
             
             {Array.from({ length: totalPages }).map((_, idx) => {
               const page = idx + 1;
               return (
                 <button 
                   key={page}
                   onClick={() => setCurrentPage(page)}
                   className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${currentPage === page ? 'text-white bg-teal-600 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'}`}
                 >
                   {page}
                 </button>
               );
             })}

             <button 
               onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
               disabled={currentPage === totalPages}
               className="p-1.5 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
             >
               <ChevronRight className="w-5 h-5" />
             </button>
           </div>
        </div>
      </div>
    </motion.div>
  );
}
