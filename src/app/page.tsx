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
        className="max-w-2xl w-full text-center space-y-8"
      >
        <div className="flex justify-center mb-8">
          <div className="w-16 h-16 bg-black border border-[#1E1E1E] flex items-center justify-center">
            <Code className="w-8 h-8 text-[#00F0FF]" />
          </div>
        </div>
        
        <h1 className="text-5xl md:text-7xl font-bold tracking-tighter uppercase">
          System <span className="text-[#00F0FF]">Online</span>
        </h1>
        
        <p className="text-gray-400 text-lg max-w-lg mx-auto">
          Advanced English proficiency testing environment. Secure, precise, and fully automated.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
          <Link href="/admin/login">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 bg-[#00F0FF] text-black font-bold uppercase tracking-widest flex items-center gap-2 hover:bg-[#00d0dd] transition-colors"
            >
              Admin Access
              <ArrowRight className="w-4 h-4" />
            </motion.button>
          </Link>
          
          <Link href="/test">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 bg-transparent border border-[#1E1E1E] text-white font-bold uppercase tracking-widest flex items-center gap-2 hover:border-[#00F0FF] hover:text-[#00F0FF] transition-colors"
            >
              Student Portal
            </motion.button>
          </Link>
        </div>
      </motion.div>
    </main>
  );
}
