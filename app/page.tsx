"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Navbar } from "@/components/Navbar";
import { HeroBanner } from "@/components/HeroBanner";
import { FilterBar } from "@/components/FilterBar";
import { SkillCard } from "@/components/SkillCard";
import { ConnectModal } from "@/components/ConnectModal";
import { AddSkillModal } from "@/components/AddSkillModal";
import { Profile, SkillCategory } from "@/types";
import { getProfiles } from "@/lib/supabase";
import { 
  Sparkles, 
  RotateCcw, 
  CheckCircle2, 
  Zap, 
  ShieldCheck, 
  Users, 
  PlusCircle,
  GraduationCap, 
  HeartHandshake 
} from "lucide-react";

export default function HomePage() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<SkillCategory>("All");
  const [selectedDepartment, setSelectedDepartment] = useState<string>("All");
  const [skillTypeFilter, setSkillTypeFilter] = useState<"all" | "teach" | "learn">("all");
  
  // Modals
  const [selectedProfileForConnect, setSelectedProfileForConnect] = useState<Profile | null>(null);
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
  const [isAddSkillModalOpen, setIsAddSkillModalOpen] = useState(false);

  // Notification Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getProfiles();
      setProfiles(data);
    } catch (err) {
      console.error("Failed to load profiles from Supabase:", err);
      setProfiles([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load profiles from live Supabase on mount
  useEffect(() => {
    loadData();
  }, [loadData]);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  const handleOpenConnect = (profile: Profile) => {
    setSelectedProfileForConnect(profile);
    setIsConnectModalOpen(true);
  };

  const handleProfileAdded = async () => {
    await loadData();
    triggerToast("Your profile and skills have been published to Supabase!");
  };

  // Distinct departments dynamically collected from profiles + campus majors
  const departments = useMemo(() => {
    const fromProfiles = Array.from(
      new Set(
        profiles
          .map((p) => p.department?.trim())
          .filter((d): d is string => Boolean(d && d.length > 0))
      )
    );

    const defaultDepts = [
      "Computer Science",
      "Electrical & Computer Engineering",
      "Business Administration",
      "Design & Visual Arts",
      "Data Science & AI",
      "Economics & Finance",
      "Mechanical Engineering",
      "Mathematics & Statistics",
      "Languages & Linguistics",
      "Biology & Life Sciences",
      "Psychology",
      "Physics"
    ];

    const combined = Array.from(new Set([...fromProfiles, ...defaultDepts]));
    return combined.sort((a, b) => a.localeCompare(b));
  }, [profiles]);

  // Filter profiles based on search query, category, department, and skill type
  const filteredProfiles = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();

    return profiles.filter((p) => {
      // 1. Department Filter
      if (selectedDepartment && selectedDepartment !== "All") {
        const pDept = (p.department || "").toLowerCase().trim();
        const targetDept = selectedDepartment.toLowerCase().trim();
        if (pDept !== targetDept && !pDept.includes(targetDept)) {
          return false;
        }
      }

      // 2. Category Filter (Matches Teach or Learn skills, supporting Language / Languages)
      if (selectedCategory && selectedCategory !== "All") {
        const catTarget = selectedCategory.toLowerCase();
        const matchesCategory =
          p.teach_skills.some((s) => {
            const cat = (s.category || "").toLowerCase();
            return cat === catTarget || (catTarget === "language" && cat === "languages") || (catTarget === "languages" && cat === "language");
          }) ||
          p.learn_skills.some((s) => {
            const cat = (s.category || "").toLowerCase();
            return cat === catTarget || (catTarget === "language" && cat === "languages") || (catTarget === "languages" && cat === "language");
          });

        if (!matchesCategory) return false;
      }

      // 3. Search Query Check (Instant client-side filter)
      // Matches: Skill to Teach, Skill to Learn, Full Name, University/College
      if (q) {
        const matchesTeach = p.teach_skills.some((s) => 
          s.name.toLowerCase().includes(q) || (s.category && s.category.toLowerCase().includes(q))
        );
        const matchesLearn = p.learn_skills.some((s) => 
          s.name.toLowerCase().includes(q) || (s.category && s.category.toLowerCase().includes(q))
        );
        const matchesName = 
          (p.name || "").toLowerCase().includes(q) || 
          (p.full_name || "").toLowerCase().includes(q);
        const matchesCollege = (p.college || "").toLowerCase().includes(q);
        const matchesDept = (p.department || "").toLowerCase().includes(q);

        const hasMatch = matchesTeach || matchesLearn || matchesName || matchesCollege || matchesDept;
        if (!hasMatch) return false;

        // Sub-filter by skill type if query active
        if (skillTypeFilter === "teach" && !matchesTeach && !matchesName) {
          return false;
        }
        if (skillTypeFilter === "learn" && !matchesLearn && !matchesName) {
          return false;
        }
      } else {
        // When no search query, ensure the profile has skills matching type filter if selected
        if (skillTypeFilter === "teach" && p.teach_skills.length === 0) return false;
        if (skillTypeFilter === "learn" && p.learn_skills.length === 0) return false;
      }

      return true;
    });
  }, [profiles, searchQuery, selectedCategory, selectedDepartment, skillTypeFilter]);

  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedCategory("All");
    setSelectedDepartment("All");
    setSkillTypeFilter("all");
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#090d16] text-slate-900 dark:text-slate-100">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-2xl bg-slate-900 dark:bg-slate-800 text-white shadow-2xl border border-indigo-500/30 animate-in slide-in-from-bottom-5 duration-300">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <p className="text-xs sm:text-sm font-medium">{toastMessage}</p>
        </div>
      )}

      {/* Navigation Header */}
      <Navbar
        onOpenAddSkill={() => setIsAddSkillModalOpen(true)}
        activeCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        totalStudents={profiles.length}
      />

      {/* Hero Banner */}
      <HeroBanner />

      {/* Discovery Feed Real-time Search & Filter Bar */}
      <FilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        selectedDepartment={selectedDepartment}
        onSelectDepartment={setSelectedDepartment}
        departments={departments}
        skillTypeFilter={skillTypeFilter}
        onSelectSkillType={setSkillTypeFilter}
        resultCount={filteredProfiles.length}
        onClearFilters={handleResetFilters}
      />

      {/* Main Grid Feed */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-sm text-slate-500 mt-4 font-medium">Fetching peer profiles from Supabase...</p>
          </div>
        ) : profiles.length === 0 ? (
          /* Empty Database State */
          <div className="flex flex-col items-center justify-center py-20 px-6 text-center rounded-3xl bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 my-4 shadow-sm">
            <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-indigo-500/20 to-emerald-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-4">
              <GraduationCap className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-extrabold text-slate-900 dark:text-white mb-2">
              No campus peer profiles yet
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 max-w-md mb-6 leading-relaxed">
              Be the first to share what you can teach! Connect with classmates and kick off peer skill exchanges.
            </p>
            <button
              onClick={() => setIsAddSkillModalOpen(true)}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-bold text-white bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 shadow-lg shadow-indigo-500/25 active:scale-95 transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Share My Skill</span>
            </button>
          </div>
        ) : filteredProfiles.length > 0 ? (
          /* Card Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filteredProfiles.map((profile) => (
              <SkillCard
                key={profile.id}
                profile={profile}
                onConnect={handleOpenConnect}
              />
            ))}
          </div>
        ) : (
          /* Search / Filter Empty State */
          <div className="flex flex-col items-center justify-center py-16 px-6 text-center rounded-3xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 my-4 shadow-sm">
            <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-indigo-500/15 via-blue-500/10 to-emerald-500/15 text-indigo-500 flex items-center justify-center mb-4 border border-indigo-500/20 shadow-sm">
              <Sparkles className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
              No matching skill swaps found
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mb-6 leading-relaxed">
              We couldn&apos;t find any student profiles matching your current filters
              {searchQuery && <span> for &ldquo;<strong className="text-slate-800 dark:text-slate-200">{searchQuery}</strong>&rdquo;</span>}
              {selectedCategory !== "All" && <span> in <strong className="text-slate-800 dark:text-slate-200">{selectedCategory}</strong></span>}
              {selectedDepartment !== "All" && <span> within <strong className="text-slate-800 dark:text-slate-200">{selectedDepartment}</strong></span>}
              . Try broadening your keywords or clear your filters to see all available peers.
            </p>
            <button
              id="clear-filters-empty-btn"
              onClick={handleResetFilters}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/25 active:scale-95 transition-all"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Clear Filters</span>
            </button>
          </div>
        )}
      </main>

      {/* Campus Trust / How it works Footer Section */}
      <section className="border-t border-slate-200/80 dark:border-slate-800/80 bg-white/50 dark:bg-slate-950/50 py-10 px-4 sm:px-6 lg:px-8 mt-12">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex gap-4 items-start">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-slate-900 dark:text-white mb-1">
                Zero Money Involved
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                SkillSync runs on a direct barter economy. One hour of teaching earns you one hour of learning from a peer.
              </p>
            </div>
          </div>

          <div className="flex gap-4 items-start">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-slate-900 dark:text-white mb-1">
                Safe Campus Matching
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Students connect with university email verification, transparent ratings, and mutual course project references.
              </p>
            </div>
          </div>

          <div className="flex gap-4 items-start">
            <div className="w-10 h-10 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-slate-900 dark:text-white mb-1">
                Live Supabase Connected
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Integrated real-time database schema for profiles, skills taxonomy, and sync requests with live cloud sync.
              </p>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto mt-8 pt-6 border-t border-slate-200/50 dark:border-slate-800/50 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
          <p>© 2026 SkillSync • Campus Peer-to-Peer Learning Platform</p>
          <div className="flex items-center gap-4">
            <span className="hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer">Community Guidelines</span>
            <span>•</span>
            <span className="hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer">Supabase DB Schema</span>
            <span>•</span>
            <span className="hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer">Support</span>
          </div>
        </div>
      </section>

      {/* Connect Proposal Modal */}
      <ConnectModal
        profile={selectedProfileForConnect}
        isOpen={isConnectModalOpen}
        onClose={() => setIsConnectModalOpen(false)}
        onSuccess={triggerToast}
      />

      {/* Add / Share My Skill Modal */}
      <AddSkillModal
        isOpen={isAddSkillModalOpen}
        onClose={() => setIsAddSkillModalOpen(false)}
        onProfileAdded={handleProfileAdded}
      />
    </div>
  );
}
