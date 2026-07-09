"use client";

import React, { useState } from "react";
import EventRegistrationModal from "./EventRegistrationModal";
import { AlertCircle, CheckCircle } from "lucide-react";

interface EventRegisterButtonProps {
  eventId: string;
  eventTitle: string;
  eventDate?: string;
  eventLocation?: string;
  userEmail?: string;
  userName?: string;
  userRole?: string;
  customQuestions?: any[];
  isClosed?: boolean;
  alreadyRegistered?: boolean;
}

export default function EventRegisterButton({
  eventId,
  eventTitle,
  eventDate,
  eventLocation,
  userEmail,
  userName,
  userRole,
  customQuestions = [],
  isClosed = false,
  alreadyRegistered = false,
}: EventRegisterButtonProps) {
  const [showModal, setShowModal] = useState(false);
  const [hasRegisteredNow, setHasRegisteredNow] = useState(false);
  
  if (alreadyRegistered || hasRegisteredNow) {
    return (
      <div className="px-6 py-2.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold rounded-lg flex items-center gap-1.5 w-fit">
        <CheckCircle className="w-4 h-4 text-emerald-500" />
        <span>Registered</span>
      </div>
    );
  }

  if (isClosed) {
    return (
      <div className="px-6 py-2.5 bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs font-bold rounded-lg flex items-center gap-1.5 w-fit">
        <AlertCircle className="w-4 h-4 text-red-500" />
        <span>Registration Closed</span>
      </div>
    );
  }

  const handleRegisterClick = () => {
    if (!userEmail) {
      window.location.href = `/auth/signin?callbackUrl=${encodeURIComponent(window.location.pathname)}`;
      return;
    }
    setShowModal(true);
  };

  return (
    <>
      <button
        onClick={handleRegisterClick}
        className="px-6 py-2.5 bg-primary hover:bg-primary-hover text-white text-xs font-semibold rounded-lg transition-all cursor-pointer shadow-md w-fit focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
      >
        Register Now
      </button>

      {showModal && (
        <EventRegistrationModal
          eventId={eventId}
          eventTitle={eventTitle}
          eventDate={eventDate}
          eventLocation={eventLocation}
          userEmail={userEmail}
          userName={userName}
          customQuestions={customQuestions}
          onClose={() => setShowModal(false)}
          onSuccess={() => {
            setShowModal(false);
            setHasRegisteredNow(true);
          }}
        />
      )}
    </>
  );
}
