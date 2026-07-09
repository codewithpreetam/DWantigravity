"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Bold, Italic, Heading, List } from "lucide-react";
import { createEventAction, updateOpportunityAction } from "@/app/actions/employer";
import toast from "react-hot-toast";

interface EventPostFormProps {
  organizationId?: string;
  editOpp?: any; // The event being edited
  cancelUrl?: string;
  adminOrgs?: { id: string; name: string }[];
}

export default function EventPostForm({ organizationId, editOpp, cancelUrl, adminOrgs }: EventPostFormProps) {
  const [isPending, setIsPending] = useState(false);
  const [selectedOrgId, setSelectedOrgId] = useState<string>(organizationId || adminOrgs?.[0]?.id || "");

  const [descriptionHtml, setDescriptionHtml] = useState(editOpp?.description || "");
  const [coverImage, setCoverImage] = useState<string>(editOpp?.coverImage || "");
  const [format, setFormat] = useState(editOpp?.format || "IN_PERSON");
  const [customQuestions, setCustomQuestions] = useState<{id: string, text: string, required: boolean}[]>(
    (function parseQs(qs: any) {
      if (!qs) return [];
      if (Array.isArray(qs)) return qs;
      if (typeof qs === "string") {
        try {
          const p = JSON.parse(qs);
          return Array.isArray(p) ? p : [];
        } catch {
          return [];
        }
      }
      return [];
    })(editOpp?.customQuestions)
  );
  
  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.innerHTML = editOpp?.description || "";
      setDescriptionHtml(editOpp?.description || "");
    }
  }, [editOpp]);

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

  const formatText = (command: string, value?: string) => {
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

  const handlePaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    e.preventDefault();
    const html = e.clipboardData.getData("text/html");
    const text = e.clipboardData.getData("text/plain");

    if (html) {
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, "text/html");

      const unwanted = doc.body.querySelectorAll("script, style, meta, link, iframe, object, embed, img, svg");
      unwanted.forEach(el => el.remove());

      const allElements = doc.body.querySelectorAll("*");
      allElements.forEach((el) => {
        const href = el.getAttribute("href");
        while (el.attributes.length > 0) el.removeAttribute(el.attributes[0].name);
        if (el.tagName.toLowerCase() === "a" && href) {
          el.setAttribute("href", href);
          el.setAttribute("target", "_blank");
          el.setAttribute("rel", "noopener noreferrer");
        }
        if (["H1", "H2", "H4", "H5", "H6"].includes(el.tagName)) {
          const h3 = document.createElement("h3");
          h3.innerHTML = el.innerHTML;
          el.parentNode?.replaceChild(h3, el);
        }
      });

      document.execCommand("insertHTML", false, doc.body.innerHTML);
    } else if (text) {
      const cleanText = text.replace(/\n/g, "<br>");
      document.execCommand("insertHTML", false, cleanText);
    }

    setTimeout(() => {
      if (editorRef.current) setDescriptionHtml(editorRef.current.innerHTML);
    }, 0);
  };

  const handleEditorInput = (e: React.FormEvent<HTMLDivElement>) => {
    setDescriptionHtml(e.currentTarget.innerHTML);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsPending(true);

    const form = e.currentTarget;
    const formData = new FormData(form);
    if (!selectedOrgId) {
      toast.error("Organization ID is missing.");
      setIsPending(false);
      return;
    }
    formData.append("organizationId", selectedOrgId);
    formData.append("customQuestions", JSON.stringify(customQuestions));
    
    if (coverImage) {
      formData.append("coverImage", coverImage);
    }

    try {
      if (editOpp) {
        formData.append("oppId", editOpp.id);
        formData.append("oppType", "EVENT");
        const res = await updateOpportunityAction(formData);
        if (res?.error) {
          throw new Error(res.error);
        }
        
        toast.success(`Event successfully updated.`, { icon: "✅", duration: 3000 });
        
        if (cancelUrl) {
          setTimeout(() => {
            window.location.href = cancelUrl;
          }, 1500);
        } else {
          setTimeout(() => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }, 1500);
        }
        return;
      }

      await createEventAction(formData);
      
      toast.success(`Event successfully submitted.`, { icon: "✅", duration: 3000 });
      
      form.reset();
      setDescriptionHtml("");
      setCoverImage("");
      if (editorRef.current) {
        editorRef.current.innerHTML = "";
      }

      setTimeout(() => {
        window.location.href = "/dashboard/employer";
      }, 1500);

    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "An unexpected error occurred while saving.");
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
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold text-foreground">
          {editOpp ? `Edit Event: ${editOpp.title}` : `Host a New Event`}
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

      <form onSubmit={handleSubmit} className="space-y-6 text-xs text-left">
        {/* Admin Organization Selector */}
        {adminOrgs && adminOrgs.length > 0 && !editOpp && (
          <div className="flex flex-col gap-1 p-4 bg-primary/5 border border-primary/20 rounded-xl">
            <label className="font-bold text-primary flex items-center gap-1.5 text-sm">Post on behalf of Organization *</label>
            <select 
              value={selectedOrgId}
              onChange={(e) => setSelectedOrgId(e.target.value)}
              className="form-input"
              required
            >
              {adminOrgs.map(org => (
                <option key={org.id} value={org.id}>{org.name}</option>
              ))}
            </select>
          </div>
        )}

        {/* Cover Image Section */}
        <div className="flex flex-col gap-2 p-5 glass-panel border border-card-border rounded-xl">
          <label className="font-semibold text-foreground text-sm">Event Cover Image (16:9 Recommended)</label>
          <p className="text-[10px] text-muted -mt-1">For the best appearance across all devices, upload a 16:9 landscape image. JPG, PNG, WebP supported.</p>
          <input 
            type="file" 
            accept="image/jpeg, image/png, image/webp" 
            onChange={handleCoverImageChange}
            className="form-input max-w-sm" 
          />
          {coverImage && (
            <div className="mt-3 relative w-full max-w-lg rounded-xl overflow-hidden border border-card-border shadow-sm aspect-video">
              <img src={coverImage} alt="Cover Preview" className="w-full h-full object-cover" />
              <button type="button" onClick={() => setCoverImage("")} className="absolute top-3 right-3 bg-black/60 text-white text-xs px-3 py-1.5 rounded-lg hover:bg-black font-semibold cursor-pointer">Remove</button>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <label className="font-semibold text-muted">Title *</label>
          <input type="text" name="title" required defaultValue={editOpp?.title || ""} placeholder="Event Title" className="form-input text-sm" />
        </div>

        <div className="flex flex-col gap-1 text-left">
          <label className="font-semibold text-muted">Description & Details *</label>
          <input type="hidden" name="description" value={descriptionHtml} />
          
          <div className="rounded-xl border border-card-border overflow-hidden bg-white/40 dark:bg-zinc-950/20">
            {/* Editor Toolbar */}
            <div className="p-2 border-b border-card-border bg-neutral-50/50 dark:bg-zinc-950/30 flex flex-wrap gap-1 items-center">
              <button type="button" onMouseDown={(e) => { e.preventDefault(); formatText("bold"); }} className="p-1.5 text-muted hover:text-foreground hover:bg-neutral-200 dark:hover:bg-zinc-800 rounded cursor-pointer transition-colors" title="Bold"><Bold className="w-3.5 h-3.5" /></button>
              <button type="button" onMouseDown={(e) => { e.preventDefault(); formatText("italic"); }} className="p-1.5 text-muted hover:text-foreground hover:bg-neutral-200 dark:hover:bg-zinc-800 rounded cursor-pointer transition-colors" title="Italic"><Italic className="w-3.5 h-3.5" /></button>
              <button type="button" onMouseDown={(e) => { e.preventDefault(); formatText("formatBlock", "<h3>"); }} className="p-1.5 text-muted hover:text-foreground hover:bg-neutral-200 dark:hover:bg-zinc-800 rounded cursor-pointer transition-colors" title="Heading"><Heading className="w-3.5 h-3.5" /></button>
              <button type="button" onMouseDown={(e) => { e.preventDefault(); formatText("insertUnorderedList"); }} className="p-1.5 text-muted hover:text-foreground hover:bg-neutral-200 dark:hover:bg-zinc-800 rounded cursor-pointer transition-colors" title="Bullet List"><List className="w-3.5 h-3.5" /></button>
              <button type="button" onMouseDown={(e) => { e.preventDefault(); handleInsertLink(); }} className="px-2 py-1 text-muted hover:text-foreground hover:bg-neutral-200 dark:hover:bg-zinc-800 rounded cursor-pointer transition-colors text-[10px] font-bold" title="Insert Hyperlink">Link</button>
            </div>

            <div
              ref={editorRef}
              contentEditable
              onPaste={handlePaste}
              onInput={handleEditorInput}
              className="editor-content p-4 text-sm text-foreground focus:outline-none min-h-[160px] max-h-[350px] overflow-y-auto bg-transparent whitespace-pre-wrap leading-relaxed text-left"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="col-span-1 md:col-span-2 flex flex-col gap-1">
            <label className="font-semibold text-muted">Event Format *</label>
            <select name="format" value={format} onChange={(e) => setFormat(e.target.value)} className="form-input">
              <option value="IN_PERSON">In Person</option>
              <option value="ONLINE">Online</option>
              <option value="HYBRID">Hybrid</option>
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-semibold text-muted">Event Date *</label>
            <input type="date" name="date" required defaultValue={formatDateVal(editOpp?.date)} className="form-input" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="font-semibold text-muted">Time Zone</label>
            <select name="timeZone" defaultValue={editOpp?.timeZone || "IST"} className="form-input">
              <option value="IST">IST (Kolkata, Chennai, Mumbai, New Delhi, India)</option>
              <option value="GMT">GMT (Greenwich Mean Time)</option>
              <option value="UTC">UTC (Coordinated Universal Time)</option>
              <option value="PST">PST (Pacific Standard Time)</option>
              <option value="EST">EST (Eastern Standard Time)</option>
              <option value="CET">CET (Central European Time)</option>
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-semibold text-muted">Start Time *</label>
            <input type="time" name="time" required defaultValue={editOpp?.time || ""} className="form-input" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="font-semibold text-muted">End Time (Optional)</label>
            <input type="time" name="endTime" defaultValue={editOpp?.endTime || ""} className="form-input" />
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-semibold text-muted">Duration (Alternative)</label>
            <input type="text" name="duration" placeholder="e.g. 2 Hours, 3 Days" defaultValue={editOpp?.duration || ""} className="form-input" />
          </div>
        </div>

        {(format === "IN_PERSON" || format === "HYBRID") && (
          <div className="p-4 rounded-xl border border-card-border bg-white/30 dark:bg-zinc-950/20 space-y-4">
            <h4 className="font-bold text-foreground text-sm border-b border-card-border pb-2">Location Details</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1 md:col-span-2">
                <label className="font-semibold text-muted">Venue Name / Address</label>
                <input type="text" name="venue" defaultValue={editOpp?.venue || ""} placeholder="e.g. India Habitat Centre, Lodhi Road" className="form-input" />
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
                <label className="font-semibold text-muted">Country</label>
                <input type="text" name="country" defaultValue={editOpp?.country || "India"} placeholder="e.g. India" className="form-input" />
              </div>
            </div>
          </div>
        )}

        {(format === "ONLINE" || format === "HYBRID") && (
          <div className="p-4 rounded-xl border border-card-border bg-white/30 dark:bg-zinc-950/20 space-y-4">
            <h4 className="font-bold text-foreground text-sm border-b border-card-border pb-2">Virtual Meeting Details</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="font-semibold text-muted">Meeting Platform</label>
                <input type="text" name="meetingPlatform" defaultValue={editOpp?.meetingPlatform || ""} placeholder="e.g. Zoom, Google Meet" className="form-input" />
              </div>
              <div className="flex flex-col gap-1">
                <label className="font-semibold text-muted">Meeting Password (If any)</label>
                <input type="text" name="meetingPassword" defaultValue={editOpp?.meetingPassword || ""} placeholder="Passcode" className="form-input" />
              </div>
              <div className="flex flex-col gap-1 md:col-span-2">
                <label className="font-semibold text-muted">Meeting Link (Private)</label>
                <p className="text-[10px] text-muted -mt-1 mb-1">This link is securely hidden from the public page. It is only shown to users in their Dashboard after they register.</p>
                <input type="url" name="meetingLink" defaultValue={editOpp?.meetingLink || ""} placeholder="https://zoom.us/j/..." className="form-input" />
              </div>
              <div className="flex flex-col gap-1 md:col-span-2">
                <label className="font-semibold text-muted">Additional Joining Instructions</label>
                <textarea name="joiningInstructions" rows={3} defaultValue={editOpp?.joiningInstructions || ""} placeholder="Any specific software requirements or rules before joining." className="form-input resize-none" />
              </div>
              <div className="flex flex-col gap-1 md:col-span-2">
                <label className="font-semibold text-muted">When should the Join Button become active?</label>
                <select name="joinButtonVisibility" defaultValue={editOpp?.joinButtonVisibility || "IMMEDIATE"} className="form-input">
                  <option value="IMMEDIATE">Immediately upon registration (Always visible)</option>
                  <option value="24H">24 hours before start time</option>
                  <option value="1H">1 hour before start time</option>
                  <option value="15M">15 minutes before start time</option>
                  <option value="MANUAL">Manual trigger (You must manually activate it)</option>
                </select>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-card-border">
          <div className="flex flex-col gap-1">
            <label className="font-semibold text-muted">Registration Deadline *</label>
            <input type="date" name="registrationDeadline" required defaultValue={formatDateVal(editOpp?.registrationDeadline)} className="form-input" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="font-semibold text-muted">Capacity (Max Pax) (Recommended)</label>
            <input type="number" name="capacity" defaultValue={editOpp?.capacity || ""} placeholder="e.g. 100" className="form-input" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="font-semibold text-muted">Price (INR, 0 for free)</label>
            <input type="number" name="price" defaultValue={editOpp?.price || 0} className="form-input" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="font-semibold text-muted">Event Website (Optional)</label>
            <input type="url" name="website" defaultValue={editOpp?.website || ""} placeholder="https://..." className="form-input" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="col-span-1 md:col-span-2 flex flex-col gap-1">
            <label className="font-semibold text-muted">Agenda / Schedule Summary</label>
            <textarea name="agenda" defaultValue={editOpp?.agenda || ""} placeholder="Briefly describe the schedule..." className="form-input min-h-[80px]"></textarea>
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-semibold text-muted">Target Audience</label>
            <input type="text" name="audience" defaultValue={editOpp?.audience?.join(", ") || ""} placeholder="e.g. Students, Professionals" className="form-input" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="font-semibold text-muted">Eligibility</label>
            <input type="text" name="eligibility" defaultValue={editOpp?.eligibility || ""} placeholder="Any specific requirements" className="form-input" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex flex-col gap-1">
            <label className="font-semibold text-muted">Contact Person</label>
            <input type="text" name="contactPerson" defaultValue={editOpp?.contactPerson || ""} placeholder="Jane Doe" className="form-input" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="font-semibold text-muted">Contact Email</label>
            <input type="email" name="contactEmail" defaultValue={editOpp?.contactEmail || ""} placeholder="info@event.org" className="form-input" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="font-semibold text-muted">Contact Phone</label>
            <input type="text" name="contactPhone" defaultValue={editOpp?.contactPhone || ""} placeholder="+91..." className="form-input" />
          </div>
        </div>

        <div className="flex items-center gap-6 mt-4 p-4 border border-card-border rounded-xl bg-neutral-50 dark:bg-zinc-900">
          <label className="flex items-center gap-2 text-sm font-semibold text-foreground cursor-pointer">
            <input type="checkbox" name="certificateAvailable" value="true" defaultChecked={editOpp?.certificateAvailable} className="w-4 h-4 rounded border-gray-300" />
            Certificate Provided
          </label>
          <label className="flex items-center gap-2 text-sm font-semibold text-foreground cursor-pointer">
            <input type="checkbox" name="recordingAvailable" value="true" defaultChecked={editOpp?.recordingAvailable} className="w-4 h-4 rounded border-gray-300" />
            Session Recording Provided
          </label>
        </div>

        {/* CUSTOM QUESTIONS */}
        <div className="mt-6 p-5 rounded-xl border border-card-border bg-white/30 dark:bg-zinc-950/20 space-y-4">
          <div>
            <h4 className="font-bold text-foreground text-sm border-b border-card-border pb-2 flex justify-between items-center">
              Custom Registration Questions
              <button 
                type="button" 
                onClick={() => setCustomQuestions([...customQuestions, { id: Math.random().toString(36).substring(7), text: "", required: false }])}
                className="text-xs font-semibold text-primary hover:text-primary-hover bg-primary/10 px-3 py-1 rounded-lg"
              >
                + Add Question
              </button>
            </h4>
            <p className="text-[10px] text-muted mt-1">Ask specific questions to your attendees during registration.</p>
          </div>
          
          {customQuestions.length === 0 ? (
            <div className="text-center py-4 text-muted text-xs bg-neutral-50 dark:bg-zinc-900 rounded-lg border border-dashed border-card-border">
              No custom questions added yet.
            </div>
          ) : (
            <div className="space-y-3">
              {customQuestions.map((q, index) => (
                <div key={q.id} className="flex items-start gap-3 p-3 bg-neutral-50 dark:bg-zinc-900 border border-card-border rounded-xl">
                  <div className="flex-1 flex flex-col gap-2">
                    <input 
                      type="text" 
                      placeholder="e.g. Why do you want to attend this event?" 
                      value={q.text} 
                      onChange={(e) => {
                        const newQs = [...customQuestions];
                        newQs[index].text = e.target.value;
                        setCustomQuestions(newQs);
                      }} 
                      className="form-input text-sm" 
                    />
                    <label className="flex items-center gap-2 text-xs font-semibold text-muted cursor-pointer w-fit">
                      <input 
                        type="checkbox" 
                        checked={q.required} 
                        onChange={(e) => {
                          const newQs = [...customQuestions];
                          newQs[index].required = e.target.checked;
                          setCustomQuestions(newQs);
                        }} 
                        className="w-3.5 h-3.5 rounded border-gray-300" 
                      />
                      Required Question
                    </label>
                  </div>
                  <button 
                    type="button" 
                    onClick={() => {
                      const newQs = [...customQuestions];
                      newQs.splice(index, 1);
                      setCustomQuestions(newQs);
                    }}
                    className="p-2 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-lg transition-colors shrink-0"
                    title="Remove Question"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <button 
          type="submit" 
          disabled={isPending} 
          className="w-full py-4 mt-6 bg-primary hover:bg-primary-hover text-white rounded-xl font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {isPending ? "Saving..." : editOpp ? "Update Event Details" : "Publish Event"}
        </button>
      </form>
    </div>
  );
}
