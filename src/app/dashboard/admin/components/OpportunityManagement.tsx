"use client";

import { useState, useEffect } from "react";
import { getOpportunitiesAction, updateOpportunityStatusAction, deleteOpportunitiesAction } from "@/app/actions/admin-opps";
import { OppStatus } from "@prisma/client";
import { Search, Download, Trash2, CheckCircle, Archive, XCircle, Briefcase, Eye } from "lucide-react";
import * as XLSX from "xlsx";
import toast from "react-hot-toast";
import { format } from "date-fns";

export default function OpportunityManagement() {
  const [opps, setOpps] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("jobs");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [sort, setSort] = useState("newest");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isExporting, setIsExporting] = useState(false);

  const limit = 20;

  const fetchOpps = async () => {
    setLoading(true);
    try {
      const res = await getOpportunitiesAction(typeFilter, page, limit, { search, status: statusFilter }, sort);
      setOpps(res.opps);
      setTotal(res.total);
    } catch (error) {
      toast.error("Failed to load opportunities");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPage(1);
    setSelectedIds([]);
  }, [typeFilter, statusFilter, sort]);

  useEffect(() => {
    fetchOpps();
  }, [page, typeFilter, statusFilter, sort]);

  // Debounce search
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      setPage(1);
      fetchOpps();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [search]);

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) setSelectedIds(opps.map(o => o.id));
    else setSelectedIds([]);
  };

  const handleSelect = (id: string) => {
    if (selectedIds.includes(id)) setSelectedIds(selectedIds.filter(i => i !== id));
    else setSelectedIds([...selectedIds, id]);
  };

  const handleBulkStatusUpdate = async (status: OppStatus) => {
    if (selectedIds.length === 0) return toast.error("Select items first");
    try {
      await updateOpportunityStatusAction(typeFilter, selectedIds, status);
      toast.success(`Opportunities marked as ${status}`);
      setSelectedIds([]);
      fetchOpps();
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return toast.error("Select items first");
    if (!confirm("Are you sure you want to completely delete selected opportunities?")) return;
    try {
      await deleteOpportunitiesAction(typeFilter, selectedIds);
      toast.success("Opportunities deleted");
      setSelectedIds([]);
      fetchOpps();
    } catch (error) {
      toast.error("Failed to delete opportunities");
    }
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      let exportData = opps;
      if (selectedIds.length > 0) {
        exportData = opps.filter(o => selectedIds.includes(o.id));
      } else {
        const res = await getOpportunitiesAction(typeFilter, 1, 10000, { search, status: statusFilter }, sort);
        exportData = res.opps;
      }

      const formatted = exportData.map(o => ({
        Title: o.title,
        Type: o.type,
        Status: o.status,
        Organization: o.organization || "N/A",
        Recruiter: o.recruiter,
        "Posted Date": format(new Date(o.createdAt), "PPP"),
        "Deadline / Event Date": o.deadline ? format(new Date(o.deadline), "PPP") : "N/A",
        "Total Applications": o.totalApplications
      }));

      const ws = XLSX.utils.json_to_sheet(formatted);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Opportunities");
      XLSX.writeFile(wb, `Opportunities_${typeFilter}_Export.xlsx`);
      toast.success("Export successful");
    } catch (error) {
      toast.error("Export failed");
    } finally {
      setIsExporting(false);
    }
  };

  const OPPS_TYPES = [
    { value: "jobs", label: "Jobs" },
    { value: "internships", label: "Internships" },
    { value: "fellowships", label: "Fellowships" },
    { value: "scholarships", label: "Scholarships" },
    { value: "grants", label: "Grants" },
    { value: "consultancies", label: "Consultancies" },
    { value: "volunteers", label: "Volunteers" },
    { value: "events", label: "Events" },
  ];

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between glass-panel p-4 rounded-xl">
        <div className="flex-1 w-full relative">
          <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search opportunities by title or organization..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
          />
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto">
          <select 
            value={typeFilter} 
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-4 py-2 bg-primary/5 text-primary border border-primary/20 font-medium rounded-lg focus:outline-none"
          >
            {OPPS_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>

          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 bg-background border border-border rounded-lg focus:outline-none"
          >
            <option value="ALL">All Status</option>
            <option value="DRAFT">Draft</option>
            <option value="PUBLISHED">Published</option>
            <option value="CLOSED">Closed</option>
            <option value="ARCHIVED">Archived</option>
          </select>

          <select 
            value={sort} 
            onChange={(e) => setSort(e.target.value)}
            className="px-4 py-2 bg-background border border-border rounded-lg focus:outline-none"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="deadline">Approaching Deadline</option>
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
          <span className="font-semibold text-foreground">{selectedIds.length} items selected</span>
          <div className="flex items-center gap-2">
            <button onClick={() => handleBulkStatusUpdate(OppStatus.PUBLISHED)} className="px-3 py-1.5 text-sm bg-green-500/10 text-green-600 hover:bg-green-500/20 rounded-lg flex items-center gap-2">
              <CheckCircle className="w-4 h-4" /> Publish
            </button>
            <button onClick={() => handleBulkStatusUpdate(OppStatus.CLOSED)} className="px-3 py-1.5 text-sm bg-amber-500/10 text-amber-600 hover:bg-amber-500/20 rounded-lg flex items-center gap-2">
              <XCircle className="w-4 h-4" /> Close
            </button>
            <button onClick={() => handleBulkStatusUpdate(OppStatus.ARCHIVED)} className="px-3 py-1.5 text-sm bg-gray-500/10 text-gray-600 hover:bg-gray-500/20 rounded-lg flex items-center gap-2">
              <Archive className="w-4 h-4" /> Archive
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
                <th className="p-4 w-12"><input type="checkbox" onChange={handleSelectAll} checked={opps.length > 0 && selectedIds.length === opps.length} className="rounded border-border text-primary focus:ring-primary/50" /></th>
                <th className="p-4 font-semibold">Title & Details</th>
                <th className="p-4 font-semibold">Organization</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold">Dates</th>
                <th className="p-4 font-semibold text-right">Metrics</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">Loading opportunities...</td></tr>
              ) : opps.length === 0 ? (
                <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">No opportunities found.</td></tr>
              ) : (
                opps.map(opp => (
                  <tr key={opp.id} className="hover:bg-muted/30 transition-colors">
                    <td className="p-4"><input type="checkbox" checked={selectedIds.includes(opp.id)} onChange={() => handleSelect(opp.id)} className="rounded border-border text-primary focus:ring-primary/50" /></td>
                    <td className="p-4">
                      <div className="font-medium text-foreground max-w-xs truncate">{opp.title}</div>
                      <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                        <Briefcase className="w-3 h-3" />
                        <span className="capitalize">{opp.type}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="font-medium text-sm text-foreground truncate max-w-[150px]">{opp.organization || "N/A"}</div>
                      <div className="text-xs text-muted-foreground mt-0.5 truncate max-w-[150px]">{opp.recruiter !== "N/A" ? opp.recruiter : ""}</div>
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${
                        opp.status === 'PUBLISHED' ? 'bg-green-500/10 text-green-600' :
                        opp.status === 'DRAFT' ? 'bg-blue-500/10 text-blue-600' :
                        opp.status === 'CLOSED' ? 'bg-amber-500/10 text-amber-600' :
                        'bg-gray-500/10 text-gray-600'
                      }`}>
                        {opp.status}
                      </span>
                    </td>
                    <td className="p-4 text-sm">
                      <div className="text-muted-foreground">Posted: {format(new Date(opp.createdAt), "MMM d, yy")}</div>
                      {opp.deadline && (
                        <div className="font-medium text-foreground mt-0.5">
                          {typeFilter === 'events' ? 'Date: ' : 'Deadline: '} {format(new Date(opp.deadline), "MMM d, yy")}
                        </div>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      {typeFilter !== "events" && (
                        <div className="inline-flex items-center justify-end gap-3 text-sm">
                           <div className="flex items-center gap-1 text-foreground font-medium bg-muted px-2 py-1 rounded-md">
                            <span className="w-4 h-4 rounded-full bg-primary/20 text-primary flex items-center justify-center text-[10px] font-bold">A</span>
                            {opp.totalApplications}
                           </div>
                        </div>
                      )}
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
            Showing <span className="font-medium text-foreground">{opps.length > 0 ? (page - 1) * limit + 1 : 0}</span> to <span className="font-medium text-foreground">{Math.min(page * limit, total)}</span> of <span className="font-medium text-foreground">{total}</span> items
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
  );
}
