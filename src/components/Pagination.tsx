"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
}

export function Pagination({ currentPage, totalPages }: PaginationProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  if (totalPages <= 1) return null;

  const createPageUrl = (pageNumber: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", pageNumber.toString());
    return `${pathname}?${params.toString()}`;
  };

  const getVisiblePages = () => {
    const pages = [];
    let start = Math.max(1, currentPage - 1);
    let end = Math.min(totalPages, currentPage + 1);

    if (currentPage === 1) {
      end = Math.min(totalPages, 3);
    } else if (currentPage === totalPages) {
      start = Math.max(1, totalPages - 2);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  };

  const visiblePages = getVisiblePages();

  return (
    <div className="flex items-center justify-center gap-2 mt-12 mb-6">
      <Link
        href={currentPage > 1 ? createPageUrl(currentPage - 1) : "#"}
        className={`flex items-center justify-center w-10 h-10 rounded-lg border border-card-border transition-colors ${
          currentPage <= 1 
            ? "opacity-50 cursor-not-allowed pointer-events-none bg-neutral-100 dark:bg-neutral-900" 
            : "hover:bg-primary/10 hover:text-primary hover:border-primary/30 bg-white dark:bg-zinc-950"
        }`}
        aria-disabled={currentPage <= 1}
      >
        <ChevronLeft className="w-5 h-5" />
      </Link>

      {visiblePages[0] > 1 && (
        <>
          <Link
            href={createPageUrl(1)}
            className="hidden sm:flex items-center justify-center w-10 h-10 rounded-lg border border-card-border bg-white dark:bg-zinc-950 hover:bg-primary/10 hover:text-primary transition-colors text-sm font-semibold"
          >
            1
          </Link>
          {visiblePages[0] > 2 && <span className="text-muted px-1">...</span>}
        </>
      )}

      {visiblePages.map(page => (
        <Link
          key={page}
          href={createPageUrl(page)}
          className={`flex items-center justify-center w-10 h-10 rounded-lg border text-sm font-semibold transition-colors ${
            page === currentPage
              ? "bg-primary border-primary text-white shadow-md shadow-primary/20"
              : "border-card-border bg-white dark:bg-zinc-950 hover:bg-primary/10 hover:text-primary hover:border-primary/30"
          }`}
          aria-current={page === currentPage ? "page" : undefined}
        >
          {page}
        </Link>
      ))}

      {visiblePages[visiblePages.length - 1] < totalPages && (
        <>
          {visiblePages[visiblePages.length - 1] < totalPages - 1 && <span className="text-muted px-1">...</span>}
          <Link
            href={createPageUrl(totalPages)}
            className="hidden sm:flex items-center justify-center w-10 h-10 rounded-lg border border-card-border bg-white dark:bg-zinc-950 hover:bg-primary/10 hover:text-primary transition-colors text-sm font-semibold"
          >
            {totalPages}
          </Link>
        </>
      )}

      <Link
        href={currentPage < totalPages ? createPageUrl(currentPage + 1) : "#"}
        className={`flex items-center justify-center w-10 h-10 rounded-lg border border-card-border transition-colors ${
          currentPage >= totalPages 
            ? "opacity-50 cursor-not-allowed pointer-events-none bg-neutral-100 dark:bg-neutral-900" 
            : "hover:bg-primary/10 hover:text-primary hover:border-primary/30 bg-white dark:bg-zinc-950"
        }`}
        aria-disabled={currentPage >= totalPages}
      >
        <ChevronRight className="w-5 h-5" />
      </Link>
    </div>
  );
}
