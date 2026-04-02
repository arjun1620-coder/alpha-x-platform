import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, ArrowRight, Rocket, ExternalLink, Calendar, Users, Star } from "lucide-react";
import { supabase } from "@/lib/supabase";

export const revalidate = 60;

export default async function ProjectsPage() {
  const { data: projects } = await supabase
    .from('projects')
    .select('*')
    .eq('published', true)
    .order('created_at', { ascending: false });

  return (
    <div className="min-h-screen bg-transparent text-white selection:bg-indigo-500/30 overflow-hidden relative py-20 px-4 sm:px-6 lg:px-8">
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-indigo-900/10 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-purple-900/10 blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-indigo-400 transition-colors mb-12 font-medium">
          <ArrowLeft className="w-5 h-5" />
          Back to Home
        </Link>
        
        <div className="text-center mb-16">
          <div className="animate-on-scroll inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-400 text-xs font-bold tracking-widest uppercase mb-6">
            <Rocket className="w-4 h-4" /> Project Showcase
          </div>
          <h1 className="animate-on-scroll stagger-1 text-5xl md:text-7xl font-black tracking-tighter mb-6">
            WHAT WE <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400 animate-gradient-text">BUILD</span>
          </h1>
          <p className="animate-on-scroll stagger-2 text-xl text-gray-400 font-light max-w-2xl mx-auto leading-relaxed">
            Explore our portfolio of robots, autonomous systems, and engineering breakthroughs.
          </p>
        </div>

        {/* Projects Grid */}
        {projects && projects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {projects.map((project: any, index: number) => (
              <div 
                key={project.id} 
                className={`animate-on-scroll stagger-${Math.min(index + 1, 6)} bg-white/[0.03] border border-white/10 rounded-[2rem] overflow-hidden group hover:border-indigo-500/30 transition-all duration-500 card-hover card-spotlight`}
              >
                {/* Project Image */}
                {project.image_url && (
                  <div className="relative h-48 overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img 
                      src={project.image_url} 
                      alt={project.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#030712] via-transparent to-transparent" />
                    {project.category && (
                      <span className="absolute top-4 left-4 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 backdrop-blur-md">
                        {project.category}
                      </span>
                    )}
                  </div>
                )}
                
                {/* Project Info */}
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-2 tracking-tight group-hover:text-indigo-300 transition-colors">
                    {project.title}
                  </h3>
                  <p className="text-gray-400 text-sm leading-relaxed mb-4 line-clamp-3">
                    {project.description}
                  </p>
                  
                  {/* Tags */}
                  {project.tags && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {project.tags.map((tag: string) => (
                        <span key={tag} className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-white/5 text-gray-400 rounded border border-white/5">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Meta */}
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {project.created_at && new Date(project.created_at).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}
                    </div>
                    {project.team_name && (
                      <div className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {project.team_name}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="animate-on-scroll text-center py-20">
            <div className="w-20 h-20 rounded-full bg-white/5 border border-white/5 flex items-center justify-center mx-auto mb-6">
              <Rocket className="w-10 h-10 text-gray-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-400 mb-2">Projects Coming Soon</h3>
            <p className="text-gray-600 max-w-md mx-auto">
              Our team is currently working on groundbreaking projects. Check back soon to see what we're building!
            </p>
          </div>
        )}

        {/* CTA */}
        <div className="animate-on-scroll text-center mt-20 py-16 border-t border-white/5">
          <h3 className="text-2xl font-bold mb-4">Want to contribute?</h3>
          <p className="text-gray-400 mb-8 max-w-md mx-auto">Join AlphaX Robotics and work on cutting-edge projects with our engineering team.</p>
          <Link href="/join" className="group inline-flex items-center gap-3 px-8 py-4 bg-white text-black rounded-full font-bold hover:bg-gray-100 transition-all hover:scale-105 active:scale-95 btn-glow">
            Apply Now <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </div>
  );
}
