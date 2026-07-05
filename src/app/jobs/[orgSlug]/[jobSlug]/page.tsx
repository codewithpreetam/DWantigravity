import { db } from "@/lib/db";
import { auth } from "@/auth";
import { notFound } from "next/navigation";
import Link from "next/link";
import { 
  Briefcase, MapPin, Building, Search, 
  IndianRupee, Calendar, ShieldCheck, ArrowUpRight 
} from "lucide-react";
import ApplyButton from "@/components/ApplyButton";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ orgSlug: string; jobSlug: string }>;
  searchParams: Promise<{ q?: string; workMode?: string; employmentType?: string }>;
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

async function findJobBySlugs(allJobs: any[], orgSlug: string, jobSlug: string) {
  return allJobs.find((job: any) => {
    const calculatedOrgSlug = slugify(job.organization?.name || "");
    const calculatedJobSlug = slugify(
      `${job.title}-${job.workMode === "REMOTE" ? "remote" : job.location}`
    );
    return calculatedOrgSlug === orgSlug && calculatedJobSlug === jobSlug;
  });
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params;
  const allJobs = await db.job.findMany({ where: { isActive: true } });
  const job = await findJobBySlugs(allJobs, params.orgSlug, params.jobSlug);

  if (!job) {
    return {
      title: "Job Not Found",
    };
  }

  return {
    title: `${job.title} at ${job.organization?.name || "NGO"}`,
    description: job.description.substring(0, 160),
    openGraph: {
      title: `${job.title} at ${job.organization?.name || "NGO"}`,
      description: job.description.substring(0, 160),
      url: `https://developmentwala.org/jobs/${params.orgSlug}/${params.jobSlug}`,
    }
  };
}

