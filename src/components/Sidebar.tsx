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
} from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function Sidebar() {
  const pathname = usePathname();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);


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
      href: "/dashboard/posts",
      label: "Post Management",
      icon: Activity,
      adminOnly: true,
    },
    {
      href: "/dashboard/components",
      label: "Components",
      icon: userRole === 'admin' ? Shield : Shield, // Use Shield for both now as seen in code
      adminOnly: false,
    },
    {
      href: "/dashboard/payments",
      label: "Payments",
      icon: IndianRupee,
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

  const toggleSidebar = () => setIsOpen(!isOpen);

  return (
    <>
      {/* Mobile Menu Button - Fixed at top-left */}
      <div className="md:hidden fixed top-6 left-6 z-[60]">
        <button 
          onClick={toggleSidebar}
          className="p-3 bg-[#080d1a] border border-white/10 rounded-xl text-indigo-400 shadow-2xl backdrop-blur-md"
          aria-label="Toggle Menu"
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar Overlay for Mobile */}
      {isOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-[50]"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar Content */}
      <div className={`
        fixed md:relative inset-y-0 left-0 z-[55]
        w-64 border-r border-white/5 bg-[#080d1a] p-6 pt-24 md:pt-6
        flex flex-col transition-transform duration-300 ease-in-out overflow-y-auto
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="flex items-center gap-3 mb-12">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-400 to-slate-600 flex items-center justify-center">
            <span className="font-extrabold text-black text-xs tracking-tight">AX</span>
          </div>
          <span className="font-bold tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 uppercase">
            {userRole || 'Loading...'}
          </span>
        </div>

        <nav className="space-y-2 flex-1">
          {filteredNavItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link 
                key={item.href}
                href={item.href} 
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${
                  isActive 
                    ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shadow-[0_0_15px_rgba(99,102,241,0.1)]' 
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-indigo-400' : ''}`} />
                {item.label}
              </Link>
            );
          })}
        </nav>



        <button 
          onClick={handleSignOut}
          className="w-full flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl font-medium transition-all text-left mt-auto"
        >
          <ArrowLeft className="w-5 h-5" />
          Sign Out
        </button>
      </div>
    </>
  );
}
