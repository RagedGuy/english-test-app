"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";

export default function CreateTest() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [duration, setDuration] = useState(60);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Get current user (mocked or actual auth)
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      alert("You must be logged in.");
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
      alert("Error creating test");
    } else if (data && data.length > 0) {
      router.push(`/admin/test/${data[0].id}`);
    }
    
    setLoading(false);
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <header className="flex items-center gap-4 mb-12">
        <Link href="/admin">
          <button className="p-2 hover:bg-[#1E1E1E] transition-colors">
            <ArrowLeft className="w-6 h-6" />
          </button>
        </Link>
        <h1 className="text-3xl font-bold uppercase tracking-widest">Initialize Test</h1>
      </header>

      <form onSubmit={handleCreate} className="space-y-8 bg-black border border-[#1E1E1E] p-8">
        <div className="space-y-2">
          <label className="text-xs text-[#00F0FF] uppercase tracking-widest font-bold">
            Test Title
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-[#0A0A0A] border border-[#1E1E1E] text-white p-4 focus:outline-none focus:border-[#00F0FF] transition-colors placeholder:text-gray-700"
            placeholder="e.g. ADVANCED GRAMMAR FINAL"
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs text-[#00F0FF] uppercase tracking-widest font-bold">
            Description (Optional)
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full bg-[#0A0A0A] border border-[#1E1E1E] text-white p-4 h-32 focus:outline-none focus:border-[#00F0FF] transition-colors placeholder:text-gray-700 resize-none"
            placeholder="Brief instructions for the student..."
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs text-[#FFCC00] uppercase tracking-widest font-bold">
            Duration (Minutes)
          </label>
          <input
            type="number"
            required
            min={1}
            value={duration}
            onChange={(e) => setDuration(parseInt(e.target.value))}
            className="w-full max-w-[200px] bg-[#0A0A0A] border border-[#1E1E1E] text-white p-4 focus:outline-none focus:border-[#FFCC00] transition-colors"
          />
        </div>

        <div className="pt-8 border-t border-[#1E1E1E]">
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 bg-[#00F0FF] text-black px-8 py-4 font-bold uppercase tracking-widest hover:bg-white transition-colors disabled:opacity-50"
          >
            {loading ? "PROCESSING..." : "CREATE & ADD QUESTIONS"}
            {!loading && <Save className="w-4 h-4" />}
          </button>
        </div>
      </form>
    </div>
  );
}
