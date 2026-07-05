import Link from "next/link";
import { db } from "@/lib/db";
import { 
  GraduationCap, MapPin, Building, ShieldCheck, 
  IndianRupee, Calendar, ArrowUpRight
} from "lucide-react";
import { auth } from "@/auth";
import ApplyButton from "@/components/ApplyButton";
import FilterBar, { FilterConfig } from "@/components/FilterBar";
import { getInternshipFilterOptions } from "@/lib/filterOptions";

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
  const selectedId = searchParams.id;
  const session = await auth();
  const user = session?.user;

  const raw = await db.internship.findMany({
    where: { isActive: true },
    include: { organization: true },
    orderBy: { createdAt: "desc" },
  });

  const filterOpts = await getInternshipFilterOptions();

  const filtered = raw.filter((item: any) => {
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

  const selectedItem = selectedId
    ? filtered.find((i: any) => i.id === selectedId) || filtered[0]
    : filtered[0];

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
            {filtered.length} internship{filtered.length !== 1 ? "s" : ""} — kickstart your career in social work.
          </p>
        </div>
        <FilterBar filters={filters} searchPlaceholder="Search internships, skills, orgs..." q={q} />
      </div>

      {filtered.length === 0 ? (
        <div className="glass-panel p-12 text-center rounded-xl flex-1 flex flex-col justify-center items-center">
          <GraduationCap className="w-12 h-12 text-muted mb-4" />
          <h3 className="text-lg font-bold text-foreground">No Internships Found</h3>
          <p className="text-xs text-muted max-w-xs mt-1">Try broadening your search or removing some filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 flex-1 items-start">
          <div className="lg:col-span-5 space-y-4 max-h-[70vh] overflow-y-auto pr-2">
            {filtered.map((item: any) => {
              const isSelected = selectedItem?.id === item.id;
              const params = new URLSearchParams();
              if (q) params.set("q", q);
              if (location) params.set("location", location);
              if (duration) params.set("duration", duration);
              if (skill) params.set("skill", skill);
              return (
                <Link
                  key={item.id}
                  href={`/internships?id=${item.id}&${params.toString()}`}
                  className={`block glass-panel p-5 rounded-xl border text-left transition-all ${
                    isSelected ? "border-primary ring-1 ring-primary bg-primary/5" : "hover:border-neutral-300 dark:hover:border-neutral-700"
                  }`}
                >
                  <div className="flex justify-between items-start gap-2">
                    <h3 className="font-bold text-sm text-foreground line-clamp-1">{item.title}</h3>
                    <ShieldCheck className="w-4 h-4 text-primary shrink-0" />
                  </div>
                  <p className="text-xs text-muted mt-1 flex items-center gap-1"><Building className="w-3.5 h-3.5" /> {item.organization?.name}</p>
                  <div className="flex flex-wrap items-center gap-3 text-[11px] text-muted mt-3">
                    <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {item.location}</span>
                    {item.stipend && <span className="flex items-center gap-1"><IndianRupee className="w-3 h-3" /> ₹{item.stipend.toLocaleString("en-IN")}/mo</span>}
                    {item.durationMonths && <span>{item.durationMonths} Months</span>}
                  </div>
                </Link>
              );
            })}
          </div>

          <div className="lg:col-span-7 glass-panel p-6 rounded-xl border border-card-border sticky top-24">
            {selectedItem ? (
              <div className="space-y-6">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-full">Internship Program</span>
                    <span className="text-xs text-muted flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> Posted {new Date(selectedItem.createdAt).toLocaleDateString()}</span>
                  </div>
                  <h2 className="text-2xl font-extrabold text-foreground">{selectedItem.title}</h2>
                  <div className="flex flex-wrap items-center gap-4 text-xs text-muted mt-2">
                    <span className="flex items-center gap-1"><Building className="w-4 h-4 text-primary" /> {selectedItem.organization?.name}</span>
                    <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {selectedItem.location}</span>
                    {selectedItem.stipend && <span className="flex items-center gap-1"><IndianRupee className="w-4 h-4" /> ₹{selectedItem.stipend.toLocaleString("en-IN")}/mo</span>}
                    {selectedItem.durationMonths && <span>Duration: {selectedItem.durationMonths} Months</span>}
                  </div>
                </div>

                {selectedItem.requiredSkills?.length > 0 && (
                  <div className="border-t border-card-border pt-4">
                    <h4 className="text-xs font-bold text-foreground mb-2">Required Skills</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedItem.requiredSkills.map((s: string) => (
                        <span key={s} className="px-2 py-0.5 bg-primary/10 text-primary text-[10px] font-semibold rounded-full">{s}</span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="border-t border-card-border pt-4">
                  <h4 className="text-sm font-bold text-foreground mb-2">Internship Description</h4>
                  <div className="text-xs text-muted leading-relaxed whitespace-pre-wrap prose prose-sm max-w-none dark:prose-invert" dangerouslySetInnerHTML={{ __html: selectedItem.description }} />
                </div>

                {selectedItem.requirements && (
                  <div className="border-t border-card-border pt-4">
                    <h4 className="text-sm font-bold text-foreground mb-2">Requirements</h4>
                    <p className="text-xs text-muted leading-relaxed whitespace-pre-line">{selectedItem.requirements}</p>
                  </div>
                )}

                <div className="border-t border-card-border pt-6 flex items-center justify-between">
                  <div className="text-xs text-muted">
                    {user ? <span>Applying as: <strong className="text-foreground">{user.email}</strong></span> : <span>Requires sign-in to apply</span>}
                  </div>
                  {user ? (
                    <ApplyButton opportunityId={selectedItem.id} opportunityTitle={selectedItem.title} opportunityType="INTERNSHIP" userEmail={user.email || undefined} label="Apply for Internship" />
                  ) : (
                    <Link href="/auth/signin?callbackUrl=/internships" className="px-6 py-2.5 bg-primary hover:bg-primary-hover text-white text-xs font-semibold rounded-lg flex items-center gap-1 transition-all">
                      <span>Login to Apply</span><ArrowUpRight className="w-4 h-4" />
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
