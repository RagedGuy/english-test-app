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
      <aside className="w-64 border-r border-[#2a1f18] bg-[#0d0906] flex flex-col">
        <div className="p-6 border-b border-[#2a1f18]">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-[#C58359] shadow-[0_0_10px_rgba(197,131,89,0.8)]" />
            <div>
              <h1 className="font-bold uppercase tracking-widest text-sm text-[#FDF8F5]">
                System Admin
              </h1>
              <p className="text-[10px] text-[#C58359]/70 uppercase tracking-widest mt-1">
                Control Panel
              </p>
            </div>
          </div>
        </div>

        <nav className="flex-1 py-6 space-y-2 px-3">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link key={item.name} href={item.href}>
                <div
                  className={`flex items-center gap-3 px-4 py-3 rounded-none uppercase tracking-widest text-xs font-semibold transition-all duration-200 ${
                    isActive
                      ? "text-[#0d0906] bg-[#C58359] shadow-[0_0_15px_rgba(197,131,89,0.2)]"
                      : "text-gray-400 hover:text-[#E3B497] hover:bg-[#1a120e]"
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  {item.name}
                </div>
              </Link>
            );
          })}
        </nav>

        <div className="p-6 border-t border-[#2a1f18]">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 text-gray-400 hover:text-[#D65A5A] transition-colors uppercase tracking-widest text-xs font-semibold w-full px-4 py-2 rounded-none hover:bg-[#D65A5A]/10"
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