export default async function JobDetailPage(props: Props) {
  const params = await props.params;
  const searchParams = await props.searchParams;
  const q = searchParams.q || "";
  const workMode = searchParams.workMode || "";
  const employmentType = searchParams.employmentType || "";
  const session = await auth();
  const user = session?.user;

  // Fetch active jobs
  const rawJobs = await db.job.findMany({
    where: { isActive: true },
  });

  // Filter client-side or helper side
  const filteredJobs = rawJobs.filter((job: any) => {
    if (q) {
      const s = q.toLowerCase();
      const matchKeyword = 
        job.title.toLowerCase().includes(s) ||
        job.description.toLowerCase().includes(s) ||
        job.organization?.name.toLowerCase().includes(s) ||
        job.location.toLowerCase().includes(s);
      if (!matchKeyword) return false;
    }
    if (workMode && job.workMode !== workMode) return false;
    if (employmentType && job.employmentType !== employmentType) return false;
    return true;
  });

  const selectedJob = await findJobBySlugs(rawJobs, params.orgSlug, params.jobSlug);

  if (!selectedJob) {
    return notFound();
  }

  const alreadyApplied = user?.id ? await db.application.findFirst({
    where: {
      candidateId: user.id,
      jobId: selectedJob.id
    }
  }) : null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 flex flex-col">
      {/* Title & Search bar */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-foreground tracking-tight">Social Impact Jobs</h1>
          <p className="text-xs text-muted mt-1">Discover meaningful, verified careers in the Indian development sector.</p>
        </div>
        <form method="GET" action="/jobs" className="flex flex-wrap items-center gap-2 max-w-xl w-full glass-panel p-1.5 rounded-xl">
          <div className="flex items-center gap-1.5 flex-1 min-w-[140px]">
            <Search className="w-4 h-4 text-muted ml-1" />
            <input 
              type="text" 
              name="q" 
              defaultValue={q}
              placeholder="Search keywords..."
              className="w-full bg-transparent px-1 py-1 text-xs text-foreground focus:outline-none placeholder:text-muted"
            />
          </div>
          
          <select 
            name="workMode" 
            defaultValue={workMode}
            className="text-xs bg-neutral-100 dark:bg-zinc-800 border-none outline-none p-1.5 rounded-lg text-foreground font-semibold"
          >
            <option value="">Work Mode</option>
            <option value="REMOTE">Remote</option>
            <option value="HYBRID">Hybrid</option>
            <option value="ON_SITE">On-Site</option>
          </select>

          <select 
            name="employmentType" 
            defaultValue={employmentType}
            className="text-xs bg-neutral-100 dark:bg-zinc-800 border-none outline-none p-1.5 rounded-lg text-foreground font-semibold"
          >
            <option value="">Job Type</option>
            <option value="FULL_TIME">Full-time</option>
            <option value="PART_TIME">Part-time</option>
            <option value="CONTRACT">Contract</option>
          </select>

          <button 
            type="submit" 
            className="px-3.5 py-1.5 bg-primary hover:bg-primary-hover text-white rounded-lg text-xs font-semibold cursor-pointer transition-colors shadow-sm"
          >
            Filter
          </button>
        </form>
      </div>

      {filteredJobs.length === 0 ? (
        <div className="glass-panel p-12 text-center rounded-xl flex-1 flex flex-col justify-center items-center">
          <Briefcase className="w-12 h-12 text-muted mb-4" />
          <h3 className="text-lg font-bold text-foreground">No Jobs Found</h3>
          <p className="text-xs text-muted max-w-xs mt-1">Try broadening your search keywords or checking back later.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 flex-1 items-start">
          {/* Left Column: JobList */}
          <div className="lg:col-span-5 space-y-4 max-h-[70vh] overflow-y-auto pr-2">
            {filteredJobs.map((job: any) => {
              const isSelected = selectedJob?.id === job.id;
              return (
                <Link
                  key={job.id}
                  href={`/jobs/${slugify(job.organization?.name || "ngo")}/${slugify(`${job.title}-${job.workMode === "REMOTE" ? "remote" : job.location}`)}?q=${q}&workMode=${workMode}&employmentType=${employmentType}`}
                  className={`block glass-panel p-5 rounded-xl border text-left transition-all ${
                    isSelected 
                      ? "border-primary ring-1 ring-primary bg-primary/5" 
                      : "hover:border-neutral-300 dark:hover:border-neutral-700"
                  }`}
                >
                  <div className="flex justify-between items-start gap-2">
                    <h3 className="font-bold text-sm text-foreground line-clamp-1">{job.title}</h3>
                    <ShieldCheck className="w-4 h-4 text-primary shrink-0" />
                  </div>
                  <p className="text-xs text-muted mt-1 flex items-center gap-1">
                    <Building className="w-3.5 h-3.5" /> {job.organization?.name}
                  </p>
                  <div className="flex flex-wrap items-center gap-3 text-[11px] text-muted mt-3">
                    <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {job.location}</span>
                    <span className="flex items-center gap-1">
                      <IndianRupee className="w-3 h-3" /> 
                      ₹{(job.salaryMin / 100000).toFixed(1)}L - {(job.salaryMax / 100000).toFixed(1)}L
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Right Column: Detailed View */}
          <div className="lg:col-span-7 glass-panel p-6 rounded-xl border border-card-border sticky top-24">
            {selectedJob ? (
              <div className="space-y-6">
                <script
                  type="application/ld+json"
                  dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                      "@context": "https://schema.org",
                      "@type": "JobPosting",
                      "title": selectedJob.title,
                      "description": selectedJob.description,
                      "datePosted": selectedJob.createdAt,
                      "validThrough": new Date(new Date(selectedJob.createdAt).getTime() + 90 * 24 * 60 * 60 * 1000).toISOString(),
                      "employmentType": selectedJob.employmentType || "FULL_TIME",
                      "directApply": true,
                      "hiringOrganization": {
                        "@type": "Organization",
                        "name": selectedJob.organization?.name,
                        "logo": selectedJob.organization?.logo || "https://developmentwala.org/logo.png",
                        "sameAs": selectedJob.organization?.website || "https://developmentwala.org",
                      },
                      "jobLocation": {
                        "@type": "Place",
                        "address": {
                          "@type": "PostalAddress",
                          "addressLocality": selectedJob.isRemote ? "Remote / India" : selectedJob.location,
                          "addressRegion": "India",
                          "addressCountry": "IN"
                        }
                      },
                      "jobLocationType": selectedJob.isRemote ? "TELECOMMUTE" : undefined,
                      "applicantLocationRequirements": selectedJob.isRemote 
                        ? {
                            "@type": "Country",
                            "name": "IN"
                          }
                        : undefined,
                      "baseSalary": {
                        "@type": "MonetaryAmount",
                        "currency": "INR",
                        "value": {
                          "@type": "QuantitativeValue",
                          "minValue": selectedJob.salaryMin || 300000,
                          "maxValue": selectedJob.salaryMax || 600000,
                          "unitText": "YEAR"
                        }
                      }
                    })
                  }}
                />
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-full">
                      {selectedJob.employmentType ? selectedJob.employmentType.replace("_", " ") : "Full-time"} 
                      {selectedJob.workMode === "REMOTE" ? " (Remote)" : selectedJob.workMode === "HYBRID" ? " (Hybrid)" : " (On-site)"}
                    </span>
                    <span className="text-xs text-muted flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" /> Posted {new Date(selectedJob.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <h2 className="text-2xl font-extrabold text-foreground">{selectedJob.title}</h2>
                  <div className="flex flex-wrap items-center gap-4 text-xs text-muted mt-2">
                    <span className="flex items-center gap-1"><Building className="w-4 h-4 text-primary" /> 
                      {selectedJob.organization ? (
                        <Link href={`/${slugify(selectedJob.organization.name)}`} className="hover:underline font-semibold text-primary">
                          {selectedJob.organization.name}
                        </Link>
                      ) : "NGO"}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" /> 
                      {selectedJob.workMode === "REMOTE" 
                        ? "Fully Remote" 
                        : selectedJob.workMode === "HYBRID" 
                          ? `${selectedJob.location} (Hybrid)` 
                          : selectedJob.location
                      }
                    </span>
                    <span className="flex items-center gap-1">
                      <IndianRupee className="w-4 h-4" /> 
                      ₹{selectedJob.salaryMin?.toLocaleString("en-IN")} - {selectedJob.salaryMax?.toLocaleString("en-IN")} / year
                    </span>
                  </div>
                </div>

                <div className="border-t border-card-border pt-4">
                  <h4 className="text-sm font-bold text-foreground mb-2">Job Description</h4>
                  <div className="text-xs text-muted leading-relaxed whitespace-pre-wrap prose prose-sm max-w-none dark:prose-invert" dangerouslySetInnerHTML={{ __html: selectedJob.description }} />
                </div>

                {selectedJob.requirements && (
                  <div className="border-t border-card-border pt-4">
                    <h4 className="text-sm font-bold text-foreground mb-2">Requirements</h4>
                    <p className="text-xs text-muted leading-relaxed whitespace-pre-line">{selectedJob.requirements}</p>
                  </div>
                )}

                {selectedJob.postedBy && (
                  <div className="border-t border-card-border pt-5 space-y-3 text-left">
                    <h4 className="text-[10px] font-bold uppercase tracking-wider text-primary">Opportunity Coordinator</h4>
                    <div className="flex items-center gap-3 p-3 rounded-xl border border-card-border bg-white/30 dark:bg-zinc-950/20 w-fit">
                      {selectedJob.postedBy.profilePhoto || selectedJob.postedBy.image ? (
                        <img 
                          src={selectedJob.postedBy.profilePhoto || selectedJob.postedBy.image} 
                          alt="" 
                          className="w-10 h-10 rounded-full object-cover border border-card-border" 
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-xs uppercase">
                          {selectedJob.postedBy.name?.substring(0, 1) || "R"}
                        </div>
                      )}
                      <div className="text-left">
                        <p className="font-extrabold text-xs text-foreground leading-none">{selectedJob.postedBy.name}</p>
                        <p className="text-[9px] text-muted mt-1.5 leading-none">{selectedJob.postedBy.jobTitle || "Recruiter"} &middot; {selectedJob.organization?.name}</p>
                        <Link 
                          href={`/recruiter/${selectedJob.postedBy.id}`}
                          className="text-[9px] font-bold text-primary hover:underline block mt-1.5 leading-none"
                        >
                          View Recruiter Profile &rarr;
                        </Link>
                      </div>
                    </div>
                  </div>
                )}

                <div className="border-t border-card-border pt-6 flex items-center justify-between">
                  <div className="text-xs text-muted">
                    {user ? (
                      <span>Applying as: <strong className="text-foreground">{user.email}</strong></span>
                    ) : (
                      <span>Requires sign-in to submit application</span>
                    )}
                  </div>
                  {user ? (
                    <ApplyButton
                      opportunityId={selectedJob.id}
                      opportunityTitle={selectedJob.title}
                      opportunityType="JOB"
                      userEmail={user.email || undefined}
                      label="Apply for this Job"
                      alreadyApplied={!!alreadyApplied}
                    />
                  ) : (
                    <Link
                      href={`/auth/signin?callbackUrl=/jobs/${params.orgSlug}/${params.jobSlug}`}
                      className="px-6 py-2.5 bg-primary hover:bg-primary-hover text-white text-xs font-semibold rounded-lg flex items-center gap-1 transition-all"
                    >
                      <span>Login to Apply</span>
                      <ArrowUpRight className="w-4 h-4" />
                    </Link>
                  )}
                </div>

              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
