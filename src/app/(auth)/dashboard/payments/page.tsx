"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { ArrowLeft, Users, Activity, Network, Calendar, Shield, Cpu, Loader2, QrCode, Edit3, Check, Copy, X, IndianRupee, CheckCircle2, Upload, Image as ImageIcon, User } from "lucide-react";
import { supabase } from "@/lib/supabase";

import Sidebar from "@/components/Sidebar";

export default function PaymentsPage() {
  const [userRole, setUserRole] = useState<string | null>(null);
  const [memberData, setMemberData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Payment config (QR + UPI)
  const [paymentConfig, setPaymentConfig] = useState<any>(null);
  const [isEditingConfig, setIsEditingConfig] = useState(false);
  const [newQrUrl, setNewQrUrl] = useState("");
  const [newUpiId, setNewUpiId] = useState("");
  const [qrFile, setQrFile] = useState<File | null>(null);
  const [qrPreview, setQrPreview] = useState<string | null>(null);
  const qrFileRef = useRef<HTMLInputElement>(null);
  const [isSavingConfig, setIsSavingConfig] = useState(false);

  // Member payment form
  const [payAmount, setPayAmount] = useState("");
  const [payNote, setPayNote] = useState("");
  const [payUtr, setPayUtr] = useState("");   // UTR / Transaction reference
  const [isSubmittingPayment, setIsSubmittingPayment] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  // Admin: payment records
  const [payments, setPayments] = useState<any[]>([]);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const role = localStorage.getItem('userRole');
    setUserRole(role);
    const stored = localStorage.getItem('memberData');
    if (stored) try { setMemberData(JSON.parse(stored)); } catch(e) {}
    fetchPaymentConfig();
    if (role === 'admin') fetchPayments();
  }, []);

  const fetchPaymentConfig = async () => {
    const { data } = await supabase
      .from('payment_config')
      .select('*')
      .limit(1)
      .single();
    if (data) {
      setPaymentConfig(data);
      setNewQrUrl(data.qr_url || "");
      setNewUpiId(data.upi_id || "");
    }
    setIsLoading(false);
  };

  const fetchPayments = async () => {
    const { data } = await supabase
      .from('payments')
      .select('*, member:applications(full_name, email)')
      .order('created_at', { ascending: false });
    if (data) setPayments(data);
  };

  const handleQrFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setQrFile(file);
      setQrPreview(URL.createObjectURL(file));
    }
  };

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingConfig(true);

    try {
      let qrUrl = newQrUrl;

      // Upload new QR image if selected
      if (qrFile) {
        console.log("Uploading QR file:", qrFile.name);
        const fileExt = qrFile.name.split('.').pop();
        const fileName = `qr_${Date.now()}.${fileExt}`;
        
        const { data: upData, error: upErr } = await supabase.storage
          .from('payment-qr')
          .upload(fileName, qrFile, { 
            cacheControl: '3600',
            upsert: false 
          });

        if (upErr) {
          console.error("Storage upload error:", upErr);
          throw new Error(`Upload failed: ${upErr.message}`);
        }

        if (upData) {
          const { data: urlData } = supabase.storage.from('payment-qr').getPublicUrl(fileName);
          qrUrl = urlData.publicUrl;
          console.log("New QR URL generated:", qrUrl);
        }
      }

      if (paymentConfig?.id) {
        // Update existing
        const { error: updateErr } = await supabase.from('payment_config').update({
          qr_url: qrUrl,
          upi_id: newUpiId,
          updated_at: new Date().toISOString(),
        }).eq('id', paymentConfig.id);
        
        if (updateErr) throw updateErr;
      } else {
        // Insert first record
        const { error: insertErr } = await supabase.from('payment_config').insert({
          qr_url: qrUrl,
          upi_id: newUpiId,
        });
        
        if (insertErr) throw insertErr;
      }

      console.log("Payment config saved successfully");
      await fetchPaymentConfig();
      setQrFile(null);
      setQrPreview(null);
      setIsEditingConfig(false);
      alert("Payment settings updated successfully!");
    } catch (error: any) {
      console.error("Error saving payment settings:", error);
      alert(`Failed to save settings: ${error.message || "Unknown error"}`);
    } finally {
      setIsSavingConfig(false);
    }
  };

  const handleCopyUpi = () => {
    if (paymentConfig?.upi_id) {
      navigator.clipboard.writeText(paymentConfig.upi_id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSubmitPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!payAmount || !memberData?.id) return;
    setIsSubmittingPayment(true);

    const { error } = await supabase.from('payments').insert({
      member_id: memberData.id,
      amount: parseFloat(payAmount),
      note: payNote,
      utr: payUtr,
      status: 'pending',
    });

    if (!error) {
      setPaymentSuccess(true);
      setPayAmount("");
      setPayNote("");
      setPayUtr("");
    }
    setIsSubmittingPayment(false);
  };

  const handleUpdatePaymentStatus = async (id: string, status: 'confirmed' | 'rejected') => {
    await supabase.from('payments').update({ status }).eq('id', id);
    fetchPayments();
  };

  const totalCollected = payments
    .filter(p => p.status === 'confirmed')
    .reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);

  return (
    <div className="min-h-screen bg-transparent text-white selection:bg-indigo-500/30 overflow-hidden relative">
      <div className="flex h-screen">
        
        <Sidebar />

        {/* Main Content Area */}
        <div className="flex-1 overflow-auto p-4 sm:p-8 lg:p-12 pt-20 sm:pt-12 relative z-10 w-full">


          <div className="mb-10">
            <h1 className="text-3xl font-bold tracking-tight mb-2 flex items-center gap-3">
              <IndianRupee className="w-8 h-8 text-indigo-500" />
              {userRole === 'admin' ? 'Payment Management' : 'Make a Payment'}
            </h1>
            <p className="text-gray-400 max-w-xl text-sm leading-relaxed">
              {userRole === 'admin'
                ? 'Manage the payment QR code & UPI ID, and review member payment submissions.'
                : 'Scan the QR code or use the UPI ID below to complete your payment.'}
            </p>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-24"><Loader2 className="w-10 h-10 text-indigo-500 animate-spin" /></div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

              {/* LEFT: QR Code display + Member payment form */}
              <div className="lg:col-span-4 flex flex-col gap-6">

                {/* QR Code Card */}
                <div className="bg-white/[0.03] border border-white/10 rounded-[2rem] p-8 backdrop-blur-sm shadow-xl flex flex-col items-center text-center">
                  <h2 className="text-sm font-bold uppercase tracking-widest text-indigo-400 mb-6 flex items-center gap-2">
                    <QrCode className="w-4 h-4" /> Payment QR Code
                  </h2>

                  {paymentConfig?.qr_url ? (
                    <img 
                      key={paymentConfig.qr_url}
                      src={`${paymentConfig.qr_url}${paymentConfig.qr_url.includes('?') ? '&' : '?'}t=${new Date(paymentConfig.updated_at || Date.now()).getTime()}`} 
                      alt="Payment QR Code" 
                      className="w-52 h-52 object-contain rounded-2xl border border-white/10 bg-white p-2 mb-6"
                    />
                  ) : (
                    <div className="w-52 h-52 rounded-2xl border-2 border-dashed border-white/10 flex flex-col items-center justify-center text-gray-600 mb-6">
                      <QrCode className="w-16 h-16 mb-2" />
                      <span className="text-xs">No QR set</span>
                    </div>
                  )}

                  {paymentConfig?.upi_id && (
                    <div className="w-full bg-[#030712] border border-white/10 rounded-xl px-4 py-3 flex items-center justify-between gap-2 mb-4">
                      <div className="text-left">
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1">UPI ID</p>
                        <p className="text-white font-mono font-semibold text-sm">{paymentConfig.upi_id}</p>
                      </div>
                      <button onClick={handleCopyUpi} className="text-gray-500 hover:text-indigo-400 transition-colors p-2 rounded-lg hover:bg-white/5" title="Copy UPI ID">
                        {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                  )}

                  {!paymentConfig?.upi_id && !paymentConfig?.qr_url && (
                    <p className="text-gray-600 text-sm">Admin has not configured payment details yet.</p>
                  )}

                  {/* Admin: Edit config button */}
                  {userRole === 'admin' && (
                    <button
                      onClick={() => setIsEditingConfig(true)}
                      className="mt-4 flex items-center gap-2 px-4 py-2 border border-white/10 text-gray-400 rounded-xl hover:text-white hover:bg-white/5 transition-all text-sm font-medium"
                    >
                      <Edit3 className="w-4 h-4" /> Edit QR &amp; UPI
                    </button>
                  )}
                </div>

                {/* Member: Payment Submission Form */}
                {userRole === 'member' && (
                  <div className="bg-white/[0.03] border border-white/10 rounded-[2rem] p-6 backdrop-blur-sm shadow-xl">
                    <h2 className="text-sm font-bold uppercase tracking-widest text-indigo-400 mb-6">Confirm Your Payment</h2>
                    
                    {paymentSuccess ? (
                      <div className="flex flex-col items-center text-center py-6">
                        <CheckCircle2 className="w-16 h-16 text-green-400 mb-4" />
                        <h3 className="text-xl font-bold text-white mb-2">Payment Recorded!</h3>
                        <p className="text-gray-400 text-sm">Your payment has been submitted for admin review.</p>
                        <button onClick={() => setPaymentSuccess(false)} className="mt-4 text-indigo-400 text-sm font-medium hover:text-indigo-300">Submit another payment</button>
                      </div>
                    ) : (
                      <form onSubmit={handleSubmitPayment} className="space-y-4">
                        <div>
                          <label className="text-xs font-bold tracking-wider text-gray-500 uppercase block mb-2">Amount Paid (₹) *</label>
                          <div className="relative">
                            <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                            <input required type="number" min="1" step="1" value={payAmount} onChange={e => setPayAmount(e.target.value)} placeholder="e.g. 500" className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500 transition-all" />
                          </div>
                        </div>
                        <div>
                          <label className="text-xs font-bold tracking-wider text-gray-500 uppercase block mb-2">UTR / Transaction ID</label>
                          <input type="text" value={payUtr} onChange={e => setPayUtr(e.target.value)} placeholder="Transaction reference number" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500 transition-all" />
                        </div>
                        <div>
                          <label className="text-xs font-bold tracking-wider text-gray-500 uppercase block mb-2">Note (Optional)</label>
                          <input type="text" value={payNote} onChange={e => setPayNote(e.target.value)} placeholder="e.g. Membership fee, component purchase..." className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500 transition-all" />
                        </div>
                        <button type="submit" disabled={isSubmittingPayment || !payAmount} className="w-full py-3.5 bg-indigo-500 text-black rounded-xl font-black uppercase tracking-widest text-sm hover:bg-indigo-400 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2">
                          {isSubmittingPayment ? <><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</> : 'Submit Payment Proof'}
                        </button>
                      </form>
                    )}
                  </div>
                )}

              </div>

              {/* RIGHT: Admin payment records */}
              {userRole === 'admin' && (
                <div className="lg:col-span-8 flex flex-col gap-6">
                  
                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-5">
                      <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-2">Total Received</p>
                      <p className="text-2xl font-black text-green-400">₹{totalCollected.toLocaleString()}</p>
                    </div>
                    <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-5">
                      <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-2">Pending Review</p>
                      <p className="text-2xl font-black text-yellow-400">{payments.filter(p => p.status === 'pending').length}</p>
                    </div>
                    <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-5">
                      <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-2">Total Payments</p>
                      <p className="text-2xl font-black text-white">{payments.length}</p>
                    </div>
                  </div>

                  {/* Payment Records */}
                  <div className="bg-white/[0.02] border border-white/10 rounded-2xl backdrop-blur-sm overflow-hidden shadow-2xl">
                    <div className="px-6 py-4 border-b border-white/10 flex items-center gap-2">
                      <IndianRupee className="w-4 h-4 text-indigo-400" />
                      <h3 className="text-sm font-bold uppercase tracking-widest text-indigo-400">Payment Records</h3>
                    </div>
                    <div className="overflow-x-auto">
                      {payments.length === 0 ? (
                        <div className="p-16 text-center">
                          <IndianRupee className="w-12 h-12 text-gray-700 mx-auto mb-4" />
                          <p className="text-gray-500">No payment records yet.</p>
                        </div>
                      ) : (
                        <table className="w-full text-left text-sm">
                          <thead className="bg-white/5 text-gray-400 text-xs uppercase tracking-wider border-b border-white/5">
                            <tr>
                              <th className="px-6 py-4 font-semibold">Member</th>
                              <th className="px-6 py-4 font-semibold">Amount</th>
                              <th className="px-6 py-4 font-semibold">UTR / Ref</th>
                              <th className="px-6 py-4 font-semibold">Note</th>
                              <th className="px-6 py-4 font-semibold">Date</th>
                              <th className="px-6 py-4 font-semibold text-center">Status</th>
                              <th className="px-6 py-4 font-semibold text-right">Action</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/5">
                            {payments.map(p => (
                              <tr key={p.id} className="hover:bg-white/[0.02] transition-colors">
                                <td className="px-6 py-4">
                                  <div className="flex items-center gap-2">
                                    <div className="w-7 h-7 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 text-xs font-bold uppercase">
                                      {p.member?.full_name?.substring(0,2) || <User className="w-3 h-3" />}
                                    </div>
                                    <div>
                                      <p className="font-bold text-white text-sm">{p.member?.full_name || 'Unknown'}</p>
                                      <p className="text-gray-500 text-[10px]">{p.member?.email || ''}</p>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-6 py-4">
                                  <span className="text-green-400 font-bold text-base">₹{p.amount}</span>
                                </td>
                                <td className="px-6 py-4">
                                  <span className="text-gray-400 font-mono text-xs">{p.utr || '—'}</span>
                                </td>
                                <td className="px-6 py-4">
                                  <span className="text-gray-400 text-xs max-w-[120px] inline-block truncate">{p.note || '—'}</span>
                                </td>
                                <td className="px-6 py-4">
                                  <span className="text-gray-500 text-xs">{new Date(p.created_at).toLocaleDateString('en-IN')}</span>
                                </td>
                                <td className="px-6 py-4 text-center">
                                  <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider
                                    ${p.status === 'pending' ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20' : ''}
                                    ${p.status === 'confirmed' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : ''}
                                    ${p.status === 'rejected' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : ''}
                                  `}>
                                    {p.status}
                                  </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                  {p.status === 'pending' && (
                                    <div className="flex justify-end gap-2">
                                      <button onClick={() => handleUpdatePaymentStatus(p.id, 'rejected')} className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all border border-transparent hover:border-red-500/20" title="Reject">
                                        <X className="w-4 h-4" />
                                      </button>
                                      <button onClick={() => handleUpdatePaymentStatus(p.id, 'confirmed')} className="p-1.5 text-indigo-400 hover:text-green-400 hover:bg-green-500/10 rounded-lg transition-all border border-indigo-500/20 hover:border-green-500/20" title="Confirm">
                                        <Check className="w-4 h-4" />
                                      </button>
                                    </div>
                                  )}
                                  {p.status !== 'pending' && (
                                    <span className="text-gray-600 text-[10px] font-bold tracking-widest uppercase">Actioned</span>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                    </div>
                  </div>

                </div>
              )}

            </div>
          )}
        </div>
      </div>

      {/* Edit Config Modal (Admin) */}
      {isEditingConfig && userRole === 'admin' && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setIsEditingConfig(false)} />
          <div className="relative w-full max-w-md bg-[#080d1a]/95 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl">
            <button title="Close dialog" onClick={() => setIsEditingConfig(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Edit3 className="w-5 h-5 text-indigo-400" /> Edit Payment Config
            </h2>

            <form onSubmit={handleSaveConfig} className="space-y-5">
              {/* QR Upload */}
              <div>
                <label className="text-xs font-bold tracking-wider text-gray-500 uppercase block mb-2">QR Code Image</label>
                <input type="file" accept="image/*" className="hidden" ref={qrFileRef} onChange={handleQrFileChange} aria-label="Upload QR code image" title="Upload QR code image" />
                {qrPreview ? (
                  <div className="relative w-40 h-40 mx-auto rounded-2xl overflow-hidden border border-indigo-500/30">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={qrPreview} alt="QR Preview" className="w-full h-full object-cover" />
                    <button title="Remove QR image" type="button" onClick={() => { setQrFile(null); setQrPreview(null); }} className="absolute top-1 right-1 bg-black/60 p-1 rounded-full text-white hover:text-red-400">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <div onClick={() => qrFileRef.current?.click()} className="w-full h-36 border-2 border-dashed border-white/10 hover:border-indigo-500/50 rounded-2xl flex flex-col items-center justify-center text-gray-500 cursor-pointer transition-colors group">
                    <Upload className="w-8 h-8 mb-2 group-hover:text-indigo-400 transition-colors" />
                    <span className="text-xs">Upload new QR image</span>
                    {paymentConfig?.qr_url && <span className="text-[10px] text-gray-600 mt-1">Current QR will be replaced</span>}
                  </div>
                )}
              </div>

              <div>
                <label className="text-xs font-bold tracking-wider text-gray-500 uppercase block mb-2">Or QR Image URL</label>
                <input type="url" value={newQrUrl} onChange={e => setNewQrUrl(e.target.value)} placeholder="https://..." className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500 transition-all" />
              </div>

              <div>
                <label className="text-xs font-bold tracking-wider text-gray-500 uppercase block mb-2">UPI ID *</label>
                <input required type="text" value={newUpiId} onChange={e => setNewUpiId(e.target.value)} placeholder="yourname@upi" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500 transition-all" />
              </div>

              <button type="submit" disabled={isSavingConfig} className="w-full py-3.5 bg-indigo-500 text-black rounded-xl font-black uppercase tracking-widest text-sm hover:bg-indigo-400 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2">
                {isSavingConfig ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : <><Check className="w-4 h-4" /> Save Configuration</>}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
