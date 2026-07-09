"use client";

import React, { useState } from "react";
import * as XLSX from "xlsx";
import { Download, Search, CheckCircle, Clock, XCircle, UserCheck } from "lucide-react";
import { updateRegistrationStatusAction } from "@/app/actions/employer";
import { useRouter } from "next/navigation";

interface EventRegistrationsProps {
  registrations: any[];
  events: any[];
}

export default function EventRegistrations({ registrations, events }: EventRegistrationsProps) {
  const router = useRouter();
  const [selectedEventId, setSelectedEventId] = useState<string>("all");
  const [searchQ, setSearchQ] = useState("");
  const [isExporting, setIsExporting] = useState(false);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const activeEvents = events.filter(e => e.isActive);

  // Filter registrations
  let filtered = [...registrations];
  if (selectedEventId !== "all") {
    filtered = filtered.filter(r => r.eventId === selectedEventId);
  }
  if (searchQ) {
    const q = searchQ.toLowerCase();
    // Registrations might not have populated candidate objects depending on schema, assuming we need to fetch them if needed. 
    // Wait, the schema in page.tsx for eventRegistrations didn't include candidate! 
    // I will filter by whatever data is available. Let's just fallback or wait, we MUST have candidate data to show Name/Email.
  }

  const exportData = (format: "excel" | "csv") => {
    setIsExporting(true);
    try {
      const dataToExport = filtered.map(r => {
        const baseRow: any = {
          "Event Name": r.event?.title,
          "Registration ID": r.id,
          "Candidate Name": r.user?.name || "Unknown",
          "Candidate Email": r.user?.email || "Unknown",
          "Phone": r.user?.phone || "-",
          "Organization": r.user?.organization?.name || "-",
          "Designation": r.user?.jobTitle || "-",
          "QR Reference": r.qrCode,
          "Status": r.status,
          "Registration Date": new Date(r.createdAt).toLocaleString(),
        };

        // Append custom responses if any
        if (r.customResponses) {
          Object.entries(r.customResponses).forEach(([key, value]) => {
            const qs = (function parseQs(qs: any) {
              if (!qs) return [];
              if (Array.isArray(qs)) return qs;
              if (typeof qs === "string") {
                try {
                  const p = JSON.parse(qs);
                  return Array.isArray(p) ? p : [];
                } catch { return []; }
              }
              return [];
            })(r.event?.customQuestions);
            
            const qText = qs.find((q: any) => q.id === key)?.text || key;
            baseRow[`Q: ${qText}`] = value;
          });
        }
        
        return baseRow;
      });

      const worksheet = XLSX.utils.json_to_sheet(dataToExport);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Registrations");
      
      if (format === "excel") {
        XLSX.writeFile(workbook, `event_registrations_${new Date().getTime()}.xlsx`);
      } else {
        XLSX.writeFile(workbook, `event_registrations_${new Date().getTime()}.csv`);
      }
    } catch (err) {
      console.error(err);
      alert(`Failed to export ${format}.`);
    } finally {
      setIsExporting(false);
    }
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    setLoadingId(id);
    const res = await updateRegistrationStatusAction(id, newStatus);
    if (res?.error) {
      alert(res.error);
    } else {
      router.refresh();
    }
    setLoadingId(null);
  };

  const selectedEvent = selectedEventId !== "all" ? events.find(e => e.id === selectedEventId) : null;
  const capacity = selectedEvent?.capacity || 0;
  
  // To match public event page logic, we only count active/approved registrations against capacity
  const activeStatuses = ["REGISTERED", "APPROVED", "CHECKED_IN", "ATTENDED", "COMPLETED"];
  const registeredCount = filtered.filter(r => activeStatuses.includes(r.status)).length;
  const totalSubmissions = filtered.length;

  return (
    <div className="space-y-6">
      {/* Filters and Actions */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white/40 dark:bg-zinc-950/20 p-4 rounded-xl border border-card-border">
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <select 
            value={selectedEventId} 
            onChange={(e) => setSelectedEventId(e.target.value)}
            className="form-input text-xs w-full md:w-64"
          >
            <option value="all">All Events</option>
            {events.map(e => (
              <option key={e.id} value={e.id}>{e.title}</option>
            ))}
          </select>
          
          {/* We will add search here if candidate data is available */}
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={() => exportData("excel")}
            disabled={isExporting || filtered.length === 0}
            className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg text-xs font-bold disabled:opacity-50 transition-colors shrink-0"
          >
            <Download className="w-4 h-4" />
            {isExporting ? "Exporting..." : "Excel"}
          </button>
          <button 
            onClick={() => exportData("csv")}
            disabled={isExporting || filtered.length === 0}
            className="flex items-center gap-2 px-4 py-2 bg-neutral-200 dark:bg-neutral-800 hover:bg-neutral-300 dark:hover:bg-neutral-700 text-foreground rounded-lg text-xs font-bold disabled:opacity-50 transition-colors shrink-0"
          >
            <Download className="w-4 h-4" />
            {isExporting ? "Exporting..." : "CSV"}
          </button>
        </div>
      </div>

      {selectedEvent && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl border border-card-border glass-panel">
            <p className="text-[10px] text-muted font-bold uppercase">Active Registrations</p>
            <p className="text-xl font-black text-foreground mt-1">{registeredCount}</p>
          </div>
          <div className="p-4 rounded-xl border border-card-border glass-panel">
            <p className="text-[10px] text-muted font-bold uppercase">Capacity Filled</p>
            <p className="text-xl font-black text-foreground mt-1">{capacity > 0 ? Math.round((registeredCount / capacity) * 100) : 0}%</p>
          </div>
          <div className="p-4 rounded-xl border border-card-border glass-panel">
            <p className="text-[10px] text-muted font-bold uppercase">Total Submissions</p>
            <p className="text-xl font-black text-blue-500 mt-1">{totalSubmissions}</p>
          </div>
          <div className="p-4 rounded-xl border border-card-border glass-panel">
            <p className="text-[10px] text-muted font-bold uppercase">Waitlisted</p>
            <p className="text-xl font-black text-amber-500 mt-1">{filtered.filter(r => r.status === "WAITLISTED").length}</p>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-card-border bg-white/30 dark:bg-zinc-950/20">
        <table className="w-full text-left text-xs text-foreground">
          <thead className="bg-neutral-100 dark:bg-zinc-900 border-b border-card-border">
            <tr>
              <th className="px-4 py-3 font-bold">Registration Ref</th>
              <th className="px-4 py-3 font-bold">Attendee</th>
              <th className="px-4 py-3 font-bold hidden md:table-cell">Details</th>
              <th className="px-4 py-3 font-bold">Event</th>
              <th className="px-4 py-3 font-bold">Date Registered</th>
              <th className="px-4 py-3 font-bold">Responses</th>
              <th className="px-4 py-3 font-bold">Status</th>
              <th className="px-4 py-3 font-bold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-card-border">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-muted italic">No registrations found.</td>
              </tr>
            ) : (
              filtered.map(reg => (
                <tr key={reg.id} className="hover:bg-primary/5 transition-colors">
                  <td className="px-4 py-3">
                    <code className="text-[10px] font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded">{reg.qrCode || reg.id.substring(0,8)}</code>
                  </td>
                  <td className="px-4 py-3 font-semibold truncate max-w-[150px]">
                    <div className="text-xs font-bold">{reg.user?.name || "Anonymous"}</div>
                    <div className="text-[10px] text-muted truncate">{reg.user?.email}</div>
                    {reg.user?.phone && <div className="text-[10px] text-muted truncate">{reg.user.phone}</div>}
                  </td>
                  <td className="px-4 py-3 text-[10px] hidden md:table-cell">
                    <div className="font-medium">{reg.user?.jobTitle || "-"}</div>
                    <div className="text-muted truncate max-w-[120px]">{reg.user?.organization?.name || "-"}</div>
                  </td>
                  <td className="px-4 py-3 font-semibold truncate max-w-[150px]">
                    {reg.event?.title}
                  </td>
                  <td className="px-4 py-3 text-muted">
                    {new Date(reg.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-muted text-[10px]">
                    {reg.customResponses && Object.keys(reg.customResponses).length > 0 ? (
                      <div className="max-w-[150px] truncate" title={JSON.stringify(reg.customResponses)}>
                        {Object.keys(reg.customResponses).length} Answer(s)
                      </div>
                    ) : "-"}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                      reg.status === "APPROVED" || reg.status === "CHECKED_IN" || reg.status === "ATTENDED" || reg.status === "COMPLETED" ? "bg-emerald-500/10 text-emerald-600" :
                      reg.status === "WAITLISTED" ? "bg-amber-500/10 text-amber-600" :
                      reg.status === "CANCELLED" || reg.status === "ABSENT" ? "bg-red-500/10 text-red-500" :
                      "bg-blue-500/10 text-blue-600"
                    }`}>
                      {reg.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <select 
                      value={reg.status}
                      disabled={loadingId === reg.id}
                      onChange={(e) => handleStatusChange(reg.id, e.target.value)}
                      className="form-input py-1 text-[10px] bg-transparent w-32 cursor-pointer disabled:opacity-50"
                    >
                      <option value="REGISTERED">Registered</option>
                      <option value="APPROVED">Approved</option>
                      <option value="WAITLISTED">Waitlisted</option>
                      <option value="CHECKED_IN">Checked-in</option>
                      <option value="ATTENDED">Attended</option>
                      <option value="ABSENT">Absent</option>
                      <option value="CANCELLED">Cancelled</option>
                    </select>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
