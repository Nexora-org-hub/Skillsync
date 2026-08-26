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
    <html lang="en" className="dark h-full bg-[#0a0f1d]">
      <body
        className={`${fontSans.variable} font-sans min-h-screen flex flex-col bg-[#0a0f1d] text-slate-100 antialiased selection:bg-indigo-500 selection:text-white relative overflow-x-hidden`}
      >
        {/* Fixed Ambient Radial Mesh Glows */}
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
          {/* Top-Left Indigo Glow */}
          <div className="absolute -top-32 -left-32 w-[600px] h-[600px] rounded-full bg-indigo-600/15 blur-[130px]" />
          {/* Top-Right Violet Glow */}
          <div className="absolute top-10 -right-40 w-[550px] h-[550px] rounded-full bg-violet-600/15 blur-[140px]" />
          {/* Center-Bottom Cyan Glow */}
          <div className="absolute -bottom-40 left-1/3 w-[650px] h-[650px] rounded-full bg-cyan-500/10 blur-[150px]" />
          {/* Subtle Grid Overlay Texture */}
          <div className="absolute inset-0 bg-[radial-gradient(#ffffff08_1px,transparent_1px)] [background-size:24px_24px] opacity-40" />
        </div>

        {/* Main Content */}
        <div className="relative z-10 flex flex-col flex-1">
          {children}
        </div>
      </body>
    </html>
  );
}
