"use client";

import React from "react";
import Link from "next/link";
import { Calendar, MapPin, Building, Video, FileBadge } from "lucide-react";
import SaveButton from "@/components/SaveButton";
import { useSavedOpportunities } from "@/components/SavedOpportunitiesProvider";

interface EventCardProps {
  item: any;
  href: string;
}

const FORMAT_LABEL: Record<string, string> = {
  IN_PERSON: "In-Person",
  WEBINAR: "Webinar",
  HYBRID: "Hybrid",
};

export default function EventCard({ item, href }: EventCardProps) {
  const isWebinar = item.format === "WEBINAR" || item.format === "ONLINE";
  const isHybrid = item.format === "HYBRID";

  // Gracefully handle missing organizer
  const organizerName = item.organizer?.name || "Unknown Organization";

  const { savedIds, isLoggedIn, userRole } = useSavedOpportunities();
  const isSaved = savedIds.has(item.id);

  return (
    <Link 
      href={href} 
      className="glass-panel-interactive p-0 rounded-xl flex flex-col justify-between overflow-hidden group min-h-[340px] hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary shadow-sm transition-all relative"
    >
      <div className="absolute top-4 right-4 z-20">
        <SaveButton
          opportunityId={item.id}
          opportunityType="EVENT"
          initialSaved={isSaved}
          isLoggedIn={isLoggedIn}
          userRole={userRole}
        />
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Event",
            name: item.title,
            description: item.description,
            startDate: item.date ? new Date(item.date).toISOString() : undefined,
            eventAttendanceMode:
              isWebinar
                ? "https://schema.org/OnlineEventAttendanceMode"
                : isHybrid
                ? "https://schema.org/MixedEventAttendanceMode"
                : "https://schema.org/OfflineEventAttendanceMode",
            eventStatus: "https://schema.org/EventScheduled",
            location: isWebinar
              ? { "@type": "VirtualLocation", url: `https://developmentwala.org${href}` }
              : { "@type": "Place", name: item.location || "TBA", address: { "@type": "PostalAddress", addressLocality: item.location || "TBA", addressCountry: "IN" } },
            organizer: { "@type": "Organization", name: organizerName, url: "https://developmentwala.org" },
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
              {item.date ? new Date(item.date).toLocaleDateString("en-GB") : "Date TBA"}
            </span>
          </div>
          <h3 className="font-extrabold text-lg text-foreground line-clamp-2 group-hover:text-primary transition-colors leading-tight">
            {item.title}
          </h3>
          <p className="text-xs text-muted flex items-center gap-1.5 font-semibold truncate" title={organizerName}>
            <Building className="w-3.5 h-3.5 shrink-0" /> <span className="truncate">{organizerName}</span>
          </p>
          <p className="text-xs text-muted line-clamp-2 leading-relaxed">
            {item.description || "No description provided."}
          </p>
          {item.requiredSkills && item.requiredSkills.length > 0 && (
            <div className="flex flex-wrap gap-1 pt-1">
              {item.requiredSkills.slice(0, 3).map((s: string) => (
                <span key={s} className="px-2 py-0.5 bg-neutral-100 dark:bg-zinc-800 border border-card-border text-foreground text-[9px] font-semibold rounded-md shrink-0">{s}</span>
              ))}
              {item.requiredSkills.length > 3 && (
                <span className="px-2 py-0.5 bg-muted/20 text-muted text-[9px] font-semibold rounded-md shrink-0">+{item.requiredSkills.length - 3}</span>
              )}
            </div>
          )}
        </div>

        <div className="border-t border-card-border pt-4 mt-5 space-y-4">
          <div className="flex items-center justify-between text-xs text-muted font-medium">
            <span className="flex items-center gap-1.5 truncate pr-2">
              {isWebinar ? <Video className="w-3.5 h-3.5 text-primary shrink-0" /> : <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />}
              <span className="truncate">{item.location || "Online"}</span>
            </span>
            {item.certificateAvailable && (
              <span className="flex items-center gap-1 shrink-0"><FileBadge className="w-3.5 h-3.5 text-amber-500" /> Cert</span>
            )}
          </div>
          
          <div className="w-full py-2.5 bg-neutral-100 dark:bg-zinc-800 group-hover:bg-primary group-hover:text-white text-foreground text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all">
            <span>View Event Details</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
