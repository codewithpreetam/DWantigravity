import { db } from "@/lib/db";
import { auth } from "@/auth";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { 
  User, Users, PlusCircle, Building, CreditCard, Mail, FileText, 
  CheckCircle, ShieldCheck, Briefcase, Star, Clock, Calendar, 
  BarChart3, Settings, AlertCircle, Phone, Globe, Trash2, 
  ArrowUpRight, Search, SlidersHorizontal, UserPlus, Eye, LayoutDashboard,
  Bookmark, Share2, Percent, Edit3, Lock, Bell, Building2, HelpCircle
} from "lucide-react";
import { DashboardMobileNav } from "@/components/DashboardMobileNav";
import OpportunityPostForm from "@/components/OpportunityPostForm";
import ATSFilterSelect from "@/components/ATSFilterSelect";
import SupportChat from "@/components/SupportChat";
import ATSView from "@/components/ats/ATSView";
import { 
  getMessagesAction, 
  getNotificationsAction, 
  markNotificationsReadAction 
} from "@/app/actions/support";
import { 
  updateRecruiterProfileAction, 
  updateOrgProfileRichAction, 
  inviteRecruiterAction, 
  removeRecruiterMemberAction, 
  scheduleInterviewAction, 
  updateOpportunityStatusAction,
  updateApplicationEvaluationAction 
} from "@/app/actions/employer";
import { updateApplicationStage } from "@/app/actions/ats";
import { ApplicationStage, OrgStatus } from "@prisma/client";
import { calculateCompatibility } from "@/lib/matching";

interface PageProps {
  searchParams: Promise<{
    tab?: string;
    appId?: string;
    filterOppId?: string;
    q?: string;
    stage?: string;
    editId?: string;
  }>;
}

export const revalidate = 0;

