"use client";

import React, { useState } from "react";
import { 
  GraduationCap, 
  MapPin, 
  Star, 
  ArrowRightLeft, 
  Clock, 
  MessageCircle,
  MessageSquare,
  Copy,
  Check,
  Video,
  Play,
  Film
} from "lucide-react";
import { Profile } from "@/types";

interface SkillCardProps {
  profile: Profile;
  onConnect: (profile: Profile) => void;
  onChat: (profile: Profile) => void;
  onStartVideoCall?: (roomId: string, peerName: string, peerAvatar?: string) => void;
  onWatchDemo?: (videoUrl: string, profile: Profile) => void;
}

export const SkillCard: React.FC<SkillCardProps> = ({ 
  profile, 
  onConnect, 
  onChat, 
  onStartVideoCall,
  onWatchDemo 
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopyContact = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!profile.contact) return;

    navigator.clipboard.writeText(profile.contact);
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  const getInitial = (name: string) => {
    if (!name) return "U";
    return name.trim().charAt(0).toUpperCase();
  };

  return (
    <div className="group relative flex flex-col justify-between rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 p-5 sm:p-6 shadow-sm hover:shadow-xl hover:border-indigo-500/40 dark:hover:border-indigo-500/40 transition-all duration-300">
      <div>
        {/* Header: Avatar, Name, College, Rating */}
        <div className="flex items-start gap-3.5 mb-4">
          <div className="relative shrink-0">
            {profile.avatar_url ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={profile.avatar_url}
                alt={profile.name}
                className="w-14 h-14 rounded-2xl object-cover border-2 border-white dark:border-slate-800 shadow-sm"
              />
            ) : (
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-600 text-white font-bold text-lg flex items-center justify-center border-2 border-white dark:border-slate-800 shadow-sm">
                {getInitial(profile.name)}
              </div>
            )}
            <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-900" title="Active on SkillSync" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-1">
              <h3 className="font-bold text-base text-slate-900 dark:text-white truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                {profile.name}
              </h3>
              {profile.rating !== undefined && profile.rating !== null && (
                <div className="flex items-center gap-1 text-xs font-semibold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full shrink-0">
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                  <span>{profile.rating.toFixed(1)}</span>
                  {profile.reviews_count !== undefined && (
                    <span className="text-slate-400 font-normal">({profile.reviews_count})</span>
                  )}
                </div>
              )}
            </div>

            {profile.department && (
              <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 flex items-center gap-1 mt-0.5 truncate">
                <GraduationCap className="w-3.5 h-3.5 shrink-0" />
                <span>{profile.department}</span>
              </p>
            )}

            {profile.college && (
              <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1 truncate mt-0.5">
                <MapPin className="w-3 h-3 shrink-0" />
                <span>{profile.college}</span>
                {profile.year_of_study && (
                  <>
                    <span className="text-slate-300 dark:text-slate-600">•</span>
                    <span>{profile.year_of_study}</span>
                  </>
                )}
              </p>
            )}
          </div>
        </div>

        {/* Bio */}
        {profile.bio && (
          <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed mb-3">
            {profile.bio}
          </p>
        )}

        {/* Contact / Social Handle Pill */}
        {profile.contact && (
          <div className="mb-3.5">
            <button
              onClick={handleCopyContact}
              title="Click to copy contact handle"
              className={`w-full inline-flex items-center justify-between gap-2 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all duration-200 ${
                copied
                  ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-700 dark:text-emerald-300 shadow-sm"
                  : "bg-indigo-50/70 dark:bg-indigo-950/30 border-indigo-200/60 dark:border-indigo-800/40 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100/80 dark:hover:bg-indigo-900/40"
              }`}
            >
              <div className="flex items-center gap-1.5 truncate">
                <MessageCircle className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400 shrink-0" />
                <span className="font-semibold text-[11px]">Connect:</span>
                <span className="truncate text-slate-700 dark:text-slate-200 font-mono text-[11px]">
                  {profile.contact}
                </span>
              </div>
              <div className="shrink-0 flex items-center gap-1 text-[10px] font-semibold">
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span className="text-emerald-600 dark:text-emerald-400">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />
                    <span className="text-slate-400">Copy</span>
                  </>
                )}
              </div>
            </button>
          </div>
        )}

        {/* Demo Video Showcase Button */}
        {profile.video_url && (
          <div className="mb-3.5">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (onWatchDemo && profile.video_url) {
                  onWatchDemo(profile.video_url, profile);
                }
              }}
              className="w-full inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 shadow-sm shadow-purple-500/25 active:scale-[0.98] transition-all group/btn cursor-pointer"
              title={`Watch ${profile.name}'s demo video`}
            >
              <Play className="w-3.5 h-3.5 fill-white text-white" />
              <span>▶ Watch Demo</span>
            </button>
          </div>
        )}

        {/* Section 1: Skills I Can Teach (Emerald Badges) */}
        <div className="mb-3.5">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              Skills I Can Teach
            </span>
            <span className="text-[10px] text-slate-400 font-medium">{profile.teach_skills.length} available</span>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {profile.teach_skills.length > 0 ? (
              profile.teach_skills.map((skill, idx) => (
                <span
                  key={skill.id || `teach-${idx}`}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-medium bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 hover:bg-emerald-500/15 transition-colors"
                >
                  <span>{skill.name}</span>
                  {skill.level && (
                    <span className="text-[9px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1 py-0.2 rounded-md">
                      {skill.level}
                    </span>
                  )}
                </span>
              ))
            ) : (
              <span className="text-xs text-slate-400 italic">No teaching skills listed</span>
            )}
          </div>
        </div>

        {/* Section 2: Skills I Want to Learn (Blue Badges) */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-blue-500"></span>
              Skills I Want to Learn
            </span>
            <span className="text-[10px] text-slate-400 font-medium">{profile.learn_skills.length} wanted</span>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {profile.learn_skills.length > 0 ? (
              profile.learn_skills.map((skill, idx) => (
                <span
                  key={skill.id || `learn-${idx}`}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-medium bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-500/20 hover:bg-blue-500/15 transition-colors"
                >
                  <span>{skill.name}</span>
                </span>
              ))
            ) : (
              <span className="text-xs text-slate-400 italic">Open to all skills</span>
            )}
          </div>
        </div>
      </div>

      {/* Footer: Availability & Actions (Chat + Connect / Swap) */}
      <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2 mt-auto">
        <div className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-[85px] sm:max-w-none">
          {profile.availability ? (
            <>
              <Clock className="w-3 h-3 text-slate-400 shrink-0" />
              <span className="truncate">{profile.availability}</span>
            </>
          ) : (
            <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">Available</span>
          )}
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {onStartVideoCall && (
            <button
              onClick={() => {
                const roomId = `call-${profile.id.replace(/[^a-zA-Z0-9]/g, "").slice(0, 10)}`;
                onStartVideoCall(roomId, profile.name, profile.avatar_url);
              }}
              className="inline-flex items-center justify-center p-1.5 sm:px-2 sm:py-1.5 rounded-xl text-xs font-semibold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/40 hover:bg-purple-100 dark:hover:bg-purple-900/60 border border-purple-200/60 dark:border-purple-800/40 shadow-xs transition-all duration-150 active:scale-95"
              title={`Start 1-on-1 Video Session with ${profile.name}`}
            >
              <Video className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            onClick={() => onChat(profile)}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 border border-indigo-200/60 dark:border-indigo-800/40 shadow-xs transition-all duration-150 active:scale-95"
            title={`Open live chat with ${profile.name}`}
          >
            <MessageSquare className="w-3.5 h-3.5 text-indigo-500" />
            <span>Chat</span>
          </button>

          <button
            onClick={() => onConnect(profile)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold text-white bg-slate-900 dark:bg-indigo-600 hover:bg-indigo-600 dark:hover:bg-indigo-500 shadow-sm transition-all duration-200 active:scale-95 group-hover:shadow-md"
            title={`Propose a skill swap with ${profile.name}`}
          >
            <ArrowRightLeft className="w-3.5 h-3.5" />
            <span>Swap</span>
          </button>
        </div>
      </div>
    </div>
  );
};
