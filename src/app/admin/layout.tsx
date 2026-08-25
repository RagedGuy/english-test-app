"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { LayoutDashboard, FileText, Users, LogOut, Code, Plus } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  // Don't show sidebar on login page
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  const navItems = [
    { name: "TESTS", href: "/admin", icon: FileText },
    { name: "RESULTS", href: "/admin/results", icon: LayoutDashboard },
    { name: "STUDENTS", href: "/admin/students", icon: Users },
  ];

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/admin/login");
  };

  return (
    <div className="min-h-screen flex text-white">
      {/* Sidebar */}
      <aside className="w-64 border-r border-[#1E1E1E] bg-[#0A0A0A] flex flex-col">
        <div className="p-6 border-b border-[#1E1E1E]">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-[#00F0FF]" />
            <div>
              <h1 className="font-bold uppercase tracking-widest text-sm">
                System Admin
              </h1>
              <p className="text-xs text-gray-500 uppercase tracking-widest">
                Control Panel
              </p>
            </div>
          </div>
        </div>

        <nav className="flex-1 py-6 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link key={item.name} href={item.href}>
                <div
                  className={`flex items-center gap-3 px-6 py-3 uppercase tracking-widest text-sm transition-colors ${
                    isActive
                      ? "text-[#00F0FF] border-l-2 border-[#00F0FF] bg-[#00F0FF]/10"
                      : "text-gray-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  {item.name}
                </div>
              </Link>
            );
          })}
        </nav>

        <div className="p-6 border-t border-[#1E1E1E]">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 text-gray-400 hover:text-[#FF3366] transition-colors uppercase tracking-widest text-sm w-full"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
