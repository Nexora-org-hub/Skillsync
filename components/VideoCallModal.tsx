"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Video,
  PhoneOff,
  Copy,
  Check,
  ExternalLink,
  Sparkles,
  Maximize2,
  Minimize2,
  ShieldCheck,
  Users
} from "lucide-react";

interface VideoCallModalProps {
  isOpen: boolean;
  onClose: () => void;
  roomId: string;
  peerName?: string;
  peerAvatar?: string;
}

export const VideoCallModal: React.FC<VideoCallModalProps> = ({
  isOpen,
  onClose,
  roomId,
  peerName = "Campus Peer",
  peerAvatar
}) => {
  const [copied, setCopied] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [iframeLoading, setIframeLoading] = useState(true);

  // Clean and sanitize roomId to guarantee standard URL compatibility
  const sanitizedRoomId = (roomId || "study-room")
    .replace(/[^a-zA-Z0-9-_]/g, "-")
    .toLowerCase();

  const jitsiUrl = `https://meet.jit.si/skillsync-${sanitizedRoomId}`;

  // Reset loading state whenever modal opens or room changes
  useEffect(() => {
    if (isOpen) {
      setIframeLoading(true);
    }
  }, [isOpen, sanitizedRoomId]);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleCopyLink = (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(jitsiUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="video-call-title"
    >
      {/* Backdrop overlay */}
      <div 
        onClick={onClose}
        className="fixed inset-0 -z-10 cursor-pointer"
        aria-hidden="true"
      />

      <div
        className={`relative w-full flex flex-col bg-slate-900 border border-slate-700/80 shadow-2xl rounded-2xl sm:rounded-3xl overflow-hidden transition-all duration-300 ${
          isFullscreen
            ? "fixed inset-0 rounded-none h-full max-w-none border-none z-50"
            : "max-w-5xl h-[88vh] max-h-[900px]"
        }`}
      >
        {/* 1. Header Bar with Controls */}
        <header className="px-4 py-3 sm:px-5 sm:py-3.5 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white border-b border-slate-800 flex items-center justify-between gap-2 sm:gap-4 shrink-0 shadow-md">
          {/* Left: Call Info & Peer Badge */}
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="relative shrink-0">
              {peerAvatar ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={peerAvatar}
                  alt={peerName}
                  className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl object-cover border-2 border-indigo-500/40 shadow-sm"
                />
              ) : (
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-600 text-white font-bold flex items-center justify-center border-2 border-white/20 shadow-sm text-sm sm:text-base">
                  <Video className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
              )}
              <span
                className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-slate-900 animate-pulse"
                title="Live Call Session"
              />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <h2
                  id="video-call-title"
                  className="font-bold text-xs sm:text-sm md:text-base text-white truncate"
                >
                  1-on-1 Video Session with {peerName}
                </h2>
                <span className="hidden xs:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  Encrypted Jitsi
                </span>
              </div>
              <p className="text-[11px] text-slate-300 truncate font-mono flex items-center gap-1">
                <span className="opacity-70">Room:</span>
                <span className="text-indigo-300 font-semibold truncate">
                  skillsync-{sanitizedRoomId}
                </span>
              </p>
            </div>
          </div>

          {/* Right: Quick Action Controls */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Copy Call Link Button */}
            <button
              type="button"
              onClick={handleCopyLink}
              className={`inline-flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl text-xs font-semibold transition-all active:scale-95 border ${
                copied
                  ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-300 font-bold"
                  : "bg-slate-800/90 hover:bg-slate-700/90 border-slate-700 text-slate-200 hover:text-white shadow-xs"
              }`}
              title="Copy public Jitsi meeting link"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="hidden sm:inline">Copied Link!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-indigo-400" />
                  <span className="hidden sm:inline">Copy Call Link</span>
                </>
              )}
            </button>

            {/* Open in New Tab Button */}
            <a
              href={jitsiUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 sm:p-2 rounded-xl bg-slate-800/90 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white transition-colors"
              title="Open call in a new browser tab"
              aria-label="Open in new tab"
            >
              <ExternalLink className="w-4 h-4" />
            </a>

            {/* Toggle Fullscreen Modal Button */}
            <button
              type="button"
              onClick={toggleFullscreen}
              className="p-1.5 sm:p-2 rounded-xl bg-slate-800/90 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white transition-colors hidden xs:flex items-center justify-center"
              title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
              aria-label="Toggle Fullscreen"
            >
              {isFullscreen ? (
                <Minimize2 className="w-4 h-4" />
              ) : (
                <Maximize2 className="w-4 h-4" />
              )}
            </button>

            {/* Leave / Close Call Button */}
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 active:scale-95 shadow-md shadow-rose-600/30 transition-all ml-1"
              title="Leave and close call"
              aria-label="Leave call"
            >
              <PhoneOff className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Leave Call</span>
            </button>
          </div>
        </header>

        {/* 2. Embedded Jitsi Iframe Viewport */}
        <div className="relative flex-1 w-full h-full bg-slate-950 overflow-hidden">
          {iframeLoading && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-slate-950 text-white space-y-3">
              <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
              <div className="text-center">
                <p className="text-sm font-bold text-slate-200">
                  Connecting to Jitsi Room...
                </p>
                <p className="text-xs text-slate-400 mt-0.5">
                  Preparing your camera, mic, and 1-on-1 audio channel
                </p>
              </div>
            </div>
          )}

          <iframe
            src={jitsiUrl}
            title={`1-on-1 Call with ${peerName}`}
            allow="camera; microphone; display-capture; autoplay; clipboard-write; fullscreen"
            onLoad={() => setIframeLoading(false)}
            className="w-full h-full border-0"
          />
        </div>

        {/* 3. Subtle Bottom Helper Bar */}
        <footer className="px-4 py-2 bg-slate-900/95 border-t border-slate-800 text-[11px] text-slate-400 flex flex-wrap items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>WebRTC peer-to-peer audio/video streaming via Jitsi Meet</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleCopyLink}
              className="text-indigo-400 hover:text-indigo-300 underline font-medium cursor-pointer"
            >
              {copied ? "Link Copied!" : "Share Link"}
            </button>
            <span>•</span>
            <button
              onClick={onClose}
              className="text-rose-400 hover:text-rose-300 font-medium cursor-pointer"
            >
              Disconnect
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
};
