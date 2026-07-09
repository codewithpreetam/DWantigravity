"use client";

import React, { useState, useEffect, useRef } from "react";
import { Send, User as UserIcon, ShieldAlert, Bell, CheckCircle } from "lucide-react";
import { sendSupportMessageAction } from "@/app/actions/support";

interface SupportChatProps {
  userId: string;
  userRole: string;
  initialMessages: any[];
  adminConversations?: any[]; // Only for admin mode
  initialNotifications?: any[];
  onMarkRead?: () => void;
}

export default function SupportChat({
  userId,
  userRole,
  initialMessages,
  adminConversations = [],
  initialNotifications = [],
  onMarkRead
}: SupportChatProps) {
  const [messages, setMessages] = useState<any[]>(initialMessages);
  const [selectedUser, setSelectedUser] = useState<any>(
    userRole === "ADMIN" && adminConversations.length > 0 ? adminConversations[0].user : null
  );
  const [conversations, setConversations] = useState<any[]>(adminConversations);
  const [content, setContent] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [activeTab, setActiveTab] = useState<"chat" | "notifications">("chat");
  const [notifs, setNotifs] = useState<any[]>(initialNotifications);
  
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll messages list
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, selectedUser]);

  // Load chat messages when selecting user (in Admin mode)
  useEffect(() => {
    if (userRole === "ADMIN" && selectedUser) {
      // Filter local messages for selectedUser
      const filtered = initialMessages.filter(
        (m) =>
          (m.senderId === selectedUser.id && m.receiverId === "user-admin") ||
          (m.senderId === "user-admin" && m.receiverId === selectedUser.id)
      );
      setMessages(filtered);
    }
  }, [selectedUser, initialMessages]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!content.trim() || isPending) return;

    setIsPending(true);
    const formData = new FormData();
    formData.append("senderId", userId);
    
    // In admin mode, send to selected user. In user mode, send to user-admin.
    const targetReceiver = userRole === "ADMIN" ? selectedUser?.id : "user-admin";
    formData.append("receiverId", targetReceiver || "user-admin");
    formData.append("content", content);

    try {
      const res = await sendSupportMessageAction(formData);
      if (res.success) {
        // Optimistically add message
        const newMsg = {
          id: `msg-${Math.random()}`,
          content: content.trim(),
          senderId: userId,
          receiverId: targetReceiver,
          createdAt: new Date()
        };
        setMessages((prev) => [...prev, newMsg]);
        setContent("");
      }
    } catch (err) {
      console.error("Message send failure:", err);
    } finally {
      setIsPending(false);
    }
  };

  const handleMarkNotificationsRead = async () => {
    if (onMarkRead) {
      onMarkRead();
      setNotifs((prev) => prev.map((n) => ({ ...n, read: true })));
    }
  };

  const unreadNotifsCount = notifs.filter((n) => !n.read).length;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[500px] text-xs text-left">
      
      {/* Left side: Navigation / Inbox Toggles / Admin directory */}
      <div className="lg:col-span-4 space-y-4">
        
        {/* Header Title instead of Toggle */}
        <div className="flex gap-2 p-3 glass-panel rounded-xl border border-card-border">
          <div className="flex-1 py-1 text-center font-bold text-foreground">
            Support Inbox
          </div>
        </div>

        {/* Directory sidebar for admin conversation targets */}
        {activeTab === "chat" && userRole === "ADMIN" && (
          <div className="glass-panel p-4 rounded-xl border border-card-border space-y-3">
            <h3 className="font-bold text-foreground">User Helpdesk Tickets</h3>
            {conversations.length === 0 ? (
              <p className="text-muted italic py-6 text-center">No messages received yet.</p>
            ) : (
              <div className="space-y-2">
                {conversations.map((c) => {
                  const isSelected = selectedUser?.id === c.user?.id;
                  return (
                    <button
                      key={c.user?.id}
                      onClick={() => setSelectedUser(c.user)}
                      className={`w-full p-2.5 rounded-lg border text-left transition-all flex items-start gap-2 cursor-pointer ${
                        isSelected 
                          ? "bg-primary/10 border-primary text-foreground"
                          : "border-card-border hover:bg-neutral-50 dark:hover:bg-zinc-900/30 text-muted hover:text-foreground"
                      }`}
                    >
                      <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-xs uppercase shrink-0">
                        {c.user?.name?.substring(0, 1)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex justify-between items-baseline">
                          <p className="font-bold text-foreground truncate text-[11px] leading-tight">{c.user?.name}</p>
                        </div>
                        <p className="text-[9px] truncate mt-0.5 text-muted leading-tight">{c.user?.role} &middot; {c.user?.email}</p>
                        {c.lastMessage && (
                          <p className="text-[9px] truncate mt-1 italic text-muted leading-tight">
                            Last: {c.lastMessage.content}
                          </p>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Suggestion / Help center pointers for standard users */}
        {activeTab === "chat" && userRole !== "ADMIN" && (
          <div className="glass-panel p-4 rounded-xl border border-card-border space-y-4">
            <div className="space-y-1">
              <h3 className="font-extrabold text-foreground text-sm flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-primary" />
                <span>Admin Support desk</span>
              </h3>
              <p className="text-[10px] text-muted leading-relaxed">
                Connect directly with site moderators to discuss page verifications, listing corrections, or platform billing.
              </p>
            </div>

            <div className="space-y-1.5 border-t border-card-border pt-3">
              <p className="font-semibold text-muted text-[10px]">Quick Inquiry Suggestions</p>
              {[
                "Hi, when will my NGO verification request be approved?",
                "I am having trouble with mapping locations in my job listing.",
                "How do I upgrade to the premium recruiting tier?",
                "Can you change our registered organization name?"
              ].map((suggest, index) => (
                <button
                  key={index}
                  onClick={() => setContent(suggest)}
                  className="w-full text-left p-2 rounded border border-card-border hover:border-primary/40 bg-white/20 dark:bg-zinc-950/20 text-[9px] hover:text-primary transition-all cursor-pointer font-medium leading-normal"
                >
                  {suggest}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Right side: Detailed Viewport */}
      <div className="lg:col-span-8 flex flex-col min-h-[500px]">

        {/* TAB 1: Chat Window */}
        {activeTab === "chat" && (
          <div className="glass-panel rounded-xl border border-card-border flex-1 flex flex-col overflow-hidden max-h-[60vh]">
            
            {/* Header profile details */}
            <div className="p-3 border-b border-card-border flex justify-between items-center bg-white/20 dark:bg-zinc-950/20 shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
                <div>
                  <h4 className="font-extrabold text-foreground text-[11px] leading-tight">
                    {userRole === "ADMIN" ? (selectedUser ? `Chat with ${selectedUser.name}` : "Select a Ticket") : "Direct Portal Admin"}
                  </h4>
                  <p className="text-[9px] text-muted leading-none mt-0.5">
                    {userRole === "ADMIN" ? selectedUser?.email : "Online Helpdesk"}
                  </p>
                </div>
              </div>
            </div>

            {/* Scrollable messages bubble viewport */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-neutral-50/50 dark:bg-zinc-950/25 min-h-[300px]">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col justify-center items-center text-center text-muted italic gap-2 py-10">
                  <UserIcon className="w-8 h-8 text-muted" />
                  <p>Send a message below to start the conversation.</p>
                </div>
              ) : (
                messages.map((m) => {
                  const isOwn = m.senderId === userId;
                  return (
                    <div
                      key={m.id}
                      className={`flex ${isOwn ? "justify-end" : "justify-start"} animate-fadeIn`}
                    >
                      <div
                        className={`max-w-[75%] rounded-2xl p-3 text-[11px] leading-relaxed shadow-sm ${
                          isOwn
                            ? "bg-primary text-white rounded-tr-none"
                            : "bg-white dark:bg-zinc-900 border border-card-border text-foreground rounded-tl-none"
                        }`}
                      >
                        <p className="whitespace-pre-wrap">{m.content}</p>
                        <span
                          className={`text-[8px] block mt-1.5 text-right ${
                            isOwn ? "text-white/70" : "text-muted"
                          }`}
                        >
                          {new Date(m.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit"
                          })}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Input Footer */}
            <form
              onSubmit={handleSubmit}
              className="p-3 border-t border-card-border flex gap-2 items-center bg-white/20 dark:bg-zinc-950/20 shrink-0"
            >
              <input
                type="text"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder={
                  userRole === "ADMIN" && !selectedUser
                    ? "Select a conversation to reply..."
                    : "Type support message details..."
                }
                disabled={isPending || (userRole === "ADMIN" && !selectedUser)}
                className="form-input flex-1 focus:outline-none"
              />
              <button
                type="submit"
                disabled={isPending || !content.trim() || (userRole === "ADMIN" && !selectedUser)}
                className="p-2 bg-primary hover:bg-primary-hover text-white rounded-lg transition-colors cursor-pointer shrink-0 disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}

      </div>

    </div>
  );
}
