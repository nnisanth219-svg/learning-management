import { z } from 'zod';

export const newsletterSchema = z.object({
  email: z.string().email(),
  name: z.string().max(120).optional(),
});

export const contactFormSchema = z.object({
  name: z.string().min(1).max(120),
  email: z.string().email(),
  subject: z.string().max(200).optional(),
  message: z.string().min(1).max(5000),
});

export const loginSchema = z.object({
  email: z.string().email('Enter a valid email address.'),
  password: z.string().min(6, 'Password must be at least 6 characters.'),
  rememberMe: z.boolean().optional(),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('Enter a valid email address.'),
});
