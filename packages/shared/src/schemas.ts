// Validações usadas nos dois lados: formulários do app e corpo das requisições na API.
import { z } from 'zod';
import { ACCOUNT_ROLES, COMPANY_STATUSES, COURSES, JOB_TYPES, POST_KINDS, UPLOAD_KINDS, USER_PROFILES } from './constants';

// Mensagens padrão do Zod em português (vale para app e API)
z.config(z.locales.pt());

export const usernameSchema = z
  .string()
  .trim()
  .toLowerCase()
  .regex(/^[a-z0-9._]{3,20}$/, 'Use de 3 a 20 letras, números, ponto ou _');

const passwordSchema = z.string().min(8, 'A senha precisa ter pelo menos 8 caracteres');
const termsSchema = z.literal(true, 'É preciso aceitar os termos e a política de privacidade');

// Conta "usuario" (aluno, futuro aluno, visitante, professor)
export const registerSchema = z.object({
  name: z.string().trim().min(2, 'Informe seu nome'),
  username: usernameSchema,
  email: z.email('E-mail inválido').trim().toLowerCase(),
  password: passwordSchema,
  profile: z.enum(USER_PROFILES, 'Escolha uma opção'),
  course: z.enum(COURSES).optional(),
  phone: z.string().trim().optional(),
  bio: z.string().trim().max(280).optional(),
  acceptedTerms: termsSchema,
});
export type RegisterInput = z.infer<typeof registerSchema>;

// Conta "empresa": entra como pendente até o admin aprovar
export const registerCompanySchema = z.object({
  name: z.string().trim().min(2, 'Informe o nome da empresa'),
  email: z.email('E-mail inválido').trim().toLowerCase(),
  password: passwordSchema,
  cnpj: z
    .string()
    .transform((v) => v.replace(/\D/g, ''))
    .pipe(z.string().length(14, 'CNPJ deve ter 14 dígitos')),
  phone: z.string().trim().min(8, 'Informe um telefone para contato'),
  city: z.string().trim().optional(),
  website: z.string().trim().optional(),
  description: z.string().trim().max(500).optional(),
  acceptedTerms: termsSchema,
});
export type RegisterCompanyInput = z.infer<typeof registerCompanySchema>;

export const loginSchema = z.object({
  email: z.email('E-mail inválido').trim().toLowerCase(),
  password: z.string().min(1, 'Informe a senha'),
});
export type LoginInput = z.infer<typeof loginSchema>;

export const updateProfileSchema = z.object({
  name: z.string().trim().min(2, 'Informe seu nome').optional(),
  username: usernameSchema.optional(),
  course: z.enum(COURSES).nullable().optional(),
  phone: z.string().trim().optional(),
  bio: z.string().trim().max(280).optional(),
  avatarUrl: z.url().optional(),
  skills: z.array(z.string().trim().min(1)).max(10).optional(),
});
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

export const createPostSchema = z.object({
  kind: z.enum(POST_KINDS),
  imageUrl: z.url('Escolha uma foto'),
  caption: z.string().trim().max(300).optional(),
});
export type CreatePostInput = z.infer<typeof createPostSchema>;

// O nome da empresa vem da conta que publica
export const createJobSchema = z.object({
  title: z.string().trim().min(3, 'Informe o título da vaga'),
  type: z.enum(JOB_TYPES),
  description: z.string().trim().min(10, 'Descreva a vaga (mín. 10 caracteres)'),
  contact: z.string().trim().min(3, 'Informe um e-mail ou telefone de contato'),
  city: z.string().trim().optional(),
});
export type CreateJobInput = z.infer<typeof createJobSchema>;

export const uploadKindSchema = z.object({ kind: z.enum(UPLOAD_KINDS) });

export const adminUpdateUserSchema = z.object({
  blocked: z.boolean().optional(),
  role: z.enum(ACCOUNT_ROLES).optional(),
  companyStatus: z.enum(COMPANY_STATUSES).optional(),
});
export type AdminUpdateUserInput = z.infer<typeof adminUpdateUserSchema>;
