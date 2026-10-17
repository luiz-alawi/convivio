import type { PillarId } from './pillars';

// Tipo de conta: define o que a pessoa pode fazer no app.
export const ACCOUNT_ROLES = ['usuario', 'empresa', 'admin'] as const;
export type AccountRole = (typeof ACCOUNT_ROLES)[number];

// Para contas "usuario": qual o vínculo com a AMF.
export const USER_PROFILES = ['aluno', 'futuro_aluno', 'visitante', 'professor'] as const;
export type UserProfile = (typeof USER_PROFILES)[number];

// Empresas só publicam vagas depois de aprovadas pelo admin (evita spam e golpes).
export const COMPANY_STATUSES = ['pendente', 'aprovada', 'recusada'] as const;
export type CompanyStatus = (typeof COMPANY_STATUSES)[number];

export const COURSES = [
  'Direito',
  'Gastronomia',
  'Hotelaria',
  'Administração',
  'Sistemas de Informação',
  'Pedagogia',
  'Ontopsicologia',
] as const;
export type Course = (typeof COURSES)[number];

export const PLACE_CATEGORIES = ['restaurante', 'cafe', 'hotel', 'passeio', 'esporte'] as const;
export type PlaceCategory = (typeof PLACE_CATEGORIES)[number];

export const JOB_TYPES = ['vaga', 'freela'] as const;
export type JobType = (typeof JOB_TYPES)[number];

export const POST_KINDS = ['momento', 'galeria'] as const; // momento = some em 24h (BeReal); galeria = fica no perfil
export type PostKind = (typeof POST_KINDS)[number];

export const UPLOAD_KINDS = ['avatar', 'post'] as const;
export type UploadKind = (typeof UPLOAD_KINDS)[number];

// Ações que geram pontos. Cada ação vale uma vez por item (ex.: assistir o mesmo vídeo de novo não pontua).
// pillar 'all' = soma em todos os pilares.
export const POINT_ACTIONS = {
  checkin: { pillar: 'all', points: 1 },
  visit_place: { pillar: 'internacionalidade', points: 20 },
  view_trip: { pillar: 'internacionalidade', points: 5 },
  watch_video: { pillar: 'estudo', points: 10 },
  job_interest: { pillar: 'trabalho', points: 10 },
  read_passage: { pillar: 'ciencia', points: 10 },
  create_post: { pillar: 'moralidade', points: 15 },
} as const satisfies Record<string, { pillar: PillarId | 'all'; points: number }>;
export type PointAction = keyof typeof POINT_ACTIONS;
