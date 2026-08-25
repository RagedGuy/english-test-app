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
    <div className="p-8 max-w-5xl mx-auto">
      <header className="flex justify-between items-center mb-12">
        <div className="flex items-center gap-4">
          <Link href="/admin">
            <button className="p-2 hover:bg-[#1E1E1E] transition-colors">
              <ArrowLeft className="w-6 h-6" />
            </button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold uppercase tracking-widest">
              {test ? test.title : "Loading..."}
            </h1>
            <p className="text-gray-500 uppercase tracking-widest text-sm">
              {test ? `${test.duration_minutes} MIN DURATION` : ""}
            </p>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-3 gap-8">
        <div className="col-span-2 space-y-6">
          <div className="flex justify-between items-center border-b border-[#1E1E1E] pb-4">
            <h2 className="text-[#00F0FF] uppercase tracking-widest font-bold">
              Questions ({questions.length})
            </h2>
          </div>
          
          {questions.length === 0 ? (
             <div className="border border-dashed border-[#1E1E1E] p-12 text-center text-gray-500 uppercase tracking-widest">
                No questions added yet.
             </div>
          ) : (
            <div className="space-y-4">
              {questions.map((q, idx) => (
                <div key={q.id} className="bg-black border border-[#1E1E1E] p-4">
                   <span className="text-[#FFCC00] font-bold mr-2">Q{idx + 1}.</span>
                   <span className="uppercase text-sm tracking-widest">{q.type}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="col-span-1 space-y-4">
           <div className="bg-[#0A0A0A] border border-[#1E1E1E] p-6">
             <h3 className="text-sm font-bold uppercase tracking-widest mb-4">Add New Question</h3>
             <div className="space-y-2">
               <button className="w-full text-left p-3 border border-[#1E1E1E] hover:border-[#00F0FF] hover:text-[#00F0FF] transition-colors uppercase tracking-widest text-xs">
                 + Multiple Choice
               </button>
               <button className="w-full text-left p-3 border border-[#1E1E1E] hover:border-[#00F0FF] hover:text-[#00F0FF] transition-colors uppercase tracking-widest text-xs">
                 + Fill in Blanks
               </button>
               <button className="w-full text-left p-3 border border-[#1E1E1E] hover:border-[#00F0FF] hover:text-[#00F0FF] transition-colors uppercase tracking-widest text-xs">
                 + Paragraph Creation
               </button>
               <button className="w-full text-left p-3 border border-[#1E1E1E] hover:border-[#FF3366] hover:text-[#FF3366] transition-colors uppercase tracking-widest text-xs">
                 + Audio Recording
               </button>
             </div>
           </div>
        </div>
      </div>
    </div>
  );
}
