"use client";

import { useState, useTransition } from "react";
import { Heart } from "lucide-react";
import { toast } from "react-hot-toast";
import { toggleSaveOpportunity, SaveOpportunityType } from "@/app/actions/save";

interface SaveButtonProps {
  opportunityId: string;
  opportunityType: SaveOpportunityType;
  initialSaved?: boolean;
  userRole?: string | null;
  isLoggedIn?: boolean;
}

export default function SaveButton({
  opportunityId,
  opportunityType,
  initialSaved = false,
  userRole,
  isLoggedIn = false,
}: SaveButtonProps) {
  const [isSaved, setIsSaved] = useState(initialSaved);
  const [isPending, startTransition] = useTransition();

  // Hide button for employers on non-grant/non-event opportunities
  if (userRole === "EMPLOYER" && opportunityType !== "GRANT" && opportunityType !== "EVENT") {
    return null;
  }

  const handleSave = () => {
    if (!isLoggedIn) {
      window.location.href = `/auth/signin?callbackUrl=${encodeURIComponent(window.location.pathname)}`;
      return;
    }

    // Optimistic UI update
    const previousState = isSaved;
    setIsSaved(!isSaved);

    startTransition(async () => {
      try {
        const result = await toggleSaveOpportunity(opportunityId, opportunityType);
        
        if (result.saved) {
          toast.success("Opportunity saved successfully.");
        } else {
          toast.success("Removed from saved opportunities.");
        }
      } catch (error) {
        // Revert on failure
        setIsSaved(previousState);
        toast.error("An error occurred. Please try again.");
      }
    });
  };

  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        handleSave();
      }}
      disabled={isPending}
      className={`p-2 rounded-lg transition-colors flex items-center justify-center shrink-0 border ${
        isSaved 
          ? "bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-900 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/40" 
          : "bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 text-neutral-500 hover:bg-neutral-50 dark:hover:bg-neutral-700"
      }`}
      aria-label={isSaved ? "Remove from saved" : "Save opportunity"}
    >
      <Heart 
        className={`w-5 h-5 transition-all ${isSaved ? "fill-current" : ""}`} 
      />
    </button>
  );
}
