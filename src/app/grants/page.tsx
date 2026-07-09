import Link from "next/link";
import { db } from "@/lib/db";
import FilterBar, { FilterConfig } from "@/components/FilterBar";
import { getGrantFilterOptions } from "@/lib/filterOptions";
import { Pagination } from "@/components/Pagination";
import OpportunityCard from "@/components/OpportunityCard";
import EmptyState from "@/components/EmptyState";
import { Landmark } from "lucide-react";

export const revalidate = 0;

interface PageProps {
  searchParams: Promise<{ id?: string; q?: string; funding?: string; skill?: string; minEdu?: string; page?: string }>;
}

export default async function GrantsPage(props: PageProps) {
  const searchParams = await props.searchParams;
  const q = searchParams.q || "";
  const funding = searchParams.funding || "";
  const skill = searchParams.skill || "";
  const minEdu = searchParams.minEdu || "";
  const page = parseInt(searchParams.page || "1", 10) || 1;

  const raw = await db.grant.findMany({
    where: { isActive: true },
    include: { organization: true },
    orderBy: { createdAt: "desc" },
  });
  const filterOpts = await getGrantFilterOptions();

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
    if (funding) {
      const [lo, hi] = funding.split("-").map(Number);
      const val = item.amount ?? 0;
      if (val < lo || val > hi) return false;
    }
    return true;
  });

  const itemsPerPage = 21;
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginatedGrants = filtered.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  const filters: FilterConfig[] = [
    { name: "skill", placeholder: "Skill/Focus Area", options: filterOpts.skills.slice(0, 40).map(v => ({ value: v, label: v })) },
    { name: "minEdu", placeholder: "Education", options: filterOpts.education.map(v => ({ value: v, label: v })) },
    { name: "funding", placeholder: "Funding Amount", options: filterOpts.fundingBrackets },
  ].filter(f => f.options.length > 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 flex flex-col">
      <div className="mb-6">
        <div className="mb-4">
          <h1 className="text-3xl font-extrabold text-foreground tracking-tight">NGO Grants & Funding Calls</h1>
          <p className="text-xs text-muted mt-1">{filtered.length} grant{filtered.length !== 1 ? "s" : ""} — submit proposals for institutional and CSR project funding.</p>
        </div>
        <FilterBar filters={filters} searchPlaceholder="Search grants, themes, organisations..." q={q} />
      </div>

      {/* Results */}
      <div className="flex-1 space-y-6">
        <div className="flex items-center justify-between bg-white dark:bg-zinc-950 p-4 rounded-xl border border-card-border shadow-sm">
          <p className="text-sm text-muted font-medium">
            Showing <strong className="text-foreground">{paginatedGrants.length}</strong> of <strong className="text-foreground">{filtered.length}</strong> grants
          </p>
        </div>

        {paginatedGrants.length === 0 ? (
          <EmptyState 
            title="No Grants Available"
            description="Try broadening your search or removing some filters to see more results."
            icon={<Landmark className="w-12 h-12 text-muted mx-auto" />}
            clearFiltersHref="/grants"
          />
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {paginatedGrants.map((item: any) => {
                const params = new URLSearchParams();
                if (q) params.set("q", q);
                if (funding) params.set("funding", funding);
                if (skill) params.set("skill", skill);
                if (minEdu) params.set("minEdu", minEdu);
                
                const href = `/grants/${item.slug}?${params.toString()}`;
                
                return (
                  <OpportunityCard key={item.id} item={item} type="GRANT" href={href} />
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
