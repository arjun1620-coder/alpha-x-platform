"use client";

import { useState, useEffect } from "react";
import { CheckCircle2, Shield, XCircle, Search, Loader2, Trash2, Mail, MessageCircle, Eye, EyeOff } from "lucide-react";
import { supabase } from "@/lib/supabase";
import Sidebar from "@/components/Sidebar";
import Confetti from "@/components/Confetti";
import Toast, { useToast } from "@/components/Toast";

// Truncated for brevity as we no longer show skills/exp in table
const EditableInstitution = ({ id, current, fetchApplications }: { id: string, current: string, fetchApplications: () => void }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(current);
  const [isSaving, setIsSaving] = useState(false);

  const handleBlur = async () => {
    if (value === current) {
      setIsEditing(false);
      return;
    }
    setIsSaving(true);
    const { error } = await supabase.from('applications').update({ college: value }).eq('id', id);
    if (!error) fetchApplications();
    setIsEditing(false);
    setIsSaving(false);
  };

  if (isEditing) {
    return (
      <input 
        autoFocus
        value={value}
        onChange={e => setValue(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={e => e.key === 'Enter' && handleBlur()}
        className="bg-indigo-500/10 border border-indigo-500/30 rounded px-2 py-1 text-xs text-white outline-none w-full italic"
      />
    );
  }

  return (
    <div 
      onClick={() => setIsEditing(true)}
      className="text-gray-300 font-medium cursor-pointer hover:text-indigo-400 hover:bg-white/5 px-2 py-1 rounded transition-all italic border border-transparent hover:border-white/5"
    >
      {current || "N/A"}
    </div>
  );
};

async function sendNotificationEmail(to: string, subject: string, html: string) {
  try {
    const res = await fetch('/api/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ to, subject, html }),
    });
    return await res.json();
  } catch (err) {
    console.error('Failed to send email:', err);
    return { error: 'Network error' };
  }
}

async function sendWhatsAppMessage(phone: string, message: string) {
  try {
    const res = await fetch('/api/send-whatsapp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, message }),
    });
    return await res.json();
  } catch (err) {
    console.error('Failed to generate WhatsApp link:', err);
    return { error: 'Network error' };
  }
}

