"use client";

import { WhimGlobalChrome } from "@/components/whim-global-chrome";
import { WhimProvider } from "@/context/WhimContext";

export function WhimProviders({ children }: { children: React.ReactNode }) {
  return (
    <WhimProvider>
      <WhimGlobalChrome>{children}</WhimGlobalChrome>
    </WhimProvider>
  );
}
