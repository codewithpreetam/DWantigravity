import { db } from "@/lib/db";
import { auth } from "@/auth";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import {
  AlertCircle,
  ArrowLeft,
  ArrowUpRight,
  Briefcase,
  Building,
  Calendar,
  IndianRupee,
  MapPin,
} from "lucide-react";
import ApplyButton from "@/components/ApplyButton";
import ShareButton from "@/components/ShareButton";
import SaveButton from "@/components/SaveButton";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{
    q?: string;
    workMode?: string;
    employmentType?: string;
    location?: string;
    skill?: string;
    minExp?: string;
    minEdu?: string;
    salary?: string;
    salaryMin?: string;
    salaryMax?: string;
    sort?: string;
  }>;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function stripHtml(text: string): string {
  return text.replace(/<[^>]*>?/gm, "");
}

function prettifyType(type: string | null | undefined) {
  if (!type) return "Full Time";
  return type.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
}

function prettifyMode(mode: string | null | undefined) {
  if (!mode) return "On-site";
  return mode.replace(/_/g, "-").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params;
  
  let job = await db.job.findUnique({
    where: { slug: params.slug },
    include: { organization: true },
  });

  if (!job && params.slug.length >= 25 && params.slug.startsWith("c")) {
    job = await db.job.findUnique({
      where: { id: params.slug },
      include: { organization: true },
    });
  }

  if (!job) {
    return {
      title: "Job Not Found",
    };
  }

  const cleanDescription = stripHtml(job.description || "").substring(0, 160);
  return {
    title: `${job.title} at ${job.organization?.name || "NGO"}`,
    description: cleanDescription,
    openGraph: {
      title: `${job.title} at ${job.organization?.name || "NGO"}`,
      description: cleanDescription,
      url: `https://developmentwala.org/jobs/${job.slug}`,
    },
  };
}

