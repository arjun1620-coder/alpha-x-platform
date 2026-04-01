"use client";

import { useState, useEffect } from "react";
import { User, Mail, Phone, Lock, Save, Loader2, X, Shield, Users, LogOut, Trash2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function ProfileIcon() {
  const [isOpen, setIsOpen] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [member, setMember] = useState<any>(null);
  const [admin, setAdmin] = useState<any>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [message, setMessage] = useState("");

  const [formData, setFormData] = useState({
    full_name: "",
    mobile_number: "",
    password: ""
  });

  useEffect(() => {
    const role = localStorage.getItem('userRole');
    setUserRole(role);
    if (role === 'member') {
      const stored = localStorage.getItem('memberData');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setMember(parsed);
          setFormData({
            full_name: parsed.full_name || "",
            mobile_number: parsed.mobile_number || "",
            password: parsed.password || "" 
          });
        } catch(e) {}
      }
    } else if (role === 'admin') {
      fetchAdminData();
    }
  }, []);

  const fetchAdminData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data } = await supabase.from('admins').select('*').eq('email', user.email).single();
      if (data) {
        setAdmin(data);
        setFormData(prev => ({ ...prev, full_name: data.full_name }));
        localStorage.setItem('adminName', data.full_name);
      } else {
        // Create initial admin record if missing
        const { data: newAdmin } = await supabase.from('admins').insert({
          full_name: "New Admin Agent",
          email: user.email
        }).select().single();
        if (newAdmin) {
            setAdmin(newAdmin);
            setFormData(prev => ({ ...prev, full_name: newAdmin.full_name }));
            localStorage.setItem('adminName', newAdmin.full_name);
        }
      }
    }
  };

  // Fetch true member details whenever opened
  useEffect(() => {
    if (isOpen) {
      if (userRole === 'member' && member?.id) {
         supabase.from('applications').select('*').eq('id', member.id).single()
         .then(({ data }) => {
           if (data) {
             setMember(data);
             setFormData({
               full_name: data.full_name || "",
               mobile_number: data.mobile_number || "",
               password: data.password || ""
             });
             localStorage.setItem('memberData', JSON.stringify(data));
           }
         });
      } else if (userRole === 'admin') {
         fetchAdminData();
      }
    }
  }, [isOpen, userRole, member?.id]);

  const handleSave = async (e: React.FormEvent) => {
     e.preventDefault();
     setIsUpdating(true);
     setMessage("");

     if (userRole === 'member') {
       // Update member
       const { error } = await supabase.from('applications').update({
         mobile_number: formData.mobile_number,
         password: formData.password
       }).eq('id', member.id);

       if (error) {
         setMessage("Error updating profile.");
       } else {
         setMessage("Profile updated successfully!");
         const { data } = await supabase.from('applications').select('*').eq('id', member.id).single();
         if (data) {
           setMember(data);
           localStorage.setItem('memberData', JSON.stringify(data));
         }
       }
     } else if (userRole === 'admin') {
       // Update admin name
       const { error } = await supabase.from('admins')
         .update({ full_name: formData.full_name })
         .eq('email', admin.email);
       
       if (error) {
         setMessage("Error updating admin profile.");
       } else {
         setMessage("Admin identity updated successfully!");
         localStorage.setItem('adminName', formData.full_name);
         fetchAdminData();
       }
     }
     
     setIsUpdating(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.clear();
    window.location.href = "/login";
  };

  const handleLeaveAlphaX = async () => {
    if (!confirm("Caution: Are you sure you want to LEAVE ALPHAX forever? This will permanently delete your member status and all your data. This action CANNOT be undone.")) return;
    
    setIsUpdating(true);
    try {
      if (userRole === 'member' && member?.id) {
        const { error } = await supabase.from('applications').delete().eq('id', member.id);
        if (error) throw error;
      }
      handleLogout();
    } catch (err: any) {
      console.error(err);
      setMessage("ERROR: Termination sequence failed. Contact Lab Support.");
      setIsUpdating(false);
    }
  };

  if (!userRole) return null;

  return (
    <>
      {/* Role badge shown at top-left */}
      <div className={`fixed top-6 left-6 z-50 flex items-center gap-2 px-4 py-2 rounded-full shadow-[0_0_15px_rgba(255,255,255,0.1)] transition-all ${
        userRole === 'admin' ? "bg-indigo-500/20 border border-indigo-500/30" : "bg-slate-500/20 border border-slate-500/30"
      }`}>
        {userRole === 'admin' ? <Shield className="w-4 h-4 text-indigo-400" /> : <Users className="w-4 h-4 text-slate-400" />}
        <span className={`font-bold text-xs tracking-widest uppercase ${userRole === 'admin' ? "text-indigo-300" : "text-slate-300"}`}>
            {userRole}
        </span>
      </div>

      {/* Profile icon at top-right */}
      <button 
        title="Profile Settings"
        onClick={() => setIsOpen(true)}
        className="fixed top-6 right-6 z-50 w-12 h-12 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-bold hover:bg-indigo-500 hover:text-black transition-all shadow-[0_0_15px_rgba(99,102,241,0.2)] hover:scale-105 active:scale-95"
      >
        <User className="w-5 h-5" />
      </button>

      {isOpen && (
         <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsOpen(false)} />
            
            <div className="relative w-full max-w-md bg-[#080d1a]/90 backdrop-blur-xl border border-white/10 rounded-2xl p-6 md:p-8 shadow-2xl">
               <button title="Close" onClick={() => setIsOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors">
                  <X className="w-5 h-5" />
               </button>

               <div className="flex items-center gap-4 mb-6 pb-6 border-b border-white/10">
                 <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-400 to-slate-600 flex items-center justify-center text-black font-bold text-xl uppercase shadow-inner">
                   {(userRole === 'member' ? member?.full_name : admin?.full_name)?.substring(0,2) || "AX"}
                 </div>
                 <div>
                   <h2 className="text-xl font-bold text-white tracking-tight">
                     {userRole === 'member' ? member?.full_name : admin?.full_name || "Admin"}
                   </h2>
                   <p className="text-sm text-slate-400 font-medium flex items-center gap-1.5 mt-1">
                     {userRole === 'admin' ? <Shield className="w-3.5 h-3.5 text-indigo-400" /> : <Users className="w-3.5 h-3.5 text-slate-400" />}
                     {userRole === 'admin' ? "System Admin" : "Lab Member"}
                   </p>
                 </div>
               </div>

               <form onSubmit={handleSave} className="space-y-4">
                 {userRole === 'admin' && (
                  <div className="space-y-1">
                    <label className="text-xs font-bold tracking-wider text-gray-500 uppercase">Admin Display Name</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                      <input 
                        aria-label="Full Name"
                        title="Full Name"
                        type="text"
                        required
                        value={formData.full_name} 
                        onChange={e => setFormData({...formData, full_name: e.target.value})} 
                        className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500 transition-all shadow-inner" 
                        placeholder="e.g. Director Stark"
                      />
                    </div>
                    <p className="text-[10px] text-gray-600 font-medium">This name will be shown when you post announcements or chat with teams.</p>
                  </div>
                 )}

                 <div className="space-y-1">
                   <label className="text-xs font-bold tracking-wider text-gray-500 uppercase">Email</label>
                   <div className="relative">
                     <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                     <input aria-label="Email" title="Email" disabled value={userRole === 'member' ? member?.email : admin?.email || "N/A"} className="w-full bg-[#030712] border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-gray-400 cursor-not-allowed" />
                   </div>
                 </div>

                 {userRole === 'member' && (
                   <>
                    <div className="space-y-1">
                      <label className="text-xs font-bold tracking-wider text-gray-500 uppercase">Mobile Number</label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                        <input 
                            aria-label="Mobile Number"
                            title="Mobile Number"
                            type="tel"
                            required
                            value={formData.mobile_number} 
                            onChange={e => setFormData({...formData, mobile_number: e.target.value})} 
                            className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500 transition-all shadow-inner" 
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold tracking-wider text-gray-500 uppercase">Password</label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                        <input 
                            aria-label="Password"
                            title="Password"
                            type="password"
                            placeholder="Custom password (or leave for default tracking ID)"
                            value={formData.password} 
                            onChange={e => setFormData({...formData, password: e.target.value})} 
                            className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500 transition-all shadow-inner" 
                        />
                      </div>
                    </div>
                   </>
                 )}

                 {message && (
                   <div className={`p-3 rounded-xl border ${message.includes('Error') ? 'bg-red-500/10 border-red-500/20 text-red-400' : 'bg-green-500/10 border-green-500/20 text-green-400'} text-sm font-medium`}>
                     {message}
                   </div>
                 )}

                  <button 
                    type="submit" 
                    disabled={isUpdating}
                    className="w-full mt-4 flex items-center justify-center gap-2 bg-indigo-500 text-black py-4 rounded-xl font-black uppercase tracking-widest hover:bg-indigo-400 transition-all active:scale-95 disabled:opacity-50"
                  >
                    {isUpdating ? <Loader2 className="w-5 h-5 animate-spin"/> : <Save className="w-5 h-5" />}
                    {isUpdating ? "TRANSFORMING..." : "SAVE SETTINGS"}
                  </button>

                  <div className="pt-6 border-t border-white/10 flex flex-col gap-3">
                    <button 
                      type="button" 
                      onClick={handleLogout}
                      className="w-full flex items-center justify-center gap-2 bg-slate-500/10 border border-slate-500/30 text-slate-300 py-3 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-slate-500/20 transition-all"
                    >
                      <LogOut className="w-4 h-4" /> Sign Out
                    </button>
                    
                    {userRole === 'member' && (
                      <button 
                        type="button" 
                        onClick={handleLeaveAlphaX}
                        className="w-full flex items-center justify-center gap-2 bg-red-500/10 border border-red-500/30 text-red-500 py-3 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-red-500/20 transition-all"
                      >
                        <Trash2 className="w-4 h-4" /> Leave AlphaX
                      </button>
                    )}
                  </div>
                </form>
            </div>
         </div>
      )}
    </>
  );
}
