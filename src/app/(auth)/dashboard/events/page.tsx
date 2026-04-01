"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Users, Activity, PlusSquare, Network, Calendar, Trophy, AlertTriangle, Megaphone, Trash2, Shield, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

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

  useEffect(() => {
    setUserRole(localStorage.getItem('userRole'));
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .order('event_date', { ascending: true }); // Show closest first
    
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
      default: return 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10';
    }
  };

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
            {userRole === 'admin' && (
              <Link href="/dashboard/applications" className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl font-medium transition-all">
                <Users className="w-5 h-5" /> Applications
              </Link>
            )}
            <Link href="/dashboard/teams" className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl font-medium transition-all">
              <Network className="w-5 h-5" /> Teams
            </Link>
            <Link href="/dashboard/events" className="flex items-center gap-3 px-4 py-3 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-xl font-medium transition-all shadow-[0_0_15px_rgba(16,185,129,0.1)]">
              <Calendar className="w-5 h-5" /> Announcements
            </Link>
            {userRole === 'admin' && (
              <Link href="/dashboard/posts" className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl font-medium transition-all">
                <Activity className="w-5 h-5" /> Post Management
              </Link>
            )}
          </nav>

          <button 
            onClick={async () => {
              if (userRole === 'admin') await supabase.auth.signOut();
              localStorage.removeItem('userRole');
              localStorage.removeItem('memberData');
              window.location.href='/login';
            }}
            className="w-full flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl font-medium transition-all text-left"
          >
            <ArrowLeft className="w-5 h-5" /> Sign Out
          </button>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-auto relative z-10 w-full p-8 lg:p-12">
          
          <div className="flex flex-col md:flex-row gap-8 mb-12">
            <div>
              <h1 className="text-3xl font-bold tracking-tight mb-2 flex items-center gap-3">
                <Calendar className="w-8 h-8 text-emerald-500" />
                Operations & Events Ledger
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
              <h2 className="text-xl font-bold mb-6 flex items-center gap-3 border-b border-white/5 pb-5 text-emerald-400 uppercase tracking-widest text-sm">
                <PlusSquare className="w-5 h-5" /> New Broadcast
              </h2>
              
              <form onSubmit={handleCreateEvent} className="space-y-5">
                <div className="space-y-2">
                  <label className="text-xs font-bold tracking-wider text-gray-400 uppercase">Title *</label>
                  <input required type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full bg-[#030712] border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:border-emerald-500 transition-all shadow-inner" placeholder="e.g. HackMIT Registration" />
                </div>
                
                <div className="space-y-2">
                  <label className="text-xs font-bold tracking-wider text-gray-400 uppercase">Description *</label>
                  <textarea required rows={3} value={description} onChange={(e) => setDescription(e.target.value)} className="w-full bg-[#030712] border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:border-emerald-500 transition-all resize-none shadow-inner" placeholder="Provide link or details here..." />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold tracking-wider text-gray-400 uppercase">Date/Deadline *</label>
                  <input required type="date" value={eventDate} onChange={(e) => setEventDate(e.target.value)} className="w-full bg-[#030712] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-all shadow-inner color-scheme-dark" style={{colorScheme: 'dark'}} />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold tracking-wider text-gray-400 uppercase">Category *</label>
                  <select required value={category} onChange={(e) => setCategory(e.target.value)} className="w-full bg-[#030712] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-all shadow-inner appearance-none">
                    <option value="announcement">Announcement</option>
                    <option value="competition">Competition</option>
                    <option value="deadline">Deadline</option>
                    <option value="event">Event</option>
                  </select>
                </div>

                <button type="submit" disabled={isPublishing || !title || !description || !eventDate || !category} className="w-full flex items-center justify-center gap-3 py-4 mt-4 bg-emerald-500 text-black rounded-xl font-black tracking-wide hover:bg-emerald-400 disabled:opacity-50 transition-all active:scale-95">
                  {isPublishing ? "TRANSMITTING..." : "BROADCAST TO NETWORK"}
                </button>
              </form>
            </div>
            )}

            {/* Event List */}
            <div className={`${userRole === 'admin' ? 'lg:col-span-8' : 'lg:col-span-12'} flex flex-col gap-4`}>
              {isLoading ? (
                <div className="flex justify-center p-20"><Loader2 className="w-10 h-10 text-emerald-500 animate-spin" /></div>
              ) : events.length === 0 ? (
                <div className="border border-white/5 border-dashed rounded-[2rem] p-16 flex flex-col items-center justify-center text-center bg-white/[0.02]">
                  <Calendar className="w-16 h-16 text-gray-700 mb-6" />
                  <p className="text-2xl font-bold text-gray-300 mb-2">Timeline Clear</p>
                  <p className="text-gray-500">No upcoming events or deadlines in the database.</p>
                </div>
              ) : (
                events.map((ev) => (
                  <div key={ev.id} className="bg-white/5 border border-white/10 rounded-3xl p-6 group hover:border-emerald-500/30 transition-all duration-300 shadow-xl relative backdrop-blur-sm flex flex-col sm:flex-row gap-6 items-start">
                    
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
