import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Building, Calendar, IndianRupee } from "lucide-react";
import ApplyButton from "@/components/ApplyButton";
import { auth } from "@/auth";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function GrantDetailPage(props: Props) {
  const params = await props.params;
  const session = await auth();
  const user = session?.user;
  const grant = await db.grant.findUnique({
    where: { id: params.id },
  });

  if (!grant) return notFound();

  // Resolve relations
  const organization = await db.organization.findUnique({ where: { id: grant.organizationId } });
  const postedBy = grant.postedById ? await db.user.findUnique({ where: { id: grant.postedById } }) : null;

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 flex-1 space-y-6 text-left">
      <Link href="/grants" className="text-xs text-primary hover:underline flex items-center gap-1">
        <ArrowLeft className="w-4 h-4" /> Back to Grants
      </Link>
      
      <div className="glass-panel p-8 rounded-2xl border border-card-border space-y-6">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider bg-sky-500/10 text-sky-600 dark:text-sky-400 px-2 py-0.5 rounded-full">
            Grant Opportunity &middot; Funding
          </span>
          <h1 className="text-2xl font-extrabold text-foreground mt-2">{grant.title}</h1>
          <p className="text-xs text-primary font-bold flex items-center gap-1.5 mt-2">
            <Building className="w-4 h-4" />
            <Link href={`/${organization?.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")}`} className="hover:underline">{organization?.name}</Link>
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 text-xs text-muted">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-primary" /> 
            <span>Deadline: {grant.deadline ? new Date(grant.deadline).toLocaleDateString() : "Open"}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <IndianRupee className="w-4 h-4 text-primary" /> 
            <span>Funding Range: ₹{grant.fundingMin?.toLocaleString("en-IN")} - ₹{grant.fundingMax?.toLocaleString("en-IN")}</span>
          </div>
        </div>

        <div className="border-t border-card-border pt-4">
          <h3 className="font-bold text-foreground text-xs uppercase tracking-wider mb-2">Description</h3>
          <div className="text-xs text-muted leading-relaxed prose prose-sm max-w-none dark:prose-invert" dangerouslySetInnerHTML={{ __html: grant.description }} />
        </div>

        {grant.requirements && (
          <div className="border-t border-card-border pt-4">
            <h3 className="font-bold text-foreground text-xs uppercase tracking-wider mb-2">Funding Criteria / Eligibility</h3>
            <p className="text-xs text-muted leading-relaxed whitespace-pre-line">{grant.requirements}</p>
          </div>
        )}

        {postedBy && (
          <div className="border-t border-card-border pt-5 space-y-3">
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-primary">Opportunity Coordinator</h4>
            <div className="flex items-center gap-3 p-3 rounded-xl border border-card-border bg-white/30 dark:bg-zinc-950/20 w-fit">
              {postedBy.profilePhoto || postedBy.image ? (
                <img src={postedBy.profilePhoto || postedBy.image || ""} alt="" className="w-10 h-10 rounded-full object-cover border border-card-border" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-xs uppercase">{postedBy.name?.substring(0,1)}</div>
              )}
              <div>
                <p className="font-bold text-xs text-foreground leading-none">{postedBy.name}</p>
                <p className="text-[9px] text-muted mt-1 leading-none">{postedBy.jobTitle || "Recruiter"} &middot; {organization?.name}</p>
                <Link href={`/recruiter/${postedBy.id}`} className="text-[9px] font-bold text-primary hover:underline block mt-1 leading-none">View Profile &rarr;</Link>
              </div>
            </div>
          </div>
        )}

        <div className="border-t border-card-border pt-6 flex justify-between items-center">
          <span className="text-xs text-muted">
            {user 
              ? (session.user.role === "SEEKER" 
                  ? "Grants are only open to organizations" 
                  : `Applying as ${user.email}`) 
              : "Login required to apply"}
          </span>
          {user ? (
            session.user.role === "SEEKER" ? (
              <div className="px-4 py-2 bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-bold rounded-lg leading-relaxed max-w-sm">
                ⚠️ Grants are only open to NGO and organization profiles, not individual candidates.
              </div>
            ) : (
              <ApplyButton 
                opportunityId={grant.id} 
                opportunityTitle={grant.title} 
                opportunityType="GRANT" 
                userEmail={user.email || undefined} 
                label="Apply Now" 
                externalApplyLink={grant.externalApplyLink}
              />
            )
          ) : (
            <Link href={`/auth/signin?callbackUrl=/grants/${grant.id}`} className="px-5 py-2 bg-primary hover:bg-primary-hover text-white text-xs font-semibold rounded-lg">Login to Apply</Link>
          )}
        </div>
      </div>
    </div>
  );
}
