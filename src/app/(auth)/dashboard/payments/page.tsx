"use client";

import { useState, useEffect } from "react";
import { 
  Loader2, CheckCircle2, Heart, Gift, ArrowRight, ShieldCheck, 
  Lock, Globe, CreditCard, DollarSign, Wallet, Users, LayoutDashboard,
  TrendingUp, Activity, User, X
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import Sidebar from "@/components/Sidebar";

export default function ContributePage() {
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");

  const [contributions, setContributions] = useState<any[]>([]);

  useEffect(() => {
    const role = localStorage.getItem('userRole');
    setUserRole(role);
    fetchContributions();
  }, []);

  const fetchContributions = async () => {
    setIsLoading(true);
    const { data } = await supabase
      .from('contributions')
      .select('*, member:applications(full_name, email)')
      .order('created_at', { ascending: false });
    if (data) setContributions(data);
    setIsLoading(false);
  };

  const handleContribute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount) return;
    
    // 1. Start processing animation (Simulating gateway redirect)
    setIsProcessing(true);
    
    // Simulate network delay to gateway
    setTimeout(async () => {
      try {
        const memberData = localStorage.getItem('memberData');
        const memberId = memberData ? JSON.parse(memberData).id : null;

        const { error } = await supabase.from('contributions').insert({
          member_id: memberId,
          amount: parseFloat(amount),
          note: note,
          transaction_id: `AX-TXN-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
          status: 'completed'
        });

        if (error) throw error;

        // 2. Clear state and show success
        setAmount("");
        setNote("");
        setIsProcessing(false);
        setShowSuccess(true);
        fetchContributions();

      } catch (err) {
        console.error("Contribution failed:", err);
        alert("Payment gateway error. Please try again.");
        setIsProcessing(false);
      }
    }, 2500);
  };

  const totalRaised = contributions.reduce((sum, c) => sum + (parseFloat(c.amount) || 0), 0);

  return (
    <div className="min-h-screen bg-[#030712] text-white selection:bg-rose-500/30 relative">
      <div className="flex h-screen">
        <Sidebar />

        <div className="flex-1 overflow-auto bg-transparent relative z-10 p-4 sm:p-8 pt-24 sm:pt-10">
          
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
              <div className="space-y-3">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-rose-500/10 border border-rose-500/20 rounded-full text-[10px] font-black uppercase tracking-[0.2em] text-rose-400">
                  <Heart className="w-3 h-3 animate-pulse" /> Support AlphaX
                </div>
                <h1 className="text-4xl font-black uppercase italic tracking-tighter">
                  Fuel the <span className="text-rose-500">Future</span>
                </h1>
                <p className="text-gray-500 font-bold uppercase text-[10px] tracking-widest max-w-md">
                  Contribute to the lab ecosystem. Your support drives breakthroughs in robotics and automation.
                </p>
              </div>

              {userRole === 'admin' && (
                <div className="flex gap-4">
                  <div className="px-6 py-4 bg-white/[0.03] border border-white/10 rounded-3xl flex flex-col items-end">
                    <span className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Total Raised</span>
                    <span className="text-2xl font-black italic text-rose-400">₹{totalRaised.toLocaleString()}</span>
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Contribution Form (Member/Guest focus) */}
              <div className="lg:col-span-5 space-y-6">
                <div className="bg-white/[0.02] border border-white/10 rounded-[3rem] p-8 md:p-10 shadow-2xl relative overflow-hidden group hover:border-rose-500/20 transition-all duration-700">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/5 blur-[80px] group-hover:bg-rose-500/10 transition-all" />
                  
                  <h2 className="text-xl font-black uppercase italic tracking-tight mb-8 flex items-center gap-2">
                    <Gift className="w-5 h-5 text-rose-500" /> Start Contribution
                  </h2>

                  <form onSubmit={handleContribute} className="space-y-6 relative z-10">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">Donation Amount (₹)</label>
                      <div className="relative">
                        <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-rose-400" />
                        <input 
                          required
                          type="number" 
                          min="1"
                          value={amount}
                          onChange={e => setAmount(e.target.value)}
                          placeholder="Amount in Rupees"
                          className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-6 py-4 text-lg font-black text-white focus:outline-none focus:border-rose-500 transition-all italic" 
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">Message / Note</label>
                      <textarea 
                        rows={3}
                        value={note}
                        onChange={e => setNote(e.target.value)}
                        placeholder="Say something to the team..."
                        className="w-full bg-white/5 border border-white/10 rounded-[2rem] px-6 py-5 text-sm text-gray-300 focus:outline-none focus:border-rose-500 transition-all resize-none" 
                      />
                    </div>

                    <div className="p-4 bg-rose-500/5 border border-rose-500/10 rounded-2xl flex items-start gap-3">
                      <ShieldCheck className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                      <p className="text-[10px] text-gray-500 font-bold uppercase leading-relaxed">
                        You will be redirected to our encrypted <span className="text-rose-400">Secure Payment Gateway</span> to complete the transaction.
                      </p>
                    </div>

                    <button 
                      type="submit" 
                      disabled={isProcessing}
                      className="w-full py-5 bg-rose-500 text-black rounded-[2rem] font-black uppercase tracking-[0.3em] text-sm italic hover:bg-rose-400 transition-all flex items-center justify-center gap-3 shadow-[0_0_40px_rgba(244,63,94,0.3)] group active:scale-95 disabled:opacity-50"
                    >
                      {isProcessing ? "Redirecting..." : "Contribute Now"}
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1.5 transition-transform" />
                    </button>
                  </form>
                </div>

                {/* Trust Badges */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/[0.02] border border-white/10 rounded-3xl p-5 flex flex-col items-center text-center gap-2">
                    <Lock className="w-5 h-5 text-gray-600" />
                    <span className="text-[9px] font-black uppercase tracking-widest text-gray-500">256-Bit SSL Secure</span>
                  </div>
                  <div className="bg-white/[0.02] border border-white/10 rounded-3xl p-5 flex flex-col items-center text-center gap-2">
                    <Globe className="w-5 h-5 text-gray-600" />
                    <span className="text-[9px] font-black uppercase tracking-widest text-gray-500">Global Processing</span>
                  </div>
                </div>
              </div>

              {/* Administrative / History View */}
              <div className="lg:col-span-7 space-y-6">
                <div className="bg-white/[0.02] border border-white/10 rounded-[3rem] p-8 backdrop-blur-sm overflow-hidden flex flex-col min-h-[500px]">
                  <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/5">
                    <h3 className="text-sm font-black uppercase tracking-widest text-gray-400 flex items-center gap-2">
                      <Activity className="w-4 h-4 text-rose-500" /> Recent Contributions
                    </h3>
                    {userRole === 'admin' && (
                      <LayoutDashboard className="w-4 h-4 text-gray-700" title="Admin Overview" />
                    )}
                  </div>

                  {isLoading ? (
                    <div className="flex-1 flex flex-col items-center justify-center gap-4">
                      <Loader2 className="w-8 h-8 text-rose-500 animate-spin" />
                      <p className="text-[10px] font-black uppercase tracking-widest text-gray-600">Retrieving Ledgers...</p>
                    </div>
                  ) : contributions.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-10">
                      <Wallet className="w-12 h-12 text-gray-800 mb-4" />
                      <p className="text-gray-500 font-bold uppercase text-xs">No contributions recorded yet</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {contributions.map((c, idx) => (
                        <div 
                          key={c.id} 
                          className="flex items-center justify-between p-5 rounded-3xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.05] transition-all group"
                          style={{ animation: `slide-in-right 0.5s ease-out ${idx * 0.1}s both` }}
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-rose-500/10 rounded-2xl flex items-center justify-center border border-rose-500/20">
                              <User className="w-5 h-5 text-rose-400" />
                            </div>
                            <div>
                              <p className="text-sm font-black text-white italic uppercase tracking-tight">
                                {c.member?.full_name || "Supporter"}
                              </p>
                              <p className="text-[10px] text-gray-600 font-bold uppercase tracking-widest line-clamp-1">
                                {c.note || "General Contribution"}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-black italic text-rose-400 tracking-tighter">₹{parseFloat(c.amount).toLocaleString()}</p>
                            <p className="text-[9px] text-gray-700 font-bold uppercase">
                              {new Date(c.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* Mock Payment Gateway Overlay */}
      {isProcessing && (
        <div className="fixed inset-0 z-[200] bg-[#030712] flex flex-col items-center justify-center p-6 sm:p-12 animate-in fade-in duration-500">
           {/* Top Branding */}
           <div className="absolute top-10 left-10 flex items-center gap-3">
              <div className="w-10 h-10 bg-rose-500 rounded-xl flex items-center justify-center shadow-[0_0_30px_rgba(244,63,94,0.5)]">
                <ShieldCheck className="w-6 h-6 text-black" />
              </div>
              <span className="text-xl font-black uppercase italic tracking-tighter">AlphaX <span className="text-rose-500">Secure</span></span>
           </div>

           <div className="max-w-md w-full relative">
              <div className="w-32 h-32 bg-rose-500/20 rounded-full blur-[80px] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
              
              <div className="relative bg-[#080d1a] border border-white/10 rounded-[3rem] p-10 md:p-12 text-center shadow-2xl">
                 <div className="w-20 h-20 bg-rose-500/10 border border-rose-500/20 rounded-full flex items-center justify-center mx-auto mb-8">
                   <CreditCard className="w-10 h-10 text-rose-500 animate-bounce" />
                 </div>
                 
                 <h2 className="text-2xl font-black uppercase italic tracking-tighter mb-4">Redirecting...</h2>
                 <p className="text-gray-500 text-sm font-bold uppercase tracking-widest mb-10 leading-relaxed">
                   Handshaking with our <span className="text-rose-400">Payment Gateway</span>. Do not refresh or close this tab.
                 </p>
                 
                 <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden mb-4">
                    <div className="bg-rose-500 h-full animate-progress-indeterminate" />
                 </div>
                 <div className="flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-gray-700">
                   <Lock className="w-3 h-3" /> Secure Transaction ID: {Math.random().toString(36).substr(2, 12).toUpperCase()}
                 </div>
              </div>
           </div>
           
           <div className="fixed bottom-10 flex items-center gap-8">
              <div className="flex items-center gap-2 grayscale opacity-40">
                <TrendingUp className="w-5 h-5" /> <span className="font-bold text-[10px] uppercase">PCI Compliant</span>
              </div>
              <div className="flex items-center gap-2 grayscale opacity-40">
                <ShieldCheck className="w-5 h-5" /> <span className="font-bold text-[10px] uppercase">Bank Grade</span>
              </div>
           </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccess && (
        <div className="fixed inset-0 z-[250] bg-black/90 backdrop-blur-xl flex items-center justify-center p-6">
           <div className="max-w-sm w-full bg-[#080d1a] border border-white/10 rounded-[3.5rem] p-12 text-center shadow-2xl animate-scale-in">
              <div className="w-24 h-24 bg-green-500/20 border border-green-500/30 rounded-full flex items-center justify-center mx-auto mb-8">
                <CheckCircle2 className="w-12 h-12 text-green-500 animate-pulse" />
              </div>
              
              <h2 className="text-3xl font-black italic uppercase tracking-tighter mb-4">You&apos;re <span className="text-green-500">Elite!</span></h2>
              <p className="text-gray-400 text-sm font-medium mb-12 leading-relaxed">
                Contribution confirmed. Every unit of energy helps us build the robots of tomorrow. Thank you for your support.
              </p>
              
              <button 
                onClick={() => setShowSuccess(false)}
                className="w-full py-4 bg-white text-black rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-rose-500 transition-all shadow-2xl group"
              >
                Back to Dashboard
              </button>
           </div>
        </div>
      )}

    </div>
  );
}
