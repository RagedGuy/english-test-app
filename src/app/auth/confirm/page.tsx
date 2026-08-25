"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { CheckCircle, ArrowRight } from "lucide-react";

export default function AuthConfirm() {
  const router = useRouter();
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown((p) => {
        if (p <= 1) {
          clearInterval(interval);
          router.push("/test/login");
          return 0;
        }
        return p - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        className="glass-panel p-12 md:p-16 text-center max-w-lg w-full"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 400, damping: 15, delay: 0.2 }}
        >
          <CheckCircle className="w-20 h-20 text-[#C58359] mx-auto mb-8" />
        </motion.div>

        <h1 className="text-3xl font-light text-[#FDF8F5] mb-4">
          Email Confirmed!
        </h1>
        <p className="text-gray-400 mb-8 leading-relaxed">
          Your account has been verified successfully. You can now sign in and start taking assessments.
        </p>

        <div className="text-gray-500 text-xs uppercase tracking-widest mb-6">
          Redirecting to login in {countdown}s...
        </div>

        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => router.push("/test/login")}
          className="bg-[#C58359] text-[#050505] px-8 py-4 font-semibold uppercase tracking-widest hover:bg-[#E3B497] transition-all duration-300 shadow-[0_0_15px_rgba(197,131,89,0.3)] flex items-center gap-3 mx-auto"
        >
          Go to Login
          <ArrowRight className="w-5 h-5" />
        </motion.button>
      </motion.div>
    </div>
  );
}
