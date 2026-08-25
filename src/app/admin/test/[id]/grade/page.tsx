"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useParams } from "next/navigation";
import { ArrowLeft, Save, CheckCircle, Plus, Minus } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useToast } from "@/components/ui/toast";

export default function GradeTest() {
  const params = useParams();
  const { toast } = useToast();

  const [test, setTest] = useState<any>(null);
  const [attempts, setAttempts] = useState<any[]>([]);
  const [selectedAttempt, setSelectedAttempt] = useState<any>(null);
  const [answers, setAnswers] = useState<any[]>([]);
  const [questions, setQuestions] = useState<any[]>([]);
  const [scores, setScores] = useState<Record<string, number>>({});
  const [feedback, setFeedback] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [params.id]);

  const fetchData = async () => {
    if (!params.id) return;

    const { data: testData } = await supabase.from("tests").select("*").eq("id", params.id).single();
    if (testData) setTest(testData);

    const { data: qData } = await supabase.from("questions").select("*").eq("test_id", params.id).order("order_index");
    if (qData) setQuestions(qData);

    const { data: attemptData } = await supabase
      .from("attempts")
      .select(`*, profiles:student_id(full_name)`)
      .eq("test_id", params.id)
      .order("started_at", { ascending: false });
    if (attemptData) setAttempts(attemptData);

    setLoading(false);
  };

  const loadAttemptAnswers = async (attempt: any) => {
    setSelectedAttempt(attempt);
    const { data } = await supabase
      .from("answers")
      .select("*")
      .eq("attempt_id", attempt.id);
    if (data) {
      setAnswers(data);
      const existingScores: Record<string, number> = {};
      const existingFeedback: Record<string, string> = {};
      data.forEach((a: any) => {
        if (a.score !== null) existingScores[a.id] = a.score;
        if (a.feedback) existingFeedback[a.id] = a.feedback;
      });
      setScores(existingScores);
      setFeedback(existingFeedback);
    }
  };

  const handleSaveGrades = async () => {
    setSaving(true);

    for (const answer of answers) {
      const updates: any = {};
      if (scores[answer.id] !== undefined) updates.score = scores[answer.id];
      if (feedback[answer.id] !== undefined) updates.feedback = feedback[answer.id];

      if (Object.keys(updates).length > 0) {
        await supabase.from("answers").update(updates).eq("id", answer.id);
      }
    }

    // Calculate total score
    const totalScore = Object.values(scores).reduce((sum, s) => sum + (s || 0), 0);

    await supabase
      .from("attempts")
      .update({ status: "graded", total_score: totalScore })
      .eq("id", selectedAttempt.id);

    toast("Grades saved successfully!", "success");

    // Refresh attempts
    const { data: attemptData } = await supabase
      .from("attempts")
      .select(`*, profiles:student_id(full_name)`)
      .eq("test_id", params.id)
      .order("started_at", { ascending: false });
    if (attemptData) setAttempts(attemptData);

    setSaving(false);
  };

  const getQuestionForAnswer = (questionId: string) => {
    return questions.find((q) => q.id === questionId);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1.5, repeat: Infinity }} className="text-gray-500 uppercase tracking-widest text-sm">
          Loading...
        </motion.div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto min-h-screen">
      <header className="flex items-center gap-4 mb-8 md:mb-12">
        <Link href="/admin">
          <button className="p-2 hover:bg-white/5 transition-colors text-gray-400 hover:text-[#C58359]">
            <ArrowLeft className="w-6 h-6" />
          </button>
        </Link>
        <div>
          <h1 className="text-2xl md:text-3xl font-light tracking-wide text-[#FDF8F5]">
            Grade: {test?.title}
          </h1>
          <p className="text-[#C58359]/70 text-sm tracking-widest uppercase mt-1">
            {attempts.length} submission{attempts.length !== 1 ? "s" : ""}
          </p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Attempts List */}
        <div className="lg:col-span-1 space-y-3">
          <h2 className="text-xs text-[#C58359] uppercase tracking-widest font-semibold mb-4 ml-1">
            Submissions
          </h2>
          {attempts.length === 0 ? (
            <div className="glass-panel p-8 text-center text-gray-500 text-sm uppercase tracking-widest">
              No submissions yet
            </div>
          ) : (
            attempts.map((a) => (
              <motion.button
                key={a.id}
                whileTap={{ scale: 0.98 }}
                onClick={() => loadAttemptAnswers(a)}
                className={`w-full text-left glass-panel p-4 transition-all duration-200 ${
                  selectedAttempt?.id === a.id
                    ? "border-[#C58359] shadow-[0_0_15px_rgba(197,131,89,0.15)]"
                    : "hover:border-[#C58359]/30"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[#FDF8F5] font-medium text-sm">
                      {a.profiles?.full_name || "Unknown"}
                    </p>
                    <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-1">
                      {new Date(a.started_at).toLocaleString()}
                    </p>
                  </div>
                  <span className={`text-[10px] uppercase tracking-widest font-semibold px-2 py-1 ${
                    a.status === "graded"
                      ? "bg-[#C58359]/20 text-[#C58359]"
                      : "bg-[#D8C3A5]/10 text-[#D8C3A5]"
                  }`}>
                    {a.status}
                    {a.total_score !== null && ` · ${a.total_score}pts`}
                  </span>
                </div>
              </motion.button>
            ))
          )}
        </div>

        {/* Grading Panel */}
        <div className="lg:col-span-2">
          {!selectedAttempt ? (
            <div className="glass-panel p-16 text-center text-gray-500 text-sm uppercase tracking-widest">
              Select a submission to review and grade
            </div>
          ) : (
            <motion.div
              key={selectedAttempt.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-xs text-[#C58359] uppercase tracking-widest font-semibold ml-1">
                  Answers by {selectedAttempt.profiles?.full_name || "Student"}
                </h2>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSaveGrades}
                  disabled={saving}
                  className="flex items-center gap-2 bg-[#C58359] text-[#050505] px-6 py-2.5 font-semibold uppercase tracking-widest text-xs hover:bg-[#E3B497] transition-all duration-300 disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Save Grades"}
                  {!saving && <Save className="w-3.5 h-3.5" />}
                </motion.button>
              </div>

              {answers.map((answer, idx) => {
                const q = getQuestionForAnswer(answer.question_id);
                if (!q) return null;

                return (
                  <div key={answer.id} className="glass-panel p-5 md:p-6 space-y-4">
                    <div className="flex items-start gap-3">
                      <span className="text-[#C58359] font-bold text-lg shrink-0">Q{idx + 1}.</span>
                      <div className="flex-1">
                        <span className="text-[10px] uppercase tracking-widest text-[#C58359]/70 font-semibold block mb-1">
                          {q.type.replace(/_/g, " ")}
                        </span>
                        <p className="text-[#FDF8F5] font-light">
                          {q.type === "mcq" && q.content.prompt}
                          {q.type === "fill_in_blanks" && q.content.textWithBlanks}
                          {q.type === "paragraph" && q.content.topic}
                          {q.type === "audio" && q.content.script}
                          {q.type === "general" && q.content.prompt}
                        </p>
                      </div>
                    </div>

                    {/* Student's answer */}
                    <div className="ml-8 md:ml-10 space-y-3">
                      <div>
                        <span className="text-[10px] uppercase tracking-widest text-gray-500 font-semibold block mb-1">
                          Student Answer
                        </span>
                        <div className="bg-[#0a0807]/60 border border-[#2a1f18] p-4 text-[#FDF8F5] text-sm font-light whitespace-pre-wrap">
                          {q.type === "audio" && answer.student_answer && answer.student_answer.startsWith("http") ? (
                            <audio controls src={answer.student_answer} className="w-full max-w-md h-10" />
                          ) : (
                            answer.student_answer || <span className="text-gray-600 italic">No answer provided</span>
                          )}
                        </div>
                      </div>

                      {/* Correct answer for MCQ */}
                      {q.type === "mcq" && (
                        <div className="flex items-center gap-2">
                          <CheckCircle className={`w-4 h-4 ${answer.student_answer === q.content.correctAnswer ? "text-[#C58359]" : "text-[#D65A5A]"}`} />
                          <span className="text-xs text-gray-400">
                            Correct: <strong className="text-[#E3B497]">{q.content.correctAnswer}</strong>
                          </span>
                        </div>
                      )}

                      {/* Score input */}
                      <div className="flex flex-col sm:flex-row gap-3">
                        <div className="flex-shrink-0">
                          <label className="text-[10px] uppercase tracking-widest text-[#D8C3A5] font-semibold block mb-1">
                            Score
                          </label>
                          <div className="flex items-center border border-[#2a1f18] bg-[#0a0807]">
                            <button
                              type="button"
                              onClick={() => {
                                const current = scores[answer.id] ?? 0;
                                setScores({ ...scores, [answer.id]: Math.max(0, current - 1) });
                              }}
                              className="px-2.5 py-2 text-gray-400 hover:text-[#C58359] hover:bg-[#1a120e] transition-colors border-r border-[#2a1f18] flex items-center justify-center select-none"
                              aria-label="Decrease score"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <input
                              type="number"
                              min={0}
                              value={scores[answer.id] ?? ""}
                              onChange={(e) => setScores({ ...scores, [answer.id]: parseInt(e.target.value) || 0 })}
                              className="w-14 bg-transparent text-white p-2 text-center focus:outline-none focus:bg-[#1a120e] text-sm [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none [-moz-appearance:textfield]"
                              placeholder="0"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                const current = scores[answer.id] ?? 0;
                                setScores({ ...scores, [answer.id]: current + 1 });
                              }}
                              className="px-2.5 py-2 text-gray-400 hover:text-[#C58359] hover:bg-[#1a120e] transition-colors border-l border-[#2a1f18] flex items-center justify-center select-none"
                              aria-label="Increase score"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                        <div className="flex-1">
                          <label className="text-[10px] uppercase tracking-widest text-[#D8C3A5] font-semibold block mb-1">
                            Feedback (Optional)
                          </label>
                          <input
                            type="text"
                            value={feedback[answer.id] ?? ""}
                            onChange={(e) => setFeedback({ ...feedback, [answer.id]: e.target.value })}
                            className="w-full bg-[#0a0807] border border-[#2a1f18] text-white p-2 focus:outline-none focus:border-[#C58359] text-sm font-light"
                            placeholder="Good job, but..."
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
