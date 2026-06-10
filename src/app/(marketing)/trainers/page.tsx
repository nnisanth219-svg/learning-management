import { SectionHeader } from '@/components/marketing/section-header';
import { TrainerCard } from '@/components/marketing/trainer-card';
import { TRAINERS } from '@/data/mock';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Trainers' };

export default function TrainersPage() {
  return (
    <>
      <section className="bg-hero-gradient px-4 py-16 text-white lg:px-8">
        <div className="mx-auto max-w-7xl text-center">
          <h1 className="font-display text-display-md">Meet Our Expert Trainers</h1>
          <p className="mx-auto mt-4 max-w-xl text-white/80">
            Learn from industry leaders, published researchers, and seasoned professionals.
          </p>
        </div>
      </section>

      <section className="px-4 py-16 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <SectionHeader
            title="World-Class Faculty"
            description="Our trainers bring decades of real-world experience to every course."
          />
          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {TRAINERS.map((trainer) => (
              <TrainerCard key={trainer.id} trainer={trainer} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
