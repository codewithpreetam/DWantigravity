"use client";

import React, { useState, useEffect } from "react";
import { getUsersAction, updateUserStatusAction, deleteUsersAction } from "@/app/actions/admin-users";
import { UserStatus } from "@prisma/client";
import { Search, Filter, Download, Trash2, Shield, User as UserIcon, X, ChevronRight, Mail, FileText, CheckCircle, Briefcase, MapPin, GraduationCap, XCircle } from "lucide-react";
import * as XLSX from "xlsx";
import toast from "react-hot-toast";
import { format } from "date-fns";

export default function CandidateWorkspace() {
  const [users, setUsers] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState("newest");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isExporting, setIsExporting] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<any | null>(null);

  const [filters, setFilters] = useState({
    search: "",
    role: "SEEKER",
    status: "ALL",
    domain: "",
    secondaryDomain: "",
    workModePreference: "",
    employmentTypePreference: "",
    educationDegree: "",
    location: "",
    experienceYearsMin: "",
    experienceYearsMax: "",
    noticePeriod: "",
    employmentStatus: "",
    availability: "",
    hasResume: "ALL",
    skills: [] as string[],
    languages: [] as string[],
  });

  const limit = 20;

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await getUsersAction(page, limit, filters, sort);
      setUsers(res.users);
      setTotal(res.total);
    } catch (error) {
      toast.error("Failed to load candidates");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page, sort, filters.role, filters.status, filters.hasResume]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      setPage(1);
      fetchUsers();
    }, 800);
    return () => clearTimeout(delayDebounceFn);
  }, [
    filters.search, filters.domain, filters.secondaryDomain, filters.workModePreference,
    filters.employmentTypePreference, filters.educationDegree, filters.location,
    filters.experienceYearsMin, filters.experienceYearsMax, filters.noticePeriod,
    filters.employmentStatus, filters.availability, filters.skills, filters.languages
  ]);

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) setSelectedIds(users.map(u => u.id));
    else setSelectedIds([]);
  };

  const handleSelect = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedIds.includes(id)) setSelectedIds(selectedIds.filter(i => i !== id));
    else setSelectedIds([...selectedIds, id]);
  };

  const handleBulkStatusUpdate = async (status: UserStatus) => {
    if (selectedIds.length === 0) return toast.error("Select candidates first");
    try {
      await updateUserStatusAction(selectedIds, status);
      toast.success(`Candidates marked as ${status}`);
      setSelectedIds([]);
      fetchUsers();
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      let exportData = users;
      if (selectedIds.length > 0) {
        exportData = users.filter(u => selectedIds.includes(u.id));
      } else {
        const res = await getUsersAction(1, 10000, filters, sort);
        exportData = res.users;
      }

      const formatted = exportData.map(u => {
        return {
          Name: u.name,
          Email: u.email,
          Phone: u.phone || "N/A",
          Status: u.status,
          "Registration Date": u.createdAt ? format(new Date(u.createdAt), "PPP") : "N/A",
          Location: u.location || "N/A",
          Bio: u.bio || u.shortBio || "N/A",
          Domain: u.domain || "N/A",
          "Current Organization": u.currentOrganization || "N/A",
          Designation: u.jobTitle || "N/A",
          Skills: u.skills?.join(", ") || "N/A",
          Experience: u.experienceYears || 0,
          "Highest Degree": u.educationDegree || "N/A",
          Languages: u.languages?.join(", ") || "N/A",
          "Work Mode": u.workModePreference || "N/A",
          "Employment Type": u.employmentTypePreference || "N/A",
          "Applications Submitted": u.totalApplications,
          "Resume / CV": u.resumeUrl ? `${window.location.origin}/api/admin/resume/${u.id}` : "N/A",
          __originalResumeUrl: u.resumeUrl || null
        };
      });

      const ws = XLSX.utils.json_to_sheet(formatted.map(row => {
        const { __originalResumeUrl, ...rest } = row;
        return rest;
      }));

      const range = XLSX.utils.decode_range(ws['!ref'] || "A1:A1");
      let resumeColIndex = -1;
      
      for (let C = range.s.c; C <= range.e.c; ++C) {
        const cellAddress = XLSX.utils.encode_cell({ c: C, r: 0 });
        if (ws[cellAddress] && ws[cellAddress].v === "Resume / CV") {
          resumeColIndex = C;
          break;
        }
      }

      if (resumeColIndex !== -1) {
        for (let R = 1; R <= range.e.r; ++R) {
          const cellAddress = XLSX.utils.encode_cell({ c: resumeColIndex, r: R });
          const rowData = formatted[R - 1];
          if (ws[cellAddress] && rowData.__originalResumeUrl) {
            ws[cellAddress].l = { Target: `${window.location.origin}/api/admin/resume/${exportData[R-1].id}`, Tooltip: "Click to View Resume" };
            ws[cellAddress].s = { font: { color: { rgb: "0563C1" }, underline: true } };
          }
        }
      }

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Candidates");
      XLSX.writeFile(wb, "Candidates_Export.xlsx");
      toast.success("Export successful");
    } catch (error) {
      toast.error("Export failed");
    } finally {
      setIsExporting(false);
    }
  };

  const updateFilter = (key: string, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleSkillAdd = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && e.currentTarget.value) {
      e.preventDefault();
      const val = e.currentTarget.value.trim();
      if (val && !filters.skills.includes(val)) {
        updateFilter("skills", [...filters.skills, val]);
      }
      e.currentTarget.value = "";
    }
  };

  const removeSkill = (skill: string) => {
    updateFilter("skills", filters.skills.filter(s => s !== skill));
  };

  return (
    <div className="flex h-[calc(100vh-6rem)] -m-4 bg-background overflow-hidden relative">
      
      {/* LEFT SIDEBAR: ADVANCED FILTERS */}
      <div className="w-72 flex-shrink-0 border-r border-border bg-card overflow-y-auto flex flex-col hidden lg:flex">
        <div className="p-4 border-b border-border sticky top-0 bg-card/95 backdrop-blur z-10 flex items-center justify-between">
          <h2 className="font-bold text-foreground flex items-center gap-2">
            <Filter className="w-4 h-4" /> Advanced Filters
          </h2>
          <button 
            onClick={() => setFilters({
              search: "", role: "SEEKER", status: "ALL", domain: "", secondaryDomain: "", workModePreference: "",
              employmentTypePreference: "", educationDegree: "", location: "", experienceYearsMin: "",
              experienceYearsMax: "", noticePeriod: "", employmentStatus: "", availability: "", hasResume: "ALL",
              skills: [], languages: []
            })}
            className="text-xs text-primary hover:underline font-medium cursor-pointer"
          >
            Clear All
          </button>
        </div>
        
        <div className="p-4 space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Keywords</label>
            <div className="relative">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
              <input 
                type="text" 
                placeholder="Name, email, designation..." 
                value={filters.search}
                onChange={(e) => updateFilter("search", e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-background border border-border rounded-lg text-sm focus:ring-1 focus:ring-primary focus:border-primary outline-none"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Domain & Expertise</label>
            <select 
              value={filters.domain} 
              onChange={e => updateFilter("domain", e.target.value)}
              className="w-full p-2 bg-background border border-border rounded-lg text-sm outline-none"
            >
              <option value="">Any Domain</option>
              <option value="Education">Education</option>
              <option value="Health">Health</option>
              <option value="Climate Change">Climate Change</option>
              <option value="Livelihoods">Livelihoods</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Required Skills (Match All)</label>
            <input 
              type="text" 
              placeholder="Type skill & press Enter..." 
              onKeyDown={handleSkillAdd}
              className="w-full p-2 bg-background border border-border rounded-lg text-sm outline-none"
            />
            {filters.skills.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {filters.skills.map(s => (
                  <span key={s} className="px-2 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full flex items-center gap-1">
                    {s}
                    <X className="w-3 h-3 cursor-pointer hover:text-red-500" onClick={() => removeSkill(s)} />
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Experience (Years)</label>
            <div className="flex gap-2">
              <input 
                type="number" 
                placeholder="Min" 
                value={filters.experienceYearsMin}
                onChange={e => updateFilter("experienceYearsMin", e.target.value)}
                className="w-1/2 p-2 bg-background border border-border rounded-lg text-sm outline-none"
              />
              <input 
                type="number" 
                placeholder="Max" 
                value={filters.experienceYearsMax}
                onChange={e => updateFilter("experienceYearsMax", e.target.value)}
                className="w-1/2 p-2 bg-background border border-border rounded-lg text-sm outline-none"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Resume / CV Status</label>
            <select 
              value={filters.hasResume} 
              onChange={e => updateFilter("hasResume", e.target.value)}
              className="w-full p-2 bg-background border border-border rounded-lg text-sm outline-none"
            >
              <option value="ALL">Any</option>
              <option value="yes">Has Resume Uploaded</option>
              <option value="no">No Resume</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Location</label>
            <input 
              type="text" 
              placeholder="City, State, Country..." 
              value={filters.location}
              onChange={(e) => updateFilter("location", e.target.value)}
              className="w-full p-2 bg-background border border-border rounded-lg text-sm outline-none"
            />
          </div>

        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        
        {/* DASHBOARD STATS BANNER */}
        <div className="bg-primary/5 border-b border-border p-4 flex gap-6 overflow-x-auto shrink-0">
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Total Candidates</span>
            <span className="text-2xl font-bold text-foreground">{total.toLocaleString()}</span>
          </div>
          <div className="w-px bg-border my-2"></div>
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Selected</span>
            <span className="text-2xl font-bold text-primary">{selectedIds.length}</span>
          </div>
        </div>

        {/* BULK ACTIONS & SORTING BAR */}
        <div className="p-4 border-b border-border bg-card flex flex-wrap items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-2">
            {selectedIds.length > 0 && (
              <>
                <button onClick={handleExport} className="px-3 py-1.5 bg-primary text-white text-sm font-medium rounded-md shadow flex items-center gap-2 hover:bg-primary/90 transition-colors cursor-pointer">
                  <Download className="w-4 h-4" /> Export Selected
                </button>
                <button onClick={() => handleBulkStatusUpdate("ACTIVE")} className="px-3 py-1.5 border border-border text-foreground hover:bg-muted text-sm font-medium rounded-md shadow-sm transition-colors cursor-pointer">
                  Mark Active
                </button>
              </>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground font-medium">Sort by:</span>
            <select 
              value={sort} 
              onChange={e => setSort(e.target.value)}
              className="p-1.5 text-sm bg-background border border-border rounded-md outline-none"
            >
              <option value="newest">Newest Registered</option>
              <option value="experience-desc">Highest Experience</option>
              <option value="lastActive-desc">Recently Active</option>
              <option value="name-asc">Name (A-Z)</option>
            </select>
          </div>
        </div>

        {/* DATA TABLE */}
        <div className="flex-1 overflow-auto bg-card">
          <table className="w-full text-left border-collapse text-sm whitespace-nowrap">
            <thead className="bg-muted/50 sticky top-0 z-10 backdrop-blur">
              <tr className="text-muted-foreground text-xs uppercase tracking-wider">
                <th className="p-4 w-12"><input type="checkbox" onChange={handleSelectAll} checked={users.length > 0 && selectedIds.length === users.length} className="rounded border-border" /></th>
                <th className="p-4 font-semibold">Candidate</th>
                <th className="p-4 font-semibold">Experience & Role</th>
                <th className="p-4 font-semibold">Domain</th>
                <th className="p-4 font-semibold text-center">Resume</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">Searching candidates...</td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">No matching candidates found.</td></tr>
              ) : (
                users.map(user => (
                  <tr 
                    key={user.id} 
                    onClick={() => setSelectedCandidate(user)}
                    className="hover:bg-muted/30 transition-colors cursor-pointer group"
                  >
                    <td className="p-4" onClick={e => e.stopPropagation()}>
                      <input type="checkbox" checked={selectedIds.includes(user.id)} onChange={(e) => handleSelect(user.id, e as any)} className="rounded border-border text-primary focus:ring-primary/50" />
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        {user.image ? (
                          <img src={user.image} alt="" className="w-10 h-10 rounded-full object-cover border border-border" />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">
                            {user.name?.charAt(0) || "U"}
                          </div>
                        )}
                        <div>
                          <div className="font-semibold text-foreground flex items-center gap-2">
                            {user.name} 
                            {user.status === 'ACTIVE' && <CheckCircle className="w-3.5 h-3.5 text-green-500" />}
                          </div>
                          <div className="text-xs text-muted-foreground">{user.email}</div>
                          <div className="text-xs text-muted-foreground mt-0.5">{user.location || "Location not specified"}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="font-medium text-foreground">{user.jobTitle || "No designation"}</div>
                      <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                        <Briefcase className="w-3 h-3" /> {user.experienceYears} Years Exp
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="px-2.5 py-1 bg-primary/5 text-primary text-xs font-semibold rounded-full border border-primary/10">
                        {user.domain || "N/A"}
                      </span>
                    </td>
                    <td className="p-4 text-center" onClick={e => e.stopPropagation()}>
                      {user.resumeUrl ? (
                        <div className="flex items-center justify-center gap-1.5">
                          <a 
                            href={`/api/admin/resume/${user.id}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="px-2 py-1 text-xs font-semibold bg-primary/10 text-primary hover:bg-primary/20 rounded border border-primary/20 transition-colors flex items-center gap-1"
                          >
                            <FileText className="w-3 h-3" /> View
                          </a>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground italic">Missing</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="p-4 border-t border-border bg-card flex items-center justify-between shrink-0">
          <div className="text-sm text-muted-foreground">
            Showing <span className="font-medium text-foreground">{users.length > 0 ? (page - 1) * limit + 1 : 0}</span> to <span className="font-medium text-foreground">{Math.min(page * limit, total)}</span> of <span className="font-medium text-foreground">{total}</span> candidates
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1.5 text-sm font-medium bg-background border border-border rounded-lg disabled:opacity-50 hover:bg-muted transition-colors"
            >
              Previous
            </button>
            <button 
              onClick={() => setPage(p => p + 1)}
              disabled={page * limit >= total}
              className="px-3 py-1.5 text-sm font-medium bg-background border border-border rounded-lg disabled:opacity-50 hover:bg-muted transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* CANDIDATE PREVIEW SIDE PANEL (DRAWER) */}
      {selectedCandidate && (
        <div className="absolute inset-y-0 right-0 w-full max-w-md bg-card border-l border-border shadow-2xl z-50 flex flex-col transform transition-transform duration-300 ease-in-out">
          
          <div className="flex items-center justify-between p-4 border-b border-border shrink-0">
            <h3 className="font-bold text-foreground">Candidate Profile Preview</h3>
            <button onClick={() => setSelectedCandidate(null)} className="p-1 text-muted-foreground hover:bg-muted rounded-full transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            <div className="flex items-start gap-4">
              {selectedCandidate.image ? (
                <img src={selectedCandidate.image} alt="" className="w-16 h-16 rounded-full object-cover border-2 border-border shadow-sm" />
              ) : (
                <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-2xl shadow-sm">
                  {selectedCandidate.name?.charAt(0) || "U"}
                </div>
              )}
              <div className="flex-1">
                <h2 className="text-xl font-bold text-foreground">{selectedCandidate.name}</h2>
                <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                  <Mail className="w-3.5 h-3.5" /> {selectedCandidate.email}
                </p>
                <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                  <MapPin className="w-3.5 h-3.5" /> {selectedCandidate.location || "Location not provided"}
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              <a href={`mailto:${selectedCandidate.email}`} className="flex-1 py-2 bg-primary text-white text-sm font-semibold rounded-lg shadow text-center hover:bg-primary/90 transition-colors">
                Email Candidate
              </a>
              {selectedCandidate.resumeUrl && (
                <a 
                  href={`/api/admin/resume/${selectedCandidate.id}?download=1`} 
                  className="flex-1 py-2 bg-background border border-border text-foreground text-sm font-semibold rounded-lg shadow-sm text-center hover:bg-muted transition-colors flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" /> Download CV
                </a>
              )}
            </div>

            <div className="space-y-4 pt-4 border-t border-border">
              <div>
                <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Professional Summary</h4>
                <p className="text-sm text-foreground leading-relaxed">{selectedCandidate.bio || selectedCandidate.shortBio || "No summary provided."}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-muted/30 p-3 rounded-lg border border-border/50">
                  <div className="text-xs text-muted-foreground flex items-center gap-1"><Briefcase className="w-3.5 h-3.5" /> Experience</div>
                  <div className="font-semibold mt-1">{selectedCandidate.experienceYears} Years</div>
                </div>
                <div className="bg-muted/30 p-3 rounded-lg border border-border/50">
                  <div className="text-xs text-muted-foreground flex items-center gap-1"><GraduationCap className="w-3.5 h-3.5" /> Education</div>
                  <div className="font-semibold mt-1">{selectedCandidate.educationDegree || "N/A"}</div>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Primary Skills</h4>
                <div className="flex flex-wrap gap-1.5">
                  {selectedCandidate.skills?.length > 0 ? (
                    selectedCandidate.skills.map((s: string) => (
                      <span key={s} className="px-2.5 py-1 bg-primary/10 text-primary border border-primary/20 text-xs font-medium rounded-full">
                        {s}
                      </span>
                    ))
                  ) : (
                    <span className="text-sm text-muted-foreground italic">No skills listed</span>
                  )}
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Languages</h4>
                <div className="flex flex-wrap gap-1.5">
                  {selectedCandidate.languages?.length > 0 ? (
                    selectedCandidate.languages.map((l: string) => (
                      <span key={l} className="px-2.5 py-1 bg-background border border-border text-foreground text-xs font-medium rounded-full">
                        {l}
                      </span>
                    ))
                  ) : (
                    <span className="text-sm text-muted-foreground italic">No languages listed</span>
                  )}
                </div>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}
