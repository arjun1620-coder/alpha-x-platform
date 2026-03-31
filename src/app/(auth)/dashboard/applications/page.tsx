"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, Shield, XCircle, Search, Users, Activity, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function ApplicationsDashboard() {
  const [applications, setApplications] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // Fetch live applications from Supabase on mount
  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    const { data, error } = await supabase
      .from('applications')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Error fetching applications:", error);
    } else if (data) {
      setApplications(data);
    }
    setIsLoading(false);
  };

  const handleAction = async (id: string, action: "approved" | "rejected") => {
    // 1. Optimistic UI update (feels instant to the admin)
    setApplications(prev => 
      prev.map(app => 
        app.id === id ? { ...app, status: action } : app
      )
    );

    // 2. Perform the actual database update
    const { error } = await supabase
      .from('applications')
      .update({ status: action })
      .eq('id', id);

    if (error) {
      console.error("Failed to update status:", error);
      // Revert if error occurs by refreshing data
      fetchApplications();
    }
  };

  const filteredApps = applications.filter(app => 
    app.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    app.skills?.some((skill: string) => skill.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-transparent text-white selection:bg-emerald-500/30 overflow-hidden relative">
      <div className="flex h-screen">
        
        {/* Simplified Admin Sidebar */}
        <div className="w-64 border-r border-white/5 bg-[#080d1a] p-6 hidden md:flex flex-col">
          <div className="flex items-center gap-3 mb-12">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center">
              <span className="font-extrabold text-black text-xs tracking-tight">AX</span>
            </div>
            <span className="font-bold tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">
              ADMIN
            </span>
          </div>

          <nav className="space-y-2 flex-1">
            <Link href="/dashboard/applications" className="flex items-center gap-3 px-4 py-3 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-xl font-medium transition-all shadow-[0_0_15px_rgba(16,185,129,0.1)]">
              <Users className="w-5 h-5" />
              Applications
            </Link>
            <Link href="/dashboard/posts" className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl font-medium transition-all">
              <Activity className="w-5 h-5" />
              Post Management
            </Link>
          </nav>

          <Link href="/" className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl font-medium transition-all">
            <ArrowLeft className="w-5 h-5" />
            Sign Out
          </Link>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-auto p-8 lg:p-12 relative z-10 w-full">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-12">
            <div>
              <h1 className="text-3xl font-bold tracking-tight mb-2 flex items-center gap-3">
                <Shield className="w-8 h-8 text-emerald-500" />
                Applications
              </h1>
              <p className="text-gray-400 max-w-xl text-sm leading-relaxed">
                Review and approve newly submitted profiles to grant them access to the platform.
              </p>
            </div>

            <div className="relative w-full sm:w-72">
              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-gray-500">
                <Search className="w-4 h-4" />
              </div>
              <input 
                type="text" 
                placeholder="Search candidates / skills..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#030712] border border-white/10 rounded-full pl-11 pr-4 py-2.5 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all shadow-inner"
              />
            </div>
          </div>

          {/* Table Container */}
          <div className="bg-white/[0.02] border border-white/10 rounded-2xl backdrop-blur-sm overflow-hidden shadow-2xl min-h-[50vh]">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center p-20 h-full">
                <Loader2 className="w-10 h-10 text-emerald-500 animate-spin mb-4" />
                <p className="text-gray-400 font-medium">Loading applications...</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead className="bg-white/5 text-gray-400 border-b border-white/10 text-xs uppercase tracking-wider">
                    <tr>
                      <th className="px-6 py-5 font-semibold">Candidate</th>
                      <th className="px-6 py-5 font-semibold">Institution</th>
                      <th className="px-6 py-5 font-semibold">Skills</th>
                      <th className="px-6 py-5 font-semibold text-center">Status</th>
                      <th className="px-6 py-5 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filteredApps.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-16 text-center text-gray-500 text-base">
                          No pending applications. The network is quiet.
                        </td>
                      </tr>
                    ) : filteredApps.map((app) => (
                      <tr key={app.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="px-6 py-5">
                          <div className="font-bold text-white text-base">{app.full_name}</div>
                          <div className="text-emerald-400 font-medium text-xs mt-1">{app.email}</div>
                          <div className="text-gray-500 text-[10px] mt-1 break-all max-w-[120px] truncate">ID: {app.id}</div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="text-gray-300 font-medium">{app.college}</div>
                          <div className="text-gray-500 text-xs mt-1">{app.department} • Year: {app.year_of_study}</div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex flex-wrap gap-2 max-w-[250px] whitespace-normal">
                            {app.skills && app.skills.map((skill: string) => (
                              <span key={skill} className="px-2.5 py-1 rounded text-[10px] font-bold tracking-wide uppercase bg-white/10 text-gray-300 border border-white/5">
                                {skill}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="px-6 py-5 text-center">
                          <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold tracking-wider uppercase
                            ${app.status === 'pending' ? 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20' : ''}
                            ${app.status === 'approved' ? 'bg-green-500/10 text-green-500 border border-green-500/20' : ''}
                            ${app.status === 'rejected' ? 'bg-red-500/10 text-red-500 border border-red-500/20' : ''}
                          `}>
                            {app.status === 'pending' && <span className="w-1.5 h-1.5 rounded-full bg-yellow-500 animate-pulse" />}
                            {app.status === 'approved' && <CheckCircle2 className="w-3.5 h-3.5" />}
                            {app.status === 'rejected' && <XCircle className="w-3.5 h-3.5" />}
                            {app.status}
                          </span>
                        </td>
                        <td className="px-6 py-5 text-right">
                          {app.status === 'pending' ? (
                            <div className="flex justify-end gap-3">
                              <button 
                                onClick={() => handleAction(app.id, 'rejected')}
                                className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all border border-transparent hover:border-red-400/20"
                                title="Reject"
                              >
                                <XCircle className="w-5 h-5" />
                              </button>
                              <button 
                                onClick={() => handleAction(app.id, 'approved')}
                                className="p-2 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-400/10 rounded-lg border border-emerald-500/30 transition-all shadow-[0_0_15px_rgba(16,185,129,0.15)] hover:shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:scale-105 active:scale-95"
                                title="Approve"
                              >
                                <CheckCircle2 className="w-5 h-5" />
                              </button>
                            </div>
                          ) : (
                            <span className="text-gray-600 text-[10px] font-bold tracking-widest uppercase">Actioned</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
