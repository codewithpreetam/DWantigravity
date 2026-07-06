import Link from "next/link";
import { db } from "@/lib/db";
import { Landmark, Building, IndianRupee, Calendar, ArrowUpRight, Award } from "lucide-react";
import FilterBar, { FilterConfig } from "@/components/FilterBar";
import { getGrantFilterOptions } from "@/lib/filterOptions";

export const revalidate = 0;

interface PageProps {
  searchParams: Promise<{ id?: string; q?: string; funding?: string; skill?: string; minEdu?: string }>;
}

export default async function GrantsPage(props: PageProps) {
  const searchParams = await props.searchParams;
  const q = searchParams.q || "";
  const funding = searchParams.funding || "";
  const skill = searchParams.skill || "";
  const minEdu = searchParams.minEdu || "";

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

      {filtered.length === 0 ? (
        <div className="glass-panel p-12 text-center rounded-xl flex-1 flex flex-col justify-center items-center">
          <Landmark className="w-12 h-12 text-muted mb-4" />
          <h3 className="text-lg font-bold text-foreground">No Grants Available</h3>
          <p className="text-xs text-muted max-w-xs mt-1">Try broadening your search or removing filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((item: any) => {
            const params = new URLSearchParams();
            if (q) params.set("q", q);
            if (funding) params.set("funding", funding);
            if (skill) params.set("skill", skill);
            if (minEdu) params.set("minEdu", minEdu);
            return (
              <Link key={item.id} href={`/grants/${item.id}?${params.toString()}`}
                className="block glass-panel p-5 rounded-xl border text-left transition-all hover:border-primary/40 hover:-translate-y-0.5">
                <div className="flex items-center gap-2 mb-3">
                  {item.organization?.logo ? (
                    <img src={item.organization.logo} alt={item.organization.name || ""} className="w-8 h-8 object-contain rounded border border-card-border bg-white p-0.5 shrink-0" />
                  ) : (
                    <div className="w-8 h-8 rounded border border-card-border bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0">{(item.organization?.name || "?").charAt(0)}</div>
                  )}
                  <span className="text-xs text-muted font-medium truncate">{item.organization?.name}</span>
                </div>
                <div className="flex justify-between items-start gap-2">
                  <h3 className="font-bold text-sm text-foreground line-clamp-2">{item.title}</h3>
                  <Award className="w-4 h-4 text-primary shrink-0" />
                </div>
                <div className="flex flex-wrap items-center gap-3 text-[11px] text-muted mt-3">
                  {item.amount && <span className="flex items-center gap-1"><IndianRupee className="w-3 h-3" /> Up to ₹{(item.amount / 100000).toFixed(1)}L</span>}
                  {item.deadline && <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {new Date(item.deadline).toLocaleDateString()}</span>}
                </div>
                <div className="mt-4 pt-3 border-t border-card-border flex items-center justify-end text-xs">
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
