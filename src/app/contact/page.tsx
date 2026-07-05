import Link from "next/link";
import type { Metadata } from "next";
import { Mail, Phone, Send, MessageCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Contact DevelopmentWala.org for hiring, partnerships, advertising, collaborations, and community support.",
  alternates: {
    canonical: "/contact",
  },
};

export default function ContactPage() {
  const recruitmentServices = [
    "Executive & Leadership Hiring",
    "Mid & Senior Level Recruitment",
    "Campus & Fellowship Recruitment",
    "Internship Hiring",
    "Bulk Hiring Support",
    "Employer Branding",
    "Featured Job Promotions",
    "Recruitment Consulting",
  ];

  const partnershipOpportunities = [
    "Non-Profit Organizations",
    "CSR Foundations",
    "Social Enterprises",
    "Educational Institutions",
    "Research Institutions",
    "International Development Organizations",
    "Government Agencies",
    "Consulting Firms",
    "Fellowship Programmes",
    "Impact Startups",
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 flex-1 space-y-8">
      <section className="glass-panel rounded-2xl p-6 md:p-10 space-y-5">
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground">Contact DevelopmentWala.org</h1>
        <h2 className="text-xl md:text-2xl font-semibold text-primary">Connecting Talent with Impact</h2>
        <p className="text-sm md:text-base text-muted leading-relaxed">
          Whether you are looking to hire exceptional talent, partner with us, advertise your opportunities, join our community, or simply have a question, we are here to help.
        </p>
        <p className="text-sm md:text-base text-muted leading-relaxed">
          DevelopmentWala.org is India&apos;s dedicated social sector opportunities platform, connecting professionals, organizations, students, and changemakers with meaningful opportunities across the development ecosystem.
        </p>
        <p className="text-sm font-semibold text-foreground">Our team usually responds within 24-48 business hours.</p>
      </section>

      <section className="glass-panel rounded-2xl p-6 md:p-8 space-y-5">
        <h2 className="text-2xl font-bold text-foreground">Let us do your #Hiring</h2>
        <h3 className="text-lg font-semibold text-primary">Speak to our team today</h3>
        <p className="text-sm text-muted leading-relaxed">
          Finding the right people should not slow down your mission.
        </p>
        <p className="text-sm text-muted leading-relaxed">
          Whether you are hiring for an NGO, CSR initiative, foundation, social enterprise, research institution, university, or development consultancy, our team can help you source high-quality talent from across India.
        </p>
        <p className="text-sm text-muted leading-relaxed">
          You focus on creating impact. We&apos;ll help you find the right people to make it happen.
        </p>
        <div>
          <h4 className="font-semibold text-foreground mb-3">Our recruitment services include:</h4>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-muted">
            {recruitmentServices.map((service) => (
              <li key={service} className="flex items-start gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                <span>{service}</span>
              </li>
            ))}
          </ul>
        </div>
        <Link
          href="mailto:jobboard@developmentwala.org?subject=Recruitment%20Support%20Enquiry"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-white font-semibold hover:bg-primary-hover transition-colors"
        >
          <Mail className="w-4 h-4" />
          <span>Speak with Our Recruitment Team</span>
        </Link>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-panel rounded-2xl p-6 md:p-8 space-y-5">
          <h2 className="text-2xl font-bold text-foreground">Contact Information</h2>

          <div className="space-y-2">
            <h3 className="font-semibold text-foreground">Email</h3>
            <p className="text-sm text-muted">For general enquiries, recruitment support, partnerships, advertising, and collaborations.</p>
            <Link className="text-primary font-semibold hover:underline" href="mailto:jobboard@developmentwala.org">
              jobboard@developmentwala.org
            </Link>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold text-foreground">Phone</h3>
            <Link className="text-primary font-semibold hover:underline" href="tel:+917320886323">
              +91 73208 86323
            </Link>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold text-foreground">WhatsApp</h3>
            <Link
              className="text-primary font-semibold hover:underline"
              href="https://wa.me/917320886323"
              target="_blank"
              rel="noopener noreferrer"
            >
              +91 73208 86323
            </Link>
          </div>

          <div className="pt-2 border-t border-card-border">
            <h3 className="font-semibold text-foreground">DevelopmentWala.org</h3>
            <p className="text-sm text-muted">India&apos;s Social Sector Opportunities Platform</p>
            <Link href="https://developmentwala.org" className="text-primary font-medium hover:underline" target="_blank" rel="noopener noreferrer">
              developmentwala.org
            </Link>
          </div>
        </div>

        <div className="glass-panel rounded-2xl p-6 md:p-8 space-y-5">
          <h2 className="text-2xl font-bold text-foreground">Managed by Development Wala</h2>
          <p className="text-sm text-muted leading-relaxed">
            DevelopmentWala.org is proudly managed by <span className="font-semibold text-foreground">Development Wala</span>, India&apos;s social sector ecosystem enabler supporting organizations through recruitment, documentation, capacity building, and ecosystem building.
          </p>
          <p className="text-sm text-muted">Learn more about Development Wala and our services.</p>
          <Link href="https://developmentwala.com" className="text-primary font-medium hover:underline" target="_blank" rel="noopener noreferrer">
            developmentwala.com
          </Link>
        </div>
      </section>

      <section className="glass-panel rounded-2xl p-6 md:p-8 space-y-5">
        <h2 className="text-2xl font-bold text-foreground">Connect With Us</h2>
        <p className="text-sm text-muted">Stay connected with DevelopmentWala.org and Development Wala across our social platforms.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="rounded-xl border border-card-border p-4 space-y-2">
            <h3 className="font-semibold text-foreground">LinkedIn - DevelopmentWala.org (Job Board)</h3>
            <p className="text-muted">Follow the latest NGO jobs, internships, fellowships, grants, scholarships, volunteering opportunities, and social sector updates.</p>
            <Link href="https://linkedin.com/company/developmentwalajobboard" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
              linkedin.com/company/developmentwalajobboard
            </Link>
          </div>

          <div className="rounded-xl border border-card-border p-4 space-y-2">
            <h3 className="font-semibold text-foreground">LinkedIn - Development Wala</h3>
            <p className="text-muted">Explore our recruitment services, collaborations, ecosystem initiatives, and company updates.</p>
            <Link href="https://linkedin.com/company/developmentwala" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
              linkedin.com/company/developmentwala
            </Link>
          </div>

          <div className="rounded-xl border border-card-border p-4 space-y-2">
            <h3 className="font-semibold text-foreground">Instagram</h3>
            <p className="text-muted">Follow stories, opportunities, events, and behind-the-scenes updates.</p>
            <Link href="https://instagram.com/developmentwala_official" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
              instagram.com/developmentwala_official
            </Link>
          </div>

          <div className="rounded-xl border border-card-border p-4 space-y-2">
            <h3 className="font-semibold text-foreground">Facebook</h3>
            <p className="text-muted">Join our growing social sector community.</p>
            <Link href="https://facebook.com/thedevelopmentwala" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
              facebook.com/thedevelopmentwala
            </Link>
          </div>

          <div className="rounded-xl border border-card-border p-4 space-y-2 md:col-span-2">
            <h3 className="font-semibold text-foreground">YouTube</h3>
            <p className="text-muted">Watch podcasts, interviews, career guidance, and conversations with leaders from the development sector.</p>
            <Link href="https://youtube.com/@DevelopmentWalaofficial" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
              youtube.com/@DevelopmentWalaofficial
            </Link>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-panel rounded-2xl p-6 md:p-8 space-y-5">
          <h2 className="text-2xl font-bold text-foreground">Join Our Community</h2>

          <div className="space-y-2">
            <h3 className="font-semibold text-foreground">WhatsApp Channel</h3>
            <p className="text-sm text-muted">Receive regular updates on jobs, internships, fellowships, grants, scholarships, events, and volunteering opportunities.</p>
            <Link href="https://whatsapp.com/channel/0029VaCxEqA0G0XoVCQyUx38" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
              whatsapp.com/channel/0029VaCxEqA0G0XoVCQyUx38
            </Link>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold text-foreground">LinkedIn Newsletter</h3>
            <p className="text-sm text-muted">Subscribe to receive curated opportunities, hiring trends, career insights, and social sector updates.</p>
            <Link
              href="https://linkedin.com/build-relation/newsletter-follow?entityUrn=7321557510367162368"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              linkedin.com/build-relation/newsletter-follow?entityUrn=7321557510367162368
            </Link>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold text-foreground">Book a 1:1 Meeting</h3>
            <p className="text-sm text-muted">Need personalised support? Schedule a one-on-one meeting with our team.</p>
            <Link href="https://topmate.io/developmentwala" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
              topmate.io/developmentwala
            </Link>
          </div>
        </div>

        <div className="glass-panel rounded-2xl p-6 md:p-8 space-y-5">
          <h2 className="text-2xl font-bold text-foreground">Be a Guest on Our Podcast</h2>
          <h3 className="text-lg font-semibold text-primary">Decoding India&apos;s Social Sector</h3>
          <p className="text-sm text-muted leading-relaxed">
            Are you a nonprofit leader, founder, researcher, CSR professional, social entrepreneur, or changemaker with a story to share?
          </p>
          <p className="text-sm text-muted leading-relaxed">
            We invite inspiring voices from across the development sector to join our podcast and share their journey, lessons, innovations, and impact with thousands of professionals across India.
          </p>
          <Link href="https://developmentwala.com/podcast" target="_blank" rel="noopener noreferrer" className="text-primary font-medium hover:underline">
            Apply to be a podcast guest: developmentwala.com/podcast
          </Link>
        </div>
      </section>

      <section className="glass-panel rounded-2xl p-6 md:p-8 space-y-5">
        <h2 className="text-2xl font-bold text-foreground">Partnership Opportunities</h2>
        <p className="text-sm text-muted">We actively collaborate with:</p>
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 text-sm text-muted">
          {partnershipOpportunities.map((item) => (
            <li key={item} className="flex items-start gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
              <span>{item}</span>
            </div>
          ))}
        </ul>
        <p className="text-sm text-muted">If you are interested in partnering with DevelopmentWala.org or Development Wala, we would love to hear from you.</p>
      </section>

      <section className="glass-panel rounded-2xl p-6 md:p-8 space-y-6">
        <h2 className="text-2xl font-bold text-foreground">Contact Form</h2>
        <p className="text-sm text-muted">
          Have a question, feedback, partnership proposal, or recruitment requirement? Fill out the contact form below and our team will get back to you within 24-48 business hours.
        </p>

        <form className="space-y-4 text-sm text-left" onSubmit={(event) => event.preventDefault()}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="font-semibold text-foreground" htmlFor="fullName">Full Name</label>
              <input id="fullName" type="text" placeholder="Your full name" required className="form-input" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="font-semibold text-foreground" htmlFor="email">Email Address</label>
              <input id="email" type="email" placeholder="your@email.com" required className="form-input" />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="font-semibold text-foreground" htmlFor="organization">Organization (Optional)</label>
            <input id="organization" type="text" placeholder="Your organization" className="form-input" />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="font-semibold text-foreground" htmlFor="subject">Subject</label>
            <input id="subject" type="text" placeholder="How can we help?" required className="form-input" />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="font-semibold text-foreground" htmlFor="message">Message</label>
            <textarea id="message" rows={6} placeholder="Share your details here..." required className="form-input resize-y min-h-32" />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="submit"
              className="px-6 py-2.5 bg-primary hover:bg-primary-hover text-white rounded-lg font-semibold inline-flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>Send Message</span>
            </button>
            <Link
              href="mailto:jobboard@developmentwala.org"
              className="px-4 py-2.5 rounded-lg border border-card-border text-muted hover:text-foreground transition-colors inline-flex items-center gap-2"
            >
              <Mail className="w-4 h-4" />
              <span>Email Instead</span>
            </Link>
            <Link
              href="https://wa.me/917320886323"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2.5 rounded-lg border border-card-border text-muted hover:text-foreground transition-colors inline-flex items-center gap-2"
            >
              <MessageCircle className="w-4 h-4" />
              <span>WhatsApp</span>
            </Link>
            <Link
              href="tel:+917320886323"
              className="px-4 py-2.5 rounded-lg border border-card-border text-muted hover:text-foreground transition-colors inline-flex items-center gap-2"
            >
              <Phone className="w-4 h-4" />
              <span>Call Us</span>
            </Link>
          </div>
        </form>
      </section>
    </div>
  );
}
