import Link from "next/link";
import { db } from "@/lib/db";
import FilterBar, { FilterConfig } from "@/components/FilterBar";
import { getScholarshipFilterOptions } from "@/lib/filterOptions";
import { Pagination } from "@/components/Pagination";
import OpportunityCard from "@/components/OpportunityCard";
import EmptyState from "@/components/EmptyState";
import { GraduationCap } from "lucide-react";

export const revalidate = 0;

interface PageProps {
  searchParams: Promise<{ id?: string; q?: string; amount?: string; skill?: string; minEdu?: string; page?: string }>;
}

export default async function ScholarshipsPage(props: PageProps) {
  const searchParams = await props.searchParams;
  const q = searchParams.q || "";
  const page = parseInt(searchParams.page || "1", 10);
  const amount = searchParams.amount || "";
  const skill = searchParams.skill || "";
  const minEdu = searchParams.minEdu || "";

  const raw = await db.scholarship.findMany({
    include: { organization: true },
    orderBy: { createdAt: "desc" },
  });
  const filterOpts = await getScholarshipFilterOptions();

  const filtered = raw.filter((item: any) => {
    if (q) {
      const s = q.toLowerCase();
      if (
        !item.title.toLowerCase().includes(s) &&
        !item.description.toLowerCase().includes(s) &&
        !(item.organization?.name || "").toLowerCase().includes(s)
      ) return false;
    }
    if (skill && !item.requiredSkills.some((sk: string) => sk.toLowerCase() === skill.toLowerCase())) return false;
    if (minEdu && (item.minEducation || "") !== minEdu) return false;
    if (amount) {
      const [lo, hi] = amount.split("-").map(Number);
      const val = item.amount ?? 0;
      if (val < lo || val > hi) return false;
    }
    return true;
  });

  const itemsPerPage = 21;
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginatedScholarships = filtered.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  const filters: FilterConfig[] = [
    { name: "skill", placeholder: "Skill", options: filterOpts.skills.slice(0, 40).map(v => ({ value: v, label: v })) },
    { name: "minEdu", placeholder: "Education", options: filterOpts.education.map(v => ({ value: v, label: v })) },
    { name: "amount", placeholder: "Award Amount", options: filterOpts.amountBrackets },
  ].filter(f => f.options.length > 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 flex flex-col">
      <div className="mb-6">
        <div className="mb-4">
          <h1 className="text-3xl font-extrabold text-foreground tracking-tight">Social Development Scholarships</h1>
          <p className="text-xs text-muted mt-1">{filtered.length} scholarship{filtered.length !== 1 ? "s" : ""} for students and field researchers.</p>
        </div>
        <FilterBar filters={filters} searchPlaceholder="Search scholarships, organisations..." q={q} />
      </div>

      <div className="flex-1 space-y-6">
        {filtered.length === 0 ? (
          <EmptyState 
            title="No Scholarships Found"
            description="Try broadening your search or removing filters to see more results."
            icon={<GraduationCap className="w-12 h-12 text-muted mx-auto" />}
            clearFiltersHref="/scholarships"
          />
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {paginatedScholarships.map((item: any) => {
                const params = new URLSearchParams();
                if (q) params.set("q", q);
                if (amount) params.set("amount", amount);
                if (skill) params.set("skill", skill);
                if (minEdu) params.set("minEdu", minEdu);
                
                const href = `/scholarships/${item.slug}?${params.toString()}`;
                
                return (
                  <OpportunityCard key={item.id} item={item} type="SCHOLARSHIP" href={href} />
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
