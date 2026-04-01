"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Users, Activity, PlusSquare, Network, Calendar, Trophy, AlertTriangle, Megaphone, Trash2, Shield, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

async function sendAnnouncementEmails(title: string, description: string, category: string, eventDate: string) {
  try {
    // Fetch all approved members' emails
    const { data: members } = await supabase
      .from('applications')
      .select('email, full_name')
      .eq('status', 'approved');

    if (!members || members.length === 0) return;

    const categoryColors: Record<string, string> = {
      competition: '#facc15',
      deadline: '#f87171',
      event: '#60a5fa',
      announcement: '#818cf8',
    };

    const color = categoryColors[category] || '#818cf8';
    const formattedDate = new Date(eventDate).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

    for (const member of members) {
      const html = `
        <!DOCTYPE html>
        <html>
        <body style="margin:0;padding:0;background:#030712;font-family:Inter,Arial,sans-serif;">
          <div style="max-width:560px;margin:40px auto;background:#080d1a;border:1px solid rgba(255,255,255,0.1);border-radius:24px;overflow:hidden;">
            <div style="background:linear-gradient(135deg,#1e293b,#0f172a);padding:40px 32px;text-align:center;border-bottom:1px solid rgba(255,255,255,0.05);">
              <div style="display:inline-block;padding:6px 16px;border-radius:20px;border:1px solid ${color}40;background:${color}15;color:${color};font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;margin-bottom:16px;">${category}</div>
              <h1 style="color:white;font-size:24px;font-weight:900;margin:0;">${title}</h1>
            </div>
            <div style="padding:32px;">
              <p style="color:#64748b;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:1px;margin:0 0 8px;">📅 ${formattedDate}</p>
              <p style="color:#94a3b8;font-size:15px;line-height:1.7;margin:0 0 24px;">${description}</p>
              <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/dashboard/events" style="display:block;background:#6366f1;color:black;text-align:center;padding:14px;border-radius:12px;font-weight:900;font-size:13px;letter-spacing:2px;text-transform:uppercase;text-decoration:none;">
                View All Announcements →
              </a>
              <p style="color:#334155;font-size:11px;text-align:center;margin-top:20px;">Alpha X Robotics Platform</p>
            </div>
          </div>
        </body>
        </html>
      `;

      await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: member.email,
          subject: `📢 Alpha X Announcement: ${title}`,
          html,
        }),
      });
    }
  } catch (err) {
    console.error('Failed to send announcement emails:', err);
  }
}

import Sidebar from "@/components/Sidebar";

