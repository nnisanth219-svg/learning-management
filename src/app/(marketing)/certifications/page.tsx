import { Badge } from '@/components/ui';
import { SampleCertificateDownload } from '@/components/marketing/sample-certificate-download';
import { SectionHeader } from '@/components/marketing/section-header';
import { CERTIFICATIONS, TESTIMONIALS } from '@/data/mock';
import { Award, CheckCircle2, Shield } from 'lucide-react';
import Image from 'next/image';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Certifications' };

export default function CertificationsPage() {
  const achievements = TESTIMONIALS.filter((t) => t.featured);

  return (
    <>
      <section className="bg-hero-gradient px-4 py-16 text-white lg:px-8">
        <div className="mx-auto max-w-7xl text-center">
          <h1 className="font-display text-display-md">Industry-Recognized Certifications</h1>
          <p className="mx-auto mt-4 max-w-xl text-white/80">
            Validate your skills with credentials trusted by employers worldwide.
          </p>
        </div>
      </section>

      <section className="px-4 py-16 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <SectionHeader title="Certification Programs" description="Earn credentials that open doors to new opportunities." />
          <div className="mt-12 grid gap-6 md:grid-cols-2">
            {CERTIFICATIONS.map((cert) => (
              <div key={cert.id} className="premium-card overflow-hidden">
                <div className="flex flex-col md:flex-row">
                  <div className="relative aspect-video md:aspect-auto md:w-2/5">
                    <Image src={cert.image} alt={cert.title} fill className="object-cover" />
                  </div>
                  <div className="flex flex-1 flex-col p-6">
                    <Badge variant="secondary">{cert.issuer}</Badge>
                    <h3 className="mt-3 font-display text-xl font-bold">{cert.title}</h3>
                    <p className="mt-2 flex-1 text-sm text-muted">{cert.description}</p>
                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {cert.skills.map((skill) => (
                        <Badge key={skill} variant="primary">{skill}</Badge>
                      ))}
                    </div>
                    <div className="mt-4 flex items-center justify-between border-t border-border/60 pt-4 text-sm">
                      <span className="text-muted">{cert.duration} program</span>
                      <span className="font-semibold text-primary">{cert.enrolled.toLocaleString()} enrolled</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-soft-gradient px-4 py-16 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <SectionHeader title="Sample Certificate" description="Premium, verifiable certificates for every program completion." />
          <div className="mx-auto mt-12 max-w-2xl">
            <div className="relative overflow-hidden rounded-3xl border-4 border-primary/20 bg-white p-8 shadow-premium md:p-12">
              <div className="absolute right-0 top-0 h-32 w-32 bg-gradient-to-bl from-primary/10 to-transparent" />
              <div className="flex items-center justify-between">
                <Award className="h-12 w-12 text-primary" />
                <Shield className="h-8 w-8 text-success" />
              </div>
              <p className="mt-6 text-center text-sm font-semibold uppercase tracking-widest text-muted">
                Certificate of Completion
              </p>
              <h3 className="mt-4 text-center font-display text-2xl font-bold text-primary">
                Professional Web Developer
              </h3>
              <p className="mt-4 text-center text-muted">This certifies that</p>
              <p className="mt-2 text-center font-display text-xl font-bold">Jennifer Walsh</p>
              <p className="mt-4 text-center text-sm text-muted">
                has successfully completed all requirements of the Professional Web Developer program
              </p>
              <div className="mt-8 flex items-center justify-between border-t border-border/60 pt-6 text-sm text-muted">
                <span>Issued: June 1, 2025</span>
                <span>ID: EV-2025-08421</span>
              </div>
              <SampleCertificateDownload />
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 py-16 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <SectionHeader title="Student Achievements" />
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {achievements.map((story) => (
              <div key={story.id} className="premium-card p-6">
                <div className="flex items-center gap-1 text-warning">
                  {Array.from({ length: story.rating }).map((_, i) => (
                    <CheckCircle2 key={i} className="h-4 w-4 text-success" />
                  ))}
                </div>
                <p className="mt-4 text-sm leading-relaxed text-muted">&ldquo;{story.text.slice(0, 120)}...&rdquo;</p>
                <div className="mt-4 flex items-center gap-3">
                  <Image src={story.avatar} alt={story.name} width={40} height={40} className="rounded-full" />
                  <div>
                    <p className="text-sm font-bold">{story.name}</p>
                    <p className="text-xs text-muted">{story.course}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
