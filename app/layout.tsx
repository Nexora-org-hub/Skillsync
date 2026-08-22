import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const fontSans = Plus_Jakarta_Sans({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "SkillSync — Peer-to-Peer Student Skill Sharing Platform",
  description: "Connect with university peers to trade skills 1-on-1. Teach what you know and learn what you want across tech, creative, academics, and languages.",
  keywords: ["Skill sharing", "Student barter", "Peer learning", "Campus network", "Coding tutor", "Language exchange"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body
        className={`${fontSans.variable} font-sans min-h-screen flex flex-col bg-slate-50 dark:bg-[#090d16] text-slate-900 dark:text-slate-100 antialiased selection:bg-indigo-500 selection:text-white`}
      >
        {children}
      </body>
    </html>
  );
}
