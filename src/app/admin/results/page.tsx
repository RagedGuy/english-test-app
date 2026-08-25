"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { motion } from "framer-motion";
import { BarChart3 } from "lucide-react";

export default function ResultsPage() {
  const [attempts, setAttempts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAttempts();
  }, []);

  const fetchAttempts = async () => {
    const { data } = await supabase
      .from("attempts")
      .select(`*, tests:test_id(title), profiles:student_id(full_name)`)
      .order("started_at", { ascending: false });
    if (data) setAttempts(data);
    setLoading(false);
  };

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto">
      <header className="mb-8 md:mb-12">
        <h1 className="text-2xl md:text-3xl font-light tracking-wide text-[#FDF8F5]">Test Results</h1>
        <p className="text-[#C58359]/70 text-sm tracking-widest uppercase mt-1">Review submissions</p>
      </header>

      {loading ? (
        <div className="flex justify-center py-20">
          <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1.5, repeat: Infinity }} className="text-gray-500 uppercase tracking-widest text-sm">Loading...</motion.div>
        </div>
      ) : attempts.length === 0 ? (
        <div className="glass-panel p-16 flex flex-col items-center justify-center text-center">
          <div className="w-20 h-20 bg-[#1a120e] border border-[#2a1f18] flex items-center justify-center mb-6">
            <BarChart3 className="w-10 h-10 text-[#C58359]/50" />
          </div>
          <h2 className="text-xl font-semibold text-[#FDF8F5] mb-2">No Submissions Yet</h2>
          <p className="text-gray-400 max-w-md">Student submissions will appear here for review and grading.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {attempts.map((a, i) => (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              key={a.id}
              className="glass-panel p-5 md:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div>
                <p className="text-[#FDF8F5] font-medium">{a.profiles?.full_name || "Unknown Student"}</p>
                <p className="text-xs text-gray-500 uppercase tracking-widest mt-1">{a.tests?.title || "Unknown Test"}</p>
              </div>
              <div className="flex items-center gap-6">
                <span className={`text-xs uppercase tracking-widest font-semibold px-3 py-1 ${a.status === 'graded' ? 'bg-[#C58359]/20 text-[#C58359]' : a.status === 'submitted' ? 'bg-[#D8C3A5]/10 text-[#D8C3A5]' : 'bg-gray-500/10 text-gray-500'}`}>
                  {a.status}
                </span>
                {a.total_score !== null && (
                  <span className="text-[#E3B497] font-bold">{a.total_score} pts</span>
                )}
                <span className="text-[10px] text-gray-500">{new Date(a.started_at).toLocaleDateString()}</span>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
