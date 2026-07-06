import { auth } from "@/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { 
  User, Briefcase, Calendar, 
  Sparkles, Award, CheckCircle, RefreshCw, Mail, ArrowUpRight, Bell,
  FileText, HelpCircle, LogOut, Settings
} from "lucide-react";
import { UserRole } from "@prisma/client";
import SupportChat from "@/components/SupportChat";
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

  // Simple list of jobs for AI matching
  const allJobs = await db.job.findMany();

  // Load support & messages
  const initialMessages = await getMessagesAction(session.user.id);
  const notifications = await getNotificationsAction(session.user.id);

  if (tab === "notifications") {
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1">
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
            <p className="text-xs text-muted mt-0.5 truncate">Welcome back, <strong className="text-foreground">{candidate?.name || candidate?.email}</strong>. Manage your profile and applications.</p>
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
          { id: "resumes", label: "Resumes", icon: <FileText className="w-4 h-4 shrink-0" /> },
          { id: "cover-letters", label: "Cover Letters", icon: <FileText className="w-4 h-4 shrink-0" /> },
          { id: "tickets", label: "Event Tickets", icon: <Calendar className="w-4 h-4 shrink-0" /> },
          { id: "notifications", label: "Notifications", icon: <Bell className="w-4 h-4 shrink-0" /> },
        ]}
        basePath="/dashboard/candidate"
        title="Candidate Dashboard"
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Navigation Sidebar — desktop only */}
        <div className="hidden lg:block lg:col-span-3 space-y-2">
          {/* Sidebar Menu Links */}
          {[
            { id: "dashboard", label: "Dashboard", icon: Briefcase, fallbackTab: "applications" },
            { id: "applications", label: "My Applications", icon: Briefcase },
            { id: "saved", label: "Saved Opportunities", icon: Award, fallbackTab: "applications" },
            { id: "profile", label: "My Profile", icon: User },
            { id: "resumes", label: "Resumes", icon: FileText, fallbackTab: "profile" },
            { id: "cover-letters", label: "Cover Letters", icon: FileText, fallbackTab: "profile" },
            { id: "tickets", label: "Event Tickets", icon: Calendar },
            { id: "notifications", label: "Notifications", icon: Bell },
            { id: "settings", label: "Account Settings", icon: Settings, fallbackTab: "profile" },
            { id: "support", label: "Help & Support", icon: HelpCircle, fallbackTab: "notifications" }
          ].map((item) => {
            const Icon = item.icon;
            // Many of these map to existing tabs for now, but visually match screenshot
            const targetTab = item.fallbackTab || item.id;
            const isSelected = tab === targetTab && (item.id === "applications" || item.id === "profile" || item.id === "tickets" || item.id === "notifications");
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
        <div className="lg:col-span-9 glass-panel p-6 rounded-2xl min-h-[50vh]">
          {/* TABS 1: Applications */}
          {tab === "applications" && (
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
                  {applications.map((app: any) => {
                    const opp = app.job || app.fellowship || app.internship || app.grant || app.consultancy || app.volunteer || app.scholarship || app.event;
                    const publicUrl = getPublicUrl(opp);
                    return (
                      <div key={app.id} className="p-5 rounded-xl border border-card-border bg-neutral-50/50 dark:bg-zinc-900/50 space-y-3">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div className="text-left">
                            <h3 className="font-bold text-sm text-foreground">
                              <a 
                                href={publicUrl} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="hover:text-primary hover:underline inline-flex items-center gap-1 transition-colors"
                              >
                                <span>{opp?.title || "Social Impact Role"}</span>
                                <ArrowUpRight className="w-3.5 h-3.5 text-muted shrink-0" />
                              </a>
                            </h3>
                            <p className="text-xs text-muted mt-0.5">Applied at: <strong className="text-foreground">{opp?.organization?.name || "Verified NGO"}</strong></p>
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
                        <div className="text-xs text-muted">
                          <strong>Your Pitch:</strong> <span className="line-clamp-2">{app.coverLetter}</span>
                        </div>
                        {app.feedback && (
                          <div className="p-3 rounded-lg bg-primary/5 text-primary text-xs leading-relaxed border border-primary/10">
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
            </div>
          )}

          {/* TABS 2: Profile */}
          {tab === "profile" && (
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

          {/* TABS 3: Tickets */}
          {tab === "tickets" && (
            <div className="space-y-6">
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
                  {registrations.map((reg: any) => (
                    <div key={reg.id} className="p-5 rounded-xl border border-card-border bg-neutral-50/50 dark:bg-zinc-900/50 space-y-4">
                      <div>
                        <span className="text-[10px] font-bold text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded">
                          DW Event Pass
                        </span>
                        <h3 className="font-bold text-sm text-foreground mt-2">{reg.event?.title || "National NGO Summit"}</h3>
                        <p className="text-xs text-muted flex items-center gap-1 mt-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {new Date(reg.event?.date).toLocaleDateString()}
                        </p>
                      </div>

                      {/* QR Ticket Mock */}
                      <div className="flex items-center gap-4 bg-white dark:bg-black p-3 rounded-lg border border-card-border w-fit">
                        <div className="w-14 h-14 bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center rounded border border-card-border">
                          {/* Simulated QR Code box */}
                          <div className="w-10 h-10 border border-black/50 dark:border-white/50 bg-[repeating-conic-gradient(black_0%_25%,transparent_0%_50%)] bg-[length:6px_6px]"></div>
                        </div>
                        <div className="text-[10px] space-y-0.5">
                          <p className="font-bold text-foreground">Pass Reference</p>
                          <code className="text-xs text-primary font-bold">{reg.qrCode}</code>
                          <p className="text-muted">Awaiting check-in</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TABS 4: Notifications */}
          {tab === "notifications" && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-foreground flex items-center gap-1.5">
                <Bell className="w-5 h-5 text-primary" />
                <span>My Notifications</span>
              </h2>

              {notifications.length === 0 ? (
                <div className="text-center py-12 text-muted">
                  <p className="text-xs">You have no new notifications.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {notifications.map((notif: any) => (
                    <div 
                      key={notif.id} 
                      className={`p-4 rounded-xl border transition-all text-left flex justify-between items-start gap-4 ${
                        notif.read 
                          ? "bg-white/45 dark:bg-zinc-950/10 border-card-border/50 opacity-80" 
                          : "bg-primary/5 border-primary/20 shadow-sm"
                      }`}
                    >
                      <div className="space-y-1">
                        <h4 className="font-bold text-xs text-foreground flex items-center gap-1.5">
                          {!notif.read && <span className="w-2 h-2 rounded-full bg-primary shrink-0" />}
                          <span>{notif.title}</span>
                        </h4>
                        <p className="text-xs text-muted leading-relaxed">{notif.message}</p>
                        <span className="text-[10px] text-muted block mt-1">
                          {new Date(notif.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
