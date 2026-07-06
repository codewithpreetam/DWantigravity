import { db } from "@/lib/db";
import Link from "next/link";
import { Building, MapPin, ShieldCheck, ArrowRight } from "lucide-react";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export async function TopOrganizations() {
  const orgs = await db.organization.findMany({
    where: { status: "VERIFIED" },
    select: {
      id: true,
      name: true,
      logo: true,
      description: true,
      headquarters: true,
      status: true,
      _count: {
        select: {
          jobs: { where: { isActive: true } },
          internships: { where: { isActive: true } },
          fellowships: { where: { isActive: true } },
          scholarships: { where: { isActive: true } },
          grants: { where: { isActive: true } },
          consultancies: { where: { isActive: true } },
          volunteers: { where: { isActive: true } },
          events: { where: { date: { gte: new Date() } } },
        },
      },
    },
  });

  // Calculate total active opportunities per org
  const orgsWithCounts = orgs.map((org: any) => {
    const activeCount =
      (org._count?.jobs || 0) +
      (org._count?.internships || 0) +
      (org._count?.fellowships || 0) +
      (org._count?.scholarships || 0) +
      (org._count?.grants || 0) +
      (org._count?.consultancies || 0) +
      (org._count?.volunteers || 0) +
      (org._count?.events || 0);

    return {
      ...org,
      activeCount,
    };
  });

  // Filter organizations with at least 1 active opportunity
  const hiringOrgs = orgsWithCounts.filter((org: any) => org.activeCount > 0);

  // Sort by active opportunities (descending) and take top 9
  const topOrgs = hiringOrgs.sort((a: any, b: any) => b.activeCount - a.activeCount).slice(0, 9);

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-card-border/50">
      <div className="text-center mb-10 space-y-3">
        <h2 className="text-3xl font-extrabold text-foreground tracking-tight">Top Organizations Hiring Now</h2>
        <p className="text-sm text-muted max-w-2xl mx-auto">
          Explore organizations actively recruiting across India. Discover their profiles and browse all open opportunities in one place.
        </p>
      </div>

      {topOrgs.length === 0 ? (
        <div className="glass-panel p-10 rounded-2xl text-center border border-card-border shadow-sm">
          <p className="text-sm text-muted font-medium">No organizations are currently hiring. Please check back soon.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {topOrgs.map((org: any) => {
              const profileUrl = `/${slugify(org.name)}`;

              return (
                <Link
                  key={org.id}
                  href={profileUrl}
                  className="glass-panel-interactive p-6 rounded-2xl border border-card-border flex flex-col h-full hover:border-primary/40 transition-all group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary shadow-sm"
                  aria-label={`View profile and opportunities for ${org.name}`}
                >
                  <div className="flex items-start gap-4 mb-4">
                    {/* Logo */}
                    {org.logo ? (
                      <div className="w-14 h-14 rounded-xl border border-card-border p-1.5 bg-white shrink-0 shadow-sm">
                        <img src={org.logo} alt="" className="w-full h-full object-contain" />
                      </div>
                    ) : (
                      <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-card-border font-extrabold text-xl shrink-0 shadow-sm">
                        {org.name.substring(0, 1)}
                      </div>
                    )}

                    {/* Header Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-extrabold text-base text-foreground line-clamp-1 group-hover:text-primary transition-colors leading-tight">
                          {org.name}
                        </h3>
                        {org.status === "VERIFIED" && (
                          <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" aria-label="Verified Organization" />
                        )}
                      </div>
                      {org.headquarters && (
                        <p className="text-[10px] text-muted flex items-center gap-1 mt-1 font-medium">
                          <MapPin className="w-3 h-3" /> <span className="line-clamp-1">{org.headquarters}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Description */}
                  <div className="flex-1">
                    <p className="text-xs text-muted line-clamp-2 leading-relaxed">
                      {org.description || `${org.name} is working to create positive and sustainable social impact in India.`}
                    </p>
                  </div>

                  {/* Footer Stats & Buttons */}
                  <div className="mt-5 pt-4 border-t border-card-border/60">
                    <div className="flex items-center gap-2 mb-4">
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-primary/10 text-primary px-2.5 py-1 rounded-lg border border-primary/20">
                        {org.activeCount} Open {org.activeCount === 1 ? "Opportunity" : "Opportunities"}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex-1 text-center py-2 text-xs font-semibold rounded-lg bg-neutral-100 dark:bg-zinc-800 text-foreground group-hover:bg-neutral-200 dark:group-hover:bg-zinc-700 transition-colors">
                        View Organization
                      </div>
                      <div className="flex-1 text-center py-2 text-xs font-semibold rounded-lg bg-primary text-white group-hover:bg-primary-hover transition-colors flex items-center justify-center gap-1">
                        View Openings <ArrowRight className="w-3 h-3" />
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>

          <div className="mt-10 flex justify-center">
            <Link
              href="/organizations"
              className="px-8 py-3 bg-primary hover:bg-primary-hover text-white rounded-xl text-sm font-semibold transition-all shadow-md flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            >
              View All Organizations <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </>
      )}
    </section>
  );
}