export default function ApplicationsDashboard() {
  const [applications, setApplications] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [showConfetti, setShowConfetti] = useState(false);
  const { addToast, ToastContainer } = useToast();

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    const { data, error } = await supabase
      .from('applications')
      .select('*, team:teams(name)')
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Error fetching applications:", error);
    } else if (data) {
      setApplications(data);
    }
    setIsLoading(false);
  };

  const handleAction = async (id: string, action: "approved" | "rejected") => {
    setApplications(prev => prev.map(app => app.id === id ? { ...app, status: action } : app));

    const { error } = await supabase
      .from('applications')
      .update({ status: action })
      .eq('id', id);

    if (error) {
      console.error("Failed to update status:", error);
      addToast("Failed to update application status", "error");
      fetchApplications();
      return;
    }

    const app = applications.find(a => a.id === id);

    if (app && action === 'approved') {
      // 🎉 Confetti!
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 100);
      
      addToast(`${app.full_name} has been approved!`, "success");

      // Send approval email
      addToast("Sending approval email...", "info");
      const emailHtml = `
        <!DOCTYPE html>
        <html>
        <head><meta charset="UTF-8"></head>
        <body style="margin:0;padding:0;background:#030712;font-family:Inter,Arial,sans-serif;">
          <div style="max-width:560px;margin:40px auto;background:#080d1a;border:1px solid rgba(255,255,255,0.1);border-radius:24px;overflow:hidden;">
            <div style="background:linear-gradient(135deg,#4f46e5,#1e293b);padding:40px 32px;text-align:center;">
              <div style="display:inline-flex;align-items:center;gap:10px;margin-bottom:16px;">
                <div style="width:40px;height:40px;background:rgba(0,0,0,0.3);border-radius:10px;display:inline-flex;align-items:center;justify-content:center;font-weight:900;color:white;font-size:14px;">AX</div>
                <span style="color:white;font-size:20px;font-weight:800;letter-spacing:4px;">AlphaX Robotics</span>
              </div>
              <h1 style="color:white;font-size:26px;font-weight:900;margin:0 0 8px;">Application Approved! 🎉</h1>
              <p style="color:rgba(255,255,255,0.7);margin:0;font-size:14px;">Welcome to the team, ${app.full_name}!</p>
            </div>
            <div style="padding:32px;">
              <p style="color:#94a3b8;font-size:15px;line-height:1.6;margin:0 0 24px;">
                Congratulations! Your application to join <strong style="color:white;">AlphaX Robotics</strong> has been reviewed and approved by our admin team.
              </p>
              <div style="background:rgba(99,102,241,0.1);border:1px solid rgba(99,102,241,0.3);border-radius:16px;padding:24px;margin-bottom:24px;">
                <p style="color:#a5b4fc;font-size:12px;font-weight:700;letter-spacing:2px;text-transform:uppercase;margin:0 0 12px;">Your Login Credentials</p>
                <div style="margin-bottom:12px;">
                  <span style="color:#64748b;font-size:12px;font-weight:600;text-transform:uppercase;">Email Address</span>
                  <p style="color:white;font-size:15px;font-weight:600;margin:4px 0 0;">${app.email}</p>
                </div>
                <div>
                  <span style="color:#64748b;font-size:12px;font-weight:600;text-transform:uppercase;">Password</span>
                  <p style="color:#a5b4fc;font-size:13px;font-weight:700;margin:4px 0 0;">Use the password you created during signup.</p>
                </div>
                <p style="color:#64748b;font-size:11px;margin:12px 0 0;">If you forgot your password, please contact an administrator.</p>
              </div>
              <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/login" style="display:block;background:#6366f1;color:black;text-align:center;padding:16px;border-radius:12px;font-weight:900;font-size:14px;letter-spacing:2px;text-transform:uppercase;text-decoration:none;margin-bottom:24px;">
                Login to AlphaX Robotics →
              </a>
              <p style="color:#475569;font-size:12px;text-align:center;margin:0;">AlphaX Robotics Platform • Confidential</p>
            </div>
          </div>
        </body>
        </html>
      `;

      const emailResult = await sendNotificationEmail(
        app.email,
        '🎉 AlphaX Robotics Application Approved – Your Login Details',
        emailHtml
      );

      if (emailResult.success) {
        addToast("Approval email sent successfully!", "success");
      } else {
        addToast("Email delivery failed — check GMAIL env vars", "error");
      }

      // Send WhatsApp notification
      if (app.mobile_number) {
        const waMessage = `🎉 *AlphaX Robotics*\n\nHi ${app.full_name}! Your application to AlphaX Robotics has been *APPROVED*! 🚀\n\n📧 Login Email: ${app.email}\n🔑 Password: Use the one you created during signup\n\n🔗 Login here: ${process.env.NEXT_PUBLIC_SITE_URL || 'https://alpha-x-robotics.vercel.app'}/login\n\nWelcome to the team!`;
        
        const waResult = await sendWhatsAppMessage(app.mobile_number, waMessage);
        
        if (waResult.success && waResult.waLink) {
          addToast("Opening WhatsApp to send approval message...", "info");
          // Open WhatsApp in a new tab with the pre-filled message
          window.open(waResult.waLink, '_blank');
        }
      }
    }

    if (app && action === 'rejected') {
      addToast(`${app.full_name}'s application has been rejected`, "warning");
      
      const emailHtml = `
        <!DOCTYPE html>
        <html>
        <body style="margin:0;padding:0;background:#030712;font-family:Inter,Arial,sans-serif;">
          <div style="max-width:560px;margin:40px auto;background:#080d1a;border:1px solid rgba(255,255,255,0.1);border-radius:24px;overflow:hidden;">
            <div style="background:linear-gradient(135deg,#1e293b,#0f172a);padding:40px 32px;text-align:center;">
              <h1 style="color:white;font-size:24px;font-weight:900;margin:0 0 8px;">Application Update</h1>
              <p style="color:rgba(255,255,255,0.6);margin:0;font-size:14px;">From AlphaX Robotics</p>
            </div>
            <div style="padding:32px;">
              <p style="color:#94a3b8;font-size:15px;line-height:1.6;margin:0 0 16px;">Dear ${app.full_name},</p>
              <p style="color:#94a3b8;font-size:15px;line-height:1.6;margin:0 0 16px;">
                Thank you for your interest in <strong style="color:white;">AlphaX Robotics</strong>. After reviewing your application, we regret to inform you that we are unable to move forward at this time.
              </p>
              <p style="color:#94a3b8;font-size:15px;line-height:1.6;margin:0;">
                We encourage you to continue developing your skills and apply again in the future. Thank you for your time.
              </p>
            </div>
          </div>
        </body>
        </html>
      `;
      sendNotificationEmail(app.email, 'AlphaX Robotics – Application Status Update', emailHtml);

      // WhatsApp rejection message
      if (app.mobile_number) {
        const waMessage = `Hi ${app.full_name},\n\nThank you for applying to *AlphaX Robotics*.\n\nUnfortunately, we are unable to move forward with your application at this time. We encourage you to continue developing your skills and apply again in the future.\n\n— AlphaX Robotics Team`;
        const waResult = await sendWhatsAppMessage(app.mobile_number, waMessage);
        if (waResult.success && waResult.waLink) {
          window.open(waResult.waLink, '_blank');
        }
      }
    }
  };

  const handleDeleteApplication = async (id: string, fullName: string) => {
    if (!confirm(`Are you sure you want to completely erase ${fullName}'s data from AlphaX Robotics? This action is permanent and cannot be undone.`)) return;

    setApplications(prev => prev.filter(app => app.id !== id));

    const { error } = await supabase
      .from('applications')
      .delete()
      .eq('id', id);

    if (error) {
      console.error("Failed to delete application:", error);
      addToast("Failed to delete application", "error");
      fetchApplications();
    } else {
      addToast(`${fullName}'s data has been permanently erased`, "info");
    }
  };

  const filteredApps = applications.filter(app => 
    app.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    app.skills?.some((skill: string) => skill.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-transparent text-white selection:bg-indigo-500/30 overflow-hidden relative">
      <Confetti trigger={showConfetti} />
      <ToastContainer />
      
      <div className="flex h-screen">
        <Sidebar />

        <div className="flex-1 overflow-auto p-4 sm:p-8 lg:p-12 pt-20 sm:pt-12 relative z-10 w-full animate-slide-in">

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-12">
            <div>
              <h1 className="text-3xl font-bold tracking-tight mb-2 flex items-center gap-3">
                <Shield className="w-8 h-8 text-indigo-500" />
                Applications
              </h1>
              <p className="text-gray-400 max-w-xl text-sm leading-relaxed">
                Review and approve newly submitted profiles. Approved members will be notified via email & WhatsApp.
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
                className="w-full bg-[#030712] border border-white/10 rounded-full pl-11 pr-4 py-2.5 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all shadow-inner"
              />
            </div>
          </div>

          <div className="bg-white/[0.02] border border-white/10 rounded-2xl backdrop-blur-sm overflow-hidden shadow-2xl min-h-[50vh]">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center p-20 h-full">
                <Loader2 className="w-10 h-10 text-indigo-500 animate-spin mb-4" />
                <p className="text-gray-400 font-medium">Loading applications...</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-white/5 text-gray-400 border-b border-white/10 text-xs uppercase tracking-wider">
                    <tr>
                      <th className="px-6 py-5 font-semibold">Candidate</th>
                      <th className="px-6 py-5 font-semibold">Institution (Edit)</th>
                      <th className="px-6 py-5 font-semibold">Operational Team</th>
                      <th className="px-6 py-5 font-semibold text-center">Status</th>
                      <th className="px-6 py-5 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filteredApps.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-16 text-center text-gray-500 text-base">
                          No pending applications. The network is quiet.
                        </td>
                      </tr>
                    ) : filteredApps.map((app) => (
                      <tr key={app.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="px-6 py-5">
                          <div className="font-bold text-white text-base truncate max-w-[150px]">{app.full_name}</div>
                          <div className="text-indigo-400 font-medium text-xs mt-1 truncate max-w-[150px]">{app.email}</div>
                          <div className="text-gray-500 text-[10px] mt-1 italic flex items-center gap-1">
                            <MessageCircle className="w-3 h-3" /> {app.mobile_number}
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <EditableInstitution id={app.id} current={app.college} fetchApplications={fetchApplications} />
                          <div className="text-gray-600 text-[10px] mt-1 px-2 uppercase font-bold tracking-tighter">{app.department} • {app.year_of_study}</div>
                        </td>
                        <td className="px-6 py-5">
                          <div className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] w-fit italic ${app.team?.name ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' : 'text-gray-700 bg-white/5 border border-white/10 opacity-40'}`}>
                             {app.team?.name || "UNASSIGNED"}
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
                                className="p-2 text-indigo-400 hover:text-indigo-300 hover:bg-indigo-400/10 rounded-lg border border-indigo-500/30 transition-all shadow-[0_0_15px_rgba(99,102,241,0.15)] hover:shadow-[0_0_20px_rgba(99,102,241,0.3)] hover:scale-105 active:scale-95"
                                title="Approve & Notify via Email + WhatsApp"
                              >
                                <CheckCircle2 className="w-5 h-5" />
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center justify-end gap-3">
                              <span className="text-gray-600 text-[10px] font-bold tracking-widest uppercase">Actioned</span>
                              <button 
                                onClick={() => handleDeleteApplication(app.id, app.full_name)}
                                className="p-2 text-gray-600 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all border border-transparent hover:border-red-500/20"
                                title="Permanently Erase from AlphaX Robotics"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
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
