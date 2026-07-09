"use client";

import React from "react";
import Link from "next/link";
import { XCircle, RefreshCcw } from "lucide-react";

interface EmptyStateProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  clearFiltersHref?: string; // Optional: URL to clear filters (usually the base path)
}

export default function EmptyState({ title, description, icon, clearFiltersHref }: EmptyStateProps) {
  return (
    <div className="glass-panel p-12 text-center rounded-xl flex-1 flex flex-col justify-center items-center min-h-[300px]">
      <div className="mb-4 text-muted">
        {icon}
      </div>
      <h3 className="text-lg font-bold text-foreground">{title}</h3>
      <p className="text-sm text-muted max-w-sm mt-2 mb-6 leading-relaxed">
        {description}
      </p>
      
      {clearFiltersHref && (
        <div className="flex gap-4">
          <Link
            href={clearFiltersHref}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary font-semibold rounded-lg hover:bg-primary/20 transition-colors text-sm"
          >
            <XCircle className="w-4 h-4" />
            Clear All Filters
          </Link>
          <Link
            href={clearFiltersHref}
            className="inline-flex items-center gap-2 px-4 py-2 bg-foreground text-background font-semibold rounded-lg hover:bg-foreground/90 transition-colors text-sm"
          >
            <RefreshCcw className="w-4 h-4" />
            Browse All
          </Link>
        </div>
      )}
    </div>
  );
}
