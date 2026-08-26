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
  Award,
  ShieldCheck,
  User,
  HeartHandshake,
  Video
} from "lucide-react";
import { LinkedinIcon, GithubIcon } from "@/components/Icons";
import { Profile } from "@/types";
import { sendSwapProposal } from "@/lib/supabase";

interface ConnectModalProps {
  profile: Profile | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (message: string) => void;
  onStartVideoCall?: (roomId: string, peerName: string, peerAvatar?: string) => void;
}

export const ConnectModal: React.FC<ConnectModalProps> = ({
  profile,
  isOpen,
  onClose,
  onSuccess,
  onStartVideoCall
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

  const proofUrl = profile.certificate_url || profile.proof_url;

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
        to_profile_id: profile.id,
        from_name: senderName.trim(),
        from_contact: senderContact.trim(),
        message: message.trim(),
        offered_skill: offeredSkill.trim() || "Mutual Skill Exchange",
        requested_skill: requestedSkill.trim() || profile.teach_skills?.[0]?.name || "",
        receiver_id: profile.id,
        receiver_name: profile.name,
        sender_name: senderName.trim(),
        sender_contact: senderContact.trim()
      });

      setIsSubmitting(false);
      onSuccess(result.message || `Swap proposal sent directly to ${profile.name}!`);
      onClose();
    } catch (err: any) {
      setIsSubmitting(false);
      setError(err?.message || "Failed to send proposal. Please copy their contact info directly.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-xl animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-2xl rounded-3xl bg-[#0d1322]/95 border border-slate-800/80 shadow-2xl shadow-indigo-950/60 overflow-hidden flex flex-col max-h-[90vh]"
        role="dialog"
      >
        {/* Modal Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-slate-950 via-indigo-950/90 to-slate-950 text-white relative border-b border-slate-800/80 shrink-0">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-3">
            <div className="relative shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={profile.avatar_url || "https://api.dicebear.com/7.x/bottts/svg?seed=Nexus&backgroundColor=6366f1"}
                alt={profile.name}
                className="w-14 h-14 rounded-2xl object-cover border border-white/15 bg-slate-800 shadow-md"
              />
              <span className="absolute -bottom-1 -right-1 flex h-3.5 w-3.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-2 border-slate-900"></span>
              </span>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-black text-white">{profile.name}</h2>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  Verified Student
                </span>
              </div>
              <p className="text-xs text-slate-300 flex items-center gap-1.5 flex-wrap mt-0.5">
                {profile.department && <span className="font-semibold text-cyan-300">{profile.department}</span>}
                {profile.college && (
                  <>
                    <span className="text-slate-600">•</span>
                    <span>{profile.college}</span>
                  </>
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-5 overflow-y-auto flex-1">
          {/* Quick Connect Channels & Socials */}
          <div className="p-4 rounded-2xl bg-slate-800/60 border border-white/10 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-bold text-indigo-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                Verified Channels & 1-on-1 Rooms
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Start Video Call Button */}
              {onStartVideoCall && (
                <button
                  type="button"
                  onClick={() => {
                    const roomId = `swap-${profile.id.replace(/[^a-zA-Z0-9]/g, "").slice(0, 10)}`;
                    onStartVideoCall(roomId, profile.name, profile.avatar_url);
                  }}
                  className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-sm transition-all active:scale-95 cursor-pointer"
                >
                  <Video className="w-3.5 h-3.5" />
                  <span>Start Video Room</span>
                </button>
              )}

              {/* LinkedIn Badge Button */}
              {profile.linkedin_url && (
                <a
                  href={profile.linkedin_url.startsWith("http") ? profile.linkedin_url : `https://${profile.linkedin_url}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 border border-sky-500/40 transition-all hover:scale-[1.02]"
                >
                  <LinkedinIcon className="w-3.5 h-3.5 text-sky-400" />
                  <span>LinkedIn</span>
                  <ExternalLink className="w-3 h-3 opacity-70" />
                </a>
              )}

              {/* GitHub Badge Button */}
              {profile.github_url && (
                <a
                  href={profile.github_url.startsWith("http") ? profile.github_url : `https://${profile.github_url}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-white/15 transition-all hover:scale-[1.02]"
                >
                  <GithubIcon className="w-3.5 h-3.5 text-slate-300" />
                  <span>GitHub</span>
                  <ExternalLink className="w-3 h-3 opacity-70" />
                </a>
              )}

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
                  <span>Email</span>
                  <ExternalLink className="w-3 h-3 opacity-70" />
                </a>
              )}

              {/* Copy Contact Handle */}
              {rawContact && !isEmail && !isPhoneOrWhatsApp && (
                <button
                  type="button"
                  onClick={handleCopyHandle}
                  className={`inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all active:scale-95 ${
                    copied
                      ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-300 font-bold"
                      : "bg-slate-800 border-white/10 text-slate-200 hover:bg-slate-700 shadow-sm"
                  }`}
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Copy Handle</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* 2. Proof & Verification Card */}
          {(profile.achievements || proofUrl) && (
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-amber-400" />
                  🏆 Verified Proof & Credentials
                </span>
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-400 bg-emerald-500/15 px-2 py-0.5 rounded-full border border-emerald-500/30">
                  <ShieldCheck className="w-3 h-3" />
                  Verified
                </span>
              </div>

              {profile.achievements && (
                <p className="text-xs text-slate-200 leading-relaxed font-medium">
                  {profile.achievements}
                </p>
              )}

              {proofUrl && (
                <a
                  href={proofUrl.startsWith("http") ? proofUrl : `https://${proofUrl}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-amber-200 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 transition-all hover:scale-[1.01]"
                >
                  <span>View Verified Certificate / Proof</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          )}

          {/* 3. Swap Proposal Form */}
          <form onSubmit={handleSubmit} className="space-y-4 pt-1">
            {error && (
              <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-medium">
                {error}
              </div>
            )}

            <div className="flex items-center gap-2 pb-1">
              <HeartHandshake className="w-4 h-4 text-indigo-400" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Submit 1:1 Skill Swap Proposal
              </h3>
            </div>

            {/* Sender Name & Contact */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Your Name *
                </label>
                <input
                  type="text"
                  required
                  value={senderName}
                  onChange={(e) => setSenderName(e.target.value)}
                  placeholder="e.g. Jordan Lee"
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-800/80 border border-white/10 text-white placeholder-slate-500 outline-none focus:border-indigo-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Your Contact (WhatsApp / Email) *
                </label>
                <input
                  type="text"
                  required
                  value={senderContact}
                  onChange={(e) => setSenderContact(e.target.value)}
                  placeholder="e.g. +1 555-0192 or jordan@uni.edu"
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-800/80 border border-white/10 text-white placeholder-slate-500 outline-none focus:border-indigo-400"
                />
              </div>
            </div>

            {/* Skill Swap Selection */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-2xl bg-slate-800/50 border border-white/10">
              {/* Requested Skill */}
              <div>
                <label className="block text-[11px] font-bold text-cyan-400 mb-1">
                  Skill You Want from {profile.name}
                </label>
                {profile.teach_skills.length > 0 ? (
                  <select
                    value={requestedSkill}
                    onChange={(e) => setRequestedSkill(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl text-xs bg-slate-900 border border-white/10 text-white outline-none focus:border-cyan-400"
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
                    className="w-full px-3 py-2 rounded-xl text-xs bg-slate-900 border border-white/10 text-white outline-none focus:border-cyan-400"
                  />
                )}
              </div>

              {/* Offered Skill */}
              <div>
                <label className="block text-[11px] font-bold text-emerald-400 mb-1">
                  Skill You Offer in Return
                </label>
                <input
                  type="text"
                  value={offeredSkill}
                  onChange={(e) => setOfferedSkill(e.target.value)}
                  placeholder="e.g. Python, UI Design, Math..."
                  className="w-full px-3 py-2 rounded-xl text-xs bg-slate-900 border border-white/10 text-white outline-none focus:border-emerald-400"
                />
              </div>
            </div>

            {/* Message / Offer textarea */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Your Message / Offer *
              </label>
              <textarea
                rows={3}
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Introduce yourself, propose times to meet on campus/online, or mention specific project topics..."
                className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-800/80 border border-white/10 text-white placeholder-slate-500 outline-none focus:border-indigo-400 resize-none"
              />
            </div>

            {/* Actions */}
            <div className="pt-2 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-indigo-600 via-indigo-700 to-blue-600 hover:from-indigo-500 hover:to-blue-500 disabled:opacity-50 shadow-lg shadow-indigo-600/30 active:scale-95 transition-all cursor-pointer"
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
    </div>
  );
};