export default async function JobDetailPage(props: Props) {
  const params = await props.params;
  const searchParams = await props.searchParams;
  const session = await auth();
  const user = session?.user;

  let selectedJob = await db.job.findUnique({
    where: { slug: params.slug },
    include: {
      organization: true,
      postedBy: true,
    },
  });

  if (!selectedJob) {
    if (params.slug.length >= 25 && params.slug.startsWith("c")) {
      selectedJob = await db.job.findUnique({
        where: { id: params.slug },
        include: {
          organization: true,
          postedBy: true,
        },
      });
      if (selectedJob) {
        redirect(`/jobs/${selectedJob.slug}`);
      }
    }
    return notFound();
  }

  const teamMembers = selectedJob.organizationId 
    ? await db.teamMember.findMany({
        where: { organizationId: selectedJob.organizationId },
        orderBy: { displayOrder: "asc" },
        take: 3
      })
    : [];

  const alreadyApplied = user?.id
    ? await db.application.findFirst({
        where: {
          candidateId: user.id,
          jobId: selectedJob.id,
        },
      })
    : null;

  const isSaved = user?.id
    ? !!(await db.savedJob.findFirst({
        where: {
          candidateId: user.id,
          jobId: selectedJob.id,
        },
      }))
    : false;

  const isPastDeadline = selectedJob.deadline 
    ? new Date() > new Date(new Date(selectedJob.deadline).setUTCHours(23, 59, 59, 999)) 
    : false;
  const isActive = selectedJob.isActive !== false; // Default to true if undefined
  const isClosed = isPastDeadline || !isActive;

  const backParams = new URLSearchParams();
  const keys: Array<keyof Awaited<Props["searchParams"]>> = [
    "q",
    "workMode",
    "employmentType",
    "location",
    "skill",
    "minExp",
    "minEdu",
    "salary",
    "salaryMin",
    "salaryMax",
    "sort",
  ];
  for (const key of keys) {
    const value = searchParams[key];
    if (value) backParams.set(key, value);
  }
  const backHref = backParams.toString() ? `/jobs?${backParams.toString()}` : "/jobs";

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 sm:py-12 flex-1 space-y-6 text-left">
      <Link href={backHref} className="text-xs text-primary hover:underline flex items-center gap-1">
        <ArrowLeft className="w-4 h-4" /> Back to Jobs
      </Link>

      <div className="glass-panel p-5 sm:p-8 rounded-2xl border border-card-border space-y-6">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "JobPosting",
              title: selectedJob.title,
              description: stripHtml(selectedJob.description || ""),
              datePosted: selectedJob.createdAt,
              employmentType: selectedJob.employmentType || "FULL_TIME",
              directApply: true,
              hiringOrganization: {
                "@type": "Organization",
                name: selectedJob.organization?.name,
                logo: selectedJob.organization?.logo || "https://developmentwala.org/logo.png",
                sameAs: selectedJob.organization?.website || "https://developmentwala.org",
              },
              jobLocation: {
                "@type": "Place",
                address: {
                  "@type": "PostalAddress",
                  addressLocality: selectedJob.isRemote ? "Remote / India" : selectedJob.location,
                  addressRegion: "India",
                  addressCountry: "IN",
                },
              },
              baseSalary:
                selectedJob.salaryMin || selectedJob.salaryMax
                  ? {
                      "@type": "MonetaryAmount",
                      currency: "INR",
                      value: {
                        "@type": "QuantitativeValue",
                        minValue: selectedJob.salaryMin || undefined,
                        maxValue: selectedJob.salaryMax || undefined,
                        unitText: "YEAR",
                      },
                    }
                  : undefined,
            }),
          }}
        />

        <div>
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-full">
              {prettifyType(selectedJob.employmentType)} · {prettifyMode(selectedJob.workMode)}
            </span>
            <span className="text-xs text-muted flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              Posted {new Date(selectedJob.createdAt).toLocaleDateString("en-GB")}
            </span>
          </div>

          <h1 className="text-2xl font-extrabold text-foreground mt-1">{selectedJob.title}</h1>
          <div className="flex items-center gap-2 mt-2">
            {selectedJob.organization?.logo ? (
              <img src={selectedJob.organization.logo} alt={selectedJob.organization.name || ""} className="w-8 h-8 object-contain rounded border border-card-border bg-white p-0.5 shrink-0" />
            ) : (
              <Building className="w-4 h-4 text-primary shrink-0" />
            )}
            {selectedJob.organization ? (
              <Link href={`/${slugify(selectedJob.organization.name)}`} className="text-xs text-primary font-bold hover:underline">
                {selectedJob.organization.name}
              </Link>
            ) : (
              <span className="text-xs text-primary font-bold">NGO</span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-muted">
          <div className="flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-primary" />
            {selectedJob.workMode === "REMOTE" ? "Fully Remote" : selectedJob.location}
          </div>
          <div className="flex items-center gap-1.5">
            <IndianRupee className="w-4 h-4 text-primary" />
            {selectedJob.salaryMin || selectedJob.salaryMax
              ? `₹${selectedJob.salaryMin?.toLocaleString("en-IN") || "0"} - ₹${selectedJob.salaryMax?.toLocaleString("en-IN") || "0"} / year`
              : "Salary not specified"}
          </div>
          <div className="flex items-center gap-1.5">
            <Briefcase className="w-4 h-4 text-primary" />
            {prettifyType(selectedJob.employmentType)}
          </div>
        </div>

        {selectedJob.requiredSkills?.length > 0 && (
          <div className="border-t border-card-border pt-4">
            <h3 className="font-bold text-foreground text-xs uppercase tracking-wider mb-2">Required Skills</h3>
            <div className="flex flex-wrap gap-2">
              {selectedJob.requiredSkills.map((skill: string) => (
                <span key={skill} className="px-2 py-0.5 bg-primary/10 text-primary text-[10px] font-semibold rounded-full">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="border-t border-card-border pt-4">
          <h3 className="font-bold text-foreground text-xs uppercase tracking-wider mb-2">Job Description</h3>
          <div
            className="text-xs text-muted leading-relaxed whitespace-pre-wrap prose prose-sm max-w-none dark:prose-invert"
            dangerouslySetInnerHTML={{ __html: selectedJob.description }}
          />
        </div>

        {selectedJob.requirements && (
          <div className="border-t border-card-border pt-4">
            <h3 className="font-bold text-foreground text-xs uppercase tracking-wider mb-2">Requirements</h3>
            <p className="text-xs text-muted leading-relaxed whitespace-pre-line">{selectedJob.requirements}</p>
          </div>
        )}

        {teamMembers.length > 0 && (
          <div className="border-t border-card-border pt-5 space-y-3">
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-primary">Meet the Recruitment Team</h4>
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
            {selectedJob.organization && (
              <Link
                href={`/${slugify(selectedJob.organization.name)}`}
                className="text-[9px] font-bold text-primary hover:underline block mt-2"
              >
                View Full Team Directory &rarr;
              </Link>
            )}
          </div>
        )}

        <div className="border-t border-card-border pt-6 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
          <span className="text-xs text-muted break-all">
            {user ? `Applying as ${user.email}` : "Login required to apply"}
          </span>
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto items-center">
            <SaveButton
              opportunityId={selectedJob.id}
              opportunityType="JOB"
              initialSaved={isSaved}
              isLoggedIn={!!user}
              userRole={user?.role}
            />
            <ShareButton label="Share Job" />
            {isClosed ? (
              <div className="px-6 py-2.5 bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all w-full sm:w-auto">
                <AlertCircle className="w-4 h-4 text-red-500" />
                <span>Applications Closed</span>
              </div>
            ) : user ? (
              <ApplyButton
                opportunityId={selectedJob.id}
                opportunityTitle={selectedJob.title}
                opportunityType="JOB"
                userEmail={user.email || undefined}
                label="Apply for this Job"
                alreadyApplied={!!alreadyApplied}
              />
            ) : (
              <Link
                href={`/auth/signin?callbackUrl=/jobs/${selectedJob.slug}`}
                className="px-6 py-2.5 bg-primary hover:bg-primary-hover text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-1 transition-all w-full sm:w-auto"
              >
                <span>Login to Apply</span>
                <ArrowUpRight className="w-4 h-4" />
              </Link>
            )}
          </div>
        </div>
      </div>

      {selectedJob.organization && (
        <div className="glass-panel p-5 sm:p-8 rounded-2xl border border-card-border">
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted mb-4">About the Organization</h3>
          <div className="flex items-start gap-4">
            {selectedJob.organization.logo ? (
              <img src={selectedJob.organization.logo} alt={selectedJob.organization.name || ""} className="w-14 h-14 object-contain rounded-xl border border-card-border bg-white p-1 shrink-0" />
            ) : (
              <div className="w-14 h-14 rounded-xl border border-card-border bg-primary/10 text-primary flex items-center justify-center font-bold text-xl shrink-0">
                {selectedJob.organization.name?.charAt(0) || "?"}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h4 className="font-bold text-foreground text-sm">{selectedJob.organization.name}</h4>
              {selectedJob.organization.orgType && <span className="text-[10px] text-muted font-semibold">{selectedJob.organization.orgType}</span>}
              {selectedJob.organization.website && (
                <a href={selectedJob.organization.website} target="_blank" rel="noreferrer" className="text-[11px] text-primary hover:underline block mt-1 truncate">{selectedJob.organization.website}</a>
              )}
              {selectedJob.organization.description && (
                <p className="text-xs text-muted leading-relaxed mt-2">{selectedJob.organization.description}</p>
              )}
              <Link
                href={`/${slugify(selectedJob.organization.name)}`}
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
