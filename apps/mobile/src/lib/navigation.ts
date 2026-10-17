import { colors, fonts } from '@/theme';

/** Visual padrão dos cabeçalhos das pilhas de telas (Explorar, Perfil, Empresa, Admin...). */
export const stackScreenOptions = {
  headerShadowVisible: false,
  headerTintColor: colors.text,
  headerTitleStyle: { fontFamily: fonts.bold, fontSize: 17 },
  headerBackTitleStyle: { fontFamily: fonts.medium },
  headerStyle: { backgroundColor: colors.background },
  contentStyle: { backgroundColor: colors.background },
  headerBackButtonDisplayMode: 'minimal' as const,
};
