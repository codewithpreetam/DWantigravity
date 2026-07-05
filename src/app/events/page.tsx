import Link from "next/link";
import { db } from "@/lib/db";
import { Calendar, MapPin, Building, Video, FileBadge, ArrowUpRight } from "lucide-react";
import { auth } from "@/auth";
import FilterBar, { FilterConfig } from "@/components/FilterBar";
import { getEventFilterOptions } from "@/lib/filterOptions";

export const revalidate = 0;

const FORMAT_LABEL: Record<string, string> = {
  IN_PERSON: "In-Person",
  WEBINAR: "Webinar",
  HYBRID: "Hybrid",
};

interface PageProps {
  searchParams: Promise<{ q?: string; status?: string; format?: string; location?: string; skill?: string }>;
}

export default async function EventsPage(props: PageProps) {
  const searchParams = await props.searchParams;
  const q = searchParams.q || "";
  const format = searchParams.format || "";
  const status = searchParams.status;
  const location = searchParams.location || "";
  const skill = searchParams.skill || "";
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

      {filtered.length === 0 ? (
        <div className="glass-panel p-12 text-center rounded-xl flex-1 flex flex-col justify-center items-center">
          <Calendar className="w-12 h-12 text-muted mb-4" />
          <h3 className="text-lg font-bold text-foreground">No Events Found</h3>
          <p className="text-xs text-muted max-w-xs mt-1">Try broadening your search or removing filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((item: any) => {
            const isWebinar = item.format === "WEBINAR";
            const isHybrid = item.format === "HYBRID";
            return (
              <div key={item.id} className="glass-panel p-6 rounded-xl flex flex-col justify-between min-h-[340px]">
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
                        ? { "@type": "VirtualLocation", url: "https://developmentwala.org/events" }
                        : { "@type": "Place", name: item.location, address: { "@type": "PostalAddress", addressLocality: item.location, addressCountry: "IN" } },
                      organizer: { "@type": "Organization", name: item.organizer?.name || "DevelopmentWala", url: "https://developmentwala.org" },
                      offers: { "@type": "Offer", price: "0", priceCurrency: "INR", availability: "https://schema.org/InStock" },
                    }),
                  }}
                />
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                      isWebinar
                        ? "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20"
                        : isHybrid
                        ? "bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20"
                        : "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20"
                    }`}>
                      {FORMAT_LABEL[item.format] ?? item.format}
                    </span>
                    <span className="text-[10px] text-muted flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(item.date).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })}
                    </span>
                  </div>
                  <h3 className="font-bold text-lg text-foreground line-clamp-2 hover:text-primary transition-colors leading-tight">{item.title}</h3>
                  <p className="text-xs text-muted flex items-center gap-1.5">
                    <Building className="w-3.5 h-3.5" /> {item.organizer?.name}
                  </p>
                  <p className="text-xs text-muted line-clamp-3 leading-relaxed">{item.description}</p>
                  {item.requiredSkills?.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {item.requiredSkills.slice(0, 3).map((s: string) => (
                        <span key={s} className="px-1.5 py-0.5 bg-primary/10 text-primary text-[9px] font-semibold rounded-full">{s}</span>
                      ))}
                      {item.requiredSkills.length > 3 && (
                        <span className="px-1.5 py-0.5 bg-muted/20 text-muted text-[9px] font-semibold rounded-full">+{item.requiredSkills.length - 3}</span>
                      )}
                    </div>
                  )}
                </div>

                <div className="border-t border-card-border pt-4 mt-4 space-y-4">
                  <div className="flex items-center justify-between text-xs text-muted">
                    <span className="flex items-center gap-1">
                      {isWebinar ? <Video className="w-3.5 h-3.5" /> : <MapPin className="w-3.5 h-3.5" />}
                      {item.location}
                    </span>
                    <span className="flex items-center gap-1"><FileBadge className="w-3.5 h-3.5" /> Certificate</span>
                  </div>

                  {user ? (
                    <form action="/api/register-event" method="POST">
                      <input type="hidden" name="eventId" value={item.id} />
                      <button
                        type="submit"
                        className="w-full py-2 bg-primary hover:bg-primary-hover text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-1 transition-all cursor-pointer shadow"
                      >
                        <span>Register For Event</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </button>
                    </form>
                  ) : (
                    <Link
                      href="/auth/signin?callbackUrl=/events"
                      className="w-full py-2 bg-neutral-200 dark:bg-neutral-800 hover:bg-neutral-300 dark:hover:bg-neutral-700 text-foreground text-xs font-semibold rounded-lg flex items-center justify-center gap-1 transition-all"
                    >
                      <span>Login to Register</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
