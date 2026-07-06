import Link from "next/link";
import { db } from "@/lib/db";
import { Calendar, MapPin, Building, Video, FileBadge, ArrowUpRight } from "lucide-react";
import { auth } from "@/auth";
import FilterBar, { FilterConfig } from "@/components/FilterBar";
import { getEventFilterOptions } from "@/lib/filterOptions";
import { Pagination } from "@/components/Pagination";

export const revalidate = 0;

const FORMAT_LABEL: Record<string, string> = {
  IN_PERSON: "In-Person",
  WEBINAR: "Webinar",
  HYBRID: "Hybrid",
};

interface PageProps {
  searchParams: Promise<{ q?: string; status?: string; format?: string; location?: string; skill?: string; page?: string }>;
}

export default async function EventsPage(props: PageProps) {
  const searchParams = await props.searchParams;
  const q = searchParams.q || "";
  const format = searchParams.format || "";
  const status = searchParams.status;
  const location = searchParams.location || "";
  const skill = searchParams.skill || "";
  const page = parseInt(searchParams.page || "1", 10) || 1;
  const session = await auth();
  const user = session?.user;

  const raw = await db.event.findMany({
    include: { organizer: true },
    orderBy: { date: "asc" },
  });
  const filterOpts = await getEventFilterOptions();

  const filtered = raw.filter((item: any) => {
    if (q) {
      const s = q.toLowerCase();
      if (
        !item.title.toLowerCase().includes(s) &&
        !item.description.toLowerCase().includes(s) &&
        !(item.organizer?.name || "").toLowerCase().includes(s) &&
        !item.location.toLowerCase().includes(s)
      ) return false;
    }
    if (format && item.format !== format) return false;
    if (location && !item.location.toLowerCase().includes(location.toLowerCase())) return false;
    if (skill && !item.requiredSkills.some((sk: string) => sk.toLowerCase() === skill.toLowerCase())) return false;
    return true;
  });

  const itemsPerPage = 21;
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginatedEvents = filtered.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  const filters: FilterConfig[] = [
    {
      name: "format",
      placeholder: "Event Format",
      options: filterOpts.formats.map(v => ({ value: v, label: FORMAT_LABEL[v] ?? v })),
    },
    {
      name: "location",
      placeholder: "Location",
      options: filterOpts.locations.map(v => ({ value: v, label: v })),
    },
    {
      name: "skill",
      placeholder: "Topic / Skill",
      options: filterOpts.skills.slice(0, 40).map(v => ({ value: v, label: v })),
    },
  ].filter(f => f.options.length > 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 flex flex-col">
      <div className="mb-8">
        <div className="mb-4">
          <h1 className="text-3xl font-extrabold text-foreground tracking-tight">NGO & CSR Events</h1>
          <p className="text-xs text-muted mt-1">
            {filtered.length} event{filtered.length !== 1 ? "s" : ""} — conferences, webinars, workshops and meetups in India&apos;s social sector.
          </p>
        </div>
        <FilterBar filters={filters} searchPlaceholder="Search events, topics, organisations..." q={q} />
      </div>

      {status === "registered" && (
        <div className="mb-6 p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs text-primary font-semibold">
          🎉 Registration successful! Ticket generated. View details in your Candidate Dashboard.
        </div>
      )}

      {/* Results */}
      <div className="flex-1 space-y-6">
        <div className="flex items-center justify-between bg-white dark:bg-zinc-950 p-4 rounded-xl border border-card-border shadow-sm">
          <p className="text-sm text-muted font-medium">
            Showing <strong className="text-foreground">{paginatedEvents.length}</strong> of <strong className="text-foreground">{filtered.length}</strong> events
          </p>
        </div>

        {paginatedEvents.length === 0 ? (
          <div className="glass-panel p-12 text-center rounded-xl flex-1 flex flex-col justify-center items-center">
            <Calendar className="w-12 h-12 text-muted mb-4" />
            <h3 className="text-lg font-bold text-foreground">No Events Found</h3>
            <p className="text-xs text-muted max-w-xs mt-1">Try broadening your search or removing filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedEvents.map((item: any) => {
              const isWebinar = item.format === "WEBINAR";
              const isHybrid = item.format === "HYBRID";
            return (
              <Link key={item.id} href={`/events/${item.slug}`} className="glass-panel-interactive p-0 rounded-xl flex flex-col justify-between overflow-hidden group min-h-[340px] hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary shadow-sm transition-all">
                <script
                  type="application/ld+json"
                  dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                      "@context": "https://schema.org",
                      "@type": "Event",
                      name: item.title,
                      description: item.description,
                      startDate: new Date(item.date).toISOString(),
                      eventAttendanceMode:
                        isWebinar
                          ? "https://schema.org/OnlineEventAttendanceMode"
                          : isHybrid
                          ? "https://schema.org/MixedEventAttendanceMode"
                          : "https://schema.org/OfflineEventAttendanceMode",
                      eventStatus: "https://schema.org/EventScheduled",
                      location: isWebinar
                        ? { "@type": "VirtualLocation", url: `https://developmentwala.org/events/${item.slug}` }
                        : { "@type": "Place", name: item.location, address: { "@type": "PostalAddress", addressLocality: item.location, addressCountry: "IN" } },
                      organizer: { "@type": "Organization", name: item.organizer?.name || "DevelopmentWala", url: "https://developmentwala.org" },
                      offers: { "@type": "Offer", price: item.price ? item.price.toString() : "0", priceCurrency: "INR", availability: "https://schema.org/InStock" },
                    }),
                  }}
                />
                
                {/* Cover Image */}
                <div className="w-full aspect-video bg-neutral-100 dark:bg-neutral-800 relative overflow-hidden shrink-0 border-b border-card-border">
                  {item.coverImage ? (
                    <img src={item.coverImage} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-muted group-hover:scale-105 transition-transform duration-500 opacity-50">
                      <Calendar className="w-10 h-10 mb-2" />
                      <span className="text-xs font-semibold">Event Image</span>
                    </div>
                  )}
                  <div className="absolute top-3 left-3 flex gap-2">
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md border shadow-sm backdrop-blur-md ${
                      isWebinar
                        ? "bg-blue-500/80 text-white border-blue-400"
                        : isHybrid
                        ? "bg-teal-500/80 text-white border-teal-400"
                        : "bg-purple-500/80 text-white border-purple-400"
                    }`}>
                      {FORMAT_LABEL[item.format] ?? item.format}
                    </span>
                  </div>
                </div>

                <div className="p-6 flex-1 flex flex-col">
                  <div className="space-y-3 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-muted flex items-center gap-1.5 font-bold">
                        <Calendar className="w-3.5 h-3.5 text-primary" />
                        {new Date(item.date).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })}
                      </span>
                    </div>
                    <h3 className="font-extrabold text-lg text-foreground line-clamp-2 group-hover:text-primary transition-colors leading-tight">{item.title}</h3>
                    <p className="text-xs text-muted flex items-center gap-1.5 font-semibold">
                      <Building className="w-3.5 h-3.5" /> {item.organizer?.name}
                    </p>
                    <p className="text-xs text-muted line-clamp-2 leading-relaxed">{item.description}</p>
                    {item.requiredSkills?.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-1">
                        {item.requiredSkills.slice(0, 3).map((s: string) => (
                          <span key={s} className="px-2 py-0.5 bg-neutral-100 dark:bg-zinc-800 border border-card-border text-foreground text-[9px] font-semibold rounded-md">{s}</span>
                        ))}
                        {item.requiredSkills.length > 3 && (
                          <span className="px-2 py-0.5 bg-muted/20 text-muted text-[9px] font-semibold rounded-md">+{item.requiredSkills.length - 3}</span>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="border-t border-card-border pt-4 mt-5 space-y-4">
                    <div className="flex items-center justify-between text-xs text-muted font-medium">
                      <span className="flex items-center gap-1.5 truncate pr-2">
                        {isWebinar ? <Video className="w-3.5 h-3.5 text-primary" /> : <MapPin className="w-3.5 h-3.5 text-primary" />}
                        <span className="truncate">{item.location}</span>
                      </span>
                      {item.certificateAvailable && (
                        <span className="flex items-center gap-1 shrink-0"><FileBadge className="w-3.5 h-3.5 text-amber-500" /> Cert</span>
                      )}
                    </div>
                    
                    <div className="w-full py-2.5 bg-neutral-100 dark:bg-zinc-800 group-hover:bg-primary group-hover:text-white text-foreground text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all">
                      <span>View Event Details</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
        )}
        
        <Pagination currentPage={page} totalPages={totalPages} />
      </div>
    </div>
  );
}
