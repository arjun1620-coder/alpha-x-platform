"use client";

import { useState, useEffect, useRef } from "react";
import { Rocket, Plus, Loader2, Trash2, Eye, EyeOff, Save, X, Upload } from "lucide-react";
import { supabase } from "@/lib/supabase";
import Sidebar from "@/components/Sidebar";
import { useToast } from "@/components/Toast";

export default function ProjectsManagement() {
  const [projects, setProjects] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addToast, ToastContainer } = useToast();

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [teamName, setTeamName] = useState("");
  const [tags, setTags] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    const { data } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false });
    if (data) setProjects(data);
    setIsLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    setIsSubmitting(true);

    let imageUrl = "";

    // Upload image if provided
    if (imageFile) {
      const fileName = `${Date.now()}-${imageFile.name}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('project-images')
        .upload(fileName, imageFile);

      if (uploadError) {
        addToast("Image upload failed. Ensure 'project-images' bucket exists.", "error");
      } else {
        const { data: urlData } = supabase.storage
          .from('project-images')
          .getPublicUrl(fileName);
        imageUrl = urlData?.publicUrl || "";
      }
    }

    const projectData = {
      title: title.trim(),
      description: description.trim(),
      category: category.trim() || null,
      team_name: teamName.trim() || null,
      tags: tags.trim() ? tags.split(",").map(t => t.trim()) : [],
      image_url: imageUrl || null,
      published: true,
    };

    const { error } = await supabase.from('projects').insert(projectData);

    if (error) {
      addToast(`Failed to create project: ${error.message}`, "error");
    } else {
      addToast("Project published successfully!", "success");
      setTitle(""); setDescription(""); setCategory(""); setTeamName(""); setTags(""); setImageFile(null);
      setShowForm(false);
      fetchProjects();
    }

    setIsSubmitting(false);
  };

  const togglePublished = async (id: string, currentPublished: boolean) => {
    await supabase.from('projects').update({ published: !currentPublished }).eq('id', id);
    setProjects(prev => prev.map(p => p.id === id ? { ...p, published: !currentPublished } : p));
    addToast(`Project ${!currentPublished ? 'published' : 'unpublished'}`, "info");
  };

  const deleteProject = async (id: string) => {
    if (!confirm("Delete this project permanently?")) return;
    await supabase.from('projects').delete().eq('id', id);
    setProjects(prev => prev.filter(p => p.id !== id));
    addToast("Project deleted", "info");
  };

  return (
    <div className="min-h-screen bg-transparent text-white selection:bg-indigo-500/30 overflow-hidden relative">
      <ToastContainer />
      <div className="flex h-screen">
        <Sidebar />

        <div className="flex-1 overflow-auto p-4 sm:p-8 lg:p-12 pt-20 sm:pt-12 relative z-10 w-full animate-slide-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-12">
            <div>
              <h1 className="text-3xl font-bold tracking-tight mb-2 flex items-center gap-3">
                <Rocket className="w-8 h-8 text-indigo-500" />
                Project Showcases
              </h1>
              <p className="text-gray-400 max-w-xl text-sm leading-relaxed">
                Manage projects displayed on the public showcase page.
              </p>
            </div>
            <button
              onClick={() => setShowForm(!showForm)}
              className="flex items-center gap-2 px-5 py-3 bg-indigo-500 text-black rounded-xl font-bold hover:bg-indigo-400 transition-all active:scale-95"
            >
              {showForm ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
              {showForm ? "Cancel" : "New Project"}
            </button>
          </div>

          {/* New Project Form */}
          {showForm && (
            <form onSubmit={handleSubmit} className="bg-white/[0.03] border border-white/10 rounded-2xl p-8 mb-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Project Title *</label>
                  <input value={title} onChange={(e) => setTitle(e.target.value)} required className="w-full bg-[#030712] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-indigo-500 focus:outline-none transition-all" placeholder="6-Axis Robotic Arm" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Category</label>
                  <input value={category} onChange={(e) => setCategory(e.target.value)} className="w-full bg-[#030712] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-indigo-500 focus:outline-none transition-all" placeholder="Robotics, AI, IoT..." />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Team</label>
                  <input value={teamName} onChange={(e) => setTeamName(e.target.value)} className="w-full bg-[#030712] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-indigo-500 focus:outline-none transition-all" placeholder="Team Alpha" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Tags (comma separated)</label>
                  <input value={tags} onChange={(e) => setTags(e.target.value)} className="w-full bg-[#030712] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-indigo-500 focus:outline-none transition-all" placeholder="Arduino, ROS, Python" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Description *</label>
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} required rows={4} className="w-full bg-[#030712] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-indigo-500 focus:outline-none transition-all resize-y" placeholder="Describe what this project does..." />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Project Image</label>
                <div className="flex items-center gap-4">
                  <button type="button" onClick={() => fileRef.current?.click()} className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-gray-300 hover:bg-white/10 transition-all">
                    <Upload className="w-4 h-4" /> {imageFile ? imageFile.name : "Choose image"}
                  </button>
                  <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => setImageFile(e.target.files?.[0] || null)} />
                </div>
              </div>
              <button type="submit" disabled={isSubmitting} className="flex items-center gap-2 px-6 py-3 bg-indigo-500 text-black rounded-xl font-bold hover:bg-indigo-400 transition-all disabled:opacity-50">
                {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                Publish Project
              </button>
            </form>
          )}

          {/* Projects List */}
          <div className="space-y-4">
            {isLoading ? (
              <div className="flex justify-center py-20">
                <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
              </div>
            ) : projects.length === 0 ? (
              <div className="text-center py-20 text-gray-500">
                <Rocket className="w-12 h-12 mx-auto mb-4 opacity-30" />
                <p className="font-bold">No projects yet</p>
                <p className="text-sm mt-1">Click "New Project" to create your first showcase.</p>
              </div>
            ) : projects.map((project) => (
              <div key={project.id} className="bg-white/[0.02] border border-white/10 rounded-2xl p-6 flex flex-col md:flex-row gap-6 items-start hover:border-indigo-500/20 transition-all">
                {project.image_url && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={project.image_url} alt={project.title} className="w-24 h-24 rounded-xl object-cover border border-white/10 flex-shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="text-lg font-bold truncate">{project.title}</h3>
                    <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded ${project.published ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-gray-500/10 text-gray-500 border border-gray-500/20'}`}>
                      {project.published ? 'Live' : 'Draft'}
                    </span>
                  </div>
                  <p className="text-gray-400 text-sm line-clamp-2">{project.description}</p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {project.tags?.map((tag: string) => (
                      <span key={tag} className="px-2 py-0.5 text-[10px] font-bold bg-white/5 text-gray-500 rounded">{tag}</span>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => togglePublished(project.id, project.published)} className="p-2 text-gray-500 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition-all" title={project.published ? "Unpublish" : "Publish"}>
                    {project.published ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                  <button onClick={() => deleteProject(project.id)} className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all" title="Delete">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
