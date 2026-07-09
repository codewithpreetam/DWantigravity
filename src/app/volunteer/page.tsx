import Link from "next/link";
import { db } from "@/lib/db";
import FilterBar, { FilterConfig } from "@/components/FilterBar";
import { getVolunteerFilterOptions } from "@/lib/filterOptions";
import { Pagination } from "@/components/Pagination";
import OpportunityCard from "@/components/OpportunityCard";
import EmptyState from "@/components/EmptyState";
import { Users } from "lucide-react";

export const revalidate = 0;

interface PageProps {
  searchParams: Promise<{ id?: string; q?: string; location?: string; skill?: string; minEdu?: string; minExp?: string; page?: string }>;
}

export default async function VolunteerPage(props: PageProps) {
  const searchParams = await props.searchParams;
  const q = searchParams.q || "";
  const location = searchParams.location || "";
  const skill = searchParams.skill || "";
  const minEdu = searchParams.minEdu || "";
  const minExp = searchParams.minExp || "";
  const page = parseInt(searchParams.page || "1", 10) || 1;

  const raw = await db.volunteer.findMany({
    include: { organization: true },
    orderBy: { createdAt: "desc" },
  });
  const filterOpts = await getVolunteerFilterOptions();

  const filtered = raw.filter((item: any) => {
    if (q) {
      const s = q.toLowerCase();
      if (
        !item.title.toLowerCase().includes(s) &&
        !item.description.toLowerCase().includes(s) &&
        !(item.organization?.name || "").toLowerCase().includes(s) &&
        !item.location.toLowerCase().includes(s)
      ) return false;
    }
    if (location && !item.location.toLowerCase().includes(location.toLowerCase())) return false;
    if (skill && !item.requiredSkills.some((sk: string) => sk.toLowerCase() === skill.toLowerCase())) return false;
    if (minEdu && (item.minEducation || "") !== minEdu) return false;
    if (minExp !== "" && (item.minExperienceYears ?? 0) < parseInt(minExp)) return false;
    return true;
  });

  const itemsPerPage = 21;
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginatedVolunteers = filtered.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  const filters: FilterConfig[] = [
    { name: "location", placeholder: "Location", options: filterOpts.locations.map(v => ({ value: v, label: v })) },
    { name: "skill", placeholder: "Skill", options: filterOpts.skills.slice(0, 40).map(v => ({ value: v, label: v })) },
    { name: "minEdu", placeholder: "Education", options: filterOpts.education.map(v => ({ value: v, label: v })) },
    {
      name: "minExp",
      placeholder: "Min Experience",
      options: filterOpts.expYears.map(y => ({ value: String(y), label: y === 0 ? "No experience needed" : `${y}+ yrs exp` })),
    },
  ].filter(f => f.options.length > 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 flex flex-col">
      <div className="mb-6">
        <div className="mb-4">
          <h1 className="text-3xl font-extrabold text-foreground tracking-tight">Volunteer Opportunities</h1>
          <p className="text-xs text-muted mt-1">{filtered.length} volunteer opportunit{filtered.length !== 1 ? "ies" : "y"} — make a difference with your skills and time.</p>
        </div>
        <FilterBar filters={filters} searchPlaceholder="Search volunteer roles, skills, orgs..." q={q} />
      </div>

      {/* Results */}
      <div className="flex-1 space-y-6">
        <div className="flex items-center justify-between bg-white dark:bg-zinc-950 p-4 rounded-xl border border-card-border shadow-sm">
          <p className="text-sm text-muted font-medium">
            Showing <strong className="text-foreground">{paginatedVolunteers.length}</strong> of <strong className="text-foreground">{filtered.length}</strong> volunteer roles
          </p>
        </div>

        {paginatedVolunteers.length === 0 ? (
          <EmptyState 
            title="No Volunteer Opportunities Found"
            description="Try broadening your search or removing some filters to see more results."
            icon={<Users className="w-12 h-12 text-muted mx-auto" />}
            clearFiltersHref="/volunteer"
          />
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {paginatedVolunteers.map((item: any) => {
                const params = new URLSearchParams();
                if (q) params.set("q", q);
                if (location) params.set("location", location);
                if (skill) params.set("skill", skill);
                if (minEdu) params.set("minEdu", minEdu);
                if (minExp) params.set("minExp", minExp);
                
                const href = `/volunteer/${item.slug}?${params.toString()}`;
                
                return (
                  <OpportunityCard key={item.id} item={item} type="VOLUNTEER" href={href} />
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
