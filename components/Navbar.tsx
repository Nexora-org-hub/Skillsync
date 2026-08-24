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
    <header className="sticky top-0 z-30 w-full border-b border-slate-200/80 dark:border-slate-800/80 bg-white/85 dark:bg-slate-950/85 backdrop-blur-md transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-blue-600 to-emerald-500 flex items-center justify-center shadow-md shadow-indigo-500/20 text-white font-bold">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xl tracking-tight text-slate-900 dark:text-white">
                  Skill<span className="text-indigo-600 dark:text-indigo-400">Sync</span>
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  Campus Live
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
                Peer-to-Peer Student Skill Exchange
              </p>
            </div>
          </div>

          {/* Center Category Filter Shortcuts (Desktop) */}
          <nav className="hidden md:flex items-center space-x-1 p-1 bg-slate-100/80 dark:bg-slate-900/80 rounded-xl border border-slate-200/60 dark:border-slate-800/60">
            {quickCategories.map((cat) => {
              const isActive = 
                activeCategory === cat || 
                (cat === "Language" && activeCategory === "Languages") || 
                (cat === "Languages" && activeCategory === "Language");
              return (
                <button
                  key={cat}
                  onClick={() => onSelectCategory(cat)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all duration-150 ${
                    isActive
                      ? "bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm font-semibold"
                      : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </nav>

          {/* Right Action buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="hidden lg:flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800">
              <Users className="w-3.5 h-3.5 text-indigo-500" />
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
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200 bg-slate-100/90 hover:bg-slate-200/90 dark:bg-slate-800/90 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 shadow-xs hover:border-indigo-500/40 active:scale-[0.98] transition-all"
              title="Open Swap Requests Inbox"
            >
              <Inbox className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>Inbox</span>
            </button>

            <button
              id="add-skill-button"
              onClick={onOpenAddSkill}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 shadow-md shadow-indigo-500/20 active:scale-[0.98] transition-all"
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
