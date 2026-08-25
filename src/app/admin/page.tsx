"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { motion } from "framer-motion";
import { Plus, Clock, Users, MoreHorizontal } from "lucide-react";
import Link from "next/link";

type Test = {
  id: string;
  title: string;
  duration_minutes: number;
  created_at: string;
};

export default function AdminDashboard() {
  const [tests, setTests] = useState<Test[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTests();
  }, []);

  const fetchTests = async () => {
    // In a real app, you'd fetch from Supabase. We'll mock it temporarily until auth works.
    const { data, error } = await supabase
      .from("tests")
      .select("*")
      .order("created_at", { ascending: false });
      
    if (data) setTests(data);
    setLoading(false);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <header className="flex justify-between items-center mb-12">
        <div>
          <h1 className="text-3xl font-light tracking-wide text-[#FDF8F5]">Assessments</h1>
          <p className="text-[#C58359]/70 text-sm tracking-widest uppercase mt-1">Manage all tests</p>
        </div>
        <Link href="/admin/test/new">
          <button className="flex items-center gap-2 bg-[#1a120e] border border-[#C58359]/30 text-[#C58359] px-5 py-2.5 rounded-none text-sm uppercase tracking-widest font-semibold hover:bg-[#C58359] hover:text-[#0d0906] hover:shadow-[0_0_15px_rgba(197,131,89,0.3)] transition-all duration-300">
            <Plus className="w-4 h-4" />
            New Test
          </button>
        </Link>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {loading ? (
          <p className="text-gray-500 uppercase tracking-widest">Loading data...</p>
        ) : tests.length === 0 ? (
          <div className="col-span-full glass-panel p-16 flex flex-col items-center justify-center text-center rounded-none">
            <p className="text-gray-400 max-w-md mb-8">No assessments have been created yet. Initialize your first test to start building the curriculum.</p>
            <Link href="/admin/test/new">
               <button className="bg-[#C58359] text-[#0d0906] px-8 py-3 rounded-none text-sm font-semibold uppercase tracking-widest hover:bg-[#E3B497] hover:shadow-[0_0_20px_rgba(227,180,151,0.4)] transition-all duration-300">
                 Initialize First Test
               </button>
            </Link>
          </div>
        ) : (
          tests.map((test, i) => (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              key={test.id}
              className="glass-panel rounded-none p-6 flex flex-col hover:border-[#C58359]/50 transition-all duration-300 hover:shadow-[0_8px_30px_rgba(197,131,89,0.1)]"
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-medium text-[#FDF8F5]">{test.title}</h3>
                <button 
                  onClick={() => {
                     navigator.clipboard.writeText(`${window.location.origin}/test/${test.id}`);
                     alert("Student Link Copied to Clipboard!");
                  }}
                  title="Copy Student Link"
                  className="text-gray-500 hover:text-[#C58359] transition-colors p-2"
                >
                  <MoreHorizontal className="w-5 h-5" />
                </button>
              </div>
              
              <div className="flex items-center gap-5 text-xs uppercase tracking-widest text-gray-400 mb-8">
                 <div className="flex items-center gap-1.5">
                   <Clock className="w-3.5 h-3.5 text-[#E3B497]" />
                   {test.duration_minutes} MIN
                 </div>
                 <div className="flex items-center gap-1.5">
                   <Users className="w-3.5 h-3.5 text-[#C58359]" />
                   0 ATTEMPTS
                 </div>
              </div>

              <div className="mt-auto pt-5 border-t border-[#2a1f18] flex justify-between items-center">
                <div className="text-[10px] uppercase tracking-widest text-gray-500">
                  CREATED {new Date(test.created_at).toLocaleDateString()}
                </div>
                <Link href={`/admin/test/${test.id}`}>
                  <button className="bg-transparent border border-[#C58359]/30 text-[#C58359] px-4 py-1.5 rounded text-xs font-bold uppercase tracking-widest hover:bg-[#C58359] hover:text-[#0d0906] transition-all duration-300">
                    MANAGE
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
