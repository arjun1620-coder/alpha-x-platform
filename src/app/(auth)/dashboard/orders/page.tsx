"use client";

import { useState, useEffect } from "react";
import { 
  ShoppingCart, Package, Truck, CheckCircle2, Clock, 
  MapPin, Phone, Mail, Loader2, Search, ExternalLink, 
  PackageCheck, RefreshCw, X, ChevronDown, User, AlertCircle
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import Sidebar from "@/components/Sidebar";

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [memberData, setMemberData] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    const role = localStorage.getItem('userRole');
    setUserRole(role);
    const mData = localStorage.getItem('memberData');
    if (mData) setMemberData(JSON.parse(mData));
    
    fetchOrders(role, mData ? JSON.parse(mData).id : null);
  }, []);

  const fetchOrders = async (role: string | null, memberId: string | null) => {
    setIsLoading(true);
    let query = supabase
      .from('orders')
      .select('*, order_items(*)');

    // Filter by member if not admin
    if (role !== 'admin' && memberId) {
      query = query.eq('member_id', memberId);
    }

    const { data, error } = await query.order('created_at', { ascending: false });
    
    if (data) setOrders(data);
    setIsLoading(false);
  };

  const updateOrderStatus = async (orderId: string, status: string) => {
    setIsUpdating(true);
    const { error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', orderId);

    if (!error) {
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
      if (selectedOrder?.id === orderId) setSelectedOrder({ ...selectedOrder, status });
    }
    setIsUpdating(false);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      case 'processing': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'shipped': return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      case 'delivered': return 'bg-green-500/10 text-green-400 border-green-500/20';
      case 'cancelled': return 'bg-red-500/10 text-red-400 border-red-500/20';
      default: return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
    }
  };

  const filteredOrders = orders.filter(o => {
    const matchesSearch = o.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         o.id?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || o.status.toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-[#030712] text-white selection:bg-indigo-500/30 relative">
      <div className="flex h-screen">
        <Sidebar />

        <div className="flex-1 overflow-auto bg-transparent relative z-10 p-4 sm:p-8 pt-24 sm:pt-10">
          
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <h1 className="text-3xl font-black uppercase italic tracking-tighter flex items-center gap-3">
                  <PackageCheck className="w-8 h-8 text-indigo-500" />
                  Order <span className="text-indigo-500">Center</span>
                </h1>
                <p className="text-gray-500 font-bold uppercase text-[10px] tracking-[0.2em] mt-1">
                  Track and manage Component Shipments ({orders.length} Records)
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input 
                    type="text" 
                    placeholder="Search by ID or Name..." 
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="bg-white/5 border border-white/10 rounded-2xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:border-indigo-500 transition-all font-mono italic" 
                  />
                </div>

                <select 
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value)}
                  className="bg-white/5 border border-white/10 rounded-2xl px-6 py-3 text-xs font-black uppercase tracking-widest text-indigo-400 focus:outline-none focus:border-indigo-500 appearance-none shadow-2xl"
                  aria-label="Filter by status" title="Filter by status"
                >
                  <option value="all">Every State</option>
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>

                <button 
                  onClick={() => fetchOrders(userRole, memberData?.id)}
                  className="p-3 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all"
                  title="Refresh Orders"
                >
                  <RefreshCw className={`w-5 h-5 text-gray-500 ${isLoading ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>

            {/* Orders Feed */}
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-24 gap-4">
                <Loader2 className="w-12 h-12 text-indigo-500 animate-spin" />
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-600">Querying Logistics Database...</p>
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className="py-32 text-center bg-white/[0.02] border border-dashed border-white/10 rounded-[3rem]">
                <Package className="w-16 h-16 text-gray-800 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-600 uppercase italic tracking-tighter">No logistics records found</h3>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6">
                {filteredOrders.map(order => (
                  <div 
                    key={order.id}
                    onClick={() => setSelectedOrder(order)}
                    className="group bg-white/[0.02] border border-white/10 rounded-[2.5rem] p-6 sm:p-8 hover:bg-white/[0.05] hover:border-indigo-500/20 transition-all duration-500 cursor-pointer relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 blur-[80px] group-hover:bg-indigo-500/10 transition-all" />
                    
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 relative z-10">
                      {/* Order Info */}
                      <div className="flex-1 space-y-4">
                        <div className="flex flex-wrap items-center gap-3">
                          <span className="px-5 py-2 bg-black border border-white/10 rounded-xl text-xs font-black text-indigo-400 italic shadow-xl">
                            ID: {order.id.slice(0, 13).toUpperCase()}
                          </span>
                          <span className={`px-4 py-2 border rounded-xl text-[10px] font-black uppercase tracking-widest ${getStatusColor(order.status)}`}>
                            {order.status}
                          </span>
                          <span className="text-[10px] text-gray-600 font-bold uppercase tracking-widest">
                            Placed {new Date(order.created_at).toLocaleString()}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-2">
                           <div className="flex items-center gap-4">
                              <div className="w-10 h-10 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10">
                                <User className="w-5 h-5 text-gray-400" />
                              </div>
                              <div>
                                <p className="text-white font-black uppercase italic tracking-tight">{order.full_name}</p>
                                <p className="text-[10px] text-gray-500 font-bold tracking-widest">{order.email}</p>
                              </div>
                           </div>
                           <div className="flex items-center gap-4">
                              <div className="w-10 h-10 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10">
                                <Phone className="w-5 h-5 text-gray-400" />
                              </div>
                              <p className="text-white font-black italic tracking-widest uppercase text-xs">{order.mobile}</p>
                           </div>
                        </div>
                      </div>

                      {/* Summary */}
                      <div className="flex items-center gap-8 lg:text-right">
                         <div>
                            <p className="text-[10px] text-gray-600 font-black uppercase tracking-widest mb-1">Total Items</p>
                            <p className="text-xl font-black text-white italic">{order.order_items?.length || 0} Units</p>
                         </div>
                         <div>
                            <p className="text-[10px] text-gray-600 font-black uppercase tracking-widest mb-1">Total Value</p>
                            <p className="text-3xl font-black text-indigo-400 italic tracking-tighter">₹{parseFloat(order.total_amount).toLocaleString()}</p>
                         </div>
                         <div className="hidden sm:block">
                            <ChevronDown className="w-6 h-6 text-gray-700 group-hover:text-indigo-500 group-hover:translate-y-1 transition-all" />
                         </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Order Details Modal */}
        {selectedOrder && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
             <div className="absolute inset-0 bg-black/80 backdrop-blur-xl" onClick={() => setSelectedOrder(null)} />
             <div className="relative w-full max-w-2xl bg-[#080d1a] border border-white/10 rounded-[3rem] p-8 md:p-12 shadow-2xl max-h-[90vh] overflow-y-auto animate-scale-in">
                <button onClick={() => setSelectedOrder(null)} className="absolute top-8 right-8 text-gray-500 hover:text-white transition-colors">
                  <X className="w-8 h-8" />
                </button>

                <div className="flex items-center gap-4 mb-10">
                   <div className="w-16 h-16 bg-indigo-500/10 rounded-3xl flex items-center justify-center border border-indigo-500/20 translate-y-1 shadow-[0_0_30px_rgba(99,102,241,0.2)]">
                     <PackageCheck className="w-8 h-8 text-indigo-400" />
                   </div>
                   <div>
                      <h2 className="text-3xl font-black italic uppercase tracking-tighter">Manifest Detail</h2>
                      <p className="text-[10px] text-gray-500 font-black uppercase tracking-[0.3em]">Logistic Reference: {selectedOrder.id.toUpperCase()}</p>
                   </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                   <div className="space-y-6">
                      <div>
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-indigo-500/60 mb-3 flex items-center gap-2">
                          <MapPin className="w-3.5 h-3.5 italic" /> Delivery Coordinates
                        </h4>
                        <div className="p-5 bg-white/5 border border-white/10 rounded-3xl text-sm text-gray-300 leading-relaxed font-bold italic">
                          {selectedOrder.address}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                         <div className="px-4 py-2 bg-indigo-500 font-black text-white rounded-xl text-xs uppercase tracking-widest shadow-xl">
                            {selectedOrder.status}
                         </div>
                         <div className="text-[10px] text-gray-600 font-bold uppercase tracking-widest italic">
                           Current Sync State
                         </div>
                      </div>
                   </div>

                   <div className="bg-white/[0.02] border border-white/10 rounded-3xl p-6">
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-indigo-500/60 mb-4 italic">Item Breakdown</h4>
                      <div className="space-y-3 max-h-40 overflow-y-auto scrollbar-hide pr-2">
                         {selectedOrder.order_items?.map((item: any) => (
                           <div key={item.id} className="flex justify-between items-center py-2 border-b border-white/5 last:border-0 grow">
                              <div>
                                <p className="text-xs font-black uppercase italic text-white line-clamp-1">{item.component_name}</p>
                                <p className="text-[9px] text-gray-500 font-bold">QTY: {item.quantity}</p>
                              </div>
                              <p className="text-xs font-black italic text-indigo-400">₹{parseFloat(item.unit_price).toLocaleString()}</p>
                           </div>
                         ))}
                      </div>
                      <div className="mt-4 pt-4 border-t border-indigo-500/20 flex justify-between items-center italic">
                        <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Grand Total</span>
                        <span className="text-xl font-black text-white tracking-tighter">₹{parseFloat(selectedOrder.total_amount).toLocaleString()}</span>
                      </div>
                   </div>
                </div>

                {/* Admin Operations */}
                {userRole === 'admin' && (
                  <div className="pt-8 border-t border-white/10 space-y-6">
                     <h3 className="text-xs font-black uppercase tracking-[0.2em] text-orange-500/80 italic flex items-center gap-2">
                       <AlertCircle className="w-4 h-4" /> Admin Logistics Control
                     </h3>
                     <div className="flex flex-wrap gap-2">
                        {['pending', 'processing', 'shipped', 'delivered', 'cancelled'].map(status => (
                          <button 
                            key={status}
                            disabled={isUpdating || selectedOrder.status === status}
                            onClick={() => updateOrderStatus(selectedOrder.id, status)}
                            className={`px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
                              selectedOrder.status === status 
                                ? 'bg-indigo-500 text-black shadow-2xl' 
                                : 'bg-white/5 text-gray-600 hover:text-white hover:bg-white/10 border border-white/10'
                            }`}
                          >
                            {status}
                          </button>
                        ))}
                     </div>
                  </div>
                )}
             </div>
          </div>
        )}
      </div>
    </div>
  );
}
