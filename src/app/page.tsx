import Link from "next/link";
import { ArrowRight, Cpu, Shield, Zap, Calendar, Trophy, AlertTriangle, Megaphone, ChevronRight } from "lucide-react";
import { supabase } from "@/lib/supabase";

// Cache for 60 seconds instead of 0 — huge speed improvement
export const revalidate = 60;

export default async function Home() {
  const { data: events } = await supabase
    .from('events')
    .select('*')
    .order('event_date', { ascending: true })
    .limit(3);

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
      {/* Background Orbs — Animated, GPU accelerated */}
      <div className="absolute inset-0 pointer-events-none gpu-accelerate">
        <div className="absolute -top-[30%] -left-[10%] w-[70vw] h-[70vw] rounded-full bg-indigo-900/10 blur-[120px] animate-glow-pulse" />
        <div className="absolute top-[20%] -right-[20%] w-[60vw] h-[60vw] rounded-full bg-slate-900/10 blur-[120px] animate-glow-pulse-alt" />
      </div>

      <main className="relative z-10 w-full min-h-screen flex flex-col">
        {/* Navigation — Glass morphism */}
        <nav className="flex items-center justify-between p-6 lg:px-12 border-b border-white/5 nav-blur sticky top-0 bg-[#030712]/60 z-50">
          <div className="flex items-center gap-3 cursor-pointer group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-400 to-slate-600 flex items-center justify-center shadow-[0_0_15px_rgba(99,102,241,0.4)] group-hover:shadow-[0_0_25px_rgba(99,102,241,0.6)] transition-shadow duration-500">
              <span className="font-extrabold text-black text-sm tracking-tight">AX</span>
            </div>
            <span className="text-xl font-bold tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 hidden sm:block">
              AlphaX Robotics
            </span>
          </div>
          <div className="flex gap-4 sm:gap-8 items-center">
            <Link href="/contact" className="text-sm font-medium text-gray-300 hover:text-white transition-colors duration-300">
              Contact
            </Link>
            <Link href="/login" className="text-sm font-medium px-5 py-2.5 rounded-full border border-white/20 hover:bg-white/5 transition-all duration-300 text-white hover:border-white/40">
              Sign In
            </Link>
            <Link href="/join" className="text-sm font-medium px-5 py-2.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 hover:bg-indigo-500/20 shadow-[0_0_10px_rgba(99,102,241,0.1)] hover:shadow-[0_0_20px_rgba(99,102,241,0.4)] text-indigo-300 transition-all duration-300 btn-glow">
              Sign Up
            </Link>
          </div>
        </nav>

        {/* ============================================
            HERO SECTION — Apple-inspired entrance
            ============================================ */}
        <section className="flex flex-1 flex-col items-center justify-center text-center px-4 py-32 relative overflow-hidden">
          
          {/* Hero floating particles */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute top-1/4 left-1/4 w-1 h-1 rounded-full bg-indigo-400/60 animate-float" />
            <div className="absolute top-1/3 right-1/3 w-1.5 h-1.5 rounded-full bg-purple-400/40 animate-float-delayed" />
            <div className="absolute bottom-1/3 left-1/3 w-1 h-1 rounded-full bg-slate-400/50 animate-float-slow" />
            <div className="absolute top-1/2 right-1/4 w-0.5 h-0.5 rounded-full bg-indigo-300/60 animate-float" />
            <div className="absolute bottom-1/4 right-1/2 w-1 h-1 rounded-full bg-blue-400/30 animate-float-delayed" />
          </div>

          {/* Badge */}
          <div className="animate-hero-badge inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/10 bg-white/5 mb-10 backdrop-blur-sm cursor-default">
            <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse shadow-[0_0_8px_rgba(99,102,241,0.8)]" />
            <span className="text-xs font-semibold text-gray-300 uppercase tracking-wider">Next-Gen Robotics Lab</span>
          </div>
          
          {/* Title */}
          <h1 className="text-6xl md:text-8xl lg:text-9xl font-black tracking-tighter mb-8 leading-[0.9]">
            <span className="animate-hero-title inline-block">ENGINEERING</span>
            <br />
            <span className="animate-hero-title-delay inline-block text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-slate-400 to-purple-500 animate-gradient-text">
              THE FUTURE
            </span>
          </h1>
          
          {/* Subtitle */}
          <p className="animate-hero-sub max-w-2xl text-lg md:text-xl text-gray-400 mb-14 font-light leading-relaxed">
            We are a team pushing the boundaries of autonomous systems, 
            hardware design, and artificial intelligence.
          </p>

          {/* CTA Buttons */}
          <div className="animate-hero-buttons flex flex-col sm:flex-row gap-6 justify-center">
            <Link href="/join" className="group flex items-center justify-center gap-3 px-8 py-4 bg-white text-black rounded-full font-bold hover:bg-gray-100 transition-all duration-300 hover:scale-105 active:scale-95 shadow-[0_0_30px_rgba(255,255,255,0.15)] hover:shadow-[0_0_40px_rgba(255,255,255,0.3)] btn-glow">
              Sign Up 
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1.5 transition-transform duration-300" />
            </Link>
            <Link href="/login" className="flex items-center justify-center gap-3 px-8 py-4 bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 rounded-full font-bold hover:bg-indigo-500/20 transition-all duration-300 hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(99,102,241,0.1)] hover:shadow-[0_0_30px_rgba(99,102,241,0.25)]">
              Sign In
            </Link>
          </div>

          {/* Bottom gradient fade */}
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#030712] to-transparent pointer-events-none" />
        </section>

        {/* ============================================
            FEATURES GRID — Scroll-triggered cards
            ============================================ */}
        <section className="py-24 px-6 lg:px-12 w-full max-w-7xl mx-auto border-t border-white/5 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="animate-on-scroll stagger-1 p-10 rounded-[2rem] bg-white/[0.03] border border-white/5 hover:border-indigo-500/30 transition-all duration-500 group cursor-default card-hover">
              <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 border border-indigo-500/20 group-hover:shadow-[0_0_30px_rgba(99,102,241,0.2)]">
                <Cpu className="w-8 h-8 text-indigo-400" />
              </div>
              <h3 className="text-2xl font-bold mb-4 tracking-tight">Custom Hardware</h3>
              <p className="text-gray-400 leading-relaxed font-light">
                Proprietary circuitry and embedded systems designed from the ground up for maximum efficiency and speed.
              </p>
              <div className="mt-6 flex items-center gap-2 text-indigo-400 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                Learn more <ChevronRight className="w-4 h-4" />
              </div>
            </div>
            
            <div className="animate-on-scroll stagger-2 p-10 rounded-[2rem] bg-white/[0.03] border border-white/5 hover:border-purple-500/30 transition-all duration-500 group cursor-default card-hover">
              <div className="w-16 h-16 rounded-2xl bg-purple-500/10 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:-rotate-3 transition-all duration-500 border border-purple-500/20 group-hover:shadow-[0_0_30px_rgba(168,85,247,0.2)]">
                <Zap className="w-8 h-8 text-purple-400" />
              </div>
              <h3 className="text-2xl font-bold mb-4 tracking-tight">AI & Autonomy</h3>
              <p className="text-gray-400 leading-relaxed font-light">
                Implementing state-of-the-art machine learning algorithms to enable dynamic decision-making in real-time.
              </p>
              <div className="mt-6 flex items-center gap-2 text-purple-400 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                Learn more <ChevronRight className="w-4 h-4" />
              </div>
            </div>

            <div className="animate-on-scroll stagger-3 p-10 rounded-[2rem] bg-white/[0.03] border border-white/5 hover:border-emerald-500/30 transition-all duration-500 group cursor-default card-hover">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 border border-emerald-500/20 group-hover:shadow-[0_0_30px_rgba(16,185,129,0.2)]">
                <Shield className="w-8 h-8 text-emerald-400" />
              </div>
              <h3 className="text-2xl font-bold mb-4 tracking-tight">Secure Systems</h3>
              <p className="text-gray-400 leading-relaxed font-light">
                Battle-tested security protocols protecting every layer of our autonomous operations and team communications.
              </p>
              <div className="mt-6 flex items-center gap-2 text-emerald-400 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                Learn more <ChevronRight className="w-4 h-4" />
              </div>
            </div>

            <div className="animate-on-scroll stagger-4 p-10 rounded-[2rem] bg-white/[0.03] border border-white/5 hover:border-amber-500/30 transition-all duration-500 group cursor-default card-hover">
              <div className="w-16 h-16 rounded-2xl bg-amber-500/10 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:-rotate-3 transition-all duration-500 border border-amber-500/20 group-hover:shadow-[0_0_30px_rgba(245,158,11,0.2)]">
                <Calendar className="w-8 h-8 text-amber-400" />
              </div>
              <h3 className="text-2xl font-bold mb-4 tracking-tight">Agile Ops</h3>
              <p className="text-gray-400 leading-relaxed font-light">
                Sprint-based project management with real-time event tracking, team coordination, and deadline monitoring.
              </p>
              <div className="mt-6 flex items-center gap-2 text-amber-400 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                Learn more <ChevronRight className="w-4 h-4" />
              </div>
            </div>
          </div>
        </section>

        {/* ============================================
            EVENTS — Scroll-animated with stagger
            ============================================ */}
        {events && events.length > 0 && (
          <section className="mt-16 max-w-4xl mx-auto pb-20 px-4">
            <div className="animate-on-scroll text-center mb-12">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-400 text-xs font-bold tracking-widest uppercase mb-4">
                <Calendar className="w-4 h-4" /> Live Radar
              </div>
              <h2 className="text-3xl md:text-5xl font-black tracking-tighter uppercase mb-4">
                Operations & Events
              </h2>
            </div>
            
            <div className="space-y-4">
              {events.map((ev: any, index: number) => (
                <div 
                  key={ev.id} 
                  className={`animate-on-scroll stagger-${index + 1} bg-white/[0.03] border border-white/10 rounded-3xl p-6 md:p-8 backdrop-blur-sm shadow-xl flex flex-col md:flex-row gap-6 items-start group hover:border-indigo-500/30 transition-all duration-500 card-hover`}
                >
                  <div className={`p-4 rounded-2xl border ${getCategoryColor(ev.category)} flex-shrink-0 flex items-center justify-center group-hover:scale-110 transition-transform duration-500`}>
                    {getCategoryIcon(ev.category, "w-8 h-8")}
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded border ${getCategoryColor(ev.category)}`}>
                        {ev.category}
                      </span>
                      <span className="text-gray-400 font-mono text-sm">
                        {new Date(ev.event_date).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                    <h3 className="text-xl md:text-2xl font-bold text-white mb-2">{ev.title}</h3>
                    <p className="text-gray-400 leading-relaxed max-w-2xl">{ev.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ============================================
            FOOTER
            ============================================ */}
        <footer className="animate-on-scroll border-t border-white/5 py-12 px-6 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-400 to-slate-600 flex items-center justify-center">
              <span className="font-extrabold text-black text-xs">AX</span>
            </div>
            <span className="font-bold tracking-widest text-gray-500 text-sm uppercase">AlphaX Robotics</span>
          </div>
          <p className="text-gray-600 text-xs">
            © {new Date().getFullYear()} AlphaX Robotics. Engineering the future.
          </p>
        </footer>

      </main>
    </div>
  );
}
