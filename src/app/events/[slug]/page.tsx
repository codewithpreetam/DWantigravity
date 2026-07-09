import { db } from "@/lib/db";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { 
  ArrowLeft, Building, MapPin, Calendar, Clock, 
  Video, Users, Globe, FileBadge, Mail, Phone,
  ArrowUpRight, Target, GraduationCap
} from "lucide-react";
import ApplyButton from "@/components/ApplyButton";
import EventRegisterButton from "@/components/EventRegisterButton";
import ShareButton from "@/components/ShareButton";
import SaveButton from "@/components/SaveButton";
import { auth } from "@/auth";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params;
  const event = await db.event.findUnique({
    where: { slug: params.slug },
    include: { 
      organizer: true,
      _count: {
        select: { registrations: true }
      }
    }
  });

  if (!event) {
    return { title: "Event Not Found" };
  }

  return {
    title: `${event.title} | ${event.organizer?.name || "Events"}`,
    description: event.description.substring(0, 160).replace(/<[^>]*>?/gm, ""),
    openGraph: {
      title: event.title,
      description: event.description.substring(0, 160).replace(/<[^>]*>?/gm, ""),
      images: event.coverImage ? [event.coverImage] : undefined,
    },
    alternates: {
      canonical: `https://developmentwala.org/events/${event.slug}`,
    }
  };
}

