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

  // Filter profiles based on search query, category, and skill type
  const filteredProfiles = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();

    return profiles.filter((p) => {
      // 1. Category check
      const matchesCategory =
        selectedCategory === "All" ||
        p.teach_skills.some((s) => s.category === selectedCategory) ||
        p.learn_skills.some((s) => s.category === selectedCategory);

      if (!matchesCategory) return false;

      // 2. Search query check
      if (q) {
        const matchesName = p.name.toLowerCase().includes(q);
        const matchesCollege = p.college.toLowerCase().includes(q);
        const matchesDept = (p.department || "").toLowerCase().includes(q);
        const matchesContact = (p.contact || "").toLowerCase().includes(q);
        const matchesTeach = p.teach_skills.some((s) => s.name.toLowerCase().includes(q));
        const matchesLearn = p.learn_skills.some((s) => s.name.toLowerCase().includes(q));

        if (!matchesName && !matchesCollege && !matchesDept && !matchesContact && !matchesTeach && !matchesLearn) {
          return false;
        }

        // Sub-filter by skill type if query active
        if (skillTypeFilter === "teach" && !matchesTeach && !matchesName) {
          return false;
        }
        if (skillTypeFilter === "learn" && !matchesLearn && !matchesName) {
          return false;
        }
      } else {
        // When no search query, ensure the profile has skills matching type filter
        if (skillTypeFilter === "teach" && p.teach_skills.length === 0) return false;
        if (skillTypeFilter === "learn" && p.learn_skills.length === 0) return false;
      }

      return true;
    });
  }, [profiles, searchQuery, selectedCategory, skillTypeFilter]);

  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedCategory("All");
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

      {/* Discovery Feed Filters */}
      <FilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        skillTypeFilter={skillTypeFilter}
        onSelectSkillType={setSkillTypeFilter}
        resultCount={filteredProfiles.length}
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
          /* Search Filter Empty State */
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center rounded-3xl bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 my-4">
            <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center mb-4">
              <Sparkles className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
              No matching peers found
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mb-6">
              We couldn&apos;t find any students matching &quot;{searchQuery || selectedCategory}&quot;. Try broadening your keywords or reset all filters.
            </p>
            <button
              onClick={handleResetFilters}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-700 shadow-md shadow-indigo-500/20 transition-all"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset All Filters</span>
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
