import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Activity, Sparkles, CheckCircle2, Search, Filter, Terminal, ShieldAlert, Cpu, ChevronLeft, ChevronRight, Send, Inbox } from 'lucide-react';
import { getCampaignHistory } from '../services/campaignx';

export default function ActivityLogs() {
  const campaignIds = getCampaignHistory();

  // Build real log entries from actual campaign history
  const logs = campaignIds.length > 0
    ? campaignIds
        .slice()
        .reverse()
        .map((cid, idx) => ({
          id: cid,
          time: idx === 0 ? "Most recent" : `Campaign #${campaignIds.length - idx}`,
          icon: Send,
          color: "text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10",
          title: "Campaign Dispatched",
          detail: `Campaign ${cid} was dispatched via the CampaignX API. Check the Analytics & Trends page for its performance report.`,
          type: "Execution",
        }))
    : [];

  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const itemsPerPage = 5;

  const filteredLogs = searchQuery.trim()
    ? logs.filter(l =>
        l.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        l.detail.toLowerCase().includes(searchQuery.toLowerCase()) ||
        l.id.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : logs;

  const totalPages = Math.max(1, Math.ceil(filteredLogs.length / itemsPerPage));
  const paginatedLogs = filteredLogs.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="p-4 md:p-8 max-w-[1200px] mx-auto space-y-6">
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            <Activity className="w-8 h-8 text-teal-600 dark:text-teal-400" />
            Agent Activity Logs
          </h2>
          <p className="text-slate-500 dark:text-slate-400 font-medium mt-1">
            Real campaign dispatch history from your CampaignX session.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
             <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
             <input
               type="text"
               value={searchQuery}
               onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1); }}
               placeholder="Search logs..."
               className="pl-9 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:ring-2 focus:ring-teal-500 outline-none w-64 shadow-sm"
             />
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950/50">
           <h3 className="font-bold text-slate-900 dark:text-white">System Events</h3>
           <span className="text-xs font-black uppercase tracking-widest text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-900/30 px-3 py-1 rounded-lg border border-teal-100 dark:border-teal-800">
             {campaignIds.length} Campaign{campaignIds.length !== 1 ? 's' : ''} on Record
           </span>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800/50">
          {paginatedLogs.length > 0 ? paginatedLogs.map((log) => (
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
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400 leading-relaxed break-all">{log.detail}</p>
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <span className="text-xs font-bold text-slate-400 dark:text-slate-500">{log.time}</span>
              </div>
            </div>
          )) : (
            <div className="p-16 flex flex-col items-center justify-center text-center gap-4">
              <Inbox className="w-12 h-12 text-slate-300 dark:text-slate-600" />
              <div>
                <p className="font-bold text-slate-500 dark:text-slate-400 text-lg">No activity recorded yet</p>
                <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">
                  {searchQuery ? 'No logs match your search.' : 'Dispatch a campaign from the Campaign Workspace to see activity here.'}
                </p>
              </div>
            </div>
          )}
        </div>
        
        {filteredLogs.length > itemsPerPage && (
          <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 flex items-center justify-between">
             <p className="text-xs font-bold text-slate-500 dark:text-slate-400">
               Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredLogs.length)} of {filteredLogs.length} logs
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
        )}
      </div>
    </motion.div>
  );
}
