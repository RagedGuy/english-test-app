"use client";

import { cn } from "@/lib/utils";

interface GridBackgroundProps extends React.HTMLAttributes<HTMLDivElement> {}

export const GridBackground = ({ className, children, ...props }: GridBackgroundProps) => {
  return (
    <div
      className={cn(
        "min-h-screen w-full bg-[#0A0A0A] bg-grid-pattern relative flex flex-col",
        className
      )}
      {...props}
    >
      {/* Subtle overlay gradient to create depth */}
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-[#0A0A0A]/50 to-[#0A0A0A] pointer-events-none" />
      <div className="relative z-10 flex-1 flex flex-col">
        {children}
      </div>
    </div>
  );
};
