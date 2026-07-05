import Link from "next/link";
import { auth } from "@/auth";
import { ThemeToggle } from "./ThemeToggle";
import { Briefcase, User, LogOut, Menu } from "lucide-react";
import { UserRole } from "@prisma/client";
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

  const userMenuData = dbUser ? {
    id: dbUser.id,
    name: dbUser.name,
    email: dbUser.email,
    image: dbUser.profilePhoto || dbUser.image,
    role: dbUser.role,
    organizationId: dbUser.organizationId
  } : null;

  // Define links
  const links = [
    { label: "Jobs", href: "/jobs" },
    { label: "Fellowships", href: "/fellowships" },
    { label: "Internships", href: "/internships" },
    { label: "Grants", href: "/grants" },
    { label: "Events", href: "/events" },
    { label: "NGO Directory", href: "/organizations" },
    { label: "Resources", href: "/blog" },
  ];

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-card-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 font-bold text-lg tracking-tight">
          <img src="/logo.png" alt="Development Wala" className="h-7 w-7 rounded object-contain border border-card-border/40" />
          <span className="text-foreground">DevelopmentWala<span className="text-secondary">.org</span></span>
        </Link>

        {/* Desktop Links */}
        <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-muted hover:text-foreground">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="hover:text-primary transition-colors py-1"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right Section */}
        <div className="flex items-center gap-3">
          <ThemeToggle />

          {userMenuData ? (
            <UserMenu user={userMenuData} organizationName={orgName} />
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/auth/signin"
                className="text-sm font-medium px-4 py-2 hover:text-primary transition-colors"
              >
                Login
              </Link>
              <Link
                href="/auth/signup?role=EMPLOYER"
                className="hidden sm:inline-flex text-xs font-semibold px-4 py-2 rounded-lg border border-primary text-primary hover:bg-primary hover:text-white transition-all"
              >
                Employer Portal
              </Link>
              <Link
                href="/auth/signup"
                className="text-xs font-semibold px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary-hover transition-colors"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
