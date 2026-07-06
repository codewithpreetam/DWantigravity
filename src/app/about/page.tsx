import type { Metadata } from "next";
import Link from "next/link";
import { Target, Heart, Briefcase, Globe, Users, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "Learn about DevelopmentWala.org's mission to bridge the gap between talented professionals and organizations creating meaningful impact in the social sector.",
};

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-1 space-y-16">
      {/* ── Hero / Connecting People with Purpose ── */}
      <section className="text-center space-y-6 flex flex-col items-center">
        <img
          src="/logo.png"
          alt="Development Wala Job Board Logo"
          className="h-20 w-20 rounded-xl object-contain border border-card-border shadow-sm mb-4"
        />
        <h1 className="text-4xl sm:text-5xl font-extrabold text-foreground tracking-tight">
          About DevelopmentWala.org
        </h1>
        <h2 className="text-xl sm:text-2xl font-semibold text-primary">Connecting People with Purpose</h2>
        <div className="text-sm text-muted max-w-3xl mx-auto leading-relaxed space-y-4">
          <p>
            <strong className="text-foreground">DevelopmentWala.org</strong> is India's dedicated opportunities platform
            for the social and development sector, created to bridge the gap between talented professionals and
            organizations creating meaningful impact.
          </p>
          <p>
            Our mission is simple: <strong>make it easier for people to discover opportunities that create social change
            and help organizations find the right talent to deliver that change.</strong>
          </p>
          <p>
            Whether you are a student taking your first step into the development sector, a professional looking for
            your next role, or an organization searching for exceptional talent, DevelopmentWala.org provides a trusted
            platform to connect, collaborate, and grow.
          </p>
        </div>
        
        <div className="pt-6 w-full max-w-2xl text-left">
            <h3 className="text-lg font-bold text-foreground mb-4 text-center">Today, the platform brings together opportunities from across India, including:</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs text-muted">
                <div className="glass-panel p-3 rounded-lg flex items-center gap-2"><Target className="w-4 h-4 text-primary"/> NGO Jobs</div>
                <div className="glass-panel p-3 rounded-lg flex items-center gap-2"><Target className="w-4 h-4 text-primary"/> Internships</div>
                <div className="glass-panel p-3 rounded-lg flex items-center gap-2"><Target className="w-4 h-4 text-primary"/> Fellowships</div>
                <div className="glass-panel p-3 rounded-lg flex items-center gap-2"><Target className="w-4 h-4 text-primary"/> Scholarships</div>
                <div className="glass-panel p-3 rounded-lg flex items-center gap-2"><Target className="w-4 h-4 text-primary"/> Grants</div>
                <div className="glass-panel p-3 rounded-lg flex items-center gap-2"><Target className="w-4 h-4 text-primary"/> Volunteer Opportunities</div>
                <div className="glass-panel p-3 rounded-lg flex items-center gap-2"><Target className="w-4 h-4 text-primary"/> Consultancies</div>
                <div className="glass-panel p-3 rounded-lg flex items-center gap-2"><Target className="w-4 h-4 text-primary"/> Events</div>
                <div className="glass-panel p-3 rounded-lg flex items-center gap-2"><Target className="w-4 h-4 text-primary"/> Training Programmes</div>
            </div>
            <div className="glass-panel p-3 rounded-lg flex items-center gap-2 mt-3 text-xs text-muted justify-center">
                 <Target className="w-4 h-4 text-primary"/> Resources for Development Professionals
            </div>
        </div>

        <div className="text-sm text-muted max-w-3xl mx-auto leading-relaxed space-y-4 mt-6">
            <p>
                Beyond simply listing opportunities, our vision is to strengthen the entire social sector ecosystem by
                making recruitment more transparent, accessible, and efficient.
            </p>
            <p>
                We believe that every opportunity has the potential to create impact, and every individual deserves access
                to opportunities that align with their passion and purpose.
            </p>
        </div>
      </section>

      {/* ── Vision & Mission ── */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="glass-panel p-8 rounded-xl space-y-4 border border-card-border relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
             <Globe className="w-32 h-32 text-primary" />
          </div>
          <div className="p-3 bg-primary/10 text-primary w-fit rounded-lg relative z-10">
            <Target className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-foreground relative z-10">Our Vision</h3>
          <p className="text-sm text-muted leading-relaxed relative z-10">
            To become India's most trusted platform connecting people, organizations, and opportunities that create meaningful social impact.
          </p>
        </div>

        <div className="glass-panel p-8 rounded-xl space-y-4 border border-card-border relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
             <Heart className="w-32 h-32 text-secondary" />
          </div>
          <div className="p-3 bg-secondary/10 text-secondary w-fit rounded-lg relative z-10">
            <Heart className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-foreground relative z-10">Our Mission</h3>
          <p className="text-sm text-muted leading-relaxed relative z-10">
            To build a transparent, accessible, and technology-driven ecosystem that empowers individuals and organizations working across the social and development sector through recruitment, knowledge sharing, and community building.
          </p>
        </div>
      </section>

      {/* ── What We Do ── */}
      <section className="glass-panel p-8 sm:p-10 rounded-2xl border border-card-border space-y-6">
        <div className="flex items-center gap-3">
           <div className="p-3 bg-primary/10 text-primary rounded-lg">
             <Briefcase className="w-6 h-6" />
           </div>
           <h3 className="text-2xl font-bold text-foreground">What We Do</h3>
        </div>
        <p className="text-sm text-muted leading-relaxed">
          DevelopmentWala.org supports the development sector by providing a comprehensive opportunities platform where
          organizations can publish opportunities and professionals can discover meaningful careers.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
            <div className="space-y-4">
                <h4 className="font-semibold text-foreground border-b border-border pb-2">For Organizations</h4>
                <p className="text-xs text-muted">
                    We provide an end-to-end recruitment platform with applicant tracking, employer branding, and talent sourcing solutions.
                </p>
            </div>
            <div className="space-y-4">
                <h4 className="font-semibold text-foreground border-b border-border pb-2">For Professionals</h4>
                <p className="text-xs text-muted">
                    We provide a simple, transparent, and user-friendly platform to discover opportunities, build careers, and contribute to social change.
                </p>
            </div>
        </div>
      </section>

      {/* ── Powered by Development Wala ── */}
      <section className="bg-gradient-to-br from-neutral-100 to-neutral-50 dark:from-zinc-900 dark:to-zinc-950 p-8 sm:p-10 rounded-2xl border border-card-border space-y-8 flex flex-col items-center text-center">
        <img
          src="/development-wala-logo.png"
          alt="Development Wala Main Logo"
          className="h-24 object-contain"
        />
        <div className="space-y-4 max-w-3xl">
            <h3 className="text-2xl font-bold text-foreground">Powered by Development Wala</h3>
            <p className="text-sm text-muted leading-relaxed">
              <strong>DevelopmentWala.org</strong> is proudly powered and managed by <strong>Development Wala</strong>, one of India's fastest-growing ecosystem enablers dedicated to strengthening the social sector.
            </p>
            <p className="text-sm text-muted leading-relaxed">
              Development Wala works with non-profits, CSR initiatives, foundations, educational institutions, social enterprises, and impact-driven organizations to build stronger teams, document impact, strengthen organizational capacity, and create sustainable ecosystems for social change.
            </p>
        </div>

        <div className="w-full max-w-4xl text-left glass-panel p-6 rounded-xl mt-6">
            <h4 className="font-bold text-foreground mb-4">Our core services include:</h4>
            <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs text-muted list-inside">
                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-primary" /> Recruitment Solutions</li>
                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-primary" /> Employer Branding</li>
                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-primary" /> Impact Documentation</li>
                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-primary" /> Capacity Building</li>
                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-primary" /> Social Sector Consulting</li>
                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-primary" /> Community Building</li>
                <li className="flex items-center gap-2 sm:col-span-2 md:col-span-3"><div className="w-1.5 h-1.5 rounded-full bg-primary" /> Career Support for Development Professionals</li>
            </ul>
        </div>

        <p className="text-sm font-medium text-foreground italic pt-2">
            "Every initiative we undertake is driven by a shared belief that stronger organizations create greater impact."
        </p>

        <a 
          href="https://developmentwala.com" 
          target="_blank" 
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-6 py-3 bg-neutral-200 dark:bg-neutral-800 text-foreground rounded-lg text-sm font-semibold hover:bg-neutral-300 dark:hover:bg-neutral-700 transition-colors mt-4"
        >
          Learn more about Development Wala <ArrowRight className="w-4 h-4" />
        </a>
      </section>

      {/* ── Meet the Founder ── */}
      <section className="glass-panel p-8 sm:p-10 rounded-2xl border border-card-border">
        <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
            <div className="shrink-0">
                <img
                    src="/kumar-preetam-puri.jpg"
                    alt="Kumar Preetam Puri - Founder Profile Pic"
                    className="w-48 h-48 md:w-64 md:h-64 rounded-2xl object-cover shadow-lg border-2 border-primary/20"
                />
            </div>
            <div className="space-y-4 text-center md:text-left">
                <div className="space-y-1">
                    <h3 className="text-3xl font-extrabold text-foreground">Kumar Preetam Puri</h3>
                    <p className="text-primary font-medium">Founder — Development Wala & DevelopmentWala.org</p>
                </div>
                
                <div className="space-y-3 text-sm text-muted leading-relaxed">
                    <p>
                        DevelopmentWala.org was founded by <strong>Kumar Preetam Puri</strong>, a social development professional committed to making the development sector more accessible, connected, and opportunity-driven.
                    </p>
                    <p>
                        With academic and professional experience spanning community development, migration, social policy, recruitment, capacity building, and ecosystem development, he founded Development Wala with the vision of creating a unified platform where organizations and development professionals can connect more effectively.
                    </p>
                    <p>
                        His work focuses on strengthening India's social sector by improving access to opportunities, supporting organizations in building strong teams, and creating platforms that encourage collaboration, learning, and long-term impact.
                    </p>
                    <p>
                        Through Development Wala, he continues to work with nonprofits, foundations, universities, CSR initiatives, and social enterprises to improve recruitment, documentation, capacity building, and ecosystem development across the sector.
                    </p>
                </div>

                <div className="flex flex-wrap gap-4 pt-4 justify-center md:justify-start">
                    <a 
                        href="https://developmentwala.com/founder-kumar-preetam-puri" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary-hover transition-colors"
                    >
                        View Founder Profile
                    </a>
                    <a 
                        href="https://linkedin.com/in/kumarpreetampuri" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#0A66C2] text-white rounded-lg text-sm font-semibold hover:bg-[#004182] transition-colors"
                    >
                        Connect on LinkedIn
                    </a>
                </div>
            </div>
        </div>
      </section>

      {/* ── Join the Movement ── */}
      <section className="glass-panel p-10 rounded-2xl border border-card-border text-center space-y-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-secondary/5 to-primary/5" />
        <div className="relative z-10 space-y-4">
            <h3 className="text-3xl font-extrabold text-foreground">Join the Movement</h3>
            <p className="text-sm text-muted max-w-2xl mx-auto leading-relaxed">
                Whether you are searching for your next opportunity, looking to hire exceptional talent, or seeking to collaborate with organizations creating meaningful impact, DevelopmentWala.org is here to support your journey.
            </p>
            <p className="text-base font-semibold text-foreground pt-2">
                Together, we can build a stronger, more connected, and more impactful social sector.
            </p>
            
            <div className="pt-6 flex justify-center gap-4 flex-wrap">
                <Link href="/auth/signup?role=EMPLOYER" className="px-6 py-3 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary-hover transition-colors shadow-md hover:shadow-lg">
                    Register Organization
                </Link>
                <Link href="/jobs" className="px-6 py-3 bg-white dark:bg-zinc-900 text-foreground border border-border rounded-lg text-sm font-semibold hover:bg-neutral-50 dark:hover:bg-zinc-800 transition-colors shadow-sm">
                    Explore Opportunities
                </Link>
            </div>
        </div>
      </section>

    </div>
  );
}
