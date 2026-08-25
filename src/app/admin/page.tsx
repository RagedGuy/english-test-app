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
    <div className="p-8">
      <header className="flex justify-between items-center mb-12">
        <h1 className="text-3xl font-bold uppercase tracking-widest">Tests</h1>
        <Link href="/admin/test/new">
          <button className="flex items-center gap-2 border border-[#00F0FF] text-[#00F0FF] px-4 py-2 text-sm uppercase tracking-widest hover:bg-[#00F0FF]/10 transition-colors">
            <Plus className="w-4 h-4" />
            New Test
          </button>
        </Link>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {loading ? (
          <p className="text-gray-500 uppercase tracking-widest">Loading data...</p>
        ) : tests.length === 0 ? (
          <div className="col-span-full border border-dashed border-[#1E1E1E] p-12 text-center">
            <p className="text-gray-500 uppercase tracking-widest mb-4">No tests found in the system.</p>
            <Link href="/admin/test/new">
               <button className="bg-[#1E1E1E] text-white px-6 py-3 text-sm uppercase tracking-widest hover:bg-[#2A2A2A] transition-colors">
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
              className="bg-black border border-[#1E1E1E] p-6 flex flex-col hover:border-[#00F0FF]/50 transition-colors"
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-bold text-white">{test.title}</h3>
                <button className="text-gray-500 hover:text-white">
                  <MoreHorizontal className="w-5 h-5" />
                </button>
              </div>
              
              <div className="flex items-center gap-4 text-xs uppercase tracking-widest text-gray-400 mb-6">
                 <div className="flex items-center gap-1">
                   <Clock className="w-3 h-3 text-[#FFCC00]" />
                   {test.duration_minutes} MIN
                 </div>
                 <div className="flex items-center gap-1">
                   <Users className="w-3 h-3 text-[#00F0FF]" />
                   0 ATTEMPTS
                 </div>
              </div>

              <div className="mt-auto pt-4 border-t border-[#1E1E1E] flex justify-between items-center">
                <div className="text-[10px] uppercase tracking-widest text-gray-500">
                  CREATED {new Date(test.created_at).toLocaleDateString()}
                </div>
                <Link href={`/admin/test/${test.id}`}>
                  <button className="bg-[#00F0FF] text-black px-3 py-1 text-xs font-bold uppercase tracking-widest hover:bg-white transition-colors">
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
