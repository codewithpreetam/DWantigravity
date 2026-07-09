import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import { 
  Building, Globe, Briefcase, MapPin, 
  Calendar, IndianRupee, ArrowLeft, Users, 
  Heart, Tag, Award, Users2, Mail, Phone, ArrowUpRight,
  CheckCircle2, Link as LinkIcon
} from "lucide-react";
import type { Metadata } from "next";
import OpportunityCard from "@/components/OpportunityCard";
import EventCard from "@/components/EventCard";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

interface Props {
  params: Promise<{ organizationSlug: string }>;
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params;
  const organizationSlug = params.organizationSlug;

  const EXCLUDED_SLUGS = ["favicon.ico", "api", "auth", "dashboard", "jobs", "organizations", "internships", "fellowships", "scholarships", "grants", "consultancies", "volunteer", "events", "recruiter"];
  if (EXCLUDED_SLUGS.includes(organizationSlug)) {
    return { title: "Not Found" };
  }

  const orgs = await db.organization.findMany();
  const org = orgs.find((o: any) => slugify(o.name) === organizationSlug);

  if (!org) {
    return {
      title: "Organization Not Found",
    };
  }

  return {
    title: `${org.name} | NGO Profile & Careers`,
    description: org.description?.substring(0, 160) || `Learn more about careers and opportunities at ${org.name}.`,
    openGraph: {
      title: `${org.name} | NGO Profile & Careers`,
      description: org.description?.substring(0, 160) || `Learn more about careers and opportunities at ${org.name}.`,
      url: `https://developmentwala.com/${organizationSlug}`,
    }
  };
}

