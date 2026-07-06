"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X, ChevronDown } from "lucide-react";
import { usePathname } from "next/navigation";

interface MobileMenuProps {
  oppLinks?: { label: string; href: string; icon: any; desc: string }[];
  mainLinks?: { label: string; href: string }[];
  links?: { label: string; href: string }[]; // Fallback for old usage
  userMenuData?: any;
  orgName?: string | null;
}

export function MobileMenu({ oppLinks, mainLinks, links, userMenuData, orgName }: MobileMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [oppOpen, setOppOpen] = useState(false);
  const pathname = usePathname();

  // Close menu on route change
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Lock body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  // Escape key support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  return (
    <div className="lg:hidden flex items-center">
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-label="Toggle mobile menu"
        className="p-2 rounded-md text-muted hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      >
        {isOpen ? <X className="w-6 h-6" aria-hidden="true" /> : <Menu className="w-6 h-6" aria-hidden="true" />}
      </button>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-[100] bg-background/95 backdrop-blur-sm pt-20 px-4 pb-6 overflow-y-auto"
          role="dialog"
          aria-modal="true"
          aria-label="Mobile navigation"
        >
          <button
            onClick={() => setIsOpen(false)}
            aria-label="Close menu"
            className="absolute top-4 right-4 p-2 rounded-md text-muted hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <X className="w-6 h-6" aria-hidden="true" />
          </button>
          
          <nav className="flex flex-col gap-4">
            {/* If new structure is used */}
            {oppLinks && mainLinks ? (
              <>
                <div className="border-b border-card-border/50">
                  <button 
                    onClick={() => setOppOpen(!oppOpen)} 
                    className="w-full flex items-center justify-between text-lg font-semibold py-3 text-foreground hover:text-primary transition-colors"
                  >
                    Opportunities
                    <ChevronDown className={`w-5 h-5 transition-transform ${oppOpen ? "rotate-180" : ""}`} />
                  </button>
                  {oppOpen && (
                    <div className="pl-4 pb-3 flex flex-col gap-3">
                      {oppLinks.map((opp) => {
                        const Icon = opp.icon;
                        return (
                          <Link
                            key={opp.href}
                            href={opp.href}
                            className={`flex items-center gap-3 py-2 ${pathname === opp.href ? "text-primary" : "text-muted hover:text-primary"}`}
                          >
                            <Icon className="w-5 h-5" />
                            <span className="font-semibold text-sm">{opp.label}</span>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
                {mainLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`text-lg font-semibold py-3 border-b border-card-border/50 transition-colors ${
                      pathname === link.href ? "text-primary" : "text-foreground hover:text-primary"
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
              </>
            ) : (
              /* Fallback for old usage */
              links?.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-lg font-semibold py-3 border-b border-card-border/50 transition-colors ${
                    pathname === link.href ? "text-primary" : "text-foreground hover:text-primary"
                  }`}
                >
                  {link.label}
                </Link>
              ))
            )}
            
            {!userMenuData && (
              <div className="flex flex-col gap-3 mt-6">
                <Link
                  href="/auth/signin"
                  className="w-full text-center text-sm font-bold py-3 rounded-lg bg-neutral-100 dark:bg-zinc-900 text-foreground hover:bg-neutral-200 dark:hover:bg-zinc-800 transition-colors"
                >
                  Login
                </Link>
                <Link
                  href="/auth/signup"
                  className="w-full text-center text-sm font-bold py-3 rounded-lg bg-primary text-white hover:bg-primary-hover transition-colors"
                >
                  Sign Up
                </Link>
                <Link
                  href="/auth/signup?role=EMPLOYER"
                  className="w-full text-center text-sm font-bold py-3 rounded-lg border border-primary text-primary hover:bg-primary hover:text-white transition-all"
                >
                  Employer Portal
                </Link>
              </div>
            )}
          </nav>
        </div>
      )}
    </div>
  );
}
