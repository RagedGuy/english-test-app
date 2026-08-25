"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { ArrowLeft, Save, X, Plus } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { useToast } from "@/components/ui/toast";

export type QuestionType = 'mcq' | 'fill_in_blanks' | 'paragraph' | 'audio' | 'general';

export default function ManageTest() {
  const params = useParams();
  const { toast } = useToast();
  const [test, setTest] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  
  const [editingType, setEditingType] = useState<QuestionType | null>(null);
  const [saving, setSaving] = useState(false);

  // Shared Editor State
  const [prompt, setPrompt] = useState("");
  const [options, setOptions] = useState(["", "", "", ""]);
  const [correctOption, setCorrectOption] = useState(0);
  
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

  const resetForm = () => {
    setPrompt("");
    setOptions(["", "", "", ""]);
    setCorrectOption(0);
    setEditingType(null);
  };

  const handleSaveQuestion = async () => {
    setSaving(true);
    let content = {};
    if (editingType === 'mcq') {
       content = { prompt, options, correctAnswer: options[correctOption] };
    } else if (editingType === 'fill_in_blanks') {
       // Parse blanks from prompt e.g. "The capital of France is [Paris]."
       // Extract things in brackets
       const answers = (prompt.match(/\[(.*?)\]/g) || []).map(s => s.slice(1, -1));
       content = { textWithBlanks: prompt, answers };
    } else if (editingType === 'paragraph') {
       content = { topic: prompt };
    } else if (editingType === 'audio') {
       content = { script: prompt };
    } else if (editingType === 'general') {
       content = { prompt };
    }

    const { data, error } = await supabase.from('questions').insert([{
      test_id: params.id,
      type: editingType,
      content,
      order_index: questions.length
    }]).select();

    if (error) {
      toast(`Error saving: ${error.message}`, "error");
      console.error(error);
    } else if (data) {
       toast("Question added successfully!", "success");
       setQuestions([...questions, data[0]]);
       resetForm();
    }
    setSaving(false);
  };

  return (
    <div className="p-8 max-w-6xl mx-auto min-h-screen flex flex-col">
      <header className="flex justify-between items-center mb-12">
        <div className="flex items-center gap-4">
          <Link href="/admin">
            <button className="p-2 hover:bg-white/5 transition-colors text-gray-400 hover:text-[#C58359]">
              <ArrowLeft className="w-6 h-6" />
            </button>
          </Link>
          <div>
            <h1 className="text-3xl font-light tracking-wide text-[#FDF8F5]">
              {test ? test.title : "Loading..."}
            </h1>
            <p className="text-[#C58359]/70 uppercase tracking-widest text-sm mt-1">
              {test ? `${Math.floor(test.duration_minutes / 60) > 0 ? `${Math.floor(test.duration_minutes / 60)} Hr ` : ''}${test.duration_minutes % 60 > 0 ? `${test.duration_minutes % 60} Min` : ''} DURATION` : ""}
            </p>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 flex-1 items-start">
        <div className="col-span-1 lg:col-span-2 space-y-6">
          <div className="flex justify-between items-center border-b border-[#2a1f18] pb-4">
            <h2 className="text-[#C58359] uppercase tracking-widest font-semibold ml-1">
              Questions ({questions.length})
            </h2>
          </div>
          
          {questions.length === 0 ? (
             <div className="glass-panel p-16 text-center text-gray-400 uppercase tracking-widest text-sm">
                No questions have been added yet.
             </div>
          ) : (
            <div className="space-y-4">
              {questions.map((q, idx) => (
                <div key={q.id} className="glass-panel p-6 flex flex-col gap-4 group hover:border-[#C58359]/50 transition-colors">
                   <div className="flex items-start gap-4">
                     <span className="text-[#E3B497] font-bold text-lg">Q{idx + 1}.</span>
                     <div className="flex-1">
                       <span className="uppercase text-xs font-semibold tracking-widest text-[#C58359] mb-2 block">
                         {q.type.replace(/_/g, ' ')}
                       </span>
                       <div className="text-[#FDF8F5] font-light leading-relaxed whitespace-pre-wrap">
                         {q.type === 'mcq' && q.content.prompt}
                         {q.type === 'fill_in_blanks' && q.content.textWithBlanks}
                         {q.type === 'paragraph' && q.content.topic}
                         {q.type === 'audio' && q.content.script}
                         {q.type === 'general' && q.content.prompt}
                       </div>
                     </div>
                   </div>
                   {q.type === 'mcq' && (
                     <div className="grid grid-cols-2 gap-3 pl-10">
                       {q.content.options.map((opt: string, i: number) => (
                         <div key={i} className={`p-3 text-sm ${opt === q.content.correctAnswer ? 'bg-[#C58359]/20 border border-[#C58359] text-[#E3B497]' : 'bg-[#1a120e] border border-[#2a1f18] text-gray-400'}`}>
                           {opt}
                         </div>
                       ))}
                     </div>
                   )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="col-span-1">
          {!editingType ? (
             <div className="glass-panel p-6 sticky top-8">
               <h3 className="text-sm font-semibold uppercase tracking-widest mb-6 text-[#FDF8F5]">Add New Question</h3>
               <div className="space-y-3">
                 <button onClick={() => setEditingType('mcq')} className="w-full text-left p-4 bg-[#1a120e] border border-[#2a1f18] hover:border-[#C58359] hover:text-[#C58359] transition-all duration-300 uppercase tracking-widest text-xs font-semibold text-gray-400 shadow-[0_2px_10px_rgba(0,0,0,0.2)] hover:shadow-[0_0_15px_rgba(197,131,89,0.15)]">
                   + Multiple Choice
                 </button>
                 <button onClick={() => setEditingType('fill_in_blanks')} className="w-full text-left p-4 bg-[#1a120e] border border-[#2a1f18] hover:border-[#C58359] hover:text-[#C58359] transition-all duration-300 uppercase tracking-widest text-xs font-semibold text-gray-400 shadow-[0_2px_10px_rgba(0,0,0,0.2)] hover:shadow-[0_0_15px_rgba(197,131,89,0.15)]">
                   + Fill in Blanks
                 </button>
                 <button onClick={() => setEditingType('paragraph')} className="w-full text-left p-4 bg-[#1a120e] border border-[#2a1f18] hover:border-[#C58359] hover:text-[#C58359] transition-all duration-300 uppercase tracking-widest text-xs font-semibold text-gray-400 shadow-[0_2px_10px_rgba(0,0,0,0.2)] hover:shadow-[0_0_15px_rgba(197,131,89,0.15)]">
                   + Paragraph Creation
                 </button>
                 <button onClick={() => setEditingType('audio')} className="w-full text-left p-4 bg-[#1a120e] border border-[#2a1f18] hover:border-[#D65A5A] hover:text-[#D65A5A] transition-all duration-300 uppercase tracking-widest text-xs font-semibold text-gray-400 shadow-[0_2px_10px_rgba(0,0,0,0.2)] hover:shadow-[0_0_15px_rgba(214,90,90,0.15)]">
                   + Audio Recording
                 </button>
                 <button onClick={() => setEditingType('general')} className="w-full text-left p-4 bg-[#1a120e] border border-[#2a1f18] hover:border-[#C58359] hover:text-[#C58359] transition-all duration-300 uppercase tracking-widest text-xs font-semibold text-gray-400 shadow-[0_2px_10px_rgba(0,0,0,0.2)] hover:shadow-[0_0_15px_rgba(197,131,89,0.15)]">
                   + General (Short Answer)
                 </button>
               </div>
             </div>
          ) : (
             <motion.div 
               initial={{ opacity: 0, x: 20 }}
               animate={{ opacity: 1, x: 0 }}
               className="glass-panel p-6 sticky top-8"
             >
               <div className="flex justify-between items-center mb-6">
                 <h3 className="text-sm font-semibold uppercase tracking-widest text-[#FDF8F5]">
                   Configure {editingType.replace(/_/g, ' ')}
                 </h3>
                 <button onClick={resetForm} className="text-gray-500 hover:text-[#D65A5A]">
                   <X className="w-5 h-5" />
                 </button>
               </div>

               <div className="space-y-6">
                 <div className="space-y-2">
                   <label className="text-[10px] text-[#C58359] uppercase tracking-widest font-semibold ml-1">
                     {editingType === 'mcq' && "Question Prompt"}
                     {editingType === 'fill_in_blanks' && "Text (Use [brackets] for blanks)"}
                     {editingType === 'paragraph' && "Topic / Prompt"}
                     {editingType === 'audio' && "Script to Read"}
                     {editingType === 'general' && "Question Prompt"}
                   </label>
                   <textarea
                     value={prompt}
                     onChange={e => setPrompt(e.target.value)}
                     className="w-full bg-[#0A0A0A] border border-[#2a1f18] text-white p-4 font-light focus:outline-none focus:border-[#D8C3A5] min-h-[120px] resize-none"
                     placeholder={editingType === 'fill_in_blanks' ? "The capital of France is [Paris]." : "Enter question..."}
                   />
                 </div>

                 {editingType === 'mcq' && (
                   <div className="space-y-4">
                     <label className="text-[10px] text-[#C58359] uppercase tracking-widest font-semibold ml-1">
                       Options (Select Correct)
                     </label>
                     {options.map((opt, i) => (
                       <div key={i} className="flex items-center gap-3">
                         <button 
                           onClick={() => setCorrectOption(i)}
                           className={`w-5 h-5 shrink-0 flex items-center justify-center border transition-colors ${correctOption === i ? 'bg-[#C58359] border-[#C58359]' : 'border-[#2a1f18]'}`}
                         >
                           {correctOption === i && <div className="w-2 h-2 bg-[#050505]" />}
                         </button>
                         <input
                           type="text"
                           value={opt}
                           onChange={e => {
                             const newOpts = [...options];
                             newOpts[i] = e.target.value;
                             setOptions(newOpts);
                           }}
                           className="w-full bg-[#0A0A0A] border border-[#2a1f18] text-white p-3 text-sm focus:outline-none focus:border-[#D8C3A5]"
                           placeholder={`Option ${i + 1}`}
                         />
                       </div>
                     ))}
                   </div>
                 )}

                 <button
                   onClick={handleSaveQuestion}
                   disabled={saving || !prompt.trim()}
                   className="w-full bg-[#D8C3A5] text-[#050505] p-4 font-semibold uppercase tracking-widest hover:bg-[#F2E3C6] transition-all duration-300 disabled:opacity-50 shadow-[0_0_15px_rgba(216,195,165,0.3)] hover:shadow-[0_0_25px_rgba(242,227,198,0.5)] flex justify-center items-center gap-2"
                 >
                   {saving ? "Saving..." : "Save Question"}
                   {!saving && <Save className="w-4 h-4" />}
                 </button>
               </div>
             </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
