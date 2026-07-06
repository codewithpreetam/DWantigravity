"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Bold, Italic, Heading, List } from "lucide-react";
import { 
  createJobAction, createInternshipAction, createFellowshipAction,
  createScholarshipAction, createGrantAction, createConsultancyAction,
  createVolunteerAction, createEventAction, updateOpportunityAction
} from "@/app/actions/employer";
import { MASTER_SKILLS } from "@/lib/skills";

interface OpportunityPostFormProps {
  organizationId: string;
  editOpp?: any; // The opportunity object being edited
  cancelUrl?: string;
}

type OpportunityType = "JOB" | "INTERNSHIP" | "FELLOWSHIP" | "SCHOLARSHIP" | "GRANT" | "CONSULTANCY" | "VOLUNTEER" | "EVENT";

export default function OpportunityPostForm({ organizationId, editOpp, cancelUrl }: OpportunityPostFormProps) {
  const [type, setType] = useState<OpportunityType>(editOpp?.type || "JOB");
  const [isPending, setIsPending] = useState(false);
  const [message, setMessage] = useState<{ success?: string; error?: string } | null>(null);

  const [requiredSkills, setRequiredSkills] = useState<string[]>(editOpp?.requiredSkills || []);
  const [preferredSkills, setPreferredSkills] = useState<string[]>(editOpp?.preferredSkills || []);
  const [requiredLanguages, setRequiredLanguages] = useState<string[]>(editOpp?.requiredLanguages || []);
  const [customLanguageInput, setCustomLanguageInput] = useState("");
  const [customSkillInput, setCustomSkillInput] = useState("");

  const [descriptionHtml, setDescriptionHtml] = useState(editOpp?.description || "");
  const [coverImage, setCoverImage] = useState<string>(editOpp?.coverImage || "");
  const editorRef = useRef<HTMLDivElement>(null);

  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");
          if (!ctx) return reject("Canvas error");
          
          let width = img.width;
          let height = img.height;
          
          if (width > 1600) {
            height = Math.round((height * 1600) / width);
            width = 1600;
          }
          
          canvas.width = width;
          canvas.height = height;
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL("image/webp", 0.8));
        };
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const handleCoverImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      try {
        const base64Str = await compressImage(e.target.files[0]);
        setCoverImage(base64Str);
      } catch (err) {
        console.error("Image compression failed", err);
      }
    }
  };

  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.innerHTML = editOpp?.description || "";
      setDescriptionHtml(editOpp?.description || "");
    }
  }, [editOpp]);

  const formatText = (command: string, value: string = "") => {
    document.execCommand(command, false, value);
    if (editorRef.current) {
      setDescriptionHtml(editorRef.current.innerHTML);
    }
  };

  const handleInsertLink = () => {
    const url = prompt("Enter hyperlink URL (e.g. https://example.com):");
    if (url) {
      formatText("createLink", url);
    }
  };

  const handleEditorInput = (e: React.FormEvent<HTMLDivElement>) => {
    setDescriptionHtml(e.currentTarget.innerHTML);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsPending(true);
    setMessage(null);

    const form = e.currentTarget;
    const formData = new FormData(form);
    formData.append("organizationId", organizationId);
    
    if (type === "EVENT" && coverImage) {
      formData.append("coverImage", coverImage);
    }

    // Append array criteria
    formData.delete("requiredSkills");
    requiredSkills.forEach(s => formData.append("requiredSkills", s));

    formData.delete("preferredSkills");
    preferredSkills.forEach(s => formData.append("preferredSkills", s));

    formData.delete("requiredLanguages");
    requiredLanguages.forEach(l => formData.append("requiredLanguages", l));

    try {
      if (editOpp) {
        formData.append("oppId", editOpp.id);
        formData.append("oppType", editOpp.type);
        const res = await updateOpportunityAction(formData);
        if (res?.error) {
          throw new Error(res.error);
        }
        setMessage({ success: `Successfully updated your ${type.toLowerCase()} opportunity!` });
        if (cancelUrl) {
          setTimeout(() => {
            window.location.href = cancelUrl;
          }, 1000);
        }
        return;
      }

      switch (type) {
        case "JOB":
          await createJobAction(formData);
          break;
        case "INTERNSHIP":
          await createInternshipAction(formData);
          break;
        case "FELLOWSHIP":
          await createFellowshipAction(formData);
          break;
        case "SCHOLARSHIP":
          await createScholarshipAction(formData);
          break;
        case "GRANT":
          await createGrantAction(formData);
          break;
        case "CONSULTANCY":
          await createConsultancyAction(formData);
          break;
        case "VOLUNTEER":
          await createVolunteerAction(formData);
          break;
        case "EVENT":
          await createEventAction(formData);
          break;
      }
      setMessage({ success: `Successfully published your new ${type.toLowerCase()} opportunity!` });
      form.reset();
      setDescriptionHtml("");
      if (editorRef.current) {
        editorRef.current.innerHTML = "";
      }
    } catch (err: any) {
      console.error(err);
      setMessage({ error: err.message || "An unexpected error occurred while saving." });
    } finally {
      setIsPending(false);
    }
  };

  const formatDateVal = (dateVal: any) => {
    if (!dateVal) return "";
    try {
      return new Date(dateVal).toISOString().split('T')[0];
    } catch (e) {
      return "";
    }
  };

  return (
    <div className="space-y-6">
      {/* Tab selectors only show when creating new, hidden during edits to avoid category type conflicts */}
      {!editOpp && (
        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold text-muted">Select Opportunity Category to Publish</label>
          <div className="flex flex-wrap gap-2">
            {(["JOB", "INTERNSHIP", "FELLOWSHIP", "SCHOLARSHIP", "GRANT", "CONSULTANCY", "VOLUNTEER", "EVENT"] as OpportunityType[]).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => { setType(t); setMessage(null); }}
                className={`px-3 py-1.5 rounded-lg text-[11px] font-bold tracking-wider transition-all cursor-pointer ${
                  type === t 
                    ? "bg-primary text-white shadow-sm" 
                    : "bg-primary/5 text-muted hover:text-foreground hover:bg-primary/10 border border-card-border"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="border-t border-card-border pt-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-foreground">
            {editOpp ? `Edit ${type.toLowerCase()}: ${editOpp.title}` : `Post a new ${type.toLowerCase()}`}
          </h3>
          {editOpp && cancelUrl && (
            <Link
              href={cancelUrl}
              className="px-3 py-1.5 text-xs rounded border border-card-border hover:bg-white/10 font-semibold cursor-pointer text-muted"
            >
              Cancel Edit
            </Link>
          )}
        </div>

        {message?.success && (
          <div className="p-3 mb-4 rounded bg-emerald-500/10 border border-emerald-500/20 text-xs text-primary font-semibold text-center animate-fadeIn">
            🎉 {message.success}
          </div>
        )}
        {message?.error && (
          <div className="p-3 mb-4 rounded bg-red-500/10 border border-red-500/20 text-xs text-red-500 font-semibold text-center animate-fadeIn">
            ⚠️ {message.error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs text-left">
          {/* Common Fields */}
          <div className="flex flex-col gap-1">
            <label className="font-semibold text-muted">Title</label>
            <input 
              type="text" 
              name="title" 
              required 
              defaultValue={editOpp?.title || ""}
              placeholder={`Opportunity Title (e.g. ${
                type === "EVENT" ? "Social Impact Webinar" : "Project Associate"
              })`} 
              className="form-input" 
            />
          </div>

          <div className="flex flex-col gap-1 text-left">
            <label className="font-semibold text-muted">Description</label>
            <input type="hidden" name="description" value={descriptionHtml} />
            
            <div className="rounded-xl border border-card-border overflow-hidden bg-white/40 dark:bg-zinc-950/20">
              {/* Editor Toolbar */}
              <div className="p-2 border-b border-card-border bg-neutral-50/50 dark:bg-zinc-950/30 flex flex-wrap gap-1 items-center">
                <button
                  type="button"
                  onClick={() => formatText("bold")}
                  className="p-1.5 text-muted hover:text-foreground hover:bg-neutral-200 dark:hover:bg-zinc-800 rounded cursor-pointer transition-colors"
                  title="Bold"
                >
                  <Bold className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => formatText("italic")}
                  className="p-1.5 text-muted hover:text-foreground hover:bg-neutral-200 dark:hover:bg-zinc-800 rounded cursor-pointer transition-colors"
                  title="Italic"
                >
                  <Italic className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => formatText("formatBlock", "<h3>")}
                  className="p-1.5 text-muted hover:text-foreground hover:bg-neutral-200 dark:hover:bg-zinc-800 rounded cursor-pointer transition-colors"
                  title="Heading"
                >
                  <Heading className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => formatText("insertUnorderedList")}
                  className="p-1.5 text-muted hover:text-foreground hover:bg-neutral-200 dark:hover:bg-zinc-800 rounded cursor-pointer transition-colors"
                  title="Bullet List"
                >
                  <List className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={handleInsertLink}
                  className="px-2 py-1 text-muted hover:text-foreground hover:bg-neutral-200 dark:hover:bg-zinc-800 rounded cursor-pointer transition-colors text-[10px] font-bold"
                  title="Insert Hyperlink"
                >
                  Link
                </button>
              </div>

              {/* Editor Editable Body */}
              <div
                ref={editorRef}
                contentEditable
                onInput={handleEditorInput}
                className="p-3 text-xs text-foreground focus:outline-none min-h-[160px] max-h-[350px] overflow-y-auto bg-transparent whitespace-pre-wrap leading-relaxed text-left"
              />
            </div>
          </div>

          {type !== "EVENT" && (
            <div className="flex flex-col gap-1">
              <label className="font-semibold text-muted">Requirements</label>
              <textarea 
                name="requirements" 
                rows={3} 
                defaultValue={editOpp?.requirements || ""}
                placeholder="Qualifications, technical skills, language parameters..." 
                className="form-input resize-none"
              ></textarea>
            </div>
          )}

          {/* Conditional Fields based on Type */}
          {(type === "JOB" || type === "INTERNSHIP" || type === "FELLOWSHIP" || type === "CONSULTANCY" || type === "VOLUNTEER" || type === "EVENT") && (
            <div className="flex flex-col gap-1">
              <label className="font-semibold text-muted">Location</label>
              <input 
                type="text" 
                name="location" 
                required 
                defaultValue={editOpp?.location || ""}
                placeholder="New Delhi, Delhi or Remote" 
                className="form-input" 
              />
            </div>
          )}

          {type === "JOB" && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="font-semibold text-muted">Min Salary (INR/year)</label>
                  <input 
                    type="number" 
                    name="salaryMin" 
                    defaultValue={editOpp?.salaryMin || ""}
                    placeholder="400000" 
                    className="form-input" 
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="font-semibold text-muted">Max Salary (INR/year)</label>
                  <input 
                    type="number" 
                    name="salaryMax" 
                    defaultValue={editOpp?.salaryMax || ""}
                    placeholder="600000" 
                    className="form-input" 
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="font-semibold text-muted">Employment Type</label>
                  <select 
                    name="employmentType" 
                    defaultValue={editOpp?.employmentType || "FULL_TIME"}
                    className="form-input bg-background py-2"
                  >
                    <option value="FULL_TIME">Full-Time</option>
                    <option value="PART_TIME">Part-Time</option>
                    <option value="CONTRACTOR">Contractor</option>
                    <option value="TEMPORARY">Temporary</option>
                    <option value="INTERN">Internship</option>
                    <option value="VOLUNTEER">Volunteer</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="font-semibold text-muted">Work Mode</label>
                  <select 
                    name="workMode" 
                    defaultValue={editOpp?.workMode || "ON_SITE"}
                    className="form-input bg-background py-2"
                  >
                    <option value="ON_SITE">On-site</option>
                    <option value="HYBRID">Hybrid</option>
                    <option value="REMOTE">Fully Remote</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {(type === "INTERNSHIP" || type === "FELLOWSHIP") && (
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="font-semibold text-muted">Stipend (INR/month)</label>
                <input 
                  type="number" 
                  name="stipend" 
                  defaultValue={editOpp?.stipend || ""}
                  placeholder="15000" 
                  className="form-input" 
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="font-semibold text-muted">Duration (e.g. 6 Months)</label>
                <input 
                  type="text" 
                  name="duration" 
                  defaultValue={editOpp?.duration || ""}
                  placeholder="6 Months" 
                  className="form-input" 
                />
              </div>
            </div>
          )}

          {type === "SCHOLARSHIP" && (
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="font-semibold text-muted">Award Amount (INR)</label>
                <input 
                  type="number" 
                  name="amount" 
                  defaultValue={editOpp?.amount || ""}
                  placeholder="50000" 
                  className="form-input" 
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="font-semibold text-muted">Application Deadline</label>
                <input 
                  type="date" 
                  name="deadline" 
                  defaultValue={formatDateVal(editOpp?.deadline)}
                  className="form-input" 
                />
              </div>
            </div>
          )}

          {type === "GRANT" && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="font-semibold text-muted">Min Funding (INR)</label>
                  <input 
                    type="number" 
                    name="fundingMin" 
                    defaultValue={editOpp?.fundingMin || ""}
                    placeholder="500000" 
                    className="form-input" 
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="font-semibold text-muted">Max Funding (INR)</label>
                  <input 
                    type="number" 
                    name="fundingMax" 
                    defaultValue={editOpp?.fundingMax || ""}
                    placeholder="2000000" 
                    className="form-input" 
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="font-semibold text-muted">Proposal Deadline</label>
                  <input 
                    type="date" 
                    name="deadline" 
                    defaultValue={formatDateVal(editOpp?.deadline)}
                    className="form-input" 
                  />
                </div>
              </div>
              
              <div className="flex flex-col gap-1 text-left mt-4">
                <label className="font-semibold text-muted">External Apply Link (Optional)</label>
                <input 
                  type="url" 
                  name="externalApplyLink" 
                  defaultValue={editOpp?.externalApplyLink || ""}
                  placeholder="https://organization.org/apply-form" 
                  className="form-input" 
                />
                <p className="text-[10px] text-muted">If provided, applicants will be redirected to this external website to apply instead of applying through Development Wala.</p>
              </div>
            </div>
          )}

          {type === "CONSULTANCY" && (
            <div className="flex flex-col gap-1">
              <label className="font-semibold text-muted">Consulting Budget Limit (INR)</label>
              <input 
                type="number" 
                name="budget" 
                defaultValue={editOpp?.budget || ""}
                placeholder="150000" 
                className="form-input" 
              />
            </div>
          )}

          {type === "VOLUNTEER" && (
            <div className="flex flex-col gap-1">
              <label className="font-semibold text-muted">Duration / Frequency</label>
              <input 
                type="text" 
                name="duration" 
                defaultValue={editOpp?.duration || ""}
                placeholder="Every Saturday or 2 Weeks Relief" 
                className="form-input" 
              />
            </div>
          )}

          {type === "EVENT" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="col-span-1 md:col-span-2 flex flex-col gap-2">
                <label className="font-semibold text-muted">Event Cover Image (16:9 Recommended)</label>
                <p className="text-[10px] text-muted -mt-1">For the best appearance across all devices, upload a 16:9 landscape image (recommended minimum size: 1600 × 900 px). JPG, PNG, and WebP are supported. It will be automatically optimized.</p>
                <input 
                  type="file" 
                  accept="image/jpeg, image/png, image/webp" 
                  onChange={handleCoverImageChange}
                  className="form-input" 
                />
                {coverImage && (
                  <div className="mt-2 relative w-full max-w-sm rounded-xl overflow-hidden border border-card-border shadow-sm aspect-video">
                    <img src={coverImage} alt="Cover Preview" className="w-full h-full object-cover" />
                    <button type="button" onClick={() => setCoverImage("")} className="absolute top-2 right-2 bg-black/50 text-white text-[10px] px-2 py-1 rounded">Remove</button>
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-semibold text-muted">Event Date</label>
                <input type="date" name="date" required defaultValue={formatDateVal(editOpp?.date)} className="form-input" />
              </div>
              <div className="flex flex-col gap-1">
                <label className="font-semibold text-muted">Event Time</label>
                <input type="time" name="time" required defaultValue={editOpp?.time || ""} className="form-input" />
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-semibold text-muted">Time Zone</label>
                <input type="text" name="timeZone" placeholder="e.g. IST, GMT" defaultValue={editOpp?.timeZone || ""} className="form-input" />
              </div>
              <div className="flex flex-col gap-1">
                <label className="font-semibold text-muted">Duration</label>
                <input type="text" name="duration" placeholder="e.g. 2 Hours, 3 Days" defaultValue={editOpp?.duration || ""} className="form-input" />
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-semibold text-muted">Registration Deadline</label>
                <input type="date" name="registrationDeadline" defaultValue={formatDateVal(editOpp?.registrationDeadline)} className="form-input" />
              </div>
              <div className="flex flex-col gap-1">
                <label className="font-semibold text-muted">Capacity (Max Pax)</label>
                <input type="number" name="capacity" defaultValue={editOpp?.capacity || ""} placeholder="e.g. 100" className="form-input" />
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-semibold text-muted">Event Format</label>
                <select name="format" defaultValue={editOpp?.format || "IN_PERSON"} className="form-input">
                  <option value="IN_PERSON">In Person</option>
                  <option value="ONLINE">Online</option>
                  <option value="HYBRID">Hybrid</option>
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="font-semibold text-muted">Price (INR, 0 for free)</label>
                <input type="number" name="price" defaultValue={editOpp?.price || 0} className="form-input" />
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-semibold text-muted">Venue Name</label>
                <input type="text" name="venue" defaultValue={editOpp?.venue || ""} placeholder="e.g. India Habitat Centre" className="form-input" />
              </div>
              <div className="flex flex-col gap-1">
                <label className="font-semibold text-muted">City</label>
                <input type="text" name="city" defaultValue={editOpp?.city || ""} placeholder="e.g. New Delhi" className="form-input" />
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-semibold text-muted">State</label>
                <input type="text" name="state" defaultValue={editOpp?.state || ""} placeholder="e.g. Delhi" className="form-input" />
              </div>
              <div className="flex flex-col gap-1">
                <label className="font-semibold text-muted">Meeting Platform</label>
                <input type="text" name="meetingPlatform" defaultValue={editOpp?.meetingPlatform || ""} placeholder="e.g. Zoom, Google Meet" className="form-input" />
              </div>

              <div className="col-span-1 md:col-span-2 flex flex-col gap-1">
                <label className="font-semibold text-muted">Agenda / Schedule Summary</label>
                <textarea name="agenda" defaultValue={editOpp?.agenda || ""} placeholder="Briefly describe the schedule..." className="form-input min-h-20"></textarea>
              </div>

              <div className="col-span-1 md:col-span-2 flex flex-col gap-1">
                <label className="font-semibold text-muted">Target Audience</label>
                <input type="text" name="audience" defaultValue={editOpp?.audience?.join(", ") || ""} placeholder="e.g. Students, NGO Professionals (comma separated)" className="form-input" />
              </div>

              <div className="col-span-1 md:col-span-2 flex flex-col gap-1">
                <label className="font-semibold text-muted">Eligibility</label>
                <input type="text" name="eligibility" defaultValue={editOpp?.eligibility || ""} placeholder="Any specific requirements to attend" className="form-input" />
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-semibold text-muted">Contact Email</label>
                <input type="email" name="contactEmail" defaultValue={editOpp?.contactEmail || ""} placeholder="info@event.org" className="form-input" />
              </div>
              <div className="flex flex-col gap-1">
                <label className="font-semibold text-muted">Contact Phone</label>
                <input type="text" name="contactPhone" defaultValue={editOpp?.contactPhone || ""} placeholder="+91..." className="form-input" />
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-semibold text-muted">Event Website</label>
                <input type="url" name="website" defaultValue={editOpp?.website || ""} placeholder="https://..." className="form-input" />
              </div>

              <div className="flex items-center gap-4 mt-2">
                <label className="flex items-center gap-2 text-sm font-semibold">
                  <input type="checkbox" name="certificateAvailable" value="true" defaultChecked={editOpp?.certificateAvailable} className="w-4 h-4 rounded border-gray-300" />
                  Certificate Available
                </label>
                <label className="flex items-center gap-2 text-sm font-semibold">
                  <input type="checkbox" name="recordingAvailable" value="true" defaultChecked={editOpp?.recordingAvailable} className="w-4 h-4 rounded border-gray-300" />
                  Recording Available
                </label>
              </div>

            </div>
          )}

          {/* ATS COMPATIBILITY RULES SECTION */}
          <div className="border-t border-card-border pt-6 mt-6 space-y-6">
            <div>
              <h3 className="text-sm font-extrabold text-foreground tracking-tight">ATS Candidate Match Requirements</h3>
              <p className="text-[10px] text-muted">Configure the rule-based matching engine filters for this opportunity.</p>
            </div>

            {/* Standardized Skills Select */}
            <div className="flex flex-col gap-2 p-4 rounded-xl border border-card-border bg-white/30 dark:bg-zinc-950/20">
              <label className="font-bold text-foreground text-xs">Standardized Sector Skills</label>
              <p className="text-[10px] text-muted leading-none">Choose required or preferred skills from the sector database.</p>
              
              <div className="flex flex-wrap gap-1.5 mt-2">
                {MASTER_SKILLS.map((skill) => {
                  const isReq = requiredSkills.includes(skill);
                  const isPref = preferredSkills.includes(skill);
                  const isSelected = isReq || isPref;
                  return (
                    <button
                      key={skill}
                      type="button"
                      onClick={() => {
                        if (isSelected) {
                          setRequiredSkills(requiredSkills.filter(s => s !== skill));
                          setPreferredSkills(preferredSkills.filter(s => s !== skill));
                        } else {
                          // Default to required
                          setRequiredSkills([...requiredSkills, skill]);
                        }
                      }}
                      className={`px-2.5 py-1 rounded-full text-[10px] font-semibold border transition-all cursor-pointer ${
                        isSelected
                          ? "bg-primary border-primary text-white shadow-sm"
                          : "bg-white/50 dark:bg-zinc-900/40 border-card-border text-muted hover:border-neutral-300 dark:hover:border-neutral-700"
                      }`}
                    >
                      {isSelected ? "✓ " : "+ "} {skill}
                    </button>
                  );
                })}
              </div>

              {/* Custom Skill Input */}
              <div className="flex items-center gap-2 mt-3 max-w-sm">
                <input
                  type="text"
                  value={customSkillInput}
                  onChange={(e) => setCustomSkillInput(e.target.value)}
                  placeholder="Add custom skill..."
                  className="form-input flex-1 py-1 text-[11px]"
                />
                <button
                  type="button"
                  onClick={() => {
                    const val = customSkillInput.trim();
                    if (val && !requiredSkills.includes(val) && !preferredSkills.includes(val)) {
                      setRequiredSkills([...requiredSkills, val]);
                      setCustomSkillInput("");
                    }
                  }}
                  className="px-3 py-1 bg-neutral-200 dark:bg-zinc-800 hover:bg-neutral-300 dark:hover:bg-zinc-700 text-foreground font-semibold rounded-lg text-[10px] transition-colors cursor-pointer"
                >
                  Add
                </button>
              </div>

              {/* Skills Weights Allocation Checklist */}
              {(requiredSkills.length > 0 || preferredSkills.length > 0) && (
                <div className="border-t border-card-border/50 pt-3 mt-3 space-y-2">
                  <span className="font-bold text-[10px] text-muted">Skill Weights Configuration:</span>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {[...requiredSkills, ...preferredSkills].map((skill) => {
                      const isReq = requiredSkills.includes(skill);
                      return (
                        <div key={skill} className="flex items-center justify-between p-2 rounded-lg bg-white/40 dark:bg-zinc-900/30 border border-card-border">
                          <span className="font-semibold text-foreground text-[10px]">{skill}</span>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                if (isReq) {
                                  setRequiredSkills(requiredSkills.filter(s => s !== skill));
                                  setPreferredSkills([...preferredSkills, skill]);
                                } else {
                                  setPreferredSkills(preferredSkills.filter(s => s !== skill));
                                  setRequiredSkills([...requiredSkills, skill]);
                                }
                              }}
                              className={`px-2 py-0.5 rounded text-[9px] font-bold cursor-pointer transition-colors ${
                                isReq 
                                  ? "bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20"
                                  : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                              }`}
                            >
                              {isReq ? "Required (10 pts)" : "Preferred (5 pts)"}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Exp & Education Limits */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="font-semibold text-muted">Minimum Required Experience (Years)</label>
                <input 
                  type="number" 
                  name="minExperienceYears"
                  defaultValue={editOpp?.minExperienceYears ?? 0}
                  className="form-input"
                  min={0}
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-semibold text-muted">Minimum Required Education Level</label>
                <select
                  name="minEducation"
                  defaultValue={editOpp?.minEducation || ""}
                  className="form-input bg-background py-2"
                >
                  <option value="">No Requirement</option>
                  <option value="High School">High School</option>
                  <option value="Bachelor's">Bachelor's Degree</option>
                  <option value="Master's">Master's Degree</option>
                  <option value="Doctorate">Doctorate Degree</option>
                </select>
              </div>
            </div>

            {/* Language Requirements */}
            <div className="flex flex-col gap-2 p-4 rounded-xl border border-card-border bg-white/30 dark:bg-zinc-950/20">
              <label className="font-bold text-foreground text-xs">Required Languages</label>
              <p className="text-[10px] text-muted leading-none">Select the languages candidates must speak for this role.</p>
              
              <div className="flex flex-wrap gap-1.5 mt-2">
                {["English", "Hindi", "Bengali", "Tamil", "Telugu", "Marathi", "Kannada"].map((lang) => {
                  const isSelected = requiredLanguages.includes(lang);
                  return (
                    <button
                      key={lang}
                      type="button"
                      onClick={() => {
                        if (isSelected) {
                          setRequiredLanguages(requiredLanguages.filter(l => l !== lang));
                        } else {
                          setRequiredLanguages([...requiredLanguages, lang]);
                        }
                      }}
                      className={`px-2.5 py-1 rounded-full text-[10px] font-semibold border transition-all cursor-pointer ${
                        isSelected
                          ? "bg-primary border-primary text-white shadow-sm"
                          : "bg-white/50 dark:bg-zinc-900/40 border-card-border text-muted hover:border-neutral-300 dark:hover:border-neutral-700"
                      }`}
                    >
                      {isSelected ? "✓ " : "+ "} {lang}
                    </button>
                  );
                })}
              </div>

              {/* Custom Language Input */}
              <div className="flex items-center gap-2 mt-3 max-w-sm">
                <input
                  type="text"
                  value={customLanguageInput}
                  onChange={(e) => setCustomLanguageInput(e.target.value)}
                  placeholder="Add another language..."
                  className="form-input flex-1 py-1 text-[11px]"
                />
                <button
                  type="button"
                  onClick={() => {
                    const val = customLanguageInput.trim();
                    if (val && !requiredLanguages.includes(val)) {
                      setRequiredLanguages([...requiredLanguages, val]);
                      setCustomLanguageInput("");
                    }
                  }}
                  className="px-3 py-1 bg-neutral-200 dark:bg-zinc-800 hover:bg-neutral-300 dark:hover:bg-zinc-700 text-foreground font-semibold rounded-lg text-[10px] transition-colors cursor-pointer"
                >
                  Add
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 mt-6">
            <button 
              type="submit" 
              disabled={isPending}
              className="px-6 py-2.5 bg-primary hover:bg-primary-hover text-white rounded-lg font-semibold transition-colors cursor-pointer w-fit disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            >
              {isPending 
                ? (editOpp ? "Saving..." : "Publishing...") 
                : (editOpp ? "Save Changes" : "Publish Opportunity")
              }
            </button>
            {editOpp && cancelUrl && (
              <Link
                href={cancelUrl}
                className="px-4 py-2.5 text-xs rounded border border-card-border hover:bg-white/10 font-semibold cursor-pointer text-muted flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                Cancel
              </Link>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
