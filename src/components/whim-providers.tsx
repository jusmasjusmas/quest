"use client";

import { WhimProvider } from "@/context/WhimContext";

export function WhimProviders({ children }: { children: React.ReactNode }) {
  return <WhimProvider>{children}</WhimProvider>;
}
