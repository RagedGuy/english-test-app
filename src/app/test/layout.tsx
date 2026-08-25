"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter, usePathname } from "next/navigation";
import { motion } from "framer-motion";

export default function TestLayout({ children }: { children: React.ReactNode }) {
  const [checking, setChecking] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const publicPaths = ["/test/login", "/test/register"];

  useEffect(() => {
    const check = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setAuthenticated(true);
      } else if (!publicPaths.includes(pathname)) {
        router.push("/test/login");
      }
      setChecking(false);
    };
    check();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setAuthenticated(!!session);
      if (!session && !publicPaths.includes(pathname)) {
        router.push("/test/login");
      }
    });

    return () => subscription.unsubscribe();
  }, [pathname]);

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1.5, repeat: Infinity }} className="text-gray-500 uppercase tracking-widest text-sm">
          Loading...
        </motion.div>
      </div>
    );
  }

  return <>{children}</>;
}
