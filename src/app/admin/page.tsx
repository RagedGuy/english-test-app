"use client";

import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Clock, Users, MoreVertical, Trash2, Share2, Star, Copy } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/components/ui/toast";

type Test = {
  id: string;
  title: string;
  duration_minutes: number;
  created_at: string;
};

export default function AdminDashboard() {
  const [tests, setTests] = useState<Test[]>([]);
  const [loading, setLoading] = useState(true);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const { toast } = useToast();
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchTests();
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenMenu(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchTests = async () => {
    const { data } = await supabase.from("tests").select("*").order("created_at", { ascending: false });
    if (data) setTests(data);
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("tests").delete().eq("id", id);
    if (!error) {
      setTests((prev) => prev.filter((t) => t.id !== id));
      toast("Test deleted", "success");
    } else {
      toast("Failed to delete test", "error");
    }
    setOpenMenu(null);
  };

  const handleCopyLink = (id: string) => {
    navigator.clipboard.writeText(`${window.location.origin}/test/${id}`);
    toast("Student link copied", "info");
    setOpenMenu(null);
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 md:mb-12">
        <div>
          <h1 className="text-2xl md:text-3xl font-light tracking-wide text-[#FDF8F5]">Assessments</h1>
          <p className="text-[#C58359]/70 text-sm tracking-widest uppercase mt-1">Manage all tests</p>
        </div>
        <Link href="/admin/test/new">
          <motion.button whileTap={{ scale: 0.95 }} className="flex items-center gap-2 bg-[#1a120e] border border-[#C58359]/30 text-[#C58359] px-5 py-2.5 text-sm uppercase tracking-widest font-semibold hover:bg-[#C58359] hover:text-[#050505] hover:shadow-[0_0_15px_rgba(197,131,89,0.3)] transition-all duration-300">
            <Plus className="w-4 h-4" />
            New Test
          </motion.button>
        </Link>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
        {loading ? (
          <div className="col-span-full flex justify-center py-20">
            <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1.5, repeat: Infinity }} className="text-gray-500 uppercase tracking-widest text-sm">Loading...</motion.div>
          </div>
        ) : tests.length === 0 ? (
          <div className="col-span-full glass-panel p-16 flex flex-col items-center justify-center text-center">
            <p className="text-gray-400 max-w-md mb-8">No assessments created yet.</p>
            <Link href="/admin/test/new">
              <button className="bg-[#C58359] text-[#050505] px-8 py-3 text-sm font-semibold uppercase tracking-widest hover:bg-[#E3B497] transition-all duration-300">Create First Test</button>
            </Link>
          </div>
        ) : (
          tests.map((test, i) => (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08, type: "spring", stiffness: 300, damping: 30 }}
              key={test.id}
              className="glass-panel p-5 md:p-6 flex flex-col hover:border-[#C58359]/50 transition-all duration-300"
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg md:text-xl font-medium text-[#FDF8F5] flex-1 mr-2">{test.title}</h3>
                <div className="relative" ref={openMenu === test.id ? menuRef : null}>
                  <button onClick={() => setOpenMenu(openMenu === test.id ? null : test.id)} className="text-gray-500 hover:text-[#C58359] transition-colors p-1">
                    <MoreVertical className="w-5 h-5" />
                  </button>
                  <AnimatePresence>
                    {openMenu === test.id && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: -5 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: -5 }}
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                        className="absolute right-0 top-8 w-52 bg-[#0a0807] border border-[#2a1f18] shadow-[0_10px_40px_rgba(0,0,0,0.7)] z-50 overflow-hidden"
                      >
                        <button onClick={() => handleCopyLink(test.id)} className="w-full text-left px-4 py-3 text-xs uppercase tracking-widest text-gray-400 hover:bg-[#1a120e] hover:text-[#D8C3A5] transition-colors flex items-center gap-3">
                          <Copy className="w-3.5 h-3.5" /> Copy Student Link
                        </button>
                        <Link href={`/admin/test/${test.id}`} onClick={() => setOpenMenu(null)}>
                          <div className="w-full text-left px-4 py-3 text-xs uppercase tracking-widest text-gray-400 hover:bg-[#1a120e] hover:text-[#D8C3A5] transition-colors flex items-center gap-3">
                            <Star className="w-3.5 h-3.5" /> Rate Attempts
                          </div>
                        </Link>
                        <button onClick={() => handleDelete(test.id)} className="w-full text-left px-4 py-3 text-xs uppercase tracking-widest text-gray-400 hover:bg-[#D65A5A]/10 hover:text-[#D65A5A] transition-colors flex items-center gap-3 border-t border-[#2a1f18]">
                          <Trash2 className="w-3.5 h-3.5" /> Delete Test
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              <div className="flex items-center gap-5 text-xs uppercase tracking-widest text-gray-400 mb-6 md:mb-8">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-[#E3B497]" />
                  {test.duration_minutes} MIN
                </div>
              </div>

              <div className="mt-auto pt-4 md:pt-5 border-t border-[#2a1f18] flex justify-between items-center">
                <div className="text-[10px] uppercase tracking-widest text-gray-500">
                  {new Date(test.created_at).toLocaleDateString()}
                </div>
                <Link href={`/admin/test/${test.id}`}>
                  <motion.button whileTap={{ scale: 0.95 }} className="bg-transparent border border-[#C58359]/30 text-[#C58359] px-4 py-1.5 text-xs font-bold uppercase tracking-widest hover:bg-[#C58359] hover:text-[#050505] transition-all duration-300">
                    Manage
                  </motion.button>
                </Link>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
