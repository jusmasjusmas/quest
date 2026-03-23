"use client";

import { WhimGlobalChrome } from "@/components/whim-global-chrome";
import { StandaloneLaunchOverlay } from "@/components/standalone-launch-overlay";
import { WhimProvider } from "@/context/WhimContext";

export function WhimProviders({ children }: { children: React.ReactNode }) {
  return (
    <WhimProvider>
      <WhimGlobalChrome>
        {children}
        <StandaloneLaunchOverlay />
      </WhimGlobalChrome>
    </WhimProvider>
  );
}
