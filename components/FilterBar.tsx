"use client";

import React from "react";
import { 
  Search, 
  X, 
  Sparkles, 
  BookOpen, 
  Code, 
  Palette, 
  Globe, 
  Briefcase, 
  GraduationCap, 
  Filter,
  RotateCcw
} from "lucide-react";
import { SkillCategory } from "@/types";

interface FilterBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedCategory: SkillCategory;
  onSelectCategory: (category: SkillCategory) => void;
  selectedDepartment: string;
  onSelectDepartment: (department: string) => void;
  departments: string[];
  skillTypeFilter: "all" | "teach" | "learn";
  onSelectSkillType: (type: "all" | "teach" | "learn") => void;
  resultCount: number;
  onClearFilters: () => void;
}

const CATEGORY_PILLS: { label: SkillCategory; display: string; icon: React.FC<{ className?: string }> }[] = [
  { label: "All", display: "All", icon: Sparkles },
  { label: "Tech", display: "Tech", icon: Code },
  { label: "Creative", display: "Creative", icon: Palette },
  { label: "Business", display: "Business", icon: Briefcase },
  { label: "Language", display: "Language", icon: Globe },
  { label: "Academics", display: "Academics", icon: BookOpen },
];

export const FilterBar: React.FC<FilterBarProps> = ({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onSelectCategory,
  selectedDepartment,
  onSelectDepartment,
  departments,
  skillTypeFilter,
  onSelectSkillType,
  resultCount,
  onClearFilters,
}) => {
  const isFiltered = 
    searchQuery.trim() !== "" || 
    (selectedCategory !== "All" && selectedCategory !== ("" as any)) || 
    (selectedDepartment !== "All" && selectedDepartment !== "") || 
    skillTypeFilter !== "all";

  // Check if a category pill matches (handling "Language" / "Languages" equivalence)
  const isCategorySelected = (catLabel: SkillCategory) => {
    if (catLabel === "Language") {
      return selectedCategory === "Language" || selectedCategory === "Languages";
    }
    return selectedCategory === catLabel;
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 space-y-4">
      {/* Search Bar + Department Dropdown + Skill Mode Toggle */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
        {/* 1. Search Box (Matching Teach Skill, Learn Skill, Name, University) */}
        <div className="md:col-span-6 relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-indigo-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            id="skill-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by skill, discipline, verified achievements, or university..."
            className="w-full pl-10 pr-10 py-3 rounded-2xl bg-slate-900/80 backdrop-blur-md border border-white/10 text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-400 transition-all shadow-lg shadow-black/20"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange("")}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-white transition-colors"
              title="Clear search"
              aria-label="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* 2. Major / Department Dropdown Filter */}
        <div className="md:col-span-3 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-cyan-400">
            <GraduationCap className="w-4 h-4" />
          </div>
          <select
            id="department-filter-select"
            value={selectedDepartment}
            onChange={(e) => onSelectDepartment(e.target.value)}
            className="w-full pl-9 pr-8 py-3 rounded-2xl bg-slate-900/80 backdrop-blur-md border border-white/10 text-xs sm:text-sm font-semibold text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-400 transition-all shadow-lg shadow-black/20 appearance-none cursor-pointer"
          >
            <option value="All" className="bg-slate-900 text-white">All Departments / Majors</option>
            {departments.map((dept) => (
              <option key={dept} value={dept} className="bg-slate-900 text-white">
                {dept}
              </option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
            <Filter className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* 3. Skill Type Segmented Control (Teach / Learn / All) */}
        <div className="md:col-span-3 flex justify-start md:justify-end">
          <div className="inline-flex p-1 bg-slate-900/90 backdrop-blur-md rounded-2xl border border-white/10 w-full sm:w-auto justify-between sm:justify-start shadow-lg shadow-black/20">
            <button
              onClick={() => onSelectSkillType("all")}
              className={`flex-1 sm:flex-none px-3.5 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                skillTypeFilter === "all"
                  ? "bg-slate-800 text-white shadow-sm border border-white/10"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              All
            </button>
            <button
              onClick={() => onSelectSkillType("teach")}
              className={`flex-1 sm:flex-none px-3.5 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                skillTypeFilter === "teach"
                  ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/25"
                  : "text-slate-400 hover:text-emerald-400"
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              Teach
            </button>
            <button
              onClick={() => onSelectSkillType("learn")}
              className={`flex-1 sm:flex-none px-3.5 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                skillTypeFilter === "learn"
                  ? "bg-cyan-500 text-slate-950 font-black shadow-md shadow-cyan-500/25"
                  : "text-slate-400 hover:text-cyan-400"
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
              Learn
            </button>
          </div>
        </div>
      </div>

      {/* Category Pills & Active Result Count Row */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-1">
        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-none">
          {CATEGORY_PILLS.map((category) => {
            const Icon = category.icon;
            const isSelected = isCategorySelected(category.label);

            return (
              <button
                key={category.label}
                id={`category-pill-${category.label.toLowerCase()}`}
                onClick={() => onSelectCategory(category.label)}
                className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-150 active:scale-95 cursor-pointer ${
                  isSelected
                    ? "bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-lg shadow-indigo-600/30 font-bold border border-indigo-400/40"
                    : "bg-slate-900/80 backdrop-blur-md border border-white/10 text-slate-300 hover:border-indigo-400/50 hover:bg-slate-800 hover:text-white"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isSelected ? "text-white" : "text-slate-400"}`} />
                <span>{category.display}</span>
              </button>
            );
          })}
        </div>

        {/* Dynamic Active Count & Clear Button */}
        <div className="flex items-center gap-3 self-end sm:self-center shrink-0">
          <div className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-300 bg-slate-900/80 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-white/10">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>
              Showing <strong className="font-bold text-white">{resultCount}</strong> {resultCount === 1 ? "peer swap" : "peer swaps"}
            </span>
          </div>

          {isFiltered && (
            <button
              onClick={onClearFilters}
              className="inline-flex items-center gap-1 text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition-colors py-1 px-2 hover:bg-cyan-950/40 rounded-lg cursor-pointer"
              title="Reset all active filters"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Clear Filters</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

