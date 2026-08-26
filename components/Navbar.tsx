"use client";

import React from "react";
import { Sparkles, PlusCircle, Users, GraduationCap, Compass, BookOpen, Inbox } from "lucide-react";
import { SkillCategory } from "@/types";
import { NotificationBell } from "@/components/NotificationBell";

interface NavbarProps {
  onOpenAddSkill: () => void;
  onOpenInbox: () => void;
  onOpenProfileInbox?: (profileId: string) => void;
  activeCategory: SkillCategory;
  onSelectCategory: (category: SkillCategory) => void;
  totalStudents: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenAddSkill,
  onOpenInbox,
  onOpenProfileInbox,
  activeCategory,
  onSelectCategory,
  totalStudents
}) => {
  const quickCategories: SkillCategory[] = ["All", "Tech", "Creative", "Business", "Language", "Academics"];

  return (
    <header className="sticky top-0 z-30 w-full border-b border-slate-800/80 bg-[#0a0f1d]/80 backdrop-blur-xl transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-indigo-600/30 text-white font-bold border border-indigo-400/30 ring-1 ring-white/10">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-xl tracking-tight text-white">
                  Skill<span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-cyan-300 to-emerald-400">Sync</span>
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 shadow-xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  Campus Live
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block font-medium">
                Verified Peer-to-Peer Student Skill Exchange
              </p>
            </div>
          </div>

          {/* Center Category Filter Shortcuts (Desktop) */}
          <nav className="hidden md:flex items-center space-x-1 p-1 bg-slate-900/60 backdrop-blur-md rounded-2xl border border-slate-800/80">
            {quickCategories.map((cat) => {
              const isActive = 
                activeCategory === cat || 
                (cat === "Language" && activeCategory === "Languages") || 
                (cat === "Languages" && activeCategory === "Language");
              return (
                <button
                  key={cat}
                  onClick={() => onSelectCategory(cat)}
                  className={`px-3.5 py-1.5 text-xs rounded-xl transition-all duration-200 cursor-pointer ${
                    isActive
                      ? "bg-gradient-to-r from-indigo-600 to-cyan-600 text-white shadow-md shadow-indigo-600/30 font-bold border border-indigo-400/40"
                      : "text-slate-400 hover:text-slate-100 hover:bg-slate-800/60 font-semibold"
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </nav>

          {/* Right Action buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="hidden lg:flex items-center gap-1.5 text-xs font-semibold text-slate-300 bg-slate-900/60 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-slate-800/80">
              <Users className="w-3.5 h-3.5 text-cyan-400" />
              <span>{totalStudents} Peers Online</span>
            </div>

            {/* Notification Bell */}
            <NotificationBell
              onOpenInbox={onOpenInbox}
              onOpenProfileInbox={onOpenProfileInbox}
            />

            <button
              id="inbox-button"
              onClick={onOpenInbox}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-200 bg-slate-900/80 hover:bg-slate-800 border border-slate-700/60 shadow-md hover:border-indigo-500/50 hover:shadow-indigo-950/40 active:scale-[0.98] transition-all cursor-pointer"
              title="Open Swap Requests Inbox"
            >
              <Inbox className="w-4 h-4 text-cyan-400" />
              <span>Inbox</span>
            </button>

            <button
              id="add-skill-button"
              onClick={onOpenAddSkill}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-indigo-600 via-indigo-700 to-blue-600 hover:from-indigo-500 hover:to-blue-500 shadow-lg shadow-indigo-600/35 border border-indigo-400/30 hover:border-indigo-400/60 active:scale-[0.98] transition-all cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Share My Skill</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

