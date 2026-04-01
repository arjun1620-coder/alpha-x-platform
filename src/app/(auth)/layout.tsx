"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase";

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
        const { data: { session } } = await supabase.auth.getSession();
        const userRole = localStorage.getItem('userRole');
        
        // Allow if there's a Supabase session (Admin) OR a member role
        if (session) {
          localStorage.setItem('userRole', 'admin');
        }

        const userRoleMap = localStorage.getItem('userRole'); // Re-read after potential update
        if (!session && userRoleMap !== 'member') {
          if (isMounted) router.push("/login?error=Unauthorized%20Access");
        } else if (isMounted) {
          // If member is trying to access applications or posts (admin only), redirect them
          if (userRoleMap === 'member' && (pathname.includes('/applications') || pathname.includes('/posts'))) {
            router.push('/dashboard/teams');
          } else {
            setIsLoading(false);
          }
        }
      } catch (err) {
        console.error("Auth check failed:", err);
        if (isMounted) router.push("/login");
      }
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        const userRole = localStorage.getItem('userRole');
        if (!session && userRole !== 'member' && isMounted) {
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
          <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-emerald-500 font-bold uppercase tracking-widest text-sm animate-pulse">Authenticating...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
