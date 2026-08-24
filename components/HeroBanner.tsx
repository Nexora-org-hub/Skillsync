"use client";

import React from "react";
import { ArrowRightLeft, Sparkles, BookOpen, GraduationCap, Zap, ShieldCheck } from "lucide-react";

export const HeroBanner: React.FC = () => {
  return (
    <section className="relative overflow-hidden pt-8 pb-4 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="relative rounded-3xl p-6 sm:p-10 bg-gradient-to-br from-slate-900 via-[#0c1220] to-[#080d1a] border border-white/10 text-white shadow-2xl overflow-hidden backdrop-blur-2xl">
          {/* Background ambient glow shapes */}
          <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-indigo-600/20 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-20 -left-20 w-96 h-96 rounded-full bg-cyan-500/15 blur-3xl pointer-events-none" />
          
          <div className="relative z-10 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/10 text-cyan-300 border border-cyan-400/30 mb-4">
              <Zap className="w-3.5 h-3.5 text-cyan-400" />
              <span>Verified Campus Skill-Exchange Network</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight text-white mb-4">
              Trade what you know. <br className="hidden sm:inline" />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-300 via-cyan-200 to-emerald-300">
                Learn what you want.
              </span>
            </h1>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed mb-6 max-w-2xl font-normal">
              Connect 1-on-1 with verified peers across university departments. Review proof of work, watch demo showcases, and swap knowledge 100% free with verified campus peers.
            </p>

            {/* Micro Highlights */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-900/60 border border-white/10 backdrop-blur-md">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                  <ArrowRightLeft className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Direct 1:1 Swaps</h4>
                  <p className="text-[11px] text-slate-400">Zero fees, pure knowledge barter</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-900/60 border border-white/10 backdrop-blur-md">
                <div className="w-9 h-9 rounded-xl bg-indigo-500/20 text-cyan-300 flex items-center justify-center font-bold">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Verified Portfolios</h4>
                  <p className="text-[11px] text-slate-400">GitHub, LinkedIn & Certificates</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-900/60 border border-white/10 backdrop-blur-md">
                <div className="w-9 h-9 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">50+ Campus Disciplines</h4>
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

