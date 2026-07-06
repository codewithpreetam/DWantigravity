import Link from "next/link";
import { db } from "@/lib/db";
import { Briefcase, MapPin, Building, ShieldCheck, IndianRupee, Calendar, ArrowUpRight } from "lucide-react";
import FilterBar, { FilterConfig } from "@/components/FilterBar";
import { getConsultancyFilterOptions } from "@/lib/filterOptions";

export const revalidate = 0;

interface PageProps {
  searchParams: Promise<{ id?: string; q?: string; location?: string; budget?: string; skill?: string; minEdu?: string }>;
}

export default async function ConsultanciesPage(props: PageProps) {
  const searchParams = await props.searchParams;
  const q = searchParams.q || "";
  const location = searchParams.location || "";
  const budget = searchParams.budget || "";
  const skill = searchParams.skill || "";
  const minEdu = searchParams.minEdu || "";

  const raw = await db.consultancy.findMany({
    include: { organization: true },
    orderBy: { createdAt: "desc" },
  });
  const filterOpts = await getConsultancyFilterOptions();

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
    if (budget) {
      const [lo, hi] = budget.split("-").map(Number);
      const val = item.budget ?? 0;
      if (val < lo || val > hi) return false;
    }
    return true;
  });

  const filters: FilterConfig[] = [
    { name: "location", placeholder: "Location", options: filterOpts.locations.map(v => ({ value: v, label: v })) },
    { name: "skill", placeholder: "Skill", options: filterOpts.skills.slice(0, 40).map(v => ({ value: v, label: v })) },
    { name: "minEdu", placeholder: "Education", options: filterOpts.education.map(v => ({ value: v, label: v })) },
    { name: "budget", placeholder: "Budget Range", options: filterOpts.budgetBrackets },
  ].filter(f => f.options.length > 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 flex flex-col">
      <div className="mb-6">
        <div className="mb-4">
          <h1 className="text-3xl font-extrabold text-foreground tracking-tight">Social Impact Consultancies</h1>
          <p className="text-xs text-muted mt-1">{filtered.length} consultanc{filtered.length !== 1 ? "ies" : "y"} — short-term advisory assignments for independent consultants.</p>
        </div>
        <FilterBar filters={filters} searchPlaceholder="Search consultancies, skills, organisations..." q={q} />
      </div>

      {filtered.length === 0 ? (
        <div className="glass-panel p-12 text-center rounded-xl flex-1 flex flex-col justify-center items-center">
          <Briefcase className="w-12 h-12 text-muted mb-4" />
          <h3 className="text-lg font-bold text-foreground">No Consultancies Found</h3>
          <p className="text-xs text-muted max-w-xs mt-1">Try broadening your search or removing filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((item: any) => {
            const params = new URLSearchParams();
            if (q) params.set("q", q);
            if (location) params.set("location", location);
            if (budget) params.set("budget", budget);
            if (skill) params.set("skill", skill);
            if (minEdu) params.set("minEdu", minEdu);
            return (
              <Link key={item.id} href={`/consultancies/${item.id}?${params.toString()}`}
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
                  <ShieldCheck className="w-4 h-4 text-primary shrink-0" />
                </div>
                <div className="flex flex-wrap items-center gap-3 text-[11px] text-muted mt-3">
                  <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {item.location}</span>
                  {item.budget && <span className="flex items-center gap-1"><IndianRupee className="w-3 h-3" /> Budget ₹{(item.budget / 100000).toFixed(1)}L</span>}
                </div>
                <div className="mt-4 pt-3 border-t border-card-border flex items-center justify-between text-xs text-muted">
                  <span className="inline-flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {new Date(item.createdAt).toLocaleDateString()}</span>
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
