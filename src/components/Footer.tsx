import Link from "next/link";
import { Briefcase } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-card-border bg-neutral-50 dark:bg-zinc-950 text-sm mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Info */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2 font-bold text-lg tracking-tight">
              <img src="/logo.png" alt="Development Wala" className="h-6 w-6 rounded object-contain border border-card-border/40" />
              <span className="text-foreground">DevelopmentWala<span className="text-secondary">.org</span></span>
            </Link>
            <p className="text-muted text-xs leading-relaxed">
              India's premier digital gateway connecting passionate professionals with impactful opportunities in the non-profit and development sector.
            </p>
          </div>

          {/* Seeker Opportunities */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Opportunities</h4>
            <ul className="space-y-2 text-xs text-muted">
              <li><Link href="/jobs" className="hover:text-primary transition-colors">Nonprofit Jobs</Link></li>
              <li><Link href="/fellowships" className="hover:text-primary transition-colors">Fellowships</Link></li>
              <li><Link href="/internships" className="hover:text-primary transition-colors">NGO Internships</Link></li>
              <li><Link href="/volunteer" className="hover:text-primary transition-colors">Volunteer Opportunities</Link></li>
            </ul>
          </div>

          {/* Funding & Business */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Consulting & Grants</h4>
            <ul className="space-y-2 text-xs text-muted">
              <li><Link href="/grants" className="hover:text-primary transition-colors">NGO Grants & Proposals</Link></li>
              <li><Link href="/consultancies" className="hover:text-primary transition-colors">Consultancies</Link></li>
              <li><Link href="/scholarships" className="hover:text-primary transition-colors">Scholarships</Link></li>
              <li><Link href="/organizations" className="hover:text-primary transition-colors">NGO Directory</Link></li>
            </ul>
          </div>

          {/* Enterprise Portal & Legal */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">For Employers</h4>
            <ul className="space-y-2 text-xs text-muted">
              <li><Link href="/auth/signup?role=EMPLOYER" className="hover:text-primary transition-colors">Post an Opportunity</Link></li>
              <li><Link href="/about" className="hover:text-primary transition-colors">About Us</Link></li>
              <li><Link href="/contact" className="hover:text-primary transition-colors">Contact Support</Link></li>
              <li><Link href="/privacy" className="hover:text-primary transition-colors">Privacy Policy & Terms</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-card-border mt-8 pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-muted gap-4">
          <p>© {new Date().getFullYear()} DevelopmentWala.org. Built for the Indian Social Impact Sector.</p>
          <div className="flex gap-4">
            <Link href="#" className="hover:text-primary transition-colors">Twitter</Link>
            <Link href="#" className="hover:text-primary transition-colors">LinkedIn</Link>
            <Link href="#" className="hover:text-primary transition-colors">GitHub</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
