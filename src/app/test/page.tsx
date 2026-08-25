"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Clock, BookOpen } from "lucide-react";

export default function StudentPortal() {
  const [tests, setTests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTests();
  }, []);

  const fetchTests = async () => {
    const { data, error } = await supabase.from("tests").select("*").order("created_at", { ascending: false });
    if (data) setTests(data);
    setLoading(false);
  };

  return (
    <div className="p-8 max-w-5xl mx-auto min-h-screen flex flex-col">
      <header className="mb-12 text-center">
        <h1 className="text-4xl font-light tracking-wide text-[#FDF8F5]">
          Available <span className="text-[#C58359] font-bold">Assessments</span>
        </h1>
        <p className="text-[#C58359]/70 text-sm tracking-widest uppercase mt-4">
          Select a test to begin your session
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {loading ? (
          <p className="text-gray-500 uppercase tracking-widest col-span-full text-center py-10">Loading assessments...</p>
        ) : tests.length === 0 ? (
          <div className="col-span-full glass-panel p-16 flex flex-col items-center justify-center text-center">
            <BookOpen className="w-12 h-12 text-[#C58359]/50 mb-4" />
            <p className="text-gray-400 max-w-md">No tests are currently available. Check back later.</p>
          </div>
        ) : (
          tests.map((test, i) => (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              key={test.id}
              className="glass-panel p-8 flex flex-col hover:border-[#C58359]/50 transition-all duration-300 group"
            >
              <h3 className="text-2xl font-medium text-[#FDF8F5] mb-2">{test.title}</h3>
              {test.description && (
                <p className="text-gray-400 text-sm mb-6 line-clamp-2">
                  {test.description}
                </p>
              )}
              
              <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-[#E3B497] mb-8">
                 <Clock className="w-4 h-4" />
                 {test.duration_minutes} Minutes
              </div>

              <div className="mt-auto pt-6 border-t border-[#2a1f18]">
                <Link href={`/test/${test.id}`}>
                  <button className="w-full flex items-center justify-center gap-3 bg-transparent border border-[#C58359]/30 text-[#C58359] p-4 font-semibold uppercase tracking-widest hover:bg-[#C58359] hover:text-[#0d0906] transition-all duration-300 group-hover:shadow-[0_0_20px_rgba(197,131,89,0.3)]">
                    Start Test
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </Link>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
