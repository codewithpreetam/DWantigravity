import Link from "next/link";
import { db } from "@/lib/db";
import { 
  GraduationCap, MapPin, Building, ShieldCheck,
  IndianRupee, Calendar, ArrowUpRight
} from "lucide-react";
import FilterBar, { FilterConfig } from "@/components/FilterBar";
import { getFellowshipFilterOptions } from "@/lib/filterOptions";
import { Pagination } from "@/components/Pagination";

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

export default async function FellowshipsPage(props: PageProps) {
  const searchParams = await props.searchParams;
  const q = searchParams.q || "";
  const page = parseInt(searchParams.page || "1", 10) || 1;
  const location = searchParams.location || "";
  const duration = searchParams.duration || "";
  const skill = searchParams.skill || "";
  const minEdu = searchParams.minEdu || "";
  const stipend = searchParams.stipend || "";

  const raw = await db.fellowship.findMany({
    where: { isActive: true },
    include: { organization: true },
    orderBy: { createdAt: "desc" },
  });

  const filterOpts = await getFellowshipFilterOptions();

  const filteredFellowships = raw.filter((item: any) => {
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
  const totalPages = Math.ceil(filteredFellowships.length / itemsPerPage);
  const paginatedFellowships = filteredFellowships.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  const filters: FilterConfig[] = [
    { name: "location", placeholder: "Location", options: filterOpts.locations.map(v => ({ value: v, label: v })) },
    { name: "duration", placeholder: "Duration", options: filterOpts.durations.map(d => ({ value: String(d), label: `${d} Month${d !== 1 ? "s" : ""}` })) },
    { name: "skill", placeholder: "Skill", options: filterOpts.skills.slice(0, 40).map(v => ({ value: v, label: v })) },
    { name: "minEdu", placeholder: "Education", options: filterOpts.education.map(v => ({ value: v, label: v })) },
    { name: "stipend", placeholder: "Stipend Range", options: filterOpts.stipendBrackets },
  ].filter(f => f.options.length > 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 flex flex-col">
      <div className="mb-6">
        <div className="mb-4">
          <h1 className="text-3xl font-extrabold text-foreground tracking-tight">Social Impact Fellowships</h1>
          <p className="text-xs text-muted mt-1">
            {filteredFellowships.length} fellowship{filteredFellowships.length !== 1 ? "s" : ""} — immersive leadership journeys across India.
          </p>
        </div>
        <FilterBar filters={filters} searchPlaceholder="Search fellowships, skills, organisations..." q={q} />
      </div>

      <div className="flex-1 space-y-6">
        {filteredFellowships.length === 0 ? (
          <div className="glass-panel p-12 text-center rounded-xl flex-1 flex flex-col justify-center items-center">
            <GraduationCap className="w-12 h-12 text-muted mb-4" />
            <h3 className="text-lg font-bold text-foreground">No Fellowships Found</h3>
            <p className="text-xs text-muted max-w-xs mt-1">Try broadening your search or removing some filters.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {paginatedFellowships.map((item: any) => {
                const params = new URLSearchParams();
                if (q) params.set("q", q);
                if (location) params.set("location", location);
                if (duration) params.set("duration", duration);
                if (skill) params.set("skill", skill);
                if (minEdu) params.set("minEdu", minEdu);
                if (stipend) params.set("stipend", stipend);
                return (
                  <Link
                    key={item.id}
                    href={`/fellowships/${item.id}?${params.toString()}`}
                    className="block glass-panel p-5 rounded-xl border text-left transition-all hover:border-primary/40 hover:-translate-y-0.5"
                  >
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
                      {item.stipend && <span className="flex items-center gap-1"><IndianRupee className="w-3 h-3" /> ₹{item.stipend.toLocaleString("en-IN")}/mo</span>}
                      {item.durationMonths && <span>{item.durationMonths} Months</span>}
                    </div>
                    <div className="mt-4 pt-3 border-t border-card-border flex items-center justify-between text-xs text-muted">
                      <span className="inline-flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {new Date(item.createdAt).toLocaleDateString()}</span>
                      <span className="inline-flex items-center gap-1 text-primary font-semibold">View Details <ArrowUpRight className="w-3.5 h-3.5" /></span>
                    </div>
                  </Link>
                );
              })}
            </div>
            <Pagination currentPage={page} totalPages={totalPages} />
          </>
        )}
      </div>
    </div>
  );
}
