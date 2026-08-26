"use client";

import React from "react";
import { 
  ArrowRightLeft, 
  Sparkles, 
  BookOpen, 
  ShieldCheck, 
  Search, 
  X, 
  Users, 
  PlusCircle, 
  Zap 
} from "lucide-react";

interface HeroBannerProps {
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  totalStudents?: number;
  onOpenAddSkill?: () => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  searchQuery = "",
  onSearchChange,
  totalStudents = 0,
  onOpenAddSkill
}) => {
  return (
    <section className="relative overflow-hidden pt-6 pb-2 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="relative rounded-3xl p-6 sm:p-10 bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 text-white shadow-2xl overflow-hidden">
          {/* Background ambient glow shapes */}
          <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-indigo-600/20 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-20 -left-20 w-96 h-96 rounded-full bg-cyan-500/15 blur-3xl pointer-events-none" />
          
          <div className="relative z-10 max-w-3xl space-y-5">
            {/* Glowing Pill Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold bg-indigo-500/10 text-cyan-300 border border-indigo-400/40 shadow-[0_0_20px_rgba(99,102,241,0.25)]">
              <Zap className="w-3.5 h-3.5 text-cyan-400 fill-cyan-400 animate-pulse" />
              <span>⚡ Hyper-Local Campus Knowledge Network</span>
            </div>

            {/* Bold Impactful Headline */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight text-white">
              Trade What You Know. <br className="hidden sm:inline" />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-300 via-cyan-200 to-emerald-300">
                Learn What You Don&apos;t.
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-normal max-w-2xl">
              Connect 1-on-1 with verified peers across university departments. Review proof of work, watch demo showcases, and swap knowledge 100% free with verified campus peers.
            </p>

            {/* Frosted Glass Search Bar with Floating Live Peers Counter */}
            {onSearchChange && (
              <div className="pt-2">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  <div className="relative flex-1">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-indigo-400">
                      <Search className="w-4 h-4" />
                    </div>
                    <input
                      id="hero-search-input"
                      type="text"
                      value={searchQuery}
                      onChange={(e) => onSearchChange(e.target.value)}
                      placeholder="Search skills, verified peers, or majors..."
                      className="w-full pl-11 pr-10 py-3.5 rounded-2xl bg-slate-950/60 backdrop-blur-xl border border-slate-700/80 text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-400 transition-all shadow-inner shadow-black/40"
                    />
                    {searchQuery && (
                      <button
                        onClick={() => onSearchChange("")}
                        className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-white transition-colors cursor-pointer"
                        title="Clear search"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {/* Floating Counter Badge: Total Live Peers */}
                  <div className="inline-flex items-center justify-center gap-2 px-4 py-3.5 rounded-2xl bg-slate-800/60 backdrop-blur-md border border-slate-700/70 text-slate-200 text-xs sm:text-sm font-semibold shadow-lg shadow-black/20 shrink-0">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]"></span>
                    <span className="font-bold text-white">{totalStudents}</span>
                    <span className="text-slate-300 font-medium">Total Live Peers</span>
                  </div>
                </div>
              </div>
            )}

            {/* Micro Highlights Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3">
              <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                  <ArrowRightLeft className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Direct 1:1 Swaps</h4>
                  <p className="text-[11px] text-slate-400">Zero fees, pure knowledge barter</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md">
                <div className="w-9 h-9 rounded-xl bg-indigo-500/20 text-cyan-300 flex items-center justify-center font-bold">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Verified Portfolios</h4>
                  <p className="text-[11px] text-slate-400">GitHub, LinkedIn & Proof</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md">
                <div className="w-9 h-9 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">50+ Disciplines</h4>
                  <p className="text-[11px] text-slate-400">Tech, Design, Languages, Math</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

