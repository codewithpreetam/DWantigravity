"use client";

import { useState } from "react";
import { Check, Share2 } from "lucide-react";

interface ShareButtonProps {
  title?: string;
  text?: string;
  label?: string;
  className?: string;
}

export default function ShareButton({
  title,
  text,
  label = "Share",
  className = "",
}: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const url = window.location.href;
    const shareTitle = title || document.title;

    if (navigator.share) {
      try {
        await navigator.share({ title: shareTitle, text, url });
        return;
      } catch {
        // User cancellation is non-fatal; fallback to copy only when sharing is unavailable.
      }
    }

    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // No-op fallback for older browsers.
    }
  };

  return (
    <button
      type="button"
      onClick={handleShare}
      className={`px-4 py-2.5 rounded-lg border border-card-border text-xs font-semibold text-foreground hover:bg-white/70 dark:hover:bg-black/30 transition-colors inline-flex items-center justify-center gap-2 w-full sm:w-auto ${className}`}
      aria-label={copied ? "Link copied" : "Share this opportunity"}
    >
      {copied ? <Check className="w-4 h-4 text-primary" /> : <Share2 className="w-4 h-4" />}
      <span>{copied ? "Link Copied" : label}</span>
    </button>
  );
}
