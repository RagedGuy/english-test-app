"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export const AnimatedBackground = ({ children, className }: { children: React.ReactNode, className?: string }) => {
  return (
    <div className={cn("min-h-screen w-full relative flex flex-col overflow-hidden bg-[#050505]", className)}>
      {/* Animated Blobs */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <motion.div
          animate={{
            x: [0, 100, -100, 0],
            y: [0, -100, 100, 0],
            scale: [1, 1.2, 0.8, 1],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute top-[20%] left-[20%] w-[40vw] h-[40vw] rounded-full bg-gradient-to-tr from-[#D8C3A5]/20 to-[#8E6E53]/20 blur-[100px]"
        />
        <motion.div
          animate={{
            x: [0, -150, 150, 0],
            y: [0, 150, -150, 0],
            scale: [1, 0.9, 1.1, 1],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-[20%] right-[20%] w-[35vw] h-[35vw] rounded-full bg-gradient-to-br from-[#F2E3C6]/10 to-[#D8C3A5]/10 blur-[120px]"
        />
      </div>
      
      {/* Grid Pattern Overlay */}
      <div className="fixed inset-0 pointer-events-none z-0 bg-grid-pattern opacity-50" />

      {/* Content - The Glass Window */}
      <div className="relative z-10 flex-1 flex flex-col">
        {children}
      </div>
    </div>
  );
};
