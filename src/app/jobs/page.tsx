import Link from "next/link";
import { db } from "@/lib/db";
import { 
  Briefcase, MapPin, Building, ShieldCheck,
  IndianRupee, Calendar, ArrowUpRight
} from "lucide-react";
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
    salaryMin?: string;
    salaryMax?: string;
    sort?: string;
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
  const salaryMinParam = searchParams.salaryMin || "";
  const salaryMaxParam = searchParams.salaryMax || "";
  const sort = searchParams.sort || "newest";

  // Fetch all active jobs with org relations
  const rawJobs = await db.job.findMany({
    where: { isActive: true },
    include: { organization: true },
    orderBy: { createdAt: "desc" },
  });

  // --- Dynamic filter options from real data ---
  const filterOpts = await getJobFilterOptions();

  const salaryValues = rawJobs
    .flatMap((j: any) => [j.salaryMin, j.salaryMax])
    .filter((v: number | null | undefined): v is number => typeof v === "number" && v > 0);
  const salaryBoundMin = salaryValues.length ? Math.min(...salaryValues) : 0;
  const salaryBoundMax = salaryValues.length ? Math.max(...salaryValues) : 2000000;

  let salaryMin = salaryBoundMin;
  let salaryMax = salaryBoundMax;
  if (salaryMinParam && salaryMaxParam) {
    salaryMin = Number(salaryMinParam) || salaryBoundMin;
    salaryMax = Number(salaryMaxParam) || salaryBoundMax;
  } else if (salary) {
    const [lo, hi] = salary.split("-").map(Number);
    if (Number.isFinite(lo) && Number.isFinite(hi)) {
      salaryMin = lo;
      salaryMax = hi;
    }
  }

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
    if (salaryMinParam || salaryMaxParam || salary) {
      const jobMin = job.salaryMin ?? job.salaryMax;
      const jobMax = job.salaryMax ?? job.salaryMin;
      if (jobMin == null || jobMax == null) return false;
      if (jobMax < salaryMin || jobMin > salaryMax) return false;
    }
    return true;
  });

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
        <FilterBar
          filters={filters}
          searchPlaceholder="Search title, organization, description..."
          q={q}
          locationValue={location}
          locationSuggestions={filterOpts.locations}
          quickFilterNames={["workMode", "employmentType"]}
          sortValue={sort}
          sortOptions={[
            { label: "Relevance", value: "relevance" },
            { label: "Newest", value: "newest" },
            { label: "Oldest", value: "oldest" },
            { label: "Salary High to Low", value: "salary_high" },
            { label: "Salary Low to High", value: "salary_low" },
          ]}
          salaryRange={{
            min: salaryBoundMin,
            max: salaryBoundMax,
            step: 50000,
            valueMin: salaryMin,
            valueMax: salaryMax,
            label: "Custom Salary Range",
          }}
        />
      </div>

      {filteredJobs.length === 0 ? (
        <div className="glass-panel p-12 text-center rounded-xl flex-1 flex flex-col justify-center items-center">
          <Briefcase className="w-12 h-12 text-muted mb-4" />
          <h3 className="text-lg font-bold text-foreground">No Jobs Found</h3>
          <p className="text-xs text-muted max-w-xs mt-1">Try broadening your search or removing some filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredJobs.map((job: any) => {
            const orgSlug = slugify(job.organization?.name || "ngo");
            const jobSlug = slugify(`${job.title}-${job.workMode === "REMOTE" ? "remote" : job.location}`);
            const params = new URLSearchParams();
            if (q) params.set("q", q);
            if (workMode) params.set("workMode", workMode);
            if (employmentType) params.set("employmentType", employmentType);
            if (location) params.set("location", location);
            if (skill) params.set("skill", skill);
            if (minExp) params.set("minExp", minExp);
            if (minEdu) params.set("minEdu", minEdu);
            if (salaryMin > salaryBoundMin) params.set("salaryMin", String(salaryMin));
            if (salaryMax < salaryBoundMax) params.set("salaryMax", String(salaryMax));
            if (sort) params.set("sort", sort);
            return (
              <Link
                key={job.id}
                href={`/jobs/${orgSlug}/${jobSlug}?${params.toString()}`}
                className="block glass-panel p-5 rounded-xl border text-left transition-all hover:border-primary/40 hover:-translate-y-0.5"
              >
                  <div className="flex items-center gap-2 mb-3">
                    {job.organization?.logo ? (
                      <img src={job.organization.logo} alt={job.organization.name || ""} className="w-8 h-8 object-contain rounded border border-card-border bg-white p-0.5 shrink-0" />
                    ) : (
                      <div className="w-8 h-8 rounded border border-card-border bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0">{(job.organization?.name || "?").charAt(0)}</div>
                    )}
                    <span className="text-xs text-muted font-medium truncate">{job.organization?.name}</span>
                  </div>
                  <div className="flex justify-between items-start gap-2">
                    <h3 className="font-bold text-sm text-foreground line-clamp-2">{job.title}</h3>
                    <ShieldCheck className="w-4 h-4 text-primary shrink-0" />
                  </div>
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
                <div className="mt-4 pt-3 border-t border-card-border flex items-center justify-between text-xs text-muted">
                  <span className="inline-flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {new Date(job.createdAt).toLocaleDateString()}</span>
                  <span className="inline-flex items-center gap-1 text-primary font-semibold">View Details <ArrowUpRight className="w-3.5 h-3.5" /></span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
