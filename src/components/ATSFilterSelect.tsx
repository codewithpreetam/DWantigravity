"use client";

import React from "react";
import { useRouter, useSearchParams } from "next/navigation";

interface ATSFilterSelectProps {
  filterOppId: string;
  opportunities: Array<{ id: string; title: string; type: string }>;
}

export default function ATSFilterSelect({ filterOppId, opportunities }: ATSFilterSelectProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const q = searchParams.get("q") || "";
    router.push(`/dashboard/employer?tab=ats&filterOppId=${e.target.value}${q ? `&q=${q}` : ""}`);
  };

  return (
    <select
      value={filterOppId}
      onChange={handleChange}
      className="form-input text-[11px] py-1 bg-background cursor-pointer"
    >
      <option value="all">All Opportunities</option>
      {opportunities.map(o => (
        <option key={o.id} value={o.id}>{o.title} ({o.type})</option>
      ))}
    </select>
  );
}
