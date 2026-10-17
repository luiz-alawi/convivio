// Validações usadas nos dois lados: formulários do app e corpo das requisições na API.
import { z } from 'zod';
import { COURSES, JOB_TYPES, POST_KINDS, USER_ROLES } from './constants';

// Mensagens padrão do Zod em português (vale para app e API)
z.config(z.locales.pt());

export const registerSchema = z.object({
  name: z.string().trim().min(2, 'Informe seu nome'),
  email: z.email('E-mail inválido').trim().toLowerCase(),
  password: z.string().min(8, 'A senha precisa ter pelo menos 8 caracteres'),
  role: z.enum(USER_ROLES),
  course: z.enum(COURSES).optional(),
  phone: z.string().trim().optional(),
  bio: z.string().trim().max(280).optional(),
  acceptedTerms: z.literal(true, 'É preciso aceitar os termos e a política de privacidade'),
});
export type RegisterInput = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: z.email('E-mail inválido').trim().toLowerCase(),
  password: z.string().min(1, 'Informe a senha'),
});
export type LoginInput = z.infer<typeof loginSchema>;

export const updateProfileSchema = z.object({
  name: z.string().trim().min(2).optional(),
  course: z.enum(COURSES).optional(),
  phone: z.string().trim().optional(),
  bio: z.string().trim().max(280).optional(),
  avatarUrl: z.url().optional(),
  skills: z.array(z.string().trim().min(1)).max(10).optional(),
});
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

export const createPostSchema = z.object({
  kind: z.enum(POST_KINDS),
  imageUrl: z.url(),
  caption: z.string().trim().max(300).optional(),
});
export type CreatePostInput = z.infer<typeof createPostSchema>;

export const createJobSchema = z.object({
  title: z.string().trim().min(3),
  company: z.string().trim().min(2),
  type: z.enum(JOB_TYPES),
  description: z.string().trim().min(10),
  contact: z.string().trim().min(3),
  city: z.string().trim().optional(),
});
export type CreateJobInput = z.infer<typeof createJobSchema>;
