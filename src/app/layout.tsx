import type { Metadata, Viewport } from "next";
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
  colorScheme: "light",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    title: "Whims",
    statusBarStyle: "default",
  },
};

/** Edge-to-edge on iOS; paint safe areas with app sky instead of default black. */
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#D4E8E8",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn(
        "h-full min-h-dvh bg-whim-sky antialiased",
        geistMono.variable,
      )}
    >
      <head>
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      </head>
      <body
        className={cn(
          "flex min-h-dvh min-h-0 w-full max-w-[100vw] flex-col overflow-x-visible overflow-y-auto overscroll-y-contain bg-whim-sky font-sans antialiased",
          instrumentSans.variable,
          instrumentSerif.variable,
        )}
      >
        <WhimProviders>
          <div
            id="whim-app-root"
            data-whim-chrome="day"
            className="flex min-h-safari-page-plus min-h-0 min-w-0 flex-1 flex-col overflow-x-visible bg-whim-sky"
          >
            {children}
          </div>
        </WhimProviders>
      </body>
    </html>
  );
}
