import Link from "next/link";
import { db } from "@/lib/db";
import { Calendar } from "lucide-react";
import { auth } from "@/auth";
import FilterBar, { FilterConfig } from "@/components/FilterBar";
import { getEventFilterOptions } from "@/lib/filterOptions";
import { Pagination } from "@/components/Pagination";
import EventCard from "@/components/EventCard";
import EmptyState from "@/components/EmptyState";

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
    orderBy: { createdAt: "desc" },
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
          <EmptyState 
            title="No Events Found"
            description="Try broadening your search or removing some filters to see more results."
            icon={<Calendar className="w-12 h-12 text-muted mx-auto" />}
            clearFiltersHref="/events"
          />
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginatedEvents.map((item: any) => {
                const href = `/events/${item.slug}`;
                return <EventCard key={item.id} item={item} href={href} />;
              })}
            </div>
            {totalPages > 1 && <Pagination currentPage={page} totalPages={totalPages} />}
          </>
        )}
      </div>
    </div>
  );
}
