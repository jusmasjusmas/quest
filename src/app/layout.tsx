import type { Metadata } from "next";
import { Geist_Mono, Instrument_Sans, Instrument_Serif } from "next/font/google";
import "./globals.css";
import { WhimProviders } from "@/components/whim-providers";
import { cn } from "@/lib/utils";

const instrumentSans = Instrument_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
});

const instrumentSerif = Instrument_Serif({
  weight: "400",
  style: ["normal", "italic"],
  subsets: ["latin"],
  variable: "--font-serif",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Whims",
  description:
    "One small kindness idea every day — join in, reflect, and look back anytime.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn("h-full", "antialiased", geistMono.variable)}>
      <body
        className={cn(
          "flex h-dvh min-h-0 w-full max-w-[100vw] flex-col overflow-x-visible overflow-y-hidden bg-[#121212] font-sans antialiased",
          instrumentSans.variable,
          instrumentSerif.variable,
        )}
      >
        <WhimProviders>
          <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-x-visible">
            {children}
          </div>
        </WhimProviders>
      </body>
    </html>
  );
}
