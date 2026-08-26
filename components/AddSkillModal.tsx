"use client";

import React, { useState, useRef, useEffect } from "react";
import { 
  X, 
  Plus, 
  Sparkles, 
  GraduationCap, 
  CheckCircle2, 
  AlertCircle, 
  MessageCircle, 
  Award,
  Link as LinkIcon,
  Video,
  Upload,
  Film,
  FileVideo,
  Trash2,
  Play,
  Image as ImageIcon,
  Check,
  Globe
} from "lucide-react";
import { LinkedinIcon, GithubIcon } from "@/components/Icons";
import { Profile, SkillCategory } from "@/types";
import { createProfileAndSkills, uploadSkillVideo } from "@/lib/supabase";

interface AddSkillModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProfileAdded: () => void;
  onErrorToast?: (msg: string) => void;
}

const PRESET_AVATARS = [
  { id: "cyber", name: "Cyber", url: "https://api.dicebear.com/7.x/bottts/svg?seed=Nexus&backgroundColor=6366f1" },
  { id: "dev", name: "Engineer", url: "https://api.dicebear.com/7.x/adventurer/svg?seed=Aiden&backgroundColor=0ea5e9" },
  { id: "designer", name: "Designer", url: "https://api.dicebear.com/7.x/lorelei/svg?seed=Zara&backgroundColor=ec4899" },
  { id: "scholar", name: "Scholar", url: "https://api.dicebear.com/7.x/notionists/svg?seed=Julian&backgroundColor=8b5cf6" },
  { id: "artist", name: "Creative", url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Chloe&backgroundColor=f59e0b" },
  { id: "polyglot", name: "Polyglot", url: "https://api.dicebear.com/7.x/micah/svg?seed=Maya&backgroundColor=10b981" },
  { id: "hacker", name: "Hacker", url: "https://api.dicebear.com/7.x/bottts/svg?seed=Matrix&backgroundColor=14b8a6" },
  { id: "analyst", name: "Analyst", url: "https://api.dicebear.com/7.x/thumbs/svg?seed=Leo&backgroundColor=3b82f6" },
];

export const AddSkillModal: React.FC<AddSkillModalProps> = ({
  isOpen,
  onClose,
  onProfileAdded,
  onErrorToast
}) => {
  const [name, setName] = useState("");
  const [college, setCollege] = useState("");
  const [department, setDepartment] = useState("");
  const [yearOfStudy, setYearOfStudy] = useState("Sophomore (2nd Year)");
  const [selectedAvatar, setSelectedAvatar] = useState(PRESET_AVATARS[0].url);
  const [isCustomAvatar, setIsCustomAvatar] = useState(false);
  const [customAvatarUrl, setCustomAvatarUrl] = useState("");
  
  // Professional Links (replacing Instagram)
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [contact, setContact] = useState("");
  
  // Proof of Work & Verification
  const [achievements, setAchievements] = useState("");
  const [certificateUrl, setCertificateUrl] = useState("");
  
  const [bio, setBio] = useState("");
  const [teachSkillName, setTeachSkillName] = useState("");
  const [teachCategory, setTeachCategory] = useState<Exclude<SkillCategory, 'All'>>("Tech");
  const [learnSkillName, setLearnSkillName] = useState("");
  const [learnCategory, setLearnCategory] = useState<Exclude<SkillCategory, 'All'>>("Creative");
  
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatusText, setSubmitStatusText] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Clean up object URL
  useEffect(() => {
    return () => {
      if (videoPreviewUrl) {
        URL.revokeObjectURL(videoPreviewUrl);
      }
    };
  }, [videoPreviewUrl]);

  const resetForm = () => {
    setName("");
    setCollege("");
    setDepartment("");
    setYearOfStudy("Sophomore (2nd Year)");
    setSelectedAvatar(PRESET_AVATARS[0].url);
    setIsCustomAvatar(false);
    setCustomAvatarUrl("");
    setLinkedinUrl("");
    setGithubUrl("");
    setContact("");
    setAchievements("");
    setCertificateUrl("");
    setBio("");
    setTeachSkillName("");
    setTeachCategory("Tech");
    setLearnSkillName("");
    setLearnCategory("Creative");
    handleRemoveVideo();
    setErrorMsg(null);
    setSubmitStatusText("");
  };

  if (!isOpen) return null;

  const activeAvatarUrl = isCustomAvatar && customAvatarUrl.trim() 
    ? customAvatarUrl.trim() 
    : (selectedAvatar || PRESET_AVATARS[0].url);

  const handleVideoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate video format
    const isValidType = file.type === "video/mp4" || file.type === "video/webm" || file.name.endsWith(".mp4") || file.name.endsWith(".webm");
    if (!isValidType) {
      setErrorMsg("Please upload an MP4 or WebM video file.");
      return;
    }

    // Limit size to ~50MB for smooth uploads
    if (file.size > 50 * 1024 * 1024) {
      setErrorMsg("Video size should be under 50MB for fastest upload.");
      return;
    }

    setErrorMsg(null);
    setVideoFile(file);
    if (videoPreviewUrl) {
      URL.revokeObjectURL(videoPreviewUrl);
    }
    setVideoPreviewUrl(URL.createObjectURL(file));
  };

  const handleRemoveVideo = () => {
    setVideoFile(null);
    if (videoPreviewUrl) {
      URL.revokeObjectURL(videoPreviewUrl);
      setVideoPreviewUrl(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!name.trim() || !college.trim() || !teachSkillName.trim() || !learnSkillName.trim()) {
      const missingFieldsMsg = "Please provide your name, university/college, what you can teach, and what you want to learn.";
      setErrorMsg(missingFieldsMsg);
      onErrorToast?.(missingFieldsMsg);
      return;
    }

    setIsSubmitting(true);
    let uploadedVideoUrl: string | null = null;

    try {
      // 1. Upload showcase video to Supabase Storage if attached
      if (videoFile) {
        setSubmitStatusText("Uploading video showcase to Supabase Storage...");
        const uploadRes = await uploadSkillVideo(videoFile);
        if (uploadRes.success && uploadRes.url) {
          uploadedVideoUrl = uploadRes.url;
        } else {
          console.warn("Video upload note / non-fatal error:", uploadRes.error);
        }
      }

      setSubmitStatusText("Saving verified profile & skills to Supabase...");
      
      // Sanitized payload mapping: ensure optional fields send null if blank
      const result = await createProfileAndSkills({
        name: name.trim(),
        college: college.trim(),
        department: department.trim() ? department.trim() : null,
        yearOfStudy: yearOfStudy ? yearOfStudy : null,
        avatarUrl: activeAvatarUrl,
        contact: contact.trim() ? contact.trim() : null,
        linkedinUrl: linkedinUrl.trim() ? linkedinUrl.trim() : null,
        githubUrl: githubUrl.trim() ? githubUrl.trim() : null,
        achievements: achievements.trim() ? achievements.trim() : null,
        certificateUrl: certificateUrl.trim() ? certificateUrl.trim() : null,
        bio: bio.trim() ? bio.trim() : `Student at ${college.trim()} eager to trade skills 1-on-1.`,
        videoUrl: uploadedVideoUrl,
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
        console.error("Supabase profile publishing failed exact error:", result.error, result.errorDetails);
        let explicitError = result.error || "Failed to save profile. Please try again.";
        if (
          result.error?.includes("row-level security") || 
          result.error?.includes("RLS") || 
          result.error?.includes("violates row-level security policy")
        ) {
          explicitError = "Supabase Row-Level Security (RLS) is active on 'profiles' or 'skills'. Please add an INSERT policy for the anon/public role in your Supabase SQL Editor.";
        }
        setErrorMsg(explicitError);
        onErrorToast?.(explicitError);
        setIsSubmitting(false);
        return;
      }

      // Success flow: Close modal, reset form state, trigger callback to refetch & toast
      setIsSubmitting(false);
      resetForm();
      onClose();
      onProfileAdded();
    } catch (err: any) {
      console.error("Submission exception caught:", err);
      const message = err?.message || "An unexpected error occurred while submitting your profile.";
      setErrorMsg(message);
      onErrorToast?.(message);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-xl rounded-3xl bg-slate-900/95 border border-white/10 shadow-2xl shadow-indigo-950/50 overflow-hidden flex flex-col max-h-[90vh]"
        role="dialog"
      >
        {/* Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white relative border-b border-white/10 shrink-0">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              Verified Campus Network
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white">Share Your Skill & Profile</h2>
          <p className="text-xs text-slate-300">Set up your peer profile with verified links, proof of work, and demo video.</p>
        </div>

        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-5 overflow-y-auto flex-1">
          {errorMsg && (
            <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-medium flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* 1. Avatar Selector (8 Modern Presets + Custom URL) */}
          <div className="p-4 rounded-2xl bg-slate-800/60 border border-white/10 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-indigo-400" />
                Choose Illustrated Avatar *
              </label>
              <button
                type="button"
                onClick={() => setIsCustomAvatar(!isCustomAvatar)}
                className="text-[11px] font-semibold text-cyan-400 hover:text-cyan-300 underline cursor-pointer"
              >
                {isCustomAvatar ? "Pick Illustrated Preset" : "Or use custom image URL"}
              </button>
            </div>

            {!isCustomAvatar ? (
              <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                {PRESET_AVATARS.map((avatar) => {
                  const isSelected = selectedAvatar === avatar.url;
                  return (
                    <button
                      key={avatar.id}
                      type="button"
                      onClick={() => setSelectedAvatar(avatar.url)}
                      className={`relative flex flex-col items-center gap-1 p-1.5 rounded-2xl transition-all cursor-pointer ${
                        isSelected 
                          ? "bg-indigo-600/30 border-2 border-indigo-400 ring-2 ring-indigo-500/40 scale-105" 
                          : "bg-slate-900/60 border border-white/5 hover:border-indigo-400/50 hover:bg-slate-800"
                      }`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={avatar.url}
                        alt={avatar.name}
                        className="w-10 h-10 rounded-xl object-cover bg-slate-800"
                      />
                      <span className="text-[9px] font-medium text-slate-300 truncate w-full text-center">
                        {avatar.name}
                      </span>
                      {isSelected && (
                        <span className="absolute -top-1 -right-1 w-4 h-4 bg-indigo-500 rounded-full flex items-center justify-center text-white">
                          <Check className="w-2.5 h-2.5" />
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="space-y-2">
                <input
                  type="url"
                  value={customAvatarUrl}
                  onChange={(e) => setCustomAvatarUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/... or https://avatars.githubusercontent.com/..."
                  className="w-full px-3.5 py-2 rounded-xl text-xs bg-slate-900 border border-white/10 text-white placeholder-slate-500 outline-none focus:border-cyan-400"
                />
                <p className="text-[10px] text-slate-400">
                  Enter any direct public image URL to use as your avatar.
                </p>
              </div>
            )}
          </div>

          {/* 2. Name and College */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Full Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Sam Taylor"
                className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-800/80 border border-white/10 text-white placeholder-slate-500 outline-none focus:border-indigo-400"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                University / College *
              </label>
              <input
                type="text"
                required
                value={college}
                onChange={(e) => setCollege(e.target.value)}
                placeholder="e.g. Stanford University"
                className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-800/80 border border-white/10 text-white placeholder-slate-500 outline-none focus:border-indigo-400"
              />
            </div>
          </div>

          {/* 3. Department and Year */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Department / Major
              </label>
              <input
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                placeholder="e.g. Computer Science"
                className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-800/80 border border-white/10 text-white placeholder-slate-500 outline-none focus:border-indigo-400"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Year of Study
              </label>
              <select
                value={yearOfStudy}
                onChange={(e) => setYearOfStudy(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-800/80 border border-white/10 text-white outline-none focus:border-indigo-400"
              >
                <option value="Freshman (1st Year)">Freshman (1st Year)</option>
                <option value="Sophomore (2nd Year)">Sophomore (2nd Year)</option>
                <option value="Junior (3rd Year)">Junior (3rd Year)</option>
                <option value="Senior (4th Year)">Senior (4th Year)</option>
                <option value="Graduate Student">Graduate Student</option>
              </select>
            </div>
          </div>

          {/* 4. Professional Links (LinkedIn & GitHub replacing Instagram) */}
          <div className="p-4 rounded-2xl bg-indigo-950/30 border border-indigo-500/20 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-indigo-300 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-indigo-400" />
                Professional Links & Contact
              </label>
              <span className="text-[10px] text-slate-400 font-medium">Verify your profile & credibility</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1 flex items-center gap-1">
                  <LinkedinIcon className="w-3.5 h-3.5 text-sky-400" />
                  LinkedIn Profile URL
                </label>
                <input
                  type="url"
                  value={linkedinUrl}
                  onChange={(e) => setLinkedinUrl(e.target.value)}
                  placeholder="https://linkedin.com/in/username"
                  className="w-full px-3 py-2 rounded-xl text-xs bg-slate-900 border border-white/10 text-white placeholder-slate-500 outline-none focus:border-sky-400"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1 flex items-center gap-1">
                  <GithubIcon className="w-3.5 h-3.5 text-slate-200" />
                  GitHub Profile URL
                </label>
                <input
                  type="url"
                  value={githubUrl}
                  onChange={(e) => setGithubUrl(e.target.value)}
                  placeholder="https://github.com/username"
                  className="w-full px-3 py-2 rounded-xl text-xs bg-slate-900 border border-white/10 text-white placeholder-slate-500 outline-none focus:border-indigo-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1 flex items-center gap-1">
                <MessageCircle className="w-3 h-3 text-emerald-400" />
                Direct Chat / WhatsApp / Email
              </label>
              <input
                type="text"
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                placeholder="e.g. +1 555-0192, sam@stanford.edu, or discord: sam#1234"
                className="w-full px-3 py-2 rounded-xl text-xs bg-slate-900 border border-white/10 text-white placeholder-slate-500 outline-none focus:border-emerald-400"
              />
            </div>
          </div>

          {/* 5. Proof of Work & Verification Section */}
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                <Award className="w-4 h-4 text-amber-400" />
                🏆 Proof of Work & Verification
              </label>
              <span className="text-[10px] text-amber-400/80 font-medium">Helps peers verify your skills</span>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                Key Achievements & Projects
              </label>
              <textarea
                rows={2}
                value={achievements}
                onChange={(e) => setAchievements(e.target.value)}
                placeholder="e.g. 1st Place HackMIT 2025 • Top 1% LeetCode • Built open-source compiler with 500+ GitHub stars • AWS Certified Solutions Architect"
                className="w-full px-3 py-2 rounded-xl text-xs bg-slate-900 border border-white/10 text-white placeholder-slate-500 outline-none focus:border-amber-400 resize-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1 flex items-center gap-1">
                <LinkIcon className="w-3 h-3 text-amber-400" />
                Certificate / Portfolio / Proof Link
              </label>
              <input
                type="url"
                value={certificateUrl}
                onChange={(e) => setCertificateUrl(e.target.value)}
                placeholder="https://coursera.org/verify/... or https://portfolio.dev/project"
                className="w-full px-3 py-2 rounded-xl text-xs bg-slate-900 border border-white/10 text-white placeholder-slate-500 outline-none focus:border-amber-400"
              />
            </div>
          </div>

          {/* 6. Skills to Teach */}
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 space-y-2">
            <span className="text-xs font-bold text-emerald-400">
              🎓 Skill You Can Teach *
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div className="sm:col-span-2">
                <input
                  type="text"
                  required
                  value={teachSkillName}
                  onChange={(e) => setTeachSkillName(e.target.value)}
                  placeholder="e.g. React & TypeScript, Blender 3D, Organic Chemistry..."
                  className="w-full px-3 py-2 rounded-xl text-xs bg-slate-900 border border-emerald-500/30 text-white outline-none focus:border-emerald-400"
                />
              </div>
              <div>
                <select
                  value={teachCategory}
                  onChange={(e) => setTeachCategory(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-slate-900 border border-emerald-500/30 text-white outline-none"
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

          {/* 7. Skills to Learn */}
          <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20 space-y-2">
            <span className="text-xs font-bold text-cyan-400">
              🎯 Skill You Want to Learn *
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div className="sm:col-span-2">
                <input
                  type="text"
                  required
                  value={learnSkillName}
                  onChange={(e) => setLearnSkillName(e.target.value)}
                  placeholder="e.g. Next.js Turbopack, Figma Prototyping, Spanish..."
                  className="w-full px-3 py-2 rounded-xl text-xs bg-slate-900 border border-cyan-500/30 text-white outline-none focus:border-cyan-400"
                />
              </div>
              <div>
                <select
                  value={learnCategory}
                  onChange={(e) => setLearnCategory(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-slate-900 border border-cyan-500/30 text-white outline-none"
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

          {/* 8. Demo Showcase Video (MP4 / WebM) */}
          <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/20 space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-purple-300 flex items-center gap-1.5">
                <Film className="w-3.5 h-3.5 text-purple-400" />
                Demo Showcase Video (Optional)
              </label>
              <span className="text-[10px] text-purple-400 font-medium">MP4 or WebM (Max 50MB)</span>
            </div>

            {!videoFile ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-purple-500/30 hover:border-purple-400 rounded-2xl p-4 text-center cursor-pointer transition-all bg-slate-900/60 hover:bg-purple-950/30 group"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="video/mp4,video/webm,.mp4,.webm"
                  onChange={handleVideoSelect}
                  className="hidden"
                />
                <div className="flex flex-col items-center justify-center gap-1.5">
                  <div className="w-9 h-9 rounded-xl bg-purple-500/20 group-hover:bg-purple-500/30 text-purple-400 flex items-center justify-center transition-colors">
                    <Upload className="w-4 h-4" />
                  </div>
                  <p className="text-xs font-semibold text-slate-200">
                    Click to browse or drop your demo video
                  </p>
                  <p className="text-[10px] text-slate-400">
                    Show off your coding, design, language, or music skills in action
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                {videoPreviewUrl && (
                  <div className="relative rounded-xl overflow-hidden bg-black max-h-44 border border-purple-500/30 flex items-center justify-center">
                    <video
                      src={videoPreviewUrl}
                      controls
                      className="w-full max-h-44 object-contain"
                    />
                  </div>
                )}

                <div className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-slate-900 border border-purple-500/20 text-xs">
                  <div className="flex items-center gap-2 min-w-0">
                    <FileVideo className="w-4 h-4 text-purple-400 shrink-0" />
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-200 truncate text-xs">
                        {videoFile.name}
                      </p>
                      <p className="text-[10px] text-slate-400">
                        {(videoFile.size / (1024 * 1024)).toFixed(2)} MB • Ready to upload to Supabase `skill-videos`
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleRemoveVideo}
                    className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-950/40 transition-colors shrink-0"
                    title="Remove video"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* 9. Bio */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">
              Short Bio (Optional)
            </label>
            <textarea
              rows={2}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell others a bit about your background, favorite tech stack, or campus interests..."
              className="w-full px-3.5 py-2 rounded-xl text-xs bg-slate-800/80 border border-white/10 text-white placeholder-slate-500 outline-none focus:border-indigo-400 resize-none"
            />
          </div>

          {/* Actions */}
          <div className="pt-2 flex items-center justify-end gap-2.5 shrink-0">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              Cancel
            </button>
            <button
              id="publish-my-skill-button"
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-indigo-600 via-indigo-700 to-blue-600 hover:from-indigo-500 hover:to-blue-500 disabled:opacity-60 shadow-lg shadow-indigo-600/30 active:scale-95 transition-all cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  <span>{submitStatusText || "Publishing My Skill..."}</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  <span>Publish My Skill</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
