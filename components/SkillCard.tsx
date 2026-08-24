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
  Award,
  ExternalLink,
  ShieldCheck,
  Sparkles
} from "lucide-react";
import { LinkedinIcon, GithubIcon } from "@/components/Icons";
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

  const proofUrl = profile.certificate_url || profile.proof_url;

  return (
    <div className="group relative flex flex-col justify-between rounded-3xl bg-slate-900/75 dark:bg-[#0b101b]/90 backdrop-blur-xl border border-white/10 hover:border-indigo-500/50 p-5 sm:p-6 shadow-xl hover:shadow-2xl hover:shadow-indigo-950/40 transition-all duration-300">
      <div>
        {/* Header: Avatar, Name, College, Rating */}
        <div className="flex items-start gap-3.5 mb-3.5">
          <div className="relative shrink-0">
            {profile.avatar_url ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={profile.avatar_url}
                alt={profile.name}
                className="w-14 h-14 rounded-2xl object-cover border-2 border-indigo-500/40 shadow-md bg-slate-800"
              />
            ) : (
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-600 to-cyan-500 text-white font-black text-lg flex items-center justify-center border-2 border-white/15 shadow-md">
                {getInitial(profile.name)}
              </div>
            )}
            {/* Online Status Indicator */}
            <span 
              className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-slate-900 shadow-xs ring-2 ring-emerald-500/20 animate-pulse" 
              title="Verified & Active on SkillSync" 
            />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-1">
              <h3 className="font-bold text-base text-white truncate group-hover:text-indigo-400 transition-colors">
                {profile.name}
              </h3>
              {profile.rating !== undefined && profile.rating !== null && (
                <div className="flex items-center gap-1 text-xs font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-full shrink-0 border border-amber-400/20">
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                  <span>{profile.rating.toFixed(1)}</span>
                  {profile.reviews_count !== undefined && (
                    <span className="text-slate-400 font-normal">({profile.reviews_count})</span>
                  )}
                </div>
              )}
            </div>

            {profile.department && (
              <p className="text-xs font-semibold text-indigo-400 flex items-center gap-1 mt-0.5 truncate">
                <GraduationCap className="w-3.5 h-3.5 shrink-0 text-cyan-400" />
                <span>{profile.department}</span>
              </p>
            )}

            {profile.college && (
              <p className="text-[11px] text-slate-400 flex items-center gap-1 truncate mt-0.5">
                <MapPin className="w-3 h-3 shrink-0 text-slate-500" />
                <span>{profile.college}</span>
                {profile.year_of_study && (
                  <>
                    <span className="text-slate-600">•</span>
                    <span className="text-slate-300">{profile.year_of_study}</span>
                  </>
                )}
              </p>
            )}
          </div>
        </div>

        {/* Professional Badges: LinkedIn & GitHub & Direct Connect */}
        <div className="flex flex-wrap items-center gap-1.5 mb-3.5">
          {profile.linkedin_url && (
            <a
              href={profile.linkedin_url.startsWith("http") ? profile.linkedin_url : `https://${profile.linkedin_url}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-semibold bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 border border-sky-500/30 transition-all hover:scale-[1.02]"
              title="View LinkedIn Profile"
            >
              <LinkedinIcon className="w-3 h-3" />
              <span>LinkedIn</span>
              <ExternalLink className="w-2.5 h-2.5 opacity-70" />
            </a>
          )}

          {profile.github_url && (
            <a
              href={profile.github_url.startsWith("http") ? profile.github_url : `https://${profile.github_url}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-white/10 transition-all hover:scale-[1.02]"
              title="View GitHub Profile"
            >
              <GithubIcon className="w-3 h-3 text-slate-300" />
              <span>GitHub</span>
              <ExternalLink className="w-2.5 h-2.5 opacity-70" />
            </a>
          )}

          {profile.contact && (
            <button
              onClick={handleCopyContact}
              title="Click to copy contact handle"
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-semibold border transition-all ${
                copied
                  ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-300 font-bold"
                  : "bg-indigo-950/40 hover:bg-indigo-900/50 border-indigo-500/30 text-indigo-300"
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-3 h-3 text-emerald-400" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <MessageCircle className="w-3 h-3 text-indigo-400" />
                  <span className="truncate max-w-[120px]">{profile.contact}</span>
                </>
              )}
            </button>
          )}
        </div>

        {/* Bio */}
        {profile.bio && (
          <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed mb-3">
            {profile.bio}
          </p>
        )}

        {/* Public Proof & Achievements Section */}
        {(profile.achievements || proofUrl) && (
          <div className="mb-3.5 p-3 rounded-2xl bg-amber-500/10 border border-amber-500/25 space-y-2">
            <div className="flex items-center justify-between gap-1">
              <span className="text-[11px] font-bold text-amber-300 flex items-center gap-1.5 uppercase tracking-wider">
                <Award className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                🏆 Proof & Achievements
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-400 bg-emerald-500/15 px-2 py-0.5 rounded-full border border-emerald-500/30">
                <ShieldCheck className="w-3 h-3" />
                Peer Verified
              </span>
            </div>

            {profile.achievements && (
              <p className="text-xs text-slate-200 line-clamp-2 font-medium leading-relaxed">
                {profile.achievements}
              </p>
            )}

            {proofUrl && (
              <a
                href={proofUrl.startsWith("http") ? proofUrl : `https://${proofUrl}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-bold text-amber-200 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 transition-all hover:scale-[1.01]"
              >
                <span>View Certificate / Proof</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
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
              className="w-full inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 shadow-md shadow-purple-600/25 active:scale-[0.98] transition-all group/btn cursor-pointer"
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
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              Skills I Can Teach
            </span>
            <span className="text-[10px] text-slate-400 font-medium">{profile.teach_skills.length} available</span>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {profile.teach_skills.length > 0 ? (
              profile.teach_skills.map((skill, idx) => (
                <span
                  key={skill.id || `teach-${idx}`}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-semibold bg-emerald-500/10 text-emerald-300 border border-emerald-500/25 hover:bg-emerald-500/20 transition-colors"
                >
                  <span>{skill.name}</span>
                  {skill.level && (
                    <span className="text-[9px] font-bold text-emerald-300 bg-emerald-500/20 px-1 py-0.2 rounded-md">
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

        {/* Section 2: Skills I Want to Learn (Cyan / Blue Badges) */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
              Skills I Want to Learn
            </span>
            <span className="text-[10px] text-slate-400 font-medium">{profile.learn_skills.length} wanted</span>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {profile.learn_skills.length > 0 ? (
              profile.learn_skills.map((skill, idx) => (
                <span
                  key={skill.id || `learn-${idx}`}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-semibold bg-cyan-500/10 text-cyan-300 border border-cyan-500/25 hover:bg-cyan-500/20 transition-colors"
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
      <div className="pt-3 border-t border-white/10 flex items-center justify-between gap-2 mt-auto">
        <div className="flex items-center gap-1 text-[11px] text-slate-400 truncate max-w-[85px] sm:max-w-none">
          {profile.availability ? (
            <>
              <Clock className="w-3 h-3 text-slate-400 shrink-0" />
              <span className="truncate">{profile.availability}</span>
            </>
          ) : (
            <span className="text-[11px] text-emerald-400 font-medium flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              Available
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {onStartVideoCall && (
            <button
              onClick={() => {
                const roomId = `call-${profile.id.replace(/[^a-zA-Z0-9]/g, "").slice(0, 10)}`;
                onStartVideoCall(roomId, profile.name, profile.avatar_url);
              }}
              className="inline-flex items-center justify-center p-1.5 sm:px-2 sm:py-1.5 rounded-xl text-xs font-semibold text-purple-300 bg-purple-950/40 hover:bg-purple-900/60 border border-purple-500/30 shadow-xs transition-all duration-150 active:scale-95 cursor-pointer"
              title={`Start 1-on-1 Video Session with ${profile.name}`}
            >
              <Video className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            onClick={() => onChat(profile)}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold text-indigo-300 bg-indigo-950/40 hover:bg-indigo-900/60 border border-indigo-500/30 shadow-xs transition-all duration-150 active:scale-95 cursor-pointer"
            title={`Open live chat with ${profile.name}`}
          >
            <MessageSquare className="w-3.5 h-3.5 text-indigo-400" />
            <span>Chat</span>
          </button>

          <button
            onClick={() => onConnect(profile)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 shadow-md shadow-indigo-600/30 transition-all duration-200 active:scale-95 cursor-pointer"
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

