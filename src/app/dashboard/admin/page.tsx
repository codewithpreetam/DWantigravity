import { auth } from "@/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { 
  ShieldAlert, Building, Users, Briefcase, 
  Check, X, RefreshCw, ShieldCheck, Mail, Calendar, Bell, Send
} from "lucide-react";
import { UserRole, OrgStatus, ApplicationStage, OppStatus } from "@prisma/client";
import { approveOrganizationAction } from "@/app/actions/admin";
import SupportChat from "@/components/SupportChat";
import { 
  getAdminConversationsAction, 
  getNotificationsAction, 
  markNotificationsReadAction,
  broadcastNoticeAction
} from "@/app/actions/support";
import { DashboardMobileNav } from "@/components/DashboardMobileNav";
import OpportunityPostForm from "@/components/OpportunityPostForm";
import EventPostForm from "@/components/EventPostForm";
import UserManagement from "./components/UserManagement";
import OpportunityManagement from "./components/OpportunityManagement";
export const revalidate = 0;

interface PageProps {
  searchParams: Promise<{ tab?: string }>;
}

export default async function AdminDashboard(props: PageProps) {
  const searchParams = await props.searchParams;
  const session = await auth();
  if (!session?.user?.id || session.user.role !== UserRole.ADMIN) {
    return redirect("/auth/signin?callbackUrl=/dashboard/admin");
  }

  const tab = searchParams.tab || "approvals";

  // Fetch pending orgs
  const pendingOrgs = await db.organization.findMany({
    where: { status: "PENDING" },
    orderBy: { createdAt: "desc" },
  });

  const adminOrgs = await db.organization.findMany({
    where: { status: "APPROVED" },
    select: { id: true, name: true },
    orderBy: { name: "asc" }
  });

  // Fetch approved orgs
  const approvedOrgs = await db.organization.findMany({
    where: { status: OrgStatus.APPROVED }
  });


  // Fetch counts
  const totalUsers = await db.user.count();
  const totalJobs = await db.job.count();
  const totalEmployers = await db.user.count({ where: { role: UserRole.EMPLOYER } });
  const totalSeekers = await db.user.count({ where: { role: UserRole.SEEKER } });
  const totalApplications = await db.application.count();

  // Load chat & support details
  const initialMessages = await db.message.findMany();
  const adminConversations = await getAdminConversationsAction();
  const notifications = await getNotificationsAction(session.user.id);

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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1">
      {/* Header Banner */}
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-extrabold text-foreground tracking-tight flex items-center gap-1.5">
            <ShieldAlert className="w-6 h-6 text-primary" />
            <span>Platform Admin CMS</span>
          </h1>
          <p className="text-xs text-muted">Moderate NGO registrations, manage listings, and audit system metrics.</p>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="glass-panel p-4 md:p-6 rounded-xl flex items-center gap-4 border border-border">
          <div className="p-3 bg-secondary/10 text-secondary rounded-lg"><Users className="w-5 h-5" /></div>
          <div>
            <div className="text-xl md:text-2xl font-bold text-foreground">{totalUsers}</div>
            <p className="text-xs text-muted font-medium">Total Users</p>
          </div>
        </div>
        <div className="glass-panel p-4 md:p-6 rounded-xl flex items-center gap-4 border border-border">
          <div className="p-3 bg-primary/10 text-primary rounded-lg"><Building className="w-5 h-5" /></div>
          <div>
            <div className="text-xl md:text-2xl font-bold text-foreground">{totalEmployers}</div>
            <p className="text-xs text-muted font-medium">Employers</p>
          </div>
        </div>
        <div className="glass-panel p-4 md:p-6 rounded-xl flex items-center gap-4 border border-border">
          <div className="p-3 bg-amber-500/10 text-amber-500 rounded-lg"><Briefcase className="w-5 h-5" /></div>
          <div>
            <div className="text-xl md:text-2xl font-bold text-foreground">{totalJobs}</div>
            <p className="text-xs text-muted font-medium">Active Jobs</p>
          </div>
        </div>
        <div className="glass-panel p-4 md:p-6 rounded-xl flex items-center gap-4 border border-border">
          <div className="p-3 bg-green-500/10 text-green-500 rounded-lg"><Check className="w-5 h-5" /></div>
          <div>
            <div className="text-xl md:text-2xl font-bold text-foreground">{totalApplications}</div>
            <p className="text-xs text-muted font-medium">Applications</p>
          </div>
        </div>
      </div>

      {/* Mobile Nav */}
      <DashboardMobileNav 
        tabs={[
          { id: "approvals", label: "NGO Verification", icon: <Building className="w-4 h-4 shrink-0" /> },
          { id: "users", label: "Users", icon: <Users className="w-4 h-4 shrink-0" /> },
          { id: "new-job", label: "Post Opportunity", icon: <Briefcase className="w-4 h-4 shrink-0" /> },
          { id: "new-event", label: "Post Event", icon: <Calendar className="w-4 h-4 shrink-0" /> },
          { id: "opportunities", label: "Opportunities", icon: <Briefcase className="w-4 h-4 shrink-0" /> },
          { id: "listings", label: "Partner Directory", icon: <ShieldCheck className="w-4 h-4 shrink-0" /> },
          { id: "support", label: "Support", icon: <Mail className="w-4 h-4 shrink-0" /> },
          { id: "notices", label: "System Notices", icon: <Bell className="w-4 h-4 shrink-0" /> },
        ]}
        basePath="/dashboard/admin"
        title="Admin CMS"
      />

      {/* Content Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Navigation Sidebar */}
        <div className="hidden lg:block lg:col-span-3 space-y-2">
          {[
            { id: "approvals", label: "NGO Verification", icon: Building },
            { id: "users", label: "User Management", icon: Users },
            { id: "new-job", label: "Post Opportunity", icon: Briefcase },
            { id: "new-event", label: "Post Event", icon: Calendar },
            { id: "opportunities", label: "Opportunity Manager", icon: Briefcase },
            { id: "listings", label: "Partner Directory", icon: ShieldCheck },
            { id: "support", label: "Support Helpdesk", icon: Mail },
            { id: "notices", label: "System Notices", icon: Bell },
          ].map((item) => {
            const Icon = item.icon;
            const isSelected = tab === item.id;
            return (
              <a
                key={item.id}
                href={`/dashboard/admin?tab=${item.id}`}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold border transition-all ${
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
        </div>

        {/* Content Pane */}
        <div className="lg:col-span-9 glass-panel p-6 rounded-2xl min-h-[45vh]">
          {/* TAB 1: Pending Approvals */}
          {tab === "approvals" && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-foreground">Pending NGO Verifications</h2>

              {pendingOrgs.length === 0 ? (
                <p className="text-xs text-muted italic">There are no pending NGO verification requests currently.</p>
              ) : (
                <div className="space-y-4">
                  {pendingOrgs.map((org: any) => (
                    <div key={org.id} className="p-5 rounded-xl border border-card-border bg-neutral-50/50 dark:bg-zinc-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="space-y-1 text-left">
                        <h3 className="font-extrabold text-sm text-foreground">{org.name}</h3>
                        <p className="text-[10px] text-muted">Owner ID: {org.ownerId}</p>
                        <p className="text-xs text-muted leading-relaxed max-w-lg mt-1">{org.description || "No mission statement entered yet."}</p>
                      </div>

                      <div className="flex gap-2 shrink-0">
                        {/* Approve Form */}
                        <form
                          action={async () => {
                            "use server";
                            await approveOrganizationAction(org.id, OrgStatus.APPROVED);
                          }}
                        >
                          <button
                            type="submit"
                            className="p-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg flex items-center justify-center transition-colors cursor-pointer"
                            title="Verify NGO"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                        </form>

                        {/* Reject Form */}
                        <form
                          action={async () => {
                            "use server";
                            await approveOrganizationAction(org.id, OrgStatus.REJECTED);
                          }}
                        >
                          <button
                            type="submit"
                            className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg flex items-center justify-center transition-colors cursor-pointer"
                            title="Reject Registration"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </form>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: Verified Partner List */}
          {tab === "listings" && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-foreground">Verified NGO Partners</h2>

              {approvedOrgs.length === 0 ? (
                <p className="text-xs text-muted italic">No verified NGO partners registered.</p>
              ) : (
                <div className="space-y-4">
                  {approvedOrgs.map((org: any) => (
                    <div key={org.id} className="p-4 rounded-xl border border-card-border bg-neutral-50/50 dark:bg-zinc-900/50 flex flex-col sm:flex-row sm:items-center justify-between items-start gap-4">
                      <div className="text-left min-w-0">
                        <h3 className="font-bold text-sm text-foreground flex flex-wrap items-center gap-1 break-words">
                          <span>{org.name}</span>
                          <Check className="w-3.5 h-3.5 text-primary shrink-0" />
                        </h3>
                        <p className="text-[10px] text-muted truncate">{org.website || "No website link"}</p>
                      </div>

                      <form
                        action={async () => {
                          "use server";
                          await approveOrganizationAction(org.id, OrgStatus.PENDING);
                        }}
                      >
                        <button
                          type="submit"
                          className="px-3 py-1.5 bg-neutral-200 dark:bg-neutral-800 text-foreground text-xs font-semibold rounded-lg hover:bg-neutral-300 dark:hover:bg-neutral-700 transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                          <span>Revoke Verification</span>
                        </button>
                      </form>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: Users */}
          {tab === "users" && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-foreground">User Management</h2>
              <UserManagement />
            </div>
          )}

          {/* TAB 4: Opportunities */}
          {tab === "opportunities" && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-foreground">Opportunity Management</h2>
              <OpportunityManagement />
            </div>
          )}

          {/* TAB 4.5: Post Opportunity */}
          {tab === "support" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl md:text-2xl font-bold text-foreground tracking-tight">Admin Support Desk</h2>
                <p className="text-xs text-muted">Manage support conversations with NGOs and Candidates.</p>
              </div>
              <div className="glass-panel p-1 rounded-2xl border border-border">
                <SupportChat userId={session.user.id} userRole={session.user.role} initialMessages={[]} adminConversations={adminConversations} />
              </div>
            </div>
          )}

          {tab === "notices" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl md:text-2xl font-bold text-foreground tracking-tight">System Notices</h2>
                <p className="text-xs text-muted">Broadcast global notices or alerts to user dashboards.</p>
              </div>
              <form 
                action={async (formData: FormData) => {
                  "use server";
                  await broadcastNoticeAction(formData);
                }} 
                className="glass-panel p-6 rounded-2xl border border-card-border space-y-4"
              >
                <div className="flex flex-col gap-2">
                  <label className="font-semibold text-xs text-muted">Notice Title</label>
                  <input type="text" name="title" required placeholder="e.g. Scheduled Maintenance" className="form-input" />
                </div>
                
                <div className="flex flex-col gap-2">
                  <label className="font-semibold text-xs text-muted">Message body</label>
                  <textarea name="message" required rows={4} placeholder="Type your notice here..." className="form-input"></textarea>
                </div>
                
                <div className="flex flex-col gap-2">
                  <label className="font-semibold text-xs text-muted">Target Audience</label>
                  <select name="audience" className="form-input">
                    <option value="ALL">All Users (Employers & Candidates)</option>
                    <option value="EMPLOYERS">Employers Only</option>
                    <option value="CANDIDATES">Candidates Only</option>
                  </select>
                </div>
                
                <button type="submit" className="px-6 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg font-bold flex items-center gap-2 cursor-pointer transition-colors mt-2">
                  <Send className="w-4 h-4" /> Broadcast Notice
                </button>
              </form>
            </div>
          )}

          {/* TAB 4.5: Post Opportunity */}
          {tab === "new-job" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-bold text-foreground">Post Opportunity (Admin Override)</h2>
                <p className="text-xs text-muted mt-0.5">Post an opportunity directly on behalf of any approved NGO.</p>
              </div>
              <OpportunityPostForm adminOrgs={adminOrgs} />
            </div>
          )}

          {/* TAB 4.6: Post Event */}
          {tab === "new-event" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-bold text-foreground">Post Event (Admin Override)</h2>
                <p className="text-xs text-muted mt-0.5">Post an event directly on behalf of any approved NGO.</p>
              </div>
              <EventPostForm adminOrgs={adminOrgs} />
            </div>
          )}

          {/* TAB 5: Support Helpdesk */}
          {tab === "support" && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-foreground">Support Helpdesk Chatroom</h2>
              <SupportChat 
                userId={session.user.id} 
                userRole={session.user.role} 
                initialMessages={initialMessages} 
                adminConversations={adminConversations}
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
