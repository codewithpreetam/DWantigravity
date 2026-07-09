"use client";

import React from "react";
import Link from "next/link";
import { 
  Briefcase, MapPin, Building, ShieldCheck, IndianRupee, Calendar, 
  ArrowUpRight, Award, GraduationCap, Users, Lightbulb, Clock, CheckCircle2
} from "lucide-react";
import SaveButton from "@/components/SaveButton";
import { useSavedOpportunities } from "@/components/SavedOpportunitiesProvider";

export type OpportunityType = "JOB" | "INTERNSHIP" | "FELLOWSHIP" | "GRANT" | "SCHOLARSHIP" | "VOLUNTEER" | "CONSULTANCY";

interface OpportunityCardProps {
  item: any;
  type: OpportunityType;
  href: string;
}

export default function OpportunityCard({ item, type, href }: OpportunityCardProps) {
  // Determine Type Icon
  let TypeIcon = Briefcase;
  if (type === "INTERNSHIP" || type === "SCHOLARSHIP" || type === "FELLOWSHIP") TypeIcon = GraduationCap;
  if (type === "GRANT") TypeIcon = Award;
  if (type === "VOLUNTEER") TypeIcon = Users;
  if (type === "CONSULTANCY") TypeIcon = Lightbulb;

  // Formatting helpers
  const prettifyMode = (v: string) => ({ ON_SITE: "On-site", REMOTE: "Remote", HYBRID: "Hybrid" }[v] ?? v);
  const isNew = item.createdAt ? (new Date().getTime() - new Date(item.createdAt).getTime() < 7 * 24 * 60 * 60 * 1000) : false;

  const { savedIds, isLoggedIn, userRole } = useSavedOpportunities();
  const isSaved = savedIds.has(item.id);

  return (
    <Link
      href={href}
      className="group block glass-panel p-5 rounded-xl border text-left transition-all hover:border-primary/40 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary min-h-[190px] flex flex-col justify-between shadow-sm relative"
      aria-label={`View details for ${item.title}`}
    >
      <div className="absolute top-4 right-4 z-10">
        <SaveButton
          opportunityId={item.id}
          opportunityType={type}
          initialSaved={isSaved}
          isLoggedIn={isLoggedIn}
          userRole={userRole}
        />
      </div>

      <div className="flex-1 space-y-3 pr-12">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 overflow-hidden pr-2">
            {item.organization?.logo ? (
              <img src={item.organization.logo} alt={item.organization.name || "Logo"} className="w-8 h-8 object-contain rounded border border-card-border bg-white p-0.5 shrink-0" />
            ) : (
              <div className="w-8 h-8 rounded border border-card-border bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0">
                {(item.organization?.name || "?").charAt(0).toUpperCase()}
              </div>
            )}
            <span className="text-xs text-muted font-semibold truncate" title={item.organization?.name}>
              {item.organization?.name}
            </span>
            {item.organization?.isVerified && (
              <span title="Verified Organization" className="shrink-0 flex items-center">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-500" />
              </span>
            )}
          </div>
          {isNew && (
            <span className="text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold px-2 py-0.5 rounded-full shrink-0">
              NEW
            </span>
          )}
        </div>
        
        <div className="flex justify-between items-start gap-2">
          <h3 className="font-bold text-sm text-foreground line-clamp-2 leading-snug group-hover:text-primary transition-colors">
            {item.title}
          </h3>
          <TypeIcon className="w-4 h-4 text-primary shrink-0 mt-0.5" />
        </div>
        
        <div className="flex flex-wrap items-center gap-3 text-[11px] text-muted">
          {item.location && (
            <span className="flex items-center gap-1 shrink-0">
              <MapPin className="w-3 h-3" /> {item.location}
            </span>
          )}
          
          {(item.salaryMin || item.salaryMax) ? (
            <span className="flex items-center gap-1 shrink-0">
              <IndianRupee className="w-3 h-3" />
              ₹{((item.salaryMin || 0) / 100000).toFixed(1)}L–{((item.salaryMax || 0) / 100000).toFixed(1)}L
            </span>
          ) : null}
          
          {item.stipend > 0 && (
            <span className="flex items-center gap-1 shrink-0">
              <IndianRupee className="w-3 h-3" /> ₹{item.stipend.toLocaleString("en-IN")}/mo
            </span>
          )}

          {item.amount > 0 && (
            <span className="flex items-center gap-1 shrink-0">
              <IndianRupee className="w-3 h-3" /> Up to ₹{(item.amount / 100000).toFixed(1)}L
            </span>
          )}

          {item.fundingAmount && (
            <span className="flex items-center gap-1 shrink-0 truncate max-w-[120px]" title={item.fundingAmount}>
              <IndianRupee className="w-3 h-3 shrink-0" /> <span className="truncate">{item.fundingAmount}</span>
            </span>
          )}
          
          {item.durationMonths && (
            <span className="flex items-center gap-1 shrink-0">
              <Clock className="w-3 h-3" /> {item.durationMonths} Months
            </span>
          )}
          
          {item.duration && !item.durationMonths && (
            <span className="flex items-center gap-1 shrink-0 truncate max-w-[100px]" title={item.duration}>
              <Clock className="w-3 h-3 shrink-0" /> <span className="truncate">{item.duration}</span>
            </span>
          )}
          
          {item.workMode && (
            <span className="px-1.5 py-0.5 rounded bg-primary/10 text-primary text-[10px] font-bold shrink-0">
              {prettifyMode(item.workMode)}
            </span>
          )}
        </div>
      </div>
      
      <div className="mt-4 pt-3 border-t border-card-border flex items-center justify-between text-xs text-muted">
        <span className="inline-flex items-center gap-1 truncate pr-2">
          <Calendar className="w-3.5 h-3.5 shrink-0" /> 
          <span className="truncate">
            {item.deadline 
              ? `Deadline: ${new Date(item.deadline).toLocaleDateString("en-GB")}` 
              : item.createdAt 
                ? `Published on ${new Date(item.createdAt).toLocaleDateString("en-GB")}` 
                : "Active"}
          </span>
        </span>
        <span className="inline-flex items-center gap-1 text-primary font-semibold shrink-0 group-hover:underline">
          View Details <ArrowUpRight className="w-3.5 h-3.5" />
        </span>
      </div>
    </Link>
  );
}
