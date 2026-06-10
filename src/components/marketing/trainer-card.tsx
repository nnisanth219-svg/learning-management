import { Badge } from '@/components/ui';
import type { Trainer } from '@/data/types';
import { cn } from '@/lib/utils';
import { Award, BookOpen, Linkedin, Star, Twitter, Users } from 'lucide-react';
import Image from 'next/image';

interface TrainerCardProps {
  trainer: Trainer;
  className?: string;
}

const availabilityColors = {
  available: 'success' as const,
  limited: 'warning' as const,
  unavailable: 'muted' as const,
};

export function TrainerCard({ trainer, className }: TrainerCardProps) {
  return (
    <article className={cn('premium-card group overflow-hidden', className)}>
      <div className="relative aspect-[4/3] overflow-hidden">
        <Image
          src={trainer.photo}
          alt={trainer.name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, 33vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/20 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-5">
          <h3 className="font-display text-xl font-bold text-white">{trainer.name}</h3>
          <p className="text-sm text-white/80">{trainer.title}</p>
        </div>
        <Badge variant={availabilityColors[trainer.availability]} className="absolute right-4 top-4 capitalize">
          {trainer.availability}
        </Badge>
      </div>
      <div className="p-5">
        <p className="line-clamp-2 text-sm text-muted">{trainer.bio}</p>
        <div className="mt-4 flex items-center gap-4 text-sm">
          <span className="flex items-center gap-1 font-medium text-foreground">
            <Star className="h-4 w-4 fill-warning text-warning" />
            {trainer.rating}
          </span>
          <span className="flex items-center gap-1 text-muted">
            <BookOpen className="h-4 w-4" /> {trainer.courses} courses
          </span>
          <span className="flex items-center gap-1 text-muted">
            <Users className="h-4 w-4" /> {(trainer.students / 1000).toFixed(0)}K students
          </span>
        </div>
        <div className="mt-4 flex flex-wrap gap-1.5">
          {trainer.skills.slice(0, 4).map((skill) => (
            <Badge key={skill} variant="primary">
              {skill}
            </Badge>
          ))}
        </div>
        <div className="mt-4 flex items-center justify-between border-t border-border/60 pt-4">
          <div className="flex items-center gap-1 text-xs text-muted">
            <Award className="h-3.5 w-3.5" />
            {trainer.certifications[0]}
          </div>
          <div className="flex gap-2">
            {trainer.social.linkedin ? (
              <a href={trainer.social.linkedin} className="rounded-lg p-1.5 text-muted transition-colors hover:bg-subtle hover:text-primary">
                <Linkedin className="h-4 w-4" />
              </a>
            ) : null}
            {trainer.social.twitter ? (
              <a href={trainer.social.twitter} className="rounded-lg p-1.5 text-muted transition-colors hover:bg-subtle hover:text-primary">
                <Twitter className="h-4 w-4" />
              </a>
            ) : null}
          </div>
        </div>
      </div>
    </article>
  );
}
