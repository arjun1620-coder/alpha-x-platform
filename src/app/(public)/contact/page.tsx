import Link from "next/link";
import { ArrowLeft, Mail, Phone, AtSign } from "lucide-react";

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-transparent text-white selection:bg-indigo-500/30 overflow-hidden relative p-8 sm:p-12 flex flex-col items-center">
      {/* Background radial soft glows to accent the layout */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[10%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-indigo-900/10 blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-slate-900/10 blur-[120px]" />
      </div>

      <div className="relative z-10 w-full max-w-4xl mx-auto mt-10">
        <Link href="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-indigo-400 transition-colors mb-12 font-medium">
          <ArrowLeft className="w-5 h-5" />
          Back to Home
        </Link>
        
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-full text-xs font-bold tracking-widest uppercase mb-4">
            Support Line
          </div>
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-4 uppercase">
            Get in <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-slate-500">Touch</span>
          </h1>
          <p className="text-lg text-gray-400 font-light max-w-2xl mx-auto leading-relaxed">
            Have a question, want to collaborate, or just want to see our latest builds? Reach out to Alpha X Robotics through any of our channels below.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Email Card */}
          <a href="mailto:alphaxrobotics@gmail.com" className="bg-[#080d1a]/80 border border-white/10 hover:border-indigo-500/40 rounded-[2rem] p-8 backdrop-blur-xl relative shadow-xl hover:shadow-[0_0_30px_rgba(99,102,241,0.15)] transition-all group flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Mail className="w-8 h-8 text-indigo-400" />
            </div>
            <h2 className="text-xl font-bold mb-2">Email Us</h2>
            <p className="text-indigo-400 font-medium break-all text-sm">alphaxrobotics@gmail.com</p>
          </a>

          {/* Phone Card */}
          <div className="bg-[#080d1a]/80 border border-white/10 hover:border-slate-500/40 rounded-[2rem] p-8 backdrop-blur-xl relative shadow-xl hover:shadow-[0_0_30px_rgba(148,163,184,0.15)] transition-all group flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-2xl bg-slate-500/10 border border-slate-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Phone className="w-8 h-8 text-slate-400" />
            </div>
            <h2 className="text-xl font-bold mb-2">Call Us</h2>
            <div className="flex flex-col gap-1 items-center">
              <a href="tel:+917904380014" className="text-slate-400 font-medium hover:text-slate-300 text-sm whitespace-nowrap">+91 79043 80014</a>
              <a href="tel:+918124420529" className="text-slate-400 font-medium hover:text-slate-300 text-sm whitespace-nowrap">+91 81244 20529</a>
            </div>
          </div>

          {/* Instagram Card */}
          <a href="https://instagram.com/alphaxrobotics" target="_blank" rel="noopener noreferrer" className="bg-[#080d1a]/80 border border-white/10 hover:border-purple-500/40 rounded-[2rem] p-8 backdrop-blur-xl relative shadow-xl hover:shadow-[0_0_30px_rgba(168,85,247,0.15)] transition-all group flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <AtSign className="w-8 h-8 text-purple-400" />
            </div>
            <h2 className="text-xl font-bold mb-2">Instagram</h2>
            <p className="text-purple-400 font-medium text-sm">@alphaxrobotics</p>
          </a>

        </div>

      </div>
    </div>
  );
}
