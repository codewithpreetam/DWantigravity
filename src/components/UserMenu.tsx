"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { 
  User, Building, Settings, LogOut, 
  CreditCard, LayoutDashboard, ChevronDown 
} from "lucide-react";

interface UserMenuProps {
  user: {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    role: string;
    organizationId?: string | null;
  };
  organizationName?: string | null;
}

export default function UserMenu({ user, organizationName }: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/auth/signin" });
  };

  const getDashboardLink = () => {
    if (user.role === "ADMIN") return "/dashboard/admin";
    if (user.role === "EMPLOYER") return "/dashboard/employer";
    return "/dashboard/candidate";
  };

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      {/* Dropdown Trigger button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label="User menu"
        className="flex items-center gap-2 p-1 px-2.5 rounded-xl border border-card-border glass-panel hover:bg-white/10 transition-all text-xs font-semibold text-foreground cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      >
        {user.image ? (
          <img src={user.image} alt="" className="w-6 h-6 rounded-full object-cover border border-card-border" aria-hidden="true" />
        ) : (
          <div className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center font-extrabold uppercase text-[10px]" aria-hidden="true">
            {user.name?.substring(0, 1) || "U"}
          </div>
        )}
        <span className="hidden sm:inline">{user.name || "My Account"}</span>
        <ChevronDown className={`w-3.5 h-3.5 text-muted transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} aria-hidden="true" />
      </button>

      {/* Popover Dropdown Panel */}
      {isOpen && (
        <div 
          className="absolute right-0 mt-2 w-56 rounded-xl border border-card-border bg-white/95 dark:bg-black/95 backdrop-blur-md shadow-xl py-2 z-50 animate-fadeIn space-y-1"
          role="menu"
          aria-orientation="vertical"
        >
          {/* Recruiter / Account Header Info */}
          <div className="px-4 py-2 border-b border-card-border">
            <p className="text-xs font-extrabold text-foreground leading-tight truncate">{user.name}</p>
            <p className="text-[10px] text-muted truncate mt-0.5">{user.email}</p>
            {user.role === "EMPLOYER" && organizationName && (
              <p className="text-[9px] font-bold text-primary flex items-center gap-1 mt-1 uppercase tracking-wider truncate">
                <Building className="w-3 h-3 shrink-0" />
                <span>{organizationName}</span>
              </p>
            )}
          </div>

          <div className="py-1">
            {/* Common Links */}
            <Link
              href={getDashboardLink()}
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-muted hover:text-foreground hover:bg-primary/10 transition-colors"
            >
              <LayoutDashboard className="w-4 h-4 text-primary" />
              <span>Workspace Dashboard</span>
            </Link>

            {user.role === "EMPLOYER" && (
              <>
                {/* Employer specific pages */}
                <Link
                  href="/dashboard/employer?tab=recruiter-profile"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-muted hover:text-foreground hover:bg-primary/10 transition-colors"
                >
                  <User className="w-4 h-4 text-primary" />
                  <span>My Profile</span>
                </Link>

                <Link
                  href="/dashboard/employer?tab=org"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-muted hover:text-foreground hover:bg-primary/10 transition-colors"
                >
                  <Building className="w-4 h-4 text-primary" />
                  <span>Organization Profile</span>
                </Link>

                <Link
                  href="/dashboard/employer?tab=settings"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-muted hover:text-foreground hover:bg-primary/10 transition-colors"
                >
                  <Settings className="w-4 h-4 text-primary" />
                  <span>Recruiter Settings</span>
                </Link>

                <Link
                  href="/dashboard/employer?tab=billing"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-muted hover:text-foreground hover:bg-primary/10 transition-colors"
                >
                  <CreditCard className="w-4 h-4 text-primary" />
                  <span>Billing & Subscription</span>
                </Link>
              </>
            )}

            {user.role === "SEEKER" && (
              <Link
                href="/dashboard/candidate?tab=profile"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-muted hover:text-foreground hover:bg-primary/10 transition-colors"
              >
                <User className="w-4 h-4 text-primary" />
                <span>My Candidate Profile</span>
              </Link>
            )}
          </div>

          <div className="border-t border-card-border pt-1">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-bold text-red-500 hover:bg-red-500/10 text-left transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
