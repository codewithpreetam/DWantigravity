import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight, Building, MapPin, IndianRupee } from "lucide-react";
import ApplyButton from "@/components/ApplyButton";
import ShareButton from "@/components/ShareButton";
import { auth } from "@/auth";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function FellowshipDetailPage(props: Props) {
  const params = await props.params;
  const session = await auth();
  const user = session?.user;
  const fellowship = await db.fellowship.findUnique({
    where: { id: params.id },
  });

  if (!fellowship) return notFound();

  // Resolve relations
  const organization = await db.organization.findUnique({ where: { id: fellowship.organizationId } });
  const postedBy = fellowship.postedById ? await db.user.findUnique({ where: { id: fellowship.postedById } }) : null;

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 flex-1 space-y-6 text-left">
      <Link href="/fellowships" className="text-xs text-primary hover:underline flex items-center gap-1">
        <ArrowLeft className="w-4 h-4" /> Back to Fellowships
      </Link>
      
      <div className="glass-panel p-5 sm:p-8 rounded-2xl border border-card-border space-y-6">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider bg-purple-500/10 text-purple-600 dark:text-purple-400 px-2 py-0.5 rounded-full">
            Fellowship &middot; {fellowship.duration || "12 Months"}
          </span>
          <h1 className="text-2xl font-extrabold text-foreground mt-2">{fellowship.title}</h1>
          <div className="flex items-center gap-2 mt-2">
            {organization?.logo ? (
              <img src={organization.logo} alt={organization.name || ""} className="w-8 h-8 object-contain rounded border border-card-border bg-white p-0.5 shrink-0" />
            ) : (
              <Building className="w-4 h-4 text-primary shrink-0" />
            )}
            <Link href={`/${organization?.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")}`} className="text-xs text-primary font-bold hover:underline">{organization?.name}</Link>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-muted">
          <div className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-primary" /> {fellowship.location}</div>
          <div className="flex items-center gap-1.5"><IndianRupee className="w-4 h-4 text-primary" /> Stipend: ₹{fellowship.stipend?.toLocaleString("en-IN")}/month</div>
        </div>

        <div className="border-t border-card-border pt-4">
          <h3 className="font-bold text-foreground text-xs uppercase tracking-wider mb-2">Description</h3>
          <div className="text-xs text-muted leading-relaxed whitespace-pre-wrap prose prose-sm max-w-none dark:prose-invert" dangerouslySetInnerHTML={{ __html: fellowship.description }} />
        </div>

        {fellowship.requirements && (
          <div className="border-t border-card-border pt-4">
            <h3 className="font-bold text-foreground text-xs uppercase tracking-wider mb-2">Requirements</h3>
            <p className="text-xs text-muted leading-relaxed whitespace-pre-line">{fellowship.requirements}</p>
          </div>
        )}

        {postedBy && (
          <div className="border-t border-card-border pt-5 space-y-3">
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-primary">Opportunity Coordinator</h4>
            <div className="flex items-center gap-3 p-3 rounded-xl border border-card-border bg-white/30 dark:bg-zinc-950/20 w-full sm:w-fit">
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

        <div className="border-t border-card-border pt-6 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
          <span className="text-xs text-muted break-all">{user ? `Applying as ${user.email}` : "Login required to apply"}</span>
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <ShareButton label="Share Fellowship" />
            {user ? (
              <ApplyButton opportunityId={fellowship.id} opportunityTitle={fellowship.title} opportunityType="FELLOWSHIP" userEmail={user.email || undefined} label="Apply Now" />
            ) : (
              <Link href={`/auth/signin?callbackUrl=/fellowships/${fellowship.id}`} className="px-5 py-2 bg-primary hover:bg-primary-hover text-white text-xs font-semibold rounded-lg w-full sm:w-auto text-center">Login to Apply</Link>
            )}
          </div>
        </div>
      </div>

      {organization && (
        <div className="glass-panel p-5 sm:p-8 rounded-2xl border border-card-border">
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted mb-4">About the Organization</h3>
          <div className="flex items-start gap-4">
            {organization.logo ? (
              <img src={organization.logo} alt={organization.name || ""} className="w-14 h-14 object-contain rounded-xl border border-card-border bg-white p-1 shrink-0" />
            ) : (
              <div className="w-14 h-14 rounded-xl border border-card-border bg-primary/10 text-primary flex items-center justify-center font-bold text-xl shrink-0">
                {organization.name?.charAt(0) || "?"}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h4 className="font-bold text-foreground text-sm">{organization.name}</h4>
              {organization.orgType && <span className="text-[10px] text-muted font-semibold">{organization.orgType}</span>}
              {organization.website && (
                <a href={organization.website} target="_blank" rel="noreferrer" className="text-[11px] text-primary hover:underline block mt-1 truncate">{organization.website}</a>
              )}
              {organization.description && (
                <p className="text-xs text-muted leading-relaxed mt-2">{organization.description}</p>
              )}
              <Link
                href={`/${organization.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")}`}
                className="inline-flex items-center gap-1 mt-3 px-3 py-1.5 bg-primary hover:bg-primary-hover text-white text-xs font-semibold rounded-lg transition-all"
              >
                View Organisation <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