export default function EventsDashboard() {
  const [events, setEvents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);
  
  // Form State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [category, setCategory] = useState("announcement");
  const [isPublishing, setIsPublishing] = useState(false);
  const [notifyMembers, setNotifyMembers] = useState(true);

  useEffect(() => {
    setUserRole(localStorage.getItem('userRole'));
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    setIsLoading(true);
    const { data } = await supabase
      .from('events')
      .select('*')
      .order('event_date', { ascending: true });
    
    if (data) setEvents(data);
    setIsLoading(false);
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || !eventDate || !category) return;
    
    setIsPublishing(true);
    
    const { error } = await supabase.from('events').insert({
      title,
      description,
      event_date: eventDate,
      category
    });

    if (!error) {
      // Send notification emails to all members if enabled
      if (notifyMembers) {
        await sendAnnouncementEmails(title, description, category, eventDate);
      }
      setTitle("");
      setDescription("");
      setEventDate("");
      setCategory("announcement");
      fetchEvents();
    }
    
    setIsPublishing(false);
  };

  const handleDelete = async (id: string) => {
    if(!confirm("Delete this event broadcast?")) return;
    await supabase.from('events').delete().eq('id', id);
    fetchEvents();
  };

  const getCategoryIcon = (cat: string, className: string) => {
    switch (cat) {
      case 'competition': return <Trophy className={className} />;
      case 'deadline': return <AlertTriangle className={className} />;
      case 'event': return <Calendar className={className} />;
      default: return <Megaphone className={className} />;
    }
  };

  const getCategoryColor = (cat: string) => {
    switch(cat) {
      case 'competition': return 'text-yellow-400 border-yellow-500/30 bg-yellow-500/10';
      case 'deadline': return 'text-red-400 border-red-500/30 bg-red-500/10';
      case 'event': return 'text-blue-400 border-blue-500/30 bg-blue-500/10';
      default: return 'text-indigo-400 border-indigo-500/30 bg-indigo-500/10';
    }
  };

  return (
    <div className="min-h-screen bg-transparent text-white selection:bg-indigo-500/30 overflow-hidden relative">
      <div className="flex h-screen">
        
        <Sidebar />

        {/* Main Content Area */}
        <div className="flex-1 overflow-auto relative z-10 w-full p-4 sm:p-8 lg:p-12 pt-20 sm:pt-12">

          
          <div className="flex flex-col md:flex-row gap-8 mb-12">
            <div>
              <h1 className="text-3xl font-bold tracking-tight mb-2 flex items-center gap-3">
                <Calendar className="w-8 h-8 text-indigo-500" />
                Operations &amp; Events Ledger
              </h1>
              <p className="text-gray-400 max-w-xl text-sm leading-relaxed">
                Broadcast critical deadlines, upcoming hacker competitions, and administrative announcements across the platform grid.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Publisher Form */}
            {userRole === 'admin' && (
            <div className="lg:col-span-4 bg-white/[0.02] border border-white/10 rounded-[2rem] p-8 backdrop-blur-sm shadow-2xl sticky top-8">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-3 border-b border-white/5 pb-5 text-indigo-400 uppercase tracking-widest text-sm">
                <PlusSquare className="w-5 h-5" /> New Broadcast
              </h2>
              
              <form onSubmit={handleCreateEvent} className="space-y-5">
                <div className="space-y-2">
                  <label className="text-xs font-bold tracking-wider text-gray-400 uppercase">Title *</label>
                  <input required type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full bg-[#030712] border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:border-indigo-500 transition-all shadow-inner" placeholder="e.g. HackMIT Registration" />
                </div>
                
                <div className="space-y-2">
                  <label className="text-xs font-bold tracking-wider text-gray-400 uppercase">Description *</label>
                  <textarea required rows={3} value={description} onChange={(e) => setDescription(e.target.value)} className="w-full bg-[#030712] border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:border-indigo-500 transition-all resize-none shadow-inner" placeholder="Provide link or details here..." />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold tracking-wider text-gray-400 uppercase">Date/Deadline *</label>
                  <input required type="date" value={eventDate} onChange={(e) => setEventDate(e.target.value)} className="w-full bg-[#030712] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-all shadow-inner" style={{colorScheme: 'dark'}} />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold tracking-wider text-gray-400 uppercase">Category *</label>
                  <select required value={category} onChange={(e) => setCategory(e.target.value)} className="w-full bg-[#030712] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-all shadow-inner appearance-none">
                    <option value="announcement">Announcement</option>
                    <option value="competition">Competition</option>
                    <option value="deadline">Deadline</option>
                    <option value="event">Event</option>
                  </select>
                </div>

                {/* Email notification toggle */}
                <div className="flex items-center gap-3 bg-indigo-500/10 border border-indigo-500/20 rounded-xl px-4 py-3">
                  <input
                    type="checkbox"
                    id="notifyMembers"
                    checked={notifyMembers}
                    onChange={(e) => setNotifyMembers(e.target.checked)}
                    className="w-4 h-4 accent-indigo-500"
                  />
                  <label htmlFor="notifyMembers" className="text-sm text-indigo-300 font-medium cursor-pointer">
                    Notify all members via Gmail
                  </label>
                </div>

                <button type="submit" disabled={isPublishing || !title || !description || !eventDate || !category} className="w-full flex items-center justify-center gap-3 py-4 mt-4 bg-indigo-500 text-black rounded-xl font-black tracking-wide hover:bg-indigo-400 disabled:opacity-50 transition-all active:scale-95">
                  {isPublishing ? "TRANSMITTING..." : "BROADCAST TO NETWORK"}
                </button>
              </form>
            </div>
            )}

            {/* Event List */}
            <div className={`${userRole === 'admin' ? 'lg:col-span-8' : 'lg:col-span-12'} flex flex-col gap-4`}>
              {isLoading ? (
                <div className="flex justify-center p-20"><Loader2 className="w-10 h-10 text-indigo-500 animate-spin" /></div>
              ) : events.length === 0 ? (
                <div className="border border-white/5 border-dashed rounded-[2rem] p-16 flex flex-col items-center justify-center text-center bg-white/[0.02]">
                  <Calendar className="w-16 h-16 text-gray-700 mb-6" />
                  <p className="text-2xl font-bold text-gray-300 mb-2">Timeline Clear</p>
                  <p className="text-gray-500">No upcoming events or deadlines in the database.</p>
                </div>
              ) : (
                events.map((ev) => (
                  <div key={ev.id} className="bg-white/5 border border-white/10 rounded-3xl p-6 group hover:border-indigo-500/30 transition-all duration-300 shadow-xl relative backdrop-blur-sm flex flex-col sm:flex-row gap-6 items-start">
                    
                    {userRole === 'admin' && (
                    <button onClick={() => handleDelete(ev.id)} className="absolute top-4 right-4 z-20 p-2 text-white/30 hover:text-red-400 hover:bg-red-900/30 rounded-full transition-all opacity-0 group-hover:opacity-100">
                      <Trash2 className="w-4 h-4" />
                    </button>
                    )}

                    <div className={`p-4 rounded-2xl border ${getCategoryColor(ev.category)} flex-shrink-0 flex items-center justify-center`}>
                      {getCategoryIcon(ev.category, "w-8 h-8")}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded border ${getCategoryColor(ev.category)}`}>
                          {ev.category}
                        </span>
                        <span className="text-gray-400 font-mono text-sm">
                          {new Date(ev.event_date).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                      <h3 className="text-xl font-bold text-white mb-2">{ev.title}</h3>
                      <p className="text-gray-400 text-sm leading-relaxed whitespace-pre-wrap">{ev.description}</p>
                    </div>
                  </div>
                ))
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
