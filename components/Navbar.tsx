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
    <header className="sticky top-0 z-30 w-full border-b border-white/10 bg-[#090d16]/85 backdrop-blur-xl transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-indigo-600/30 text-white font-bold border border-white/15">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-xl tracking-tight text-white">
                  Skill<span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-cyan-400">Sync</span>
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
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
          <nav className="hidden md:flex items-center space-x-1 p-1 bg-slate-900/80 backdrop-blur-md rounded-2xl border border-white/10">
            {quickCategories.map((cat) => {
              const isActive = 
                activeCategory === cat || 
                (cat === "Language" && activeCategory === "Languages") || 
                (cat === "Languages" && activeCategory === "Language");
              return (
                <button
                  key={cat}
                  onClick={() => onSelectCategory(cat)}
                  className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl transition-all duration-150 cursor-pointer ${
                    isActive
                      ? "bg-slate-800 text-cyan-300 shadow-sm border border-white/10 font-bold"
                      : "text-slate-400 hover:text-white hover:bg-slate-800/50"
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </nav>

          {/* Right Action buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="hidden lg:flex items-center gap-1.5 text-xs font-semibold text-slate-300 bg-slate-900/80 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-white/10">
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
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-200 bg-slate-900/90 hover:bg-slate-800 border border-white/10 shadow-sm hover:border-indigo-500/50 active:scale-[0.98] transition-all cursor-pointer"
              title="Open Swap Requests Inbox"
            >
              <Inbox className="w-4 h-4 text-cyan-400" />
              <span>Inbox</span>
            </button>

            <button
              id="add-skill-button"
              onClick={onOpenAddSkill}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-indigo-600 via-indigo-700 to-blue-600 hover:from-indigo-500 hover:to-blue-500 shadow-lg shadow-indigo-600/30 border border-indigo-400/30 active:scale-[0.98] transition-all cursor-pointer"
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

