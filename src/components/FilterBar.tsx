"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react";
import { Search, X, SlidersHorizontal, Filter as FilterIcon, ChevronDown, MapPin } from "lucide-react";

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
  q?: string;
  locationPlaceholder?: string;
  locationValue?: string;
  locationParamName?: string;
  locationSuggestions?: string[];
  quickFilterNames?: string[];
  sortParamName?: string;
  sortValue?: string;
  sortOptions?: { label: string; value: string }[];
  moreFiltersTitle?: string;
  salaryRange?: {
    min: number;
    max: number;
    step?: number;
    minParamName?: string;
    maxParamName?: string;
    valueMin?: number;
    valueMax?: number;
    label?: string;
  };
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

function formatINRCompact(value: number): string {
  if (value >= 10000000) return `₹${(value / 10000000).toFixed(1)}Cr`;
  if (value >= 100000) return `₹${(value / 100000).toFixed(1)}L`;
  if (value >= 1000) return `₹${(value / 1000).toFixed(0)}k`;
  return `₹${value}`;
}

export default function FilterBar({
  filters,
  searchPlaceholder = "Search...",
  q = "",
  locationPlaceholder = "Location (country, state, city, district)",
  locationValue = "",
  locationParamName = "location",
  locationSuggestions = [],
  quickFilterNames = [],
  sortParamName = "sort",
  sortValue = "",
  sortOptions = [],
  moreFiltersTitle = "More Filters",
  salaryRange,
}: FilterBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isSalaryOpen, setIsSalaryOpen] = useState(false);
  const salaryPopoverRef = useRef<HTMLDivElement | null>(null);

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
    const locationTyped = (fd.get(locationParamName) as string) || "";
    startTransition(() => {
      router.push(buildUrl({ q: (fd.get("q") as string) || "", [locationParamName]: locationTyped }));
    });
  };

  const handleSortChange = (value: string) => {
    startTransition(() => {
      router.push(buildUrl({ [sortParamName]: value }));
    });
  };

  const clearFilter = (name: string) => {
    startTransition(() => {
      router.push(buildUrl({ [name]: "" }));
    });
  };

  const quickSet = useMemo(() => new Set(quickFilterNames), [quickFilterNames]);
  const quickFilters = filters.filter((f) => quickSet.has(f.name));
  const moreFilters = filters.filter((f) => !quickSet.has(f.name));

  const salaryMinParamName = salaryRange?.minParamName ?? "salaryMin";
  const salaryMaxParamName = salaryRange?.maxParamName ?? "salaryMax";
  const salaryStep = salaryRange?.step ?? 50000;
  const [salaryMinSelected, setSalaryMinSelected] = useState(salaryRange?.valueMin ?? salaryRange?.min ?? 0);
  const [salaryMaxSelected, setSalaryMaxSelected] = useState(salaryRange?.valueMax ?? salaryRange?.max ?? 0);

  useEffect(() => {
    if (!salaryRange) return;
    setSalaryMinSelected(salaryRange.valueMin ?? salaryRange.min);
    setSalaryMaxSelected(salaryRange.valueMax ?? salaryRange.max);
  }, [salaryRange?.min, salaryRange?.max, salaryRange?.valueMin, salaryRange?.valueMax]);

  useEffect(() => {
    if (!isSalaryOpen) return;
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (salaryPopoverRef.current && !salaryPopoverRef.current.contains(target)) {
        setIsSalaryOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isSalaryOpen]);

  const applySalaryRange = () => {
    if (!salaryRange) return;
    startTransition(() => {
      router.push(
        buildUrl({
          [salaryMinParamName]: String(salaryMinSelected),
          [salaryMaxParamName]: String(salaryMaxSelected),
        })
      );
      setIsSalaryOpen(false);
    });
  };

  // Active chips — all currently set filter params
  const activeChips: { name: string; value: string; label: string }[] = [];

  if (q) {
    activeChips.push({ name: "q", value: q, label: `Keyword: ${q}` });
  }
  if (locationValue) {
    activeChips.push({ name: locationParamName, value: locationValue, label: `Location: ${locationValue}` });
  }
  if (sortValue) {
    const sortLabel = sortOptions.find((s) => s.value === sortValue)?.label ?? sortValue;
    activeChips.push({ name: sortParamName, value: sortValue, label: `Sort: ${sortLabel}` });
  }
  if (salaryRange) {
    const minFromUrl = searchParams.get(salaryMinParamName);
    const maxFromUrl = searchParams.get(salaryMaxParamName);
    if (minFromUrl || maxFromUrl) {
      activeChips.push({
        name: `${salaryMinParamName}__${salaryMaxParamName}`,
        value: `${minFromUrl || salaryRange.min}-${maxFromUrl || salaryRange.max}`,
        label: `Salary: ${formatINRCompact(Number(minFromUrl || salaryRange.min))} - ${formatINRCompact(Number(maxFromUrl || salaryRange.max))}`,
      });
    }
  }

  for (const f of filters) {
    if (f.name === locationParamName) continue;
    const v = searchParams.get(f.name) || "";
    if (v) {
      const opt = f.options.find(o => o.value === v);
      activeChips.push({ name: f.name, value: v, label: opt?.label ?? prettify(v) });
    }
  }

  const filterCount = activeChips.filter((c) => c.name !== "q" && c.name !== sortParamName).length;

  return (
    <div className="space-y-3">
      <div className="glass-panel p-2.5 rounded-xl space-y-2.5">
        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr_auto] gap-2">
          <div className="flex items-center gap-2 rounded-lg border border-card-border bg-white/50 dark:bg-black/20 px-2.5 py-2">
            <Search className="w-4 h-4 text-muted shrink-0" />
            <input
              type="text"
              name="q"
              defaultValue={q}
              placeholder={searchPlaceholder}
              className="w-full bg-transparent text-xs text-foreground focus:outline-none placeholder:text-muted"
            />
          </div>

          <div className="flex items-center gap-2 rounded-lg border border-card-border bg-white/50 dark:bg-black/20 px-2.5 py-2">
            <MapPin className="w-4 h-4 text-muted shrink-0" />
            <input
              type="text"
              name={locationParamName}
              list={`${locationParamName}-datalist`}
              defaultValue={locationValue}
              placeholder={locationPlaceholder}
              className="w-full bg-transparent text-xs text-foreground focus:outline-none placeholder:text-muted"
            />
            <datalist id={`${locationParamName}-datalist`}>
              {locationSuggestions.map((loc) => (
                <option key={loc} value={loc} />
              ))}
            </datalist>
          </div>

          <button
            type="submit"
            className="px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg text-xs font-semibold transition-colors"
          >
            Search
          </button>
        </form>

        <div className="hidden md:flex flex-wrap items-center gap-2">
          {quickFilters.map((f) => {
            if (!f.options.length) return null;
            const current = searchParams.get(f.name) || "";
            return (
              <div key={f.name} className="relative">
                <select
                  value={current}
                  onChange={(e) => handleSelectChange(f.name, e.target.value)}
                  className="text-xs bg-neutral-100 dark:bg-zinc-800 border border-card-border outline-none py-2 pl-2.5 pr-7 rounded-lg text-foreground font-semibold appearance-none cursor-pointer"
                >
                  <option value="">{f.placeholder}</option>
                  {f.options.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted" />
              </div>
            );
          })}

          {salaryRange && (
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsSalaryOpen((prev) => !prev)}
                className="px-3 py-2 rounded-lg border border-card-border text-xs font-semibold inline-flex items-center gap-1.5 hover:bg-white/70 dark:hover:bg-black/20"
              >
                <span>Salary</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isSalaryOpen ? "rotate-180" : ""}`} />
              </button>
            </div>
          )}

          {moreFilters.length > 0 && (
            <button
              type="button"
              onClick={() => setIsDrawerOpen(true)}
              className="px-3 py-2 rounded-lg border border-card-border text-xs font-semibold inline-flex items-center gap-1.5 hover:bg-white/70 dark:hover:bg-black/20"
            >
              <FilterIcon className="w-3.5 h-3.5" />
              <span>{moreFiltersTitle}</span>
              {filterCount > 0 && <span className="text-primary">({filterCount})</span>}
            </button>
          )}

          {sortOptions.length > 0 && (
            <div className="relative ml-auto">
              <select
                value={sortValue}
                onChange={(e) => handleSortChange(e.target.value)}
                className="text-xs bg-neutral-100 dark:bg-zinc-800 border border-card-border outline-none py-2 pl-2.5 pr-7 rounded-lg text-foreground font-semibold appearance-none cursor-pointer"
              >
                <option value="">Sort by</option>
                {sortOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted" />
            </div>
          )}
        </div>

        <div className="md:hidden flex items-center gap-2">
          {salaryRange && (
            <button
              type="button"
              onClick={() => setIsSalaryOpen((prev) => !prev)}
              className="px-3 py-2 rounded-lg border border-card-border text-xs font-semibold inline-flex items-center gap-1.5 hover:bg-white/70 dark:hover:bg-black/20"
            >
              <span>Salary</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isSalaryOpen ? "rotate-180" : ""}`} />
            </button>
          )}

          <button
            type="button"
            onClick={() => setIsDrawerOpen(true)}
            className="px-3 py-2 rounded-lg border border-card-border text-xs font-semibold inline-flex items-center gap-1.5 hover:bg-white/70 dark:hover:bg-black/20"
          >
            <FilterIcon className="w-3.5 h-3.5" />
            <span>Filters {filterCount > 0 ? `(${filterCount})` : ""}</span>
          </button>

          {sortOptions.length > 0 && (
            <div className="relative flex-1">
              <select
                value={sortValue}
                onChange={(e) => handleSortChange(e.target.value)}
                className="w-full text-xs bg-neutral-100 dark:bg-zinc-800 border border-card-border outline-none py-2 pl-2.5 pr-7 rounded-lg text-foreground font-semibold appearance-none cursor-pointer"
              >
                <option value="">Sort by</option>
                {sortOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted" />
            </div>
          )}
        </div>

      </div>

      {salaryRange && isSalaryOpen && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/35" />
          <div className="absolute left-1/2 top-[24vh] -translate-x-1/2 w-[min(92vw,760px)]" ref={salaryPopoverRef}>
            <div className="rounded-2xl border-2 border-primary/80 bg-background shadow-2xl p-6 space-y-5">
              <div className="flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setIsSalaryOpen(false)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-card-border text-xs font-semibold"
                >
                  <span>Salary</span>
                  <ChevronDown className="w-3.5 h-3.5 rotate-180" />
                </button>
                <span className="text-sm font-bold text-foreground">
                  {formatINRCompact(salaryMinSelected)} - {formatINRCompact(salaryMaxSelected)}
                </span>
              </div>

              <div className="space-y-2">
                <div className="text-xs text-muted">Minimum Salary</div>
                <input
                  type="range"
                  min={salaryRange.min}
                  max={salaryRange.max}
                  step={salaryStep}
                  value={salaryMinSelected}
                  onChange={(e) => {
                    const next = Number(e.target.value);
                    setSalaryMinSelected(Math.min(next, salaryMaxSelected));
                  }}
                  className="w-full accent-primary"
                />
              </div>

              <div className="space-y-2">
                <div className="text-xs text-muted">Maximum Salary</div>
                <input
                  type="range"
                  min={salaryRange.min}
                  max={salaryRange.max}
                  step={salaryStep}
                  value={salaryMaxSelected}
                  onChange={(e) => {
                    const next = Number(e.target.value);
                    setSalaryMaxSelected(Math.max(next, salaryMinSelected));
                  }}
                  className="w-full accent-primary"
                />
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setSalaryMinSelected(salaryRange.min);
                    setSalaryMaxSelected(salaryRange.max);
                    startTransition(() => {
                      router.push(buildUrl({ [salaryMinParamName]: "", [salaryMaxParamName]: "" }));
                    });
                  }}
                  className="px-3 py-2 border border-card-border rounded-lg text-xs font-semibold hover:bg-white/70 dark:hover:bg-black/20"
                >
                  Reset
                </button>
                <button
                  type="button"
                  onClick={applySalaryRange}
                  className="px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg text-xs font-semibold"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Active filter chips */}
      {activeChips.length > 0 && (
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-[10px] font-semibold text-muted uppercase tracking-wider">Active Filters:</span>
          {activeChips.map(chip => (
            <button
              key={`${chip.name}-${chip.value}`}
              onClick={() => {
                if (chip.name === `${salaryMinParamName}__${salaryMaxParamName}`) {
                  startTransition(() => {
                    router.push(buildUrl({ [salaryMinParamName]: "", [salaryMaxParamName]: "" }));
                  });
                  return;
                }
                clearFilter(chip.name);
              }}
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

      {isDrawerOpen && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/45" onClick={() => setIsDrawerOpen(false)} />
          <aside className="absolute right-0 top-0 h-full w-full md:w-[420px] bg-background border-l border-card-border p-4 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-foreground">Filters</h3>
              <button
                type="button"
                onClick={() => setIsDrawerOpen(false)}
                className="p-1.5 rounded-lg border border-card-border hover:bg-white/70 dark:hover:bg-black/20"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              {filters.map((f) => {
                if (!f.options.length) return null;
                const current = searchParams.get(f.name) || "";
                return (
                  <div key={`drawer-${f.name}`} className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted">{f.placeholder}</label>
                    <select
                      value={current}
                      onChange={(e) => handleSelectChange(f.name, e.target.value)}
                      className="w-full text-xs bg-neutral-100 dark:bg-zinc-800 border border-card-border outline-none py-2 px-2.5 rounded-lg text-foreground font-semibold"
                    >
                      <option value="">All</option>
                      {f.options.map((o) => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                      ))}
                    </select>
                  </div>
                );
              })}
            </div>

            <div className="pt-4 mt-4 border-t border-card-border flex gap-2">
              <button
                type="button"
                onClick={() => {
                  startTransition(() => {
                    router.push(pathname);
                    setIsDrawerOpen(false);
                  });
                }}
                className="flex-1 py-2 rounded-lg border border-card-border text-xs font-semibold hover:bg-white/70 dark:hover:bg-black/20"
              >
                Clear All Filters
              </button>
              <button
                type="button"
                onClick={() => setIsDrawerOpen(false)}
                className="flex-1 py-2 rounded-lg bg-primary text-white text-xs font-semibold"
              >
                Done
              </button>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
