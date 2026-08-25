"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import { BookOpen, ArrowRight } from "lucide-react";
import { useToast } from "@/components/ui/toast";

export default function StudentLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      toast(error.message, "error");
    } else {
      toast("Welcome back!", "success");
      router.push("/test");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="glass-panel p-10 w-full max-w-md"
      >
        <div className="flex flex-col items-center mb-10">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 400, damping: 20, delay: 0.1 }}
            className="w-16 h-16 bg-[#1a120e] border border-[#2a1f18] flex items-center justify-center mb-4 shadow-[0_0_20px_rgba(216,195,165,0.1)]"
          >
            <BookOpen className="w-8 h-8 text-[#D8C3A5]" />
          </motion.div>
          <h1 className="text-2xl font-light tracking-widest uppercase text-[#FDF8F5]">Student Portal</h1>
          <p className="text-gray-500 text-xs uppercase tracking-widest mt-2">Sign in to continue</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs text-[#D8C3A5] uppercase tracking-widest font-semibold ml-1">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="glass-input w-full text-white p-4 font-light"
              placeholder="you@example.com"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs text-[#D8C3A5] uppercase tracking-widest font-semibold ml-1">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="glass-input w-full text-white p-4 font-light"
              placeholder="••••••••"
            />
          </div>
          <motion.button
            whileTap={{ scale: 0.97 }}
            type="submit"
            disabled={loading}
            className="w-full bg-[#D8C3A5] text-[#050505] p-4 font-semibold uppercase tracking-widest hover:bg-[#F2E3C6] transition-all duration-300 disabled:opacity-50 shadow-[0_0_15px_rgba(216,195,165,0.3)] hover:shadow-[0_0_25px_rgba(242,227,198,0.5)] flex items-center justify-center gap-2"
          >
            {loading ? (
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} className="w-5 h-5 border-2 border-[#050505] border-t-transparent" />
            ) : (
              <><span>Sign In</span><ArrowRight className="w-4 h-4" /></>
            )}
          </motion.button>
        </form>

        <p className="text-center text-gray-500 text-sm mt-8">
          Don't have an account?{" "}
          <Link href="/test/register" className="text-[#D8C3A5] hover:text-[#F2E3C6] transition-colors font-semibold">Register</Link>
        </p>
      </motion.div>
    </div>
  );
}
