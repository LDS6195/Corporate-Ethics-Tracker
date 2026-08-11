import type { Metadata } from "next";
import { IBM_Plex_Sans, Source_Serif_4 } from "next/font/google";
import "./globals.css";
import PrimaryNav from "@/components/PrimaryNav";
import MobileDebugOverlay from "@/components/MobileDebugOverlay";

const sans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans-custom",
});

const serif = Source_Serif_4({
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--font-serif-custom",
});

export const metadata: Metadata = {
  title: "Corporate AI Accountability Index",
  description:
    "Tracking major companies on ethical AI usage, labor displacement, human oversight, and data privacy policy.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${sans.variable} ${serif.variable} min-h-screen bg-neutral-950 font-sans text-neutral-100 antialiased`}>
        <PrimaryNav />
        {children}
        <MobileDebugOverlay />
      </body>
    </html>
  );
}
