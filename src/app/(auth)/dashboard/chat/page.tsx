"use client";

import { useState, useEffect, useRef } from "react";
import { Send, Loader2, MessageSquare, User, Shield, Hash } from "lucide-react";
import { supabase } from "@/lib/supabase";
import Sidebar from "@/components/Sidebar";

export default function ChatPage() {
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userData, setUserData] = useState<any>(null);
  const [teams, setTeams] = useState<any[]>([]);
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
  
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const role = localStorage.getItem('userRole');
    setUserRole(role);
    
    if (role === 'member') {
      const stored = localStorage.getItem('memberData');
      if (stored) {
        const parsed = JSON.parse(stored);
        setUserData(parsed);
        setSelectedTeamId(parsed.team_id);
      }
    } else if (role === 'admin') {
      // Admins need to fetch teams to choose which one to chat with
      fetchTeams();
      // Also get admin name from local storage if available
      const adminName = localStorage.getItem('adminName') || "Admin";
      setUserData({ full_name: adminName, id: 'admin' });
    }
  }, []);

  const fetchTeams = async () => {
    const { data } = await supabase.from('teams').select('*').order('name');
    if (data) {
      setTeams(data);
      if (data.length > 0) setSelectedTeamId(data[0].id);
    }
  };

  useEffect(() => {
    if (selectedTeamId) {
      fetchMessages();
      
      // Subscribe to real-time messages for the selected team
      const channel = supabase
        .channel(`team-chat-${selectedTeamId}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'messages',
            filter: `team_id=eq.${selectedTeamId}`,
          },
          (payload) => {
            setMessages((prev) => [...prev, payload.new]);
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [selectedTeamId]);

  useEffect(() => {
    // Scroll to bottom on new message
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const fetchMessages = async () => {
    setIsLoading(true);
    const { data } = await supabase
      .from('messages')
      .select('*')
      .eq('team_id', selectedTeamId)
      .order('created_at', { ascending: true });
    
    if (data) setMessages(data);
    setIsLoading(false);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedTeamId || !userData) return;

    setIsSending(true);
    const messageData = {
      team_id: selectedTeamId,
      content: newMessage.trim(),
      sender_id: userRole === 'admin' ? 'admin' : userData.id,
      sender_name: userData.full_name || (userRole === 'admin' ? "Admin" : "Operative"),
      is_admin: userRole === 'admin',
    };

    const { error } = await supabase.from('messages').insert(messageData);
    
    if (!error) {
      setNewMessage("");
    }
    setIsSending(false);
  };

  const selectedTeamName = teams.find(t => t.id === selectedTeamId)?.name || (userRole === 'member' ? "My Team" : "Select Team");

  return (
    <div className="min-h-screen bg-transparent text-white selection:bg-indigo-500/30 overflow-hidden relative">
      <div className="flex h-screen">
        <Sidebar />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col relative z-10 w-full overflow-hidden">
          
          {/* Mobile padding fix header */}
          <div className="md:hidden h-20 flex-shrink-0" />

          {/* Chat Header */}
          <div className="p-6 border-b border-white/5 bg-[#080d1a]/50 backdrop-blur-md flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div>
              <h1 className="text-2xl font-bold tracking-tight flex items-center gap-3">
                <MessageSquare className="w-6 h-6 text-indigo-500" />
                Team Transmissions
              </h1>
              <div className="flex flex-col sm:flex-row sm:items-center gap-4 mt-2">
                 <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <p className="text-xs text-gray-500 font-mono tracking-widest uppercase truncate max-w-[200px]">Live Link: {selectedTeamName}</p>
                 </div>

                 {userRole === 'admin' && teams.length > 0 && (
                    <div className="flex items-center gap-3 bg-indigo-500/10 border border-indigo-500/20 rounded-xl px-4 py-2 self-start">
                      <Hash className="w-4 h-4 text-indigo-400" />
                      <select 
                        aria-label="Select Team Channel"
                        title="Select Team Channel"
                        value={selectedTeamId || ""} 
                        onChange={(e) => setSelectedTeamId(e.target.value)}
                        className="bg-transparent text-xs font-bold text-indigo-300 focus:outline-none appearance-none cursor-pointer pr-4 uppercase tracking-tighter"
                      >
                        {teams.map(team => (
                          <option key={team.id} value={team.id} className="bg-slate-900">{team.name}</option>
                        ))}
                      </select>
                    </div>
                  )}
              </div>
            </div>
          </div>

          {/* Messages Area */}
          <div 
            ref={scrollRef}
            className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-indigo-500/20"
          >
            {isLoading ? (
              <div className="h-full flex items-center justify-center text-gray-500">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
              </div>
            ) : messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-600 text-center px-6">
                <div className="w-16 h-16 rounded-full bg-white/5 border border-white/5 flex items-center justify-center mb-4">
                   <MessageSquare className="w-8 h-8 opacity-20" />
                </div>
                <p className="text-lg font-bold text-gray-400">Secure Channel Initialized</p>
                <p className="text-sm mt-1">No messages recorded in this frequency yet.</p>
              </div>
            ) : (
              messages.map((msg, idx) => {
                const isMe = msg.sender_id === (userRole === 'admin' ? 'admin' : userData?.id);
                return (
                  <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                    <div className={`flex items-center gap-2 mb-1 px-1 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                       <span className={`text-[10px] font-bold tracking-tighter uppercase ${msg.is_admin ? 'text-indigo-400' : 'text-gray-500'}`}>
                         {msg.sender_name} {msg.is_admin ? '(Admin)' : ''}
                       </span>
                       <span className="text-[9px] text-gray-600 font-mono">
                         {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                       </span>
                    </div>
                    <div 
                      className={`max-w-[85%] sm:max-w-[70%] px-5 py-3.5 rounded-2xl text-sm leading-relaxed shadow-xl border ${
                        isMe 
                          ? 'bg-indigo-500 text-black border-indigo-400 rounded-tr-none font-medium' 
                          : 'bg-white/5 text-white border-white/10 rounded-tl-none backdrop-blur-md'
                      }`}
                    >
                      {msg.content}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Input Area */}
          <div className="p-6 bg-[#080d1a]/50 backdrop-blur-md border-t border-white/5">
             {selectedTeamId ? (
                <form onSubmit={handleSendMessage} className="flex gap-4">
                  <div className="relative flex-1">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2">
                      {userRole === 'admin' ? <Shield className="w-4 h-4 text-indigo-500" /> : <User className="w-4 h-4 text-gray-600" />}
                    </div>
                    <input 
                      type="text"
                      placeholder={userRole === 'admin' ? "Issue admin directive..." : "Send team coordination message..."}
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      className="w-full bg-[#030712] border border-white/10 rounded-xl pl-11 pr-5 py-4 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-indigo-500 transition-all shadow-inner"
                    />
                  </div>
                  <button 
                    type="submit" 
                    disabled={isSending || !newMessage.trim()}
                    className="aspect-square w-14 flex items-center justify-center bg-indigo-500 text-black rounded-xl hover:bg-indigo-400 transition-all active:scale-95 disabled:opacity-50 shadow-lg shadow-indigo-500/20"
                  >
                    {isSending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                  </button>
                </form>
             ) : (
                <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl text-yellow-500 text-center text-sm font-bold tracking-wider">
                   {userRole === 'member' ? "AWAITING TEAM ASSIGNMENT" : "SELECT TEAM CHANNEL TO BROADCAST"}
                </div>
             )}
          </div>

        </div>
      </div>
    </div>
  );
}
