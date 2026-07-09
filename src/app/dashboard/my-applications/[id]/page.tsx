import { db } from "@/lib/db";
import { auth } from "@/auth";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { 
  Briefcase, User, Calendar, Bell, Mail, FileText, CheckCircle, 
  ArrowLeft, ArrowUpRight, Search, SlidersHorizontal, Trash2, 
  HelpCircle, LogOut, Settings, Award, AlertCircle, Clock, MapPin, Building
} from "lucide-react";
import { withdrawApplicationAction } from "@/app/actions/candidate";
import { getNotificationsAction, markNotificationsReadAction } from "@/app/actions/support";
import SortSelect from "@/components/SortSelect";

export const revalidate = 0;

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ status?: string; q?: string; sort?: string }>;
}

export default async function ApplicationTrackingPage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const search = await searchParams;
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/auth/signin");
  }

  // Load target application
  const app = await db.application.findUnique({
    where: { id },
    include: {
      candidate: true,
      job: { include: { organization: true } },
      internship: { include: { organization: true } },
      fellowship: { include: { organization: true } },
      scholarship: { include: { organization: true } },
      grant: { include: { organization: true } },
      consultancy: { include: { organization: true } },
      volunteer: { include: { organization: true } },
      event: { include: { organizer: true } }
    }
  });

  if (!app || app.candidateId !== session.user.id) {
    notFound();
  }

  const opp = app.job || app.fellowship || app.internship || app.grant || app.consultancy || app.volunteer || app.scholarship || app.event;
  const orgName = opp?.organization?.name || opp?.organizer?.name || "Verified NGO";
  const orgId = opp?.organizationId || opp?.organizerId;

  // Resolve opportunity category and type path for links
  let category = "JOB";
  if (opp?.stipend !== undefined) category = "INTERNSHIP";
  else if (opp?.amount !== undefined) category = "SCHOLARSHIP";
  else if (opp?.fundingMin !== undefined) category = "GRANT";
  else if (opp?.budget !== undefined) category = "CONSULTANCY";
  else if (opp?.duration !== undefined && opp?.stipend === undefined) category = "VOLUNTEER";
  else if (opp?.date !== undefined) category = "EVENT";

  const typePathMap: Record<string, string> = {
    JOB: "jobs",
    INTERNSHIP: "internships",
    FELLOWSHIP: "fellowships",
    SCHOLARSHIP: "scholarships",
    GRANT: "grants",
    CONSULTANCY: "consultancies",
    VOLUNTEER: "volunteer",
    EVENT: "events",
  };
  const publicUrl = `/${typePathMap[category] || "jobs"}/${opp?.id}`;

  // Fetch all seeker applications for bottom dashboard list
  const allApps = await db.application.findMany({
    where: { candidateId: session.user.id },
    include: {
      job: { include: { organization: true } },
      internship: { include: { organization: true } },
      fellowship: { include: { organization: true } },
      scholarship: { include: { organization: true } },
      grant: { include: { organization: true } },
      consultancy: { include: { organization: true } },
      volunteer: { include: { organization: true } },
      event: { include: { organizer: true } }
    }
  });

  // Calculate profile completion percentage
  const candidate = app.candidate;
  let profileCompletion = 0;
  if (candidate?.name) profileCompletion += 15;
  if (candidate?.bio) profileCompletion += 15;
  if (candidate?.skills && candidate.skills.length > 0) profileCompletion += 20;
  if (candidate?.experienceYears && candidate.experienceYears > 0) profileCompletion += 15;
  if (candidate?.location) profileCompletion += 15;
  if (candidate?.resumeUrl) profileCompletion += 20;

  // Horizontal tracker stages resolution
  const STAGES = [
    { id: "APPLIED", label: "Application Submitted" },
    { id: "RECEIVED", label: "Application Received" },
    { id: "VIEWED", label: "Recruiter Viewed" },
    { id: "UNDER_REVIEW", label: "Under Review" },
    { id: "SHORTLISTED", label: "Shortlisted" },
    { id: "INTERVIEW_SCHEDULED", label: "Interview Scheduled" },
    { id: "INTERVIEW_COMPLETED", label: "Interview Completed" },
    { id: "ASSESSMENT", label: "Assessment" },
    { id: "OFFER_SENT", label: "Offer Extended" },
    { id: "HIRED", label: "Selected" }
  ];

  // Resolve active stage indices
  const currentStage = app.stage;
  
  // Custom mapping of database stage values to horizontal index
  const stageHierarchy: Record<string, number> = {
    APPLIED: 1,
    RECEIVED: 2,
    NEW: 2,
    SCREENING: 2,
    VIEWED: 3, // Mocked / Inferred state
    UNDER_REVIEW: 4,
    SHORTLISTED: 5,
    INTERVIEW: 6,
    INTERVIEW_SCHEDULED: 6,
    INTERVIEW_COMPLETED: 7,
    ASSESSMENT: 8,
    OFFER: 9,
    OFFER_SENT: 9,
    HIRED: 10,
    REJECTED: -1,
    WITHDRAWN: -2
  };

  const activeStageIndex = stageHierarchy[currentStage] || 1;

  const isCompleted = (index: number) => {
    if (currentStage === "REJECTED" || currentStage === "WITHDRAWN") {
      return index <= 2; // only show initial submission on reject/withdraw
    }
    return index <= activeStageIndex;
  };

  const isCurrent = (index: number) => {
    if (currentStage === "REJECTED" || currentStage === "WITHDRAWN") return false;
    return index === activeStageIndex;
  };

  // Generate realistic times for tracking completed stages
  const getStageDate = (index: number) => {
    const baseTime = new Date(app.createdAt).getTime();
    if (index === 1) return new Date(baseTime); // Submission
    if (index === 2) return new Date(baseTime + 30 * 60 * 1000); // 30 mins later
    if (index === 3) return new Date(baseTime + 24 * 60 * 60 * 1000); // 1 day later
    if (index === 4) return new Date(baseTime + 2 * 24 * 60 * 60 * 1000); // 2 days later
    if (index === 5) return new Date(baseTime + 3 * 24 * 60 * 60 * 1000); // 3 days later
    if (index === 6) return new Date(baseTime + 4 * 24 * 60 * 60 * 1000); // 4 days later
    if (index === 7) return new Date(baseTime + 5 * 24 * 60 * 60 * 1000); // 5 days later
    if (index === 8) return new Date(baseTime + 6 * 24 * 60 * 60 * 1000); // 6 days later
    if (index === 9) return new Date(baseTime + 7 * 24 * 60 * 60 * 1000); // 7 days later
    if (index === 10) return new Date(baseTime + 8 * 24 * 60 * 60 * 1000); // 8 days later
    return null;
  };

  // Chronological timeline creation (latest first)
  const timelineEvents = [];

  if (activeStageIndex >= 1) {
    timelineEvents.push({
      title: "Application Submitted",
      description: "You submitted your application successfully.",
      date: getStageDate(1),
      icon: "submit"
    });
  }
  if (activeStageIndex >= 2) {
    timelineEvents.push({
      title: "Application Received by " + orgName,
      description: "Your application details were received and compiled.",
      date: getStageDate(2),
      icon: "receive"
    });
  }
  if (activeStageIndex >= 3) {
    timelineEvents.push({
      title: "Recruiter Viewed Your Application",
      description: `A recruitment manager from ${orgName} viewed your profile details.`,
      date: getStageDate(3),
      icon: "view"
    });
  }
  if (activeStageIndex >= 4) {
    timelineEvents.push({
      title: "Application Under Review",
      description: "Your files are being evaluated for position prerequisites.",
      date: getStageDate(4),
      icon: "review"
    });
  }
  if (activeStageIndex >= 5) {
    timelineEvents.push({
      title: "Application Shortlisted",
      description: "Congratulations! You have been shortlisted for the next rounds.",
      date: getStageDate(5),
      icon: "shortlist"
    });
  }
  if (activeStageIndex >= 6) {
    timelineEvents.push({
      title: "Interview Scheduled",
      description: `Your interview was scheduled for ${app.interviewDate ? new Date(app.interviewDate).toLocaleDateString("en-GB") : ""} at ${app.interviewTime || ""}.`,
      date: getStageDate(6),
      icon: "interview"
    });
  }
  if (activeStageIndex >= 7) {
    timelineEvents.push({
      title: "Interview Completed",
      description: "Your interview conversation has concluded and responses are under compilation.",
      date: getStageDate(7),
      icon: "completed"
    });
  }
  if (activeStageIndex >= 8) {
    timelineEvents.push({
      title: "Assessment Form Issued",
      description: "A competency evaluation assessment was compiled.",
      date: getStageDate(8),
      icon: "assessment"
    });
  }
  if (activeStageIndex >= 9) {
    timelineEvents.push({
      title: "Offer Extended",
      description: `An official employment offer has been extended by ${orgName}. Check your email.`,
      date: getStageDate(9),
      icon: "offer"
    });
  }
  if (activeStageIndex >= 10) {
    timelineEvents.push({
      title: "Selected & Hired",
      description: `Welcome aboard! Recruitment completed for ${opp?.title}.`,
      date: getStageDate(10),
      icon: "hired"
    });
  }

  // Handle special stages
  if (currentStage === "REJECTED") {
    timelineEvents.unshift({
      title: "Application Rejected",
      description: "We appreciate your interest in this role. The recruiter decided not to move forward.",
      date: app.updatedAt,
      icon: "rejected"
    });
  } else if (currentStage === "WITHDRAWN") {
    timelineEvents.unshift({
      title: "Application Withdrawn",
      description: "You have withdrawn your application for this opportunity.",
      date: app.updatedAt,
      icon: "withdrawn"
    });
  }

  // Sort timeline newest first
  timelineEvents.sort((a: any, b: any) => b.date.getTime() - a.date.getTime());

  // Bottom My Applications Filter and Sort logic
  const currentFilter = search.status || "ALL";
  let filteredApps = allApps;

  if (currentFilter !== "ALL") {
    filteredApps = allApps.filter((a: any) => {
      const s = a.stage;
      if (currentFilter === "SUBMITTED") return s === "APPLIED" || s === "RECEIVED" || s === "NEW" || s === "SCREENING";
      if (currentFilter === "UNDER_REVIEW") return s === "UNDER_REVIEW";
      if (currentFilter === "SHORTLISTED") return s === "SHORTLISTED";
      if (currentFilter === "INTERVIEW") return s === "INTERVIEW" || s === "INTERVIEW_SCHEDULED" || s === "INTERVIEW_COMPLETED";
      if (currentFilter === "ASSESSMENT") return s === "ASSESSMENT";
      if (currentFilter === "OFFER") return s === "OFFER" || s === "OFFER_SENT" || s === "OFFER_ACCEPTED";
      if (currentFilter === "REJECTED") return s === "REJECTED";
      if (currentFilter === "WITHDRAWN") return s === "WITHDRAWN";
      return false;
    });
  }

  const q = (search.q || "").toLowerCase().trim();
  if (q) {
    filteredApps = filteredApps.filter((a: any) => {
      const o = a.job || a.fellowship || a.internship || a.grant || a.consultancy || a.volunteer || a.scholarship || a.event;
      return (o?.title || "").toLowerCase().includes(q) || 
             (o?.organization?.name || o?.organizer?.name || "").toLowerCase().includes(q) ||
             (o?.location || "").toLowerCase().includes(q);
    });
  }

  const sortBy = search.sort || "RECENTLY_UPDATED";
  filteredApps.sort((a: any, b: any) => {
    const oppA = a.job || a.fellowship || a.internship || a.grant || a.consultancy || a.volunteer || a.scholarship || a.event;
    const oppB = b.job || b.fellowship || b.internship || b.grant || b.consultancy || b.volunteer || b.scholarship || b.event;

    if (sortBy === "NEWEST") return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    if (sortBy === "OLDEST") return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    if (sortBy === "APPLICATION_DATE") return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    if (sortBy === "DEADLINE") {
      return new Date(oppA?.deadline || 0).getTime() - new Date(oppB?.deadline || 0).getTime();
    }
    return new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime();
  });

  // Action helper for withdraw form
  const handleWithdrawAction = async () => {
    "use server";
    await withdrawApplicationAction(app.id);
  };

  return (
    <div className="min-h-screen bg-background font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        {/* Navigation Sidebar & Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Sidebar Section */}
          <div className="lg:col-span-3 space-y-2">
            
            {/* User Profile Summary */}
            <div className="p-4 rounded-xl border border-card-border bg-white/40 dark:bg-zinc-950/10 flex items-center gap-3 mb-4">
              {candidate?.profilePhoto ? (
                <img src={candidate.profilePhoto} alt="" className="w-10 h-10 rounded-full object-cover border border-card-border" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm border border-card-border uppercase">
                  {candidate?.name?.substring(0, 1) || "S"}
                </div>
              )}
              <div className="text-left">
                <h4 className="font-extrabold text-xs text-foreground truncate max-w-[150px]">{candidate?.name || candidate?.email}</h4>
                <p className="text-[10px] text-muted">Job Seeker</p>
              </div>
            </div>

            {/* Sidebar Menu Links */}
            {[
              { id: "dashboard", label: "Dashboard", icon: Briefcase, fallbackTab: "applications" },
              { id: "applications", label: "My Applications", icon: Briefcase },
              { id: "saved", label: "Saved Opportunities", icon: Award, fallbackTab: "applications" },
              { id: "profile", label: "My Profile", icon: User },
              { id: "tickets", label: "Event Tickets", icon: Calendar },
              { id: "notifications", label: "Notifications", icon: Bell },
              { id: "settings", label: "Account Settings", icon: Settings, fallbackTab: "profile" },
              { id: "support", label: "Help & Support", icon: HelpCircle, fallbackTab: "notifications" }
            ].map((item, i) => {
              const Icon = item.icon;
              const targetTab = item.fallbackTab || item.id;
              // In this tracker page, we might just want to highlight "My Applications" as active
              const isActive = item.id === "applications";
              return (
                <Link
                  key={i}
                  href={`/dashboard/candidate?tab=${targetTab}`}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold border transition-all ${
                    isActive
                      ? "bg-primary text-white border-primary shadow"
                      : "glass-panel text-muted hover:text-foreground"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}

            {/* Sidebar Logout Link */}
            <form action="/auth/signout" method="POST" className="pt-2">
              <button
                type="submit"
                className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold border glass-panel text-red-500 hover:bg-red-50/50 dark:hover:bg-red-950/20 border-card-border w-full text-left transition-all"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </form>

            {/* Profile Completion Card */}
            <div className="p-4 rounded-xl border border-card-border bg-white/30 dark:bg-zinc-950/20 space-y-3 text-left mt-6 shadow-sm">
              <h4 className="font-bold text-foreground text-xs">Profile Completion</h4>
              <div className="flex items-center justify-between text-[11px] font-bold text-primary">
                <span>{profileCompletion}% Complete</span>
              </div>
              <div className="w-full bg-neutral-200 dark:bg-neutral-850 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-primary h-full rounded-full transition-all duration-500" 
                  style={{ width: `${profileCompletion}%` }} 
                />
              </div>
              <p className="text-[10px] text-muted leading-relaxed">
                Complete your profile to improve your visibility to recruiters in standard sector matching.
              </p>
              <Link 
                href="/dashboard/candidate?tab=profile"
                className="block w-full text-center px-4 py-2 bg-neutral-200 dark:bg-neutral-800 hover:bg-neutral-300 dark:hover:bg-neutral-700 text-foreground font-semibold rounded-lg text-[10px] transition-colors cursor-pointer"
              >
                Improve Profile
              </Link>
            </div>

          </div>

          {/* Main Application Detail tracking pane */}
          <div className="lg:col-span-9 space-y-6">
            
            {/* Header section */}
            <div className="glass-panel p-6 rounded-2xl space-y-4">
              <div className="flex items-center justify-between">
                <Link
                  href="/dashboard/candidate?tab=applications"
                  className="inline-flex items-center gap-1.5 text-xs text-muted hover:text-primary font-semibold transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to My Applications</span>
                </Link>
                {opp?.id && (
                  <Link
                    href={publicUrl}
                    target="_blank"
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-neutral-100 dark:bg-neutral-800 border border-card-border hover:border-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-lg text-[10px] font-bold text-foreground transition-all"
                  >
                    <span>View Opportunity</span>
                    <ArrowUpRight className="w-3 h-3 text-muted" />
                  </Link>
                )}
              </div>

              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-2 text-left">
                <div className="space-y-1">
                  <h1 className="text-xl md:text-2xl font-extrabold text-foreground tracking-tight">
                    {opp?.title || "Social Impact Project Role"}
                  </h1>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-muted">
                    <span className="font-semibold text-foreground inline-flex items-center gap-1">
                      <Building className="w-3.5 h-3.5" />
                      {orgName}
                    </span>
                    <span>•</span>
                    <span>Applied on: {new Date(app.createdAt).toLocaleDateString("en-GB")}</span>
                    <span>•</span>
                    <span>Application ID: DW-AP-{app.id.substring(0, 8).toUpperCase()}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start md:self-center">
                  <span className="text-[10px] text-muted font-bold uppercase tracking-wider">Current Status</span>
                  <span className={`text-xs font-extrabold px-3 py-1 rounded-full uppercase tracking-wide border ${
                    currentStage === "HIRED" || currentStage === "OFFER"
                      ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                      : currentStage === "REJECTED"
                      ? "bg-red-500/10 text-red-600 border-red-500/20"
                      : currentStage === "WITHDRAWN"
                      ? "bg-neutral-500/10 text-neutral-600 border-neutral-500/20"
                      : "bg-amber-500/10 text-amber-600 border-amber-500/20"
                  }`}>
                    {currentStage.replace("_", " ")}
                  </span>
                </div>
              </div>
            </div>

            {/* Horizontal progress tracker scroll wrapper */}
            <div className="glass-panel p-6 rounded-2xl text-left overflow-x-auto">
              <h3 className="font-bold text-xs uppercase tracking-wider text-muted mb-6">Application Progress Tracker</h3>
              
              <div className="min-w-[900px] flex items-center justify-between relative px-4 pb-4">
                {/* Horizontal Background Connectors */}
                <div className="absolute top-4 left-6 right-6 h-0.5 bg-neutral-200 dark:bg-neutral-800 -z-10" />
                <div 
                  className="absolute top-4 left-6 h-0.5 bg-primary -z-10 transition-all duration-700" 
                  style={{ 
                    width: `${
                      currentStage === "REJECTED" || currentStage === "WITHDRAWN"
                        ? "11.11%" // stopped at Application Received
                        : `${((activeStageIndex - 1) / (STAGES.length - 1)) * 100}%`
                    }` 
                  }} 
                />

                {STAGES.map((stg, i) => {
                  const stepNum = i + 1;
                  const completed = isCompleted(stepNum);
                  const active = isCurrent(stepNum);
                  const stgDate = getStageDate(stepNum);

                  return (
                    <div key={stg.id} className="flex flex-col items-center text-center space-y-2 relative group cursor-default">
                      {/* Tracker Circle Badge */}
                      <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${
                        completed
                          ? "bg-primary border-primary text-white"
                          : active
                          ? "bg-white dark:bg-neutral-900 border-primary text-primary ring-4 ring-primary/20 scale-110 font-bold"
                          : "bg-white dark:bg-neutral-900 border-neutral-300 dark:border-neutral-800 text-muted"
                      }`}>
                        {completed ? (
                          <CheckCircle className="w-5 h-5 fill-current text-white stroke-primary" />
                        ) : (
                          <span className="text-[10px] font-extrabold">{stepNum}</span>
                        )}
                      </div>

                      {/* Text details */}
                      <div className="space-y-0.5 max-w-[90px]">
                        <p className={`text-[10px] font-bold leading-tight ${
                          active ? "text-primary font-black" : completed ? "text-foreground" : "text-muted"
                        }`}>
                          {stg.label}
                        </p>
                        {completed && stgDate && (
                          <p className="text-[9px] text-muted">
                            {stgDate.toLocaleDateString("en-GB")}
                          </p>
                        )}
                      </div>

                      {/* Exact timestamp hover tooltip */}
                      {completed && stgDate && (
                        <div className="absolute bottom-full mb-2 bg-neutral-950 text-white text-[9px] px-2 py-1 rounded shadow-lg pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10 whitespace-nowrap">
                          {stgDate.toLocaleDateString("en-GB")} at {stgDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Application Details Body Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Timeline (col-span-2) */}
              <div className="md:col-span-2 glass-panel p-6 rounded-2xl text-left space-y-5">
                <div className="flex justify-between items-center pb-2 border-b border-card-border/50">
                  <h3 className="font-bold text-sm text-foreground">Application Timeline</h3>
                  <button className="text-[10px] text-primary font-bold hover:underline">View All Updates</button>
                </div>

                <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-neutral-200 dark:before:bg-neutral-800">
                  {timelineEvents.map((ev, i) => (
                    <div key={i} className="relative text-left space-y-1">
                      {/* Timeline node icon indicator */}
                      <div className={`absolute -left-6 top-1 w-4 h-4 rounded-full border-2 bg-background flex items-center justify-center ${
                        ev.icon === "rejected" || ev.icon === "withdrawn"
                          ? "border-red-500 text-red-500"
                          : i === 0
                          ? "border-primary text-primary ring-4 ring-primary/10"
                          : "border-neutral-400 text-muted"
                      }`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${
                          ev.icon === "rejected" || ev.icon === "withdrawn"
                            ? "bg-red-500"
                            : i === 0
                            ? "bg-primary"
                            : "bg-neutral-400"
                        }`} />
                      </div>

                      <div className="flex justify-between items-baseline gap-2">
                        <h4 className="font-bold text-xs text-foreground">{ev.title}</h4>
                        <span className="text-[9px] text-muted whitespace-nowrap font-medium">
                          {ev.date.toLocaleDateString("en-GB")} at {ev.date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-[11px] text-muted leading-relaxed">{ev.description}</p>
                    </div>
                  ))}
                </div>

                <button className="w-full py-2 bg-neutral-100 dark:bg-neutral-900 border border-card-border hover:bg-neutral-200 dark:hover:bg-neutral-850 transition-colors text-center text-xs font-semibold text-foreground rounded-lg mt-3">
                  View Full Timeline
                </button>
              </div>

              {/* Sidebar Action Cards */}
              <div className="space-y-6">
                
                {/* Interview Card (if scheduled) */}
                {app.interviewDate && (
                  <div className="glass-panel p-5 rounded-2xl border-l-4 border-l-primary text-left space-y-4 shadow-sm">
                    <h3 className="font-bold text-xs uppercase tracking-wider text-primary flex items-center gap-1.5">
                      <Calendar className="w-4 h-4" />
                      <span>Interview Details</span>
                    </h3>

                    <div className="space-y-2.5 text-xs">
                      <div>
                        <p className="text-[10px] text-muted uppercase font-bold tracking-wide">Date</p>
                        <p className="font-semibold text-foreground">
                          {new Date(app.interviewDate).toLocaleDateString("en-GB")}
                        </p>
                      </div>

                      <div>
                        <p className="text-[10px] text-muted uppercase font-bold tracking-wide">Time</p>
                        <p className="font-semibold text-foreground">
                          {app.interviewTime || "To be declared"} {app.interviewTimezone ? `(${app.interviewTimezone})` : ""}
                        </p>
                      </div>

                      <div>
                        <p className="text-[10px] text-muted uppercase font-bold tracking-wide">Interview Mode</p>
                        <p className="font-semibold text-foreground">
                          {app.interviewType || "Google Meet (Online)"}
                        </p>
                      </div>

                      {app.interviewLink && (
                        <div>
                          <p className="text-[10px] text-muted uppercase font-bold tracking-wide">Meeting Link</p>
                          <a 
                            href={app.interviewLink} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="font-bold text-primary hover:underline inline-flex items-center gap-1"
                          >
                            <span>Join Video Call</span>
                            <ArrowUpRight className="w-3 h-3" />
                          </a>
                        </div>
                      )}

                      {app.interviewInterviewer && (
                        <div>
                          <p className="text-[10px] text-muted uppercase font-bold tracking-wide">Interviewer</p>
                          <p className="font-semibold text-foreground">{app.interviewInterviewer}</p>
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-1 gap-2 pt-2">
                      <a 
                        href={app.interviewLink || "#"} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="px-4 py-2 bg-primary hover:bg-primary-hover text-white text-center text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5"
                      >
                        <Calendar className="w-3.5 h-3.5" />
                        <span>Join Interview</span>
                      </a>
                    </div>
                  </div>
                )}

                {/* Current Status Card Summary */}
                <div className="glass-panel p-5 rounded-2xl text-left space-y-3.5 shadow-sm">
                  <h3 className="font-bold text-xs uppercase tracking-wider text-muted">Current Status Summary</h3>
                  <div className="space-y-2">
                    <p className="text-xs font-extrabold text-foreground">{currentStage.replace("_", " ")}</p>
                    <p className="text-[11px] text-muted leading-relaxed">
                      {currentStage === "APPLIED" && "Your application has been submitted and is in queue for review."}
                      {currentStage === "UNDER_REVIEW" && "Your skills profile is being matched against target benchmarks."}
                      {currentStage === "SHORTLISTED" && "Great! Your files matches parameters. A hiring coordinator will schedule next rounds."}
                      {currentStage === "INTERVIEW_SCHEDULED" && "Your conversation session has been scheduled. View meeting details."}
                      {currentStage === "OFFER" && "Congratulations! You have received an employment offer."}
                      {currentStage === "HIRED" && "You have accepted the offer. Hiring process complete!"}
                      {currentStage === "REJECTED" && "Recruitment has concluded. We hope to see you apply for other open roles."}
                      {currentStage === "WITHDRAWN" && "You withdrew this application."}
                    </p>
                  </div>
                </div>

                {/* Recruiter Feedback Box */}
                {app.feedback && (
                  <div className="glass-panel p-5 rounded-2xl text-left space-y-2 bg-primary/5 border border-primary/10">
                    <h4 className="font-bold text-[10px] uppercase text-primary tracking-wide">Recruiter Feedback</h4>
                    <p className="text-xs text-foreground italic leading-relaxed">"{app.feedback}"</p>
                  </div>
                )}

                {/* Quick Actions Panel */}
                <div className="glass-panel p-5 rounded-2xl text-left space-y-3">
                  <h3 className="font-bold text-xs uppercase tracking-wider text-muted">Application Actions</h3>
                  
                  <div className="space-y-2">
                    {app.resumeUrl && (
                      <a 
                        href={app.resumeUrl}
                        target="_blank"
                        className="flex items-center justify-between p-2.5 rounded-lg border border-card-border hover:bg-neutral-50 dark:hover:bg-neutral-850 text-xs text-foreground font-semibold transition-colors"
                      >
                        <span className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-primary" />
                          <span>Download CV / Resume</span>
                        </span>
                        <ArrowUpRight className="w-3.5 h-3.5 text-muted" />
                      </a>
                    )}

                    {/* Withdraw Form Action */}
                    {currentStage !== "WITHDRAWN" && currentStage !== "REJECTED" && opp?.isActive !== false && (
                      <form action={handleWithdrawAction} className="w-full">
                        <button
                          type="submit"
                          className="w-full flex items-center gap-2 p-2.5 rounded-lg border border-red-500/20 bg-red-500/5 hover:bg-red-500/10 text-xs text-red-600 font-bold transition-all justify-center cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span>Withdraw Application</span>
                        </button>
                      </form>
                    )}
                  </div>
                </div>

              </div>

            </div>

            {/* Bottom Section: All Applications dashboard view */}
            <div className="glass-panel p-6 rounded-2xl text-left space-y-6">
              <div>
                <h2 className="text-lg font-bold text-foreground">All My Applications</h2>
                <p className="text-xs text-muted">Filter, search and track other submissions in your account.</p>
              </div>

              {/* Filtering Controls Form */}
              <form method="GET" className="space-y-4">
                <input type="hidden" name="status" value={currentFilter} />
                
                {/* Search and Sort controls */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted" />
                    <input 
                      type="text" 
                      name="q" 
                      defaultValue={search.q || ""}
                      placeholder="Search by job title, organization, location..."
                      className="w-full pl-9 pr-4 py-2 border border-card-border rounded-xl bg-white/40 dark:bg-black/20 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                    />
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <SlidersHorizontal className="w-4 h-4 text-muted" />
                    <SortSelect defaultValue={sortBy} />
                  </div>
                </div>

                {/* Filter Tab buttons row */}
                <div className="flex flex-wrap gap-1.5 pb-2">
                  {[
                    { id: "ALL", label: "All" },
                    { id: "SUBMITTED", label: "Submitted" },
                    { id: "UNDER_REVIEW", label: "Under Review" },
                    { id: "SHORTLISTED", label: "Shortlisted" },
                    { id: "INTERVIEW", label: "Interview" },
                    { id: "ASSESSMENT", label: "Assessment" },
                    { id: "OFFER", label: "Offer" },
                    { id: "REJECTED", label: "Rejected" },
                    { id: "WITHDRAWN", label: "Withdrawn" }
                  ].map((tabBtn) => (
                    <Link
                      key={tabBtn.id}
                      href={`/dashboard/my-applications/${app.id}?status=${tabBtn.id}${q ? `&q=${q}` : ""}${sortBy ? `&sort=${sortBy}` : ""}`}
                      className={`px-3.5 py-1.5 rounded-lg text-[10px] font-bold border transition-all ${
                        currentFilter === tabBtn.id 
                          ? "bg-primary text-white border-primary" 
                          : "bg-white/40 dark:bg-zinc-950/20 border-card-border text-muted hover:text-foreground"
                      }`}
                    >
                      {tabBtn.label}
                    </Link>
                  ))}
                </div>
              </form>

              {/* Filtered apps cards */}
              {filteredApps.length === 0 ? (
                <div className="text-center py-10 border border-dashed border-card-border rounded-xl text-muted text-xs">
                  No applications match your filtering rules.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredApps.map((item: any) => {
                    const itemOpp = item.job || item.fellowship || item.internship || item.grant || item.consultancy || item.volunteer || item.scholarship || item.event;
                    const itemOrg = itemOpp?.organization?.name || itemOpp?.organizer?.name || "Verified NGO";
                    const isSelf = item.id === app.id;

                    return (
                      <div 
                        key={item.id} 
                        className={`p-4 rounded-xl border transition-all flex flex-col justify-between gap-3 text-left ${
                          isSelf 
                            ? "bg-primary/5 border-primary/40 ring-1 ring-primary/20" 
                            : "bg-white/30 dark:bg-zinc-950/10 border-card-border/60"
                        }`}
                      >
                        <div className="space-y-1">
                          <div className="flex justify-between items-start gap-2">
                            <h4 className="font-bold text-xs text-foreground line-clamp-1">
                              {itemOpp?.title || "Social Impact Role"}
                            </h4>
                            <span className={`text-[8px] font-extrabold uppercase tracking-wider px-1.5 py-0.5 rounded border ${
                              item.stage === "HIRED" || item.stage === "OFFER"
                                ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                                : item.stage === "REJECTED"
                                ? "bg-red-500/10 text-red-600 border-red-500/20"
                                : item.stage === "WITHDRAWN"
                                ? "bg-neutral-500/10 text-neutral-600 border-neutral-500/20"
                                : "bg-amber-500/10 text-amber-600 border-amber-500/20"
                            }`}>
                              {item.stage.replace("_", " ")}
                            </span>
                          </div>
                          <p className="text-[10px] text-muted font-medium">{itemOrg} • {itemOpp?.location || "Remote"}</p>
                        </div>

                        <div className="flex justify-between items-center pt-2 border-t border-card-border/40 text-[9px] text-muted">
                          <span>Applied: {new Date(item.createdAt).toLocaleDateString("en-GB")}</span>
                          <Link 
                            href={`/dashboard/my-applications/${item.id}`} 
                            className="font-bold text-primary hover:underline flex items-center gap-0.5 cursor-pointer"
                          >
                            <span>Track details</span>
                            <ArrowUpRight className="w-3 h-3" />
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

            </div>

          </div>

        </div>
        
      </div>
    </div>
  );
}
