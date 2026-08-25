"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useParams } from "next/navigation";
import { ArrowRight, Clock } from "lucide-react";
import Link from "next/link";

export default function TakeTest() {
  const params = useParams();
  const [test, setTest] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTest();
  }, [params.id]);

  const fetchTest = async () => {
    if (!params.id) return;
    const { data } = await supabase.from("tests").select("*").eq("id", params.id).single();
    if (data) setTest(data);
    setLoading(false);
  };

  if (loading) return <div className="p-8 text-center text-gray-500 uppercase tracking-widest">Loading test...</div>;

  if (!test) return <div className="p-8 text-center text-[#D65A5A] uppercase tracking-widest">Test not found.</div>;

  return (
    <div className="p-8 max-w-4xl mx-auto min-h-screen flex flex-col items-center justify-center">
      <div className="glass-panel p-12 text-center max-w-2xl w-full">
        <h1 className="text-4xl font-light tracking-wide text-[#FDF8F5] mb-4">
          {test.title}
        </h1>
        <p className="text-gray-400 mb-8 max-w-lg mx-auto">
          {test.description || "You are about to begin this assessment. Please ensure you are in a quiet environment and have a stable internet connection."}
        </p>

        <div className="flex items-center justify-center gap-6 text-[#E3B497] uppercase tracking-widest text-sm font-semibold mb-12">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            {test.duration_minutes} Minutes Allowed
          </div>
        </div>

        <button 
           className="bg-[#C58359] text-[#0d0906] px-10 py-4 font-bold uppercase tracking-widest hover:bg-[#E3B497] transition-all duration-300 shadow-[0_0_20px_rgba(197,131,89,0.3)] hover:shadow-[0_0_30px_rgba(227,180,151,0.5)] flex items-center gap-3 mx-auto"
           onClick={() => alert("Test taking interface is currently under construction!")}
        >
          Begin Assessment
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
