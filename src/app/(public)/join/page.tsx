"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, ChevronRight, Loader2 } from "lucide-react";
import { submitApplication } from "@/app/actions/application";

export default function JoinPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [applicantId, setApplicantId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);
    
    const formData = new FormData(e.currentTarget);
    
    try {
      setErrorMsg(null);
      const result = await submitApplication(formData);
      if (result?.success && result.data) {
        setApplicantId(result.data.id);
        setIsSuccess(true);
      } else {
        setErrorMsg(result?.message || "Warning: Database connection failed. Please ensure your .env.local keys are correct and you completely rebooted the Next.js server.");
      }
    } catch (error) {
      console.error("Submission error", error);
      setErrorMsg("An unexpected system error occurred. Is the server running?");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-transparent text-white selection:bg-indigo-500/30 overflow-hidden relative py-20 px-4 sm:px-6 lg:px-8">
      {/* Background gradients */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-indigo-900/10 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-slate-900/10 blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-indigo-400 transition-colors mb-12 font-medium">
          <ArrowLeft className="w-5 h-5" />
          Back to Home
        </Link>
        
        <div className="mb-12 text-center md:text-left">
          <h1 className="text-5xl md:text-6xl font-black tracking-tighter mb-6 uppercase italic">
            JOIN <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-slate-500">AlphaX Robotics</span>
          </h1>
          <p className="text-xl text-gray-400 font-light max-w-2xl leading-relaxed italic">
            We are searching for visionary engineers to help us architect the future. Submit your profile to join our development ecosystem.
          </p>
        </div>

        {isSuccess ? (
          <div className="bg-white/5 border border-indigo-500/30 rounded-[2rem] p-12 text-center backdrop-blur-md shadow-[0_0_30px_rgba(99,102,241,0.1)] py-20">
            <div className="w-24 h-24 bg-indigo-500/10 rounded-full flex items-center justify-center mx-auto mb-8 border border-indigo-500/30">
              <CheckCircle2 className="w-12 h-12 text-indigo-400" />
            </div>
            <h2 className="text-4xl font-bold mb-4 tracking-tight uppercase italic">Application Secured</h2>
            <p className="text-gray-400 max-w-md mx-auto mb-6 text-lg leading-relaxed italic">
              Your profile has been submitted. We will review your institutional credentials and contact you shortly.
            </p>
            
            {applicantId && (
              <div className="bg-[#030712] border border-indigo-500/50 rounded-xl p-6 mb-10 mx-auto max-w-sm text-center">
                <p className="text-xs text-indigo-400 font-bold tracking-widest uppercase mb-2">AlphaX Secure ID</p>
                <div className="font-mono text-sm text-white bg-white/5 py-3 px-4 rounded-lg border border-white/10 break-all">
                  {applicantId}
                </div>
              </div>
            )}

            <Link href="/" className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-black rounded-full font-bold hover:bg-gray-200 transition-all hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(255,255,255,0.2)]">
              Return Home
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-[#080d1a]/80 border border-white/10 rounded-[2.5rem] p-8 md:p-12 backdrop-blur-xl relative shadow-2xl overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 blur-[100px] pointer-events-none group-hover:bg-indigo-500/10 transition-all duration-700" />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
              
              {/* Personal Info */}
              <div className="space-y-6 md:col-span-2">
                <h3 className="text-xl font-black border-b border-white/10 pb-3 text-indigo-400 tracking-widest uppercase italic">01. Identity & Credentials</h3>
              </div>

              <div className="space-y-3 md:col-span-1">
                <label htmlFor="full_name" className="text-[10px] font-black tracking-widest uppercase text-gray-500 ml-1">Full Identity *</label>
                <input 
                  required 
                  type="text" 
                  id="full_name" 
                  name="full_name" 
                  className="w-full bg-[#030712] border border-white/10 rounded-2xl px-5 py-4 text-white placeholder:text-gray-700 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all italic font-bold"
                  placeholder="ADA LOVELACE"
                />
              </div>

              <div className="space-y-3 md:col-span-1">
                <label htmlFor="email" className="text-[10px] font-black tracking-widest uppercase text-gray-500 ml-1">Secure Email *</label>
                <input 
                  required 
                  type="email" 
                  id="email" 
                  name="email" 
                  className="w-full bg-[#030712] border border-white/10 rounded-2xl px-5 py-4 text-white placeholder:text-gray-700 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all italic font-bold"
                  placeholder="ADA@ALPHAX.LABS"
                />
              </div>

              <div className="space-y-3 md:col-span-1">
                <label htmlFor="mobile_number" className="text-[10px] font-black tracking-widest uppercase text-gray-500 ml-1">Comm Link *</label>
                <div className="flex">
                  <span className="inline-flex items-center px-4 bg-white/5 border border-r-0 border-white/10 rounded-l-2xl text-gray-400 text-[10px] font-black">+91</span>
                  <input 
                    required 
                    type="tel" 
                    id="mobile_number" 
                    name="mobile_number" 
                    pattern="[0-9]{10}"
                    maxLength={10}
                    className="w-full bg-[#030712] border border-white/10 rounded-r-2xl px-5 py-4 text-white placeholder:text-gray-700 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all italic font-bold"
                    placeholder="98765 43210"
                  />
                </div>
              </div>

              <div className="space-y-3 md:col-span-1">
                <label htmlFor="password" className="text-[10px] font-black tracking-widest uppercase text-gray-500 ml-1">Access Key *</label>
                <input 
                  required 
                  type="password" 
                  id="password" 
                  name="password" 
                  className="w-full bg-[#030712] border border-white/10 rounded-2xl px-5 py-4 text-white placeholder:text-gray-700 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all font-mono"
                  placeholder="••••••••"
                />
              </div>

              <div className="space-y-6 md:col-span-2 pt-8">
                <h3 className="text-xl font-black border-b border-white/10 pb-3 text-indigo-400 tracking-widest uppercase italic">02. Institutional Data</h3>
              </div>

              <div className="space-y-3">
                <label htmlFor="college" className="text-[10px] font-black tracking-widest uppercase text-gray-500 ml-1">University / College Name *</label>
                <input 
                  required 
                  type="text" 
                  id="college" 
                  name="college" 
                  className="w-full bg-[#030712] border border-white/10 rounded-2xl px-5 py-4 text-white placeholder:text-gray-700 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all italic font-bold"
                  placeholder="MIT"
                />
              </div>

              <div className="space-y-3">
                <label htmlFor="department" className="text-[10px] font-black tracking-widest uppercase text-gray-500 ml-1">Major / Specialization *</label>
                <input 
                  required 
                  type="text" 
                  id="department" 
                  name="department" 
                  className="w-full bg-[#030712] border border-white/10 rounded-2xl px-5 py-4 text-white placeholder:text-gray-700 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all italic font-bold"
                  placeholder="MECHATRONICS"
                />
              </div>

              <div className="space-y-3 md:col-span-2">
                <label htmlFor="year_of_study" className="text-[10px] font-black tracking-widest uppercase text-gray-500 ml-1">Current Academic Year *</label>
                <div className="relative">
                  <select 
                    required 
                    defaultValue=""
                    id="year_of_study" 
                    name="year_of_study" 
                    className="w-full bg-[#030712] border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:ring-1 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all appearance-none cursor-pointer italic font-bold"
                  >
                    <option value="" disabled>SELECT PHASE...</option>
                    <option value="1">1st Year (Freshman)</option>
                    <option value="2">2nd Year (Sophomore)</option>
                    <option value="3">3rd Year (Junior)</option>
                    <option value="4">4th Year (Senior)</option>
                    <option value="grad">Graduate / Masters</option>
                    <option value="alumni">Alumni / Professional</option>
                  </select>
                  <div className="absolute inset-y-0 right-5 flex items-center pointer-events-none text-indigo-500">
                    <ChevronRight className="w-5 h-5 rotate-90" />
                  </div>
                </div>
              </div>

              {/* Submit */}
              <div className="md:col-span-2 pt-10 flex flex-col sm:flex-row items-center justify-between border-t border-white/10 mt-4 gap-6">
                <p className="text-[9px] text-gray-500 max-w-xs font-bold uppercase tracking-widest leading-relaxed italic">
                  By committing your profile, you acknowledge the <span className="text-white">Confidential AlphaX Protocol</span> and platform guidelines.
                </p>
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full sm:w-auto group flex items-center justify-center gap-4 px-12 py-5 bg-indigo-500 text-black rounded-2xl font-black text-sm uppercase tracking-[0.2em] italic hover:bg-indigo-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_40px_rgba(99,102,241,0.2)] active:scale-95"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      SECURE SUBMITTING...
                    </>
                  ) : (
                    <>
                      TRANSMIT APPLICATION
                      <ChevronRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                    </>
                  )}
                </button>
              </div>
              
              {/* Error Message Display */}
              {errorMsg && (
                <div className="md:col-span-2 p-5 mt-4 bg-red-500/10 border border-red-500/30 rounded-2xl text-red-400 text-[10px] font-black uppercase tracking-widest flex items-center gap-3">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-ping" />
                  CRITICAL FAILURE: {errorMsg}
                </div>
              )}

            </div>
          </form>
        )}
      </div>
    </div>
  );
}
