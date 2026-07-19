"use client";

import { LearnerNavbar } from "@/components/learner-navbar";

export default function LearnerLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <LearnerNavbar />
      <main className="flex-1">{children}</main>
    </div>
  );
}
