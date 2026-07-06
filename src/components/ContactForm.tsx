"use client";

import { Send } from "lucide-react";

export function ContactForm() {
  return (
    <form
      className="space-y-4 text-sm flex flex-col"
      onSubmit={(e) => {
        e.preventDefault();
        alert("Form submission not connected yet.");
      }}
    >
      <input className="form-input" placeholder="Full Name" required />
      <input className="form-input" placeholder="Email Address" type="email" required />
      <input className="form-input" placeholder="Subject" required />
      <textarea className="form-input min-h-32" placeholder="Message" required />

      <button className="px-6 py-2.5 bg-primary text-white rounded-lg flex items-center gap-2 self-start hover:bg-primary-hover transition-colors font-semibold">
        <Send className="w-4 h-4" />
        Send Message
      </button>
    </form>
  );
}
