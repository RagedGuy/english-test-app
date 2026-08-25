"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import { UserPlus, ArrowRight } from "lucide-react";
import { useToast } from "@/components/ui/toast";

export default function StudentRegister() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { data, error } = await supabase.auth.signUp({ email, password });

    if (error) {
      toast(error.message, "error");
      setLoading(false);
      return;
    }

    if (data.user) {
      await supabase.from("profiles").insert([{
        id: data.user.id,
        role: "student",
        full_name: name,
      }]);
      toast("Account created! You can now sign in.", "success");
      router.push("/test/login");
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
            <UserPlus className="w-8 h-8 text-[#D8C3A5]" />
          </motion.div>
          <h1 className="text-2xl font-light tracking-widest uppercase text-[#FDF8F5]">Create Account</h1>
          <p className="text-gray-500 text-xs uppercase tracking-widest mt-2">Register for assessments</p>
        </div>

        <form onSubmit={handleRegister} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs text-[#D8C3A5] uppercase tracking-widest font-semibold ml-1">Full Name</label>
            <input type="text" required value={name} onChange={(e) => setName(e.target.value)} className="glass-input w-full text-white p-4 font-light" placeholder="Your full name" />
          </div>
          <div className="space-y-2">
            <label className="text-xs text-[#D8C3A5] uppercase tracking-widest font-semibold ml-1">Email</label>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="glass-input w-full text-white p-4 font-light" placeholder="you@example.com" />
          </div>
          <div className="space-y-2">
            <label className="text-xs text-[#D8C3A5] uppercase tracking-widest font-semibold ml-1">Password</label>
            <input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} className="glass-input w-full text-white p-4 font-light" placeholder="Min 6 characters" />
          </div>
          <motion.button whileTap={{ scale: 0.97 }} type="submit" disabled={loading} className="w-full bg-[#D8C3A5] text-[#050505] p-4 font-semibold uppercase tracking-widest hover:bg-[#F2E3C6] transition-all duration-300 disabled:opacity-50 shadow-[0_0_15px_rgba(216,195,165,0.3)] flex items-center justify-center gap-2">
            {loading ? (
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} className="w-5 h-5 border-2 border-[#050505] border-t-transparent" />
            ) : (
              <><span>Create Account</span><ArrowRight className="w-4 h-4" /></>
            )}
          </motion.button>
        </form>

        <p className="text-center text-gray-500 text-sm mt-8">
          Already have an account?{" "}
          <Link href="/test/login" className="text-[#D8C3A5] hover:text-[#F2E3C6] transition-colors font-semibold">Sign In</Link>
        </p>
      </motion.div>
    </div>
  );
}
