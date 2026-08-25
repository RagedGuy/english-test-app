"use client";

import { Users } from "lucide-react";

export default function StudentsPage() {
  return (
    <div className="p-8 max-w-6xl mx-auto flex flex-col min-h-screen">
      <header className="mb-12">
        <h1 className="text-3xl font-light tracking-wide text-[#FDF8F5]">Students Directory</h1>
        <p className="text-[#C58359]/70 text-sm tracking-widest uppercase mt-1">Manage registered test takers</p>
      </header>

      <div className="glass-panel rounded-none p-16 flex-1 flex flex-col items-center justify-center text-center">
        <div className="w-20 h-20 rounded-full bg-[#1a120e] border border-[#2a1f18] flex items-center justify-center mb-6">
          <Users className="w-10 h-10 text-[#C58359]/50" />
        </div>
        <h2 className="text-xl font-semibold text-[#FDF8F5] mb-2">No Students Registered</h2>
        <p className="text-gray-400 max-w-md">
          Students will appear here once they create an account and log in to the student portal.
        </p>
      </div>
    </div>
  );
}
