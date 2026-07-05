import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import { 
  User, Building, Globe, Mail, MapPin, 
  Share2, Briefcase, ArrowLeft 
} from "lucide-react";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params;
  const recruiter = await db.user.findUnique({
    where: { id: params.id },
  });

  if (!recruiter || recruiter.role !== "EMPLOYER") {
    return {
      title: "Recruiter Not Found",
    };
  }

  return {
    title: `${recruiter.name} | Social Impact Recruiter Profile`,
    description: recruiter.shortBio || `Learn more about recruiter ${recruiter.name} and current career opportunities.`,
  };
}

export default async function RecruiterProfilePage(props: Props) {
  const params = await props.params;
  const recruiter = await db.user.findUnique({
    where: { id: params.id }
  });

  if (!recruiter || recruiter.role !== "EMPLOYER") {
    return notFound();
  }

  // Fetch opportunities posted by this recruiter
  const rawJobs = await db.job.findMany({ where: { postedById: recruiter.id, isActive: true } });
  const rawInternships = await db.internship.findMany({ where: { postedById: recruiter.id, isActive: true } });
  const rawFellowships = await db.fellowship.findMany({ where: { postedById: recruiter.id, isActive: true } });

  const opportunities = [
    ...rawJobs.map((j: any) => ({ ...j, type: "Job" })),
    ...rawInternships.map((i: any) => ({ ...i, type: "Internship" })),
    ...rawFellowships.map((f: any) => ({ ...f, type: "Fellowship" }))
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-1 space-y-6">
      
      <div className="mb-2">
        <Link href="/organizations" className="text-xs text-muted hover:text-foreground inline-flex items-center gap-1 transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to NGO Directory
        </Link>
      </div>

      {/* Recruiter profile glass-panel */}
      <div className="glass-panel p-8 rounded-2xl border border-card-border grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
        
        {/* Profile picture column */}
        <div className="md:col-span-1 flex flex-col items-center text-center space-y-2">
          {recruiter.profilePhoto || recruiter.image ? (
            <img 
              src={recruiter.profilePhoto || recruiter.image || ""} 
              alt={recruiter.name || ""} 
              className="w-24 h-24 rounded-full object-cover border border-card-border p-1 bg-white" 
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-primary/20 text-primary flex items-center justify-center font-black text-2xl uppercase border border-card-border">
              {recruiter.name?.substring(0, 1) || "U"}
            </div>
          )}
          <span className="text-[9px] bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
            {recruiter.roleInOrg || "Recruiter"}
          </span>
        </div>

        {/* Text biography details */}
        <div className="md:col-span-3 space-y-4 text-left">
          <div>
            <h1 className="text-2xl font-extrabold text-foreground leading-tight">{recruiter.name}</h1>
            <p className="text-xs text-muted font-bold flex items-center gap-1 mt-1">
              <span>{recruiter.jobTitle || "Recruiter Coordinator"}</span>
              {recruiter.department && <span>&middot; {recruiter.department}</span>}
            </p>
            {recruiter.organization && (
              <p className="text-xs text-primary font-bold flex items-center gap-1 mt-1">
                <Building className="w-4 h-4 shrink-0" />
                <Link href={`/${recruiter.organization.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")}`} className="hover:underline">
                  {recruiter.organization.name}
                </Link>
              </p>
            )}
          </div>

          {recruiter.shortBio && (
            <p className="text-xs text-muted italic bg-white/40 dark:bg-zinc-950/40 p-3 rounded-lg border border-card-border">
              "{recruiter.shortBio}"
            </p>
          )}

          {recruiter.aboutMe && (
            <div className="space-y-1">
              <h3 className="font-bold text-foreground text-xs">About Me</h3>
              <p className="text-xs text-muted leading-relaxed whitespace-pre-line">
                {recruiter.aboutMe}
              </p>
            </div>
          )}

          {/* Contact social tags */}
          <div className="border-t border-card-border pt-4 flex flex-wrap items-center gap-4 text-xs text-muted">
            {recruiter.linkedin && (
              <a href={recruiter.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-primary transition-colors">
                <Share2 className="w-4 h-4 text-primary" />
                <span>LinkedIn</span>
              </a>
            )}
            {recruiter.twitter && (
              <a href={recruiter.twitter} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-primary transition-colors">
                <Share2 className="w-4 h-4 text-primary" />
                <span>Twitter/X</span>
              </a>
            )}
            {recruiter.website && (
              <a href={recruiter.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-primary transition-colors">
                <Globe className="w-4 h-4" />
                <span>Website</span>
              </a>
            )}
            {recruiter.officeLocation && (
              <span className="flex items-center gap-1 text-[11px]">
                <MapPin className="w-4 h-4" />
                <span>{recruiter.officeLocation}</span>
              </span>
            )}
          </div>
        </div>

      </div>

      {/* Recruiter Published opportunities feed */}
      <div className="glass-panel p-8 rounded-2xl border border-card-border text-left space-y-6">
        <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
          <Briefcase className="w-5 h-5 text-primary" />
          <span>Opportunities Posted by {recruiter.name?.split(" ")[0]}</span>
        </h2>

        {opportunities.length === 0 ? (
          <p className="text-xs text-muted italic text-center py-6">No active opportunities posted by this recruiter currently.</p>
        ) : (
          <div className="grid gap-4">
            {opportunities.map((opp: any) => (
              <div 
                key={opp.id} 
                className="p-4 rounded-xl border border-card-border bg-white/20 dark:bg-zinc-950/20 flex justify-between items-center gap-4 hover:border-neutral-300 dark:hover:border-neutral-800 transition-all group"
              >
                <div>
                  <h3 className="font-extrabold text-xs text-foreground group-hover:text-primary transition-colors">{opp.title}</h3>
                  <div className="flex items-center gap-3 text-[10px] text-muted mt-1 font-semibold">
                    <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {opp.location}</span>
                    <span>&middot;</span>
                    <span>Posted {new Date(opp.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                <span className="text-[8px] font-bold uppercase tracking-wider bg-primary/10 text-primary px-2 py-0.5 rounded border border-primary/20 shrink-0">
                  {opp.type}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
