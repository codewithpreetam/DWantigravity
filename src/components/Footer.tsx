import Link from "next/link";
import { Briefcase } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-card-border bg-neutral-50 dark:bg-zinc-950 text-sm mt-auto" aria-labelledby="footer-heading">
      <h2 id="footer-heading" className="sr-only">Footer Navigation</h2>
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
          <div className="flex gap-4" aria-label="Social media links">
            <a href="https://www.linkedin.com/company/developmentwalajobboard/" target="_blank" rel="noopener noreferrer" className="text-muted hover:text-primary transition-colors focus-visible:ring-2 focus-visible:outline-none rounded" aria-label="LinkedIn">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
            </a>
            <a href="https://whatsapp.com/channel/0029VaCxEqA0G0XoVCQyUx38" target="_blank" rel="noopener noreferrer" className="text-muted hover:text-primary transition-colors focus-visible:ring-2 focus-visible:outline-none rounded" aria-label="WhatsApp">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
              </svg>
            </a>
            <a href="https://www.youtube.com/@DevelopmentWalaofficial" target="_blank" rel="noopener noreferrer" className="text-muted hover:text-primary transition-colors focus-visible:ring-2 focus-visible:outline-none rounded" aria-label="YouTube">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
              </svg>
            </a>
            <a href="http://instagram.com/developmentwala_official" target="_blank" rel="noopener noreferrer" className="text-muted hover:text-primary transition-colors focus-visible:ring-2 focus-visible:outline-none rounded" aria-label="Instagram">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
              </svg>
            </a>
            <a href="https://www.facebook.com/thedevelopmentwala" target="_blank" rel="noopener noreferrer" className="text-muted hover:text-primary transition-colors focus-visible:ring-2 focus-visible:outline-none rounded" aria-label="Facebook">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd"/>
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
