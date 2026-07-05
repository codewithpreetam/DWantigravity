"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { calculateCompatibility } from "@/lib/matching";
import {
  Search, ChevronRight, ChevronDown, ChevronUp, Star,
  MapPin, Clock, Users, Briefcase, Calendar, Check,
  X, Mail, Phone, ArrowRight, Tag, Plus,
  Activity, FileText, BarChart2, MoreHorizontal,
  Building, GraduationCap, Award, Landmark, CheckCircle2,
  Send, Archive, UserCheck, SlidersHorizontal, ArrowLeft,
  ChevronLeft, Loader2, RefreshCw, Download, ExternalLink,
  Circle, Dot, AlertCircle,
} from "lucide-react";

// ─── Constants ──────────────────────────────────────────────────────────────

const PIPELINE_STAGES = [
  { key: "ALL",                 label: "All Applications",       dot: "#6b7280" },
  { key: "APPLIED",             label: "New Applications",        dot: "#3b82f6" },
  { key: "UNDER_REVIEW",       label: "Under Review",            dot: "#f59e0b" },
  { key: "SHORTLISTED",        label: "Shortlisted",             dot: "#8b5cf6" },
  { key: "INTERVIEW_SCHEDULED",label: "Interview Scheduled",     dot: "#6366f1" },
  { key: "INTERVIEW_COMPLETED",label: "Interview Completed",     dot: "#0ea5e9" },
  { key: "ASSESSMENT",         label: "Assessment",              dot: "#ec4899" },
  { key: "OFFER_SENT",         label: "Offer Sent",              dot: "#f97316" },
  { key: "HIRED",              label: "Hired",                   dot: "#22c55e" },
  { key: "REJECTED",           label: "Rejected",                dot: "#ef4444" },
];

const MOVE_STAGES = PIPELINE_STAGES.filter(s => s.key !== "ALL");

const TYPE_COLORS: Record<string, string> = {
  JOB:         "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  INTERNSHIP:  "bg-teal-500/10 text-teal-700 dark:text-teal-400",
  FELLOWSHIP:  "bg-indigo-500/10 text-indigo-700 dark:text-indigo-400",
  SCHOLARSHIP: "bg-rose-500/10 text-rose-700 dark:text-rose-400",
  GRANT:       "bg-amber-500/10 text-amber-700 dark:text-amber-400",
  CONSULTANCY: "bg-cyan-500/10 text-cyan-700 dark:text-cyan-400",
  VOLUNTEER:   "bg-pink-500/10 text-pink-700 dark:text-pink-400",
  EVENT:       "bg-purple-500/10 text-purple-700 dark:text-purple-400",
};

const QUICK_TAGS = [
  "Immediate Joiner","NGO Experience","Strong CV","Referral",
  "Good Communication","Second Round","Keep for Future","Excel Expert",
  "M&E","Livelihoods","Education","Field Work",
];

// Helper: normalise stage key (handle legacy aliases)
function normaliseStage(stage: string): string {
  if (stage === "APPLIED" || stage === "NEW") return "APPLIED";
  if (stage === "SCREENING") return "UNDER_REVIEW";
  if (stage === "INTERVIEW") return "INTERVIEW_SCHEDULED";
  if (stage === "OFFER") return "OFFER_SENT";
  return stage;
}

