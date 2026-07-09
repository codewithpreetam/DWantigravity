import Link from "next/link";
import { db } from "@/lib/db";
import FilterBar, { FilterConfig } from "@/components/FilterBar";
import { getJobFilterOptions } from "@/lib/filterOptions";
import { Pagination } from "@/components/Pagination";
import OpportunityCard from "@/components/OpportunityCard";
import EmptyState from "@/components/EmptyState";
import { Briefcase } from "lucide-react";

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
    page?: string;
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
  const pageParam = searchParams.page || "1";
  const page = parseInt(pageParam, 10) || 1;

  // Fetch all active jobs with org relations
  const rawJobs = await db.job.findMany({
    where: { isActive: true },
    include: { organization: true },
    orderBy: { createdAt: "desc" }
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

  const itemsPerPage = 21;
  const totalPages = Math.ceil(filteredJobs.length / itemsPerPage);
  const paginatedJobs = filteredJobs.slice((page - 1) * itemsPerPage, page * itemsPerPage);

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

      <div className="flex-1 space-y-6">
        <div className="flex items-center justify-between bg-white dark:bg-zinc-950 p-4 rounded-xl border border-card-border shadow-sm">
          <p className="text-sm text-muted font-medium">
            Showing <strong className="text-foreground">{paginatedJobs.length}</strong> of <strong className="text-foreground">{filteredJobs.length}</strong> jobs
          </p>
        </div>

        {paginatedJobs.length === 0 ? (
          <EmptyState 
            title="No Jobs Found"
            description="Try broadening your search or removing some filters to see more results."
            icon={<Briefcase className="w-12 h-12 text-muted mx-auto" />}
            clearFiltersHref="/jobs"
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
            {paginatedJobs.map((job: any) => {
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
              
              const href = `/jobs/${job.slug}?${params.toString()}`;
              
              return (
                <OpportunityCard key={job.id} item={job} type="JOB" href={href} />
              );
            })}
          </div>
        )}
        
        <Pagination currentPage={page} totalPages={totalPages} />
      </div>
    </div>
  );
}
