import { z } from 'zod';

const difficulty = z.enum(['Beginner', 'Intermediate', 'Advanced', 'Expert']);
const status = z.enum(['draft', 'published', 'archived']);

export const courseInputSchema = z.object({
  title: z.string().min(1, 'Title is required.').max(200),
  description: z.string().min(1, 'Description is required.').max(5000),
  category: z.string().min(1, 'Category is required.'),
  instructor: z.string().min(1, 'Instructor is required.').max(120),
  instructorAvatar: z.string().url().or(z.literal('')).optional(),
  image: z.string().optional(),
  duration: z.string().min(1, 'Duration is required.').max(60),
  difficulty,
  rating: z.number().min(0).max(5).optional(),
  reviews: z.number().min(0).optional(),
  enrollments: z.number().min(0).optional(),
  price: z.number().min(0),
  modules: z.number().min(0).optional(),
  lessons: z.number().min(0).optional(),
  status,
  featured: z.boolean().optional(),
});

export const courseUpdateSchema = courseInputSchema.partial();

export type CourseInput = z.infer<typeof courseInputSchema>;
export type CourseUpdate = z.infer<typeof courseUpdateSchema>;
