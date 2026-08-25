"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Code } from "lucide-react";

export default function Home() {
  return (
    <main className="flex-1 flex flex-col items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-3xl w-full text-center space-y-10"
      >
        <div className="flex justify-center mb-10">
          <div className="w-20 h-20 bg-[#1a120e] rounded-none border border-[#2a1f18] flex items-center justify-center shadow-[0_0_30px_rgba(197,131,89,0.15)]">
            <Code className="w-10 h-10 text-[#C58359]" />
          </div>
        </div>
        
        <h1 className="text-5xl md:text-7xl font-light tracking-wide text-[#FDF8F5]">
          Testing <span className="text-[#C58359] font-bold">Environment</span>
        </h1>
        
        <p className="text-[#E3B497]/60 text-lg md:text-xl max-w-2xl mx-auto font-light leading-relaxed">
          Advanced English proficiency assessment platform. Secure, precise, and beautifully designed.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-10">
          <Link href="/admin/login">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 rounded-none bg-[#C58359] text-[#0d0906] font-semibold uppercase tracking-widest flex items-center gap-3 hover:bg-[#E3B497] hover:shadow-[0_0_20px_rgba(227,180,151,0.4)] transition-all duration-300 w-64 justify-center"
            >
              Admin Console
              <ArrowRight className="w-5 h-5" />
            </motion.button>
          </Link>
          
          <Link href="/test">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 rounded-none glass-panel text-[#C58359] font-semibold uppercase tracking-widest flex items-center gap-3 hover:border-[#C58359] hover:bg-[#1a120e] transition-all duration-300 w-64 justify-center"
            >
              Student Portal
            </motion.button>
          </Link>
        </div>
      </motion.div>
    </main>
  );
}
