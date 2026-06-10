import { CourseCard } from '@/components/marketing/course-card';
import { HeroSection } from '@/components/marketing/hero-section';
import { MarketingImage } from '@/components/marketing/marketing-image';
import { SectionHeader } from '@/components/marketing/section-header';
import { TestimonialCarousel } from '@/components/marketing/testimonial-carousel';
import { COURSES, HERO_STATS, TESTIMONIALS } from '@/data/mock';
import { IMAGES } from '@/lib/images';
import {
  ArrowRight,
  Award,
  BookOpen,
  Building2,
  CheckCircle2,
  Users,
} from 'lucide-react';
import Link from 'next/link';

const STAT_ICONS = { users: Users, book: BookOpen, award: Award, building: Building2 };

export default function HomePage() {
  const featuredCourses = COURSES.filter((c) => c.featured);

  return (
    <>
      <HeroSection />

      {/* Stats */}
      <section className="relative z-10 -mt-14 px-4 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {HERO_STATS.map((stat, i) => {
            const Icon = STAT_ICONS[stat.icon];
            return (
              <div
                key={stat.label}
                className="glass-card animate-fade-in-up border-white/60 p-6 text-center shadow-premium"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-soft">
                  <Icon className="h-6 w-6 text-primary" />
                </div>
                <p className="mt-4 font-display text-3xl font-bold text-foreground">{stat.value}</p>
                <p className="mt-1 text-sm text-muted">{stat.label}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Featured Courses */}
      <section className="px-4 py-24 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <SectionHeader
            eyebrow="Popular Courses"
            title="Learn from the Best Instructors"
            description="Curated programs across technology, design, business, and leadership."
          />
          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {featuredCourses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
          <div className="mt-10 text-center">
            <Link href="/courses" className="btn-outline">
              View All Courses <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Why Choose Us — cinematic image block */}
      <section className="relative overflow-hidden bg-soft-gradient px-4 py-24 lg:px-8">
        <div className="pointer-events-none absolute -right-32 top-0 h-96 w-96 rounded-full bg-accent/10 blur-3xl" />
        <div className="mx-auto max-w-7xl">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div className="relative overflow-hidden rounded-3xl shadow-premium ring-1 ring-border/40">
              <MarketingImage
                src={IMAGES.collaboration}
                alt="Team collaboration in learning environment"
                width={640}
                height={480}
                className="h-full w-full object-cover"
                cinematic
              />
              <div className="absolute inset-0 bg-gradient-to-t from-foreground/30 to-transparent" />
              <div className="absolute bottom-6 left-6 glass-card !rounded-2xl px-5 py-4">
                <p className="font-display text-3xl font-bold text-primary">4.9/5</p>
                <p className="text-sm text-muted">Average Rating</p>
              </div>
            </div>
            <div>
              <SectionHeader
                eyebrow="Why EduVantage"
                title="Enterprise-Grade Learning Experience"
                description="Everything you need to upskill your workforce or advance your career."
                align="left"
              />
              <ul className="mt-8 space-y-4">
                {[
                  'Industry-recognized certifications',
                  'Live sessions with expert trainers',
                  'Adaptive learning paths powered by AI',
                  '24/7 dedicated learner support',
                  'Corporate LMS integration ready',
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-foreground">
                    <CheckCircle2 className="h-5 w-5 shrink-0 text-success" />
                    <span className="font-medium">{item}</span>
                  </li>
                ))}
              </ul>
              <Link href="/about" className="btn-primary mt-8">
                Learn More <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="px-4 py-24 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <SectionHeader
            eyebrow="Success Stories"
            title="What Our Learners Say"
            description="Join thousands of professionals who transformed their careers with EduVantage."
          />
          <div className="mt-12">
            <TestimonialCarousel testimonials={TESTIMONIALS} />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 pb-24 lg:px-8">
        <div className="relative mx-auto max-w-7xl overflow-hidden rounded-3xl shadow-glow">
          <MarketingImage
            src={IMAGES.workshop}
            alt="Professional training workshop"
            width={1400}
            height={400}
            className="absolute inset-0 h-full w-full object-cover"
            cinematic
          />
          <div className="absolute inset-0 bg-hero-gradient/90" />
          <div className="relative p-12 text-center md:p-16">
            <h2 className="font-display text-display-md text-white">Ready to Start Your Learning Journey?</h2>
            <p className="mx-auto mt-4 max-w-xl text-lg text-white/85">
              Join 250,000+ learners and access 1,200+ premium courses today.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Link
                href="/courses"
                className="rounded-xl bg-white px-8 py-3.5 text-sm font-bold text-primary shadow-lg transition-transform hover:scale-105"
              >
                Browse Courses
              </Link>
              <Link href="/contact" className="btn-secondary">
                Contact Sales
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
