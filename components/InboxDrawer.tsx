"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  X,
  Inbox,
  Sparkles,
  ArrowRightLeft,
  Mail,
  Phone,
  AtSign,
  Copy,
  Check,
  ExternalLink,
  RefreshCw,
  Clock,
  User,
  GraduationCap,
  MessageSquare,
  Search,
  CheckCircle2,
  ChevronDown
} from "lucide-react";
import { Profile, SwapRequest } from "@/types";
import { getSwapRequests, subscribeToSwapRequests } from "@/lib/supabase";

interface InboxDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  profiles: Profile[];
  onOpenChatWithProfile?: (profile: Profile) => void;
}

export const InboxDrawer: React.FC<InboxDrawerProps> = ({
  isOpen,
  onClose,
  profiles,
  onOpenChatWithProfile
}) => {
  const [selectedProfileId, setSelectedProfileId] = useState<string>("");
  const [requests, setRequests] = useState<SwapRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [profileSearch, setProfileSearch] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Initialize selected profile from localStorage or first available profile
  useEffect(() => {
    if (profiles.length === 0) return;

    if (typeof window !== "undefined") {
      const savedProfileId = localStorage.getItem("skillsync_inbox_profile_id");
      if (savedProfileId && profiles.some((p) => p.id === savedProfileId)) {
        setSelectedProfileId(savedProfileId);
        return;
      }
    }

    if (!selectedProfileId && profiles.length > 0) {
      setSelectedProfileId(profiles[0].id);
    }
  }, [profiles, selectedProfileId]);

  const selectedProfile = profiles.find((p) => p.id === selectedProfileId) || profiles[0] || null;

  // Handle switching active profile
  const handleSelectProfile = (profile: Profile) => {
    setSelectedProfileId(profile.id);
    setIsDropdownOpen(false);
    setProfileSearch("");
    if (typeof window !== "undefined") {
      localStorage.setItem("skillsync_inbox_profile_id", profile.id);
    }
  };

  // Fetch requests for selected profile
  const loadRequests = useCallback(async (profileId: string, showSpinner = true) => {
    if (!profileId) return;
    if (showSpinner) setLoading(true);
    setRefreshing(true);

    try {
      const data = await getSwapRequests(profileId);
      setRequests(data);
    } catch (err) {
      console.error("Failed to load swap requests:", err);
      setRequests([]);
    } finally {
      if (showSpinner) setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Fetch on selected profile change & subscribe to Realtime
  useEffect(() => {
    if (!isOpen || !selectedProfileId) return;

    loadRequests(selectedProfileId, true);

    const unsubscribe = subscribeToSwapRequests(selectedProfileId, (newReq) => {
      setRequests((prev) => {
        // Prevent duplicate IDs
        if (newReq.id && prev.some((r) => r.id === newReq.id)) return prev;
        return [newReq, ...prev];
      });
    });

    return () => {
      unsubscribe();
    };
  }, [isOpen, selectedProfileId, loadRequests]);

  // Relative time helper
  const formatTimeAgo = (isoString?: string) => {
    if (!isoString) return "Recently";
    try {
      const date = new Date(isoString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffSec = Math.floor(diffMs / 1000);
      const diffMin = Math.floor(diffSec / 60);
      const diffHr = Math.floor(diffMin / 60);
      const diffDays = Math.floor(diffHr / 24);

      if (diffSec < 45) return "Just now";
      if (diffMin < 60) return `${diffMin}m ago`;
      if (diffHr < 24) return `${diffHr}h ago`;
      if (diffDays === 1) return "Yesterday";
      if (diffDays < 7) return `${diffDays}d ago`;

      return date.toLocaleDateString([], { month: "short", day: "numeric" });
    } catch {
      return "Recently";
    }
  };

  const handleCopy = (text: string, id: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => {
      setCopiedId(null);
    }, 2000);
  };

  // Helper to parse contact info
  const parseContact = (rawContact: string, senderName: string) => {
    const isEmail = rawContact.includes("@") && rawContact.includes(".");
    const emailAddress = isEmail ? rawContact.replace(/^mailto:/i, "").trim() : "";
    const emailUrl = isEmail
      ? `mailto:${emailAddress}?subject=${encodeURIComponent(`SkillSync: Replying to your skill swap proposal`)}&body=${encodeURIComponent(`Hi ${senderName},\n\nI received your swap proposal on SkillSync and would love to coordinate!`)}`
      : undefined;

    const digitsOnly = rawContact.replace(/\D/g, "");
    const isPhoneOrWhatsApp =
      digitsOnly.length >= 7 ||
      rawContact.startsWith("+") ||
      rawContact.toLowerCase().includes("wa.me") ||
      rawContact.toLowerCase().includes("whatsapp");
    const whatsAppUrl = isPhoneOrWhatsApp
      ? `https://wa.me/${digitsOnly}?text=${encodeURIComponent(`Hi ${senderName}! I saw your swap proposal on SkillSync and would love to connect.`)}`
      : undefined;

    const isInstagram =
      rawContact.startsWith("@") ||
      rawContact.toLowerCase().includes("instagram.com") ||
      (!isEmail && !isPhoneOrWhatsApp && rawContact.length > 0);
    const cleanInsta = rawContact
      .replace(/^@/, "")
      .replace(/^https?:\/\/(www\.)?instagram\.com\//i, "")
      .replace(/\/$/, "");
    const instagramUrl = isInstagram ? `https://instagram.com/${cleanInsta}` : undefined;

    return {
      isEmail,
      emailUrl,
      isPhoneOrWhatsApp,
      whatsAppUrl,
      isInstagram,
      instagramUrl,
      displayContact: rawContact
    };
  };

  if (!isOpen) return null;

  // Filter profiles for dropdown search
  const filteredDropdownProfiles = profiles.filter((p) => {
    const q = profileSearch.toLowerCase().trim();
    if (!q) return true;
    return (
      (p.name || "").toLowerCase().includes(q) ||
      (p.college || "").toLowerCase().includes(q) ||
      (p.department || "").toLowerCase().includes(q)
    );
  });

  return (
    <div className="fixed inset-0 z-50 overflow-hidden" role="dialog" aria-modal="true">
      {/* Backdrop Overlay */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-slate-950/65 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
        aria-hidden="true"
      />

      {/* Slide-out Drawer Panel */}
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-4 sm:pl-10">
        <aside
          className="w-screen max-w-md sm:max-w-lg bg-white dark:bg-[#0c121e] border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col transform transition-transform animate-in slide-in-from-right duration-300 text-slate-900 dark:text-white"
          aria-label="Swap Requests Inbox"
        >
          {/* 1. Header Banner */}
          <header className="p-4 sm:p-5 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white border-b border-slate-800 flex items-center justify-between shrink-0 shadow-md">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-400 shadow-inner">
                <Inbox className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-extrabold text-base sm:text-lg text-white tracking-tight">
                    Swap Inbox
                  </h2>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    {requests.length} {requests.length === 1 ? "Request" : "Requests"}
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-0.5">
                  Incoming peer skill exchange proposals
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => selectedProfileId && loadRequests(selectedProfileId, false)}
                disabled={refreshing}
                className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition-all active:scale-95 disabled:opacity-50"
                title="Refresh requests"
                aria-label="Refresh requests"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin text-indigo-400" : ""}`} />
              </button>
              <button
                onClick={onClose}
                className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
                title="Close inbox"
                aria-label="Close inbox"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </header>

          {/* 2. Profile Selector Switcher */}
          <div className="p-3.5 sm:p-4 bg-slate-50 dark:bg-slate-900/90 border-b border-slate-200 dark:border-slate-800 shrink-0">
            <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
              Viewing Inbox For Profile:
            </label>

            <div className="relative">
              <button
                type="button"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="w-full flex items-center justify-between p-2.5 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 hover:border-indigo-500/50 shadow-sm transition-all text-left"
              >
                {selectedProfile ? (
                  <div className="flex items-center gap-2.5 min-w-0">
                    {selectedProfile.avatar_url ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={selectedProfile.avatar_url}
                        alt={selectedProfile.name}
                        className="w-8 h-8 rounded-xl object-cover border border-indigo-500/30 shrink-0"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                        {selectedProfile.name?.charAt(0) || "U"}
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {selectedProfile.name}
                      </p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                        {selectedProfile.department || "Student"} • {selectedProfile.college}
                      </p>
                    </div>
                  </div>
                ) : (
                  <span className="text-xs text-slate-400">Select your profile...</span>
                )}
                <ChevronDown className={`w-4 h-4 text-slate-400 shrink-0 transition-transform ${isDropdownOpen ? "rotate-180" : ""}`} />
              </button>

              {/* Dropdown Menu */}
              {isDropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-1.5 z-50 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 max-h-64 flex flex-col">
                  {/* Search inside dropdown */}
                  <div className="p-2 border-b border-slate-100 dark:border-slate-700/60 flex items-center gap-2">
                    <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <input
                      type="text"
                      value={profileSearch}
                      onChange={(e) => setProfileSearch(e.target.value)}
                      placeholder="Search profile name or college..."
                      className="w-full text-xs bg-transparent text-slate-900 dark:text-white outline-none placeholder-slate-400"
                      autoFocus
                    />
                  </div>

                  <div className="overflow-y-auto max-h-48 divide-y divide-slate-100 dark:divide-slate-700/40">
                    {filteredDropdownProfiles.length === 0 ? (
                      <div className="p-3 text-center text-xs text-slate-400">
                        No profiles matching &ldquo;{profileSearch}&rdquo;
                      </div>
                    ) : (
                      filteredDropdownProfiles.map((p) => {
                        const isCurrent = p.id === selectedProfileId;
                        return (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() => handleSelectProfile(p)}
                            className={`w-full flex items-center justify-between p-2.5 text-left hover:bg-indigo-50 dark:hover:bg-slate-700/50 transition-colors ${
                              isCurrent ? "bg-indigo-50/70 dark:bg-indigo-950/40 font-semibold" : ""
                            }`}
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              {p.avatar_url ? (
                                /* eslint-disable-next-line @next/next/no-img-element */
                                <img
                                  src={p.avatar_url}
                                  alt={p.name}
                                  className="w-7 h-7 rounded-lg object-cover shrink-0"
                                />
                              ) : (
                                <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                                  {p.name?.charAt(0) || "U"}
                                </div>
                              )}
                              <div className="min-w-0">
                                <p className="text-xs text-slate-900 dark:text-white truncate">
                                  {p.name}
                                </p>
                                <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                                  {p.college}
                                </p>
                              </div>
                            </div>
                            {isCurrent && (
                              <CheckCircle2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                            )}
                          </button>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 3. Requests Feed Area */}
          <div className="flex-1 p-4 sm:p-5 overflow-y-auto space-y-3.5">
            {loading ? (
              <div className="flex flex-col items-center justify-center h-48 space-y-2">
                <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-xs text-slate-400">Loading incoming swap requests...</p>
              </div>
            ) : requests.length === 0 ? (
              /* Empty Inbox State */
              <div className="flex flex-col items-center justify-center py-12 px-4 text-center space-y-3.5">
                <div className="w-14 h-14 rounded-3xl bg-gradient-to-tr from-indigo-500/10 via-blue-500/10 to-emerald-500/10 text-indigo-500 flex items-center justify-center border border-indigo-500/20 shadow-sm">
                  <ArrowRightLeft className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                    No swap requests yet
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mt-1 leading-relaxed">
                    {selectedProfile ? (
                      <span>
                        When campus peers propose a skill exchange with <strong className="text-slate-700 dark:text-slate-300">{selectedProfile.name}</strong>, their proposals and contact info will arrive here instantly.
                      </span>
                    ) : (
                      "Select a profile to view incoming proposals."
                    )}
                  </p>
                </div>
                <div className="p-3 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/30 text-[11px] text-indigo-600 dark:text-indigo-400 max-w-xs text-left">
                  💡 <strong className="font-semibold">Tip:</strong> Make sure your skills and contact handle are up to date on your profile card to get more requests!
                </div>
              </div>
            ) : (
              /* Swap Request Cards List */
              requests.map((req, idx) => {
                const contact = parseContact(req.from_contact, req.from_name);
                const reqId = req.id || `req-${idx}`;

                return (
                  <div
                    key={reqId}
                    className="p-4 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200/90 dark:border-slate-800 shadow-sm hover:shadow-md transition-all space-y-3"
                  >
                    {/* Card Header: Sender Info & Timestamp */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-extrabold text-sm flex items-center justify-center shrink-0 shadow-sm">
                          {req.from_name?.charAt(0) || "P"}
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white truncate">
                            {req.from_name}
                          </h4>
                          <span className="inline-flex items-center gap-1 text-[10px] text-slate-400">
                            <Clock className="w-3 h-3 text-slate-400 shrink-0" />
                            <span>{formatTimeAgo(req.created_at)}</span>
                          </span>
                        </div>
                      </div>

                      {/* Status / Offered Skill Badge */}
                      {req.offered_skill && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shrink-0">
                          <Sparkles className="w-3 h-3" />
                          <span>Offers: {req.offered_skill}</span>
                        </span>
                      )}
                    </div>

                    {/* Proposal Message / Note */}
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/50 text-xs text-slate-700 dark:text-slate-200 leading-relaxed whitespace-pre-wrap">
                      {req.message}
                    </div>

                    {/* Sender Contact Handle */}
                    {req.from_contact && (
                      <div className="flex items-center justify-between gap-2 text-[11px] text-slate-500 dark:text-slate-400 px-1">
                        <span className="font-medium truncate">
                          Contact: <span className="font-mono text-slate-700 dark:text-slate-300">{req.from_contact}</span>
                        </span>
                      </div>
                    )}

                    {/* Direct Action Reply Buttons */}
                    <div className="pt-1 flex flex-wrap items-center gap-1.5">
                      {/* WhatsApp Button */}
                      {contact.isPhoneOrWhatsApp && contact.whatsAppUrl && (
                        <a
                          href={contact.whatsAppUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs transition-all active:scale-95"
                        >
                          <Phone className="w-3.5 h-3.5" />
                          <span>WhatsApp</span>
                          <ExternalLink className="w-3 h-3 opacity-70" />
                        </a>
                      )}

                      {/* Email Button */}
                      {contact.isEmail && contact.emailUrl && (
                        <a
                          href={contact.emailUrl}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-xs transition-all active:scale-95"
                        >
                          <Mail className="w-3.5 h-3.5" />
                          <span>Reply via Email</span>
                          <ExternalLink className="w-3 h-3 opacity-70" />
                        </a>
                      )}

                      {/* Instagram Button */}
                      {contact.isInstagram && contact.instagramUrl && (
                        <a
                          href={contact.instagramUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white shadow-xs transition-all active:scale-95"
                        >
                          <AtSign className="w-3.5 h-3.5" />
                          <span>Instagram</span>
                          <ExternalLink className="w-3 h-3 opacity-70" />
                        </a>
                      )}

                      {/* Copy Handle Button */}
                      {req.from_contact && (
                        <button
                          type="button"
                          onClick={() => handleCopy(req.from_contact, reqId)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all active:scale-95 ${
                            copiedId === reqId
                              ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-700 dark:text-emerald-300 font-bold"
                              : "bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                          }`}
                        >
                          {copiedId === reqId ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-500" />
                              <span>Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5 text-indigo-500" />
                              <span>Copy Contact</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* 4. Footer */}
          <footer className="p-3.5 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 shrink-0 text-center">
            <p className="text-[11px] text-slate-400 dark:text-slate-500 flex items-center justify-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>Live sync with Supabase `swap_requests` table</span>
            </p>
          </footer>
        </aside>
      </div>
    </div>
  );
};
