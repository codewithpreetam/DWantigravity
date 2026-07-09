"use client";

import { useActionState, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signUpAction } from "@/app/actions/auth";
import { getOrganizationsAction } from "@/app/actions/employer";
import { Briefcase, ArrowRight, User, Lock, Mail, Building, Search, Plus, Eye, EyeOff, CheckCircle2, ChevronRight, Check, XCircle } from "lucide-react";

export default function SignUpPage() {
  const [state, formAction, isPending] = useActionState(signUpAction, null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const roleParam = searchParams.get("role") || "SEEKER";
  
  const [role, setRole] = useState<string>(roleParam);
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOrgId, setSelectedOrgId] = useState("new");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  
  // Calculate password strength
  const getPasswordStrength = () => {
    let score = 0;
    if (password.length >= 6) score += 1;
    if (password.length >= 10) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;
    return score;
  };

  const strength = getPasswordStrength();
  const strengthLabels = ["Very Weak", "Weak", "Fair", "Good", "Strong"];
  const strengthColors = ["bg-red-500", "bg-orange-500", "bg-yellow-500", "bg-green-500", "bg-emerald-500"];
  const currentStrengthColor = password.length > 0 ? strengthColors[Math.min(strength - 1, 4)] || "bg-red-500" : "bg-muted";

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

  const isValid = name.trim().length > 0 && email.trim().length > 0 && password.length >= 6 && (role === "SEEKER" || (role === "EMPLOYER" && searchQuery.trim().length > 0));

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-background w-full">
      <div className="max-w-[560px] w-full space-y-6">
        
        {/* Header Section */}
        <div className="text-center space-y-3">
          <Link href="/" className="inline-flex items-center gap-2 font-bold text-2xl text-foreground tracking-tight focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-lg p-1">
            <Briefcase className="w-8 h-8 text-primary shrink-0" />
            <span>DevelopmentWala<span className="text-secondary">.org</span></span>
          </Link>
          <h1 className="text-3xl font-extrabold text-foreground tracking-tight">Create your account</h1>
          <p className="text-sm text-muted-foreground">
            Create an account to discover opportunities or recruit top social sector talent.
          </p>
        </div>

        <div className="bg-card p-6 sm:p-8 rounded-2xl border border-border shadow-xl space-y-6">
          
          {/* Social Auth */}
          <div className="space-y-3">
            <button type="button" className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-border bg-background hover:bg-muted text-foreground text-sm font-semibold rounded-xl transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
              <svg className="w-5 h-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg> 
              Continue with Google
            </button>
            <button type="button" className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-[#0A66C2]/20 bg-[#0A66C2]/5 hover:bg-[#0A66C2]/10 text-[#0A66C2] text-sm font-semibold rounded-xl transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg> 
              Continue with LinkedIn
            </button>
          </div>

          <div className="flex items-center gap-3 text-xs text-muted-foreground font-semibold uppercase tracking-wider before:flex-1 before:h-px before:bg-border after:flex-1 after:h-px after:bg-border">
            Or continue with email
          </div>

          {state?.error && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-sm text-red-600 font-medium flex items-center justify-center gap-2" role="alert">
              <XCircle className="w-4 h-4" /> {state.error}
            </div>
          )}

          <form action={formAction} className="space-y-5 text-sm text-left">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-1.5 relative">
                <label htmlFor="name" className="font-semibold text-foreground">Full Name</label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Aarav Sharma"
                  className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                  aria-label="Full Name"
                />
              </div>

              <div className="space-y-1.5 relative">
                <label htmlFor="email" className="font-semibold text-foreground">Email Address</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                  aria-label="Email Address"
                />
              </div>
            </div>

            <div className="space-y-1.5 relative">
              <label htmlFor="password" className="font-semibold text-foreground">Password</label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min. 6 characters"
                  className="w-full pl-4 pr-10 py-2.5 bg-background border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                  aria-label="Password"
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              
              {/* Password Strength Indicator */}
              {password.length > 0 && (
                <div className="pt-1 flex items-center justify-between">
                  <div className="flex gap-1 flex-1 max-w-[200px]">
                    {[1, 2, 3, 4, 5].map((level) => (
                      <div 
                        key={level} 
                        className={`h-1.5 rounded-full flex-1 transition-colors duration-300 ${strength >= level ? currentStrengthColor : 'bg-border'}`} 
                      />
                    ))}
                  </div>
                  <span className={`text-xs font-medium ${strength >= 3 ? 'text-green-600' : 'text-muted-foreground'}`}>
                    {strengthLabels[Math.min(strength - 1, 4)]}
                  </span>
                </div>
              )}
            </div>

            {/* Account Type Selection */}
            <div className="space-y-3 pt-2">
              <label className="font-semibold text-foreground">Choose Account Type</label>
              
              {/* Hidden input to pass role to the server action */}
              <input type="hidden" name="role" value={role} />
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Candidate Card */}
                <button
                  type="button"
                  onClick={() => setRole("SEEKER")}
                  className={`relative flex flex-col items-start text-left p-4 rounded-xl border-2 transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${
                    role === "SEEKER" 
                      ? "border-primary bg-primary/5 shadow-sm" 
                      : "border-border bg-background hover:bg-muted/50 hover:border-muted-foreground/30"
                  }`}
                  aria-pressed={role === "SEEKER"}
                >
                  <div className="flex items-center justify-between w-full mb-1">
                    <span className="font-bold text-foreground text-base">Candidate</span>
                    {role === "SEEKER" ? (
                      <CheckCircle2 className="w-5 h-5 text-primary" />
                    ) : (
                      <div className="w-5 h-5 rounded-full border-2 border-border" />
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground font-medium leading-snug">Find and apply for opportunities.</span>
                </button>

                {/* Employer Card */}
                <button
                  type="button"
                  onClick={() => setRole("EMPLOYER")}
                  className={`relative flex flex-col items-start text-left p-4 rounded-xl border-2 transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${
                    role === "EMPLOYER" 
                      ? "border-primary bg-primary/5 shadow-sm" 
                      : "border-border bg-background hover:bg-muted/50 hover:border-muted-foreground/30"
                  }`}
                  aria-pressed={role === "EMPLOYER"}
                >
                  <div className="flex items-center justify-between w-full mb-1">
                    <span className="font-bold text-foreground text-base">Employer</span>
                    {role === "EMPLOYER" ? (
                      <CheckCircle2 className="w-5 h-5 text-primary" />
                    ) : (
                      <div className="w-5 h-5 rounded-full border-2 border-border" />
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground font-medium leading-snug">Post opportunities and recruit candidates.</span>
                </button>
              </div>
            </div>

            {/* Expandable Employer Organization Setup */}
            <div className={`overflow-hidden transition-all duration-300 ease-in-out ${role === "EMPLOYER" ? "max-h-[300px] opacity-100 mt-4" : "max-h-0 opacity-0 mt-0"}`}>
              <div className="p-4 rounded-xl border border-primary/20 bg-primary/5 space-y-3">
                <div className="flex flex-col gap-1.5 relative">
                  <label className="font-semibold text-foreground flex items-center gap-1.5">
                    <Building className="w-4 h-4 text-primary" />
                    <span>Organization Name</span>
                  </label>
                  <p className="text-xs text-muted-foreground mb-1">Search for an existing organization or enter a new one.</p>
                  
                  <div className="relative">
                    <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setSelectedOrgId("new");
                        setShowSuggestions(true);
                      }}
                      onFocus={() => setShowSuggestions(true)}
                      placeholder="e.g. Goonj, Pratham..."
                      className="w-full pl-9 pr-4 py-2.5 bg-background border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-sm"
                      required={role === "EMPLOYER"}
                    />
                  </div>
                  
                  {/* Suggestions dropdown */}
                  {showSuggestions && filteredOrgs.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-xl max-h-40 overflow-y-auto z-20 shadow-xl">
                      {filteredOrgs.map((org) => (
                        <button
                          key={org.id}
                          type="button"
                          onClick={() => {
                            setSearchQuery(org.name);
                            setSelectedOrgId(org.id);
                            setShowSuggestions(false);
                          }}
                          className="w-full px-4 py-3 flex items-center gap-3 hover:bg-muted text-left text-foreground cursor-pointer focus-visible:outline-none focus-visible:bg-muted transition-colors"
                        >
                          {org.logo ? (
                            <img src={org.logo} alt="" className="w-6 h-6 rounded-md object-cover border border-border" />
                          ) : (
                            <div className="w-6 h-6 rounded-md bg-muted flex items-center justify-center">
                              <Building className="w-3.5 h-3.5 text-muted-foreground" />
                            </div>
                          )}
                          <span className="font-semibold text-sm">{org.name}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <input type="hidden" name="orgId" value={selectedOrgId} />
                <input type="hidden" name="orgName" value={searchQuery} />
                
                {selectedOrgId === "new" && searchQuery.trim().length > 0 && (
                  <div className="flex items-start gap-2 p-3 bg-card border border-border rounded-lg shadow-sm">
                    <Plus className="w-4 h-4 text-primary mt-0.5" />
                    <div>
                      <p className="text-xs font-semibold text-foreground">Registering new organization</p>
                      <p className="text-[11px] text-muted-foreground">A new master profile will be created for "{searchQuery}".</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={isPending || !isValid}
              className="w-full py-3.5 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl shadow-lg shadow-primary/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none flex items-center justify-center gap-2 mt-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            >
              {isPending ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating Account...
                </>
              ) : (
                "Create Account"
              )}
            </button>
          </form>

        </div>

        <div className="text-center text-sm font-medium">
          <span className="text-muted-foreground">Already have an account? </span>
          <Link href="/auth/signin" className="text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded p-1">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