export default async function EmployerDashboardPage(props: PageProps) {
  const searchParams = await props.searchParams;
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "EMPLOYER") {
    return redirect("/auth/signin?callbackUrl=/dashboard/employer");
  }

  // Load current recruiter details
  const recruiter = await db.user.findUnique({
    where: { id: session.user.id }
  });

  if (!recruiter || !recruiter.organizationId) {
    return (
      <div className="max-w-md mx-auto my-20 glass-panel p-8 text-center rounded-xl space-y-4">
        <Building className="w-12 h-12 text-primary mx-auto" />
        <h2 className="text-xl font-bold text-foreground">Organization Required</h2>
        <p className="text-xs text-muted">You do not have an organization registered. Please re-register or contact support.</p>
        <Link href="/auth/signup?role=EMPLOYER" className="inline-block px-4 py-2 bg-primary text-white rounded text-xs font-semibold">
          Re-Register Org
        </Link>
      </div>
    );
  }

  // Load organization
  const org = await db.organization.findUnique({
    where: { id: recruiter.organizationId }
  });

  if (!org) {
    return notFound();
  }

  const tab = searchParams.tab || "overview";
  const selectedAppId = searchParams.appId;
  const filterOppId = searchParams.filterOppId || "all";
  const searchQ = searchParams.q || "";

  // Fetch opportunities posted by this organization
  const rawJobs = await db.job.findMany({ where: { organizationId: org.id } });
  const rawInternships = await db.internship.findMany({ where: { organizationId: org.id } });
  const rawFellowships = await db.fellowship.findMany({ where: { organizationId: org.id } });
  const rawScholarships = await db.scholarship.findMany({ where: { organizationId: org.id } });
  const rawGrants = await db.grant.findMany({ where: { organizationId: org.id } });
  const rawConsultancies = await db.consultancy.findMany({ where: { organizationId: org.id } });
  const rawVolunteers = await db.volunteer.findMany({ where: { organizationId: org.id } });
  const rawEvents = await db.event.findMany({ where: { organizerId: org.id } });

  // Map opportunities into uniform structure
  const opportunities = [
    ...rawJobs.map((o: any) => ({ ...o, type: "JOB" })),
    ...rawInternships.map((o: any) => ({ ...o, type: "INTERNSHIP" })),
    ...rawFellowships.map((o: any) => ({ ...o, type: "FELLOWSHIP" })),
    ...rawScholarships.map((o: any) => ({ ...o, type: "SCHOLARSHIP" })),
    ...rawGrants.map((o: any) => ({ ...o, type: "GRANT" })),
    ...rawConsultancies.map((o: any) => ({ ...o, type: "CONSULTANCY" })),
    ...rawVolunteers.map((o: any) => ({ ...o, type: "VOLUNTEER" })),
    ...rawEvents.map((o: any) => ({ ...o, type: "EVENT", organizationId: o.organizerId }))
  ];

  const editId = searchParams.editId;
  const editOpp = editId ? opportunities.find((o: any) => o.id === editId) || null : null;

  const slugifyText = (text: string) => text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  const getPublicUrl = (opp: any) => {
    if (opp.type === "JOB") {
      return `/jobs/${slugifyText(org.name)}/${slugifyText(`${opp.title}-${opp.workMode === "REMOTE" ? "remote" : opp.location}`)}`;
    }
    const typePathMap: Record<string, string> = {
      INTERNSHIP: "internships",
      FELLOWSHIP: "fellowships",
      SCHOLARSHIP: "scholarships",
      GRANT: "grants",
      CONSULTANCY: "consultancies",
      VOLUNTEER: "volunteer",
      EVENT: "events"
    };
    return `/${typePathMap[opp.type] || "jobs"}/${opp.id}`;
  };

  // Fetch all recruiters associated with this organization
  const recruiters = await db.user.findMany({
    where: { organizationId: org.id, role: "EMPLOYER" }
  });

  // Fetch applications for all active jobs / opportunities
  const allOppIds = opportunities.map((o: any) => o.id);
  const applications = await db.application.findMany({
    where: {
      OR: [
        { jobId: { in: allOppIds } },
        { internshipId: { in: allOppIds } },
        { fellowshipId: { in: allOppIds } },
        { scholarshipId: { in: allOppIds } },
        { grantId: { in: allOppIds } },
        { consultancyId: { in: allOppIds } },
        { volunteerId: { in: allOppIds } },
        { eventId: { in: allOppIds } },
      ]
    },
    include: {
      candidate: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          profilePhoto: true,
          shortBio: true,
          bio: true,
          location: true,
          skills: true,
          experienceYears: true,
          educationDegree: true,
          languages: true,
          resumeUrl: true,
          linkedin: true,
          jobTitle: true,
        }
      }
    },
    orderBy: { createdAt: "desc" },
  });

  // Filter applications based on Selected Opportunity
  let filteredApps = [...applications];
  if (filterOppId !== "all") {
    filteredApps = filteredApps.filter(app => 
      app.jobId === filterOppId || 
      app.internshipId === filterOppId || 
      app.fellowshipId === filterOppId ||
      app.scholarshipId === filterOppId ||
      app.grantId === filterOppId ||
      app.consultancyId === filterOppId ||
      app.volunteerId === filterOppId
    );
  }

  // Filter based on keyword query (candidate name or email)
  if (searchQ) {
    const qLower = searchQ.toLowerCase();
    filteredApps = filteredApps.filter((app: any) => 
      app.candidate?.name?.toLowerCase().includes(qLower) || 
      app.candidate?.email?.toLowerCase().includes(qLower) ||
      app.tags?.some((t: string) => t.toLowerCase().includes(qLower))
    );
  }

  const selectedApp = selectedAppId
    ? filteredApps.find((a: any) => a.id === selectedAppId)
    : filteredApps[0];

  // ATS Kanban Stages
  const stages = [
    { key: "NEW", label: "New Applications", color: "bg-blue-500/10 text-blue-600 dark:text-blue-400" },
    { key: "UNDER_REVIEW", label: "Under Review", color: "bg-amber-500/10 text-amber-600 dark:text-amber-400" },
    { key: "SHORTLISTED", label: "Shortlisted", color: "bg-purple-500/10 text-purple-600 dark:text-purple-400" },
    { key: "INTERVIEW_SCHEDULED", label: "Interview Scheduled", color: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400" },
    { key: "INTERVIEW_COMPLETED", label: "Interview Completed", color: "bg-sky-500/10 text-sky-600 dark:text-sky-400" },
    { key: "ASSESSMENT", label: "Assessment", color: "bg-pink-500/10 text-pink-600 dark:text-pink-400" },
    { key: "OFFER_SENT", label: "Offer Sent", color: "bg-teal-500/10 text-teal-600 dark:text-teal-400" },
    { key: "HIRED", label: "Hired", color: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" },
    { key: "REJECTED", label: "Rejected", color: "bg-red-500/10 text-red-500" }
  ];

  // Opportunity Views & Conversions Statistics
  // Mocks views, saves, shares and calculate conversion metrics
  const getOpportunityStats = (oppId: string) => {
    // Deterministic mock calculations based on opportunity ID
    const seed = oppId.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const views = (seed % 150) + 120;
    const saves = (seed % 40) + 15;
    const shares = (seed % 15) + 5;
    const appsCount = applications.filter((a: any) => 
      a.jobId === oppId || a.internshipId === oppId || 
      a.fellowshipId === oppId || a.scholarshipId === oppId ||
      a.grantId === oppId || a.consultancyId === oppId || 
      a.volunteerId === oppId
    ).length;
    const conversionRate = views > 0 ? ((appsCount / views) * 100).toFixed(1) : "0.0";
    return { views, saves, shares, applications: appsCount, conversionRate };
  };

  // Load support & messages
  const initialMessages = await getMessagesAction(session.user.id);
  const supportNotifications = await getNotificationsAction(session.user.id);

  if (tab === "support") {
    await markNotificationsReadAction(session.user.id, true);
  }

  const handleMarkRead = async () => {
    "use server";
    if (session?.user?.id) {
      await markNotificationsReadAction(session.user.id);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 flex flex-col">
      {/* Workspace Header Banner */}
      <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-card-border pb-6">
        <div className="flex items-start gap-4 min-w-0 flex-1">
          {org.logo ? (
            <img src={org.logo} alt="" className="w-14 h-14 rounded-xl object-contain border border-card-border p-1 bg-white shrink-0" />
          ) : (
            <div className="w-14 h-14 bg-primary/10 text-primary flex items-center justify-center font-bold rounded-xl text-xl shrink-0">
              {org.name.substring(0, 1)}
            </div>
          )}
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl font-extrabold text-foreground tracking-tight flex flex-wrap items-center gap-2">
              <span className="break-words">{org.name} Workspace</span>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/20 shrink-0">
                Active ATS
              </span>
            </h1>
            <p className="text-xs text-muted mt-0.5 truncate">Recruiter Dashboard &middot; Welcome, <strong className="text-foreground">{recruiter.name || recruiter.email}</strong></p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 w-full md:w-auto">
          <Link 
            href={`/${org.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")}`} 
            target="_blank" 
            className="flex items-center justify-center w-full md:w-auto gap-1 text-xs text-muted hover:text-foreground font-semibold px-3 py-1.5 rounded-lg border border-card-border glass-panel transition-all"
          >
            <span>View Public NGO Profile</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Mobile navigation (Hamburger Drawer) */}
      <DashboardMobileNav 
        tabs={[
          { id: "overview", label: "Overview", icon: <Building2 className="w-4 h-4 shrink-0" /> },
          { id: "ats", label: "ATS Pipeline", icon: <Users className="w-4 h-4 shrink-0" /> },
          { id: "jobs-manager", label: "Opportunities", icon: <FileText className="w-4 h-4 shrink-0" /> },
          { id: "analytics", label: "Analytics", icon: <Search className="w-4 h-4 shrink-0" /> },
          { id: "team", label: "Team Directory", icon: <Users className="w-4 h-4 shrink-0" /> },
          { id: "org", label: "Organization Profile", icon: <Building2 className="w-4 h-4 shrink-0" /> },
          { id: "recruiter-profile", label: "Recruiter Profile", icon: <User className="w-4 h-4 shrink-0" /> },
          { id: "billing", label: "Plan & Billing", icon: <CreditCard className="w-4 h-4 shrink-0" /> },
          { id: "settings", label: "Account Settings", icon: <Settings className="w-4 h-4 shrink-0" /> },
          { id: "support", label: "Help & Support", icon: <HelpCircle className="w-4 h-4 shrink-0" /> },
        ]}
        basePath="/dashboard/employer"
        title="Employer Workspace"
      />

      {/* Grid Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start flex-1">
        {/* Navigation Sidebar — desktop only */}
        <div className="hidden lg:block lg:col-span-3 space-y-1.5 sticky top-24 z-10">
          {[
            { id: "overview", label: "Workspace Overview", icon: LayoutDashboard },
            { id: "ats", label: "ATS Pipeline Board", icon: Users },
            { id: "new-job", label: "Post Opportunity", icon: PlusCircle },
            { id: "jobs-manager", label: "Opportunity Manager", icon: Briefcase },
            { id: "analytics", label: "Analytics Workspace", icon: BarChart3 },
            { id: "team", label: "Team Collaboration", icon: UserPlus },
            { id: "org", label: "Organization Details", icon: Building },
            { id: "recruiter-profile", label: "Recruiter Profile", icon: User },
            { id: "settings", label: "Settings", icon: Settings },
            { id: "billing", label: "Billing & Plans", icon: CreditCard },
            { id: "support", label: "Admin Support Desk", icon: Mail },
          ].map((item) => {
            const Icon = item.icon;
            const isSelected = tab === item.id;
            return (
              <a
                key={item.id}
                href={`/dashboard/employer?tab=${item.id}`}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold border transition-all ${
                  isSelected 
                    ? "bg-primary text-white border-primary shadow-lg shadow-primary/25" 
                    : "glass-panel text-muted hover:text-foreground border-transparent"
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </a>
            );
          })}
        </div>

        {/* Dashboard Panels Container */}
        <div className="lg:col-span-9 glass-panel p-6 rounded-2xl min-h-[60vh] border border-card-border flex flex-col">
          
          {/* TAB 0: WORKSPACE OVERVIEW */}
          {tab === "overview" && (
            <div className="space-y-6 text-xs text-left">
              <div>
                <h2 className="text-lg font-bold text-foreground">Workspace Overview</h2>
                <p className="text-[11px] text-muted">A summary of your hiring status, admin notices, active notifications, and metrics.</p>
              </div>

              {/* Grid cards for main stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="glass-panel p-4 rounded-xl border border-card-border">
                  <p className="text-muted text-[10px] font-semibold uppercase tracking-wider">Active Roles</p>
                  <p className="text-2xl font-black text-foreground mt-1">{opportunities.filter((o: any) => o.isActive).length}</p>
                  <Link href="/dashboard/employer?tab=jobs-manager" className="text-[9px] text-primary font-bold hover:underline block mt-1">Manage Roles &rarr;</Link>
                </div>
                <div className="glass-panel p-4 rounded-xl border border-card-border">
                  <p className="text-muted text-[10px] font-semibold uppercase tracking-wider">Applications</p>
                  <p className="text-2xl font-black text-foreground mt-1">{applications.length}</p>
                  <Link href="/dashboard/employer?tab=ats" className="text-[9px] text-primary font-bold hover:underline block mt-1">Open Board &rarr;</Link>
                </div>
                <div className="glass-panel p-4 rounded-xl border border-card-border">
                  <p className="text-muted text-[10px] font-semibold uppercase tracking-wider">Team Recruiters</p>
                  <p className="text-2xl font-black text-foreground mt-1">{recruiters.length}</p>
                  <Link href="/dashboard/employer?tab=team" className="text-[9px] text-primary font-bold hover:underline block mt-1">View Team &rarr;</Link>
                </div>
                <div className="glass-panel p-4 rounded-xl border border-card-border">
                  <p className="text-muted text-[10px] font-semibold uppercase tracking-wider">Verification Status</p>
                  <div className="flex items-center gap-1.5 mt-2">
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                      org.status === OrgStatus.APPROVED 
                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                        : "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                    }`}>
                      {org.status}
                    </span>
                  </div>
                  <span className="text-[9px] text-muted block mt-1.5">Owner: {recruiter.roleInOrg === "Owner" ? "You" : "Admin"}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                
                {/* Left side: Activity Feed & Notifications */}
                <div className="md:col-span-8 space-y-6">
                  
                  {/* Notifications of applications */}
                  <div className="glass-panel p-5 rounded-xl border border-card-border space-y-4">
                    <h3 className="font-bold text-foreground text-xs flex items-center gap-1.5">
                      <Bell className="w-4.5 h-4.5 text-primary" />
                      <span>Recent Application Notifications</span>
                    </h3>
                    
                    {applications.length === 0 ? (
                      <p className="text-xs text-muted italic py-4">No applications received yet.</p>
                    ) : (
                      <div className="divide-y divide-card-border">
                        {applications.slice(0, 5).map((app: any) => {
                          const matchingOpp = opportunities.find((o: any) => o.id === app.jobId || o.id === app.internshipId || o.id === app.fellowshipId || o.id === app.scholarshipId || o.id === app.grantId || o.id === app.consultancyId || o.id === app.volunteerId || o.id === app.eventId);
                          return (
                            <div key={app.id} className="py-3 flex justify-between items-start gap-4 hover:bg-primary/5 transition-colors px-1 rounded-lg">
                              <div>
                                <p className="font-bold text-foreground">
                                  {app.candidate?.name || app.candidate?.email}
                                </p>
                                <p className="text-[10px] text-muted mt-0.5">
                                  Applied for <strong className="text-foreground">{matchingOpp?.title || "Opportunity"}</strong>
                                </p>
                                <span className="text-[8px] bg-primary/10 text-primary border border-primary/20 px-1.5 py-0.5 rounded font-bold mt-1 inline-block uppercase">
                                  {app.stage.replace("_", " ")}
                                </span>
                              </div>
                              <div className="text-right flex flex-col items-end gap-1">
                                <span className="text-[9px] text-muted">{new Date(app.createdAt).toLocaleDateString()}</span>
                                <Link 
                                  href={`/dashboard/employer?tab=ats&appId=${app.id}`}
                                  className="text-[9px] font-bold text-primary hover:underline"
                                >
                                  Assess Candidate &rarr;
                                </Link>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Quick Analytics trend bar charts */}
                  <div className="glass-panel p-5 rounded-xl border border-card-border space-y-4">
                    <h3 className="font-bold text-foreground text-xs flex items-center gap-1.5">
                      <BarChart3 className="w-4.5 h-4.5 text-primary" />
                      <span>Pipeline Funnel Analytics</span>
                    </h3>
                    <div className="space-y-3 pt-1">
                      {[
                        { label: "New Candidates", count: applications.filter((a: any) => a.stage === "NEW" || a.stage === "APPLIED").length, percent: 100 },
                        { label: "Under Assessment", count: applications.filter((a: any) => ["UNDER_REVIEW", "SCREENING", "ASSESSMENT"].includes(a.stage)).length, percent: applications.length > 0 ? Math.round((applications.filter((a: any) => ["UNDER_REVIEW", "SCREENING", "ASSESSMENT"].includes(a.stage)).length / applications.length) * 100) : 0 },
                        { label: "Interviews Booked", count: applications.filter((a: any) => ["INTERVIEW_SCHEDULED", "INTERVIEW_COMPLETED", "INTERVIEW"].includes(a.stage)).length, percent: applications.length > 0 ? Math.round((applications.filter((a: any) => ["INTERVIEW_SCHEDULED", "INTERVIEW_COMPLETED", "INTERVIEW"].includes(a.stage)).length / applications.length) * 100) : 0 },
                        { label: "Offers/Hired", count: applications.filter((a: any) => ["OFFER_SENT", "OFFER", "HIRED"].includes(a.stage)).length, percent: applications.length > 0 ? Math.round((applications.filter((a: any) => ["OFFER_SENT", "OFFER", "HIRED"].includes(a.stage)).length / applications.length) * 100) : 0 }
                      ].map((bar: any, idx: number) => (
                        <div key={idx} className="space-y-1">
                          <div className="flex justify-between text-[10px] font-bold">
                            <span>{bar.label}</span>
                            <span>{bar.count} ({bar.percent}%)</span>
                          </div>
                          <div className="w-full bg-neutral-200 dark:bg-neutral-800 h-1.5 rounded-full overflow-hidden">
                            <div className="bg-primary h-full rounded-full" style={{ width: `${bar.percent || 1}%` }}></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>

                {/* Right side: Admin announcements / notices */}
                <div className="md:col-span-4 space-y-6">
                  
                  {/* Messages from Admin */}
                  <div className="glass-panel p-5 rounded-xl border border-card-border space-y-4">
                    <h3 className="font-bold text-foreground text-xs flex items-center gap-1.5">
                      <ShieldCheck className="w-4.5 h-4.5 text-primary" />
                      <span>Admin Board Notice</span>
                    </h3>

                    <div className="space-y-3">
                      {/* Notice 1 */}
                      <div className="p-3 rounded-lg border border-primary/20 bg-primary/5 text-left text-[10px] space-y-1.5">
                        <div className="flex items-center gap-1 text-primary font-bold">
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>NGO Profile Verification</span>
                        </div>
                        <p className="text-muted leading-relaxed">
                          {org.status === OrgStatus.APPROVED 
                            ? `Verification checks complete. Your NGO "${org.name}" is verified. Listings are automatically displayed in the public NGO Directory.`
                            : "Your NGO profile registration has been submitted and is currently in the verification queue. Admin will complete reviews within 24 hours."
                          }
                        </p>
                        <span className="text-[8px] text-muted block text-right">System Admin &middot; July 2026</span>
                      </div>

                      {/* Notice 2 */}
                      <div className="p-3 rounded-lg border border-card-border bg-white/20 dark:bg-zinc-950/20 text-left text-[10px] space-y-1.5">
                        <div className="flex items-center gap-1 text-foreground font-bold">
                          <AlertCircle className="w-3.5 h-3.5 text-muted" />
                          <span>Google for Jobs Optimization</span>
                        </div>
                        <p className="text-muted leading-relaxed">
                          To make your NGO jobs discoverable on Google Jobs panels, always add physical locations and select accurate Work Modes (On-site vs Hybrid) when writing listings.
                        </p>
                        <span className="text-[8px] text-muted block text-right">Dev Team &middot; June 2026</span>
                      </div>
                    </div>
                  </div>

                  {/* Active recruitment squad summary */}
                  <div className="glass-panel p-5 rounded-xl border border-card-border space-y-3">
                    <h3 className="font-bold text-foreground text-xs">Hiring Squad</h3>
                    <div className="space-y-2">
                      {recruiters.slice(0, 3).map((rec: any) => (
                        <div key={rec.id} className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-[9px] uppercase">
                            {rec.name?.substring(0, 1)}
                          </div>
                          <div>
                            <p className="font-bold text-foreground text-[10px] leading-tight">{rec.name}</p>
                            <p className="text-[8px] text-muted">{rec.roleInOrg || "Recruiter"}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>

              </div>
            </div>
          )}


          {/* TAB 1: ATS THREE-PANE VIEW */}
          {tab === "ats" && (
            <div className="flex-1 flex flex-col -mx-4 sm:-mx-6 lg:-mx-8">
              <ATSView
                opportunities={opportunities}
                applications={applications as any[]}
              />
            </div>
          )}



          {/* TAB 2: POST OPPORTUNITY */}
          {tab === "new-job" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-bold text-foreground">Post a New Opportunity</h2>
                <p className="text-xs text-muted mt-0.5">Select a category and list your social impact career or aid program.</p>
              </div>
              <OpportunityPostForm organizationId={org.id} />
            </div>
          )}

          {/* TAB 3: OPPORTUNITY MANAGER */}
          {tab === "jobs-manager" && (
            <div className="space-y-6 text-xs text-left">
              <div>
                <h2 className="text-lg font-bold text-foreground">Opportunity Manager</h2>
                <p className="text-[11px] text-muted">Monitor view tracking, applications count, and pause or close listings.</p>
              </div>

              {editOpp ? (
                <OpportunityPostForm 
                  organizationId={org.id} 
                  editOpp={editOpp} 
                  cancelUrl="/dashboard/employer?tab=jobs-manager" 
                />
              ) : opportunities.length === 0 ? (
                <div className="text-center py-16 text-muted">
                  <Briefcase className="w-12 h-12 mx-auto mb-3" />
                  <p>You haven't posted any opportunities yet.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {opportunities.map((opp) => {
                    const stats = getOpportunityStats(opp.id);
                    return (
                      <div key={opp.id} className="p-4 rounded-xl border border-card-border bg-white/30 dark:bg-zinc-950/20 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:border-neutral-300 dark:hover:border-neutral-800 transition-all">
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="font-extrabold text-sm text-foreground">
                              <a href={getPublicUrl(opp)} target="_blank" rel="noopener noreferrer" className="hover:text-primary hover:underline transition-colors inline-flex items-center gap-1">
                                <span className="line-clamp-2 break-words">{opp.title}</span>
                                <ArrowUpRight className="w-3.5 h-3.5 text-muted shrink-0" />
                              </a>
                            </h3>
                            <span className="text-[8px] font-bold uppercase tracking-wider bg-primary/10 text-primary px-1.5 py-0.5 rounded">
                              {opp.type}
                            </span>
                            <span className={`text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                              opp.isActive 
                                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" 
                                : "bg-red-500/10 text-red-500"
                            }`}>
                              {opp.isActive ? "Active" : "Draft"}
                            </span>
                          </div>
                          <p className="text-[10px] text-muted flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" /> Created {new Date(opp.createdAt).toLocaleDateString()}
                          </p>
                        </div>

                        {/* Statistics Grid */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 text-center border-y sm:border-y-0 sm:border-l sm:border-r border-card-border py-2 sm:py-1 px-0 sm:px-4 w-full sm:w-auto">
                          <div className="space-y-0.5">
                            <p className="text-[9px] text-muted font-semibold flex items-center gap-0.5"><Eye className="w-3 h-3 text-primary" /> Views</p>
                            <p className="font-bold text-foreground text-xs">{stats.views}</p>
                          </div>
                          <div className="space-y-0.5">
                            <p className="text-[9px] text-muted font-semibold flex items-center gap-0.5"><Bookmark className="w-3 h-3 text-primary" /> Saves</p>
                            <p className="font-bold text-foreground text-xs">{stats.saves}</p>
                          </div>
                          <div className="space-y-0.5">
                            <p className="text-[9px] text-muted font-semibold flex items-center gap-0.5"><Users className="w-3 h-3 text-primary" /> Apps</p>
                            <p className="font-bold text-foreground text-xs">{stats.applications}</p>
                          </div>
                          <div className="space-y-0.5">
                            <p className="text-[9px] text-muted font-semibold flex items-center gap-0.5"><Percent className="w-3 h-3 text-primary" /> Conv.</p>
                            <p className="font-bold text-foreground text-xs">{stats.conversionRate}%</p>
                          </div>
                        </div>

                        {/* Actions bar */}
                        <div className="flex flex-wrap items-center gap-2 self-start md:self-auto w-full sm:w-auto mt-2 sm:mt-0">
                          <Link 
                            href={`/dashboard/employer?tab=jobs-manager&editId=${opp.id}`}
                            className="px-2.5 py-1 rounded border border-card-border hover:bg-white/10 text-[10px] font-semibold text-foreground cursor-pointer"
                          >
                            Edit
                          </Link>

                          <a 
                            href={getPublicUrl(opp)} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="px-2.5 py-1 rounded border border-primary text-primary hover:bg-primary/10 text-[10px] font-semibold flex items-center gap-0.5 shrink-0"
                          >
                            <span>View Public</span>
                            <ArrowUpRight className="w-3 h-3 shrink-0" />
                          </a>

                          <form action={async () => {
                            "use server";
                            await updateOpportunityStatusAction(opp.id, opp.type, opp.isActive ? "pause" : "publish");
                          }}>
                            <button 
                              type="submit" 
                              className="px-2.5 py-1 rounded border border-card-border hover:bg-white/10 text-[10px] font-semibold text-foreground cursor-pointer"
                            >
                              {opp.isActive ? "Pause" : "Publish"}
                            </button>
                          </form>

                          <form action={async () => {
                            "use server";
                            await updateOpportunityStatusAction(opp.id, opp.type, "delete");
                          }}>
                            <button 
                              type="submit" 
                              className="p-1 px-1.5 rounded border border-red-500/20 text-red-500 hover:bg-red-500/10 cursor-pointer"
                              title="Delete permanently"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </form>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: ANALYTICS WORKSPACE */}
          {tab === "analytics" && (
            <div className="space-y-6 text-xs text-left">
              <div>
                <h2 className="text-lg font-bold text-foreground">Employer Analytics Workspace</h2>
                <p className="text-[11px] text-muted">Review hiring conversions, source metrics, and pipeline funnel statistics.</p>
              </div>

              {/* Grid cards */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div className="glass-panel p-4 rounded-xl border border-card-border">
                  <p className="text-muted text-[10px] font-semibold uppercase tracking-wider">Profile Views</p>
                  <p className="text-2xl font-black text-foreground mt-1">456</p>
                  <p className="text-[9px] text-emerald-600 font-bold mt-1">&uarr; 12% views vs last month</p>
                </div>
                <div className="glass-panel p-4 rounded-xl border border-card-border">
                  <p className="text-muted text-[10px] font-semibold uppercase tracking-wider">Active Listings</p>
                  <p className="text-2xl font-black text-foreground mt-1">{opportunities.filter(o => o.isActive).length}</p>
                  <p className="text-[9px] text-muted mt-1">Across {new Set(opportunities.map(o => o.type)).size} categories</p>
                </div>
                <div className="glass-panel p-4 rounded-xl border border-card-border">
                  <p className="text-muted text-[10px] font-semibold uppercase tracking-wider">Application conversion</p>
                  <p className="text-2xl font-black text-foreground mt-1">
                    {applications.length > 0 ? ((applications.length / 500) * 100).toFixed(1) : "0.0"}%
                  </p>
                  <p className="text-[9px] text-emerald-600 font-bold mt-1">&uarr; 2.1% conversion efficiency</p>
                </div>
              </div>

              {/* Custom styled HTML Charts */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Funnel diagram */}
                <div className="glass-panel p-5 rounded-xl border border-card-border space-y-4">
                  <h3 className="font-bold text-foreground text-xs">ATS Recruitment Funnel</h3>
                  <div className="space-y-2">
                    {[
                      { label: "New Apps", count: applications.length, width: "w-full", bg: "bg-blue-500" },
                      { label: "Under Review", count: applications.filter((a: any) => a.stage === "UNDER_REVIEW" || a.stage === "SCREENING").length, width: "w-3/4", bg: "bg-amber-500" },
                      { label: "Shortlisted", count: applications.filter((a: any) => a.stage === "SHORTLISTED").length, width: "w-1/2", bg: "bg-purple-500" },
                      { label: "Interviews", count: applications.filter((a: any) => a.stage === "INTERVIEW_SCHEDULED" || a.stage === "INTERVIEW").length, width: "w-1/3", bg: "bg-indigo-500" },
                      { label: "Hired", count: applications.filter((a: any) => a.stage === "HIRED").length, width: "w-1/12", bg: "bg-emerald-500" }
                    ].map((step: any, idx: number) => (
                      <div key={idx} className="space-y-1">
                        <div className="flex justify-between text-[10px] font-bold">
                          <span>{step.label}</span>
                          <span>{step.count} candidates</span>
                        </div>
                        <div className="w-full bg-neutral-200 dark:bg-neutral-800 h-2 rounded-full overflow-hidden">
                          <div className={`${step.bg} h-full rounded-full ${step.width}`}></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Categories share */}
                <div className="glass-panel p-5 rounded-xl border border-card-border space-y-4">
                  <h3 className="font-bold text-foreground text-xs">Applications by Category</h3>
                  <div className="space-y-3">
                    {[
                      { label: "Jobs", count: applications.filter((a: any) => a.jobId).length, percent: 65, color: "text-emerald-500" },
                      { label: "Internships", count: applications.filter((a: any) => a.internshipId).length, percent: 20, color: "text-blue-500" },
                      { label: "Fellowships", count: applications.filter((a: any) => a.fellowshipId).length, percent: 10, color: "text-purple-500" },
                      { label: "Volunteers", count: applications.filter((a: any) => a.volunteerId).length, percent: 5, color: "text-amber-500" }
                    ].map((c: any, idx: number) => (
                      <div key={idx} className="flex items-center justify-between gap-4">
                        <span className="font-semibold text-muted">{c.label}</span>
                        <div className="flex-1 bg-neutral-200 dark:bg-neutral-800 h-2 rounded-full overflow-hidden">
                          <div className={`bg-primary h-full`} style={{ width: `${c.percent}%` }}></div>
                        </div>
                        <span className="font-extrabold text-foreground shrink-0">{c.count} ({c.percent}%)</span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* TAB 5: TEAM COLLABORATION */}
          {tab === "team" && (
            <div className="space-y-6 text-xs text-left">
              <div>
                <h2 className="text-lg font-bold text-foreground">Recruitment Team Collaboration</h2>
                <p className="text-[11px] text-muted">Invite recruiters from your organization to review candidate applications.</p>
              </div>

              {/* Invite Recruiter form */}
              <form 
                action={async (formData: FormData) => {
                  "use server";
                  await inviteRecruiterAction(formData);
                }} 
                className="glass-panel p-4 rounded-xl border border-card-border space-y-3"
              >
                <input type="hidden" name="orgId" value={org.id} />
                <h3 className="font-bold text-foreground text-xs flex items-center gap-1"><UserPlus className="w-4 h-4 text-primary" /> Invite New Recruiter</h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="font-semibold text-muted">Full Name</label>
                    <input type="text" name="name" required placeholder="Rahul Sharma" className="form-input" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="font-semibold text-muted">Work Email</label>
                    <input type="email" name="email" required placeholder="rahul@goonj.org" className="form-input" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="font-semibold text-muted">System Role</label>
                    <select name="roleInOrg" className="form-input py-1">
                      <option value="Recruiter">Recruiter (Post & Assess)</option>
                      <option value="Admin">Admin (Full Edit permissions)</option>
                      <option value="Viewer">Viewer (Read-only list views)</option>
                    </select>
                  </div>
                </div>

                <button type="submit" className="px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg font-semibold cursor-pointer">
                  Send Collaboration Invite
                </button>
              </form>

              {/* Members listing */}
              <div className="space-y-3">
                <h3 className="font-bold text-foreground text-xs">Active Team Members</h3>
                <div className="grid gap-2">
                  {recruiters.map((member: any) => (
                    <div key={member.id} className="p-3.5 rounded-xl border border-card-border bg-white/20 dark:bg-zinc-950/20 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        {member.profilePhoto || member.image ? (
                          <img src={member.profilePhoto || member.image || ""} alt="" className="w-8 h-8 rounded-full object-cover border border-card-border" />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-extrabold text-xs">
                            {member.name?.substring(0,1) || "U"}
                          </div>
                        )}
                        <div>
                          <p className="font-bold text-foreground text-xs leading-none">{member.name}</p>
                          <p className="text-[10px] text-muted mt-0.5">{member.email} &middot; <strong className="text-primary">{member.jobTitle || "Recruiter"}</strong></p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="text-[10px] bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded-full font-bold">
                          {member.roleInOrg || "Recruiter"}
                        </span>
                        
                        {member.id !== recruiter.id && (
                          <form 
                            action={async (formData: FormData) => {
                              "use server";
                              await removeRecruiterMemberAction(formData);
                            }}
                          >
                            <input type="hidden" name="memberId" value={member.id} />
                            <button type="submit" className="p-1 text-red-500 hover:bg-red-500/10 rounded cursor-pointer" title="Revoke access">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </form>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: ORGANIZATION DETAILS */}
          {tab === "org" && (
            <div className="space-y-6 text-xs text-left">
              <div>
                <h2 className="text-lg font-bold text-foreground">Organization Details</h2>
                <p className="text-[11px] text-muted">Update your organization banner, mission statements, cause areas, and contact links.</p>
              </div>

              <form 
                action={async (formData: FormData) => {
                  "use server";
                  await updateOrgProfileRichAction(formData);
                }} 
                className="space-y-4"
              >
                <input type="hidden" name="orgId" value={org.id} />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="font-semibold text-muted">Organization Name</label>
                    <input type="text" name="name" defaultValue={org.name} required className="form-input" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="font-semibold text-muted">Organization Type</label>
                    <select name="orgType" defaultValue={org.orgType || "NGO"} className="form-input py-1">
                      <option value="NGO">Non-Governmental Organization (NGO)</option>
                      <option value="CSR Foundation">CSR Foundation / Donor</option>
                      <option value="Social Enterprise">Social Enterprise</option>
                      <option value="Government">Government body</option>
                      <option value="International Organization">International Organization (UN, etc.)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="font-semibold text-muted">Logo URL</label>
                    <input type="url" name="logo" defaultValue={org.logo || ""} placeholder="https://..." className="form-input" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="font-semibold text-muted">Cover Banner Image URL</label>
                    <input type="url" name="coverBanner" defaultValue={org.coverBanner || ""} placeholder="https://..." className="form-input" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="font-semibold text-muted">Registration Number (optional)</label>
                    <input type="text" name="registrationNumber" defaultValue={org.registrationNumber || ""} placeholder="E.g. 12A/80G status code" className="form-input" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="font-semibold text-muted">Year Founded</label>
                    <input type="number" name="yearFounded" defaultValue={org.yearFounded || ""} placeholder="1999" className="form-input" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="font-semibold text-muted">Headquarters Locality</label>
                    <input type="text" name="headquarters" defaultValue={org.headquarters || ""} placeholder="New Delhi, Delhi" className="form-input" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="font-semibold text-muted">Organization Size</label>
                    <select name="orgSize" defaultValue={org.orgSize || "11-50"} className="form-input py-1">
                      <option value="1-10">1-10 Employees</option>
                      <option value="11-50">11-50 Employees</option>
                      <option value="51-200">51-200 Employees</option>
                      <option value="201-500">201-500 Employees</option>
                      <option value="501+">501+ Employees</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="font-semibold text-muted">Employees Count</label>
                    <input type="number" name="employeesCount" defaultValue={org.employeesCount || ""} placeholder="350" className="form-input" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="font-semibold text-muted">Volunteers Count</label>
                    <input type="number" name="volunteersCount" defaultValue={org.volunteersCount || ""} placeholder="2000" className="form-input" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="font-semibold text-muted">Annual Budget (optional)</label>
                    <input type="text" name="annualBudget" defaultValue={org.annualBudget || ""} placeholder="E.g. ₹15 Crores" className="form-input" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="font-semibold text-muted">Careers Page External URL (optional)</label>
                    <input type="url" name="careersPage" defaultValue={org.careersPage || ""} placeholder="https://..." className="form-input" />
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-semibold text-muted">Areas of Work (comma separated)</label>
                  <input type="text" name="areasOfWork" defaultValue={org.areasOfWork?.join(", ") || ""} placeholder="Disaster Relief, Education, Livelihoods" className="form-input" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="font-semibold text-muted">SDGs Worked On (comma separated)</label>
                    <input type="text" name="sdgs" defaultValue={org.sdgs?.join(", ") || ""} placeholder="No Poverty, Quality Education" className="form-input" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="font-semibold text-muted">Cause Areas (comma separated)</label>
                    <input type="text" name="causeAreas" defaultValue={org.causeAreas?.join(", ") || ""} placeholder="Livelihoods, Sanitation" className="form-input" />
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-semibold text-muted">Organization Description / Rich text bio</label>
                  <textarea name="description" rows={3} defaultValue={org.description || ""} className="form-input resize-none"></textarea>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="font-semibold text-muted">Mission Statement</label>
                    <textarea name="mission" rows={2} defaultValue={org.mission || ""} className="form-input resize-none"></textarea>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="font-semibold text-muted">Vision Statement</label>
                    <textarea name="vision" rows={2} defaultValue={org.vision || ""} className="form-input resize-none"></textarea>
                  </div>
                </div>

                {/* Contact details */}
                <div className="border-t border-card-border pt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="font-semibold text-muted">Official Website URL</label>
                    <input type="url" name="website" defaultValue={org.website || ""} placeholder="https://..." className="form-input" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="font-semibold text-muted">Official Email</label>
                    <input type="email" name="email" defaultValue={org.email || ""} placeholder="mail@org.org" className="form-input" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="font-semibold text-muted">Official Phone</label>
                    <input type="text" name="phone" defaultValue={org.phone || ""} placeholder="+91-11-..." className="form-input" />
                  </div>
                </div>

                {/* Social links */}
                <div className="border-t border-card-border pt-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="font-semibold text-muted">LinkedIn URL</label>
                    <input type="url" name="linkedin" defaultValue={org.linkedin || ""} placeholder="https://linkedin.com/company/..." className="form-input" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="font-semibold text-muted">Twitter/X URL</label>
                    <input type="url" name="twitter" defaultValue={org.twitter || ""} placeholder="https://x.com/..." className="form-input" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="font-semibold text-muted">Instagram URL</label>
                    <input type="url" name="instagram" defaultValue={org.instagram || ""} placeholder="https://instagram.com/..." className="form-input" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="font-semibold text-muted">Facebook URL</label>
                    <input type="url" name="facebook" defaultValue={org.facebook || ""} placeholder="https://facebook.com/..." className="form-input" />
                  </div>
                </div>

                <button type="submit" className="px-6 py-2.5 bg-primary hover:bg-primary-hover text-white rounded-lg font-semibold transition-colors cursor-pointer w-fit">
                  Save Organization Profile
                </button>
              </form>
            </div>
          )}

          {/* TAB 7: RECRUITER PROFILE */}
          {tab === "recruiter-profile" && (
            <div className="space-y-6 text-xs text-left">
              <div>
                <h2 className="text-lg font-bold text-foreground">Recruiter Profile Setup</h2>
                <p className="text-[11px] text-muted">Update your profile photo, bio, job title, and social links. This card is displayed on your postings.</p>
              </div>

              <form 
                action={async (formData: FormData) => {
                  "use server";
                  await updateRecruiterProfileAction(formData);
                }} 
                className="space-y-4"
              >
                <div className="flex items-center gap-4 border-b border-card-border pb-4">
                  {recruiter.profilePhoto || recruiter.image ? (
                    <img src={recruiter.profilePhoto || recruiter.image || ""} alt="" className="w-16 h-16 rounded-full object-cover border border-card-border" />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-primary/20 text-primary flex items-center justify-center font-black text-xl uppercase">
                      {recruiter.name?.substring(0,1) || "U"}
                    </div>
                  )}
                  <div className="flex-1 flex flex-col gap-1">
                    <label className="font-semibold text-muted">Profile Photo Image URL</label>
                    <input type="url" name="profilePhoto" defaultValue={recruiter.profilePhoto || recruiter.image || ""} placeholder="https://unsplash.com/..." className="form-input" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="font-semibold text-muted">Full Name</label>
                    <input type="text" name="name" defaultValue={recruiter.name || ""} required className="form-input" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="font-semibold text-muted">Work Email</label>
                    <input type="email" defaultValue={recruiter.email} disabled className="form-input opacity-70" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="font-semibold text-muted">Job Title / Designation</label>
                    <input type="text" name="jobTitle" defaultValue={recruiter.jobTitle || ""} placeholder="E.g. Lead Talent Acquisition" className="form-input" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="font-semibold text-muted">Department</label>
                    <input type="text" name="department" defaultValue={recruiter.department || ""} placeholder="E.g. Human Resources" className="form-input" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="font-semibold text-muted">Office Locality Location</label>
                    <input type="text" name="officeLocation" defaultValue={recruiter.officeLocation || ""} placeholder="E.g. Central Delhi Office" className="form-input" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="font-semibold text-muted">Recruiter Team Group</label>
                    <input type="text" name="team" defaultValue={recruiter.team || ""} placeholder="E.g. Hiring Squad" className="form-input" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="font-semibold text-muted">LinkedIn URL</label>
                    <input type="url" name="linkedin" defaultValue={recruiter.linkedin || ""} placeholder="https://linkedin.com/in/..." className="form-input" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="font-semibold text-muted">Personal Website</label>
                    <input type="url" name="website" defaultValue={recruiter.website || ""} placeholder="https://..." className="form-input" />
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-semibold text-muted">Job Contact Phone Number (optional)</label>
                  <input type="text" name="phone" defaultValue={recruiter.phone || ""} placeholder="+91-98..." className="form-input" />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-semibold text-muted">Twitter/X Profile URL (optional)</label>
                  <input type="url" name="twitter" defaultValue={recruiter.twitter || ""} placeholder="https://x.com/..." className="form-input" />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-semibold text-muted">Short Bio / Punchy tagline</label>
                  <input type="text" name="shortBio" defaultValue={recruiter.shortBio || ""} placeholder="E.g. Helping social innovators build great teams" className="form-input" />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-semibold text-muted">About Me (Long description)</label>
                  <textarea name="aboutMe" rows={4} defaultValue={recruiter.aboutMe || ""} className="form-input resize-none"></textarea>
                </div>

                <button type="submit" className="px-6 py-2.5 bg-primary hover:bg-primary-hover text-white rounded-lg font-semibold transition-colors cursor-pointer w-fit">
                  Save Recruiter Profile
                </button>
              </form>
            </div>
          )}

          {/* TAB 8: SETTINGS */}
          {tab === "settings" && (
            <div className="space-y-6 text-xs text-left">
              <div>
                <h2 className="text-lg font-bold text-foreground">Recruiter Settings</h2>
                <p className="text-[11px] text-muted">Configure security preferences, active login logs, and email notifications.</p>
              </div>

              {/* 2FA Card */}
              <div className="p-4 rounded-xl border border-card-border bg-white/30 dark:bg-zinc-950/20 space-y-3">
                <h3 className="font-bold text-foreground text-xs flex items-center gap-1.5"><Lock className="w-4 h-4 text-primary" /> Two-Factor Authentication (2FA)</h3>
                <p className="text-[10px] text-muted">Secure your recruiter account by requiring an OTP code during login verification.</p>
                <div className="flex items-center gap-2">
                  <span className="text-[9px] bg-red-500/10 text-red-500 px-2 py-0.5 rounded font-bold uppercase">Disabled</span>
                  <button className="text-[10px] font-bold text-primary hover:underline cursor-pointer">Enable Verification Authenticator</button>
                </div>
              </div>

              {/* Notification preferences */}
              <div className="p-4 rounded-xl border border-card-border bg-white/30 dark:bg-zinc-950/20 space-y-3">
                <h3 className="font-bold text-foreground text-xs flex items-center gap-1.5"><Bell className="w-4 h-4 text-primary" /> Notification Preferences</h3>
                <div className="space-y-2 text-[10px] text-muted">
                  <label className="flex items-center gap-2 font-semibold">
                    <input type="checkbox" defaultChecked className="rounded border-card-border" />
                    <span>Email me when a candidate submits a new application</span>
                  </label>
                  <label className="flex items-center gap-2 font-semibold">
                    <input type="checkbox" defaultChecked className="rounded border-card-border" />
                    <span>Send candidate interview scheduler rescheduling notifications</span>
                  </label>
                  <label className="flex items-center gap-2 font-semibold">
                    <input type="checkbox" className="rounded border-card-border" />
                    <span>Weekly analytics newsletter summary report digest</span>
                  </label>
                </div>
              </div>

              {/* Login sessions */}
              <div className="p-4 rounded-xl border border-card-border bg-white/30 dark:bg-zinc-950/20 space-y-3">
                <h3 className="font-bold text-foreground text-xs">Active Login Sessions</h3>
                <div className="space-y-2 text-[10px]">
                  <div className="flex justify-between items-center bg-white/40 dark:bg-black/40 p-2.5 rounded-lg border border-card-border">
                    <div>
                      <p className="font-bold text-foreground">Chrome / macOS (Apple Silicon)</p>
                      <p className="text-muted mt-0.5">IP Address: 103.45.12.89 &middot; Location: New Delhi, IN</p>
                    </div>
                    <span className="text-[9px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded font-bold uppercase shrink-0">Current Session</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 9: BILLING & PLANS */}
          {tab === "billing" && (
            <div className="space-y-6 text-xs text-left">
              <div>
                <h2 className="text-lg font-bold text-foreground">Billing & Plans</h2>
                <p className="text-[11px] text-muted">Review your workspace subscription and browse optional premium recruitment boosters.</p>
              </div>

              {/* Info banner */}
              <div className="p-4 rounded-xl border border-emerald-500/25 bg-emerald-500/5 text-emerald-700 dark:text-emerald-400 font-semibold leading-relaxed flex items-center gap-2">
                <CheckCircle className="w-5 h-5 shrink-0 text-emerald-500" />
                <span>Your organization is currently on the Free Community Plan. All core recruitment features are available at no cost.</span>
              </div>

              {/* Three Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
                
                {/* CARD 1: Community Plan (Active) */}
                <div className="glass-panel p-6 rounded-2xl border-2 border-emerald-500/50 shadow-lg shadow-emerald-500/5 flex flex-col justify-between relative overflow-hidden bg-white/40 dark:bg-zinc-950/20">
                  {/* Status Banner Sticker */}
                  <span className="absolute top-3 right-3 bg-emerald-500 text-white font-extrabold text-[9px] uppercase tracking-widest px-2.5 py-0.5 rounded-full shadow-sm animate-pulse">
                    Active
                  </span>

                  <div className="space-y-4">
                    <div>
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-wider">🟢 Default Workspace Plan</span>
                      <h3 className="text-base font-black text-foreground mt-1">Community Plan</h3>
                      <div className="flex items-baseline gap-1 mt-2">
                        <span className="text-2xl font-black text-foreground">FREE</span>
                        <span className="text-muted text-[10px] font-semibold">/ Free Forever</span>
                      </div>
                    </div>

                    <p className="text-[11px] text-muted leading-relaxed italic border-t border-card-border pt-3">
                      All essential recruitment features are included at no cost to reassure social sector organizations.
                    </p>

                    <ul className="space-y-2 text-[10px] text-muted border-t border-card-border pt-3">
                      {[
                        "Unlimited Job Postings",
                        "Unlimited Internship Postings",
                        "Unlimited Fellowship Postings",
                        "Unlimited Volunteer Opportunities",
                        "Unlimited Event Listings",
                        "Unlimited Grant Listings",
                        "Organization Profile Page",
                        "Recruiter Coordinator Profile",
                        "Basic ATS & Pipeline Management",
                        "Candidate Application Review",
                        "Interview Calendar Scheduling",
                        "Team Collaboration Invites",
                        "Basic Workspace Analytics"
                      ].map((item, idx) => (
                        <li key={idx} className="flex items-center gap-1.5 font-medium">
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-6 pt-4 border-t border-card-border shrink-0">
                    <span className="w-full py-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl font-extrabold text-[11px] flex items-center justify-center border border-emerald-500/20">
                      Currently Active Plan
                    </span>
                  </div>
                </div>

                {/* CARD 2: Featured Job Promotion */}
                <div className="glass-panel p-6 rounded-2xl border border-card-border flex flex-col justify-between hover:border-primary/40 transition-all bg-white/20 dark:bg-zinc-950/10">
                  <div className="space-y-4">
                    <div>
                      <span className="text-[10px] text-primary font-bold uppercase tracking-wider">⭐ Visibility Upgrade</span>
                      <h3 className="text-base font-black text-foreground mt-1">Featured Job</h3>
                      <div className="flex items-baseline gap-1 mt-2">
                        <span className="text-2xl font-black text-foreground">₹2,000</span>
                        <span className="text-muted text-[10px] font-semibold">/ per month</span>
                      </div>
                    </div>

                    <p className="text-[11px] text-muted leading-relaxed border-t border-card-border pt-3">
                      Increase the visibility of your opportunity across the Development Wala ecosystem.
                    </p>

                    <ul className="space-y-2 text-[10px] text-muted border-t border-card-border pt-3">
                      {[
                        "Featured on Homepage",
                        "Featured in Search Results",
                        "Highlighted Job Listing Design",
                        "Included in Weekly Newsletter",
                        "Shared on LinkedIn Page",
                        "Shared on Instagram Handle",
                        "Shared via WhatsApp Community",
                        "Shared on Telegram Channel",
                        "Priority Visibility to Seekers"
                      ].map((item, idx) => (
                        <li key={idx} className="flex items-center gap-1.5 font-medium">
                          <CheckCircle className="w-3.5 h-3.5 text-primary shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-6 pt-4 border-t border-card-border shrink-0">
                    <a
                      href="https://developmentwala.com/contact-us"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-2 bg-primary hover:bg-primary-hover text-white rounded-xl font-extrabold text-[11px] flex items-center justify-center transition-colors border border-primary/20"
                    >
                      Contact Our Team
                    </a>
                  </div>
                </div>

                {/* CARD 3: Candidate Database Access */}
                <div className="glass-panel p-6 rounded-2xl border border-card-border flex flex-col justify-between hover:border-primary/40 transition-all bg-white/20 dark:bg-zinc-950/10">
                  <div className="space-y-4">
                    <div>
                      <span className="text-[10px] text-purple-600 dark:text-purple-400 font-bold uppercase tracking-wider">👥 Sourcing Powerup</span>
                      <h3 className="text-base font-black text-foreground mt-1">Candidate DB</h3>
                      <div className="flex items-baseline gap-1 mt-2">
                        <span className="text-xl font-black text-foreground">Custom Pricing</span>
                      </div>
                    </div>

                    <p className="text-[11px] text-muted leading-relaxed border-t border-card-border pt-3">
                      Gain access to our curated database of development professionals and search proactively.
                    </p>

                    <ul className="space-y-2 text-[10px] text-muted border-t border-card-border pt-3">
                      {[
                        "Search Candidate Profiles",
                        "Filter by Sector Skills",
                        "Filter by Location/State",
                        "Filter by Years of Experience",
                        "Filter by Education / Degree",
                        "Save Custom Candidate Lists",
                        "Directly Contact Suitable Leads",
                        "Build Talent Pipelines Proactively"
                      ].map((item, idx) => (
                        <li key={idx} className="flex items-center gap-1.5 font-medium">
                          <CheckCircle className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-6 pt-4 border-t border-card-border shrink-0">
                    <a
                      href="https://developmentwala.com/contact-us"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-2 bg-neutral-800 dark:bg-neutral-200 text-white dark:text-black hover:bg-black dark:hover:bg-white rounded-xl font-extrabold text-[11px] flex items-center justify-center transition-colors"
                    >
                      Contact Our Team
                    </a>
                  </div>
                </div>

              </div>

              {/* Bottom tailored advisory */}
              <div className="p-4 rounded-xl border border-card-border bg-white/30 dark:bg-zinc-950/20 text-[10px] text-muted leading-relaxed text-center mt-6">
                💡 <em>Need a custom recruitment solution or bulk hiring support? <a href="https://developmentwala.com/contact-us" target="_blank" rel="noopener noreferrer" className="text-primary font-bold hover:underline">Contact our team</a> to discuss tailored services for your organization.</em>
              </div>
            </div>
          )}

          {/* TAB 10: SUPPORT CHAT */}
          {tab === "support" && (
            <div className="space-y-6 text-xs text-left">
              <div>
                <h2 className="text-lg font-bold text-foreground">Admin Support Desk</h2>
                <p className="text-[11px] text-muted">Message platform admin representatives directly regarding workspace issues or verifications.</p>
              </div>

              <SupportChat 
                userId={session.user.id} 
                userRole={session.user.role} 
                initialMessages={initialMessages} 
                initialNotifications={supportNotifications}
                onMarkRead={handleMarkRead}
              />
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
