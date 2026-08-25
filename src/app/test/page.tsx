"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Clock, BookOpen, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

export default function StudentPortal() {
  const [tests, setTests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchTests();
  }, []);

  const fetchTests = async () => {
    const { data } = await supabase.from("tests").select("*").order("created_at", { ascending: false });
    if (data) setTests(data);
    setLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/test/login");
  };

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto min-h-screen flex flex-col">
      <header className="mb-8 md:mb-12 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="text-center sm:text-left">
          <h1 className="text-3xl md:text-4xl font-light tracking-wide text-[#FDF8F5]">
            Available <span className="text-[#C58359] font-bold">Assessments</span>
          </h1>
          <p className="text-[#C58359]/70 text-sm tracking-widest uppercase mt-2">Select a test to begin</p>
        </div>
        <motion.button whileTap={{ scale: 0.95 }} onClick={handleLogout} className="flex items-center gap-2 text-gray-400 hover:text-[#D65A5A] transition-colors uppercase tracking-widest text-xs font-semibold">
          <LogOut className="w-4 h-4" /> Sign Out
        </motion.button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        {loading ? (
          <div className="col-span-full flex justify-center py-20">
            <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1.5, repeat: Infinity }} className="text-gray-500 uppercase tracking-widest text-sm">Loading...</motion.div>
          </div>
        ) : tests.length === 0 ? (
          <div className="col-span-full glass-panel p-16 flex flex-col items-center justify-center text-center">
            <BookOpen className="w-12 h-12 text-[#C58359]/50 mb-4" />
            <p className="text-gray-400 max-w-md">No tests available. Check back later.</p>
          </div>
        ) : (
          tests.map((test, i) => (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08, type: "spring", stiffness: 300, damping: 30 }}
              key={test.id}
              className="glass-panel p-6 md:p-8 flex flex-col hover:border-[#C58359]/50 transition-all duration-300 group"
            >
              <h3 className="text-xl md:text-2xl font-medium text-[#FDF8F5] mb-2">{test.title}</h3>
              {test.description && <p className="text-gray-400 text-sm mb-6 line-clamp-2">{test.description}</p>}
              <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-[#E3B497] mb-6 md:mb-8">
                <Clock className="w-4 h-4" />{test.duration_minutes} Minutes
              </div>
              <div className="mt-auto pt-6 border-t border-[#2a1f18]">
                <Link href={`/test/${test.id}`}>
                  <motion.button whileTap={{ scale: 0.95 }} className="w-full flex items-center justify-center gap-3 bg-transparent border border-[#C58359]/30 text-[#C58359] p-4 font-semibold uppercase tracking-widest hover:bg-[#C58359] hover:text-[#050505] transition-all duration-300">
                    Start Test<ArrowRight className="w-4 h-4" />
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
