import Link from "next/link";
import { db } from "@/lib/db";
import {
  Briefcase, GraduationCap, Award, Landmark,
  HelpCircle, Users, Calendar, ArrowRight,
  TrendingUp, MapPin, Building, FileText, Search,
  ShieldCheck,
} from "lucide-react";

export const revalidate = 0;

export default async function Home() {
  // ── Live counts — all from DB, zero fake padding ───────────────────────────
  const [
    jobCount,
    internshipCount,
    fellowshipCount,
    scholarshipCount,
    grantCount,
    consultancyCount,
    volunteerCount,
    eventCount,
    orgCount,
    applicationCount,
  ] = await Promise.all([
    db.job.count({ where: { isActive: true } }),
    db.internship.count({ where: { isActive: true } }),
    db.fellowship.count({ where: { isActive: true } }),
    db.scholarship.count(),
    db.grant.count({ where: { isActive: true } }),
    db.consultancy.count(),
    db.volunteer.count({ where: { isActive: true } }),
    db.event.count(),
    db.organization.count({ where: { status: "VERIFIED" } }),
    db.application.count(),
  ]);

  const totalRoles = jobCount + internshipCount + fellowshipCount + scholarshipCount + grantCount + consultancyCount + volunteerCount;

  // ── Stats bar ──────────────────────────────────────────────────────────────
  const stats = [
    { label: "Active Jobs", count: jobCount, icon: Briefcase, href: "/jobs", color: "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10" },
    { label: "Fellowships", count: fellowshipCount, icon: GraduationCap, href: "/fellowships", color: "text-indigo-600 dark:text-indigo-400 bg-indigo-500/10" },
    { label: "Grants & Funding", count: grantCount, icon: Landmark, href: "/grants", color: "text-amber-600 dark:text-amber-400 bg-amber-500/10" },
    { label: "Volunteers Needed", count: volunteerCount, icon: Users, href: "/volunteer", color: "text-rose-600 dark:text-rose-400 bg-rose-500/10" },
  ];

  // ── Category counts — live opportunity totals grouped by type ──────────────
  const categories = [
    {
      label: "Jobs",
      icon: Briefcase,
      color: "from-emerald-500/10 to-teal-500/10",
      iconColor: "text-emerald-600 dark:text-emerald-400",
      count: jobCount,
      unit: "active jobs",
      href: "/jobs",
    },
    {
      label: "Internships",
      icon: GraduationCap,
      color: "from-blue-500/10 to-indigo-500/10",
      iconColor: "text-blue-600 dark:text-blue-400",
      count: internshipCount,
      unit: "internships",
      href: "/internships",
    },
    {
      label: "Fellowships",
      icon: Award,
      color: "from-indigo-500/10 to-purple-500/10",
      iconColor: "text-indigo-600 dark:text-indigo-400",
      count: fellowshipCount,
      unit: "fellowships",
      href: "/fellowships",
    },
    {
      label: "Grants",
      icon: Landmark,
      color: "from-amber-500/10 to-orange-500/10",
      iconColor: "text-amber-600 dark:text-amber-400",
      count: grantCount,
      unit: "funding calls",
      href: "/grants",
    },
    {
      label: "Events",
      icon: Calendar,
      color: "from-purple-500/10 to-pink-500/10",
      iconColor: "text-purple-600 dark:text-purple-400",
      count: eventCount,
      unit: "events",
      href: "/events",
    },
    {
      label: "Scholarships",
      icon: FileText,
      color: "from-rose-500/10 to-red-500/10",
      iconColor: "text-rose-600 dark:text-rose-400",
      count: scholarshipCount,
      unit: "scholarships",
      href: "/scholarships",
    },
    {
      label: "Consultancies",
      icon: HelpCircle,
      color: "from-teal-500/10 to-cyan-500/10",
      iconColor: "text-teal-600 dark:text-teal-400",
      count: consultancyCount,
      unit: "assignments",
      href: "/consultancies",
    },
    {
      label: "Volunteer",
      icon: Users,
      color: "from-pink-500/10 to-rose-500/10",
      iconColor: "text-pink-600 dark:text-pink-400",
      count: volunteerCount,
      unit: "open roles",
      href: "/volunteer",
    },
  ];

  // ── Featured cards — latest real listings ──────────────────────────────────
  const [featuredJob, featuredFellowship, featuredGrant, featuredInternship, featuredEvent] =
    await Promise.all([
      db.job.findFirst({
        where: { isActive: true },
        include: { organization: true },
        orderBy: { createdAt: "desc" },
      }),
      db.fellowship.findFirst({
        where: { isActive: true },
        include: { organization: true },
        orderBy: { createdAt: "desc" },
      }),
      db.grant.findFirst({
        where: { isActive: true },
        include: { organization: true },
        orderBy: { createdAt: "desc" },
      }),
      db.internship.findFirst({
        where: { isActive: true },
        include: { organization: true },
        orderBy: { createdAt: "desc" },
      }),
      db.event.findFirst({
        include: { organizer: true },
        orderBy: { date: "asc" },
        where: { date: { gte: new Date() } },
      }),
    ]);

  // Recent verified orgs
  const recentOrgs = await db.organization.findMany({
    where: { status: "VERIFIED" },
    orderBy: { createdAt: "desc" },
    take: 6,
    select: { id: true, name: true, orgType: true, headquarters: true, hiringStatus: true },
  });

  return (
    <div className="relative min-h-screen bg-gradient-glow pb-24">
      {/* Background ambient blobs */}
      <div className="absolute top-20 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl -z-10 animate-pulse" />
      <div className="absolute top-40 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-3xl -z-10" />

      {/* ── Hero ────────────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12 text-center">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-primary mb-4 border border-emerald-500/20">
          <TrendingUp className="w-3.5 h-3.5" />
          <span>Bridging Talent & Social Impact in India</span>
        </span>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-foreground max-w-4xl mx-auto leading-tight">
          Find Your Next <span className="text-gradient">Social Impact</span> Career
        </h1>

        <p className="mt-6 text-lg sm:text-xl text-muted max-w-2xl mx-auto leading-relaxed">
          The ultimate platform for India's development sector. Connect with verified NGOs,
          discover fellowships, internships, grants, and consulting roles.
        </p>

        {/* Search bar */}
        <form
          method="GET"
          action="/jobs"
          className="mt-10 max-w-2xl mx-auto glass-panel p-2 rounded-xl flex flex-col sm:flex-row gap-2"
        >
          <div className="flex items-center flex-1 gap-2 px-3">
            <Search className="w-4 h-4 text-muted shrink-0" />
            <input
              type="text"
              name="q"
              placeholder="Search jobs, NGOs, skills or locations..."
              className="flex-1 py-3 bg-transparent text-sm focus:outline-none text-foreground placeholder:text-muted"
            />
          </div>
          <button
            type="submit"
            className="px-6 py-3 rounded-lg bg-primary hover:bg-primary-hover text-white text-sm font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <span>Search</span>
            <Search className="w-4 h-4" />
          </button>
        </form>

        {/* Live platform-wide summary */}
        <p className="mt-5 text-xs text-muted">
          <span className="font-bold text-foreground">{totalRoles.toLocaleString()}</span> active roles across{" "}
          <span className="font-bold text-foreground">{orgCount}</span> verified organisations ·{" "}
          <span className="font-bold text-foreground">{applicationCount.toLocaleString()}</span> applications submitted
        </p>
      </section>

      {/* ── Stats Bar ──────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Link
                key={stat.label}
                href={stat.href}
                className="glass-panel p-6 rounded-xl flex items-center gap-4 hover:border-primary/40 transition-all group"
              >
                <div className={`p-3 rounded-lg ${stat.color} shrink-0`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-2xl font-extrabold text-foreground group-hover:text-primary transition-colors">
                    {stat.count.toLocaleString()}
                  </div>
                  <div className="text-xs text-muted font-medium">{stat.label}</div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ── Category Grid — all 8 types with live counts ───────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Browse by Opportunity Type</h2>
            <p className="text-xs text-muted mt-1">All counts are live — updated in real-time from the platform</p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {categories.map((cat) => {
            const Icon = cat.icon;
            return (
              <Link
                key={cat.label}
                href={cat.href}
                className="glass-panel-interactive p-4 rounded-xl flex flex-col items-center text-center gap-2 hover:border-primary/40 group"
              >
                <div className={`p-3 rounded-full bg-gradient-to-br ${cat.color} ${cat.iconColor}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="font-semibold text-xs text-foreground group-hover:text-primary transition-colors leading-tight">
                  {cat.label}
                </div>
                <div className="text-[10px] text-muted font-bold bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5 rounded-full whitespace-nowrap">
                  {cat.count > 0 ? `${cat.count} ${cat.unit}` : "Coming soon"}
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ── Featured Opportunities ─────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Latest Opportunities</h2>
            <p className="text-xs text-muted mt-1">Most recently posted across all types</p>
          </div>
          <Link href="/jobs" className="text-xs font-semibold text-primary flex items-center gap-1 hover:underline">
            <span>View all opportunities</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Job Card */}
          {featuredJob && (
            <div className="glass-panel-interactive p-6 rounded-xl flex flex-col justify-between min-h-[240px]">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    Job
                  </span>
                  <span className="text-[10px] text-muted flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> {featuredJob.location}
                  </span>
                </div>
                <h3 className="font-bold text-base text-foreground line-clamp-1 hover:text-primary transition-colors">
                  {featuredJob.title}
                </h3>
                <p className="text-xs text-muted mt-1 flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5" /> {featuredJob.organization?.name}
                </p>
                <p className="text-xs text-muted mt-3 line-clamp-3 leading-relaxed">
                  {featuredJob.description?.replace(/<[^>]+>/g, "").slice(0, 180)}
                </p>
              </div>
              <div className="border-t border-card-border pt-4 mt-4 flex items-center justify-between">
                {featuredJob.salaryMin && featuredJob.salaryMax ? (
                  <span className="text-xs font-semibold text-foreground">
                    ₹{(featuredJob.salaryMin / 100000).toFixed(1)}L – ₹{(featuredJob.salaryMax / 100000).toFixed(1)}L / yr
                  </span>
                ) : (
                  <span className="text-xs text-muted">Salary negotiable</span>
                )}
                <Link href={`/jobs?id=${featuredJob.id}`} className="text-xs font-bold text-primary flex items-center gap-0.5 hover:underline">
                  <span>Apply Now</span><ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          )}

          {/* Fellowship Card */}
          {featuredFellowship && (
            <div className="glass-panel-interactive p-6 rounded-xl flex flex-col justify-between min-h-[240px]">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                    Fellowship
                  </span>
                  <span className="text-[10px] text-muted flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> {featuredFellowship.location}
                  </span>
                </div>
                <h3 className="font-bold text-base text-foreground line-clamp-1 hover:text-primary transition-colors">
                  {featuredFellowship.title}
                </h3>
                <p className="text-xs text-muted mt-1 flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5" /> {featuredFellowship.organization?.name}
                </p>
                <p className="text-xs text-muted mt-3 line-clamp-3 leading-relaxed">
                  {featuredFellowship.description?.replace(/<[^>]+>/g, "").slice(0, 180)}
                </p>
              </div>
              <div className="border-t border-card-border pt-4 mt-4 flex items-center justify-between">
                {featuredFellowship.stipend ? (
                  <span className="text-xs font-semibold text-foreground">
                    ₹{featuredFellowship.stipend.toLocaleString("en-IN")} / month
                  </span>
                ) : (
                  <span className="text-xs text-muted">Unpaid fellowship</span>
                )}
                <Link href={`/fellowships?id=${featuredFellowship.id}`} className="text-xs font-bold text-primary flex items-center gap-0.5 hover:underline">
                  <span>Apply Now</span><ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          )}

          {/* Grant Card */}
          {featuredGrant && (
            <div className="glass-panel-interactive p-6 rounded-xl flex flex-col justify-between min-h-[240px]">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                    Grant
                  </span>
                  {featuredGrant.deadline && (
                    <span className="text-[10px] text-muted">
                      Deadline: {new Date(featuredGrant.deadline).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </span>
                  )}
                </div>
                <h3 className="font-bold text-base text-foreground line-clamp-1 hover:text-primary transition-colors">
                  {featuredGrant.title}
                </h3>
                <p className="text-xs text-muted mt-1 flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5" /> {featuredGrant.organization?.name}
                </p>
                <p className="text-xs text-muted mt-3 line-clamp-3 leading-relaxed">
                  {featuredGrant.description?.replace(/<[^>]+>/g, "").slice(0, 180)}
                </p>
              </div>
              <div className="border-t border-card-border pt-4 mt-4 flex items-center justify-between">
                {featuredGrant.amount ? (
                  <span className="text-xs font-semibold text-foreground">
                    Up to ₹{(featuredGrant.amount / 100000).toFixed(1)} Lakhs
                  </span>
                ) : (
                  <span className="text-xs text-muted">Amount TBD</span>
                )}
                <Link href={`/grants?id=${featuredGrant.id}`} className="text-xs font-bold text-primary flex items-center gap-0.5 hover:underline">
                  <span>View Details</span><ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          )}

          {/* Internship Card */}
          {featuredInternship && (
            <div className="glass-panel-interactive p-6 rounded-xl flex flex-col justify-between min-h-[240px]">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20">
                    Internship
                  </span>
                  <span className="text-[10px] text-muted flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> {featuredInternship.location}
                  </span>
                </div>
                <h3 className="font-bold text-base text-foreground line-clamp-1 hover:text-primary transition-colors">
                  {featuredInternship.title}
                </h3>
                <p className="text-xs text-muted mt-1 flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5" /> {featuredInternship.organization?.name}
                </p>
                <p className="text-xs text-muted mt-3 line-clamp-3 leading-relaxed">
                  {featuredInternship.description?.replace(/<[^>]+>/g, "").slice(0, 180)}
                </p>
              </div>
              <div className="border-t border-card-border pt-4 mt-4 flex items-center justify-between">
                {featuredInternship.stipend ? (
                  <span className="text-xs font-semibold text-foreground">
                    ₹{featuredInternship.stipend.toLocaleString("en-IN")} / month · {featuredInternship.durationMonths}mo
                  </span>
                ) : (
                  <span className="text-xs text-muted">Unpaid · {featuredInternship.durationMonths} months</span>
                )}
                <Link href={`/internships?id=${featuredInternship.id}`} className="text-xs font-bold text-primary flex items-center gap-0.5 hover:underline">
                  <span>Apply Now</span><ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          )}

          {/* Upcoming Event Card */}
          {featuredEvent && (
            <div className="glass-panel-interactive p-6 rounded-xl flex flex-col justify-between min-h-[240px]">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                    {featuredEvent.format === "WEBINAR" ? "Webinar" : featuredEvent.format === "HYBRID" ? "Hybrid Event" : "In-Person Event"}
                  </span>
                  <span className="text-[10px] text-muted flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> {new Date(featuredEvent.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                  </span>
                </div>
                <h3 className="font-bold text-base text-foreground line-clamp-1 hover:text-primary transition-colors">
                  {featuredEvent.title}
                </h3>
                <p className="text-xs text-muted mt-1 flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5" /> {featuredEvent.organizer?.name}
                </p>
                <p className="text-xs text-muted mt-3 line-clamp-3 leading-relaxed">
                  {featuredEvent.description?.replace(/<[^>]+>/g, "").slice(0, 180)}
                </p>
              </div>
              <div className="border-t border-card-border pt-4 mt-4 flex items-center justify-between">
                <span className="text-xs text-muted flex items-center gap-1">
                  <MapPin className="w-3 h-3" /> {featuredEvent.location}
                </span>
                <Link href="/events" className="text-xs font-bold text-primary flex items-center gap-0.5 hover:underline">
                  <span>Register</span><ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ── Verified Organisations ──────────────────────────────────────── */}
      {recentOrgs.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-foreground">Verified Organisations Hiring</h2>
              <p className="text-xs text-muted mt-1">{orgCount} verified NGOs and social impact organisations on the platform</p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {recentOrgs.map((org: typeof recentOrgs[number]) => (
              <div key={org.id} className="glass-panel p-4 rounded-xl flex flex-col items-center text-center gap-2">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Building className="w-5 h-5 text-primary" />
                </div>
                <p className="font-semibold text-xs text-foreground line-clamp-2 leading-tight">{org.name}</p>
                <div className="flex flex-col gap-1 items-center">
                  {org.headquarters && (
                    <span className="text-[9px] text-muted flex items-center gap-0.5">
                      <MapPin className="w-2.5 h-2.5" /> {org.headquarters}
                    </span>
                  )}
                  {org.hiringStatus && (
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
                      <ShieldCheck className="w-2.5 h-2.5" /> Hiring
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
