import type Ionicons from '@expo/vector-icons/Ionicons';
import type { PillarId, PlaceCategory } from '@convivio/shared';
import type { ComponentProps } from 'react';
import type { TextStyle, ViewStyle } from 'react-native';

export type IconName = ComponentProps<typeof Ionicons>['name'];
export type Gradient = readonly [string, string];

// Plus Jakarta Sans (carregada no _layout raiz). No React Native cada peso é uma fonte separada.
export const fonts = {
  regular: 'PlusJakartaSans_400Regular',
  medium: 'PlusJakartaSans_500Medium',
  semibold: 'PlusJakartaSans_600SemiBold',
  bold: 'PlusJakartaSans_700Bold',
  extrabold: 'PlusJakartaSans_800ExtraBold',
};

export const colors = {
  background: '#EDE9F8',
  surface: '#FFFFFF',
  surfaceAlt: '#E5DFF4',
  text: '#17131F',
  textMuted: '#6C6679',
  border: '#DAD3EC',
  primary: '#6D28D9',
  primarySoft: '#EDE6FC',
  primaryText: '#FFFFFF',
  success: '#16A34A',
  warning: '#D97706',
  danger: '#DC2626',
  overlay: 'rgba(23, 19, 31, 0.55)',
};

export const brandGradient: Gradient = ['#4C1D95', '#7C3AED'];

// Cada pilar tem cor, degradê, ícone e uma frase. Mude aqui para trocar a identidade de um pilar.
export const pillarTheme: Record<
  PillarId,
  { color: string; soft: string; gradient: Gradient; icon: IconName; short: string; tagline: string }
> = {
  internacionalidade: {
    color: '#0284C7',
    soft: '#E0F2FE',
    gradient: ['#0369A1', '#38BDF8'],
    icon: 'earth',
    short: 'Mundo',
    tagline: 'As viagens da AMF e dos alunos pelo mundo',
  },
  estudo: {
    color: '#D97706',
    soft: '#FEF3C7',
    gradient: ['#D97706', '#FBBF24'],
    icon: 'school',
    short: 'Estudo',
    tagline: 'Videoaulas rápidas de cada curso',
  },
  trabalho: {
    color: '#E5484D',
    soft: '#FFE4E3',
    gradient: ['#DC2F45', '#FF8A65'],
    icon: 'briefcase',
    short: 'Trabalho',
    tagline: 'Vagas e freelas da região em primeira mão',
  },
  ciencia: {
    color: '#15803D',
    soft: '#DCFCE7',
    gradient: ['#15803D', '#4ADE80'],
    icon: 'book',
    short: 'Ciência',
    tagline: 'Passagens diárias de Antonio Meneghetti',
  },
  moralidade: {
    color: '#A21CAF',
    soft: '#FAE8FF',
    gradient: ['#86198F', '#E879F9'],
    icon: 'heart',
    short: 'Moral',
    tagline: 'Bons hábitos compartilhados com a comunidade',
  },
};

export const pillarColors = Object.fromEntries(
  Object.entries(pillarTheme).map(([id, t]) => [id, t.color]),
) as Record<PillarId, string>;

export const categoryTheme: Record<PlaceCategory, { icon: IconName; color: string }> = {
  restaurante: { icon: 'restaurant', color: '#E5484D' },
  cafe: { icon: 'cafe', color: '#B45309' },
  hotel: { icon: 'bed', color: '#6D28D9' },
  passeio: { icon: 'trail-sign', color: '#15803D' },
  esporte: { icon: 'tennisball', color: '#0284C7' },
};

export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 };

export const radius = { sm: 10, md: 14, lg: 20, xl: 28, pill: 999 };

export const shadow: Record<'card' | 'raised', ViewStyle> = {
  card: {
    shadowColor: '#2A1B4D',
    shadowOpacity: 0.07,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
  raised: {
    shadowColor: '#2A1B4D',
    shadowOpacity: 0.16,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 6,
  },
};

const t = (fontFamily: string, fontSize: number, extra: TextStyle = {}): TextStyle => ({
  fontFamily,
  fontSize,
  color: colors.text,
  ...extra,
});

export const font = {
  display: t(fonts.extrabold, 30, { letterSpacing: -0.6, lineHeight: 36 }),
  title: t(fonts.extrabold, 24, { letterSpacing: -0.4 }),
  heading: t(fonts.bold, 17, { letterSpacing: -0.2 }),
  body: t(fonts.regular, 15, { lineHeight: 22 }),
  bodyStrong: t(fonts.semibold, 15, { lineHeight: 22 }),
  caption: t(fonts.medium, 13, { color: colors.textMuted }),
  small: t(fonts.semibold, 11, { color: colors.textMuted }),
  overline: t(fonts.bold, 11, { color: colors.textMuted, letterSpacing: 1.2, textTransform: 'uppercase' }),
};
