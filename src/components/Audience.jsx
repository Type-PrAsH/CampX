import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion } from 'motion/react';
import { Users, Filter, Plus, FileDown, Search, ArrowUpRight, Award, MapPin, Building2, ChevronLeft, ChevronRight, Loader2, BriefcaseBusiness, UserCircle2 } from 'lucide-react';
import { getCustomerCohort } from '../services/campaignx';

export default function Audience() {
  const [allCustomers, setAllCustomers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Load real customers exclusively from the CampaignX Cohort API
  useEffect(() => {
    async function loadCohort() {
      setIsLoading(true);
      try {
        const data = await getCustomerCohort();
        if (Array.isArray(data)) {
          setAllCustomers(data);
        } else {
          setAllCustomers([]);
        }
      } catch (e) {
        console.error('Audience API load error:', e);
        setAllCustomers([]);
      } finally {
        setIsLoading(false);
      }
    }
    loadCohort();
  }, []);

  // Real segment counts computed from CSV
  const segments = useMemo(() => {
    if (allCustomers.length === 0) return [];

    const genderCounts = {};
    const occupationCounts = {};
    allCustomers.forEach(row => {
      if (row.Gender) genderCounts[row.Gender.trim()] = (genderCounts[row.Gender.trim()] || 0) + 1;
      if (row.Occupation) occupationCounts[row.Occupation.trim()] = (occupationCounts[row.Occupation.trim()] || 0) + 1;
    });

    const topOcc = Object.entries(occupationCounts).sort((a, b) => b[1] - a[1]).slice(0, 2);

    return [
      {
        name: 'Total Cohort',
        count: allCustomers.length.toLocaleString(),
        trend: null,
        active: '100%',
        icon: Users,
      },
      ...Object.entries(genderCounts).map(([gender, count]) => ({
        name: `${gender} Customers`,
        count: count.toLocaleString(),
        trend: null,
        active: `${((count / allCustomers.length) * 100).toFixed(0)}%`,
        icon: UserCircle2,
      })),
      ...topOcc.map(([occ, count]) => ({
        name: occ,
        count: count.toLocaleString(),
        trend: null,
        active: `${((count / allCustomers.length) * 100).toFixed(0)}%`,
        icon: BriefcaseBusiness,
      })),
    ].slice(0, 3);
  }, [allCustomers]);

  // Filtered and paginated customers
  const filteredCustomers = useMemo(() => {
    if (!searchQuery.trim()) return allCustomers;
    const q = searchQuery.toLowerCase();
    return allCustomers.filter(c =>
      (c.Full_name || '').toLowerCase().includes(q) ||
      (c.Email || '').toLowerCase().includes(q) ||
      (c.City || '').toLowerCase().includes(q) ||
      (c.Occupation || '').toLowerCase().includes(q) ||
      (c.customer_id || '').toLowerCase().includes(q)
    );
  }, [allCustomers, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredCustomers.length / itemsPerPage));
  const paginatedCustomers = filteredCustomers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleSearch = useCallback((e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  }, []);

  // Score customers by age/income as a simple engagement proxy
  const getScore = (row) => {
    const income = parseInt(row.Monthly_Income, 10) || 0;
    const age = parseInt(row.Age, 10) || 30;
    const kyc = row['KYC status'] === 'Y' ? 20 : 0;
    const app = row.App_Installed === 'Y' ? 10 : 0;
    const social = row.Social_Media_Active === 'Y' ? 10 : 0;
    const incomeScore = Math.min(40, Math.floor(income / 10000));
    return Math.min(99, kyc + app + social + incomeScore + Math.max(0, 20 - Math.abs(age - 35)));
  };

  if (isLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center p-16 text-teal-600 dark:text-teal-400">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 animate-spin" />
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Loading customer cohort...</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="p-4 md:p-8 max-w-[1400px] mx-auto space-y-8">
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            <Users className="w-8 h-8 text-teal-600 dark:text-teal-400" />
            Audience Intelligence
          </h2>
          <p className="text-slate-500 dark:text-slate-400 font-medium mt-1">
            {allCustomers.length.toLocaleString()} real customers loaded from the CampaignX cohort.
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

      {/* Real Cohort Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         {segments.map((seg, idx) => (
           <div key={idx} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm hover:shadow-md transition-all">
             <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-900/30 flex items-center justify-center mb-4">
                <seg.icon className="w-5 h-5 text-teal-600 dark:text-teal-400" />
             </div>
             <p className="text-sm font-bold text-slate-500 dark:text-slate-400">{seg.name}</p>
             <div className="flex items-baseline justify-between mt-2">
                <h3 className="text-3xl font-black text-slate-900 dark:text-white">{seg.count}</h3>
                <span className="text-xs font-black uppercase tracking-wider px-2 py-1 rounded-lg bg-teal-50 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 border border-teal-100 dark:border-teal-800/50">
                  Real Data
                </span>
             </div>
             <div className="mt-4 flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
               <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 flex-1 overflow-hidden">
                 <div className="bg-teal-500 h-1.5 rounded-full" style={{ width: seg.active }} />
               </div>
               <span>{seg.active} of cohort</span>
             </div>
           </div>
         ))}
      </div>

      {/* Data Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
        <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50 dark:bg-slate-950/50">
           <h3 className="font-bold text-slate-900 dark:text-white text-lg">
             Central Database
             <span className="ml-2 text-xs font-normal text-slate-400">({filteredCustomers.length.toLocaleString()} records)</span>
           </h3>
           <div className="flex items-center gap-3">
             <div className="relative">
               <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
               <input
                 type="text"
                 value={searchQuery}
                 onChange={handleSearch}
                 placeholder="Search by name, email, city, occupation..."
                 className="pl-9 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:ring-2 focus:ring-teal-500 outline-none w-full sm:w-72"
               />
             </div>
           </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
             <thead>
               <tr className="border-b border-slate-100 dark:border-slate-800 text-xs uppercase tracking-widest font-black text-slate-400 dark:text-slate-500">
                 <th className="px-6 py-4 font-black">Customer ID</th>
                 <th className="px-6 py-4 font-black">Name & Contact</th>
                 <th className="px-6 py-4 font-black">Location</th>
                 <th className="px-6 py-4 font-black">Occupation</th>
                 <th className="px-6 py-4 font-black">Engagement Score</th>
               </tr>
             </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                {paginatedCustomers.length > 0 ? paginatedCustomers.map((row, i) => {
                  const score = getScore(row);
                  return (
                    <tr key={row.customer_id || i} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                      <td className="px-6 py-4 text-sm font-bold text-slate-500 dark:text-slate-400">{row.customer_id || '—'}</td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-bold text-slate-900 dark:text-white">{row.Full_name || row.name || '—'}</p>
                        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">{row.Email || row.email || '—'}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" /> {row.City || '—'}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-[10px] font-black uppercase tracking-widest text-teal-700 dark:text-teal-400 bg-teal-50 dark:bg-teal-900/30 border border-teal-100 dark:border-teal-800/50 px-2 py-1 rounded-md">
                          {row.Occupation || '—'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black ${score > 60 ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : score > 30 ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' : 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400'}`}>
                            {score}
                          </div>
                          <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </td>
                    </tr>
                  );
                }) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-slate-400 dark:text-slate-500 text-sm font-medium">
                      {searchQuery ? `No customers found matching "${searchQuery}"` : 'No customers loaded.'}
                    </td>
                  </tr>
                )}
              </tbody>
          </table>
        </div>

        <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 flex items-center justify-between">
           <p className="text-xs font-bold text-slate-500 dark:text-slate-400">
             Showing {filteredCustomers.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} to {Math.min(currentPage * itemsPerPage, filteredCustomers.length)} of {filteredCustomers.length.toLocaleString()} entries
           </p>
           <div className="flex items-center gap-2">
             <button 
               onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
               disabled={currentPage === 1}
               className="p-1.5 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
             >
               <ChevronLeft className="w-5 h-5" />
             </button>
             
             {/* Show limited page buttons */}
             {Array.from({ length: Math.min(5, totalPages) }).map((_, idx) => {
               const startPage = Math.max(1, Math.min(currentPage - 2, totalPages - 4));
               const page = startPage + idx;
               if (page > totalPages) return null;
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
             {totalPages > 5 && (
               <span className="text-xs text-slate-400 font-medium">… {totalPages}</span>
             )}

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
