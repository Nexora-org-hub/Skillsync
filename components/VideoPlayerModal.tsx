"use client";

import React, { useEffect, useRef } from "react";
import { X, Play, Sparkles, ExternalLink, Film, User, CheckCircle2 } from "lucide-react";
import { Profile } from "@/types";

interface VideoPlayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoUrl: string;
  profile?: Profile | null;
}

export const VideoPlayerModal: React.FC<VideoPlayerModalProps> = ({
  isOpen,
  onClose,
  videoUrl,
  profile
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  // Close on ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Pause video if closed
  useEffect(() => {
    if (!isOpen && videoRef.current) {
      videoRef.current.pause();
    }
  }, [isOpen]);

  if (!isOpen || !videoUrl) return null;

  const peerName = profile?.name || profile?.full_name || "Campus Peer";
  const primarySkill = profile?.teach_skills?.[0]?.name || "Skill Demo";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 md:p-8 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="video-player-title"
    >
      {/* Click outside to close backdrop */}
      <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />

      {/* Modal Container */}
      <div className="relative z-10 w-full max-w-4xl bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200">
        {/* 1. Header Bar */}
        <header className="px-4 py-3 sm:px-6 sm:py-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white border-b border-slate-800 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            {profile?.avatar_url ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={profile.avatar_url}
                alt={peerName}
                className="w-10 h-10 rounded-2xl object-cover border-2 border-indigo-500/40 shrink-0 shadow-sm"
              />
            ) : (
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-bold flex items-center justify-center border-2 border-white/20 shrink-0 text-sm">
                <Film className="w-5 h-5" />
              </div>
            )}

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 id="video-player-title" className="text-sm sm:text-base font-bold text-white truncate">
                  {peerName}&apos;s Skill Demo
                </h3>
                <span className="hidden xs:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 shrink-0">
                  <Sparkles className="w-3 h-3" />
                  {primarySkill}
                </span>
              </div>
              <p className="text-xs text-slate-300 truncate">
                {profile?.department ? `${profile.department} • ` : ""}{profile?.college || "Campus Learning Showcase"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <a
              href={videoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
              title="Open video in new tab"
              aria-label="Open video in new tab"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
              title="Close video"
              aria-label="Close video"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* 2. Video Player Viewport */}
        <div className="relative flex-1 w-full bg-black flex items-center justify-center overflow-hidden min-h-[260px] sm:min-h-[400px]">
          <video
            ref={videoRef}
            src={videoUrl}
            controls
            autoPlay
            playsInline
            className="w-full h-full max-h-[70vh] object-contain"
          >
            Your browser does not support the video tag.
          </video>
        </div>

        {/* 3. Footer Bar */}
        <footer className="px-4 py-2.5 sm:px-6 sm:py-3 bg-slate-900/95 border-t border-slate-800 text-xs text-slate-400 flex items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-2 truncate">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span className="truncate">Verified Portfolio Showcase • Hosted on Supabase Storage</span>
          </div>

          <button
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-semibold transition-colors shrink-0 cursor-pointer"
          >
            Close
          </button>
        </footer>
      </div>
    </div>
  );
};
