import Link from "next/link";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { 
  Briefcase, MapPin, Building, ShieldCheck, 
  IndianRupee, Calendar, ArrowUpRight
} from "lucide-react";
import { auth } from "@/auth";
import ApplyButton from "@/components/ApplyButton";
import FilterBar, { FilterConfig } from "@/components/FilterBar";
import { getJobFilterOptions } from "@/lib/filterOptions";

export const revalidate = 0;

function slugify(str: string) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function prettifyMode(v: string | null | undefined) {
  if (!v) return "";
  return { ON_SITE: "On-site", REMOTE: "Remote", HYBRID: "Hybrid" }[v] ?? v;
}
function prettifyType(v: string | null | undefined) {
  if (!v) return "";
  return {
    FULL_TIME: "Full Time",
    PART_TIME: "Part Time",
    CONTRACTOR: "Contract",
    INTERN: "Intern",
    VOLUNTEER: "Volunteer",
  }[v] ?? v;
}

interface PageProps {
  searchParams: Promise<{
    id?: string;
    q?: string;
    workMode?: string;
    employmentType?: string;
    location?: string;
    skill?: string;
    minExp?: string;
    minEdu?: string;
    salary?: string;
  }>;
}

export default async function JobsPage(props: PageProps) {
  const searchParams = await props.searchParams;
  const q = searchParams.q || "";
  const workMode = searchParams.workMode || "";
  const employmentType = searchParams.employmentType || "";
  const location = searchParams.location || "";
  const skill = searchParams.skill || "";
  const minExp = searchParams.minExp || "";
  const minEdu = searchParams.minEdu || "";
  const salary = searchParams.salary || "";
  const selectedId = searchParams.id;
  const session = await auth();
  const user = session?.user;

  // Fetch all active jobs with org relations
  const rawJobs = await db.job.findMany({
    where: { isActive: true },
    include: { organization: true },
    orderBy: { createdAt: "desc" },
  });

  // --- Dynamic filter options from real data ---
  const filterOpts = await getJobFilterOptions();

  // --- Server-side filtering ---
  const filteredJobs = rawJobs.filter((job: any) => {
    if (q) {
      const s = q.toLowerCase();
      const match =
        job.title.toLowerCase().includes(s) ||
        job.description.toLowerCase().includes(s) ||
        (job.organization?.name || "").toLowerCase().includes(s) ||
        job.location.toLowerCase().includes(s) ||
        job.requiredSkills.some((sk: string) => sk.toLowerCase().includes(s));
      if (!match) return false;
    }
    if (workMode && job.workMode !== workMode) return false;
    if (employmentType && job.employmentType !== employmentType) return false;
    if (location && !job.location.toLowerCase().includes(location.toLowerCase())) return false;
    if (skill && !job.requiredSkills.some((sk: string) => sk.toLowerCase() === skill.toLowerCase())) return false;
    if (minExp !== "" && (job.minExperienceYears ?? 0) < parseInt(minExp)) return false;
    if (minEdu && (job.minEducation || "") !== minEdu) return false;
    if (salary) {
      const [lo, hi] = salary.split("-").map(Number);
      const mid = ((job.salaryMin ?? 0) + (job.salaryMax ?? 0)) / 2;
      if (mid < lo || mid > hi) return false;
    }
    return true;
  });

  // Redirect to first job slug URL (this page is a listing/redirect helper)
  if (filteredJobs.length > 0 && !selectedId) {
    const first = filteredJobs[0];
    const orgSlug = slugify(first.organization?.name || "ngo");
    const jobSlug = slugify(`${first.title}-${first.workMode === "REMOTE" ? "remote" : first.location}`);
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (workMode) params.set("workMode", workMode);
    if (employmentType) params.set("employmentType", employmentType);
    if (location) params.set("location", location);
    if (skill) params.set("skill", skill);
    if (minExp) params.set("minExp", minExp);
    if (minEdu) params.set("minEdu", minEdu);
    if (salary) params.set("salary", salary);
    redirect(`/jobs/${orgSlug}/${jobSlug}?${params.toString()}`);
  }

  const selectedJob = selectedId
    ? filteredJobs.find((j: any) => j.id === selectedId) || filteredJobs[0]
    : filteredJobs[0];

  // Build filter configs
  const filters: FilterConfig[] = [
    {
      name: "workMode",
      placeholder: "Work Mode",
      options: filterOpts.workModes.map(v => ({
        value: v,
        label: prettifyMode(v),
      })),
    },
    {
      name: "employmentType",
      placeholder: "Job Type",
      options: filterOpts.employmentTypes.map(v => ({
        value: v,
        label: prettifyType(v),
      })),
    },
    {
      name: "location",
      placeholder: "Location",
      options: filterOpts.locations.map(v => ({ value: v, label: v })),
    },
    {
      name: "skill",
      placeholder: "Skill",
      options: filterOpts.skills.slice(0, 40).map(v => ({ value: v, label: v })),
    },
    {
      name: "minExp",
      placeholder: "Min Experience",
      options: filterOpts.expYears.map(y => ({
        value: String(y),
        label: y === 0 ? "Fresher (0 yrs)" : `${y}+ yrs exp`,
      })),
    },
    {
      name: "minEdu",
      placeholder: "Education",
      options: filterOpts.education.map(v => ({ value: v, label: v })),
    },
    {
      name: "salary",
      placeholder: "Salary Range",
      options: filterOpts.salaryBrackets,
    },
  ].filter(f => f.options.length > 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 flex flex-col">
      {/* Title & Filter Bar */}
      <div className="mb-6">
        <div className="mb-4">
          <h1 className="text-3xl font-extrabold text-foreground tracking-tight">Social Impact Jobs</h1>
          <p className="text-xs text-muted mt-1">
            {filteredJobs.length} verified career{filteredJobs.length !== 1 ? "s" : ""} in India's development sector.
          </p>
        </div>
        <FilterBar filters={filters} searchPlaceholder="Search jobs, skills, organisations..." q={q} />
      </div>

      {filteredJobs.length === 0 ? (
        <div className="glass-panel p-12 text-center rounded-xl flex-1 flex flex-col justify-center items-center">
          <Briefcase className="w-12 h-12 text-muted mb-4" />
          <h3 className="text-lg font-bold text-foreground">No Jobs Found</h3>
          <p className="text-xs text-muted max-w-xs mt-1">Try broadening your search or removing some filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 flex-1 items-start">
          {/* Left Column: Job List */}
          <div className="lg:col-span-5 space-y-4 max-h-[70vh] overflow-y-auto pr-2">
            {filteredJobs.map((job: any) => {
              const isSelected = selectedJob?.id === job.id;
              const orgSlug = slugify(job.organization?.name || "ngo");
              const jobSlug = slugify(`${job.title}-${job.workMode === "REMOTE" ? "remote" : job.location}`);
              const params = new URLSearchParams();
              if (q) params.set("q", q);
              if (workMode) params.set("workMode", workMode);
              if (employmentType) params.set("employmentType", employmentType);
              if (location) params.set("location", location);
              if (skill) params.set("skill", skill);
              return (
                <Link
                  key={job.id}
                  href={`/jobs/${orgSlug}/${jobSlug}?${params.toString()}`}
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
                    {(job.salaryMin || job.salaryMax) && (
                      <span className="flex items-center gap-1">
                        <IndianRupee className="w-3 h-3" />
                        ₹{((job.salaryMin || 0) / 100000).toFixed(1)}L–{((job.salaryMax || 0) / 100000).toFixed(1)}L
                      </span>
                    )}
                    {job.workMode && (
                      <span className="px-1.5 py-0.5 rounded bg-primary/10 text-primary text-[10px] font-bold">
                        {prettifyMode(job.workMode)}
                      </span>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Right Column: Detail */}
          <div className="lg:col-span-7 glass-panel p-6 rounded-xl border border-card-border sticky top-24">
            {selectedJob ? (
              <div className="space-y-6">
                <script
                  type="application/ld+json"
                  dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                      "@context": "https://schema.org",
                      "@type": "JobPosting",
                      title: selectedJob.title,
                      description: selectedJob.description,
                      datePosted: selectedJob.createdAt,
                      employmentType: selectedJob.employmentType || "FULL_TIME",
                      directApply: true,
                      hiringOrganization: {
                        "@type": "Organization",
                        name: selectedJob.organization?.name,
                        logo: selectedJob.organization?.logo || "https://developmentwala.org/logo.png",
                        sameAs: selectedJob.organization?.website || "https://developmentwala.org",
                      },
                      jobLocation: {
                        "@type": "Place",
                        address: {
                          "@type": "PostalAddress",
                          addressLocality: selectedJob.isRemote ? "Remote / India" : selectedJob.location,
                          addressRegion: "India",
                          addressCountry: "IN",
                        },
                      },
                    }),
                  }}
                />
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-full">
                      {prettifyType(selectedJob.employmentType)} · {prettifyMode(selectedJob.workMode)}
                    </span>
                    <span className="text-xs text-muted flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" /> Posted {new Date(selectedJob.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <h2 className="text-2xl font-extrabold text-foreground">{selectedJob.title}</h2>
                  <div className="flex flex-wrap items-center gap-4 text-xs text-muted mt-2">
                    <span className="flex items-center gap-1"><Building className="w-4 h-4 text-primary" /> {selectedJob.organization?.name}</span>
                    <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {selectedJob.location}</span>
                    {(selectedJob.salaryMin || selectedJob.salaryMax) && (
                      <span className="flex items-center gap-1">
                        <IndianRupee className="w-4 h-4" />
                        ₹{selectedJob.salaryMin?.toLocaleString("en-IN")}–{selectedJob.salaryMax?.toLocaleString("en-IN")} / yr
                      </span>
                    )}
                  </div>
                </div>

                {selectedJob.requiredSkills?.length > 0 && (
                  <div className="border-t border-card-border pt-4">
                    <h4 className="text-xs font-bold text-foreground mb-2">Required Skills</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedJob.requiredSkills.map((s: string) => (
                        <span key={s} className="px-2 py-0.5 bg-primary/10 text-primary text-[10px] font-semibold rounded-full">{s}</span>
                      ))}
                    </div>
                  </div>
                )}

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

                <div className="flex justify-end border-t border-card-border pt-4">
                  <Link
                    href={`/jobs/${slugify(selectedJob.organization?.name || "ngo")}/${slugify(`${selectedJob.title}-${selectedJob.workMode === "REMOTE" ? "remote" : selectedJob.location}`)}`}
                    className="text-xs text-primary hover:underline font-semibold flex items-center gap-0.5"
                  >
                    <span>View Dedicated Page</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                <div className="border-t border-card-border pt-6 flex items-center justify-between">
                  <div className="text-xs text-muted">
                    {user ? (
                      <span>Applying as: <strong className="text-foreground">{user.email}</strong></span>
                    ) : (
                      <span>Requires sign-in to apply</span>
                    )}
                  </div>
                  {user ? (
                    <ApplyButton
                      opportunityId={selectedJob.id}
                      opportunityTitle={selectedJob.title}
                      opportunityType="JOB"
                      userEmail={user.email || undefined}
                      label="Apply for this Job"
                    />
                  ) : (
                    <Link
                      href="/auth/signin?callbackUrl=/jobs"
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
