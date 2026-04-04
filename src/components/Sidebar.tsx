"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  ArrowLeft, 
  Users, 
  Activity, 
  Network, 
  Calendar, 
  Shield, 
  Cpu, 
  IndianRupee, 
  Menu, 
  X,
  MessageSquare,
  Rocket,
  Heart,
  ShoppingCart,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function Sidebar() {
  const pathname = usePathname();
  const [userRole, setUserRole] = useState<string | null>(null);


  useEffect(() => {
    const role = localStorage.getItem('userRole');
    setUserRole(role);
  }, []);

  const navItems = [
    {
      href: "/dashboard/applications",
      label: "Applications",
      icon: Users,
      adminOnly: true,
    },
    {
      href: "/dashboard/teams",
      label: "Teams",
      icon: Network,
      adminOnly: false,
    },
    {
      href: "/dashboard/events",
      label: "Announcements",
      icon: Calendar,
      adminOnly: false,
    },
    {
      href: "/dashboard/chat",
      label: "Live Chat",
      icon: MessageSquare,
      adminOnly: false,
    },
    {
      href: "/dashboard/projects",
      label: "Project Showcases",
      icon: Rocket,
      adminOnly: true,
    },
    {
      href: "/dashboard/posts",
      label: "Post Management",
      icon: Activity,
      adminOnly: true,
    },
    {
      href: "/dashboard/components",
      label: "Buy Components",
      icon: Cpu,
      adminOnly: false,
    },
    {
      href: "/dashboard/orders",
      label: "Orders",
      icon: ShoppingCart,
      adminOnly: false,
    },
    {
      href: "/dashboard/payments",
      label: "Contribute",
      icon: Heart,
      adminOnly: false,
    },
  ];

  // Adjust icons based on what was seen in the pages
  // In Teams it was Network, in Payments it was IndianRupee, etc.
  // The label and icons in navItems match the dashboard pages' sidebar.

  const filteredNavItems = navItems.filter(item => !item.adminOnly || userRole === 'admin');

  const handleSignOut = async () => {
    if (userRole === 'admin') await supabase.auth.signOut();
    localStorage.removeItem('userRole');
    localStorage.removeItem('memberData');
    window.location.href='/login';
  };

  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const toggleSidebar = () => setIsOpen(!isOpen);

  // Auto-hide when mouse leaves the sidebar area
  const sidebarExpanded = isOpen || isHovered;

  return (
    <>
      {/* Edge Hover Trigger Zone - Invisible but active */}
      <div 
        className="fixed inset-y-0 left-0 w-4 z-[54] transition-all"
        onMouseEnter={() => setIsHovered(true)}
      />

      {/* Floating Toggle Button (visible when sidebar is closed) */}
      <div className={`
        fixed top-1/2 -translate-y-1/2 left-0 z-[60] transition-all duration-500
        ${sidebarExpanded ? '-translate-x-full opacity-0' : 'translate-x-0 opacity-100 delay-300'}
      `}>
        <button 
          onClick={toggleSidebar}
          onMouseEnter={() => setIsHovered(true)}
          className="group flex flex-col items-center justify-center gap-1 w-12 h-24 bg-[#080d1a]/80 backdrop-blur-xl border border-white/10 rounded-r-2xl text-indigo-400 hover:text-white hover:w-14 transition-all shadow-[10px_0_30px_rgba(0,0,0,0.5)] border-l-0"
          aria-label="Open Sidebar"
        >
          <div className="w-1 h-8 bg-indigo-500/40 group-hover:bg-indigo-400 rounded-full transition-colors" />
          <Menu className="w-5 h-5 -rotate-90 group-hover:scale-110 transition-transform" />
        </button>
      </div>

      {/* Mobile Menu Button - Original logic for small screens */}
      <div className="md:hidden fixed top-6 left-6 z-[60]">
        {!sidebarExpanded && (
          <button 
            onClick={toggleSidebar}
            className="p-3 bg-[#080d1a] border border-white/10 rounded-xl text-indigo-400 shadow-2xl backdrop-blur-md"
            aria-label="Toggle Menu"
          >
            <Menu className="w-6 h-6" />
          </button>
        )}
      </div>

      {/* Sidebar Overlay for Mobile/Focus */}
      {sidebarExpanded && (
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-[50] transition-opacity duration-500"
          onClick={() => {
            setIsOpen(false);
            setIsHovered(false);
          }}
          onMouseEnter={() => setIsHovered(false)}
        />
      )}

      {/* Sidebar Content */}
      <div 
        className={`
          fixed inset-y-0 left-0 z-[55]
          w-72 border-r border-white/10 p-7 pt-24 md:pt-10
          flex flex-col overflow-y-auto
          transition-all duration-300 ease-out will-change-transform gpu-accelerate
          backdrop-blur-xl bg-[#080d1a]/90 shadow-[10px_0_50px_rgba(0,0,0,0.5)]
          ${sidebarExpanded ? 'translate-x-0' : '-translate-x-full'}
        `}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="flex items-center justify-between mb-12 animate-slide-in">
          <div className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/icons/v1-192.png" alt="AlphaX" className="w-9 h-9 rounded-xl shadow-[0_0_20px_rgba(99,102,241,0.4)] border border-white/5" />
            <div className="flex flex-col">
              <span className="font-black tracking-[0.2em] text-white uppercase text-[10px]">AlphaX</span>
              <span className="font-bold text-indigo-400 uppercase text-[9px] opacity-70">
                {userRole || 'Loading...'}
              </span>
            </div>
          </div>
          <button 
            onClick={() => {
              setIsOpen(false);
              setIsHovered(false);
            }}
            className="p-2 rounded-xl bg-white/5 text-gray-500 hover:text-white hover:bg-white/10 transition-all border border-white/5"
            title="Close Sidebar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <nav className="space-y-1.5 flex-1">
          {filteredNavItems.map((item, index) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link 
                key={item.href}
                href={item.href} 
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3.5 px-4 py-3.5 rounded-2xl font-semibold transition-all duration-300 group relative overflow-hidden ${
                  isActive 
                    ? 'bg-indigo-500/10 text-white border border-indigo-500/30 shadow-[0_0_25px_rgba(99,102,241,0.15)]' 
                    : 'text-gray-400 hover:text-white hover:bg-white/5 active:scale-95'
                }`}
                style={{ 
                  animation: `slide-in-right 0.6s cubic-bezier(0.16, 1, 0.3, 1) ${index * 0.05}s both` 
                }}
              >
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-7 bg-indigo-500 rounded-r-full shadow-[0_0_20px_rgba(99,102,241,1)]" />
                )}
                <Icon className={`w-5 h-5 transition-all duration-300 group-hover:scale-115 group-hover:rotate-6 ${isActive ? 'text-indigo-400 drop-shadow-[0_0_8px_rgba(99,102,241,0.6)]' : 'group-hover:text-indigo-300'}`} />
                <span className="relative z-10 text-sm tracking-wide">{item.label}</span>
                {!isActive && (
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/0 via-indigo-500/5 to-indigo-500/0 opacity-0 group-hover:opacity-100 -translate-x-full group-hover:translate-x-full transition-all duration-1000" />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="pt-6 border-t border-white/5 mt-auto space-y-4">
          <button 
            onClick={handleSignOut}
            className="w-full flex items-center gap-3.5 px-5 py-4 text-gray-500 hover:text-red-400 hover:bg-red-500/5 rounded-2xl font-bold transition-all duration-300 group active:scale-95 text-left text-xs uppercase tracking-widest border border-transparent hover:border-red-500/10"
          >
            <ArrowLeft className="w-5 h-5 transition-transform duration-300 group-hover:-translate-x-1.5" />
            Sign Out
          </button>
        </div>
      </div>
    </>
  );
}
