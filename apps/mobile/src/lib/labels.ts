import type { JobType, PillarId, PlaceCategory, UserRole } from '@convivio/shared';
import { PILLARS } from '@convivio/shared';

export const roleLabels: Record<UserRole, string> = {
  aluno: 'Aluno(a) AMF',
  futuro_aluno: 'Futuro(a) aluno(a)',
  visitante: 'Visitante',
  professor: 'Professor(a)',
  empresa: 'Empresa',
};

export const categoryLabels: Record<PlaceCategory, string> = {
  restaurante: 'Restaurantes',
  cafe: 'Cafés',
  hotel: 'Hotéis',
  passeio: 'Passeios',
  esporte: 'Esporte',
};

export const jobTypeLabels: Record<JobType, string> = { vaga: 'Vaga', freela: 'Freela' };

export const pillarName = (id: PillarId) => PILLARS.find((p) => p.id === id)!.name;

export const toOptions = <T extends string>(labels: Record<T, string>) =>
  (Object.keys(labels) as T[]).map((value) => ({ value, label: labels[value] }));
