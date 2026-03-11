import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import { UserCircle, Camera, Upload, Briefcase, Mail, Building, CheckCircle2 } from 'lucide-react';

export default function Profile() {
  const [formData, setFormData] = useState({
    fullName: "Sarah Jenkins",
    email: "sarah.j@acme.co",
    role: "Head of Marketing",
    company: "Acme Corp"
  });
  
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [isSaved, setIsSaved] = useState(false);
  const fileInputRef = useRef(null);

  // Load from local storage on mount
  useEffect(() => {
    const savedProfile = localStorage.getItem('campx_profile');
    if (savedProfile) {
      try {
        const parsed = JSON.parse(savedProfile);
        setFormData(parsed);
        if (parsed.profilePhoto) {
          setProfilePhoto(parsed.profilePhoto);
        }
      } catch (e) {
        console.error("Failed to parse profile data");
      }
    }
  }, []);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setIsSaved(false);
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePhoto(reader.result);
        setIsSaved(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    localStorage.setItem('campx_profile', JSON.stringify({ ...formData, profilePhoto }));
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000); // Auto-hide success
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="p-4 md:p-8 max-w-[800px] mx-auto space-y-8 pb-24">
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            <UserCircle className="w-8 h-8 text-teal-600 dark:text-teal-400" />
            Your Profile
          </h2>
          <p className="text-slate-500 dark:text-slate-400 font-medium mt-1">
            Manage your personal information and preferences.
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-6 md:p-8 space-y-8">
          
          {/* Photo Upload Section */}
          <div className="flex flex-col sm:flex-row items-center gap-6 pb-8 border-b border-slate-100 dark:border-slate-800">
             <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
               {profilePhoto ? (
                 <img src={profilePhoto} alt="Profile" className="w-24 h-24 rounded-full object-cover border-4 border-slate-50 dark:border-slate-800 shadow-sm" />
               ) : (
                 <div className="w-24 h-24 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center border-4 border-slate-50 dark:border-slate-800 shadow-sm">
                   <UserCircle className="w-12 h-12 text-slate-300 dark:text-slate-600" />
                 </div>
               )}
               <div className="absolute inset-0 bg-slate-900/40 rounded-full flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera className="w-6 h-6 text-white mb-1" />
                  <span className="text-[9px] font-bold text-white uppercase tracking-wider">Change</span>
               </div>
               <input type="file" ref={fileInputRef} onChange={handlePhotoUpload} accept="image/*" className="hidden" />
             </div>
             <div className="text-center sm:text-left">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Profile Picture</h3>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1 max-w-sm">
                   Upload a new avatar to personalize your account. Supported formats: JPG, PNG, GIF.
                </p>
                <div className="mt-3 flex gap-2 justify-center sm:justify-start">
                   <button onClick={() => fileInputRef.current?.click()} className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-sm font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center gap-2">
                     <Upload className="w-4 h-4" /> Upload New
                   </button>
                   {profilePhoto && (
                     <button onClick={() => { setProfilePhoto(null); setIsSaved(false); }} className="px-4 py-2 bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 rounded-xl text-sm font-bold hover:bg-rose-100 dark:hover:bg-rose-900/50 transition-colors">
                       Remove
                     </button>
                   )}
                </div>
             </div>
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Full Name</label>
                <div className="relative">
                   <UserCircle className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                   <input 
                      type="text" 
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-teal-600 dark:focus:ring-teal-500 outline-none transition-all text-sm font-medium dark:text-slate-200"
                   />
                </div>
             </div>
             
             <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Email Address</label>
                <div className="relative">
                   <Mail className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                   <input 
                      type="email" 
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-teal-600 dark:focus:ring-teal-500 outline-none transition-all text-sm font-medium dark:text-slate-200"
                   />
                </div>
             </div>

             <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Role / Position</label>
                <div className="relative">
                   <Briefcase className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                   <input 
                      type="text" 
                      name="role"
                      value={formData.role}
                      onChange={handleChange}
                      className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-teal-600 dark:focus:ring-teal-500 outline-none transition-all text-sm font-medium dark:text-slate-200"
                   />
                </div>
             </div>

             <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Company</label>
                <div className="relative">
                   <Building className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                   <input 
                      type="text" 
                      name="company"
                      value={formData.company}
                      onChange={handleChange}
                      className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-teal-600 dark:focus:ring-teal-500 outline-none transition-all text-sm font-medium dark:text-slate-200"
                   />
                </div>
             </div>
          </div>
          
          <div className="pt-4 flex justify-end border-t border-slate-100 dark:border-slate-800">
             <button
               onClick={handleSave}
               className="flex items-center gap-2 bg-teal-700 hover:bg-teal-800 dark:bg-teal-600 dark:hover:bg-teal-700 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-md hover:shadow-lg active:scale-95"
             >
               {isSaved ? <CheckCircle2 className="w-5 h-5" /> : null}
               {isSaved ? "Saved Successfully" : "Save Changes"}
             </button>
          </div>

        </div>
      </div>
    </motion.div>
  );
}
