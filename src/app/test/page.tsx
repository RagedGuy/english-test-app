"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Clock, BookOpen, LogOut, FileText, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/toast";

export default function StudentPortal() {
  const [tests, setTests] = useState<any[]>([]);
  const [attempts, setAttempts] = useState<Record<string, any[]>>({});
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    fetchTestsAndAttempts();
  }, []);

  const fetchTestsAndAttempts = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Fetch tests
    const { data: testData } = await supabase.from("tests").select("*").order("created_at", { ascending: false });
    if (testData) setTests(testData);

    // Fetch attempts for this user
    const { data: attemptData } = await supabase
      .from("attempts")
      .select("*")
      .eq("student_id", user.id)
      .order("started_at", { ascending: true }); // true so attempt 1 is first

    if (attemptData) {
      const grouped: Record<string, any[]> = {};
      attemptData.forEach((a) => {
        if (!grouped[a.test_id]) grouped[a.test_id] = [];
        grouped[a.test_id].push(a);
      });
      setAttempts(grouped);
    }
    
    setLoading(false);
  };

  const deleteAttempt = async (attemptId: string, testId: string) => {
    const { error } = await supabase.from("attempts").delete().eq("id", attemptId);
    if (error) {
      toast("Failed to delete: " + error.message, "error");
      return;
    }
    toast("Attempt deleted", "success");
    // Update local state
    setAttempts((prev) => {
      const updated = { ...prev };
      if (updated[testId]) {
        updated[testId] = updated[testId].filter((a) => a.id !== attemptId);
        if (updated[testId].length === 0) delete updated[testId];
      }
      return updated;
    });
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
          <p className="text-[#C58359]/70 text-sm tracking-widest uppercase mt-2">Select a test to begin or view your results</p>
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
          tests.map((test, i) => {
            const testAttempts = attempts[test.id] || [];
            
            return (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08, type: "spring", stiffness: 300, damping: 30 }}
                key={test.id}
                className="glass-panel p-6 md:p-8 flex flex-col hover:border-[#C58359]/50 transition-all duration-300 group"
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl md:text-2xl font-medium text-[#FDF8F5]">{test.title}</h3>
                </div>
                
                {test.description && <p className="text-gray-400 text-sm mb-6 line-clamp-2">{test.description}</p>}
                
                <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-[#E3B497] mb-6">
                  <Clock className="w-4 h-4" />{test.duration_minutes} Minutes
                </div>

                {/* Attempt History */}
                {testAttempts.length > 0 && (
                  <div className="mb-6 space-y-2 border-t border-[#2a1f18] pt-4">
                    <h4 className="text-[10px] text-gray-500 uppercase tracking-widest font-semibold mb-3">Your History</h4>
                    {testAttempts.map((attempt, index) => (
                      <div key={attempt.id} className="flex items-center justify-between bg-[#1a120e] p-3 border border-[#2a1f18]">
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-semibold text-gray-400">Attempt {index + 1}</span>
                          <span className={`text-[10px] uppercase tracking-widest font-bold px-2 py-0.5 ${
                            attempt.status === 'graded' ? 'bg-[#C58359]/20 text-[#C58359]' : 
                            attempt.status === 'in_progress' ? 'bg-[#D8C3A5]/10 text-[#D8C3A5]' : 'bg-[#D8C3A5]/10 text-[#D8C3A5]'
                          }`}>
                            {attempt.status === 'graded' ? `Score: ${attempt.total_score}pts` : 
                             attempt.status === 'in_progress' ? 'In Progress' : 'Rating in progress'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          {attempt.status === 'graded' && (
                            <Link href={`/test/results/${attempt.id}`}>
                              <button className="text-[10px] uppercase tracking-widest text-[#C58359] hover:text-[#E3B497] font-bold flex items-center gap-1">
                                View <ArrowRight className="w-3 h-3" />
                              </button>
                            </Link>
                          )}
                          <motion.button 
                            whileTap={{ scale: 0.9 }} 
                            onClick={() => deleteAttempt(attempt.id, test.id)} 
                            className="p-1.5 text-gray-600 hover:text-[#D65A5A] hover:bg-[#D65A5A]/10 transition-all duration-200"
                            title="Delete attempt"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </motion.button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="mt-auto pt-4 border-t border-[#2a1f18]">
                  <Link href={`/test/${test.id}`}>
                    <motion.button whileTap={{ scale: 0.95 }} className="w-full flex items-center justify-center gap-3 bg-transparent border border-[#C58359]/30 text-[#C58359] p-4 font-semibold uppercase tracking-widest hover:bg-[#C58359] hover:text-[#050505] transition-all duration-300">
                      {testAttempts.length > 0 ? (testAttempts[testAttempts.length - 1].status === 'in_progress' ? "Resume Test" : "Take Test Again") : "Start Test"} <ArrowRight className="w-4 h-4" />
                    </motion.button>
                  </Link>
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}
