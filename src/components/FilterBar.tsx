"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useCallback, useTransition } from "react";
import { Search, X, SlidersHorizontal } from "lucide-react";

export interface FilterConfig {
  /** URL search param name */
  name: string;
  /** Dropdown label when nothing selected */
  placeholder: string;
  /** Options from the database */
  options: { label: string; value: string }[];
}

interface FilterBarProps {
  filters: FilterConfig[];
  searchPlaceholder?: string;
  /** current q value for the search input */
  q?: string;
}

const LABEL_MAP: Record<string, string> = {
  ON_SITE: "On-site",
  REMOTE: "Remote",
  HYBRID: "Hybrid",
  FULL_TIME: "Full Time",
  PART_TIME: "Part Time",
  CONTRACTOR: "Contract",
  INTERN: "Internship",
  VOLUNTEER: "Volunteer",
  IN_PERSON: "In Person",
  WEBINAR: "Webinar",
};

function prettify(v: string): string {
  return LABEL_MAP[v] ?? v.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
}

export default function FilterBar({ filters, searchPlaceholder = "Search...", q = "" }: FilterBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  const buildUrl = useCallback((overrides: Record<string, string>) => {
    const p = new URLSearchParams(searchParams.toString());
    // remove id from URL on any filter change
    p.delete("id");
    for (const [k, v] of Object.entries(overrides)) {
      if (v === "") p.delete(k);
      else p.set(k, v);
    }
    return `${pathname}?${p.toString()}`;
  }, [searchParams, pathname]);

  const handleSelectChange = (name: string, value: string) => {
    startTransition(() => {
      router.push(buildUrl({ [name]: value }));
    });
  };

  const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(() => {
      router.push(buildUrl({ q: (fd.get("q") as string) || "" }));
    });
  };

  const clearFilter = (name: string) => {
    startTransition(() => {
      router.push(buildUrl({ [name]: "" }));
    });
  };

  // Active chips — all currently set filter params
  const activeChips: { name: string; value: string; label: string }[] = [];
  for (const f of filters) {
    const v = searchParams.get(f.name) || "";
    if (v) {
      const opt = f.options.find(o => o.value === v);
      activeChips.push({ name: f.name, value: v, label: opt?.label ?? prettify(v) });
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2 glass-panel p-1.5 rounded-xl">
        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="flex items-center gap-1.5 flex-1 min-w-[160px]">
          <Search className="w-4 h-4 text-muted ml-1 shrink-0" />
          <input
            type="text"
            name="q"
            defaultValue={q}
            placeholder={searchPlaceholder}
            className="w-full bg-transparent px-1 py-1.5 text-xs text-foreground focus:outline-none placeholder:text-muted"
          />
          <button
            type="submit"
            className="px-3 py-1.5 bg-primary hover:bg-primary-hover text-white rounded-lg text-xs font-semibold transition-colors shrink-0"
          >
            Search
          </button>
        </form>

        {/* Dynamic select dropdowns */}
        {filters.map(f => {
          if (!f.options.length) return null;
          const current = searchParams.get(f.name) || "";
          return (
            <div key={f.name} className="relative">
              <select
                value={current}
                onChange={e => handleSelectChange(f.name, e.target.value)}
                className="text-xs bg-neutral-100 dark:bg-zinc-800 border border-card-border outline-none py-1.5 pl-2 pr-6 rounded-lg text-foreground font-semibold appearance-none cursor-pointer"
              >
                <option value="">{f.placeholder}</option>
                {f.options.map(o => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
              {/* chevron */}
              <span className="pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2 text-muted text-[10px]">▾</span>
            </div>
          );
        })}

        {/* Results icon */}
        <SlidersHorizontal className="w-4 h-4 text-muted hidden sm:block" />
      </div>

      {/* Active filter chips */}
      {activeChips.length > 0 && (
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-[10px] font-semibold text-muted uppercase tracking-wider">Active Filters:</span>
          {activeChips.map(chip => (
            <button
              key={chip.name}
              onClick={() => clearFilter(chip.name)}
              className="flex items-center gap-1 px-2.5 py-1 bg-primary/10 hover:bg-red-500/10 text-primary hover:text-red-500 border border-primary/20 hover:border-red-500/20 rounded-full text-[10px] font-bold transition-colors"
            >
              {chip.label}
              <X className="w-3 h-3" />
            </button>
          ))}
          <button
            onClick={() => {
              startTransition(() => {
                router.push(pathname);
              });
            }}
            className="text-[10px] text-muted hover:text-foreground underline"
          >
            Clear all
          </button>
        </div>
      )}
    </div>
  );
}
