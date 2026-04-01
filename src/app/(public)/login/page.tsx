"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Lock, Fingerprint, ShieldAlert, KeyRound, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAuthenticating(true);
    setErrorMsg("");
    
    // 1. Try Admin Login (Supabase Auth) if password provided
    if (password) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (!error) {
        localStorage.setItem('userRole', 'admin');
        window.location.href = "/dashboard/applications";
        return;
      }
    }

    // 2. Try Member Login (Check Approved Applications)
    const { data: memberData, error: memberError } = await supabase
      .from('applications')
      .select('*')
      .eq('email', email)
      .eq('status', 'approved')
      .single();

    const matchesPassword = memberData && (
      (memberData.password && memberData.password === password) || 
      (!memberData.password && memberData.id.toString() === password)
    );

    if (matchesPassword) {
      localStorage.setItem('userRole', 'member');
      localStorage.setItem('memberData', JSON.stringify(memberData));
      window.location.href = "/dashboard/teams";
      return;
    }

    setErrorMsg("Invalid credentials or unauthorized access.");
    setIsAuthenticating(false);
  };

  return (
    <div className="min-h-screen bg-transparent text-white selection:bg-indigo-500/30 overflow-hidden relative flex items-center justify-center p-4">
      {/* Background gradients */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[70vw] h-[70vw] rounded-full bg-indigo-900/10 blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[70vw] h-[70vw] rounded-full bg-slate-900/10 blur-[120px]" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        <Link href="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-indigo-400 transition-colors mb-10 font-medium">
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>
        
        <div className="bg-[#080d1a]/80 border border-white/10 rounded-[2rem] p-8 sm:p-12 backdrop-blur-xl relative shadow-[0_0_50px_rgba(0,0,0,0.5)]">
          
          <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-20 h-20 bg-[#030712] border border-white/10 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(99,102,241,0.2)]">
            <Lock className="w-8 h-8 text-indigo-400" />
          </div>

          <div className="text-center mt-6 mb-10">
            <h1 className="text-3xl font-black tracking-tighter mb-2 uppercase">Secure Login</h1>
            <p className="text-sm text-gray-500 font-medium">Sign in to access the internal AlphaX Robotics dashboard.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold tracking-wider text-gray-400 uppercase">Email</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Fingerprint className="w-5 h-5 text-gray-600" />
                </div>
                <input 
                  required
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#030712] border border-white/10 rounded-xl pl-12 pr-5 py-4 text-white placeholder:text-gray-700 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all shadow-inner"
                  placeholder="agent@alphax.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold tracking-wider text-gray-400 uppercase">Password / Tracking ID</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <KeyRound className="w-5 h-5 text-gray-600" />
                </div>
                <input 
                  required
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#030712] border border-white/10 rounded-xl pl-12 pr-5 py-4 text-white placeholder:text-gray-700 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all shadow-inner tracking-widest"
                  placeholder="••••••••••••"
                />
              </div>
            </div>

            {errorMsg && (
              <div className="text-red-400 font-medium text-sm text-center -mb-2 mt-4 bg-red-400/10 py-3 px-4 rounded-xl border border-red-400/20 animate-pulse">
                Access Denied: {errorMsg}
              </div>
            )}

            <div className="pt-4">
              <button 
                type="submit" 
                disabled={isAuthenticating || !email || !password}
                className="w-full flex items-center justify-center gap-3 py-4 bg-indigo-500 text-black rounded-xl font-black tracking-widest uppercase hover:bg-indigo-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-[0_0_30px_rgba(99,102,241,0.4)] active:scale-95"
              >
                {isAuthenticating ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    SIGNING IN...
                  </>
                ) : (
                  "SIGN IN"
                )}
              </button>
            </div>
          </form>

          <div className="mt-8 pt-6 border-t border-white/5 flex flex-col items-center justify-center gap-3">
            <div className="flex items-center gap-2 text-xs text-yellow-500/80 bg-yellow-500/10 px-4 py-2 rounded-full border border-yellow-500/20">
              <ShieldAlert className="w-4 h-4" />
              Unauthorized access strictly monitored.
            </div>
            <p className="text-xs text-gray-600 mt-2">
              Don't have an account yet? <Link href="/join" className="text-indigo-500 hover:text-indigo-400 hover:underline">Sign Up</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
