import { z } from 'zod';

export const createStudentSchema = z.object({
  name: z.string().min(1, 'Name is required.').max(120),
  email: z.string().email('Enter a valid email address.'),
  phone: z.string().max(30).optional(),
  qualification: z.string().max(200).optional(),
  status: z.enum(['active', 'inactive', 'graduated', 'suspended']).default('active'),
});

export const createTrainerSchema = z.object({
  name: z.string().min(1, 'Name is required.').max(120),
  title: z.string().min(1, 'Title is required.').max(120),
  bio: z.string().min(1, 'Bio is required.').max(2000),
  experience: z.string().min(1, 'Experience is required.').max(120),
  availability: z.enum(['available', 'limited', 'unavailable']),
  skills: z.array(z.string()).default([]),
  photo: z.string().optional(),
});

export type CreateStudentInput = z.infer<typeof createStudentSchema>;
export type CreateTrainerInput = z.infer<typeof createTrainerSchema>;