// Helper: get initials for avatar
function initials(name: string | null | undefined, email: string): string {
  if (name) {
    const parts = name.trim().split(" ");
    return parts.length >= 2
      ? `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
      : name.slice(0, 2).toUpperCase();
  }
  return email.slice(0, 2).toUpperCase();
}

// Helper: time ago
function timeAgo(date: string | Date): string {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

// Helper: get opportunity ID from application
function getOppId(app: any): string | null {
  return app.jobId || app.internshipId || app.fellowshipId ||
    app.scholarshipId || app.grantId || app.consultancyId ||
    app.volunteerId || app.eventId || null;
}

// Score badge colour
function scoreColor(score: number): string {
  if (score >= 80) return "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10";
  if (score >= 60) return "text-amber-600 dark:text-amber-400 bg-amber-500/10";
  return "text-red-500 bg-red-500/10";
}

// ─── SVG Gauge ──────────────────────────────────────────────────────────────
function ScoreGauge({ score }: { score: number }) {
  const r = 36;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - score / 100);
  const color = score >= 80 ? "#10b981" : score >= 60 ? "#f59e0b" : "#ef4444";
  return (
    <div className="relative flex items-center justify-center" style={{ width: 96, height: 96 }}>
      <svg width={96} height={96} viewBox="0 0 96 96" className="-rotate-90">
        <circle cx={48} cy={48} r={r} fill="none" strokeWidth={8} stroke="currentColor" className="text-neutral-200 dark:text-neutral-800" />
        <circle
          cx={48} cy={48} r={r}
          fill="none" strokeWidth={8} stroke={color}
          strokeDasharray={circ}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 0.6s ease" }}
        />
      </svg>
      <div className="absolute text-center">
        <div className="text-xl font-extrabold text-foreground leading-none">{score}%</div>
        <div className="text-[9px] text-muted mt-0.5">Match</div>
      </div>
    </div>
  );
}

// ─── ATS Score Bar ───────────────────────────────────────────────────────────
function ScoreBar({ label, value, weight, detail, color = "bg-primary" }: {
  label: string; value: number; weight: string; detail?: string; color?: string;
}) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-[10px] font-semibold">
        <span className="text-muted">{label} <span className="font-normal opacity-60">({weight})</span></span>
        <span className="text-foreground">{value}%</span>
      </div>
      <div className="w-full bg-neutral-200 dark:bg-neutral-800 h-1.5 rounded-full overflow-hidden">
        <div className={`${color} h-full rounded-full transition-all duration-700`} style={{ width: `${value}%` }} />
      </div>
      {detail && <p className="text-[9px] text-muted">{detail}</p>}
    </div>
  );
}

// ─── Main ATSView Component ──────────────────────────────────────────────────
interface ATSViewProps {
  opportunities: any[];
  applications: any[];
}

export default function ATSView({ opportunities, applications }: ATSViewProps) {
  // ── State ─────────────────────────────────────────────────────────────────
  const [selectedOppId, setSelectedOppId]   = useState<string | null>(null);
  const [selectedStage, setSelectedStage]   = useState<string>("ALL");
  const [selectedAppId, setSelectedAppId]   = useState<string | null>(null);
  const [activeTab, setActiveTab]           = useState("profile");
  const [searchQ, setSearchQ]               = useState("");
  const [sortBy, setSortBy]                 = useState<"match" | "newest" | "oldest" | "experience">("match");
  const [checkedIds, setCheckedIds]         = useState<Set<string>>(new Set());
  const [isBulkMenuOpen, setIsBulkMenuOpen] = useState(false);
  const [isMoveMenuOpen, setIsMoveMenuOpen] = useState(false);
  const [note, setNote]                     = useState("");
  const [isSavingNote, setIsSavingNote]     = useState(false);
  const [isMoving, setIsMoving]             = useState(false);
  const [localApps, setLocalApps]           = useState<any[]>(applications);
  const [oppSearch, setOppSearch]           = useState("");
  const [tagMenuOpen, setTagMenuOpen]       = useState(false);

  const listRef = useRef<HTMLDivElement>(null);

  // ── Derived: apps for the selected opportunity ─────────────────────────────
  const oppApps = useMemo(() => {
    if (!selectedOppId) return [];
    return localApps.filter(a => getOppId(a) === selectedOppId);
  }, [localApps, selectedOppId]);

  // ── Derived: selected opportunity object ──────────────────────────────────
  const selectedOpp = useMemo(
    () => opportunities.find(o => o.id === selectedOppId) ?? null,
    [opportunities, selectedOppId]
  );

  // ── Derived: pre-compute match score for all oppApps ─────────────────────
  const appsWithMatch = useMemo(() => {
    return oppApps.map(app => {
      const match = calculateCompatibility(app.candidate, selectedOpp);
      return { ...app, _match: match };
    });
  }, [oppApps, selectedOpp]);

  // ── Derived: stage-filtered + searched + sorted list ─────────────────────
  const filteredApps = useMemo(() => {
    let list = appsWithMatch.filter(app => {
      const normStage = normaliseStage(app.stage || "APPLIED");
      if (selectedStage !== "ALL" && normStage !== selectedStage) return false;
      if (searchQ) {
        const q = searchQ.toLowerCase();
        const c = app.candidate;
        if (
          !c?.name?.toLowerCase().includes(q) &&
          !c?.email?.toLowerCase().includes(q) &&
          !app.tags?.some((t: string) => t.toLowerCase().includes(q)) &&
          !c?.location?.toLowerCase().includes(q)
        ) return false;
      }
      return true;
    });

    if (sortBy === "match")      list = [...list].sort((a, b) => b._match.score - a._match.score);
    else if (sortBy === "newest") list = [...list].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    else if (sortBy === "oldest") list = [...list].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    else if (sortBy === "experience") list = [...list].sort((a, b) => (b.candidate?.experienceYears || 0) - (a.candidate?.experienceYears || 0));

    return list;
  }, [appsWithMatch, selectedStage, searchQ, sortBy]);

  // ── Derived: selected app object ─────────────────────────────────────────
  const selectedApp = useMemo(
    () => filteredApps.find(a => a.id === selectedAppId) ?? filteredApps[0] ?? null,
    [filteredApps, selectedAppId]
  );

  // ── Derived: stage counts ─────────────────────────────────────────────────
  const stageCounts = useMemo(() => {
    const counts: Record<string, number> = { ALL: appsWithMatch.length };
    PIPELINE_STAGES.forEach(s => { if (s.key !== "ALL") counts[s.key] = 0; });
    appsWithMatch.forEach(a => {
      const ns = normaliseStage(a.stage || "APPLIED");
      if (counts[ns] !== undefined) counts[ns]++;
      else counts[ns] = 1;
    });
    return counts;
  }, [appsWithMatch]);

  // ── Derived: quick stats ──────────────────────────────────────────────────
  const todayCutoff = useMemo(() => Date.now() - 86400000, []);
  const newToday = useMemo(
    () => appsWithMatch.filter(a => new Date(a.createdAt).getTime() > todayCutoff).length,
    [appsWithMatch, todayCutoff]
  );
  const interviewToday = useMemo(
    () => appsWithMatch.filter(a => normaliseStage(a.stage) === "INTERVIEW_SCHEDULED").length,
    [appsWithMatch]
  );

  // ── Opportunity selector: filter + count ───────────────────────────────────
  const filteredOpps = useMemo(() => {
    const q = oppSearch.toLowerCase();
    return opportunities.filter(o =>
      !q || o.title?.toLowerCase().includes(q) || o.location?.toLowerCase().includes(q)
    ).map(o => ({
      ...o,
      _total:   localApps.filter(a => getOppId(a) === o.id).length,
      _newToday:localApps.filter(a => getOppId(a) === o.id && new Date(a.createdAt).getTime() > todayCutoff).length,
    }));
  }, [opportunities, localApps, oppSearch, todayCutoff]);

  // ── Keyboard shortcuts ────────────────────────────────────────────────────
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!selectedOppId || document.activeElement?.tagName === "INPUT" || document.activeElement?.tagName === "TEXTAREA") return;
      const idx = filteredApps.findIndex(a => a.id === selectedApp?.id);
      if (e.key === "j" || e.key === "ArrowDown") {
        e.preventDefault();
        const next = filteredApps[idx + 1];
        if (next) setSelectedAppId(next.id);
      } else if (e.key === "k" || e.key === "ArrowUp") {
        e.preventDefault();
        const prev = filteredApps[idx - 1];
        if (prev) setSelectedAppId(prev.id);
      } else if (e.key === "s") {
        if (selectedApp) moveStage(selectedApp.id, "SHORTLISTED");
      } else if (e.key === "r") {
        if (selectedApp) moveStage(selectedApp.id, "REJECTED");
      } else if (e.key === "i") {
        if (selectedApp) moveStage(selectedApp.id, "INTERVIEW_SCHEDULED");
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [filteredApps, selectedApp, selectedOppId]);

  // ── Stage update (single) ─────────────────────────────────────────────────
  const moveStage = useCallback(async (appId: string, newStage: string) => {
    setIsMoving(true);
    try {
      await fetch("/api/ats/stage", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ applicationId: appId, stage: newStage }),
      });
      setLocalApps(prev => prev.map(a => a.id === appId ? { ...a, stage: newStage } : a));
    } finally {
      setIsMoving(false);
      setIsMoveMenuOpen(false);
    }
  }, []);

  // ── Bulk stage update ─────────────────────────────────────────────────────
  const bulkMoveStage = useCallback(async (newStage: string) => {
    const ids = [...checkedIds];
    if (!ids.length) return;
    setIsMoving(true);
    try {
      await fetch("/api/ats/stage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ applicationIds: ids, stage: newStage }),
      });
      setLocalApps(prev => prev.map(a => ids.includes(a.id) ? { ...a, stage: newStage } : a));
      setCheckedIds(new Set());
    } finally {
      setIsMoving(false);
      setIsBulkMenuOpen(false);
    }
  }, [checkedIds]);

  // ── Save note (stored in feedback field) ──────────────────────────────────
  const saveNote = useCallback(async () => {
    if (!selectedApp || !note.trim()) return;
    setIsSavingNote(true);
    try {
      await fetch("/api/ats/stage", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ applicationId: selectedApp.id, feedback: note }),
      });
      setLocalApps(prev => prev.map(a => a.id === selectedApp.id ? { ...a, feedback: note } : a));
      setNote("");
    } finally {
      setIsSavingNote(false);
    }
  }, [selectedApp, note]);

  // ── Toggle tag on application ─────────────────────────────────────────────
  const toggleTag = useCallback(async (appId: string, tag: string, currentTags: string[]) => {
    const next = currentTags.includes(tag)
      ? currentTags.filter(t => t !== tag)
      : [...currentTags, tag];
    await fetch("/api/ats/stage", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ applicationId: appId, tags: next }),
    });
    setLocalApps(prev => prev.map(a => a.id === appId ? { ...a, tags: next } : a));
  }, []);

  // ── Check / uncheck all ───────────────────────────────────────────────────
  const toggleAll = useCallback(() => {
    if (checkedIds.size === filteredApps.length) {
      setCheckedIds(new Set());
    } else {
      setCheckedIds(new Set(filteredApps.map(a => a.id)));
    }
  }, [checkedIds, filteredApps]);

  // ── Navigation helpers ────────────────────────────────────────────────────
  const currentIdx = filteredApps.findIndex(a => a.id === selectedApp?.id);
  const canPrev = currentIdx > 0;
  const canNext = currentIdx < filteredApps.length - 1;

  // ════════════════════════════════════════════════════════════════════════════
  // ── OPPORTUNITY SELECTOR ─────────────────────────────────────────────────
  // ════════════════════════════════════════════════════════════════════════════
  if (!selectedOppId) {
    return (
      <div className="space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-foreground">Select an Opportunity</h2>
            <p className="text-xs text-muted">Choose a position to review candidates and manage your pipeline.</p>
          </div>
        </div>

        {/* Search */}
        <div className="flex items-center gap-2 glass-panel px-3 py-2 rounded-lg border border-card-border max-w-md">
          <Search className="w-4 h-4 text-muted shrink-0" />
          <input
            type="text"
            placeholder="Search opportunities..."
            value={oppSearch}
            onChange={e => setOppSearch(e.target.value)}
            className="bg-transparent text-sm focus:outline-none text-foreground placeholder:text-muted w-full"
          />
        </div>

        {/* Opportunities Table */}
        <div className="glass-panel rounded-xl border border-card-border overflow-hidden">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-card-border bg-neutral-50 dark:bg-neutral-900/50">
                <th className="text-left px-4 py-3 text-muted font-semibold">Opportunity</th>
                <th className="text-center px-4 py-3 text-muted font-semibold whitespace-nowrap">Applications</th>
                <th className="text-center px-4 py-3 text-muted font-semibold whitespace-nowrap">New Today</th>
                <th className="text-center px-4 py-3 text-muted font-semibold">Status</th>
                <th className="text-right px-4 py-3 text-muted font-semibold">Last Updated</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-card-border">
              {filteredOpps.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-muted">
                    <Briefcase className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    <p>No opportunities posted yet.</p>
                  </td>
                </tr>
              ) : (
                filteredOpps.map(opp => (
                  <tr
                    key={opp.id}
                    className="hover:bg-primary/5 cursor-pointer transition-colors group"
                    onClick={() => { setSelectedOppId(opp.id); setSelectedStage("ALL"); setSelectedAppId(null); }}
                  >
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-[10px] font-bold ${TYPE_COLORS[opp.type] || "bg-primary/10 text-primary"}`}>
                          {opp.type?.slice(0, 3)}
                        </div>
                        <div>
                          <p className="font-semibold text-foreground group-hover:text-primary transition-colors">{opp.title}</p>
                          <p className="text-[10px] text-muted mt-0.5">
                            {opp.type?.charAt(0) + opp.type?.slice(1).toLowerCase()} · {opp.location}
                            {opp.workMode && ` (${opp.workMode?.charAt(0) + opp.workMode?.slice(1).toLowerCase()})`}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <div className="font-bold text-foreground text-sm">{opp._total}</div>
                      <div className="text-[9px] text-muted">Total</div>
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <div className={`font-bold text-sm ${opp._newToday > 0 ? "text-primary" : "text-muted"}`}>{opp._newToday}</div>
                      <div className="text-[9px] text-muted">New</div>
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${opp.isActive !== false ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : "bg-neutral-200 dark:bg-neutral-800 text-muted"}`}>
                        {opp.isActive !== false ? "Open" : "Closed"}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-right text-muted text-[10px]">
                      {timeAgo(opp.updatedAt || opp.createdAt)}
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <ChevronRight className="w-4 h-4 text-muted group-hover:text-primary transition-colors" />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Keyboard hint */}
        <p className="text-[10px] text-muted text-center">
          After selecting an opportunity — use <kbd className="px-1.5 py-0.5 rounded bg-neutral-200 dark:bg-neutral-800 font-mono">J</kbd>/
          <kbd className="px-1.5 py-0.5 rounded bg-neutral-200 dark:bg-neutral-800 font-mono">K</kbd> to navigate,
          <kbd className="px-1.5 py-0.5 rounded bg-neutral-200 dark:bg-neutral-800 font-mono">S</kbd> shortlist,
          <kbd className="px-1.5 py-0.5 rounded bg-neutral-200 dark:bg-neutral-800 font-mono">R</kbd> reject,
          <kbd className="px-1.5 py-0.5 rounded bg-neutral-200 dark:bg-neutral-800 font-mono">I</kbd> interview
        </p>
      </div>
    );
  }

  // ════════════════════════════════════════════════════════════════════════════
  // ── THREE-PANE ATS VIEW ──────────────────────────────────────────────────
  // ════════════════════════════════════════════════════════════════════════════

  return (
    <div className="flex flex-col h-full min-h-[calc(100vh-200px)] -mx-4 sm:-mx-6 lg:-mx-8">
      {/* ── Top Header Bar ──────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-card-border bg-white/50 dark:bg-black/30 backdrop-blur-sm sticky top-0 z-20">
        <div className="flex items-center gap-2 min-w-0">
          <button
            onClick={() => { setSelectedOppId(null); setCheckedIds(new Set()); }}
            className="p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-muted hover:text-foreground transition-colors shrink-0"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="font-bold text-sm text-foreground truncate">{selectedOpp?.title}</h2>
              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full shrink-0 ${selectedOpp?.isActive !== false ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : "bg-neutral-200 dark:bg-neutral-800 text-muted"}`}>
                {selectedOpp?.isActive !== false ? "Open" : "Closed"}
              </span>
            </div>
            <p className="text-[10px] text-muted">
              {oppApps.length} applications · {selectedOpp?.location}
            </p>
          </div>
        </div>

        {/* Quick stats */}
        <div className="hidden lg:flex items-center gap-4 text-center text-[10px]">
          {[
            { label: "Total", val: oppApps.length, cls: "text-foreground" },
            { label: "New Today", val: newToday, cls: newToday > 0 ? "text-primary" : "text-muted" },
            { label: "Under Review", val: stageCounts["UNDER_REVIEW"] || 0, cls: "text-amber-500" },
            { label: "Interview", val: interviewToday, cls: "text-indigo-500" },
            { label: "Offers", val: (stageCounts["OFFER_SENT"] || 0), cls: "text-orange-500" },
            { label: "Hired", val: stageCounts["HIRED"] || 0, cls: "text-emerald-500" },
          ].map(stat => (
            <div key={stat.label} className="px-3 border-l border-card-border first:border-0">
              <div className={`text-base font-extrabold leading-none ${stat.cls}`}>{stat.val}</div>
              <div className="text-muted mt-0.5">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Three-Pane Body ─────────────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">

        {/* LEFT: Pipeline sidebar ──────────────────────────────────────── */}
        <div className="w-44 shrink-0 border-r border-card-border bg-neutral-50/70 dark:bg-zinc-950/50 overflow-y-auto">
          <div className="px-3 py-3 border-b border-card-border">
            <p className="text-[10px] font-bold text-muted uppercase tracking-wider">Pipeline</p>
          </div>
          <div className="py-1">
            {PIPELINE_STAGES.map(stage => {
              const count = stageCounts[stage.key] ?? 0;
              const active = selectedStage === stage.key;
              return (
                <button
                  key={stage.key}
                  onClick={() => { setSelectedStage(stage.key); setSelectedAppId(null); }}
                  className={`w-full flex items-center justify-between px-3 py-2 text-xs transition-colors group ${
                    active
                      ? "bg-primary/10 text-primary font-semibold"
                      : "text-muted hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-foreground"
                  }`}
                >
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: stage.dot }} />
                    <span className="truncate text-left">{stage.label}</span>
                  </div>
                  {count > 0 && (
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full shrink-0 ml-1 ${
                      active ? "bg-primary/20 text-primary" : "bg-neutral-200 dark:bg-neutral-800 text-muted"
                    }`}>
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* CENTER: Candidate list ──────────────────────────────────────── */}
        <div className="flex flex-col border-r border-card-border bg-white/30 dark:bg-black/20" style={{ width: "340px", minWidth: "280px" }}>
          {/* Search + Sort */}
          <div className="px-3 py-2 border-b border-card-border space-y-2">
            <div className="flex items-center gap-1.5 bg-neutral-100 dark:bg-neutral-900 rounded-lg px-2.5 py-1.5">
              <Search className="w-3.5 h-3.5 text-muted shrink-0" />
              <input
                type="text"
                placeholder="Search candidates..."
                value={searchQ}
                onChange={e => setSearchQ(e.target.value)}
                className="bg-transparent text-xs focus:outline-none text-foreground placeholder:text-muted w-full"
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-muted">{filteredApps.length} candidate{filteredApps.length !== 1 ? "s" : ""}</span>
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value as any)}
                className="text-[10px] bg-transparent text-muted focus:outline-none cursor-pointer hover:text-foreground"
              >
                <option value="match">Best Match</option>
                <option value="newest">Newest</option>
                <option value="oldest">Oldest</option>
                <option value="experience">Experience</option>
              </select>
            </div>
          </div>

          {/* Bulk action bar */}
          {checkedIds.size > 0 && (
            <div className="flex items-center gap-2 px-3 py-2 bg-primary/5 border-b border-primary/20 text-xs">
              <span className="font-semibold text-primary">{checkedIds.size} selected</span>
              <div className="relative ml-auto">
                <button
                  onClick={() => setIsBulkMenuOpen(v => !v)}
                  className="flex items-center gap-1 px-2 py-1 rounded bg-primary text-white text-[10px] font-semibold hover:bg-primary-hover"
                >
                  Move to Stage <ChevronDown className="w-3 h-3" />
                </button>
                {isBulkMenuOpen && (
                  <div className="absolute right-0 top-full mt-1 bg-white dark:bg-zinc-900 border border-card-border rounded-xl shadow-xl z-30 py-1 min-w-[180px]">
                    {MOVE_STAGES.map(s => (
                      <button
                        key={s.key}
                        onClick={() => bulkMoveStage(s.key)}
                        className="w-full text-left px-3 py-1.5 text-xs hover:bg-neutral-100 dark:hover:bg-neutral-800 flex items-center gap-2"
                      >
                        <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: s.dot }} />
                        {s.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <button
                onClick={() => setCheckedIds(new Set())}
                className="p-1 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 text-muted"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )}

          {/* Select all row */}
          {filteredApps.length > 0 && (
            <div className="px-3 py-1.5 border-b border-card-border flex items-center gap-2">
              <input
                type="checkbox"
                checked={checkedIds.size === filteredApps.length && filteredApps.length > 0}
                onChange={toggleAll}
                className="rounded border-card-border accent-primary w-3.5 h-3.5"
              />
              <span className="text-[10px] text-muted">Select all</span>
            </div>
          )}

          {/* Candidate rows */}
          <div ref={listRef} className="flex-1 overflow-y-auto divide-y divide-card-border/50">
            {filteredApps.length === 0 ? (
              <div className="text-center py-16 text-muted px-4">
                <Users className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p className="text-xs">No candidates match your filters.</p>
              </div>
            ) : (
              filteredApps.map(app => {
                const c = app.candidate;
                const match = app._match;
                const isSelected = app.id === selectedApp?.id;
                const isChecked = checkedIds.has(app.id);
                const normStage = normaliseStage(app.stage || "APPLIED");
                const stageInfo = PIPELINE_STAGES.find(s => s.key === normStage);

                return (
                  <div
                    key={app.id}
                    onClick={() => { setSelectedAppId(app.id); setActiveTab("profile"); }}
                    className={`flex items-start gap-2.5 px-3 py-2.5 cursor-pointer transition-colors ${
                      isSelected
                        ? "bg-primary/5 border-l-2 border-primary"
                        : "hover:bg-neutral-50 dark:hover:bg-neutral-900/50 border-l-2 border-transparent"
                    }`}
                  >
                    {/* Checkbox */}
                    <div
                      className="mt-0.5 shrink-0"
                      onClick={e => {
                        e.stopPropagation();
                        setCheckedIds(prev => {
                          const next = new Set(prev);
                          next.has(app.id) ? next.delete(app.id) : next.add(app.id);
                          return next;
                        });
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {}}
                        className="rounded border-card-border accent-primary w-3 h-3"
                      />
                    </div>

                    {/* Avatar */}
                    <div className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center text-[10px] font-bold ${isSelected ? "bg-primary text-white" : "bg-primary/10 text-primary"}`}>
                      {initials(c?.name, c?.email || "")}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <p className="font-semibold text-xs text-foreground truncate">{c?.name || c?.email}</p>
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full shrink-0 ${scoreColor(match.score)}`}>
                          {match.score}%
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5 text-[9px] text-muted">
                        {c?.experienceYears != null && c.experienceYears > 0 && (
                          <span>{c.experienceYears}y exp</span>
                        )}
                        {c?.location && (
                          <span className="flex items-center gap-0.5 truncate">
                            <MapPin className="w-2.5 h-2.5 shrink-0" />{c.location}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1 mt-1 flex-wrap">
                        {stageInfo && stageInfo.key !== "APPLIED" && (
                          <span className="text-[8px] px-1 py-0.5 rounded" style={{ backgroundColor: `${stageInfo.dot}20`, color: stageInfo.dot }}>
                            {stageInfo.label}
                          </span>
                        )}
                        {(app.tags || []).slice(0, 2).map((tag: string) => (
                          <span key={tag} className="text-[8px] px-1.5 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-muted font-medium">
                            {tag}
                          </span>
                        ))}
                      </div>
                      <p className="text-[9px] text-muted mt-1">{timeAgo(app.createdAt)}</p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* RIGHT: Candidate Detail ─────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto bg-white/20 dark:bg-zinc-950/20">
          {!selectedApp ? (
            <div className="flex flex-col items-center justify-center h-full text-center text-muted p-8">
              <UserCheck className="w-12 h-12 mb-3 opacity-20" />
              <p className="text-sm font-medium">Select a candidate to review their profile</p>
              <p className="text-xs mt-1">Use J/K keys to navigate between candidates</p>
            </div>
          ) : (() => {
            const c = selectedApp.candidate;
            const match = selectedApp._match;
            const currentTags: string[] = selectedApp.tags || [];
            const normStage = normaliseStage(selectedApp.stage || "APPLIED");

            return (
              <div className="flex flex-col h-full">
                {/* Candidate Header */}
                <div className="px-5 py-4 border-b border-card-border bg-white/50 dark:bg-black/20 sticky top-0 z-10">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm shrink-0">
                        {initials(c?.name, c?.email || "")}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-extrabold text-sm text-foreground">{c?.name || c?.email}</h3>
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${scoreColor(match.score)}`}>
                            {match.score}% Match
                          </span>
                        </div>
                        <div className="flex items-center gap-3 mt-0.5 text-[10px] text-muted flex-wrap">
                          {c?.email && <span className="flex items-center gap-0.5"><Mail className="w-3 h-3" />{c.email}</span>}
                          {c?.phone && <span className="flex items-center gap-0.5"><Phone className="w-3 h-3" />{c.phone}</span>}
                          {c?.location && <span className="flex items-center gap-0.5"><MapPin className="w-3 h-3" />{c.location}</span>}
                        </div>
                      </div>
                    </div>

                    {/* Prev / Next */}
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => canPrev && setSelectedAppId(filteredApps[currentIdx - 1].id)}
                        disabled={!canPrev}
                        className="p-1.5 rounded-lg border border-card-border hover:bg-neutral-100 dark:hover:bg-neutral-800 disabled:opacity-30 transition-colors text-xs"
                      >
                        <ChevronLeft className="w-3.5 h-3.5" />
                      </button>
                      <span className="text-[10px] text-muted px-1">{currentIdx + 1}/{filteredApps.length}</span>
                      <button
                        onClick={() => canNext && setSelectedAppId(filteredApps[currentIdx + 1].id)}
                        disabled={!canNext}
                        className="p-1.5 rounded-lg border border-card-border hover:bg-neutral-100 dark:hover:bg-neutral-800 disabled:opacity-30 transition-colors text-xs"
                      >
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex items-center gap-2 mt-3 flex-wrap">
                    <div className="relative">
                      <button
                        onClick={() => setIsMoveMenuOpen(v => !v)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-white text-xs font-semibold hover:bg-primary-hover transition-colors"
                      >
                        {isMoving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                        Move Stage <ChevronDown className="w-3 h-3" />
                      </button>
                      {isMoveMenuOpen && (
                        <div className="absolute left-0 top-full mt-1 bg-white dark:bg-zinc-900 border border-card-border rounded-xl shadow-xl z-40 py-1 min-w-[200px]">
                          {MOVE_STAGES.map(s => (
                            <button
                              key={s.key}
                              onClick={() => moveStage(selectedApp.id, s.key)}
                              className={`w-full text-left px-3 py-2 text-xs hover:bg-neutral-100 dark:hover:bg-neutral-800 flex items-center gap-2 ${normStage === s.key ? "text-primary font-semibold" : ""}`}
                            >
                              <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: s.dot }} />
                              {s.label}
                              {normStage === s.key && <CheckCircle2 className="w-3 h-3 ml-auto text-primary" />}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    {c?.email && (
                      <a href={`mailto:${c.email}`} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-card-border text-xs font-semibold hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors">
                        <Mail className="w-3.5 h-3.5" /> Email
                      </a>
                    )}
                    {selectedApp.resumeUrl && (
                      <a href={selectedApp.resumeUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-card-border text-xs font-semibold hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors">
                        <Download className="w-3.5 h-3.5" /> CV
                      </a>
                    )}
                    <button
                      onClick={() => { moveStage(selectedApp.id, "REJECTED"); }}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-300 dark:border-red-900 text-red-500 text-xs font-semibold hover:bg-red-500/5 transition-colors ml-auto"
                    >
                      <X className="w-3.5 h-3.5" /> Reject
                    </button>
                  </div>

                  {/* Tabs */}
                  <div className="flex items-center gap-0 mt-3 border-b border-card-border -mx-5 px-5">
                    {["profile","resume","ats_score","timeline","notes"].map(tab => (
                      <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-3 py-1.5 text-xs font-semibold capitalize border-b-2 transition-colors ${
                          activeTab === tab
                            ? "border-primary text-primary"
                            : "border-transparent text-muted hover:text-foreground"
                        }`}
                      >
                        {tab === "ats_score" ? "ATS Score" : tab.charAt(0).toUpperCase() + tab.slice(1)}
                        {tab === "notes" && selectedApp.feedback ? " •" : ""}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Tab Content */}
                <div className="flex-1 px-5 py-4 overflow-y-auto space-y-4">

                  {/* PROFILE TAB */}
                  {activeTab === "profile" && (
                    <div className="space-y-4">
                      {/* Bio */}
                      {c?.bio && (
                        <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-900/50 border border-card-border">
                          <p className="text-[10px] font-bold text-muted uppercase tracking-wider mb-1.5">Professional Summary</p>
                          <p className="text-xs text-muted leading-relaxed">{c.bio}</p>
                        </div>
                      )}

                      {/* Quick stats grid */}
                      <div className="grid grid-cols-2 gap-3">
                        {[
                          { label: "Experience", val: c?.experienceYears ? `${c.experienceYears} Years` : "Not specified" },
                          { label: "Education", val: c?.educationDegree || "Not specified" },
                          { label: "Location", val: c?.location || "Not specified" },
                          { label: "Languages", val: c?.languages?.length ? c.languages.join(", ") : "Not specified" },
                        ].map(item => (
                          <div key={item.label} className="p-3 rounded-lg border border-card-border bg-neutral-50/50 dark:bg-neutral-900/30">
                            <p className="text-[9px] text-muted font-semibold uppercase tracking-wider">{item.label}</p>
                            <p className="text-xs font-semibold text-foreground mt-0.5 truncate">{item.val}</p>
                          </div>
                        ))}
                      </div>

                      {/* Skills */}
                      {c?.skills?.length > 0 && (
                        <div>
                          <p className="text-[10px] font-bold text-muted uppercase tracking-wider mb-2">Skills</p>
                          <div className="flex flex-wrap gap-1.5">
                            {c.skills.map((skill: string) => (
                              <span
                                key={skill}
                                className={`text-[10px] px-2 py-1 rounded-full font-medium ${
                                  match.matchedSkills.map((s: string) => s.toLowerCase()).includes(skill.toLowerCase())
                                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                                    : "bg-neutral-100 dark:bg-neutral-800 text-muted"
                                }`}
                              >
                                {skill}
                              </span>
                            ))}
                          </div>
                          {match.missingSkills.length > 0 && (
                            <div className="mt-2">
                              <p className="text-[9px] text-red-500 font-semibold mb-1">Missing:</p>
                              <div className="flex flex-wrap gap-1">
                                {match.missingSkills.slice(0,5).map((skill: string) => (
                                  <span key={skill} className="text-[9px] px-1.5 py-0.5 rounded-full bg-red-500/10 text-red-500">{skill}</span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Tags */}
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <p className="text-[10px] font-bold text-muted uppercase tracking-wider">Tags</p>
                          <button
                            onClick={() => setTagMenuOpen(v => !v)}
                            className="text-[9px] text-primary flex items-center gap-0.5 hover:underline"
                          >
                            <Plus className="w-3 h-3" /> Add
                          </button>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {currentTags.map((tag: string) => (
                            <span
                              key={tag}
                              className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium flex items-center gap-1 group cursor-pointer"
                              onClick={() => toggleTag(selectedApp.id, tag, currentTags)}
                            >
                              {tag}
                              <X className="w-2.5 h-2.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </span>
                          ))}
                          {currentTags.length === 0 && (
                            <span className="text-[10px] text-muted italic">No tags yet</span>
                          )}
                        </div>
                        {tagMenuOpen && (
                          <div className="mt-2 p-2 border border-card-border rounded-lg bg-white dark:bg-zinc-900 flex flex-wrap gap-1.5">
                            {QUICK_TAGS.filter(t => !currentTags.includes(t)).map(tag => (
                              <button
                                key={tag}
                                onClick={() => { toggleTag(selectedApp.id, tag, currentTags); }}
                                className="text-[10px] px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-muted hover:bg-primary/10 hover:text-primary transition-colors"
                              >
                                + {tag}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* RESUME TAB */}
                  {activeTab === "resume" && (
                    <div className="space-y-3">
                      {selectedApp.resumeUrl || c?.resumeUrl ? (
                        <>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <FileText className="w-4 h-4 text-primary" />
                              <span className="text-xs font-semibold text-foreground">Resume / CV</span>
                            </div>
                            <a
                              href={selectedApp.resumeUrl || c?.resumeUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 text-[10px] text-primary hover:underline"
                            >
                              <ExternalLink className="w-3 h-3" /> Open in new tab
                            </a>
                          </div>
                          <iframe
                            src={`${selectedApp.resumeUrl || c?.resumeUrl}#toolbar=0`}
                            className="w-full rounded-xl border border-card-border"
                            style={{ height: "70vh" }}
                            title="Resume Preview"
                          />
                        </>
                      ) : (
                        <div className="text-center py-16 text-muted">
                          <FileText className="w-8 h-8 mx-auto mb-2 opacity-30" />
                          <p className="text-xs">No resume uploaded</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* ATS SCORE TAB */}
                  {activeTab === "ats_score" && (
                    <div className="space-y-5">
                      <div className="flex items-center gap-5 p-4 rounded-xl bg-neutral-50 dark:bg-neutral-900/50 border border-card-border">
                        <ScoreGauge score={match.score} />
                        <div className="flex-1">
                          <p className="font-extrabold text-foreground">{match.score}% Overall Match</p>
                          <p className="text-[10px] text-muted mt-0.5">
                            {match.score >= 80 ? "Excellent match — strong candidate" :
                             match.score >= 60 ? "Good match — worth reviewing" :
                             "Partial match — review carefully"}
                          </p>
                          <div className="flex gap-2 mt-2 flex-wrap">
                            {match.matchedSkills.slice(0,3).map((s: string) => (
                              <span key={s} className="text-[9px] px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">✓ {s}</span>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3 p-4 rounded-xl border border-card-border">
                        <ScoreBar
                          label="Sector Skills"
                          value={match.breakdown.skills}
                          weight="40%"
                          detail={match.matchedSkills.length > 0 ? `Matched: ${match.matchedSkills.join(", ")}` : "No skill overlap found"}
                          color="bg-primary"
                        />
                        <ScoreBar
                          label="Experience"
                          value={match.breakdown.experience}
                          weight="25%"
                          detail={`Candidate: ${c?.experienceYears ?? 0}y · Required: ${selectedOpp?.minExperienceYears ?? 0}y`}
                          color="bg-indigo-500"
                        />
                        <ScoreBar
                          label="Education"
                          value={match.breakdown.education}
                          weight="15%"
                          detail={`Candidate: ${c?.educationDegree || "Not specified"} · Required: ${selectedOpp?.minEducation || "None"}`}
                          color="bg-purple-500"
                        />
                        <ScoreBar
                          label="Location"
                          value={match.breakdown.location}
                          weight="10%"
                          detail={`Candidate: ${c?.location || "Not specified"} · Required: ${selectedOpp?.location || "Any"}`}
                          color="bg-sky-500"
                        />
                        <ScoreBar
                          label="Languages"
                          value={match.breakdown.languages}
                          weight="5%"
                          detail={`Candidate: ${c?.languages?.join(", ") || "None"} · Required: ${selectedOpp?.requiredLanguages?.join(", ") || "None"}`}
                          color="bg-teal-500"
                        />
                      </div>
                    </div>
                  )}

                  {/* TIMELINE TAB */}
                  {activeTab === "timeline" && (
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-muted uppercase tracking-wider mb-3">Application Timeline</p>
                      {(() => {
                        const normStage = normaliseStage(selectedApp.stage || "APPLIED");
                        const stageOrder = ["APPLIED","UNDER_REVIEW","SHORTLISTED","INTERVIEW_SCHEDULED","INTERVIEW_COMPLETED","ASSESSMENT","OFFER_SENT","HIRED"];
                        const currentIdx = stageOrder.indexOf(normStage);
                        const isRejected = normStage === "REJECTED";

                        return (
                          <div className="relative">
                            <div className="absolute left-3.5 top-0 bottom-0 w-px bg-card-border" />
                            <div className="space-y-0">
                              {[
                                { stage: "APPLIED", label: "Applied", sub: `Applied on ${new Date(selectedApp.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}` },
                                { stage: "UNDER_REVIEW", label: "Under Review", sub: "Profile reviewed by recruiter" },
                                { stage: "SHORTLISTED", label: "Shortlisted", sub: "Candidate shortlisted for next round" },
                                { stage: "INTERVIEW_SCHEDULED", label: "Interview Scheduled", sub: "Interview invitation sent" },
                                { stage: "INTERVIEW_COMPLETED", label: "Interview Completed", sub: "Interview session completed" },
                                { stage: "ASSESSMENT", label: "Assessment", sub: "Assessment task assigned" },
                                { stage: "OFFER_SENT", label: "Offer Sent", sub: "Offer letter dispatched" },
                                { stage: "HIRED", label: "Hired", sub: "Candidate has joined the organisation" },
                              ].map(({ stage: s, label, sub }, i) => {
                                const stageIdx = stageOrder.indexOf(s);
                                const isDone = !isRejected && stageIdx <= currentIdx;
                                const isCurrent = !isRejected && s === normStage;

                                return (
                                  <div key={s} className="relative flex items-start gap-3 pb-4 pl-8">
                                    <div className={`absolute left-2 w-3 h-3 rounded-full border-2 z-10 mt-0.5 ${
                                      isCurrent ? "bg-primary border-primary ring-2 ring-primary/20" :
                                      isDone    ? "bg-primary border-primary" :
                                                  "bg-white dark:bg-zinc-950 border-card-border"
                                    }`} />
                                    <div>
                                      <p className={`text-xs font-semibold ${isDone ? "text-foreground" : "text-muted"}`}>{label}</p>
                                      <p className="text-[9px] text-muted">{sub}</p>
                                    </div>
                                  </div>
                                );
                              })}
                              {isRejected && (
                                <div className="relative flex items-start gap-3 pb-4 pl-8">
                                  <div className="absolute left-2 w-3 h-3 rounded-full border-2 z-10 mt-0.5 bg-red-500 border-red-500" />
                                  <div>
                                    <p className="text-xs font-semibold text-red-500">Rejected</p>
                                    <p className="text-[9px] text-muted">Candidate was not progressed</p>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  )}

                  {/* NOTES TAB */}
                  {activeTab === "notes" && (
                    <div className="space-y-3">
                      <p className="text-[10px] font-bold text-muted uppercase tracking-wider">Recruiter Notes</p>
                      {selectedApp.feedback ? (
                        <div className="p-3 rounded-lg border border-card-border bg-amber-50/50 dark:bg-amber-950/20 border-amber-200/50 dark:border-amber-900/50">
                          <p className="text-xs text-foreground leading-relaxed">{selectedApp.feedback}</p>
                          <p className="text-[9px] text-muted mt-2">Visible to your team only</p>
                        </div>
                      ) : (
                        <p className="text-xs text-muted italic">No notes yet.</p>
                      )}

                      <div className="border-t border-card-border pt-3">
                        <p className="text-[10px] font-semibold text-muted mb-2">Add Note</p>
                        <textarea
                          value={note}
                          onChange={e => setNote(e.target.value)}
                          placeholder="Write your notes about this candidate..."
                          rows={4}
                          className="w-full text-xs bg-neutral-50 dark:bg-neutral-900 border border-card-border rounded-lg p-2.5 focus:outline-none focus:ring-1 focus:ring-primary resize-none text-foreground placeholder:text-muted"
                        />
                        <button
                          onClick={saveNote}
                          disabled={!note.trim() || isSavingNote}
                          className="mt-2 flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-white text-xs font-semibold hover:bg-primary-hover disabled:opacity-50 transition-colors"
                        >
                          {isSavingNote ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
                          Save Note
                        </button>
                      </div>
                    </div>
                  )}

                </div>
              </div>
            );
          })()}
        </div>
      </div>
    </div>
  );
}
