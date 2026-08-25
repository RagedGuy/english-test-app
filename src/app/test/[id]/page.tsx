"use client";

import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { useParams, useRouter } from "next/navigation";
import { ArrowRight, ArrowLeft, Clock, Send, Mic, Square, CheckCircle, Save } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/components/ui/toast";

export default function TakeTest() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();

  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [existingAnswerIds, setExistingAnswerIds] = useState<Record<string, string>>({});
  const [test, setTest] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [started, setStarted] = useState(false);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  
  const [audioBlobs, setAudioBlobs] = useState<Record<string, Blob>>({});
  const [timeLeft, setTimeLeft] = useState(0);

  const [recording, setRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    fetchTest();
  }, [params.id]);

  useEffect(() => {
    if (!started || submitted || timeLeft <= 0) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) { clearInterval(interval); handleSubmit(true); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [started, submitted]);

  const fetchTest = async () => {
    if (!params.id) return;
    const { data: testData } = await supabase.from("tests").select("*").eq("id", params.id).single();
    if (testData) { setTest(testData); setTimeLeft(testData.duration_minutes * 60); }
    const { data: qData } = await supabase.from("questions").select("*").eq("test_id", params.id).order("order_index");
    if (qData) setQuestions(qData);
    
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: attemptData } = await supabase
        .from("attempts")
        .select("*, answers(*)")
        .eq("test_id", params.id)
        .eq("student_id", user.id)
        .eq("status", "in_progress")
        .order("created_at", { ascending: false })
        .limit(1)
        .single();
        
      if (attemptData) {
        setAttemptId(attemptData.id);
        const existingAnswers = attemptData.answers || [];
        const answersObj: Record<string, string> = {};
        const answerIdsObj: Record<string, string> = {};
        existingAnswers.forEach((ans: any) => {
          answersObj[ans.question_id] = ans.student_answer;
          answerIdsObj[ans.question_id] = ans.id;
        });
        setAnswers(answersObj);
        setExistingAnswerIds(answerIdsObj);
        setStarted(true); // Skip intro screen, go straight to the test
      }
    }
    
    setLoading(false);
  };

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h > 0 ? `${h}:` : ""}${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const setAnswer = (questionId: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];
      mediaRecorder.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        const q = questions[currentQ];
        setAnswer(q.id, "audio_recorded");
        setAudioBlobs((prev) => ({ ...prev, [q.id]: blob }));
        stream.getTracks().forEach((t) => t.stop());
      };
      mediaRecorder.start();
      setRecording(true);
    } catch { toast("Microphone access denied", "error"); }
  };

  const stopRecording = () => { mediaRecorderRef.current?.stop(); setRecording(false); };

  const handleSubmit = async (isFinal: boolean = true) => {
    setSubmitting(true);
    toast(isFinal ? "Submitting your answers..." : "Saving progress...", "info");

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { toast("You must be logged in", "error"); setSubmitting(false); return; }

    let currentAttemptId = attemptId;
    if (!currentAttemptId) {
      // Create attempt
      const { data: attempt, error: attemptErr } = await supabase.from("attempts").insert([{
        test_id: params.id,
        student_id: user.id,
        status: isFinal ? "submitted" : "in_progress",
        completed_at: isFinal ? new Date().toISOString() : null,
      }]).select().single();

      if (attemptErr || !attempt) {
        toast("Failed to save: " + (attemptErr?.message || "Unknown error"), "error");
        setSubmitting(false);
        return;
      }
      currentAttemptId = attempt.id;
      setAttemptId(currentAttemptId);
    } else {
      // Update attempt
      const { error: updateErr } = await supabase.from("attempts").update({
        status: isFinal ? "submitted" : "in_progress",
        completed_at: isFinal ? new Date().toISOString() : null,
      }).eq("id", currentAttemptId);
      
      if (updateErr) {
        toast("Failed to update attempt: " + updateErr.message, "error");
        setSubmitting(false);
        return;
      }
    }

    // Upload audio blobs
    const finalAnswers = { ...answers };
    for (const [qId, blob] of Object.entries(audioBlobs)) {
      const fileName = `${currentAttemptId}/${qId}.webm`;
      const { error: uploadError } = await supabase.storage.from('audio_recordings').upload(fileName, blob, {
        contentType: 'audio/webm',
        upsert: true
      });
      if (!uploadError) {
        const { data: { publicUrl } } = supabase.storage.from('audio_recordings').getPublicUrl(fileName);
        finalAnswers[qId] = publicUrl;
      }
    }

    // Save each answer using upsert
    const answerRows = questions.map((q) => {
      const row: any = {
        attempt_id: currentAttemptId,
        question_id: q.id,
        student_answer: finalAnswers[q.id] || "",
      };
      if (existingAnswerIds[q.id]) {
        row.id = existingAnswerIds[q.id];
      }
      return row;
    });

    const { data: savedAnswers, error: ansErr } = await supabase.from("answers").upsert(answerRows, { onConflict: "attempt_id, question_id" }).select();
    
    if (ansErr) {
      console.error(ansErr);
      toast("Some answers failed to save", "error");
    } else if (savedAnswers) {
      const newAnswerIds = { ...existingAnswerIds };
      savedAnswers.forEach(ans => {
        newAnswerIds[ans.question_id] = ans.id;
      });
      setExistingAnswerIds(newAnswerIds);
    }

    setSubmitting(false);
    if (isFinal) {
      setSubmitted(true);
      toast("Test submitted successfully!", "success");
    } else {
      toast("Progress saved successfully! Returning to portal...", "success");
      router.push("/test");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1.5, repeat: Infinity }} className="text-gray-500 uppercase tracking-widest text-sm">Loading assessment...</motion.div>
      </div>
    );
  }

  if (!test) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="glass-panel p-12 text-center">
          <p className="text-[#D65A5A] uppercase tracking-widest mb-4">Test not found</p>
          <button onClick={() => router.push("/test")} className="text-[#C58359] uppercase tracking-widest text-sm hover:underline">Back to Tests</button>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", stiffness: 300, damping: 25 }} className="glass-panel p-12 md:p-16 text-center max-w-lg w-full">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 400, damping: 15, delay: 0.2 }}>
            <CheckCircle className="w-16 h-16 text-[#C58359] mx-auto mb-6" />
          </motion.div>
          <h1 className="text-3xl font-light text-[#FDF8F5] mb-4">Assessment Complete</h1>
          <p className="text-gray-400 mb-8">Your responses have been submitted and saved. The administrator will review and grade them.</p>
          <motion.button whileTap={{ scale: 0.95 }} onClick={() => router.push("/test")} className="bg-[#C58359] text-[#050505] px-8 py-3 font-semibold uppercase tracking-widest hover:bg-[#E3B497] transition-all duration-300">Return to Portal</motion.button>
        </motion.div>
      </div>
    );
  }

  if (!started) {
    return (
      <div className="p-4 md:p-8 max-w-4xl mx-auto min-h-screen flex flex-col items-center justify-center">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ type: "spring", stiffness: 300, damping: 30 }} className="glass-panel p-8 md:p-12 text-center max-w-2xl w-full">
          <h1 className="text-3xl md:text-4xl font-light tracking-wide text-[#FDF8F5] mb-4">{test.title}</h1>
          <p className="text-gray-400 mb-8 max-w-lg mx-auto text-sm md:text-base">{test.description || "You are about to begin this assessment."}</p>
          <div className="glass-panel p-6 mb-8 inline-flex items-center gap-6 text-sm">
            <div className="flex items-center gap-2 text-[#E3B497] uppercase tracking-widest font-semibold"><Clock className="w-5 h-5" />{test.duration_minutes} Min</div>
            <div className="w-px h-6 bg-[#2a1f18]" />
            <div className="text-gray-400 uppercase tracking-widest font-semibold">{questions.length} Questions</div>
          </div>
          <div className="mt-4">
            <motion.button whileTap={{ scale: 0.95 }} onClick={() => setStarted(true)} className="bg-[#C58359] text-[#050505] px-10 py-4 font-bold uppercase tracking-widest hover:bg-[#E3B497] transition-all duration-300 shadow-[0_0_20px_rgba(197,131,89,0.3)] flex items-center gap-3 mx-auto">
              Begin Assessment<ArrowRight className="w-5 h-5" />
            </motion.button>
          </div>
        </motion.div>
      </div>
    );
  }

  const q = questions[currentQ];
  const answeredCount = Object.keys(answers).length;

  return (
    <div className="min-h-screen flex flex-col">
      <div className="glass-panel px-4 md:px-8 py-4 flex items-center justify-between sticky top-0 z-50">
        <div className="text-sm uppercase tracking-widest text-gray-400 font-semibold hidden md:block">{test.title}</div>
        <div className="flex items-center gap-4 md:gap-6">
          <div className="text-xs uppercase tracking-widest text-gray-500">{answeredCount}/{questions.length}</div>
          <div className={`flex items-center gap-2 text-sm font-mono font-bold tracking-wider ${timeLeft < 300 ? "text-[#D65A5A]" : "text-[#E3B497]"}`}>
            <Clock className="w-4 h-4" />{formatTime(timeLeft)}
          </div>
        </div>
      </div>

      <div className="px-4 md:px-8 py-3 border-b border-[#2a1f18] overflow-x-auto">
        <div className="flex gap-2">
          {questions.map((_, i) => (
            <motion.button whileTap={{ scale: 0.9 }} key={i} onClick={() => setCurrentQ(i)} className={`w-9 h-9 shrink-0 flex items-center justify-center text-xs font-bold transition-all duration-200 ${i === currentQ ? "bg-[#C58359] text-[#050505]" : answers[questions[i].id] ? "bg-[#C58359]/20 text-[#E3B497] border border-[#C58359]/40" : "bg-[#0a0807] border border-[#2a1f18] text-gray-500 hover:border-[#C58359]/30"}`}>{i + 1}</motion.button>
          ))}
        </div>
      </div>

      <div className="flex-1 p-4 md:p-8 max-w-4xl mx-auto w-full">
        <AnimatePresence mode="wait">
          <motion.div key={currentQ} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.2 }} className="space-y-8">
            <div className="flex items-start gap-4">
              <span className="text-[#C58359] font-bold text-2xl shrink-0">Q{currentQ + 1}.</span>
              <div>
                <span className="text-[10px] uppercase tracking-widest text-[#C58359]/70 font-semibold block mb-2">{q.type.replace(/_/g, " ")}</span>
                <p className="text-[#FDF8F5] text-lg md:text-xl font-light leading-relaxed">
                  {q.type === "mcq" && q.content.prompt}
                  {q.type === "fill_in_blanks" && q.content.textWithBlanks?.replace(/\[.*?\]/g, "________")}
                  {q.type === "paragraph" && q.content.topic}
                  {q.type === "audio" && q.content.script}
                  {q.type === "general" && q.content.prompt}
                </p>
              </div>
            </div>

            {q.type === "mcq" && (
              <div className="space-y-3 pl-0 md:pl-12">
                {q.content.options?.map((opt: string, i: number) => (
                  <motion.button key={i} whileTap={{ scale: 0.98 }} onClick={() => setAnswer(q.id, opt)} className={`w-full text-left p-4 md:p-5 flex items-center gap-4 transition-all duration-200 ${answers[q.id] === opt ? "bg-[#C58359]/20 border border-[#C58359] text-[#E3B497]" : "bg-[#0a0807]/60 border border-[#2a1f18] text-gray-400 hover:border-[#C58359]/30 hover:text-[#FDF8F5]"}`}>
                    <div className={`w-6 h-6 shrink-0 flex items-center justify-center border ${answers[q.id] === opt ? "bg-[#C58359] border-[#C58359]" : "border-[#2a1f18]"}`}>
                      {answers[q.id] === opt && <div className="w-2.5 h-2.5 bg-[#050505]" />}
                    </div>
                    <span className="text-sm md:text-base">{opt}</span>
                  </motion.button>
                ))}
              </div>
            )}

            {q.type === "fill_in_blanks" && (
              <div className="pl-0 md:pl-12">
                <input type="text" value={answers[q.id] || ""} onChange={(e) => setAnswer(q.id, e.target.value)} className="w-full bg-[#0a0807]/60 border border-[#2a1f18] text-[#FDF8F5] p-4 md:p-5 focus:outline-none focus:border-[#C58359] transition-colors font-light" placeholder="Type your answer..." />
              </div>
            )}

            {q.type === "paragraph" && (
              <div className="pl-0 md:pl-12">
                <textarea value={answers[q.id] || ""} onChange={(e) => setAnswer(q.id, e.target.value)} className="w-full bg-[#0a0807]/60 border border-[#2a1f18] text-[#FDF8F5] p-4 md:p-5 min-h-[200px] focus:outline-none focus:border-[#C58359] transition-colors font-light resize-none" placeholder="Write your paragraph..." />
              </div>
            )}

            {q.type === "general" && (
              <div className="pl-0 md:pl-12">
                <textarea value={answers[q.id] || ""} onChange={(e) => setAnswer(q.id, e.target.value)} className="w-full bg-[#0a0807]/60 border border-[#2a1f18] text-[#FDF8F5] p-4 md:p-5 min-h-[100px] focus:outline-none focus:border-[#C58359] transition-colors font-light resize-none" placeholder="Write your answer..." />
              </div>
            )}

            {q.type === "audio" && (
              <div className="pl-0 md:pl-12 space-y-4">
                <div className="glass-panel p-6 text-center">
                  {!recording && !audioUrl && (
                    <motion.button whileTap={{ scale: 0.95 }} onClick={startRecording} className="flex items-center gap-3 mx-auto bg-[#C58359] text-[#050505] px-8 py-4 font-semibold uppercase tracking-widest hover:bg-[#E3B497] transition-all duration-300"><Mic className="w-5 h-5" />Start Recording</motion.button>
                  )}
                  {recording && (
                    <div className="space-y-4">
                      <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 1, repeat: Infinity }} className="w-16 h-16 bg-[#D65A5A]/20 border border-[#D65A5A] flex items-center justify-center mx-auto"><Mic className="w-8 h-8 text-[#D65A5A]" /></motion.div>
                      <p className="text-[#D65A5A] uppercase tracking-widest text-xs font-semibold">Recording...</p>
                      <motion.button whileTap={{ scale: 0.95 }} onClick={stopRecording} className="flex items-center gap-2 mx-auto bg-[#D65A5A] text-white px-6 py-3 font-semibold uppercase tracking-widest text-sm"><Square className="w-4 h-4" />Stop</motion.button>
                    </div>
                  )}
                  {audioUrl && !recording && (
                    <div className="space-y-4">
                      <p className="text-[#C58359] uppercase tracking-widest text-xs font-semibold">Recording saved</p>
                      <audio controls src={audioUrl} className="mx-auto" />
                      <button onClick={() => { setAudioUrl(null); setAnswer(q.id, ""); }} className="text-gray-500 uppercase tracking-widest text-xs hover:text-[#D65A5A]">Re-record</button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Navigation Buttons (Moved higher up) */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 mt-8 border-t border-[#2a1f18] pl-0 md:pl-12">
              <div className="w-full sm:w-auto">
                <motion.button whileTap={{ scale: 0.95 }} onClick={() => setCurrentQ((p) => Math.max(0, p - 1))} disabled={currentQ === 0} className="w-full flex items-center justify-center gap-2 text-gray-400 hover:text-[#C58359] disabled:opacity-30 transition-colors uppercase tracking-widest text-xs font-semibold py-2">
                  <ArrowLeft className="w-4 h-4" /><span>Previous</span>
                </motion.button>
              </div>
              
              <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
                <motion.button whileTap={{ scale: 0.95 }} onClick={() => handleSubmit(false)} disabled={submitting} className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#0a0807] border border-[#2a1f18] text-[#C58359] px-6 py-3 font-bold uppercase tracking-widest hover:border-[#C58359] hover:bg-[#C58359]/10 transition-all duration-300 disabled:opacity-50 text-sm">
                  <Save className="w-4 h-4" />
                  <span>{submitting ? "Saving..." : "Save & Exit"}</span>
                </motion.button>

                {currentQ === questions.length - 1 ? (
                  <motion.button whileTap={{ scale: 0.95 }} onClick={() => handleSubmit(true)} disabled={submitting} className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#C58359] text-[#050505] px-8 py-3 font-bold uppercase tracking-widest hover:bg-[#E3B497] transition-all duration-300 disabled:opacity-50 text-sm">
                    {submitting ? "Submitting..." : "Submit Test"}{!submitting && <Send className="w-4 h-4" />}
                  </motion.button>
                ) : (
                  <motion.button whileTap={{ scale: 0.95 }} onClick={() => setCurrentQ((p) => Math.min(questions.length - 1, p + 1))} className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#1a120e] border border-[#2a1f18] px-8 py-3 text-[#C58359] hover:border-[#C58359] transition-all duration-300 uppercase tracking-widest text-xs font-semibold">
                    <span>Next</span><ArrowRight className="w-4 h-4" />
                  </motion.button>
                )}
              </div>
            </div>

          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
