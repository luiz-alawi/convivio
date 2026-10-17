import type { PillarId } from '@convivio/shared';

// Cores tiradas do logo (as cinco pétalas). Qual cor é de qual pilar é uma decisão da equipe — mude aqui.
export const pillarColors: Record<PillarId, string> = {
  internacionalidade: '#3E9FC8', // azul
  estudo: '#F5AE3A', // amarelo/laranja
  trabalho: '#EE6347', // coral
  ciencia: '#6AAB4F', // verde
  moralidade: '#9C4C9A', // roxo
};

export const colors = {
  background: '#FDF6EC',
  surface: '#FFFFFF',
  text: '#2B241F',
  textMuted: '#6E645B',
  border: '#EADFCF',
  primary: '#8E3E8C',
  primaryText: '#FFFFFF',
  danger: '#C0392B',
};

export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 };

export const radius = { sm: 8, md: 12, lg: 20, pill: 999 };

export const font = {
  title: { fontSize: 28, fontWeight: '800' as const, color: colors.text },
  heading: { fontSize: 20, fontWeight: '700' as const, color: colors.text },
  body: { fontSize: 16, color: colors.text },
  caption: { fontSize: 13, color: colors.textMuted },
  overline: { fontSize: 12, letterSpacing: 2, textTransform: 'uppercase' as const, color: colors.primary },
};
