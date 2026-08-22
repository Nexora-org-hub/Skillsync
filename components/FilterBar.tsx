"use client";

import React from "react";
import { Search, X, Filter, Sparkles, BookOpen, Code, Palette, Globe, Briefcase, Music } from "lucide-react";
import { SkillCategory } from "@/types";

interface FilterBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedCategory: SkillCategory;
  onSelectCategory: (category: SkillCategory) => void;
  skillTypeFilter: "all" | "teach" | "learn";
  onSelectSkillType: (type: "all" | "teach" | "learn") => void;
  resultCount: number;
}

const CATEGORIES: { label: SkillCategory; icon: React.FC<{ className?: string }> }[] = [
  { label: "All", icon: Sparkles },
  { label: "Tech", icon: Code },
  { label: "Creative", icon: Palette },
  { label: "Academics", icon: BookOpen },
  { label: "Languages", icon: Globe },
  { label: "Business", icon: Briefcase },
  { label: "Music", icon: Music },
];

export const FilterBar: React.FC<FilterBarProps> = ({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onSelectCategory,
  skillTypeFilter,
  onSelectSkillType,
  resultCount,
}) => {
  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 space-y-4">
      {/* Top row: Search input + Teach/Learn Mode toggle */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
        {/* Search Box */}
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            id="skill-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by skill name (e.g., Next.js, Figma, French, Linear Algebra) or university..."
            className="w-full pl-10 pr-10 py-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all shadow-sm"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange("")}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              title="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Skill Type Segmented Control */}
        <div className="inline-flex p-1 bg-slate-100 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 self-start md:self-auto">
          <button
            onClick={() => onSelectSkillType("all")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all ${
              skillTypeFilter === "all"
                ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm"
                : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            }`}
          >
            All Skills
          </button>
          <button
            onClick={() => onSelectSkillType("teach")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5 ${
              skillTypeFilter === "teach"
                ? "bg-emerald-500 text-white shadow-sm shadow-emerald-500/20"
                : "text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400"
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            Can Teach
          </button>
          <button
            onClick={() => onSelectSkillType("learn")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5 ${
              skillTypeFilter === "learn"
                ? "bg-blue-600 text-white shadow-sm shadow-blue-500/20"
                : "text-slate-500 hover:text-blue-600 dark:hover:text-blue-400"
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
            Wants to Learn
          </button>
        </div>
      </div>

      {/* Category Filter Chips Bar */}
      <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1 scrollbar-none">
        <div className="flex items-center gap-2">
          {CATEGORIES.map((category) => {
            const Icon = category.icon;
            const isSelected = selectedCategory === category.label;

            return (
              <button
                key={category.label}
                id={`category-chip-${category.label.toLowerCase()}`}
                onClick={() => onSelectCategory(category.label)}
                className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all duration-150 ${
                  isSelected
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/20 font-semibold"
                    : "bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 text-slate-600 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isSelected ? "text-white" : "text-slate-400"}`} />
                <span>{category.label}</span>
              </button>
            );
          })}
        </div>

        {/* Results Counter indicator */}
        <div className="text-xs font-medium text-slate-500 dark:text-slate-400 whitespace-nowrap pl-2">
          Found <span className="font-semibold text-slate-900 dark:text-white">{resultCount}</span> {resultCount === 1 ? "student" : "students"}
        </div>
      </div>
    </div>
  );
};
