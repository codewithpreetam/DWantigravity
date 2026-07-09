import { auth } from "@/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { 
  User, Briefcase, Calendar, 
  Sparkles, Award, CheckCircle, RefreshCw, Mail, ArrowUpRight, Bell,
  FileText, HelpCircle, LogOut, Settings, MapPin, Clock
} from "lucide-react";
import { UserRole } from "@prisma/client";
import SupportChat from "@/components/SupportChat";
import AlertsView from "@/components/AlertsView";
import SeekerProfileForm from "@/components/SeekerProfileForm";
import { DashboardMobileNav } from "@/components/DashboardMobileNav";
import { 
  getMessagesAction, 
  getNotificationsAction, 
  markNotificationsReadAction 
} from "@/app/actions/support";
import { calculateCompatibility } from "@/lib/matching";

export const revalidate = 0;

interface PageProps {
  searchParams: Promise<{ tab?: string; action?: string }>;
}

export default async function CandidateDashboard(props: PageProps) {
  const searchParams = await props.searchParams;
  const session = await auth();
  if (!session?.user?.id || session.user.role !== UserRole.SEEKER) {
    return redirect("/auth/signin?callbackUrl=/dashboard/candidate");
  }

  const tab = searchParams.tab || "applications";
  const action = searchParams.action;

  // Fetch candidate details
  const candidate = await db.user.findUnique({
    where: { id: session.user.id },
  });

  // Fetch applications
  const applications = await db.application.findMany({
    where: { candidateId: session.user.id },
    orderBy: { createdAt: "desc" },
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

  // Fetch event registrations
  const registrations = await db.registration.findMany({
    where: { userId: session.user.id }
  });

  // Fetch saved opportunities
  const savedJobs = await db.savedJob.findMany({
    where: { candidateId: session.user.id },
    orderBy: { createdAt: "desc" },
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

  // Simple list of jobs for AI matching
  const allJobs = await db.job.findMany();

  // Load support & messages
  const initialMessages = await getMessagesAction(session.user.id);
  const notifications = await getNotificationsAction(session.user.id);

  if (tab === "alerts") {
    await markNotificationsReadAction(session.user.id, true);
  }

  const handleMarkRead = async () => {
    "use server";
    if (session?.user?.id) {
      await markNotificationsReadAction(session.user.id);
    }
  };

  const slugifyText = (text: string) => text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  
  const getPublicUrl = (opp: any) => {
    if (!opp) return "#";
    // Check if it's a job
    if (opp.salaryMin !== undefined || opp.workMode !== undefined || opp.employmentType !== undefined) {
      const orgName = opp.organization?.name || "verified-ngo";
      return `/jobs/${slugifyText(orgName)}/${slugifyText(`${opp.title}-${opp.workMode === "REMOTE" ? "remote" : opp.location}`)}`;
    }
    // Check other categories
    const typePathMap: Record<string, string> = {
      INTERNSHIP: "internships",
      FELLOWSHIP: "fellowships",
      SCHOLARSHIP: "scholarships",
      GRANT: "grants",
      CONSULTANCY: "consultancies",
      VOLUNTEER: "volunteer",
      EVENT: "events"
    };
    // Extract category
    let category = "JOB";
    if (opp.stipend !== undefined) category = "INTERNSHIP";
    else if (opp.amount !== undefined) category = "SCHOLARSHIP";
    else if (opp.fundingMin !== undefined) category = "GRANT";
    else if (opp.budget !== undefined) category = "CONSULTANCY";
    else if (opp.duration !== undefined && opp.stipend === undefined) category = "VOLUNTEER";
    else if (opp.date !== undefined) category = "EVENT";

    const path = typePathMap[category] || "jobs";
    return `/${path}/${opp.id}`;
  };

  const getProfileCompletion = () => {
    let pct = 0;
    if (candidate?.name) pct += 15;
    if (candidate?.bio) pct += 15;
    if (candidate?.skills && candidate.skills.length > 0) pct += 20;
    if (candidate?.experienceYears && candidate.experienceYears > 0) pct += 15;
    if (candidate?.location) pct += 15;
    if (candidate?.resumeUrl) pct += 20;
    return pct;
  };

  const profileCompletion = getProfileCompletion();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full min-w-0">
      <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-start gap-4 text-left min-w-0 flex-1">
          {candidate?.profilePhoto ? (
            <img src={candidate.profilePhoto} alt="" className="w-16 h-16 rounded-full object-cover border border-card-border shrink-0" />
          ) : (
            <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-lg border border-card-border uppercase shrink-0">
              {candidate?.name?.substring(0, 1) || "S"}
            </div>
          )}
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-foreground tracking-tight break-words">Candidate Dashboard</h1>
            <p className="text-xs text-muted mt-0.5 break-words">Welcome back, <strong className="text-foreground">{candidate?.name || candidate?.email}</strong>. Manage your profile and applications.</p>
          </div>
        </div>
      </div>

      {/* Mobile navigation (Hamburger Drawer) */}
      <DashboardMobileNav 
        tabs={[
          { id: "dashboard", label: "Dashboard", icon: <Briefcase className="w-4 h-4 shrink-0" /> },
          { id: "applications", label: "My Applications", icon: <Briefcase className="w-4 h-4 shrink-0" /> },
          { id: "saved", label: "Saved Opportunities", icon: <Award className="w-4 h-4 shrink-0" /> },
          { id: "profile", label: "My Profile", icon: <User className="w-4 h-4 shrink-0" /> },
          { id: "tickets", label: "Event Tickets", icon: <Calendar className="w-4 h-4 shrink-0" /> },
          { id: "alerts", label: "Alerts & Notifications", icon: <Bell className="w-4 h-4 shrink-0" /> },
          { id: "settings", label: "Account Settings", icon: <Settings className="w-4 h-4 shrink-0" /> },
          { id: "support", label: "Help & Support", icon: <HelpCircle className="w-4 h-4 shrink-0" /> },
        ]}
        basePath="/dashboard/candidate"
        title="Candidate Dashboard"
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start w-full min-w-0">
        {/* Navigation Sidebar — desktop only */}
        <div className="hidden lg:block lg:col-span-3 space-y-2">
          {/* Sidebar Menu Links */}
          {[
            { id: "dashboard", label: "Dashboard", icon: Briefcase, fallbackTab: "applications" },
            { id: "applications", label: "My Applications", icon: Briefcase },
            { id: "saved", label: "Saved Opportunities", icon: Award, fallbackTab: "applications" },
            { id: "profile", label: "My Profile", icon: User },
            { id: "tickets", label: "Event Tickets", icon: Calendar },
            { id: "alerts", label: "Alerts & Notifications", icon: Bell },
            { id: "settings", label: "Account Settings", icon: Settings, fallbackTab: "profile" },
            { id: "support", label: "Help & Support", icon: HelpCircle, fallbackTab: "alerts" }
          ].map((item) => {
            const Icon = item.icon;
            // Make it match the actual ID so mobile and desktop URLs are 1:1
            const targetTab = item.id;
            const isSelected = tab === targetTab;
            return (
              <a
                key={item.id}
                href={`/dashboard/candidate?tab=${targetTab}`}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold border transition-all ${
                  isSelected 
                    ? "bg-primary text-white border-primary shadow" 
                    : "glass-panel text-muted hover:text-foreground"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </a>
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
            <div className="w-full bg-neutral-200 dark:bg-neutral-800 h-2 rounded-full overflow-hidden">
              <div 
                className="bg-primary h-full rounded-full transition-all duration-500" 
                style={{ width: `${profileCompletion}%` }} 
              />
            </div>
            <p className="text-[10px] text-muted leading-relaxed">
              Complete your profile to improve your visibility to recruiters in standard sector matching.
            </p>
            <a 
              href="/dashboard/candidate?tab=profile"
              className="block w-full text-center px-4 py-2 bg-neutral-200 dark:bg-neutral-800 hover:bg-neutral-300 dark:hover:bg-neutral-700 text-foreground font-semibold rounded-lg text-[10px] transition-colors cursor-pointer"
            >
              Improve Profile
            </a>
          </div>
        </div>

        {/* Content Pane */}
        <div className="lg:col-span-9 glass-panel p-4 sm:p-6 md:p-8 rounded-2xl min-h-[50vh] w-full min-w-0 overflow-hidden">
          {/* TABS 1: Applications, Dashboard, Saved */}
          {(tab === "applications" || tab === "dashboard" || tab === "saved") && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-foreground flex items-center gap-1.5">
                <Briefcase className="w-5 h-5 text-primary" />
                <span>Submitted Applications</span>
              </h2>

              {applications.length === 0 ? (
                <div className="text-center py-12 text-muted">
                  <p className="text-xs">You haven't submitted any applications yet.</p>
                  <a href="/jobs" className="text-xs font-bold text-primary hover:underline mt-2 inline-block">
                    Browse open roles &rarr;
                  </a>
                </div>
              ) : (
                <div className="space-y-4">
                  {applications.filter((a: any) => !a.event && !a.grant).map((app: any) => {
                    const opp = app.job || app.fellowship || app.internship || app.consultancy || app.volunteer || app.scholarship;
                    const publicUrl = getPublicUrl(opp);
                    return (
                      <div key={app.id} className="p-4 sm:p-5 rounded-xl border border-card-border bg-neutral-50/50 dark:bg-zinc-900/50 space-y-3 w-full min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 w-full min-w-0">
                          <div className="text-left min-w-0 flex-1">
                            <h3 className="font-bold text-sm text-foreground break-words">
                              <a 
                                href={publicUrl} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="hover:text-primary hover:underline inline-flex items-start sm:items-center gap-1 transition-colors"
                              >
                                <span>{opp?.title || "Social Impact Role"}</span>
                                <ArrowUpRight className="w-3.5 h-3.5 text-muted shrink-0 mt-0.5 sm:mt-0" />
                              </a>
                            </h3>
                            <p className="text-xs text-muted mt-0.5 break-words">Applied at: <strong className="text-foreground">{opp?.organization?.name || "Verified NGO"}</strong></p>
                          </div>
                          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border self-start sm:self-auto ${
                            app.stage === "HIRED" || app.stage === "OFFER"
                              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                              : app.stage === "REJECTED"
                              ? "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20"
                              : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
                          }`}>
                            {app.stage}
                          </span>
                        </div>
                        <div className="text-xs text-muted w-full min-w-0 break-words">
                          <strong>Your Pitch:</strong> <span className="line-clamp-2">{app.coverLetter}</span>
                        </div>
                        {app.feedback && (
                          <div className="p-3 rounded-lg bg-primary/5 text-primary text-xs leading-relaxed border border-primary/10 w-full min-w-0 break-words">
                            <strong>Recruiter Feedback:</strong> {app.feedback}
                          </div>
                        )}
                        <div className="flex justify-start pt-2">
                          <a
                            href={`/dashboard/my-applications/${app.id}`}
                            className="px-4 py-2 bg-primary hover:bg-primary-hover text-white text-xs font-semibold rounded-lg transition-colors inline-flex items-center gap-1.5 shadow-sm cursor-pointer"
                          >
                            <span>Track Application</span>
                            <ArrowUpRight className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
              {/* GRANTS SECTION */}
              {applications.filter((a: any) => a.grant).length > 0 && (
                <div className="mt-8 space-y-6">
                  <h2 className="text-xl font-bold text-foreground flex items-center gap-1.5">
                    <Award className="w-5 h-5 text-primary" />
                    <span>Submitted Grants</span>
                  </h2>
                  <div className="space-y-4">
                    {applications.filter((a: any) => a.grant).map((app: any) => {
                      const opp = app.grant;
                      const publicUrl = `/grants/${opp.slug}`;
                      return (
                        <div key={app.id} className="p-4 sm:p-5 rounded-xl border border-card-border bg-neutral-50/50 dark:bg-zinc-900/50 space-y-3 w-full min-w-0">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 w-full min-w-0">
                            <div className="text-left min-w-0 flex-1">
                              <h3 className="font-bold text-sm text-foreground break-words">
                                <a 
                                  href={publicUrl} 
                                  target="_blank" 
                                  rel="noopener noreferrer" 
                                  className="hover:text-primary hover:underline inline-flex items-start sm:items-center gap-1 transition-colors"
                                >
                                  <span>{opp?.title || "Grant"}</span>
                                  <ArrowUpRight className="w-3.5 h-3.5 text-muted shrink-0 mt-0.5 sm:mt-0" />
                                </a>
                              </h3>
                              <p className="text-xs text-muted mt-0.5 break-words">Organization: <strong className="text-foreground">{opp?.organization?.name || "Verified NGO"}</strong></p>
                            </div>
                            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border self-start sm:self-auto ${
                              app.stage === "HIRED" || app.stage === "OFFER" || app.stage === "APPROVED"
                                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                                : app.stage === "REJECTED"
                                ? "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20"
                                : "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20"
                            }`}>
                              {app.stage === "HIRED" || app.stage === "OFFER" ? "APPROVED" : app.stage}
                            </span>
                          </div>
                          <div className="text-xs text-muted flex gap-4 mt-2">
                            <div className="flex flex-col">
                              <span className="font-semibold text-foreground">Submitted on</span>
                              <span>{new Date(app.createdAt).toLocaleDateString()}</span>
                            </div>
                            <div className="flex flex-col">
                              <span className="font-semibold text-foreground">Deadline</span>
                              <span>{opp.applicationDeadline ? new Date(opp.applicationDeadline).toLocaleDateString() : "Rolling"}</span>
                            </div>
                          </div>
                          <div className="flex justify-start pt-2 gap-2">
                            <a
                              href={publicUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-4 py-2 bg-neutral-200 dark:bg-neutral-800 hover:bg-neutral-300 dark:hover:bg-neutral-700 text-foreground text-xs font-semibold rounded-lg transition-colors inline-flex items-center gap-1.5 shadow-sm cursor-pointer"
                            >
                              <span>View Grant Details</span>
                            </a>
                            <a
                              href={`/dashboard/my-applications/${app.id}`}
                              className="px-4 py-2 bg-primary hover:bg-primary-hover text-white text-xs font-semibold rounded-lg transition-colors inline-flex items-center gap-1.5 shadow-sm cursor-pointer"
                            >
                              <span>View Submitted Application</span>
                            </a>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB: Saved Opportunities */}
          {tab === "saved" && (
            <div className="space-y-6 text-left">
              <h2 className="text-xl font-bold text-foreground flex items-center gap-1.5">
                <Award className="w-5 h-5 text-primary" />
                <span>Saved Opportunities</span>
              </h2>

              {savedJobs.length === 0 ? (
                <div className="text-center py-12 text-muted">
                  <p className="text-xs">You haven't saved any opportunities yet.</p>
                  <a href="/jobs" className="text-xs font-bold text-primary hover:underline mt-2 inline-block">
                    Explore opportunities &rarr;
                  </a>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {savedJobs.map((saved: any) => {
                    const opp = saved.job || saved.fellowship || saved.internship || saved.grant || saved.consultancy || saved.volunteer || saved.scholarship || saved.event;
                    if (!opp) return null;
                    const publicUrl = getPublicUrl(opp);
                    return (
                      <div key={saved.id} className="p-4 sm:p-5 rounded-xl border border-card-border bg-neutral-50/50 dark:bg-zinc-900/50 space-y-3 w-full min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 w-full min-w-0">
                          <div className="text-left min-w-0 flex-1">
                            <h3 className="font-bold text-sm text-foreground break-words line-clamp-1">
                              <a 
                                href={publicUrl} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="hover:text-primary hover:underline inline-flex items-start sm:items-center gap-1 transition-colors"
                              >
                                <span>{opp.title || "Social Impact Role"}</span>
                                <ArrowUpRight className="w-3.5 h-3.5 text-muted shrink-0 mt-0.5 sm:mt-0" />
                              </a>
                            </h3>
                            <p className="text-xs text-muted mt-0.5 break-words line-clamp-1">At: <strong className="text-foreground">{opp.organization?.name || opp.organizer?.name || "Verified NGO"}</strong></p>
                          </div>
                        </div>
                        <div className="flex justify-start pt-2">
                          <a
                            href={publicUrl}
                            className="px-4 py-2 bg-primary hover:bg-primary-hover text-white text-xs font-semibold rounded-lg transition-colors inline-flex items-center gap-1.5 shadow-sm cursor-pointer"
                          >
                            <span>View Details</span>
                            <ArrowUpRight className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TABS 2: Profile, Settings */}
          {(tab === "profile" || tab === "settings") && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-foreground flex items-center gap-1.5">
                <User className="w-5 h-5 text-primary" />
                <span>My Seeker Profile</span>
              </h2>

              <SeekerProfileForm 
                userId={session.user.id} 
                initialProfile={{
                  name: candidate?.name,
                  email: candidate?.email,
                  bio: candidate?.bio,
                  skills: candidate?.skills || [],
                  experience: candidate?.experience,
                  experienceYears: candidate?.experienceYears,
                  educationDegree: candidate?.educationDegree,
                  languages: candidate?.languages || [],
                  location: candidate?.location,
                  resumeUrl: candidate?.resumeUrl,
                  profilePhoto: candidate?.profilePhoto
                }}
              />
            </div>
          )}

          {/* TABS 3: Tickets / My Events */}
          {tab === "tickets" && (
            <div className="space-y-6 text-left">
              <h2 className="text-xl font-bold text-foreground flex items-center gap-1.5">
                <Calendar className="w-5 h-5 text-primary" />
                <span>My Registered Events</span>
              </h2>

              {registrations.length === 0 ? (
                <div className="text-center py-12 text-muted">
                  <p className="text-xs">You haven't registered for any events yet.</p>
                  <a href="/events" className="text-xs font-bold text-primary hover:underline mt-2 inline-block">
                    Explore summits & webinars &rarr;
                  </a>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fadeIn">
                  {registrations.map((reg: any) => {
                    const event = reg.event;
                    if (!event) return null;
                    
                    const formatEventDate = (dateString?: string) => {
                      if (!dateString) return "TBA";
                      try {
                        const d = new Date(dateString);
                        return isNaN(d.getTime()) ? "TBA" : d.toLocaleDateString("en-GB");
                      } catch {
                        return "TBA";
                      }
                    };

                    const canJoinEvent = () => {
                      if (event.joinButtonVisibility === "MANUAL") return false;
                      if (event.joinButtonVisibility === "IMMEDIATE") return true;
                      if (!event.date || !event.time) return false;

                      try {
                        const eventDateTime = new Date(`${new Date(event.date).toISOString().split('T')[0]}T${event.time}`);
                        if (isNaN(eventDateTime.getTime())) return false;
                        
                        const now = new Date();
                        const diffMs = eventDateTime.getTime() - now.getTime();
                        const diffHours = diffMs / (1000 * 60 * 60);
                        const diffMinutes = diffMs / (1000 * 60);

                        if (event.joinButtonVisibility === "24H") return diffHours <= 24;
                        if (event.joinButtonVisibility === "1H") return diffHours <= 1;
                        if (event.joinButtonVisibility === "15M") return diffMinutes <= 15;
                      } catch {
                        return false;
                      }
                      return false;
                    };

                    const showJoinButton = canJoinEvent() && event.meetingLink && reg.status === "REGISTERED" || reg.status === "APPROVED";

                    return (
                      <div key={reg.id} className="p-4 sm:p-5 rounded-xl border border-card-border bg-neutral-50/50 dark:bg-zinc-900/50 space-y-4 w-full min-w-0 overflow-hidden shadow-sm flex flex-col justify-between">
                        <div className="min-w-0">
                          <div className="flex justify-between items-start">
                            <span className="text-[10px] font-bold text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded">
                              {event.format || "EVENT PASS"}
                            </span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                              reg.status === "CANCELLED" ? "bg-red-500/10 text-red-500" :
                              reg.status === "ATTENDED" ? "bg-emerald-500/10 text-emerald-500" :
                              "bg-zinc-200 dark:bg-zinc-800 text-muted"
                            }`}>
                              {reg.status}
                            </span>
                          </div>
                          
                          <h3 className="font-bold text-sm text-foreground mt-3 line-clamp-2">
                            <a href={`/events/${event.slug}`} target="_blank" className="hover:text-primary transition-colors">{event.title}</a>
                          </h3>
                          
                          <div className="space-y-1.5 mt-3 text-xs text-muted">
                            <p className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> {formatEventDate(event.date)}</p>
                            {event.time && <p className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {event.time} {event.timeZone}</p>}
                            {event.venue && <p className="flex items-center gap-1.5 truncate"><MapPin className="w-3.5 h-3.5" /> {event.venue}</p>}
                          </div>
                        </div>

                        {/* Actions & QR */}
                        <div className="pt-4 mt-2 border-t border-card-border flex flex-col gap-3">
                          {event.format !== "ONLINE" && (
                            <div className="flex items-center justify-between bg-white dark:bg-black p-3 rounded-lg border border-card-border w-full">
                              <div className="text-[10px] space-y-0.5">
                                <p className="font-bold text-foreground">Booking ID</p>
                                <code className="text-xs text-primary font-bold">{reg.qrCode || reg.id.substring(0,8)}</code>
                              </div>
                              <div className="w-10 h-10 bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center rounded border border-card-border shrink-0">
                                <div className="w-6 h-6 border border-black/50 dark:border-white/50 bg-[repeating-conic-gradient(black_0%_25%,transparent_0%_50%)] bg-[length:4px_4px]"></div>
                              </div>
                            </div>
                          )}

                          <div className="flex flex-wrap gap-2">
                            <a
                              href={`/events/${event.slug}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex-1 min-w-[120px] py-2 bg-neutral-200 dark:bg-neutral-800 hover:bg-neutral-300 dark:hover:bg-neutral-700 text-foreground text-center rounded-lg text-xs font-bold transition-colors"
                            >
                              View Event Details
                            </a>

                            <button className="flex-1 min-w-[120px] py-2 bg-neutral-200 dark:bg-neutral-800 hover:bg-neutral-300 dark:hover:bg-neutral-700 text-foreground text-center rounded-lg text-xs font-bold transition-colors">
                              View Registration
                            </button>

                            <a 
                              href={`data:text/calendar;charset=utf8,BEGIN:VCALENDAR%0AVERSION:2.0%0ABEGIN:VEVENT%0ASUMMARY:${encodeURIComponent(event.title)}%0AEND:VEVENT%0AEND:VCALENDAR`}
                              download="event.ics"
                              className="flex-1 min-w-[120px] py-2 bg-neutral-200 dark:bg-neutral-800 hover:bg-neutral-300 dark:hover:bg-neutral-700 text-foreground text-center rounded-lg text-xs font-bold transition-colors"
                            >
                              Add to Calendar
                            </a>

                            {(() => {
                              const isOnline = event.format === "ONLINE" || event.format === "HYBRID";
                              let isEventEnded = false;
                              try {
                                if (event.date && event.time) {
                                  const eventEndDateTime = event.endTime ? new Date(`${new Date(event.date).toISOString().split('T')[0]}T${event.endTime}`) : new Date(`${new Date(event.date).toISOString().split('T')[0]}T${event.time}`);
                                  if (!isNaN(eventEndDateTime.getTime()) && new Date() > eventEndDateTime) {
                                    isEventEnded = true; // Assuming if now > time, it's ended. (Usually we'd add duration, but we fallback to time or endTime)
                                  }
                                }
                              } catch {}

                              if (isEventEnded) {
                                return (
                                  <div className="w-full py-2 bg-neutral-200 dark:bg-neutral-800 text-muted text-center rounded-lg text-xs font-bold mt-2">
                                    Event Completed
                                  </div>
                                );
                              }

                              if (isOnline && reg.status !== "CANCELLED") {
                                if (showJoinButton) {
                                  return (
                                    <a href={event.meetingLink} target="_blank" rel="noopener noreferrer" className="w-full py-2 bg-primary hover:bg-primary-hover text-white text-center rounded-lg text-xs font-bold transition-colors mt-2 block">
                                      Join Event
                                    </a>
                                  );
                                } else {
                                  let message = "Join link will be available soon.";
                                  if (event.meetingLink && event.joinButtonVisibility !== "MANUAL") {
                                    if (event.joinButtonVisibility === "24H") message = "Join link available 24 hours before the event.";
                                    else if (event.joinButtonVisibility === "1H") message = "Join link available 1 hour before the event.";
                                    else if (event.joinButtonVisibility === "15M") message = "Join link available 15 minutes before the event.";
                                  }
                                  return (
                                    <div className="w-full py-2 bg-neutral-200 dark:bg-neutral-800 text-muted text-center rounded-lg text-xs font-bold mt-2">
                                      {message}
                                    </div>
                                  );
                                }
                              } else if (!isOnline && reg.status !== "CANCELLED") {
                                return (
                                  <div className="w-full py-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-center rounded-lg text-xs font-bold mt-2 border border-emerald-500/20">
                                    Registration confirmed.
                                  </div>
                                );
                              }
                              return null;
                            })()}

                            {reg.status === "REGISTERED" || reg.status === "APPROVED" || reg.status === "WAITLISTED" ? (
                               <form action={async () => {
                                 "use server";
                                 // Calling local internal function to just update DB (since it's a server component)
                                 const { cancelEventRegistrationAction } = await import("@/app/actions/candidate");
                                 await cancelEventRegistrationAction(reg.id);
                               }}>
                                 <button type="submit" className="px-3 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 text-center rounded-lg text-xs font-bold transition-colors h-full">
                                   Cancel
                                 </button>
                               </form>
                            ) : null}
                          </div>
                          
                          {event.joiningInstructions && (
                            <div className="p-2 bg-amber-500/10 border border-amber-500/20 rounded-md text-[10px] text-amber-600 dark:text-amber-400">
                              <strong>Instructions:</strong> {event.joiningInstructions}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TABS 4: Alerts */}
          {tab === "alerts" && (
            <AlertsView 
              notifications={notifications} 
              onMarkRead={handleMarkRead} 
            />
          )}

          {/* TABS 5: Support Helpdesk */}
          {tab === "support" && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-foreground flex items-center gap-1.5">
                <HelpCircle className="w-5 h-5 text-primary" />
                <span>Support Helpdesk</span>
              </h2>
              <SupportChat 
                userId={session.user.id} 
                userRole={session.user.role} 
                initialMessages={initialMessages} 
                adminConversations={[]}
                initialNotifications={notifications}
                onMarkRead={handleMarkRead}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
