"use client";

import { ToastProvider } from "@/components/ui/toast";
import { CustomCursor } from "@/components/ui/cursor";
import { AnimatedBackground } from "@/components/ui/animated-background";

export function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <CustomCursor />
      <AnimatedBackground>
        {children}
      </AnimatedBackground>
    </ToastProvider>
  );
}
