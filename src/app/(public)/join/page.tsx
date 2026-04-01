"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, ChevronRight, Loader2 } from "lucide-react";
import { submitApplication } from "@/app/actions/application";

const PREDEFINED_SKILLS = [
  "Arduino", "ESP32", "Raspberry Pi", "C/C++", "Python", 
  "CAD/SolidWorks", "ROS", "3D Printing", "PCB Design", 
  "Machine Learning", "React/Next.js", "UI/UX Design"
];

export default function JoinPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [applicantId, setApplicantId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);

  const toggleSkill = (skill: string) => {
    setSelectedSkills(prev => 
      prev.includes(skill) 
        ? prev.filter(s => s !== skill)
        : [...prev, skill]
    );
  };

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);
    
    const formData = new FormData(e.currentTarget);
    // Append selected skills manually since they are custom UI elements
    selectedSkills.forEach(skill => formData.append('skills', skill));
    
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
        
        <div className="mb-12">
          <h1 className="text-5xl md:text-6xl font-black tracking-tight mb-6">
            JOIN <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-slate-500">ALPHA X</span>
          </h1>
          <p className="text-xl text-gray-400 font-light max-w-2xl leading-relaxed">
            We are searching for visionary engineers, programmers, and designers to help us architect the future. Submit your application to join our core development team.
          </p>
        </div>

        {isSuccess ? (
          <div className="bg-white/5 border border-indigo-500/30 rounded-[2rem] p-12 text-center backdrop-blur-md shadow-[0_0_30px_rgba(99,102,241,0.1)] py-20">
            <div className="w-24 h-24 bg-indigo-500/10 rounded-full flex items-center justify-center mx-auto mb-8 border border-indigo-500/30">
              <CheckCircle2 className="w-12 h-12 text-indigo-400" />
            </div>
            <h2 className="text-4xl font-bold mb-4 tracking-tight">Application Secured</h2>
            <p className="text-gray-400 max-w-md mx-auto mb-6 text-lg leading-relaxed">
              Your application has been submitted successfully. We will review your credentials and contact you shortly.
            </p>
            
            {applicantId && (
              <div className="bg-[#030712] border border-indigo-500/50 rounded-xl p-6 mb-10 mx-auto max-w-sm">
                <p className="text-xs text-indigo-400 font-bold tracking-widest uppercase mb-2">Your Secure Tracking ID</p>
                <div className="font-mono text-sm text-white bg-white/5 py-3 px-4 rounded-lg border border-white/10 break-all select-all">
                  {applicantId}
                </div>
                <p className="text-xs text-gray-500 mt-3 flex items-center gap-2 justify-center">
                  ⚠️ Save this ID. It will be required as your password to login if you are approved.
                </p>
              </div>
            )}

            <Link href="/" className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-black rounded-full font-bold hover:bg-gray-200 transition-all hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(255,255,255,0.2)]">
              Return Home
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-[#080d1a]/80 border border-white/10 rounded-[2rem] p-8 md:p-12 backdrop-blur-xl relative shadow-2xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              
              {/* Personal Info */}
              <div className="space-y-6 md:col-span-2">
                <h3 className="text-xl font-bold border-b border-white/10 pb-3 text-indigo-400 tracking-wide uppercase">01. Applicant Profile</h3>
              </div>

              <div className="space-y-3 md:col-span-1">
                <label htmlFor="full_name" className="text-sm font-semibold text-gray-300">Full Name *</label>
                <input 
                  required 
                  type="text" 
                  id="full_name" 
                  name="full_name" 
                  className="w-full bg-[#030712] border border-white/10 rounded-xl px-5 py-4 text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all shadow-inner"
                  placeholder="Ada Lovelace"
                />
              </div>

              <div className="space-y-3 md:col-span-1">
                <label htmlFor="email" className="text-sm font-semibold text-gray-300">Email *</label>
                <input 
                  required 
                  type="email" 
                  id="email" 
                  name="email" 
                  className="w-full bg-[#030712] border border-white/10 rounded-xl px-5 py-4 text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all shadow-inner"
                  placeholder="ada@mit.edu"
                />
              </div>

              <div className="space-y-3 md:col-span-1">
                <label htmlFor="mobile_number" className="text-sm font-semibold text-gray-300">Mobile Number *</label>
                <input 
                  required 
                  type="tel" 
                  id="mobile_number" 
                  name="mobile_number" 
                  className="w-full bg-[#030712] border border-white/10 rounded-xl px-5 py-4 text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all shadow-inner"
                  placeholder="+1 (555) 000-0000"
                />
              </div>

              <div className="space-y-3">
                <label htmlFor="college" className="text-sm font-semibold text-gray-300">University / College *</label>
                <input 
                  required 
                  type="text" 
                  id="college" 
                  name="college" 
                  className="w-full bg-[#030712] border border-white/10 rounded-xl px-5 py-4 text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all shadow-inner"
                  placeholder="MIT"
                />
              </div>

              <div className="space-y-3">
                <label htmlFor="department" className="text-sm font-semibold text-gray-300">Major / Department *</label>
                <input 
                  required 
                  type="text" 
                  id="department" 
                  name="department" 
                  className="w-full bg-[#030712] border border-white/10 rounded-xl px-5 py-4 text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all shadow-inner"
                  placeholder="Mechatronics Engineering"
                />
              </div>

              <div className="space-y-3">
                <label htmlFor="year_of_study" className="text-sm font-semibold text-gray-300">Year of Study *</label>
                <div className="relative">
                  <select 
                    required 
                    defaultValue=""
                    id="year_of_study" 
                    name="year_of_study" 
                    className="w-full bg-[#030712] border border-white/10 rounded-xl px-5 py-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all appearance-none cursor-pointer shadow-inner"
                  >
                    <option value="" disabled>Select your current year...</option>
                    <option value="1">1st Year (Freshman)</option>
                    <option value="2">2nd Year (Sophomore)</option>
                    <option value="3">3rd Year (Junior)</option>
                    <option value="4">4th Year (Senior)</option>
                    <option value="grad">Graduate / Masters</option>
                    <option value="alumni">Alumni / Professional</option>
                  </select>
                  <div className="absolute inset-y-0 right-5 flex items-center pointer-events-none text-gray-400">
                    <ChevronRight className="w-5 h-5 rotate-90" />
                  </div>
                </div>
              </div>

              {/* Achievements */}
              <div className="space-y-6 md:col-span-2 pt-8">
                <h3 className="text-xl font-bold border-b border-white/10 pb-3 text-indigo-400 tracking-wide uppercase">02. Experience & Achievements</h3>
              </div>

              <div className="space-y-3 md:col-span-2">
                <label htmlFor="achievements" className="text-sm font-semibold text-gray-300">Highlight your best engineering achievements or projects *</label>
                <textarea 
                  required 
                  id="achievements" 
                  name="achievements" 
                  rows={5}
                  className="w-full bg-[#030712] border border-white/10 rounded-xl px-5 py-4 text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all resize-y shadow-inner"
                  placeholder="e.g. Built a custom 6-axis robotic arm, won 1st place in National Hackathon, designed a telemetry board for a rocket..."
                ></textarea>
              </div>

              {/* Tech Stack */}
              <div className="space-y-6 md:col-span-2 pt-8">
                <h3 className="text-xl font-bold border-b border-white/10 pb-3 text-indigo-400 tracking-wide uppercase">03. Technical Skills</h3>
                <p className="text-sm text-gray-400 mb-5 leading-relaxed">Select the tools and skills you bring to the table. We evaluate these closely during our review process.</p>
                <div className="flex flex-wrap gap-3">
                  {PREDEFINED_SKILLS.map((skill) => {
                    const isSelected = selectedSkills.includes(skill);
                    return (
                      <button
                        type="button"
                        key={skill}
                        onClick={() => toggleSkill(skill)}
                        className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${
                          isSelected 
                            ? 'bg-indigo-500/20 border-2 border-indigo-400 text-indigo-300 shadow-[0_0_15px_rgba(99,102,241,0.3)] scale-105' 
                            : 'bg-[#030712] border-2 border-white/10 text-gray-400 hover:border-white/30 hover:text-white'
                        }`}
                      >
                        {skill}
                      </button>
                    )
                  })}
                </div>
                {selectedSkills.length === 0 && (
                  <p className="text-xs text-red-400 mt-2">* Please select at least one technical skill.</p>
                )}
              </div>

              {/* Submit */}
              <div className="md:col-span-2 pt-10 flex flex-col sm:flex-row items-center justify-between border-t border-white/10 mt-4 gap-6">
                <p className="text-xs text-gray-500 max-w-sm">
                  By submitting, you agree to Alpha X's confidentiality guidelines regarding internal hardware and codebases.
                </p>
                <button 
                  type="submit" 
                  disabled={isSubmitting || selectedSkills.length === 0}
                  className="w-full sm:w-auto group flex items-center justify-center gap-3 px-10 py-5 bg-indigo-500 text-black rounded-xl font-black text-lg hover:bg-indigo-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-[0_0_25px_rgba(99,102,241,0.5)] active:scale-95"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-6 h-6 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      SUBMIT APPLICATION
                      <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </div>
              
              {/* Error Message Display */}
              {errorMsg && (
                <div className="md:col-span-2 p-5 mt-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm font-bold shadow-[0_0_15px_rgba(239,68,68,0.2)]">
                  ⚠️ CONNECTION FAILED: {errorMsg}
                </div>
              )}


            </div>
          </form>
        )}
      </div>
    </div>
  );
}
