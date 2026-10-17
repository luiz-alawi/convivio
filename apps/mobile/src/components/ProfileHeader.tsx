import { PILLARS, type PublicUser } from '@convivio/shared';
import { LinearGradient } from 'expo-linear-gradient';
import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { userSubtitle } from '@/lib/labels';
import { brandGradient, colors, font, fonts, pillarTheme, radius, shadow, spacing } from '@/theme';
import { Avatar } from './Avatar';

/** Capa em degradê + avatar + nome/@ + bio + números (perfil próprio e público). */
export function ProfileHeader({ user, streak, children }: { user: PublicUser; streak?: number; children?: ReactNode }) {
  return (
    <View style={styles.wrap}>
      <LinearGradient colors={brandGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.cover} />
      <View style={styles.card}>
        <View style={styles.avatar}>
          <Avatar name={user.name} uri={user.avatarUrl} size={96} ring />
        </View>
        <Text style={[font.title, styles.center]}>{user.name}</Text>
        {!!user.username && <Text style={styles.username}>@{user.username}</Text>}
        <Text style={[font.caption, styles.center]}>{userSubtitle(user)}</Text>
        {!!user.bio && <Text style={[font.body, styles.center]}>{user.bio}</Text>}
        {user.skills.length > 0 && (
          <Text style={[font.small, styles.center, { color: colors.primary }]}>{user.skills.join(' · ')}</Text>
        )}
        <View style={styles.stats}>
          <Stat value={user.followersCount} label="seguidores" />
          <Stat value={user.followingCount} label="seguindo" />
          <Stat value={Object.values(user.points).reduce((a, b) => a + b, 0)} label="pontos" />
          {streak !== undefined && <Stat value={streak} label="dias 🔥" />}
        </View>
        {children}
      </View>
    </View>
  );
}

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={font.small}>{label}</Text>
    </View>
  );
}

/** Barras de progresso por pilar, relativas ao pilar mais forte. */
export function PillarProgress({ points }: { points: PublicUser['points'] }) {
  const max = Math.max(10, ...Object.values(points));
  return (
    <View style={styles.progress}>
      {PILLARS.map((pillar) => {
        const theme = pillarTheme[pillar.id];
        return (
          <View key={pillar.id} style={styles.progressRow}>
            <View style={styles.progressLabel}>
              <Text style={font.bodyStrong}>{pillar.name}</Text>
              <Text style={[font.bodyStrong, { color: theme.color }]}>{points[pillar.id]}</Text>
            </View>
            <View style={[styles.track, { backgroundColor: theme.soft }]}>
              <LinearGradient
                colors={theme.gradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[styles.fill, { width: `${Math.max(4, (points[pillar.id] / max) * 100)}%` }]}
              />
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: spacing.sm },
  cover: { height: 110, borderRadius: radius.xl },
  card: {
    marginTop: -56,
    marginHorizontal: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.lg,
    paddingTop: 0,
    alignItems: 'center',
    gap: spacing.xs,
    ...shadow.card,
  },
  avatar: { marginTop: -48, marginBottom: spacing.sm },
  center: { textAlign: 'center' },
  username: { fontFamily: fonts.bold, fontSize: 15, color: colors.primary },
  stats: { flexDirection: 'row', alignSelf: 'stretch', justifyContent: 'space-around', marginTop: spacing.md },
  stat: { alignItems: 'center' },
  statValue: { fontFamily: fonts.extrabold, fontSize: 20, color: colors.text },
  progress: { gap: spacing.md },
  progressRow: { gap: 6 },
  progressLabel: { flexDirection: 'row', justifyContent: 'space-between' },
  track: { height: 10, borderRadius: 5, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 5 },
});