export default async function EventDetailPage(props: Props) {
  const params = await props.params;
  const session = await auth();
  const user = session?.user;

  const event = await db.event.findFirst({
    where: { 
      OR: [
        { slug: params.slug },
        { id: params.slug }
      ]
    },
    include: { 
      organizer: true,
      postedBy: true,
      _count: {
        select: { registrations: { where: { status: { in: ["REGISTERED", "APPROVED"] } } } }
      }
    },
  });

  if (!event) return notFound();

  // Redirect to canonical slug if accessed via ID
  if (event.slug !== params.slug) {
    redirect(`/events/${event.slug}`);
  }

  const teamMembers = event.organizerId 
    ? await db.teamMember.findMany({
        where: { organizationId: event.organizerId },
        orderBy: { displayOrder: "asc" },
        take: 3
      })
    : [];

  const isSaved = user?.id
    ? !!(await db.savedJob.findFirst({
        where: { candidateId: user.id, eventId: event.id },
      }))
    : false;

  const userRegistration = user ? await db.registration.findUnique({
    where: { eventId_userId: { eventId: event.id, userId: user.id } }
  }) : null;

  // Find related events (same category or format, excluding current)
  const relatedEvents = await db.event.findMany({
    where: { 
      id: { not: event.id },
      isActive: true,
      OR: [
        { categoryId: event.categoryId || undefined },
        { organizerId: event.organizerId },
      ]
    },
    take: 3,
    orderBy: { date: "desc" },
    include: { organizer: true }
  });

  const isWebinar = event.format === "WEBINAR" || event.format === "ONLINE";
  const isHybrid = event.format === "HYBRID";
  
  const isPastDeadline = event.registrationDeadline 
    ? new Date() > new Date(new Date(event.registrationDeadline).setUTCHours(23, 59, 59, 999)) 
    : false;
    
  const isSoldOut = event.capacity ? (event._count?.registrations ?? 0) >= event.capacity : false;
  const isActive = event.isActive !== false; // Default to true if undefined
  const isRegistrationClosed = isPastDeadline || isSoldOut || !isActive;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Event",
            name: event.title,
            description: event.description.replace(/<[^>]*>?/gm, ""),
            startDate: event.date ? new Date(event.date).toISOString() : undefined,
            endDate: event.date ? new Date(event.date).toISOString() : undefined, // simplified
            eventAttendanceMode: isWebinar
              ? "https://schema.org/OnlineEventAttendanceMode"
              : isHybrid
              ? "https://schema.org/MixedEventAttendanceMode"
              : "https://schema.org/OfflineEventAttendanceMode",
            eventStatus: "https://schema.org/EventScheduled",
            location: isWebinar
              ? { "@type": "VirtualLocation", url: event.website || `https://developmentwala.org/events/${event.slug}` }
              : { "@type": "Place", name: event.venue || event.location, address: { "@type": "PostalAddress", addressLocality: event.city || event.location, addressRegion: event.state, addressCountry: event.country || "IN" } },
            organizer: { "@type": "Organization", name: event.organizer?.name, url: event.organizer?.website || "https://developmentwala.org" },
            image: event.coverImage ? [event.coverImage] : undefined,
            offers: {
              "@type": "Offer",
              price: event.price || 0,
              priceCurrency: "INR",
              availability: isRegistrationClosed ? "https://schema.org/SoldOut" : "https://schema.org/InStock",
              url: `https://developmentwala.org/events/${event.slug}`
            }
          }),
        }}
      />

      <div className="mb-6">
        <Link href="/events" className="text-xs text-muted hover:text-foreground inline-flex items-center gap-1 transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Events List
        </Link>
      </div>

      {/* Hero Section */}
      <div className="glass-panel overflow-hidden rounded-2xl border border-card-border shadow-sm mb-8">
        {/* Cover Image */}
        {event.coverImage ? (
          <div className="w-full aspect-video md:aspect-[21/9] lg:aspect-[24/9] relative bg-neutral-100 dark:bg-neutral-800 border-b border-card-border">
            <img src={event.coverImage} alt={event.title} className="w-full h-full object-cover" />
          </div>
        ) : (
          <div className="w-full h-48 md:h-64 bg-gradient-to-r from-primary/10 to-secondary/10 border-b border-card-border flex items-center justify-center">
             <Calendar className="w-16 h-16 text-primary/30" />
          </div>
        )}

        <div className="p-6 md:p-8 space-y-6 text-left">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
            <div className="space-y-4 max-w-3xl">
              <div className="flex flex-wrap gap-2">
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md border shadow-sm ${
                  isWebinar ? "bg-blue-500/10 text-blue-600 border-blue-500/20" : isHybrid ? "bg-teal-500/10 text-teal-600 border-teal-500/20" : "bg-purple-500/10 text-purple-600 border-purple-500/20"
                }`}>
                  {event.format.replace("_", " ")}
                </span>
                {event.price === 0 && (
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-600 border border-amber-500/20 px-2.5 py-1 rounded-md shadow-sm">Free Entry</span>
                )}
              </div>
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-extrabold text-foreground leading-tight tracking-tight">{event.title}</h1>
              
              <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-xs text-muted font-medium">
                {event.organizer && (
                  <span className="flex items-center gap-1.5 hover:text-primary transition-colors cursor-pointer">
                    <Building className="w-4 h-4" /> {event.organizer.name}
                  </span>
                )}
                <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" /> {event.date ? new Date(event.date).toLocaleDateString("en-GB") : "TBA"}</span>
                {event.location && <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4" /> {event.location}</span>}
              </div>
            </div>
            
            <div className="w-full md:w-auto flex items-center gap-2">
              <SaveButton
                opportunityId={event.id}
                opportunityType="EVENT"
                initialSaved={isSaved}
                isLoggedIn={!!user}
                userRole={user?.role}
              />
              <ShareButton label="Share Event" className="h-10 px-4" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Content Column */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* About Event */}
          <section className="glass-panel p-6 md:p-8 rounded-2xl border border-card-border text-left space-y-4">
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
               About the Event
            </h2>
            <div className="text-sm text-muted leading-relaxed prose prose-sm max-w-none dark:prose-invert" dangerouslySetInnerHTML={{ __html: event.description }} />
          </section>

          {/* Agenda */}
          {event.agenda && (
            <section className="glass-panel p-6 md:p-8 rounded-2xl border border-card-border text-left space-y-4">
              <h2 className="text-lg font-bold text-foreground">Agenda / Schedule</h2>
              <div className="text-sm text-muted leading-relaxed whitespace-pre-wrap">{event.agenda}</div>
            </section>
          )}

          {/* Who Should Attend */}
          {(event.audience?.length > 0 || event.eligibility) && (
            <section className="glass-panel p-6 md:p-8 rounded-2xl border border-card-border text-left space-y-6">
              {event.audience?.length > 0 && (
                <div className="space-y-3">
                  <h2 className="text-sm font-bold text-foreground flex items-center gap-2"><Target className="w-4 h-4 text-primary" /> Who Should Attend</h2>
                  <div className="flex flex-wrap gap-2">
                    {event.audience.map((aud: string, i: number) => (
                      <span key={i} className="px-3 py-1 bg-neutral-100 dark:bg-zinc-800 text-muted text-xs font-semibold rounded-lg border border-card-border">{aud}</span>
                    ))}
                  </div>
                </div>
              )}
              {event.eligibility && (
                <div className="space-y-3">
                  <h2 className="text-sm font-bold text-foreground flex items-center gap-2"><GraduationCap className="w-4 h-4 text-primary" /> Eligibility</h2>
                  <p className="text-xs text-muted leading-relaxed">{event.eligibility}</p>
                </div>
              )}
            </section>
          )}

          {/* Meet Our Team */}
          {teamMembers.length > 0 && (
            <section className="glass-panel p-6 md:p-8 rounded-2xl border border-card-border text-left space-y-4">
              <h2 className="text-sm font-bold text-foreground flex items-center gap-2"><Users className="w-4 h-4 text-primary" /> Meet the Event Team</h2>
              <div className="flex flex-wrap gap-3">
                {teamMembers.map((member: any) => (
                  <div key={member.id} className="flex items-center gap-3 p-3 rounded-xl border border-card-border bg-white/30 dark:bg-zinc-950/20 w-full sm:w-fit">
                    {member.profilePhoto ? (
                      <img
                        src={member.profilePhoto}
                        alt={member.fullName}
                        className="w-10 h-10 rounded-full object-cover border border-card-border"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-xs uppercase">
                        {member.fullName?.substring(0, 1)}
                      </div>
                    )}
                    <div>
                      <p className="font-bold text-xs text-foreground leading-none">{member.fullName}</p>
                      <p className="text-[9px] text-muted mt-1 leading-none">{member.designation}</p>
                    </div>
                  </div>
                ))}
              </div>
              {event.organizer && (
                <Link
                  href={`/${event.organizer.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")}`}
                  className="text-[10px] font-bold text-primary hover:underline block mt-2"
                >
                  View Full Team Directory &rarr;
                </Link>
              )}
            </section>
          )}

        </div>

        {/* Sidebar Column */}
        <div className="space-y-6">
          
          {/* Registration Box */}
          <div className="glass-panel p-6 rounded-2xl border border-card-border text-left space-y-6 shadow-sm">
            <h3 className="text-lg font-bold text-foreground">Registration</h3>
            
            <div className="space-y-3 text-xs font-medium text-muted">
              {event.registrationDeadline && (
                <div className="flex justify-between border-b border-card-border pb-3">
                  <span>Deadline</span>
                  <span className="text-foreground">{new Date(event.registrationDeadline).toLocaleDateString("en-GB")}</span>
                </div>
              )}
              {event.capacity && (
                <div className="flex justify-between border-b border-card-border pb-3">
                  <span>Capacity</span>
                  <span className="text-foreground">{event.capacity} Seats</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Status</span>
                <span className={`font-bold ${isRegistrationClosed ? "text-red-500" : "text-emerald-500"}`}>
                  {isRegistrationClosed ? "Closed" : "Open"}
                </span>
              </div>
            </div>

            <div className="pt-2">
              {userRegistration && userRegistration.status !== "CANCELLED" ? (
                <Link href="/dashboard/candidate?tab=tickets" className="block w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-bold rounded-xl text-center transition-colors shadow">
                  You are registered (Go to Dashboard)
                </Link>
              ) : isRegistrationClosed ? (
                <div className="w-full py-3 bg-neutral-200 dark:bg-neutral-800 text-muted text-sm font-bold rounded-xl text-center cursor-not-allowed">
                  {isSoldOut ? "Sold Out" : "Registration Closed"}
                </div>
              ) : user ? (
                <EventRegisterButton 
                  eventId={event.id} 
                  eventTitle={event.title} 
                  eventDate={event.date?.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                  eventLocation={event.format === "ONLINE" ? "Online / Virtual" : (event.venue ? `${event.venue}, ${event.city}` : "TBD")}
                  userEmail={user.email || undefined} 
                  userName={user.name || undefined}
                  userRole={user.role}
                  customQuestions={
                    (function parseQs(qs: any) {
                      if (!qs) return [];
                      if (Array.isArray(qs)) return qs;
                      if (typeof qs === "string") {
                        try {
                          const p = JSON.parse(qs);
                          return Array.isArray(p) ? p : [];
                        } catch {
                          return [];
                        }
                      }
                      return [];
                    })(event.customQuestions)
                  }
                  isClosed={isRegistrationClosed}
                  alreadyRegistered={!!userRegistration && userRegistration.status !== "CANCELLED"}
                />
              ) : (
                <Link href={`/auth/signin?callbackUrl=/events/${event.slug}`} className="block w-full py-3 bg-primary hover:bg-primary-hover text-white text-sm font-bold rounded-xl text-center transition-colors shadow">
                  Login to Register
                </Link>
              )}
            </div>
          </div>

          {/* Event Information Box */}
          <div className="glass-panel p-6 rounded-2xl border border-card-border text-left space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted mb-4">Event Information</h3>
            <div className="space-y-3 text-xs text-muted">
              <div className="flex gap-2">
                <Calendar className="w-4 h-4 text-primary shrink-0" />
                <span>{event.date ? new Date(event.date).toLocaleDateString("en-GB") : "TBA"}</span>
              </div>
              {(event.time || event.timeZone) && (
                <div className="flex gap-2">
                  <Clock className="w-4 h-4 text-primary shrink-0" />
                  <span>{event.time} {event.timeZone}</span>
                </div>
              )}
              {event.duration && (
                <div className="flex gap-2">
                  <Clock className="w-4 h-4 text-primary shrink-0" />
                  <span>Duration: {event.duration}</span>
                </div>
              )}
              {event.format === "IN_PERSON" || event.format === "HYBRID" ? (
                <div className="flex gap-2">
                  <MapPin className="w-4 h-4 text-primary shrink-0" />
                  <span className="leading-relaxed">
                    {event.venue && <strong className="text-foreground block">{event.venue}</strong>}
                    {[event.city, event.state, event.country].filter(Boolean).join(", ")}
                  </span>
                </div>
              ) : null}
              {event.format === "WEBINAR" || event.format === "HYBRID" ? (
                <div className="flex gap-2">
                  <Video className="w-4 h-4 text-primary shrink-0" />
                  <span>{event.meetingPlatform || "Online Platform"}</span>
                </div>
              ) : null}
              {event.certificateAvailable && (
                <div className="flex gap-2">
                  <FileBadge className="w-4 h-4 text-amber-500 shrink-0" />
                  <span>Certificate Provided</span>
                </div>
              )}
            </div>
          </div>

          {/* Organizer Info */}
          {event.organizer && (
            <div className="glass-panel p-6 rounded-2xl border border-card-border text-left space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted mb-2">Organized By</h3>
              <div className="flex items-center gap-3">
                {event.organizer.logo ? (
                  <img src={event.organizer.logo} alt="" className="w-12 h-12 object-contain bg-white rounded-lg border border-card-border p-1" />
                ) : (
                  <div className="w-12 h-12 bg-primary/10 flex items-center justify-center text-primary font-bold text-lg rounded-lg">{event.organizer.name.charAt(0)}</div>
                )}
                <div>
                  <h4 className="font-bold text-foreground text-sm">{event.organizer.name}</h4>
                  <Link href={`/organizations`} className="text-[10px] text-primary hover:underline font-semibold mt-0.5 inline-block">View Profile &rarr;</Link>
                </div>
              </div>
              {event.organizer.description && (
                <p className="text-xs text-muted line-clamp-3 leading-relaxed mt-2">{event.organizer.description}</p>
              )}
              <div className="space-y-2 pt-3 border-t border-card-border">
                {event.website && (
                  <a href={event.website} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-xs text-muted hover:text-primary">
                    <Globe className="w-3.5 h-3.5" /> Event Website
                  </a>
                )}
                {event.contactEmail && (
                  <a href={`mailto:${event.contactEmail}`} className="flex items-center gap-1.5 text-xs text-muted hover:text-primary">
                    <Mail className="w-3.5 h-3.5" /> {event.contactEmail}
                  </a>
                )}
                {event.contactPhone && (
                  <span className="flex items-center gap-1.5 text-xs text-muted">
                    <Phone className="w-3.5 h-3.5" /> {event.contactPhone}
                  </span>
                )}
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Related Events */}
      {relatedEvents.length > 0 && (
        <div className="mt-16 pt-8 border-t border-card-border/50 text-left">
          <h2 className="text-xl font-bold text-foreground mb-6">Similar Events You Might Like</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {relatedEvents.map((item: any) => (
              <Link key={item.id} href={`/events/${item.slug}`} className="glass-panel-interactive p-4 rounded-xl flex items-start gap-4 hover:border-primary/40 group">
                <div className="w-20 h-20 bg-neutral-100 dark:bg-neutral-800 rounded-lg overflow-hidden shrink-0">
                  {item.coverImage ? (
                    <img src={item.coverImage} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted"><Calendar className="w-6 h-6" /></div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-sm text-foreground line-clamp-2 group-hover:text-primary transition-colors">{item.title}</h3>
                  <p className="text-[10px] text-muted flex items-center gap-1 mt-1.5"><Calendar className="w-3 h-3" /> {new Date(item.date).toLocaleDateString("en-GB")}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
