import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Building, MapPin, IndianRupee } from "lucide-react";
import ApplyButton from "@/components/ApplyButton";
import { auth } from "@/auth";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function InternshipDetailPage(props: Props) {
  const params = await props.params;
  const session = await auth();
  const user = session?.user;
  const internship = await db.internship.findUnique({
    where: { id: params.id },
  });

  if (!internship) return notFound();

  // Resolve relations
  const organization = await db.organization.findUnique({ where: { id: internship.organizationId } });
  const postedBy = internship.postedById ? await db.user.findUnique({ where: { id: internship.postedById } }) : null;

  const alreadyApplied = user?.id ? await db.application.findFirst({
    where: {
      candidateId: user.id,
      internshipId: internship.id
    }
  }) : null;

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 flex-1 space-y-6 text-left">
      <Link href="/internships" className="text-xs text-primary hover:underline flex items-center gap-1">
        <ArrowLeft className="w-4 h-4" /> Back to Internships
      </Link>
      
      <div className="glass-panel p-8 rounded-2xl border border-card-border space-y-6">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-500/10 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-full">
            Internship &middot; {internship.duration || "Short-term"}
          </span>
          <h1 className="text-2xl font-extrabold text-foreground mt-2">{internship.title}</h1>
          <p className="text-xs text-primary font-bold flex items-center gap-1.5 mt-2">
            <Building className="w-4 h-4" />
            <Link href={`/${organization?.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")}`} className="hover:underline">{organization?.name}</Link>
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 text-xs text-muted">
          <div className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-primary" /> {internship.location}</div>
          <div className="flex items-center gap-1.5"><IndianRupee className="w-4 h-4 text-primary" /> Stipend: ₹{internship.stipend?.toLocaleString("en-IN")}/month</div>
        </div>

        <div className="border-t border-card-border pt-4">
          <h3 className="font-bold text-foreground text-xs uppercase tracking-wider mb-2">Description</h3>
          <div className="text-xs text-muted leading-relaxed whitespace-pre-wrap prose prose-sm max-w-none dark:prose-invert" dangerouslySetInnerHTML={{ __html: internship.description }} />
        </div>

        {internship.requirements && (
          <div className="border-t border-card-border pt-4">
            <h3 className="font-bold text-foreground text-xs uppercase tracking-wider mb-2">Requirements</h3>
            <p className="text-xs text-muted leading-relaxed whitespace-pre-line">{internship.requirements}</p>
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
          <span className="text-xs text-muted">{user ? `Applying as ${user.email}` : "Login required to apply"}</span>
          {user ? (
            <ApplyButton opportunityId={internship.id} opportunityTitle={internship.title} opportunityType="INTERNSHIP" userEmail={user.email || undefined} label="Apply Now" alreadyApplied={!!alreadyApplied} />
          ) : (
            <Link href={`/auth/signin?callbackUrl=/internships/${internship.id}`} className="px-5 py-2 bg-primary hover:bg-primary-hover text-white text-xs font-semibold rounded-lg">Login to Apply</Link>
          )}
        </div>
      </div>
    </div>
  );
}
