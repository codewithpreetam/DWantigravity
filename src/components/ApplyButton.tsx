"use client";

import React, { useState, useRef, useEffect } from "react";
import { ArrowUpRight, FileText, CheckCircle, AlertCircle, Download, FileCode, Heading, Bold, Italic, List } from "lucide-react";
import { getDefaultResumeAction, getCurrentUserRoleAction } from "@/app/actions/candidate";

interface ApplyButtonProps {
  opportunityId: string;
  opportunityTitle: string;
  opportunityType: string;
  userEmail?: string;
  userRole?: string;
  label?: string;
  alreadyApplied?: boolean;
  externalApplyLink?: string | null;
}

export default function ApplyButton({
  opportunityId,
  opportunityTitle,
  opportunityType,
  userEmail,
  userRole,
  label = "Apply Now",
  alreadyApplied,
  externalApplyLink
}: ApplyButtonProps) {
  const [mounted, setMounted] = useState(false);
  const [activeUserRole, setActiveUserRole] = useState<string | null>(userRole || null);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [defaultResume, setDefaultResume] = useState<string | null>(null);
  
  // Resume state
  const [resumeMode, setResumeMode] = useState<"default" | "new">("default");
  const [resumeBase64, setResumeBase64] = useState<string>("");
  const [resumeName, setResumeName] = useState<string>("");
  const [resumeDate, setResumeDate] = useState<string>("");
  const [fileSizeError, setFileSizeError] = useState<string | null>(null);

  // Cover Letter state
  const [coverLetterHtml, setCoverLetterHtml] = useState<string>("");

  const dialogRef = useRef<HTMLDialogElement>(null);
  const editorRef = useRef<HTMLDivElement>(null);

  // ALL hooks must be called before any conditional returns (React Rules of Hooks)
  useEffect(() => {
    setMounted(true);
    if (!activeUserRole) {
      getCurrentUserRoleAction()
        .then((role) => {
          if (role) setActiveUserRole(role);
        })
        .catch((e) => console.error("Error loading active user role:", e));
    }
  }, [activeUserRole]);

  // Disallow employers from applying to anything other than EVENT and GRANT
  if (activeUserRole === "EMPLOYER") {
    if (opportunityType !== "EVENT" && opportunityType !== "GRANT") {
      return (
        <div className="px-4 py-2 bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-[10px] font-extrabold rounded-lg flex items-center gap-1.5 w-fit">
          <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
          <span>Recruiters cannot apply for seeker roles.</span>
        </div>
      );
    }
  }

  // Early return if already applied
  if (alreadyApplied) {
    return (
      <div className="px-6 py-2.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold rounded-lg flex items-center gap-1.5 w-fit">
        <CheckCircle className="w-4 h-4 text-emerald-500" />
        <span>Applied</span>
      </div>
    );
  }

  // Redirect externally if link is configured
  if (externalApplyLink) {
    return (
      <a
        href={externalApplyLink}
        target="_blank"
        rel="noopener noreferrer"
        className="px-6 py-2.5 bg-primary hover:bg-primary-hover text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-all cursor-pointer shadow-md w-fit"
      >
        <span>Apply Externally</span>
        <ArrowUpRight className="w-4 h-4" />
      </a>
    );
  }

  const openDialog = async () => {
    if (!userEmail) {
      // Redirect to sign in and back
      window.location.href = `/auth/signin?callbackUrl=${encodeURIComponent(window.location.pathname)}`;
      return;
    }

    setLoadingProfile(true);
    try {
      const profile = await getDefaultResumeAction();
      if (profile?.resumeUrl) {
        setDefaultResume(profile.resumeUrl);
        setResumeBase64(profile.resumeUrl);
        setResumeName("Profile_Default_Resume.pdf");
        setResumeDate("Default profile CV");
        setResumeMode("default");
      } else {
        setResumeMode("new");
      }
    } catch (e) {
      console.error("Error fetching default resume:", e);
      setResumeMode("new");
    } finally {
      setLoadingProfile(false);
      dialogRef.current?.showModal();
    }
  };

  const closeDialog = () => {
    dialogRef.current?.close();
  };

  const handleResumeFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size limit: 5 MB
    const limit = 5 * 1024 * 1024;
    if (file.size > limit) {
      setFileSizeError("The resume file size must be less than 5 MB.");
      e.target.value = ""; // Reset file uploader
      return;
    }

    setFileSizeError(null);
    setResumeName(file.name);
    setResumeDate(new Date().toLocaleDateString());
    setResumeMode("new");

    const reader = new FileReader();
    reader.onloadend = () => {
      setResumeBase64(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Rich Text Editor Helpers
  const formatText = (command: string, value: string = "") => {
    document.execCommand(command, false, value);
    if (editorRef.current) {
      setCoverLetterHtml(editorRef.current.innerHTML);
    }
  };

  const handleInsertLink = () => {
    const url = prompt("Enter hyperlink URL (e.g. https://example.com):");
    if (url) {
      formatText("createLink", url);
    }
  };

  const handleEditorInput = (e: React.FormEvent<HTMLDivElement>) => {
    setCoverLetterHtml(e.currentTarget.innerHTML);
  };

  if (!mounted) {
    return (
      <button className="px-6 py-2.5 bg-primary text-white text-xs font-semibold rounded-lg flex items-center gap-1 opacity-70">
        <span>{label}</span>
        <ArrowUpRight className="w-4 h-4" />
      </button>
    );
  }

  // Helper labels
  const getResumeLabel = () => {
    switch (opportunityType) {
      case "GRANT":
        return "Upload Proposal Document (PDF, DOC, DOCX under 5MB)";
      default:
        return "Upload Resume / CV (PDF, DOC, DOCX under 5MB)";
    }
  };

  return (
    <>
      <button
        onClick={openDialog}
        disabled={loadingProfile}
        className="px-6 py-2.5 bg-primary hover:bg-primary-hover text-white text-xs font-semibold rounded-lg flex items-center gap-1 transition-all cursor-pointer shadow-md disabled:opacity-50"
      >
        <span>{loadingProfile ? "Loading..." : label}</span>
        <ArrowUpRight className="w-4 h-4" />
      </button>

      <dialog
        ref={dialogRef}
        className="backdrop:bg-black/60 backdrop:backdrop-blur-sm bg-transparent border-0 focus:outline-none p-4 w-full max-w-xl mx-auto my-auto self-center"
      >
        <div className="glass-panel p-6 rounded-2xl space-y-5 max-w-xl text-left border border-card-border shadow-xl">
          
          {/* Header */}
          <div className="flex justify-between items-center border-b border-card-border pb-3">
            <div>
              <h3 className="font-extrabold text-sm text-foreground">Apply: {opportunityTitle}</h3>
              <p className="text-[10px] text-muted mt-0.5">Submitting application as {userEmail}</p>
            </div>
            <button
              onClick={closeDialog}
              className="text-xs text-muted hover:text-foreground cursor-pointer p-1.5 hover:bg-white/10 rounded-full"
            >
              ✕
            </button>
          </div>

          <form action="/api/apply" method="POST" className="space-y-4 text-xs">
            <input type="hidden" name="opportunityId" value={opportunityId} />
            <input type="hidden" name="type" value={opportunityType} />
            <input type="hidden" name="resumeUrl" value={resumeBase64} />
            <input type="hidden" name="coverLetter" value={coverLetterHtml} />

            {/* Resume Manager Block */}
            <div className="p-4 rounded-xl border border-card-border bg-white/30 dark:bg-zinc-950/20 space-y-4">
              <div className="flex justify-between items-center">
                <label className="font-extrabold text-foreground text-xs">{getResumeLabel()}</label>
                
                {defaultResume && (
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setResumeMode("default");
                        setResumeBase64(defaultResume);
                        setResumeName("Profile_Default_Resume.pdf");
                        setResumeDate("Default profile CV");
                      }}
                      className={`px-2 py-1 rounded text-[9px] font-bold transition-all border ${
                        resumeMode === "default"
                          ? "bg-primary text-white border-primary"
                          : "bg-primary/5 text-muted border-card-border hover:text-foreground"
                      }`}
                    >
                      Use Default
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setResumeMode("new");
                        setResumeBase64("");
                        setResumeName("");
                        setResumeDate("");
                      }}
                      className={`px-2 py-1 rounded text-[9px] font-bold transition-all border ${
                        resumeMode === "new"
                          ? "bg-primary text-white border-primary"
                          : "bg-primary/5 text-muted border-card-border hover:text-foreground"
                      }`}
                    >
                      Upload New
                    </button>
                  </div>
                )}
              </div>

              {fileSizeError && (
                <div className="p-2.5 rounded bg-red-500/10 border border-red-500/20 text-[10px] text-red-500 font-semibold flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{fileSizeError}</span>
                </div>
              )}

              {/* Upload Input */}
              {resumeMode === "new" && (
                <input 
                  type="file" 
                  accept=".pdf,.doc,.docx"
                  onChange={handleResumeFileChange}
                  required={!resumeBase64}
                  className="w-full text-muted file:mr-2 file:py-1.5 file:px-3 file:rounded file:border file:border-card-border file:bg-white/50 file:text-[10px] file:font-semibold hover:file:bg-primary/5 cursor-pointer file:cursor-pointer"
                />
              )}

              {/* Selected Resume Metadata Visualizer */}
              {resumeBase64 && (
                <div className="p-3.5 rounded-xl border border-card-border bg-white dark:bg-zinc-900/60 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-primary/10 text-primary rounded-xl border border-primary/20 shrink-0">
                      <FileText className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="font-extrabold text-foreground text-[11px] leading-tight truncate max-w-[200px]">
                        {resumeName || "My_Resume.pdf"}
                      </p>
                      <p className="text-[9px] text-muted mt-1 leading-none">
                        Uploaded: {resumeDate || new Date().toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {/* Direct Preview */}
                    {resumeBase64.startsWith("data:") && (
                      <a
                        href={resumeBase64}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 text-muted hover:text-foreground hover:bg-neutral-100 dark:hover:bg-zinc-800 rounded border border-card-border"
                        title="Preview document"
                      >
                        <FileCode className="w-4 h-4" />
                      </a>
                    )}
                    {/* Download */}
                    {resumeBase64.startsWith("data:") && (
                      <a
                        href={resumeBase64}
                        download={resumeName || "My_Resume.pdf"}
                        className="p-1.5 text-primary hover:bg-primary/15 rounded border border-primary/20"
                        title="Download file"
                      >
                        <Download className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Custom Rich Text Editor for Cover Letter */}
            <div className="flex flex-col gap-1.5">
              <label className="font-extrabold text-foreground">Cover Letter / SOP Letter</label>
              
              <div className="rounded-xl border border-card-border overflow-hidden bg-white/40 dark:bg-zinc-950/20">
                {/* Editor Toolbar */}
                <div className="p-2 border-b border-card-border bg-neutral-50/50 dark:bg-zinc-950/30 flex flex-wrap gap-1 items-center">
                  <button
                    type="button"
                    onClick={() => formatText("bold")}
                    className="p-1.5 text-muted hover:text-foreground hover:bg-white/10 rounded cursor-pointer"
                    title="Bold"
                  >
                    <Bold className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => formatText("italic")}
                    className="p-1.5 text-muted hover:text-foreground hover:bg-white/10 rounded cursor-pointer"
                    title="Italic"
                  >
                    <Italic className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => formatText("formatBlock", "<h3>")}
                    className="p-1.5 text-muted hover:text-foreground hover:bg-white/10 rounded cursor-pointer"
                    title="Heading"
                  >
                    <Heading className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => formatText("insertUnorderedList")}
                    className="p-1.5 text-muted hover:text-foreground hover:bg-white/10 rounded cursor-pointer"
                    title="Bullet List"
                  >
                    <List className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={handleInsertLink}
                    className="p-1.5 text-muted hover:text-foreground hover:bg-white/10 rounded cursor-pointer font-bold text-[10px]"
                    title="Insert Link"
                  >
                    Link
                  </button>
                </div>

                {/* Editor Editable Body */}
                <div
                  ref={editorRef}
                  contentEditable
                  onInput={handleEditorInput}
                  className="p-3 text-xs text-foreground focus:outline-none min-h-[140px] max-h-[220px] overflow-y-auto bg-transparent whitespace-pre-wrap leading-relaxed text-left"
                  style={{ minHeight: "140px" }}
                />
              </div>
            </div>

            {/* Submission Actions */}
            <div className="flex gap-2 justify-end pt-3 border-t border-card-border shrink-0">
              <button
                type="button"
                onClick={closeDialog}
                className="px-4 py-2 border border-card-border hover:bg-white/10 text-muted hover:text-foreground font-semibold rounded-lg transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!resumeBase64 || !coverLetterHtml.trim()}
                className="px-6 py-2 bg-primary hover:bg-primary-hover text-white font-semibold rounded-lg transition-colors cursor-pointer disabled:opacity-50"
              >
                Submit Application
              </button>
            </div>

          </form>
        </div>
      </dialog>
    </>
  );
}
