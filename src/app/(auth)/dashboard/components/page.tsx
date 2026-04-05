"use client";

import { useState, useEffect, useRef } from "react";
import { 
  Plus, Trash2, Cpu, Search, Loader2, X, Image as ImageIcon, 
  ShoppingCart, Star, ShoppingBag, ArrowRight, CheckCircle2,
  Phone, MapPin, Mail, CreditCard, ChevronRight, PackageCheck,
  ShieldCheck, Truck
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import Sidebar from "@/components/Sidebar";

export default function BuyComponentsPage() {
  const [components, setComponents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  
  // Cart State
  const [cart, setCart] = useState<any[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isOrdering, setIsOrdering] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);

  // Checkout Form
  const [checkoutData, setCheckoutData] = useState({
    full_name: "",
    mobile: "",
    address: "",
    email: ""
  });

  // Admin Add Form
  const [isAddingComponent, setIsAddingComponent] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [newComp, setNewComp] = useState({
    name: "",
    description: "",
    price: "",
    category: "sensor",
    image_url: "",
    stock: 100
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const role = localStorage.getItem('userRole');
    setUserRole(role);
    
    // Load member data for checkout if available
    const memberData = localStorage.getItem('memberData');
    if (memberData) {
      const parsed = JSON.parse(memberData);
      setCheckoutData(prev => ({
        ...prev,
        full_name: parsed.full_name || "",
        email: parsed.email || "",
        mobile: parsed.mobile_number || ""
      }));
    }

    fetchComponents();
    
    // Load cart from session
    const savedCart = sessionStorage.getItem('alphaX_cart');
    if (savedCart) setCart(JSON.parse(savedCart));
  }, []);

  useEffect(() => {
    sessionStorage.setItem('alphaX_cart', JSON.stringify(cart));
  }, [cart]);

  const fetchComponents = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('components')
      .select('*')
      .order('created_at', { ascending: false });

    if (data) setComponents(data);
    setIsLoading(false);
  };

  const addToCart = (product: any) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    // Visual feedback
    const btn = document.getElementById(`add-btn-${product.id}`);
    if (btn) {
      const originalText = btn.innerHTML;
      btn.innerHTML = "Added!";
      btn.classList.add("bg-green-500", "text-white");
      setTimeout(() => {
        btn.innerHTML = originalText;
        btn.classList.remove("bg-green-500", "text-white");
      }, 1000);
    }
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const cartTotal = cart.reduce((sum, item) => sum + (parseFloat(item.price || 0) * item.quantity), 0);

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsOrdering(true);
    
    try {
      // 1. Create Razorpay Order via our API
      const orderResponse = await fetch("/api/razorpay/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: cartTotal }),
      });
      const razorpayOrder = await orderResponse.json();

      if (razorpayOrder.error) throw new Error(razorpayOrder.error);

      // 2. Open Razorpay Checkout Modal
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_YOUR_KEY", // Public key
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        name: "AlphaX Robotics",
        description: `Order for ${cart.length} components`,
        order_id: razorpayOrder.id,
        handler: async function (response: any) {
          // Success Handler
          console.log("Razorpay Success:", response);
          
          const memberData = localStorage.getItem('memberData');
          const memberId = memberData ? JSON.parse(memberData).id : null;

          // 3. Save to Supabase
          const { data: order, error: orderError } = await supabase.from('orders').insert({
            member_id: memberId,
            full_name: checkoutData.full_name,
            email: checkoutData.email,
            mobile: checkoutData.mobile,
            address: checkoutData.address,
            total_amount: cartTotal,
            status: 'processing' // Paid orders start as processing
          }).select().single();

          if (orderError) throw orderError;

          const orderItems = cart.map(item => ({
            order_id: order.id,
            component_id: item.id,
            component_name: item.name,
            quantity: item.quantity,
            unit_price: parseFloat(item.price || 0)
          }));

          await supabase.from('order_items').insert(orderItems);
          
          setCart([]);
          setIsCheckoutOpen(false);
          setOrderSuccess(true);
        },
        prefill: {
          name: checkoutData.full_name,
          email: checkoutData.email,
          contact: checkoutData.mobile
        },
        theme: { color: "#6366f1" }
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();

    } catch (err: any) {
      console.error("Order failed:", err);
      alert("Order processing failed: " + (err.message || "Unknown error"));
    } finally {
      setIsOrdering(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleAdminAddComponent = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);

    let imageUrl = "";
    if (imageFile) {
      const fileExt = imageFile.name.split('.').pop();
      const fileName = `comp_${Date.now()}.${fileExt}`;
      const { data: uploadData, error } = await supabase.storage.from('components').upload(fileName, imageFile);
      if (uploadData) {
        const { data: urlData } = supabase.storage.from('components').getPublicUrl(fileName);
        imageUrl = urlData.publicUrl;
      }
    }

    const { error } = await supabase.from('components').insert({
      ...newComp,
      image_url: imageUrl,
      buy_link: '#' // Buy internal link
    });

    if (!error) {
      setIsAddingComponent(false);
      setImagePreview(null);
      setImageFile(null);
      fetchComponents();
    }
    setIsUploading(false);
  };

  const categories = ["All", "Sensor", "Microcontroller", "Motor", "Display", "Power", "Communication", "Mechanical"];
  
  const filteredProducts = components.filter(p => {
    const matchesSearch = p.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         p.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === "All" || p.category?.toLowerCase() === activeCategory.toLowerCase();
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-[#030712] text-white selection:bg-indigo-500/30 relative">
      <div className="flex h-screen">
        <Sidebar />

        <div className="flex-1 overflow-auto bg-transparent relative z-10 p-4 sm:p-8 pt-24 sm:pt-10">
          
          {/* Top Bar with Cart Indicator */}
          <div className="max-w-7xl mx-auto mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-indigo-500/10 rounded-2xl border border-indigo-500/20 shadow-[0_0_20px_rgba(99,102,241,0.1)]">
                <ShoppingBag className="w-8 h-8 text-indigo-400" />
              </div>
              <div>
                <h1 className="text-3xl font-black tracking-tighter uppercase italic flex items-center gap-2">
                  AlphaX <span className="text-indigo-500">Store</span>
                </h1>
                <p className="text-gray-500 font-bold uppercase text-[10px] tracking-[0.2em]">Premium Robotics Hardware</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input 
                  type="text" 
                  placeholder="Search components, sensors, controllers..." 
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full sm:w-80 bg-white/5 border border-white/10 rounded-full pl-11 pr-4 py-3 text-sm focus:outline-none focus:border-indigo-500 transition-all hover:bg-white/[0.08]" 
                />
              </div>

              <button 
                onClick={() => setIsCartOpen(true)}
                className="relative p-3 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all active:scale-95 group"
              >
                <ShoppingCart className="w-6 h-6 text-indigo-400 group-hover:scale-110 transition-transform" />
                {cart.length > 0 && (
                  <span className="absolute -top-2 -right-2 w-6 h-6 bg-indigo-500 text-black text-[10px] font-black rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(99,102,241,0.5)] animate-bounce">
                    {cart.length}
                  </span>
                )}
              </button>

              {userRole === 'admin' && (
                <button 
                  onClick={() => setIsAddingComponent(true)}
                  className="p-3 bg-indigo-500 text-black rounded-2xl hover:bg-indigo-400 transition-all active:scale-95 shadow-[0_0_15px_rgba(99,102,241,0.3)]"
                >
                  <Plus className="w-6 h-6" />
                </button>
              )}
            </div>
          </div>

          {/* Categories Bar */}
          <div className="max-w-7xl mx-auto mb-10 overflow-x-auto pb-2 flex gap-2 scrollbar-hide">
            {categories.map(cat => (
              <button 
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-widest transition-all whitespace-nowrap border ${
                  activeCategory === cat 
                    ? 'bg-indigo-500 border-indigo-500 text-black shadow-[0_0_15px_rgba(99,102,241,0.3)]' 
                    : 'bg-white/5 border-white/10 text-gray-400 hover:border-gray-600'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Amazon-style Product Grid */}
          <div className="max-w-7xl mx-auto">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <Loader2 className="w-12 h-12 text-indigo-500 animate-spin" />
                <p className="text-indigo-400 uppercase font-black tracking-widest text-xs">Fetching Inventory...</p>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-20 bg-white/[0.02] border border-dashed border-white/10 rounded-[3rem]">
                <Cpu className="w-16 h-16 text-gray-700 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-500">No components found matches your criteria</h3>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredProducts.map(product => (
                  <div key={product.id} className="group bg-white/[0.02] border border-white/10 rounded-3xl overflow-hidden hover:bg-white/[0.04] hover:border-indigo-500/30 transition-all duration-500 flex flex-col shadow-2xl relative">
                    {/* Badge */}
                    <div className="absolute top-4 left-4 z-20 px-3 py-1 bg-black/60 backdrop-blur-md border border-white/10 rounded-full text-[9px] font-black uppercase tracking-widest text-indigo-400">
                      {product.category}
                    </div>

                    {/* Image */}
                    <div className="h-60 w-full bg-[#080d1a] relative overflow-hidden flex items-center justify-center border-b border-white/5">
                      {product.image_url ? (
                        <img 
                          src={product.image_url} 
                          alt={product.name} 
                          className="w-full h-full object-contain p-4 group-hover:scale-110 transition-transform duration-700" 
                        />
                      ) : (
                        <Cpu className="w-20 h-20 text-gray-800" />
                      )}
                      
                      {/* Quick View Overly */}
                      <div className="absolute inset-x-0 bottom-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-500">
                         <button 
                          id={`add-btn-${product.id}`}
                          onClick={() => addToCart(product)}
                          className="w-full py-3 bg-indigo-500 text-black rounded-xl font-black text-xs uppercase tracking-widest shadow-2xl active:scale-95"
                         >
                            Add to Cart
                         </button>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-6 flex flex-col flex-1 relative z-10">
                      <div className="flex items-center gap-1 mb-2">
                        {[1,2,3,4,5].map(i => (
                          <Star key={i} className={`w-3 h-3 ${i <= (product.rating || 4) ? 'text-indigo-400 fill-indigo-400' : 'text-gray-700'}`} />
                        ))}
                        <span className="text-[10px] text-gray-500 font-bold ml-1">({product.reviews_count || 12})</span>
                      </div>
                      <h3 className="font-bold text-white text-lg mb-2 line-clamp-1 group-hover:text-indigo-400 transition-colors uppercase tracking-tight italic">
                        {product.name}
                      </h3>
                      <p className="text-gray-500 text-[11px] leading-relaxed line-clamp-2 mb-4 flex-1">
                        {product.description || "High-performance component optimized for AlphaX Robotics standards."}
                      </p>
                      
                      <div className="flex items-center justify-between mt-auto">
                        <div className="flex flex-col">
                          <span className="text-gray-600 text-[9px] line-through">₹{Math.floor(parseFloat(product.price || 0) * 1.4)}</span>
                          <span className="text-xl font-black text-white italic tracking-tighter">₹{product.price || 0}</span>
                        </div>
                        <div className="flex flex-col items-end">
                           <span className={`text-[10px] font-bold ${product.stock < 10 ? 'text-red-400' : 'text-green-500/60'}`}>
                             {product.stock < 10 ? `Only ${product.stock} left!` : 'In Stock'}
                           </span>
                           <span className="text-[9px] text-gray-600">Free Labs delivery</span>
                        </div>
                      </div>
                    </div>

                    {/* Spotlight Effect (Optimized) */}
                    <div 
                      onMouseMove={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        e.currentTarget.style.setProperty("--mouse-x", `${e.clientX - rect.left}px`);
                        e.currentTarget.style.setProperty("--mouse-y", `${e.clientY - rect.top}px`);
                      }}
                      className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-30"
                      style={{
                        background: `radial-gradient(400px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(99, 102, 241, 0.08), transparent 40%)`
                      }}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Cart Drawer Overlay */}
          {isCartOpen && (
            <div className="fixed inset-0 z-[110] flex justify-end">
              <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsCartOpen(false)} />
              <div className="relative w-full max-w-md bg-[#080d1a] border-l border-white/10 flex flex-col h-full shadow-[0_0_100px_rgba(0,0,0,1)] animate-slide-in-right">
                 {/* Cart Header */}
                 <div className="p-6 border-b border-white/10 flex items-center justify-between bg-indigo-500/5">
                    <div className="flex items-center gap-3">
                      <ShoppingCart className="w-6 h-6 text-indigo-400" />
                      <h2 className="text-xl font-black uppercase tracking-widest italic">Your Basket</h2>
                    </div>
                    <button onClick={() => setIsCartOpen(false)} className="p-2 hover:bg-white/5 rounded-xl transition-all">
                      <X className="w-6 h-6 text-gray-500" />
                    </button>
                 </div>

                 {/* Cart Items */}
                 <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {cart.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center text-center">
                        <ShoppingCart className="w-16 h-16 text-gray-800 mb-4" />
                        <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Your basket is empty</p>
                      </div>
                    ) : (
                      cart.map(item => (
                        <div key={item.id} className="flex gap-4 p-4 rounded-2xl bg-white/[0.03] border border-white/5 group hover:border-indigo-500/20 transition-all">
                          <div className="w-20 h-20 bg-black rounded-xl border border-white/10 flex-shrink-0 flex items-center justify-center overflow-hidden">
                            {item.image_url ? <img src={item.image_url} alt={item.name} className="w-full h-full object-contain p-2" /> : <Cpu className="w-8 h-8 text-gray-800" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-white text-sm truncate uppercase italic">{item.name}</h4>
                            <p className="text-indigo-400 font-black text-sm mt-1">₹{item.price}</p>
                            <div className="flex items-center gap-3 mt-3">
                              <div className="flex items-center bg-black/40 rounded-lg border border-white/10 p-1">
                                <button onClick={() => updateQuantity(item.id, -1)} className="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-white">-</button>
                                <span className="w-8 text-center text-xs font-bold">{item.quantity}</span>
                                <button onClick={() => updateQuantity(item.id, 1)} className="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-white">+</button>
                              </div>
                              <button onClick={() => removeFromCart(item.id)} className="text-[10px] uppercase font-bold text-gray-600 hover:text-red-400 transition-colors">Remove</button>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                 </div>

                 {/* Cart Footer */}
                 {cart.length > 0 && (
                   <div className="p-6 border-t border-white/10 bg-black/40">
                      <div className="space-y-2 mb-6">
                        <div className="flex justify-between text-gray-400 text-sm">
                          <span>Subtotal ({cart.length} items)</span>
                          <span>₹{cartTotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-gray-400 text-sm">
                          <span>Shipping</span>
                          <span className="text-green-500 font-bold uppercase text-[10px]">Free</span>
                        </div>
                        <div className="flex justify-between text-white text-xl font-black italic pt-2 border-t border-white/5">
                          <span>Total</span>
                          <span className="text-indigo-400">₹{cartTotal.toFixed(2)}</span>
                        </div>
                      </div>
                      <button 
                        onClick={() => { setIsCartOpen(false); setIsCheckoutOpen(true); }}
                        className="w-full py-4 bg-indigo-500 text-black rounded-2xl font-black uppercase tracking-[0.2em] italic hover:bg-indigo-400 transition-all flex items-center justify-center gap-2"
                      >
                        Proceed to Checkout <ArrowRight className="w-5 h-5" />
                      </button>
                   </div>
                 )}
              </div>
            </div>
          )}

          {/* Checkout Modal */}
          {isCheckoutOpen && (
            <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setIsCheckoutOpen(false)} />
              <div className="relative w-full max-w-xl bg-[#080d1a] border border-white/10 rounded-[2.5rem] p-8 md:p-12 shadow-2xl max-h-[90vh] overflow-y-auto">
                 <button onClick={() => setIsCheckoutOpen(false)} className="absolute top-6 right-6 text-gray-500 hover:text-white">
                   <X className="w-7 h-7" />
                 </button>

                 <div className="flex items-center gap-4 mb-10">
                    <div className="w-16 h-16 bg-indigo-500/10 rounded-3xl flex items-center justify-center border border-indigo-500/20">
                      <CreditCard className="w-8 h-8 text-indigo-400" />
                    </div>
                    <div>
                      <h2 className="text-3xl font-black uppercase italic tracking-tighter">Checkout</h2>
                      <p className="text-gray-500 font-bold uppercase text-[10px] tracking-widest">Final Step to Secure Components</p>
                    </div>
                 </div>

                 <form onSubmit={handlePlaceOrder} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">Full Name</label>
                        <div className="relative">
                          <input 
                            required 
                            type="text" 
                            disabled 
                            value={checkoutData.full_name} 
                            className="w-full bg-[#030712] border border-white/10 rounded-2xl px-5 py-4 text-sm text-gray-400" 
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">Mobile Contact</label>
                        <div className="relative">
                          <input 
                            required 
                            type="tel" 
                            value={checkoutData.mobile} 
                            onChange={e => setCheckoutData({...checkoutData, mobile: e.target.value})}
                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm text-white focus:outline-none focus:border-indigo-500 transition-all font-mono" 
                            placeholder="+91 XXXXX XXXXX"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">Delivery Address (Lab / Department / Home)</label>
                      <textarea 
                        required 
                        rows={3}
                        value={checkoutData.address}
                        onChange={e => setCheckoutData({...checkoutData, address: e.target.value})}
                        className="w-full bg-white/5 border border-white/10 rounded-[2rem] px-6 py-5 text-sm text-white focus:outline-none focus:border-indigo-500 transition-all resize-none" 
                        placeholder="Detailed address for shipping components..."
                      />
                    </div>

                    <div className="bg-indigo-500/5 border border-indigo-500/10 rounded-3xl p-6 mb-4">
                       <h4 className="text-indigo-400 font-black uppercase text-xs tracking-widest mb-4 flex items-center gap-2">
                         <ShieldCheck className="w-4 h-4" /> Secure Order Summary
                       </h4>
                       <div className="space-y-2">
                         <div className="flex justify-between text-xs text-gray-400">
                           <span>Items ({cart.length})</span>
                           <span>₹{cartTotal.toFixed(2)}</span>
                         </div>
                         <div className="flex justify-between text-xs text-gray-400">
                           <span>Gateway Charge</span>
                           <span>₹0.00</span>
                         </div>
                         <div className="flex justify-between text-lg font-black italic text-white pt-2 border-t border-white/5">
                           <span>GRAND TOTAL</span>
                           <span>₹{cartTotal.toFixed(2)}</span>
                         </div>
                       </div>
                    </div>

                    <button 
                      type="submit" 
                      disabled={isOrdering}
                      className="w-full py-5 bg-indigo-500 text-black rounded-[2rem] font-black uppercase tracking-[0.3em] text-sm italic hover:bg-indigo-400 transition-all flex items-center justify-center gap-3 shadow-[0_0_40px_rgba(99,102,241,0.2)] disabled:opacity-50"
                    >
                      {isOrdering ? (
                        <>Redirecting to Gateway <Loader2 className="w-5 h-5 animate-spin" /></>
                      ) : (
                        <>Pay & Secure Components <PackageCheck className="w-6 h-6" /></>
                      )}
                    </button>
                    <p className="text-center text-[10px] text-gray-600 font-bold uppercase tracking-widest">
                      * By proceeding, an order confirmation will be sent to AlphaX Admins.
                    </p>
                 </form>
              </div>
            </div>
          )}

          {/* Order Success Modal */}
          {orderSuccess && (
            <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-black/90 backdrop-blur-xl" />
              <div className="relative max-w-sm w-full bg-[#080d1a] border border-white/10 rounded-[3rem] p-10 text-center shadow-2xl animate-scale-in">
                 <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-8 border border-green-500/30">
                    <CheckCircle2 className="w-12 h-12 text-green-500 animate-pulse" />
                 </div>
                 <h2 className="text-3xl font-black italic uppercase tracking-tighter mb-4">Successful!</h2>
                 <p className="text-gray-400 text-sm font-medium mb-10 leading-relaxed">
                   Order confirmed. Admins have been notified. Check the <b>Orders</b> section for tracking details.
                 </p>
                 <button 
                   onClick={() => setOrderSuccess(false)}
                   className="w-full py-4 bg-white text-black rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-indigo-400 transition-colors shadow-2xl"
                 >
                   Return to Store
                 </button>
              </div>
            </div>
          )}

          {/* Admin: Add Component Modal */}
          {isAddingComponent && userRole === 'admin' && (
            <div className="fixed inset-0 z-[130] flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setIsAddingComponent(false)} />
              <div className="relative w-full max-w-lg bg-[#080d1a] border border-white/10 rounded-[3rem] p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
                 <button onClick={() => setIsAddingComponent(false)} className="absolute top-6 right-6 text-gray-500 hover:text-white">
                   <X className="w-6 h-6" />
                 </button>
                 <h2 className="text-2xl font-black uppercase italic tracking-tighter mb-8">Add to Inventory</h2>
                 
                 <form onSubmit={handleAdminAddComponent} className="space-y-5">
                    {/* Image Preview Area */}
                    <div 
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full h-40 bg-white/5 border-2 border-dashed border-white/10 rounded-[2rem] flex flex-col items-center justify-center cursor-pointer hover:border-indigo-500/40 transition-all overflow-hidden"
                    >
                      {imagePreview ? (
                        <img src={imagePreview} className="w-full h-full object-contain" alt="Preview" />
                      ) : (
                        <>
                          <ImageIcon className="w-8 h-8 text-gray-600 mb-2" />
                          <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Upload Product View</span>
                        </>
                      )}
                      <input type="file" ref={fileInputRef} onChange={handleImageChange} className="hidden" accept="image/*" />
                    </div>

                    <div className="space-y-4">
                      <input 
                        required 
                        type="text" 
                        placeholder="Component Name" 
                        value={newComp.name}
                        onChange={e => setNewComp({...newComp, name: e.target.value})}
                        className="w-full bg-[#030712] border border-white/10 rounded-2xl px-6 py-4 text-sm" 
                      />
                      <textarea 
                        rows={3}
                        placeholder="Technical Description" 
                        value={newComp.description}
                        onChange={e => setNewComp({...newComp, description: e.target.value})}
                        className="w-full bg-[#030712] border border-white/10 rounded-2xl px-6 py-4 text-sm resize-none" 
                      />
                      <div className="grid grid-cols-2 gap-4">
                        <input 
                          type="text" 
                          placeholder="Price ₹" 
                          value={newComp.price}
                          onChange={e => setNewComp({...newComp, price: e.target.value})}
                          className="w-full bg-[#030712] border border-white/10 rounded-2xl px-6 py-4 text-sm" 
                        />
                        <select 
                          value={newComp.category}
                          onChange={e => setNewComp({...newComp, category: e.target.value})}
                          className="w-full bg-[#030712] border border-white/10 rounded-2xl px-6 py-4 text-sm text-gray-400 capitalize"
                        >
                          {categories.map(c => <option key={c} value={c.toLowerCase()}>{c}</option>)}
                        </select>
                      </div>
                      <input 
                        type="number" 
                        placeholder="Stock Quantity" 
                        value={newComp.stock}
                        onChange={e => setNewComp({...newComp, stock: parseInt(e.target.value)})}
                        className="w-full bg-[#030712] border border-white/10 rounded-2xl px-6 py-4 text-sm" 
                      />
                    </div>

                    <button type="submit" disabled={isUploading} className="w-full py-4 bg-indigo-500 text-black rounded-2xl font-black uppercase tracking-widest text-xs italic hover:bg-indigo-400 transition-all flex items-center justify-center gap-2">
                       {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Plus className="w-4 h-4" /> Deploy to Store</>}
                    </button>
                 </form>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
