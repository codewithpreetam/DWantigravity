import Link from "next/link";
import { db } from "@/lib/db";
import { Building, Globe, MapPin, Search, ArrowUpRight, CheckCircle } from "lucide-react";
import EmptyState from "@/components/EmptyState";

export const revalidate = 0;

interface PageProps {
  searchParams: Promise<{ q?: string }>;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export default async function OrganizationsPage(props: PageProps) {
  const searchParams = await props.searchParams;
  const q = searchParams.q || "";

  const rawOrgs = await db.organization.findMany({
    where: { status: "APPROVED" },
  });

  const filteredOrgs = rawOrgs.filter((org: any) => {
    if (!q) return true;
    const s = q.toLowerCase();
    return (
      org.name.toLowerCase().includes(s) ||
      org.description?.toLowerCase().includes(s)
    );
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 flex flex-col animate-fadeIn">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-foreground tracking-tight">NGO Directory</h1>
          <p className="text-xs text-muted mt-1">Browse and connect with verified nonprofit organizations across India.</p>
        </div>
        <form method="GET" className="flex items-center gap-2 max-w-sm w-full glass-panel p-1 rounded-lg">
          <Search className="w-4 h-4 text-muted ml-2" />
          <input 
            type="text" 
            name="q" 
            defaultValue={q}
            placeholder="Search organizations..."
            className="flex-1 bg-transparent px-2 py-1.5 text-xs text-foreground focus:outline-none placeholder:text-muted"
          />
          <button type="submit" className="px-3 py-1.5 bg-primary text-white rounded text-xs font-semibold cursor-pointer">
            Search
          </button>
        </form>
      </div>

      {filteredOrgs.length === 0 ? (
        <EmptyState 
          title="No NGOs Found"
          description="Try searching with a different name."
          icon={<Building className="w-12 h-12 text-muted mx-auto" />}
          clearFiltersHref="/organizations"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredOrgs.map((org: any) => {
            const slug = slugify(org.name);
            return (
              <div 
                key={org.id} 
                className="glass-panel p-6 rounded-xl flex flex-col justify-between h-56 border border-card-border relative hover:border-primary/40 hover:shadow-lg transition-all text-left group"
              >
                {/* Big Clickable Overlay Link */}
                <Link href={`/${slug}`} className="absolute inset-0 z-0 rounded-xl" />

                <div className="z-10 relative pointer-events-none flex-grow flex flex-col justify-between h-full">
                  <div>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3">
                        {org.logo ? (
                          <img 
                            src={org.logo} 
                            alt={`${org.name} logo`} 
                            className="w-12 h-12 rounded-lg object-cover border border-card-border"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-lg">
                            {org.name.substring(0, 1)}
                          </div>
                        )}
                        <div>
                          <h3 className="font-bold text-base text-foreground flex items-center gap-1.5">
                            <span>{org.name}</span>
                            <CheckCircle className="w-4 h-4 text-primary shrink-0" />
                          </h3>
                          {org.website && (
                            <span className="text-xs text-primary hover:underline flex items-center gap-1 mt-0.5 pointer-events-auto z-20">
                              <a 
                                href={org.website} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="flex items-center gap-1"
                              >
                                <Globe className="w-3.5 h-3.5" />
                                <span>Visit website</span>
                              </a>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-muted mt-3 line-clamp-3 leading-relaxed">
                      {org.description || "No description provided."}
                    </p>
                  </div>

                  <div className="border-t border-card-border pt-4 mt-4 flex items-center justify-between text-xs">
                    <span className="text-muted flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" /> India
                    </span>
                    <span className="font-bold text-primary group-hover:underline flex items-center gap-0.5">
                      <span>View Profile & Openings</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
