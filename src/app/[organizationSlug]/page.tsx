import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import { 
  Building, Globe, Briefcase, MapPin, 
  Calendar, IndianRupee, ArrowLeft, Users, 
  Heart, Tag, Award, Users2, Mail, Phone, ArrowUpRight
} from "lucide-react";
import type { Metadata } from "next";

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
  const allJobs = await db.job.findMany({ where: { organizationId: org.id, isActive: true } });
  const allInternships = await db.internship.findMany({ where: { organizationId: org.id, isActive: true } });
  const allFellowships = await db.fellowship.findMany({ where: { organizationId: org.id, isActive: true } });
  const allScholarships = await db.scholarship.findMany({ where: { organizationId: org.id, isActive: true } });
  const allGrants = await db.grant.findMany({ where: { organizationId: org.id, isActive: true } });
  const allConsultancies = await db.consultancy.findMany({ where: { organizationId: org.id, isActive: true } });
  const allVolunteers = await db.volunteer.findMany({ where: { organizationId: org.id, isActive: true } });
  const allEvents = await db.event.findMany({ where: { organizerId: org.id } });

  // Fetch associated recruiters
  const recruiters = await db.user.findMany({
    where: { organizationId: org.id, role: "EMPLOYER" }
  });

  // Calculate active openings count
  const activeCount = allJobs.length + allInternships.length + allFellowships.length + allScholarships.length + allGrants.length + allConsultancies.length + allVolunteers.length + allEvents.length;

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
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-1">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="mb-6">
        <Link href="/organizations" className="text-xs text-muted hover:text-foreground inline-flex items-center gap-1 transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to NGO Directory
        </Link>
      </div>

      {/* Cover Banner */}
      {org.coverBanner ? (
        <div className="w-full h-56 rounded-2xl overflow-hidden border border-card-border mb-8 shadow-md">
          <img src={org.coverBanner} alt="" className="w-full h-full object-cover" />
        </div>
      ) : (
        <div className="w-full h-36 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-2xl border border-card-border mb-8"></div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Organization Details */}
        <div className="lg:col-span-1 space-y-6">
          <div className="glass-panel p-6 rounded-2xl border border-card-border h-fit space-y-6 text-left">
            <div className="flex flex-col items-center text-center space-y-3">
              {org.logo ? (
                <img src={org.logo} alt={org.name} className="w-24 h-24 object-contain rounded-xl border border-card-border p-2 bg-white" />
              ) : (
                <div className="w-24 h-24 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-card-border font-extrabold text-3xl">
                  {org.name.substring(0, 1)}
                </div>
              )}
              <h1 className="text-xl font-extrabold text-foreground leading-tight">{org.name}</h1>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-3 py-1 rounded-full border border-emerald-500/20">
                Verified NGO Partner
              </span>
            </div>

            {/* Quick stats */}
            <div className="border-t border-card-border pt-4 space-y-3.5 text-xs text-muted">
              {org.orgType && (
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-primary shrink-0" />
                  <span>Type: <strong className="text-foreground">{org.orgType}</strong></span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-primary shrink-0" />
                <span>Active Listings: <strong className="text-foreground">{activeCount}</strong></span>
              </div>
              {org.orgSize && (
                <div className="flex items-center gap-2">
                  <Users2 className="w-4 h-4 text-primary shrink-0" />
                  <span>Size: <strong className="text-foreground">{org.orgSize} Members</strong></span>
                </div>
              )}
              {org.yearFounded && (
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-primary shrink-0" />
                  <span>Founded in: <strong className="text-foreground">{org.yearFounded}</strong></span>
                </div>
              )}
              {org.headquarters && (
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-primary shrink-0" />
                  <span>HQ: <strong className="text-foreground">{org.headquarters}</strong></span>
                </div>
              )}
              {org.annualBudget && (
                <div className="flex items-center gap-2">
                  <IndianRupee className="w-4 h-4 text-primary shrink-0" />
                  <span>Annual Budget: <strong className="text-foreground">{org.annualBudget}</strong></span>
                </div>
              )}
              
              <div className="border-t border-card-border pt-3 space-y-2">
                {org.website && (
                  <a 
                    href={org.website} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="flex items-center gap-2 text-primary hover:underline font-semibold"
                  >
                    <Globe className="w-4 h-4 shrink-0" />
                    <span>Official Website</span>
                  </a>
                )}
                {org.email && (
                  <p className="flex items-center gap-2">
                    <Mail className="w-4 h-4 shrink-0" />
                    <span className="truncate">{org.email}</span>
                  </p>
                )}
                {org.phone && (
                  <p className="flex items-center gap-2">
                    <Phone className="w-4 h-4 shrink-0" />
                    <span>{org.phone}</span>
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Cause Areas & SDGs */}
          {((org.causeAreas && org.causeAreas.length > 0) || (org.sdgs && org.sdgs.length > 0)) && (
            <div className="glass-panel p-6 rounded-2xl border border-card-border text-left space-y-4">
              {org.causeAreas && org.causeAreas.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
                    <Heart className="w-4 h-4" />
                    <span>Cause Areas</span>
                  </h3>
                  <div className="flex flex-wrap gap-1.5">
                    {org.causeAreas.map((c: string) => (
                      <span key={c} className="text-[10px] bg-white/40 dark:bg-zinc-950/40 border border-card-border px-2 py-0.5 rounded text-muted font-semibold">
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {org.sdgs && org.sdgs.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-card-border/50">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
                    <Tag className="w-4 h-4" />
                    <span>UN SDGs Aligned</span>
                  </h3>
                  <div className="flex flex-wrap gap-1.5">
                    {org.sdgs.map((s: string) => (
                      <span key={s} className="text-[10px] bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded font-semibold">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Column: Dynamic Content & Active Openings */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Mission & Vision */}
          {(org.mission || org.vision) && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {org.mission && (
                <div className="glass-panel p-5 rounded-2xl border border-card-border space-y-2 text-left">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-primary">Our Mission</h3>
                  <p className="text-xs text-muted italic">"{org.mission}"</p>
                </div>
              )}
              {org.vision && (
                <div className="glass-panel p-5 rounded-2xl border border-card-border space-y-2 text-left">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-primary">Our Vision</h3>
                  <p className="text-xs text-muted italic">"{org.vision}"</p>
                </div>
              )}
            </div>
          )}

          {/* About description */}
          <div className="glass-panel p-8 rounded-2xl border border-card-border space-y-4 text-left">
            <h2 className="text-lg font-bold text-foreground">About the Organization</h2>
            <p className="text-xs text-muted leading-relaxed whitespace-pre-line">
              {org.description || `${org.name} is working to create positive and sustainable social impact in India. Explore active listings and coordinate with the hiring team below.`}
            </p>
          </div>

          {/* Recruitment Team */}
          {recruiters.length > 0 && (
            <div className="glass-panel p-6 rounded-2xl border border-card-border space-y-4 text-left">
              <h2 className="text-xs font-extrabold uppercase tracking-wider text-primary flex items-center gap-1.5">
                <Users className="w-4.5 h-4.5" />
                <span>Meet Our Recruitment Coordinators</span>
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {recruiters.map((recruiter: any) => (
                  <Link 
                    key={recruiter.id} 
                    href={`/recruiter/${recruiter.id}`}
                    className="p-3 rounded-xl border border-card-border bg-white/30 dark:bg-zinc-950/20 hover:border-neutral-300 dark:hover:border-neutral-800 transition-all flex items-center gap-3 group"
                  >
                    {recruiter.profilePhoto || recruiter.image ? (
                      <img src={recruiter.profilePhoto || recruiter.image || ""} alt="" className="w-8 h-8 rounded-full object-cover border border-card-border" />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-[10px] uppercase">
                        {recruiter.name?.substring(0, 1)}
                      </div>
                    )}
                    <div>
                      <p className="font-bold text-foreground text-xs leading-none group-hover:text-primary transition-colors">{recruiter.name}</p>
                      <p className="text-[9px] text-muted mt-1 leading-none">{recruiter.jobTitle || "Hiring Coordinator"}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Open Opportunities List */}
          <div className="glass-panel p-8 rounded-2xl border border-card-border space-y-6 text-left">
            <h2 className="text-lg font-bold text-foreground">Open Careers & Opportunities</h2>

            {activeCount === 0 ? (
              <div className="py-8 text-center text-xs text-muted">
                There are no active postings from {org.name} right now. Check back later!
              </div>
            ) : (
              <div className="space-y-4">
                
                {/* Jobs */}
                {allJobs.map((job: any) => (
                  <Link 
                    key={job.id} 
                    href={`/jobs/${slugify(org.name)}/${slugify(`${job.title}-${job.workMode === "REMOTE" ? "remote" : job.location}`)}`} 
                    className="block p-4 rounded-xl border border-card-border bg-card hover:bg-card-hover transition-all space-y-2 group"
                  >
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <h3 className="font-bold text-sm text-foreground group-hover:text-primary transition-colors leading-snug">
                          {job.title}
                        </h3>
                        <div className="flex flex-wrap items-center gap-3 text-[11px] text-muted mt-1 font-semibold">
                          <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {job.isRemote ? "Remote" : job.location}</span>
                          {job.salaryMin && (
                            <span className="flex items-center gap-1">
                              <IndianRupee className="w-3.5 h-3.5" /> 
                              ₹{job.salaryMin?.toLocaleString("en-IN")} - ₹{job.salaryMax?.toLocaleString("en-IN")} / yr
                            </span>
                          )}
                        </div>
                      </div>
                      <span className="text-[9px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2.5 py-0.5 rounded border border-emerald-500/20 shrink-0">
                        Job
                      </span>
                    </div>
                  </Link>
                ))}

                {/* Internships */}
                {allInternships.map((intern: any) => (
                  <Link 
                    key={intern.id} 
                    href={`/internships/${intern.id}`} 
                    className="block p-4 rounded-xl border border-card-border bg-card hover:bg-card-hover transition-all space-y-2 group"
                  >
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <h3 className="font-bold text-sm text-foreground group-hover:text-primary transition-colors leading-snug">
                          {intern.title}
                        </h3>
                        <div className="flex flex-wrap items-center gap-3 text-[11px] text-muted mt-1 font-semibold">
                          <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {intern.location}</span>
                          {intern.stipend && (
                            <span className="flex items-center gap-1">
                              <IndianRupee className="w-3.5 h-3.5" /> 
                              ₹{intern.stipend?.toLocaleString("en-IN")} / month
                            </span>
                          )}
                        </div>
                      </div>
                      <span className="text-[9px] font-bold uppercase tracking-wider bg-blue-500/10 text-blue-600 dark:text-blue-400 px-2.5 py-0.5 rounded border border-blue-500/20 shrink-0">
                        Internship
                      </span>
                    </div>
                  </Link>
                ))}

                {/* Fellowships */}
                {allFellowships.map((fellow: any) => (
                  <Link 
                    key={fellow.id} 
                    href={`/fellowships/${fellow.id}`} 
                    className="block p-4 rounded-xl border border-card-border bg-card hover:bg-card-hover transition-all space-y-2 group"
                  >
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <h3 className="font-bold text-sm text-foreground group-hover:text-primary transition-colors leading-snug">
                          {fellow.title}
                        </h3>
                        <div className="flex flex-wrap items-center gap-3 text-[11px] text-muted mt-1 font-semibold">
                          <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {fellow.location}</span>
                        </div>
                      </div>
                      <span className="text-[9px] font-bold uppercase tracking-wider bg-purple-500/10 text-purple-600 dark:text-purple-400 px-2.5 py-0.5 rounded border border-purple-500/20 shrink-0">
                        Fellowship
                      </span>
                    </div>
                  </Link>
                ))}

                {/* Scholarships */}
                {allScholarships.map((schol: any) => (
                  <Link 
                    key={schol.id} 
                    href={`/scholarships/${schol.id}`} 
                    className="block p-4 rounded-xl border border-card-border bg-card hover:bg-card-hover transition-all space-y-2 group"
                  >
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <h3 className="font-bold text-sm text-foreground group-hover:text-primary transition-colors leading-snug">
                          {schol.title}
                        </h3>
                        <div className="flex flex-wrap items-center gap-3 text-[11px] text-muted mt-1 font-semibold">
                          {schol.amount && (
                            <span className="flex items-center gap-1">
                              <IndianRupee className="w-3.5 h-3.5" /> 
                              ₹{schol.amount?.toLocaleString("en-IN")} worth
                            </span>
                          )}
                        </div>
                      </div>
                      <span className="text-[9px] font-bold uppercase tracking-wider bg-pink-500/10 text-pink-600 dark:text-pink-400 px-2.5 py-0.5 rounded border border-pink-500/20 shrink-0">
                        Scholarship
                      </span>
                    </div>
                  </Link>
                ))}

                {/* Grants */}
                {allGrants.map((grant: any) => (
                  <Link 
                    key={grant.id} 
                    href={`/grants/${grant.id}`} 
                    className="block p-4 rounded-xl border border-card-border bg-card hover:bg-card-hover transition-all space-y-2 group"
                  >
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <h3 className="font-bold text-sm text-foreground group-hover:text-primary transition-colors leading-snug">
                          {grant.title}
                        </h3>
                        <div className="flex flex-wrap items-center gap-3 text-[11px] text-muted mt-1 font-semibold">
                          {grant.fundingMin && (
                            <span className="flex items-center gap-1">
                              <IndianRupee className="w-3.5 h-3.5" /> 
                              ₹{grant.fundingMin?.toLocaleString("en-IN")} - ₹{grant.fundingMax?.toLocaleString("en-IN")} funding
                            </span>
                          )}
                        </div>
                      </div>
                      <span className="text-[9px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-600 dark:text-amber-400 px-2.5 py-0.5 rounded border border-amber-500/20 shrink-0">
                        Grant
                      </span>
                    </div>
                  </Link>
                ))}

                {/* Consultancies */}
                {allConsultancies.map((consult: any) => (
                  <Link 
                    key={consult.id} 
                    href={`/consultancies/${consult.id}`} 
                    className="block p-4 rounded-xl border border-card-border bg-card hover:bg-card-hover transition-all space-y-2 group"
                  >
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <h3 className="font-bold text-sm text-foreground group-hover:text-primary transition-colors leading-snug">
                          {consult.title}
                        </h3>
                        <div className="flex flex-wrap items-center gap-3 text-[11px] text-muted mt-1 font-semibold">
                          {consult.budget && (
                            <span className="flex items-center gap-1">
                              <IndianRupee className="w-3.5 h-3.5" /> 
                              ₹{consult.budget?.toLocaleString("en-IN")} budget
                            </span>
                          )}
                        </div>
                      </div>
                      <span className="text-[9px] font-bold uppercase tracking-wider bg-orange-500/10 text-orange-600 dark:text-orange-400 px-2.5 py-0.5 rounded border border-orange-500/20 shrink-0">
                        Consultancy
                      </span>
                    </div>
                  </Link>
                ))}

                {/* Volunteers */}
                {allVolunteers.map((vol: any) => (
                  <Link 
                    key={vol.id} 
                    href={`/volunteer/${vol.id}`} 
                    className="block p-4 rounded-xl border border-card-border bg-card hover:bg-card-hover transition-all space-y-2 group"
                  >
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <h3 className="font-bold text-sm text-foreground group-hover:text-primary transition-colors leading-snug">
                          {vol.title}
                        </h3>
                        <div className="flex flex-wrap items-center gap-3 text-[11px] text-muted mt-1 font-semibold">
                          <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {vol.location}</span>
                        </div>
                      </div>
                      <span className="text-[9px] font-bold uppercase tracking-wider bg-teal-500/10 text-teal-600 dark:text-teal-400 px-2.5 py-0.5 rounded border border-teal-500/20 shrink-0">
                        Volunteer
                      </span>
                    </div>
                  </Link>
                ))}

                {/* Events */}
                {allEvents.map((ev: any) => (
                  <Link 
                    key={ev.id} 
                    href={`/events/${ev.id}`} 
                    className="block p-4 rounded-xl border border-card-border bg-card hover:bg-card-hover transition-all space-y-2 group"
                  >
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <h3 className="font-bold text-sm text-foreground group-hover:text-primary transition-colors leading-snug">
                          {ev.title}
                        </h3>
                        <div className="flex flex-wrap items-center gap-3 text-[11px] text-muted mt-1 font-semibold">
                          <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {new Date(ev.date).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <span className="text-[9px] font-bold uppercase tracking-wider bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 px-2.5 py-0.5 rounded border border-indigo-500/20 shrink-0">
                        Event
                      </span>
                    </div>
                  </Link>
                ))}

              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
