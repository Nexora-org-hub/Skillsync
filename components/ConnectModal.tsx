"use client";

import React, { useState, useEffect } from "react";
import { 
  X, 
  Send, 
  ArrowRightLeft, 
  Sparkles, 
  GraduationCap, 
  MapPin, 
  MessageCircle, 
  Copy, 
  Check, 
  Mail, 
  Phone, 
  ExternalLink,
  AtSign,
  User,
  HeartHandshake
} from "lucide-react";
import { Profile } from "@/types";
import { sendSwapProposal } from "@/lib/supabase";

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
  const [senderContact, setSenderContact] = useState("");
  const [message, setMessage] = useState("");
  const [offeredSkill, setOfferedSkill] = useState("");
  const [requestedSkill, setRequestedSkill] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  // Initialize sender name & contact from localStorage if saved
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedName = localStorage.getItem("skillsync_chat_name") || localStorage.getItem("skillsync_sender_name");
      if (savedName) setSenderName(savedName);

      const savedContact = localStorage.getItem("skillsync_sender_contact");
      if (savedContact) setSenderContact(savedContact);
    }
  }, [isOpen]);

  // Update requested skill when profile changes
  useEffect(() => {
    if (profile && profile.teach_skills.length > 0) {
      setRequestedSkill(profile.teach_skills[0].name);
    } else {
      setRequestedSkill("");
    }
    if (profile && profile.learn_skills.length > 0) {
      setOfferedSkill(profile.learn_skills[0].name);
    } else {
      setOfferedSkill("");
    }
    if (profile) {
      setMessage(`Hi ${profile.name}! I'd love to connect for a 1-on-1 skill exchange.`);
    }
  }, [profile]);

  if (!isOpen || !profile) return null;

  // Smart contact parsing
  const rawContact = profile.contact || profile.contact_email || "";
  
  // 1. Email check
  const isEmail = rawContact.includes("@") && rawContact.includes(".");
  const emailAddress = isEmail ? rawContact.replace(/^mailto:/i, "").trim() : "";
  const emailUrl = isEmail ? `mailto:${emailAddress}?subject=${encodeURIComponent(`SkillSync: Skill Swap Proposal from ${senderName || "a peer"}`)}` : undefined;

  // 2. WhatsApp / Phone check
  const digitsOnly = rawContact.replace(/\D/g, "");
  const isPhoneOrWhatsApp = digitsOnly.length >= 7 || rawContact.startsWith("+") || rawContact.toLowerCase().includes("wa.me") || rawContact.toLowerCase().includes("whatsapp");
  const whatsAppNumber = digitsOnly.length >= 7 ? digitsOnly : digitsOnly;
  const whatsAppUrl = isPhoneOrWhatsApp ? `https://wa.me/${whatsAppNumber}?text=${encodeURIComponent(`Hi ${profile.name}! I saw your profile on SkillSync and would love to swap skills.`)}` : undefined;

  // 3. Instagram check
  const isInstagram = rawContact.startsWith("@") || rawContact.toLowerCase().includes("instagram.com") || (!isEmail && !isPhoneOrWhatsApp && rawContact.length > 0);
  const cleanInsta = rawContact.replace(/^@/, "").replace(/^https?:\/\/(www\.)?instagram\.com\//i, "").replace(/\/$/, "");
  const instagramUrl = isInstagram ? `https://instagram.com/${cleanInsta}` : undefined;

  const handleCopyHandle = (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    if (!rawContact) return;

    navigator.clipboard.writeText(rawContact);
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!senderName.trim() || !senderContact.trim() || !message.trim()) {
      setError("Please fill in your name, your contact details, and a brief message / offer.");
      return;
    }

    setIsSubmitting(true);

    // Save identity for next time
    if (typeof window !== "undefined") {
      localStorage.setItem("skillsync_sender_name", senderName.trim());
      localStorage.setItem("skillsync_chat_name", senderName.trim());
      localStorage.setItem("skillsync_sender_contact", senderContact.trim());
    }

    try {
      const result = await sendSwapProposal({
        sender_name: senderName.trim(),
        sender_contact: senderContact.trim(),
        receiver_id: profile.id,
        receiver_name: profile.name,
        message: message.trim(),
        offered_skill: offeredSkill.trim(),
        requested_skill: requestedSkill.trim()
      });

      setIsSubmitting(false);
      onClose();
      onSuccess(result.message || `Swap proposal submitted to ${profile.name}!`);
    } catch (err: any) {
      setIsSubmitting(false);
      setError(err?.message || "Failed to submit swap proposal.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-xl rounded-3xl bg-white/95 dark:bg-[#0c121e]/95 backdrop-blur-xl border border-slate-200/90 dark:border-indigo-500/20 shadow-2xl overflow-hidden transition-all text-slate-900 dark:text-white"
        role="dialog"
        aria-modal="true"
      >
        {/* Header banner */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white relative border-b border-white/10">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3.5">
            <div className="relative shrink-0">
              {profile.avatar_url ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={profile.avatar_url}
                  alt={profile.name}
                  className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl object-cover border-2 border-indigo-500/40 shadow-md"
                />
              ) : (
                <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-600 text-white font-bold flex items-center justify-center border-2 border-white/20 shadow-md text-lg">
                  {profile.name?.charAt(0) || "U"}
                </div>
              )}
              <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-slate-900" />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-indigo-300 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  Connect & Swap
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-black text-white leading-tight truncate">
                {profile.name}
              </h2>
              <p className="text-xs text-slate-300 flex items-center gap-1 mt-0.5 truncate">
                <GraduationCap className="w-3.5 h-3.5 shrink-0 text-indigo-400" />
                <span className="truncate">{profile.department || "Peer"} • {profile.college}</span>
              </p>
            </div>
          </div>
        </div>

        {/* 1. Direct Contact Action Links Section */}
        {rawContact ? (
          <div className="p-4 sm:p-5 bg-indigo-50/60 dark:bg-indigo-950/25 border-b border-indigo-100/80 dark:border-indigo-900/40 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-bold text-slate-700 dark:text-indigo-200 flex items-center gap-1.5">
                <MessageCircle className="w-3.5 h-3.5 text-indigo-500" />
                Instant Contact & Social Links:
              </span>
              <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 truncate max-w-[180px]">
                {rawContact}
              </span>
            </div>

            {/* Action Buttons Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {/* WhatsApp Button */}
              {isPhoneOrWhatsApp && whatsAppUrl && (
                <a
                  href={whatsAppUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm transition-all active:scale-95"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>WhatsApp</span>
                  <ExternalLink className="w-3 h-3 opacity-70" />
                </a>
              )}

              {/* Email Button */}
              {isEmail && emailUrl && (
                <a
                  href={emailUrl}
                  className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white shadow-sm transition-all active:scale-95"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Send Email</span>
                  <ExternalLink className="w-3 h-3 opacity-70" />
                </a>
              )}

              {/* Instagram Button */}
              {isInstagram && instagramUrl && (
                <a
                  href={instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white shadow-sm transition-all active:scale-95"
                >
                  <AtSign className="w-3.5 h-3.5" />
                  <span>Instagram</span>
                  <ExternalLink className="w-3 h-3 opacity-70" />
                </a>
              )}

              {/* 1-Click Copy Handle Button */}
              <button
                type="button"
                onClick={handleCopyHandle}
                className={`inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all active:scale-95 ${
                  copied
                    ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-700 dark:text-emerald-300 font-bold"
                    : "bg-white dark:bg-slate-800/90 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-sm"
                }`}
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-indigo-500" />
                    <span>Copy Handle</span>
                  </>
                )}
              </button>
            </div>
          </div>
        ) : null}

        {/* 2. Swap Proposal Form */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 max-h-[68vh] overflow-y-auto">
          {error && (
            <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-medium">
              {error}
            </div>
          )}

          <div className="flex items-center gap-2 pb-1">
            <HeartHandshake className="w-4 h-4 text-indigo-500" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Submit Swap Proposal to Supabase
            </h3>
          </div>

          {/* Sender Name & Contact */}
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
                className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-indigo-500/25 focus:border-indigo-500 outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Your Contact (WhatsApp / Email) *
              </label>
              <input
                type="text"
                required
                value={senderContact}
                onChange={(e) => setSenderContact(e.target.value)}
                placeholder="e.g. +1 555-0192 or jordan@uni.edu"
                className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-indigo-500/25 focus:border-indigo-500 outline-none transition-all"
              />
            </div>
          </div>

          {/* Skill Swap Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800">
            {/* Requested Skill */}
            <div>
              <label className="block text-[11px] font-bold text-indigo-600 dark:text-indigo-400 mb-1">
                Skill You Want from {profile.name}
              </label>
              {profile.teach_skills.length > 0 ? (
                <select
                  value={requestedSkill}
                  onChange={(e) => setRequestedSkill(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none"
                >
                  {profile.teach_skills.map((s, i) => (
                    <option key={s.id || i} value={s.name}>
                      {s.name} ({s.category})
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  value={requestedSkill}
                  onChange={(e) => setRequestedSkill(e.target.value)}
                  placeholder="e.g. React, French..."
                  className="w-full px-3 py-2 rounded-xl text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none"
                />
              )}
            </div>

            {/* Offered Skill */}
            <div>
              <label className="block text-[11px] font-bold text-emerald-600 dark:text-emerald-400 mb-1">
                Skill You Offer in Return
              </label>
              <input
                type="text"
                value={offeredSkill}
                onChange={(e) => setOfferedSkill(e.target.value)}
                placeholder="e.g. Python, UI Design, Math..."
                className="w-full px-3 py-2 rounded-xl text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none"
              />
            </div>
          </div>

          {/* Message / Offer textarea */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Your Message / Offer *
            </label>
            <textarea
              rows={3}
              required
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Introduce yourself, propose times to meet on campus/online, or mention specific project topics..."
              className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-indigo-500/25 focus:border-indigo-500 outline-none resize-none transition-all"
            />
          </div>

          {/* Actions */}
          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 disabled:opacity-50 shadow-md shadow-indigo-500/25 active:scale-95 transition-all"
            >
              {isSubmitting ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  <span>Saving to Supabase...</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Proposal</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
