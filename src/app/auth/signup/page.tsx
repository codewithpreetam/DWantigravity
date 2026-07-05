"use client";

import { useActionState, useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signUpAction } from "@/app/actions/auth";
import { getOrganizationsAction } from "@/app/actions/employer";
import { Briefcase, ArrowRight, User, Lock, Mail, Building, Search, Plus } from "lucide-react";

function SignUpForm() {
  const [state, formAction, isPending] = useActionState(signUpAction, null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const roleParam = searchParams.get("role") || "SEEKER";
  
  const [role, setRole] = useState<string>(roleParam);
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOrgId, setSelectedOrgId] = useState("new");
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    async function loadOrgs() {
      const data = await getOrganizationsAction();
      setOrganizations(data);
    }
    loadOrgs();
  }, []);

  const filteredOrgs = searchQuery
    ? organizations.filter(o => o.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : [];

  // Redirect on successful sign up
  useEffect(() => {
    if (state?.success && state?.redirect) {
      router.push(state.redirect);
    }
  }, [state, router]);

  return (
    <div className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative bg-gradient-glow w-full">
      <div className="absolute top-20 right-1/3 w-80 h-80 bg-secondary/10 rounded-full blur-3xl -z-10 animate-pulse"></div>

      <div className="max-w-md w-full space-y-8 glass-panel p-8 rounded-2xl border border-card-border shadow-lg">
        <div className="text-center">
          <Link href="/" className="inline-flex items-center gap-2 font-bold text-2xl text-gradient tracking-tight">
            <Briefcase className="w-7 h-7 text-primary" />
            <span>DevelopmentWala<span className="text-secondary">.org</span></span>
          </Link>
          <h2 className="mt-4 text-2xl font-extrabold text-foreground">Create a new account</h2>
          <p className="mt-1 text-xs text-muted">
            Or{" "}
            <Link href="/auth/signin" className="font-semibold text-primary hover:underline">
              sign in to your existing account
            </Link>
          </p>
        </div>

        {state?.error && (
          <div className="p-3 rounded bg-red-500/10 border border-red-500/20 text-xs text-red-500 font-semibold text-center">
            ⚠️ {state.error}
          </div>
        )}

        <form action={formAction} className="mt-6 space-y-4 text-xs text-left">
          <div className="flex flex-col gap-1">
            <label className="font-semibold text-muted flex items-center gap-1">
              <User className="w-3.5 h-3.5 text-primary" />
              <span>Full Name</span>
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              placeholder="Aarav Sharma"
              className="form-input"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-semibold text-muted flex items-center gap-1">
              <Mail className="w-3.5 h-3.5 text-primary" />
              <span>Email Address</span>
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              placeholder="aarav@gmail.com"
              className="form-input"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-semibold text-muted flex items-center gap-1">
              <Lock className="w-3.5 h-3.5 text-primary" />
              <span>Password (min. 6 characters)</span>
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              placeholder="••••••••"
              className="form-input"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-semibold text-muted">Account Role Type</label>
            <select
              id="role"
              name="role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="form-input cursor-pointer"
            >
              <option value="SEEKER">Social Impact Candidate Seeker</option>
              <option value="EMPLOYER">NGO Employer / Recruiter</option>
            </select>
          </div>

          {role === "EMPLOYER" && (
            <div className="space-y-4 animate-fadeIn">
              {/* Autocomplete Input */}
              <div className="flex flex-col gap-1 relative">
                <label className="font-semibold text-muted flex items-center gap-1">
                  <Search className="w-3.5 h-3.5 text-primary" />
                  <span>Search Registered Organization</span>
                </label>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setSelectedOrgId("new"); // Reset if they edit query
                    setShowSuggestions(true);
                  }}
                  onFocus={() => setShowSuggestions(true)}
                  placeholder="Type to search (e.g. Goonj, Pratham)..."
                  className="form-input"
                />
                
                {/* Suggestions dropdown */}
                {showSuggestions && filteredOrgs.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 glass-panel border border-card-border bg-white dark:bg-black/90 rounded-lg max-h-40 overflow-y-auto z-20 shadow-xl">
                    {filteredOrgs.map((org) => (
                      <button
                        key={org.id}
                        type="button"
                        onClick={() => {
                          setSearchQuery(org.name);
                          setSelectedOrgId(org.id);
                          setShowSuggestions(false);
                        }}
                        className="w-full px-3 py-2 flex items-center gap-2 hover:bg-primary/10 text-left text-foreground cursor-pointer text-xs"
                      >
                        {org.logo ? (
                          <img src={org.logo} alt="" className="w-5 h-5 rounded object-cover border border-card-border" />
                        ) : (
                          <Building className="w-4 h-4 text-muted" />
                        )}
                        <span className="font-semibold">{org.name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Hidden Input mapping orgId */}
              <input type="hidden" name="orgId" value={selectedOrgId} />

              {/* If no selected org, show org creation name field */}
              {selectedOrgId === "new" ? (
                <div className="flex flex-col gap-1 p-3 rounded-lg border border-dashed border-card-border bg-primary/5 animate-fadeIn">
                  <p className="text-[10px] text-primary font-bold mb-2 flex items-center gap-1">
                    <Plus className="w-3.5 h-3.5" /> Register a New Organization Profile
                  </p>
                  <label className="font-semibold text-muted flex items-center gap-1">
                    <Building className="w-3.5 h-3.5 text-primary" />
                    <span>Organization Legal Name</span>
                  </label>
                  <input
                    id="orgName"
                    name="orgName"
                    type="text"
                    required
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Goonj or Pratham Education Foundation"
                    className="form-input"
                  />
                  <p className="text-[9px] text-muted mt-1 leading-snug">
                    No matching organization found. Enter details above to register a new master organization profile.
                  </p>
                </div>
              ) : (
                <div className="p-3 rounded-lg border border-emerald-500/20 bg-emerald-500/5 text-[10px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center justify-between">
                  <span>Selected Organization: {searchQuery}</span>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedOrgId("new");
                      setSearchQuery("");
                    }}
                    className="text-primary hover:underline cursor-pointer"
                  >
                    Clear selection
                  </button>
                </div>
              )}
            </div>
          )}

          <button
            type="submit"
            disabled={isPending}
            className="w-full py-3 bg-primary hover:bg-primary-hover text-white rounded-lg font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer shadow-md text-xs mt-2 disabled:opacity-50"
          >
            {isPending ? "Creating account..." : "Register Now"}
            {!isPending && <ArrowRight className="w-4 h-4" />}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function SignUpPage() {
  return (
    <Suspense fallback={<div className="flex-1 flex items-center justify-center py-20 text-xs text-muted">Loading Portal...</div>}>
      <SignUpForm />
    </Suspense>
  );
}
