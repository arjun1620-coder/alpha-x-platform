"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { ArrowLeft, Users, Activity, Network, Calendar, Shield, Plus, Trash2, ExternalLink, Cpu, Search, Loader2, X, Image as ImageIcon } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function ComponentsPage() {
  const [components, setComponents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddingComponent, setIsAddingComponent] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Form state
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [buyLink, setBuyLink] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("sensor");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const role = localStorage.getItem('userRole');
    setUserRole(role);
    fetchComponents();
  }, []);

  const fetchComponents = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('components')
      .select('*')
      .order('created_at', { ascending: false });

    if (data) setComponents(data);
    setIsLoading(false);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const clearForm = () => {
    setName("");
    setDescription("");
    setBuyLink("");
    setPrice("");
    setCategory("sensor");
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    setIsAddingComponent(false);
  };

  const handleAddComponent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !buyLink) return;

    setIsUploading(true);

    let imageUrl = "";

    // Upload image to Supabase storage if provided
    if (imageFile) {
      const fileExt = imageFile.name.split('.').pop();
      const fileName = `component_${Date.now()}.${fileExt}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('components')
        .upload(fileName, imageFile, { upsert: true });

      if (!uploadError && uploadData) {
        const { data: urlData } = supabase.storage.from('components').getPublicUrl(fileName);
        imageUrl = urlData.publicUrl;
      }
    }

    const { error } = await supabase.from('components').insert({
      name,
      description,
      buy_link: buyLink,
      price,
      category,
      image_url: imageUrl,
    });

    if (!error) {
      clearForm();
      fetchComponents();
    }

    setIsUploading(false);
  };

  const handleDeleteComponent = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}" from the components catalogue?`)) return;
    await supabase.from('components').delete().eq('id', id);
    fetchComponents();
  };

  const filteredComponents = components.filter(c =>
    c.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const categoryColors: Record<string, string> = {
    sensor: 'text-cyan-400 border-cyan-500/30 bg-cyan-500/10',
    microcontroller: 'text-indigo-400 border-indigo-500/30 bg-indigo-500/10',
    motor: 'text-yellow-400 border-yellow-500/30 bg-yellow-500/10',
    display: 'text-pink-400 border-pink-500/30 bg-pink-500/10',
    power: 'text-orange-400 border-orange-500/30 bg-orange-500/10',
    communication: 'text-green-400 border-green-500/30 bg-green-500/10',
    mechanical: 'text-slate-400 border-slate-500/30 bg-slate-500/10',
    other: 'text-gray-400 border-gray-500/30 bg-gray-500/10',
  };

  return (
    <div className="min-h-screen bg-transparent text-white selection:bg-indigo-500/30 overflow-hidden relative">
      <div className="flex h-screen">
        
        {/* Sidebar */}
        <div className="w-64 border-r border-white/5 bg-[#080d1a] p-6 hidden md:flex flex-col">
          <div className="flex items-center gap-3 mb-12">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-400 to-slate-600 flex items-center justify-center">
              <span className="font-extrabold text-black text-xs tracking-tight">AX</span>
            </div>
            <span className="font-bold tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">
              {userRole === 'admin' ? 'ADMIN' : 'MEMBER'}
            </span>
          </div>

          <nav className="space-y-2 flex-1">
            {userRole === 'admin' && (
              <>
                <Link href="/dashboard/applications" className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl font-medium transition-all">
                  <Users className="w-5 h-5" /> Applications
                </Link>
              </>
            )}
            <Link href="/dashboard/teams" className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl font-medium transition-all">
              <Network className="w-5 h-5" /> Teams
            </Link>
            <Link href="/dashboard/events" className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl font-medium transition-all">
              <Calendar className="w-5 h-5" /> Announcements
            </Link>
            {userRole === 'admin' && (
              <Link href="/dashboard/posts" className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl font-medium transition-all">
                <Activity className="w-5 h-5" /> Post Management
              </Link>
            )}
            <Link href="/dashboard/components" className="flex items-center gap-3 px-4 py-3 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-xl font-medium transition-all shadow-[0_0_15px_rgba(99,102,241,0.1)]">
              <Cpu className="w-5 h-5" /> Components
            </Link>
            <Link href="/dashboard/payments" className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl font-medium transition-all">
              <Activity className="w-5 h-5" /> Payments
            </Link>
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

        {/* Main Content */}
        <div className="flex-1 overflow-auto p-8 lg:p-12 relative z-10 w-full">
          
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-10">
            <div>
              <h1 className="text-3xl font-bold tracking-tight mb-2 flex items-center gap-3">
                <Cpu className="w-8 h-8 text-indigo-500" />
                Component Catalogue
              </h1>
              <p className="text-gray-400 max-w-xl text-sm leading-relaxed">
                Browse electronic components used in Alpha X projects. Click &quot;Buy&quot; to purchase directly from the supplier.
              </p>
            </div>

            <div className="flex items-center gap-3">
              {/* Search */}
              <div className="relative w-full sm:w-64">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-gray-500">
                  <Search className="w-4 h-4" />
                </div>
                <input 
                  type="text" 
                  placeholder="Search components..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#030712] border border-white/10 rounded-full pl-11 pr-4 py-2.5 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 transition-all"
                />
              </div>

              {/* Add Component btn (Admin only) */}
              {userRole === 'admin' && (
                <button
                  onClick={() => setIsAddingComponent(true)}
                  className="flex items-center gap-2 px-4 py-2.5 bg-indigo-500 text-black rounded-full font-bold text-sm hover:bg-indigo-400 transition-all active:scale-95 whitespace-nowrap"
                >
                  <Plus className="w-4 h-4" />
                  Add Component
                </button>
              )}
            </div>
          </div>

          {/* Add Component Modal */}
          {isAddingComponent && userRole === 'admin' && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={clearForm} />
              <div className="relative w-full max-w-lg bg-[#080d1a]/95 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
                <button title="Close dialog" onClick={clearForm} className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors">
                  <X className="w-5 h-5" />
                </button>

                <h2 className="text-xl font-bold mb-6 text-white flex items-center gap-2">
                  <Plus className="w-5 h-5 text-indigo-400" />
                  Add New Component
                </h2>

                <form onSubmit={handleAddComponent} className="space-y-4">
                  {/* Image Upload */}
                  <div>
                    <label className="text-xs font-bold tracking-wider text-gray-500 uppercase block mb-2">Component Image</label>
                    <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleImageChange} aria-label="Upload component image" title="Upload component image" />
                    {!imagePreview ? (
                      <div 
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full h-36 border-2 border-dashed border-white/10 hover:border-indigo-500/50 rounded-2xl bg-[#030712]/50 flex flex-col items-center justify-center text-gray-500 cursor-pointer transition-colors group"
                      >
                        <ImageIcon className="w-8 h-8 mb-2 group-hover:text-indigo-400 transition-colors" />
                        <span className="text-xs font-medium">Click to upload component image</span>
                      </div>
                    ) : (
                      <div className="relative w-full h-36 rounded-2xl overflow-hidden border border-indigo-500/30">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                        <button type="button" title="Remove image" onClick={() => { setImageFile(null); setImagePreview(null); if(fileInputRef.current) fileInputRef.current.value=""; }} className="absolute top-2 right-2 bg-black/60 p-1.5 rounded-full text-white hover:text-red-400 transition-all">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="text-xs font-bold tracking-wider text-gray-500 uppercase block mb-2">Component Name *</label>
                    <input required type="text" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. MPU-6050 Gyroscope" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500 transition-all" />
                  </div>

                  <div>
                    <label className="text-xs font-bold tracking-wider text-gray-500 uppercase block mb-2">Description</label>
                    <textarea rows={2} value={description} onChange={e => setDescription(e.target.value)} placeholder="What is this component used for?" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500 transition-all resize-none" />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold tracking-wider text-gray-500 uppercase block mb-2">Price (₹)</label>
                      <input type="text" value={price} onChange={e => setPrice(e.target.value)} placeholder="e.g. 120" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500 transition-all" />
                    </div>
                    <div>
                      <label className="text-xs font-bold tracking-wider text-gray-500 uppercase block mb-2">Category</label>
                      <select aria-label="Component category" title="Component category" value={category} onChange={e => setCategory(e.target.value)} className="w-full bg-[#030712] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500 transition-all appearance-none">
                        <option value="sensor">Sensor</option>
                        <option value="microcontroller">Microcontroller</option>
                        <option value="motor">Motor/Driver</option>
                        <option value="display">Display</option>
                        <option value="power">Power</option>
                        <option value="communication">Communication</option>
                        <option value="mechanical">Mechanical</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold tracking-wider text-gray-500 uppercase block mb-2">Buy Link *</label>
                    <input required type="url" value={buyLink} onChange={e => setBuyLink(e.target.value)} placeholder="https://www.robu.in/..." className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500 transition-all" />
                  </div>

                  <button type="submit" disabled={isUploading} className="w-full py-3.5 bg-indigo-500 text-black rounded-xl font-black uppercase tracking-widest text-sm hover:bg-indigo-400 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2">
                    {isUploading ? <><Loader2 className="w-4 h-4 animate-spin" /> Uploading...</> : <><Plus className="w-4 h-4" /> Add to Catalogue</>}
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* Components Grid */}
          {isLoading ? (
            <div className="flex justify-center py-24">
              <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
            </div>
          ) : filteredComponents.length === 0 ? (
            <div className="border border-white/5 border-dashed rounded-[2rem] p-16 flex flex-col items-center justify-center text-center bg-white/[0.02]">
              <Cpu className="w-16 h-16 text-gray-700 mb-6" />
              <p className="text-2xl font-bold text-gray-300 mb-2">No Components Yet</p>
              <p className="text-gray-500">
                {userRole === 'admin' ? 'Add components to build the catalogue.' : 'The admin has not added any components yet.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredComponents.map((comp) => (
                <div key={comp.id} className="bg-white/[0.03] border border-white/10 rounded-2xl overflow-hidden group hover:border-indigo-500/40 hover:shadow-[0_0_25px_rgba(99,102,241,0.1)] transition-all duration-300 flex flex-col">
                  {/* Component Image */}
                  <div className="h-44 w-full bg-[#080d1a] flex items-center justify-center relative overflow-hidden">
                    {comp.image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img 
                        src={comp.image_url} 
                        alt={comp.name} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="flex flex-col items-center gap-2 text-gray-700">
                        <Cpu className="w-12 h-12" />
                        <span className="text-xs font-medium">No Image</span>
                      </div>
                    )}
                    {/* Category badge */}
                    <div className={`absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${categoryColors[comp.category] || categoryColors.other}`}>
                      {comp.category}
                    </div>
                    {/* Admin delete */}
                    {userRole === 'admin' && (
                      <button 
                        title="Delete component"
                        onClick={() => handleDeleteComponent(comp.id, comp.name)}
                        className="absolute top-2 right-2 p-2 bg-black/60 rounded-full text-white/40 hover:text-red-400 transition-all opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {/* Component Info */}
                  <div className="p-5 flex flex-col flex-1">
                    <h3 className="font-bold text-white text-base mb-1 group-hover:text-indigo-300 transition-colors">{comp.name}</h3>
                    {comp.description && (
                      <p className="text-gray-500 text-xs leading-relaxed mb-3 flex-1 line-clamp-2">{comp.description}</p>
                    )}
                    
                    <div className="flex items-center justify-between mt-auto pt-3 border-t border-white/5">
                      {comp.price ? (
                        <span className="text-indigo-400 font-bold text-sm">₹{comp.price}</span>
                      ) : (
                        <span className="text-gray-600 text-xs">Price N/A</span>
                      )}
                      <a
                        href={comp.buy_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-500 text-black rounded-lg text-xs font-black uppercase tracking-wider hover:bg-indigo-400 transition-all hover:scale-105 active:scale-95"
                      >
                        Buy <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
