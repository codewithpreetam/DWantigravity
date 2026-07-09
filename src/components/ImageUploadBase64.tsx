"use client";

import React, { useState } from "react";
import toast from "react-hot-toast";

interface ImageUploadBase64Props {
  name: string;
  defaultValue?: string | null;
  maxSizeMB?: number;
  label?: string;
  subLabel?: string;
  className?: string;
  fallbackText?: string;
}

export default function ImageUploadBase64({
  name,
  defaultValue,
  maxSizeMB = 3,
  label = "Upload Image",
  subLabel = "Upload a JPG, PNG, or GIF file.",
  className = "",
  fallbackText = "IMG"
}: ImageUploadBase64Props) {
  const [base64String, setBase64String] = useState<string>(defaultValue || "");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size limit
    const limit = maxSizeMB * 1024 * 1024;
    if (file.size > limit) {
      toast.error(`The uploaded file size must be less than ${maxSizeMB} MB.`);
      e.target.value = ""; // Clear file selector
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setBase64String(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className={`flex flex-col sm:flex-row items-center gap-4 p-4 rounded-xl border border-card-border bg-white/30 dark:bg-zinc-950/20 ${className}`}>
      {/* Hidden input to pass base64 to FormData naturally */}
      <input type="hidden" name={name} value={base64String} />

      {/* Preview */}
      <div className="relative w-16 h-16 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-lg border border-card-border overflow-hidden shrink-0">
        {base64String ? (
          <img src={base64String} alt="Preview" className="w-full h-full object-contain bg-white" />
        ) : (
          <span className="uppercase text-xs">{fallbackText}</span>
        )}
      </div>

      {/* Upload Controls */}
      <div className="space-y-1.5 flex-1">
        <label className="font-bold text-foreground block">{label}</label>
        <p className="text-[10px] text-muted leading-none block">{subLabel} (Max {maxSizeMB}MB)</p>
        <input 
          type="file" 
          accept="image/*" 
          onChange={handleFileChange}
          className="text-[10px] text-muted file:mr-2 file:py-1.5 file:px-3 file:rounded-md file:border file:border-card-border file:bg-white/50 file:text-[9px] file:font-semibold hover:file:bg-primary/5 cursor-pointer file:cursor-pointer w-full max-w-xs mt-2"
        />
      </div>
      
      {base64String && base64String !== defaultValue && (
        <button 
          type="button" 
          onClick={() => setBase64String(defaultValue || "")}
          className="text-[9px] font-bold text-red-500 hover:underline px-2 py-1"
        >
          Reset
        </button>
      )}
    </div>
  );
}
