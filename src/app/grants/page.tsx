import Link from "next/link";
import { db } from "@/lib/db";
import { Landmark, Building, IndianRupee, Calendar, ArrowUpRight, Award } from "lucide-react";
import { auth } from "@/auth";
import ApplyButton from "@/components/ApplyButton";
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
  const selectedId = searchParams.id;
  const session = await auth();
  const user = session?.user;

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

  const selectedItem = selectedId ? filtered.find((i: any) => i.id === selectedId) || filtered[0] : filtered[0];

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
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 flex-1 items-start">
          <div className="lg:col-span-5 space-y-4 max-h-[70vh] overflow-y-auto pr-2">
            {filtered.map((item: any) => {
              const isSelected = selectedItem?.id === item.id;
              const params = new URLSearchParams();
              if (q) params.set("q", q);
              if (funding) params.set("funding", funding);
              return (
                <Link key={item.id} href={`/grants?id=${item.id}&${params.toString()}`}
                  className={`block glass-panel p-5 rounded-xl border text-left transition-all ${isSelected ? "border-primary ring-1 ring-primary bg-primary/5" : "hover:border-neutral-300 dark:hover:border-neutral-700"}`}>
                  <div className="flex justify-between items-start gap-2">
                    <h3 className="font-bold text-sm text-foreground line-clamp-1">{item.title}</h3>
                    <Award className="w-4 h-4 text-primary shrink-0" />
                  </div>
                  <p className="text-xs text-muted mt-1 flex items-center gap-1"><Building className="w-3.5 h-3.5" /> {item.organization?.name}</p>
                  <div className="flex flex-wrap items-center gap-3 text-[11px] text-muted mt-3">
                    {item.amount && <span className="flex items-center gap-1"><IndianRupee className="w-3 h-3" /> Up to ₹{(item.amount / 100000).toFixed(1)}L</span>}
                    {item.deadline && <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {new Date(item.deadline).toLocaleDateString()}</span>}
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
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded-full">Institutional Grant</span>
                    {selectedItem.deadline && <span className="text-xs text-muted">Deadline: {new Date(selectedItem.deadline).toLocaleDateString()}</span>}
                  </div>
                  <h2 className="text-2xl font-extrabold text-foreground">{selectedItem.title}</h2>
                  <div className="flex flex-wrap items-center gap-4 text-xs text-muted mt-2">
                    <span className="flex items-center gap-1"><Building className="w-4 h-4 text-primary" /> {selectedItem.organization?.name}</span>
                    {selectedItem.amount && <span className="flex items-center gap-1"><IndianRupee className="w-4 h-4" /> Up to ₹{selectedItem.amount.toLocaleString("en-IN")}</span>}
                  </div>
                </div>

                {selectedItem.requiredSkills?.length > 0 && (
                  <div className="border-t border-card-border pt-4">
                    <h4 className="text-xs font-bold text-foreground mb-2">Focus Areas / Skills</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedItem.requiredSkills.map((s: string) => (
                        <span key={s} className="px-2 py-0.5 bg-primary/10 text-primary text-[10px] font-semibold rounded-full">{s}</span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="border-t border-card-border pt-4">
                  <h4 className="text-sm font-bold text-foreground mb-2">Grant Summary & Focus Areas</h4>
                  <div className="text-xs text-muted leading-relaxed whitespace-pre-wrap prose prose-sm max-w-none dark:prose-invert" dangerouslySetInnerHTML={{ __html: selectedItem.description }} />
                </div>

                {selectedItem.requirements && (
                  <div className="border-t border-card-border pt-4">
                    <h4 className="text-sm font-bold text-foreground mb-2">Eligibility & Compliance</h4>
                    <p className="text-xs text-muted leading-relaxed whitespace-pre-line">{selectedItem.requirements}</p>
                  </div>
                )}

                <div className="border-t border-card-border pt-6 flex items-center justify-between">
                  <div className="text-xs text-muted">
                    {user ? (
                      session?.user?.role === "SEEKER"
                        ? <span>Grants are open to organisations only</span>
                        : <span>Submitting as: <strong className="text-foreground">{user.email}</strong></span>
                    ) : <span>Requires sign-in to submit proposal</span>}
                  </div>
                  {user ? (
                    session?.user?.role === "SEEKER" ? (
                      <div className="px-4 py-2 bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-bold rounded-lg">
                        ⚠️ Grants are open to NGO / organisation profiles only.
                      </div>
                    ) : (
                      <ApplyButton opportunityId={selectedItem.id} opportunityTitle={selectedItem.title} opportunityType="GRANT" userEmail={user.email || undefined} label="Submit Proposal Draft" externalApplyLink={selectedItem.externalApplyLink} />
                    )
                  ) : (
                    <Link href="/auth/signin?callbackUrl=/grants" className="px-6 py-2.5 bg-primary hover:bg-primary-hover text-white text-xs font-semibold rounded-lg flex items-center gap-1 transition-all">
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
