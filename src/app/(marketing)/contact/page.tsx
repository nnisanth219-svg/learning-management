'use client';

import { SectionHeader } from '@/components/marketing/section-header';
import { ButtonSpinner } from '@/components/ui';
import { OFFICE_LOCATIONS } from '@/data/mock';
import { Clock, Mail, MapPin, MessageSquare, Phone, Send } from 'lucide-react';
import { useState } from 'react';

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    setLoading(true);
    const form = new FormData(e.currentTarget);
    const firstName = String(form.get('firstName'));
    const lastName = String(form.get('lastName'));

    try {
      const res = await fetch('/api/public/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: `${firstName} ${lastName}`.trim(),
          email: form.get('email'),
          subject: form.get('subject'),
          message: form.get('message'),
        }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(data.error ?? 'Failed to send message.');
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <section className="bg-hero-gradient px-4 py-16 text-white lg:px-8">
        <div className="mx-auto max-w-7xl text-center">
          <h1 className="font-display text-display-md">Get in Touch</h1>
          <p className="mx-auto mt-4 max-w-xl text-white/80">
            Have questions? Our team is here to help you find the perfect learning solution.
          </p>
        </div>
      </section>

      <section className="px-4 py-16 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-5">
          <div className="lg:col-span-3">
            <SectionHeader title="Send Us a Message" align="left" />
            {submitted ? (
              <div className="mt-8 glass-card p-8 text-center">
                <MessageSquare className="mx-auto h-12 w-12 text-success" />
                <h3 className="mt-4 font-display text-xl font-bold">Message Sent!</h3>
                <p className="mt-2 text-muted">We&apos;ll get back to you within 24 hours.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="mt-8 space-y-5">
                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label className="text-sm font-medium">First Name</label>
                    <input name="firstName" type="text" required className="enterprise-input mt-1.5" placeholder="John" />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Last Name</label>
                    <input name="lastName" type="text" required className="enterprise-input mt-1.5" placeholder="Doe" />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">Email</label>
                  <input name="email" type="email" required className="enterprise-input mt-1.5" placeholder="john@company.com" />
                </div>
                <div>
                  <label className="text-sm font-medium">Subject</label>
                  <select name="subject" className="enterprise-input mt-1.5">
                    <option>General Inquiry</option>
                    <option>Enterprise Sales</option>
                    <option>Technical Support</option>
                    <option>Partnership</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium">Message</label>
                  <textarea
                    name="message"
                    required
                    rows={5}
                    className="enterprise-input mt-1.5 !h-auto resize-none"
                    placeholder="How can we help you?"
                  />
                </div>
                {error ? <p className="text-sm text-danger">{error}</p> : null}
                <button type="submit" disabled={loading} className="btn-primary inline-flex items-center gap-2">
                  {loading ? <ButtonSpinner /> : <Send className="h-4 w-4" />}
                  Send Message
                </button>
              </form>
            )}
          </div>

          <div className="lg:col-span-2">
            <div className="glass-card p-6">
              <h3 className="font-display text-lg font-bold">Support Information</h3>
              <ul className="mt-6 space-y-4">
                <li className="flex items-start gap-3">
                  <Mail className="mt-0.5 h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">Email</p>
                    <p className="text-sm text-muted">support@eduvantage.com</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <Phone className="mt-0.5 h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">Phone</p>
                    <p className="text-sm text-muted">+1 (800) 555-LEARN</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <Clock className="mt-0.5 h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">Hours</p>
                    <p className="text-sm text-muted">Mon–Fri, 8am–8pm EST</p>
                  </div>
                </li>
              </ul>
            </div>

            <div className="mt-6 space-y-4">
              {OFFICE_LOCATIONS.map((office) => (
                <div key={office.city} className="premium-card p-5">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-primary" />
                    <h4 className="font-display font-bold">{office.city}</h4>
                  </div>
                  <p className="mt-2 text-sm text-muted">{office.address}</p>
                  <p className="mt-1 text-sm text-muted">{office.phone}</p>
                  <p className="text-sm text-primary">{office.email}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 pb-16 lg:px-8">
        <div className="mx-auto max-w-7xl overflow-hidden rounded-3xl border border-border/60 shadow-card">
          <iframe
            title="EduVantage Office Location"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3153.097793447!2d-122.399!3d37.791!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMznCsDQ3JzI3LjYiTiAxMjLCsDIzJzU2LjQiVw!5e0!3m2!1sen!2sus!4v1"
            width="100%"
            height="400"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </section>
    </>
  );
}
