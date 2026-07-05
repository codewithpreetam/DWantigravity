"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";

export default function SortSelect({ defaultValue }: { defaultValue: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("sort", e.target.value);
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <select
      defaultValue={defaultValue}
      onChange={handleChange}
      className="border border-card-border rounded-xl bg-white/40 dark:bg-black/20 text-xs text-foreground p-2 font-semibold focus:outline-none cursor-pointer"
    >
      <option value="RECENTLY_UPDATED">Recently Updated</option>
      <option value="NEWEST">Newest First</option>
      <option value="OLDEST">Oldest First</option>
      <option value="DEADLINE">Deadline</option>
    </select>
  );
}
