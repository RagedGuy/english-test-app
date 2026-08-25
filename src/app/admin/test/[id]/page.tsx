"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { ArrowLeft, Plus, Save } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function ManageTest() {
  const params = useParams();
  const [test, setTest] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  
  useEffect(() => {
    fetchTestDetails();
  }, [params.id]);

  const fetchTestDetails = async () => {
    if (!params.id) return;
    const { data: testData } = await supabase.from("tests").select("*").eq("id", params.id).single();
    if (testData) setTest(testData);
    
    const { data: qData } = await supabase.from("questions").select("*").eq("test_id", params.id).order("order_index");
    if (qData) setQuestions(qData);
  };

  return (
    <div className="p-8 max-w-5xl mx-auto min-h-screen flex flex-col">
      <header className="flex justify-between items-center mb-12">
        <div className="flex items-center gap-4">
          <Link href="/admin">
            <button className="p-2 rounded-full hover:bg-white/5 transition-colors text-gray-400 hover:text-[#C58359]">
              <ArrowLeft className="w-6 h-6" />
            </button>
          </Link>
          <div>
            <h1 className="text-3xl font-light tracking-wide text-[#FDF8F5]">
              {test ? test.title : "Loading..."}
            </h1>
            <p className="text-[#C58359]/70 uppercase tracking-widest text-sm mt-1">
              {test ? `${test.duration_minutes} MIN DURATION` : ""}
            </p>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 flex-1">
        <div className="col-span-2 space-y-6">
          <div className="flex justify-between items-center border-b border-[#2a1f18] pb-4">
            <h2 className="text-[#C58359] uppercase tracking-widest font-semibold ml-1">
              Questions ({questions.length})
            </h2>
          </div>
          
          {questions.length === 0 ? (
             <div className="glass-panel p-16 text-center text-gray-400 uppercase tracking-widest rounded-xl text-sm">
                No questions have been added yet.
             </div>
          ) : (
            <div className="space-y-4">
              {questions.map((q, idx) => (
                <div key={q.id} className="glass-panel p-5 rounded-lg flex items-center">
                   <span className="text-[#E3B497] font-bold mr-3">Q{idx + 1}.</span>
                   <span className="uppercase text-sm tracking-widest text-[#FDF8F5]">{q.type}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="col-span-1 space-y-4">
           <div className="glass-panel p-6 rounded-xl">
             <h3 className="text-sm font-semibold uppercase tracking-widest mb-6 text-[#FDF8F5]">Add New Question</h3>
             <div className="space-y-3">
               <button className="w-full text-left p-4 rounded-lg bg-[#1a120e] border border-[#2a1f18] hover:border-[#C58359] hover:text-[#C58359] transition-all duration-300 uppercase tracking-widest text-xs font-semibold text-gray-400 shadow-[0_2px_10px_rgba(0,0,0,0.2)] hover:shadow-[0_0_15px_rgba(197,131,89,0.15)]">
                 + Multiple Choice
               </button>
               <button className="w-full text-left p-4 rounded-lg bg-[#1a120e] border border-[#2a1f18] hover:border-[#C58359] hover:text-[#C58359] transition-all duration-300 uppercase tracking-widest text-xs font-semibold text-gray-400 shadow-[0_2px_10px_rgba(0,0,0,0.2)] hover:shadow-[0_0_15px_rgba(197,131,89,0.15)]">
                 + Fill in Blanks
               </button>
               <button className="w-full text-left p-4 rounded-lg bg-[#1a120e] border border-[#2a1f18] hover:border-[#C58359] hover:text-[#C58359] transition-all duration-300 uppercase tracking-widest text-xs font-semibold text-gray-400 shadow-[0_2px_10px_rgba(0,0,0,0.2)] hover:shadow-[0_0_15px_rgba(197,131,89,0.15)]">
                 + Paragraph Creation
               </button>
               <button className="w-full text-left p-4 rounded-lg bg-[#1a120e] border border-[#2a1f18] hover:border-[#D65A5A] hover:text-[#D65A5A] transition-all duration-300 uppercase tracking-widest text-xs font-semibold text-gray-400 shadow-[0_2px_10px_rgba(0,0,0,0.2)] hover:shadow-[0_0_15px_rgba(214,90,90,0.15)]">
                 + Audio Recording
               </button>
             </div>
           </div>
        </div>
      </div>
    </div>
  );
}
