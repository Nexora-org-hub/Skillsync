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
    <div className="group relative flex flex-col justify-between rounded-2xl bg-slate-900/60 backdrop-blur-md border border-slate-800 hover:border-indigo-500/50 hover:shadow-[0_8px_30px_rgb(0,0,0,0.4)] transition-all duration-300 p-6">
      <div className="space-y-4">
        {/* Top Header: Avatar, Online Glow, Name, Department & College */}
        <div className="flex items-start gap-3.5">
          <div className="relative shrink-0">
            {profile.avatar_url ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={profile.avatar_url}
                alt={profile.name}
                className="w-13 h-13 rounded-2xl object-cover border-2 border-indigo-500/40 shadow-md bg-slate-800"
              />
            ) : (
              <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-600 to-cyan-500 text-white font-black text-lg flex items-center justify-center border-2 border-white/15 shadow-md">
                {getInitial(profile.name)}
              </div>
            )}
            {/* Glowing Online Indicator */}
            <span 
              className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-slate-900 shadow-[0_0_8px_rgba(52,211,153,0.8)] animate-pulse" 
              title="Verified & Active on SkillSync" 
            />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-1">
              <h3 className="font-bold text-base text-slate-100 truncate group-hover:text-indigo-400 transition-colors">
                {profile.name}
              </h3>
              {profile.rating !== undefined && profile.rating !== null && (
                <div className="flex items-center gap-1 text-[11px] font-bold text-amber-300 bg-amber-400/10 px-2 py-0.5 rounded-full shrink-0 border border-amber-400/20">
                  <Star className="w-3 h-3 fill-amber-300 text-amber-300" />
                  <span>{profile.rating.toFixed(1)}</span>
                </div>
              )}
            </div>

            {profile.department && (
              <p className="text-xs font-semibold text-cyan-300/90 flex items-center gap-1 mt-0.5 truncate">
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
                    <span className="text-slate-400">{profile.year_of_study}</span>
                  </>
                )}
              </p>
            )}
          </div>
        </div>

        {/* Proof & Socials: Minimalist Icon Buttons */}
        <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
          {profile.linkedin_url && (
            <a
              href={profile.linkedin_url.startsWith("http") ? profile.linkedin_url : `https://${profile.linkedin_url}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-semibold bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 border border-sky-500/30 transition-all hover:scale-105"
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
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-semibold bg-slate-800/80 hover:bg-slate-800 text-slate-200 border border-slate-700/60 transition-all hover:scale-105"
              title="View GitHub Profile"
            >
              <GithubIcon className="w-3 h-3 text-slate-300" />
              <span>GitHub</span>
              <ExternalLink className="w-2.5 h-2.5 opacity-70" />
            </a>
          )}

          {proofUrl && (
            <a
              href={proofUrl.startsWith("http") ? proofUrl : `https://${proofUrl}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-semibold text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 transition-all hover:scale-105"
              title="View Proof / Certificate"
            >
              <Award className="w-3 h-3 text-amber-400" />
              <span>Certificate</span>
              <ExternalLink className="w-2.5 h-2.5 opacity-70" />
            </a>
          )}

          {profile.contact && (
            <button
              onClick={handleCopyContact}
              title="Click to copy contact handle"
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-semibold border transition-all cursor-pointer ${
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
                  <span className="truncate max-w-[110px]">{profile.contact}</span>
                </>
              )}
            </button>
          )}
        </div>

        {/* Bio */}
        {profile.bio && (
          <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
            {profile.bio}
          </p>
        )}

        {/* Demo Video Showcase Button (if attached) */}
        {profile.video_url && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (onWatchDemo && profile.video_url) {
                onWatchDemo(profile.video_url, profile);
              }
            }}
            className="w-full inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 shadow-md shadow-purple-600/20 active:scale-[0.98] transition-all cursor-pointer"
            title={`Watch ${profile.name}'s demo video`}
          >
            <Play className="w-3.5 h-3.5 fill-white text-white" />
            <span>▶ Watch Video Demo</span>
          </button>
        )}

        {/* Clean Skill Trade Section: Split Offering vs Seeking */}
        <div className="space-y-3 pt-1">
          {/* Section 1: Offering (Emerald Pill Block) */}
          <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-800/80 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-emerald-400" />
                Offering
              </span>
              <span className="text-[10px] text-slate-400 font-medium">{profile.teach_skills.length} available</span>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {profile.teach_skills.length > 0 ? (
                profile.teach_skills.map((skill, idx) => (
                  <span
                    key={skill.id || `teach-${idx}`}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-500/10 text-emerald-300 border border-emerald-500/25 hover:bg-emerald-500/20 transition-colors"
                  >
                    <span>{skill.name}</span>
                    {skill.level && (
                      <span className="text-[9px] font-bold text-emerald-300 bg-emerald-500/20 px-1 py-0.2 rounded">
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

          {/* Section 2: Seeking (Indigo/Cyan Pill Block) */}
          <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-800/80 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                <ArrowRightLeft className="w-3 h-3 text-cyan-400" />
                Seeking
              </span>
              <span className="text-[10px] text-slate-400 font-medium">{profile.learn_skills.length} wanted</span>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {profile.learn_skills.length > 0 ? (
                profile.learn_skills.map((skill, idx) => (
                  <span
                    key={skill.id || `learn-${idx}`}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-indigo-500/10 text-cyan-300 border border-indigo-500/25 hover:bg-indigo-500/20 transition-colors"
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
      </div>

      {/* Bottom CTA: Full-width vibrant Connect & Swap + Quick Chat/Call */}
      <div className="pt-4 mt-4 border-t border-slate-800/80 space-y-2.5">
        <div className="flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center gap-1.5">
            <Clock className="w-3 h-3 text-slate-500" />
            <span>{profile.availability || "Flexible Campus Hours"}</span>
          </div>
          <span className="inline-flex items-center gap-1 text-emerald-400 font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            100% Free Swap
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Quick Chat */}
          <button
            onClick={() => onChat(profile)}
            className="p-2.5 rounded-xl text-slate-300 bg-slate-800/80 hover:bg-slate-800 hover:text-white border border-slate-700/60 transition-all hover:scale-105 active:scale-95 cursor-pointer"
            title={`Open live chat with ${profile.name}`}
          >
            <MessageSquare className="w-4 h-4 text-indigo-400" />
          </button>

          {/* Quick Video Call */}
          {onStartVideoCall && (
            <button
              onClick={() => {
                const roomId = `call-${profile.id.replace(/[^a-zA-Z0-9]/g, "").slice(0, 10)}`;
                onStartVideoCall(roomId, profile.name, profile.avatar_url);
              }}
              className="p-2.5 rounded-xl text-purple-300 bg-purple-950/40 hover:bg-purple-900/60 border border-purple-500/30 transition-all hover:scale-105 active:scale-95 cursor-pointer"
              title={`Start 1-on-1 Video Session with ${profile.name}`}
            >
              <Video className="w-4 h-4" />
            </button>
          )}

          {/* Full-width Main Connect & Swap CTA */}
          <button
            onClick={() => onConnect(profile)}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 shadow-lg shadow-indigo-600/30 border border-indigo-400/30 hover:scale-[1.02] active:scale-95 transition-all duration-200 cursor-pointer"
            title={`Propose a skill swap with ${profile.name}`}
          >
            <ArrowRightLeft className="w-3.5 h-3.5" />
            <span>Connect &amp; Swap</span>
          </button>
        </div>
      </div>
    </div>
  );
};

