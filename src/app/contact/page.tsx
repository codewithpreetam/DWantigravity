import Link from "next/link";
import type { Metadata } from "next";
import { Mail, Phone, Send, MessageCircle } from "lucide-react";
import { ContactForm } from "@/components/ContactForm";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Contact DevelopmentWala.org for hiring, partnerships, advertising, collaborations, and community support.",
  alternates: {
    canonical: "https://developmentwala.org/contact",
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

      {/* Intro */}
      <section className="glass-panel rounded-2xl p-6 md:p-10 space-y-5">
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground">
          Contact DevelopmentWala.org
        </h1>

        <h2 className="text-xl md:text-2xl font-semibold text-primary">
          Connecting Talent with Impact
        </h2>

        <p className="text-sm md:text-base text-muted leading-relaxed">
          Whether you are looking to hire exceptional talent, partner with us, advertise your opportunities, join our community, or simply have a question, we are here to help.
        </p>

        <p className="text-sm md:text-base text-muted leading-relaxed">
          DevelopmentWala.org is India&apos;s dedicated social sector opportunities platform connecting professionals, organizations, students, and changemakers.
        </p>

        <p className="text-sm font-semibold text-foreground">
          Our team usually responds within 24–48 business hours.
        </p>
      </section>

      {/* Hiring Section */}
      <section className="glass-panel rounded-2xl p-6 md:p-8 space-y-5">
        <h2 className="text-2xl font-bold text-foreground">Let us do your #Hiring</h2>

        <p className="text-sm text-muted">
          Whether you are an NGO, CSR, foundation, university, or consultancy—we help you hire better talent faster.
        </p>

        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-muted">
          {recruitmentServices.map((service) => (
            <li key={service} className="flex items-start gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
              <span>{service}</span>
            </li>
          ))}
        </ul>

        <a
          href="mailto:jobboard@developmentwala.org?subject=Recruitment%20Support%20Enquiry"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-white font-semibold hover:bg-primary-hover transition-colors"
        >
          <Mail className="w-4 h-4" />
          Speak with Our Recruitment Team
        </a>
      </section>

      {/* Contact Info */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        <div className="glass-panel rounded-2xl p-6 md:p-8 space-y-5">
          <h2 className="text-2xl font-bold">Contact Information</h2>

          <div>
            <h3 className="font-semibold">Email</h3>
            <a className="text-primary font-semibold hover:underline" href="mailto:jobboard@developmentwala.org">
              jobboard@developmentwala.org
            </a>
          </div>

          <div>
            <h3 className="font-semibold">Phone</h3>
            <a className="text-primary font-semibold hover:underline" href="tel:+917320886323">
              +91 73208 86323
            </a>
          </div>

          <div>
            <h3 className="font-semibold">WhatsApp</h3>
            <a
              className="text-primary font-semibold hover:underline"
              href="https://wa.me/917320886323"
              target="_blank"
              rel="noopener noreferrer"
            >
              Chat on WhatsApp
            </a>
          </div>
        </div>

        <div className="glass-panel rounded-2xl p-6 md:p-8 space-y-5">
          <h2 className="text-2xl font-bold">Managed by Development Wala</h2>

          <p className="text-sm text-muted">
            DevelopmentWala.org is managed by Development Wala, an ecosystem enabler for the social sector.
          </p>

          <a
            href="https://developmentwala.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            developmentwala.com
          </a>
        </div>
      </section>

      {/* Partnership */}
      <section className="glass-panel rounded-2xl p-6 md:p-8 space-y-5">
        <h2 className="text-2xl font-bold">Partnership Opportunities</h2>

        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 text-sm text-muted">
          {partnershipOpportunities.map((item) => (
            <li key={item} className="flex items-start gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* Form */}
      <section className="glass-panel rounded-2xl p-6 md:p-8 space-y-6">
        <h2 className="text-2xl font-bold">Contact Form</h2>

        <ContactForm />
      </section>

    </div>
  );
}
