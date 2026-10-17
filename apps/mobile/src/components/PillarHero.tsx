import Ionicons from '@expo/vector-icons/Ionicons';
import type { PillarId } from '@convivio/shared';
import { LinearGradient } from 'expo-linear-gradient';
import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useMe } from '@/hooks/queries';
import { pillarName } from '@/lib/labels';
import { colors, fonts, pillarTheme, radius, spacing } from '@/theme';

/** Banner colorido no topo de cada pilar: ícone, nome, frase e seus pontos nele. */
export function PillarHero({ pillar, children }: { pillar: PillarId; children?: ReactNode }) {
  const theme = pillarTheme[pillar];
  const me = useMe();
  return (
    <LinearGradient colors={theme.gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.hero}>
      <Ionicons name={theme.icon} size={110} color="rgba(255,255,255,0.14)" style={styles.watermark} />
      <View style={styles.row}>
        <View style={styles.icon}>
          <Ionicons name={theme.icon} size={22} color={theme.color} />
        </View>
        {me.data && (
          <View style={styles.points}>
            <Text style={styles.pointsText}>{me.data.points[pillar]} pts</Text>
          </View>
        )}
      </View>
      <Text style={styles.title}>{pillarName(pillar)}</Text>
      <Text style={styles.tagline}>{theme.tagline}</Text>
      {children}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  hero: { borderRadius: radius.xl, padding: spacing.xl, gap: spacing.xs, overflow: 'hidden' },
  watermark: { position: 'absolute', right: -16, bottom: -20 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
  icon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  points: { backgroundColor: 'rgba(255,255,255,0.22)', borderRadius: radius.pill, paddingHorizontal: 12, paddingVertical: 6 },
  pointsText: { fontFamily: fonts.bold, fontSize: 13, color: colors.primaryText },
  title: { fontFamily: fonts.extrabold, fontSize: 26, letterSpacing: -0.5, color: colors.primaryText },
  tagline: { fontFamily: fonts.medium, fontSize: 14, color: 'rgba(255,255,255,0.9)' },
});
