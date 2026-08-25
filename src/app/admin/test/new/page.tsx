"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function CreateTest() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [duration, setDuration] = useState(60);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      setError("Authentication required.");
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("tests")
      .insert([{
        title,
        description,
        duration_minutes: duration,
        created_by: user.id
      }])
      .select();

    if (error) {
      console.error(error);
      setError("Database Error: Profile might be missing or permissions denied.");
    } else if (data && data.length > 0) {
      router.push(`/admin/test/${data[0].id}`);
    }
    
    setLoading(false);
  };

  return (
    <div className="p-8 max-w-4xl mx-auto min-h-[calc(100vh-64px)] flex flex-col">
      <header className="flex items-center gap-4 mb-12">
        <Link href="/admin">
          <button className="p-2 rounded-full hover:bg-white/5 transition-colors text-gray-400 hover:text-[#C58359]">
            <ArrowLeft className="w-6 h-6" />
          </button>
        </Link>
        <div>
          <h1 className="text-3xl font-light tracking-wide text-[#FDF8F5]">Initialize Test</h1>
          <p className="text-[#C58359]/70 text-sm tracking-widest uppercase mt-1">Create a new assessment</p>
        </div>
      </header>

      <motion.form 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        onSubmit={handleCreate} 
        className="glass-panel rounded-none p-10 space-y-8 flex-1"
      >
        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#D65A5A]/10 border border-[#D65A5A]/30 text-[#D65A5A] p-4 text-sm shadow-[0_0_15px_rgba(214,90,90,0.1)]"
          >
            {error}
          </motion.div>
        )}

        <div className="space-y-3">
          <label className="text-xs text-[#C58359] uppercase tracking-widest font-semibold ml-1">
            Test Title
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="glass-input w-full text-white p-4 rounded-none placeholder:text-gray-600 font-light text-lg"
            placeholder="e.g. Advanced Grammar Final"
          />
        </div>

        <div className="space-y-3">
          <label className="text-xs text-[#C58359] uppercase tracking-widest font-semibold ml-1">
            Description (Optional)
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="glass-input w-full text-white p-4 h-32 rounded-none placeholder:text-gray-600 font-light resize-none"
            placeholder="Brief instructions for the student..."
          />
        </div>

        <div className="space-y-4">
          <label className="text-xs text-[#F2E3C6] uppercase tracking-widest font-semibold ml-1">
            Duration (Minutes): <span className="text-[#D8C3A5] ml-2 text-lg">{duration}</span>
          </label>
          <div className="glass-panel p-6">
            <input
              type="range"
              min={5}
              max={180}
              step={5}
              value={duration}
              onChange={(e) => setDuration(parseInt(e.target.value))}
              className="w-full accent-[#D8C3A5] h-1 bg-[#1a120e] appearance-none cursor-pointer outline-none"
            />
            <div className="flex justify-between text-[10px] text-gray-500 uppercase tracking-widest mt-4">
              <span>5 Min</span>
              <span>180 Min</span>
            </div>
          </div>
        </div>

        <div className="pt-8 mt-12">
          <button
            type="submit"
            disabled={loading}
            className="flex items-center justify-center gap-3 w-full sm:w-auto bg-[#C58359] hover:bg-[#E3B497] text-[#0d0906] px-10 py-4 rounded-none font-semibold uppercase tracking-widest transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(197,131,89,0.3)] hover:shadow-[0_0_30px_rgba(227,180,151,0.5)]"
          >
            {loading ? "Processing..." : "Create & Add Questions"}
            {!loading && <Save className="w-5 h-5" />}
          </button>
        </div>
      </motion.form>
    </div>
  );
}
