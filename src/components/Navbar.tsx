import Link from "next/link";
import { auth } from "@/auth";
import { ThemeToggle } from "./ThemeToggle";
import { Menu, ChevronDown, Briefcase, HandHeart, GraduationCap, Landmark, Calendar } from "lucide-react";
import { db } from "@/lib/db";
import UserMenu from "./UserMenu";

export async function Navbar() {
  const session = await auth();
  const user = session?.user;

  let dbUser = null;
  let orgName: string | null = null;
  if (user) {
    dbUser = await db.user.findUnique({
      where: { id: user.id },
      select: { id: true, name: true, email: true, profilePhoto: true, image: true, role: true, organizationId: true }
    });

    if (dbUser && dbUser.organizationId) {
      const org = await db.organization.findUnique({
        where: { id: dbUser.organizationId },
        select: { name: true }
      });
      orgName = org?.name || null;
    }
  }

  const userMenuData = dbUser
    ? {
        id: dbUser.id,
        name: dbUser.name,
        email: dbUser.email,
        image: dbUser.profilePhoto || dbUser.image,
        role: dbUser.role,
        organizationId: dbUser.organizationId,
      }
    : null;

  const opportunityLinks = [
    { label: "Jobs", href: "/jobs", desc: "Full-time & contract", icon: Briefcase },
    { label: "Fellowships", href: "/fellowships", desc: "Leadership & immersion", icon: HandHeart },
    { label: "Internships", href: "/internships", desc: "Learning opportunities", icon: GraduationCap },
    { label: "Grants", href: "/grants", desc: "Funding opportunities", icon: Landmark },
    { label: "Events", href: "/events", desc: "Conferences, workshops, webinars & networking", icon: Calendar, fullWidth: true },
  ];

  const mainLinks = [
    { label: "NGO Directory", href: "/organizations" },
    { label: "Resources", href: "/blog" },
    { label: "Contact", href: "/contact" },
  ];

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-card-border">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 min-h-16 py-2 flex items-center justify-between gap-2 sm:gap-3">
        <Link href="/" className="flex items-center gap-2 font-bold tracking-tight shrink-0">
          <img src="/logo.png" alt="Development Wala" className="h-7 w-7 rounded object-contain border border-card-border/40 shrink-0" />
          <span className="text-foreground text-sm sm:text-base lg:text-lg leading-tight whitespace-nowrap">DevelopmentWala<span className="text-secondary">.org</span></span>
        </Link>

        <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-muted" aria-label="Main Navigation">
          <div className="group relative">
            <button className="flex items-center gap-1 hover:text-foreground transition-colors py-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-sm h-16 group-hover:text-primary">
              Opportunities
              <ChevronDown className="w-3.5 h-3.5 group-hover:rotate-180 transition-transform duration-200" />
            </button>

            <div className="absolute top-[64px] left-0 xl:left-1/2 xl:-translate-x-1/2 w-[min(92vw,640px)] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 ease-in-out translate-y-2 group-hover:translate-y-0">
              <div className="glass-panel bg-white/95 dark:bg-zinc-950/95 backdrop-blur-xl border border-card-border shadow-xl rounded-2xl p-4 overflow-hidden">
                <div className="grid grid-cols-2 gap-x-4">
                  {opportunityLinks.map((opp, i) => {
                    const Icon = opp.icon;
                    const rowClass = i >= 2 ? "border-t border-card-border mt-3 pt-3" : "";
                    return (
                      <Link
                        key={opp.href}
                        href={opp.href}
                        className={`group/item flex items-start gap-3 p-3 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors ${opp.fullWidth ? "col-span-2" : ""} ${rowClass}`}
                      >
                        <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 text-primary group-hover/item:bg-primary group-hover/item:text-white transition-colors">
                          <Icon className="w-4.5 h-4.5" />
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-sm font-bold text-foreground group-hover/item:text-primary transition-colors">{opp.label}</h4>
                          <p className="text-xs text-muted mt-0.5">{opp.desc}</p>
                          <span className="text-[11px] font-bold text-primary mt-1.5 inline-block">Browse {opp.label} &rarr;</span>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {mainLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="hover:text-primary transition-colors py-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-sm hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <ThemeToggle />

          <div className="hidden lg:flex items-center gap-2">
            {userMenuData ? (
              <UserMenu user={userMenuData} organizationName={orgName} />
            ) : (
              <>
                <Link href="/auth/signin" className="text-sm font-medium px-3 py-2 hover:text-primary transition-colors">
                  Login
                </Link>
                <Link
                  href="/auth/signup?role=EMPLOYER"
                  className="hidden md:inline-flex text-xs font-semibold px-4 py-2 rounded-lg border border-primary text-primary hover:bg-primary hover:text-white transition-all"
                >
                  Employer Portal
                </Link>
                <Link
                  href="/auth/signup"
                  className="text-xs font-semibold px-3 py-2 rounded-lg bg-primary text-white hover:bg-primary-hover transition-colors"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>

          <details className="lg:hidden relative group">
            <summary className="list-none p-2 rounded-lg border border-card-border bg-white/50 dark:bg-black/30 cursor-pointer hover:bg-white/70 dark:hover:bg-black/40 transition-colors">
              <Menu className="w-4 h-4 text-foreground" />
            </summary>
            <div className="absolute right-0 mt-2 w-[min(92vw,22rem)] rounded-xl border border-card-border bg-white/95 dark:bg-black/95 shadow-xl p-3 space-y-3">
              <div className="space-y-2">
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted">Opportunities</p>
                <nav className="grid grid-cols-2 gap-2 text-xs font-semibold">
                  {opportunityLinks.map((link) => (
                    <Link
                      key={`mobile-opp-${link.href}`}
                      href={link.href}
                      className={`px-2.5 py-2 rounded-lg border border-card-border hover:bg-primary/10 hover:text-primary transition-colors ${link.fullWidth ? "col-span-2" : ""}`}
                    >
                      {link.label}
                    </Link>
                  ))}
                </nav>
              </div>

              <div className="space-y-2 pt-2 border-t border-card-border">
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted">Explore</p>
                <nav className="grid grid-cols-2 gap-2 text-xs font-semibold">
                  {mainLinks.map((link) => (
                    <Link
                      key={`mobile-main-${link.href}`}
                      href={link.href}
                      className="px-2.5 py-2 rounded-lg border border-card-border hover:bg-primary/10 hover:text-primary transition-colors"
                    >
                      {link.label}
                    </Link>
                  ))}
                </nav>
              </div>

              {userMenuData ? (
                <Link
                  href={
                    userMenuData.role === "ADMIN"
                      ? "/dashboard/admin"
                      : userMenuData.role === "EMPLOYER"
                        ? "/dashboard/employer"
                        : "/dashboard/candidate"
                  }
                  className="w-full inline-flex justify-center px-3 py-2 rounded-lg bg-primary text-white font-semibold text-xs"
                >
                  Go to Dashboard
                </Link>
              ) : (
                <div className="grid grid-cols-1 gap-2 pt-1 border-t border-card-border">
                  <Link
                    href="/auth/signin"
                    className="w-full text-center px-3 py-2 rounded-lg border border-card-border text-xs font-semibold hover:bg-white/70 dark:hover:bg-black/30"
                  >
                    Login
                  </Link>
                  <Link
                    href="/auth/signup"
                    className="w-full text-center px-3 py-2 rounded-lg bg-primary text-white text-xs font-semibold"
                  >
                    Sign Up
                  </Link>
                  <Link
                    href="/auth/signup?role=EMPLOYER"
                    className="w-full text-center px-3 py-2 rounded-lg border border-primary text-primary text-xs font-semibold"
                  >
                    Employer Portal
                  </Link>
                </div>
              )}
            </div>
          </details>
        </div>
      </div>
    </header>
  );
}
