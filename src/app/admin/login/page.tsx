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

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    // Check if user is admin (you can do this via profiles table or metadata)
    // For now, just redirect to admin dashboard
    router.push("/admin");
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-black/50 border border-[#1E1E1E] p-8 space-y-8 backdrop-blur-sm"
      >
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold tracking-widest uppercase text-white">
            Admin <span className="text-[#00F0FF]">Access</span>
          </h1>
          <p className="text-gray-400 text-sm">
            Enter your credentials to manage the system
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-4">
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type="email"
                placeholder="EMAIL ADDRESS"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#0A0A0A] border border-[#1E1E1E] text-white px-12 py-4 focus:outline-none focus:border-[#00F0FF] transition-colors placeholder:text-gray-600 uppercase text-sm tracking-wider"
                required
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type="password"
                placeholder="PASSWORD"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#0A0A0A] border border-[#1E1E1E] text-white px-12 py-4 focus:outline-none focus:border-[#00F0FF] transition-colors placeholder:text-gray-600 uppercase text-sm tracking-wider"
                required
              />
            </div>
          </div>

          {error && (
            <p className="text-[#FF3366] text-sm text-center uppercase tracking-wider">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#00F0FF] text-black font-bold uppercase tracking-widest py-4 flex items-center justify-center gap-2 hover:bg-[#00d0dd] transition-colors disabled:opacity-50"
          >
            {loading ? "Authenticating..." : "Initialize Session"}
            {!loading && <ArrowRight className="w-4 h-4" />}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
