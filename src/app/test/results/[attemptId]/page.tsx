"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle, XCircle } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function StudentResults() {
  const params = useParams();
  const router = useRouter();
  
  const [attempt, setAttempt] = useState<any>(null);
  const [test, setTest] = useState<any>(null);
  const [answers, setAnswers] = useState<any[]>([]);
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchResults();
  }, [params.attemptId]);

  const fetchResults = async () => {
    if (!params.attemptId) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push("/test/login");
      return;
    }

    // Fetch the specific attempt
    const { data: attemptData } = await supabase
      .from("attempts")
      .select("*")
      .eq("id", params.attemptId)
      .eq("student_id", user.id)
      .single();

    if (!attemptData) {
      setLoading(false);
      return;
    }
    setAttempt(attemptData);

    // Fetch the test details
    const { data: testData } = await supabase
      .from("tests")
      .select("*")
      .eq("id", attemptData.test_id)
      .single();
    if (testData) setTest(testData);

    // Fetch the questions
    const { data: qData } = await supabase
      .from("questions")
      .select("*")
      .eq("test_id", attemptData.test_id)
      .order("order_index");
    if (qData) setQuestions(qData);

    // Fetch the answers
    const { data: ansData } = await supabase
      .from("answers")
      .select("*")
      .eq("attempt_id", attemptData.id);
    if (ansData) setAnswers(ansData);

    setLoading(false);
  };

  const getAnswerForQuestion = (questionId: string) => {
    return answers.find((a) => a.question_id === questionId);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1.5, repeat: Infinity }} className="text-gray-500 uppercase tracking-widest text-sm">
          Loading results...
        </motion.div>
      </div>
    );
  }

  if (!attempt || !test) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="glass-panel p-12 text-center max-w-md mx-auto">
          <p className="text-[#D65A5A] uppercase tracking-widest mb-4">Results not found or unauthorized</p>
          <Link href="/test">
            <button className="text-[#C58359] uppercase tracking-widest text-sm hover:underline">
              ← Back to Portal
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto min-h-screen">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 md:mb-12">
        <div className="flex items-start gap-4">
          <Link href="/test">
            <button className="p-2 mt-1 hover:bg-white/5 transition-colors text-gray-400 hover:text-[#C58359]">
              <ArrowLeft className="w-6 h-6" />
            </button>
          </Link>
          <div>
            <h1 className="text-2xl md:text-3xl font-light tracking-wide text-[#FDF8F5]">
              {test.title}
            </h1>
            <p className="text-[#C58359]/70 text-sm tracking-widest uppercase mt-1">
              Assessment Results
            </p>
          </div>
        </div>
        
        <div className="glass-panel px-6 py-4 flex flex-col items-end border-[#C58359]/30 border ml-12 md:ml-0">
          <span className="text-[10px] text-gray-400 uppercase tracking-widest font-semibold mb-1">Total Score</span>
          <span className="text-2xl font-bold text-[#E3B497]">{attempt.total_score} pts</span>
        </div>
      </header>

      <div className="space-y-6">
        {questions.map((q, idx) => {
          const ans = getAnswerForQuestion(q.id);
          const hasScore = ans && ans.score !== null;
          const isMcqCorrect = q.type === "mcq" && ans?.student_answer === q.content.correctAnswer;
          
          return (
            <motion.div 
              key={q.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="glass-panel p-6 md:p-8 border-[#2a1f18]"
            >
              <div className="flex items-start justify-between gap-4 mb-6">
                <div className="flex items-start gap-4">
                  <span className="text-[#C58359] font-bold text-xl shrink-0">Q{idx + 1}.</span>
                  <div>
                    <span className="text-[10px] uppercase tracking-widest text-[#C58359]/70 font-semibold block mb-2">
                      {q.type.replace(/_/g, " ")}
                    </span>
                    <p className="text-[#FDF8F5] text-lg font-light leading-relaxed">
                      {q.type === "mcq" && q.content.prompt}
                      {q.type === "fill_in_blanks" && q.content.textWithBlanks}
                      {q.type === "paragraph" && q.content.topic}
                      {q.type === "audio" && q.content.script}
                      {q.type === "general" && q.content.prompt}
                    </p>
                  </div>
                </div>
                {hasScore && (
                  <div className="shrink-0 bg-[#1a120e] px-3 py-1.5 border border-[#2a1f18] text-[#E3B497] font-bold text-sm">
                    {ans.score} pts
                  </div>
                )}
              </div>

              {/* Student's Answer */}
              <div className="ml-10 md:ml-12 space-y-4">
                <div className="bg-[#0a0807]/60 border border-[#2a1f18] p-4 text-[#FDF8F5]">
                  <span className="text-[10px] uppercase tracking-widest text-gray-500 font-semibold block mb-2">Your Answer</span>
                  <div className="font-light whitespace-pre-wrap">
                    {ans?.student_answer || <span className="text-gray-600 italic">No answer provided</span>}
                  </div>
                </div>

                {/* Display Correct Answer for MCQ */}
                {q.type === "mcq" && (
                  <div className={`flex items-center gap-2 text-sm ${isMcqCorrect ? "text-[#C58359]" : "text-[#D65A5A]"}`}>
                    {isMcqCorrect ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                    <span>
                      {isMcqCorrect ? "Correct!" : (
                        <>Incorrect. The right answer was <strong className="text-[#E3B497]">{q.content.correctAnswer}</strong></>
                      )}
                    </span>
                  </div>
                )}

                {/* Admin Feedback */}
                {ans?.feedback && (
                  <div className="mt-4 bg-[#C58359]/10 border-l-2 border-[#C58359] p-4">
                    <span className="text-[10px] uppercase tracking-widest text-[#C58359] font-semibold block mb-1">Teacher Feedback</span>
                    <p className="text-[#E3B497] text-sm italic font-light">{ans.feedback}</p>
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
