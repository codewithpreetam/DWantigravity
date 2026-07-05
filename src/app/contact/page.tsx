import { Mail, Phone, MapPin, Send } from "lucide-react";

export default function ContactPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-1 space-y-12">
      <div className="text-center space-y-4 flex flex-col items-center">
        <img src="/logo.png" alt="Development Wala" className="h-16 w-16 rounded-xl object-contain border border-card-border shadow-sm mb-2" />
        <h1 className="text-4xl font-extrabold text-foreground tracking-tight">Contact Our Support Team</h1>
        <p className="text-sm text-muted max-w-xl mx-auto leading-relaxed">
          Questions about listing, verified badges, subscriptions, or candidate profiles? We are here to help.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Info Col */}
        <div className="md:col-span-5 space-y-6">
          <div className="glass-panel p-6 rounded-xl space-y-4">
            <h3 className="font-bold text-lg text-foreground">Get in Touch</h3>
            
            <div className="flex items-center gap-3 text-xs text-muted">
              <Mail className="w-5 h-5 text-primary shrink-0" />
              <div>
                <p className="font-semibold text-foreground">Email Support</p>
                <p>support@developmentwala.org</p>
              </div>
            </div>

            <div className="flex items-center gap-3 text-xs text-muted">
              <Phone className="w-5 h-5 text-primary shrink-0" />
              <div>
                <p className="font-semibold text-foreground">Phone Hotline</p>
                <p>+91 11-4567-8910</p>
              </div>
            </div>

            <div className="flex items-center gap-3 text-xs text-muted">
              <MapPin className="w-5 h-5 text-primary shrink-0" />
              <div>
                <p className="font-semibold text-foreground">Headquarters</p>
                <p>NGO Hub, Institutional Area, Lodhi Road, New Delhi, India</p>
              </div>
            </div>
          </div>
        </div>

        {/* Form Col */}
        <div className="md:col-span-7 glass-panel p-6 rounded-xl border border-card-border">
          <h3 className="font-bold text-lg text-foreground mb-4">Send a Message</h3>
          <form className="space-y-4 text-xs text-left">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="font-semibold text-muted">Full Name</label>
                <input type="text" placeholder="Aarav Sharma" required className="form-input" />
              </div>
              <div className="flex flex-col gap-1">
                <label className="font-semibold text-muted">Email Address</label>
                <input type="email" placeholder="aarav@gmail.com" required className="form-input" />
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <label className="font-semibold text-muted">Subject</label>
              <input type="text" placeholder="NGO Verification Query" required className="form-input" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="font-semibold text-muted">Message / description</label>
              <textarea rows={5} placeholder="Describe your query in detail..." required className="form-input resize-none"></textarea>
            </div>
            <button 
              type="submit" 
              className="px-6 py-2.5 bg-primary hover:bg-primary-hover text-white rounded-lg font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>Send Message</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
