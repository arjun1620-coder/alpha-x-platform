"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase";

import ProfileIcon from "@/components/ProfileIcon";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    let isMounted = true;

    const checkAuth = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        
        // Handle explicit Supabase Auth errors (like Invalid Refresh Token)
        if (error) {
          console.warn("Auth session sync error:", error.message);
          if (error.message.includes("Refresh Token")) {
            localStorage.clear();
            if (isMounted) router.push("/login?error=Session%20Expired");
            return;
          }
        }

        const session = data?.session;
        const userRole = localStorage.getItem('userRole');
        
        // Allow if there's a Supabase session (Admin) OR a member role
        if (session) {
          localStorage.setItem('userRole', 'admin');
        }

        const userRoleMap = localStorage.getItem('userRole'); 
        
        if (!session && userRoleMap !== 'member') {
          if (isMounted) {
            localStorage.clear(); // Safety clear
            router.push("/login?error=Unauthorized%20Access");
          }
        } else if (isMounted) {
          // Access control logic
          if (userRoleMap === 'member' && (pathname.includes('/applications') || pathname.includes('/posts'))) {
            router.push('/dashboard/teams');
          } else {
            setIsLoading(false);
          }
        }
      } catch (err) {
        console.error("Critical Auth failure:", err);
        localStorage.clear();
        if (isMounted) router.push("/login");
      }
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        const userRole = localStorage.getItem('userRole');
        if (event === 'SIGNED_OUT' || (!session && userRole !== 'member' && isMounted)) {
          localStorage.clear();
          router.push("/login");
        }
      }
    );

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [router, pathname]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#030712] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-indigo-500 font-bold uppercase tracking-widest text-sm animate-pulse">Authenticating...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <ProfileIcon />
      {children}
    </>
  );
}
