"use client";

import { LayoutDashboard } from "lucide-react";

export default function ResultsPage() {
  return (
    <div className="p-8 max-w-6xl mx-auto flex flex-col min-h-screen">
      <header className="mb-12">
        <h1 className="text-3xl font-light tracking-wide text-[#FDF8F5]">Test Results</h1>
        <p className="text-[#C58359]/70 text-sm tracking-widest uppercase mt-1">Review student submissions and grades</p>
      </header>

      <div className="glass-panel rounded-xl p-16 flex-1 flex flex-col items-center justify-center text-center">
        <div className="w-20 h-20 rounded-full bg-[#1a120e] border border-[#2a1f18] flex items-center justify-center mb-6">
          <LayoutDashboard className="w-10 h-10 text-[#C58359]/50" />
        </div>
        <h2 className="text-xl font-semibold text-[#FDF8F5] mb-2">No Results Yet</h2>
        <p className="text-gray-400 max-w-md">
          Once students begin taking your assessments, their submissions and automated grades will appear here for review.
        </p>
      </div>
    </div>
  );
}
