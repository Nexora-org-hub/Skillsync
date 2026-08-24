"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Bell,
  Sparkles,
  ArrowRightLeft,
  Clock,
  CheckCheck,
  ChevronRight,
  ExternalLink,
  Inbox,
  CheckCircle2,
  Mail
} from "lucide-react";
import { SwapRequest } from "@/types";
import { getAllRecentSwapRequests, subscribeToAllSwapRequests } from "@/lib/supabase";

interface NotificationBellProps {
  onOpenInbox: () => void;
  onOpenProfileInbox?: (profileId: string) => void;
}

export const NotificationBell: React.FC<NotificationBellProps> = ({
  onOpenInbox,
  onOpenProfileInbox
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<SwapRequest[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [hasNewPulse, setHasNewPulse] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Time formatter
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

  // Load notifications and calculate unread count based on last seen timestamp
  const loadNotifications = useCallback(async () => {
    try {
      const data = await getAllRecentSwapRequests(10);
      setNotifications(data);

      if (typeof window !== "undefined") {
        const lastSeenStr = localStorage.getItem("skillsync_notifications_last_seen");
        const lastSeenTime = lastSeenStr ? new Date(lastSeenStr).getTime() : 0;

        if (lastSeenTime === 0) {
          setUnreadCount(data.length);
        } else {
          const unread = data.filter((item) => {
            const itemTime = item.created_at ? new Date(item.created_at).getTime() : 0;
            return itemTime > lastSeenTime;
          });
          setUnreadCount(unread.length);
        }
      } else {
        setUnreadCount(data.length);
      }
    } catch (err) {
      console.error("Failed to load notifications:", err);
    }
  }, []);

  // Fetch initial notifications and subscribe to live Supabase inserts
  useEffect(() => {
    loadNotifications();

    const unsubscribe = subscribeToAllSwapRequests((newReq) => {
      setNotifications((prev) => {
        if (newReq.id && prev.some((r) => r.id === newReq.id)) return prev;
        return [newReq, ...prev.slice(0, 14)];
      });
      setUnreadCount((c) => c + 1);
      setHasNewPulse(true);

      setTimeout(() => {
        setHasNewPulse(false);
      }, 4000);
    });

    return () => {
      unsubscribe();
    };
  }, [loadNotifications]);

  // Handle click outside to close popover
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleToggle = () => {
    const nextState = !isOpen;
    setIsOpen(nextState);

    // If opening, mark as seen
    if (nextState && unreadCount > 0) {
      if (typeof window !== "undefined") {
        localStorage.setItem("skillsync_notifications_last_seen", new Date().toISOString());
      }
      setUnreadCount(0);
    }
  };

  const handleMarkAllAsRead = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (typeof window !== "undefined") {
      localStorage.setItem("skillsync_notifications_last_seen", new Date().toISOString());
    }
    setUnreadCount(0);
  };

  const handleNotificationClick = (req: SwapRequest) => {
    setIsOpen(false);
    if (onOpenProfileInbox && req.to_profile_id) {
      if (typeof window !== "undefined") {
        localStorage.setItem("skillsync_inbox_profile_id", req.to_profile_id);
      }
      onOpenProfileInbox(req.to_profile_id);
    } else {
      onOpenInbox();
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Sleek Bell Icon Button */}
      <button
        id="notification-bell-btn"
        type="button"
        onClick={handleToggle}
        className={`relative p-2 sm:p-2.5 rounded-xl border transition-all duration-200 active:scale-95 flex items-center justify-center ${
          isOpen
            ? "bg-indigo-50 dark:bg-slate-800 border-indigo-500/50 text-indigo-600 dark:text-indigo-400 shadow-sm"
            : "bg-slate-100/90 hover:bg-slate-200/90 dark:bg-slate-800/90 dark:hover:bg-slate-800 border-slate-200/80 dark:border-slate-700/80 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:border-indigo-500/30"
        }`}
        title="Swap Proposal Notifications"
        aria-label="Swap Proposal Notifications"
        aria-expanded={isOpen}
      >
        <Bell className={`w-4 h-4 sm:w-4.5 sm:h-4.5 transition-transform ${hasNewPulse ? "animate-bounce text-indigo-500" : ""}`} />

        {/* Unread Glowing Badge Counter */}
        {unreadCount > 0 ? (
          <span className="absolute -top-1 -right-1 flex items-center justify-center">
            {/* Pulsing ring */}
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
            <span className="relative inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-black text-white bg-gradient-to-r from-rose-500 to-pink-600 rounded-full shadow-md shadow-rose-500/40 border border-white dark:border-slate-900 leading-none">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          </span>
        ) : notifications.length > 0 ? (
          /* Subtle dot when notifications exist but are read */
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-indigo-500/60" />
        ) : null}
      </button>

      {/* Quick Preview Popover Dropdown */}
      {isOpen && (
        <div
          className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white dark:bg-[#0c121e] border border-slate-200/90 dark:border-slate-800 shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150 text-slate-900 dark:text-white"
          role="menu"
        >
          {/* Popover Header */}
          <div className="p-3.5 sm:p-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between border-b border-white/10">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-300">
                <Bell className="w-3.5 h-3.5" />
              </div>
              <div>
                <h3 className="font-bold text-xs sm:text-sm text-white flex items-center gap-1.5">
                  <span>Notifications</span>
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    <span className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse" />
                    Live
                  </span>
                </h3>
              </div>
            </div>

            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllAsRead}
                className="text-[11px] font-semibold text-indigo-300 hover:text-white flex items-center gap-1 transition-colors"
                title="Mark all as read"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>Mark read</span>
              </button>
            )}
          </div>

          {/* Popover Body: Notifications Feed */}
          <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60">
            {notifications.length === 0 ? (
              /* Empty Notification State */
              <div className="p-6 text-center space-y-2">
                <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center mx-auto">
                  <Sparkles className="w-5 h-5" />
                </div>
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  All caught up! ✨
                </p>
                <p className="text-[11px] text-slate-400 dark:text-slate-500 max-w-[220px] mx-auto">
                  No swap requests at the moment. New proposal notifications will appear here live.
                </p>
              </div>
            ) : (
              /* Request preview cards */
              notifications.slice(0, 5).map((req, i) => (
                <div
                  key={req.id || i}
                  onClick={() => handleNotificationClick(req)}
                  className="p-3 sm:p-3.5 hover:bg-indigo-50/60 dark:hover:bg-slate-800/50 cursor-pointer transition-colors space-y-1.5 group"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-black text-xs flex items-center justify-center shrink-0">
                        {req.from_name?.charAt(0) || "P"}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-900 dark:text-white truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                          {req.from_name}
                        </p>
                        <span className="text-[10px] text-slate-400 flex items-center gap-1">
                          <Clock className="w-2.5 h-2.5" />
                          <span>{formatTimeAgo(req.created_at)}</span>
                        </span>
                      </div>
                    </div>

                    {req.offered_skill && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[9px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shrink-0">
                        <Sparkles className="w-2.5 h-2.5" />
                        <span className="truncate max-w-[90px]">{req.offered_skill}</span>
                      </span>
                    )}
                  </div>

                  {/* Proposal snippet */}
                  <p className="text-[11px] text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed pl-9">
                    {req.message}
                  </p>
                </div>
              ))
            )}
          </div>

          {/* Popover Footer: 1-click View Full Inbox */}
          <div className="p-2.5 bg-slate-50 dark:bg-slate-900/90 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                onOpenInbox();
              }}
              className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] transition-all shadow-sm"
            >
              <Inbox className="w-3.5 h-3.5" />
              <span>View Full Inbox</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
