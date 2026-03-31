import Link from "next/link";
import { ArrowRight, Cpu, Shield, Zap } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-transparent text-white selection:bg-emerald-500/30 overflow-hidden relative">
      {/* Background gradients */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-[30%] -left-[10%] w-[70vw] h-[70vw] rounded-full bg-emerald-900/10 blur-[120px]" />
        <div className="absolute top-[20%] -right-[20%] w-[60vw] h-[60vw] rounded-full bg-teal-900/10 blur-[120px]" />
      </div>

      <main className="relative z-10 w-full min-h-screen flex flex-col">
        {/* Navigation */}
        <nav className="flex items-center justify-between p-6 lg:px-12 border-b border-white/5 backdrop-blur-md sticky top-0 bg-[#030712]/50">
          <div className="flex items-center gap-3 cursor-pointer">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.4)]">
              <span className="font-extrabold text-black text-sm tracking-tight">AX</span>
            </div>
            <span className="text-xl font-bold tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 hidden sm:block">
              ALPHA X
            </span>
          </div>
          <div className="flex gap-4 sm:gap-8 items-center">
            <Link href="/contact" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">
              Contact
            </Link>
            <Link href="/login" className="text-sm font-medium px-5 py-2.5 rounded-full border border-white/20 hover:bg-white/5 transition-all text-white">
              Sign In
            </Link>
            <Link href="/join" className="text-sm font-medium px-5 py-2.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.1)] hover:shadow-[0_0_15px_rgba(16,185,129,0.3)] text-emerald-300 transition-all">
              Sign Up
            </Link>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="flex flex-1 flex-col items-center justify-center text-center px-4 py-32 relative">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/10 bg-white/5 mb-10 backdrop-blur-sm cursor-default">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
            <span className="text-xs font-semibold text-gray-300 uppercase tracking-wider">Next-Gen Robotics Lab</span>
          </div>
          
          <h1 className="text-6xl md:text-8xl lg:text-9xl font-black tracking-tighter mb-8 leading-[0.9]">
            ENGINEERING <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-500 to-purple-600">
              THE FUTURE
            </span>
          </h1>
          
          <p className="max-w-2xl text-lg md:text-xl text-gray-400 mb-14 font-light leading-relaxed">
            We are a team pushing the boundaries of autonomous systems, 
            hardware design, and artificial intelligence. 
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link href="/join" className="group flex items-center justify-center gap-3 px-8 py-4 bg-white text-black rounded-full font-bold hover:bg-gray-200 transition-all hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(255,255,255,0.2)]">
              Sign Up 
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link href="/login" className="flex items-center justify-center gap-3 px-8 py-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 rounded-full font-bold hover:bg-emerald-500/20 transition-all hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(16,185,129,0.1)]">
              Sign In
            </Link>
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-24 px-6 lg:px-12 w-full max-w-7xl mx-auto border-t border-white/5 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="p-10 rounded-[2rem] bg-white/5 border border-white/5 hover:border-emerald-500/30 transition-all duration-300 hover:shadow-[0_0_30px_rgba(16,185,129,0.1)] group cursor-default">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 border border-emerald-500/20">
                <Cpu className="w-8 h-8 text-emerald-400" />
              </div>
              <h3 className="text-2xl font-bold mb-4 tracking-tight">Custom Hardware</h3>
              <p className="text-gray-400 leading-relaxed font-light">
                Proprietary circuitry and embedded systems designed from the ground up for maximum efficiency and speed.
              </p>
            </div>
            
            <div className="p-10 rounded-[2rem] bg-white/5 border border-white/5 hover:border-teal-500/30 transition-all duration-300 hover:shadow-[0_0_30px_rgba(20,184,166,0.1)] group cursor-default">
              <div className="w-16 h-16 rounded-2xl bg-teal-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 border border-teal-500/20">
                <Zap className="w-8 h-8 text-teal-400" />
              </div>
              <h3 className="text-2xl font-bold mb-4 tracking-tight">AI & Autonomy</h3>
              <p className="text-gray-400 leading-relaxed font-light">
                Implementing state-of-the-art machine learning algorithms to enable dynamic decision-making in real-time.
              </p>
            </div>
          </div>
        </section>

      </main>
    </div>
  );
}
