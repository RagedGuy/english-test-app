"use client";

import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";
import { LayoutDashboard, BarChart3, Users, LogOut, Menu, X, ChevronLeft, ChevronRight } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { motion, AnimatePresence } from "framer-motion";

const navItems = [
  { name: "Tests", href: "/admin", icon: LayoutDashboard },
  { name: "Results", href: "/admin/results", icon: BarChart3 },
  { name: "Students", href: "/admin/students", icon: Users },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [desktopCollapsed, setDesktopCollapsed] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (pathname === "/admin/login") return <>{children}</>;

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/admin/login");
  };

  return (
    <div className="min-h-screen flex text-white">
      {/* Desktop Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: desktopCollapsed ? 80 : 256 }}
        transition={{ duration: 0.25, ease: "easeInOut" }}
        className="hidden md:flex border-r border-[#2a1f18] bg-[#050505]/80 backdrop-blur-xl flex-col fixed h-full z-40 overflow-hidden"
      >
        {/* Desktop Header */}
        <div className="p-5 border-b border-[#2a1f18] min-h-[73px] flex items-center justify-between">
          {!desktopCollapsed ? (
            <>
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="w-2 h-2 bg-[#C58359] shadow-[0_0_10px_rgba(197,131,89,0.8)] shrink-0" />
                <div className="whitespace-nowrap overflow-hidden">
                  <h1 className="font-bold uppercase tracking-widest text-sm text-[#FDF8F5]">System Admin</h1>
                  <p className="text-[10px] text-[#C58359]/70 uppercase tracking-widest mt-1">Control Panel</p>
                </div>
              </div>
              <button
                onClick={() => setDesktopCollapsed(true)}
                className="p-1.5 text-gray-400 hover:text-[#C58359] hover:bg-[#1a120e] transition-colors border border-[#2a1f18] shrink-0"
                title="Collapse sidebar"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            </>
          ) : (
            <div className="w-full flex items-center justify-center">
              <button
                onClick={() => setDesktopCollapsed(false)}
                className="p-1.5 text-gray-400 hover:text-[#C58359] hover:bg-[#1a120e] transition-colors border border-[#2a1f18]"
                title="Expand sidebar"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Desktop Navigation */}
        <nav className="flex-1 py-6 space-y-2 px-3 overflow-y-auto overflow-x-hidden">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link key={item.name} href={item.href} title={desktopCollapsed ? item.name : undefined}>
                <div
                  className={`flex items-center ${
                    desktopCollapsed ? "justify-center px-2" : "gap-3 px-4"
                  } py-3 uppercase tracking-widest text-xs font-semibold transition-all duration-200 ${
                    isActive
                      ? "text-[#050505] bg-[#C58359] shadow-[0_0_15px_rgba(197,131,89,0.2)]"
                      : "text-gray-400 hover:text-[#E3B497] hover:bg-[#1a120e]"
                  }`}
                >
                  <item.icon className="w-4 h-4 shrink-0" />
                  {!desktopCollapsed && <span className="truncate whitespace-nowrap">{item.name}</span>}
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Desktop Footer */}
        <div className="p-3 border-t border-[#2a1f18] space-y-2">
          <button
            onClick={() => setDesktopCollapsed(!desktopCollapsed)}
            className={`flex items-center ${
              desktopCollapsed ? "justify-center" : "justify-between"
            } text-gray-400 hover:text-[#C58359] transition-colors uppercase tracking-widest text-xs font-semibold w-full px-3 py-2 hover:bg-[#1a120e]`}
            title={desktopCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {!desktopCollapsed && <span className="whitespace-nowrap">Collapse</span>}
            {desktopCollapsed ? (
              <ChevronRight className="w-4 h-4 shrink-0" />
            ) : (
              <ChevronLeft className="w-4 h-4 shrink-0" />
            )}
          </button>
          <button
            onClick={handleLogout}
            className={`flex items-center ${
              desktopCollapsed ? "justify-center" : "gap-3"
            } text-gray-400 hover:text-[#D65A5A] transition-colors uppercase tracking-widest text-xs font-semibold w-full px-3 py-2 hover:bg-[#D65A5A]/10`}
            title="Sign Out"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            {!desktopCollapsed && <span className="whitespace-nowrap">Sign Out</span>}
          </button>
        </div>
      </motion.aside>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-[#050505]/90 backdrop-blur-xl border-b border-[#2a1f18] px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-[#C58359]" />
          <span className="font-bold uppercase tracking-widest text-xs text-[#FDF8F5]">Admin</span>
        </div>
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-gray-400 hover:text-[#C58359] p-2">
          {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="md:hidden fixed inset-0 bg-black/60 z-40"
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="md:hidden fixed left-0 top-0 bottom-0 w-64 border-r border-[#2a1f18] bg-[#050505] flex flex-col z-50"
            >
              <div className="p-6 border-b border-[#2a1f18]">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-[#C58359] shadow-[0_0_10px_rgba(197,131,89,0.8)]" />
                  <div>
                    <h1 className="font-bold uppercase tracking-widest text-sm text-[#FDF8F5]">System Admin</h1>
                    <p className="text-[10px] text-[#C58359]/70 uppercase tracking-widest mt-1">Control Panel</p>
                  </div>
                </div>
              </div>

              <nav className="flex-1 py-6 space-y-2 px-3">
                {navItems.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link key={item.name} href={item.href} onClick={() => setSidebarOpen(false)}>
                      <div
                        className={`flex items-center gap-3 px-4 py-3 uppercase tracking-widest text-xs font-semibold transition-all duration-200 ${
                          isActive
                            ? "text-[#050505] bg-[#C58359] shadow-[0_0_15px_rgba(197,131,89,0.2)]"
                            : "text-gray-400 hover:text-[#E3B497] hover:bg-[#1a120e]"
                        }`}
                      >
                        <item.icon className="w-4 h-4 shrink-0" />
                        <span>{item.name}</span>
                      </div>
                    </Link>
                  );
                })}
              </nav>

              <div className="p-6 border-t border-[#2a1f18]">
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 text-gray-400 hover:text-[#D65A5A] transition-colors uppercase tracking-widest text-xs font-semibold w-full px-4 py-2 hover:bg-[#D65A5A]/10"
                >
                  <LogOut className="w-4 h-4 shrink-0" />
                  Sign Out
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <motion.main
        initial={false}
        animate={{
          marginLeft: isDesktop ? (desktopCollapsed ? 80 : 256) : 0,
        }}
        transition={{ duration: 0.25, ease: "easeInOut" }}
        className="flex-1 mt-12 md:mt-0 overflow-auto min-w-0"
      >
        {children}
      </motion.main>
    </div>
  );
}
