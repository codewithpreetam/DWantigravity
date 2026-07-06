"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { signOut } from "next-auth/react";
import {
  Menu, X, ChevronDown,
  Briefcase, HandHeart, GraduationCap, Landmark, Calendar,
  LayoutDashboard, LogOut,
} from "lucide-react";
import { usePathname } from "next/navigation";

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Briefcase, HandHeart, GraduationCap, Landmark, Calendar,
};

interface OppLink {
  label: string;
  href: string;
  iconName?: string;
  desc?: string;
  fullWidth?: boolean;
}

interface MobileMenuProps {
  oppLinks?: OppLink[];
  mainLinks?: { label: string; href: string }[];
  userMenuData?: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
    role: string;
    organizationId?: string | null;
  } | null;
  orgName?: string | null;
}

export function MobileMenu({ oppLinks, mainLinks, userMenuData, orgName }: MobileMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [oppOpen, setOppOpen] = useState(true);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => { setIsOpen(false); }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  useEffect(() => {
    const handle = (e: KeyboardEvent) => { if (e.key === "Escape") setIsOpen(false); };
    document.addEventListener("keydown", handle);
    return () => document.removeEventListener("keydown", handle);
  }, []);

  const getDashboardLink = () => {
    if (!userMenuData) return "/dashboard";
    if (userMenuData.role === "ADMIN") return "/dashboard/admin";
    if (userMenuData.role === "EMPLOYER") return "/dashboard/employer";
    return "/dashboard/candidate";
  };

  return (
    <div className="lg:hidden">
      <button
        onClick={() => setIsOpen(true)}
        aria-label="Open menu"
        className="p-2 rounded-lg border border-card-border bg-white/50 dark:bg-black/30 text-foreground hover:bg-white/70 dark:hover:bg-black/40 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      >
        <Menu className="w-5 h-5" />
      </button>

      {isOpen && mounted && typeof document !== "undefined" && createPortal(
        <>
          <div
            className="fixed inset-0 z-[9998] bg-black/40 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />
          <div
            className="fixed top-0 right-0 bottom-0 z-[9999] w-[min(82vw,310px)] bg-background border-l border-card-border shadow-2xl flex flex-col"
            role="dialog"
            aria-modal="true"
            aria-label="Site navigation"
          >
            <div className="flex items-center justify-between px-5 h-16 border-b border-card-border shrink-0 w-full">
              <span className="font-bold text-base text-foreground">Menu</span>
              <button
                onClick={() => setIsOpen(false)}
                aria-label="Close menu"
                className="p-2 ml-auto rounded-xl bg-neutral-100 dark:bg-neutral-800 text-foreground hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <nav className="flex flex-col flex-1 overflow-y-auto p-5 gap-1.5 w-full">
              {oppLinks && (
                <div className="mb-1">
                  <button
                    onClick={() => setOppOpen(!oppOpen)}
                    className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-[15px] font-semibold text-foreground hover:bg-primary/5 transition-colors"
                  >
                    Opportunities
                    <ChevronDown className={`w-4 h-4 text-muted transition-transform duration-200 ${oppOpen ? "rotate-180" : ""}`} />
                  </button>
                  {oppOpen && (
                    <div className="ml-2 mt-1.5 flex flex-col gap-1 border-l-2 border-primary/20 pl-4 py-1">
                      {oppLinks.map((opp) => {
                        const Icon = opp.iconName ? ICON_MAP[opp.iconName] : null;
                        return (
                          <Link
                            key={opp.href}
                            href={opp.href}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors ${
                              pathname === opp.href ? "text-primary font-semibold" : "text-muted hover:text-primary hover:bg-primary/5 font-medium"
                            }`}
                          >
                            {Icon && <Icon className="w-4 h-4 shrink-0" />}
                            {opp.label}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {mainLinks?.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-4 py-3 rounded-xl text-[15px] font-semibold transition-colors ${
                    pathname === link.href ? "text-primary bg-primary/5" : "text-foreground hover:bg-primary/5 hover:text-primary"
                  }`}
                >
                  {link.label}
                </Link>
              ))}

              <div className="border-t border-card-border pt-5 mt-4 flex flex-col gap-3 w-full">
                {userMenuData ? (
                  <>
                    <div className="flex items-center gap-3 px-3 pb-2 w-full">
                      {userMenuData.image ? (
                        <img src={userMenuData.image} alt="" className="w-12 h-12 rounded-full object-cover border border-card-border shrink-0" />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-lg shrink-0 uppercase">
                          {userMenuData.name?.charAt(0) || "U"}
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="text-[15px] font-bold text-foreground truncate leading-tight">{userMenuData.name || "My Account"}</p>
                        <p className="text-xs text-muted truncate mt-0.5">{userMenuData.email}</p>
                        {userMenuData.role === "EMPLOYER" && orgName && (
                          <p className="text-[11px] text-primary font-semibold truncate mt-0.5">{orgName}</p>
                        )}
                      </div>
                    </div>
                    <Link
                      href={getDashboardLink()}
                      className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl bg-primary text-white text-[15px] font-semibold hover:bg-primary-hover transition-colors shadow-sm"
                    >
                      <LayoutDashboard className="w-5 h-5" />
                      My Dashboard
                    </Link>
                    <button
                      onClick={() => signOut({ callbackUrl: "/auth/signin" })}
                      className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl border border-card-border text-[15px] font-semibold text-muted hover:text-red-500 hover:border-red-300 dark:hover:border-red-800 transition-colors"
                    >
                      <LogOut className="w-5 h-5" />
                      Sign Out
                    </button>
                  </>
                ) : (
                  <>
                    <Link href="/auth/signin" className="w-full flex items-center justify-center py-3.5 rounded-xl border border-card-border text-[15px] font-semibold text-foreground hover:bg-primary/5 transition-colors">
                      Login
                    </Link>
                    <Link href="/auth/signup" className="w-full flex items-center justify-center py-3.5 rounded-xl bg-primary text-white text-[15px] font-semibold hover:bg-primary-hover transition-colors shadow-sm">
                      Sign Up
                    </Link>
                    <Link href="/auth/signup?role=EMPLOYER" className="w-full flex items-center justify-center py-3.5 rounded-xl border border-primary text-primary text-[15px] font-semibold hover:bg-primary/5 transition-colors">
                      Employer Portal
                    </Link>
                  </>
                )}
              </div>
            </nav>
          </div>
        </>,
        document.body
      )}
    </div>
  );
}
