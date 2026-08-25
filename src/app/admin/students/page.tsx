"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { motion } from "framer-motion";
import { Users } from "lucide-react";

export default function StudentsPage() {
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    const { data } = await supabase.from("profiles").select("*").eq("role", "student").order("created_at", { ascending: false });
    if (data) setStudents(data);
    setLoading(false);
  };

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto">
      <header className="mb-8 md:mb-12">
        <h1 className="text-2xl md:text-3xl font-light tracking-wide text-[#FDF8F5]">Students</h1>
        <p className="text-[#C58359]/70 text-sm tracking-widest uppercase mt-1">Registered test takers</p>
      </header>

      {loading ? (
        <div className="flex justify-center py-20">
          <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1.5, repeat: Infinity }} className="text-gray-500 uppercase tracking-widest text-sm">Loading...</motion.div>
        </div>
      ) : students.length === 0 ? (
        <div className="glass-panel p-16 flex flex-col items-center justify-center text-center">
          <div className="w-20 h-20 bg-[#1a120e] border border-[#2a1f18] flex items-center justify-center mb-6">
            <Users className="w-10 h-10 text-[#C58359]/50" />
          </div>
          <h2 className="text-xl font-semibold text-[#FDF8F5] mb-2">No Students Yet</h2>
          <p className="text-gray-400 max-w-md">Students will appear here once they register.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {students.map((s, i) => (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              key={s.id}
              className="glass-panel p-5 flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-[#1a120e] border border-[#2a1f18] flex items-center justify-center text-[#C58359] font-bold text-sm">
                  {(s.full_name || "?")[0].toUpperCase()}
                </div>
                <div>
                  <p className="text-[#FDF8F5] font-medium">{s.full_name || "Unnamed"}</p>
                  <p className="text-xs text-gray-500 uppercase tracking-widest mt-0.5">Joined {new Date(s.created_at).toLocaleDateString()}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
