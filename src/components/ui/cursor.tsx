"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export const CustomCursor = () => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.matchMedia("(pointer: coarse)").matches || window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);

    const updatePosition = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
    };

    const updateHoverState = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.tagName === "BUTTON" ||
        target.tagName === "A" ||
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
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
      window.removeEventListener("resize", checkMobile);
      window.removeEventListener("mousemove", updatePosition);
      window.removeEventListener("mouseover", updateHoverState);
    };
  }, []);

  if (isMobile) return null;

  return (
    <>
      {/* Inner dot */}
      <motion.div
        className="fixed top-0 left-0 w-3 h-3 bg-[#C58359] rounded-full pointer-events-none z-[9999]"
        animate={{
          x: position.x - 6,
          y: position.y - 6,
          scale: isHovering ? 0 : 1,
        }}
        transition={{
          type: "tween",
          ease: "linear",
          duration: 0.05,
        }}
      />
      {/* Outer circle */}
      <motion.div
        className="fixed top-0 left-0 w-10 h-10 border-2 border-[#C58359]/60 rounded-full pointer-events-none z-[9998]"
        animate={{
          x: position.x - 20,
          y: position.y - 20,
          scale: isHovering ? 1.5 : 1,
          backgroundColor: isHovering ? "rgba(197, 131, 89, 0.2)" : "transparent",
        }}
        transition={{
          type: "tween",
          ease: "easeOut",
          duration: 0.15,
        }}
      />
    </>
  );
};
