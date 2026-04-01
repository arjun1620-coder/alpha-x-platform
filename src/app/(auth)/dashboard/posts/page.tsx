"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { ArrowLeft, Users, Activity, PlusSquare, Image as ImageIcon, Trash2, Send, X, Network, Calendar } from "lucide-react";
import { supabase } from "@/lib/supabase";

// Mock Data for the prototype
const MOCK_POSTS = [
  {
    id: "post-1",
    title: "Project Alpha: Prototype 1",
    caption: "First successful telemetry read from the custom ESP32 board! Looking solid.",
    imageUrl: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=800",
    date: "2026-03-31",
  },
  {
    id: "post-2",
    title: "New 3D Printer Farm setup",
    caption: "Just calibrated the new resin printers. Ready to mass produce the new micro-drone chassis.",
    imageUrl: "https://images.unsplash.com/photo-1620822606622-c2e9de6d4f6d?auto=format&fit=crop&q=80&w=800",
    date: "2026-03-29",
  }
];

export default function PostsDashboard() {
  const [posts, setPosts] = useState(MOCK_POSTS);
  const [isUploading, setIsUploading] = useState(false);

  // Form state
  const [title, setTitle] = useState("");
  const [caption, setCaption] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDelete = (id: string) => {
    setPosts(prev => prev.filter(post => post.id !== id));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const url = URL.createObjectURL(file);
      setImagePreview(url);
    }
  };

  const clearImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if(!title || !caption || !imagePreview) return;
    
    setIsUploading(true);
    
    // Simulate upload delay
    setTimeout(() => {
      const newPost = {
        id: `post-${Date.now()}`,
        title,
        caption,
        imageUrl: imagePreview, // Use the local object URL
        date: new Date().toISOString().split('T')[0]
      };
      
      setPosts([newPost, ...posts]);
      setTitle("");
      setCaption("");
      clearImage();
      setIsUploading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-transparent text-white selection:bg-emerald-500/30 overflow-hidden relative">
      <div className="flex h-screen">
        
        {/* Simplified Admin Sidebar */}
        <div className="w-64 border-r border-white/5 bg-[#080d1a] p-6 hidden md:flex flex-col">
          <div className="flex items-center gap-3 mb-12">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.4)]">
              <span className="font-extrabold text-black text-xs tracking-tight">AX</span>
            </div>
            <span className="font-bold tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">
              ADMIN
            </span>
          </div>

          <nav className="space-y-2 flex-1">
            <Link href="/dashboard/applications" className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl font-medium transition-all">
              <Users className="w-5 h-5" />
              Applications
            </Link>
            <Link href="/dashboard/teams" className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl font-medium transition-all">
              <Network className="w-5 h-5" />
              Teams
            </Link>
            <Link href="/dashboard/events" className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl font-medium transition-all">
              <Calendar className="w-5 h-5" />
              Announcements
            </Link>
            <Link href="/dashboard/posts" className="flex items-center gap-3 px-4 py-3 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-xl font-medium transition-all shadow-[0_0_15px_rgba(16,185,129,0.1)]">
              <Activity className="w-5 h-5" />
              Post Management
            </Link>
          </nav>

          <button 
            onClick={async () => {
              await supabase.auth.signOut();
              localStorage.removeItem('userRole');
              localStorage.removeItem('memberData');
              window.location.href='/login';
            }}
            className="w-full flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl font-medium transition-all text-left"
          >
            <ArrowLeft className="w-5 h-5" />
            Sign Out
          </button>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-auto p-8 lg:p-12 relative z-10 w-full">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-12">
            <div>
              <h1 className="text-3xl font-bold tracking-tight mb-2 flex items-center gap-3">
                <Activity className="w-8 h-8 text-emerald-500" />
                Post Management
              </h1>
              <p className="text-gray-400 max-w-xl text-sm leading-relaxed">
                Broadcast new project updates, engineering photos, and announcements to the public.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            {/* New Post Form */}
            <div className="xl:col-span-1">
              <div className="bg-white/[0.02] border border-white/10 rounded-[2rem] p-8 backdrop-blur-sm shadow-2xl sticky top-8">
                <h2 className="text-xl font-bold mb-6 flex items-center gap-3 border-b border-white/5 pb-5 text-emerald-400 uppercase tracking-widest text-sm">
                  <PlusSquare className="w-5 h-5" />
                  New Post
                </h2>
                
                <form onSubmit={handleCreatePost} className="space-y-6">
                  <div className="space-y-3">
                    <label className="text-xs font-bold tracking-wider text-gray-400 uppercase">Image *</label>
                    
                    {/* Real File Input */}
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      ref={fileInputRef} 
                      onChange={handleImageChange} 
                      title="Upload an image"
                    />
                    
                    {!imagePreview ? (
                      <div 
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full h-48 border-2 border-dashed border-white/10 hover:border-emerald-500/50 rounded-2xl bg-[#030712]/50 flex flex-col items-center justify-center text-gray-500 cursor-pointer transition-colors group shadow-inner"
                      >
                        <ImageIcon className="w-10 h-10 mb-3 group-hover:text-emerald-400 transition-colors" />
                        <span className="text-xs font-medium">Click here to browse image</span>
                      </div>
                    ) : (
                      <div className="relative w-full h-48 rounded-2xl overflow-hidden group border border-emerald-500/30">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                        <button 
                          type="button" 
                          onClick={clearImage}
                          className="absolute top-3 right-3 bg-black/60 p-2 rounded-full text-white hover:text-red-400 hover:bg-black/80 transition-all shadow-xl"
                          title="Remove attached image"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="space-y-3">
                    <label htmlFor="title" className="text-xs font-bold tracking-wider text-gray-400 uppercase">Title *</label>
                    <input 
                      required
                      type="text" 
                      id="title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full bg-[#030712] border border-white/10 rounded-xl px-5 py-3.5 text-white placeholder:text-gray-600 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all shadow-inner"
                      placeholder="e.g. Drone Test #4"
                    />
                  </div>

                  <div className="space-y-3">
                    <label htmlFor="caption" className="text-xs font-bold tracking-wider text-gray-400 uppercase">Caption *</label>
                    <textarea 
                      required
                      id="caption"
                      rows={4}
                      value={caption}
                      onChange={(e) => setCaption(e.target.value)}
                      className="w-full bg-[#030712] border border-white/10 rounded-xl px-5 py-3.5 text-white placeholder:text-gray-600 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all resize-none shadow-inner"
                      placeholder="Share the details..."
                    ></textarea>
                  </div>

                  <button 
                    type="submit"
                    disabled={isUploading || !title || !caption || !imagePreview}
                    className="w-full flex items-center justify-center gap-3 py-4 mt-4 bg-emerald-500 text-black rounded-xl font-black tracking-wide hover:bg-emerald-400 disabled:opacity-50 transition-all hover:shadow-[0_0_25px_rgba(16,185,129,0.4)] active:scale-95 disabled:cursor-not-allowed"
                  >
                    {isUploading ? "UPLOADING POST..." : (
                      <>
                        <Send className="w-5 h-5" />
                        PUBLISH POST
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>

            {/* Feed / Grid */}
            <div className="xl:col-span-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {posts.map((post) => (
                  <div key={post.id} className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden group hover:border-emerald-500/30 transition-all duration-300 shadow-xl relative backdrop-blur-sm">
                    <button 
                      onClick={() => handleDelete(post.id)}
                      className="absolute top-4 right-4 z-20 p-3 bg-black/50 backdrop-blur-md rounded-full text-white/50 hover:text-red-400 hover:bg-red-900/30 border border-white/10 hover:border-red-500/30 transition-all opacity-0 group-hover:opacity-100 shadow-xl hover:scale-110 active:scale-95"
                      title="Delete Post"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    <div className="h-56 w-full relative overflow-hidden bg-[#080d1a]">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img 
                        src={post.imageUrl} 
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-90 group-hover:opacity-100 mix-blend-screen"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#080d1a] to-transparent opacity-90" />
                    </div>
                    
                    <div className="p-6 relative z-10 -mt-10">
                      <div className="inline-block px-3 py-1 bg-black/50 backdrop-blur-md rounded-full border border-white/10 text-[10px] font-bold tracking-widest text-emerald-400 mb-4 uppercase shadow-xl">
                        {post.date}
                      </div>
                      <h3 className="text-xl font-bold mb-3 tracking-tight group-hover:text-emerald-300 transition-colors">{post.title}</h3>
                      <p className="text-gray-400 text-sm leading-relaxed font-light">
                        {post.caption}
                      </p>
                    </div>
                  </div>
                ))}
                
                {posts.length === 0 && (
                  <div className="md:col-span-2 border border-white/5 border-dashed rounded-[2rem] p-16 flex flex-col items-center justify-center text-center bg-white/[0.02] backdrop-blur-sm">
                    <ImageIcon className="w-16 h-16 text-gray-700 mb-6" />
                    <p className="text-2xl font-bold text-gray-300 mb-2">No active posts</p>
                    <p className="text-gray-500">Create a post to share news with the public.</p>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
