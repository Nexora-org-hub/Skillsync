"use client";

import React, { useState } from "react";
import { X, Plus, Sparkles, GraduationCap, CheckCircle2, AlertCircle, MessageCircle, AtSign } from "lucide-react";
import { Profile, SkillCategory } from "@/types";
import { createProfileAndSkills } from "@/lib/supabase";

interface AddSkillModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProfileAdded: () => void;
}

export const AddSkillModal: React.FC<AddSkillModalProps> = ({
  isOpen,
  onClose,
  onProfileAdded
}) => {
  const [name, setName] = useState("");
  const [college, setCollege] = useState("");
  const [department, setDepartment] = useState("");
  const [yearOfStudy, setYearOfStudy] = useState("Sophomore (2nd Year)");
  const [contact, setContact] = useState("");
  const [bio, setBio] = useState("");
  const [teachSkillName, setTeachSkillName] = useState("");
  const [teachCategory, setTeachCategory] = useState<Exclude<SkillCategory, 'All'>>("Tech");
  const [learnSkillName, setLearnSkillName] = useState("");
  const [learnCategory, setLearnCategory] = useState<Exclude<SkillCategory, 'All'>>("Creative");
  const [availability, setAvailability] = useState("Weekends & Evenings");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!name.trim() || !college.trim() || !teachSkillName.trim() || !learnSkillName.trim()) {
      setErrorMsg("Please provide your name, university, what you can teach, and what you want to learn.");
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await createProfileAndSkills({
        name: name.trim(),
        college: college.trim(),
        department: department.trim(),
        yearOfStudy: yearOfStudy,
        contact: contact.trim(),
        bio: bio.trim() || `Student at ${college.trim()} eager to trade skills 1-on-1.`,
        teachSkill: {
          name: teachSkillName.trim(),
          category: teachCategory
        },
        learnSkill: {
          name: learnSkillName.trim(),
          category: learnCategory
        }
      });

      if (!result.success) {
        // If RLS blocked insert, provide informative feedback
        if (result.error?.includes("row-level security")) {
          setErrorMsg(
            "Supabase Row-Level Security (RLS) is active on the 'profiles' / 'skills' table. Please add an INSERT policy for the anon role in your Supabase dashboard."
          );
        } else {
          setErrorMsg(result.error || "Failed to save profile. Please try again.");
        }
        setIsSubmitting(false);
        return;
      }

      setIsSubmitting(false);
      onClose();
      onProfileAdded();
    } catch (err: any) {
      console.error("Submission exception:", err);
      setIsSubmitting(false);
      setErrorMsg(err?.message || "An unexpected error occurred.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden"
        role="dialog"
      >
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-indigo-900 via-indigo-800 to-blue-900 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full text-slate-300 hover:text-white hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-indigo-300">
              Join the Network
            </span>
          </div>
          <h2 className="text-xl font-bold text-white">Share Your Skills</h2>
          <p className="text-xs text-indigo-200">Post what you can teach and what you want to learn.</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {errorMsg && (
            <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-medium flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Name and College */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Full Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Sam Taylor"
                className="w-full px-3.5 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                University / College *
              </label>
              <input
                type="text"
                required
                value={college}
                onChange={(e) => setCollege(e.target.value)}
                placeholder="e.g. Stanford University"
                className="w-full px-3.5 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Department and Year */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Department / Major
              </label>
              <input
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                placeholder="e.g. Computer Science"
                className="w-full px-3.5 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Year of Study
              </label>
              <select
                value={yearOfStudy}
                onChange={(e) => setYearOfStudy(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none"
              >
                <option value="Freshman (1st Year)">Freshman (1st Year)</option>
                <option value="Sophomore (2nd Year)">Sophomore (2nd Year)</option>
                <option value="Junior (3rd Year)">Junior (3rd Year)</option>
                <option value="Senior (4th Year)">Senior (4th Year)</option>
                <option value="Graduate Student">Graduate Student</option>
              </select>
            </div>
          </div>

          {/* Contact / Social Handle (NEW) */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <MessageCircle className="w-3.5 h-3.5 text-indigo-500" />
                Contact / Social Handle (Optional)
              </span>
              <span className="text-[10px] text-slate-400 font-normal">WhatsApp, Instagram, Discord, or Email</span>
            </label>
            <input
              type="text"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              placeholder="e.g. @sam_taylor, +1 555-0192, or discord: samt#1234"
              className="w-full px-3.5 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:border-indigo-500"
            />
          </div>

          {/* Teach Skill */}
          <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 space-y-2">
            <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300">
              🎓 Skill You Can Teach *
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div className="sm:col-span-2">
                <input
                  type="text"
                  required
                  value={teachSkillName}
                  onChange={(e) => setTeachSkillName(e.target.value)}
                  placeholder="e.g. Python, Blender 3D, French..."
                  className="w-full px-3 py-1.5 rounded-xl text-xs bg-white dark:bg-slate-800 border border-emerald-300 dark:border-emerald-800 text-slate-900 dark:text-white outline-none"
                />
              </div>
              <div>
                <select
                  value={teachCategory}
                  onChange={(e) => setTeachCategory(e.target.value as any)}
                  className="w-full px-2 py-1.5 rounded-xl text-xs bg-white dark:bg-slate-800 border border-emerald-300 dark:border-emerald-800 text-slate-900 dark:text-white outline-none"
                >
                  <option value="Tech">Tech</option>
                  <option value="Creative">Creative</option>
                  <option value="Academics">Academics</option>
                  <option value="Languages">Languages</option>
                  <option value="Business">Business</option>
                  <option value="Music">Music</option>
                </select>
              </div>
            </div>
          </div>

          {/* Learn Skill */}
          <div className="p-3.5 rounded-2xl bg-blue-500/10 border border-blue-500/20 space-y-2">
            <span className="text-xs font-bold text-blue-800 dark:text-blue-300">
              🎯 Skill You Want to Learn *
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div className="sm:col-span-2">
                <input
                  type="text"
                  required
                  value={learnSkillName}
                  onChange={(e) => setLearnSkillName(e.target.value)}
                  placeholder="e.g. Next.js, Figma, Japanese..."
                  className="w-full px-3 py-1.5 rounded-xl text-xs bg-white dark:bg-slate-800 border border-blue-300 dark:border-blue-800 text-slate-900 dark:text-white outline-none"
                />
              </div>
              <div>
                <select
                  value={learnCategory}
                  onChange={(e) => setLearnCategory(e.target.value as any)}
                  className="w-full px-2 py-1.5 rounded-xl text-xs bg-white dark:bg-slate-800 border border-blue-300 dark:border-blue-800 text-slate-900 dark:text-white outline-none"
                >
                  <option value="Tech">Tech</option>
                  <option value="Creative">Creative</option>
                  <option value="Academics">Academics</option>
                  <option value="Languages">Languages</option>
                  <option value="Business">Business</option>
                  <option value="Music">Music</option>
                </select>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Short Bio (Optional)
            </label>
            <textarea
              rows={2}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell others a bit about your background, projects, or study interests..."
              className="w-full px-3.5 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none resize-none"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 shadow-md shadow-indigo-500/25"
            >
              {isSubmitting ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  <span>Saving to Supabase...</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  <span>Publish Profile</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
