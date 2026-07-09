import Link from "next/link";
import { db } from "@/lib/db";
import FilterBar, { FilterConfig } from "@/components/FilterBar";
import { getInternshipFilterOptions } from "@/lib/filterOptions";
import { Pagination } from "@/components/Pagination";
import OpportunityCard from "@/components/OpportunityCard";
import EmptyState from "@/components/EmptyState";
import { GraduationCap } from "lucide-react";

export const revalidate = 0;

interface PageProps {
  searchParams: Promise<{
    id?: string;
    q?: string;
    location?: string;
    duration?: string;
    skill?: string;
    minEdu?: string;
    stipend?: string;
    page?: string;
  }>;
}

export default async function InternshipsPage(props: PageProps) {
  const searchParams = await props.searchParams;
  const q = searchParams.q || "";
  const location = searchParams.location || "";
  const duration = searchParams.duration || "";
  const skill = searchParams.skill || "";
  const minEdu = searchParams.minEdu || "";
  const stipend = searchParams.stipend || "";
  const page = parseInt(searchParams.page || "1", 10) || 1;

  const raw = await db.internship.findMany({
    where: { isActive: true },
    include: { organization: true },
    orderBy: { createdAt: "desc" },
  });

  const filterOpts = await getInternshipFilterOptions();

  const filteredInternships = raw.filter((item: any) => {
    if (q) {
      const s = q.toLowerCase();
      const match =
        item.title.toLowerCase().includes(s) ||
        item.description.toLowerCase().includes(s) ||
        (item.organization?.name || "").toLowerCase().includes(s) ||
        item.location.toLowerCase().includes(s);
      if (!match) return false;
    }
    if (location && !item.location.toLowerCase().includes(location.toLowerCase())) return false;
    if (duration && item.durationMonths !== parseInt(duration)) return false;
    if (skill && !item.requiredSkills.some((sk: string) => sk.toLowerCase() === skill.toLowerCase())) return false;
    if (minEdu && (item.minEducation || "") !== minEdu) return false;
    if (stipend) {
      const [lo, hi] = stipend.split("-").map(Number);
      const val = item.stipend ?? 0;
      if (val < lo || val > hi) return false;
    }
    return true;
  });

  const itemsPerPage = 21;
  const totalPages = Math.ceil(filteredInternships.length / itemsPerPage);
  const paginatedInternships = filteredInternships.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  const filters: FilterConfig[] = [
    {
      name: "location",
      placeholder: "Location",
      options: filterOpts.locations.map(v => ({ value: v, label: v })),
    },
    {
      name: "duration",
      placeholder: "Duration",
      options: filterOpts.durations.map(d => ({ value: String(d), label: `${d} Month${d !== 1 ? "s" : ""}` })),
    },
    {
      name: "skill",
      placeholder: "Skill",
      options: filterOpts.skills.slice(0, 40).map(v => ({ value: v, label: v })),
    },
    {
      name: "minEdu",
      placeholder: "Education",
      options: filterOpts.education.map(v => ({ value: v, label: v })),
    },
    {
      name: "stipend",
      placeholder: "Stipend Range",
      options: filterOpts.stipendBrackets,
    },
  ].filter(f => f.options.length > 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 flex flex-col">
      <div className="mb-6">
        <div className="mb-4">
          <h1 className="text-3xl font-extrabold text-foreground tracking-tight">NGO Internships</h1>
          <p className="text-xs text-muted mt-1">
            {filteredInternships.length} internship{filteredInternships.length !== 1 ? "s" : ""} — kickstart your career in social work.
          </p>
        </div>
        <FilterBar filters={filters} searchPlaceholder="Search internships, skills, orgs..." q={q} />
      </div>

      <div className="flex-1 space-y-6">
        {filteredInternships.length === 0 ? (
          <EmptyState 
            title="No Internships Found"
            description="Try broadening your search or removing some filters to see more results."
            icon={<GraduationCap className="w-12 h-12 text-muted mx-auto" />}
            clearFiltersHref="/internships"
          />
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {paginatedInternships.map((item: any) => {
                const params = new URLSearchParams();
                if (q) params.set("q", q);
                if (location) params.set("location", location);
                if (duration) params.set("duration", duration);
                if (skill) params.set("skill", skill);
                if (minEdu) params.set("minEdu", minEdu);
                if (stipend) params.set("stipend", stipend);
                
                const href = `/internships/${item.slug}?${params.toString()}`;
                
                return (
                  <OpportunityCard key={item.id} item={item} type="INTERNSHIP" href={href} />
                );
              })}
            </div>
            {totalPages > 1 && <Pagination currentPage={page} totalPages={totalPages} />}
          </>
        )}
      </div>
    </div>
  );
}
