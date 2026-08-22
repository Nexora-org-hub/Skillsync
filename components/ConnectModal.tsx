"use client";

import React, { useState } from "react";
import { X, Send, ArrowRightLeft, CheckCircle2, Sparkles, GraduationCap, MapPin, MessageCircle, Copy, Check } from "lucide-react";
import { Profile, SyncRequest } from "@/types";
import { sendSyncRequest } from "@/lib/supabase";

interface ConnectModalProps {
  profile: Profile | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (message: string) => void;
}

export const ConnectModal: React.FC<ConnectModalProps> = ({
  profile,
  isOpen,
  onClose,
  onSuccess
}) => {
  const [senderName, setSenderName] = useState("");
  const [senderEmail, setSenderEmail] = useState("");
  const [offeredSkill, setOfferedSkill] = useState("");
  const [requestedSkill, setRequestedSkill] = useState(
    profile?.teach_skills[0]?.name || ""
  );
  const [preferredMode, setPreferredMode] = useState<
    "In-person (Campus)" | "Online (Google Meet / Zoom)" | "Either"
  >("Either");
  const [note, setNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [contactCopied, setContactCopied] = useState(false);

  // Update requested skill when profile changes
  React.useEffect(() => {
    if (profile && profile.teach_skills.length > 0) {
      setRequestedSkill(profile.teach_skills[0].name);
    } else {
      setRequestedSkill("");
    }
  }, [profile]);

  if (!isOpen || !profile) return null;

  const handleCopyContact = () => {
    if (!profile.contact) return;
    navigator.clipboard.writeText(profile.contact);
    setContactCopied(true);
    setTimeout(() => setContactCopied(false), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!senderName.trim() || !senderEmail.trim()) {
      setError("Please provide your name and campus email to send the swap proposal.");
      return;
    }

    setIsSubmitting(true);

    try {
      const guestSenderId = typeof crypto !== "undefined" && crypto.randomUUID 
        ? crypto.randomUUID() 
        : `sender-${Date.now()}`;

      const payload: SyncRequest = {
        sender_id: guestSenderId,
        sender_name: senderName.trim(),
        sender_email: senderEmail.trim(),
        receiver_id: profile.id,
        receiver_name: profile.name,
        offered_skill: offeredSkill.trim(),
        requested_skill: requestedSkill.trim(),
        preferred_mode: preferredMode,
        note: note.trim() || `Hey ${profile.name}! I'd love to swap skills with you.`,
        status: "pending"
      };

      const result = await sendSyncRequest(payload);
      
      if (!result.success && result.error && !result.error.includes("row-level security")) {
        setError(result.error);
        setIsSubmitting(false);
        return;
      }

      setIsSubmitting(false);
      onClose();
      onSuccess(result.message || `Sync request sent to ${profile.name}!`);
    } catch (err: any) {
      setIsSubmitting(false);
      setError(err?.message || "Failed to send request. Please try again.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden transition-all"
        role="dialog"
        aria-modal="true"
      >
        {/* Header banner */}
        <div className="p-6 bg-gradient-to-r from-indigo-900 via-slate-900 to-indigo-950 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={profile.avatar_url}
              alt={profile.name}
              className="w-12 h-12 rounded-2xl object-cover border-2 border-white/20 shadow-md"
            />
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-semibold uppercase tracking-wider text-indigo-300">
                  Skill Swap Proposal
                </span>
              </div>
              <h2 className="text-lg font-bold text-white leading-tight truncate">
                Connect with {profile.name}
              </h2>
              <p className="text-xs text-slate-300 flex items-center gap-1 mt-0.5 truncate">
                <GraduationCap className="w-3 h-3 shrink-0" />
                <span className="truncate">{profile.department || "Student"}</span> • <span>{profile.college}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Direct Contact Banner (if student provided contact) */}
        {profile.contact && (
          <div className="px-6 py-2.5 bg-indigo-50 dark:bg-indigo-950/40 border-b border-indigo-100 dark:border-indigo-900/50 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-xs text-indigo-900 dark:text-indigo-200 truncate">
              <MessageCircle className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
              <span className="font-semibold">Direct Handle:</span>
              <span className="font-mono text-slate-700 dark:text-slate-300 truncate">{profile.contact}</span>
            </div>
            <button
              type="button"
              onClick={handleCopyContact}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-700 shrink-0 hover:bg-indigo-50"
            >
              {contactCopied ? (
                <>
                  <Check className="w-3 h-3 text-emerald-500" />
                  <span className="text-emerald-500">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-medium">
              {error}
            </div>
          )}

          {/* Student Info inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Your Name *
              </label>
              <input
                type="text"
                required
                value={senderName}
                onChange={(e) => setSenderName(e.target.value)}
                placeholder="e.g. Jordan Lee"
                className="w-full px-3.5 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Your Campus Email *
              </label>
              <input
                type="email"
                required
                value={senderEmail}
                onChange={(e) => setSenderEmail(e.target.value)}
                placeholder="jordan@university.edu"
                className="w-full px-3.5 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
              />
            </div>
          </div>

          {/* Skill Swap Selection */}
          <div className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40 space-y-3">
            {/* Requested Skill */}
            <div>
              <label className="block text-xs font-bold text-indigo-950 dark:text-indigo-200 mb-1 flex items-center justify-between">
                <span>Skill You Want to Learn</span>
                <span className="text-[10px] text-indigo-500">Selected</span>
              </label>
              {profile.teach_skills.length > 0 ? (
                <select
                  value={requestedSkill}
                  onChange={(e) => setRequestedSkill(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl text-xs bg-white dark:bg-slate-800 border border-indigo-200 dark:border-indigo-800 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-indigo-500/20 outline-none"
                >
                  {profile.teach_skills.map((skill, idx) => (
                    <option key={skill.id || idx} value={skill.name}>
                      {skill.name} ({skill.category})
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  value={requestedSkill}
                  onChange={(e) => setRequestedSkill(e.target.value)}
                  placeholder="What would you like to learn from them?"
                  className="w-full px-3.5 py-2 rounded-xl text-xs bg-white dark:bg-slate-800 border border-indigo-200 dark:border-indigo-800 text-slate-900 dark:text-white outline-none"
                />
              )}
            </div>

            <div className="flex justify-center -my-1">
              <div className="w-7 h-7 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-sm">
                <ArrowRightLeft className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Offered Skill */}
            <div>
              <label className="block text-xs font-bold text-emerald-950 dark:text-emerald-200 mb-1 flex items-center justify-between">
                <span>Skill You Offer in Return (Optional)</span>
                {profile.learn_skills.length > 0 && (
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400">
                    They want: {profile.learn_skills.map(s => s.name).join(", ")}
                  </span>
                )}
              </label>
              <input
                type="text"
                value={offeredSkill}
                onChange={(e) => setOfferedSkill(e.target.value)}
                placeholder="e.g. UI/UX Design, Spanish, Python basics..."
                className="w-full px-3.5 py-2 rounded-xl text-xs bg-white dark:bg-slate-800 border border-emerald-300 dark:border-emerald-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20 outline-none"
              />
            </div>
          </div>

          {/* Meeting Mode Preference */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Preferred Format
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(["Either", "Online (Google Meet / Zoom)", "In-person (Campus)"] as const).map((mode) => (
                <button
                  type="button"
                  key={mode}
                  onClick={() => setPreferredMode(mode)}
                  className={`px-2.5 py-2 rounded-xl text-[11px] font-semibold border transition-all text-center ${
                    preferredMode === mode
                      ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                      : "bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-slate-300"
                  }`}
                >
                  {mode.split(" ")[0]}
                </button>
              ))}
            </div>
          </div>

          {/* Note message */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Swap Note / Message (Recorded in Supabase)
            </label>
            <textarea
              rows={2}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={`Introduce yourself, specify your schedule, or mention any project you'd like to collaborate on...`}
              className="w-full px-3.5 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none resize-none"
            />
          </div>

          {/* Actions */}
          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 shadow-md shadow-indigo-500/25 transition-all"
            >
              {isSubmitting ? (
                <>
                  <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  <span>Sending to Supabase...</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Swap Request</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
