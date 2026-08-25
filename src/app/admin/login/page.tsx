"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { ArrowRight, Lock, Mail } from "lucide-react";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
    } else {
      router.push("/admin");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel p-10 w-full max-w-md bg-[#050505] border border-[#2a1f18]"
      >
        <div className="flex flex-col items-center mb-10">
          <div className="w-16 h-16 bg-[#1a120e] border border-[#2a1f18] flex items-center justify-center mb-4 shadow-[0_0_20px_rgba(216,195,165,0.1)]">
             <Lock className="w-8 h-8 text-[#D8C3A5]" />
          </div>
          <h1 className="text-2xl font-light tracking-widest uppercase text-[#FDF8F5]">System Admin</h1>
          <p className="text-gray-500 text-xs uppercase tracking-widest mt-2">Authentication Required</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-[#D65A5A]/10 border border-[#D65A5A]/30 text-[#D65A5A] p-4 text-sm shadow-[0_0_15px_rgba(214,90,90,0.1)]"
            >
              {error}
            </motion.div>
          )}

          <div className="space-y-2">
            <label className="text-xs text-[#D8C3A5] uppercase tracking-widest font-semibold ml-1">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#0A0A0A] border border-[#2a1f18] text-white p-4 font-light focus:outline-none focus:border-[#D8C3A5]"
              placeholder="admin@example.com"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs text-[#D8C3A5] uppercase tracking-widest font-semibold ml-1">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#0A0A0A] border border-[#2a1f18] text-white p-4 font-light focus:outline-none focus:border-[#D8C3A5]"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#D8C3A5] text-[#050505] p-4 font-semibold uppercase tracking-widest hover:bg-[#F2E3C6] transition-all duration-300 disabled:opacity-50 shadow-[0_0_15px_rgba(216,195,165,0.3)] hover:shadow-[0_0_25px_rgba(242,227,198,0.5)] mt-4"
          >
            {loading ? "Authenticating..." : "Access Console"}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
