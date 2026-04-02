"use client";

import { useState, useEffect, useRef } from "react";
import { Send, Loader2, MessageSquare, User, Shield, Hash, Paperclip, Image as ImageIcon, FileText, X, Download } from "lucide-react";
import { supabase } from "@/lib/supabase";
import Sidebar from "@/components/Sidebar";

export default function ChatPage() {
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userData, setUserData] = useState<any>(null);
  const [teams, setTeams] = useState<any[]>([]);
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      fetchTeams();
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

  const handleFileUpload = async (file: File) => {
    if (!selectedTeamId || !userData) return;
    
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      alert("File size must be under 10MB");
      return;
    }

    setIsUploading(true);

    try {
      // Upload to Supabase Storage
      const fileName = `${Date.now()}-${file.name}`;
      const filePath = `chat/${selectedTeamId}/${fileName}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('chat-files')
        .upload(filePath, file, { cacheControl: '3600' });

      if (uploadError) {
        console.error("Upload error:", uploadError);
        alert("File upload failed. Please ensure the 'chat-files' storage bucket exists in Supabase.");
        setIsUploading(false);
        return;
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('chat-files')
        .getPublicUrl(filePath);

      const fileUrl = urlData?.publicUrl;
      const isImage = file.type.startsWith('image/');

      // Send as a message with file attachment
      const messageData = {
        team_id: selectedTeamId,
        content: isImage ? `📷 ${file.name}` : `📎 ${file.name}`,
        sender_id: userRole === 'admin' ? 'admin' : userData.id,
        sender_name: userData.full_name || (userRole === 'admin' ? "Admin" : "Operative"),
        is_admin: userRole === 'admin',
        file_url: fileUrl,
        file_name: file.name,
        file_type: file.type,
      };

      await supabase.from('messages').insert(messageData);
    } catch (err) {
      console.error("File upload error:", err);
    }

    setIsUploading(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileUpload(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => setDragOver(false);

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

  const isImageFile = (type: string) => type?.startsWith('image/');

  return (
    <div className="min-h-screen bg-transparent text-white selection:bg-indigo-500/30 overflow-hidden relative">
      <div className="flex h-screen">
        <Sidebar />

        <div 
          className="flex-1 flex flex-col relative z-10 w-full overflow-hidden animate-slide-in"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          
          <div className="md:hidden h-20 flex-shrink-0" />

          {/* Drag overlay */}
          {dragOver && (
            <div className="absolute inset-0 z-50 bg-indigo-500/10 border-2 border-dashed border-indigo-500/50 rounded-2xl flex items-center justify-center backdrop-blur-sm">
              <div className="text-center">
                <Paperclip className="w-12 h-12 text-indigo-400 mx-auto mb-4" />
                <p className="text-xl font-bold text-indigo-300">Drop file to share</p>
                <p className="text-sm text-gray-500 mt-1">Images, PDFs, documents — up to 10MB</p>
              </div>
            </div>
          )}

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
                <p className="text-xs text-gray-600 mt-3">💡 Tip: Drag & drop files to share them with your team</p>
              </div>
            ) : (
              messages.map((msg) => {
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
                      {/* File attachment */}
                      {msg.file_url && (
                        <div className="mb-2">
                          {isImageFile(msg.file_type) ? (
                            <div className="rounded-xl overflow-hidden border border-white/10 mb-2">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img 
                                src={msg.file_url} 
                                alt={msg.file_name || 'Shared image'} 
                                className="max-w-full max-h-[300px] object-contain rounded-xl cursor-pointer hover:opacity-90 transition-opacity"
                                onClick={() => window.open(msg.file_url, '_blank')}
                              />
                            </div>
                          ) : (
                            <a 
                              href={msg.file_url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className={`flex items-center gap-3 p-3 rounded-xl border transition-all hover:scale-[1.02] mb-2 ${
                                isMe
                                  ? 'bg-black/10 border-black/20 hover:bg-black/20' 
                                  : 'bg-white/5 border-white/10 hover:bg-white/10'
                              }`}
                            >
                              <FileText className="w-8 h-8 flex-shrink-0" />
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-bold truncate">{msg.file_name}</p>
                                <p className={`text-[10px] ${isMe ? 'text-black/60' : 'text-gray-500'}`}>Tap to download</p>
                              </div>
                              <Download className="w-4 h-4 flex-shrink-0" />
                            </a>
                          )}
                        </div>
                      )}
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
                <form onSubmit={handleSendMessage} className="flex gap-3">
                  {/* File upload button */}
                  <button 
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="aspect-square w-14 flex items-center justify-center bg-white/5 border border-white/10 text-gray-400 rounded-xl hover:bg-white/10 hover:text-indigo-400 transition-all active:scale-95 disabled:opacity-50"
                    title="Attach file"
                  >
                    {isUploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Paperclip className="w-5 h-5" />}
                  </button>
                  <input 
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    accept="image/*,.pdf,.doc,.docx,.txt,.zip,.rar,.py,.cpp,.c,.js,.ts,.ino"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileUpload(file);
                      e.target.value = '';
                    }}
                  />

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
