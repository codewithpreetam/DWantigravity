"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

interface TabItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
}

interface DashboardMobileNavProps {
  tabs: TabItem[];
  basePath: string;
  title?: string;
}

export function DashboardMobileNav({ tabs, basePath, title = "Dashboard Menu" }: DashboardMobileNavProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const searchParams = useSearchParams();
  const currentTab = searchParams.get("tab") || tabs[0]?.id;

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  useEffect(() => {
    const handle = (e: KeyboardEvent) => { if (e.key === "Escape") setIsOpen(false); };
    document.addEventListener("keydown", handle);
    return () => document.removeEventListener("keydown", handle);
  }, []);

  const activeLabel = tabs.find(t => t.id === currentTab)?.label || "Menu";

  return (
    <div className="lg:hidden mb-6">
      <button
        onClick={() => setIsOpen(true)}
        aria-label="Open dashboard menu"
        className="w-full flex items-center justify-between p-3.5 rounded-xl border border-card-border bg-white/50 dark:bg-black/30 text-foreground hover:bg-white/70 dark:hover:bg-black/40 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary shadow-sm"
      >
        <span className="font-semibold text-sm">{activeLabel}</span>
        <Menu className="w-5 h-5 text-muted" />
      </button>

      {isOpen && mounted && typeof document !== "undefined" && createPortal(
        <>
          <div
            className="fixed inset-0 z-[9998] bg-black/40 backdrop-blur-sm animate-fadeIn"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />
          <div
            className="fixed top-0 right-0 bottom-0 z-[9999] w-[min(82vw,310px)] bg-background border-l border-card-border shadow-2xl flex flex-col transition-transform"
            role="dialog"
            aria-modal="true"
            aria-label="Dashboard navigation"
          >
            <div className="flex items-center justify-between px-4 h-14 border-b border-card-border shrink-0">
              <span className="font-bold text-sm text-foreground">{title}</span>
              <button
                onClick={() => setIsOpen(false)}
                aria-label="Close menu"
                className="p-1.5 rounded-lg text-muted hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <nav className="flex flex-col flex-1 overflow-y-auto p-4 gap-1.5">
              {tabs.map((tab) => {
                const isActive = currentTab === tab.id;
                return (
                  <Link
                    key={tab.id}
                    href={`${basePath}?tab=${tab.id}`}
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-semibold transition-all ${
                      isActive 
                        ? "bg-primary text-white shadow-sm" 
                        : "text-muted hover:bg-primary/10 hover:text-foreground"
                    }`}
                  >
                    {tab.icon}
                    <span>{tab.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        </>,
        document.body
      )}
    </div>
  );
}
