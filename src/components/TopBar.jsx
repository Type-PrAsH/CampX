import React, { useState, useRef, useEffect } from 'react';
import { 
  Sun, Moon, Bell, Search, UserCircle, 
  Settings, LogOut, CheckCircle2,
  Sparkles, Terminal, Users, Activity, MessageSquare, TrendingUp, BarChart2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { getCampaignHistory } from '../services/campaignx';

// Real navigation items for the search bar
const NAV_SEARCH_ITEMS = [
  { id: 'n1', type: 'Section', title: 'Dashboard', icon: Activity, route: 'dashboard' },
  { id: 'n2', type: 'Section', title: 'Campaign Workspace', icon: MessageSquare, route: 'campaign' },
  { id: 'n3', type: 'Section', title: 'Audience Intelligence', icon: Users, route: 'audience' },
  { id: 'n4', type: 'Section', title: 'Analytics & Trends', icon: TrendingUp, route: 'trends' },
  { id: 'n5', type: 'Section', title: 'Agent Activity Logs', icon: Terminal, route: 'activity-logs' },
  { id: 'n6', type: 'Section', title: 'Settings', icon: Settings, route: 'settings' },
  { id: 'n7', type: 'Section', title: 'Marketing Copilot', icon: Sparkles, route: 'copilot' },
];

export default function TopBar({ isDarkMode, toggleTheme, onNavigate }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const searchRef = useRef(null);
  const notificationsRef = useRef(null);
  const profileRef = useRef(null);

  const unreadCount = notifications.filter(n => !n.read).length;

  // Build real notifications from campaign history in localStorage
  useEffect(() => {
    const ids = getCampaignHistory();
    if (ids.length > 0) {
      const realNotifications = ids.slice().reverse().slice(0, 5).map((cid, idx) => ({
        id: cid,
        title: "Campaign Dispatched",
        description: `Campaign ${cid} was sent via the CampaignX API.`,
        time: idx === 0 ? "Recently" : `Earlier`,
        read: idx > 0,
        icon: CheckCircle2,
        color: "text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10",
      }));
      setNotifications(realNotifications);
    }
  }, []);

  // Filter search results against real nav items
  const filteredResults = searchQuery.trim() === '' 
    ? [] 
    : NAV_SEARCH_ITEMS.filter(r => 
        r.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        r.type.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 5);

  // Close dropdowns on outside click or Escape
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) setIsSearchOpen(false);
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) setIsNotificationsOpen(false);
      if (profileRef.current && !profileRef.current.contains(event.target)) setIsProfileOpen(false);
    };

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setIsSearchOpen(false);
        setIsNotificationsOpen(false);
        setIsProfileOpen(false);
        setFocusedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Search keyboard navigation
  const handleSearchKeyDown = (e) => {
    if (!isSearchOpen || filteredResults.length === 0) return;
    
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setFocusedIndex(prev => (prev < filteredResults.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setFocusedIndex(prev => (prev > 0 ? prev - 1 : 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (focusedIndex >= 0 && focusedIndex < filteredResults.length) {
        handleSearchSelect(filteredResults[focusedIndex]);
      } else if (filteredResults.length > 0) {
        handleSearchSelect(filteredResults[0]);
      }
    }
  };

  const handleSearchSelect = (result) => {
    onNavigate(result.route);
    setIsSearchOpen(false);
    setSearchQuery('');
    setFocusedIndex(-1);
  };

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const handleLogout = () => {
    localStorage.removeItem('campx_profile');
    window.location.reload();
  };

  // Load profile summary for top right
  const [profileSummary, setProfileSummary] = useState({ name: "User", role: "Member" });
  useEffect(() => {
    const saved = localStorage.getItem('campx_profile');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setProfileSummary({ name: parsed.fullName || "User", role: parsed.role || "Member", photo: parsed.profilePhoto });
      } catch(e) {}
    }
  }, []);

  return (
    <div className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-6 sticky top-0 z-40 transition-colors duration-300 flex-shrink-0">
      <div className="flex items-center gap-4 flex-1">
        {/* Search Bar */}
        <div ref={searchRef} className="relative w-full max-w-md hidden md:block">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsSearchOpen(true);
                setFocusedIndex(-1);
              }}
              onFocus={() => setIsSearchOpen(true)}
              onKeyDown={handleSearchKeyDown}
              placeholder="Search sections, campaigns, audience..." 
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg pl-9 pr-4 py-2 text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-transparent transition-all"
            />
          </div>

          {/* Search Dropdown */}
          <AnimatePresence>
            {isSearchOpen && searchQuery.trim() !== '' && (
              <motion.div 
                initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 5 }} transition={{ duration: 0.15 }}
                className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl overflow-hidden z-50 py-2"
              >
                {filteredResults.length > 0 ? (
                  filteredResults.map((result, index) => (
                    <button
                      key={result.id}
                      onClick={() => handleSearchSelect(result)}
                      className={`w-full text-left px-4 py-3 flex items-center gap-3 transition-colors ${focusedIndex === index ? 'bg-slate-50 dark:bg-slate-800' : 'hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                    >
                      <div className="w-8 h-8 rounded-lg bg-teal-50 dark:bg-teal-900/30 flex items-center justify-center flex-shrink-0 text-teal-600 dark:text-teal-400">
                        <result.icon className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900 dark:text-white">{result.title}</p>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-0.5">{result.type}</p>
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="px-4 py-8 text-center text-slate-500 dark:text-slate-400 text-sm font-medium">
                    No results found for "{searchQuery}"
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <button 
          onClick={toggleTheme}
          className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          title="Toggle Theme"
        >
          <AnimatePresence mode="wait" initial={false}>
            {isDarkMode ? (
              <motion.div key="moon" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}>
                <Moon className="w-5 h-5" />
              </motion.div>
            ) : (
              <motion.div key="sun" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }}>
                <Sun className="w-5 h-5" />
              </motion.div>
            )}
          </AnimatePresence>
        </button>

        {/* Notifications Dropdown */}
        <div ref={notificationsRef} className="relative">
          <button 
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            className={`relative p-2 rounded-xl transition-colors ${isNotificationsOpen ? 'bg-teal-50 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-2 right-2.5 w-2 h-2 rounded-full bg-rose-500 border border-white dark:border-slate-900" />
            )}
          </button>
          
          <AnimatePresence>
            {isNotificationsOpen && (
              <motion.div 
                initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.95 }} transition={{ duration: 0.15 }}
                className="absolute top-full right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl overflow-hidden z-50 origin-top-right flex flex-col max-h-[80vh]"
              >
                <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950/50">
                  <h3 className="font-bold text-slate-900 dark:text-white">Notifications</h3>
                  {unreadCount > 0 && (
                    <button onClick={markAllRead} className="text-xs font-bold text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300">
                      Mark all as read
                    </button>
                  )}
                </div>
                <div className="overflow-y-auto overflow-x-hidden flex-1 divide-y divide-slate-100 dark:divide-slate-800/50">
                  {notifications.length > 0 ? notifications.map(notification => (
                    <div key={notification.id} className={`p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors flex gap-4 ${!notification.read ? 'bg-teal-50/30 dark:bg-teal-900/10' : ''}`}>
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${notification.color}`}>
                        <notification.icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h4 className={`font-bold text-sm truncate ${!notification.read ? 'text-slate-900 dark:text-white' : 'text-slate-700 dark:text-slate-300'}`}>{notification.title}</h4>
                          <span className="text-xs font-bold text-slate-400 flex-shrink-0 whitespace-nowrap">{notification.time}</span>
                        </div>
                        <p className="text-xs font-medium text-slate-500 dark:text-slate-400 leading-relaxed break-all">{notification.description}</p>
                      </div>
                      {!notification.read && <div className="w-2 h-2 rounded-full bg-teal-500 mt-1.5 flex-shrink-0" />}
                    </div>
                  )) : (
                    <div className="p-8 text-center text-slate-500 dark:text-slate-400 text-sm font-medium">
                      No notifications yet. Dispatch a campaign to see activity here.
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="h-8 w-px bg-slate-200 dark:bg-slate-800 mx-1" />

        {/* Profile Dropdown */}
        <div ref={profileRef} className="relative">
          <button 
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-800 p-1.5 rounded-xl transition-colors text-left"
          >
            {profileSummary.photo ? (
              <img src={profileSummary.photo} alt="Profile" className="w-8 h-8 rounded-full object-cover border border-slate-200 dark:border-slate-700" />
            ) : (
              <UserCircle className="w-8 h-8 text-slate-400 dark:text-slate-500" />
            )}
            <div className="hidden md:block">
              <p className="text-sm font-bold text-slate-800 dark:text-white leading-none truncate max-w-[120px]">{profileSummary.name}</p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 uppercase tracking-wider font-semibold truncate max-w-[120px]">{profileSummary.role}</p>
            </div>
          </button>

          <AnimatePresence>
            {isProfileOpen && (
              <motion.div 
                initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.95 }} transition={{ duration: 0.15 }}
                className="absolute top-full right-0 mt-2 w-56 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl overflow-hidden z-50 origin-top-right py-2"
              >
                <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 md:hidden">
                   <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{profileSummary.name}</p>
                   <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 uppercase tracking-wider font-semibold truncate">{profileSummary.role}</p>
                </div>
                
                <button 
                  onClick={() => { setIsProfileOpen(false); onNavigate('profile'); }}
                  className="w-full text-left px-4 py-2.5 flex items-center gap-3 text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
                >
                  <UserCircle className="w-4 h-4" /> View Profile
                </button>
                <button 
                  onClick={() => { setIsProfileOpen(false); onNavigate('settings'); }}
                  className="w-full text-left px-4 py-2.5 flex items-center gap-3 text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
                >
                  <Settings className="w-4 h-4" /> Account Settings
                </button>
                <button 
                  onClick={() => { 
                    setIsProfileOpen(false); 
                    toggleTheme(); 
                  }}
                  className="w-full text-left px-4 py-2.5 flex items-center gap-3 text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
                >
                  {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />} 
                  {isDarkMode ? "Light Mode" : "Dark Mode"}
                </button>
                
                <div className="h-px bg-slate-100 dark:bg-slate-800 my-2" />
                
                <button 
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2.5 flex items-center gap-3 text-sm font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors"
                >
                  <LogOut className="w-4 h-4" /> Log Out
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
