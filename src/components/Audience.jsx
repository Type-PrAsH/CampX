import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Users, Filter, Plus, FileDown, Search, ArrowUpRight, Award, MapPin, Building2, ChevronLeft, ChevronRight } from 'lucide-react';

export default function Audience() {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 3;

  const allCustomers = [
    { id: "CUST-9012", name: "Elena Rostova", email: "elena@startup.io", loc: "San Francisco, CA", seg: "SaaS Founders", score: "94" },
    { id: "CUST-4421", name: "David Chen", email: "d.chen@enterprise.com", loc: "New York, NY", seg: "Enterprise", score: "88" },
    { id: "CUST-1129", name: "Sarah Jenkins", email: "sarah.j@acme.co", loc: "Austin, TX", seg: "SaaS Founders", score: "91" },
    { id: "CUST-8834", name: "Michael Chang", email: "m.chang@retailgroup.net", loc: "Chicago, IL", seg: "Churn Risk", score: "32" },
    { id: "CUST-7721", name: "Jessica Smith", email: "jessica@healthtech.org", loc: "Boston, MA", seg: "Enterprise", score: "85" },
    { id: "CUST-9923", name: "Robert Taylor", email: "rtaylor@corp.com", loc: "Seattle, WA", seg: "Enterprise", score: "78" },
    { id: "CUST-3312", name: "Amanda Lee", email: "amanda@startup.io", loc: "Austin, TX", seg: "SaaS Founders", score: "96" },
  ];

  const totalPages = Math.ceil(allCustomers.length / itemsPerPage);
  const paginatedCustomers = allCustomers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const segments = [
    { name: "SaaS Founders", count: "12,450", trend: "+12%", active: "85%", icon: Building2 },
    { name: "Enterprise Accounts", count: "3,200", trend: "+5%", active: "92%", icon: Award },
    { name: "Churn Risk Users", count: "890", trend: "-2%", active: "15%", icon: Users },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="p-4 md:p-8 max-w-[1400px] mx-auto space-y-8">
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            <Users className="w-8 h-8 text-teal-600 dark:text-teal-400" />
            Audience Intelligence
          </h2>
          <p className="text-slate-500 dark:text-slate-400 font-medium mt-1">
            Manage your AI-enriched customer cohorts and behavioral segments.
          </p>
        </div>
        <div className="flex items-center gap-3">
           <button onClick={() => alert("This feature will be available soon.")} className="flex items-center gap-2 px-4 py-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 rounded-xl font-bold shadow-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
              <FileDown className="w-4 h-4" />
              Export CSV
           </button>
           <button onClick={() => alert("This feature will be available soon.")} className="flex items-center gap-2 px-4 py-2 bg-teal-700 hover:bg-teal-800 dark:bg-teal-600 dark:hover:bg-teal-700 text-white rounded-xl font-bold shadow-sm transition-colors active:scale-95">
              <Plus className="w-4 h-4" />
              Import List
           </button>
        </div>
      </div>

      {/* Cohort Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         {segments.map((seg, idx) => (
           <div key={idx} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm hover:shadow-md transition-all">
             <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-900/30 flex items-center justify-center mb-4">
                <seg.icon className="w-5 h-5 text-teal-600 dark:text-teal-400" />
             </div>
             <p className="text-sm font-bold text-slate-500 dark:text-slate-400">{seg.name}</p>
             <div className="flex items-baseline justify-between mt-2">
                <h3 className="text-3xl font-black text-slate-900 dark:text-white">{seg.count}</h3>
                <span className={`text-xs font-black uppercase tracking-wider px-2 py-1 rounded-lg ${seg.trend.startsWith('+') ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800/50' : 'bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-800/50'}`}>
                  {seg.trend}
                </span>
             </div>
             <div className="mt-4 flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
               <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 flex-1 overflow-hidden">
                 <div className="bg-teal-500 h-1.5 rounded-full" style={{ width: seg.active }} />
               </div>
               <span>{seg.active} Active</span>
             </div>
           </div>
         ))}
      </div>

      {/* Data Table Area */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
        <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50 dark:bg-slate-950/50">
           <h3 className="font-bold text-slate-900 dark:text-white text-lg">Central Database</h3>
           <div className="flex items-center gap-3">
             <div className="relative">
               <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
               <input type="text" placeholder="Search customer records..." className="pl-9 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:ring-2 focus:ring-teal-500 outline-none w-full sm:w-64" />
             </div>
             <button onClick={() => alert("This feature will be available soon.")} className="px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-teal-600 dark:hover:text-teal-400 font-bold text-sm shadow-sm flex items-center gap-2 transition-colors">
               <Filter className="w-4 h-4" /> Filters
             </button>
           </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
             <thead>
               <tr className="border-b border-slate-100 dark:border-slate-800 text-xs uppercase tracking-widest font-black text-slate-400 dark:text-slate-500">
                 <th className="px-6 py-4 font-black">Customer ID</th>
                 <th className="px-6 py-4 font-black">Name & Contact</th>
                 <th className="px-6 py-4 font-black">Location</th>
                 <th className="px-6 py-4 font-black">Segment</th>
                 <th className="px-6 py-4 font-black">AI Lead Score</th>
               </tr>
             </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                {paginatedCustomers.map((row, i) => (
                  <tr key={row.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                    <td className="px-6 py-4 text-sm font-bold text-slate-500 dark:text-slate-400">{row.id}</td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-bold text-slate-900 dark:text-white">{row.name}</p>
                      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">{row.email}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-slate-400"/> {row.loc}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-[10px] font-black uppercase tracking-widest text-teal-700 dark:text-teal-400 bg-teal-50 dark:bg-teal-900/30 border border-teal-100 dark:border-teal-800/50 px-2 py-1 rounded-md">{row.seg}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black ${parseInt(row.score) > 80 ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400'}`}>
                          {row.score}
                        </div>
                        <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
          </table>
        </div>
        <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 flex items-center justify-between">
           <p className="text-xs font-bold text-slate-500 dark:text-slate-400">
             Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, allCustomers.length)} of {allCustomers.length} entries
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
