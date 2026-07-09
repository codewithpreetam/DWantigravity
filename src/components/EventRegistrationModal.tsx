"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, Loader2, CheckCircle, Ticket, Calendar, MapPin } from "lucide-react";
import toast from "react-hot-toast";
import { registerForEventAction } from "@/app/actions/candidate";

interface CustomQuestion {
  id: string;
  text: string;
  required: boolean;
}

interface EventRegistrationModalProps {
  eventId: string;
  eventTitle: string;
  eventDate?: string;
  eventLocation?: string;
  userEmail?: string;
  userName?: string;
  customQuestions?: CustomQuestion[];
  onClose: () => void;
  onSuccess: () => void;
}

export default function EventRegistrationModal({
  eventId,
  eventTitle,
  eventDate,
  eventLocation,
  userEmail,
  userName,
  customQuestions = [],
  onClose,
  onSuccess,
}: EventRegistrationModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [responses, setResponses] = useState<Record<string, string>>({});
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Lock body scroll
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("eventId", eventId);
      formData.append("customResponses", JSON.stringify(responses));

      const res = await registerForEventAction(formData);
      if (res?.error) {
        throw new Error(res.error);
      }

      toast.success("Event registration completed successfully.");
      onSuccess();
    } catch (error: any) {
      toast.error(error.message || "Registration failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!mounted || typeof document === "undefined") return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-zinc-950 w-full max-w-lg rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden border border-card-border animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-card-border bg-neutral-50/50 dark:bg-zinc-900/50 flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-xl font-black text-foreground flex items-center gap-2">
              <Ticket className="w-5 h-5 text-primary" />
              Event Registration
            </h2>
            <p className="text-sm text-muted mt-1 truncate max-w-[280px]">Registering for {eventTitle}</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-muted hover:text-foreground hover:bg-neutral-200 dark:hover:bg-zinc-800 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
          <form id="registration-form" onSubmit={handleSubmit} className="space-y-6">
            
            {/* Event Summary */}
            <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 text-sm text-primary-dark dark:text-primary-light space-y-2">
              <div className="font-bold">{eventTitle}</div>
              {eventDate && (
                <div className="flex items-center gap-2 text-xs">
                  <Calendar className="w-3.5 h-3.5" />
                  {eventDate}
                </div>
              )}
              {eventLocation && (
                <div className="flex items-center gap-2 text-xs">
                  <MapPin className="w-3.5 h-3.5" />
                  {eventLocation}
                </div>
              )}
            </div>

            {/* Attendee Details */}
            <div className="space-y-4">
              <h3 className="font-bold text-foreground text-sm border-b border-card-border pb-2">Attendee Details</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted">Full Name</label>
                  <input 
                    type="text" 
                    value={userName || "Anonymous User"} 
                    readOnly 
                    disabled 
                    className="w-full text-sm p-3 rounded-xl border border-card-border bg-neutral-100 dark:bg-zinc-900/50 cursor-not-allowed"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted">Email Address</label>
                  <input 
                    type="email" 
                    value={userEmail || "hidden@example.com"} 
                    readOnly 
                    disabled 
                    className="w-full text-sm p-3 rounded-xl border border-card-border bg-neutral-100 dark:bg-zinc-900/50 cursor-not-allowed"
                  />
                </div>
              </div>
              <p className="text-[10px] text-muted leading-relaxed">
                Your profile details will be shared with the event organizer. Please ensure your profile is up to date in your dashboard.
              </p>
            </div>

            {/* Custom Questions */}
            {customQuestions && customQuestions.length > 0 && (
              <div className="space-y-4 pt-2">
                <h3 className="font-bold text-foreground text-sm border-b border-card-border pb-2">Organizer Questions</h3>
                
                {customQuestions.map((q) => (
                  <div key={q.id} className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground flex items-center gap-1">
                      {q.text} {q.required && <span className="text-red-500">*</span>}
                    </label>
                    <textarea 
                      required={q.required}
                      rows={2}
                      placeholder="Your answer..."
                      className="w-full text-sm p-3 rounded-xl border border-card-border bg-transparent focus:outline-none focus:ring-2 focus:ring-primary/50 resize-y"
                      value={responses[q.id] || ""}
                      onChange={(e) => setResponses({ ...responses, [q.id]: e.target.value })}
                    />
                  </div>
                ))}
              </div>
            )}
          </form>
        </div>

        {/* Footer */}
        <div className="p-4 md:p-6 border-t border-card-border bg-neutral-50/50 dark:bg-zinc-900/50 flex flex-col sm:flex-row gap-3 justify-end items-center shrink-0">
          <button 
            type="button" 
            onClick={onClose}
            disabled={isSubmitting}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl border border-card-border text-foreground text-sm font-semibold hover:bg-neutral-100 dark:hover:bg-zinc-800 transition-colors"
          >
            Cancel
          </button>
          <button 
            type="submit" 
            form="registration-form"
            disabled={isSubmitting}
            className="w-full sm:w-auto px-8 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-sm font-bold shadow-md shadow-primary/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Registering...
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4" />
                Confirm Registration
              </>
            )}
          </button>
        </div>

      </div>
    </div>,
    document.body
  );
}
