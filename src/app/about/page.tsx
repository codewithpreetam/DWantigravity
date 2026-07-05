import Link from "next/link";
import { Briefcase, Target, Heart, Award } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-1 space-y-12">
      <div className="text-center space-y-4 flex flex-col items-center">
        <img src="/logo.png" alt="Development Wala" className="h-16 w-16 rounded-xl object-contain border border-card-border shadow-sm mb-2" />
        <h1 className="text-4xl font-extrabold text-foreground tracking-tight">About DevelopmentWala.org</h1>
        <p className="text-sm text-muted max-w-xl mx-auto leading-relaxed">
          India's exclusive gateway bridging social development organizations with dedicated impact-driven professionals.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="glass-panel p-6 rounded-xl space-y-3">
          <div className="p-3 bg-primary/10 text-primary w-fit rounded-lg">
            <Target className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-foreground">Our Mission</h3>
          <p className="text-xs text-muted leading-relaxed">
            To accelerate social change across India by streamlining recruitment, volunteering, and grants management in the development sector. We believe that empowering nonprofits with high-quality talent is the fastest path to grassroots progress.
          </p>
        </div>

        <div className="glass-panel p-6 rounded-xl space-y-3">
          <div className="p-3 bg-secondary/10 text-secondary w-fit rounded-lg">
            <Heart className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-foreground">Our Core Values</h3>
          <p className="text-xs text-muted leading-relaxed">
            Transparency, compliance, and social equity are at the heart of our platform. Every opportunity and organization on our directory goes through our admin verification pipeline to ensure safety and alignment.
          </p>
        </div>
      </div>

      <div className="glass-panel p-8 rounded-xl border border-card-border space-y-4 text-center">
        <h3 className="text-xl font-bold text-foreground">Are you a registered NGO or CSR Donor?</h3>
        <p className="text-xs text-muted max-w-lg mx-auto">
          Create an employer organization account to post jobs, fellowships, webinars, and consultancies, and access our candidate applicant tracking system (ATS).
        </p>
        <div className="pt-4 flex justify-center gap-4">
          <Link href="/auth/signup?role=EMPLOYER" className="px-6 py-2.5 bg-primary text-white rounded-lg text-xs font-semibold hover:bg-primary-hover transition-colors">
            Register Organization
          </Link>
          <Link href="/contact" className="px-6 py-2.5 bg-neutral-200 dark:bg-neutral-800 text-foreground rounded-lg text-xs font-semibold hover:bg-neutral-300 dark:hover:bg-neutral-700 transition-colors">
            Contact Support
          </Link>
        </div>
      </div>
    </div>
  );
}
