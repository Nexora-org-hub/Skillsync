"use client";

import React from "react";
import { ArrowRightLeft, Sparkles, BookOpen, GraduationCap, Zap } from "lucide-react";

export const HeroBanner: React.FC = () => {
  return (
    <section className="relative overflow-hidden pt-8 pb-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="relative rounded-3xl p-6 sm:p-10 bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-950 border border-indigo-500/20 text-white shadow-2xl overflow-hidden">
          {/* Background ambient glow shapes */}
          <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-indigo-600/25 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-20 -left-20 w-80 h-80 rounded-full bg-emerald-500/20 blur-3xl pointer-events-none" />
          
          <div className="relative z-10 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-300 border border-indigo-400/30 mb-4">
              <Zap className="w-3.5 h-3.5 text-indigo-400" />
              <span>Campus Skill-Exchange Network</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight text-white mb-4">
              Trade what you know. <br className="hidden sm:inline" />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-300 via-blue-200 to-emerald-300">
                Learn what you want.
              </span>
            </h1>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed mb-6 max-w-2xl">
              Connect 1-on-1 with verified peers across university departments. Teach React to learn UI/UX design, swap linear algebra for conversational Spanish, or trade audio engineering for Python — completely free.
            </p>

            {/* Micro Highlights */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                  <ArrowRightLeft className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Direct 1:1 Swaps</h4>
                  <p className="text-[11px] text-slate-400">Zero fees, pure knowledge barter</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
                <div className="w-9 h-9 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold">
                  <GraduationCap className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Verified Students</h4>
                  <p className="text-[11px] text-slate-400">Stanford, MIT, Berkeley & more</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
                <div className="w-9 h-9 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold">
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
