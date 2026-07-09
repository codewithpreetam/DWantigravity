"use client";

import { useState, useEffect } from "react";
import { getUsersAction, updateUserStatusAction, deleteUsersAction } from "@/app/actions/admin-users";
import { UserStatus, UserRole } from "@prisma/client";
import { Search, Filter, Download, Trash2, Power, PowerOff, Shield, Briefcase, User as UserIcon } from "lucide-react";
import * as XLSX from "xlsx";
import toast from "react-hot-toast";
import { format } from "date-fns";

import CandidateWorkspace from "./CandidateWorkspace";

export default function UserManagement() {
  const [activeTab, setActiveTab] = useState<"ATS" | "SYSTEM">("ATS");
  
  // Traditional State for System Users (Employers/Admins)
  const [users, setUsers] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("EMPLOYER");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [sort, setSort] = useState("newest");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isExporting, setIsExporting] = useState(false);
  
  const limit = 20;

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await getUsersAction(page, limit, { search, role: roleFilter, status: statusFilter }, sort);
      setUsers(res.users);
      setTotal(res.total);
    } catch (error) {
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "SYSTEM") fetchUsers();
  }, [page, roleFilter, statusFilter, sort, activeTab]);

  useEffect(() => {
    if (activeTab === "SYSTEM") {
      const delayDebounceFn = setTimeout(() => {
        setPage(1);
        fetchUsers();
      }, 500);
      return () => clearTimeout(delayDebounceFn);
    }
  }, [search, activeTab]);

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) setSelectedIds(users.map(u => u.id));
    else setSelectedIds([]);
  };

  const handleSelect = (id: string) => {
    if (selectedIds.includes(id)) setSelectedIds(selectedIds.filter(i => i !== id));
    else setSelectedIds([...selectedIds, id]);
  };

  const handleBulkStatusUpdate = async (status: UserStatus) => {
    if (selectedIds.length === 0) return toast.error("Select users first");
    try {
      await updateUserStatusAction(selectedIds, status);
      toast.success(`Users marked as ${status}`);
      setSelectedIds([]);
      fetchUsers();
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return toast.error("Select users first");
    if (!confirm("Are you sure you want to delete selected users?")) return;
    try {
      await deleteUsersAction(selectedIds);
      toast.success("Users deleted");
      setSelectedIds([]);
      fetchUsers();
    } catch (error) {
      toast.error("Failed to delete users");
    }
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      let exportData = users;
      if (selectedIds.length > 0) {
        exportData = users.filter(u => selectedIds.includes(u.id));
      } else {
        const res = await getUsersAction(1, 10000, { search, role: roleFilter, status: statusFilter }, sort);
        exportData = res.users;
      }

      const formatted = exportData.map(u => {
        const base: any = {
          Name: u.name,
          Email: u.email,
          Role: u.role,
          Status: u.status,
          "Registration Date": u.createdAt ? format(new Date(u.createdAt), "PPP") : "N/A",
          "Phone": u.phone || "N/A",
          "Location": u.location || "N/A",
          "Job Title": u.jobTitle || "N/A",
          "Department": u.department || "N/A",
          "Role in Org": u.roleInOrg || "N/A",
          "Office Location": u.officeLocation || "N/A",
          "LinkedIn": u.linkedin || "N/A",
          "Total Posts (Jobs/Events/etc)": u.totalOpportunities,
        };

        if (u.organizationData) {
          const org = u.organizationData;
          base["Org Name"] = org.name;
          base["Org Website"] = org.website || "N/A";
          base["Org Industry"] = org.industry || "N/A";
        } else {
          base["Org Name"] = "N/A";
        }
        return base;
      });

      const ws = XLSX.utils.json_to_sheet(formatted);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "System_Users");
      XLSX.writeFile(wb, "System_Users_Export.xlsx");
      toast.success("Export successful");
    } catch (error) {
      toast.error("Export failed");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Module Navigation */}
      <div className="flex items-center gap-2 border-b border-border pb-4">
        <button 
          onClick={() => setActiveTab("ATS")}
          className={`px-4 py-2 font-bold rounded-lg transition-colors ${activeTab === "ATS" ? "bg-primary text-white" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}
        >
          Candidate ATS Workspace
        </button>
        <button 
          onClick={() => setActiveTab("SYSTEM")}
          className={`px-4 py-2 font-bold rounded-lg transition-colors ${activeTab === "SYSTEM" ? "bg-primary text-white" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}
        >
          Employers & Admins
        </button>
      </div>

      {activeTab === "ATS" ? (
        <CandidateWorkspace />
      ) : (
        <div className="space-y-6">
          {/* Controls */}
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between glass-panel p-4 rounded-xl">
            <div className="flex-1 w-full relative">
              <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search users by name, email, or organization..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              />
            </div>
            
            <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto">
              <select 
                value={roleFilter} 
                onChange={(e) => setRoleFilter(e.target.value)}
                className="px-4 py-2 bg-background border border-border rounded-lg focus:outline-none"
              >
                <option value="EMPLOYER">Employers</option>
                <option value="ADMIN">Admins</option>
                <option value="ALL">All (Excl Seekers)</option>
              </select>

              <select 
                value={statusFilter} 
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 bg-background border border-border rounded-lg focus:outline-none"
              >
                <option value="ALL">All Status</option>
                <option value="ACTIVE">Active</option>
                <option value="SUSPENDED">Suspended</option>
                <option value="DELETED">Deleted</option>
              </select>

              <select 
                value={sort} 
                onChange={(e) => setSort(e.target.value)}
                className="px-4 py-2 bg-background border border-border rounded-lg focus:outline-none"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="name-asc">Name (A-Z)</option>
                <option value="name-desc">Name (Z-A)</option>
              </select>

              <button 
                onClick={handleExport}
                disabled={isExporting}
                className="flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary hover:bg-primary/20 rounded-lg transition-colors whitespace-nowrap"
              >
                <Download className="w-4 h-4" />
                {isExporting ? "Exporting..." : "Export Excel"}
              </button>
            </div>
          </div>

          {/* Bulk Actions */}
          {selectedIds.length > 0 && (
            <div className="glass-panel p-4 rounded-xl flex items-center justify-between border-l-4 border-l-primary bg-primary/5">
              <span className="font-semibold text-foreground">{selectedIds.length} users selected</span>
              <div className="flex items-center gap-2">
                <button onClick={() => handleBulkStatusUpdate(UserStatus.ACTIVE)} className="px-3 py-1.5 text-sm bg-green-500/10 text-green-600 hover:bg-green-500/20 rounded-lg flex items-center gap-2">
                  <Power className="w-4 h-4" /> Activate
                </button>
                <button onClick={() => handleBulkStatusUpdate(UserStatus.SUSPENDED)} className="px-3 py-1.5 text-sm bg-amber-500/10 text-amber-600 hover:bg-amber-500/20 rounded-lg flex items-center gap-2">
                  <PowerOff className="w-4 h-4" /> Suspend
                </button>
                <button onClick={handleBulkDelete} className="px-3 py-1.5 text-sm bg-destructive/10 text-destructive hover:bg-destructive/20 rounded-lg flex items-center gap-2">
                  <Trash2 className="w-4 h-4" /> Delete
                </button>
              </div>
            </div>
          )}

          {/* Table */}
          <div className="glass-panel rounded-xl overflow-hidden border border-border">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-muted/50 border-b border-border text-sm text-muted-foreground">
                    <th className="p-4 w-12"><input type="checkbox" onChange={handleSelectAll} checked={users.length > 0 && selectedIds.length === users.length} className="rounded border-border text-primary focus:ring-primary/50" /></th>
                    <th className="p-4 font-semibold">User</th>
                    <th className="p-4 font-semibold">Role & Org</th>
                    <th className="p-4 font-semibold">Status</th>
                    <th className="p-4 font-semibold">Joined</th>
                    <th className="p-4 font-semibold text-right">Activity</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {loading ? (
                    <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">Loading users...</td></tr>
                  ) : users.length === 0 ? (
                    <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">No users found.</td></tr>
                  ) : (
                    users.map(user => (
                      <tr key={user.id} className="hover:bg-muted/30 transition-colors">
                        <td className="p-4"><input type="checkbox" checked={selectedIds.includes(user.id)} onChange={() => handleSelect(user.id)} className="rounded border-border text-primary focus:ring-primary/50" /></td>
                        <td className="p-4">
                          <div className="font-medium text-foreground">{user.name}</div>
                          <div className="text-xs text-muted-foreground">{user.email}</div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-1.5">
                            {user.role === 'ADMIN' ? <Shield className="w-3.5 h-3.5 text-primary" /> : <Briefcase className="w-3.5 h-3.5 text-amber-500" />}
                            <span className="font-medium text-sm capitalize">{user.role.toLowerCase()}</span>
                          </div>
                          {user.role === 'EMPLOYER' && <div className="text-xs text-muted-foreground mt-0.5">{user.organization || user.currentOrganization}</div>}
                        </td>
                        <td className="p-4">
                          <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${
                            user.status === 'ACTIVE' ? 'bg-green-500/10 text-green-600' :
                            user.status === 'SUSPENDED' ? 'bg-amber-500/10 text-amber-600' :
                            'bg-destructive/10 text-destructive'
                          }`}>
                            {user.status}
                          </span>
                        </td>
                        <td className="p-4 text-sm text-muted-foreground">
                          {user.createdAt ? format(new Date(user.createdAt), "MMM d, yyyy") : "N/A"}
                        </td>
                        <td className="p-4 text-right">
                          <div className="text-sm font-medium text-foreground">{`${user.totalOpportunities} Posts`}</div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            
            {/* Pagination */}
            <div className="p-4 border-t border-border flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Showing <span className="font-medium text-foreground">{users.length > 0 ? (page - 1) * limit + 1 : 0}</span> to <span className="font-medium text-foreground">{Math.min(page * limit, total)}</span> of <span className="font-medium text-foreground">{total}</span> users
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-1.5 text-sm font-medium bg-background border border-border rounded-lg disabled:opacity-50 hover:bg-muted"
                >
                  Previous
                </button>
                <button 
                  onClick={() => setPage(p => p + 1)}
                  disabled={page * limit >= total}
                  className="px-3 py-1.5 text-sm font-medium bg-background border border-border rounded-lg disabled:opacity-50 hover:bg-muted"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
