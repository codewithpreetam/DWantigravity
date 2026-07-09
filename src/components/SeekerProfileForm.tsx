"use client";

import React, { useState } from "react";
import { FileText, CheckCircle, AlertCircle } from "lucide-react";
import { updateCandidateProfileAction } from "@/app/actions/candidate";
import { toast } from "react-hot-toast";

import { MASTER_SKILLS } from "@/lib/skills";

interface SeekerProfileFormProps {
  userId: string;
  initialProfile: {
    name?: string | null;
    email?: string | null;
    bio?: string | null;
    skills?: string[];
    experience?: string | null;
    experienceYears?: number | null;
    workExperiences?: any;
    educationDegree?: string | null;
    languages?: string[];
    location?: string | null;
    resumeUrl?: string | null;
    profilePhoto?: string | null;
    domain?: string | null;
    secondaryDomain?: string | null;
    workModePreference?: string | null;
    employmentTypePreference?: string | null;
    currentOrganization?: string | null;
    jobTitle?: string | null;
  };
}

export default function SeekerProfileForm({ userId, initialProfile }: SeekerProfileFormProps) {
  const [photoBase64, setPhotoBase64] = useState<string>(initialProfile.profilePhoto || "");
  const [resumeBase64, setResumeBase64] = useState<string>(initialProfile.resumeUrl || "");
  const [resumeName, setResumeName] = useState<string>(
    initialProfile.resumeUrl?.startsWith("data:") ? "Active_Resume_CV.pdf" : (initialProfile.resumeUrl ? "Active_Resume_CV.pdf" : "")
  );
  
  const [isPending, setIsPending] = useState(false);

  const [selectedSkills, setSelectedSkills] = useState<string[]>(initialProfile.skills || []);
  const [customSkillInput, setCustomSkillInput] = useState<string>("");
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>(initialProfile.languages || []);
  const [customLanguageInput, setCustomLanguageInput] = useState<string>("");

  const [workExperiences, setWorkExperiences] = useState<any[]>(() => {
    if (initialProfile.workExperiences && Array.isArray(initialProfile.workExperiences)) {
      return initialProfile.workExperiences;
    }
    return [];
  });

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setPhotoBase64(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleResumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size limit: 5 MB
    const limit = 5 * 1024 * 1024;
    if (file.size > limit) {
      toast.error("The uploaded CV file size must be less than 5 MB.");
      e.target.value = ""; // Clear file selector
      return;
    }

    setResumeName(file.name);
    
    const reader = new FileReader();
    reader.onloadend = () => {
      setResumeBase64(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsPending(true);

    const form = e.currentTarget;
    const formData = new FormData(form);
    formData.append("userId", userId);
    formData.append("profilePhoto", photoBase64);
    formData.append("resumeUrl", resumeBase64);

    // Clear and append array items
    formData.delete("skills");
    selectedSkills.forEach(skill => formData.append("skills", skill));

    formData.delete("languages");
    selectedLanguages.forEach(lang => formData.append("languages", lang));

    formData.append("workExperiences", JSON.stringify(workExperiences));

    try {
      const res = await updateCandidateProfileAction(formData);
      if (res.success) {
        toast.success("Your seeker profile has been successfully saved!");
      } else {
        toast.error(res.error || "Failed to update profile.");
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "An unexpected error occurred.");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 text-xs text-left animate-fadeIn">

      {/* Profile Photo Upload Header Section */}
      <div className="flex flex-col sm:flex-row items-center gap-4 p-4 rounded-xl border border-card-border bg-white/30 dark:bg-zinc-950/20">
        <div className="relative w-16 h-16 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-lg border border-card-border overflow-hidden shrink-0">
          {photoBase64 ? (
            <img src={photoBase64} alt="Avatar" className="w-full h-full object-cover" />
          ) : (
            <span className="uppercase">{initialProfile.name?.substring(0, 1) || "S"}</span>
          )}
        </div>
        <div className="space-y-1.5">
          <label className="font-bold text-foreground">Profile Picture</label>
          <p className="text-[10px] text-muted leading-none">Upload a square image file (JPG, PNG, GIF) to display on your dashboard.</p>
          <input 
            type="file" 
            accept="image/*" 
            onChange={handlePhotoChange}
            className="text-[10px] text-muted file:mr-2 file:py-1 file:px-2 file:rounded file:border file:border-card-border file:bg-white/50 file:text-[9px] file:font-semibold hover:file:bg-primary/5 cursor-pointer file:cursor-pointer"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1">
          <label className="font-semibold text-muted">Full Name</label>
          <input 
            type="text" 
            name="name"
            required
            defaultValue={initialProfile.name || ""} 
            placeholder="Aarav Sharma" 
            className="form-input" 
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="font-semibold text-muted">Email Address</label>
          <input 
            type="email" 
            disabled 
            defaultValue={initialProfile.email || ""} 
            className="form-input opacity-70 cursor-not-allowed" 
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1">
          <label className="font-semibold text-muted">Current Job Title</label>
          <input 
            type="text" 
            name="jobTitle"
            defaultValue={initialProfile.jobTitle || ""} 
            placeholder="E.g. Marketing Manager" 
            className="form-input" 
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="font-semibold text-muted">Current Organization</label>
          <input 
            type="text" 
            name="currentOrganization"
            defaultValue={initialProfile.currentOrganization || ""} 
            placeholder="E.g. Save The Children" 
            className="form-input" 
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1">
          <label className="font-semibold text-muted">Primary Domain / Sector</label>
          <input 
            type="text" 
            name="domain"
            defaultValue={initialProfile.domain || ""} 
            placeholder="E.g. Education, Health, Environment" 
            className="form-input" 
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="font-semibold text-muted">Secondary Domain (Optional)</label>
          <input 
            type="text" 
            name="secondaryDomain"
            defaultValue={initialProfile.secondaryDomain || ""} 
            placeholder="E.g. Women Empowerment" 
            className="form-input" 
          />
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <label className="font-semibold text-muted">Professional Summary (Bio)</label>
        <textarea 
          name="bio"
          rows={3} 
          defaultValue={initialProfile.bio || ""} 
          placeholder="Tell NGOs about your values, CSR experience, and career goals..." 
          className="form-input resize-none"
        ></textarea>
      </div>

      {/* DYNAMIC WORK EXPERIENCES BUILDER */}
      <div className="flex flex-col gap-4 p-4 rounded-xl border border-card-border bg-white/30 dark:bg-zinc-950/20">
        <div>
          <label className="font-bold text-foreground text-xs">Work Experiences</label>
          <p className="text-[10px] text-muted leading-none mt-1">Add your work history. Total years of experience will be calculated automatically.</p>
        </div>
        
        {workExperiences.map((exp, index) => (
          <div key={index} className="flex flex-col gap-3 p-3 border border-border rounded-lg bg-background/50 relative">
            <button
              type="button"
              onClick={() => {
                const newExp = [...workExperiences];
                newExp.splice(index, 1);
                setWorkExperiences(newExp);
              }}
              className="absolute top-2 right-2 text-red-500 hover:text-red-700 text-[10px] font-bold px-2 py-1 bg-red-500/10 rounded cursor-pointer"
            >
              Remove
            </button>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pr-16">
              <input 
                type="text" 
                placeholder="Organization" 
                value={exp.organization || ""}
                onChange={(e) => {
                  const newExp = [...workExperiences];
                  newExp[index].organization = e.target.value;
                  setWorkExperiences(newExp);
                }}
                className="form-input text-[11px]" 
              />
              <input 
                type="text" 
                placeholder="Designation" 
                value={exp.designation || ""}
                onChange={(e) => {
                  const newExp = [...workExperiences];
                  newExp[index].designation = e.target.value;
                  setWorkExperiences(newExp);
                }}
                className="form-input text-[11px]" 
              />
              <div className="flex items-center gap-2">
                <input 
                  type="month" 
                  value={exp.startDate || ""}
                  onChange={(e) => {
                    const newExp = [...workExperiences];
                    newExp[index].startDate = e.target.value;
                    setWorkExperiences(newExp);
                  }}
                  className="form-input text-[11px] flex-1" 
                />
                <span className="text-[10px] font-medium">to</span>
                <input 
                  type="month" 
                  value={exp.endDate || ""}
                  disabled={exp.current}
                  onChange={(e) => {
                    const newExp = [...workExperiences];
                    newExp[index].endDate = e.target.value;
                    setWorkExperiences(newExp);
                  }}
                  className="form-input text-[11px] flex-1 disabled:opacity-50" 
                />
              </div>
              <div className="flex items-center gap-2 px-1">
                <input 
                  type="checkbox" 
                  checked={exp.current || false}
                  onChange={(e) => {
                    const newExp = [...workExperiences];
                    newExp[index].current = e.target.checked;
                    if (e.target.checked) newExp[index].endDate = "";
                    setWorkExperiences(newExp);
                  }}
                  className="rounded border-border text-primary cursor-pointer" 
                  id={`current-${index}`}
                />
                <label htmlFor={`current-${index}`} className="text-[11px] cursor-pointer">Currently Working Here</label>
              </div>
            </div>
            <textarea
              placeholder="Key Responsibilities..."
              value={exp.responsibilities || ""}
              onChange={(e) => {
                const newExp = [...workExperiences];
                newExp[index].responsibilities = e.target.value;
                setWorkExperiences(newExp);
              }}
              className="form-input text-[11px] resize-none mt-1"
              rows={2}
            ></textarea>
          </div>
        ))}

        <button
          type="button"
          onClick={() => {
            setWorkExperiences([...workExperiences, { organization: "", designation: "", startDate: "", endDate: "", current: false, responsibilities: "" }]);
          }}
          className="px-4 py-2 bg-neutral-200 dark:bg-zinc-800 hover:bg-neutral-300 dark:hover:bg-zinc-700 text-foreground font-semibold rounded-lg text-[10px] transition-colors cursor-pointer w-fit"
        >
          + Add Work Experience
        </button>
      </div>

      {/* 1. KEY SECTOR SKILLS */}
      <div className="flex flex-col gap-2 p-4 rounded-xl border border-card-border bg-white/30 dark:bg-zinc-950/20">
        <label className="font-bold text-foreground text-xs">Standardized Sector Skills</label>
        <p className="text-[10px] text-muted leading-none">Select the matching key skills you specialize in for CSR & NGO vacancies.</p>
        
        <div className="flex flex-wrap gap-1.5 mt-2">
          {MASTER_SKILLS.map((skill) => {
            const isSelected = selectedSkills.includes(skill);
            return (
              <button
                key={skill}
                type="button"
                onClick={() => {
                  if (isSelected) {
                    setSelectedSkills(selectedSkills.filter(s => s !== skill));
                  } else {
                    setSelectedSkills([...selectedSkills, skill]);
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
            placeholder="Add a custom skill..."
            className="form-input flex-1 py-1 text-[11px]"
          />
          <button
            type="button"
            onClick={() => {
              const val = customSkillInput.trim();
              if (val && !selectedSkills.includes(val)) {
                setSelectedSkills([...selectedSkills, val]);
                setCustomSkillInput("");
              }
            }}
            className="px-3 py-1 bg-neutral-200 dark:bg-zinc-800 hover:bg-neutral-300 dark:hover:bg-zinc-700 text-foreground font-semibold rounded-lg text-[10px] transition-colors cursor-pointer"
          >
            Add
          </button>
        </div>
      </div>

      {/* 2. MATCHING PARAMETERS (EXPERIENCE, EDUCATION, LOCATION) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Years of Experience */}
        <div className="flex flex-col gap-1">
          <label className="font-semibold text-muted">Years of Experience (Numeric)</label>
          <input 
            type="number" 
            name="experienceYears"
            defaultValue={initialProfile.experienceYears ?? 0} 
            placeholder="3" 
            className="form-input" 
            min={0}
          />
        </div>

        {/* Highest Education Level */}
        <div className="flex flex-col gap-1">
          <label className="font-semibold text-muted">Highest Education Level</label>
          <select
            name="educationDegree"
            defaultValue={initialProfile.educationDegree || ""}
            className="form-input bg-background py-2"
          >
            <option value="">Select Degree...</option>
            <option value="High School">High School</option>
            <option value="Bachelor's">Bachelor's Degree</option>
            <option value="Master's">Master's Degree</option>
            <option value="Doctorate">Doctorate Degree</option>
          </select>
        </div>

        {/* Preferred / Current Location */}
        <div className="flex flex-col gap-1">
          <label className="font-semibold text-muted">Preferred / Current Location</label>
          <input 
            type="text" 
            name="location"
            defaultValue={initialProfile.location || ""} 
            placeholder="New Delhi" 
            className="form-input" 
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Work Mode Preference */}
        <div className="flex flex-col gap-1">
          <label className="font-semibold text-muted">Work Mode Preference</label>
          <select
            name="workModePreference"
            defaultValue={initialProfile.workModePreference || ""}
            className="form-input bg-background py-2"
          >
            <option value="">Select Work Mode...</option>
            <option value="Remote">Remote</option>
            <option value="Hybrid">Hybrid</option>
            <option value="On-site">On-site</option>
          </select>
        </div>

        {/* Employment Type Preference */}
        <div className="flex flex-col gap-1">
          <label className="font-semibold text-muted">Employment Type Preference</label>
          <select
            name="employmentTypePreference"
            defaultValue={initialProfile.employmentTypePreference || ""}
            className="form-input bg-background py-2"
          >
            <option value="">Select Employment Type...</option>
            <option value="Full-time">Full-time</option>
            <option value="Part-time">Part-time</option>
            <option value="Contract">Contract</option>
            <option value="Internship">Internship</option>
            <option value="Freelance">Freelance</option>
            <option value="Volunteer">Volunteer</option>
          </select>
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <label className="font-semibold text-muted">Detailed Experience Summary (Text)</label>
        <input 
          type="text" 
          name="experience"
          defaultValue={initialProfile.experience || ""} 
          placeholder="E.g., 3 years in primary education management" 
          className="form-input" 
        />
      </div>

      {/* 3. LANGUAGES SPOKEN */}
      <div className="flex flex-col gap-2 p-4 rounded-xl border border-card-border bg-white/30 dark:bg-zinc-950/20">
        <label className="font-bold text-foreground text-xs">Languages Spoken</label>
        <p className="text-[10px] text-muted leading-none">Select the languages you speak fluently to match against required languages.</p>
        
        <div className="flex flex-wrap gap-1.5 mt-2">
          {["English", "Hindi", "Bengali", "Tamil", "Telugu", "Marathi", "Kannada"].map((lang) => {
            const isSelected = selectedLanguages.includes(lang);
            return (
              <button
                key={lang}
                type="button"
                onClick={() => {
                  if (isSelected) {
                    setSelectedLanguages(selectedLanguages.filter(l => l !== lang));
                  } else {
                    setSelectedLanguages([...selectedLanguages, lang]);
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
              if (val && !selectedLanguages.includes(val)) {
                setSelectedLanguages([...selectedLanguages, val]);
                setCustomLanguageInput("");
              }
            }}
            className="px-3 py-1 bg-neutral-200 dark:bg-zinc-800 hover:bg-neutral-300 dark:hover:bg-zinc-700 text-foreground font-semibold rounded-lg text-[10px] transition-colors cursor-pointer"
          >
            Add
          </button>
        </div>
      </div>

      {/* PDF Resume CV File Upload Block */}
      <div className="p-4 rounded-xl border border-card-border bg-white/30 dark:bg-zinc-950/20 space-y-3">
        <h4 className="font-bold text-foreground text-xs flex items-center gap-1.5">
          <FileText className="w-4.5 h-4.5 text-primary" />
          <span>Upload Resume / CV Document (PDF)</span>
        </h4>
        <p className="text-[10px] text-muted leading-relaxed">
          Upload your curriculum vitae to attach to NGO applications.
          <strong className="text-primary block mt-0.5">Maximum file size: 5 MB (PDF format only).</strong>
        </p>

        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <input 
            type="file" 
            accept=".pdf" 
            onChange={handleResumeChange}
            className="text-[10px] text-muted file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border file:border-card-border file:bg-white/50 file:text-[10px] file:font-semibold hover:file:bg-primary/5 cursor-pointer file:cursor-pointer"
          />
          
          {resumeBase64 && (
            <div className="flex items-center gap-1.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-3 py-1 rounded border border-emerald-500/20 font-semibold text-[10px]">
              <CheckCircle className="w-3.5 h-3.5" />
              <span>{resumeName || "Active_Resume.pdf"}</span>
              {resumeBase64.startsWith("data:") && (
                <a 
                  href={resumeBase64} 
                  download="My_Resume.pdf" 
                  className="text-[9px] text-primary hover:underline ml-1 font-bold"
                >
                  Download
                </a>
              )}
            </div>
          )}
        </div>
      </div>

      <button 
        type="submit" 
        disabled={isPending}
        className="px-6 py-2.5 bg-primary hover:bg-primary-hover text-white rounded-lg font-semibold transition-colors cursor-pointer w-fit self-start disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
      >
        {isPending ? "Saving Seeker Profile..." : "Save Seeker Profile"}
      </button>
    </form>
  );
}
