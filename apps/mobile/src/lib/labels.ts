import type { AccountRole, CompanyStatus, JobType, PillarId, PlaceCategory, UserProfile } from '@convivio/shared';
import { PILLARS } from '@convivio/shared';

export const profileLabels: Record<UserProfile, string> = {
  aluno: 'Aluno(a) AMF',
  futuro_aluno: 'Futuro(a) aluno(a)',
  visitante: 'Visitante',
  professor: 'Professor(a)',
};

export const accountRoleLabels: Record<AccountRole, string> = {
  usuario: 'Usuário',
  empresa: 'Empresa',
  admin: 'Administrador',
};

export const companyStatusLabels: Record<CompanyStatus, string> = {
  pendente: 'Em análise',
  aprovada: 'Aprovada',
  recusada: 'Recusada',
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

/** "Aluno(a) AMF · Sistemas de Informação" */
export const userSubtitle = (user: { profile?: UserProfile; course?: string; role: AccountRole }) =>
  [user.profile ? profileLabels[user.profile] : accountRoleLabels[user.role], user.course].filter(Boolean).join(' · ');

export const formatCnpj = (cnpj: string) =>
  cnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');

export function timeAgo(iso: string) {
  const minutes = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (minutes < 1) return 'agora';
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} h`;
  const days = Math.floor(hours / 24);
  return days < 30 ? `${days} d` : new Date(iso).toLocaleDateString('pt-BR');
}
