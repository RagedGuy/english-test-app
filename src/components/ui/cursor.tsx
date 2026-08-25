"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export const CustomCursor = () => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    const updatePosition = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
    };

    const updateHoverState = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.tagName === "BUTTON" ||
        target.tagName === "A" ||
        target.closest("button") ||
        target.closest("a") ||
        target.classList.contains("interactive")
      ) {
        setIsHovering(true);
      } else {
        setIsHovering(false);
      }
    };

    window.addEventListener("mousemove", updatePosition);
    window.addEventListener("mouseover", updateHoverState);

    return () => {
      window.removeEventListener("mousemove", updatePosition);
      window.removeEventListener("mouseover", updateHoverState);
    };
  }, []);

  return (
    <>
      {/* Inner dot */}
      <motion.div
        className="fixed top-0 left-0 w-2 h-2 bg-cyan-400 rounded-full pointer-events-none z-[9999] mix-blend-difference"
        animate={{
          x: position.x - 4,
          y: position.y - 4,
        }}
        transition={{
          type: "tween",
          ease: "backOut",
          duration: 0.1,
        }}
      />
      {/* Outer circle */}
      <motion.div
        className="fixed top-0 left-0 w-8 h-8 border border-cyan-400/50 rounded-full pointer-events-none z-[9998] mix-blend-screen"
        animate={{
          x: position.x - 16,
          y: position.y - 16,
          scale: isHovering ? 1.5 : 1,
          backgroundColor: isHovering ? "rgba(34, 211, 238, 0.1)" : "transparent",
        }}
        transition={{
          type: "tween",
          ease: "backOut",
          duration: 0.15,
        }}
      />
    </>
  );
};
