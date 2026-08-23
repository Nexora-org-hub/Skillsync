"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { 
  X, 
  Send, 
  Sparkles, 
  GraduationCap, 
  MapPin, 
  Clock, 
  MessageSquare, 
  Check, 
  CheckCheck,
  User,
  ArrowRightLeft,
  Info
} from "lucide-react";
import { Profile, ChatMessage } from "@/types";
import { getMessages, sendChatMessage, subscribeToMessages } from "@/lib/supabase";

interface ChatDrawerProps {
  profile: Profile | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenConnect?: (profile: Profile) => void;
}

export const ChatDrawer: React.FC<ChatDrawerProps> = ({
  profile,
  isOpen,
  onClose,
  onOpenConnect
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [senderName, setSenderName] = useState("Alex Rivers");
  const [isEditingName, setIsEditingName] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [senderId, setSenderId] = useState<string>("");

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Initialize sender identity from localStorage or crypto UUID
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedName = localStorage.getItem("skillsync_chat_name");
      if (savedName) {
        setSenderName(savedName);
      }
      let savedId = localStorage.getItem("skillsync_chat_sender_id");
      if (!savedId) {
        savedId = typeof crypto !== "undefined" && crypto.randomUUID 
          ? crypto.randomUUID() 
          : `user-${Date.now()}`;
        localStorage.setItem("skillsync_chat_sender_id", savedId);
      }
      setSenderId(savedId);
    }
  }, []);

  const handleSaveName = (newName: string) => {
    const trimmed = newName.trim() || "Student";
    setSenderName(trimmed);
    if (typeof window !== "undefined") {
      localStorage.setItem("skillsync_chat_name", trimmed);
    }
    setIsEditingName(false);
  };

  // Scroll to latest message
  const scrollToBottom = useCallback((smooth = true) => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: smooth ? "smooth" : "auto" });
    }
  }, []);

  // Fetch messages & subscribe to Supabase Realtime when drawer opens
  useEffect(() => {
    if (!isOpen || !profile) return;

    let isMounted = true;
    setLoading(true);

    // 1. Initial message load
    getMessages(profile.id).then((data) => {
      if (isMounted) {
        setMessages(data);
        setLoading(false);
        setTimeout(() => scrollToBottom(false), 100);
      }
    });

    // 2. Realtime listener on Supabase `messages` table
    const unsubscribe = subscribeToMessages(profile.id, (newMsg) => {
      if (!isMounted) return;
      setMessages((prev) => {
        // Prevent duplicates by ID or timestamp+content
        const exists = prev.some(
          (m) => (m.id && newMsg.id && m.id === newMsg.id) ||
                 (m.created_at === newMsg.created_at && m.message === newMsg.message && m.sender_name === newMsg.sender_name)
        );
        if (exists) return prev;
        return [...prev, newMsg];
      });
      setTimeout(() => scrollToBottom(true), 50);
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [isOpen, profile, scrollToBottom]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 300);
    }
  }, [isOpen]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || !profile || sending) return;

    const messageText = inputText.trim();
    setInputText("");
    setSending(true);

    const newMsg: ChatMessage = {
      id: `temp-${Date.now()}`,
      sender_id: senderId || `user-${Date.now()}`,
      sender_name: senderName || "You",
      receiver_id: profile.id,
      receiver_name: profile.name,
      message: messageText,
      created_at: new Date().toISOString()
    };

    // Optimistically update message feed
    setMessages((prev) => [...prev, newMsg]);
    setTimeout(() => scrollToBottom(true), 50);

    try {
      const result = await sendChatMessage(newMsg);
      if (result.success && result.data?.id) {
        // Reconcile temporary id with real Supabase id
        setMessages((prev) =>
          prev.map((m) => (m.id === newMsg.id ? { ...m, id: result.data!.id } : m))
        );
      }
    } catch (err) {
      console.error("Failed to send message via Supabase:", err);
    } finally {
      setSending(false);
    }
  };

  const handleQuickIcebreaker = (icebreaker: string) => {
    setInputText(icebreaker);
    inputRef.current?.focus();
  };

  const formatTime = (isoString?: string) => {
    if (!isoString) return "";
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } catch {
      return "";
    }
  };

  if (!isOpen || !profile) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop Overlay */}
      <div 
        onClick={onClose}
        className="fixed inset-0 bg-slate-950/65 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
        aria-hidden="true"
      />

      {/* Slide-out Drawer Panel */}
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-6 sm:pl-10">
        <aside 
          className="w-screen max-w-md sm:max-w-lg bg-white dark:bg-[#0c121e] border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col transform transition-transform animate-in slide-in-from-right duration-300"
          aria-label="Direct Chat Drawer"
        >
          {/* Header */}
          <header className="p-4 sm:p-5 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white border-b border-slate-800 flex items-center justify-between shrink-0 shadow-md">
            <div className="flex items-center gap-3 min-w-0">
              <div className="relative shrink-0">
                {profile.avatar_url ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={profile.avatar_url}
                    alt={profile.name}
                    className="w-11 h-11 rounded-2xl object-cover border-2 border-indigo-500/40 shadow-sm"
                  />
                ) : (
                  <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-600 text-white font-bold flex items-center justify-center border-2 border-white/20 shadow-sm text-base">
                    {profile.name?.charAt(0) || "U"}
                  </div>
                )}
                <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-slate-900" title="Active Real-time" />
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h2 className="font-bold text-sm sm:text-base text-white truncate">
                    {profile.name}
                  </h2>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    Realtime Live
                  </span>
                </div>
                <p className="text-xs text-slate-300 truncate flex items-center gap-1">
                  <GraduationCap className="w-3 h-3 shrink-0 text-indigo-300" />
                  <span className="truncate">{profile.department || "Peer"} • {profile.college}</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              {onOpenConnect && (
                <button
                  onClick={() => {
                    onClose();
                    onOpenConnect(profile);
                  }}
                  className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 text-xs font-semibold flex items-center gap-1 transition-colors"
                  title="Open Swap Proposal"
                >
                  <ArrowRightLeft className="w-4 h-4 text-indigo-300" />
                  <span className="hidden sm:inline">Swap</span>
                </button>
              )}
              <button
                onClick={onClose}
                className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
                title="Close chat"
                aria-label="Close chat"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </header>

          {/* Identity Bar: Chatting As */}
          <div className="px-4 py-2 bg-slate-100 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800/80 flex items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300 truncate">
              <User className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
              <span>Chatting as:</span>
              {isEditingName ? (
                <input
                  type="text"
                  autoFocus
                  defaultValue={senderName}
                  onBlur={(e) => handleSaveName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSaveName((e.target as HTMLInputElement).value);
                  }}
                  className="px-2 py-0.5 rounded-md bg-white dark:bg-slate-800 border border-indigo-500 text-xs text-slate-900 dark:text-white outline-none"
                />
              ) : (
                <span className="font-bold text-slate-900 dark:text-white truncate">
                  {senderName}
                </span>
              )}
            </div>
            {!isEditingName && (
              <button
                onClick={() => setIsEditingName(true)}
                className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline shrink-0"
              >
                Change Name
              </button>
            )}
          </div>

          {/* Skills Context Strip */}
          <div className="px-4 py-2 bg-indigo-50/50 dark:bg-indigo-950/30 border-b border-indigo-100/60 dark:border-indigo-900/40 flex items-center gap-2 overflow-x-auto scrollbar-none text-[11px]">
            <span className="font-bold text-emerald-600 dark:text-emerald-400 shrink-0">
              Teaches:
            </span>
            <div className="flex items-center gap-1 shrink-0">
              {profile.teach_skills.map((s, i) => (
                <span 
                  key={i} 
                  className="px-2 py-0.5 rounded-lg bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 font-medium"
                >
                  {s.name}
                </span>
              ))}
            </div>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <span className="font-bold text-blue-600 dark:text-blue-400 shrink-0">
              Wants:
            </span>
            <div className="flex items-center gap-1 shrink-0">
              {profile.learn_skills.map((s, i) => (
                <span 
                  key={i} 
                  className="px-2 py-0.5 rounded-lg bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-500/20 font-medium"
                >
                  {s.name}
                </span>
              ))}
            </div>
          </div>

          {/* Messages Feed */}
          <div className="flex-1 p-4 sm:p-5 overflow-y-auto space-y-4">
            {loading ? (
              <div className="flex flex-col items-center justify-center h-48 space-y-2">
                <div className="w-7 h-7 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-xs text-slate-400">Loading conversation history...</p>
              </div>
            ) : messages.length === 0 ? (
              /* Empty Chat Icebreaker view */
              <div className="flex flex-col items-center justify-center py-8 text-center space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Start a conversation with {profile.name}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mt-1">
                    Say hello, ask questions about what they teach, or suggest a 1:1 skill exchange.
                  </p>
                </div>

                {/* Quick icebreakers */}
                <div className="w-full space-y-2 pt-2">
                  <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider text-left pl-1">
                    Quick Starters:
                  </p>
                  {[
                    `Hi ${profile.name}! I noticed you teach ${profile.teach_skills[0]?.name || "skills"}. Would love to learn more!`,
                    `Hey! I saw you want to learn ${profile.learn_skills[0]?.name || "new skills"}. I can help you with that!`,
                    `Hello! What is your typical schedule for a 1-hour skill swap session?`
                  ].map((icebreaker, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleQuickIcebreaker(icebreaker)}
                      className="w-full text-left p-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-indigo-500/40 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/30 transition-all leading-relaxed"
                    >
                      💬 {icebreaker}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              /* Message Bubbles */
              messages.map((msg, index) => {
                const isMe = msg.sender_id === senderId || msg.sender_name === senderName;

                return (
                  <div
                    key={msg.id || index}
                    className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
                  >
                    <div className="flex items-end gap-2 max-w-[85%]">
                      {!isMe && (
                        <div className="w-7 h-7 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center justify-center shrink-0 mb-1">
                          {msg.sender_name?.charAt(0) || "P"}
                        </div>
                      )}

                      <div
                        className={`p-3.5 rounded-2xl text-xs leading-relaxed break-words shadow-sm ${
                          isMe
                            ? "bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-br-xs"
                            : "bg-slate-100 dark:bg-slate-800/90 text-slate-900 dark:text-slate-100 border border-slate-200/80 dark:border-slate-700/60 rounded-bl-xs"
                        }`}
                      >
                        {!isMe && (
                          <span className="block font-bold text-[10px] text-indigo-600 dark:text-indigo-400 mb-1">
                            {msg.sender_name}
                          </span>
                        )}
                        <p className="whitespace-pre-wrap">{msg.message}</p>
                      </div>
                    </div>

                    {/* Timestamp & status indicator */}
                    <div className="flex items-center gap-1 mt-1 text-[10px] text-slate-400 px-1">
                      <span>{formatTime(msg.created_at)}</span>
                      {isMe && (
                        <CheckCheck className="w-3 h-3 text-emerald-500" />
                      )}
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Footer Input Area */}
          <footer className="p-3 sm:p-4 bg-white dark:bg-[#0c121e] border-t border-slate-200 dark:border-slate-800 shrink-0">
            <form onSubmit={handleSendMessage} className="flex items-center gap-2">
              <input
                ref={inputRef}
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={`Message ${profile.name}...`}
                className="flex-1 px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all"
              />
              <button
                type="submit"
                disabled={!inputText.trim() || sending}
                className="inline-flex items-center justify-center w-11 h-11 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-40 disabled:cursor-not-allowed shadow-md shadow-indigo-500/20 active:scale-95 transition-all shrink-0"
                title="Send message"
                aria-label="Send message"
              >
                {sending ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </button>
            </form>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 text-center mt-2 flex items-center justify-center gap-1">
              <Sparkles className="w-3 h-3 text-indigo-400" />
              <span>Real-time messages broadcast live via Supabase Realtime</span>
            </p>
          </footer>
        </aside>
      </div>
    </div>
  );
};
