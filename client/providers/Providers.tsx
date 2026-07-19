"use client";

import type { ReactNode } from "react";
import { AuthProvider } from "@/providers/AuthProvider";
import { ConfirmProvider } from "@/components/confirm-modal";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <ConfirmProvider>{children}</ConfirmProvider>
    </AuthProvider>
  );
}
