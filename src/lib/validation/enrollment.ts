import { z } from 'zod';

export const enrollSchema = z.object({
  fullName: z.string().min(1).max(120),
  email: z.string().email(),
  phone: z.string().min(7).max(30),
  courseId: z.string().min(1),
  qualification: z.string().min(1).max(200),
  notes: z.string().max(2000).optional(),
});

export const registerSchema = z.object({
  enrollmentId: z.string().min(1),
  password: z.string().min(6).max(128),
  confirmPassword: z.string().min(6),
}).refine((d) => d.password === d.confirmPassword, {
  message: 'Passwords do not match.',
  path: ['confirmPassword'],
});

export const studentLoginSchema = z.object({
  email: z.string().email('Enter a valid email address.'),
  password: z.string().min(6, 'Password must be at least 6 characters.'),
  rememberMe: z.boolean().optional(),
});

export const updateEnrollmentSchema = z.object({
  status: z.enum(['approved', 'rejected', 'pending']),
});

export const updateStudentStatusSchema = z.object({
  status: z.enum(['active', 'inactive', 'suspended', 'graduated']),
});

export type EnrollInput = z.infer<typeof enrollSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