export default async function OrganizationSlugProfilePage(props: Props) {
  const params = await props.params;
  const organizationSlug = params.organizationSlug;

  const EXCLUDED_SLUGS = ["favicon.ico", "api", "auth", "dashboard", "jobs", "organizations", "internships", "fellowships", "scholarships", "grants", "consultancies", "volunteer", "events", "recruiter"];
  if (EXCLUDED_SLUGS.includes(organizationSlug)) {
    return notFound();
  }

  const orgs = await db.organization.findMany();
  const org = orgs.find((o: any) => slugify(o.name) === organizationSlug);

  if (!org) {
    return notFound();
  }

  // Fetch opportunities posted by this organization
  const allJobs = await db.job.findMany({ where: { organizationId: org.id, isActive: true }, orderBy: { createdAt: "desc" } });
  const allInternships = await db.internship.findMany({ where: { organizationId: org.id, isActive: true }, orderBy: { createdAt: "desc" } });
  const allFellowships = await db.fellowship.findMany({ where: { organizationId: org.id, isActive: true }, orderBy: { createdAt: "desc" } });
  const allScholarships = await db.scholarship.findMany({ where: { organizationId: org.id, isActive: true }, orderBy: { createdAt: "desc" } });
  const allGrants = await db.grant.findMany({ where: { organizationId: org.id, isActive: true }, orderBy: { createdAt: "desc" } });
  const allConsultancies = await db.consultancy.findMany({ where: { organizationId: org.id, isActive: true }, orderBy: { createdAt: "desc" } });
  const allVolunteers = await db.volunteer.findMany({ where: { organizationId: org.id, isActive: true }, orderBy: { createdAt: "desc" } });
  const allEvents = await db.event.findMany({ where: { organizerId: org.id }, orderBy: { createdAt: "desc" } });

  // Calculate active openings count
  const activeCount = allJobs.length + allInternships.length + allFellowships.length + allScholarships.length + allGrants.length + allConsultancies.length + allVolunteers.length + allEvents.length;

  // Calculate total applications using scalar IN queries (supports both mock DB and production)
  const jobApps = await db.application.count({ where: { jobId: { in: allJobs.map((j: any) => j.id) } } });
  const internshipApps = await db.application.count({ where: { internshipId: { in: allInternships.map((i: any) => i.id) } } });
  const fellowshipApps = await db.application.count({ where: { fellowshipId: { in: allFellowships.map((f: any) => f.id) } } });
  const scholarshipApps = await db.application.count({ where: { scholarshipId: { in: allScholarships.map((s: any) => s.id) } } });
  const grantApps = await db.application.count({ where: { grantId: { in: allGrants.map((g: any) => g.id) } } });
  const consultancyApps = await db.application.count({ where: { consultancyId: { in: allConsultancies.map((c: any) => c.id) } } });
  const volunteerApps = await db.application.count({ where: { volunteerId: { in: allVolunteers.map((v: any) => v.id) } } });
  
  const totalAppsCount = jobApps + internshipApps + fellowshipApps + scholarshipApps + grantApps + consultancyApps + volunteerApps;

  // Calculate total event registrations
  const totalEventRegistrations = await db.registration.count({
    where: {
      eventId: { in: allEvents.map((e: any) => e.id) }
    }
  });

  // Fetch team members
  const teamMembers = await db.teamMember.findMany({
    where: { organizationId: org.id },
    orderBy: { displayOrder: "asc" }
  });

  // Organization Schema
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": org.name,
    "url": org.website || "https://developmentwala.com",
    "logo": org.logo || "https://developmentwala.com/logo.png",
    "description": org.description || `${org.name} is a verified social impact organization on DevelopmentWala.`
  };

  return (
    <div className="bg-background min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Hero Banner Section */}
      <section className="relative bg-white dark:bg-zinc-950 border-b border-card-border pb-12">
        {org.coverBanner ? (
          <div className="w-full h-[300px] md:h-[400px] overflow-hidden">
            <img src={org.coverBanner} alt={`${org.name} Cover`} className="w-full h-full object-cover" />
          </div>
        ) : (
          <div className="w-full h-[200px] md:h-[300px] bg-gradient-to-br from-primary/10 via-primary/5 to-secondary/10"></div>
        )}

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="flex flex-col md:flex-row gap-6 -mt-16 md:-mt-24 sm:items-end mb-6">
            <div className="bg-white dark:bg-zinc-950 p-3 rounded-2xl border border-card-border shadow-lg shrink-0 w-32 h-32 md:w-48 md:h-48 z-10">
              {org.logo ? (
                <img src={org.logo} alt={org.name} className="w-full h-full object-contain rounded-xl" />
              ) : (
                <div className="w-full h-full rounded-xl bg-primary/10 flex items-center justify-center text-primary font-extrabold text-5xl">
                  {org.name.substring(0, 1)}
                </div>
              )}
            </div>
            
            <div className="flex-1 space-y-3 pb-2 z-10">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-3xl md:text-4xl font-black text-foreground">{org.name}</h1>
                <span className="text-xs font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-3 py-1 rounded-full border border-emerald-500/20 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Verified
                </span>
                {org.orgType && (
                  <span className="text-xs font-bold uppercase tracking-wider bg-blue-500/10 text-blue-600 dark:text-blue-400 px-3 py-1 rounded-full border border-blue-500/20">
                    {org.orgType}
                  </span>
                )}
              </div>
              
              <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted">
                {org.headquarters && (
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-primary shrink-0" />
                    <span>{org.headquarters}</span>
                  </div>
                )}
                {org.website && (
                  <a href={org.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-primary hover:underline">
                    <Globe className="w-4 h-4 shrink-0" />
                    <span>{org.website.replace(/^https?:\/\//, '')}</span>
                  </a>
                )}
              </div>
            </div>

            <div className="pb-2 z-10 md:text-right">
              <Link href="/organizations" className="inline-flex items-center gap-1.5 px-4 py-2 bg-white/50 dark:bg-zinc-950/50 backdrop-blur-md border border-card-border rounded-lg text-xs font-bold text-foreground hover:bg-white dark:hover:bg-zinc-900 transition-colors">
                <ArrowLeft className="w-4 h-4" /> Back to Directory
              </Link>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col lg:flex-row gap-10">
        
        {/* LEFT SIDEBAR - Overview, Stats, Contact */}
        <aside className="lg:w-[340px] shrink-0 space-y-6">
          
          {/* Contact Information */}
          <div className="glass-panel p-6 rounded-2xl border border-card-border space-y-5">
            <h3 className="font-extrabold text-foreground uppercase tracking-wider text-xs flex items-center gap-2">
              <ArrowUpRight className="w-4 h-4 text-primary" /> Contact Organization
            </h3>
            
            <div className="space-y-3.5">
              {org.website && (
                <a href={org.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 rounded-xl border border-card-border hover:border-primary/30 hover:bg-primary/5 transition-colors group">
                  <Globe className="w-5 h-5 text-primary shrink-0" />
                  <div className="overflow-hidden">
                    <p className="text-[10px] font-bold text-muted uppercase">Visit Website</p>
                    <p className="text-sm font-semibold text-foreground truncate group-hover:text-primary transition-colors">{org.website.replace(/^https?:\/\//, '')}</p>
                  </div>
                </a>
              )}
              {org.email && (
                <a href={`mailto:${org.email}`} className="flex items-center gap-3 p-3 rounded-xl border border-card-border hover:border-primary/30 hover:bg-primary/5 transition-colors group">
                  <Mail className="w-5 h-5 text-primary shrink-0" />
                  <div className="overflow-hidden">
                    <p className="text-[10px] font-bold text-muted uppercase">Send Email</p>
                    <p className="text-sm font-semibold text-foreground truncate group-hover:text-primary transition-colors">{org.email}</p>
                  </div>
                </a>
              )}
              {org.phone && (
                <a href={`tel:${org.phone}`} className="flex items-center gap-3 p-3 rounded-xl border border-card-border hover:border-primary/30 hover:bg-primary/5 transition-colors group">
                  <Phone className="w-5 h-5 text-primary shrink-0" />
                  <div className="overflow-hidden">
                    <p className="text-[10px] font-bold text-muted uppercase">Call Us</p>
                    <p className="text-sm font-semibold text-foreground truncate group-hover:text-primary transition-colors">{org.phone}</p>
                  </div>
                </a>
              )}
              {org.careersPage && (
                <a href={org.careersPage} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 rounded-xl border border-card-border hover:border-primary/30 hover:bg-primary/5 transition-colors group">
                  <Briefcase className="w-5 h-5 text-primary shrink-0" />
                  <div className="overflow-hidden">
                    <p className="text-[10px] font-bold text-muted uppercase">Careers Page</p>
                    <p className="text-sm font-semibold text-foreground truncate group-hover:text-primary transition-colors">External Listings</p>
                  </div>
                </a>
              )}
            </div>

            {/* Social Media */}
            {(org.linkedin || org.twitter || org.instagram || org.facebook) && (
              <div className="pt-5 border-t border-card-border">
                <p className="text-[10px] font-bold text-muted uppercase mb-3">Social Media</p>
                <div className="flex gap-2">
                  {org.linkedin && (
                    <a href={org.linkedin} target="_blank" rel="noopener noreferrer" className="p-2.5 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:text-primary hover:bg-primary/10 transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/></svg>
                    </a>
                  )}
                  {org.twitter && (
                    <a href={org.twitter} target="_blank" rel="noopener noreferrer" className="p-2.5 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:text-primary hover:bg-primary/10 transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg>
                    </a>
                  )}
                  {org.instagram && (
                    <a href={org.instagram} target="_blank" rel="noopener noreferrer" className="p-2.5 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:text-primary hover:bg-primary/10 transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
                    </a>
                  )}
                  {org.facebook && (
                    <a href={org.facebook} target="_blank" rel="noopener noreferrer" className="p-2.5 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:text-primary hover:bg-primary/10 transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Organization Details */}
          <div className="glass-panel p-6 rounded-2xl border border-card-border space-y-4">
            <h3 className="font-extrabold text-foreground uppercase tracking-wider text-xs flex items-center gap-2">
              <Building className="w-4 h-4 text-primary" /> Organization Details
            </h3>
            
            <div className="space-y-3 pt-2">
              {org.registrationNumber && (
                <div className="flex justify-between items-center text-sm border-b border-card-border pb-3">
                  <span className="text-muted font-medium">Reg. Number</span>
                  <span className="text-foreground font-bold">{org.registrationNumber}</span>
                </div>
              )}
              {org.yearFounded && (
                <div className="flex justify-between items-center text-sm border-b border-card-border pb-3">
                  <span className="text-muted font-medium">Founded</span>
                  <span className="text-foreground font-bold">{org.yearFounded}</span>
                </div>
              )}
              {org.orgSize && (
                <div className="flex justify-between items-center text-sm border-b border-card-border pb-3">
                  <span className="text-muted font-medium">Org Size</span>
                  <span className="text-foreground font-bold">{org.orgSize}</span>
                </div>
              )}
              {org.employeesCount !== null && org.employeesCount !== undefined && (
                <div className="flex justify-between items-center text-sm border-b border-card-border pb-3">
                  <span className="text-muted font-medium">Employees</span>
                  <span className="text-foreground font-bold">{org.employeesCount}</span>
                </div>
              )}
              {org.volunteersCount !== null && org.volunteersCount !== undefined && (
                <div className="flex justify-between items-center text-sm border-b border-card-border pb-3">
                  <span className="text-muted font-medium">Volunteers</span>
                  <span className="text-foreground font-bold">{org.volunteersCount}</span>
                </div>
              )}
              {org.annualBudget && (
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted font-medium">Annual Budget</span>
                  <span className="text-foreground font-bold">{org.annualBudget}</span>
                </div>
              )}
            </div>
          </div>

          {/* Organization Statistics */}
          <div className="bg-primary/5 p-6 rounded-2xl border border-primary/20 space-y-4">
            <h3 className="font-extrabold text-primary uppercase tracking-wider text-xs flex items-center gap-2">
              <Award className="w-4 h-4" /> Impact & Reach
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white dark:bg-zinc-950 p-4 rounded-xl border border-card-border text-center">
                <p className="text-2xl font-black text-foreground">{activeCount}</p>
                <p className="text-[10px] font-bold uppercase text-muted mt-1">Active Openings</p>
              </div>
              <div className="bg-white dark:bg-zinc-950 p-4 rounded-xl border border-card-border text-center">
                <p className="text-2xl font-black text-foreground">{totalAppsCount}</p>
                <p className="text-[10px] font-bold uppercase text-muted mt-1">Total Apps</p>
              </div>
              <div className="bg-white dark:bg-zinc-950 p-4 rounded-xl border border-card-border text-center">
                <p className="text-2xl font-black text-foreground">{allEvents.length}</p>
                <p className="text-[10px] font-bold uppercase text-muted mt-1">Events Hosted</p>
              </div>
              <div className="bg-white dark:bg-zinc-950 p-4 rounded-xl border border-card-border text-center">
                <p className="text-2xl font-black text-foreground">{totalEventRegistrations}</p>
                <p className="text-[10px] font-bold uppercase text-muted mt-1">Attendees</p>
              </div>
            </div>
          </div>

        </aside>


        {/* MAIN CONTENT AREA */}
        <div className="flex-1 space-y-8 min-w-0">
          
          {/* About Section */}
          <div className="glass-panel p-8 rounded-2xl border border-card-border space-y-8">
            {org.description && (
              <div className="space-y-4">
                <h2 className="text-lg font-black text-foreground flex items-center gap-2">
                  <Building className="w-5 h-5 text-primary" /> About {org.name}
                </h2>
                <p className="text-sm text-muted leading-relaxed whitespace-pre-line font-medium">
                  {org.description}
                </p>
              </div>
            )}

            {(org.mission || org.vision) && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-6 border-t border-card-border">
                {org.mission && (
                  <div className="space-y-3">
                    <h3 className="text-xs font-extrabold uppercase tracking-wider text-primary">Our Mission</h3>
                    <p className="text-sm text-foreground font-semibold italic">"{org.mission}"</p>
                  </div>
                )}
                {org.vision && (
                  <div className="space-y-3">
                    <h3 className="text-xs font-extrabold uppercase tracking-wider text-primary">Our Vision</h3>
                    <p className="text-sm text-foreground font-semibold italic">"{org.vision}"</p>
                  </div>
                )}
              </div>
            )}

            {/* Badges Section */}
            {((org.causeAreas && org.causeAreas.length > 0) || (org.sdgs && org.sdgs.length > 0) || (org.areasOfWork && org.areasOfWork.length > 0)) && (
              <div className="pt-6 border-t border-card-border space-y-6">
                
                {org.causeAreas && org.causeAreas.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-muted flex items-center gap-1.5">
                      <Heart className="w-3.5 h-3.5" /> Cause Areas
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {org.causeAreas.map((c: string) => (
                        <span key={c} className="text-[11px] bg-neutral-100 dark:bg-neutral-800 px-3 py-1.5 rounded-md text-foreground font-bold">
                          {c}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {org.sdgs && org.sdgs.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-muted flex items-center gap-1.5">
                      <Tag className="w-3.5 h-3.5" /> SDGs Aligned
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {org.sdgs.map((s: string) => (
                        <span key={s} className="text-[11px] bg-primary/10 text-primary px-3 py-1.5 rounded-md font-bold">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {org.areasOfWork && org.areasOfWork.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-muted flex items-center gap-1.5">
                      <Briefcase className="w-3.5 h-3.5" /> Areas of Work
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {org.areasOfWork.map((a: string) => (
                        <span key={a} className="text-[11px] border border-card-border bg-white dark:bg-zinc-900 px-3 py-1.5 rounded-md text-muted font-semibold">
                          {a}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

              </div>
            )}
          </div>

          {/* Current Opportunities (Categorized) */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-black text-foreground">Current Opportunities</h2>
              <span className="bg-primary text-white font-bold text-xs px-3 py-1 rounded-full">{activeCount} Openings</span>
            </div>

            {activeCount === 0 ? (
              <div className="glass-panel p-10 rounded-2xl border border-card-border text-center space-y-3">
                <div className="w-16 h-16 bg-neutral-100 dark:bg-neutral-800 rounded-full flex items-center justify-center mx-auto mb-2 text-muted">
                  <Briefcase className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-foreground">No Active Openings</h3>
                <p className="text-sm text-muted">There are currently no open opportunities at {org.name}. Check back later!</p>
              </div>
            ) : (
              <div className="space-y-10">
                {/* Jobs */}
                {allJobs.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-extrabold text-foreground border-b border-card-border pb-2 flex items-center justify-between">
                      Jobs <span className="text-xs bg-neutral-200 dark:bg-neutral-800 px-2 py-0.5 rounded text-muted">{allJobs.length}</span>
                    </h3>
                    <div className="space-y-4">
                      {allJobs.map((opp: any) => (
                        <OpportunityCard key={opp.id} item={{...opp, organization: org}} type="JOB" href={`/jobs/${opp.slug}`} />
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Internships */}
                {allInternships.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-extrabold text-foreground border-b border-card-border pb-2 flex items-center justify-between">
                      Internships <span className="text-xs bg-neutral-200 dark:bg-neutral-800 px-2 py-0.5 rounded text-muted">{allInternships.length}</span>
                    </h3>
                    <div className="space-y-4">
                      {allInternships.map((opp: any) => (
                        <OpportunityCard key={opp.id} item={{...opp, organization: org}} type="INTERNSHIP" href={`/internships/${opp.slug}`} />
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Fellowships */}
                {allFellowships.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-extrabold text-foreground border-b border-card-border pb-2 flex items-center justify-between">
                      Fellowships <span className="text-xs bg-neutral-200 dark:bg-neutral-800 px-2 py-0.5 rounded text-muted">{allFellowships.length}</span>
                    </h3>
                    <div className="space-y-4">
                      {allFellowships.map((opp: any) => (
                        <OpportunityCard key={opp.id} item={{...opp, organization: org}} type="FELLOWSHIP" href={`/fellowships/${opp.slug}`} />
                      ))}
                    </div>
                  </div>
                )}

                {/* Scholarships */}
                {allScholarships.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-extrabold text-foreground border-b border-card-border pb-2 flex items-center justify-between">
                      Scholarships <span className="text-xs bg-neutral-200 dark:bg-neutral-800 px-2 py-0.5 rounded text-muted">{allScholarships.length}</span>
                    </h3>
                    <div className="space-y-4">
                      {allScholarships.map((opp: any) => (
                        <OpportunityCard key={opp.id} item={{...opp, organization: org}} type="SCHOLARSHIP" href={`/scholarships/${opp.slug}`} />
                      ))}
                    </div>
                  </div>
                )}

                {/* Grants */}
                {allGrants.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-extrabold text-foreground border-b border-card-border pb-2 flex items-center justify-between">
                      Grants <span className="text-xs bg-neutral-200 dark:bg-neutral-800 px-2 py-0.5 rounded text-muted">{allGrants.length}</span>
                    </h3>
                    <div className="space-y-4">
                      {allGrants.map((opp: any) => (
                        <OpportunityCard key={opp.id} item={{...opp, organization: org}} type="GRANT" href={`/grants/${opp.slug}`} />
                      ))}
                    </div>
                  </div>
                )}

                {/* Consultancies */}
                {allConsultancies.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-extrabold text-foreground border-b border-card-border pb-2 flex items-center justify-between">
                      Consultancies <span className="text-xs bg-neutral-200 dark:bg-neutral-800 px-2 py-0.5 rounded text-muted">{allConsultancies.length}</span>
                    </h3>
                    <div className="space-y-4">
                      {allConsultancies.map((opp: any) => (
                        <OpportunityCard key={opp.id} item={{...opp, organization: org}} type="CONSULTANCY" href={`/consultancies/${opp.slug}`} />
                      ))}
                    </div>
                  </div>
                )}

                {/* Volunteers */}
                {allVolunteers.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-extrabold text-foreground border-b border-card-border pb-2 flex items-center justify-between">
                      Volunteer Positions <span className="text-xs bg-neutral-200 dark:bg-neutral-800 px-2 py-0.5 rounded text-muted">{allVolunteers.length}</span>
                    </h3>
                    <div className="space-y-4">
                      {allVolunteers.map((opp: any) => (
                        <OpportunityCard key={opp.id} item={{...opp, organization: org}} type="VOLUNTEER" href={`/volunteer/${opp.slug}`} />
                      ))}
                    </div>
                  </div>
                )}

                {/* Events */}
                {allEvents.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-extrabold text-foreground border-b border-card-border pb-2 flex items-center justify-between">
                      Events <span className="text-xs bg-neutral-200 dark:bg-neutral-800 px-2 py-0.5 rounded text-muted">{allEvents.length}</span>
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {allEvents.map((opp: any) => (
                        <EventCard key={opp.id} item={{...opp, organizer: org}} href={`/events/${opp.slug}`} />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Meet Our Team */}
          {teamMembers.length > 0 && (
            <div className="glass-panel p-8 rounded-2xl border border-card-border space-y-6">
              <h2 className="text-2xl font-black text-foreground flex items-center gap-2">
                <Users2 className="w-6 h-6 text-primary" /> Meet the Team
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {teamMembers.map((member: any) => (
                  <div key={member.id} className="p-5 rounded-2xl border border-card-border bg-white/40 dark:bg-zinc-950/30 hover:border-primary/40 transition-colors flex flex-col h-full gap-4">
                    <div className="flex items-start gap-4">
                      {member.profilePhoto ? (
                        <img src={member.profilePhoto} alt={member.fullName} className="w-14 h-14 rounded-full object-cover border-2 border-primary/20 shrink-0" />
                      ) : (
                        <div className="w-14 h-14 rounded-full bg-primary/10 text-primary flex items-center justify-center font-black text-xl shrink-0 border-2 border-primary/20">
                          {member.fullName?.substring(0, 1)}
                        </div>
                      )}
                      <div className="flex-1">
                        <h4 className="text-base font-bold text-foreground leading-tight">{member.fullName}</h4>
                        <p className="text-xs text-primary font-semibold mt-0.5">{member.designation}</p>
                        
                        {(member.linkedinUrl || member.email || member.phone) && (
                          <div className="flex flex-wrap gap-2 mt-2">
                            {member.linkedinUrl && (
                              <a href={member.linkedinUrl} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded-md bg-neutral-100 dark:bg-neutral-800 text-neutral-500 hover:text-primary transition-colors" title="LinkedIn">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/></svg>
                              </a>
                            )}
                            {member.email && (
                              <a href={`mailto:${member.email}`} className="p-1.5 rounded-md bg-neutral-100 dark:bg-neutral-800 text-neutral-500 hover:text-primary transition-colors" title="Email">
                                <Mail className="w-3.5 h-3.5" />
                              </a>
                            )}
                            {member.phone && (
                              <a href={`tel:${member.phone}`} className="p-1.5 rounded-md bg-neutral-100 dark:bg-neutral-800 text-neutral-500 hover:text-primary transition-colors" title="Phone">
                                <Phone className="w-3.5 h-3.5" />
                              </a>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    {member.bio && (
                      <p className="text-xs text-muted leading-relaxed line-clamp-4 mt-auto pt-2 border-t border-card-border">
                        {member.bio}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
